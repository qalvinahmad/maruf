import { IconAward, IconChevronUp, IconFlame, IconInfoCircle, IconMedal, IconStar, IconTrophy } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all_time');
  const [isExpanded, setIsExpanded] = useState(false);

  // ...existing code...

  // Get current user ID
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        console.log('Leaderboard: Fetching data...');
        
        // Get leaderboard data - users with level >= 3 (Menengah)
        const { data: leaderboard, error: leaderboardError } = await supabase
          .from('profiles')
          .select('id, full_name, level, xp, points, streak, level_description, created_at')
          .gte('level', 3) // Minimal level 3 untuk masuk leaderboard
          .order('xp', { ascending: false })
          .limit(5); // Top 5 users only

        if (leaderboardError) {
          console.error('Leaderboard: Error fetching data:', leaderboardError);
          setError(leaderboardError.message);
          return;
        }

        console.log('Leaderboard: Data fetched:', leaderboard);
        
        // Process leaderboard data with ranking
        const processedData = leaderboard?.map((user, index) => ({
          ...user,
          rank: index + 1,
          badge: getBadgeFromLevel(user.level),
          displayName: user.full_name || 'User'
        })) || [];

        setLeaderboardData(processedData);

        // Find current user ranking
        if (currentUserId) {
          const userIndex = processedData.findIndex(user => user.id === currentUserId);
          if (userIndex !== -1) {
            setUserRanking(processedData[userIndex]);
          } else {
            // User not in leaderboard, get their data separately
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id, full_name, level, xp, points, streak, level_description')
              .eq('id', currentUserId)
              .single();

            if (!userError && userData) {
              // Calculate user rank among all eligible users
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

  // Get rank icon with enhanced visual hierarchy
  const getRankIcon = (rank) => {
    if (rank === 1) return <IconTrophy className="text-amber-500 drop-shadow-sm" size={24} />;
    if (rank === 2) return <IconMedal className="text-slate-500 drop-shadow-sm" size={22} />;
    if (rank === 3) return <IconMedal className="text-orange-500 drop-shadow-sm" size={22} />;
    return <IconAward className="text-blue-500" size={18} />;
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

  // Enhanced rank circle with better visual hierarchy
  const getRankCircleStyle = (index, isCurrentUser) => {
    if (isCurrentUser) return 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg ring-4 ring-blue-200';
    if (index === 0) return 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-xl ring-4 ring-amber-200';
    if (index === 1) return 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg ring-4 ring-slate-200';
    if (index === 2) return 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg ring-4 ring-orange-200';
    return 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md';
  };

  // Enhanced card background with subtle gradients
  const getCardBackground = (index, isCurrentUser) => {
    if (isCurrentUser) return 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-200 shadow-md ring-1 ring-blue-100';
    if (index === 0) return 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-amber-200 shadow-lg ring-1 ring-amber-100';
    if (index === 1) return 'bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-slate-200 shadow-md ring-1 ring-slate-100';
    if (index === 2) return 'bg-gradient-to-r from-orange-50 via-orange-50 to-orange-50 border-orange-200 shadow-md ring-1 ring-orange-100';
    return 'bg-white border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all duration-200';
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Requirements Banner - Improved UX Writing */}
      {userRanking && !isUserEligible && (
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
                Tingkatkan level Anda ke <span className="font-semibold">Level 3 (Menengah)</span> untuk bergabung dengan para juara di papan peringkat.
              </p>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700">Progress Anda:</span>
                  <span className="font-semibold text-amber-900">Level {userRanking.level} • {userRanking.xp} XP</span>
                </div>
                <div className="mt-2 bg-amber-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((userRanking.xp / (3 * 1000)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Leaderboard Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header with better typography hierarchy */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">🏆 Papan Peringkat</h2>
              <p className="text-slate-600 text-sm font-medium">Top 5 pembelajar terdepan • Minimal Level 3</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                LIVE
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="p-6">
          <AnimatePresence>
            <div className="space-y-4">
              {/* Top Leaderboard with enhanced design */}
              {leaderboardData.map((user, index) => {
                const isCurrentUser = user.id === currentUserId;
                const isTopThree = index < 3;
                
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
                    className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${getCardBackground(index, isCurrentUser)}`}
                  >
                    {/* Rank indicator strip */}
                    {isTopThree && (
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                        index === 0 ? 'bg-gradient-to-b from-amber-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-b from-slate-400 to-slate-500' :
                        'bg-gradient-to-b from-orange-400 to-orange-500'
                      }`}></div>
                    )}
                    
                    {/* Floating particles for top 3 */}
                    {isTopThree && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`absolute w-1 h-1 rounded-full ${
                              index === 0 ? 'bg-amber-400' :
                              index === 1 ? 'bg-slate-400' :
                              'bg-orange-400'
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
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getRankCircleStyle(index, isCurrentUser)}`}>
                          {user.rank}
                        </div>
                        {isTopThree && (
                          <div className="absolute -top-1 -right-1">
                            {index === 0 && <IconTrophy className="text-amber-500 drop-shadow-lg" size={20} />}
                            {index === 1 && <IconMedal className="text-slate-500 drop-shadow-lg" size={18} />}
                            {index === 2 && <IconMedal className="text-orange-500 drop-shadow-lg" size={18} />}
                          </div>
                        )}
                      </div>
                      
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
                            <IconTrophy size={16} className="text-amber-500" />
                            <span className="font-medium">{user.xp.toLocaleString()} XP</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <IconFlame size={16} className="text-orange-500" />
                            <span className="font-medium">{user.streak} hari</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Points Display */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900 mb-1">
                          {user.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                          Poin
                        </div>
                      </div>

                      {/* Achievement Icon */}
                      <div className="w-10 flex justify-center">
                        <div className="group-hover:scale-110 transition-transform duration-200">
                          {getRankIcon(user.rank)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Enhanced Empty State */}
              {leaderboardData.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 space-y-4"
                >
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <IconTrophy size={48} className="text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-600 mb-2">Belum Ada Juara</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Jadilah yang pertama masuk ke papan peringkat! Tingkatkan level Anda dan raih posisi teratas.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </AnimatePresence>

          {/* Enhanced User Ranking Section */}
          {userRanking && isUserEligible && userRanking.rank > 5 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-slate-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <IconChevronUp className="text-blue-500" size={20} />
                <h3 className="text-lg font-bold text-slate-900">Posisi Anda</h3>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-blue-200 shadow-sm">
                <div className="flex items-center gap-6">
                  {/* Rank Circle */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-blue-200">
                    #{userRanking.rank}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-slate-900">{userRanking.displayName}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyle(userRanking.badge)}`}>
                        {userRanking.badge}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 font-medium">Level</div>
                        <div className="text-slate-900 font-bold">{userRanking.level}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">XP</div>
                        <div className="text-slate-900 font-bold">{userRanking.xp.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Streak</div>
                        <div className="text-slate-900 font-bold">{userRanking.streak} hari</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Points */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      {userRanking.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      Poin
                    </div>
                  </div>
                </div>
                
                {/* Progress indicator to top 5 */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700 font-medium">Jarak ke Top 5:</span>
                    <span className="text-blue-900 font-bold">{userRanking.rank - 5} posisi lagi</span>
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