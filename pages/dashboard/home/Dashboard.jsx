import { IconBook, IconCalendar, IconCoin, IconHome, IconLetterA, IconSettings, IconTrophy } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import EnergyDialog from '../../../components/dialog/EnergyDialog';
import LogoutDialog from '../../../components/dialog/LogoutDialog';
import { StreakDialog } from '../../../components/dialog/StreakDialog';
import WelcomeDialog from '../../../components/dialog/WelcomeDialog';
import Header from '../../../components/Header';
import { FloatingDock } from '../../../components/ui/floating-dock';
import Avatar from '../../../components/widget/avatar';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import CalendarActivity from './CalendarActivity';

export default function Dashboard() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
const [lastLogin, setLastLogin] = useState(null);
  const welcomeShownKey = 'welcomeDialogShown'; // Untuk menandai apakah dialog sudah ditampilkan
  const maxWelcomeAttempts = 1; // Maksimal tampilan dialog
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showStreakDialog, setShowStreakDialog] = useState(false);
  const [showEnergyDialog, setShowEnergyDialog] = useState(false);
  const [isStreakBroken, setIsStreakBroken] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [streakBroken, setStreakBroken] = useState(false);
  const [lastLoginDate, setLastLoginDate] = useState(null);
  const [streakData, setStreakData] = useState({ count: 0, broken: false }); 
  const [profileData, setProfileData] = useState({
    id: null,
    full_name: '',
    email: '',
    level: 1,
    xp: 0,
    points: 0,
    streak: 0,
    level_description: 'Pemula',
    energy: 5,
    is_admin: false,
    admin_id: null,
    role: 'student',
    created_at: null,
    updated_at: null
  });
  
  // Add countdown state for streak reset
  const [streakCountdown, setStreakCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

    useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const wibOffset = 7; // UTC+7
      const nowWIB = new Date(now.getTime() + (wibOffset * 60 * 60 * 1000));
      
      // Set next 11 AM WIB
      const next11AM = new Date(nowWIB);
      next11AM.setHours(11, 0, 0, 0);
      
      // If current time is past 11 AM, set for next day
      if (nowWIB.getHours() >= 11) {
        next11AM.setDate(next11AM.getDate() + 1);
      }
      
      const timeLeft = next11AM.getTime() - nowWIB.getTime();
      
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        setStreakCountdown({ hours, minutes, seconds });
      } else {
        setStreakCountdown({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

const updateStreak = async (userId) => {
  try {
    console.log('🔥 Updating streak for user:', userId);
    const response = await fetch('/api/update-streak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    console.log('🔥 Streak update response:', data);

    if (data.success) {
      // Update profileData dengan data terbaru
      setProfileData((prev) => ({
        ...prev,
        streak: data.data.streak,
        updated_at: new Date().toISOString(),
      }));

      // Update streakData untuk dialog
      setUserStreak(data.data.streak); // ✅ Update userStreak
      setIsStreakBroken(data.data.streakBroken);
      setLastLoginDate(new Date().toISOString()); // ✅ Update lastLoginDate

      // Tampilkan dialog jika bukan "already logged in today"
      if (!data.alreadyLoggedInToday || data.data.streak === 1) {
        console.log('🔥 Showing streak dialog - Count:', data.data.streak, 'Broken:', data.data.streakBroken);
        setTimeout(() => {
          setShowStreakDialog(true);
        }, 1000); // Delay sedikit untuk memastikan data sudah ter-set
      } else {
        console.log('🔥 Already logged in today, no dialog shown');
      }

      return data.data;
    } else {
      console.error('Failed to update streak:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
};
  

// Panggil updateStreak saat login atau setiap hari
useEffect(() => {
  if (user && user.id) {
    updateStreak(user.id);
  }
}, [user]);

  // Calculate countdown for next day reset (11 AM WIB)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const wibOffset = 7; // UTC+7
      const nowWIB = new Date(now.getTime() + (wibOffset * 60 * 60 * 1000));
      
      // Set next 11 AM WIB
      const next11AM = new Date(nowWIB);
      next11AM.setHours(11, 0, 0, 0);
      
      // If current time is past 11 AM, set for next day
      if (nowWIB.getHours() >= 11) {
        next11AM.setDate(next11AM.getDate() + 1);
      }
      
      const timeLeft = next11AM.getTime() - nowWIB.getTime();
      
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        setStreakCountdown({ hours, minutes, seconds });
      } else {
        setStreakCountdown({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Update immediately and then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);
  
  // Simplified auth check
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        console.log('Not authenticated, redirecting to login');
        router.replace('/authentication/login');
        return;
      }
      
      // User is authenticated, initialize dashboard
      const initializeDashboard = async () => {
        try {
          setIsLoading(true);
          await fetchProfileData(user.id);
        } catch (error) {
          console.error('Error initializing dashboard:', error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeDashboard();
    }
  }, [user, loading, isAuthenticated, router]);

  // Simplified profile data fetching to avoid policy issues
  const fetchProfileData = async (userId) => {
    try {
      console.log('Fetching profile for user ID:', userId); // Debug log
      
      // Try with minimal select to avoid policy issues - include full_name
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, level, xp, points, streak, level_description, energy, is_admin, role')
        .eq('id', userId)
        .single();

      console.log('Profile data from Supabase:', profile); // Debug log
      console.log('Profile error:', error); // Debug log

      if (error) {
        console.error('Error fetching profile data:', error);
        // Fallback to default profile if database error
        const fallbackProfile = {
          id: userId,
          full_name: 'User', // Default fallback
          email: user?.email || '',
          level: 1,
          xp: 0,
          points: 0,
          streak: 0,
          level_description: 'Pemula',
          energy: 5,
          is_admin: false,
          role: 'student'
        };
        setProfileData(fallbackProfile);
        setUserName('User');
        return;
      }

      if (profile) {
        console.log('Setting profile data:', profile); // Debug log
        console.log('Full name from database:', profile.full_name); // Debug log

        
        
        // Set profile data first
        setProfileData(profile);
        
        // ALWAYS prioritize full_name from database, never use email
        if (profile.full_name && profile.full_name.trim()) {
          console.log('Using full_name from database:', profile.full_name); // Debug log
          setUserName(profile.full_name.trim());
        } else {
          console.log('No full_name found, using fallback'); // Debug log
          setUserName('User');
        }
        
        // Handle daily tasks
        await handleDailyTasks(userId);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Use fallback profile on any error
      const fallbackProfile = {
        id: userId,
        full_name: 'User',
        email: user?.email || '',
        level: 1,
        xp: 0,
        points: 0,
        streak: 0,
        level_description: 'Pemula',
        energy: 5,
        is_admin: false,
        role: 'student'
      };
      setProfileData(fallbackProfile);
      setUserName('User');
    }
  };

  // Add missing handleProfileUpdate function
  const handleProfileUpdate = (updatedProfile) => {
    console.log('Updating profile:', updatedProfile); // Debug log
    setProfileData(updatedProfile);
    
    // ALWAYS prioritize full_name from updated profile
    if (updatedProfile.full_name && updatedProfile.full_name.trim()) {
      console.log('Using updated full_name:', updatedProfile.full_name); // Debug log
      setUserName(updatedProfile.full_name.trim());
    } else {
      setUserName('User');
    }
    
    // Update cache
    if (user?.id) {
      sessionStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
    }
  };

   const handleDailyTasks = async (userId) => {
    try {
      console.log('🔥 Handling daily tasks for user:', userId);
      
      const lastEnergyKey = `lastEnergy_${userId}`;
      const lastEnergyDate = localStorage.getItem(lastEnergyKey);
      const today = new Date().toDateString();

      const lastStreakKey = `lastStreak_${userId}`;
      const lastStreakDate = localStorage.getItem(lastStreakKey);

      console.log('🔥 Last streak date:', lastStreakDate, 'Today:', today);

      // ✅ Update streak terlebih dahulu, lalu cek apakah perlu tampilkan dialog
      if (lastStreakDate !== today) {
        console.log('🔥 New day detected, updating streak...');
        
        // Update streak di database
        const streakResult = await updateStreak(userId);
        
        if (streakResult) {
          // Set localStorage setelah berhasil update
          localStorage.setItem(lastStreakKey, today);
          console.log('🔥 Streak updated successfully');
        }
      } else {
        console.log('🔥 Already updated streak today');
      }
      
      // Handle energy update
      if (lastEnergyDate !== today) {
        localStorage.setItem(lastEnergyKey, today);
        await updateEnergy(userId, 2);
        setTimeout(() => setShowEnergyDialog(true), 2000);
      }
    } catch (error) {
      console.error('Error handling daily tasks:', error);
    }
  };

  // Simplified energy update to avoid policy issues
  const updateEnergy = async (userId, addedEnergy = 2) => {
    try {
      // Skip database update if there are policy issues
      // Just update local state for now
      setProfileData(prev => ({
        ...prev,
        energy: Math.min(prev.energy + addedEnergy, 10)
      }));
    } catch (error) {
      console.error('Error updating energy:', error);
    }
  };
  // Add new useEffect to handle welcome dialog
useEffect(() => {
    const checkWelcomeDialog = async () => {
      const lastWelcomeKey = 'lastWelcomeShown';
      const welcomeShownKey = 'welcomeDialogShown';
      const lastWelcome = localStorage.getItem(lastWelcomeKey);
      const welcomeShown = localStorage.getItem(welcomeShownKey);
      const today = new Date().toDateString();

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        if (welcomeShown === 'true') {
          setIsModalOpen(false);
          return;
        }

        if (lastWelcome !== today) {
          setIsModalOpen(true);
          localStorage.setItem(lastWelcomeKey, today);
          localStorage.setItem(welcomeShownKey, 'true');
        } else {
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error('Error checking welcome dialog:', error);
      }
    };

    checkWelcomeDialog();
  }, []);
  
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

  // Enhanced logout handler
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutLoading(true);
      setShowLogoutDialog(false);
      
      // Use the signOut from AuthContext
      await signOut();
      
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Terjadi kesalahan saat logout. Silakan coba lagi.');
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen font-inter antialiased">
      <Head>
        <title>Dashboard Pembelajaran • Makhrojul Huruf</title>
        <meta name="description" content="Platform pembelajaran makhrojul huruf interaktif dengan progress tracking" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      
<WelcomeDialog
  isOpen={isModalOpen}
  setIsOpen={setIsModalOpen}
  userName={userName}
/>
      
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-screen bg-white">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">Memuat Dashboard</h3>
            <p className="text-sm text-gray-500">Sedang menyiapkan data pembelajaran Anda...</p>
          </div>
        </div>
      ) : (
        <>
          <Header 
            userName={userName}
            profileData={profileData}
            onLogout={handleLogout}
            onProfileUpdate={handleProfileUpdate}
          />
          
          <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-16 pb-32 space-y-20">

            {/* Avatar Section - Improved with better interaction feedback */}
            <motion.section 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              <div 
                className="relative group cursor-pointer"
                onClick={() => {
                  localStorage.setItem('settingsTab', 'inventory');
                  router.push('/dashboard/setting/DashboardSettings');
                }}
              >
                {/* Enhanced glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-blue-400/30 rounded-full blur-2xl group-hover:blur-3xl opacity-60 group-hover:opacity-80 transition-all duration-700"></div>
                
                {/* Avatar container with better scaling */}
                <div className="relative transform scale-150 group-hover:scale-[1.65] transition-all duration-500 ease-out">
                  <Avatar 
                    imageUrl="/img/avatar_default.png"
                    alt="Karakter Pembelajaran"
                    size="lg"
                    borderColor="indigo"
                    badge="award"
                  />
                </div>
                
                {/* Enhanced tooltip */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl whitespace-nowrap shadow-lg">
                    <span className="font-medium">Kustomisasi Avatar</span>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </motion.section>
            
            {/* Statistics Cards - Enhanced with better visual hierarchy and spacing */}
            <motion.section 
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="space-y-12"
            >
              {/* Section Header with improved typography */}
              <div className="text-center space-y-4">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="text-3xl lg:text-4xl font-bold text-gray-900"
                >
                  Ringkasan Pembelajaran
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
                >
                  Pantau progres dan pencapaian pembelajaran makhrojul huruf Anda
                </motion.p>
              </div>
              
              {/* Enhanced Cards Grid with better spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Card 1 - Letters Progress */}
                <motion.div 
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-3 relative overflow-hidden"
                >
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <IconLetterA size={28} />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Progress</div>
                        <div className="text-2xl font-bold text-gray-900">43%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900">Huruf Dipelajari</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">Penguasaan huruf hijaiyah dan makhrojnya</p>
                      
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900">12</span>
                        <span className="text-2xl text-gray-400 font-medium mb-1">/28</span>
                      </div>
                      
                      {/* Enhanced progress bar */}
                      <div className="space-y-2">
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '43%' }}
                            transition={{ delay: 1.6, duration: 1.2, ease: "easeOut" }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full shadow-sm relative"
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Pemula</span>
                          <span>Target: 28 huruf</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Card 2 - Level Progress */}
                <motion.div 
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 transform hover:-translate-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <IconTrophy size={28} />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wide">
                          {profileData.level_description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900">Level Pembelajaran</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">Tingkat kemampuan dan penguasaan materi</p>
                      
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900">{profileData.level}</span>
                        <span className="text-lg text-gray-500 font-medium mb-2">/ 10</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }}
                            transition={{ delay: 1.7, duration: 1.2, ease: "easeOut" }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full shadow-sm relative"
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Menuju level berikutnya</span>
                          <span>65% progress</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Card 3 - Streak Progress */}
                <motion.div 
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-3 relative overflow-hidden md:col-span-2 xl:col-span-1"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-violet-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <IconCalendar size={28} />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wide">
                          Konsisten
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900">Streak Belajar</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">Konsistensi pembelajaran harian Anda</p>
                      
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900">{profileData.streak}</span>
                        <span className="text-lg text-gray-500 font-medium mb-2">hari</span>
                      </div>
                      
                      {/* Enhanced streak visualization */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          {[...Array(7)].map((_, i) => (
                            <motion.div 
                              key={i}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 1.8 + (i * 0.1), duration: 0.4, ease: "easeOut" }}
                              className={`flex-1 h-4 rounded-lg transition-all duration-300 ${
                                i < (profileData.streak % 7) 
                                  ? 'bg-gradient-to-t from-purple-500 to-violet-600 shadow-sm transform hover:scale-105' 
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            ></motion.div>
                          ))}
                        </div>
                        
                        {/* Daily Reset Countdown */}
                        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-700 font-medium">Reset harian dalam:</span>
                            <div className="flex items-center gap-1 font-mono text-purple-800">
                              <span className="bg-purple-200 px-2 py-1 rounded text-xs font-bold">
                                {String(streakCountdown.hours).padStart(2, '0')}
                              </span>
                              <span className="text-purple-600">:</span>
                              <span className="bg-purple-200 px-2 py-1 rounded text-xs font-bold">
                                {String(streakCountdown.minutes).padStart(2, '0')}
                              </span>
                              <span className="text-purple-600">:</span>
                              <span className="bg-purple-200 px-2 py-1 rounded text-xs font-bold">
                                {String(streakCountdown.seconds).padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-purple-600">
                            Pastikan belajar sebelum waktu reset untuk mempertahankan streak!
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Minggu ini</span>
                          <span>🔥 Terus pertahankan!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            <div className="mt-4">
  <button
    onClick={() => {
  isOpen={dialogOpen}
  setIsOpen={setDialogOpen}
  streakCount={streak}
  
    }}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  >
    Test Streak Dialog
  </button>
</div>

            {/* Activity Calendar - Now using the separated component */}
            <CalendarActivity profileData={profileData} />
          </main>
          
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
        </>
      )}
      
      <LogoutDialog 
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        isLoading={logoutLoading}
      />

<StreakDialog
  isOpen={showStreakDialog}
  setIsOpen={setShowStreakDialog}
  streakCount={userStreak}
  isStreakBroken={streakBroken}
  onStreakUpdate={(newStreak, lastLoginDate) => {
    setUserStreak(newStreak); // Update streak di parent component
    setLastLoginDate(lastLoginDate); // Update tanggal login terakhir
  }}
/>

      <EnergyDialog 
        isOpen={showEnergyDialog}
        setIsOpen={setShowEnergyDialog}
        currentEnergy={profileData.energy}
        addedEnergy={2}
        onClaim={(newEnergy) => {
          setProfileData(prev => ({
            ...prev,
            energy: newEnergy
          }));
          // Notify other components
          window.dispatchEvent(new CustomEvent('energyUpdated', {
            detail: { newEnergy }
          }));
        }}
      />

    </div>
  );
}

// Add custom animations for floating elements
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(180deg); }
  }
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(-180deg); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-float-delayed {
    animation: float-delayed 8s ease-in-out infinite;
    animation-delay: 2s;
  }
  .font-inter {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
`;