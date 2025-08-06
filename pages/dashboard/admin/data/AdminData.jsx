import {
  IconActivity,
  IconBell,
  IconBook,
  IconChartBar,
  IconDatabase,
  IconList,
  IconRefresh,
  IconSettings,
  IconUserCheck,
  IconUsers
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminHeader from '../../../../components/admin/adminHeader';
import { FloatingDock } from '../../../../components/ui/floating-dock';
import { clientCache } from '../../../../lib/clientCache';
import redisCache from '../../../../lib/redisCache';
import { supabase } from '../../../../lib/supabaseClient';

const AdminData = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [profileData, setProfileData] = useState({ full_name: 'Admin' });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const [activeTab, setActiveTab] = useState('retention');
  const [userCount, setUserCount] = useState(0);
  const [userCountChange, setUserCountChange] = useState('0');
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, user: 'Ahmad Fauzi', email: 'ahmad@example.com', message: 'Aplikasi ini sangat membantu saya dalam belajar makhrojul huruf. Namun, saya kesulitan dengan huruf ض dan ظ.', date: '2023-10-15', status: 'unread' },
    { id: 2, user: 'Siti Aminah', email: 'siti@example.com', message: 'Saya suka dengan fitur latihan pengucapan. Bisa ditambahkan lebih banyak contoh audio untuk setiap huruf?', date: '2023-10-14', status: 'read' },
    { id: 3, user: 'Muhammad Rizki', email: 'rizki@example.com', message: 'Tampilan aplikasi sangat menarik dan mudah digunakan. Saya juga suka dengan sistem poin dan level.', date: '2023-10-12', status: 'read' },
    { id: 4, user: 'Fatimah Zahra', email: 'fatimah@example.com', message: 'Saya mengalami kesulitan saat mencoba mengakses materi video. Terkadang videonya tidak bisa diputar.', date: '2023-10-10', status: 'unread' },
    { id: 5, user: 'Abdullah Hasan', email: 'abdullah@example.com', message: 'Aplikasi ini sangat bermanfaat. Saya harap ada fitur untuk menyimpan progres belajar saat offline.', date: '2023-10-08', status: 'read' },
  ]);
  
  // Cek apakah user sudah login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Ambil data user dari localStorage
    const storedUserName = localStorage.getItem('userName') || 'Admin';
    setUserName(storedUserName);
    setProfileData({ full_name: storedUserName });
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);
  
  // Fungsi untuk mengambil jumlah pengguna dari Supabase
  const fetchUserStats = async () => {
    try {
      const cacheKey = 'admin_user_stats';
      
      // Check Redis cache first (server-side only)
      if (typeof window === 'undefined') {
        try {
          const cachedData = await redisCache.get(cacheKey);
          if (cachedData) {
            console.log('✅ Redis cache hit for user stats');
            setUserCount(cachedData.userCount);
            setUserCountChange(cachedData.userCountChange);
            return;
          }
        } catch (redisError) {
          console.warn('⚠️ Redis cache miss for user stats:', redisError.message);
        }
      }
      
      // Check client cache as fallback
      const clientCachedData = clientCache.get(cacheKey);
      if (clientCachedData) {
        console.log('✅ Client cache hit for user stats');
        setUserCount(clientCachedData.userCount);
        setUserCountChange(clientCachedData.userCountChange);
        // Continue with fresh fetch in background
      }

      // Mengambil jumlah total pengguna
      const { data: usersData, error: usersError } = await supabase
        .from('auth.users')
        .select('id', { count: 'exact' });
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }
      
      const userCount = usersData.length;
      const userCountChange = '0'; // Sementara set ke 0%
      
      // Update state dengan jumlah pengguna
      setUserCount(userCount);
      setUserCountChange(userCountChange);

      // Prepare data for caching
      const statsData = {
        userCount,
        userCountChange,
        timestamp: new Date().toISOString()
      };

      // Cache the data
      if (typeof window === 'undefined') {
        try {
          await redisCache.set(cacheKey, statsData, 300); // 5 minutes TTL
          console.log('✅ User stats cached in Redis');
        } catch (redisError) {
          console.warn('⚠️ Redis cache set failed for user stats:', redisError.message);
        }
      }
      
      // Always cache in client
      clientCache.set(cacheKey, statsData, 300000); // 5 minutes
      console.log('✅ User stats cached in client');
      
    } catch (error) {
      console.error('Error in fetchUserStats:', error);
    }
  };
  
  // Panggil fetchUserStats saat komponen dimuat
  useEffect(() => {
    if (!isLoading) {
      fetchUserStats();
      fetchFeedbackData();
    }
  }, [isLoading]);

  // Handle refresh data
  useEffect(() => {
    if (refreshData) {
      fetchUserStats();
      fetchFeedbackData();
      setRefreshData(false);
    }
  }, [refreshData]);

  const fetchFeedbackData = async () => {
    try {
      const cacheKey = 'admin_feedback_data';
      
      // Check Redis cache first (server-side only)
      if (typeof window === 'undefined') {
        try {
          const cachedData = await redisCache.get(cacheKey);
          if (cachedData) {
            console.log('✅ Redis cache hit for feedback data');
            setFeedbacks(cachedData);
            return;
          }
        } catch (redisError) {
          console.warn('⚠️ Redis cache miss for feedback data:', redisError.message);
        }
      }
      
      // Check client cache as fallback
      const clientCachedData = clientCache.get(cacheKey);
      if (clientCachedData) {
        console.log('✅ Client cache hit for feedback data');
        setFeedbacks(clientCachedData);
        // Continue with fresh fetch in background
      }

      // For now, using static data, but you can replace this with actual Supabase query
      const feedbackData = [
        { id: 1, user: 'Ahmad Fauzi', email: 'ahmad@example.com', message: 'Aplikasi ini sangat membantu saya dalam belajar makhrojul huruf. Namun, saya kesulitan dengan huruf ض dan ظ.', date: '2023-10-15', status: 'unread' },
        { id: 2, user: 'Siti Aminah', email: 'siti@example.com', message: 'Saya suka dengan fitur latihan pengucapan. Bisa ditambahkan lebih banyak contoh audio untuk setiap huruf?', date: '2023-10-14', status: 'read' },
        { id: 3, user: 'Muhammad Rizki', email: 'rizki@example.com', message: 'Tampilan aplikasi sangat menarik dan mudah digunakan. Saya juga suka dengan sistem poin dan level.', date: '2023-10-12', status: 'read' },
        { id: 4, user: 'Fatimah Zahra', email: 'fatimah@example.com', message: 'Saya mengalami kesulitan saat mencoba mengakses materi video. Terkadang videonya tidak bisa diputar.', date: '2023-10-10', status: 'unread' },
        { id: 5, user: 'Abdullah Hasan', email: 'abdullah@example.com', message: 'Aplikasi ini sangat bermanfaat. Saya harap ada fitur untuk menyimpan progres belajar saat offline.', date: '2023-10-08', status: 'read' },
      ];

      setFeedbacks(feedbackData);

      // Cache the data
      if (typeof window === 'undefined') {
        try {
          await redisCache.set(cacheKey, feedbackData, 600); // 10 minutes TTL
          console.log('✅ Feedback data cached in Redis');
        } catch (redisError) {
          console.warn('⚠️ Redis cache set failed for feedback data:', redisError.message);
        }
      }
      
      // Always cache in client
      clientCache.set(cacheKey, feedbackData, 600000); // 10 minutes
      console.log('✅ Feedback data cached in client');
      
    } catch (error) {
      console.error('Error in fetchFeedbackData:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userId');
      
      // Navigate to login page
      router.push('/authentication/admin/loginAdmin');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/authentication/admin/loginAdmin');
    }
  };
  
  const markAsRead = (id) => {
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === id ? {...feedback, status: 'read'} : feedback
    ));
  };
  
  const markAllAsRead = () => {
    setFeedbacks(feedbacks.map(feedback => ({...feedback, status: 'read'})));
  };

  // AdminMenuCard Component
  const AdminMenuCard = ({ icon, title, description, bgColor, onClick, isActive = false }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        scale: 1.02
      }}
      whileTap={{ scale: 0.98 }}
      className={`${bgColor} p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border group ${
        isActive ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-100/50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">{description}</p>
    </motion.div>
  );
  
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
  

  // Tab navigation
  const TabNavigation = () => {
    return (
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('retention')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'retention' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Retensi Pengguna
        </button>
        <button 
          onClick={() => setActiveTab('learning')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'learning' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Analisis Pembelajaran
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'ai' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Analisis NLP & AI
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'content' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Analisis Konten
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Analisis Data - Admin Panel</title>
        <meta name="description" content="Analisis penggunaan platform dan rekomendasi perbaikan" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <AdminHeader profileData={profileData} handleLogout={handleLogout} />
          
          <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
            {/* Welcome Banner */}
        {/* Enhanced Welcome Banner */}
        <motion.div className="relative min-h-[320px] bg-gradient-to-br from-red-600 via-red-600 to-red-700 text-white p-8 rounded-3xl overflow-hidden mb-8">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 via-red-500/40 to-red-500/30 animate-gradient-x"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-red-500/30 to-red-600/25 animate-gradient-xy"></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-white/15 to-white/5 rounded-full animate-float-slow backdrop-blur-sm" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-white/10 to-transparent rounded-full transform translate-x-1/3 translate-y-1/3 animate-float-reverse" />
          
          <div className="absolute top-1/4 -left-8 w-24 h-24 bg-gradient-to-r from-pink-300/20 to-red-400/15 rounded-full animate-float-x" />
          <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-gradient-to-br from-red-300/25 to-red-400/15 rounded-full animate-bounce-slow" />

          {/* Content */}
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent drop-shadow-lg"
              >
                Dashboard Data Admin
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/95 max-w-md text-lg leading-relaxed drop-shadow-sm"
              >
                Monitor dan analisis data pengguna, statistik pembelajaran, serta feedback sistem untuk wawasan mendalam
              </motion.p>
            </div>
            
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRefreshData(true)}
              className="bg-white/95 backdrop-blur-sm text-red-700 font-semibold py-3 px-6 rounded-xl hover:bg-white transition-all duration-300 flex items-center gap-2 shadow-xl hover:shadow-2xl border border-white/20"
            >
              <IconRefresh size={18} />
              <span>Refresh Data</span>
            </motion.button>
          </div>
        </motion.div>        {/* Menu Admin Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AdminMenuCard 
            icon={<IconDatabase className="text-blue-600" size={20} />}
            title="Analisis Data"
            description="Analisis penggunaan platform dan rekomendasi perbaikan"
            bgColor="bg-white"
            onClick={() => router.push('/dashboard/admin/data/AdminData')}
            isActive={true}
          />
          <AdminMenuCard 
            icon={<IconBook className="text-green-600" size={20} />}
            title="Kelola Konten"
            description="Kelola materi, modul, dan konten pembelajaran makhrojul huruf"
            bgColor="bg-white"
            onClick={() => router.push('/dashboard/admin/content/AdminContent')}
            isActive={false}
          />
          <AdminMenuCard 
            icon={<IconBell className="text-purple-600" size={20} />}
            title="Kelola Event"
            description="Kelola event, pengumuman, dan notifikasi platform"
            bgColor="bg-white"
            onClick={() => router.push('/dashboard/admin/event/AdminEvent')}
            isActive={false}
          />
          <AdminMenuCard 
            icon={<IconUserCheck className="text-yellow-600" size={20} />}
            title="Verifikasi Pengguna"
            description="Kelola verifikasi akun dan validasi pengguna baru"
            bgColor="bg-white"
            onClick={() => router.push('/dashboard/admin/verification/AdminVerif')}
            isActive={false}
          />
        </div>
            
            {/* Tab Navigation */}
            <TabNavigation />
            
            {/* Tab Content */}
            <div className="space-y-6">
              {/* Retensi Pengguna Tab */}
              {activeTab === 'retention' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Analisis Retensi Pengguna</h3>
                        <p className="text-gray-600">Memantau keterlibatan pengguna dari waktu ke waktu</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>30 Hari Terakhir</option>
                          <option>90 Hari Terakhir</option>
                          <option>6 Bulan Terakhir</option>
                          <option>1 Tahun Terakhir</option>
                        </select>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Refresh
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Retensi Rate Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">Retensi 1 Hari</h4>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-green-600">85%</span>
                        <span className="text-sm text-gray-500 ml-2">dari 1,245 pengguna</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">↗ +5% dari periode sebelumnya</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">Retensi 7 Hari</h4>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-yellow-600">62%</span>
                        <span className="text-sm text-gray-500 ml-2">dari 1,245 pengguna</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">→ Stabil dari periode sebelumnya</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">Retensi 30 Hari</h4>
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-red-600">34%</span>
                        <span className="text-sm text-gray-500 ml-2">dari 1,245 pengguna</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">↘ -3% dari periode sebelumnya</p>
                    </motion.div>
                  </div>

                  {/* Perbandingan Kelompok */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <h4 className="text-lg font-semibold mb-4">Perbandingan Kelompok Pengguna</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700">
                            <th className="py-3 px-4 text-left font-semibold">Kelompok</th>
                            <th className="py-3 px-4 text-left font-semibold">Jumlah Pengguna</th>
                            <th className="py-3 px-4 text-left font-semibold">Retensi 7 Hari</th>
                            <th className="py-3 px-4 text-left font-semibold">Retensi 30 Hari</th>
                            <th className="py-3 px-4 text-left font-semibold">Metode Belajar Utama</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">Pendaftar Minggu Ini</td>
                            <td className="py-3 px-4">245</td>
                            <td className="py-3 px-4">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">68%</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">38%</span>
                            </td>
                            <td className="py-3 px-4">Audio + Visual</td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">Pendaftar Bulan Lalu</td>
                            <td className="py-3 px-4">512</td>
                            <td className="py-3 px-4">
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">59%</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">31%</span>
                            </td>
                            <td className="py-3 px-4">Teks + Audio</td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">Pengguna Lama (&gt;3 bulan)</td>
                            <td className="py-3 px-4">488</td>
                            <td className="py-3 px-4">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">76%</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">65%</span>
                            </td>
                            <td className="py-3 px-4">Latihan Interaktif</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Grafik Retensi */}
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="text-lg font-semibold mb-4">Tren Retensi dari Waktu ke Waktu</h4>
                    <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center border border-gray-100">
                      <p className="text-gray-500">Grafik Tren Retensi Pengguna - Cohort Analysis</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Analisis Pembelajaran Tab */}
              {activeTab === 'learning' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Analisis Efektivitas Pembelajaran</h3>
                    <p className="text-gray-600">Memantau efektivitas metode pengajaran dan tingkat keberhasilan</p>
                  </div>

                  {/* Learning Effectiveness Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconChartBar className="text-blue-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Tingkat Keberhasilan</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-blue-600">74%</span>
                        <span className="text-sm text-gray-500 ml-2">rata-rata</span>
                      </div>
                      <p className="text-xs text-gray-600">Menjawab soal dengan benar</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <IconUsers className="text-green-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Adaptasi AI</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-green-600">92%</span>
                        <span className="text-sm text-gray-500 ml-2">akurasi</span>
                      </div>
                      <p className="text-xs text-gray-600">Prediksi tingkat kesulitan</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <IconBook className="text-purple-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Waktu Penyelesaian</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-purple-600">12</span>
                        <span className="text-sm text-gray-500 ml-2">menit/skill</span>
                      </div>
                      <p className="text-xs text-gray-600">Rata-rata per skill</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <IconActivity className="text-orange-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Skor Peningkatan</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-orange-600">+18%</span>
                        <span className="text-sm text-gray-500 ml-2">setelah latihan</span>
                      </div>
                      <p className="text-xs text-gray-600">Korelasi latihan-skor</p>
                    </div>
                  </div>

                  {/* Difficulty Analysis */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <h4 className="text-lg font-semibold mb-4">Analisis Tingkat Kesulitan Soal</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700">
                            <th className="py-3 px-4 text-left font-semibold">Kategori Soal</th>
                            <th className="py-3 px-4 text-left font-semibold">Tingkat Kesulitan</th>
                            <th className="py-3 px-4 text-left font-semibold">Success Rate</th>
                            <th className="py-3 px-4 text-left font-semibold">Waktu Rata-rata</th>
                            <th className="py-3 px-4 text-left font-semibold">AI Recommendation</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">Makhrojul Huruf ض</td>
                            <td className="py-3 px-4">
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Sulit</span>
                            </td>
                            <td className="py-3 px-4">58%</td>
                            <td className="py-3 px-4">18 menit</td>
                            <td className="py-3 px-4">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">Tambah Latihan</span>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">Makhrojul Huruf ع</td>
                            <td className="py-3 px-4">
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Sedang</span>
                            </td>
                            <td className="py-3 px-4">72%</td>
                            <td className="py-3 px-4">14 menit</td>
                            <td className="py-3 px-4">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Optimal</span>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">Tajwid Dasar</td>
                            <td className="py-3 px-4">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Mudah</span>
                            </td>
                            <td className="py-3 px-4">89%</td>
                            <td className="py-3 px-4">8 menit</td>
                            <td className="py-3 px-4">
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">Tingkatkan Level</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Analisis NLP & AI Tab */}
              {activeTab === 'ai' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Analisis NLP dan Sistem AI</h3>
                    <p className="text-gray-600">Monitoring sistem koreksi otomatis dan prediksi kesalahan</p>
                  </div>

                  {/* AI Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <IconBook className="text-purple-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Akurasi NLP</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-purple-600">94.2%</span>
                        <span className="text-sm text-gray-500 ml-2">analisis jawaban</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <IconSettings className="text-green-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Prediksi Kesalahan</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-green-600">87.5%</span>
                        <span className="text-sm text-gray-500 ml-2">akurasi prediksi</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconActivity className="text-blue-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Response Time</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-blue-600">1.2s</span>
                        <span className="text-sm text-gray-500 ml-2">rata-rata</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* NLP Analysis Results */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <h4 className="text-lg font-semibold mb-4">Analisis Pola Kesalahan Berdasarkan Riwayat</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-red-800">Kesalahan Makhrojul Huruf</h5>
                          <span className="text-red-600 text-sm">68% pengguna</span>
                        </div>
                        <p className="text-red-700 text-sm mb-2">
                          Pola kesalahan terbanyak pada huruf-huruf yang keluar dari tenggorokan (ع، ح، خ، غ)
                        </p>
                        <div className="text-xs text-red-600">
                          <strong>AI Recommendation:</strong> Fokus pada latihan audio berulang dengan feedback real-time
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-yellow-800">Kesalahan Sifat Huruf</h5>
                          <span className="text-yellow-600 text-sm">45% pengguna</span>
                        </div>
                        <p className="text-yellow-700 text-sm mb-2">
                          Kebingungan dalam membedakan sifat jahr dan hams pada huruf tertentu
                        </p>
                        <div className="text-xs text-yellow-600">
                          <strong>AI Recommendation:</strong> Tambah visualisasi dan latihan kontrastif
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-blue-800">Prediksi Kesulitan Berikutnya</h5>
                          <span className="text-blue-600 text-sm">AI Confidence: 91%</span>
                        </div>
                        <p className="text-blue-700 text-sm mb-2">
                          Berdasarkan riwayat, pengguna akan kesulitan dengan materi Qalqalah dan Ghunnah
                        </p>
                        <div className="text-xs text-blue-600">
                          <strong>AI Recommendation:</strong> Siapkan materi prasyarat dan latihan persiapan
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Correction Analysis */}
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="text-lg font-semibold mb-4">Performa Sistem Koreksi Otomatis</h4>
                    <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center border border-gray-100">
                      <p className="text-gray-500">Grafik Real-time AI Correction Performance & NLP Analysis</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Analisis Konten Tab */}
              {activeTab === 'content' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Analisis Performa Konten</h3>
                    <p className="text-gray-600">Optimalisasi materi pembelajaran dan urutan konten</p>
                  </div>

                  {/* Content Performance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <IconBook className="text-orange-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Materi Terlalu Sulit</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-orange-600">12</span>
                        <span className="text-sm text-gray-500 ml-2">modul</span>
                      </div>
                      <p className="text-xs text-gray-600">Success rate &lt; 60%</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <IconChartBar className="text-green-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Materi Terlalu Mudah</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-green-600">8</span>
                        <span className="text-sm text-gray-500 ml-2">modul</span>
                      </div>
                      <p className="text-xs text-gray-600">Success rate &gt; 95%</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconUsers className="text-blue-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Feedback Positif</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-blue-600">87%</span>
                        <span className="text-sm text-gray-500 ml-2">dari pengguna</span>
                      </div>
                      <p className="text-xs text-gray-600">Rating 4+ untuk konten</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <IconActivity className="text-purple-600" size={20} />
                        </div>
                        <h4 className="font-semibold text-gray-800">Optimalisasi</h4>
                      </div>
                      <div className="mb-3">
                        <span className="text-3xl font-bold text-purple-600">23%</span>
                        <span className="text-sm text-gray-500 ml-2">improvement</span>
                      </div>
                      <p className="text-xs text-gray-600">Setelah reorder konten</p>
                    </div>
                  </div>

                  {/* Content Analysis Table */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <h4 className="text-lg font-semibold mb-4">Performa Skill dan Materi Individual</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700">
                            <th className="py-3 px-4 text-left font-semibold">Nama Skill</th>
                            <th className="py-3 px-4 text-left font-semibold">Success Rate</th>
                            <th className="py-3 px-4 text-left font-semibold">User Rating</th>
                            <th className="py-3 px-4 text-left font-semibold">Completion Time</th>
                            <th className="py-3 px-4 text-left font-semibold">Feedback</th>
                            <th className="py-3 px-4 text-left font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">Pengenalan Makhrojul Huruf</td>
                            <td className="py-3 px-4">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">92%</span>
                            </td>
                            <td className="py-3 px-4">4.8/5.0</td>
                            <td className="py-3 px-4">8 menit</td>
                            <td className="py-3 px-4">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Sangat Baik</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">Optimal</span>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">Huruf Halqi (Tenggorokan)</td>
                            <td className="py-3 px-4">
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">54%</span>
                            </td>
                            <td className="py-3 px-4">3.2/5.0</td>
                            <td className="py-3 px-4">22 menit</td>
                            <td className="py-3 px-4">
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Perlu Audio Lebih</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Perlu Perbaikan</span>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">Sifat-sifat Huruf</td>
                            <td className="py-3 px-4">
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">71%</span>
                            </td>
                            <td className="py-3 px-4">4.1/5.0</td>
                            <td className="py-3 px-4">15 menit</td>
                            <td className="py-3 px-4">
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Tambah Visualisasi</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Review Needed</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Learning Path Optimization */}
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="text-lg font-semibold mb-4">Rekomendasi Optimalisasi Urutan Pembelajaran</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h5 className="font-medium text-blue-800 mb-2">Urutan Saat Ini</h5>
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <span className="bg-blue-200 px-2 py-1 rounded">1. Pengenalan</span>
                          <span>→</span>
                          <span className="bg-blue-200 px-2 py-1 rounded">2. Makhrojul Huruf</span>
                          <span>→</span>
                          <span className="bg-blue-200 px-2 py-1 rounded">3. Sifat Huruf</span>
                          <span>→</span>
                          <span className="bg-blue-200 px-2 py-1 rounded">4. Aplikasi</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h5 className="font-medium text-green-800 mb-2">Urutan Optimal (AI Recommendation)</h5>
                        <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                          <span className="bg-green-200 px-2 py-1 rounded">1. Pengenalan</span>
                          <span>→</span>
                          <span className="bg-green-200 px-2 py-1 rounded">2. Sifat Huruf</span>
                          <span>→</span>
                          <span className="bg-green-200 px-2 py-1 rounded">3. Makhrojul Huruf</span>
                          <span>→</span>
                          <span className="bg-green-200 px-2 py-1 rounded">4. Aplikasi</span>
                        </div>
                        <p className="text-xs text-green-600">
                          <strong>Improvement Expected:</strong> +23% completion rate, -15% average time
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </main>

          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <FloatingDock items={dockItems} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminData;
