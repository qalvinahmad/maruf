import { IconBattery1, IconFlame, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const DailyEnergyDialog = ({ 
  isOpen, 
  setIsOpen, 
  currentEnergy = 0,
  addedEnergy = 2,
  onClaim
}) => {
  const { user } = useAuth();
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    if (claimed || loading) return;
    
    try {
      setLoading(true);
      
      // Simulate claim process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClaimed(true);
      
      // Call parent's onClaim callback
      if (onClaim) {
        onClaim(currentEnergy + addedEnergy);
      }
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error claiming daily energy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl cursor-default relative overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IconX size={20} />
            </button>

            {/* Content */}
            <div className="text-center pt-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center"
              >
                <IconBattery1 size={32} className="text-yellow-600" />
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold mb-2 text-gray-800"
              >
                {claimed ? 'Energi Berhasil Diklaim!' : 'Energi Harian Tersedia!'}
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-6"
              >
                {claimed 
                  ? 'Anda telah menerima energi harian. Semangat belajar!' 
                  : 'Klaim energi harian Anda untuk melanjutkan pembelajaran!'
                }
              </motion.p>

              {/* Energy Display */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-3">
                  <IconFlame size={24} className="text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Energi Anda</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {currentEnergy}
                      {claimed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-green-600 ml-2"
                        >
                          +{addedEnergy}
                        </motion.span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={claimed ? handleClose : handleClaim}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                  claimed
                    ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700'
                    : loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {claimed 
                  ? 'Tutup' 
                  : loading 
                    ? 'Mengklaim...' 
                    : `Klaim +${addedEnergy} Energi`
                }
              </motion.button>
            </div>

            {/* Success Animation */}
            {claimed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      y: [0, -30],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyEnergyDialog;
