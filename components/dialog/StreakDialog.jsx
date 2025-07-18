import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';

export const StreakDialog = ({ isOpen, setIsOpen, streakCount = 0, isStreakBroken = false, onStreakUpdate }) => {
  const [confetti, setConfetti] = useState([]);
  const [currentCount, setCurrentCount] = useState(0);
  const [flames, setFlames] = useState([]);
  const [showCountAnimation, setShowCountAnimation] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState(null);
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

      const response = await fetch('/api/update-streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Gagal memperbarui streak`);
      }

      if (result.success) {
        // Jika sudah login hari ini, tutup dialog
        if (result.alreadyLoggedInToday) {
          setCurrentCount(result.data.streak);
          setTimeout(() => {
            setIsOpen(false);
          }, 1500);
          return;
        }

        // Update local storage
        localStorage.setItem(`lastStreak_${userId}`, result.data.streak.toString());
        localStorage.setItem(`lastLogin_${userId}`, new Date().toISOString());

        // Update parent component
        if (onStreakUpdate) {
          onStreakUpdate(result.data.streak, result.data.lastLoginDate);
        }

        setCurrentCount(result.data.streak);
        setUpdated(true);

        // Close dialog after delay
        setTimeout(() => {
          setIsOpen(false);
          setUpdated(false);
          setError(null);
        }, 2000);
      } else {
        throw new Error(result.error || 'Response tidak valid dari server');
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
    const timer = setTimeout(() => {
      updateStreakInSupabase();
    }, 800);
    return () => clearTimeout(timer);
  }
}, [isOpen]);


  const getStreakMessage = (count, broken, isUpdated, hasError) => {
    if (hasError) {
      return {
        title: "Terjadi Kesalahan",
        description: "Gagal memperbarui streak. Coba lagi nanti.",
        icon: "⚠️",
        bgColor: "bg-orange-100",
        textColor: "text-orange-600"
      };
    }

    if (isUpdated) {
      return {
        title: broken ? "Streak Direset!" : "Streak Diperbarui!",
        description: broken 
          ? "Streak Anda telah direset. Mulai lagi hari ini!" 
          : `Streak Anda bertambah! Anda juga mendapat +1 energi bonus`,
        icon: broken ? "💔" : "🔥",
        bgColor: broken ? "bg-red-100" : "bg-yellow-100",
        textColor: broken ? "text-red-600" : "text-yellow-600"
      };
    }

    if (broken) {
      return {
        title: "Streak Terputus!",
        description: "Anda tidak login kemarin. Mulai streak baru hari ini dan dapatkan +1 energi!",
        icon: "💔",
        bgColor: "bg-red-100",
        textColor: "text-red-600"
      };
    }

    if (count === 1) {
      return {
        title: "Streak Dimulai!",
        description: "Hari pertama streak Anda. Anda mendapat +1 energi bonus. Pertahankan konsistensi!",
        icon: "🔥",
        bgColor: "bg-yellow-100", 
        textColor: "text-yellow-600"
      };
    }

    return {
      title: "Selamat! Streak Bertambah",
      description: `Hari ke-${count} Anda belajar konsisten. Bonus +1 energi diberikan. Pertahankan!`,
      icon: "🔥",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600"
    };
  };

  const messageData = getStreakMessage(streakCount, isStreakBroken, updated, !!error);

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
            className="bg-white rounded-2xl w-full max-w-md shadow-xl relative overflow-hidden"
          >
            {/* Close button - hanya tampil jika tidak sedang updating */}
            {!updating && !updated && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 z-10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`w-20 h-20 mx-auto mb-4 ${messageData.bgColor} rounded-full flex items-center justify-center`}
              >
                <span className="text-3xl">{messageData.icon}</span>
              </motion.div>

              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`text-xl font-bold mb-2 ${messageData.textColor}`}
              >
                {messageData.title}
              </motion.h3>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mb-6"
              >
                {messageData.description}
              </motion.p>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`${isStreakBroken ? 'bg-red-50' : 'bg-yellow-50'} rounded-xl p-4 mb-6`}
              >
                <div className="flex justify-center items-center gap-2">
                  <span className="text-xl">{isStreakBroken ? "💔" : "🔥"}</span>
                  <motion.span 
                    className={`text-2xl font-bold ${isStreakBroken ? 'text-red-600' : 'text-yellow-600'}`}
                    animate={showCountAnimation ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    {isStreakBroken ? 0 : currentCount}
                  </motion.span>
                  <span className="text-sm text-gray-500 ml-1">hari</span>
                </div>
                {!isStreakBroken && streakCount > 1 && !updated && !error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-xs text-gray-400 mt-1"
                  >
                    +1 hari dari kemarin
                  </motion.p>
                )}
                {updating && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-gray-400 mt-1"
                  >
                    Memperbarui streak...
                  </motion.p>
                )}
              </motion.div>

              {/* Action buttons */}
              <div className="space-y-2">
                {error && !updated && (
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={handleRetry}
                    disabled={updating}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      updating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {updating ? 'Mencoba lagi...' : 'COBA LAGI'}
                  </motion.button>
                )}

                {!updated && (
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: error ? 0.5 : 0.4 }}
                    onClick={handleClose}
                    disabled={updating}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                      error
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        : updating
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isStreakBroken 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {error 
                      ? 'TUTUP'
                      : updating 
                        ? 'Memperbarui...' 
                        : isStreakBroken 
                          ? 'MULAI LAGI' 
                          : 'LANJUTKAN'
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