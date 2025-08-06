import { IconActivity, IconArrowLeft, IconCalendar, IconFilter, IconSearch, IconUser } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { clientCache } from '../../../../lib/clientCache';
import { supabase } from '../../../../lib/supabaseClient';

function AllTeacherActivities() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [teacherActivities, setTeacherActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch teacher activities from database with Client cache
  const fetchAllTeacherActivities = async () => {
    try {
      setLoadingActivities(true);
      
      // Check client cache first
      const cacheKey = 'all_teacher_activities';
      let activitiesData = await clientCache.get(cacheKey);
      
      if (!activitiesData) {
        // Get all teacher task activities (increased limit)
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
          .limit(100);

        if (taskError) {
          console.error('Error fetching task activities:', taskError);
        }

        // Get all teacher profile updates (login activities)
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
          .limit(100);

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
              status: task.status,
              category: 'Tugas'
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
                status: 'active',
                category: 'Login'
              });
            }
          });
        }
        
        // Sort by timestamp
        activitiesData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Cache for 5 minutes
        await clientCache.set(cacheKey, activitiesData, 300);
      }
      
      setTeacherActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching teacher activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Helper functions
  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Belum Selesai',
      'in_progress': 'Sedang Dikerjakan',
      'completed': 'Selesai',
      'overdue': 'Terlambat',
      'active': 'Aktif'
    };
    return statusMap[status] || 'Belum Selesai';
  };

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

  // Filter activities
  const filteredActivities = teacherActivities.filter(activity => {
    const matchesSearch = activity.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'Semua' || activity.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Fetch all teacher activities
    fetchAllTeacherActivities();
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);

  const categoryOptions = ['Semua', 'Tugas', 'Login'];

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Semua Log Aktivitas Guru - Dashboard</title>
        <meta name="description" content="Semua aktivitas guru dalam platform pembelajaran" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-10 pb-24 max-w-6xl">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link 
                href="/dashboard/admin/activity/DashboardActivity"
                className="p-2 rounded-lg hover:bg-white border border-gray-200 transition-colors"
              >
                <IconArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Semua Log Aktivitas Guru</h1>
                <p className="text-gray-600">Lihat semua aktivitas guru dalam platform pembelajaran</p>
              </div>
            </div>
          </motion.div>
          
          {/* Filter & Search Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconFilter size={18} className="text-gray-400" />
                </div>
                <select 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-700 w-full md:w-auto"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconSearch size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari aktivitas guru..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
          
          {/* Activities List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8"
          >
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <IconUser size={20} className="text-blue-500" />
                Log Aktivitas Guru
                <span className="text-sm font-normal text-gray-500">
                  ({filteredActivities.length} aktivitas)
                </span>
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {loadingActivities ? (
                <div className="p-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-500">Memuat aktivitas...</span>
                  </div>
                </div>
              ) : paginatedActivities.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Tidak ada aktivitas guru ditemukan</p>
                </div>
              ) : (
                <AnimatePresence>
                  {paginatedActivities.map((activity, index) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${getActivityColor(activity.type)}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800">
                                <span className="font-medium">{activity.teacher}</span> {activity.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  {getActivityIcon(activity.type)}
                                  <span>{formatRelativeTime(activity.timestamp)}</span>
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  {activity.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <IconCalendar size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center space-x-2"
            >
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
              </button>
            </motion.div>
          )}
        </main>
      )}
    </div>
  );
}

export default AllTeacherActivities;
