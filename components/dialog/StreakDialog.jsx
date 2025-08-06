import { AnimatePresence, motion } from "framer-motion";
import Image from 'next/image';
import { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import BlurText from '../ui/blur-text';

export const StreakDialog = ({ isOpen, setIsOpen, streakCount = 0, isStreakBroken = false, onStreakUpdate }) => {
  const [confetti, setConfetti] = useState([]);
  const [currentCount, setCurrentCount] = useState(0);
  const [flames, setFlames] = useState([]);
  const [showCountAnimation, setShowCountAnimation] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState(null);
  const [showFinalNumber, setShowFinalNumber] = useState(false);
  const { user } = useAuth();

  // Fungsi untuk memperbarui streak di Supabase
  const updateStreakInSupabase = async () => {
    try {
      setUpdating(true);
      setError(null);
      
      const userId = user?.id || localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID tidak ditemukan. Silakan login ulang.');
      }

      console.log('Updating streak for user ID:', userId);

      // Check if user already logged in today
      const today = new Date().toISOString().split('T')[0];
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('last_login, streak')
        .eq('id', userId);

      if (fetchError) {
        throw new Error(`Gagal mengambil data profil: ${fetchError.message}`);
      }

      if (!profileData || profileData.length === 0) {
        throw new Error('Profil pengguna tidak ditemukan dalam database');
      }

      const userProfile = profileData[0];

      // Check if already logged in today
      if (userProfile?.last_login) {
        const lastLoginDate = new Date(userProfile.last_login).toISOString().split('T')[0];
        if (lastLoginDate === today) {
          setCurrentCount(userProfile.streak || 0);
          setTimeout(() => {
            setIsOpen(false);
          }, 1500);
          return;
        }
      }

      // Insert login log for today (upsert to avoid duplicates)
      const { error: loginLogError } = await supabase
        .from('login_logs')
        .upsert([
          {
            user_id: userId,
            login_date: today
          }
        ], { onConflict: ['user_id', 'login_date'] });

      if (loginLogError) {
        console.warn('Warning: Failed to insert login log:', loginLogError.message);
        // Don't throw error here, continue with streak update
      }

      // Update last_login to current timestamp and increment streak manually
      console.log('Attempting to update streak from', userProfile.streak, 'to', userProfile.streak + 1);
      
      const newStreak = userProfile.streak + 1;
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          last_login: new Date(),
          streak: newStreak
        })
        .eq('id', userId)
        .select('streak, last_login');

      if (error) {
        console.error('Update error details:', error);
        throw new Error(`Gagal memperbarui last_login: ${error.message}`);
      }

      // Check if update was successful and data exists
      if (!data || data.length === 0) {
        console.log('No data returned from profiles update for user:', userId);
        throw new Error('Profil pengguna tidak ditemukan atau gagal diperbarui');
      }

      console.log('Profiles update successful, data:', data);
      // Get the first (and should be only) result
      const updatedProfile = data[0];

      if (updatedProfile) {
        console.log('Updated profile received:', updatedProfile);
        console.log('Old streak:', currentCount, 'New streak:', updatedProfile.streak);
        
        // Update local storage
        localStorage.setItem(`lastStreak_${userId}`, updatedProfile.streak.toString());
        localStorage.setItem(`lastLogin_${userId}`, updatedProfile.last_login);

        // Update parent component
        if (onStreakUpdate) {
          onStreakUpdate(updatedProfile.streak, updatedProfile.last_login);
        }

        // Update current count to the new streak value from database
        setCurrentCount(updatedProfile.streak);
        setUpdated(true);

        // Trigger final number animation to show the updated streak
        setTimeout(() => {
          setShowFinalNumber(true);
        }, 1000);

        // Close dialog after delay
        setTimeout(() => {
          setIsOpen(false);
          setUpdated(false);
          setError(null);
        }, 4000); // Increased delay to allow animation to complete
      } else {
        throw new Error('Data tidak ditemukan setelah update');
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  // Reset error when dialog opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setUpdated(false);
      setShowFinalNumber(false);
    }
  }, [isOpen]);

  // Generate confetti particles
  useEffect(() => {
    if (isOpen && !isStreakBroken) {
      const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        color: ["#FFD700", "#FFA500", "#FF4500"][Math.floor(Math.random() * 3)],
      }));
      setConfetti(particles);

      const flameParticles = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        color: ["#FF4500", "#FF6347", "#FF8C00"][Math.floor(Math.random() * 3)],
      }));
      setFlames(flameParticles);
    }
  }, [isOpen, isStreakBroken]);

  // Update useEffect to handle streak count animation
  useEffect(() => {
    if (isOpen) {
      setShowCountAnimation(true);
      if (!updated) {
        setCurrentCount(streakCount);
      }
      
      // Don't automatically trigger final number - let the database update handle it
      const timer = setTimeout(() => {
        updateStreakInSupabase();
      }, 800);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen]);


  const handleClose = () => {
    if (!updating) {
      setIsOpen(false);
      setError(null);
      setUpdated(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    updateStreakInSupabase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          {/* Confetti particles - hanya tampil jika streak tidak terputus dan tidak ada error */}
          {!isStreakBroken && !error && confetti.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: particle.color,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -30],
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Flames particles - hanya tampil jika streak tidak terputus dan tidak ada error */}
          {!isStreakBroken && !error && flames.map((flame) => (
            <motion.div
              key={flame.id}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: flame.color,
                left: `${flame.x}%`,
                top: `${flame.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -30],
              }}
              transition={{
                duration: 2,
                delay: flame.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 backdrop-blur-md rounded-2xl w-full max-w-md shadow-xl relative overflow-hidden border border-white/20"
          >
            {/* Close button - hanya tampil jika tidak sedang updating */}
            {!updating && !updated && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 backdrop-blur-sm z-10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            <div className="p-6 text-center">
              {/* Icon Animation */}
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6"
              >
                <Image
                  src="/gif/flashsale.gif"
                  alt="Streak Animation"
                  width={96}
                  height={96}
                  className="rounded-full"
                  unoptimized
                />
              </motion.div>

              {/* Streak Count dengan animasi transformasi */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 flex items-center justify-center"
              >
                {!showFinalNumber ? (
                  // Tampilan awal: "current + 1" (sebelum database update)
                  <div className="flex items-center gap-2">
                    <motion.span 
                      className={`text-5xl font-bold ${isStreakBroken ? 'text-red-600' : 'text-[#e8392e]'}`}
                      animate={showCountAnimation ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      style={{ textShadow: '0 2px 4px rgba(232, 57, 46, 0.3)' }}
                    >
                      {isStreakBroken ? 0 : streakCount}
                    </motion.span>
                    
                    {!isStreakBroken && !error && (
                      <>
                        <span className="text-5xl font-bold text-[#e8392e]" style={{ textShadow: '0 2px 4px rgba(232, 57, 46, 0.3)' }}>
                          +
                        </span>
                        <span className="text-5xl font-bold text-[#e8392e]" style={{ textShadow: '0 2px 4px rgba(232, 57, 46, 0.3)' }}>
                          1
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  // Tampilan akhir dengan BlurText: streak yang sudah diupdate dari database
                  <BlurText
                    text={isStreakBroken ? "0" : currentCount.toString()}
                    delay={100}
                    className="text-5xl font-bold text-[#e8392e]"
                    animateBy="letters"
                    direction="top"
                    animationFrom={{ 
                      filter: "blur(15px)", 
                      opacity: 0, 
                      scale: 1.2
                    }}
                    animationTo={[
                      { 
                        filter: "blur(8px)", 
                        opacity: 0.5, 
                        scale: 1.1
                      },
                      { 
                        filter: "blur(0px)", 
                        opacity: 1, 
                        scale: 1
                      }
                    ]}
                    stepDuration={0.8}
                  />
                )}
              </motion.div>

              {/* Error message - simplified */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <span className="text-sm text-[#e8392e]">Error!</span>
                </motion.div>
              )}

              {/* Action buttons - simplified */}
              <div className="space-y-3">
                {error && !updated && (
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={handleRetry}
                    disabled={updating}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      updating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#e8392e] hover:bg-[#d12a1f] text-white shadow-lg'
                    }`}
                  >
                    {updating ? '...' : 'RETRY'}
                  </motion.button>
                )}

                {!updated && (
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: error ? 0.9 : 0.8 }}
                    onClick={handleClose}
                    disabled={updating}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      error
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                        : updating
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isStreakBroken 
                            ? 'bg-[#e8392e] hover:bg-[#d12a1f] text-white shadow-lg' 
                            : 'bg-[#e8392e] hover:bg-[#d12a1f] text-white shadow-lg'
                    }`}
                  >
                    {error 
                      ? 'CLOSE'
                      : updating 
                        ? '...' 
                        : isStreakBroken 
                          ? 'START' 
                          : 'CONTINUE'
                    }
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};