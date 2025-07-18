import { IconBook, IconCoin, IconHome, IconLetterA, IconSettings } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
// import EnergyDialog from '../../../components/dialog/EnergyDialog'; // DINONAKTIFKAN - Energy auto dari streak
import LogoutDialog from '../../../components/dialog/LogoutDialog';
import { StreakDialog } from '../../../components/dialog/StreakDialog';
import WelcomeDialog from '../../../components/dialog/WelcomeDialog';
import Header from '../../../components/Header';
import { FloatingDock } from '../../../components/ui/floating-dock';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import CalendarActivity from './CalendarActivity';

// Import separated components
import AvatarSection from '../../../components/dashboard/AvatarSection';
import StatisticsCards from '../../../components/dashboard/StatisticsCards';
// import { useDailyDialogs } from '../../../hooks/useDailyDialogs'; // DINONAKTIFKAN - Energy sekarang auto dari streak

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated, signOut } = useAuth();
  
  // TIDAK MENGGUNAKAN useDailyDialogs lagi - hanya streak dialog manual
  const [showStreakDialog, setShowStreakDialog] = useState(false);
  // const [showEnergyDialog, setShowEnergyDialog] = useState(false); // DINONAKTIFKAN
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [streakBroken, setStreakBroken] = useState(false);
  const [isStreakBroken, setIsStreakBroken] = useState(false);
  const [lastLoginDate, setLastLoginDate] = useState(null);
  
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
  
  const [streakCountdown, setStreakCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Handler for dialog close events
  const handleDialogClose = (dialogType) => {
    console.log(`Closing ${dialogType} dialog`);
    // Additional cleanup if needed for specific dialog types
    switch (dialogType) {
      case 'welcome':
        // Welcome dialog specific cleanup
        break;
      case 'streak':
        // Streak dialog specific cleanup
        break;
      case 'energy':
        // Energy dialog specific cleanup
        break;
      default:
        break;
    }
  };

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

        // ✅ Update energy jika tersedia dari response
        if (data.data.energy !== undefined) {
          setProfileData(prev => ({
            ...prev,
            energy: data.data.energy
          }));
          console.log('🔋 Energy updated from streak API:', data.data.energy);
        }

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
        
        // DINONAKTIFKAN - handleDailyTasks karena energy sekarang auto dari streak
        // await handleDailyTasks(userId, updateStreak, updateEnergy);
        
        // Hanya panggil updateStreak, energy akan otomatis bertambah dari sana
        if (userId) {
          updateStreak(userId);
        }
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

  // Simplified energy update - TIDAK DIGUNAKAN LAGI karena energy auto update dari streak API
  const updateEnergy = async (userId, addedEnergy = 2) => {
    try {
      console.log('Energy auto-update now handled by streak API, skipping manual update');
      // Energy sekarang otomatis bertambah +1 setiap hari melalui update-streak API
      // Jadi function ini tidak perlu melakukan database update lagi
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

  // Handler untuk update energy dari komponen lain
  const handleEnergyUpdate = (newEnergy) => {
    setProfileData(prev => ({
      ...prev,
      energy: newEnergy
    }));
  };

  // Listen for energy updates from other components
  useEffect(() => {
    const handleCustomEnergyUpdate = (e) => {
      console.log('Dashboard: Custom energy update event:', e.detail);
      if (e.detail && e.detail.newEnergy !== undefined) {
        handleEnergyUpdate(e.detail.newEnergy);
      }
    };

    window.addEventListener('energyUpdated', handleCustomEnergyUpdate);

    return () => {
      window.removeEventListener('energyUpdated', handleCustomEnergyUpdate);
    };
  }, []);

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
        setIsOpen={(open) => {
          setIsModalOpen(open);
          if (!open) {
            handleDialogClose('welcome');
          }
        }}
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
          {/* Full-width Header */}
          <Header 
            userName={userName}
            profileData={profileData}
            onLogout={handleLogout}
            onProfileUpdate={handleProfileUpdate}
          />
          
          {/* Main Content Container */}
          <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-16 pb-32 space-y-20">
            {/* Avatar Section */}
            <AvatarSection profileData={profileData} />
            
            {/* Statistics Cards */}
            <StatisticsCards 
              profileData={profileData} 
              streakCountdown={streakCountdown} 
            />

            {/* Activity Calendar */}
            <CalendarActivity profileData={profileData} />
          </main>
          
          {/* Enhanced FloatingDock */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl">
              <FloatingDock items={dockItems} />
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
        setIsOpen={(open) => {
          setShowStreakDialog(open);
          if (!open) {
            handleDialogClose('streak');
          }
        }}
        streakCount={userStreak}
        isStreakBroken={streakBroken}
        onStreakUpdate={(newStreak, lastLoginDate) => {
          setUserStreak(newStreak);
          setLastLoginDate(lastLoginDate);
        }}
      />

      {/* EnergyDialog DINONAKTIFKAN - Energy sekarang otomatis bertambah +1 setiap hari melalui streak system */}
      {/* 
      <EnergyDialog 
        isOpen={showEnergyDialog}
        setIsOpen={(open) => {
          setShowEnergyDialog(open);
          if (!open) {
            handleDialogClose('energy');
          }
        }}
        currentEnergy={profileData.energy}
        addedEnergy={2}
        onClaim={(newEnergy) => {
          setProfileData(prev => ({
            ...prev,
            energy: newEnergy
          }));
          window.dispatchEvent(new CustomEvent('energyUpdated', {
            detail: { newEnergy }
          }));
        }}
      />
      */}
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