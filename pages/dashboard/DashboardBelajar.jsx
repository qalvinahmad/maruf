import { IconBook, IconCoin, IconHome, IconLetterA, IconSettings } from '@tabler/icons-react';
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
import TabNavLearning from '../../components/learning/TabNavLearning';
import { FloatingDock } from '../../components/ui/floating-dock';
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
  }
  
  // Tambahkan komponen lain sesuai tab jika diperlukan
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
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Ambil data user dari localStorage
    setUserName(localStorage.getItem('userName') || 'Pengguna');
  }, [router]);

  useEffect(() => {
    const fetchRoadmap = async () => {
      const userId = localStorage.getItem('userId');
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
      }
    };

    fetchRoadmap();
  }, []);

  // Update useEffect to fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
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
      icon: <IconHome />, 
      onClick: () => router.push('/dashboard/home/Dashboard')
    },
    { 
      title: "Huruf", 
      icon: <IconLetterA />, 
      onClick: () => router.push('/dashboard/DashboardHuruf')
    },
    { 
      title: "Belajar & Roadmap", 
      icon: <IconBook />, 
      onClick: () => router.push('/dashboard/DashboardBelajar')
    },
    {
      title: "Toko",
      icon: <IconCoin />,
      onClick: () => router.push('/dashboard/toko/DashboardShop')
    },
    { 
      title: "Pengaturan", 
      icon: <IconSettings />, 
      onClick: () => router.push('/dashboard/setting/DashboardSettings')
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
    <div className="bg-gray-50 min-h-screen font-poppins">
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <TabNavLearning activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
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
      </div>
      
      {/* Daily Challenge Floating Card - positioned higher */}
      <div style={{ position: 'fixed', bottom: '140px', right: '16px', zIndex: 50 }}>
        <DailyChallenge />
      </div>
      
      {/* Mini Games Floating Button - positioned lower */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          console.log('Navigating to mini games...');
          router.push('/dashboard/mini-games/MiniGames');
        }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/30 backdrop-blur-sm"
        title="Mini Games"
      >
        <div className="relative">
          {/* Game controller icon - using proper SVG */}
          <svg className="w-7 h-7 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 9h2v2H6V9zm0 4h2v2H6v-2zm8-4h2v2h-2V9zm0 4h2v2h-2v-2zm-4.5-7C4.84 2 2 4.84 2 8.5S4.84 15 9.5 15s7.5-2.84 7.5-6.5S14.16 2 9.5 2zm0 11C6.46 13 4 10.54 4 7.5S6.46 2 9.5 2s5.5 2.46 5.5 5.5S12.54 13 9.5 13z"/>
            <path d="M17 6h3v2h-3V6zm0 4h3v2h-3v-2z"/>
          </svg>
          
          {/* Game sparkle effect */}
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        {/* Pulse ring animation */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-green-300"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>
      
  {/* Enhanced FloatingDock with better positioning and styling */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl">
              <FloatingDock items={dockItems} />
            </div>
          </div>
          </motion.div>
    </div>
  );
}