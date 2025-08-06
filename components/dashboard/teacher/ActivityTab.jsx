import { IconActivity, IconArrowRight, IconCalendar, IconCheck, IconClock, IconEdit, IconFilter, IconPlus, IconSearch, IconTrash, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { showToast } from '../../ui/toast';
import Dropdown from '../../widget/dropdown';

const ActivityTab = () => {
  // Local state for activity management
  const [activeFilter, setActiveFilter] = useState('Semua Aktivitas');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('Semua');
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [teacherTasks, setTeacherTasks] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [loadingUserActivities, setLoadingUserActivities] = useState(true);
  const [topStudents, setTopStudents] = useState([]);
  const [loadingTopStudents, setLoadingTopStudents] = useState(true);

  // Filter options
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

  // Filter tugas berdasarkan status
  const filteredTasks = taskFilter === 'Semua' 
    ? teacherTasks 
    : teacherTasks.filter(task => task.status === taskFilter);

  useEffect(() => {
    fetchTeacherTasks();
    fetchUserActivities();
    fetchTopStudents();
  }, []);

  // Fetch teacher tasks from Supabase
  const fetchTeacherTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        console.log('No teacher ID found');
        // Use fallback data
        setTeacherTasks(fallbackTasks);
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
        setTeacherTasks(fallbackTasks);
      } else {
        if (data && data.length > 0) {
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

  // Fetch user activities from database
  const fetchUserActivities = async () => {
    try {
      const { data: hijaiyahData, error: hijaiyahError } = await supabase
        .from('hijaiyah_progress')
        .select('*')
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })
        .limit(30);

      if (hijaiyahError) {
        console.error('Error fetching hijaiyah progress:', hijaiyahError);
      }

      const { data: sublessonData, error: sublessonError } = await supabase
        .from('user_sublesson_progress')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(30);

      if (sublessonError) {
        console.error('Error fetching sublesson progress:', sublessonError);
      }

      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      const activities = [];
      
      // Add hijaiyah activities
      if (hijaiyahData && hijaiyahData.length > 0) {
        hijaiyahData.forEach(progress => {
          const user = allUsers?.find(u => u.id === progress.user_id);
          if (user) {
            activities.push({
              id: `hijaiyah_${progress.id}`,
              user: user.full_name,
              user_email: user.email,
              action: `menyelesaikan latihan huruf ${getHijaiyahLetter(progress.letter_id)}`,
              time: formatRelativeTime(progress.completed_at || progress.updated_at || progress.created_at),
              type: 'hijaiyah_progress',
              color: 'blue',
              created_at: progress.completed_at || progress.updated_at || progress.created_at
            });
          }
        });
      }

      // Add sublesson activities
      if (sublessonData && sublessonData.length > 0) {
        sublessonData.forEach(progress => {
          const user = allUsers?.find(u => u.id === progress.user_id);
          if (user) {
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

      const sortedActivities = activities
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

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
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select(`id, full_name, email, level_description, created_at`)
        .eq('is_admin', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (userError) {
        console.error('Error fetching users:', userError);
        setTopStudents(fallbackTopStudents);
        return;
      }

      const studentsWithActivity = await Promise.all(
        (userData || []).map(async (user) => {
          const { count: hijaiyahCount } = await supabase
            .from('hijaiyah_progress')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('is_completed', true);

          const { count: sublessonCount } = await supabase
            .from('user_sublesson_progress')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('status', 'completed');

          const totalActivity = (hijaiyahCount || 0) + (sublessonCount || 0);
          const level = parseInt(user.level_description) || 1;
          const points = totalActivity * 10 + level * 50;
          const streak = Math.floor(Math.random() * 20) + 1;

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

      const topStudents = studentsWithActivity
        .sort((a, b) => b.activityCount - a.activityCount)
        .slice(0, 5);

      setTopStudents(topStudents);
      
    } catch (error) {
      console.error('Error fetching top students:', error);
      setTopStudents(fallbackTopStudents);
    } finally {
      setLoadingTopStudents(false);
    }
  };

  // Helper functions
  const getHijaiyahLetter = (letterId) => {
    const letters = {
      1: 'ا', 2: 'ب', 3: 'ت', 4: 'ث', 5: 'ج', 6: 'ح', 7: 'خ', 8: 'د', 9: 'ذ', 10: 'ر',
      11: 'ز', 12: 'س', 13: 'ش', 14: 'ص', 15: 'ض', 16: 'ط', 17: 'ظ', 18: 'ع', 19: 'غ', 20: 'ف',
      21: 'ق', 22: 'ك', 23: 'ل', 24: 'م', 25: 'ن', 26: 'ه', 27: 'و', 28: 'ي'
    };
    return letters[letterId] || 'Unknown';
  };

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
      "Terlambat": <IconActivity size={14} className="text-red-600" />
    };
    return iconMap[status] || <IconClock size={14} className="text-gray-600" />;
  };

  // Task operations
  const handleAddTask = async () => {
    console.log('Add task functionality to be implemented');
  };

  const handleEditTask = async (taskId) => {
    console.log('Edit task:', taskId);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('teacher_tasks')
        .update({ status: 'Selesai', updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (!error) {
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

  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('teacher_tasks')
        .delete()
        .eq('id', taskId);

      if (!error) {
        fetchTeacherTasks();
        showToast.success('Tugas berhasil dihapus');
      } else {
        showToast.error('Gagal menghapus tugas');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showToast.error('Terjadi kesalahan saat menghapus tugas');
    }
  };

  // Fallback data
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
    }
  ];

  const fallbackTopStudents = [
    { name: "Ahmad Fauzi", level: 8, streak: "15 hari", points: "2,450", activityCount: 45 },
    { name: "Fatimah Azzahra", level: 7, streak: "12 hari", points: "2,120", activityCount: 38 }
  ];
  return (
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
            <Dropdown
              options={filterOptions}
              value={activeFilter}
              onChange={setActiveFilter}
              placeholder="Filter aktivitas"
              icon={<IconFilter size={18} className="text-blue-500" />}
            />
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
                <Dropdown
                  options={taskFilterOptions}
                  value={taskFilter}
                  onChange={setTaskFilter}
                  placeholder="Filter tugas"
                />
              </div>
              <motion.button 
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg font-['Poppins']"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddTask}
              >
                <IconPlus size={16} />
                Tambah Tugas
              </motion.button>
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
                            onClick={() => handleEditTask(task.id)}
                            title="Edit Tugas"
                          >
                            <IconEdit size={16} />
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
                          <motion.button 
                            className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-100 transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTask(task.id)}
                            title="Hapus Tugas"
                          >
                            <IconTrash size={16} />
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
                  <p className="text-gray-400 font-['Poppins'] text-sm mt-1">Tambahkan tugas baru untuk memulai</p>
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
              <motion.button 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2 transition-all duration-300 bg-white/50 px-4 py-2 rounded-xl font-['Poppins']"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Lihat Semua
                <IconArrowRight size={16} />
              </motion.button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {loadingUserActivities ? (
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
        
        {/* Top Students */}
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
  );
};

export default ActivityTab;
