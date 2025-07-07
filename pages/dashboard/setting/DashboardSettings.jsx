import { FloatingDock } from '@/components/ui/floating-dock';
import { IconBook, IconBorderAll, IconCoin, IconFlag, IconHome, IconLanguage, IconLetterA, IconLock, IconMoon, IconPackage, IconPalette, IconSettings, IconSun, IconUser, IconUserCircle, IconVolume, IconVolumeOff, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import RatingDialog from '../../../components/dialog/RatingDialog';
import Header from '../../../components/Header';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const DashboardSettings = () => {
  const router = useRouter();
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('appearance');
  const [accentColor, setAccentColor] = useState('blue');
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

  // Dynamic placeholder text based on report type
  const getPlaceholderText = (targetType) => {
    switch (targetType) {
      case 'bug':
        return 'Jelaskan bug atau error yang Anda alami secara detail...';
      case 'feature':
        return 'Deskripsikan fitur yang Anda inginkan dan alasan mengapa fitur tersebut diperlukan...';
      case 'ui':
        return 'Jelaskan masalah tampilan atau pengalaman pengguna yang Anda temui...';
      case 'performance':
        return 'Deskripsikan masalah performa seperti loading lambat atau lag yang Anda alami...';
      case 'content':
        return 'Jelaskan masalah dengan konten pembelajaran atau materi yang tidak sesuai...';
      case 'pricing':
        return 'Sampaikan saran Anda mengenai penyesuaian harga produk atau layanan...';
      case 'other':
        return 'Jelaskan masalah atau saran lainnya yang ingin Anda sampaikan...';
      default:
        return 'Jelaskan masalah yang Anda alami...';
    }
  };

  // Add inventory state
  const [inventory, setInventory] = useState({
    borders: [],
    avatars: [],
    items: [],
    powerups: []
  });

  // Add loading state for inventory
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  
  // Check rating status function
  const checkRatingStatus = async (userId) => {
    try {
      const hasRated = localStorage.getItem(`user_rated_${userId}`);
      if (hasRated) return false;

      const skippedTime = localStorage.getItem(`user_rating_skipped_${userId}`);
      if (skippedTime) {
        const daysSinceSkip = (Date.now() - parseInt(skippedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceSkip < 7) return false;
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
      alert('Terjadi kesalahan saat logout. Silakan coba lagi.');
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
        console.error('Error fetching profile data:', error);
        return;
      }

      if (profile) {
        setProfileData(profile);
        setUserName(profile.full_name || 'User');
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
        router.replace('/authentication/login');
        return;
      }
      
      const initializeSettings = async () => {
        try {
          setIsLoading(true);
          await fetchProfileData(user.id);
          
          // Load preferences
          const savedDarkMode = localStorage.getItem('darkMode') === 'true';
          setDarkMode(savedDarkMode);
          
          const savedSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
          setSoundEnabled(savedSoundEnabled);
          
          const savedAccentColor = localStorage.getItem('accentColor') || 'blue';
          setAccentColor(savedAccentColor);
          
          const savedTab = localStorage.getItem('settingsTab');
          if (savedTab) {
            setActiveTab(savedTab);
            localStorage.removeItem('settingsTab');
          }
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
      alert('Silakan masukkan alasan laporan');
      return;
    }

    try {
      setIsSubmittingReport(true);
      
      console.log('Submitting report...', {
        user_id: user.id,
        target_type: reportData.target_type,
        reason: reportData.reason.trim()
      });
      
      // Method 1: Try API endpoint first (more reliable)
      try {
        const response = await fetch('/api/submit-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            target_type: reportData.target_type,
            reason: reportData.reason.trim()
          }),
        });

        const result = await response.json();
        console.log('API Response:', result);

        if (response.ok && result.success) {
          alert('Laporan berhasil dikirim melalui API. Terima kasih atas feedback Anda!');
          setShowReportModal(false);
          setReportData({ target_type: 'bug', reason: '' });
          return;
        } else {
          console.error('API Error:', result);
        }
      } catch (apiError) {
        console.error('API method failed:', apiError);
      }
      
      // Method 2: Try direct Supabase insert
      try {
        const { data, error } = await supabase
          .from('reports')
          .insert([
            {
              user_id: user.id,
              target_type: reportData.target_type,
              reason: reportData.reason.trim()
            }
          ]);

        console.log('Direct Supabase response:', { data, error });

        if (!error) {
          alert('Laporan berhasil dikirim langsung ke database. Terima kasih atas feedback Anda!');
          setShowReportModal(false);
          setReportData({ target_type: 'bug', reason: '' });
          return;
        } else {
          console.error('Direct insert error:', error);
        }
      } catch (directError) {
        console.error('Direct method failed:', directError);
      }

      // Method 3: Fallback - save to localStorage
      console.log('All methods failed, saving to localStorage as fallback');
      const reports = JSON.parse(localStorage.getItem('pendingReports') || '[]');
      const newReport = {
        id: Date.now(),
        user_id: user.id,
        user_name: userName || 'Unknown User',
        target_type: reportData.target_type,
        reason: reportData.reason.trim(),
        created_at: new Date().toISOString(),
        status: 'pending_local'
      };
      
      reports.push(newReport);
      localStorage.setItem('pendingReports', JSON.stringify(reports));
      
      // Also save to a separate key for easier access
      const reportKey = `report_${Date.now()}`;
      localStorage.setItem(reportKey, JSON.stringify(newReport));
      
      alert(`Laporan tersimpan lokal dengan ID: ${reportKey.split('_')[1]}. Akan dikirim saat koneksi database tersedia.`);
      setShowReportModal(false);
      setReportData({ target_type: 'bug', reason: '' });
      
    } catch (error) {
      console.error('Unexpected error in submitReport:', error);
      
      // Final fallback - minimal local storage
      try {
        const simpleReport = {
          id: Date.now(),
          user: userName || user.id || 'unknown',
          type: reportData.target_type,
          message: reportData.reason.trim(),
          time: new Date().toISOString()
        };
        
        localStorage.setItem(`emergency_report_${Date.now()}`, JSON.stringify(simpleReport));
        alert('Terjadi kesalahan tidak terduga. Laporan tersimpan dalam mode darurat.');
      } catch (emergencyError) {
        console.error('Emergency save failed:', emergencyError);
        alert('Maaf, sistem mengalami masalah. Silakan coba lagi nanti atau hubungi admin.');
      }
      
      setShowReportModal(false);
      setReportData({ target_type: 'bug', reason: '' });
    } finally {
      setIsSubmittingReport(false);
    }
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
    
    // Function to fetch user's inventory with error handling - bypassing RLS issues
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
                ) || []
              };

              console.log('Final grouped inventory:', grouped);
              setInventory(grouped);
              return;
            }
          }
        } catch (apiError) {
          console.log('API approach failed, trying direct query:', apiError);
        }

        // Fallback to direct Supabase query with different approaches
        console.log('Trying direct Supabase query...');

        // Method 1: Try with anon key but user context
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session:', sessionData?.session?.user?.id);

        // Method 2: Simple select without join first
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('user_inventory')
          .select('*')
          .eq('user_id', userId);

        if (inventoryError) {
          console.error('Error fetching inventory:', inventoryError);
          
          // Method 3: Try with RPC function if direct query fails
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_inventory', {
              p_user_id: userId
            });
            
            if (!rpcError && rpcData) {
              console.log('RPC inventory data:', rpcData);
              
              const grouped = {
                borders: rpcData.filter(item => item.item_type === 'border') || [],
                avatars: rpcData.filter(item => item.item_type === 'avatar') || [],
                items: rpcData.filter(item => item.item_type === 'item') || [],
                powerups: rpcData.filter(item => 
                  item.item_type === 'power_up' || item.item_type === 'powerup'
                ) || []
              };

              setInventory(grouped);
              return;
            }
          } catch (rpcError) {
            console.error('RPC also failed:', rpcError);
          }
          
          throw inventoryError;
        }

        console.log('Raw inventory data received:', inventoryData);

        if (!inventoryData || inventoryData.length === 0) {
          console.log('No inventory items found for user');
          setInventory({
            borders: [],
            avatars: [],
            items: [],
            powerups: []
          });
          return;
        }

        // Get all unique item IDs from inventory
        const itemIds = [...new Set(inventoryData.map(item => item.item_id))];
        console.log('Item IDs to fetch:', itemIds);

        // Fetch shop items separately
        const { data: shopItemsData, error: shopError } = await supabase
          .from('shop_items')
          .select('*')
          .in('id', itemIds);

        if (shopError) {
          console.error('Error fetching shop items:', shopError);
          // Continue with inventory data even if shop items fail
        }

        console.log('Shop items data:', shopItemsData);

        // Combine inventory with shop items manually
        const combinedData = inventoryData.map(invItem => {
          const shopItem = shopItemsData?.find(shop => shop.id === invItem.item_id);
          return {
            ...invItem,
            shop_items: shopItem || {
              id: invItem.item_id,
              name: `Item ${invItem.item_id}`,
              description: 'Item description not available',
              type: invItem.item_type,
              image: null
            }
          };
        });

        console.log('Combined inventory data:', combinedData);

        // Group items by type
        const grouped = {
          borders: combinedData.filter(item => item.item_type === 'border') || [],
          avatars: combinedData.filter(item => item.item_type === 'avatar') || [],
          items: combinedData.filter(item => item.item_type === 'item') || [],
          powerups: combinedData.filter(item => 
            item.item_type === 'power_up' || item.item_type === 'powerup'
          ) || []
        };

        console.log('Final grouped inventory:', grouped);
        setInventory(grouped);
        
      } catch (error) {
        console.error('Error in fetchInventory:', error);
        // Set empty inventory on error but don't crash
        setInventory({
          borders: [],
          avatars: [],
          items: [],
          powerups: []
        });
      } finally {
        setIsLoadingInventory(false);
      }
    };

    // Function to toggle equipment status with better error handling
    const toggleEquipItem = async (inventoryId, type) => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          alert('User ID tidak ditemukan. Silakan login ulang.');
          router.push('/authentication/login');
          return;
        }

        console.log(`Toggling item ${inventoryId} of type ${type}`);

        // Use API endpoint instead of direct Supabase calls
        const response = await fetch('/api/equip-item', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            inventoryId: inventoryId,
            itemType: type
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('API Error Response:', result);
          throw new Error(result.error || 'Failed to equip item');
        }

        if (result.success) {
          console.log('Item equipped successfully:', result);
          
          // Refresh inventory immediately
          await fetchInventory();
          
          // Show success message
          alert('Item berhasil dipakai!');
          
          // Trigger events for other components INCLUDING HEADER
          localStorage.setItem('inventoryUpdated', Date.now().toString());
          window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
            detail: { userId, timestamp: Date.now(), itemType: type } 
          }));
          
          // Trigger storage event for cross-component communication
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'inventoryUpdated',
            newValue: Date.now().toString()
          }));
        } else {
          throw new Error(result.error || 'Failed to equip item');
        }
        
      } catch (error) {
        console.error('Error toggling item:', error);
        alert(`Gagal mengubah status item: ${error.message}`);
      }
    };

    // COMPLETELY REWRITE useEffect to stop infinite loops
    useEffect(() => {
      const checkAuth = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn || isLoggedIn !== 'true') {
          router.push('/authentication/login');
          return false;
        }
        return true;
      };

      if (!checkAuth()) return;

      // Initial fetch only
      fetchInventory();

      // MUCH LESS AGGRESSIVE refresh - only every 30 seconds
      const inventoryRefreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchInventory();
        }
      }, 30000); // 30 seconds instead of 3

      // Only listen for storage changes, nothing else
      const handleStorageChange = (e) => {
        if (e.key === 'inventoryUpdated') {
          console.log('Settings: Storage inventory update detected');
          // Debounce the fetch to prevent rapid calls
          setTimeout(() => {
            fetchInventory();
          }, 1000);
        }
      };

      window.addEventListener('storage', handleStorageChange);

      // Clean up
      return () => {
        clearInterval(inventoryRefreshInterval);
        window.removeEventListener('storage', handleStorageChange);
      };
    }, [router]); // Remove all other dependencies to prevent re-running

    // Add a manual refresh button
    const handleRefreshInventory = async () => {
      setIsLoadingInventory(true);
      await fetchInventory();
    };

    // Add inventory tab content with refresh button
    const renderInventoryTab = () => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Inventori Saya</h2>
          <button
            onClick={handleRefreshInventory}
            disabled={isLoadingInventory}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <svg 
              className={`w-4 h-4 ${isLoadingInventory ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Debug info */}
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          Debug: Borders: {inventory.borders.length}, Avatars: {inventory.avatars.length}, Items: {inventory.items.length}, Powerups: {inventory.powerups.length}
        </div>
        
        {isLoadingInventory ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Borders Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <IconBorderAll size={24} className="text-blue-500" />
                <h3 className="text-lg font-semibold">Border ({inventory.borders.length})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inventory.borders.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                    <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {item.shop_items?.image || item.shop_items?.thumbnail ? (
                        <img 
                          src={item.shop_items.thumbnail || item.shop_items.image} 
                          alt={item.shop_items.name} 
                          className="h-20 w-20 object-contain"
                          onError={(e) => {
                            console.log('Border image failed to load, showing fallback icon');
                            e.target.style.display = 'none';
                            e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="fallback-icon absolute inset-0 flex items-center justify-center">
                        <IconBorderAll size={32} className="text-gray-400" />
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">{item.shop_items?.name || `Border ${item.item_id}`}</h4>
                    <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
                    <button
                      onClick={() => toggleEquipItem(item.id, 'border')}
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
                {inventory.borders.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Belum ada border. Dapatkan border di toko.
                  </div>
                )}
              </div>
            </div>

            {/* Avatars Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <IconUser size={24} className="text-purple-500" />
                <h3 className="text-lg font-semibold">Avatar ({inventory.avatars.length})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inventory.avatars.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                    <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {item.shop_items?.image || item.shop_items?.thumbnail ? (
                        <>
                          {(item.shop_items.image || item.shop_items.thumbnail)?.endsWith('.mp4') ? (
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="h-20 w-20 object-cover rounded"
                              onError={(e) => {
                                console.log('Avatar video failed to load, showing fallback icon');
                                e.target.style.display = 'none';
                                e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                              }}
                            >
                              <source src={item.shop_items.thumbnail || item.shop_items.image} type="video/mp4" />
                            </video>
                          ) : (
                            <img 
                              src={item.shop_items.thumbnail || item.shop_items.image} 
                              alt={item.shop_items.name} 
                              className="h-20 w-20 object-contain"
                              onError={(e) => {
                                console.log('Avatar image failed to load, showing fallback icon');
                                e.target.style.display = 'none';
                                e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                              }}
                            />
                          )}
                        </>
                      ) : null}
                      <div className="fallback-icon absolute inset-0 flex items-center justify-center">
                        <IconUser size={32} className="text-gray-400" />
                      </div>
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

            {/* Items Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <IconPalette size={24} className="text-yellow-500" />
                <h3 className="text-lg font-semibold">Item ({inventory.items.length})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inventory.items.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                    <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {item.shop_items?.image || item.shop_items?.thumbnail ? (
                        <img 
                          src={item.shop_items.thumbnail || item.shop_items.image} 
                          alt={item.shop_items.name} 
                          className="h-20 w-20 object-contain"
                          onError={(e) => {
                            console.log('Item image failed to load, showing fallback icon');
                            e.target.style.display = 'none';
                            e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="fallback-icon absolute inset-0 flex items-center justify-center">
                        <IconPalette size={32} className="text-gray-400" />
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">{item.shop_items?.name || `Item ${item.item_id}`}</h4>
                    <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
                    <button
                      onClick={() => toggleEquipItem(item.id, 'item')}
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
                {inventory.items.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Belum ada item. Dapatkan item di toko.
                  </div>
                )}
              </div>
            </div>

            {/* Powerups Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <IconPackage size={24} className="text-green-500" />
                <h3 className="text-lg font-semibold">Power-ups ({inventory.powerups.length})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inventory.powerups.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                    <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {item.shop_items?.image || item.shop_items?.thumbnail ? (
                        <img 
                          src={item.shop_items.thumbnail || item.shop_items.image} 
                          alt={item.shop_items.name} 
                          className="h-20 w-20 object-contain"
                          onError={(e) => {
                            console.log('Powerup image failed to load, showing fallback icon');
                            e.target.style.display = 'none';
                            e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="fallback-icon absolute inset-0 flex items-center justify-center">
                        <IconPackage size={32} className="text-gray-400" />
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">{item.shop_items?.name || `Power-up ${item.item_id}`}</h4>
                    <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
                    <button
                      onClick={() => toggleEquipItem(item.id, 'powerup')}
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
                {inventory.powerups.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Belum ada power-ups. Dapatkan power-ups di toko.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    );

    // Animasi untuk tab content
    const tabVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
    };
    
    // Animasi untuk card
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.1,
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1.0]
        }
      }),
      hover: { scale: 1.02, transition: { duration: 0.2 } }
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
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen font-inter antialiased">
        <Head>
          <title>Pengaturan • Makhrojul Huruf</title>
          <meta name="description" content="Pengaturan dan kustomisasi aplikasi pembelajaran makhrojul huruf" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        </Head>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-screen bg-white">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animate-reverse"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Memuat Pengaturan</h3>
              <p className="text-sm text-gray-500">Sedang menyiapkan pengaturan aplikasi...</p>
            </div>
          </div>
        ) : (
          <>
            <Header 
              userName={userName}
              profileData={profileData}
              onLogout={handleLogout}
              onProfileUpdate={(updatedProfile) => {
                setProfileData(updatedProfile);
                setUserName(updatedProfile.full_name || 'User');
              }}
            />
            
            <main className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-16 pb-32 space-y-12">
           

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Enhanced Sidebar */}
                <motion.div 
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="xl:col-span-1"
                >
                  <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-8">
                    <div className="space-y-6">
                      <div className="text-center pb-6 border-b border-gray-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <IconSettings size={32} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Menu Pengaturan</h2>
                        <p className="text-sm text-gray-500">Pilih kategori pengaturan</p>
                      </div>
                      
                      <nav className="space-y-2">
                        {[
                          { id: 'appearance', icon: IconPalette, label: 'Tampilan', color: 'blue' },
                          { id: 'account', icon: IconUserCircle, label: 'Akun', color: 'green' },
                          { id: 'security', icon: IconLock, label: 'Keamanan', color: 'red' },
                          { id: 'inventory', icon: IconPackage, label: 'Inventori', color: 'purple' },
                          { id: 'language', icon: IconLanguage, label: 'Bahasa', color: 'amber' }
                        ].map((tab, index) => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <motion.button
                              key={tab.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                              onClick={() => setActiveTab(tab.id)}
                              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                                isActive
                                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-200`
                                  : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                isActive 
                                  ? 'bg-white/20' 
                                  : `bg-${tab.color}-100 text-${tab.color}-600 group-hover:bg-${tab.color}-200`
                              }`}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="font-semibold">{tab.label}</span>
                              </div>
                              {isActive && (
                                <motion.div
                                  layoutId="activeTab"
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </nav>
                    </div>
                  </div>
                </motion.div>
                
                {/* Enhanced Content Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="xl:col-span-3"
                >
                  <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 min-h-[600px]">
                    <AnimatePresence mode="wait">
                      {activeTab === 'appearance' && (
                        <motion.div 
                          key="appearance"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-8"
                        >
                          <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Tampilan</h2>
                            <p className="text-gray-600">Kustomisasi tampilan dan tema aplikasi</p>
                          </div>
                          
                          <div className="space-y-6">
                            {/* Dark Mode Toggle - Simplified */}
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-all duration-300 border border-gray-200 hover:border-gray-300"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900 mb-1">Mode Gelap</h3>
                                  <p className="text-sm text-gray-600">Mengaktifkan tema gelap untuk kenyamanan mata</p>
                                </div>
                                <button 
                                  onClick={toggleDarkMode}
                                  className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                                    darkMode ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                >
                                  <motion.div 
                                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                                    animate={{ x: darkMode ? 32 : 4 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  >
                                    {darkMode ? 
                                      <IconMoon size={12} className="text-blue-600" /> : 
                                      <IconSun size={12} className="text-amber-500" />
                                    }
                                  </motion.div>
                                </button>
                              </div>
                            </motion.div>
                            
                            {/* Sound Toggle - Simplified */}
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 }}
                              className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-all duration-300 border border-gray-200 hover:border-gray-300"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900 mb-1">Efek Suara</h3>
                                  <p className="text-sm text-gray-600">Mengaktifkan efek suara saat berinteraksi</p>
                                </div>
                                <button 
                                  onClick={toggleSound}
                                  className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                                    soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                >
                                  <motion.div 
                                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                                    animate={{ x: soundEnabled ? 32 : 4 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  >
                                    {soundEnabled ? 
                                      <IconVolume size={12} className="text-green-600" /> : 
                                      <IconVolumeOff size={12} className="text-gray-400" />
                                    }
                                  </motion.div>
                                </button>
                              </div>
                            </motion.div>
                            
                            {/* Accent Color - Simplified */}
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 }}
                              className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                            >
                              <div className="mb-6">
                                <h3 className="font-bold text-lg text-gray-900 mb-1">Warna Aksen</h3>
                                <p className="text-sm text-gray-600">Pilih warna tema untuk aplikasi</p>
                              </div>
                              
                              <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                                {accentColors.map((color) => (
                                  <motion.button
                                    key={color.name}
                                    onClick={() => changeAccentColor(color.name)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative w-12 h-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                                      accentColor === color.name ? 'ring-4 ring-white ring-opacity-60 scale-110' : ''
                                    }`}
                                    style={{ backgroundColor: color.color }}
                                  >
                                    {accentColor === color.name && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute inset-0 bg-white rounded-xl flex items-center justify-center"
                                      >
                                        <div 
                                          className="w-6 h-6 rounded-lg"
                                          style={{ backgroundColor: color.color }}
                                        />
                                      </motion.div>
                                    )}
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                      
                      {activeTab === 'account' && (
                        <motion.div 
                          key="account"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-8"
                        >
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                              <IconUserCircle size={24} className="text-white" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h2>
                              <p className="text-gray-600">Kelola informasi profil dan akun Anda</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200"
                            >
                              <h3 className="font-bold text-lg mb-4 text-gray-900">Informasi Profil</h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-700">Nama Lengkap</label>
                                  <input 
                                    type="text" 
                                    value={profileData.full_name || ''}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 font-medium"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                                  <input 
                                    type="email" 
                                    value={profileData.email || ''} 
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 opacity-70"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Level</label>
                                    <input 
                                      type="text" 
                                      value={`Level ${profileData.level} - ${profileData.level_description}`}
                                      disabled
                                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Points</label>
                                    <input 
                                      type="text" 
                                      value={`${profileData.points} points`}
                                      disabled
                                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                      
                      {activeTab === 'security' && (
                        <motion.div 
                          key="security"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-8"
                        >
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                              <IconLock size={24} className="text-white" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">Pengaturan Keamanan</h2>
                              <p className="text-gray-600">Kelola keamanan dan privasi akun Anda</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200"
                            >
                              <h3 className="font-bold text-lg mb-4 text-gray-900">Ubah Kata Sandi</h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-700">Kata Sandi Lama</label>
                                  <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-700">Kata Sandi Baru</label>
                                  <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-700">Konfirmasi Kata Sandi Baru</label>
                                  <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
                                  />
                                </div>
                                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                                  Perbarui Kata Sandi
                                </button>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                      
                      {activeTab === 'inventory' && renderInventoryTab()}
                      
                      {activeTab === 'language' && (
                        <motion.div 
                          key="language"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-8"
                        >
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                              <IconLanguage size={24} className="text-white" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">Pengaturan Bahasa</h2>
                              <p className="text-gray-600">Pilih bahasa yang digunakan dalam aplikasi</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200"
                            >
                              <h3 className="font-bold text-lg mb-4 text-gray-900">Pilih Bahasa Interface</h3>
                              <div className="space-y-3">
                                <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                                  <input type="radio" name="language" className="accent-amber-500" defaultChecked />
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">🇮🇩</span>
                                    <span className="font-medium">Bahasa Indonesia</span>
                                  </div>
                                </label>
                                <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                                  <input type="radio" name="language" className="accent-amber-500" />
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">🇺🇸</span>
                                    <span className="font-medium">English</span>
                                  </div>
                                </label>
                                <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                                  <input type="radio" name="language" className="accent-amber-500" />
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">🇸🇦</span>
                                    <span className="font-medium">العربية</span>
                                  </div>
                                </label>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </main>
          </>
        )}
        
        {/* Enhanced Report Modal with Animations */}
        <AnimatePresence>
          {showReportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowReportModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <IconFlag size={20} className="text-red-600" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Laporkan Masalah</h3>
                      <p className="text-sm text-gray-600">Bantu kami memperbaiki aplikasi</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowReportModal(false)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IconX size={16} className="text-gray-600" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Laporan
                    </label>
                    <motion.select
                      value={reportData.target_type}
                      onChange={(e) => setReportData(prev => ({ ...prev, target_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      whileFocus={{ scale: 1.01 }}
                    >
                      <option value="bug">🐛 Bug / Error</option>
                      <option value="feature">✨ Saran Fitur</option>
                      <option value="ui">🎨 Masalah UI/UX</option>
                      <option value="performance">⚡ Performa</option>
                      <option value="content">📝 Konten</option>
                      <option value="pricing">💰 Penyesuaian Harga</option>
                      <option value="other">🔧 Lainnya</option>
                    </motion.select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Masalah
                    </label>
                    <motion.textarea
                      value={reportData.reason}
                      onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder={getPlaceholderText(reportData.target_type)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <motion.button
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Batal
                    </motion.button>
                    <motion.button
                      onClick={submitReport}
                      disabled={isSubmittingReport || !reportData.reason.trim()}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      whileHover={{ scale: isSubmittingReport ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmittingReport ? 1 : 0.98 }}
                    >
                      {isSubmittingReport ? (
                        <motion.div 
                          className="flex items-center justify-center gap-2"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Mengirim...
                        </motion.div>
                      ) : 'Kirim Laporan'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Rating Dialog */}
        <RatingDialog
          isOpen={showRatingDialog}
          onClose={() => setShowRatingDialog(false)}
          onSubmit={handleRatingSubmit}
          onSkip={handleRatingSkip}
        />
        
        {/* Enhanced Floating Button Component */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          onClick={() => setShowReportModal(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-40 group overflow-hidden"
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.4 }
          }}
          whileTap={{ 
            scale: 0.95,
            rotate: 15,
            transition: { duration: 0.1 }
          }}
        >
          {/* Animated Flag Icon */}
          <motion.div
            animate={{ 
              y: [0, -2, 0],
              rotate: [0, 3, 0, -3, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <IconFlag size={20} />
          </motion.div>
          
          {/* Pulse Ring Effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-300"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Secondary Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-red-400"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          
          {/* Background Glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-red-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
                  {/* Enhanced Tooltip */}
          <motion.div 
            className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl"
            initial={{ x: 10, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
          >
            <span className="font-medium">🚩 Laporkan Masalah</span>
            <div className="absolute top-1/2 right-[-4px] transform -translate-y-1/2 w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-gray-900"></div>
          </motion.div>
        </motion.button>
        
        {/* Enhanced FloatingDock - Removed glassmorphism for better icon visibility */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-gray-200">
            <FloatingDock items={dockItems} />
          </div>
        </motion.div>
      </div>
    );
}

export default DashboardSettings;