import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';

const PreLoader = ({ setLoading }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [setLoading]);

  const preloaderVariants = {
    initial: {
      y: "0"
    },
    exit: {
      y: "-100%",
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  const textVariants = {
    hidden: {
      y: 50,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
        delayChildren: 0.3
      }
    }
  };

  const logoVariants = {
    hidden: { 
      scale: 0,
      opacity: 0,
      rotate: -180
    },
    visible: { 
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    }
  };

  const characterVariants = {
    hidden: { 
      scale: 0,
      opacity: 0,
      y: 50
    },
    visible: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 120
      }
    }
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: { 
      width: "100%",
      transition: {
        duration: 2.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 w-full h-screen bg-blue-600 text-white z-[9999] flex flex-col justify-center items-center overflow-hidden"
      variants={preloaderVariants}
      initial="initial"
      exit="exit"
    >
      {/* Characters Section */}
      <motion.div
        className="flex items-center justify-center gap-8 mb-8"
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2, staggerChildren: 0.3 }}
      >
        {/* Male Character */}
        <motion.div
          variants={characterVariants}
          className="relative"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 relative">
            <Image
              src="/male.png"
              alt="Anak Laki-laki"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div
          className="mx-4"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-2xl relative">
            <Image
              src="/logo.png"
              alt="Al-Makruf Logo"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Female Character */}
        <motion.div
          variants={characterVariants}
          className="relative"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 relative">
            <Image
              src="/female.png"
              alt="Anak Perempuan"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Text Container */}
      <motion.div 
        className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 flex-wrap h-auto w-auto text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span 
          className="text-2xl md:text-3xl lg:text-4xl font-extrabold min-w-max relative"
          variants={textVariants}
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}
        >
          Belajar
        </motion.span>
        <motion.span 
          className="text-2xl md:text-3xl lg:text-4xl font-extrabold min-w-max relative"
          variants={textVariants}
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}
        >
          Makhrojul
        </motion.span>
        <motion.span 
          className="text-2xl md:text-3xl lg:text-4xl font-extrabold min-w-max relative"
          variants={textVariants}
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}
        >
          Huruf
        </motion.span>
<motion.span 
          className="inline-block px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-2xl md:text-3xl lg:text-4xl font-extrabold bg-white text-purple-600 rounded-xl shadow-lg"
          variants={textVariants}
        >
          Menyenangkan
        </motion.span>
      </motion.div>

      {/* Subtitle
      <motion.div
        className="mt-6 text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <p className="text-lg md:text-xl text-blue-100 font-medium">
          Platform Pembelajaran Al-Qur'an Terbaik
        </p>
      </motion.div> */}

      {/* Progress Bar
      <motion.div
        className="mt-8 w-64 md:w-80 h-2 bg-white/20 rounded-full overflow-hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-full"
          variants={progressVariants}
          initial="hidden"
          animate="visible"
        />
      </motion.div> */}

      {/* Loading Text */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
      </motion.div>
    </motion.div>
  );
};

export default PreLoader;
