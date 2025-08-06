import { IconLogout } from '@tabler/icons-react';
import Lottie from 'lottie-react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import notificationAnimation from '../public/icon/notification-V3.json';
import { formatNumber } from '../utils/formatNumber';
import RatingDialog from './dialog/RatingDialog';
import Avatar from './widget/avatar';

// Memory cache untuk Header component
class HeaderCache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  set(key, data, ttl = 300000) { // Default 5 menit TTL
    // Clear existing timeout
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Set cache
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Set timeout untuk auto-clear
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);

    this.timeouts.set(key, timeout);
  }

  get(key, maxAge = 300000) { // Default 5 menit max age
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > maxAge) {
      this.cache.delete(key);
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
        this.timeouts.delete(key);
      }
      return null;
    }

    return cached.data;
  }

  clear(prefix = '') {
    if (prefix) {
      // Clear specific prefix
      for (const [key] of this.cache) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
          if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
            this.timeouts.delete(key);
          }
        }
      }
    } else {
      // Clear all
      this.cache.clear();
      for (const timeout of this.timeouts.values()) {
        clearTimeout(timeout);
      }
      this.timeouts.clear();
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  size() {
    return this.cache.size;
  }
}

// Global cache instance
const headerCache = new HeaderCache();

export default function Header({ 
  userName, 
  profileData, 
  onLogout,
  onProfileUpdate
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [localProfileData, setLocalProfileData] = useState(profileData);
  const [isOnline, setIsOnline] = useState(true);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userBadge, setUserBadge] = useState(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [userLevelDescription, setUserLevelDescription] = useState('Persiapan');
  const [userLevelData, setUserLevelData] = useState({ level: 0, description: 'Persiapan', combined: 'Level 0: Persiapan' });
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Debouncing state for avatar fetch
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [fetchTimeout, setFetchTimeout] = useState(null);

  // Cache state management
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  // Check if current page is dashboard
  const isDashboardPage = router.pathname === '/dashboard/home/Dashboard';

  // Memoized cache keys untuk efisiensi
  const cacheKeys = useMemo(() => {
    if (!user?.id) return {};
    
    return {
      avatar: `avatar_${user.id}`,
      badge: `badge_${user.id}`,
      level: `level_${user.id}`,
      profile: `profile_${user.id}`,
      notifications: `notifications_${user.id}`
    };
  }, [user?.id]);

  // Load dari cache saat component mount
  useEffect(() => {
    if (!user?.id || isCacheLoaded) return;
    
    // Load avatar dari cache
    const cachedAvatar = headerCache.get(cacheKeys.avatar);
    if (cachedAvatar) {
      setUserAvatar(cachedAvatar);
      setIsLoadingAvatar(false);
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    }

    // Load badge dari cache
    const cachedBadge = headerCache.get(cacheKeys.badge);
    if (cachedBadge) {
      setUserBadge(cachedBadge);
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    }

    // Load level data dari cache
    const cachedLevel = headerCache.get(cacheKeys.level);
    if (cachedLevel) {
      setUserLevelData(cachedLevel);
      setUserLevelDescription(cachedLevel.description);
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    }

    // Load profile data dari cache
    const cachedProfile = headerCache.get(cacheKeys.profile);
    if (cachedProfile) {
      setLocalProfileData(cachedProfile);
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    }

    // Load notifications dari cache
    const cachedNotifications = headerCache.get(cacheKeys.notifications);
    if (cachedNotifications !== null) {
      setHasUnreadNotifications(cachedNotifications);
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    }

    // Load avatar background color dari cache atau localStorage
    const cachedAvatarBg = headerCache.get(`avatar_bg_${user.id}`);
    const savedAvatarBg = localStorage.getItem(`avatar_bg_color_${user.id}`);
    const avatarBgColor = cachedAvatarBg || savedAvatarBg || '#3B82F6';
    
    if (avatarBgColor) {
      document.documentElement.style.setProperty('--avatar-bg-color', avatarBgColor);
    }

    // Load badge background color dari cache atau localStorage
    const cachedBadgeBg = headerCache.get(`badge_bg_${user.id}`);
    const savedBadgeBg = localStorage.getItem(`badge_bg_color_${user.id}`);
    const badgeBgColor = cachedBadgeBg || savedBadgeBg || '#3B82F6';
    
    if (badgeBgColor) {
      document.documentElement.style.setProperty('--badge-bg-color', badgeBgColor);
    }

    setIsCacheLoaded(true);
  }, [user?.id, cacheKeys, isCacheLoaded, cacheStats]);

  // Function to determine user level based on roadmap progress dengan caching
  const determineUserLevel = useCallback(async (userId) => {
    if (!userId) return { level: 0, description: 'Persiapan', combined: 'Level 0: Persiapan' };

    // Check cache first
    const cachedLevel = headerCache.get(cacheKeys.level);
    if (cachedLevel) {
      return cachedLevel;
    }

    try {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));

      // Fetch user's roadmap progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('roadmap_id, sub_lessons_completed, status')
        .eq('user_id', userId);

      if (progressError) {
        console.error('Header: Error fetching user progress:', progressError);
        return { level: 0, description: 'Persiapan', combined: 'Level 0: Persiapan' };
      }

      if (!progressData || progressData.length === 0) {
        const defaultLevel = { level: 0, description: 'Persiapan', combined: 'Level 0: Persiapan' };
        // Cache default level for 2 minutes
        headerCache.set(cacheKeys.level, defaultLevel, 120000);
        return defaultLevel;
      }

      // Check if user has completed any sub lessons
      const hasCompletedAnyLesson = progressData.some(progress => 
        progress.sub_lessons_completed && 
        progress.sub_lessons_completed.length > 0
      );

      if (!hasCompletedAnyLesson) {
        const defaultLevel = { level: 0, description: 'Persiapan', combined: 'Level 0: Persiapan' };
        headerCache.set(cacheKeys.level, defaultLevel, 120000);
        return defaultLevel;
      }

      // Determine level based on highest roadmap_id with progress
      const maxRoadmapId = Math.max(...progressData.map(p => p.roadmap_id));
      
      // Map roadmap levels to descriptions and levels
      const levelMapping = {
        1: { level: 1, description: 'Dasar', combined: 'Level 1: Dasar' },
        2: { level: 2, description: 'Menengah', combined: 'Level 2: Menengah' },
        3: { level: 3, description: 'Lanjut', combined: 'Level 3: Lanjut' },
        4: { level: 4, description: 'Mahir', combined: 'Level 4: Mahir' }
      };

      const result = levelMapping[maxRoadmapId] || { level: 0, description: 'Persiapan', combined: 'Level 0: Persiapan' };
      
      // Cache hasil untuk 5 menit
      headerCache.set(cacheKeys.level, result, 300000);
      
      return result;
      
    } catch (error) {
      console.error('Header: Error determining user level:', error);
      return { level: 0, description: 'Persiapan', combined: 'Level 0: Persiapan' };
    }
  }, [cacheKeys, setCacheStats]);

  // ENHANCED: Fetch equipped avatar dengan caching dan debouncing
  const fetchUserAvatar = useCallback(async (userId) => {
    if (!userId) return;

    // Check cache first
    const cachedAvatar = headerCache.get(cacheKeys.avatar);
    if (cachedAvatar) {
      setUserAvatar(cachedAvatar);
      setIsLoadingAvatar(false);
      return;
    }

    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    
    // If called within 3 seconds, debounce it
    if (timeSinceLastFetch < 3000) {
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
      
      const timeout = setTimeout(() => {
        fetchUserAvatarImmediate(userId);
      }, 3000 - timeSinceLastFetch);
      
      setFetchTimeout(timeout);
      return;
    }
    
    // Otherwise fetch immediately
    await fetchUserAvatarImmediate(userId);
  }, [cacheKeys, lastFetchTime, fetchTimeout]);

  // Actual fetch implementation dengan caching
  const fetchUserAvatarImmediate = useCallback(async (userId) => {
    try {
      setLastFetchTime(Date.now()); // Update last fetch time
      setIsLoadingAvatar(true);
      
      // METHOD 1: Try avatars table first (direct avatar data)
      try {
        const { data: avatarData, error: avatarError } = await supabase
          .from('avatars')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!avatarError && avatarData && avatarData.avatar) {
          
          // Check URL validity and clean up if necessary
          let avatarUrl = avatarData.avatar;
          
          // If URL seems corrupted or truncated, try to regenerate from storage
          if (!avatarUrl.startsWith('http') || avatarUrl.length < 50) {
            // If the avatar column contains a partial path, try to get a fresh signed URL
            try {
              // Extract the file path if possible
              if (avatarUrl.includes('/profile/avatar/')) {
                const pathMatch = avatarUrl.match(/\/profile\/avatar\/[^?]+/);
                if (pathMatch) {
                  const filePath = pathMatch[0].replace('/', '');
                  
                  // Get fresh signed URL
                  const { data: signedData, error: signError } = await supabase.storage
                    .from('profile')
                    .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
                  
                  if (!signError && signedData) {
                    avatarUrl = signedData.signedUrl;
                  }
                }
              }
            } catch (regenerateError) {
            }
          }
          
          // Force treat as video since it's from avatar table and contains profile/avatar path
          const isVideoUrl = avatarUrl.includes('/profile/avatar/') || avatarUrl.includes('.mp4');
          
          
          const avatarResult = {
            image: avatarUrl,
            thumbnail: null,
            name: 'Custom Avatar',
            id: avatarData.id,
            source: 'avatars_table',
            isVideo: isVideoUrl
          };
          
          // Cache avatar untuk 10 menit
          headerCache.set(cacheKeys.avatar, avatarResult, 600000);
          
          setUserAvatar(avatarResult);
          return;
        }
      } catch (avatarError) {
      }

      // METHOD 2: Try API endpoint for user_inventory with shop_items
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
            // Find equipped avatar
            const equippedAvatar = result.data.find(item => 
              item.item_type === 'avatar' && item.is_equipped === true
            );
            
            if (equippedAvatar && equippedAvatar.shop_items) {
              
              const avatarResult = {
                image: equippedAvatar.shop_items.image,
                thumbnail: equippedAvatar.shop_items.thumbnail,
                name: equippedAvatar.shop_items.name,
                id: equippedAvatar.shop_items.id,
                source: 'inventory_api'
              };
              
              // Cache avatar untuk 10 menit
              headerCache.set(cacheKeys.avatar, avatarResult, 600000);
              
              setUserAvatar(avatarResult);
              return;
            }
          }
        }
      } catch (apiError) {
      }

      // METHOD 3: Direct Supabase query for user_inventory
      try {
        const { data: inventoryData, error } = await supabase
          .from('user_inventory')
          .select(`
            id,
            item_id,
            item_type,
            is_equipped,
            shop_items (
              id,
              name,
              image,
              thumbnail,
              type
            )
          `)
          .eq('user_id', userId)
          .eq('item_type', 'avatar')
          .eq('is_equipped', true)
          .single();

        if (!error && inventoryData && inventoryData.shop_items) {
          
          const avatarResult = {
            image: inventoryData.shop_items.image,
            thumbnail: inventoryData.shop_items.thumbnail,
            name: inventoryData.shop_items.name,
            id: inventoryData.shop_items.id,
            source: 'inventory_direct'
          };
          
          // Cache avatar untuk 10 menit
          headerCache.set(cacheKeys.avatar, avatarResult, 600000);
          
          setUserAvatar(avatarResult);
          return;
        }
      } catch (directError) {
      }

      // No avatar found
      setUserAvatar(null);
      
    } catch (error) {
      console.error('Header: Error fetching user avatar:', error);
      setUserAvatar(null);
    } finally {
      setIsLoadingAvatar(false);
    }
  }, [cacheKeys, setCacheStats]);

  // Fetch equipped badge dengan caching
  const fetchUserBadge = useCallback(async (userId) => {
    if (!userId) return;

    // Check cache first
    const cachedBadge = headerCache.get(cacheKeys.badge);
    if (cachedBadge) {
      setUserBadge(cachedBadge);
      return;
    }

    try {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      
      // METHOD 1: Try API endpoint for user_inventory with shop_items
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
            // Find equipped badge
            const equippedBadge = result.data.find(item => 
              item.item_type === 'badge' && item.is_equipped === true
            );
            
            if (equippedBadge && equippedBadge.shop_items) {
              
              const badgeResult = {
                image: equippedBadge.shop_items.image,
                thumbnail: equippedBadge.shop_items.thumbnail,
                name: equippedBadge.shop_items.name,
                id: equippedBadge.shop_items.id,
                badge_type: equippedBadge.shop_items.badge_type || 'award',
                badge_color: equippedBadge.shop_items.badge_color || 'blue',
                source: 'inventory_api'
              };
              
              // Cache badge untuk 10 menit
              headerCache.set(cacheKeys.badge, badgeResult, 600000);
              
              setUserBadge(badgeResult);
              return;
            }
          }
        }
      } catch (apiError) {
      }

      // METHOD 2: Direct Supabase query for user_inventory
      try {
        const { data: inventoryData, error } = await supabase
          .from('user_inventory')
          .select(`
            id,
            item_id,
            item_type,
            is_equipped,
            shop_items (
              id,
              name,
              image,
              thumbnail,
              type,
              badge_type,
              badge_color
            )
          `)
          .eq('user_id', userId)
          .eq('item_type', 'badge')
          .eq('is_equipped', true)
          .single();

        if (!error && inventoryData && inventoryData.shop_items) {
          
          const badgeResult = {
            image: inventoryData.shop_items.image,
            thumbnail: inventoryData.shop_items.thumbnail,
            name: inventoryData.shop_items.name,
            id: inventoryData.shop_items.id,
            badge_type: inventoryData.shop_items.badge_type || 'award',
            badge_color: inventoryData.shop_items.badge_color || 'blue',
            source: 'inventory_direct'
          };
          
          // Cache badge untuk 10 menit
          headerCache.set(cacheKeys.badge, badgeResult, 600000);
          
          setUserBadge(badgeResult);
          return;
        }
      } catch (directError) {
      }

      // No badge found - use default active badge
      setUserBadge(null);
      
    } catch (error) {
      console.error('Header: Error fetching user badge:', error);
      setUserBadge(null);
    }
  }, [cacheKeys, setCacheStats]);

  // Check if user should be prompted for rating dengan caching
  const checkRatingStatus = useCallback(async (userId) => {
    if (!userId) return false;

    // Check memory cache first
    const cacheKey = `rating_status_${userId}`;
    const cachedStatus = headerCache.get(cacheKey, 60000); // 1 menit cache
    if (cachedStatus !== null) {
      return cachedStatus;
    }

    try {
      // Check if user already rated
      const hasRated = localStorage.getItem(`user_rated_${userId}`);
      if (hasRated) {
        headerCache.set(cacheKey, false, 60000);
        return false;
      }

      // Check if user recently skipped (within 7 days)
      const skippedTime = localStorage.getItem(`user_rating_skipped_${userId}`);
      if (skippedTime) {
        const daysSinceSkip = (Date.now() - parseInt(skippedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceSkip < 7) {
          headerCache.set(cacheKey, false, 60000);
          return false; // Don't show again for 7 days
        }
      }

      // Check in database
      const { data: existingRating } = await supabase
        .from('rating')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingRating) {
        localStorage.setItem(`user_rated_${userId}`, 'true');
        headerCache.set(cacheKey, false, 60000);
        return false;
      }

      headerCache.set(cacheKey, true, 60000);
      return true; // Should show rating dialog
    } catch (error) {
      console.error('Error checking rating status:', error);
      headerCache.set(cacheKey, false, 60000);
      return false;
    }
  }, []);

  // Check for unread notifications dengan caching
  const checkUnreadNotifications = useCallback(async (userId) => {
    if (!userId) return;

    // Check cache first
    const cachedNotifications = headerCache.get(cacheKeys.notifications, 120000); // 2 menit cache
    if (cachedNotifications !== null) {
      setHasUnreadNotifications(cachedNotifications);
      return;
    }

    try {
      
      // Check for unread announcements
      const { data: announcements, error: announcementError } = await supabase
        .from('announcements')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      if (!announcementError && announcements && announcements.length > 0) {
        // Check if user has read the latest announcement
        const latestAnnouncement = announcements[0];
        const lastReadTime = localStorage.getItem(`announcement_read_${userId}`);
        
        if (!lastReadTime || new Date(latestAnnouncement.created_at) > new Date(lastReadTime)) {
          headerCache.set(cacheKeys.notifications, true, 120000);
          setHasUnreadNotifications(true);
          return;
        }
      }

      // You can add more checks here for other types of notifications:
      // - New messages
      // - System notifications
      // - Achievement notifications
      // - Shop updates
      // etc.

      headerCache.set(cacheKeys.notifications, false, 120000);
      setHasUnreadNotifications(false);
    } catch (error) {
      console.error('Error checking unread notifications:', error);
      headerCache.set(cacheKeys.notifications, false, 120000);
      setHasUnreadNotifications(false);
    }
  }, [cacheKeys]);

  // Real-time subscription to profile changes dengan cache invalidation
  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time subscription for profile
    const profileSubscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            // Clear profile cache
            headerCache.clear(`profile_${user.id}`);
            
            setLocalProfileData(payload.new);
            
            // Cache new profile data
            headerCache.set(cacheKeys.profile, payload.new, 300000);
            
            if (onProfileUpdate) {
              onProfileUpdate(payload.new);
            }
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for inventory changes (avatar equipment)
    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_inventory',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Only refresh avatar when avatar items change AND equipped status changes
          const isAvatarChange = payload.new?.item_type === 'avatar' || payload.old?.item_type === 'avatar';
          const isBadgeChange = payload.new?.item_type === 'badge' || payload.old?.item_type === 'badge';
          const equippedStatusChanged = payload.new?.is_equipped !== payload.old?.is_equipped;
          
          if (isAvatarChange && (equippedStatusChanged || payload.eventType === 'INSERT' || payload.eventType === 'DELETE')) {
            // Clear cache and refetch
            headerCache.clear(`avatar_${user.id}`);
            fetchUserAvatar(user.id);
          }
          
          if (isBadgeChange && (equippedStatusChanged || payload.eventType === 'INSERT' || payload.eventType === 'DELETE')) {
            // Clear cache and refetch
            headerCache.clear(`badge_${user.id}`);
            fetchUserBadge(user.id);
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for avatars table changes
    const avatarsSubscription = supabase
      .channel('avatars_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'avatars',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Clear avatar cache and refetch
          headerCache.clear(`avatar_${user.id}`);
          fetchUserAvatar(user.id);
        }
      )
      .subscribe();

    // Set up real-time subscription for user progress changes (for level updates)
    const progressSubscription = supabase
      .channel('progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          // Clear level cache and update level description when progress changes
          headerCache.clear(`level_${user.id}`);
          const levelData = await determineUserLevel(user.id);
          setUserLevelDescription(levelData.description);
          setUserLevelData(levelData);
        }
      )
      .subscribe();

    // Fetch initial data only if not in cache
    if (!isCacheLoaded) {
      fetchUserAvatar(user.id);
      fetchUserBadge(user.id);
      
      // Fetch and set user level description
      const fetchAndSetLevel = async () => {
        const levelData = await determineUserLevel(user.id);
        setUserLevelDescription(levelData.description);
        setUserLevelData(levelData);
      };
      fetchAndSetLevel();

      // Check for unread notifications
      checkUnreadNotifications(user.id);
    }

    // Clean up subscriptions
    return () => {
      profileSubscription.unsubscribe();
      inventorySubscription.unsubscribe();
      avatarsSubscription.unsubscribe();
      progressSubscription.unsubscribe();
    };
  }, [user?.id, onProfileUpdate, isCacheLoaded, fetchUserAvatar, fetchUserBadge, determineUserLevel, checkUnreadNotifications, cacheKeys]);

  // Listen for inventory updates from other components
  useEffect(() => {
    const handleInventoryUpdate = (e) => {
      if (e.key === 'inventoryUpdated' && user?.id) {
        fetchUserAvatar(user.id);
        fetchUserBadge(user.id);
      }
    };

    const handleCustomInventoryUpdate = (e) => {
      if (user?.id) {
        fetchUserAvatar(user.id);
        fetchUserBadge(user.id);
      }
    };

    const handleAvatarBgColorUpdate = (e) => {
      if (user?.id && e.detail?.userId === user.id) {
        // Force re-render by updating a state or trigger background update
        const color = e.detail.color;
        document.documentElement.style.setProperty('--avatar-bg-color', color);
        
        // Update cache with new color
        headerCache.set(`avatar_bg_${user.id}`, color, 3600000); // 1 hour
      }
    };

    const handleBadgeBgColorUpdate = (e) => {
      if (user?.id && e.detail?.userId === user.id) {
        // Force re-render by updating a state or trigger background update
        const color = e.detail.color;
        document.documentElement.style.setProperty('--badge-bg-color', color);
        
        // Update cache with new color
        headerCache.set(`badge_bg_${user.id}`, color, 3600000); // 1 hour
      }
    };

    window.addEventListener('storage', handleInventoryUpdate);
    window.addEventListener('inventoryUpdated', handleCustomInventoryUpdate);
    window.addEventListener('avatarBgColorUpdated', handleAvatarBgColorUpdate);
    window.addEventListener('badgeBgColorUpdated', handleBadgeBgColorUpdate);

    return () => {
      window.removeEventListener('storage', handleInventoryUpdate);
      window.removeEventListener('inventoryUpdated', handleCustomInventoryUpdate);
      window.removeEventListener('avatarBgColorUpdated', handleAvatarBgColorUpdate);
      window.removeEventListener('badgeBgColorUpdated', handleBadgeBgColorUpdate);
    };
  }, [user?.id]);

  // Sync profile data from props
  useEffect(() => {
    setLocalProfileData(profileData);
  }, [profileData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
    };
  }, [fetchTimeout]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to refresh profile data dengan caching
  const refreshProfileData = useCallback(async () => {
    if (!user?.id) return;

    try {
      
      // Clear all user-related cache
      headerCache.clear(`profile_${user.id}`);
      headerCache.clear(`avatar_${user.id}`);
      headerCache.clear(`badge_${user.id}`);
      headerCache.clear(`level_${user.id}`);
      headerCache.clear(`notifications_${user.id}`);
      
      
      // Refetch all data
      await Promise.all([
        fetchUserAvatar(user.id),
        fetchUserBadge(user.id),
        determineUserLevel(user.id).then(levelData => {
          setUserLevelDescription(levelData.description);
          setUserLevelData(levelData);
        }),
        checkUnreadNotifications(user.id)
      ]);
      
      
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    }
  }, [user?.id, fetchUserAvatar, fetchUserBadge, determineUserLevel, checkUnreadNotifications]);

  // Use local profile data with fallback to props - prioritize full_name
  const currentProfileData = localProfileData || profileData || {
    full_name: userName || 'User',
    level: userLevelData.level,
    level_description: userLevelData.description,
    streak: 0,
    xp: 0,
    points: 0,
    energy: 5
  };

  // Get display name - FORCE prioritize full_name from database
  const getDisplayName = () => {
    
    // ONLY use full_name from database if it exists and is not empty
    if (currentProfileData.full_name && 
        currentProfileData.full_name.trim() && 
        currentProfileData.full_name.trim() !== '') {
      return currentProfileData.full_name.trim();
    }
    
    // If userName prop is provided and is not an email-derived name, use it
    if (userName && 
        userName.trim() && 
        !userName.includes('@') && 
        userName !== user?.email?.split('@')[0]) {
      return userName.trim();
    }
    
    // Final fallback
    return 'User';
  };

  // ENHANCED: Avatar component with equipped avatar support - PRIORITIZE VIDEO FROM IMAGE COLUMN
  const AvatarDisplay = () => {
    // Default avatar
    const defaultAvatarSrc = '/img/avatar_default.png';
    
    // Get avatar source - prioritize video from image column for equipped avatars
    const getAvatarImageUrl = () => {
      if (userAvatar) {
        // PRIORITIZE IMAGE COLUMN (which contains video URLs)
        if (userAvatar.image) {
          return userAvatar.image;
        }
        // Fallback to thumbnail if no image
        if (userAvatar.thumbnail) {
          return userAvatar.thumbnail;
        }
      }
      return defaultAvatarSrc;
    };

    // Handle click to navigate to settings inventory tab
    const handleAvatarClick = () => {
      localStorage.setItem('settingsTab', 'inventory');
      router.push('/dashboard/setting/DashboardSettings');
    };

    // Get badge type from equipped badge or default to active
    const getBadgeType = () => {
      if (userBadge && userBadge.badge_type) {
        return userBadge.badge_type;
      }
      return 'active'; // Default badge type
    };

    return (
      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
        {/* Enhanced glow effect with custom avatar background color */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl group-hover:blur-3xl opacity-60 group-hover:opacity-80 transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${
              getComputedStyle(document.documentElement).getPropertyValue('--avatar-bg-color') || '#3B82F6'
            }40, ${
              getComputedStyle(document.documentElement).getPropertyValue('--avatar-bg-color') || '#3B82F6'
            }20, transparent)`
          }}
        ></div>
        
        {/* Avatar container with better scaling - using same component as AvatarSection */}
        <div className="relative transform scale-125 group-hover:scale-[1.35] transition-all duration-500 ease-out">
          <Avatar 
            imageUrl={getAvatarImageUrl()}
            alt="Karakter Pembelajaran"
            size="sm"
            borderColor="indigo"
            badge={getBadgeType()}
            badgeData={userBadge}
            userId={user?.id}
          />
        </div>
        
        {/* Enhanced tooltip */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-xl border border-gray-700">
            <span className="font-medium">Kustomisasi Avatar</span>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-gray-900"></div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced logout handler using AuthContext
  const handleLogout = async () => {
    try {
      if (!user?.id) {
        await signOut();
        return;
      }

      // Check if user should rate before logout
      const shouldShowRating = await checkRatingStatus(user.id);
      
      if (shouldShowRating) {
        setShowRatingDialog(true);
        return; // Don't logout yet, wait for rating
      }

      // Proceed with normal logout
      if (onLogout) {
        onLogout();
      }
      await signOut();
      
    } catch (error) {
      console.error('Logout error:', error);
      alert('Terjadi kesalahan saat logout. Silakan coba lagi.');
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async (rating, comment) => {
    // Proceed with logout after rating
    if (onLogout) {
      onLogout();
    }
    await signOut();
  };

  // Handle rating skip
  const handleRatingSkip = async () => {
    // Proceed with logout after skip
    if (onLogout) {
      onLogout();
    }
    await signOut();
  };

  // Listen for points updates dengan caching
  useEffect(() => {
    const handlePointsUpdate = async (e) => {
      if (e.key === 'pointsUpdated' && user?.id) {
        
        // Clear profile cache
        headerCache.clear(`profile_${user.id}`);
        
        // Refresh profile from database to get latest points
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && profileData) {
            
            // Cache new profile data
            headerCache.set(cacheKeys.profile, profileData, 300000);
            
            setLocalProfileData(profileData);
            if (onProfileUpdate) {
              onProfileUpdate(profileData);
            }
          }
        } catch (error) {
          console.error('Header: Error refreshing profile:', error);
        }
      }
    };

    const handleCustomPointsUpdate = async (e) => {
      
      if (user?.id) {
        try {
          // Clear profile cache
          headerCache.clear(`profile_${user.id}`);
          
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && profileData) {
            
            // Cache updated profile data
            headerCache.set(cacheKeys.profile, profileData, 300000);
            
            setLocalProfileData(profileData);
            if (onProfileUpdate) {
              onProfileUpdate(profileData);
            }
          }
        } catch (error) {
          console.error('Header: Error refreshing profile from custom event:', error);
        }
      }
    };

    window.addEventListener('storage', handlePointsUpdate);
    window.addEventListener('pointsUpdated', handleCustomPointsUpdate);

    return () => {
      window.removeEventListener('storage', handlePointsUpdate);
      window.removeEventListener('pointsUpdated', handleCustomPointsUpdate);
    };
  }, [user?.id, onProfileUpdate, cacheKeys]);

  // Periodic check untuk notifications dengan smart caching
  useEffect(() => {
    if (!user?.id) return;

    // Check immediately hanya jika tidak ada di cache
    const cachedNotifications = headerCache.get(cacheKeys.notifications, 120000);
    if (cachedNotifications === null) {
      checkUnreadNotifications(user.id);
    }

    // Set up interval untuk check setiap 2 menit (lebih jarang karena sudah ada cache)
    const notificationInterval = setInterval(() => {
      // Clear cache sebelum check ulang untuk memastikan data fresh
      headerCache.clear(`notifications_${user.id}`);
      checkUnreadNotifications(user.id);
    }, 120000); // 2 menit

    return () => {
      clearInterval(notificationInterval);
    };
  }, [user?.id, checkUnreadNotifications, cacheKeys]);

  // Cache debug dan monitoring (Development Only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && user?.id) {
      const logCacheStats = () => {
        const stats = {
          cacheSize: headerCache.size(),
          hits: cacheStats.hits,
          misses: cacheStats.misses,
          hitRate: cacheStats.hits + cacheStats.misses > 0 ? 
            ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2) + '%' : '0%',
          cachedKeys: Array.from(headerCache.cache.keys()).filter(key => key.includes(user.id))
        };
      };

      // Log cache stats setiap 30 detik di development
      const statsInterval = setInterval(logCacheStats, 30000);
      
      // Log initial stats
      setTimeout(logCacheStats, 2000);

      return () => clearInterval(statsInterval);
    }
  }, [user?.id, cacheStats]);

  // Cleanup cache saat component unmount
  useEffect(() => {
    return () => {
      // Clear cache saat user logout atau component unmount
      if (user?.id) {
        headerCache.clear(`profile_${user.id}`);
        headerCache.clear(`avatar_${user.id}`);
        headerCache.clear(`badge_${user.id}`);
        headerCache.clear(`level_${user.id}`);
        headerCache.clear(`notifications_${user.id}`);
      }
    };
  }, [user?.id]);

  return (
    <>
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50 w-full font-['Poppins'] min-h-[120px]">
        <div className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Conditionally render avatar - hide on dashboard page */}
              {!isDashboardPage && <AvatarDisplay />}
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-lg font-['Poppins']">
                    {getDisplayName()}
                  </h2>
                  <span className="text-xs bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1.5 rounded-full font-medium font-['Poppins'] relative group cursor-help shadow-lg">
                    {userLevelData.combined}
                    {/* Level tooltip - positioned to the right */}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 pointer-events-none z-[99999]">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-xl border border-gray-700">
                        <span className="font-medium">Level pembelajaran Anda saat ini</span>
                        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  </span>
                  {/* Admin badge */}
                  {currentProfileData.is_admin && (
                    <span className="text-xs bg-yellow-500/90 text-white px-3 py-1.5 rounded-full font-medium font-['Poppins']">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  
                  {/* Streak Counter */}
                  <div 
                    className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg relative group cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => router.push('/dashboard/home/Dashboard')}
                  >
                    <span className="text-base font-semibold font-['Poppins']" style={{ color: '#e8392f' }}>{currentProfileData.streak || 0}</span>
                    <img src="/gif/flashsale.gif" alt="Streak" className="w-6 h-6" />
                    {/* Streak tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-xl border border-gray-700">
                        <span className="font-medium">Hari berturut-turut belajar - Klik untuk dashboard</span>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* XP Counter */}
                  <div 
                    className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg relative group cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => router.push('/dashboard/DashboardBelajar')}
                  >
                    <span className="text-base font-semibold font-['Poppins']" style={{ color: '#ffd602' }}>{currentProfileData.xp || 0}</span>
                    <img src="/gif/Trophy.gif" alt="XP Trophy" className="w-6 h-6" />
                    {/* XP tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-xl border border-gray-700">
                        <span className="font-medium">Experience Points - Klik untuk belajar</span>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Points Counter */}
                  <div 
                    className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg relative group cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => router.push('/dashboard/toko/DashboardShop')}
                  >
                    <span className="text-base font-semibold font-['Poppins']" style={{ color: '#4b9f4a' }}>{formatNumber(currentProfileData.points || 0)}</span>
                    <img src="/gif/Dollar.gif" alt="Points" className="w-6 h-6" />
                    {/* Points tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-xl border border-gray-700">
                        <span className="font-medium">Poin untuk berbelanja - Klik untuk toko</span>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Energy Counter */}
                  <div 
                    className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-lg relative group cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => {
                      localStorage.setItem('shopTab', 'powerup');
                      router.push('/dashboard/toko/DashboardShop');
                    }}
                  >
                    <span className="text-base font-semibold font-['Poppins']" style={{ color: '#9645FF' }}>{currentProfileData.energy || 0}</span>
                    <img src="/gif/Battery.gif" alt="Energy" className="w-6 h-6" />
                    {/* Energy tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-xl border border-gray-700">
                        <span className="font-medium">Energi untuk soal - Klik untuk power-up</span>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">

              
{/* Conditional Notification bell with glassmorphism */}
<button 
  onClick={() => {
    // Mark notifications as read when clicked
    if (hasUnreadNotifications && user?.id) {
      localStorage.setItem(`announcement_read_${user.id}`, new Date().toISOString());
      setHasUnreadNotifications(false);
    }
    router.push('/dashboard/DashboardAnnouncement');
  }} 
  className="relative p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer group shadow-lg"
  title="Lihat Pengumuman"
>
  <div className="w-5 h-5 flex items-center justify-center">
    {hasUnreadNotifications ? (
      // Animated bell for unread notifications
      <Lottie 
        animationData={notificationAnimation}
        loop={true}
        autoplay={true}
        style={{
          width: '20px',
          height: '20px',
          // Remove filter to show original colors including red dot
        }}
        className="group-hover:scale-110 transition-transform duration-200"
      />
    ) : (
      // Static white bell SVG for no notifications - consistent with IconLogout
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-white group-hover:scale-110 transition-transform duration-200"
      >
        <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
      </svg>
    )}
  </div>
</button>
              
              {/* Logout button with glassmorphism */}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 text-sm text-white hover:text-gray-200 transition-all duration-300 font-['Poppins'] shadow-lg group"
              >
                <IconLogout size={20} className="group-hover:scale-110 transition-transform duration-200" />

              </button>
            </div>
          </div>
          
          {/* Connection status indicator */}
          {!isOnline && (
            <div className="mt-3 flex justify-center">
              <span className="inline-flex items-center gap-2 text-xs bg-red-500/20 text-red-100 px-3 py-1.5 rounded-full font-['Poppins']">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                Mode Offline - Data mungkin tidak sinkron
              </span>
            </div>
          )}
        </div>
      </header>
      
      {/* Rating Dialog */}
      <RatingDialog
        isOpen={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        onSubmit={handleRatingSubmit}
        onSkip={handleRatingSkip}
      />
    </>
  );
  
}
