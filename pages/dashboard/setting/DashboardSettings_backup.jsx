// import { IconAward, IconBorderAll, IconFlag, IconLanguage, IconLock, IconMoon, IconPackage, IconPalette, IconSun, IconUser, IconUserCircle, IconVolume, IconVolumeOff, IconX } from '@tabler/icons-react';
// import { AnimatePresence, motion } from 'framer-motion';
// import Head from 'next/head';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import Header from '../../../components/Header';
// import RatingDialog from '../../../components/dialog/RatingDialog';
// import { Dock } from '../../../components/ui/dock';
// import { Toast, showToast } from '../../../components/ui/toast';
// import { useAuth } from '../../../context/AuthContext';
// import { supabase } from '../../../lib/supabaseClient';

// const cardVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: (i) => ({
//     opacity: 1,
//     y: 0,
//     transition: {
//       delay: i * 0.1,
//       duration: 0.5,
//       ease: 'easeOut'
//     }
//   }),
//   hover: {
//     scale: 1.02,
//     transition: {
//       duration: 0.2
//     }
//   }
// };

// // Tab variants for animations
// const tabVariants = {
//   hidden: { opacity: 0, x: -20 },
//   visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
//   exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
// };

// const DashboardSettings = () => {
//   const router = useRouter();
//   const { user, loading, isAuthenticated, signOut } = useAuth();
//   const [isLoading, setIsLoading] = useState(true);
//   const [darkMode, setDarkMode] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [activeTab, setActiveTab] = useState('appearance');
//   const [userName, setUserName] = useState('');
//   const [userPoints, setUserPoints] = useState(0);
//   const [profileData, setProfileData] = useState({
//     id: null,
//     full_name: '',
//     email: '',
//     level: 1,
//     xp: 0,
//     points: 0,
//     streak: 0,
//     level_description: 'Pemula',
//     energy: 5,
//     is_admin: false,
//     admin_id: null,
//     role: 'student',
//     created_at: null,
//     updated_at: null
//   });
  
//   // Report modal state
//   const [showReportModal, setShowReportModal] = useState(false);
//   const [reportData, setReportData] = useState({
//     target_type: 'bug',
//     reason: ''
//   });
//   const [isSubmittingReport, setIsSubmittingReport] = useState(false);

//   // Rating dialog state
//   const [showRatingDialog, setShowRatingDialog] = useState(false);

//   // Dynamic placeholder text based on report type
//   const getPlaceholderText = (targetType) => {
//     switch (targetType) {
//       case 'bug':
//         return 'Jelaskan bug atau error yang Anda alami secara detail...';
//       case 'feature':
//         return 'Deskripsikan fitur yang Anda inginkan dan alasan mengapa fitur tersebut diperlukan...';
//       case 'ui':
//         return 'Jelaskan masalah tampilan atau pengalaman pengguna yang Anda temui...';
//       case 'performance':
//         return 'Deskripsikan masalah performa seperti loading lambat atau lag yang Anda alami...';
//       case 'content':
//         return 'Jelaskan masalah dengan konten pembelajaran atau materi yang tidak sesuai...';
//       case 'pricing':
//         return 'Sampaikan saran Anda mengenai penyesuaian harga produk atau layanan...';
//       case 'other':
//         return 'Jelaskan masalah atau saran lainnya yang ingin Anda sampaikan...';
//       default:
//         return 'Jelaskan masalah yang Anda alami...';
//     }
//   };

//   // Add inventory state
//   const [inventory, setInventory] = useState({
//     borders: [],
//     avatars: [],
//     items: [],
//     powerups: [],
//     badges: []
//   });

//   // Add loading state for inventory
//   const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  
//   // Check rating status function
//   const checkRatingStatus = async (userId) => {
//     try {
//       const hasRated = localStorage.getItem(`user_rated_${userId}`);
//       if (hasRated) return false;

//       const skippedTime = localStorage.getItem(`user_rating_skipped_${userId}`);
//       if (skippedTime) {
//         const daysSinceSkip = (Date.now() - parseInt(skippedTime)) / (1000 * 60 * 60 * 24);
//         if (daysSinceSkip < 7) return false;
//       }

//       const { data: existingRating } = await supabase
//         .from('rating')
//         .select('id')
//         .eq('user_id', userId)
//         .single();

//       if (existingRating) {
//         localStorage.setItem(`user_rated_${userId}`, 'true');
//         return false;
//       }

//       return true;
//     } catch (error) {
//       console.error('Error checking rating status:', error);
//       return false;
//     }
//   };

//   // Enhanced logout handler
//   const handleLogout = async () => {
//     try {
//       if (!user?.id) {
//         await signOut();
//         return;
//       }

//       const shouldShowRating = await checkRatingStatus(user.id);
      
//       if (shouldShowRating) {
//         setShowRatingDialog(true);
//         return;
//       }

//       setIsLoading(true);
//       await signOut();
//     } catch (error) {
//       console.error('Error during logout:', error);
//       showToast.error('Terjadi kesalahan saat logout. Silakan coba lagi.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Submit rating and logout
//   const handleRatingSubmit = async (rating, comment) => {
//     console.log('Settings: Rating submitted:', rating, comment);
//     setIsLoading(true);
//     await signOut();
//   };

//   // Skip rating and logout
//   const handleRatingSkip = async () => {
//     console.log('Settings: Rating skipped');
//     setIsLoading(true);
//     await signOut();
//   };

//   // Enhanced profile data fetching
//   const fetchProfileData = async (userId) => {
//     try {
//       const { data: profile, error } = await supabase
//         .from('profiles')
//         .select('id, full_name, email, level, xp, points, streak, level_description, energy, is_admin, role')
//         .eq('id', userId)
//         .single();

//       if (error) {
//         console.error('Error fetching profile data:', error);
//         return;
//       }

//       if (profile) {
//         setProfileData(profile);
//         setUserName(profile.full_name || 'User');
//         setUserPoints(profile.points || 0);
//       }
//     } catch (error) {
//       console.error('Error fetching profile data:', error);
//     }
//   };

//   // Enhanced auth check
//   useEffect(() => {
//     if (!loading) {
//       if (!isAuthenticated || !user) {
//         router.replace('/authentication/login');
//         return;
//       }
      
//       const initializeSettings = async () => {
//         try {
//           setIsLoading(true);
//           await fetchProfileData(user.id);
          
//           // Load preferences
//           const savedDarkMode = localStorage.getItem('darkMode') === 'true';
//           setDarkMode(savedDarkMode);
          
//           const savedSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
//           setSoundEnabled(savedSoundEnabled);
          
//           const savedTab = localStorage.getItem('settingsTab');
//           if (savedTab) {
//             setActiveTab(savedTab);
//             localStorage.removeItem('settingsTab');
//           }
//         } catch (error) {
//           console.error('Error initializing settings:', error);
//         } finally {
//           setIsLoading(false);
//         }
//       };

//       initializeSettings();
//     }
//   }, [user, loading, isAuthenticated, router]);

//   // Submit report function with improved error handling
//   const submitReport = async () => {
//     if (!reportData.reason.trim()) {
//       showToast.warning('Silakan masukkan alasan laporan');
//       return;
//     }

//     try {
//       setIsSubmittingReport(true);
      
//       console.log('Submitting report...', {
//         user_id: user.id,
//         target_type: reportData.target_type,
//         reason: reportData.reason.trim()
//       });
      
//       // Method 1: Try API endpoint first (more reliable)
//       try {
//         const response = await fetch('/api/submit-report', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             user_id: user.id,
//             target_type: reportData.target_type,
//             reason: reportData.reason.trim()
//           }),
//         });

//         const result = await response.json();
//         console.log('API Response:', result);

//         if (response.ok && result.success) {
//           showToast.success('Laporan berhasil dikirim melalui API. Terima kasih atas feedback Anda!');
//           setShowReportModal(false);
//           setReportData({ target_type: 'bug', reason: '' });
//           return;
//         } else {
//           console.error('API Error:', result);
//         }
//       } catch (apiError) {
//         console.error('API method failed:', apiError);
//       }
      
//       // Method 2: Try direct Supabase insert
//       try {
//         const { data, error } = await supabase
//           .from('reports')
//           .insert([
//             {
//               user_id: user.id,
//               target_type: reportData.target_type,
//               reason: reportData.reason.trim()
//             }
//           ]);

//         console.log('Direct Supabase response:', { data, error });

//         if (!error) {
//           showToast.success('Laporan berhasil dikirim langsung ke database. Terima kasih atas feedback Anda!');
//           setShowReportModal(false);
//           setReportData({ target_type: 'bug', reason: '' });
//           return;
//         } else {
//           console.error('Direct insert error:', error);
//         }
//       } catch (directError) {
//         console.error('Direct method failed:', directError);
//       }

//       // Method 3: Fallback - save to localStorage
//       console.log('All methods failed, saving to localStorage as fallback');
//       const reports = JSON.parse(localStorage.getItem('pendingReports') || '[]');
//       const newReport = {
//         id: Date.now(),
//         user_id: user.id,
//         user_name: userName || 'Unknown User',
//         target_type: reportData.target_type,
//         reason: reportData.reason.trim(),
//         created_at: new Date().toISOString(),
//         status: 'pending_local'
//       };
      
//       reports.push(newReport);
//       localStorage.setItem('pendingReports', JSON.stringify(reports));
      
//       // Also save to a separate key for easier access
//       const reportKey = `report_${Date.now()}`;
//       localStorage.setItem(reportKey, JSON.stringify(newReport));
      
//       showToast.info(`Laporan tersimpan lokal dengan ID: ${reportKey.split('_')[1]}. Akan dikirim saat koneksi database tersedia.`);
//       setShowReportModal(false);
//       setReportData({ target_type: 'bug', reason: '' });
      
//     } catch (error) {
//       console.error('Unexpected error in submitReport:', error);
      
//       // Final fallback - minimal local storage
//       try {
//         const simpleReport = {
//           id: Date.now(),
//           user: userName || user.id || 'unknown',
//           type: reportData.target_type,
//           message: reportData.reason.trim(),
//           time: new Date().toISOString()
//         };
        
//         localStorage.setItem(`emergency_report_${Date.now()}`, JSON.stringify(simpleReport));
//         showToast.warning('Terjadi kesalahan tidak terduga. Laporan tersimpan dalam mode darurat.');
//       } catch (emergencyError) {
//         console.error('Emergency save failed:', emergencyError);
//         showToast.error('Maaf, sistem mengalami masalah. Silakan coba lagi nanti atau hubungi admin.');
//       }
      
//       setShowReportModal(false);
//       setReportData({ target_type: 'bug', reason: '' });
//     } finally {
//       setIsSubmittingReport(false);
//     }
//   };
    
//     const toggleDarkMode = () => {
//       const newDarkMode = !darkMode;
//       setDarkMode(newDarkMode);
//       localStorage.setItem('darkMode', newDarkMode.toString());
//       document.documentElement.classList.toggle('dark', newDarkMode);
      
//       // Show toast notification
//       showToast.success(newDarkMode ? 'Mode gelap diaktifkan' : 'Mode terang diaktifkan');
      
//       // Efek suara jika sound enabled
//       if (soundEnabled) {
//         const audio = new Audio('/audio/switch.mp3');
//         audio.volume = 0.3;
//         audio.play();
//       }
//     };
    
//     const toggleSound = () => {
//       const newSoundEnabled = !soundEnabled;
//       setSoundEnabled(newSoundEnabled);
//       localStorage.setItem('soundEnabled', newSoundEnabled.toString());
      
//       // Show toast notification
//       showToast.success(newSoundEnabled ? 'Efek suara diaktifkan' : 'Efek suara dinonaktifkan');
      
//       // Efek suara jika mengaktifkan suara
//       if (newSoundEnabled) {
//         const audio = new Audio('/audio/switch.mp3');
//         audio.volume = 0.3;
//         audio.play();
//       }
//     };

//     const dockItems = [
//     { 
//       title: "Dashboard", 
//       icon: <img src="/icon/icons8-home-100.png" alt="Home" className="w-6 h-6" />, 
//       href: '/dashboard/home/Dashboard'
//     },
//     { 
//       title: "Huruf", 
//       icon: <img src="/icon/icons8-scroll-100.png" alt="Huruf" className="w-6 h-6" />, 
//       href: '/dashboard/DashboardHuruf'
//     },
//     { 
//       title: "Belajar & Roadmap", 
//       icon: <img src="/icon/icons8-course-assign-100.png" alt="Belajar" className="w-6 h-6" />, 
//       href: '/dashboard/DashboardBelajar'
//     },
//     {
//       title: "Toko",
//       icon: <img src="/icon/icons8-shopping-cart-100.png" alt="Toko" className="w-6 h-6" />,
//       href: '/dashboard/toko/DashboardShop'
//     },
//     { 
//       title: "Pengaturan", 
//       icon: <img src="/icon/setting.png" alt="Pengaturan" className="w-6 h-6" />, 
//       href: '/dashboard/setting/DashboardSettings'
//     },
//   ];
    
//     // Function to fetch user's inventory with error handling - bypassing RLS issues
//     const fetchInventory = async () => {
//       try {
//         setIsLoadingInventory(true);
//         const userId = localStorage.getItem('userId');
        
//         console.log('Fetching inventory for userId:', userId);
        
//         if (!userId) {
//           console.error('No userId found in localStorage');
//           return;
//         }

//         // Try using the service role through an API endpoint instead
//         try {
//           const response = await fetch('/api/get-inventory', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ userId }),
//           });

//           if (response.ok) {
//             const result = await response.json();
//             console.log('Inventory from API:', result);
            
//             if (result.success && result.data) {
//               const combinedData = result.data;
              
//               // Group items by type
//               const grouped = {
//                 borders: combinedData.filter(item => item.item_type === 'border') || [],
//                 avatars: combinedData.filter(item => item.item_type === 'avatar') || [],
//                 items: combinedData.filter(item => item.item_type === 'item') || [],
//                 powerups: combinedData.filter(item => 
//                   item.item_type === 'power_up' || item.item_type === 'powerup'
//                 ) || [],
//                 badges: combinedData.filter(item => item.item_type === 'badge') || []
//               };

//               console.log('Final grouped inventory:', grouped);
//               setInventory(grouped);
//               return;
//             }
//           }
//         } catch (apiError) {
//           console.log('API approach failed, trying direct query:', apiError);
//         }

//         // Fallback to direct Supabase query with different approaches
//         console.log('Trying direct Supabase query...');

//         // Method 1: Try with anon key but user context
//         const { data: sessionData } = await supabase.auth.getSession();
//         console.log('Current session:', sessionData?.session?.user?.id);

//         // Method 2: Simple select without join first
//         const { data: inventoryData, error: inventoryError } = await supabase
//           .from('user_inventory')
//           .select('*')
//           .eq('user_id', userId);

//         if (inventoryError) {
//           console.error('Error fetching inventory:', inventoryError);
          
//           // Method 3: Try with RPC function if direct query fails
//           try {
//             const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_inventory', {
//               p_user_id: userId
//             });
            
//             if (!rpcError && rpcData) {
//               console.log('RPC inventory data:', rpcData);
              
//               const grouped = {
//                 borders: rpcData.filter(item => item.item_type === 'border') || [],
//                 avatars: rpcData.filter(item => item.item_type === 'avatar') || [],
//                 items: rpcData.filter(item => item.item_type === 'item') || [],
//                 powerups: rpcData.filter(item => 
//                   item.item_type === 'power_up' || item.item_type === 'powerup'
//                 ) || [],
//                 badges: rpcData.filter(item => item.item_type === 'badge') || []
//               };

//               setInventory(grouped);
//               return;
//             }
//           } catch (rpcError) {
//             console.error('RPC also failed:', rpcError);
//           }
          
//           throw inventoryError;
//         }

//         console.log('Raw inventory data received:', inventoryData);

//         if (!inventoryData || inventoryData.length === 0) {
//           console.log('No inventory items found for user');
//           setInventory({
//             borders: [],
//             avatars: [],
//             items: [],
//             powerups: [],
//             badges: []
//           });
//           return;
//         }

//         // Get all unique item IDs from inventory
//         const itemIds = [...new Set(inventoryData.map(item => item.item_id))];
//         console.log('Item IDs to fetch:', itemIds);

//         // Fetch shop items separately
//         const { data: shopItemsData, error: shopError } = await supabase
//           .from('shop_items')
//           .select('*')
//           .in('id', itemIds);

//         if (shopError) {
//           console.error('Error fetching shop items:', shopError);
//           // Continue with inventory data even if shop items fail
//         }

//         console.log('Shop items data:', shopItemsData);

//         // Combine inventory with shop items manually
//         const combinedData = inventoryData.map(invItem => {
//           const shopItem = shopItemsData?.find(shop => shop.id === invItem.item_id);
//           return {
//             ...invItem,
//             shop_items: shopItem || {
//               id: invItem.item_id,
//               name: `Item ${invItem.item_id}`,
//               description: 'Item description not available',
//               type: invItem.item_type,
//               image: null
//             }
//           };
//         });

//         console.log('Combined inventory data:', combinedData);

//         // Group items by type
//         const grouped = {
//           borders: combinedData.filter(item => item.item_type === 'border') || [],
//           avatars: combinedData.filter(item => item.item_type === 'avatar') || [],
//           items: combinedData.filter(item => item.item_type === 'item') || [],
//           powerups: combinedData.filter(item => 
//             item.item_type === 'power_up' || item.item_type === 'powerup'
//           ) || [],
//           badges: combinedData.filter(item => item.item_type === 'badge') || []
//         };

//         console.log('Final grouped inventory:', grouped);
//         setInventory(grouped);
        
//       } catch (error) {
//         console.error('Error in fetchInventory:', error);
//         // Set empty inventory on error but don't crash
//         setInventory({
//           borders: [],
//           avatars: [],
//           items: [],
//           powerups: [],
//           badges: []
//         });
//       } finally {
//         setIsLoadingInventory(false);
//       }
//     };

//     // Function to toggle equipment status with better error handling
//     const toggleEquipItem = async (inventoryId, type) => {
//       try {
//         const userId = localStorage.getItem('userId');
        
//         if (!userId) {
//           showToast.error('User ID tidak ditemukan. Silakan login ulang.');
//           router.push('/authentication/login');
//           return;
//         }

//         console.log(`Toggling item ${inventoryId} of type ${type}`);

//         // Use API endpoint instead of direct Supabase calls
//         const response = await fetch('/api/equip-item', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             userId: userId,
//             inventoryId: inventoryId,
//             itemType: type
//           }),
//         });

//         const result = await response.json();

//         if (!response.ok) {
//           console.error('API Error Response:', result);
//           throw new Error(result.error || 'Failed to equip item');
//         }

//         if (result.success) {
//           console.log('Item equipped successfully:', result);
          
//           // Refresh inventory immediately
//           await fetchInventory();
          
//           // Show success message
//           showToast.success('Item berhasil dipakai!');
          
//           // Trigger events for other components INCLUDING HEADER
//           localStorage.setItem('inventoryUpdated', Date.now().toString());
//           window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
//             detail: { userId, timestamp: Date.now(), itemType: type } 
//           }));
          
//           // Trigger storage event for cross-component communication
//           window.dispatchEvent(new StorageEvent('storage', {
//             key: 'inventoryUpdated',
//             newValue: Date.now().toString()
//           }));
//         } else {
//           throw new Error(result.error || 'Failed to equip item');
//         }
        
//       } catch (error) {
//         console.error('Error toggling item:', error);
//         showToast.error(`Gagal mengubah status item: ${error.message}`);
//       }
//     };

//     // COMPLETELY REWRITE useEffect to stop infinite loops
//     useEffect(() => {
//       const checkAuth = () => {
//         const isLoggedIn = localStorage.getItem('isLoggedIn');
//         if (!isLoggedIn || isLoggedIn !== 'true') {
//           router.push('/authentication/login');
//           return false;
//         }
//         return true;
//       };

//       if (!checkAuth()) return;

//       // Initial fetch only
//       fetchInventory();

//       // MUCH LESS AGGRESSIVE refresh - only every 30 seconds
//       const inventoryRefreshInterval = setInterval(() => {
//         if (document.visibilityState === 'visible') {
//           fetchInventory();
//         }
//       }, 30000); // 30 seconds instead of 3

//       // Only listen for storage changes, nothing else
//       const handleStorageChange = (e) => {
//         if (e.key === 'inventoryUpdated') {
//           console.log('Settings: Storage inventory update detected');
//           // Debounce the fetch to prevent rapid calls
//           setTimeout(() => {
//             fetchInventory();
//           }, 1000);
//         }
//       };

//       window.addEventListener('storage', handleStorageChange);

//       // Clean up
//       return () => {
//         clearInterval(inventoryRefreshInterval);
//         window.removeEventListener('storage', handleStorageChange);
//       };
//     }, [router]); // Remove all other dependencies to prevent re-running

//     // Add a manual refresh button
//     const handleRefreshInventory = async () => {
//       setIsLoadingInventory(true);
//       await fetchInventory();
//     };

//     // Add inventory tab content with refresh button
//     const renderInventoryTab = () => (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="space-y-6"
//       >
//         <div className="flex justify-between items-center">
//           <h2 className="text-2xl font-bold">Inventori Saya</h2>
//           <button
//             onClick={handleRefreshInventory}
//             disabled={isLoadingInventory}
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
//           >
//             <svg 
//               className={`w-4 h-4 ${isLoadingInventory ? 'animate-spin' : ''}`} 
//               fill="none" 
//               stroke="currentColor" 
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//             Refresh
//           </button>
//         </div>

//         {/* Debug info */}
//         <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
//           Debug: Borders: {inventory.borders.length}, Avatars: {inventory.avatars.length}, Items: {inventory.items.length}, Powerups: {inventory.powerups.length}, Badges: {inventory.badges.length}
//         </div>
        
//         {isLoadingInventory ? (
//           <div className="flex justify-center py-12">
//             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         ) : (
//           <>
//             {/* Borders Section */}
//             <div className="bg-white p-6 rounded-xl shadow-sm">
//               <div className="flex items-center gap-3 mb-4">
//                 <IconBorderAll size={24} className="text-blue-500" />
//                 <h3 className="text-lg font-semibold">Border ({inventory.borders.length})</h3>
//               </div>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {inventory.borders.map(item => (
//                   <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
//                     <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
//                       {item.shop_items?.image || item.shop_items?.thumbnail ? (
//                         <img 
//                           src={item.shop_items.thumbnail || item.shop_items.image} 
//                           alt={item.shop_items.name} 
//                           className="h-20 w-20 object-contain"
//                           onError={(e) => {
//                             console.log('Border image failed to load, showing fallback icon');
//                             e.target.style.display = 'none';
//                             e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
//                           }}
//                         />
//                       ) : null}
//                       <div className="fallback-icon absolute inset-0 flex items-center justify-center">
//                         <IconBorderAll size={32} className="text-gray-400" />
//                       </div>
//                     </div>
//                     <h4 className="font-medium mb-1">{item.shop_items?.name || `Border ${item.item_id}`}</h4>
//                     <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
//                     <button
//                       onClick={() => toggleEquipItem(item.id, 'border')}
//                       className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
//                         item.is_equipped
//                           ? 'bg-green-100 text-green-700 hover:bg-green-200'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       {item.is_equipped ? 'Dipakai' : 'Pakai'}
//                     </button>
//                   </div>
//                 ))}
//                 {inventory.borders.length === 0 && (
//                   <div className="col-span-full text-center py-8 text-gray-500">
//                     Belum ada border. Dapatkan border di toko.
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Avatars Section */}
//             <div className="bg-white p-6 rounded-xl shadow-sm">
//               <div className="flex items-center gap-3 mb-4">
//                 <IconUser size={24} className="text-purple-500" />
//                 <h3 className="text-lg font-semibold">Avatar ({inventory.avatars.length})</h3>
//               </div>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {inventory.avatars.map(item => (
//                   <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
//                     <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
//                       {item.shop_items?.image || item.shop_items?.thumbnail ? (
//                         <>
//                           {(item.shop_items.image || item.shop_items.thumbnail)?.endsWith('.mp4') ? (
//                             <video
//                               autoPlay
//                               loop
//                               muted
//                               playsInline
//                               className="h-20 w-20 object-cover rounded"
//                               onError={(e) => {
//                                 console.log('Avatar video failed to load, showing fallback icon');
//                                 e.target.style.display = 'none';
//                                 e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
//                               }}
//                             >
//                               <source src={item.shop_items.thumbnail || item.shop_items.image} type="video/mp4" />
//                             </video>
//                           ) : (
//                             <img 
//                               src={item.shop_items.thumbnail || item.shop_items.image} 
//                               alt={item.shop_items.name} 
//                               className="h-20 w-20 object-contain"
//                               onError={(e) => {
//                                 console.log('Avatar image failed to load, showing fallback icon');
//                                 e.target.style.display = 'none';
//                                 e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
//                               }}
//                             />
//                           )}
//                         </>
//                       ) : null}
//                       <div className="fallback-icon absolute inset-0 flex items-center justify-center">
//                         <IconUser size={32} className="text-gray-400" />
//                       </div>
//                     </div>
//                     <h4 className="font-medium mb-1">{item.shop_items?.name || `Avatar ${item.item_id}`}</h4>
//                     <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
//                     <button
//                       onClick={() => toggleEquipItem(item.id, 'avatar')}
//                       className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
//                         item.is_equipped
//                           ? 'bg-green-100 text-green-700 hover:bg-green-200'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       {item.is_equipped ? 'Dipakai' : 'Pakai'}
//                     </button>
//                   </div>
//                 ))}
//                 {inventory.avatars.length === 0 && (
//                   <div className="col-span-full text-center py-8 text-gray-500">
//                     Belum ada avatar. Dapatkan avatar di toko.
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Items Section */}
//             <div className="bg-white p-6 rounded-xl shadow-sm">
//               <div className="flex items-center gap-3 mb-4">
//                 <IconPalette size={24} className="text-yellow-500" />
//                 <h3 className="text-lg font-semibold">Item ({inventory.items.length})</h3>
//               </div>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {inventory.items.map(item => (
//                   <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
//                     <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
//                       {item.shop_items?.image || item.shop_items?.thumbnail ? (
//                         <img 
//                           src={item.shop_items.thumbnail || item.shop_items.image} 
//                           alt={item.shop_items.name} 
//                           className="h-20 w-20 object-contain"
//                           onError={(e) => {
//                             console.log('Item image failed to load, showing fallback icon');
//                             e.target.style.display = 'none';
//                             e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
//                           }}
//                         />
//                       ) : null}
//                       <div className="fallback-icon absolute inset-0 flex items-center justify-center">
//                         <IconPalette size={32} className="text-gray-400" />
//                       </div>
//                     </div>
//                     <h4 className="font-medium mb-1">{item.shop_items?.name || `Item ${item.item_id}`}</h4>
//                     <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
//                     <button
//                       onClick={() => toggleEquipItem(item.id, 'item')}
//                       className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
//                         item.is_equipped
//                           ? 'bg-green-100 text-green-700 hover:bg-green-200'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       {item.is_equipped ? 'Dipakai' : 'Pakai'}
//                     </button>
//                   </div>
//                 ))}
//                 {inventory.items.length === 0 && (
//                   <div className="col-span-full text-center py-8 text-gray-500">
//                     Belum ada item. Dapatkan item di toko.
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Badges Section */}
//             <div className="bg-white p-6 rounded-xl shadow-sm">
//               <div className="flex items-center gap-3 mb-4">
//                 <IconAward size={24} className="text-orange-500" />
//                 <h3 className="text-lg font-semibold">Badge ({inventory.badges.length})</h3>
//               </div>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {inventory.badges.map(item => (
//                   <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
//                     <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
//                       {item.shop_items?.image || item.shop_items?.thumbnail ? (
//                         <img 
//                           src={item.shop_items.thumbnail || item.shop_items.image} 
//                           alt={item.shop_items.name} 
//                           className="h-20 w-20 object-contain"
//                           onError={(e) => {
//                             console.log('Badge image failed to load, showing fallback icon');
//                             e.target.style.display = 'none';
//                             e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
//                           }}
//                         />
//                       ) : null}
//                       <div className="fallback-icon absolute inset-0 flex items-center justify-center">
//                         <IconAward size={32} className="text-gray-400" />
//                       </div>
//                     </div>
//                     <h4 className="font-medium mb-1">{item.shop_items?.name || `Badge ${item.item_id}`}</h4>
//                     <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
//                     <button
//                       onClick={() => toggleEquipItem(item.id, 'badge')}
//                       className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
//                         item.is_equipped
//                           ? 'bg-green-100 text-green-700 hover:bg-green-200'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       {item.is_equipped ? 'Dipakai' : 'Pakai'}
//                     </button>
//                   </div>
//                 ))}
//                 {inventory.badges.length === 0 && (
//                   <div className="col-span-full text-center py-8 text-gray-500">
//                     Belum ada badge. Dapatkan badge di toko.
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Powerups Section */}
//             <div className="bg-white p-6 rounded-xl shadow-sm">
//               <div className="flex items-center gap-3 mb-4">
//                 <IconPackage size={24} className="text-green-500" />
//                 <h3 className="text-lg font-semibold">Power-ups ({inventory.powerups.length})</h3>
//               </div>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {inventory.powerups.map(item => (
//                   <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
//                     <div className="mb-3 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
//                       {item.shop_items?.image || item.shop_items?.thumbnail ? (
//                         <img 
//                           src={item.shop_items.thumbnail || item.shop_items.image} 
//                           alt={item.shop_items.name} 
//                           className="h-20 w-20 object-contain"
//                           onError={(e) => {
//                             console.log('Powerup image failed to load, showing fallback icon');
//                             e.target.style.display = 'none';
//                             e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
//                           }}
//                         />
//                       ) : null}
//                       <div className="fallback-icon absolute inset-0 flex items-center justify-center">
//                         <IconPackage size={32} className="text-gray-400" />
//                       </div>
//                     </div>
//                     <h4 className="font-medium mb-1">{item.shop_items?.name || `Power-up ${item.item_id}`}</h4>
//                     <p className="text-sm text-gray-500 mb-3">{item.shop_items?.description || 'No description'}</p>
//                     <button
//                       onClick={() => toggleEquipItem(item.id, 'powerup')}
//                       className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
//                         item.is_equipped
//                           ? 'bg-green-100 text-green-700 hover:bg-green-200'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       {item.is_equipped ? 'Dipakai' : 'Pakai'}
//                     </button>
//                   </div>
//                 ))}
//                 {inventory.powerups.length === 0 && (
//                   <div className="col-span-full text-center py-8 text-gray-500">
//                     Belum ada power-ups. Dapatkan power-ups di toko.
//                   </div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </motion.div>
//     );

//     // Animasi untuk tab content
//     const tabVariants = {
//       hidden: { opacity: 0, x: -20 },
//       visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
//       exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
//     };
    
//     // Animasi untuk card
//     const cardVariants = {
//       hidden: { opacity: 0, y: 20 },
//       visible: (i) => ({
//         opacity: 1,
//         y: 0,
//         transition: {
//           delay: i * 0.1,
//           duration: 0.4,
//           ease: [0.25, 0.1, 0.25, 1.0]
//         }
//       }),
//       hover: { scale: 1.02, transition: { duration: 0.2 } }
//     };

//     return (
//       <>
//         <Toast />
//         <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
//           <Head>
//             <title>Pengaturan | Belajar Makhraj</title>
//             <meta name="description" content="Pengaturan aplikasi Belajar Makhraj" />
//           </Head>

//         <Header 
//           userName={userName}
//           profileData={profileData}
//           onLogout={handleLogout}
//           onProfileUpdate={fetchProfileData}
//         />

//         {isLoading ? (
//           <div className="flex items-center justify-center min-h-screen">
//             <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
//           </div>
//         ) : (
//           <div className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
//             <motion.div 
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className="flex items-center justify-between mb-8"
//             >
//               <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Pengaturan</h1>
//               <div className="flex items-center space-x-4">
//                 <div className={`px-4 py-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
//                   <span className="font-medium">Halo, {userName}</span>
//                 </div>
//               </div>
//             </motion.div>
            
//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//               {/* Sidebar */}
//               <motion.div 
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.5, delay: 0.1 }}
//                 className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 h-fit`}
//               >
//                 <h2 className="text-xl font-bold mb-6">Menu Pengaturan</h2>
//                 <nav className="space-y-2">
//                   <button 
//                     onClick={() => setActiveTab('appearance')} 
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'appearance' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
//                   >
//                     <IconPalette size={20} />
//                     <span>Tampilan</span>
//                   </button>
//                   <button 
//                     onClick={() => setActiveTab('account')} 
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'account' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
//                   >
//                     <IconUserCircle size={20} />
//                     <span>Akun</span>
//                   </button>
//                   <button 
//                     onClick={() => setActiveTab('security')} 
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
//                   >
//                     <IconLock size={20} />
//                     <span>Keamanan</span>
//                   </button>
//                   <button 
//                     onClick={() => setActiveTab('inventory')} 
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
//                   >
//                     <IconPackage size={20} />
//                     <span>Inventori</span>
//                   </button>
//                   <button 
//                     onClick={() => setActiveTab('language')} 
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'language' ? 'bg-blue-500 text-white' : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}`}
//                   >
//                     <IconLanguage size={20} />
//                     <span>Bahasa</span>
//                   </button>
//                 </nav>
//               </motion.div>
              
//               {/* Content Area */}
//               <motion.div 
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.2 }}
//                 className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 lg:col-span-3`}
//               >
//                 <AnimatePresence mode="wait">
//                   {activeTab === 'appearance' && (
//                     <motion.div 
//                       key="appearance"
//                       variants={tabVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="exit"
//                     >
//                       <h2 className="text-2xl font-bold mb-6">Pengaturan Tampilan</h2>
                      
//                       <div className="space-y-8">
//                         {/* Dark Mode Toggle */}
//                         <motion.div 
//                           variants={cardVariants}
//                           initial="hidden"
//                           animate="visible"
//                           custom={0}
//                           whileHover="hover"
//                           className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl transition-all`}
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-4">
//                               {darkMode ? <IconMoon size={24} /> : <IconSun size={24} />}
//                               <div>
//                                 <h3 className="font-semibold text-lg">Mode Gelap</h3>
//                                 <p className="text-sm opacity-70">Ubah tampilan aplikasi ke mode gelap</p>
//                               </div>
//                             </div>
//                             <button 
//                               onClick={toggleDarkMode}
//                               className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
//                             >
//                               <motion.div 
//                                 className="bg-white w-5 h-5 rounded-full shadow-md"
//                                 animate={{ x: darkMode ? 28 : 0 }}
//                                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                               />
//                             </button>
//                           </div>
//                         </motion.div>
                        
//                         {/* Sound Toggle */}
//                         <motion.div 
//                           variants={cardVariants}
//                           initial="hidden"
//                           animate="visible"
//                           custom={1}
//                           whileHover="hover"
//                           className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl transition-all`}
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-4">
//                               {soundEnabled ? <IconVolume size={24} /> : <IconVolumeOff size={24} />}
//                               <div>
//                                 <h3 className="font-semibold text-lg">Efek Suara</h3>
//                                 <p className="text-sm opacity-70">Aktifkan efek suara saat berinteraksi</p>
//                               </div>
//                             </div>
//                             <button 
//                               onClick={toggleSound}
//                               className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
//                             >
//                               <motion.div 
//                                 className="bg-white w-5 h-5 rounded-full shadow-md"
//                                 animate={{ x: soundEnabled ? 28 : 0 }}
//                                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                               />
//                             </button>
//                           </div>
//                         </motion.div>
//                       </div>
//                     </motion.div>
//                   )}
                  
//                   {activeTab === 'account' && (
//                     <motion.div 
//                       key="account"
//                       variants={tabVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="exit"
//                     >
//                       <h2 className="text-2xl font-bold mb-6">Pengaturan Akun</h2>
//                       <div className="space-y-6">
//                         <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl`}>
//                           <h3 className="font-semibold text-lg mb-4">Informasi Profil</h3>
//                           <div className="space-y-4">
//                             <div>
//                               <label className="block text-sm font-medium mb-1">Nama Pengguna</label>
//                               <input 
//                                 type="text" 
//                                 value={userName}
//                                 onChange={(e) => setUserName(e.target.value)}
//                                 className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-sm font-medium mb-1">Email</label>
//                               <input 
//                                 type="email" 
//                                 value={profileData.email || 'user@example.com'} 
//                                 disabled
//                                 className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} opacity-70`}
//                               />
//                             </div>
//                             <button 
//                               onClick={() => showToast.success('Perubahan berhasil disimpan!')}
//                               className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
//                             >
//                               Simpan Perubahan
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}
                  
//                   {activeTab === 'security' && (
//                     <motion.div 
//                       key="security"
//                       variants={tabVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="exit"
//                     >
//                       <h2 className="text-2xl font-bold mb-6">Pengaturan Keamanan</h2>
//                       <div className="space-y-6">
//                         <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl`}>
//                           <h3 className="font-semibold text-lg mb-4">Ubah Kata Sandi</h3>
//                           <div className="space-y-4">
//                             <div>
//                               <label className="block text-sm font-medium mb-1">Kata Sandi Lama</label>
//                               <input 
//                                 type="password" 
//                                 placeholder="••••••••"
//                                 className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-sm font-medium mb-1">Kata Sandi Baru</label>
//                               <input 
//                                 type="password" 
//                                 placeholder="••••••••"
//                                 className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-sm font-medium mb-1">Konfirmasi Kata Sandi Baru</label>
//                               <input 
//                                 type="password" 
//                                 placeholder="••••••••"
//                                 className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
//                               />
//                             </div>
//                             <button 
//                               onClick={() => showToast.success('Kata sandi berhasil diperbarui!')}
//                               className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
//                             >
//                               Perbarui Kata Sandi
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}
                  
//                   {activeTab === 'inventory' && renderInventoryTab()}
                  
//                   {activeTab === 'language' && (
//                     <motion.div 
//                       key="language"
//                       variants={tabVariants}
//                       initial="hidden"
//                       animate="visible"
//                       exit="exit"
//                     >
//                       <h2 className="text-2xl font-bold mb-6">Pengaturan Bahasa</h2>
//                       <div className="space-y-6">
//                         <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-xl`}>
//                           <h3 className="font-semibold text-lg mb-4">Pilih Bahasa</h3>
//                           <div className="space-y-2">
//                             <label className="flex items-center space-x-3">
//                               <input type="radio" name="language" className="accent-blue-500" checked />
//                               <span>Bahasa Indonesia</span>
//                             </label>
//                             <label className="flex items-center space-x-3">
//                               <input type="radio" name="language" className="accent-blue-500" />
//                               <span>English</span>
//                             </label>
//                             <label className="flex items-center space-x-3">
//                               <input type="radio" name="language" className="accent-blue-500" />
//                               <span>العربية</span>
//                             </label>
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             </div>
//           </div>
//         )}
        
//         {/* Report Modal */}
//         <AnimatePresence>
//           {showReportModal && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setShowReportModal(false)}
//               className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
//             >
//               <motion.div
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0.9, opacity: 0 }}
//                 onClick={(e) => e.stopPropagation()}
//                 className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg cursor-default"
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-xl font-bold text-gray-800">Laporkan Masalah</h3>
//                   <button 
//                     onClick={() => setShowReportModal(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <IconX size={24} />
//                   </button>
//                 </div>
                
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Jenis Masalah
//                     </label>
//                     <select
//                       value={reportData.target_type}
//                       onChange={(e) => setReportData(prev => ({ ...prev, target_type: e.target.value }))}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="bug">Bug/Error</option>
//                       <option value="feature">Permintaan Fitur</option>
//                       <option value="ui">Masalah UI/UX</option>
//                       <option value="performance">Masalah Performa</option>
//                       <option value="content">Masalah Konten</option>
//                       <option value="pricing">Saran Harga</option>
//                       <option value="other">Lainnya</option>
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Deskripsi Masalah
//                     </label>
//                     <textarea
//                       value={reportData.reason}
//                       onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
//                       placeholder={getPlaceholderText(reportData.target_type)}
//                       rows={4}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                     />
//                   </div>
//                 </div>
                
//                 <div className="flex gap-3 mt-6">
//                   <button
//                     onClick={() => setShowReportModal(false)}
//                     className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
//                     disabled={isSubmittingReport}
//                   >
//                     Batal
//                   </button>
//                   <button
//                     onClick={submitReport}
//                     className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                     disabled={isSubmittingReport}
//                   >
//                     {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan'}
//                   </button>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
        
//         {/* Rating Dialog */}
//         <AnimatePresence>
//           {showRatingDialog && (
//             <RatingDialog
//               isOpen={showRatingDialog}
//               onClose={() => setShowRatingDialog(false)}
//               onSubmit={handleRatingSubmit}
//               onSkip={handleRatingSkip}
//             />
//           )}
//         </AnimatePresence>
        
//         {/* Dock Navigation */}
//         <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
//           <Dock items={dockItems} />
//         </div>
        
//         {/* Report Button */}
//         <motion.button
//           initial={{ opacity: 0, scale: 0 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 1.5, duration: 0.4 }}
//           onClick={() => setShowReportModal(true)}
//           className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-40 group overflow-hidden"
//           whileHover={{ 
//             scale: 1.1,
//             rotate: [0, -5, 5, 0],
//             transition: { duration: 0.4 }
//           }}
//           whileTap={{ 
//             scale: 0.95,
//             rotate: 15,
//             transition: { duration: 0.1 }
//           }}
//         >
//           <motion.div
//             animate={{ 
//               y: [0, -2, 0],
//               rotate: [0, 3, 0, -3, 0]
//             }}
//             transition={{ 
//               duration: 3,
//               repeat: Infinity,
//               ease: "easeInOut"
//             }}
//           >
//             <IconFlag size={20} />
//           </motion.div>
          
//           {/* Tooltip */}
//           <motion.div 
//             className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl"
//             initial={{ x: 10, opacity: 0 }}
//             whileHover={{ x: 0, opacity: 1 }}
//           >
//             <span className="font-medium">🚩 Laporkan Masalah</span>
//             <div className="absolute top-1/2 right-[-4px] transform -translate-y-1/2 w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-gray-900"></div>
//           </motion.div>
//         </motion.button>
        
//         {/* Toast */}
//         <Toast />
//       </div>
//     );
                
//                 {/* Enhanced Content Area */}
//                 <motion.div 
//                   initial={{ opacity: 0, y: 40 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6, delay: 0.5 }}
//                   className="xl:col-span-3"
//                 >
//                   <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 min-h-[600px]">
//                     <AnimatePresence mode="wait">
//                       {activeTab === 'appearance' && (
//                         <motion.div 
//                           key="appearance"
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: -20 }}
//                           transition={{ duration: 0.4 }}
//                           className="space-y-8"
//                         >
//                           <div className="mb-8">
//                             <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan Tampilan</h2>
//                             <p className="text-gray-600">Kustomisasi tampilan dan tema aplikasi</p>
//                           </div>
                          
//                           <div className="space-y-6">
//                             {/* Dark Mode Toggle - Simplified */}
//                             <motion.div 
//                               initial={{ opacity: 0, scale: 0.95 }}
//                               animate={{ opacity: 1, scale: 1 }}
//                               transition={{ delay: 0.2 }}
//                               className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-all duration-300 border border-gray-200 hover:border-gray-300"
//                             >
//                               <div className="flex items-center justify-between">
//                                 <div>
//                                   <h3 className="font-bold text-lg text-gray-900 mb-1">Mode Gelap</h3>
//                                   <p className="text-sm text-gray-600">Mengaktifkan tema gelap untuk kenyamanan mata</p>
//                                 </div>
//                                 <button 
//                                   onClick={toggleDarkMode}
//                                   className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
//                                     darkMode ? 'bg-blue-500' : 'bg-gray-300'
//                                   }`}
//                                 >
//                                   <motion.div 
//                                     className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
//                                     animate={{ x: darkMode ? 32 : 4 }}
//                                     transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                                   >
//                                     {darkMode ? 
//                                       <IconMoon size={12} className="text-blue-600" /> : 
//                                       <IconSun size={12} className="text-amber-500" />
//                                     }
//                                   </motion.div>
//                                 </button>
//                               </div>
//                             </motion.div>
                            
//                             {/* Sound Toggle - Simplified */}
//                             <motion.div 
//                               initial={{ opacity: 0, scale: 0.95 }}
//                               animate={{ opacity: 1, scale: 1 }}
//                               transition={{ delay: 0.3 }}
//                               className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-all duration-300 border border-gray-200 hover:border-gray-300"
//                             >
//                               <div className="flex items-center justify-between">
//                                 <div>
//                                   <h3 className="font-bold text-lg text-gray-900 mb-1">Efek Suara</h3>
//                                   <p className="text-sm text-gray-600">Mengaktifkan efek suara saat berinteraksi</p>
//                                 </div>
//                                 <button 
//                                   onClick={toggleSound}
//                                   className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
//                                     soundEnabled ? 'bg-green-500' : 'bg-gray-300'
//                                   }`}
//                                 >
//                                   <motion.div 
//                                     className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
//                                     animate={{ x: soundEnabled ? 32 : 4 }}
//                                     transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                                   >
//                                     {soundEnabled ? 
//                                       <IconVolume size={12} className="text-green-600" /> : 
//                                       <IconVolumeOff size={12} className="text-gray-400" />
//                                     }
//                                   </motion.div>
//                                 </button>
//                               </div>
//                             </motion.div>
//                           </div>
//                         </motion.div>
//                       )}
                      
//                       {activeTab === 'account' && (
//                         <motion.div 
//                           key="account"
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: -20 }}
//                           transition={{ duration: 0.4 }}
//                           className="space-y-8"
//                         >
//                           <div className="flex items-center gap-4 mb-8">
//                             <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
//                               <IconUserCircle size={24} className="text-white" />
//                             </div>
//                             <div>
//                               <h2 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h2>
//                               <p className="text-gray-600">Kelola informasi profil dan akun Anda</p>
//                             </div>
//                           </div>
                          
//                           <div className="space-y-6">
//                             <motion.div 
//                               initial={{ opacity: 0, scale: 0.95 }}
//                               animate={{ opacity: 1, scale: 1 }}
//                               transition={{ delay: 0.2 }}
//                               className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200"
//                             >
//                               <h3 className="font-bold text-lg mb-4 text-gray-900">Informasi Profil</h3>
//                               <div className="space-y-4">
//                                 <div>
//                                   <label className="block text-sm font-medium mb-2 text-gray-700">Nama Lengkap</label>
//                                   <input 
//                                     type="text" 
//                                     value={profileData.full_name || ''}
//                                     disabled
//                                     className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 font-medium"
//                                   />
//                                 </div>
//                                 <div>
//                                   <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
//                                   <input 
//                                     type="email" 
//                                     value={profileData.email || ''} 
//                                     disabled
//                                     className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 opacity-70"
//                                   />
//                                 </div>
//                                 <div className="grid grid-cols-2 gap-4">
//                                   <div>
//                                     <label className="block text-sm font-medium mb-2 text-gray-700">Level</label>
//                                     <input 
//                                       type="text" 
//                                       value={`Level ${profileData.level} - ${profileData.level_description}`}
//                                       disabled
//                                       className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
//                                     />
//                                   </div>
//                                   <div>
//                                     <label className="block text-sm font-medium mb-2 text-gray-700">Points</label>
//                                     <input 
//                                       type="text" 
//                                       value={`${profileData.points} points`}
//                                       disabled
//                                       className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
//                                     />
//                                   </div>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           </div>
//                         </motion.div>
//                       )}
                      
//                       {activeTab === 'security' && (
//                         <motion.div 
//                           key="security"
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: -20 }}
//                           transition={{ duration: 0.4 }}
//                           className="space-y-8"
//                         >
//                           <div className="flex items-center gap-4 mb-8">
//                             <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
//                               <IconLock size={24} className="text-white" />
//                             </div>
//                             <div>
//                               <h2 className="text-2xl font-bold text-gray-900">Pengaturan Keamanan</h2>
//                               <p className="text-gray-600">Kelola keamanan dan privasi akun Anda</p>
//                             </div>
//                           </div>
                          
//                           <div className="space-y-6">
//                             <motion.div 
//                               initial={{ opacity: 0, scale: 0.95 }}
//                               animate={{ opacity: 1, scale: 1 }}
//                               transition={{ delay: 0.2 }}
//                               className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200"
//                             >
//                               <h3 className="font-bold text-lg mb-4 text-gray-900">Ubah Kata Sandi</h3>
//                               <div className="space-y-4">
//                                 <div>
//                                   <label className="block text-sm font-medium mb-2 text-gray-700">Kata Sandi Lama</label>
//                                   <input 
//                                     type="password" 
//                                     placeholder="••••••••"
//                                     className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
//                                   />
//                                 </div>
//                                 <div>
//                                   <label className="block text-sm font-medium mb-2 text-gray-700">Kata Sandi Baru</label>
//                                   <input 
//                                     type="password" 
//                                     placeholder="••••••••"
//                                     className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
//                                   />
//                                 </div>
//                                 <div>
//                                   <label className="block text-sm font-medium mb-2 text-gray-700">Konfirmasi Kata Sandi Baru</label>
//                                   <input 
//                                     type="password" 
//                                     placeholder="••••••••"
//                                     className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900"
//                                   />
//                                 </div>
//                                 <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl">
//                                   Perbarui Kata Sandi
//                                 </button>
//                               </div>
//                             </motion.div>
//                           </div>
//                         </motion.div>
//                       )}
                      
//                       {activeTab === 'inventory' && renderInventoryTab()}
                      
//                       {activeTab === 'language' && (
//                         <motion.div 
//                           key="language"
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           exit={{ opacity: 0, y: -20 }}
//                           transition={{ duration: 0.4 }}
//                           className="space-y-8"
//                         >
//                           <div className="flex items-center gap-4 mb-8">
//                             <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
//                               <IconLanguage size={24} className="text-white" />
//                             </div>
//                             <div>
//                               <h2 className="text-2xl font-bold text-gray-900">Pengaturan Bahasa</h2>
//                               <p className="text-gray-600">Pilih bahasa yang digunakan dalam aplikasi</p>
//                             </div>
//                           </div>
                          
//                           <div className="space-y-6">
//                             <motion.div 
//                               initial={{ opacity: 0, scale: 0.95 }}
//                               animate={{ opacity: 1, scale: 1 }}
//                               transition={{ delay: 0.2 }}
//                               className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200"
//                             >
//                               <h3 className="font-bold text-lg mb-4 text-gray-900">Pilih Bahasa Interface</h3>
//                               <div className="space-y-3">
//                                 <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
//                                   <input type="radio" name="language" className="accent-amber-500" defaultChecked />
//                                   <div className="flex items-center gap-3">
//                                     <span className="text-2xl">🇮🇩</span>
//                                     <span className="font-medium">Bahasa Indonesia</span>
//                                   </div>
//                                 </label>
//                                 <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
//                                   <input type="radio" name="language" className="accent-amber-500" />
//                                   <div className="flex items-center gap-3">
//                                     <span className="text-2xl">🇺🇸</span>
//                                     <span className="font-medium">English</span>
//                                   </div>
//                                 </label>
//                                 <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
//                                   <input type="radio" name="language" className="accent-amber-500" />
//                                   <div className="flex items-center gap-3">
//                                     <span className="text-2xl">🇸🇦</span>
//                                     <span className="font-medium">العربية</span>
//                                   </div>
//                                 </label>
//                               </div>
//                             </motion.div>
//                           </div>
//                         </motion.div>
//                       )}
//                     </AnimatePresence>
//                   </motion.div>
//                 </div>
//               </div>
              
//               {/* Dock Navigation */}
//               <Dock items={dockItems} />
              
//               {/* Report Modal */}
//               {showReportModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                   <motion.div 
//                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
//                     className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-2xl p-6 w-full max-w-md shadow-2xl`}
//                   >
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-xl font-bold">Laporkan Masalah</h3>
//                       <button 
//                         onClick={() => setShowReportModal(false)}
//                         className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
//                       >
//                         <IconX size={20} />
//                       </button>
//                     </div>
                    
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium mb-2">Jenis Masalah</label>
//                         <select 
//                           value={reportData.target_type}
//                           onChange={(e) => setReportData(prev => ({ ...prev, target_type: e.target.value }))}
//                           className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
//                         >
//                           <option value="bug">Bug / Kesalahan</option>
//                           <option value="ui">Masalah Tampilan</option>
//                           <option value="performance">Masalah Performa</option>
//                           <option value="content">Konten Bermasalah</option>
//                           <option value="pricing">Masalah Harga</option>
//                           <option value="other">Lainnya</option>
//                         </select>
//                       </div>
                      
//                       <div>
//                         <label className="block text-sm font-medium mb-2">Deskripsi Masalah</label>
//                         <textarea 
//                           value={reportData.reason}
//                           onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
//                           placeholder={getPlaceholderText(reportData.target_type)}
//                           rows={4}
//                           className={`w-full px-4 py-3 rounded-xl border resize-none ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="flex gap-3 mt-6">
//                       <button 
//                         onClick={() => setShowReportModal(false)}
//                         className={`flex-1 px-4 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
//                       >
//                         Batal
//                       </button>
//                       <button 
//                         onClick={submitReport}
//                         disabled={isSubmittingReport}
//                         className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50"
//                       >
//                         {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan'}
//                       </button>
//                     </div>
//                   </motion.div>
//                 </div>
//               )}
              
//               {/* Rating Dialog */}
//               <RatingDialog
//                 isOpen={showRatingDialog}
//                 onClose={() => setShowRatingDialog(false)}
//                 onSubmit={handleRatingSubmit}
//                 onSkip={handleRatingSkip}
//               />
//             </div>
// Backup version of DashboardSettings
export default function DashboardSettingsBackup() {
  return (
    <div className="p-4">
      <h1>Dashboard Settings (Backup)</h1>
      <p>This is a backup version of the settings component.</p>
    </div>
  );
}