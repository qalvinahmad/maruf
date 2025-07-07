import { IconBook, IconCoin, IconHome, IconLetterA, IconSettings } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import Header from '../../../components/Header';
import PurchaseDialog from '../../../components/shop/PurchaseDialog';
import TabNavigation from '../../../components/shop/TabNavigation';
import { FloatingDock } from '../../../components/ui/floating-dock';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import ShopItemCard from './cardShop';
import CartModal from './cart';
import RandomDiscountCard from './flashsale';
import FloatingInventoryButton from './inventoryButton';
import WelcomeBannerShop from './welcomeBannerShop';

const DashboardShop = () => {
  const router = useRouter();
  const { user } = useAuth(); // Add this line to use AuthContext

  // Move handleLogout definition before dockItems
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutLoading(true);
      setShowLogoutDialog(false);
      
      // Clear localStorage and redirect
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      router.push('/authentication/login');
      
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
      
      // FORCE refresh - skip cache for now to get latest data
      // const cached = getCache('shop_items_cache');
      // if (cached) {
      //   setShopItems(cached);
      //   setIsItemsLoading(false);
      //   return;
      // }

      // Fetch ALL items without filtering to ensure we get everything
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('id', { ascending: true }); // Add ordering for consistency
      
      if (error) {
        console.error('Error fetching shop items:', error);
        throw error;
      }

      console.log('All shop items fetched:', data); // Debug log
      console.log('Powerup items found:', data.filter(item => item.type === 'powerup' || item.type === 'power_up')); // Debug powerups specifically
      
      // FIXED grouping to include all types properly
      const groupedItems = {
        items: data.filter(item => item.type === 'badge') || [], // Only badge for badge tab
        borders: data.filter(item => item.type === 'border') || [],
        avatars: data.filter(item => item.type === 'avatar') || [],
        powerups: data.filter(item => item.type === 'powerup' || item.type === 'power_up' || item.type === 'item') || [] // Include item in powerup tab
      };

      console.log('Grouped items:', groupedItems); // Debug log
      console.log('Powerups specifically:', groupedItems.powerups); // Debug powerups
      
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

  // FIXED: Use the API endpoint directly instead of the lib function
  const fetchRandomSaleItem = useCallback(async () => {
    try {
      console.log('=== FETCHING FLASH SALE VIA API ===');
      
      // Use API endpoint directly
      const response = await fetch('/api/get-flash-sale', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('API returned non-OK status:', response.status);
        if (response.status === 404) {
          console.log('No flash sale found, API will create one');
        }
        setRandomDiscountItem(null);
        return;
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('=== API RETURNED FLASH SALE ===');
        console.log('Flash sale data:', result.data);
        console.log('Raw discount_percent:', result.data.discount_percent);
        console.log('Shop item:', result.data.shop_items.name);
        console.log('Shop item price:', result.data.shop_items.price);

        // Create the final item object with DIRECT API values
        const finalItem = {
          ...result.data.shop_items,
          originalPrice: result.data.shop_items.price,
          price: Math.round(result.data.shop_items.price * (1 - result.data.discount_percent / 100)),
          discountPercent: result.data.discount_percent, // DIRECT from API
          source: 'api-direct'
        };

        console.log('=== FINAL ITEM OBJECT ===');
        console.log('Name:', finalItem.name);
        console.log('Original price:', finalItem.originalPrice);
        console.log('Final price:', finalItem.price);
        console.log('Discount percent:', finalItem.discountPercent);
        console.log('Discount type:', typeof finalItem.discountPercent);

        setRandomDiscountItem(finalItem);
      } else {
        console.log('API response invalid or no data');
        setRandomDiscountItem(null);
      }

    } catch (error) {
      console.error('Error fetching flash sale from API:', error);
      setRandomDiscountItem(null);
    }
  }, []); // No dependencies to avoid re-runs

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
      console.log('Shop: Fetching profile for user ID:', userId); // Debug log
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Shop: Profile data from Supabase:', profileData); // Debug log

      if (error) throw error;

      if (profileData) {
        setUserProfile(profileData);
        
        // FORCE use full_name from database
        if (profileData.full_name && profileData.full_name.trim()) {
          console.log('Shop: Using full_name from database:', profileData.full_name); // Debug log
          setUserName(profileData.full_name.trim());
        } else {
          console.log('Shop: No full_name, using User'); // Debug log
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

  // Move fetchFunctions inside useEffect
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userId = localStorage.getItem('userId');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }

    // Load shop data
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchUserProfile(userId),
          fetchShopItems(),
          fetchFlashSale(),
          fetchRandomSaleItem(),
          fetchUserInventory(userId)
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Add the missing getNextMidnight function
  const getNextMidnight = () => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    return nextMidnight;
  };

  // Remove all complex useEffect logic, just simple direct fetch
  useEffect(() => {
    // Simple interval to refresh flash sale every 5 minutes
    const flashSaleInterval = setInterval(() => {
      console.log('Refreshing flash sale from database...');
      fetchRandomSaleItem();
    }, 5 * 60 * 1000); // 5 minutes

    // Initial fetch
    fetchRandomSaleItem();

    // Countdown timer
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const nextMidnight = getNextMidnight();
      const difference = nextMidnight - now;
      
      if (difference <= 0) {
        setRandomItemTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setRandomItemTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => {
      clearInterval(flashSaleInterval);
      clearInterval(countdownInterval);
    };
  }, []); // No dependencies

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
        alert('User tidak terautentikasi. Silakan login ulang.');
        router.push('/authentication/login');
        return;
      }

      const userId = currentUser.id;
      console.log('Using authenticated user ID:', userId);
      
      const total = selectedItem.price;

      if (userProfile.points >= total) {
        console.log('Starting purchase transaction...');
        
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
          alert('Anda sudah memiliki item ini!');
          setShowPurchaseDialog(false);
          return;
        }

        // IMMEDIATELY update local state first for instant UI feedback
        const newPoints = userProfile.points - total;
        console.log('Immediately updating UI from', userProfile.points, 'to', newPoints);
        
        setUserProfile(prev => ({
          ...prev,
          points: newPoints
        }));
        setUserPoints(newPoints);

        // Then update database
        console.log('Updating points in database...');
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

        console.log('Points updated successfully in database');

        // Try adding item to inventory
        let purchaseSuccess = false;
        
        try {
          // Use API endpoint directly (more reliable)
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
            console.log('Item already owned');
            alert('Anda sudah memiliki item ini!');
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
            console.log('API purchase successful:', result);
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
          console.log('Refreshing inventory immediately...');
          await fetchUserInventory(userId);

          // Also verify points from database and sync
          setTimeout(async () => {
            const { data: latestProfile } = await supabase
              .from('profiles')
              .select('points')
              .eq('id', userId)
              .single();
            
            if (latestProfile) {
              console.log('Syncing points from DB:', latestProfile.points);
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

          alert('Pembelian berhasil! Item telah ditambahkan ke inventaris Anda.');
          setShowPurchaseDialog(false);
          setSelectedItem(null);
        }

      } else {
        alert('Point tidak mencukupi untuk melakukan pembelian ini.');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      alert(`Terjadi kesalahan saat melakukan pembelian: ${error.message}`);
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
      console.log('Fetching inventory for user:', userId);
      
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

      // Try API endpoint first (more reliable with service role)
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
          console.log('Shop: Inventory from API:', result);
          
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
        console.log('Shop: API approach failed, trying direct query:', apiError);
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

      console.log('Shop: Inventory data fetched via direct query:', data);

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

  // Update the initial data loading useEffect
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !user) {
      router.push('/authentication/login');
      return;
    }

    // Fetch all required data using AuthContext user
    const fetchData = async () => {
      try {
        const [profileData] = await Promise.all([
          fetchUserProfile(user.id), // Use AuthContext user ID
          fetchShopItems(),
          fetchFlashSale(),
          fetchRandomSaleItem(),
          fetchUserInventory(user.id) // Use AuthContext user ID
        ]);

        if (profileData) {
          setUserProfile(profileData);
          setUserName(profileData.full_name);
          setUserPoints(profileData.points || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, user]); // Add user as dependency

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

  // Add new filter and sort functions - FIXED filtering logic with Premium Membership priority
  const filterAndSortItems = (items) => {
    if (!items || !Array.isArray(items)) {
      console.log('No items array or items is not an array:', items);
      return [];
    }
    
    console.log('Items before filtering:', items);
    console.log('Current price range:', priceRange);
    console.log('Current search query:', searchQuery);
    
    // Apply search filter first
    let filtered = items.filter(item => {
      // Price filter - FIXED: Make sure we handle all price ranges
      const itemPrice = item.price || 0;
      const priceMatch = itemPrice >= priceRange[0] && itemPrice <= priceRange[1];
      
      // Search query filter
      const searchMatch = !searchQuery || searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      console.log(`Item ${item.name}: price=${itemPrice}, priceMatch=${priceMatch}, searchMatch=${searchMatch}`);
      
      return priceMatch && searchMatch;
    });

    console.log('Items after filtering:', filtered);

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
        sorted = [...filtered]; // Keep original order for default
        break;
    }

    // ALWAYS prioritize Premium Membership to be first in Power Up & Item tab
    if (activeTab === 'powerup') {
      const premiumIndex = sorted.findIndex(item => item.name === 'Premium Membership');
      if (premiumIndex > 0) {
        // Move Premium Membership to the beginning
        const premiumItem = sorted.splice(premiumIndex, 1)[0];
        sorted.unshift(premiumItem);
      }
    }

    return sorted;
  };

  // OPTIMIZED: Render shop items function with better performance
  const renderShopItems = (items) => {
    console.log('renderShopItems called with:', items);
    
    if (!items) {
      console.log('No items array provided');
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Tidak ada data item</p>
        </div>
      );
    }

    if (!Array.isArray(items)) {
      console.log('Items is not an array:', typeof items);
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
          {/* Enhanced debug info for troubleshooting */}
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            <div>Total items: {items.length}, After filter: {filteredAndSortedItems.length}</div>
            <div>Price range: {priceRange[0]} - {priceRange[1]}</div>
            <div>Search: "{searchQuery}"</div>
            <div>Item prices: {items.map(item => item.price).join(', ')}</div>
          </div>
        </div>
      );
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

    console.log(`Rendering ${currentItems.length} items of ${filteredAndSortedItems.length} total`);

    return (
      <div className="space-y-6">
        {/* Enhanced debug info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((item) => (
            <ShopItemCard 
              key={`${item.id}-${activeTab}`} // Better key for re-rendering
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

  // Simplified clear cache function
  const clearCacheAndRefresh = async () => {
    console.log('=== CLEARING ALL CACHES AND FORCE REFRESH ===');
    
    // Clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear state
    setRandomDiscountItem(null);
    setIsItemsLoading(true);
    
    try {
      // Force fresh fetch of everything
      await Promise.all([
        fetchShopItems(),
        fetchRandomSaleItem()
      ]);
    } catch (error) {
      console.error('Error in force refresh:', error);
    }
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
              className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl cursor-default"
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
      
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <Header 
            userName={userProfile.full_name || userName || 'User'}
            profileData={userProfile}
            onLogout={handleLogout}
            onProfileUpdate={handleProfileUpdate}
          />
          
          <main className="container mx-auto px-4 py-6 pb-24">
            <div className="max-w-5xl mx-auto">
              {/* CSS for Premium Membership animations */}
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

              {/* Random Discount Card - Enhanced debug */}
              {randomDiscountItem ? (
                <div>
                  {/* Debug panel */}
                  <div className="bg-green-100 border border-green-300 p-2 rounded mb-2 text-xs">
                    <strong>Flash Sale Active:</strong> Source: {randomDiscountItem.source || 'unknown'}, 
                    Discount: {randomDiscountItem.discountPercent}% 
                    (type: {typeof randomDiscountItem.discountPercent})
                  </div>
                  
                  <RandomDiscountCard 
                    randomDiscountItem={randomDiscountItem}
                    randomItemTimeLeft={randomItemTimeLeft}
                    handlePurchase={handlePurchase}
                  />
                </div>
              ) : (
                <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg mb-8">
                  <p className="text-yellow-800">
                    <strong>Debug:</strong> Flash sale tidak tersedia. 
                    Shop items loaded: {shopItems.items.length + shopItems.borders.length + shopItems.avatars.length + shopItems.powerups.length} items.
                    Loading: {isItemsLoading ? 'Yes' : 'No'}
                  </p>
                  <button 
                    onClick={() => {
                      console.log('Manual flash sale trigger via API');
                      fetchRandomSaleItem();
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Refresh Flash Sale
                  </button>
                </div>
              )}

              {/* Tab Navigation */}
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              
              {/* Tab Content */}
              <div className="space-y-6">
                {/* Enhanced filter controls */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-64">
                      <label className="block text-sm font-medium mb-1">Cari Item</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Nama atau deskripsi item..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Range Harga</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          placeholder="Min"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Urutkan</label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="default">Default</option>
                        <option value="price-asc">Harga: Rendah ke Tinggi</option>
                        <option value="price-desc">Harga: Tinggi ke Rendah</option>
                        <option value="name-asc">Nama: A-Z</option>
                        <option value="name-desc">Nama: Z-A</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    >
                      Reset Filter
                    </button>

                    <button
                      onClick={clearCacheAndRefresh}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium"
                      disabled={isItemsLoading}
                    >
                      {isItemsLoading ? 'Loading...' : 'FORCE REFRESH'}
                    </button>
                  </div>
                </div>

                {isItemsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {activeTab === 'badge' && renderShopItems(shopItems.items)}
                    {activeTab === 'borders' && renderShopItems(shopItems.borders)}
                    {activeTab === 'avatars' && renderShopItems(shopItems.avatars)}
                    {activeTab === 'powerup' && renderShopItems(shopItems.powerups)}
                  </>
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
<FloatingDock items={dockItems} />
</div>
</div>
</motion.div>
        </>
      )}
    </div>
  );
};

export default DashboardShop;