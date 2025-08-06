import { IconActivity, IconChartBar, IconLanguage, IconList, IconLock, IconPalette, IconSettings, IconSun, IconUserCircle, IconVolume } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FloatingDock } from '../../../../components/ui/floating-dock';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut'
    }
  }),
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

const DashboardSettingsAdmin = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('appearance');
  const [accentColor, setAccentColor] = useState('blue');
  const [userName, setUserName] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  
  // Cek apakah user sudah login
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
      
      // Simulasi loading
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, [router]);
    
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
    
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
        <Head>
          <title>Pengaturan | Belajar Makhraj</title>
          <meta name="description" content="Pengaturan aplikasi Belajar Makhraj" />
        </Head>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-8"
            >
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Pengaturan</h1>
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
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl`}>
                          <h3 className="font-semibold text-lg mb-4">Ubah Kata Sandi</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Kata Sandi Lama</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Kata Sandi Baru</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Konfirmasi Kata Sandi Baru</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
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
        )}
        
        {/* Floating Dock - Move outside the conditional rendering */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <FloatingDock items={dockItems} />
        </div>
      </div>
    );
}

export default DashboardSettingsAdmin;