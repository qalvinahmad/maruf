import { IconStar, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRewardConfig, getRatingRewardConfig, submitRatingWithReward } from '../../lib/ratingRewardConfig';
import { supabase } from '../../lib/supabaseClient';

const RatingDialog = ({ isOpen, onClose, onSkip, onSubmit }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardConfig, setRewardConfig] = useState(getDefaultRewardConfig());

  // Load reward configuration from database
  useEffect(() => {
    const loadRewardConfig = async () => {
      if (isOpen) {
        const config = await getRatingRewardConfig();
        setRewardConfig(config);
      }
    };
    
    loadRewardConfig();
  }, [isOpen]);

  const getRewardPoints = (ratingValue) => {
    return rewardConfig[ratingValue]?.points || 0;
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Silakan pilih rating terlebih dahulu');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const rewardPoints = getRewardPoints(rating);

      // Use utility function for better handling
      const result = await submitRatingWithReward({
        user_id: user.id,
        rating: rating,
        comment: comment.trim() || null,
        reward_points: rewardPoints
      });

      if (result.success) {
        alert(`Terima kasih atas rating Anda! Anda mendapat ${rewardPoints} poin reward.`);
        
        // Mark as rated in localStorage
        localStorage.setItem(`user_rated_${user.id}`, 'true');
        
        if (onSubmit) onSubmit(rating, comment, rewardPoints);
        handleClose();
        return;
      }

      // Fallback if utility function fails
      const { data, error } = await supabase
        .from('rating')
        .insert([
          {
            user_id: user.id,
            rating: rating,
            comment: comment.trim() || null,
            reward_points: rewardPoints
          }
        ]);

      if (error) {
        // Emergency fallback - save to localStorage
        const ratingData = {
          id: Date.now(),
          user_id: user.id,
          rating: rating,
          comment: comment.trim() || null,
          reward_points: rewardPoints,
          created_at: new Date().toISOString(),
          status: 'pending_local'
        };
        
        localStorage.setItem(`rating_${Date.now()}`, JSON.stringify(ratingData));
        alert('Rating tersimpan lokal. Akan dikirim saat koneksi database tersedia.');
      } else {
        // Award points to user
        await supabase.rpc('increment_user_points', {
          user_id_param: user.id,
          points_to_add: rewardPoints
        });
          
        alert(`Terima kasih atas rating Anda! Anda mendapat ${rewardPoints} poin reward.`);
      }

      // Mark as rated in localStorage
      localStorage.setItem(`user_rated_${user.id}`, 'true');
      
      if (onSubmit) onSubmit(rating, comment, rewardPoints);
      handleClose();

    } catch (error) {
      alert('Terjadi kesalahan saat mengirim rating. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  const handleSkip = () => {
    // Mark as skipped with timestamp
    localStorage.setItem(`user_rating_skipped_${user.id}`, Date.now().toString());
    if (onSkip) onSkip();
    handleClose();
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Sangat Buruk';
      case 2: return 'Buruk';
      case 3: return 'Cukup';
      case 4: return 'Baik';
      case 5: return 'Sangat Baik';
      default: return 'Pilih Rating';
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-blue-500';
      case 5: return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full transform translate-x-16 -translate-y-16 opacity-60"></div>
            
            {/* Close button */}
            <motion.button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconX size={16} className="text-gray-600" />
            </motion.button>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <IconStar size={32} className="text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Berikan Rating</h3>
                <p className="text-gray-600">Bagaimana pengalaman Anda menggunakan aplikasi ini?</p>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <div className="flex justify-center items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="relative p-1"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconStar
                        size={40}
                        className={`transition-all duration-200 ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400 fill-current drop-shadow-lg'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                      
                      {/* Sparkle effect for filled stars */}
                      {star <= (hoveredRating || rating) && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.8, 0.4, 0.8]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: star * 0.1
                          }}
                        >
                          <IconStar size={40} className="text-yellow-200" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
                
                {/* Rating text */}
                <div className="text-center">
                  <span className={`font-semibold text-lg ${getRatingColor(hoveredRating || rating)}`}>
                    {getRatingText(hoveredRating || rating)}
                  </span>
                  {(hoveredRating || rating) > 0 && (
                    <motion.div 
                      className="mt-2 text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 inline-block"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      🎁 Reward: <span className="font-semibold text-yellow-600">
                        {getRewardPoints(hoveredRating || rating)} poin
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Comment input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar (Opsional)
                </label>
                <motion.textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Berikan komentar atau saran untuk perbaikan aplikasi..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none transition-all duration-200"
                  whileFocus={{ scale: 1.02 }}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {comment.length}/500
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleSkip}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  Lewati
                </motion.button>
                
                <motion.button
                  onClick={handleSubmitRating}
                  disabled={rating === 0 || isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                  whileHover={{ scale: rating > 0 && !isSubmitting ? 1.02 : 1 }}
                  whileTap={{ scale: rating > 0 && !isSubmitting ? 0.98 : 1 }}
                >
                  {isSubmitting ? (
                    <motion.div 
                      className="flex items-center justify-center gap-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </motion.div>
                  ) : (
                    'Kirim Rating'
                  )}
                </motion.button>
              </div>

              {/* Skip info */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Rating membantu kami meningkatkan kualitas aplikasi
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RatingDialog;
