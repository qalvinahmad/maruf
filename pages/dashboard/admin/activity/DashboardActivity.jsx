import { IconActivity, IconAlertTriangle, IconArrowRight, IconCalendar, IconChartBar, IconCheck, IconClock, IconFilter, IconList, IconPlus, IconSearch, IconSettings, IconUser, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminHeader from '../../../../components/admin/adminHeader';
import { FloatingDock } from '../../../../components/ui/floating-dock';
import { Toast, showToast } from '../../../../components/ui/toast';
import TaskActionDropdown, { FilterDropdown } from '../../../../components/widget/TaskActionDropdown';
import { clientCache } from '../../../../lib/clientCache';
import redisCache from '../../../../lib/redisCache';
import { supabase } from '../../../../lib/supabaseClient';

function DashboardActivity({ user, profile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua Aktivitas');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('Semua');
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [teacherActivities, setTeacherActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [userActivities, setUserActivities] = useState([]);
  const [allUserActivities, setAllUserActivities] = useState([]);
  const [loadingUserActivities, setLoadingUserActivities] = useState(true);
  const [allTeacherActivities, setAllTeacherActivities] = useState([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  
  // Form states for add task
  const [newTask, setNewTask] = useState({
    teacher_id: '',
    title: '',
    description: '',
    due_date: '',
    status: 'pending'
  });
  
  // Fetch teachers from database with Redis and Client cache
  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      // Check Redis cache first (fastest)
      const cacheKey = 'teachers_list';
      let teachersData = await redisCache.get(cacheKey);
      
      if (!teachersData) {
        // Check client cache as fallback
        teachersData = await clientCache.get(cacheKey);
        
        if (!teachersData) {
          const { data, error } = await supabase
            .from('teacher_profiles')
            .select(`
              id,
              full_name,
              email
            `)
            .order('full_name', { ascending: true });

          if (error) throw error;
          
          teachersData = data || [];
          
          // Cache in both Redis (10 minutes) and client cache
          await redisCache.set(cacheKey, teachersData, 600);
          await clientCache.set(cacheKey, teachersData, 600);
        } else {
          // If found in client cache, also store in Redis
          await redisCache.set(cacheKey, teachersData, 600);
        }
      } else {
        // If found in Redis, also update client cache
        await clientCache.set(cacheKey, teachersData, 600);
      }
      
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showToast.error('Gagal memuat data guru');
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  // Fetch teacher tasks from database with Redis and Client cache
  const fetchTeacherTasks = async () => {
    try {
      setLoadingTasks(true);
      
      // Check Redis cache first (fastest)
      const cacheKey = 'teacher_tasks';
      let tasksData = await redisCache.get(cacheKey);
      
      if (!tasksData) {
        // Check client cache as fallback
        tasksData = await clientCache.get(cacheKey);
        
        if (!tasksData) {
          const { data, error } = await supabase
            .from('teacher_tasks')
            .select(`
              *,
              teacher:teacher_id (
                full_name
              )
            `)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching teacher tasks:', error);
            showToast.error('Gagal memuat data tugas');
            return;
          }

          tasksData = data || [];
          
          // Cache in both Redis (5 minutes) and client cache
          await redisCache.set(cacheKey, tasksData, 300);
          await clientCache.set(cacheKey, tasksData, 300);
        } else {
          // If found in client cache, also store in Redis
          await redisCache.set(cacheKey, tasksData, 300);
        }
      } else {
        // If found in Redis, also update client cache
        await clientCache.set(cacheKey, tasksData, 300);
      }

      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching teacher tasks:', error);
      showToast.error('Gagal memuat data tugas');
    } finally {
      setLoadingTasks(false);
    }
  };

    // Fetch teacher activities (tasks and profile activities) with Redis and Client cache
  const fetchTeacherActivities = async () => {
    try {
      setLoadingActivities(true);
      
      // Check Redis cache first (fastest)
      const cacheKey = 'teacher_activities';
      let activitiesData = await redisCache.get(cacheKey);
      
      if (!activitiesData) {
        // Check client cache as fallback
        activitiesData = await clientCache.get(cacheKey);
        
        if (!activitiesData) {
          // Get recent teacher task activities
          const { data: taskData, error: taskError } = await supabase
            .from('teacher_tasks')
            .select(`
              id,
              title,
              status,
              created_at,
              updated_at,
              teacher:teacher_id (
                full_name,
                email
              )
            `)
            .order('updated_at', { ascending: false })
            .limit(20);

          if (taskError) {
            console.error('Error fetching task activities:', taskError);
          }

          // Get teacher profile updates (login activities)
          const { data: profileData, error: profileError } = await supabase
            .from('teacher_profiles')
            .select(`
              id,
              full_name,
              email,
              updated_at,
              last_login
            `)
            .order('last_login', { ascending: false, nullsLast: true })
            .limit(15);

          if (profileError) {
            console.error('Error fetching profile activities:', profileError);
          }

          // Combine and format activities
          activitiesData = [];
          
          // Add task activities
          if (taskData) {
            taskData.forEach(task => {
              activitiesData.push({
                id: `task-${task.id}`,
                type: 'task',
                title: `Tugas: ${task.title}`,
                description: `Status: ${getStatusLabel(task.status)}`,
                teacher: task.teacher?.full_name || 'Unknown',
                timestamp: task.updated_at,
                status: task.status
              });
            });
          }
          
          // Add login activities
          if (profileData) {
            profileData.forEach(profile => {
              if (profile.last_login) {
                activitiesData.push({
                  id: `login-${profile.id}`,
                  type: 'login',
                  title: `Login Aktivitas`,
                  description: `${profile.full_name} telah login`,
                  teacher: profile.full_name,
                  timestamp: profile.last_login,
                  status: 'active'
                });
              }
            });
          }
          
          // Sort by timestamp
          activitiesData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          // Store all activities for "Lihat Semua Log" page
          setAllTeacherActivities(activitiesData);
          
          // Cache in both Redis (3 minutes) and client cache
          await redisCache.set(cacheKey, activitiesData, 180);
          await clientCache.set(cacheKey, activitiesData, 180);
        } else {
          // If found in client cache, also store in Redis
          await redisCache.set(cacheKey, activitiesData, 180);
          setAllTeacherActivities(activitiesData);
        }
      } else {
        // If found in Redis, also update client cache
        await clientCache.set(cacheKey, activitiesData, 180);
        setAllTeacherActivities(activitiesData);
      }
      
      // Limit displayed activities to 3 most recent
      const recentTeacherActivities = activitiesData.slice(0, 3);
      setTeacherActivities(recentTeacherActivities);
    } catch (error) {
      console.error('Error fetching teacher activities:', error);
      showToast.error('Gagal memuat aktivitas guru');
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch user activities from hijaiyah_progress and user_sublesson_progress with Redis cache
  const fetchUserActivities = async () => {
    try {
      setLoadingUserActivities(true);
      
      // Check Redis cache first (fastest)
      const cacheKey = 'user_activities';
      let activitiesData = await redisCache.get(cacheKey);
      
      if (!activitiesData) {
        // Check client cache as fallback
        activitiesData = await clientCache.get(cacheKey);
        
        if (!activitiesData) {
          // Get recent hijaiyah progress
          const { data: hijaiyahData, error: hijaiyahError } = await supabase
            .from('hijaiyah_progress')
            .select('*')
            .eq('is_completed', true)
            .order('completed_at', { ascending: false })
            .limit(30);

          if (hijaiyahError) {
            console.error('Error fetching hijaiyah progress:', hijaiyahError);
          }

          // Get recent user sublesson progress
          const { data: sublessonData, error: sublessonError } = await supabase
            .from('user_sublesson_progress')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(30);

          if (sublessonError) {
            console.error('Error fetching sublesson progress:', sublessonError);
          }

          // Get all users from profiles table (not users table)
          const { data: allUsers, error: usersError } = await supabase
            .from('profiles')
            .select('id, full_name, email');

          if (usersError) {
            console.error('Error fetching profiles:', usersError);
          }

          // Combine and format activities
          activitiesData = [];
          
          // Add hijaiyah activities
          if (hijaiyahData && hijaiyahData.length > 0) {
            hijaiyahData.forEach((progress) => {
              const user = allUsers?.find(u => u.id === progress.user_id);
              if (user?.full_name) {
                activitiesData.push({
                  id: `hijaiyah-${progress.id}`,
                  type: 'hijaiyah',
                  user: user.full_name,
                  action: `menyelesaikan latihan huruf ${getHijaiyahLetter(progress.letter_id)}`,
                  timestamp: progress.completed_at || progress.created_at,
                  color: 'blue',
                  icon: 'letter'
                });
              }
            });
          }
          
          // Add sublesson activities
          if (sublessonData && sublessonData.length > 0) {
            sublessonData.forEach((progress) => {
              const user = allUsers?.find(u => u.id === progress.user_id);
              if (user?.full_name) {
                let action;
                let color;
                
                if (progress.status === 'completed') {
                  action = `menyelesaikan sub-lesson ${progress.sublesson_id} di Level ${progress.roadmap_id}`;
                  color = 'green';
                } else {
                  action = `memulai sub-lesson ${progress.sublesson_id} di Level ${progress.roadmap_id}`;
                  color = 'purple';
                }
                
                activitiesData.push({
                  id: `sublesson-${progress.id}`,
                  type: 'sublesson',
                  user: user.full_name,
                  action: action,
                  timestamp: progress.completed_at || progress.updated_at || progress.created_at,
                  color: color,
                  icon: 'level',
                  details: {
                    roadmap_id: progress.roadmap_id,
                    sublesson_id: progress.sublesson_id,
                    status: progress.status
                  }
                });
              }
            });
          }
          
          // Sort by timestamp (most recent first)
          activitiesData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          // Store all activities for "Lihat Semua" page
          setAllUserActivities(activitiesData);
          
          // Cache in both Redis (2 minutes) and client cache
          await redisCache.set(cacheKey, activitiesData, 120);
          await clientCache.set(cacheKey, activitiesData, 120);
        } else {
          // If found in client cache, also store in Redis and set state
          await redisCache.set(cacheKey, activitiesData, 120);
          setAllUserActivities(activitiesData);
        }
      } else {
        // If found in Redis, also update client cache
        await clientCache.set(cacheKey, activitiesData, 120);
        setAllUserActivities(activitiesData);
      }
      
      // Limit displayed activities to 5 most recent
      const recentActivities = activitiesData.slice(0, 5);
      setUserActivities(recentActivities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      showToast.error('Gagal memuat aktivitas pengguna');
    } finally {
      setLoadingUserActivities(false);
    }
  };

  // Helper function to get hijaiyah letter name
  const getHijaiyahLetter = (letterId) => {
    const letters = [
      'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
    ];
    return letters[letterId - 1] || `Huruf ${letterId}`;
  };

  // Helper function to generate task activity descriptions
  const getTaskActivityAction = (status, title) => {
    const shortTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
    
    switch (status) {
      case 'pending':
        return `membuat tugas "${shortTitle}"`;
      case 'in_progress':
        return `memulai tugas "${shortTitle}"`;
      case 'completed':
        return `menyelesaikan tugas "${shortTitle}"`;
      case 'overdue':
        return `melewati tenggat tugas "${shortTitle}"`;
      default:
        return `mengupdate tugas "${shortTitle}"`;
    }
  };
  
  // Handle adding new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.teacher_id || !newTask.title || !newTask.description || !newTask.due_date) {
      showToast.error('Semua field harus diisi');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('teacher_tasks')
        .insert([{
          teacher_id: newTask.teacher_id,
          title: newTask.title,
          description: newTask.description,
          due_date: newTask.due_date,
          status: newTask.status,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // Clear both Redis and client cache to force refresh
      await Promise.all([
        redisCache.del('teacher_tasks'),
        redisCache.del('teacher_activities'),
        redisCache.del('user_activities'),
        clientCache.del('teacher_tasks'),
        clientCache.del('teacher_activities'),
        clientCache.del('user_activities')
      ]);
      
      // Refresh data
      await fetchTeacherTasks();
      await fetchTeacherActivities();
      await fetchUserActivities();
      
      // Reset form
      setNewTask({
        teacher_id: '',
        title: '',
        description: '',
        due_date: '',
        status: 'pending'
      });
      
      setShowAddTaskModal(false);
      showToast.success('Tugas berhasil ditambahkan');
      
    } catch (error) {
      console.error('Error adding task:', error);
      showToast.error('Gagal menambahkan tugas');
    }
  };

  // Handle modal open
  const handleOpenAddModal = () => {
    if (teachers.length === 0) {
      fetchTeachers();
    }
    setShowAddTaskModal(true);
  };

  // Handle task actions
  const handleEditTask = (task) => {
    setNewTask({
      teacher_id: task.teacher_id,
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      status: task.status
    });
    setShowAddTaskModal(true);
    showToast.info(`Edit tugas: ${task.title}`);
  };

  const handleCompleteTask = async (task) => {
    try {
      const { error } = await supabase
        .from('teacher_tasks')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      // Clear both Redis and client cache to force refresh
      await Promise.all([
        redisCache.del('teacher_tasks'),
        redisCache.del('teacher_activities'),
        clientCache.del('teacher_tasks'),
        clientCache.del('teacher_activities')
      ]);
      
      // Refresh data
      await fetchTeacherTasks();
      await fetchTeacherActivities();
      
      showToast.success(`Tugas "${task.title}" berhasil diselesaikan`);
    } catch (error) {
      console.error('Error completing task:', error);
      showToast.error('Gagal menyelesaikan tugas');
    }
  };

  const handleDeleteTask = async (task) => {
    // Confirm deletion
    if (!window.confirm(`Apakah Anda yakin ingin menghapus tugas "${task.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('teacher_tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      // Clear both Redis and client cache to force refresh
      await Promise.all([
        redisCache.del('teacher_tasks'),
        redisCache.del('teacher_activities'),
        clientCache.del('teacher_tasks'),
        clientCache.del('teacher_activities')
      ]);
      
      // Refresh data
      await fetchTeacherTasks();
      await fetchTeacherActivities();
      
      showToast.success(`Tugas "${task.title}" berhasil dihapus`);
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast.error('Gagal menghapus tugas');
    }
  };
  
  useEffect(() => {
    // Clear both Redis and client cache untuk memastikan data fresh
    const clearActivitiesCache = async () => {
      await Promise.all([
        redisCache.del('user_activities'),
        redisCache.del('teacher_activities'),
        redisCache.del('teacher_tasks'),
        clientCache.del('user_activities'),
        clientCache.del('teacher_activities'),
        clientCache.del('teacher_tasks')
      ]);
    };
    clearActivitiesCache();
    
    // Cek apakah user sudah login
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Fetch teacher tasks
    fetchTeacherTasks();
    
    // Fetch teacher activities
    fetchTeacherActivities();
    
    // Fetch user activities
    fetchUserActivities();
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/');
  };
  
   const dockItems = [
    // { 
    //   title: "Dashboard", 
    //   icon: <IconHome />, 
    //   onClick: () => router.push('/dashboard/Dashboard')
    // },
    // { 
    //   title: "Huruf", 
    //   icon: <IconLetterA />, 
    //   onClick: () => router.push('/dashboard/DashboardHuruf')
    // },
    // { 
    //   title: "Belajar & Roadmap", 
    //   icon: <IconBook />, 
    //   onClick: () => router.push('/dashboard/DashboardBelajar')
    // },
    // { 
    //   title: "Informasi", 
    //   icon: <IconInfoCircle />, 
    //   onClick: () => router.push('/dashboard/DashboardInformasi')
    // },
    { 
      title: "Statistik", 
      icon: <IconChartBar />, 
      onClick: () => router.push('/dashboard/admin/statistic/DashboardStatsAdmin')
    },
    { 
      title: "Aktivitas", 
      icon: <IconActivity />, 
      onClick: () => router.push('/dashboard/admin/activity/DashboardActivity')
    },
    // { 
    //   title: "Pengumuman", 
    //   icon: <IconBell />, 
    //   onClick: () => router.push('/dashboard/Dashboard#announcement')
    // },
    { 
      title: "Admin Panel", 
      icon: <IconList />, 
      onClick: () => router.push('/dashboard/admin/project/DashboardProjects')
    },
    { 
      title: "Pengaturan", 
      icon: <IconSettings />, 
      onClick: () => router.push('/dashboard/admin/setting/DashboardSettingsAdmin')
    },
    // { 
    //   title: "Logout", 
    //   icon: <IconLogout />, 
    //   onClick: handleLogout 
    // },
  ];
  
  // Get activity icon based on type
  const getUserActivityIcon = (type) => {
    switch (type) {
      case 'hijaiyah':
        return <IconActivity size={14} className="text-blue-600" />;
      case 'sublesson':
        return <IconCheck size={14} className="text-purple-600" />;
      case 'roadmap':
        return <IconCheck size={14} className="text-green-600" />;
      default:
        return <IconActivity size={14} className="text-gray-600" />;
    }
  };

  // Helper function untuk format waktu relatif
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Tidak diketahui';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) {
      return 'Baru saja';
    } else if (diffMins < 60) {
      return `${diffMins} menit yang lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    } else if (diffDays < 7) {
      return `${diffDays} hari yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <IconUser size={14} className="text-green-600" />;
      case 'logout':
        return <IconUser size={14} className="text-red-600" />;
      case 'task':
        return <IconActivity size={14} className="text-blue-600" />;
      default:
        return <IconActivity size={14} className="text-gray-600" />;
    }
  };

  // Get activity color based on type
  const getActivityColor = (type) => {
    switch (type) {
      case 'login':
        return 'bg-green-500';
      case 'logout':
        return 'bg-red-500';
      case 'task':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper functions untuk format data
  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak ada tenggat';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Terlambat';
    } else if (diffDays === 0) {
      return 'Hari ini';
    } else if (diffDays === 1) {
      return 'Besok';
    } else {
      return `${diffDays} hari lagi`;
    }
  };

  const getPriorityFromStatus = (status) => {
    const priorityMap = {
      'pending': 'Sedang',
      'in_progress': 'Tinggi', 
      'completed': 'Rendah',
      'overdue': 'Tinggi'
    };
    return priorityMap[status] || 'Sedang';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Belum Selesai',
      'completed': 'Selesai',
      'overdue': 'Terlambat'
    };
    return statusMap[status] || 'Belum Selesai';
  };

  const getCategoryFromTitle = (title) => {
    if (title.toLowerCase().includes('latihan')) return 'Latihan';
    if (title.toLowerCase().includes('kuis')) return 'Kuis';
    if (title.toLowerCase().includes('level')) return 'Level';
    if (title.toLowerCase().includes('praktik')) return 'Praktik';
    return 'Tugas';
  };

  const filterOptions = [
    "Semua Aktivitas",
    "Latihan Huruf",
    "Kuis",
    "Penyelesaian Level"
  ];

  const taskFilterOptions = [
    "Semua",
    "Belum Selesai",
 
    "Selesai",
    "Terlambat"
  ];

  const getColorClass = (color) => {
    const colorMap = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500"
    };
    return colorMap[color] || "bg-gray-500";
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      "Tinggi": "bg-red-100 text-red-700",
      "Sedang": "bg-yellow-100 text-yellow-700",
      "Rendah": "bg-green-100 text-green-700"
    };
    return priorityMap[priority] || "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "Belum Selesai": "bg-blue-100 text-blue-700",

      "Selesai": "bg-green-100 text-green-700",
      "Terlambat": "bg-red-100 text-red-700"
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      "Belum Selesai": <IconClock size={14} className="text-blue-600" />,

      "Selesai": <IconCheck size={14} className="text-green-600" />,
      "Terlambat": <IconAlertTriangle size={14} className="text-red-600" />
    };
    return iconMap[status] || <IconClock size={14} className="text-gray-600" />;
  };

  // Filter tugas berdasarkan status
  const filteredTasks = taskFilter === 'Semua' 
    ? tasks 
    : tasks.filter(task => getStatusLabel(task.status) === taskFilter);

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Aktivitas Pengguna - Dashboard</title>
        <meta name="description" content="Aktivitas pengguna dalam pembelajaran makhrojul huruf" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Admin Header */}
      <AdminHeader 
        userName={localStorage.getItem('userName') || 'Admin'} 
        onLogout={handleLogout} 
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <main className="max-w-5xl mx-auto px-4 py-10 pb-24">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Aktivitas Pengguna</h1>
            <p className="text-gray-600">Pantau aktivitas terbaru dari semua pengguna platform</p>
          </motion.div>
          
          {/* Filter & Search Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <FilterDropdown
                options={filterOptions}
                value={activeFilter}
                onChange={setActiveFilter}
                placeholder="Filter aktivitas"
                icon={IconFilter}
              />
              
              <div className="flex items-center gap-4">
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconSearch size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari aktivitas..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 whitespace-nowrap"
                >
                  <IconPlus size={18} />
                  <span>Tambah Tugas</span>
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Tabel Tugas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <IconCalendar size={20} className="text-blue-500" />
                  Daftar Tugas
                </h2>
                <div className="flex items-center gap-3">
                  <FilterDropdown
                    options={taskFilterOptions}
                    value={taskFilter}
                    onChange={setTaskFilter}
                    placeholder="Filter tugas"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                      <th className="px-6 py-3">Nama Tugas</th>
                      <th className="px-6 py-3">Tenggat Waktu</th>
                      <th className="px-6 py-3">Prioritas</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingTasks ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            <span className="ml-2 text-gray-500">Memuat tugas...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          Tidak ada tugas yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task, index) => (
                        <motion.tr 
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 * index }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">{task.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{getCategoryFromTitle(task.title)}</div>
                            {task.teacher?.full_name && (
                              <div className="text-xs text-blue-600 mt-1">
                                Teacher: {task.teacher.full_name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm">
                              <IconClock size={16} className="text-gray-500" />
                              <span>{formatDate(task.due_date)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(getPriorityFromStatus(task.status))}`}>
                              {getPriorityFromStatus(task.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(getStatusLabel(task.status))}`}>
                              {getStatusIcon(getStatusLabel(task.status))}
                              {getStatusLabel(task.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <TaskActionDropdown
                              task={task}
                              onEdit={handleEditTask}
                              onComplete={handleCompleteTask}
                              onDelete={handleDeleteTask}
                            />
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
          
          {/* Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <IconActivity size={20} className="text-blue-500" />
                    Aktivitas Terbaru
                  </h2>
                  <Link 
                    href="/dashboard/admin/activity/all-activities"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Lihat Semua
                    <IconArrowRight size={16} />
                  </Link>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {loadingUserActivities ? (
                    <div className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-500">Memuat aktivitas pengguna...</span>
                      </div>
                    </div>
                  ) : userActivities.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">Tidak ada aktivitas pengguna terbaru</p>
                    </div>
                  ) : (
                    userActivities.map((activity, index) => (
                      <motion.div 
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${getColorClass(activity.color)}`}></div>
                          <div className="flex-1">
                            <p className="text-gray-800">
                              <span className="font-medium">{activity.user}</span> telah {activity.action}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              {getUserActivityIcon(activity.type)}
                              <span>{formatRelativeTime(activity.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Teacher Activities Log */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <IconUser size={20} className="text-blue-500" />
                    Log Aktivitas Guru
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {loadingActivities ? (
                    <div className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-500 text-sm">Memuat aktivitas...</span>
                      </div>
                    </div>
                  ) : teacherActivities.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">Tidak ada aktivitas guru terbaru</p>
                    </div>
                  ) : (
                    teacherActivities.map((activity, index) => (
                      <motion.div 
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getActivityColor(activity.type)}`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">{activity.teacher}</span> {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              {getActivityIcon(activity.type)}
                              <span>{formatRelativeTime(activity.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-100">
                  <Link 
                    href="/dashboard/admin/activity/all-teacher-activities"
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    Lihat Semua Log
                    <IconArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowAddTaskModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Tambah Tugas Guru</h3>
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IconX size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                {/* Teacher Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Guru
                  </label>
                  <div className="relative">
                    <select
                      value={newTask.teacher_id}
                      onChange={(e) => setNewTask(prev => ({ ...prev, teacher_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                      required
                    >
                      <option value="">Pilih guru...</option>
                      {loadingTeachers ? (
                        <option disabled>Memuat guru...</option>
                      ) : (
                        teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.full_name} ({teacher.email})
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Tugas
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Masukkan judul tugas..."
                    required
                  />
                </div>

                {/* Task Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="Masukkan deskripsi tugas..."
                    required
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenggat Waktu
                  </label>
                  <input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tambah Tugas
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

                        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                          <FloatingDock items={dockItems} />
                        </div>

      {/* Toast Component */}
      <Toast />
    </div>
  );
};

export default DashboardActivity;