import { IconAward, IconBorderAll, IconList, IconShoppingBag, IconUser } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Header from '../../../components/Header';
import PurchaseDialog from '../../../components/shop/PurchaseDialog';
import { Dock } from '../../../components/ui/dock';
import { Toast, showToast } from '../../../components/ui/toast';
import Dropdown from '../../../components/widget/dropdown.tsx';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import ShopItemCard from './cardShop';
import CartModal from './cart';
import RandomDiscountCard from './flashsale';
import FloatingInventoryButton from './inventoryButton';
import WelcomeBannerShop from './welcomeBannerShop';

const DashboardShop = () => {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth(); // Add signOut

  // Define dropdown options as constants for TypeScript dropdown
  const sortOptions = [
    'Default',
    'Harga: Rendah ke Tinggi', 
    'Harga: Tinggi ke Rendah',
    'Nama: A-Z',
    'Nama: Z-A'
  ];

  // Move handleLogout definition before dockItems
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutLoading(true);
      setShowLogoutDialog(false);
      
      // Use AuthContext signOut instead of manual localStorage clearing
      await signOut();
      
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Terjadi kesalahan saat logout. Silakan coba lagi.');
    } finally {
      setLogoutLoading(false);
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

  
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badge');
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [flashSaleItem, setFlashSaleItem] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [randomDiscountItem, setRandomDiscountItem] = useState(null);
  const [randomItemTimeLeft, setRandomItemTimeLeft] = useState({});
  const [lastFetch, setLastFetch] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]); // FIXED: Increase to 100k to accommodate premium items
  const [sortOrder, setSortOrder] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState({
    items: [],
    borders: [],
    avatars: [],
    powerups: []
  });
  const [userPoints, setUserPoints] = useState(0);

  // Add missing state declarations
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // User profile state
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    level: 1,
    xp: 0,
    points: 0,
    streak: 0,
    level_description: 'Pemula',
    energy: 5
  });

  // Shop items state with initial empty values
  const [shopItems, setShopItems] = useState({
    items: [],
    borders: [],
    avatars: [],
    personalization: [],
    powerups: []
  });

  // Handle initial tab selection from localStorage (for navigation from Header)
  useEffect(() => {
    const savedTab = localStorage.getItem('shopTab');
    if (savedTab && ['badge', 'borders', 'avatars', 'powerup'].includes(savedTab)) {
      setActiveTab(savedTab);
      // Clear the localStorage after setting the tab
      localStorage.removeItem('shopTab');
    }
  }, []);

  // Cache helper functions
  const getCache = useCallback((key) => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  }, []);

  const setCache = useCallback((key, data) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }, []);

  // Fungsi untuk mengambil data item dari Supabase
  const fetchShopItems = useCallback(async () => {
    try {
      setIsItemsLoading(true);
      
      // Fetch ALL items without filtering to ensure we get everything
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching shop items:', error);
        throw error;
      }

      // Group items by type
      const groupedItems = {
        items: data.filter(item => item.type === 'badge') || [],
        borders: data.filter(item => item.type === 'border') || [],
        avatars: data.filter(item => item.type === 'avatar') || [],
        powerups: data.filter(item => item.type === 'powerup' || item.type === 'power_up' || item.type === 'item') || []
      };
      
      setShopItems(groupedItems);
      setCache('shop_items_cache', groupedItems);
    } catch (error) {
      console.error('Error fetching shop items:', error);
      // Set empty state on error
      setShopItems({
        items: [],
        borders: [],
        avatars: [],
        powerups: []
      });
    } finally {
      setIsItemsLoading(false);
    }
  }, [getCache, setCache]);

  // Fungsi untuk mengambil data flash sale dari Supabase
  const fetchFlashSale = useCallback(async () => {
    try {
      // Check cache first
      const cached = getCache('flash_sale_cache');
      if (cached) {
        setFlashSaleItem(cached);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('flash_sales')
        .select('*, shop_items(*)')
        .gte('end_date', today.toISOString())
        .lte('start_date', today.toISOString())
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        // Hitung harga setelah diskon
        const discountedItem = {
          ...data.shop_items,
          originalPrice: data.shop_items.price,
          price: Math.round(data.shop_items.price * (1 - data.discount_percent / 100)),
          discountPercent: data.discount_percent,
          endDate: new Date(data.end_date)
        };
        
        setFlashSaleItem(discountedItem);
        setCache('flash_sale_cache', discountedItem);
      }
    } catch (error) {
      console.error('Error fetching flash sale:', error);
    }
  }, []);

  // Flash sale API fetch
  const fetchRandomSaleItem = useCallback(async () => {
    try {
      // Use API endpoint directly
      const response = await fetch('/api/get-flash-sale', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No flash sale found
        }
        setRandomDiscountItem(null);
        return;
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Create the final item object
        const finalItem = {
          ...result.data.shop_items,
          originalPrice: result.data.shop_items.price,
          price: Math.round(result.data.shop_items.price * (1 - result.data.discount_percent / 100)),
          discountPercent: result.data.discount_percent,
          source: 'api-direct'
        };

        setRandomDiscountItem(finalItem);
      } else {
        setRandomDiscountItem(null);
      }

    } catch (error) {
      console.error('Error fetching flash sale from API:', error);
      setRandomDiscountItem(null);
    }
  }, []);

  // Add new function to get random item - FIXED to use random discount values
  const getRandomDiscountItem = () => {
    const allItems = [
      ...shopItems.items,
      ...shopItems.borders,
      ...shopItems.avatars,
      ...shopItems.powerups || []
    ];
    
    if (allItems.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * allItems.length);
    const item = allItems[randomIndex];
    
    if (item) {
      // Generate random discount between 30% and 80%
      const randomDiscountPercent = Math.floor(Math.random() * 51) + 30; // 30-80%
      const discountedPrice = Math.round(item.price * (1 - randomDiscountPercent / 100));
      
      return {
        ...item,
        originalPrice: item.price,
        price: discountedPrice,
        discountPercent: randomDiscountPercent
      };
    }
    return null;
  };

  // Add fetchUserProfile function definition at the top level
  const fetchUserProfile = async (userId) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profileData) {
        setUserProfile(profileData);
        
        if (profileData.full_name && profileData.full_name.trim()) {
          setUserName(profileData.full_name.trim());
        } else {
          setUserName('User');
        }
        
        setUserPoints(profileData.points || 0);
        return profileData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Combined authentication and data loading
  useEffect(() => {
    // Wait for auth to load first
    if (authLoading) {
      return;
    }

    // Check authentication using AuthContext
    if (!isAuthenticated || !user) {
      router.replace('/authentication/login');
      return;
    }

    // Load shop data
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data
        const [profileData] = await Promise.all([
          fetchUserProfile(user.id),
          fetchShopItems(),
          fetchFlashSale(),
          fetchRandomSaleItem(),
          fetchUserInventory(user.id)
        ]);

        // Set profile data if available
        if (profileData) {
          setUserProfile(profileData);
          setUserName(profileData.full_name);
          setUserPoints(profileData.points || 0);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAuthenticated, user?.id, router]);

  // Add the missing getNextMidnight function
  const getNextMidnight = () => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    return nextMidnight;
  };

  // Flash sale refresh and countdown timer
  useEffect(() => {
    // Simple interval to refresh flash sale every 5 minutes
    const flashSaleInterval = setInterval(() => {
      fetchRandomSaleItem();
    }, 5 * 60 * 1000);

    // Initial fetch
    fetchRandomSaleItem();

    // Countdown timer with optimized updates
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const nextMidnight = getNextMidnight();
      const difference = nextMidnight - now;
      
      if (difference <= 0) {
        setRandomItemTimeLeft(prev => {
          // Only update if values actually changed
          if (prev.hours !== 0 || prev.minutes !== 0 || prev.seconds !== 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
          }
          return prev;
        });
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setRandomItemTimeLeft(prev => {
          // Only update if values actually changed to prevent unnecessary re-renders
          if (prev.hours !== hours || prev.minutes !== minutes || prev.seconds !== seconds) {
            return { hours, minutes, seconds };
          }
          return prev;
        });
      }
    }, 1000);

    return () => {
      clearInterval(flashSaleInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Add function to ensure user is properly authenticated
  const ensureAuthenticated = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');
      
      if (!userEmail || !userId) {
        throw new Error('Missing user credentials');
      }

      // Try to sign in the user silently to establish session
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: 'temp' // This will fail but we'll check existing session
      });

      // Check if there's already an active session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionData?.session) {
        return sessionData.session.user.id;
      }

      // If no session, try to get user by stored credentials
      return userId;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return localStorage.getItem('userId');
    }
  };

  // Enhanced purchase confirmation using AuthContext
  const confirmPurchase = async () => {
    if (!selectedItem) return;

    try {
      // Use AuthContext user instead of localStorage
      const currentUser = user;
      
      if (!currentUser || !currentUser.id) {
        showToast.error('User tidak terautentikasi. Silakan login ulang.');
        router.push('/authentication/login');
        return;
      }

      const userId = currentUser.id;
      const total = selectedItem.price;

      if (userProfile.points >= total) {
        // Check if user already owns this item
        const { data: existingItem, error: checkError } = await supabase
          .from('user_inventory')
          .select('id')
          .eq('user_id', userId)
          .eq('item_id', selectedItem.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing item:', checkError);
        }

        if (existingItem) {
          showToast.warning('Anda sudah memiliki item ini!');
          setShowPurchaseDialog(false);
          return;
        }

        // Update local state first for instant UI feedback
        const newPoints = userProfile.points - total;
        
        setUserProfile(prev => ({
          ...prev,
          points: newPoints
        }));
        setUserPoints(newPoints);

        // Then update database
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ 
            points: newPoints,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (pointsError) {
          console.error('Points update error:', pointsError);
          // Rollback UI changes if database update fails
          setUserProfile(prev => ({
            ...prev,
            points: userProfile.points
          }));
          setUserPoints(userProfile.points);
          throw new Error(`Gagal mengupdate points: ${pointsError.message}`);
        }

        // Try adding item to inventory
        let purchaseSuccess = false;
        
        try {
          // Use API endpoint directly
          const response = await fetch('/api/purchase-item', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              itemId: selectedItem.id,
              itemType: selectedItem.type,
              userEmail: currentUser.email
            }),
          });

          const result = await response.json();
          
          if (response.status === 409) {
            showToast.warning('Anda sudah memiliki item ini!');
            setShowPurchaseDialog(false);
            
            // Restore points in database
            await supabase
              .from('profiles')
              .update({ 
                points: userProfile.points,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
            
            // Restore UI
            setUserProfile(prev => ({
              ...prev,
              points: userProfile.points
            }));
            setUserPoints(userProfile.points);
            
            return;
          }
          else if (!response.ok) {
            console.error('API Error Response:', result);
            throw new Error(result.error || 'API call failed');
          }
          
          if (result.success) {
            purchaseSuccess = true;
          } else {
            throw new Error(result.error || 'API purchase failed');
          }
        } catch (apiError) {
          console.error('Purchase API failed:', apiError);
          
          // Rollback points in database
          await supabase
            .from('profiles')
            .update({ 
              points: userProfile.points,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          // Rollback UI
          setUserProfile(prev => ({
            ...prev,
            points: userProfile.points
          }));
          setUserPoints(userProfile.points);
          
          throw apiError;
        }

        if (purchaseSuccess) {
          // Force refresh inventory immediately
          await fetchUserInventory(userId);

          // Also verify points from database and sync
          setTimeout(async () => {
            const { data: latestProfile } = await supabase
              .from('profiles')
              .select('points')
              .eq('id', userId)
              .single();
            
            if (latestProfile) {
              setUserProfile(prev => ({
                ...prev,
                points: latestProfile.points
              }));
              setUserPoints(latestProfile.points);
            }
          }, 1000);

          // Trigger events for other components
          localStorage.setItem('inventoryUpdated', Date.now().toString());
          localStorage.setItem('pointsUpdated', newPoints.toString());
          
          window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
            detail: { userId, timestamp: Date.now() } 
          }));
          window.dispatchEvent(new CustomEvent('pointsUpdated', { 
            detail: { userId, newPoints } 
          }));

          showToast.success('Pembelian berhasil! Item telah ditambahkan ke inventaris Anda.');
          setShowPurchaseDialog(false);
          setSelectedItem(null);
        }

      } else {
        showToast.error('Point tidak mencukupi untuk melakukan pembelian ini.');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      showToast.error(`Terjadi kesalahan saat melakukan pembelian: ${error.message}`);
    }
  };

  // Update checkout function to use AuthContext
  const checkout = async () => {
    const total = calculateTotal();
    if (userProfile.points >= total) {
      try {
        const currentUser = user;
        
        if (!currentUser || !currentUser.id) {
          alert('User tidak terautentikasi. Silakan login ulang.');
          router.push('/authentication/login');
          return;
        }

        const userId = currentUser.id;
        
        // Update points in database
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ 
            points: userProfile.points - total,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (pointsError) throw pointsError;

        // Update user profile state
        setUserProfile(prev => ({
          ...prev,
          points: prev.points - total
        }));
        setUserPoints(prev => prev - total);

        // Use API endpoint for cart items too
        for (const item of cart) {
          const response = await fetch('/api/purchase-item', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              itemId: item.id,
              itemType: item.type,
              userEmail: currentUser.email
            }),
          });

          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to add item to cart');
          }
        }

        // Refresh inventory
        await fetchUserInventory(userId);

        alert('Pembelian berhasil! Item telah ditambahkan ke inventaris Anda.');
        setCart([]);
        setShowCartModal(false);
      } catch (error) {
        console.error('Error during checkout:', error);
        alert('Terjadi kesalahan saat melakukan pembelian');
      }
    } else {
      alert('Point tidak mencukupi untuk melakukan pembelian ini.');
    }
  };

  // Update fetchUserInventory to use the API endpoint as well
  const fetchUserInventory = async (userId) => {
    try {
      // Use AuthContext user ID if no userId provided
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        console.error('No user ID available for inventory fetch');
        setInventory({
          items: [],
          borders: [],
          avatars: [],
          powerups: []
        });
        return;
      }

      // Try API endpoint first
      try {
        const response = await fetch('/api/get-inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: targetUserId }),
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data) {
            const combinedData = result.data;
            
            // Group items by type
            const groupedItems = {
              items: combinedData.filter(item => item.item_type === 'item'),
              borders: combinedData.filter(item => item.item_type === 'border'),
              avatars: combinedData.filter(item => item.item_type === 'avatar'),
              powerups: combinedData.filter(item => item.item_type === 'power_up' || item.item_type === 'powerup')
            };

            setInventory(groupedItems);
            
            // Trigger storage event to notify other components
            localStorage.setItem('inventoryUpdated', Date.now().toString());
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'inventoryUpdated',
              newValue: Date.now().toString()
            }));

            return;
          }
        }
      } catch (apiError) {
        // Fallback to direct query
      }

      // Fallback to direct query
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          shop_items (
            id,
            name,
            description,
            price,
            type,
            image
          )
        `)
        .eq('user_id', targetUserId);

      if (error) {
        console.error('Error fetching inventory:', error);
        setInventory({
          items: [],
          borders: [],
          avatars: [],
          powerups: []
        });
        return;
      }

      // Group items by type
      const groupedItems = {
        items: data.filter(item => item.item_type === 'item'),
        borders: data.filter(item => item.item_type === 'border'),
        avatars: data.filter(item => item.item_type === 'avatar'),
        powerups: data.filter(item => item.item_type === 'power_up' || item.item_type === 'powerup')
      };

      setInventory(groupedItems);
      
      // Trigger storage event to notify other components
      localStorage.setItem('inventoryUpdated', Date.now().toString());
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'inventoryUpdated',
        newValue: Date.now().toString()
      }));

    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory({
        items: [],
        borders: [],
        avatars: [],
        powerups: []
      });
    }
  };

  // Add function to check if item is owned
  const isItemOwned = (itemId) => {
    if (!inventory) return false;
    
    const allItems = [
      ...inventory.items || [],
      ...inventory.borders || [],
      ...inventory.avatars || [],
      ...inventory.powerups || []
    ];
    
    return allItems.some(item => item.item_id === itemId);
  };

  // Add missing functions for cart operations
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Add purchase handling functions
  const handlePurchase = (item) => {
    setSelectedItem(item);
    setShowPurchaseDialog(true);
  };

  // Add handleProfileUpdate function
  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
    
    // Update userName with full_name priority
    if (updatedProfile.full_name && updatedProfile.full_name.trim()) {
      setUserName(updatedProfile.full_name.trim());
    } else {
      setUserName('User');
    }
    
    // Update cache
    const userId = localStorage.getItem('userId');
    if (userId) {
      sessionStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
    }
  };

  // Filter and sort items function
  const filterAndSortItems = (items) => {
    if (!items || !Array.isArray(items)) {
      return [];
    }
    
    // Apply search filter first
    let filtered = items.filter(item => {
      // Price filter
      const itemPrice = item.price || 0;
      const priceMatch = itemPrice >= priceRange[0] && itemPrice <= priceRange[1];
      
      // Search query filter
      const searchMatch = !searchQuery || searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return priceMatch && searchMatch;
    });

    // Apply sorting
    let sorted;
    switch(sortOrder) {
      case 'price-asc':
        sorted = filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        sorted = filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted = filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        sorted = [...filtered];
        break;
    }

    // Prioritize Premium Membership in Power Up tab
    if (activeTab === 'powerup') {
      const premiumIndex = sorted.findIndex(item => item.name === 'Premium Membership');
      if (premiumIndex > 0) {
        const premiumItem = sorted.splice(premiumIndex, 1)[0];
        sorted.unshift(premiumItem);
      }
    }

    return sorted;
  };

  // Render shop items function
  const renderShopItems = (items) => {
    if (!items) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Tidak ada data item</p>
        </div>
      );
    }

    if (!Array.isArray(items)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Data item tidak valid</p>
        </div>
      );
    }

    const filteredAndSortedItems = filterAndSortItems(items);
    
    if (filteredAndSortedItems.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {items.length === 0 
              ? 'Tidak ada item dalam kategori ini' 
              : 'Tidak ada item yang sesuai dengan filter'
            }
          </p>
        </div>
      );
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((item) => (
            <ShopItemCard 
              key={`${item.id}-${activeTab}`}
              item={item}
              activeTab={activeTab}
              isItemOwned={isItemOwned}
              handlePurchase={handlePurchase}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        {filteredAndSortedItems.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-8 h-8 rounded-full ${
                  currentPage === index + 1
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  // OPTIMIZATION: Reset filters when changing tabs
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when changing tabs
    // Reset search when changing tabs for better UX
    if (searchQuery) {
      setSearchQuery('');
    }
  }, [activeTab]);

  // Add new function to reset filters with higher default range
  const resetFilters = () => {
    setPriceRange([0, 100000]); // FIXED: Increase default max range
    setSearchQuery('');
    setSortOrder('default');
  };

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Toko - Belajar Makhrojul Huruf</title>
        <meta name="description" content="Toko untuk membeli item dan personalisasi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Modal Components */}
      <CartModal 
        showCartModal={showCartModal}
        setShowCartModal={setShowCartModal}
        cart={cart}
        removeFromCart={removeFromCart}
        calculateTotal={calculateTotal}
        checkout={checkout}
        userProfile={userProfile}
      />
      
      <PurchaseDialog 
        showPurchaseDialog={showPurchaseDialog}
        setShowPurchaseDialog={setShowPurchaseDialog}
        selectedItem={selectedItem}
        userProfile={userProfile}
        confirmPurchase={confirmPurchase}
      />
      
      {/* Logout Dialog */}
      <AnimatePresence>
        {showLogoutDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutDialog(false)}
            className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg cursor-default"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Konfirmasi Logout</h3>
              <p className="text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari akun?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={logoutLoading}
                >
                  Batal
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={logoutLoading}
                >
                  {logoutLoading ? 'Memproses...' : 'Logout'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Early return for loading states */}
      {(authLoading || isLoading) ? (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">
              {authLoading ? 'Memverifikasi akses...' : 'Memuat data toko...'}
            </p>
          </div>
        </div>
      ) : !isAuthenticated || !user ? (
        // Show loading or redirect message if user is not authenticated
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Mengalihkan ke halaman login...</p>
          </div>
        </div>
      ) : (
        <>
          <Header 
            userName={userProfile.full_name || userName || 'User'}
            profileData={userProfile}
            onLogout={handleLogout}
            onProfileUpdate={handleProfileUpdate}
          />
          
          <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-6 pb-24">
            <div className="w-full">{/* CSS for Premium Membership animations */}
              <style jsx>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                }
                .animate-float {
                  animation: float 3s ease-in-out infinite;
                }
                
                /* Orbital animations for different rings */
                @keyframes orbit-1 {
                  0% { transform: translate(-50%, -50%) rotate(0deg); }
                  100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
                
                @keyframes orbit-2 {
                  0% { transform: translate(-50%, -50%) rotate(0deg) scaleX(1.3); }
                  100% { transform: translate(-50%, -50%) rotate(360deg) scaleX(1.3); }
                }
                
                @keyframes orbit-3 {
                  0% { transform: translate(-50%, -50%) rotateX(30deg) rotate(0deg) scaleX(1.5) scaleY(0.8); }
                  100% { transform: translate(-50%, -50%) rotateX(30deg) rotate(360deg) scaleX(1.5) scaleY(0.8); }
                }
                
                @keyframes orbit-4 {
                  0% { transform: translate(-50%, -50%) rotate(0deg) scaleX(1.8) scaleY(1.2); }
                  50% { transform: translate(-50%, -50%) rotate(180deg) scaleX(1.8) scaleY(1.2) translateZ(10px); }
                  100% { transform: translate(-50%, -50%) rotate(360deg) scaleX(1.8) scaleY(1.2); }
                }
              `}</style>

              {/* Welcome Banner */}
              <WelcomeBannerShop userProfile={userProfile} />

              {/* Random Discount Card */}
              {randomDiscountItem ? (
                <div>
                  <RandomDiscountCard 
                    randomDiscountItem={randomDiscountItem}
                    randomItemTimeLeft={randomItemTimeLeft}
                    handlePurchase={handlePurchase}
                  />
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg mb-8">
                  <p className="text-gray-600">
                    Flash sale tidak tersedia saat ini. Silakan cek kembali nanti!
                  </p>
                  <button 
                    onClick={() => {
                      fetchRandomSaleItem();
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Refresh Flash Sale
                  </button>
                </div>
              )}

              {/* Enhanced Tab Navigation - matching DashboardBelajar.jsx style */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-3xl shadow-lg border border-blue-100 mb-8 overflow-hidden"
              >
                <div className="relative">
                  <div className="flex w-full">
                    <motion.button
                      onClick={() => setActiveTab('badge')}
                      className={`relative flex-1 px-4 py-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                        activeTab === 'badge' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconAward size={20} />
                      <span className="font-['Poppins']">Badge</span>
                      {activeTab === 'badge' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setActiveTab('borders')}
                      className={`relative flex-1 px-4 py-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                        activeTab === 'borders' 
                          ? 'text-red-600 bg-red-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconBorderAll size={20} />
                      <span className="font-['Poppins']">Border</span>
                      {activeTab === 'borders' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setActiveTab('avatars')}
                      className={`relative flex-1 px-4 py-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                        activeTab === 'avatars' 
                          ? 'text-green-600 bg-green-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconUser size={20} />
                      <span className="font-['Poppins']">Avatar</span>
                      {activeTab === 'avatars' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setActiveTab('powerup')}
                      className={`relative flex-1 px-4 py-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-3 ${
                        activeTab === 'powerup' 
                          ? 'text-purple-600 bg-purple-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconShoppingBag size={20} />
                      <span className="font-['Poppins']">Power Up & Item</span>
                      {activeTab === 'powerup' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-lg"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
              
              {/* Tab Content */}
              <div className="space-y-6">
                {/* Enhanced filter controls */}
                <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-500/20 border ">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium mb-2">Cari Item</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Nama atau deskripsi item..."
                        className={`w-full px-4 py-3 border rounded-2xl outline-none bg-white text-gray-700 font-['Poppins'] shadow-sm transition-colors ${
                          activeTab === 'badge' ? 'border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-50' :
                          activeTab === 'borders' ? 'border-red-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:bg-red-50' :
                          activeTab === 'avatars' ? 'border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-50' :
                          activeTab === 'powerup' ? 'border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:bg-purple-50' :
                          'border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-50'
                        }`}
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium mb-2">Range Harga</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className={`w-20 px-3 py-3 border rounded-2xl outline-none bg-white text-gray-700 font-['Poppins'] shadow-sm transition-colors text-sm ${
                            activeTab === 'badge' ? 'border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-50' :
                            activeTab === 'borders' ? 'border-red-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:bg-red-50' :
                            activeTab === 'avatars' ? 'border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-50' :
                            activeTab === 'powerup' ? 'border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:bg-purple-50' :
                            'border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-50'
                          }`}
                          min="0"
                          placeholder="0"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                          className={`w-24 px-3 py-3 border rounded-2xl outline-none bg-white text-gray-700 font-['Poppins'] shadow-sm transition-colors text-sm ${
                            activeTab === 'badge' ? 'border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-50' :
                            activeTab === 'borders' ? 'border-red-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:bg-red-50' :
                            activeTab === 'avatars' ? 'border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-50' :
                            activeTab === 'powerup' ? 'border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:bg-purple-50' :
                            'border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-50'
                          }`}
                          min="0"
                          placeholder="100000"
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium mb-2">Urutkan</label>
                      <Dropdown
                        options={sortOptions}
                        value={sortOrder === 'default' ? 'Default' : 
                               sortOrder === 'price-asc' ? 'Harga: Rendah ke Tinggi' :
                               sortOrder === 'price-desc' ? 'Harga: Tinggi ke Rendah' :
                               sortOrder === 'name-asc' ? 'Nama: A-Z' :
                               sortOrder === 'name-desc' ? 'Nama: Z-A' : 'Default'}
                        onChange={(value) => setSortOrder(
                          value === 'Default' ? 'default' :
                          value === 'Harga: Rendah ke Tinggi' ? 'price-asc' :
                          value === 'Harga: Tinggi ke Rendah' ? 'price-desc' :
                          value === 'Nama: A-Z' ? 'name-asc' :
                          value === 'Nama: Z-A' ? 'name-desc' : 'default'
                        )}
                        placeholder="Pilih urutan..."
                        icon={<IconList size={16} />}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        onClick={resetFilters}
                        className={`px-6 py-3 border rounded-2xl outline-none bg-white text-gray-700 font-['Poppins'] shadow-sm transition-colors font-medium text-sm w-full md:w-auto ${
                          activeTab === 'badge' ? 'border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-50' :
                          activeTab === 'borders' ? 'border-red-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:bg-red-50' :
                          activeTab === 'avatars' ? 'border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:bg-green-50' :
                          activeTab === 'powerup' ? 'border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:bg-purple-50' :
                          'border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        Reset Filter
                      </button>
                    </div>
                  </div>
                </div>

                {isItemsLoading ? (
                  <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-500/20 border flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-500/20 border">
                    {activeTab === 'badge' && renderShopItems(shopItems.items)}
                    {activeTab === 'borders' && renderShopItems(shopItems.borders)}
                    {activeTab === 'avatars' && renderShopItems(shopItems.avatars)}
                    {activeTab === 'powerup' && renderShopItems(shopItems.powerups)}
                  </div>
                )}
              </div>
            </div>
          </main>
          
          <FloatingInventoryButton />
          
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
      
      {/* Toast Component */}
      <Toast />
    </div>
  );
};

export default DashboardShop;