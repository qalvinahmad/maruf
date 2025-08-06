import { IconCalendar, IconCheck, IconFlame, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import BlurText from '../ui/blur-text';

const StreakDialogHuruf = ({ isOpen, onClose, profileData, onStreakUpdate }) => {
  const [currentStreak, setCurrentStreak] = useState(profileData?.streak || 0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && profileData?.streak > 0) {
      // Start animation after dialog opens
      setTimeout(() => {
        setIsAnimating(true);
      }, 500);
    }
  }, [isOpen, profileData?.streak]);

  const handleClose = () => {
    // Mark dialog as shown for today
    const today = new Date().toDateString();
    localStorage.setItem('streakDialogShown', today);
    localStorage.setItem('streakDialogShownTimestamp', new Date().getTime().toString());
    onClose();
  };

  if (!isOpen || !profileData || profileData.streak <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden font-['Poppins']"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <IconX size={20} />
            </button>
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center"
              >
                <IconFlame size={36} className="text-orange-300" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold mb-2 font-['Poppins']"
              >
                🔥 Streak Belajar!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white/90 text-sm font-['Poppins']"
              >
                Konsistensi pembelajaran Anda luar biasa!
              </motion.p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Streak Display */}
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <IconCalendar size={24} className="text-orange-600" />
                  <span className="text-sm text-gray-600 font-medium font-['Poppins']">
                    Hari berturut-turut
                  </span>
                </div>
                
                {/* Animated Streak Counter */}
                <div className="relative">
                  {isAnimating ? (
                    <BlurText
                      text={`${currentStreak} hari`}
                      delay={0}
                      className="text-4xl font-bold text-orange-600 font-['Poppins']"
                      animateBy="words"
                      direction="bottom"
                      stepDuration={0.5}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="text-4xl font-bold text-orange-600 font-['Poppins']"
                    >
                      {currentStreak} hari
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700 font-['Poppins']">
                  Progress Mingguan
                </span>
                <span className="text-sm text-gray-500 font-['Poppins']">
                  {Math.min(currentStreak, 7)}/7 hari
                </span>
              </div>
              
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + (i * 0.1), duration: 0.3 }}
                    className={`flex-1 h-4 rounded-lg transition-all duration-300 ${
                      i < Math.min(currentStreak, 7)
                        ? 'bg-gradient-to-t from-orange-500 to-red-500 shadow-sm'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Motivational Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100"
            >
              <p className="text-sm text-blue-800 text-center font-['Poppins']">
                {currentStreak === 1 
                  ? "🎉 Selamat! Anda memulai streak belajar pertama!"
                  : currentStreak < 7
                  ? `💪 Terus pertahankan! ${7 - currentStreak} hari lagi untuk mencapai streak mingguan!`
                  : currentStreak < 30
                  ? "🚀 Luar biasa! Konsistensi Anda sangat menginspirasi!"
                  : "🏆 Master konsistensi! Anda adalah teladan dalam pembelajaran!"
                }
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg font-['Poppins']"
            >
              <div className="flex items-center justify-center gap-2">
                <IconCheck size={20} />
                <span>Lanjutkan Belajar</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StreakDialogHuruf;
