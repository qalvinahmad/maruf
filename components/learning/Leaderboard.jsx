import { IconAward, IconChevronUp, IconFlame, IconInfoCircle, IconMedal, IconStar, IconTrophy } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [streakLeaderboardData, setStreakLeaderboardData] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
  const [streakUserRanking, setStreakUserRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all_time');
  const [activeTab, setActiveTab] = useState('xp'); // 'xp' or 'streak'
  const [isExpanded, setIsExpanded] = useState(false);
  const [userAvatars, setUserAvatars] = useState({}); // Store avatars for each user

  // ...existing code...

  // Get current user ID
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, []);

  // Fetch user avatar (similar to Header.jsx)
  const fetchUserAvatar = async (userId) => {
    try {
      console.log('Leaderboard: Fetching equipped avatar for user:', userId);
      
      // METHOD 1: Try avatars table first (direct avatar data)
      try {
        const { data: avatarData, error: avatarError } = await supabase
          .from('avatars')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!avatarError && avatarData && avatarData.avatar) {
          console.log('Leaderboard: Found avatar in avatars table:', avatarData);
          return {
            id: avatarData.id,
            name: avatarData.avatar.name || 'Custom Avatar',
            image: avatarData.avatar.image || avatarData.avatar.url,
            video: avatarData.avatar.video,
            type: avatarData.avatar.type || 'image',
            isEquipped: true
          };
        }
      } catch (avatarError) {
        console.log('Leaderboard: Avatars table query failed:', avatarError);
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
          const data = await response.json();
          console.log('Leaderboard: API response:', data);
          
          if (data.success && data.equippedItems && data.equippedItems.length > 0) {
            const equippedAvatar = data.equippedItems.find(item => item.item_type === 'avatar');
            if (equippedAvatar && equippedAvatar.shop_item) {
              console.log('Leaderboard: Found equipped avatar via API:', equippedAvatar);
              return {
                id: equippedAvatar.shop_item.id,
                name: equippedAvatar.shop_item.name,
                image: equippedAvatar.shop_item.image,
                video: equippedAvatar.shop_item.video,
                type: equippedAvatar.shop_item.type || 'image',
                isEquipped: true
              };
            }
          }
        }
      } catch (apiError) {
        console.log('Leaderboard: API approach failed:', apiError);
      }

      // METHOD 3: Direct Supabase query for user_inventory
      try {
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('user_inventory')
          .select(`
            *,
            shop_item:shop_items(*)
          `)
          .eq('user_id', userId)
          .eq('item_type', 'avatar')
          .eq('is_equipped', true)
          .single();

        if (!inventoryError && inventoryData && inventoryData.shop_item) {
          console.log('Leaderboard: Found equipped avatar via direct query:', inventoryData);
          return {
            id: inventoryData.shop_item.id,
            name: inventoryData.shop_item.name,
            image: inventoryData.shop_item.image,
            video: inventoryData.shop_item.video,
            type: inventoryData.shop_item.type || 'image',
            isEquipped: true
          };
        }
      } catch (directError) {
        console.log('Leaderboard: Direct query failed:', directError);
      }

      // No avatar found
      console.log('Leaderboard: No avatar found for user:', userId);
      return null;
      
    } catch (error) {
      console.error('Leaderboard: Error fetching user avatar:', error);
      return null;
    }
  };

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        console.log('Leaderboard: Fetching data...');
        
        // Get XP leaderboard data - users with level >= 3 (Menengah)
        const { data: leaderboard, error: leaderboardError } = await supabase
          .from('profiles')
          .select('id, full_name, level, xp, points, streak, level_description, created_at')
          .gte('level', 3) // Minimal level 3 untuk masuk leaderboard XP
          .order('xp', { ascending: false })
          .limit(5); // Top 5 users only

        if (leaderboardError) {
          console.error('Leaderboard: Error fetching XP data:', leaderboardError);
          setError(leaderboardError.message);
          return;
        }

        // Get Streak leaderboard data - users with level >= 2 (Dasar-Menengah)
        const { data: streakLeaderboard, error: streakLeaderboardError } = await supabase
          .from('profiles')
          .select('id, full_name, level, xp, points, streak, level_description, created_at')
          .gte('level', 2) // Minimal level 2 untuk masuk leaderboard streak
          .order('streak', { ascending: false })
          .limit(5); // Top 5 most consistent users

        if (streakLeaderboardError) {
          console.error('Leaderboard: Error fetching Streak data:', streakLeaderboardError);
          setError(streakLeaderboardError.message);
          return;
        }

        console.log('Leaderboard: XP Data fetched:', leaderboard);
        console.log('Leaderboard: Streak Data fetched:', streakLeaderboard);
        
        // Process XP leaderboard data with ranking
        const processedData = leaderboard?.map((user, index) => ({
          ...user,
          rank: index + 1,
          badge: getBadgeFromLevel(user.level),
          displayName: user.full_name || 'User'
        })) || [];

        // Process Streak leaderboard data with ranking
        const processedStreakData = streakLeaderboard?.map((user, index) => ({
          ...user,
          rank: index + 1,
          badge: getBadgeFromLevel(user.level),
          displayName: user.full_name || 'User'
        })) || [];

        setLeaderboardData(processedData);
        setStreakLeaderboardData(processedStreakData);

        // Fetch avatars for all users in both leaderboards
        const allUserIds = new Set([
          ...processedData.map(user => user.id),
          ...processedStreakData.map(user => user.id)
        ]);

        // Also add current user ID if they have ranking but not in top 5
        if (currentUserId) {
          allUserIds.add(currentUserId);
        }

        const avatarPromises = Array.from(allUserIds).map(async userId => {
          const avatar = await fetchUserAvatar(userId);
          return { userId, avatar };
        });

        const avatarResults = await Promise.all(avatarPromises);
        const avatarsMap = {};
        avatarResults.forEach(({ userId, avatar }) => {
          if (avatar) {
            avatarsMap[userId] = avatar;
          }
        });
        setUserAvatars(avatarsMap);

        // Find current user ranking for XP leaderboard
        if (currentUserId) {
          const userIndex = processedData.findIndex(user => user.id === currentUserId);
          if (userIndex !== -1) {
            setUserRanking(processedData[userIndex]);
          } else {
            // User not in XP leaderboard, get their data separately
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id, full_name, level, xp, points, streak, level_description')
              .eq('id', currentUserId)
              .single();

            if (!userError && userData) {
              // Calculate user rank among all eligible users for XP
              const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('level', 3)
                .gt('xp', userData.xp);

              setUserRanking({
                ...userData,
                rank: (count || 0) + 1,
                badge: getBadgeFromLevel(userData.level),
                displayName: userData.full_name || 'User',
                isEligible: userData.level >= 3
              });
            }
          }

          // Find current user ranking for Streak leaderboard
          const streakUserIndex = processedStreakData.findIndex(user => user.id === currentUserId);
          if (streakUserIndex !== -1) {
            setStreakUserRanking(processedStreakData[streakUserIndex]);
          } else {
            // User not in streak leaderboard, get their data separately
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id, full_name, level, xp, points, streak, level_description')
              .eq('id', currentUserId)
              .single();

            if (!userError && userData) {
              // Calculate user rank among all eligible users for Streak
              const { count: streakCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('level', 2)
                .gt('streak', userData.streak);

              setStreakUserRanking({
                ...userData,
                rank: (streakCount || 0) + 1,
                badge: getBadgeFromLevel(userData.level),
                displayName: userData.full_name || 'User',
                isEligible: userData.level >= 2
              });
            }
          }
        }

      } catch (err) {
        console.error('Leaderboard: Unexpected error:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchLeaderboard();
    }
  }, [currentUserId, timeFilter]);

  // Get badge based on level
  const getBadgeFromLevel = (level) => {
    if (level >= 10) return 'Master';
    if (level >= 7) return 'Expert';
    if (level >= 5) return 'Advanced';
    if (level >= 3) return 'Intermediate';
    return 'Beginner';
  };

  // Get badge color
  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Master': return 'bg-purple-100 text-purple-800';
      case 'Expert': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get rank icon with enhanced visual hierarchy for both XP and Streak
  const getRankIcon = (rank, isStreakBoard = false) => {
    if (rank === 1) {
      return isStreakBoard ? 
        <IconFlame className="text-orange-500 drop-shadow-sm" size={24} /> :
        <IconTrophy className="text-amber-500 drop-shadow-sm" size={24} />;
    }
    if (rank === 2) {
      return isStreakBoard ?
        <IconFlame className="text-red-500 drop-shadow-sm" size={22} /> :
        <IconMedal className="text-slate-500 drop-shadow-sm" size={22} />;
    }
    if (rank === 3) {
      return isStreakBoard ?
        <IconFlame className="text-amber-500 drop-shadow-sm" size={22} /> :
        <IconMedal className="text-orange-500 drop-shadow-sm" size={22} />;
    }
    return isStreakBoard ? 
      <IconFlame className="text-blue-500" size={18} /> :
      <IconAward className="text-blue-500" size={18} />;
  };

  // Enhanced badge styling with better contrast
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'Master': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg';
      case 'Expert': return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg';
      case 'Advanced': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md';
      case 'Intermediate': return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md';
      default: return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-sm';
    }
  };

  // Enhanced rank circle with better visual hierarchy for both boards
  const getRankCircleStyle = (index, isCurrentUser, isStreakBoard = false) => {
    if (isCurrentUser) return 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg ring-4 ring-blue-200';
    
    if (isStreakBoard) {
      if (index === 0) return 'bg-gradient-to-br from-orange-400 to-red-500 shadow-xl ring-4 ring-orange-200';
      if (index === 1) return 'bg-gradient-to-br from-red-400 to-red-500 shadow-lg ring-4 ring-red-200';
      if (index === 2) return 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg ring-4 ring-amber-200';
      return 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-md';
    } else {
      if (index === 0) return 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-xl ring-4 ring-amber-200';
      if (index === 1) return 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg ring-4 ring-slate-200';
      if (index === 2) return 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg ring-4 ring-orange-200';
      return 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md';
    }
  };

  // Enhanced card background with subtle gradients for both boards
  const getCardBackground = (index, isCurrentUser, isStreakBoard = false) => {
    if (isCurrentUser) return 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-200 shadow-md ring-1 ring-blue-100';
    
    if (isStreakBoard) {
      if (index === 0) return 'bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 border-orange-200 shadow-lg ring-1 ring-orange-100';
      if (index === 1) return 'bg-gradient-to-r from-red-50 via-red-50 to-red-50 border-red-200 shadow-md ring-1 ring-red-100';
      if (index === 2) return 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200 shadow-md ring-1 ring-amber-100';
      return 'bg-white border-orange-200 hover:bg-orange-50 hover:shadow-md transition-all duration-200';
    } else {
      if (index === 0) return 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-amber-200 shadow-lg ring-1 ring-amber-100';
      if (index === 1) return 'bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-slate-200 shadow-md ring-1 ring-slate-100';
      if (index === 2) return 'bg-gradient-to-r from-orange-50 via-orange-50 to-orange-50 border-orange-200 shadow-md ring-1 ring-orange-100';
      return 'bg-white border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200';
    }
  };

  // Avatar component similar to Header.jsx - supports both image and video avatars
  const AvatarDisplay = ({ userId, size = 'w-12 h-12', className = '' }) => {
    const defaultAvatarSrc = '/img/avatar_default.png';
    const userAvatar = userAvatars[userId];
    
    // Get avatar source - prioritize video from image column for equipped avatars (same as Header.jsx)
    const getAvatarMedia = () => {
      if (userAvatar) {
        // Check if we have a video source (prioritize video from image column)
        if (userAvatar.image && (userAvatar.image.endsWith('.mp4') || userAvatar.image.includes('video'))) {
          return {
            src: userAvatar.image,
            type: 'video'
          };
        }
        // Check video field
        if (userAvatar.video) {
          return {
            src: userAvatar.video,
            type: 'video'
          };
        }
        // Use image
        if (userAvatar.image) {
          return {
            src: userAvatar.image,
            type: 'image'
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
      <div className={`relative ${className}`}>
        <div 
          className={`${size} rounded-full flex items-center justify-center transition-transform hover:scale-105 overflow-hidden ${
            isEquippedAvatar ? 'ring-2 ring-indigo-300 ring-offset-1' : ''
          }`}
          style={{
            border: isEquippedAvatar ? '2px solid #6366f1' : '2px solid #e5e7eb',
            background: 'transparent'
          }}
        >
          {avatarMedia.type === 'video' ? (
            // Display video from image column (same as Header.jsx implementation)
            <video
              key={`leaderboard-avatar-${userId}-${userAvatar?.id || 'default'}`}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-full"
              crossOrigin="anonymous"
              onError={(e) => {
                console.log('Leaderboard: Video avatar failed, trying as image');
                e.target.style.display = 'none';
                // Create fallback image element to try the same URL as image
                const fallbackImg = document.createElement('img');
                fallbackImg.src = avatarMedia.src;
                fallbackImg.className = 'w-full h-full object-cover rounded-full';
                fallbackImg.alt = 'Avatar';
                fallbackImg.onError = () => {
                  fallbackImg.src = defaultAvatarSrc;
                };
                e.target.parentNode.appendChild(fallbackImg);
              }}
              onLoadStart={() => console.log('Leaderboard: Video avatar loading:', userAvatar?.name)}
              onCanPlay={() => console.log('Leaderboard: Video avatar playing:', userAvatar?.name)}
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
                console.log('Leaderboard: Avatar image failed to load, using default');
                e.target.src = defaultAvatarSrc;
              }}
            />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
      >
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
          </div>
          <div className="text-slate-600 font-medium">Memuat papan peringkat...</div>
          <div className="text-sm text-slate-400">Mengumpulkan data terbaru</div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-red-200 p-8"
      >
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <IconInfoCircle className="text-red-600" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const isUserEligible = userRanking?.level >= 3;
  const isUserEligibleForStreak = streakUserRanking?.level >= 2;

  // Get current data and user ranking based on active tab
  const currentData = activeTab === 'xp' ? leaderboardData : streakLeaderboardData;
  const currentUserRanking = activeTab === 'xp' ? userRanking : streakUserRanking;
  const currentMinLevel = activeTab === 'xp' ? 3 : 2;
  const currentTitle = activeTab === 'xp' ? 'Papan Peringkat' : 'Papan Konsistensi';
  const currentSubtitle = activeTab === 'xp' ? 'Top 5 pembelajar terdepan • Minimal Level 3' : 'Top 5 paling konsisten • Minimal Level 2';
  const currentMetric = activeTab === 'xp' ? 'XP' : 'Streak';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Requirements Banner - Updated for both tabs */}
      {currentUserRanking && ((activeTab === 'xp' && !isUserEligible) || (activeTab === 'streak' && !isUserEligibleForStreak)) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200 rounded-2xl p-6"
        >
          <div className="absolute inset-0 bg-amber-100 opacity-20"></div>
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex-shrink-0 flex items-center justify-center text-white shadow-lg">
              <IconStar size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">🎯 Hampir Masuk Peringkat!</h3>
              <p className="text-amber-800 mb-3 leading-relaxed">
                Tingkatkan level Anda ke <span className="font-semibold">Level {currentMinLevel} {activeTab === 'xp' ? '(Menengah)' : '(Dasar-Menengah)'}</span> untuk bergabung dengan para {activeTab === 'xp' ? 'juara' : 'pembelajar konsisten'} di papan peringkat.
              </p>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700">Progress Anda:</span>
                  <span className="font-semibold text-amber-900">Level {currentUserRanking.level} • {activeTab === 'xp' ? `${currentUserRanking.xp} XP` : `${currentUserRanking.streak} hari streak`}</span>
                </div>
                <div className="mt-2 bg-amber-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((currentUserRanking.level / currentMinLevel) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Leaderboard Section with Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header with tabs */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {activeTab === 'xp' ? '🏆' : '🔥'} {currentTitle}
              </h2>
              <p className="text-slate-600 text-sm font-medium">{currentSubtitle}</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                LIVE
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('xp')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'xp'
                  ? 'bg-blue-100 text-blue-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <IconTrophy size={16} />
              Tinggi XP
            </button>
            <button
              onClick={() => setActiveTab('streak')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'streak'
                  ? 'bg-orange-100 text-orange-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <IconFlame size={16} />
              Konsisten
            </button>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Current Tab Leaderboard */}
              {currentData.map((user, index) => {
                const isCurrentUser = user.id === currentUserId;
                const isTopThree = index < 3;
                const isStreakBoard = activeTab === 'streak';
                
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${getCardBackground(index, isCurrentUser, isStreakBoard)}`}
                  >
                    {/* Rank indicator strip */}
                    {isTopThree && (
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                        isStreakBoard ? (
                          index === 0 ? 'bg-gradient-to-b from-orange-400 to-red-500' :
                          index === 1 ? 'bg-gradient-to-b from-red-400 to-red-500' :
                          'bg-gradient-to-b from-amber-400 to-orange-500'
                        ) : (
                          index === 0 ? 'bg-gradient-to-b from-amber-400 to-yellow-500' :
                          index === 1 ? 'bg-gradient-to-b from-slate-400 to-slate-500' :
                          'bg-gradient-to-b from-orange-400 to-orange-500'
                        )
                      }`}></div>
                    )}
                    
                    {/* Floating particles for top 3 */}
                    {isTopThree && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`absolute w-1 h-1 rounded-full ${
                              isStreakBoard ? (
                                index === 0 ? 'bg-orange-400' :
                                index === 1 ? 'bg-red-400' :
                                'bg-amber-400'
                              ) : (
                                index === 0 ? 'bg-amber-400' :
                                index === 1 ? 'bg-slate-400' :
                                'bg-orange-400'
                              )
                            }`}
                            animate={{
                              y: [-20, -120],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: i * 0.5,
                            }}
                            style={{
                              left: `${20 + i * 30}%`,
                              top: '100%',
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-6 p-6">
                      {/* Enhanced Rank Circle */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getRankCircleStyle(index, isCurrentUser, isStreakBoard)}`}>
                          {user.rank}
                        </div>
                        {isTopThree && (
                          <div className="absolute -top-1 -right-1">
                            {getRankIcon(user.rank, isStreakBoard)}
                          </div>
                        )}
                      </div>

                      {/* User Avatar */}
                      <AvatarDisplay 
                        userId={user.id} 
                        size="w-14 h-14" 
                        className="flex-shrink-0"
                      />
                      
                      {/* Enhanced User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {user.displayName}
                          </h3>
                          {isCurrentUser && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md"
                            >
                              ANDA
                            </motion.span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyle(user.badge)}`}>
                            {user.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <IconAward size={16} className="text-blue-500" />
                            <span className="font-medium">Level {user.level}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isStreakBoard ? (
                              <>
                                <IconFlame size={16} className="text-orange-500" />
                                <span className="font-medium">{user.streak} hari berturut</span>
                              </>
                            ) : (
                              <>
                                <IconTrophy size={16} className="text-amber-500" />
                                <span className="font-medium">{user.xp.toLocaleString()} XP</span>
                              </>
                            )}
                          </div>
                          {!isStreakBoard && (
                            <div className="flex items-center gap-2">
                              <IconFlame size={16} className="text-orange-500" />
                              <span className="font-medium">{user.streak} hari</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced Metric Display */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900 mb-1">
                          {isStreakBoard ? user.streak : user.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                          {isStreakBoard ? 'Hari' : 'Poin'}
                        </div>
                      </div>

                      {/* Achievement Icon */}
                      <div className="w-10 flex justify-center">
                        <div className="group-hover:scale-110 transition-transform duration-200">
                          {getRankIcon(user.rank, isStreakBoard)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Enhanced Empty State */}
              {currentData.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 space-y-4"
                >
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    {activeTab === 'xp' ? (
                      <IconTrophy size={48} className="text-slate-400" />
                    ) : (
                      <IconFlame size={48} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-600 mb-2">
                      {activeTab === 'xp' ? 'Belum Ada Juara' : 'Belum Ada Pembelajar Konsisten'}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      {activeTab === 'xp' 
                        ? 'Jadilah yang pertama masuk ke papan peringkat! Tingkatkan level Anda dan raih posisi teratas.'
                        : 'Jadilah yang pertama masuk ke papan konsistensi! Belajar setiap hari dan bangun streak yang panjang.'
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Enhanced User Ranking Section for current tab */}
          {currentUserRanking && ((activeTab === 'xp' && isUserEligible) || (activeTab === 'streak' && isUserEligibleForStreak)) && currentUserRanking.rank > 5 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-slate-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <IconChevronUp className={activeTab === 'xp' ? 'text-blue-500' : 'text-orange-500'} size={20} />
                <h3 className="text-lg font-bold text-slate-900">Posisi Anda</h3>
              </div>
              
              <div className={`${activeTab === 'xp' ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-200' : 'bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 border-orange-200'} rounded-2xl p-6 border-2 shadow-sm`}>
                <div className="flex items-center gap-6">
                  {/* Rank Circle */}
                  <div className={`w-16 h-16 rounded-full ${activeTab === 'xp' ? 'bg-gradient-to-br from-blue-500 to-blue-600 ring-blue-200' : 'bg-gradient-to-br from-orange-500 to-red-600 ring-orange-200'} flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4`}>
                    #{currentUserRanking.rank}
                  </div>

                  {/* User Avatar */}
                  <AvatarDisplay 
                    userId={currentUserRanking.id} 
                    size="w-14 h-14" 
                    className="flex-shrink-0"
                  />
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-slate-900">{currentUserRanking.displayName}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyle(currentUserRanking.badge)}`}>
                        {currentUserRanking.badge}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 font-medium">Level</div>
                        <div className="text-slate-900 font-bold">{currentUserRanking.level}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">{activeTab === 'xp' ? 'XP' : 'Streak'}</div>
                        <div className="text-slate-900 font-bold">
                          {activeTab === 'xp' ? currentUserRanking.xp.toLocaleString() : `${currentUserRanking.streak} hari`}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">{activeTab === 'xp' ? 'Streak' : 'XP'}</div>
                        <div className="text-slate-900 font-bold">
                          {activeTab === 'xp' ? `${currentUserRanking.streak} hari` : currentUserRanking.xp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Primary Metric */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      {activeTab === 'xp' ? currentUserRanking.points.toLocaleString() : currentUserRanking.streak}
                    </div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      {activeTab === 'xp' ? 'Poin' : 'Hari'}
                    </div>
                  </div>
                </div>
                
                {/* Progress indicator to top 5 */}
                <div className={`mt-4 pt-4 border-t ${activeTab === 'xp' ? 'border-blue-200' : 'border-orange-200'}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${activeTab === 'xp' ? 'text-blue-700' : 'text-orange-700'} font-medium`}>Jarak ke Top 5:</span>
                    <span className={`${activeTab === 'xp' ? 'text-blue-900' : 'text-orange-900'} font-bold`}>{currentUserRanking.rank - 5} posisi lagi</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;