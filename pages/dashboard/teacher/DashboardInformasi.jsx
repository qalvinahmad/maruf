import { IconActivity, IconBell, IconChartBar, IconInfoCircle, IconSettings, IconTrendingUp, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AnnouncementManagement from '../../../components/dashboard/teacher/AnnouncementManagement';
import NotificationManagement from '../../../components/dashboard/teacher/NotificationManagement';
import HeaderTeacher from '../../../components/layout/HeaderTeacher';
import { FloatingDock } from '../../../components/ui/floating-dock';
import { supabase } from '../../../lib/supabaseClient';


export default function DashboardInformasi() {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pengumuman');
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const router = useRouter();

   const fetchTeacherProfile = async () => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        console.log('No teacherId in localStorage, skipping profile fetch');
        return;
      }

      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (error) {
        // Handle RLS/CORS errors gracefully
        if (error.message.includes('access control checks') || 
            error.message.includes('CORS') ||
            error.code === 'PGRST116') {
          console.log('Teacher profile access denied, using localStorage data instead');
          // Use localStorage data as fallback
          const fallbackProfile = {
            full_name: localStorage.getItem('teacherName') || 'Guru',
            email: localStorage.getItem('teacherEmail') || '',
            institution: localStorage.getItem('teacherInstitution') || 'Belum ada',
            is_verified: true,
            status: 'verified'
          };
          setTeacherProfile(fallbackProfile);
          return;
        }
        throw error;
      }
      
      setTeacherProfile(data);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      // Use localStorage as fallback
      const fallbackProfile = {
        full_name: localStorage.getItem('teacherName') || 'Guru',
        email: localStorage.getItem('teacherEmail') || '',
        institution: localStorage.getItem('teacherInstitution') || 'Belum ada',
        is_verified: true,
        status: 'verified'
      };
      setTeacherProfile(fallbackProfile);
    }
  };
  
  // Cek apakah user sudah login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Ambil data user dari localStorage
    setUserName(localStorage.getItem('teacherName') || localStorage.getItem('userName') || 'Guru');
    fetchTeacherProfile();
    fetchDashboardStats();
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      // Fetch unread notifications count
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('id')
        .eq('is_read', false);
      
      if (!notifError) {
        setUnreadCount(notifications?.length || 0);
      }

      // Fetch total announcements
      const { data: announcements, error: announcError } = await supabase
        .from('announcements')
        .select('id');
      
      if (!announcError) {
        setTotalAnnouncements(announcements?.length || 0);
      }

      // Fetch recent activity (example data)
      setRecentActivity([
        { id: 1, type: 'announcement', title: 'Pengumuman sistem baru', time: '2 jam yang lalu' },
        { id: 2, type: 'notification', title: 'Update profil berhasil', time: '1 hari yang lalu' },
        { id: 3, type: 'activity', title: 'Login berhasil', time: '2 hari yang lalu' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };
  
  
  
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

  // Tab navigation dengan animasi dan style yang lebih modern
  const TabNavigation = () => {
    const tabs = [
      { id: 'pengumuman', label: 'Pengumuman', icon: IconBell },
      { id: 'notifikasi', label: 'Notifikasi', icon: IconInfoCircle }
    ];

    return (
      <div className="bg-white rounded-2xl p-2 shadow-lg mb-8 border border-blue-100">
        <div className="flex gap-2 relative">
          {tabs.map((tab, index) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-6 rounded-xl text-sm font-medium transition-all duration-300 flex-1 z-10 ${
                  isActive
                    ? 'text-white'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <IconComponent size={18} />
                  <span className="font-['Poppins']">{tab.label}</span>
                </div>
              </motion.button>
            );
          })}
          
          {/* Animated background that slides between tabs */}
          <motion.div
            className="absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg"
            animate={{
              left: activeTab === 'pengumuman' ? '4px' : '50%',
              width: activeTab === 'pengumuman' ? 'calc(50% - 8px)' : 'calc(50% - 8px)'
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4
            }}
            style={{
              zIndex: 0
            }}
          />
        </div>
      </div>
    );
  };

  // Stats Cards Component
  const StatsCards = () => {
    const stats = [
      {
        title: 'Total Pengumuman',
        value: totalAnnouncements,
        icon: IconBell,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700'
      },
      {
        title: 'Notifikasi Belum Dibaca',
        value: unreadCount,
        icon: IconInfoCircle,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700'
      },
      {
        title: 'Aktivitas Terbaru',
        value: recentActivity.length,
        icon: IconTrendingUp,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-['Poppins']">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${stat.textColor} font-['Poppins']`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                  <IconComponent size={24} className={stat.textColor} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-blue-50 min-h-screen font-poppins">
      <Head>
        <title>Informasi - Belajar Makhrojul Huruf</title>
        <meta name="description" content="Informasi, pengumuman, dan pencapaian terbaru" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-screen bg-blue-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <HeaderTeacher userName={userName} teacherProfile={teacherProfile} />
          
          <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-8 pb-32">
            
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 mb-8 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2 font-['Poppins']">
                    Selamat Datang, {userName}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg font-['Poppins']">
                    Kelola pengumuman dan notifikasi dengan mudah
                  </p>
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="hidden md:block"
                >
                  <IconUsers size={80} className="text-blue-200" />
                </motion.div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <StatsCards />
            
            {/* Tab Navigation */}
            <TabNavigation />
            
            {/* Content Area */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden"
            >
              <div className="p-8">
                {/* Pengumuman Tab */}
                {activeTab === 'pengumuman' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <IconBell size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">
                          Manajemen Pengumuman
                        </h2>
                        <p className="text-gray-600 font-['Poppins']">
                          Buat dan kelola pengumuman untuk pengguna
                        </p>
                      </div>
                    </div>
                    <AnnouncementManagement />
                  </div>
                )}
                
                {/* Notifikasi Tab */}
                {activeTab === 'notifikasi' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <IconInfoCircle size={24} className="text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">
                          Manajemen Notifikasi
                        </h2>
                        <p className="text-gray-600 font-['Poppins']">
                          Kelola notifikasi sistem dan personal
                        </p>
                      </div>
                    </div>
                    <NotificationManagement />
                  </div>
                )}
              </div>
            </motion.div>
          </main>

          {/* Enhanced Floating Dock */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <FloatingDock items={dockItems} />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}