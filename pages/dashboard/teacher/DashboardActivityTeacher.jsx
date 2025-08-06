import ClientOnly from '@/components/ClientOnly';
import ActivityTab from '@/components/dashboard/teacher/ActivityTab';
import ClassManagement from '@/components/dashboard/teacher/ClassManagement';
import QuestionManagement from '@/components/dashboard/teacher/QuestionManagement';
import HeaderTeacher from '@/components/layout/HeaderTeacher';
import { Toast, showToast } from '@/components/ui/toast';
import { IconActivity, IconAlertTriangle, IconBooks, IconCalendar, IconCalendarEvent, IconChartBar, IconCheck, IconClock, IconEye, IconFilter, IconInfoCircle, IconSearch, IconSettings, IconUser, IconUsersGroup, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import EventManagement from '../../../components/dashboard/teacher/EventManagement';
import { FloatingDock } from '../../../components/ui/floating-dock';
import { supabase } from '../../../lib/supabaseClient';


const DashboardTeacher = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua Aktivitas');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('Semua');
  const [userName, setUserName] = useState('');
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('aktivitas');
  const [teacherTasks, setTeacherTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  // New states for real activities like admin dashboard
  const [userActivities, setUserActivities] = useState([]);
  const [loadingUserActivities, setLoadingUserActivities] = useState(true);
  const [topStudents, setTopStudents] = useState([]);
  const [loadingTopStudents, setLoadingTopStudents] = useState(true);
  
  // Modal state for task details
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  useEffect(() => {
    // Cek apakah user sudah login sebagai teacher
    const isTeacher = localStorage.getItem('isTeacher');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !isTeacher || isTeacher !== 'true') {
      router.push('/authentication/teacher/loginTeacher');
      return;
    }
    
    // Set user name immediately
    setUserName(localStorage.getItem('teacherName') || localStorage.getItem('userName') || 'Guru');
    
    // Fetch initial data
    fetchTeacherProfile();
    fetchTeacherTasks();
    fetchUserActivities();
    fetchTopStudents();
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [router]);

  // Fetch user activities from database like admin dashboard
  const fetchUserActivities = async () => {
    try {
      setLoadingUserActivities(true);
      
      // Get recent hijaiyah progress (completed ones)
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

      // Get all users from profiles table
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (usersError) {
        console.error('Error fetching profiles:', usersError);
      }

      // Combine and format activities
      const activities = [];
      
      console.log('Hijaiyah Data:', hijaiyahData);
      console.log('Sublesson Data:', sublessonData);
      console.log('Users Data:', allUsers);
      
      // Add hijaiyah activities
      if (hijaiyahData && hijaiyahData.length > 0) {
        hijaiyahData.forEach((progress) => {
          const user = allUsers?.find(u => u.id === progress.user_id);
          if (user?.full_name) {
            activities.push({
              id: `hijaiyah_${progress.id}`,
              user: user.full_name,
              user_email: user.email,
              action: `menyelesaikan latihan huruf ${getHijaiyahLetter(progress.letter_id)}`,
              time: formatRelativeTime(progress.completed_at || progress.created_at),
              type: 'hijaiyah_progress',
              color: 'blue',
              created_at: progress.completed_at || progress.created_at
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
            
            activities.push({
              id: `sublesson_${progress.id}`,
              user: user.full_name,
              user_email: user.email,
              action: action,
              time: formatRelativeTime(progress.completed_at || progress.updated_at || progress.created_at),
              type: 'sublesson_progress',
              color: color,
              created_at: progress.completed_at || progress.updated_at || progress.created_at
            });
          }
        });
      }

      // Sort by date and take latest 10
      const sortedActivities = activities
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      console.log('Final Activities:', sortedActivities);
      setUserActivities(sortedActivities);
      
    } catch (error) {
      console.error('Error fetching user activities:', error);
      // Use fallback data
      setUserActivities([
        {
          id: 1,
          user: "Ahmad Fauzi",
          action: "menyelesaikan latihan huruf ض",
          time: "2 jam yang lalu",
          color: "blue",
          type: 'hijaiyah_progress'
        },
        {
          id: 2,
          user: "Fatimah Azzahra", 
          action: "menyelesaikan sub-lesson 2 di Level 3",
          time: "Kemarin, 15:30",
          color: "green",
          type: 'sublesson_progress'
        },
        {
          id: 3,
          user: "Umar Hadi",
          action: "memulai latihan huruf ظ",
          time: "2 hari yang lalu",
          color: "blue",
          type: 'hijaiyah_progress'
        },
        {
          id: 4,
          user: "Aisyah Putri",
          action: "memulai sub-lesson 1 di Level 2",
          time: "3 hari yang lalu", 
          color: "purple",
          type: 'sublesson_progress'
        },
        {
          id: 5,
          user: "Ali Rahman",
          action: "memulai latihan huruf ك",
          time: "5 hari yang lalu",
          color: "blue",
          type: 'hijaiyah_progress'
        }
      ]);
    } finally {
      setLoadingUserActivities(false);
    }
  };

  // Fetch top students based on activity
  const fetchTopStudents = async () => {
    try {
      setLoadingTopStudents(true);
      
      // Get users with their activity count
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          level_description,
          created_at
        `)
        .eq('is_admin', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (userError) {
        console.error('User error:', userError);
        throw userError;
      }

      // Get activity counts for each user
      const studentsWithActivity = await Promise.all(
        (userData || []).map(async (user) => {
          // Count hijaiyah progress
          const { count: hijaiyahCount } = await supabase
            .from('hijaiyah_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_completed', true);

          // Count user_sublesson_progress
          const { count: sublessonCount } = await supabase
            .from('user_sublesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed');

          const totalActivity = (hijaiyahCount || 0) + (sublessonCount || 0);
          const level = parseInt(user.level_description) || 1;
          const points = totalActivity * 10 + level * 50;
          const streak = Math.floor(Math.random() * 20) + 1; // Mock streak data

          return {
            name: user.full_name || 'Pengguna',
            email: user.email,
            level: level,
            streak: `${streak} hari`,
            points: points.toLocaleString(),
            activityCount: totalActivity
          };
        })
      );

      // Sort by activity and take top 5
      const topStudents = studentsWithActivity
        .sort((a, b) => b.activityCount - a.activityCount)
        .slice(0, 5);

      setTopStudents(topStudents);
      
    } catch (error) {
      console.error('Error fetching top students:', error);
      // Use fallback data
      setTopStudents([
        { name: "Ahmad Fauzi", level: 8, streak: "15 hari", points: "2,450", activityCount: 45 },
        { name: "Fatimah Azzahra", level: 7, streak: "12 hari", points: "2,120", activityCount: 38 },
        { name: "Umar Hadi", level: 9, streak: "20 hari", points: "3,245", activityCount: 52 },
        { name: "Aisyah Putri", level: 6, streak: "8 hari", points: "1,890", activityCount: 32 },
        { name: "Ali Rahman", level: 5, streak: "7 hari", points: "1,560", activityCount: 28 }
      ]);
    } finally {
      setLoadingTopStudents(false);
    }
  };

  // Helper function to get hijaiyah letter name
  const getHijaiyahLetter = (letterId) => {
    const letters = {
      1: 'ا', 2: 'ب', 3: 'ت', 4: 'ث', 5: 'ج', 6: 'ح', 7: 'خ', 8: 'د', 9: 'ذ', 10: 'ر',
      11: 'ز', 12: 'س', 13: 'ش', 14: 'ص', 15: 'ض', 16: 'ط', 17: 'ظ', 18: 'ع', 19: 'غ', 20: 'ف',
      21: 'ق', 22: 'ك', 23: 'ل', 24: 'م', 25: 'ن', 26: 'ه', 27: 'و', 28: 'ي'
    };
    return letters[letterId] || 'Unknown';
  };

  // Helper function untuk format waktu relatif
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Baru saja';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };
  
  const handleLogout = () => {
    // Clear all teacher-related data
    localStorage.removeItem('isTeacher');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('teacherEmail');
    localStorage.removeItem('teacherName');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('userId');
    localStorage.removeItem('teacherInstitution');
    sessionStorage.clear();
    router.push('/authentication/teacher/loginTeacher');
  };
  
 const dockItems = [
    // { 
    //   title: "Dashboard", 
    //   icon: <IconHome />, 
    //   href: "/dashboard/Dashboard", 
    //   onClick: () => router.push('/dashboard/Dashboard')
    // },
    // { 
    //   title: "Huruf", 
    //   icon: <IconLetterA />, 
    //   href: "/dashboard/DashboardHuruf", 
    //   onClick: () => router.push('/dashboard/DashboardHuruf')
    // },
    // { 
    //   title: "Belajar & Roadmap", 
    //   icon: <IconBook />, 
    //   href: "/dashboard/DashboardBelajar", 
    //   onClick: () => router.push('/dashboard/DashboardBelajar')
    // },
    { 
      title: "Informasi", 
      icon: <IconInfoCircle />, 
      href: "/dashboard/teacher/DashboardInformasi", 
      onClick: () => router.push('/dashboard/teacher/DashboardInformasi')
    },
    { 
      title: "Statistik", 
      icon: <IconChartBar />, 
      href: "/dashboard/teacher/DashboardStats", 
      onClick: () => router.push('/dashboard/teacher/DashboardStats')
    },
    { 
      title: "Aktivitas", 
      icon: <IconActivity />, 
      href: "/dashboard/teacher/DashboardActivityTeacher", 
      onClick: () => router.push('/dashboard/teacher/DashboardActivityTeacher')
    },
    // { 
    //   title: "Pengumuman", 
    //   icon: <IconBell />, 
    //   href: "/dashboard/Dashboard#announcement", 
    //   onClick: () => router.push('/dashboard/Dashboard#announcement')
    // },
    // { 
    //   title: "Proyek", 
    //   icon: <IconList />, 
    //   href: "/dashboard/Dashboard#projects", 
    //   onClick: () => router.push('/dashboard/Dashboard#projects')
    // },
    { 
      title: "Pengaturan", 
      icon: <IconSettings />, 
      href: "/dashboard/teacher/DashboardSettingsTeacher", 
      onClick: () => router.push('/dashboard/teacher/DashboardSettingsTeacher')
    },
  ];

  const filterOptions = [
    "Semua Aktivitas",
    "Latihan Huruf",
    "Kuis",
    "Penyelesaian Level"
  ];

  const taskFilterOptions = [
    "Semua",
    "Belum Selesai",
    "Dalam Proses",
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
      "Dalam Proses": "bg-purple-100 text-purple-700",
      "Selesai": "bg-green-100 text-green-700",
      "Terlambat": "bg-red-100 text-red-700"
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      "Belum Selesai": <IconClock size={14} className="text-blue-600" />,
      "Dalam Proses": <IconActivity size={14} className="text-purple-600" />,
      "Selesai": <IconCheck size={14} className="text-green-600" />,
      "Terlambat": <IconAlertTriangle size={14} className="text-red-600" />
    };
    return iconMap[status] || <IconClock size={14} className="text-gray-600" />;
  };

  // Filter tugas berdasarkan status
  const filteredTasks = taskFilter === 'Semua' 
    ? teacherTasks 
    : teacherTasks.filter(task => task.status === taskFilter);

  // Fetch teacher tasks from Supabase
  const fetchTeacherTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        console.log('No teacher ID found');
        setIsLoadingTasks(false);
        return;
      }

      const { data, error } = await supabase
        .from('teacher_tasks')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teacher tasks:', error);
        // Use fallback data if there's an error
        setTeacherTasks(fallbackTasks);
      } else {
        if (data && data.length > 0) {
          // Format the data to match our interface
          const formattedTasks = data.map(task => ({
            id: task.id,
            name: task.title,
            description: task.description,
            deadline: formatDate(task.due_date),
            priority: getPriorityFromDate(task.due_date),
            status: task.status || 'Belum Selesai',
            category: 'Tugas',
            created_at: task.created_at,
            updated_at: task.updated_at
          }));
          setTeacherTasks(formattedTasks);
        } else {
          // Use fallback data if no tasks found
          setTeacherTasks(fallbackTasks);
        }
      }
    } catch (error) {
      console.error('Error in fetchTeacherTasks:', error);
      setTeacherTasks(fallbackTasks);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Belum ditentukan';
    
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hari ini, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Besok, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === -1) {
      return 'Kemarin';
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} hari yang lalu`;
    } else {
      return `${diffDays} hari lagi`;
    }
  };

  // Helper function to determine priority based on due date
  const getPriorityFromDate = (dateString) => {
    if (!dateString) return 'Rendah';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Tinggi';
    if (diffDays <= 3) return 'Sedang';
    return 'Rendah';
  };

  // Fallback tasks data
  const fallbackTasks = [
    { 
      id: 1, 
      name: "Persiapan Materi Huruf ض", 
      description: "Menyiapkan materi pembelajaran untuk huruf dhad",
      deadline: "Hari ini, 15:00", 
      priority: "Tinggi", 
      status: "Belum Selesai",
      category: "Persiapan"
    },
    { 
      id: 2, 
      name: "Review Kuis Tajwid Dasar", 
      description: "Mengevaluasi hasil kuis tajwid siswa",
      deadline: "Besok, 10:00", 
      priority: "Sedang", 
      status: "Belum Selesai",
      category: "Evaluasi"
    },
    { 
      id: 3, 
      name: "Update Kurikulum Level 3", 
      description: "Memperbarui materi kurikulum untuk level menengah",
      deadline: "3 hari lagi", 
      priority: "Rendah", 
      status: "Dalam Proses",
      category: "Kurikulum"
    },
    { 
      id: 4, 
      name: "Analisis Performa Siswa", 
      description: "Menganalisis performa siswa dalam latihan huruf",
      deadline: "Kemarin", 
      priority: "Tinggi", 
      status: "Terlambat",
      category: "Analisis"
    },
    { 
      id: 5, 
      name: "Buat Soal Praktik Membaca", 
      description: "Membuat soal praktik membaca surah pendek",
      deadline: "5 hari lagi", 
      priority: "Sedang", 
      status: "Belum Selesai",
      category: "Pembuatan Soal"
    }
  ];

  const fetchTeacherProfile = async () => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) return;

      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (error) throw error;
      setTeacherProfile(data);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
    }
  };

  // Handle task operations
  const handleTaskDetail = (task) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('teacher_tasks')
        .update({ status: 'Selesai', updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (!error) {
        // Refresh tasks
        fetchTeacherTasks();
        showToast.success('Tugas berhasil diselesaikan! 🎉');
      } else {
        showToast.error('Gagal menyelesaikan tugas');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      showToast.error('Terjadi kesalahan saat menyelesaikan tugas');
    }
  };

  useEffect(() => {
    // This effect was moved to the initial useEffect above
  }, [router]);

  // Render Content Management Tab Content
  const renderContentManagement = () => {    
    switch(activeTab) {
      case 'soal':
        return <QuestionManagement />;
      
      case 'kelas':
        return <ClassManagement />;
      
      case 'event':
        return <EventManagement />;
      
      default:
        return null;
    }
  };
  
  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      <div className="bg-blue-50 min-h-screen font-['Poppins']">
        <Head>
          <title>Aktivitas & Manajemen - Dashboard Teacher</title>
          <meta name="description" content="Kelola aktivitas, tugas, dan konten pembelajaran" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <motion.div
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <HeaderTeacher userName={userName} teacherProfile={teacherProfile} />

            <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-8 pb-24">
              {/* Welcome Section */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h1 className="text-3xl md:text-4xl font-bold">
                          Selamat Datang, {userName}! 👋
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl">
                          Kelola aktivitas pembelajaran dan pantau kemajuan siswa
                        </p>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-3"
                      >

                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="hidden md:block"
                    >
                      <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <IconActivity size={48} className="text-white/80" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Modern Tab Navigation */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-3xl shadow-lg border border-blue-100 mb-8 overflow-hidden"
              >
                <div className="relative">
                  <div className="flex flex-wrap">
                    <motion.button
                      onClick={() => setActiveTab('aktivitas')}
                      className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                        activeTab === 'aktivitas' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconActivity size={20} />
                      <span className="font-['Poppins']">Aktivitas & Tugas</span>
                      {activeTab === 'aktivitas' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setActiveTab('soal')}
                      className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                        activeTab === 'soal' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconBooks size={20} />
                      <span className="font-['Poppins']">Pengaturan Soal</span>
                      {activeTab === 'soal' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setActiveTab('kelas')}
                      className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                        activeTab === 'kelas' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconUsersGroup size={20} />
                      <span className="font-['Poppins']">Manajemen Kelas</span>
                      {activeTab === 'kelas' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setActiveTab('event')}
                      className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                        activeTab === 'event' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconCalendarEvent size={20} />
                      <span className="font-['Poppins']">Event & Acara</span>
                      {activeTab === 'event' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </div>
                </div>
                {/* Tab Content */}
                <div className="p-8">
                  {activeTab === 'aktivitas' ? (
                    <>
                      {/* Filter & Search Section */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 mb-8 border border-blue-200"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <IconFilter size={18} className="text-blue-500" />
                            </div>
                            <select 
                              className="pl-10 pr-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-700 w-full md:w-auto font-['Poppins'] shadow-sm"
                              value={activeFilter}
                              onChange={(e) => setActiveFilter(e.target.value)}
                            >
                              {filterOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="relative w-full md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <IconSearch size={18} className="text-blue-500" />
                            </div>
                            <input
                              type="text"
                              placeholder="Cari aktivitas atau tugas..."
                              className="pl-10 pr-4 py-3 border border-blue-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-['Poppins'] shadow-sm"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <div className="mb-6">
                      {renderContentManagement()}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Content based on active tab */}
              {activeTab === 'aktivitas' && <ActivityTab />}
              
              {/* Legacy content for backward compatibility */}
              {activeTab === 'aktivitas_legacy' && (
                <>
                  {/* Enhanced Tasks Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8"
                  >
                    <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <IconCalendar size={20} className="text-white" />
                          </div>
                          <div>
                            <h2 className="font-bold text-xl text-gray-800 font-['Poppins']">
                              Daftar Tugas Anda
                            </h2>
                            <p className="text-gray-600 text-sm font-['Poppins']">
                              Kelola dan pantau tugas pembelajaran
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <select
                              className="text-sm border border-blue-200 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-700 font-['Poppins'] shadow-sm"
                              value={taskFilter}
                              onChange={(e) => setTaskFilter(e.target.value)}
                            >
                              {taskFilterOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {isLoadingTasks ? (
                        <div className="p-12 text-center">
                          <motion.div
                            className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <p className="text-gray-500 font-['Poppins']">Memuat tugas...</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-600">
                                <th className="px-6 py-4 font-['Poppins']">Nama Tugas</th>
                                <th className="px-6 py-4 font-['Poppins']">Deskripsi</th>
                                <th className="px-6 py-4 font-['Poppins']">Tenggat Waktu</th>
                                <th className="px-6 py-4 font-['Poppins']">Prioritas</th>
                                <th className="px-6 py-4 font-['Poppins']">Status</th>
                                <th className="px-6 py-4 text-right font-['Poppins']">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {filteredTasks.map((task, index) => (
                                <motion.tr 
                                  key={task.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.05 * index }}
                                  className="hover:bg-blue-50 transition-all duration-300"
                                >
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-800 font-['Poppins']">{task.name}</div>
                                    <div className="text-xs text-blue-600 mt-1 font-medium font-['Poppins']">{task.category}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 font-['Poppins'] max-w-xs truncate">
                                      {task.description || 'Tidak ada deskripsi'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm font-['Poppins']">
                                      <IconClock size={16} className="text-gray-500" />
                                      <span className="text-gray-700">{task.deadline}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold font-['Poppins'] ${getPriorityBadge(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-['Poppins'] ${getStatusBadge(task.status)}`}>
                                      {getStatusIcon(task.status)}
                                      {task.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <motion.button 
                                        className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-100 transition-all duration-300"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleTaskDetail(task)}
                                        title="Lihat Detail"
                                      >
                                        <IconEye size={16} />
                                      </motion.button>
                                      <motion.button 
                                        className="p-2 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-100 transition-all duration-300"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleCompleteTask(task.id)}
                                        title="Tandai Selesai"
                                      >
                                        <IconCheck size={16} />
                                      </motion.button>
                                    </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                          
                          {filteredTasks.length === 0 && (
                            <div className="py-12 text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <IconCalendar size={24} className="text-gray-400" />
                              </div>
                              <p className="text-gray-500 font-['Poppins'] text-lg font-medium">Tidak ada tugas yang ditemukan</p>
                              <p className="text-gray-400 font-['Poppins'] text-sm mt-1">Belum ada tugas pembelajaran tersedia</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Enhanced Activity Feed and Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="lg:col-span-2"
                    >
                      <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                              <IconActivity size={20} className="text-white" />
                            </div>
                            <div>
                              <h2 className="font-bold text-xl text-gray-800 font-['Poppins']">
                                Aktivitas Terbaru
                              </h2>
                              <p className="text-gray-600 text-sm font-['Poppins']">
                                Pantau kemajuan siswa secara real-time
                              </p>
                            </div>
                          </div>
              
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                          {loadingUserActivities ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, index) => (
                              <div key={index} className="p-6 animate-pulse">
                                <div className="flex items-start gap-4">
                                  <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
                                  <div className="flex-1">
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                  </div>
                                  <div className="w-8 h-8 bg-gray-300 rounded-xl"></div>
                                </div>
                              </div>
                            ))
                          ) : userActivities.length > 0 ? (
                            userActivities.map((activity, index) => (
                              <motion.div 
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                                className="p-6 hover:bg-blue-50 transition-all duration-300"
                              >
                                <div className="flex items-start gap-4">
                                  <div className={`w-3 h-3 rounded-full mt-2 shadow-lg ${
                                    activity.color === 'green' ? 'bg-green-500' :
                                    activity.color === 'blue' ? 'bg-blue-500' :
                                    activity.color === 'purple' ? 'bg-purple-500' :
                                    activity.color === 'yellow' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}></div>
                                  <div className="flex-1">
                                    <p className="text-gray-800 font-['Poppins']">
                                      <span className="font-semibold text-blue-700">{activity.user}</span> 
                                      <span className="text-gray-600"> telah {activity.action}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                      <IconCalendar size={14} />
                                      <span className="font-['Poppins']">{activity.time}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                      activity.color === 'green' ? 'bg-green-500' :
                                      activity.color === 'blue' ? 'bg-blue-500' :
                                      activity.color === 'purple' ? 'bg-purple-500' :
                                      activity.color === 'yellow' ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}>
                                      <span className="text-white text-xs font-bold">
                                        {activity.user.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <IconActivity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 font-['Poppins']">Belum ada aktivitas terbaru</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                          <motion.button 
                            onClick={() => {
                              fetchUserActivities();
                              showToast.success('Data aktivitas diperbarui!');
                            }}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg font-['Poppins']"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Refresh Aktivitas
                            <RefreshCw size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Enhanced Active Users */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="lg:col-span-1"
                    >
                      <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                              <IconUser size={20} className="text-white" />
                            </div>
                            <div>
                              <h2 className="font-bold text-xl text-gray-800 font-['Poppins']">
                                Top Siswa
                              </h2>
                              <p className="text-gray-600 text-sm font-['Poppins']">
                                Siswa paling aktif minggu ini
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                          {loadingTopStudents ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, index) => (
                              <div key={index} className="p-4 animate-pulse">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-300 rounded-2xl"></div>
                                    <div>
                                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="h-4 bg-gray-300 rounded w-12 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                                </div>
                              </div>
                            ))
                          ) : topStudents.length > 0 ? (
                            topStudents.map((user, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                                className="p-4 hover:bg-blue-50 transition-all duration-300"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${
                                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                      'bg-gradient-to-r from-blue-600 to-blue-700'
                                    }`}>
                                      {user.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-800 font-['Poppins']">{user.name}</p>
                                      <div className="flex items-center gap-2 text-xs mt-1">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-semibold font-['Poppins']">
                                          Level {user.level}
                                        </span>
                                        <span className="text-gray-500 font-['Poppins']">🔥 {user.streak}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg text-gray-800 font-['Poppins']">{user.points}</p>
                                    <p className="text-xs text-gray-500 font-['Poppins']">Poin</p>
                                  </div>
                                </div>
                                
                                {/* Progress bar */}
                                <div className="mt-3">
                                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div 
                                      className={`h-full rounded-full ${
                                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                        'bg-gradient-to-r from-blue-500 to-blue-600'
                                      }`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.min((user.level / 10) * 100, 100)}%` }}
                                      transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <IconUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 font-['Poppins']">Belum ada data siswa</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <motion.button 
                            onClick={() => {
                              fetchTopStudents();
                              showToast.success('Data siswa terbaik diperbarui!');
                            }}
                            className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-['Poppins']"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Refresh Top Siswa
                            <RefreshCw size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </main>
          </>
        )}

        {/* Enhanced Floating Dock */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <FloatingDock items={dockItems} />
          </motion.div>
        </div>
        
        {/* Task Detail Modal */}
        {isTaskDetailModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <IconCalendar size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-gray-800 font-['Poppins']">
                      Detail Tugas
                    </h2>
                    <p className="text-gray-600 text-sm font-['Poppins']">
                      Informasi lengkap tugas pembelajaran
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsTaskDetailModalOpen(false)}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconX size={20} />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Task Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Poppins']">
                    Nama Tugas
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-800 font-medium font-['Poppins']">{selectedTask.name}</p>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Poppins']">
                    Kategori
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium bg-blue-100 text-blue-700 font-['Poppins']">
                      {selectedTask.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Poppins']">
                    Deskripsi
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 font-['Poppins'] leading-relaxed">
                      {selectedTask.description || 'Tidak ada deskripsi tersedia'}
                    </p>
                  </div>
                </div>

                {/* Deadline and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Poppins']">
                      Tenggat Waktu
                    </label>
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-2">
                      <IconClock size={16} className="text-gray-500" />
                      <span className="text-gray-700 font-['Poppins']">{selectedTask.deadline}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Poppins']">
                      Prioritas
                    </label>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold font-['Poppins'] ${getPriorityBadge(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-['Poppins']">
                    Status
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold font-['Poppins'] ${getStatusBadge(selectedTask.status)}`}>
                      {getStatusIcon(selectedTask.status)}
                      {selectedTask.status}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {selectedTask.status !== 'Selesai' && (
                    <motion.button
                      onClick={() => {
                        handleCompleteTask(selectedTask.id);
                        setIsTaskDetailModalOpen(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg font-['Poppins']"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconCheck size={18} />
                      Tandai Selesai
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setIsTaskDetailModalOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 font-['Poppins']"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Tutup
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Toast Notifications */}
        <Toast />
      </div>
    </ClientOnly>
  );
};

export default DashboardTeacher;