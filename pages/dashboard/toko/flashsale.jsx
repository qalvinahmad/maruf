import { IconBorderAll, IconClock, IconCoin, IconPalette, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { formatNumber } from '../../../utils/formatNumber';

const RandomDiscountCard = ({ randomDiscountItem, randomItemTimeLeft, handlePurchase }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!randomDiscountItem) return null;

  // Memoize formatted time values to prevent unnecessary re-renders
  const timeDisplay = useMemo(() => ({
    hours: String(randomItemTimeLeft.hours || 0).padStart(2, '0'),
    minutes: String(randomItemTimeLeft.minutes || 0).padStart(2, '0'),
    seconds: String(randomItemTimeLeft.seconds || 0).padStart(2, '0')
  }), [randomItemTimeLeft.hours, randomItemTimeLeft.minutes, randomItemTimeLeft.seconds]);

  const getMediaSource = () => {
    // For hover state, prioritize video if available
    if (isHovered && randomDiscountItem.image && randomDiscountItem.image.endsWith('.mp4')) {
      return { src: randomDiscountItem.image, type: 'video' };
    }
    
    // For normal state, use thumbnail first, then image
    const src = randomDiscountItem.thumbnail || randomDiscountItem.image;
    if (!src) return null;
    
    return { 
      src: src, 
      type: src.endsWith('.mp4') ? 'video' : 'image' 
    };
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-3xl shadow-xl shadow-purple-500/30 border border-purple-300/50 mb-8 text-white relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"
      />
      <motion.div 
        animate={{ 
          rotate: -360,
          x: [0, 10, 0],
          y: [0, -5, 0]
        }}
        transition={{ 
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-1/4 translate-y-1/4"
      />
      
      {/* Floating Particles */}
      <motion.div
        animate={{
          y: [-10, -20, -10],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full"
      />
      <motion.div
        animate={{
          y: [-5, -15, -5],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-8 right-20 w-1 h-1 bg-white rounded-full"
      />
      <motion.div
        animate={{
          y: [-8, -18, -8],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-20 left-10 w-1.5 h-1.5 bg-pink-200 rounded-full"
      />
      
      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:w-1/3 bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.05, rotateY: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            animate={{ 
              rotate: isHovered ? 360 : 0,
              scale: isHovered ? 1.1 : 1 
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center relative overflow-hidden"
          >
            {(() => {
              const mediaSource = getMediaSource();
              
              if (!mediaSource) {
                // Fallback icon
                return (
                  <>
                    {randomDiscountItem.type === 'item' && <IconShoppingCart size={48} className="text-white" />}
                    {randomDiscountItem.type === 'border' && <IconBorderAll size={48} className="text-white" />}
                    {randomDiscountItem.type === 'avatar' && <IconUser size={48} className="text-white" />}
                    {randomDiscountItem.type === 'theme' && <IconPalette size={48} className="text-white" />}
                  </>
                );
              }

              if (mediaSource.type === 'video') {
                return (
                  <video
                    key={`flashsale-${isHovered ? 'hover' : 'static'}-video`}
                    autoPlay={isHovered}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-full"
                    onError={() => {
                      // Show fallback icon on error
                    }}
                  >
                    <source src={mediaSource.src} type="video/mp4" />
                  </video>
                );
              } else {
                return (
                  <img 
                    src={mediaSource.src}
                    alt={randomDiscountItem.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => {
                      // Handle image load error
                    }}
                  />
                );
              }
            })()}

            {/* Video indicator for flash sale */}
            {randomDiscountItem.image?.endsWith('.mp4') && !isHovered && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                🎥 Hover
              </div>
            )}

            {/* Playing indicator */}
            {randomDiscountItem.image?.endsWith('.mp4') && isHovered && (
              <div className="absolute top-2 right-2 bg-green-500/80 text-white px-2 py-1 rounded-full text-xs">
                ▶️ Playing
              </div>
            )}
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="md:w-2/3 space-y-3"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-16 h-16 flex items-center justify-center"
            >
              <img 
                src="/gif/flashsale.gif" 
                alt="Flash Sale" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            <motion.h2 
              animate={{ 
                backgroundPosition: ["0%", "100%", "0%"]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{
                background: "linear-gradient(90deg, #fff, #ffd700, #fff, #ffd700, #fff)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
              className="text-3xl md:text-4xl font-black tracking-wider"
            >
              FLASH SALE
            </motion.h2>
          </motion.div>
          
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-2xl font-bold"
          >
            {randomDiscountItem.name}
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="text-white/80"
          >
            {randomDiscountItem.description}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="flex items-center gap-4 mt-2"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg"
            >
              <p className="text-sm text-white/80">Harga Normal</p>
              <motion.p 
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg font-bold line-through"
              >
                {formatNumber(randomDiscountItem.originalPrice)} Point
              </motion.p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              animate={{ 
                boxShadow: [
                  "0 0 0 rgba(255, 255, 255, 0)",
                  "0 0 20px rgba(255, 255, 255, 0.3)",
                  "0 0 0 rgba(255, 255, 255, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg"
            >
              <p className="text-sm text-white/80">Harga Spesial</p>
              <p className="text-xl font-bold flex items-center gap-1">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <IconCoin size={16} className="text-yellow-300" />
                </motion.div>
                {formatNumber(randomDiscountItem.price)} Point
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-purple-600/70 backdrop-blur-sm px-3 py-2 rounded-lg"
            >
              <p className="text-sm text-white/80">Diskon</p>
              <motion.p 
                animate={{ 
                  color: ["#fff", "#ffd700", "#fff"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xl font-bold"
              >
                {randomDiscountItem.discountPercent}%
              </motion.p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="flex justify-between items-center mt-4"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <IconClock size={18} />
              </motion.div>
              <span>Berubah dalam: </span>
              <div className="font-mono font-bold bg-white/10 px-2 py-1 rounded">
                <span>{timeDisplay.hours}:</span>
                <span>{timeDisplay.minutes}:</span>
                <span>{timeDisplay.seconds}</span>
              </div>
            </div>
            
            <motion.button 
              onClick={() => handlePurchase(randomDiscountItem)}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                y: -2
              }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: [
                  "0 5px 15px rgba(0,0,0,0.1)",
                  "0 8px 25px rgba(0,0,0,0.15)",
                  "0 5px 15px rgba(0,0,0,0.1)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              <motion.div
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <IconShoppingCart size={18} />
              </motion.div>
              Beli Sekarang
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RandomDiscountCard;
