import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import Avatar from '../widget/avatar';

// Memory cache untuk AvatarSection component
class AvatarSectionCache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  set(key, data, ttl = 300000) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);

    this.timeouts.set(key, timeout);
  }

  get(key, maxAge = 300000) {
    const cached = this.cache.get(key);
    if (!cached) return null;

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
      this.cache.clear();
      for (const timeout of this.timeouts.values()) {
        clearTimeout(timeout);
      }
      this.timeouts.clear();
    }
  }
}

const avatarSectionCache = new AvatarSectionCache();

const AvatarSection = ({ profileData }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userAvatar, setUserAvatar] = useState(null);
  const [userBadge, setUserBadge] = useState(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);

  // Fetch equipped avatar from user inventory OR avatars table
  const fetchUserAvatar = async (userId) => {
    if (!userId) {
      return;
    }
    
    try {
      setIsLoadingAvatar(true);
      
      // Try cache first
      const cacheKey = `avatar_${userId}`;
      const cachedAvatar = avatarSectionCache.get(cacheKey);
      if (cachedAvatar) {
        setUserAvatar(cachedAvatar);
        setIsLoadingAvatar(false);
        return;
      }
      
      // METHOD 1: Try avatars table first (direct avatar data) - SAME AS HEADER
      try {
        const { data: avatarData, error: avatarError } = await supabase
          .from('avatars')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!avatarError && avatarData && avatarData.avatar) {
          let avatarUrl = avatarData.avatar;
          
          // If URL seems corrupted or truncated, try to regenerate from storage
          if (!avatarUrl.startsWith('http') || avatarUrl.length < 50) {
            try {
              if (avatarUrl.includes('/profile/avatar/')) {
                const pathMatch = avatarUrl.match(/\/profile\/avatar\/[^?]+/);
                if (pathMatch) {
                  const filePath = pathMatch[0].replace('/', '');
                  
                  const { data: signedData, error: signError } = await supabase.storage
                    .from('profile')
                    .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
                  
                  if (!signError && signedData) {
                    avatarUrl = signedData.signedUrl;
                  }
                }
              }
            } catch (regenerateError) {
              // Silent fail
            }
          }
          
          // Convert to shop_items format for consistency
          const convertedAvatar = {
            id: avatarData.id,
            name: avatarData.name || 'Custom Avatar',
            image: avatarUrl,
            type: 'avatar'
          };
          
          // Cache for 10 minutes
          avatarSectionCache.set(cacheKey, convertedAvatar, 600000);
          setUserAvatar(convertedAvatar);
          return;
        }
      } catch (avatarTableError) {
        // Silent fail, try next method
      }
      
      // METHOD 2: Check for equipped avatar in user_inventory as fallback
      const { data: equippedAvatar, error: equippedError } = await supabase
        .from('user_inventory')
        .select(`
          *,
          shop_items!inner(*)
        `)
        .eq('user_id', userId)
        .eq('item_type', 'avatar')
        .eq('is_equipped', true)
        .single();

      if (equippedError && equippedError.code !== 'PGRST116') {
        // Silent error handling
      }

      if (equippedAvatar && equippedAvatar.shop_items) {
        // Cache for 10 minutes
        avatarSectionCache.set(cacheKey, equippedAvatar.shop_items, 600000);
        setUserAvatar(equippedAvatar.shop_items);
        return;
      }

      setUserAvatar(null);
    } catch (error) {
      setUserAvatar(null);
    } finally {
      setIsLoadingAvatar(false);
    }
  };

  // Fetch equipped badge from user inventory
  const fetchUserBadge = async (userId) => {
    try {
      // Try cache first
      const cacheKey = `badge_${userId}`;
      const cachedBadge = avatarSectionCache.get(cacheKey);
      if (cachedBadge) {
        setUserBadge(cachedBadge);
        return;
      }
      
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
              
              // Cache for 10 minutes
              avatarSectionCache.set(cacheKey, badgeResult, 600000);
              setUserBadge(badgeResult);
              return;
            }
          }
        }
      } catch (apiError) {
        // Silent fail
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
          
          // Cache for 10 minutes
          avatarSectionCache.set(cacheKey, badgeResult, 600000);
          setUserBadge(badgeResult);
          return;
        }
      } catch (directError) {
        // Silent fail
      }

      // No badge found - use default active badge
      setUserBadge(null);
      
    } catch (error) {
      setUserBadge(null);
    }
  };

  // Real-time subscription to inventory and avatar changes
  useEffect(() => {
    // Get user ID from either auth context or profileData
    const userId = user?.id || profileData?.id;
    
    if (authLoading) {
      return;
    }
    
    if (!userId) {
      setIsLoadingAvatar(false);
      return;
    }
    
    // Fetch initial avatar and badge
    fetchUserAvatar(userId);
    fetchUserBadge(userId);

    // Load badge background color from localStorage
    const savedBadgeBg = localStorage.getItem(`badge_bg_color_${userId}`);
    if (savedBadgeBg) {
      document.documentElement.style.setProperty('--badge-bg-color', savedBadgeBg);
    }

    // Set up real-time subscription for inventory changes
    const inventorySubscription = supabase
      .channel('inventory_changes_avatar_section')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_inventory',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new?.item_type === 'avatar' || payload.old?.item_type === 'avatar') {
            // Clear cache and refetch
            avatarSectionCache.clear(`avatar_${user.id}`);
            fetchUserAvatar(user.id);
          }
          if (payload.new?.item_type === 'badge' || payload.old?.item_type === 'badge') {
            // Clear cache and refetch
            avatarSectionCache.clear(`badge_${user.id}`);
            fetchUserBadge(user.id);
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for avatars table changes
    const avatarsSubscription = supabase
      .channel('avatars_changes_avatar_section')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'avatars',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Clear cache and refetch
          avatarSectionCache.clear(`avatar_${user.id}`);
          fetchUserAvatar(user.id);
        }
      )
      .subscribe();

    // Listen for inventory updates from other components
    const handleInventoryUpdate = () => {
      // Clear cache and refetch
      avatarSectionCache.clear(`avatar_${user.id}`);
      avatarSectionCache.clear(`badge_${user.id}`);
      fetchUserAvatar(user.id);
      fetchUserBadge(user.id);
    };

    // Listen for avatar table updates
    const handleAvatarTableUpdate = () => {
      // Clear cache and refetch
      avatarSectionCache.clear(`avatar_${user.id}`);
      fetchUserAvatar(user.id);
    };

    // Listen for badge background color updates
    const handleBadgeBgColorUpdate = (e) => {
      if (e.detail && e.detail.color) {
        document.documentElement.style.setProperty('--badge-bg-color', e.detail.color);
      }
    };

    window.addEventListener('inventoryUpdated', handleInventoryUpdate);
    window.addEventListener('avatarTableUpdated', handleAvatarTableUpdate);
    window.addEventListener('badgeBgColorUpdated', handleBadgeBgColorUpdate);

    return () => {
      inventorySubscription.unsubscribe();
      avatarsSubscription.unsubscribe();
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
      window.removeEventListener('avatarTableUpdated', handleAvatarTableUpdate);
      window.removeEventListener('badgeBgColorUpdated', handleBadgeBgColorUpdate);
    };
  }, [user?.id, authLoading]);

  // Get avatar image URL - same logic as Header
  const getAvatarImageUrl = () => {
    const defaultAvatarSrc = '/img/avatar_default.png';
    
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

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center py-8"
    >
      <div 
        className="relative group cursor-pointer"
        onClick={() => {
          localStorage.setItem('settingsTab', 'inventory');
          router.push('/dashboard/setting/DashboardSettings');
        }}
      >
        {/* Enhanced glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-blue-400/30 rounded-full blur-2xl group-hover:blur-3xl opacity-60 group-hover:opacity-80 transition-all duration-700"></div>
        
        {/* Avatar container with better scaling */}
        <div className="relative transform scale-150 group-hover:scale-[1.65] transition-all duration-500 ease-out">
          {isLoadingAvatar ? (
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            </div>
          ) : (
            <Avatar 
              imageUrl={getAvatarImageUrl()}
              alt="Karakter Pembelajaran"
              size="lg"
              borderColor="indigo"
              badge={userBadge ? "award" : "active"}
              badgeData={userBadge}
              userId={user?.id}
            />
          )}
        </div>
        
        {/* Enhanced tooltip */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl whitespace-nowrap shadow-lg">
            <span className="font-medium">Kustomisasi Avatar</span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AvatarSection;
