import { IconBook, IconCalendarEvent, IconHistory, IconTrophy, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import AvailableClasses from '../../components/learning/AvailableClasses';
import DailyChallenge from '../../components/learning/DailyChallenge';
import Event from '../../components/learning/Event';
import Leaderboard from '../../components/learning/Leaderboard';
import LearningHistory from '../../components/learning/LearningHistory';
import Roadmap from '../../components/learning/Roadmap';
import { Toast } from '../../components/ui/toast';
import { supabase } from '../../lib/supabaseClient';
import { getRoadmapLevels } from '../../utils/supabase-queries';

// Komponen ProfileHeader
function ProfileHeader({ profileData }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold">Halo, {profileData.full_name || 'User'}</h2>
      <div className="text-sm text-gray-500">Level: {profileData.level} | XP: {profileData.xp} | Point: {profileData.points} | Streak: {profileData.streak} | Energi: {profileData.energy}</div>
    </div>
  );
}

// Komponen MainContent
function MainContent({ activeTab, roadmapData, expandedLevel, setExpandedLevel, handleStartLesson, userProfile, onEnergyUpdate }) {
  if (activeTab === 'roadmap') {
    return (
      <Roadmap
        roadmapData={roadmapData}
        expandedLevel={expandedLevel}
        setExpandedLevel={setExpandedLevel}
        handleStartLesson={handleStartLesson}
        userProfile={userProfile}
        onEnergyUpdate={onEnergyUpdate}
      />
    );
  }
  
  if (activeTab === 'kelas') {
    return <AvailableClasses />;
  }
  
  if (activeTab === 'riwayat') {
    return <LearningHistory />;
  }
  
  if (activeTab === 'leaderboard') {
    return <Leaderboard />;
  }
  

  
  if (activeTab === 'event') {
    return <Event />;
  }  // Tambahkan komponen lain sesuai tab jika diperlukan
  return <div className="py-8 text-center text-gray-400">Fitur belum tersedia.</div>;
}

export default function Belajar() {
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('roadmap');
  const [roadmapData, setRoadmapData] = useState([]);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    level: 1,
    xp: 0,
    points: 0,
    streak: 0,
    level_description: 'Pemula',
    energy: 5
  });
  
  // Cek apakah user sudah login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // Skip authentication check in development for testing
    if (process.env.NODE_ENV === 'development') {
      // Set default auth data for development
      if (!localStorage.getItem('isLoggedIn')) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', 'Test User');
        localStorage.setItem('userId', '123');
      }
      setUserName(localStorage.getItem('userName') || 'Test User');
      return;
    }
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Ambil data user dari localStorage
    setUserName(localStorage.getItem('userName') || 'Pengguna');
  }, [router]);

  useEffect(() => {
    const fetchRoadmap = async () => {
      const userId = localStorage.getItem('userId') || '123'; // fallback for development
      if (!userId) return;
      
      try {
        const data = await getRoadmapLevels(userId);
        setRoadmapData(data);
        
        // Find the first active level and expand it
        const activeLevel = data.find(level => 
          level.status === 'active' || 
          level.sub_lessons?.some(sub => sub.status === 'active')
        );
        
        if (activeLevel) {
          setExpandedLevel(activeLevel.id);
        }
      } catch (error) {
        console.error('Error fetching roadmap:', error);
        // Set mock data for development if API fails
        if (process.env.NODE_ENV === 'development') {
          setRoadmapData([
            {
              id: 1,
              title: 'Level 1 - Huruf Hijaiyyah',
              description: 'Belajar huruf dasar Arab',
              status: 'active',
              sub_lessons: [
                { id: 1, title: 'Alif & Ba', status: 'completed' },
                { id: 2, title: 'Ta & Tha', status: 'active' },
                { id: 3, title: 'Jim & Ha', status: 'locked' }
              ]
            }
          ]);
          setExpandedLevel(1);
        }
      }
    };

    fetchRoadmap();
  }, []);

  // Update useEffect to fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem('userId') || '123'; // fallback for development
        if (!userId) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profile) {
          setProfileData(profile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Keep default profileData for development
        if (process.env.NODE_ENV === 'development') {
          setProfileData(prev => ({
            ...prev,
            full_name: 'Test User',
            level: 1,
            xp: 100,
            points: 250,
            streak: 3
          }));
        }
      }
    };

    fetchProfile();
  }, []);

  // Remove unused functions that are now in components
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/');
  };
  
 const dockItems = [
    { 
      title: "Dashboard", 
      icon: <img src="/icon/icons8-home-100.png" alt="Home" className="w-6 h-6" />, 
      href: '/dashboard/home/Dashboard'
    },
    { 
      title: "Huruf", 
      icon: <img src="/icon/icons8-scroll-100.png" alt="Huruf" className="w-6 h-6" />, 
      href: '/dashboard/DashboardHuruf'
    },
    { 
      title: "Belajar & Roadmap", 
      icon: <img src="/icon/icons8-course-assign-100.png" alt="Belajar" className="w-6 h-6" />, 
      href: '/dashboard/DashboardBelajar'
    },
    {
      title: "Toko",
      icon: <img src="/icon/icons8-shopping-cart-100.png" alt="Toko" className="w-6 h-6" />,
      href: '/dashboard/toko/DashboardShop'
    },
    { 
      title: "Pengaturan", 
      icon: <img src="/icon/setting.png" alt="Pengaturan" className="w-6 h-6" />, 
      href: '/dashboard/setting/DashboardSettings'
    },
  ];

  // Add new state for leaderboard data
  const [leaderboardData, setLeaderboardData] = useState([
    { id: 1, name: "Ahmad Fauzi", points: 1250, streak: 14, level: 5, badge: "Expert" },
    { id: 2, name: "Siti Aminah", points: 980, streak: 10, level: 4, badge: "Advanced" },
    { id: 3, name: "Muhammad Rizki", points: 870, streak: 7, level: 4, badge: "Advanced" },
    { id: 4, name: "Fatimah Zahra", points: 760, streak: 5, level: 3, badge: "Intermediate" },
    { id: 5, name: "Abdullah Hasan", points: 650, streak: 3, level: 3, badge: "Intermediate" }
  ]);

  // Add new state for recent activities
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      user: "Ahmad Fauzi",
      action: "menyelesaikan",
      target: "Kelas Tajwid Lanjutan",
      time: "5 menit yang lalu",
      type: "completion"
    },
    {
      id: 2,
      user: "Siti Aminah",
      action: "mendapatkan badge",
      target: "Konsisten 10 Hari",
      time: "15 menit yang lalu",
      type: "achievement"
    },
    {
      id: 3,
      user: "Muhammad Rizki",
      action: "mencapai level",
      target: "Level 4",
      time: "1 jam yang lalu",
      type: "level-up"
    }
  ]);

  // Add new state for user ranking
  const [userRanking, setUserRanking] = useState({
    rank: 8,
    points: 580,
    level: 2,
    badge: "Beginner",
    streak: 2,
    isEligible: false
  });

  // Handler untuk update energy
  const handleEnergyUpdate = (newEnergy) => {
    setProfileData(prev => ({
      ...prev,
      energy: newEnergy
    }));
  };

  // Listen for energy updates from other components
  useEffect(() => {
    const handleCustomEnergyUpdate = (e) => {
      console.log('DashboardBelajar: Custom energy update event:', e.detail);
      if (e.detail && e.detail.newEnergy !== undefined) {
        handleEnergyUpdate(e.detail.newEnergy);
      }
    };

    window.addEventListener('energyUpdated', handleCustomEnergyUpdate);

    return () => {
      window.removeEventListener('energyUpdated', handleCustomEnergyUpdate);
    };
  }, []);

  const handleStartLesson = (levelId, subLessonId) => {
    router.push(`/dashboard/lesson/${levelId}/${subLessonId}`);
  };

  return (
    <div className="bg-blue-50 min-h-screen font-['Poppins']">
      <Head>
        <title>Belajar & Roadmap - Ma'ruf</title>
        <meta name="description" content="Roadmap pembelajaran Al-Qur'an" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header 
        userName={profileData.full_name || userName}
        profileData={profileData}
        onLogout={handleLogout}
        onProfileUpdate={(updatedProfile) => setProfileData(updatedProfile)}
      />

      <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-8 pb-24">
        {/* Enhanced Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg border border-blue-100 mb-8 overflow-hidden"
        >
          <div className="relative">
            <div className="flex flex-wrap">
              <motion.button
                onClick={() => setActiveTab('roadmap')}
                className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'roadmap' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconBook size={20} />
                <span className="font-['Poppins']">Roadmap</span>
                {activeTab === 'roadmap' && (
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
                <IconUsers size={20} />
                <span className="font-['Poppins']">Kelas Tersedia</span>
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
                onClick={() => setActiveTab('riwayat')}
                className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'riwayat' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconHistory size={20} />
                <span className="font-['Poppins']">Riwayat Belajar</span>
                {activeTab === 'riwayat' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
              
              <motion.button
                onClick={() => setActiveTab('leaderboard')}
                className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'leaderboard' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconTrophy size={20} />
                <span className="font-['Poppins']">Leaderboard</span>
                {activeTab === 'leaderboard' && (
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
                <span className="font-['Poppins']">Event</span>
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
        </motion.div>

        {/* Enhanced Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden"
        >
          <div className="p-8">
            <MainContent
              activeTab={activeTab}
              roadmapData={roadmapData}
              expandedLevel={expandedLevel}
              setExpandedLevel={setExpandedLevel}
              handleStartLesson={handleStartLesson}
              userProfile={profileData}
              onEnergyUpdate={handleEnergyUpdate}
            />
          </div>
        </motion.div>
      </main>
      
      {/* Daily Challenge Floating Card - positioned higher */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{ position: 'fixed', bottom: '140px', right: '16px', zIndex: 50 }}
      >
        <DailyChallenge />
      </motion.div>

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}