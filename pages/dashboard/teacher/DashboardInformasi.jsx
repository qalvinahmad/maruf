import { IconActivity, IconArrowRight, IconBell, IconCalendar, IconChartBar, IconInfoCircle, IconLogout, IconSettings, IconTrophy } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiAward } from 'react-icons/fi';
import AnnouncementManagement from '../../../components/dashboard/teacher/AnnouncementManagement';
import LeaderboardManagement from '../../../components/dashboard/teacher/LeaderboardManagement';
import NotificationManagement from '../../../components/dashboard/teacher/NotificationManagement';
import { FloatingDock } from '../../../components/ui/floating-dock';
import { supabase } from '../../../lib/supabaseClient';


export default function DashboardInformasi() {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pengumuman');
  const [teacherProfile, setTeacherProfile] = useState(null);
  const router = useRouter();
  
  // Cek apakah user sudah login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Ambil data user dari localStorage
    setUserName(localStorage.getItem('userName') || 'Pengguna');
    fetchTeacherProfile();
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);
  
  const fetchTeacherProfile = async () => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) return;

      const { data, error } = await supabase
        .from('teacher_profiles')
        .select(`
          id,
          email,
          full_name,
          teaching_experience,
          institution,
          specialization,
          certifications,
          is_verified,
          status,
          updated_at
        `)
        .eq('id', teacherId)
        .single();

      if (error) throw error;
      setTeacherProfile(data);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
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

  // Tab navigation
  const TabNavigation = () => {
    return (
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('pengumuman')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'pengumuman' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pengumuman
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'leaderboard' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Leaderboard
        </button>
        <button 
          onClick={() => setActiveTab('notifikasi')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'notifikasi' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Notifikasi
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Informasi - Belajar Makhrojul Huruf</title>
        <meta name="description" content="Informasi, pengumuman, dan pencapaian terbaru" />
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
                    <span>{teacherProfile?.is_verified ? 'Terverifikasi • ' : ''}{teacherProfile?.status || 'Pending'}</span>
                    <span className="flex items-center gap-1 text-purple-600">
                      <IconCalendar size={12} />
                      <span>{teacherProfile?.teaching_experience || 'Belum ada'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      <IconTrophy size={12} />
                      <span>{teacherProfile?.specialization || 'Belum ada'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <FiAward size={12} />
                      <span>{teacherProfile?.institution || 'Belum ada'}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <IconBell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-secondary to-blue-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden shadow-lg"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Informasi & Komunitas</h1>
                  <p className="text-white/80 max-w-md">Dapatkan informasi terbaru, lihat pencapaian pengguna lain, dan ikuti perkembangan komunitas belajar makhrojul huruf.</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('pengumuman')}
                  className="bg-white text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 shadow-md"
                >
                  <span>Lihat Pengumuman</span>
                  <IconArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
            
            {/* Tab Navigation */}
            <TabNavigation />
            
            <div className="space-y-6">
              {/* Pengumuman Tab */}
              {activeTab === 'pengumuman' && <AnnouncementManagement />}
              
              {/* Leaderboard Tab */}
              {activeTab === 'leaderboard' && <LeaderboardManagement />}
              
              {/* Notifikasi Tab */}
              {activeTab === 'notifikasi' && <NotificationManagement />}
            </div>
          </main>
          {/* Floating Dock */}
                  <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <FloatingDock items={dockItems} />
        </div>
        </>
      )}
    </div>
  );
}