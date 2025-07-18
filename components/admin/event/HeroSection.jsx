import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        background: [
          "linear-gradient(135deg, #00acee 0%, #38bdf8 50%, #87ceeb 100%)",
          "linear-gradient(135deg, #0891b2 0%, #00acee 50%, #bae6fd 100%)", 
          "linear-gradient(135deg, #00acee 0%, #38bdf8 50%, #87ceeb 100%)"
        ]
      }}
      transition={{ 
        delay: 0.5, 
        duration: 0.8,
        background: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      className="relative min-h-[320px] text-white p-8 rounded-3xl overflow-hidden mb-8"
      style={{
        background: "linear-gradient(135deg, #00acee 0%, #38bdf8 50%, #87ceeb 100%)"
      }}
    >
      {/* Dynamic decorative elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-12 -right-12 w-40 h-40 bg-white rounded-full"
      ></motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 0.8, 1],
          x: [0, 20, 0],
          y: [0, -10, 0],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-1/4 translate-y-1/4"
      ></motion.div>
      
      {/* Additional floating elements */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          x: [0, 15, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/4 left-1/4 w-20 h-20 bg-white rounded-full"
      ></motion.div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent drop-shadow-lg"
          >
            Manajemen Event
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/95 max-w-md text-lg leading-relaxed drop-shadow-sm"
          >
            Kelola event pembelajaran, pengumuman sistem, dan tantangan harian untuk menciptakan pengalaman belajar yang engaging dan terorganisir
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
