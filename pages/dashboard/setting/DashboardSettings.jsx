import { IconAward, IconBorderAll, IconFlag, IconLanguage, IconLock, IconPackage, IconPalette, IconShoppingBag, IconUser, IconUserCircle, IconVolume, IconVolumeOff, IconWand, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import { BORDER_REGISTRY, Classic, DatabaseBorder, Galaxy, Metro, Neon, Simple, getAllBorders } from '../../../components/borders';
import RatingDialog from '../../../components/dialog/RatingDialog';
import { Dock } from '../../../components/ui/dock';
import { Toast, showToast } from '../../../components/ui/toast';
import { useAuth } from '../../../context/AuthContext';
import { clientCache } from '../../../lib/clientCache';
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

  // Cache management state
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  // Border customization state
  const [userBorders, setUserBorders] = useState([]);
  const [selectedBorder, setSelectedBorder] = useState('simple'); // Default border

  // Avatar background color configuration state
  const [avatarBgColor, setAvatarBgColor] = useState('#3B82F6'); // Default blue
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isApplyingColor, setIsApplyingColor] = useState(false);

  // Badge background color configuration state
  const [badgeBgColor, setBadgeBgColor] = useState('#3B82F6'); // Default blue
  const [showBadgeColorPicker, setShowBadgeColorPicker] = useState(false);
  const [isApplyingBadgeColor, setIsApplyingBadgeColor] = useState(false);

  // Predefined background colors
  const predefinedColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#F472B6', // Rose
    '#A855F7', // Violet
    '#06B6D4', // Cyan
  ];

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
    setIsLoading(true);
    await signOut();
  };

  // Skip rating and logout
  const handleRatingSkip = async () => {
    setIsLoading(true);
    await signOut();
  };

  // Enhanced profile data fetching with caching
  const fetchProfileData = async (userId, forceRefresh = false) => {
    try {
      const cacheKey = `profile_${userId}`;
      
      // Try cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedProfile = await clientCache.get(cacheKey);
        if (cachedProfile) {
          setProfileData(cachedProfile);
          setUserName(cachedProfile.full_name || cachedProfile.email?.split('@')[0] || 'User');
          setUserPoints(cachedProfile.points || 0);
          return;
        }
      }

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
        // Cache profile for 2 minutes
        await clientCache.set(cacheKey, profile, 120);
        
        setProfileData(profile);
        setUserName(profile.full_name || profile.email?.split('@')[0] || 'User');
        setUserPoints(profile.points || 0);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Cache management functions
  const clearAllCache = async () => {
    try {
      await clientCache.clear();
      showToast.success('Cache berhasil dibersihkan!');
      setCacheStats({ hits: 0, misses: 0 });
    } catch (error) {
      console.error('Error clearing cache:', error);
      showToast.error('Gagal membersihkan cache');
    }
  };

  const getCacheStats = () => {
    const stats = clientCache.getStats();
    return {
      ...stats,
      sessionHits: cacheStats.hits,
      sessionMisses: cacheStats.misses
    };
  };

  // Avatar background color management functions
  const loadAvatarBgColor = () => {
    if (!user?.id) return;
    
    const savedColor = localStorage.getItem(`avatar_bg_color_${user.id}`);
    if (savedColor) {
      setAvatarBgColor(savedColor);
      // Apply to CSS custom property for header avatar
      document.documentElement.style.setProperty('--avatar-bg-color', savedColor);
    }
  };

  const applyAvatarBgColor = async (color) => {
    if (!user?.id || !color) return;
    
    try {
      setIsApplyingColor(true);
      
      // Save to localStorage
      localStorage.setItem(`avatar_bg_color_${user.id}`, color);
      
      // Apply to CSS custom property immediately
      document.documentElement.style.setProperty('--avatar-bg-color', color);
      
      // Update state
      setAvatarBgColor(color);
      
      // Cache the color setting
      await clientCache.set(`avatar_bg_${user.id}`, color, 3600); // 1 hour cache
      
      showToast.success('Background color avatar berhasil diubah!');
      
      // Dispatch custom event to notify Header component
      window.dispatchEvent(new CustomEvent('avatarBgColorUpdated', { 
        detail: { color, userId: user.id } 
      }));
      
    } catch (error) {
      console.error('Error applying avatar background color:', error);
      showToast.error('Gagal mengubah background color');
    } finally {
      setIsApplyingColor(false);
    }
  };

  const resetAvatarBgColor = async () => {
    const defaultColor = '#3B82F6'; // Default blue
    await applyAvatarBgColor(defaultColor);
    setShowColorPicker(false);
  };

  // Badge background color management functions
  const loadBadgeBgColor = () => {
    if (!user?.id) return;
    
    const savedColor = localStorage.getItem(`badge_bg_color_${user.id}`);
    if (savedColor) {
      setBadgeBgColor(savedColor);
      // Apply to CSS custom property for badge background
      document.documentElement.style.setProperty('--badge-bg-color', savedColor);
    }
  };

  const applyBadgeBgColor = async (color) => {
    if (!user?.id || !color) return;
    
    try {
      setIsApplyingBadgeColor(true);
      
      // Save to localStorage
      localStorage.setItem(`badge_bg_color_${user.id}`, color);
      
      // Apply to CSS custom property immediately
      document.documentElement.style.setProperty('--badge-bg-color', color);
      
      // Update state
      setBadgeBgColor(color);
      
      // Cache the color setting
      await clientCache.set(`badge_bg_${user.id}`, color, 3600); // 1 hour cache
      
      showToast.success('Background color badge berhasil diubah!');
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('badgeBgColorUpdated', { 
        detail: { color, userId: user.id } 
      }));
      
    } catch (error) {
      showToast.error('Gagal mengubah background color badge');
    } finally {
      setIsApplyingBadgeColor(false);
    }
  };

  const resetBadgeBgColor = async () => {
    const defaultColor = '#3B82F6'; // Default blue
    await applyBadgeBgColor(defaultColor);
    setShowBadgeColorPicker(false);
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
          

          setSoundEnabled(savedSoundEnabled);
          
          if (savedDarkMode) {
            document.documentElement.classList.add('dark');
          }
          
          // Load background badges
          const savedBackgroundBadges = localStorage.getItem(`background_badges_${user.id}`);
          if (savedBackgroundBadges) {
            setBackgroundBadges(JSON.parse(savedBackgroundBadges));
          }
          
          // Apply saved background color
          const savedBgColor = localStorage.getItem(`selected_bg_color_${user.id}`);
          if (savedBgColor) {
            document.documentElement.style.setProperty('--custom-bg-color', savedBgColor);
          }
          
          // Fetch inventory
          await fetchInventory();
          
          // Load user borders after inventory is loaded
          setTimeout(() => {
            loadUserBorders();
            loadAvatarBgColor(); // Load saved avatar background color
            loadBadgeBgColor(); // Load saved badge background color
          }, 100);
          
        } catch (error) {
          console.error('Error initializing settings:', error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeSettings();
    }
  }, [user, loading, isAuthenticated, router]);

  // Effect to reload borders when inventory changes
  useEffect(() => {
    if (user?.id && !isLoadingInventory && inventory.borders !== undefined) {
      loadUserBorders();
      
      // Apply saved border
      const savedBorder = localStorage.getItem(`selected_border_${user.id}`);
      if (savedBorder) {
        setSelectedBorder(savedBorder);
      }
    }
  }, [inventory.borders, isLoadingInventory, user?.id]);

  // Submit report function with improved error handling
  const submitReport = async () => {
    if (!reportData.reason.trim()) {
      showToast.warning('Silakan masukkan alasan laporan');
      return;
    }

    try {
      setIsSubmittingReport(true);
      
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
    
  // Function to fetch user's inventory with caching
  const fetchInventory = async (forceRefresh = false) => {
    try {
      setIsLoadingInventory(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        showToast.error('ID pengguna tidak ditemukan');
        return;
      }

      const cacheKey = `inventory_${userId}`;
      
      // Try to get from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = await clientCache.get(cacheKey);
        if (cachedData) {
          setInventory(cachedData);
          setCacheLoaded(true);
          setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
          setIsLoadingInventory(false);
          return;
        } else {
          setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        }
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

            // Cache the fresh data for 5 minutes
            await clientCache.set(cacheKey, grouped, 300);
            
            setInventory(grouped);
            setCacheLoaded(true);
            showToast.success(forceRefresh ? 'Inventori berhasil diperbarui!' : 'Inventori berhasil dimuat!');
            return;
          }
        }
      } catch (apiError) {
        showToast.warning('Gagal memuat inventori, menggunakan data lokal');
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
      showToast.error('Terjadi kesalahan saat memuat inventori');
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

  // Function to update avatars table when inventory changes
  const updateAvatarsTable = async (userId, equippedItems) => {
    try {
      // Get current avatar data from equipped items
      const equippedAvatar = equippedItems.find(item => item.item_type === 'avatar' && item.is_equipped);
      const equippedBadge = equippedItems.find(item => item.item_type === 'badge' && item.is_equipped);
      const equippedBorder = equippedItems.find(item => item.item_type === 'border' && item.is_equipped);

      // Prepare avatar data for update
      const avatarData = {
        user_id: userId,
        avatar: equippedAvatar?.shop_items?.image || null,
        border: equippedBorder?.shop_items?.border_color || 'gray',
        badge: equippedBadge ? 'award' : 'none',
        badge_color: equippedBadge?.shop_items?.badge_color || null,
        updated_at: new Date().toISOString()
      };

      // Check if user already has an avatar record
      const { data: existingAvatar, error: checkError } = await supabase
        .from('avatars')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingAvatar) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('avatars')
          .update(avatarData)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('avatars')
          .insert({ ...avatarData, created_at: new Date().toISOString() });

        if (insertError) throw insertError;
      }

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('avatarTableUpdated', { 
        detail: { userId, avatarData } 
      }));

    } catch (error) {
      console.error('Error updating avatars table:', error);
    }
  };

  // Function to toggle equipment status with better error handling
  const toggleEquipItem = async (inventoryId, type) => {
    try {
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
      
      // Clear cache and refresh inventory with fresh data
      const userId = localStorage.getItem('userId');
      if (userId) {
        await clientCache.del(`inventory_${userId}`);
        
        // Fetch fresh inventory data to update avatars table
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
            if (result.success && result.data) {
              await updateAvatarsTable(userId, result.data);
            }
          }
        } catch (updateError) {
          console.error('Error updating avatars table:', updateError);
        }
      }
      await fetchInventory(true); // Force refresh
      
    } catch (error) {
      console.error('Error toggling equipment:', error);
      showToast.error('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  // Border management functions
  const loadUserBorders = () => {
    if (!user?.id) return;
    
    const savedBorders = localStorage.getItem(`user_borders_${user.id}`);
    
    // Get borders from inventory (database borders)
    const inventoryBorders = inventory.borders || [];
    
    // Merge component borders with database borders
    const allBorders = getAllBorders(inventoryBorders);
    
    if (savedBorders) {
      const saved = JSON.parse(savedBorders);
      // Update equipped status from saved data
      const mergedBorders = allBorders.map(border => {
        const savedBorder = saved.find(s => s.id === border.id);
        return {
          ...border,
          equipped: savedBorder ? savedBorder.equipped : false
        };
      });
      setUserBorders(mergedBorders);
    } else {
      // Set simple as default equipped
      const defaultBorders = allBorders.map(border => ({
        ...border,
        equipped: border.id === 'simple'
      }));
      setUserBorders(defaultBorders);
      localStorage.setItem(`user_borders_${user.id}`, JSON.stringify(defaultBorders));
    }
  };

  const toggleBorderEquip = async (borderId) => {
    const borderToEquip = userBorders.find(b => b.id === borderId);
    if (!borderToEquip) return;

    // If it's a database border, update in Supabase
    if (borderToEquip.type === 'database' && borderToEquip.inventoryId) {
      try {
        // Unequip other borders of the same type first
        const { error: unequipError } = await supabase
          .from('user_inventory')
          .update({ is_equipped: false })
          .eq('user_id', user.id)
          .eq('item_type', 'border');

        if (unequipError) throw unequipError;

        // Equip the selected border
        const { error: equipError } = await supabase
          .from('user_inventory')
          .update({ is_equipped: true })
          .eq('id', borderToEquip.inventoryId);

        if (equipError) throw equipError;
        
        // Refresh inventory to get updated data
        await fetchInventory();
      } catch (error) {
        console.error('Error updating border equipment:', error);
        showToast.error('Terjadi kesalahan saat mengganti border. Silakan coba lagi.');
        return;
      }
    }

    // Update local state
    const updatedBorders = userBorders.map(border => ({
      ...border,
      equipped: border.id === borderId
    }));
    
    setUserBorders(updatedBorders);
    setSelectedBorder(borderId);
    localStorage.setItem(`user_borders_${user?.id}`, JSON.stringify(updatedBorders));
    localStorage.setItem(`selected_border_${user?.id}`, borderId);
    
    showToast.success(`Border ${borderToEquip.name} berhasil dipasang!`);
  };

  const renderBorderComponent = (borderData, size = 'w-24 h-24', children = null) => {
    // Handle string ID (legacy component borders)
    if (typeof borderData === 'string') {
      const borderInfo = BORDER_REGISTRY[borderData];
      if (!borderInfo) return null;

      const props = { size, children, className: 'mx-auto' };

      switch (borderInfo.component) {
        case 'Metro':
          return <Metro {...props} />;
        case 'Classic':
          return <Classic {...props} />;
        case 'Neon':
          return <Neon {...props} />;
        case 'Simple':
          return <Simple {...props} />;
        case 'Galaxy':
          return <Galaxy {...props} />;
        default:
          return <Simple {...props} />;
      }
    }

    // Handle border object (database borders or full border data)
    const border = borderData;
    
    if (border.type === 'component' && border.component) {
      const props = { size, children, className: 'mx-auto' };
      
      switch (border.component) {
        case 'Metro':
          return <Metro {...props} />;
        case 'Classic':
          return <Classic {...props} />;
        case 'Neon':
          return <Neon {...props} />;
        case 'Simple':
          return <Simple {...props} />;
        case 'Galaxy':
          return <Galaxy {...props} />;
        default:
          return <Simple {...props} />;
      }
    }

    // For database borders, show image preview
    if (border.type === 'database') {
      return (
        <DatabaseBorder 
          size={size} 
          className="mx-auto" 
          borderData={border}
        >
          {children}
        </DatabaseBorder>
      );
    }

    // Fallback to simple border
    return <Simple size={size} className="mx-auto">{children}</Simple>;
  };

  // Render inventory tab
  // Render inventory tab dengan desain konsisten
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

    // Function to render item card
    const renderItemCard = (item, type, icon, colorClasses) => (
      <motion.div 
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all relative"
      >
        {item.is_equipped && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Dipakai
            </div>
          </div>
        )}
        
        <div className="mb-3 h-24 bg-gray-50 rounded-lg flex items-center justify-center">
          {item.shop_items?.image ? (
            <img 
              src={item.shop_items.image} 
              alt={item.shop_items.name} 
              className="h-20 w-20 object-contain"
            />
          ) : (
            React.createElement(icon, { size: 32, className: "text-gray-400" })
          )}
        </div>
        
        <h4 className="font-medium mb-1 text-gray-800">
          {item.shop_items?.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${item.item_id}`}
        </h4>
        <p className="text-sm text-gray-500 mb-2">
          {item.shop_items?.description || 'Tidak ada deskripsi'}
        </p>
        
        {/* Item details */}
        <div className="text-xs text-gray-400 mb-3">
          <div>ID: {item.item_id}</div>
          <div>Jumlah: {item.quantity}</div>
          {item.expires_at && (
            <div>Berakhir: {new Date(item.expires_at).toLocaleDateString()}</div>
          )}
        </div>
        
        <button
          onClick={() => toggleEquipItem(item.id, type)}
          className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
            item.is_equipped
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : colorClasses.buttonCard
          }`}
        >
          {item.is_equipped ? 'Dipakai' : 'Pakai'}
        </button>
      </motion.div>
    );

    // Function to render section
    const renderSection = (title, items, type, icon, colorClasses) => (
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {React.createElement(icon, { size: 24, className: colorClasses.icon })}
            <h3 className="text-lg font-semibold">{title} ({items.length})</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchInventory(true); // Force refresh
                showToast.info('Memuat ulang inventori...');
              }}
              className={`px-3 py-1.5 text-sm text-white rounded-lg transition-colors ${colorClasses.button}`}
            >
              Refresh
            </button>
            {/* Add color picker button for badge */}
            {type === 'badge' && (
              <button
                onClick={() => setShowBadgeColorPicker(!showBadgeColorPicker)}
                className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                🎨 Warna
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => renderItemCard(item, type, icon, colorClasses))}
          
          {items.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <div className="mb-2">
                {React.createElement(icon, { size: 48, className: "mx-auto text-gray-300" })}
              </div>
              <p>Belum ada {title.toLowerCase()}.</p>
              <p className="text-sm">Dapatkan {title.toLowerCase()} di toko.</p>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <motion.div 
        key="inventory"
        variants={tabVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Inventori Saya</h2>
          <p className="text-gray-600">Kelola semua item yang Anda miliki</p>
        </div>
        
        {/* Avatar Section */}
        {renderSection('Avatar', inventory.avatars, 'avatar', IconUser, {
          icon: 'text-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600',
          buttonCard: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        })}
        
        {/* Border Section */}
        {renderSection('Border', inventory.borders, 'border', IconBorderAll, {
          icon: 'text-purple-500',
          button: 'bg-purple-500 hover:bg-purple-600',
          buttonCard: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        })}
        
        {/* Badge Section */}
        {renderSection('Badge', inventory.badges, 'badge', IconAward, {
          icon: 'text-orange-500',
          button: 'bg-orange-500 hover:bg-orange-600',
          buttonCard: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
        })}

        {/* Badge Background Color Configuration */}
        <AnimatePresence>
          {showBadgeColorPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: badgeBgColor }}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-lg">Background Color Badge</h3>
                      <p className="text-sm opacity-70">Kustomisasi warna background badge</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowBadgeColorPicker(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Tutup
                  </button>
                </div>

                {/* Current Color Preview */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                      style={{ backgroundColor: badgeBgColor }}
                    ></div>
                    <div>
                      <p className="font-medium">Current Color</p>
                      <p className="text-sm text-gray-500">{badgeBgColor}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => applyBadgeBgColor(badgeBgColor)}
                      disabled={isApplyingBadgeColor}
                      className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {isApplyingBadgeColor ? 'Applying...' : 'Apply'}
                    </button>
                    <button
                      onClick={resetBadgeBgColor}
                      className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Predefined Colors */}
                <div>
                  <h4 className="font-medium mb-3">Preset Colors</h4>
                  <div className="grid grid-cols-6 gap-3">
                    {predefinedColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setBadgeBgColor(color)}
                        className={`w-12 h-12 rounded-lg border-4 transition-all hover:scale-110 ${
                          badgeBgColor === color 
                            ? 'border-gray-800 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {badgeBgColor === color && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full shadow"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div>
                  <h4 className="font-medium mb-3">Custom Color</h4>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={badgeBgColor}
                      onChange={(e) => setBadgeBgColor(e.target.value)}
                      className="w-16 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={badgeBgColor}
                      onChange={(e) => setBadgeBgColor(e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* PowerUp Section */}
        {renderSection('Power-Up', inventory.powerups, 'powerup', IconWand, {
          icon: 'text-green-500',
          button: 'bg-green-500 hover:bg-green-600',
          buttonCard: 'bg-green-100 text-green-700 hover:bg-green-200'
        })}
        
        {/* Other Items Section */}
        {renderSection('Item Lainnya', inventory.items, 'item', IconShoppingBag, {
          icon: 'text-gray-500',
          button: 'bg-gray-500 hover:bg-gray-600',
          buttonCard: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        })}
      </motion.div>
    );
  };

  return (
    <>
      <Toast />
      <div 
        className="min-h-screen transition-colors duration-300 bg-gray-50 text-gray-900"
        style={{
          background: 'var(--custom-bg-color, #f9fafb)'
        }}
      >
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
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 h-fit"
              >

                <nav className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('appearance')} 
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'appearance' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <IconPalette size={20} />
                    <span>Tampilan</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('account')} 
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'account' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <IconUserCircle size={20} />
                    <span>Akun</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')} 
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <IconLock size={20} />
                    <span>Keamanan</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory')} 
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <IconPackage size={20} />
                    <span>Inventori</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('language')} 
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'language' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
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
                className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-3"
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
                        {/* Sound Toggle */}
                        <motion.div 
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          custom={1}
                          whileHover="hover"
                          className="bg-gray-100 p-6 rounded-xl transition-all"
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
                        <div className="bg-gray-100 p-6 rounded-xl">
                          <h3 className="font-semibold text-lg mb-4">Informasi Profil</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                              <input 
                                type="text" 
                                defaultValue={profileData.full_name || userName}
                                className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Email</label>
                              <input 
                                type="email" 
                                defaultValue={profileData.email}
                                className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300"
                                disabled
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Level</label>
                                <input 
                                  type="text" 
                                  value={`Level ${profileData.level || 1}`}
                                  className="w-full px-4 py-3 rounded-xl border bg-gray-100 border-gray-300"
                                  disabled
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">XP</label>
                                <input 
                                  type="text" 
                                  value={`${profileData.xp || 0} XP`}
                                  className="w-full px-4 py-3 rounded-xl border bg-gray-100 border-gray-300"
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
                        <div className="bg-gray-100 p-6 rounded-xl">
                          <h3 className="font-semibold text-lg mb-4">Ubah Kata Sandi</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Kata Sandi Lama</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Kata Sandi Baru</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Konfirmasi Kata Sandi Baru</label>
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300"
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
                        <div className="bg-gray-100 p-6 rounded-xl">
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
          </div>
        )}
        
        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white text-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Laporkan Masalah</h3>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
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
                    className="w-full px-4 py-3 rounded-xl border bg-white border-gray-300"
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
                    className="w-full px-4 py-3 rounded-xl border resize-none bg-white border-gray-300"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium bg-gray-200 hover:bg-gray-300"
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
