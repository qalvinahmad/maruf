import { IconActivity, IconArrowRight, IconBell, IconBook, IconCalendar, IconChartBar, IconChartPie, IconFileAnalytics, IconList, IconLogout, IconSettings, IconTrophy, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FloatingDock } from '../../../../components/ui/floating-dock';
import { supabase } from '../../../../lib/supabaseClient';

const AdminData = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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
    setUserName(localStorage.getItem('userName') || 'Admin');
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);
  
  // Fungsi untuk mengambil jumlah pengguna dari Supabase
  const fetchUserStats = async () => {
    try {
      // Mengambil jumlah total pengguna
      const { data: usersData, error: usersError } = await supabase
        .from('auth.users')
        .select('id', { count: 'exact' });
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }
      
      // Update state dengan jumlah pengguna
      setUserCount(usersData.length);
      
      // Untuk persentase perubahan, Anda bisa mengimplementasikan logika tambahan
      // misalnya membandingkan dengan data bulan lalu
      setUserCountChange('0'); // Sementara set ke 0%
    } catch (error) {
      console.error('Error in fetchUserStats:', error);
    }
  };
  
  // Panggil fetchUserStats saat komponen dimuat
  useEffect(() => {
    if (!isLoading) {
      fetchUserStats();
    }
  }, [isLoading]);
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/');
  };
  
  const markAsRead = (id) => {
    setFeedbacks(feedbacks.map(feedback => 
      feedback.id === id ? {...feedback, status: 'read'} : feedback
    ));
  };
  
  const markAllAsRead = () => {
    setFeedbacks(feedbacks.map(feedback => ({...feedback, status: 'read'})));
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
  

  // Tab navigation
  const TabNavigation = () => {
    return (
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'overview' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ikhtisar Data
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'stats' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Statistik Huruf
        </button>
        <button 
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'recommendations' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rekomendasi
        </button>
        <button 
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'feedback' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Feedback Pengguna
          {feedbacks.filter(f => f.status === 'unread').length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {feedbacks.filter(f => f.status === 'unread').length}
            </span>
          )}
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
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    {userName}
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Administrator</span>
                  </h2>
                  <div className="flex items-center text-xs text-gray-500 gap-3">
                    <span>Level 10 • Admin</span>
                    <span className="flex items-center gap-1 text-purple-600">
                      <IconCalendar size={12} />
                      <span>Admin Panel</span>
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      <IconTrophy size={12} />
                      <span>Full Access</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <IconBell size={20} className="text-gray-600" />
                  {feedbacks.filter(f => f.status === 'unread').length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <IconLogout size={16} />
                  <span className="hidden md:inline">Keluar</span>
                </button>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-6 pb-24">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-secondary to-blue-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel Admin Analisis Data</h1>
                  <p className="text-white/80 max-w-md">Pantau statistik platform, analisis penggunaan, dan kelola feedback pengguna untuk meningkatkan kualitas pembelajaran.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('feedback')}
                  className="bg-white text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 shadow-md"
                >
                  <span>Lihat Feedback</span>
                  <IconArrowRight size={18} />
                </button>
              </div>
            </div>
            
            {/* Menu Admin dengan Animasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer bg-blue-50 border-blue-200"
                onClick={() => router.push('/dashboard/admin/data/AdminData')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <IconFileAnalytics size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Analisis Data</h3>
                </div>
                <p className="text-sm text-gray-600">Analisis penggunaan platform dan statistik pembelajaran</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                onClick={() => router.push('/dashboard/admin/content/AdminContent')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <IconBook size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Kelola Konten</h3>
                </div>
                <p className="text-sm text-gray-600">Kelola materi pembelajaran dan konten edukasi</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                onClick={() => router.push('/dashboard/admin/event/AdminEvent')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <IconBell size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Kelola Event</h3>
                </div>
                <p className="text-sm text-gray-600">Kelola event dan pengumuman untuk pengguna</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                onClick={() => router.push('/dashboard/admin/verification/AdminVerif')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <IconUsers size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Verifikasi Pengguna</h3>
                </div>
                <p className="text-sm text-gray-600">Kelola dan verifikasi akun pengguna platform</p>
              </motion.div>
            </div>
            
            {/* Tab Navigation */}
            <TabNavigation />
            
            {/* Tab Content */}
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Filter Periode */}
                  <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <select className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-secondary">
                          <option>7 Hari Terakhir</option>
                          <option>30 Hari Terakhir</option>
                          <option>3 Bulan Terakhir</option>
                          <option>6 Bulan Terakhir</option>
                          <option>1 Tahun Terakhir</option>
                        </select>
                        <button className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Terapkan
                        </button>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button className="border border-secondary text-secondary px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                          Ekspor Data
                        </button>
                        <button className="border border-secondary text-secondary px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                          Cetak Laporan
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Kartu Statistik */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Total Pengguna</p>
                          <p className="text-2xl font-bold">{userCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <IconUsers size={20} />
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <IconArrowRight size={12} className="transform rotate-45" />
                        <span>{userCountChange}% dari bulan lalu</span>
                      </p>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Pengguna Aktif</p>
                          <p className="text-2xl font-bold">876</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <IconActivity size={20} />
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <IconArrowRight size={12} className="transform rotate-45" />
                        <span>+12% dari bulan lalu</span>
                      </p>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Sesi Belajar</p>
                          <p className="text-2xl font-bold">5,432</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <IconBook size={20} />
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <IconArrowRight size={12} className="transform rotate-45" />
                        <span>+15% dari bulan lalu</span>
                      </p>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Tingkat Penyelesaian</p>
                          <p className="text-2xl font-bold">68%</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                          <IconChartPie size={20} />
                        </div>
                      </div>
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <IconArrowRight size={12} className="transform rotate-45" />
                        <span>+5% dari bulan lalu</span>
                      </p>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Grafik Penggunaan */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8 bg-white p-6 rounded-xl shadow-sm"
                  >
                    <h3 className="text-lg font-semibold mb-4">Tren Penggunaan Platform</h3>
                    <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center border border-gray-100">
                      <p className="text-gray-500">Grafik Tren Penggunaan Platform</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Statistik Huruf Tab */}
              {activeTab === 'stats' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Statistik Huruf Hijaiyah</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700 border-b">
                          <th className="py-3 px-4 text-left font-semibold">Huruf</th>
                          <th className="py-3 px-4 text-left font-semibold">Tingkat Kesulitan</th>
                          <th className="py-3 px-4 text-left font-semibold">Tingkat Keberhasilan</th>
                          <th className="py-3 px-4 text-left font-semibold">Jumlah Latihan</th>
                          <th className="py-3 px-4 text-left font-semibold">Tren</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">ض</td>
                          <td className="py-3 px-4">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Tinggi</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>62%</span>
                              <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '62%' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">1,245</td>
                          <td className="py-3 px-4 text-yellow-600">↗ Meningkat</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">ظ</td>
                          <td className="py-3 px-4">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Tinggi</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>58%</span>
                              <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '58%' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">1,120</td>
                          <td className="py-3 px-4 text-yellow-600">↗ Meningkat</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">ع</td>
                          <td className="py-3 px-4">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Tinggi</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>75%</span>
                              <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">1,532</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">ح</td>
                          <td className="py-3 px-4">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Tinggi</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>72%</span>
                              <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">1,345</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">خ</td>
                          <td className="py-3 px-4">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Tinggi</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>70%</span>
                              <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">1,289</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
              
              {/* Rekomendasi Tab */}
              {activeTab === 'recommendations' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Rekomendasi Perbaikan</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Tingkatkan Materi untuk Huruf ض dan ظ</h4>
                      <p className="text-sm text-gray-600">Tingkat keberhasilan untuk huruf-huruf ini masih di bawah 65%. Pertimbangkan untuk menambahkan lebih banyak contoh dan latihan.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Optimalkan Waktu Belajar</h4>
                      <p className="text-sm text-gray-600">Data menunjukkan bahwa pengguna cenderung belajar pada malam hari. Pertimbangkan untuk mengirimkan pengingat pada waktu-waktu tersebut.</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Tingkatkan Retensi Pengguna</h4>
                      <p className="text-sm text-gray-600">30% pengguna tidak kembali setelah minggu pertama. Pertimbangkan untuk menambahkan fitur gamifikasi untuk meningkatkan keterlibatan.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Feedback Tab */}
              {activeTab === 'feedback' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Feedback Terbaru</h3>
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div 
                        key={feedback.id}
                        className={`p-4 rounded-lg border ${feedback.status === 'unread' ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-800">{feedback.user}</h4>
                            <p className="text-sm text-gray-500">{feedback.email}</p>
                          </div>
                          <button 
                            onClick={() => markAsRead(feedback.id)}
                            className={`text-xs ${feedback.status === 'unread' ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'}`}
                          >
                            {feedback.status === 'unread' ? 'Tandai Dibaca' : 'Sudah Dibaca'}
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm">{feedback.message}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-400">{feedback.date}</span>
                          <div className="flex gap-2">
                            <button className="text-xs text-gray-600 hover:text-gray-800">Balas</button>
                            <button className="text-xs text-red-600 hover:text-red-700">Hapus</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
