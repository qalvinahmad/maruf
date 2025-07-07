import { IconClock, IconFlame, IconGift, IconMinus, IconStar, IconTarget, IconTrophy, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const DailyChallenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [hasNewChallenge, setHasNewChallenge] = useState(false);

  // For testing - create a mock challenge if no data exists
  const createMockChallenge = () => {
    return {
      id: 'mock-challenge-today',
      title: 'Baca 5 Halaman Al-Qur\'an',
      description: 'Luangkan waktu untuk membaca minimal 5 halaman Al-Qur\'an hari ini dengan penuh tadabbur.',
      points: 50,
      type: 'reading',
      difficulty: 'easy',
      requirements: {
        pages_read: 5,
        time_limit: '24 hours'
      },
      completion_criteria: {
        min_pages: 5
      },
      rewards: {
        xp: 25,
        points: 50
      },
      is_active: true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  };

  // Fetch today's active challenge
  useEffect(() => {
    const fetchDailyChallenge = async () => {
      try {
        setLoading(true);
        setDebugInfo('Fetching daily challenge...');
        console.log('DailyChallenge: Fetching daily challenge...');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        console.log('DailyChallenge: Date range:', {
          today: today.toISOString(),
          tomorrow: tomorrow.toISOString()
        });

        const { data: challengeData, error } = await supabase
          .from('daily_challenges')
          .select('*')
          .eq('is_active', true)
          .gte('start_date', today.toISOString())
          .lt('start_date', tomorrow.toISOString())
          .single();

        console.log('DailyChallenge: Query result:', { challengeData, error });

        if (error && error.code !== 'PGRST116') {
          console.error('DailyChallenge: Error fetching challenge:', error);
          setDebugInfo(`Error: ${error.message}`);
          setError(error.message);
          
          // Use mock challenge for testing
          console.log('DailyChallenge: Using mock challenge for testing');
          setChallenge(createMockChallenge());
          setDebugInfo('Using mock challenge (no data in database)');
          return;
        }

        if (challengeData) {
          console.log('DailyChallenge: Challenge fetched:', challengeData);
          setChallenge(challengeData);
          setDebugInfo('Challenge loaded from database');
          
          // Check if user has hidden this challenge today
          const hiddenKey = `daily_challenge_hidden_${challengeData.id}`;
          const isHidden = localStorage.getItem(hiddenKey) === 'true';
          setIsVisible(!isHidden);
          console.log('DailyChallenge: Is visible:', !isHidden);
        } else {
          console.log('DailyChallenge: No active challenge found, using mock');
          setDebugInfo('No active challenge found, using mock');
          // Use mock challenge when no data exists
          setChallenge(createMockChallenge());
        }
      } catch (err) {
        console.error('DailyChallenge: Unexpected error:', err);
        setError('Failed to load daily challenge');
        setDebugInfo(`Unexpected error: ${err.message}`);
        
        // Use mock challenge as fallback
        setChallenge(createMockChallenge());
      } finally {
        setLoading(false);
      }
    };

    fetchDailyChallenge();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!challenge) return;

    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const timeDiff = endOfDay.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [challenge]);

  // Enhanced difficulty styling with better contrast
  const getDifficultyStyle = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md';
      case 'medium': return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md';
      case 'hard': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md';
    }
  };

  // Enhanced type icon with better visual hierarchy
  const getTypeIcon = (type, size = 20) => {
    const iconProps = { size, className: "drop-shadow-sm" };
    switch (type?.toLowerCase()) {
      case 'reading': return <IconTarget {...iconProps} className="text-purple-100" />;
      case 'practice': return <IconFlame {...iconProps} className="text-orange-200" />;
      case 'learning': return <IconStar {...iconProps} className="text-yellow-200" />;
      default: return <IconTrophy {...iconProps} className="text-blue-200" />;
    }
  };

  // Enhanced challenge type styling
  const getChallengeGradient = (type) => {
    switch (type?.toLowerCase()) {
      case 'reading': return 'from-purple-500 via-purple-600 to-indigo-600';
      case 'practice': return 'from-orange-500 via-red-500 to-pink-600';
      case 'learning': return 'from-blue-500 via-indigo-600 to-purple-600';
      default: return 'from-purple-500 via-pink-500 to-rose-500';
    }
  };

  // Hide challenge
  const hideChallenge = () => {
    if (challenge) {
      const hiddenKey = `daily_challenge_hidden_${challenge.id}`;
      localStorage.setItem(hiddenKey, 'true');
      setIsVisible(false);
      console.log('DailyChallenge: Challenge hidden');
    }
  };

  // Toggle minimize/maximize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    console.log('DailyChallenge: Toggle minimize:', !isMinimized);
  };

  // Always show during development/testing - comment out the early returns
  console.log('DailyChallenge: Render state:', {
    loading,
    error,
    challenge: !!challenge,
    isVisible,
    debugInfo
  });

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 right-4 z-50"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 max-w-sm">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200"></div>
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent absolute top-0"></div>
            </div>
            <div>
              <div className="text-slate-700 font-semibold text-sm">Memuat tantangan...</div>
              <div className="text-xs text-slate-500 mt-1">Menyiapkan tantangan harian Anda</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Enhanced error state
  if (error && !challenge) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 right-4 z-50"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 max-w-sm">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <IconX className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 text-sm">Gagal Memuat</h3>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Enhanced no challenge state
  if (!challenge) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 right-4 z-50"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 max-w-sm">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <IconClock className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 text-sm">Belum Ada Tantangan</h3>
              <p className="text-amber-700 text-xs mt-1">Tantangan baru akan tersedia segera</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Don't render if hidden (comment out for testing)
  // if (!isVisible) return null;

  // Enhanced minimized view with vertical layout
  if (isMinimized) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-24 right-4 z-50"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br ${getChallengeGradient(challenge.type)} rounded-2xl shadow-xl text-white overflow-hidden cursor-pointer backdrop-blur-sm w-48`}
            onClick={toggleMinimize}
          >
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  animate={{
                    y: [-10, -60],
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  style={{
                    left: `${30 + i * 20}%`,
                    top: '100%',
                  }}
                />
              ))}
            </div>

            <div className="relative px-4 py-4">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                  {getTypeIcon(challenge.type, 16)}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    hideChallenge();
                  }}
                  className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <IconX size={12} />
                </motion.button>
              </div>

              {/* Title and Points */}
              <div className="text-center space-y-2">
                <div>
                  <div className="font-bold text-sm">Tantangan Harian</div>
                  <div className="text-white/90 text-xs">{challenge.points} poin</div>
                </div>
                
                {/* Countdown */}
                <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                  <div className="text-xs text-white/70 font-medium mb-1">Berakhir dalam</div>
                  <div className="flex items-center justify-center gap-1 text-white font-mono text-sm">
                    <IconClock size={12} />
                    <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
              animate={{ x: ['0%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed bottom-24 right-4 z-50 w-96"
      >
        {/* Enhanced Challenge Card */}
        <div className={`bg-gradient-to-br ${getChallengeGradient(challenge.type)} rounded-2xl shadow-2xl text-white overflow-hidden border border-white/20 backdrop-blur-sm`}>
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                animate={{
                  y: [-20, -100],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
                style={{
                  left: `${10 + i * 20}%`,
                  top: '100%',
                }}
              />
            ))}
          </div>

          {/* Debug Info - Hidden in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-black/30 px-4 py-2 text-xs backdrop-blur-sm border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-mono">{debugInfo}</span>
              </div>
            </div>
          )}
          
          {/* Enhanced Header */}
          <div className="relative px-6 py-4 bg-white/10 backdrop-blur-md border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg ring-2 ring-white/30">
                  {getTypeIcon(challenge.type, 20)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">🎯 Tantangan Harian</h3>
                  <p className="text-white/80 text-sm">Selesaikan untuk mendapat reward!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMinimize}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
                  title="Minimize"
                >
                  <IconMinus size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={hideChallenge}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
                  title="Close"
                >
                  <IconX size={16} />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="relative px-6 py-5 space-y-5">
            {/* Title & Difficulty */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-xl leading-tight flex-1 pr-3">{challenge.title}</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getDifficultyStyle(challenge.difficulty)}`}>
                  {challenge.difficulty || 'Normal'}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                {challenge.description}
              </p>
            </div>

            {/* Enhanced Rewards Section */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-sm flex items-center gap-2">
                  <IconGift size={16} />
                  Reward yang bisa didapat
                </h5>
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <IconClock size={14} />
                  <span className="font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                    <span className="text-amber-900 font-bold text-xl">🏆</span>
                  </div>
                  <div className="text-xs text-white/70 font-medium">Poin</div>
                  <div className="font-bold text-lg">{challenge.points}</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                    <span className="text-blue-900 font-bold text-xl">⭐</span>
                  </div>
                  <div className="text-xs text-white/70 font-medium">XP</div>
                  <div className="font-bold text-lg">{challenge.rewards?.xp || 25}</div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Button */}
            <motion.button
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white text-slate-900 font-bold py-4 px-6 rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg flex items-center justify-center gap-3 group"
            >
              <span className="text-lg">🚀 Mulai Tantangan</span>
              <motion.div
                className="group-hover:translate-x-1 transition-transform"
              >
                →
              </motion.div>
            </motion.button>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full"></div>
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyChallenge;