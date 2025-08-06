import { IconActivity, IconChartBar, IconInfoCircle, IconLanguage, IconLock, IconMoon, IconPalette, IconSettings, IconSun, IconUserCircle, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import HeaderTeacher from '../../../components/layout/HeaderTeacher';
import { FloatingDock } from '../../../components/ui/floating-dock';
import { Toast, showToast } from '../../../components/ui/toast';
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
  
  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Handle URL tab parameter
  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);
  
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
            teaching_experience: '',
            specialization: '',
            certifications: '',
            is_verified: true
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
        teaching_experience: '',
        specialization: '',
        certifications: '',
        is_verified: true
      };
      setTeacherProfile(fallbackProfile);
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

  // Function to save profile changes
  const saveProfileChanges = async () => {
    if (!teacherProfile?.email) {
      showToast.error('Email tidak ditemukan. Silakan login ulang.');
      return;
    }

    if (!userName.trim()) {
      showToast.error('Nama pengguna tidak boleh kosong.');
      return;
    }

    try {
      showToast.info('Menyimpan perubahan...');
      
      const { error } = await supabase
        .from('teacher_profiles')
        .update({ 
          full_name: userName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('email', teacherProfile.email);

      if (error) {
        throw new Error(error.message);
      }

      // Update localStorage
      localStorage.setItem('teacherName', userName.trim());
      
      // Update local state
      setTeacherProfile(prev => ({
        ...prev,
        full_name: userName.trim()
      }));

      showToast.success('Perubahan profil berhasil disimpan!');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast.error('Gagal menyimpan perubahan. Silakan coba lagi.');
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

  // Handle password change
  const handlePasswordChange = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    
    // Validasi input
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast.error('Semua field harus diisi.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast.error('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    
    if (newPassword.length < 8) {
      showToast.error('Kata sandi baru minimal 8 karakter.');
      return;
    }
    
    if (oldPassword === newPassword) {
      showToast.error('Kata sandi baru harus berbeda dari kata sandi lama.');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const teacherEmail = localStorage.getItem('teacherEmail');
      if (!teacherEmail) {
        throw new Error('Email tidak ditemukan. Silakan login ulang.');
      }
      
      // Verify old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: teacherEmail,
        password: oldPassword
      });
      
      if (signInError) {
        throw new Error('Kata sandi lama tidak benar.');
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        throw new Error('Gagal mengubah kata sandi: ' + updateError.message);
      }
      
      // Reset form
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showToast.success('Kata sandi berhasil diubah!');
    } catch (error) {
      console.error('Error changing password:', error);
      showToast.error(error.message || 'Terjadi kesalahan saat mengubah kata sandi.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
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
      <div className="bg-blue-50 min-h-screen font-['Poppins']">
        <Head>
          <title>Pengaturan Akun Guru | Belajar Makhraj</title>
          <meta name="description" content="Pengaturan akun guru dengan 2FA dan keamanan tambahan" />
        </Head>

        {/* Toast Component */}
        <Toast />

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <motion.div
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <HeaderTeacher userName={userName} teacherProfile={teacherProfile} />

            <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-8 pb-24">
              {/* Welcome Section */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h1 className="text-3xl md:text-4xl font-bold">
                          Pengaturan Akun 🔧
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl">
                          Kelola preferensi dan keamanan akun Anda, {userName}
                        </p>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-3"
                      >

                      </motion.div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="hidden md:block"
                    >
                      <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <IconSettings size={48} className="text-white/80" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Modern Tab Navigation */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-3xl shadow-lg border border-blue-100 mb-8 overflow-hidden"
              >
                <div className="relative">
                  <div className="flex flex-wrap">
                    <motion.button
                      onClick={() => setActiveTab('appearance')}
                      className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                        activeTab === 'appearance' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconPalette size={20} />
                      <span className="font-['Poppins']">Tampilan</span>
                      {activeTab === 'appearance' && (
                        <motion.div
                          layoutId="activeSettingsTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setActiveTab('account')}
                      className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                        activeTab === 'account' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconUserCircle size={20} />
                      <span className="font-['Poppins']">Akun</span>
                      {activeTab === 'account' && (
                        <motion.div
                          layoutId="activeSettingsTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setActiveTab('security')}
                      className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                        activeTab === 'security' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconLock size={20} />
                      <span className="font-['Poppins']">Keamanan</span>
                      {activeTab === 'security' && (
                        <motion.div
                          layoutId="activeSettingsTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setActiveTab('language')}
                      className={`relative px-8 py-4 text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                        activeTab === 'language' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconLanguage size={20} />
                      <span className="font-['Poppins']">Bahasa</span>
                      {activeTab === 'language' && (
                        <motion.div
                          layoutId="activeSettingsTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'appearance' && (
                      <motion.div 
                        key="appearance"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <IconPalette size={20} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">
                              Pengaturan Tampilan
                            </h2>
                            <p className="text-gray-600 font-['Poppins']">
                              Kustomisasi tampilan aplikasi sesuai preferensi Anda
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Dark Mode Toggle */}
                          <motion.div 
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                            whileHover="hover"
                            className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {darkMode ? <IconMoon size={24} className="text-blue-600" /> : <IconSun size={24} className="text-blue-600" />}
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-800 font-['Poppins']">Mode Gelap</h3>
                                  <p className="text-sm text-gray-600 font-['Poppins']">Ubah tampilan aplikasi ke mode gelap</p>
                                </div>
                              </div>
                              <motion.button 
                                onClick={toggleDarkMode}
                                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <motion.div 
                                  className="bg-white w-5 h-5 rounded-full shadow-md"
                                  animate={{ x: darkMode ? 28 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </motion.button>
                            </div>
                          </motion.div>
                          
                          {/* Sound Toggle */}
                          <motion.div 
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                            whileHover="hover"
                            className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {soundEnabled ? <IconVolume size={24} className="text-blue-600" /> : <IconVolumeOff size={24} className="text-blue-600" />}
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-800 font-['Poppins']">Efek Suara</h3>
                                  <p className="text-sm text-gray-600 font-['Poppins']">Aktifkan efek suara saat berinteraksi</p>
                                </div>
                              </div>
                              <motion.button 
                                onClick={toggleSound}
                                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${soundEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <motion.div 
                                  className="bg-white w-5 h-5 rounded-full shadow-md"
                                  animate={{ x: soundEnabled ? 28 : 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </motion.button>
                            </div>
                          </motion.div>
                          
                          {/* Accent Color */}
                          <motion.div 
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={2}
                            className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 transition-all"
                          >
                            <h3 className="font-semibold text-lg mb-4 text-gray-800 font-['Poppins']">Warna Aksen</h3>
                            <p className="text-sm text-gray-600 mb-6 font-['Poppins']">Pilih warna utama untuk tema aplikasi</p>
                            <div className="flex flex-wrap gap-4">
                              {accentColors.map((color) => (
                                <motion.button
                                  key={color.name}
                                  onClick={() => changeAccentColor(color.name)}
                                  className={`w-12 h-12 rounded-2xl transition-all shadow-lg ${accentColor === color.name ? 'ring-4 ring-blue-300 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                                  style={{ backgroundColor: color.color }}
                                  aria-label={`Warna ${color.name}`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
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
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <IconUserCircle size={20} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">
                              Pengaturan Akun
                            </h2>
                            <p className="text-gray-600 font-['Poppins']">
                              Kelola informasi profil dan pengaturan akun
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                            <h3 className="font-semibold text-lg mb-6 text-gray-800 font-['Poppins']">Informasi Profil</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Nama Lengkap</label>
                                <input 
                                  type="text" 
                                  value={teacherProfile?.full_name || userName}
                                  disabled
                                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 opacity-70 font-['Poppins'] shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Email</label>
                                <input 
                                  type="email" 
                                  value={teacherProfile?.email || "teacher@example.com"} 
                                  disabled
                                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 opacity-70 font-['Poppins'] shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Institusi</label>
                                <input 
                                  type="text" 
                                  value={teacherProfile?.institution || "Belum diisi"}
                                  disabled
                                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 opacity-70 font-['Poppins'] shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Pengalaman Mengajar</label>
                                <input 
                                  type="text" 
                                  value={teacherProfile?.teaching_experience || "Belum diisi"}
                                  disabled
                                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 opacity-70 font-['Poppins'] shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Spesialisasi</label>
                                <input 
                                  type="text" 
                                  value={teacherProfile?.specialization || "Belum diisi"}
                                  disabled
                                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 opacity-70 font-['Poppins'] shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Status Verifikasi</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    value={teacherProfile?.is_verified ? "Terverifikasi" : "Belum Terverifikasi"}
                                    disabled
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 opacity-70 font-['Poppins'] shadow-sm"
                                  />
                                  <div className={`w-3 h-3 rounded-full ${
                                    teacherProfile?.is_verified ? 'bg-green-500' : 'bg-yellow-500'
                                  }`}></div>
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Sertifikasi</label>
                                <textarea 
                                  value={teacherProfile?.certifications || "Belum diisi"}
                                  disabled
                                  rows="3"
                                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 opacity-70 font-['Poppins'] shadow-sm resize-none"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Tanggal Bergabung</label>
                                <input 
                                  type="text" 
                                  value={teacherProfile?.created_at ? new Date(teacherProfile.created_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  }) : "Tidak tersedia"}
                                  disabled
                                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 opacity-70 font-['Poppins'] shadow-sm"
                                />
                              </div>
                            </div>
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
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <IconLock size={20} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">
                              Pengaturan Keamanan
                            </h2>
                            <p className="text-gray-600 font-['Poppins']">
                              Tingkatkan keamanan akun dengan fitur-fitur tambahan
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                            <h3 className="font-semibold text-lg mb-4 text-gray-800 font-['Poppins']">Ubah Kata Sandi</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Kata Sandi Lama</label>
                                <input 
                                  type="password" 
                                  value={passwordForm.oldPassword}
                                  onChange={(e) => handlePasswordInputChange('oldPassword', e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full px-4 py-3 rounded-xl bg-white border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-['Poppins'] shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Kata Sandi Baru</label>
                                <input 
                                  type="password" 
                                  value={passwordForm.newPassword}
                                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full px-4 py-3 rounded-xl bg-white border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-['Poppins'] shadow-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1 font-['Poppins']">Minimal 8 karakter</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 font-['Poppins']">Konfirmasi Kata Sandi Baru</label>
                                <input 
                                  type="password" 
                                  value={passwordForm.confirmPassword}
                                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full px-4 py-3 rounded-xl bg-white border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-['Poppins'] shadow-sm"
                                />
                              </div>
                              <motion.button 
                                onClick={handlePasswordChange}
                                disabled={isChangingPassword || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold font-['Poppins'] shadow-lg flex items-center gap-2"
                                whileHover={{ scale: isChangingPassword ? 1 : 1.05 }}
                                whileTap={{ scale: isChangingPassword ? 1 : 0.95 }}
                              >
                                {isChangingPassword ? (
                                  <>
                                    <motion.div
                                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Mengubah...
                                  </>
                                ) : (
                                  'Perbarui Kata Sandi'
                                )}
                              </motion.button>
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
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <IconLanguage size={20} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">
                              Pengaturan Bahasa
                            </h2>
                            <p className="text-gray-600 font-['Poppins']">
                              Pilih bahasa yang ingin digunakan dalam aplikasi
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                            <h3 className="font-semibold text-lg mb-6 text-gray-800 font-['Poppins']">Pilih Bahasa</h3>
                            <div className="space-y-4">
                              <motion.label 
                                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-all cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                              >
                                <input type="radio" name="language" className="accent-blue-600" checked />
                                <span className="font-['Poppins'] text-gray-800">🇮🇩 Bahasa Indonesia</span>
                              </motion.label>
                              {/* <motion.label 
                                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-all cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                              >
                                <input type="radio" name="language" className="accent-blue-600" />
                                <span className="font-['Poppins'] text-gray-800">🇺🇸 English</span>
                              </motion.label>
                              <motion.label 
                                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-all cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                              >
                                <input type="radio" name="language" className="accent-blue-600" />
                                <span className="font-['Poppins'] text-gray-800">🇸🇦 العربية</span>
                              </motion.label> */}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </main>
          </>
        )}
        
        {/* Enhanced Floating Dock */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <FloatingDock items={dockItems} />
          </motion.div>
        </div>
      </div>
    );
}

export default DashboardSettingsTeacher;