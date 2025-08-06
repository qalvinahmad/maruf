import { IconActivity, IconArrowLeft, IconCalendar, IconCheck, IconFilter, IconSearch } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Toast, showToast } from '../../../../components/ui/toast';
import { supabase } from '../../../../lib/supabaseClient';

function AllActivities({ user, profile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [allUserActivities, setAllUserActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loadingUserActivities, setLoadingUserActivities] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua Aktivitas');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch all user activities
  const fetchAllUserActivities = async () => {
    try {
      setLoadingUserActivities(true);
      console.log('Fetching all user activities...');
      
      // Get recent hijaiyah progress
      const { data: hijaiyahData, error: hijaiyahError } = await supabase
        .from('hijaiyah_progress')
        .select('*')
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })
        .limit(100);

      if (hijaiyahError) {
        console.error('Error fetching hijaiyah progress:', hijaiyahError);
      }

      // Get recent user sublesson progress
      const { data: sublessonData, error: sublessonError } = await supabase
        .from('user_sublesson_progress')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

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
      let activitiesData = [];
      
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
              icon: 'letter',
              category: 'Latihan Huruf',
              details: {
                letter_id: progress.letter_id,
                completed_at: progress.completed_at
              }
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
            let category;
            
            if (progress.status === 'completed') {
              action = `menyelesaikan sub-lesson ${progress.sublesson_id} di Level ${progress.roadmap_id}`;
              color = 'green';
              category = 'Penyelesaian Level';
            } else {
              action = `memulai sub-lesson ${progress.sublesson_id} di Level ${progress.roadmap_id}`;
              color = 'purple';
              category = 'Memulai Level';
            }
            
            activitiesData.push({
              id: `sublesson-${progress.id}`,
              type: 'sublesson',
              user: user.full_name,
              action: action,
              timestamp: progress.completed_at || progress.updated_at || progress.created_at,
              color: color,
              icon: 'level',
              category: category,
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
      
      console.log('Total activities loaded:', activitiesData.length);
      
      setAllUserActivities(activitiesData);
      setFilteredActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching all user activities:', error);
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
  const getUserActivityIcon = (type) => {
    switch (type) {
      case 'hijaiyah':
        return <IconActivity size={16} className="text-blue-600" />;
      case 'sublesson':
        return <IconCheck size={16} className="text-purple-600" />;
      default:
        return <IconActivity size={16} className="text-gray-600" />;
    }
  };

  // Filter activities based on search and filter
  useEffect(() => {
    let filtered = allUserActivities;

    // Apply category filter
    if (activeFilter !== 'Semua Aktivitas') {
      filtered = filtered.filter(activity => activity.category === activeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [allUserActivities, activeFilter, searchTerm]);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Fetch all user activities
    fetchAllUserActivities();
    
    // Set loading to false after data fetch
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);

  const filterOptions = [
    "Semua Aktivitas",
    "Latihan Huruf",
    "Penyelesaian Level",
    "Memulai Level"
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

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Semua Aktivitas Pengguna - Dashboard</title>
        <meta name="description" content="Semua aktivitas pengguna dalam pembelajaran makhrojul huruf" />
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
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <IconArrowLeft size={20} />
                <span>Kembali</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Semua Aktivitas Pengguna</h1>
            <p className="text-gray-600">
              Menampilkan {filteredActivities.length} dari {allUserActivities.length} aktivitas
            </p>
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
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  {filterOptions.map(option => (
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
                  placeholder="Cari pengguna atau aktivitas..."
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
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <IconActivity size={20} className="text-blue-500" />
                Riwayat Aktivitas Lengkap
              </h2>
              <div className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {loadingUserActivities ? (
                <div className="p-8 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-500">Memuat aktivitas...</span>
                  </div>
                </div>
              ) : currentActivities.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <IconActivity size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Tidak ada aktivitas ditemukan</p>
                  <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
                </div>
              ) : (
                currentActivities.map((activity, index) => (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${getColorClass(activity.color)}`}></div>
                      <div className="flex-1">
                        <p className="text-gray-800">
                          <span className="font-medium">{activity.user}</span> telah {activity.action}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            {getUserActivityIcon(activity.type)}
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {activity.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <IconCalendar size={14} />
                            <span>{formatRelativeTime(activity.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      )}

      {/* Toast Component */}
      <Toast />
    </div>
  );
}

export default AllActivities;
