import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiAward, FiBatteryCharging, FiMic, FiUser, FiVideo } from 'react-icons/fi';

export default function Avatar({ 
  imageUrl = "/api/placeholder/150/150", 
  alt = "Profile picture",
  badge = "active", // Changed default from "default" to "active"
  borderColor = "gray",
  size = "lg",
  userId 
}) {
  // Size mapping
  const sizeMap = {
    sm: {
      avatar: "w-12 h-12",
      border: "w-14 h-14",
      badge: "w-6 h-6 text-sm"
    },
    md: {
      avatar: "w-16 h-16",
      border: "w-20 h-20", 
      badge: "w-8 h-8 text-base"
    },
    lg: {
      avatar: "w-24 h-24",
      border: "w-28 h-28",
      badge: "w-10 h-10 text-lg"
    }
  };

  // Border color variants
  const borderColors = {
    gray: "from-gray-200 to-gray-300",
    primary: "from-blue-400 to-blue-600",
    secondary: "from-secondary to-blue-700",
    blue: "from-blue-400 to-blue-600",
    green: "from-green-400 to-green-600",
    red: "from-red-400 to-red-600",
    yellow: "from-yellow-400 to-yellow-600",
    purple: "from-purple-400 to-purple-600"
  };

  // Badge animations
  const badgeVariants = {
    streaming: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    recording: {
      backgroundColor: ["#ef4444", "#dc2626"],
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    award: {
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    default: {
      scale: 1
    }
  };

  const [avatarData, setAvatarData] = useState(null);
  
  useEffect(() => {
    // Load avatar data from localStorage for now
    // You can implement Supabase integration later
    const storedAvatarData = localStorage.getItem(`avatar_${userId}`);
    if (storedAvatarData) {
      setAvatarData(JSON.parse(storedAvatarData));
    }
  }, [userId]);

  // Badge content based on type
  const getBadgeContent = () => {
    const badgeColorClass = {
      red: "bg-red-500",
      green: "bg-green-500",
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      gray: "bg-gray-400",
      default: "bg-gray-400"
    }[avatarData?.badge_color] || "bg-green-500"; // Default to green for active badge

    // Use the badge prop directly instead of avatarData?.badge_type
    switch (badge) {
      case 'streaming':
        return (
          <motion.div
            variants={badgeVariants}
            animate="streaming"
            className={`${sizeMap[size].badge} ${badgeColorClass} rounded-full flex items-center justify-center text-white`}
          >
            <FiVideo />
          </motion.div>
        );
      case 'recording':
        return (
          <motion.div
            variants={badgeVariants}
            animate="recording"
            className={`${sizeMap[size].badge} ${badgeColorClass} rounded-full flex items-center justify-center text-white`}
          >
            <FiMic />
          </motion.div>
        );
      case 'award':
        return (
          <motion.div
            variants={badgeVariants}
            animate="award"
            className={`${sizeMap[size].badge} ${badgeColorClass} rounded-full flex items-center justify-center text-white`}
          >
            <FiAward />
          </motion.div>
        );
      case 'active':
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`${sizeMap[size].badge} bg-green-500 rounded-full flex items-center justify-center text-white`}
          >
            <FiBatteryCharging />
          </motion.div>
        );
      default:
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`${sizeMap[size].badge} bg-green-500 rounded-full flex items-center justify-center text-white`}
          >
            <FiBatteryCharging />
          </motion.div>
        );
    }
  };

  const { avatar, border } = sizeMap[size] || sizeMap.md;
  const borderColorClasses = borderColors[borderColor] || borderColors.gray;

  return (
    <div className="relative inline-block">
      {/* Circular border with gradient */}
      <div className={`${border} rounded-full bg-gradient-to-r ${borderColorClasses} flex items-center justify-center p-1`}>
        {/* Avatar content */}
        <div className={`${avatar} rounded-full overflow-hidden border-2 border-white`}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={alt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FiUser className="w-1/2 h-1/2 text-gray-400" />
            </div>
          )}
        </div>
      </div>
      
      {/* Dynamic Badge */}
      {badge !== 'none' && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 transform">
          {getBadgeContent()}
        </div>
      )}
    </div>
  );
}

// Usage example:
const AvatarExample = () => {
  return (
    <div className="flex flex-col items-center gap-12 p-8 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Avatar Component Examples</h2>
      
      <div className="flex flex-wrap gap-12 justify-center">
        <div className="flex flex-col items-center gap-2">
          <Avatar 
            userId="user-id-1"
            size="lg"
            badge="streaming"
          />
          <p className="text-sm text-gray-600">Large Avatar (Streaming)</p>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Avatar 
            userId="user-id-2"
            size="md"
            badge="recording"
          />
          <p className="text-sm text-gray-600">Medium Avatar (Recording)</p>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Avatar 
            userId="user-id-3"
            size="sm"
            badge="award"
          />
          <p className="text-sm text-gray-600">Small Avatar (Award)</p>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <Avatar 
            userId="user-id-4"
            size="md"
            badge="none"
          />
          <p className="text-sm text-gray-600">Medium Avatar (No Badge)</p>
        </div>
      </div>
    </div>
  );
};

export { AvatarExample };
