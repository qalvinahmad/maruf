import { IconAward, IconFlag, IconLanguage, IconLock, IconMoon, IconPackage, IconPalette, IconSun, IconUser, IconUserCircle, IconVolume, IconVolumeOff, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import RatingDialog from '../../../components/dialog/RatingDialog';
import { Dock } from '../../../components/ui/dock';
import { Toast, showToast } from '../../../components/ui/toast';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

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

// Tab variants for animations
const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

const DashboardSettings = () => {
  const router = useRouter();
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('appearance');
  const [userName, setUserName] = useState('');
  const [userPoints, setUserPoints] = useState(0);
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
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    target_type: 'bug',
    reason: ''
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Rating dialog state
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  // Add inventory state
  const [inventory, setInventory] = useState({
    borders: [],
    avatars: [],
    items: [],
    powerups: [],
    badges: []
  });

  // Add loading state for inventory
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);

  // Dynamic placeholder text based on report type
  const getPlaceholderText = (targetType) => {
    switch (targetType) {
      case 'ui':
        return 'Jelaskan masalah tampilan yang Anda alami...';
      case 'performance':
        return 'Deskripsikan masalah performa seperti loading lambat...';
      case 'content':
        return 'Jelaskan masalah dengan konten pembelajaran...';
      case 'pricing':
        return 'Jelaskan masalah dengan harga atau pembayaran...';
      case 'other':
        return 'Jelaskan masalah lainnya...';
      default:
        return 'Jelaskan masalah yang Anda alami...';
    }
  };

  // Check rating status function
  const checkRatingStatus = async (userId) => {
    try {
      const hasRated = localStorage.getItem(`user_rated_${userId}`);
      if (hasRated) return false;

      const skippedTime = localStorage.getItem(`user_rating_skipped_${userId}`);
      if (skippedTime) {
        const timeDiff = Date.now() - parseInt(skippedTime);
        if (timeDiff < 24 * 60 * 60 * 1000) return false;
      }

      const { data: existingRating } = await supabase
        .from('rating')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingRating) {
        localStorage.setItem(`user_rated_${userId}`, 'true');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking rating status:', error);
      return false;
    }
  };

  // Enhanced logout handler
  const handleLogout = async () => {
    try {
      if (!user?.id) {
        await signOut();
        return;
      }

      const shouldShowRating = await checkRatingStatus(user.id);
      
      if (shouldShowRating) {
        setShowRatingDialog(true);
        return;
      }

      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      showToast.error('Terjadi kesalahan saat logout. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit rating and logout
  const handleRatingSubmit = async (rating, comment) => {
    console.log('Settings: Rating submitted:', rating, comment);
    setIsLoading(true);
    await signOut();
  };

  // Skip rating and logout
  const handleRatingSkip = async () => {
    console.log('Settings: Rating skipped');
    setIsLoading(true);
    await signOut();
  };

  // Enhanced profile data fetching
  const fetchProfileData = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, level, xp, points, streak, level_description, energy, is_admin, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        setProfileData(profile);
        setUserName(profile.full_name || profile.email?.split('@')[0] || 'User');
        setUserPoints(profile.points || 0);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Enhanced auth check
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }
      
      const initializeSettings = async () => {
        try {
          await fetchProfileData(user.id);
          
          // Load saved preferences
          const savedDarkMode = localStorage.getItem('darkMode') === 'true';
          const savedSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
          
          setDarkMode(savedDarkMode);
          setSoundEnabled(savedSoundEnabled);
          
          if (savedDarkMode) {
            document.documentElement.classList.add('dark');
          }
          
          // Fetch inventory
          await fetchInventory();
          
        } catch (error) {
          console.error('Error initializing settings:', error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeSettings();
    }
  }, [user, loading, isAuthenticated, router]);

  // Submit report function with improved error handling
  const submitReport = async () => {
    if (!reportData.reason.trim()) {
      showToast.warning('Silakan masukkan alasan laporan');
      return;
    }

    try {
      setIsSubmittingReport(true);
      
      console.log('Submitting report...', {
        user_id: user.id,
        target_type: reportData.target_type,
        reason: reportData.reason.trim()
      });
      
      // Try direct Supabase insert
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          user_id: user.id,
          target_type: reportData.target_type,
          reason: reportData.reason.trim(),
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      showToast.success('Laporan berhasil dikirim. Terima kasih atas feedback Anda!');
      setShowReportModal(false);
      setReportData({ target_type: 'bug', reason: '' });
      
    } catch (error) {
      console.error('Error submitting report:', error);
      showToast.error('Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.');
    } finally {
      setIsSubmittingReport(false);
    }
  };
    
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
    
    // Show toast notification
    showToast.success(newDarkMode ? 'Mode gelap diaktifkan' : 'Mode terang diaktifkan');
    
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
    
    // Show toast notification
    showToast.success(newSoundEnabled ? 'Efek suara diaktifkan' : 'Efek suara dinonaktifkan');
    
    // Efek suara jika mengaktifkan suara
    if (newSoundEnabled) {
      const audio = new Audio('/audio/switch.mp3');
      audio.volume = 0.3;
      audio.play();
    }
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
    
  // Function to fetch user's inventory with error handling
  const fetchInventory = async () => {
    try {
      setIsLoadingInventory(true);
      const userId = localStorage.getItem('userId');
      
      console.log('Fetching inventory for userId:', userId);
      
      if (!userId) {
        console.error('No userId found in localStorage');
        return;
      }

      // Try using the service role through an API endpoint instead
      try {
        const response = await fetch('/api/get-inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Inventory from API:', result);
          
          if (result.success && result.data) {
            const combinedData = result.data;
            
            // Group items by type
            const grouped = {
              borders: combinedData.filter(item => item.item_type === 'border') || [],
              avatars: combinedData.filter(item => item.item_type === 'avatar') || [],
              items: combinedData.filter(item => item.item_type === 'item') || [],
              powerups: combinedData.filter(item => 
                item.item_type === 'power_up' || item.item_type === 'powerup'
              ) || [],
              badges: combinedData.filter(item => item.item_type === 'badge') || []
            };

            console.log('Final grouped inventory:', grouped);
            setInventory(grouped);
            return;
          }
        }
      } catch (apiError) {
        console.log('API approach failed, trying direct query:', apiError);
      }

      // Set empty inventory on error but don't crash
      setInventory({
        borders: [],
        avatars: [],
        items: [],
        powerups: [],
        badges: []
      });
        
    } catch (error) {
      console.error('Error in fetchInventory:', error);
      // Set empty inventory on error but don't crash
      setInventory({
        borders: [],
        avatars: [],
        items: [],
        powerups: [],
        badges: []
      });
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Function to toggle equipment status with better error handling
  const toggleEquipItem = async (inventoryId, type) => {
    try {
      console.log('Toggling equipment for:', inventoryId, type);
      
      const { data, error } = await supabase
        .from('user_inventory')
        .select('is_equipped')
        .eq('id', inventoryId)
        .single();

      if (error) throw error;

      const newEquippedStatus = !data.is_equipped;

      // If equipping, unequip other items of the same type first
      if (newEquippedStatus) {
        const { error: unequipError } = await supabase
          .from('user_inventory')
          .update({ is_equipped: false })
          .eq('user_id', user.id)
          .eq('item_type', type);

        if (unequipError) throw unequipError;
      }

      // Update the selected item
      const { error: updateError } = await supabase
        .from('user_inventory')
        .update({ is_equipped: newEquippedStatus })
        .eq('id', inventoryId);

      if (updateError) throw updateError;

      showToast.success(newEquippedStatus ? 'Item berhasil dipakai!' : 'Item berhasil dilepas!');
      
      // Refresh inventory
      await fetchInventory();
      
    } catch (error) {
      console.error('Error toggling equipment:', error);
      showToast.error('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  // Render inventory tab
  const renderInventoryTab = () => {
    if (isLoadingInventory) {
      return (
        <motion.div 
          key="inventory-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-64"
        >
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        key="inventory"
        variants={tabVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold mb-6">Inventori Saya</h2>
        
        {/* Avatars Section */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <IconUser size={24} className="text-blue-500" />
            <h3 className="text-lg font-semibold">Avatar ({inventory.avatars.length})</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.avatars.map(item => (
              <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.shop_items?.image ? (
                    <img 
                      src={item.shop_items.image} 
                      alt={item.shop_items.name} 
                      className="h-20 w-20 object-contain"
                    />
                  ) : (
                    <IconUser size={32} className="text-gray-400" />
                  )}
                </div>
                <h4 className="font-medium mb-1">{item.shop_items?.name || `Avatar ${item.item_id}`}</h4>
                <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
                <button
                  onClick={() => toggleEquipItem(item.id, 'avatar')}
                  className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    item.is_equipped
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.is_equipped ? 'Dipakai' : 'Pakai'}
                </button>
              </div>
            ))}
            {inventory.avatars.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                Belum ada avatar. Dapatkan avatar di toko.
              </div>
            )}
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <IconAward size={24} className="text-orange-500" />
            <h3 className="text-lg font-semibold">Badge ({inventory.badges.length})</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.badges.map(item => (
              <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.shop_items?.image ? (
                    <img 
                      src={item.shop_items.image} 
                      alt={item.shop_items.name} 
                      className="h-20 w-20 object-contain"
                    />
                  ) : (
                    <IconAward size={32} className="text-gray-400" />
                  )}
                </div>
                <h4 className="font-medium mb-1">{item.shop_items?.name || `Badge ${item.item_id}`}</h4>
                <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
                <button
                  onClick={() => toggleEquipItem(item.id, 'badge')}
                  className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    item.is_equipped
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.is_equipped ? 'Dipakai' : 'Pakai'}
                </button>
              </div>
            ))}
            {inventory.badges.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                Belum ada badge. Dapatkan badge di toko.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Toast />
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
        <Head>
          <title>Pengaturan | Belajar Makhraj</title>
          <meta name="description" content="Pengaturan aplikasi Belajar Makhraj" />
        </Head>

        <Header 
          userName={userName}
          profileData={profileData}
          onLogout={handleLogout}
          onProfileUpdate={fetchProfileData}
        />

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
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
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'appearance' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
                  >
                    <IconPalette size={20} />
                    <span>Tampilan</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('account')} 
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'account' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
                  >
                    <IconUserCircle size={20} />
                    <span>Akun</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')} 
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
                  >
                    <IconLock size={20} />
                    <span>Keamanan</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory')} 
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
                  >
                    <IconPackage size={20} />
                    <span>Inventori</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('language')} 
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'language' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
                  >
                    <IconLanguage size={20} />
                    <span>Bahasa</span>
                  </button>
                </nav>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all duration-300"
                  >
                    <IconFlag size={20} />
                    <span>Laporkan Masalah</span>
                  </button>
                </div>
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
                              className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
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
                              className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                            >
                              <motion.div 
                                className="bg-white w-5 h-5 rounded-full shadow-md"
                                animate={{ x: soundEnabled ? 28 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            </button>
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
                              <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                              <input 
                                type="text" 
                                defaultValue={profileData.full_name || userName}
                                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Email</label>
                              <input 
                                type="email" 
                                defaultValue={profileData.email}
                                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                                disabled
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Level</label>
                                <input 
                                  type="text" 
                                  value={`Level ${profileData.level || 1}`}
                                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-gray-100 border-gray-300'}`}
                                  disabled
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">XP</label>
                                <input 
                                  type="text" 
                                  value={`${profileData.xp || 0} XP`}
                                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-gray-100 border-gray-300'}`}
                                  disabled
                                />
                              </div>
                            </div>
                            <button 
                              onClick={() => showToast.success('Profil berhasil diperbarui!')}
                              className="px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all duration-300"
                            >
                              Perbarui Profil
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
                              <label className="block text-sm font-medium mb-2">Kata Sandi Lama</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Kata Sandi Baru</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Konfirmasi Kata Sandi Baru</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                              />
                            </div>
                            <button 
                              onClick={() => showToast.success('Kata sandi berhasil diperbarui!')}
                              className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all duration-300"
                            >
                              Perbarui Kata Sandi
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'inventory' && renderInventoryTab()}
                  
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
                          <h3 className="font-semibold text-lg mb-4">Pilih Bahasa Interface</h3>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                              <input type="radio" name="language" className="accent-blue-500" defaultChecked />
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🇮🇩</span>
                                <span className="font-medium">Bahasa Indonesia</span>
                              </div>
                            </label>
                            <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                              <input type="radio" name="language" className="accent-blue-500" />
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🇺🇸</span>
                                <span className="font-medium">English</span>
                              </div>
                            </label>
                            <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                              <input type="radio" name="language" className="accent-blue-500" />
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🇸🇦</span>
                                <span className="font-medium">العربية</span>
                              </div>
                            </label>
                          </div>
                          <button 
                            onClick={() => showToast.success('Bahasa berhasil diubah!')}
                            className="mt-4 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all duration-300"
                          >
                            Simpan Bahasa
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            
            {/* Dock Navigation */}
            <Dock items={dockItems} />
          </div>
        )}
        
        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-2xl p-6 w-full max-w-md shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Laporkan Masalah</h3>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <IconX size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Jenis Masalah</label>
                  <select 
                    value={reportData.target_type}
                    onChange={(e) => setReportData(prev => ({ ...prev, target_type: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="bug">Bug / Kesalahan</option>
                    <option value="ui">Masalah Tampilan</option>
                    <option value="performance">Masalah Performa</option>
                    <option value="content">Konten Bermasalah</option>
                    <option value="pricing">Masalah Harga</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Deskripsi Masalah</label>
                  <textarea 
                    value={reportData.reason}
                    onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder={getPlaceholderText(reportData.target_type)}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border resize-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowReportModal(false)}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Batal
                </button>
                <button 
                  onClick={submitReport}
                  disabled={isSubmittingReport}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Rating Dialog */}
        <RatingDialog
          isOpen={showRatingDialog}
          onClose={() => setShowRatingDialog(false)}
          onSubmit={handleRatingSubmit}
          onSkip={handleRatingSkip}
        />
      </div>
    </>
  );
};

export default DashboardSettings;
