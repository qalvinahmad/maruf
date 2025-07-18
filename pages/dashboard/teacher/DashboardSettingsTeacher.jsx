import { IconActivity, IconChartBar, IconInfoCircle, IconKey, IconLanguage, IconLock, IconMoon, IconPalette, IconSettings, IconShield, IconSun, IconUserCircle, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import HeaderTeacher from '../../../components/layout/HeaderTeacher';
import { FloatingDock } from '../../../components/ui/floating-dock';
import { generateOTP, verifyOTP } from '../../../lib/otpUtils';
import { supabase } from '../../../lib/supabaseClient';


const DashboardSettingsTeacher = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  const [accentColor, setAccentColor] = useState('blue');
  const [userName, setUserName] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  // 2FA related states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('enable_2fa'); // 'enable_2fa' or 'disable_2fa'
  
  // Check authentication
  useEffect(() => {
    if (hasCheckedAuth) return; // Prevent re-execution
    
    const checkAuth = () => {
      console.log('=== DASHBOARD SETTINGS: Checking authentication ===');
      
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const isTeacher = localStorage.getItem('isTeacher') === 'true';
      const teacherEmail = localStorage.getItem('teacherEmail');
      
      console.log('Settings auth check:', { 
        isLoggedIn, 
        isTeacher, 
        teacherEmail: teacherEmail || 'null'
      });
      
      if (!isLoggedIn || !isTeacher || !teacherEmail) {
        console.log('❌ Not authenticated as teacher, redirecting to login...');
        // Add delay to prevent immediate redirect loop
        setTimeout(() => {
          window.location.replace('/authentication/teacher/loginTeacher');
        }, 500);
        return;
      }
      
      console.log('✅ Teacher authentication verified, loading settings...');
      setHasCheckedAuth(true);
    };
    
    checkAuth();
  }, [hasCheckedAuth]); // Only depend on hasCheckedAuth

  // Add fetchTeacherProfile function with better error handling
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
            status: 'verified',
            two_factor_enabled: false
          };
          setTeacherProfile(fallbackProfile);
          setIs2FAEnabled(false);
          return;
        }
        throw error;
      }
      
      setTeacherProfile(data);
      setIs2FAEnabled(data.two_factor_enabled || false);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      // Use localStorage as fallback
      const fallbackProfile = {
        full_name: localStorage.getItem('teacherName') || 'Guru',
        email: localStorage.getItem('teacherEmail') || '',
        institution: localStorage.getItem('teacherInstitution') || 'Belum ada',
        is_verified: true,
        status: 'verified',
        two_factor_enabled: false
      };
      setTeacherProfile(fallbackProfile);
      setIs2FAEnabled(false);
    }
  };

  useEffect(() => {
    if (!hasCheckedAuth) return; // Wait for auth check to complete
    
    setUserName(localStorage.getItem('teacherName') || localStorage.getItem('userName') || 'Guru');
    fetchTeacherProfile();
    
    // Cek preferensi tema dari localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);
    
    // Cek preferensi suara dari localStorage
    const savedSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    setSoundEnabled(savedSoundEnabled);
    
    // Cek warna aksen dari localStorage
    const savedAccentColor = localStorage.getItem('accentColor') || 'blue';
    setAccentColor(savedAccentColor);
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [hasCheckedAuth]); // Depend on auth check completion

  // 2FA Functions with Supabase OTP
  const generateOTPCode = async (purpose = 'enable_2fa') => {
    // Get user_id from Supabase auth or localStorage
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || localStorage.getItem('teacherUserId');
    
    if (!userId) {
      alert('User ID tidak ditemukan. Silakan login ulang.');
      return;
    }

    setIsGeneratingOTP(true);
    setOtpMessage('');
    setOtpPurpose(purpose);

    try {
      const result = await generateOTP(userId, purpose);
      
      if (result.success) {
        setShowOTPInput(true);
        if (result.email_sent) {
          setOtpMessage(`OTP telah dikirim ke email ${result.masked_email}. Periksa kotak masuk Anda.`);
        } else {
          // Fallback if email failed
          setOtpMessage(`OTP: ${result.otp_code || 'Gagal mengirim email, silakan coba lagi.'}`);
        }
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      alert('Gagal mengirim OTP. Silakan coba lagi.');
    } finally {
      setIsGeneratingOTP(false);
    }
  };

  const verifyOTPCode = async () => {
    if (!otpCode || otpCode.length !== 4) {
      alert('Masukkan kode OTP 4 digit yang valid.');
      return;
    }

    // Get user_id from Supabase auth or localStorage
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || localStorage.getItem('teacherUserId');
    
    if (!userId) {
      alert('User ID tidak ditemukan. Silakan login ulang.');
      return;
    }

    setIsVerifyingOTP(true);

    try {
      const action = otpPurpose === 'enable_2fa' ? 'enable' : 'disable';
      const result = await verifyOTP(userId, otpCode, action);
      
      if (result.success) {
        if (action === 'enable') {
          setIs2FAEnabled(true);
          alert('2FA berhasil diaktifkan! Akun Anda sekarang lebih aman.');
        } else {
          setIs2FAEnabled(false);
          alert('2FA berhasil dinonaktifkan.');
        }
        
        setShowOTPInput(false);
        setOtpCode('');
        setOtpMessage('');
        fetchTeacherProfile(); // Refresh profile
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert(error.message || 'Kode OTP tidak valid atau sudah kedaluwarsa.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handle2FAToggle = async () => {
    if (is2FAEnabled) {
      // Generate OTP for disabling 2FA
      if (confirm('Apakah Anda yakin ingin menonaktifkan 2FA? Ini akan mengurangi keamanan akun Anda.')) {
        await generateOTPCode('disable_2fa');
      }
    } else {
      // Generate OTP for enabling 2FA
      await generateOTPCode('enable_2fa');
    }
  };

  const cancelOTPProcess = () => {
    setShowOTPInput(false);
    setOtpCode('');
    setOtpMessage('');
  };

    
    const handleLogout = () => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      router.push('/');
    };
    
    const toggleDarkMode = () => {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      localStorage.setItem('darkMode', newDarkMode.toString());
      document.documentElement.classList.toggle('dark', newDarkMode);
      
      // Efek suara jika sound enabled
      if (soundEnabled) {
        const audio = new Audio('/audio/switch.mp3');
        audio.volume = 0.3;
        audio.play();
      }
    };
    
    const toggleSound = () => {
      const newSoundEnabled = !soundEnabled;
      setSoundEnabled(newSoundEnabled);
      localStorage.setItem('soundEnabled', newSoundEnabled.toString());
      
      // Efek suara jika mengaktifkan suara
      if (newSoundEnabled) {
        const audio = new Audio('/audio/switch.mp3');
        audio.volume = 0.3;
        audio.play();
      }
    };
    
    const changeAccentColor = (color) => {
      setAccentColor(color);
      localStorage.setItem('accentColor', color);
      
      // Efek suara jika sound enabled
      if (soundEnabled) {
        const audio = new Audio('/audio/click.mp3');
        audio.volume = 0.2;
        audio.play();
      }
    };
    
    // Update useEffect untuk menghapus fetchInventory
    useEffect(() => {
      const checkAuth = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn || isLoggedIn !== 'true') {
          router.push('/authentication/login');
          return;
        }
      };

      checkAuth();
      return () => {
        // Cleanup
      };
    }, [router]);

    // Modify useEffect to include fetchTeacherProfile
    useEffect(() => {
      // Fungsi untuk memuat inventory pengguna
      const loadUserInventory = () => {
        try {
          const savedInventory = localStorage.getItem('userInventory');
          const savedPoints = localStorage.getItem('userPoints');
          
          if (savedInventory) {
            setInventory(JSON.parse(savedInventory));
          }
          
          if (savedPoints) {
            setUserPoints(parseInt(savedPoints));
          }
        } catch (error) {
          console.error('Error loading user inventory:', error);
        }
      };
    
      // Check if user is logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (!isLoggedIn || isLoggedIn !== 'true') {
        router.push('/authentication/login');
        return;
      }
      
      setUserName(localStorage.getItem('userName') || 'Pengguna');
      
      // Load user inventory
      loadUserInventory();
      
      // Cek preferensi tema dari localStorage
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(savedDarkMode);
      document.documentElement.classList.toggle('dark', savedDarkMode);
      
      // Cek preferensi suara dari localStorage
      const savedSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
      setSoundEnabled(savedSoundEnabled);
      
      // Cek warna aksen dari localStorage
      const savedAccentColor = localStorage.getItem('accentColor') || 'blue';
      setAccentColor(savedAccentColor);
      
      // Fetch teacher profile
      fetchTeacherProfile();
      
      // Simulasi loading
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, [router]);
    
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
    
    // Animasi untuk tab content
    const tabVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
    };
    
    // Warna aksen yang tersedia
    const accentColors = [
      { name: 'blue', color: '#3b82f6', hoverColor: '#2563eb' },
      { name: 'purple', color: '#8b5cf6', hoverColor: '#7c3aed' },
      { name: 'green', color: '#10b981', hoverColor: '#059669' },
      { name: 'red', color: '#ef4444', hoverColor: '#dc2626' },
      { name: 'amber', color: '#f59e0b', hoverColor: '#d97706' },
      { name: 'pink', color: '#ec4899', hoverColor: '#db2777' },
      { name: 'cyan', color: '#06b6d4', hoverColor: '#0891b2' },
    ];
    
    const pageVariants = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    };
    
    // Add this animation variant definition
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.1,
          duration: 0.3
        }
      }),
      hover: {
        scale: 1.02,
        transition: {
          duration: 0.2
        }
      }
    };

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
        <Head>
          <title>Pengaturan Akun Guru | Belajar Makhraj</title>
          <meta name="description" content="Pengaturan akun guru dengan 2FA dan keamanan tambahan" />
        </Head>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <HeaderTeacher />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-8"
              >
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Pengaturan Akun Guru</h1>
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
                    <span className="font-medium">Halo, {userName}</span>
                  </div>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 h-fit`}
                >
                  <h2 className="text-xl font-bold mb-6">Menu Pengaturan</h2>
                  <nav className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('appearance')} 
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'appearance' ? `bg-${accentColor}-500 text-white` : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
                    >
                      <IconPalette size={20} />
                      <span>Tampilan</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('account')} 
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'account' ? `bg-${accentColor}-500 text-white` : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
                    >
                      <IconUserCircle size={20} />
                      <span>Akun</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('security')} 
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? `bg-${accentColor}-500 text-white` : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
                    >
                      <IconLock size={20} />
                      <span>Keamanan</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('language')} 
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'language' ? `bg-${accentColor}-500 text-white` : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
                    >
                      <IconLanguage size={20} />
                      <span>Bahasa</span>
                    </button>
                  </nav>
                </motion.div>
                
                {/* Content Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 lg:col-span-3`}
                >
                  <AnimatePresence mode="wait">
                    {activeTab === 'appearance' && (
                      <motion.div 
                        key="appearance"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h2 className="text-2xl font-bold mb-6">Pengaturan Tampilan</h2>
                        
                        <div className="space-y-8">
                          {/* Dark Mode Toggle */}
                          <motion.div 
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            whileHover="hover"
                            className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl transition-all`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {darkMode ? <IconMoon size={24} /> : <IconSun size={24} />}
                                <div>
                                  <h3 className="font-semibold text-lg">Mode Gelap</h3>
                                  <p className="text-sm opacity-70">Ubah tampilan aplikasi ke mode gelap</p>
                                </div>
                              </div>
                              <button 
                                onClick={toggleDarkMode}
                                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${darkMode ? `bg-${accentColor}-500` : 'bg-gray-300'}`}
                              >
                                <motion.div 
                                  className="bg-white w-5 h-5 rounded-full shadow-md"
                                  animate={{ x: darkMode ? 28 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </button>
                            </div>
                          </motion.div>
                          
                          {/* Sound Toggle */}
                          <motion.div 
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            whileHover="hover"
                            className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl transition-all`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {soundEnabled ? <IconVolume size={24} /> : <IconVolumeOff size={24} />}
                                <div>
                                  <h3 className="font-semibold text-lg">Efek Suara</h3>
                                  <p className="text-sm opacity-70">Aktifkan efek suara saat berinteraksi</p>
                                </div>
                              </div>
                              <button 
                                onClick={toggleSound}
                                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${soundEnabled ? `bg-${accentColor}-500` : 'bg-gray-300'}`}
                              >
                                <motion.div 
                                  className="bg-white w-5 h-5 rounded-full shadow-md"
                                  animate={{ x: soundEnabled ? 28 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </button>
                            </div>
                          </motion.div>
                          
                          {/* Accent Color */}
                          <motion.div 
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={2}
                            className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl transition-all`}
                          >
                            <h3 className="font-semibold text-lg mb-4">Warna Aksen</h3>
                            <div className="flex flex-wrap gap-3">
                              {accentColors.map((color) => (
                                <button
                                  key={color.name}
                                  onClick={() => changeAccentColor(color.name)}
                                  className={`w-10 h-10 rounded-full transition-transform ${accentColor === color.name ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                                  style={{ backgroundColor: color.color }}
                                  aria-label={`Warna ${color.name}`}
                                />
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                    
                    {activeTab === 'account' && (
                      <motion.div 
                        key="account"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h2 className="text-2xl font-bold mb-6">Pengaturan Akun</h2>
                        <div className="space-y-6">
                          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl`}>
                            <h3 className="font-semibold text-lg mb-4">Informasi Profil</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Nama Pengguna</label>
                                <input 
                                  type="text" 
                                  value={userName}
                                  onChange={(e) => setUserName(e.target.value)}
                                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input 
                                  type="email" 
                                  value="user@example.com" 
                                  disabled
                                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} opacity-70`}
                                />
                              </div>
                              <button className={`px-4 py-2 rounded-lg bg-${accentColor}-500 text-white hover:bg-${accentColor}-600 transition-colors`}>
                                Simpan Perubahan
                              </button>
                            </div>
                          </div>

                          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <IconShield size={24} className={`text-${accentColor}-500`} />
                                <div>
                                  <h3 className="font-semibold text-lg">Verifikasi Dua Faktor (2FA)</h3>
                                  <p className="text-sm opacity-70">Tingkatkan keamanan akun dengan OTP 4 digit</p>
                                </div>
                              </div>
                              <button 
                                onClick={handle2FAToggle}
                                disabled={isGeneratingOTP}
                                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${is2FAEnabled ? `bg-${accentColor}-500` : 'bg-gray-300'} ${isGeneratingOTP ? 'opacity-50' : ''}`}
                              >
                                <motion.div 
                                  className="bg-white w-5 h-5 rounded-full shadow-md"
                                  animate={{ x: is2FAEnabled ? 28 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </button>
                            </div>
                            
                            {/* Status indicator */}
                            <div className="mt-4">
                              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                                is2FAEnabled 
                                  ? 'bg-green-100 dark:bg-green-900/30' 
                                  : 'bg-yellow-100 dark:bg-yellow-900/30'
                              }`}>
                                <IconShield size={16} className={is2FAEnabled ? 'text-green-500' : 'text-yellow-500'} />
                                <span className={`text-xs font-medium ${
                                  is2FAEnabled 
                                    ? 'text-green-700 dark:text-green-300' 
                                    : 'text-yellow-700 dark:text-yellow-300'
                                }`}>
                                  {is2FAEnabled 
                                    ? '2FA aktif - Akun Anda dilindungi dengan OTP' 
                                    : '2FA tidak aktif - Aktifkan untuk keamanan tambahan'
                                  }
                                </span>
                              </div>
                            </div>

                            {/* OTP Input Modal */}
                            {showOTPInput && (
                              <div className="mt-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <h4 className="font-medium mb-3">
                                  {otpPurpose === 'enable_2fa' ? 'Aktifkan 2FA' : 'Nonaktifkan 2FA'}
                                </h4>
                                
                                {otpMessage && (
                                  <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">{otpMessage}</p>
                                  </div>
                                )}
                                
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Masukkan kode OTP 4 digit:
                                    </label>
                                    <div className="flex space-x-2">
                                      <input
                                        type="text"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="1234"
                                        maxLength="4"
                                        className={`flex-1 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border text-center font-mono text-lg`}
                                      />
                                      <button
                                        onClick={verifyOTPCode}
                                        disabled={isVerifyingOTP || otpCode.length !== 4}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                          isVerifyingOTP || otpCode.length !== 4
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : `bg-${accentColor}-500 hover:bg-${accentColor}-600`
                                        } text-white`}
                                      >
                                        {isVerifyingOTP ? 'Verifikasi...' : 'Verifikasi'}
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => generateOTPCode(otpPurpose)}
                                      disabled={isGeneratingOTP}
                                      className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 text-sm disabled:opacity-50"
                                    >
                                      {isGeneratingOTP ? 'Mengirim...' : 'Kirim Ulang OTP'}
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                      onClick={cancelOTPProcess}
                                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      </motion.div>
                    )}
                    
                    {activeTab === 'security' && (
                      <motion.div 
                        key="security"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h2 className="text-2xl font-bold mb-6">Pengaturan Keamanan</h2>
                        <div className="space-y-6">
                          {/* 2FA Section */}
                          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <IconShield size={24} className={`text-${accentColor}-500`} />
                              <h3 className="font-semibold text-lg">Verifikasi Dua Faktor (2FA)</h3>
                            </div>
                            
                            {is2FAEnabled ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                  <IconShield size={20} className="text-green-500" />
                                  <span className="text-green-700 dark:text-green-300 font-medium">
                                    2FA telah diaktifkan untuk akun Anda. Akun Anda lebih aman sekarang!
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Dengan 2FA aktif, Anda akan diminta memasukkan kode verifikasi dari aplikasi authenticator setiap kali login.
                                </p>
                                <button
                                  onClick={() => generateOTPCode('disable_2fa')}
                                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
                                >
                                  Nonaktifkan 2FA
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                  <IconKey size={20} className="text-yellow-500" />
                                  <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                                    2FA belum diaktifkan. Tingkatkan keamanan akun Anda!
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Verifikasi Dua Faktor menambah lapisan keamanan ekstra ke akun Anda. 
                                  Bahkan jika kata sandi Anda dikompromikan, akun Anda tetap aman.
                                </p>
                                
                                {!showOTPInput ? (
                                  <button
                                    onClick={() => generateOTPCode('enable_2fa')}
                                    disabled={isGeneratingOTP}
                                    className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                                      isGeneratingOTP 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : `bg-${accentColor}-500 hover:bg-${accentColor}-600`
                                    } text-white`}
                                  >
                                    <IconShield size={18} />
                                    <span>{isGeneratingOTP ? 'Mengirim OTP...' : 'Aktifkan 2FA'}</span>
                                  </button>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                      <h4 className="font-medium mb-3">Verifikasi OTP</h4>
                                      
                                      {otpMessage && (
                                        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                          <p className="text-sm text-blue-700 dark:text-blue-300">{otpMessage}</p>
                                        </div>
                                      )}
                                      
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Masukkan 4 digit kode OTP yang telah dikirim:
                                      </p>
                                      <div className="flex space-x-2">
                                        <input
                                          type="text"
                                          value={otpCode}
                                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                          placeholder="1234"
                                          maxLength="4"
                                          className={`flex-1 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border text-center font-mono text-lg`}
                                        />
                                        <button
                                          onClick={verifyOTPCode}
                                          disabled={isVerifyingOTP || otpCode.length !== 4}
                                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                            isVerifyingOTP || otpCode.length !== 4
                                              ? 'bg-gray-400 cursor-not-allowed'
                                              : `bg-${accentColor}-500 hover:bg-${accentColor}-600`
                                          } text-white`}
                                        >
                                          {isVerifyingOTP ? 'Memverifikasi...' : 'Verifikasi'}
                                        </button>
                                      </div>
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => generateOTPCode('enable_2fa')}
                                        disabled={isGeneratingOTP}
                                        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 text-sm disabled:opacity-50"
                                      >
                                        {isGeneratingOTP ? 'Mengirim...' : 'Kirim Ulang OTP'}
                                      </button>
                                      <span className="text-gray-300">|</span>
                                      <button
                                        onClick={cancelOTPProcess}
                                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Change Password Section */}
                          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl`}>
                            <h3 className="font-semibold text-lg mb-4">Ubah Kata Sandi</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Kata Sandi Lama</label>
                                <input 
                                  type="password" 
                                  placeholder="••••••••"
                                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Kata Sandi Baru</label>
                                <input 
                                  type="password" 
                                  placeholder="••••••••"
                                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Konfirmasi Kata Sandi Baru</label>
                                <input 
                                  type="password" 
                                  placeholder="••••••••"
                                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}
                                />
                              </div>
                              <button className={`px-4 py-2 rounded-lg bg-${accentColor}-500 text-white hover:bg-${accentColor}-600 transition-colors`}>
                                Perbarui Kata Sandi
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {activeTab === 'language' && (
                      <motion.div 
                        key="language"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <h2 className="text-2xl font-bold mb-6">Pengaturan Bahasa</h2>
                        <div className="space-y-6">
                          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl`}>
                            <h3 className="font-semibold text-lg mb-4">Pilih Bahasa</h3>
                            <div className="space-y-2">
                              <label className="flex items-center space-x-3">
                                <input type="radio" name="language" className={`accent-${accentColor}-500`} checked />
                                <span>Bahasa Indonesia</span>
                              </label>
                              <label className="flex items-center space-x-3">
                                <input type="radio" name="language" className={`accent-${accentColor}-500`} />
                                <span>English</span>
                              </label>
                              <label className="flex items-center space-x-3">
                                <input type="radio" name="language" className={`accent-${accentColor}-500`} />
                                <span>العربية</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </>
        )}
        
        {/* Floating Dock - Move outside the conditional rendering */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <FloatingDock items={dockItems} />
        </div>
      </div>
    );
}

export default DashboardSettingsTeacher;