import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Dock } from '../../../components/ui/dock';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { handleRouterError, registerChunkServiceWorker, withChunkRetry } from '../../../utils/chunkRetry';

// Dynamic imports to prevent chunk loading issues with retry logic
import dynamic from 'next/dynamic';

// Dynamically import components with chunk retry to avoid chunk loading issues
const LogoutDialog = dynamic(() => withChunkRetry(() => import('../../../components/dialog/LogoutDialog'))(), { 
  ssr: false,
  loading: () => <div>Loading...</div>
});

const WelcomeDialog = dynamic(() => withChunkRetry(() => import('../../../components/dialog/WelcomeDialog'))(), { 
  ssr: false,
  loading: () => <div>Loading...</div>
});

const Header = dynamic(() => withChunkRetry(() => import('../../../components/Header'))(), { 
  ssr: false,
  loading: () => <div className="h-16 bg-gray-100 animate-pulse"></div>
});

const FloatingDock = dynamic(() => withChunkRetry(() => import('../../../components/ui/floating-dock').then(mod => ({ default: mod.FloatingDock })))(), { 
  ssr: false,
  loading: () => <div>Loading...</div>
});

const CalendarActivity = dynamic(() => withChunkRetry(() => import('./CalendarActivity'))(), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
});

const AvatarSection = dynamic(() => withChunkRetry(() => import('../../../components/dashboard/AvatarSection'))(), { 
  ssr: false,
  loading: () => <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
});

const StatisticsCards = dynamic(() => withChunkRetry(() => import('../../../components/dashboard/StatisticsCards'))(), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
});

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Terjadi kesalahan</h2>
            <p className="text-gray-600 mb-6">Silakan refresh halaman atau coba lagi nanti.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated, signOut } = useAuth();
  
  // Hanya menampilkan WelcomeDialog saja - tidak ada StreakDialog atau EnergyDialog otomatis
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  
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

  // Register service worker for chunk fallback
  useEffect(() => {
    registerChunkServiceWorker();
  }, []);

  // Add router error handling for chunk loading issues
  useEffect(() => {
    const handleRouteChangeError = (err) => {
      try {
        handleRouterError(err);
      } catch (error) {
        console.error('Router error:', error);
      }
    };

    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

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
          energy: data.data.energy || prev.energy,
          updated_at: new Date().toISOString(),
        }));


        // Return data for dialog checking
        return {
          streak: data.data.streak,
          streakBroken: data.data.streakBroken,
          alreadyLoggedInToday: data.alreadyLoggedInToday,
          energyAdded: data.data.energyAdded || 0,
          energy: data.data.energy
        };
      } else {
        console.error('🔥 Streak update failed:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  };

// Panggil updateStreak saat login untuk update data saja, tanpa dialog
useEffect(() => {
  if (user && user.id) {
    console.log('🚀 useEffect triggered for updateStreak, user ID:', user.id);
    updateStreak(user.id).then(() => {
      console.log('🚀 updateStreak completed - no dialogs will be shown');
    });
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
        
        // Hanya panggil updateStreak, energy akan otomatis bertambah dari sana
        if (userId) {
          console.log('Profile data loaded, updateStreak will be called by useEffect');
          // updateStreak akan dipanggil oleh useEffect yang sudah ada
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

  // Handle dialog close untuk menyimpan status yang sudah ditampilkan
  const handleDialogClose = (dialogType) => {
    const today = new Date().toDateString();
    
    switch (dialogType) {
      case 'welcome':
        localStorage.setItem('lastWelcomeShown', today);
        break;
      default:
        break;
    }
  };

  // Function untuk WelcomeDialog - hanya ini yang ditampilkan setiap login
  const checkWelcomeDialog = () => {
    try {
      if (!user?.id) return;
      
      const today = new Date().toDateString();
      const lastWelcomeKey = 'lastWelcomeShown';
      const lastWelcome = localStorage.getItem(lastWelcomeKey);

      console.log('🏠 Checking welcome dialog for:', today);
      console.log('🏠 Last welcome shown:', lastWelcome);
      
      // Show welcome dialog jika belum ditampilkan hari ini
      if (lastWelcome !== today) {
        console.log('🏠 Showing welcome dialog - New day or first visit');
        setTimeout(() => {
          setIsModalOpen(true);
        }, 1000);
      } else {
        console.log('🏠 Welcome dialog already shown today');
      }
    } catch (error) {
      console.error('Error checking welcome dialog:', error);
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

  // Tampilkan welcome dialog setiap kali user login kembali
  useEffect(() => {
    if (user?.id && !isLoading) {
      checkWelcomeDialog();
    }
  }, [user?.id, isLoading]);
  
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
    <ErrorBoundary>
      <React.Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen font-['Poppins'] antialiased">
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
            <div className="flex flex-col justify-center items-center h-screen bg-white font-['Poppins']">
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animate-reverse"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 font-['Poppins']">Memuat Dashboard</h3>
                <p className="text-sm text-gray-500 font-['Poppins']">Sedang menyiapkan data pembelajaran Anda...</p>
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
               <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                 <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl">
                   <Dock items={dockItems} />
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
        </div>
      </React.Suspense>
    </ErrorBoundary>
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