import { IconAward, IconBattery1, IconBell, IconCalendar, IconLogout, IconTrophy } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatNumber } from '../utils/formatNumber';
import RatingDialog from './dialog/RatingDialog';

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
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  // Check if current page is dashboard
  const isDashboardPage = router.pathname === '/dashboard/home/Dashboard';

  // ENHANCED: Fetch equipped avatar from user inventory OR avatars table
  const fetchUserAvatar = async (userId) => {
    try {
      setIsLoadingAvatar(true);
      console.log('Header: Fetching equipped avatar for user:', userId);
      
      // METHOD 1: Try avatars table first (direct avatar data)
      try {
        console.log('Header: Trying avatars table...');
        const { data: avatarData, error: avatarError } = await supabase
          .from('avatars')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!avatarError && avatarData && avatarData.avatar) {
          console.log('Header: Found avatar in avatars table:', avatarData);
          console.log('Header: Raw Avatar URL:', avatarData.avatar);
          
          // Check URL validity and clean up if necessary
          let avatarUrl = avatarData.avatar;
          
          // If URL seems corrupted or truncated, try to regenerate from storage
          if (!avatarUrl.startsWith('http') || avatarUrl.length < 50) {
            console.log('Header: Avatar URL seems corrupted, trying to regenerate...');
            // If the avatar column contains a partial path, try to get a fresh signed URL
            try {
              // Extract the file path if possible
              if (avatarUrl.includes('/profile/avatar/')) {
                const pathMatch = avatarUrl.match(/\/profile\/avatar\/[^?]+/);
                if (pathMatch) {
                  const filePath = pathMatch[0].replace('/', '');
                  console.log('Header: Extracting file path:', filePath);
                  
                  // Get fresh signed URL
                  const { data: signedData, error: signError } = await supabase.storage
                    .from('profile')
                    .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
                  
                  if (!signError && signedData) {
                    avatarUrl = signedData.signedUrl;
                    console.log('Header: Generated fresh signed URL:', avatarUrl);
                  }
                }
              }
            } catch (regenerateError) {
              console.log('Header: Could not regenerate URL:', regenerateError);
            }
          }
          
          // Force treat as video since it's from avatar table and contains profile/avatar path
          const isVideoUrl = avatarUrl.includes('/profile/avatar/') || avatarUrl.includes('.mp4');
          
          console.log('Header: Processed Avatar URL:', avatarUrl);
          console.log('Header: Is video URL?', isVideoUrl);
          
          setUserAvatar({
            image: avatarUrl, // Use processed avatar URL
            thumbnail: null, // No thumbnail in avatars table
            name: 'Custom Avatar',
            id: avatarData.id,
            source: 'avatars_table',
            isVideo: isVideoUrl // Add explicit video flag
          });
          return;
        }
      } catch (avatarError) {
        console.log('Header: Avatars table query failed:', avatarError);
      }

      // METHOD 2: Try API endpoint for user_inventory with shop_items
      try {
        console.log('Header: Trying inventory API...');
        const response = await fetch('/api/get-inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Header: Inventory from API:', result);
          
          if (result.success && result.data) {
            // Find equipped avatar
            const equippedAvatar = result.data.find(item => 
              item.item_type === 'avatar' && item.is_equipped === true
            );
            
            if (equippedAvatar && equippedAvatar.shop_items) {
              console.log('Header: Found equipped avatar from inventory:', equippedAvatar);
              console.log('Header: Avatar image URL:', equippedAvatar.shop_items.image);
              console.log('Header: Avatar thumbnail URL:', equippedAvatar.shop_items.thumbnail);
              console.log('Header: Is video?', equippedAvatar.shop_items.image?.endsWith('.mp4'));
              
              setUserAvatar({
                image: equippedAvatar.shop_items.image, // PRIORITIZE IMAGE COLUMN (video URL)
                thumbnail: equippedAvatar.shop_items.thumbnail,
                name: equippedAvatar.shop_items.name,
                id: equippedAvatar.shop_items.id,
                source: 'inventory_api'
              });
              return;
            }
          }
        }
      } catch (apiError) {
        console.log('Header: API approach failed:', apiError);
      }

      // METHOD 3: Direct Supabase query for user_inventory
      try {
        console.log('Header: Trying direct inventory query...');
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
          console.log('Header: Found equipped avatar via direct query:', inventoryData);
          console.log('Header: Direct query - Avatar image URL:', inventoryData.shop_items.image);
          console.log('Header: Direct query - Avatar thumbnail URL:', inventoryData.shop_items.thumbnail);
          console.log('Header: Direct query - Is video?', inventoryData.shop_items.image?.endsWith('.mp4'));
          
          setUserAvatar({
            image: inventoryData.shop_items.image, // PRIORITIZE IMAGE COLUMN (video URL)
            thumbnail: inventoryData.shop_items.thumbnail,
            name: inventoryData.shop_items.name,
            id: inventoryData.shop_items.id,
            source: 'inventory_direct'
          });
          return;
        }
      } catch (directError) {
        console.log('Header: Direct query failed:', directError);
      }

      // No avatar found
      console.log('Header: No avatar found from any source');
      setUserAvatar(null);
      
    } catch (error) {
      console.error('Header: Error fetching user avatar:', error);
      setUserAvatar(null);
    } finally {
      setIsLoadingAvatar(false);
    }
  };

  // Check if user should be prompted for rating
  const checkRatingStatus = async (userId) => {
    try {
      // Check if user already rated
      const hasRated = localStorage.getItem(`user_rated_${userId}`);
      if (hasRated) return false;

      // Check if user recently skipped (within 7 days)
      const skippedTime = localStorage.getItem(`user_rating_skipped_${userId}`);
      if (skippedTime) {
        const daysSinceSkip = (Date.now() - parseInt(skippedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceSkip < 7) return false; // Don't show again for 7 days
      }

      // Check in database
      const { data: existingRating } = await supabase
        .from('rating')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingRating) {
        localStorage.setItem(`user_rated_${userId}`, 'true');
        return false;
      }

      return true; // Should show rating dialog
    } catch (error) {
      console.error('Error checking rating status:', error);
      return false;
    }
  };

  // Real-time subscription to profile changes
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
          console.log('Header: Profile updated:', payload);
          if (payload.new) {
            setLocalProfileData(payload.new);
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
          console.log('Header: Inventory updated:', payload);
          // Refresh avatar when inventory changes
          if (payload.new?.item_type === 'avatar' || payload.old?.item_type === 'avatar') {
            console.log('Header: Avatar inventory changed, refreshing...');
            fetchUserAvatar(user.id);
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
          console.log('Header: Avatars table updated:', payload);
          fetchUserAvatar(user.id);
        }
      )
      .subscribe();

    // Fetch initial avatar data
    fetchUserAvatar(user.id);

    // Clean up subscriptions
    return () => {
      profileSubscription.unsubscribe();
      inventorySubscription.unsubscribe();
      avatarsSubscription.unsubscribe();
    };
  }, [user?.id, onProfileUpdate]);

  // Listen for inventory updates from other components
  useEffect(() => {
    const handleInventoryUpdate = (e) => {
      if (e.key === 'inventoryUpdated' && user?.id) {
        console.log('Header: Inventory update detected, refreshing avatar...');
        fetchUserAvatar(user.id);
      }
    };

    const handleCustomInventoryUpdate = (e) => {
      console.log('Header: Custom inventory update event:', e.detail);
      if (user?.id) {
        fetchUserAvatar(user.id);
      }
    };

    window.addEventListener('storage', handleInventoryUpdate);
    window.addEventListener('inventoryUpdated', handleCustomInventoryUpdate);

    return () => {
      window.removeEventListener('storage', handleInventoryUpdate);
      window.removeEventListener('inventoryUpdated', handleCustomInventoryUpdate);
    };
  }, [user?.id]);

  // Sync profile data from props
  useEffect(() => {
    setLocalProfileData(profileData);
  }, [profileData]);

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

  // Function to refresh profile data manually - simplified
  const refreshProfileData = async () => {
    if (!user?.id) return;

    try {
      // Skip complex profile refresh for now
      console.log('Profile refresh skipped due to policy issues');
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    }
  };

  // Use local profile data with fallback to props - prioritize full_name
  const currentProfileData = localProfileData || profileData || {
    full_name: userName || 'User',
    level: 1,
    level_description: 'Pemula',
    streak: 0,
    xp: 0,
    points: 0,
    energy: 5
  };

  // Get display name - FORCE prioritize full_name from database
  const getDisplayName = () => {
    console.log('Getting display name...'); // Debug log
    console.log('Current profile data:', currentProfileData); // Debug log
    console.log('UserName prop:', userName); // Debug log
    
    // ONLY use full_name from database if it exists and is not empty
    if (currentProfileData.full_name && 
        currentProfileData.full_name.trim() && 
        currentProfileData.full_name.trim() !== '') {
      console.log('Using full_name from profile:', currentProfileData.full_name); // Debug log
      return currentProfileData.full_name.trim();
    }
    
    // If userName prop is provided and is not an email-derived name, use it
    if (userName && 
        userName.trim() && 
        !userName.includes('@') && 
        userName !== user?.email?.split('@')[0]) {
      console.log('Using userName prop:', userName); // Debug log
      return userName.trim();
    }
    
    // Final fallback
    console.log('Using fallback: User'); // Debug log
    return 'User';
  };

  // ENHANCED: Avatar component with equipped avatar support - PRIORITIZE VIDEO FROM IMAGE COLUMN
  const AvatarDisplay = () => {
    // Default avatar
    const defaultAvatarSrc = '/img/avatar_default.png';
    
    // Get avatar source - prioritize video from image column for equipped avatars
    const getAvatarMedia = () => {
      if (userAvatar) {
        // PRIORITIZE IMAGE COLUMN (which contains video URLs)
        if (userAvatar.image) {
          // Enhanced video detection for Supabase URLs
          const isVideo = userAvatar.image.includes('.mp4') || 
                          userAvatar.image.includes('video') || 
                          userAvatar.image.includes('/profile/avatar/') ||
                          userAvatar.isVideo === true;
          
          
          return {
            src: userAvatar.image,
            type: isVideo ? 'video' : 'image'
          };
        }
        // Fallback to thumbnail if no image
        if (userAvatar.thumbnail) {
          return {
            src: userAvatar.thumbnail,
            type: userAvatar.thumbnail.endsWith('.mp4') ? 'video' : 'image'
          };
        }
      }
      return {
        src: defaultAvatarSrc,
        type: 'image'
      };
    };

    const avatarMedia = getAvatarMedia();
    const isEquippedAvatar = !!userAvatar;

    return (
      <div className="relative">
        <div 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 overflow-hidden ${
            isEquippedAvatar ? 'ring-2 ring-indigo-300 ring-offset-2' : ''
          }`}
          style={{
            border: isEquippedAvatar ? '3px solid #6366f1' : '2px solid #e5e7eb',
            background: isLoadingAvatar ? '#f3f4f6' : 'transparent'
          }}
        >
          {isLoadingAvatar ? (
            <div className="w-full h-full bg-gray-200 rounded-full animate-pulse flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <>
              {avatarMedia.type === 'video' ? (
                // DISPLAY VIDEO FROM IMAGE COLUMN - autoplay in header
                <video
                  key={`header-avatar-${userAvatar?.id || 'default'}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-full"
                  crossOrigin="anonymous"
                  onError={(e) => {

                    e.target.style.display = 'none';
                    // Create fallback image element to try the same URL as image
                    const fallbackImg = document.createElement('img');
                    fallbackImg.src = avatarMedia.src;
                    fallbackImg.className = 'w-full h-full object-cover rounded-full';
                    fallbackImg.alt = 'Avatar';
                    fallbackImg.onError = () => {
                      // If image also fails, use default
                      fallbackImg.src = defaultAvatarSrc;
                    };
                    e.target.parentNode.appendChild(fallbackImg);
                  }}
                  onLoadStart={() => console.log('Header: Video avatar loading:', userAvatar?.name)}
                  onCanPlay={() => console.log('Header: Video avatar playing:', userAvatar?.name)}
                  onLoadedData={() => console.log('Header: Video data loaded successfully')}
                >
                  <source src={avatarMedia.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={avatarMedia.src}
                  alt={isEquippedAvatar ? userAvatar.name : "Default Avatar"}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    console.log('Header: Avatar image failed to load, using default');
                    e.target.src = defaultAvatarSrc;
                  }}
                />
              )}
            </>
          )}
        </div>
        
        {/* Online/Offline indicator - only show if no equipped avatar */}
        {!isEquippedAvatar && (
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`} />
        )}
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
    console.log('Rating submitted:', rating, comment);
    // Proceed with logout after rating
    if (onLogout) {
      onLogout();
    }
    await signOut();
  };

  // Handle rating skip
  const handleRatingSkip = async () => {
    console.log('Rating skipped');
    // Proceed with logout after skip
    if (onLogout) {
      onLogout();
    }
    await signOut();
  };

  // Listen for points updates from localStorage and refresh from database
  useEffect(() => {
    const handlePointsUpdate = async (e) => {
      if (e.key === 'pointsUpdated' && user?.id) {
        console.log('Header: Points updated, refreshing from database...');
        
        // Refresh profile from database to get latest points
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && profileData) {
            console.log('Header: Fresh profile data:', profileData);
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
      console.log('Header: Custom points update event:', e.detail);
      
      if (user?.id) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && profileData) {
            console.log('Header: Updated profile from custom event:', profileData);
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
  }, [user?.id, onProfileUpdate]);

  return (
    <>
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50 w-full">
        <div className="w-full px-8 sm:px-12 lg:px-16 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Conditionally render avatar - hide on dashboard page */}
              {!isDashboardPage && <AvatarDisplay />}
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg">
                    {getDisplayName()}
                  </h2>
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                    {currentProfileData.level_description || 'Pemula'}
                  </span>
                  {/* Admin badge */}
                  {currentProfileData.is_admin && (
                    <span className="text-xs bg-yellow-500/90 text-white px-2 py-1 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {/* Level Badge */}
                  <span className="flex items-center gap-1 bg-indigo-800/50 px-2 py-1 rounded-full text-xs">
                    <span>Level {currentProfileData.level || 1}</span>
                  </span>
                  
                  {/* Streak Counter */}
                  <div className="bg-white rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
                    <span className="text-lg font-bold text-black">{currentProfileData.streak || 0}</span>
                    <IconCalendar size={16} className="text-purple-600" />
                  </div>
                  
                  {/* XP Counter */}
                  <div className="bg-white rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
                    <span className="text-lg font-bold text-black">{currentProfileData.xp || 0}</span>
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <IconTrophy size={12} className="text-white" />
                    </div>
                  </div>
                  
                  {/* Points Counter */}
                  <div className="bg-white rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
                    <span className="text-lg font-bold text-black">{formatNumber(currentProfileData.points || 0)}</span>
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <IconAward size={12} className="text-white" />
                    </div>
                  </div>
                  
                  {/* Energy Counter */}
                  <div className="bg-white rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
                    <span className="text-lg font-bold text-black">{currentProfileData.energy || 0}</span>
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <IconBattery1 size={12} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Refresh button for manual sync */}
              <button 
                onClick={refreshProfileData}
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 group"
                title="Refresh Data"
              >
                <svg 
                  className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
{/* Notification bell */}
<button 
  onClick={() => router.push('/dashboard/DashboardAnnouncement')} 
  className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer"
  title="Lihat Pengumuman"
>
  <IconBell size={20} className="text-white" />
  <span className="absolute top-1 right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
  <span className="absolute top-1 right-1 w-3 h-3 bg-red-400 rounded-full"></span>
</button>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-white hover:text-gray-200 transition-colors duration-300"
              >
                <IconLogout size={16} />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          </div>
          
          {/* Connection status indicator */}
          {!isOnline && (
            <div className="mt-2 text-center">
              <span className="inline-flex items-center gap-2 text-xs bg-red-500/20 text-red-100 px-3 py-1 rounded-full">
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
