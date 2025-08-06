import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiAward, FiBatteryCharging, FiMic, FiUser, FiVideo } from 'react-icons/fi';

// Memory cache untuk Avatar component
class AvatarCache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  set(key, data, ttl = 300000) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);

    this.timeouts.set(key, timeout);
  }

  get(key, maxAge = 300000) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > maxAge) {
      this.cache.delete(key);
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
        this.timeouts.delete(key);
      }
      return null;
    }

    return cached.data;
  }

  clear(prefix = '') {
    if (prefix) {
      for (const [key] of this.cache) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
          if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
            this.timeouts.delete(key);
          }
        }
      }
    } else {
      this.cache.clear();
      for (const timeout of this.timeouts.values()) {
        clearTimeout(timeout);
      }
      this.timeouts.clear();
    }
  }
}

const avatarCache = new AvatarCache();

export default function Avatar({ 
  imageUrl = "/api/placeholder/150/150", 
  alt = "Profile picture",
  badge = "active", // Changed default from "default" to "active"
  badgeData = null, // New prop for badge data from inventory
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
  
  // Helper function for fallback icons
  const getFallbackIcon = (badgeType) => {
    const iconMap = {
      'streaming': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M4 4h16v16H4z"/></svg>',
      'recording': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><circle cx="12" cy="12" r="8"/></svg>',
      'award': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M5 12l5 5L20 7"/></svg>',
      'active': '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2l2 7h7l-5.5 4L17 20l-5-4-5 4 1.5-7L3 9h7z"/></svg>'
    };
    return iconMap[badgeType] || iconMap['active'];
  };
  
  useEffect(() => {
    if (!userId) return;
    
    // Try cache first
    const cacheKey = `avatar_data_${userId}`;
    const cachedData = avatarCache.get(cacheKey);
    if (cachedData) {
      setAvatarData(cachedData);
      return;
    }
    
    // Load avatar data from localStorage for now
    // You can implement Supabase integration later
    const storedAvatarData = localStorage.getItem(`avatar_${userId}`);
    if (storedAvatarData) {
      const parsedData = JSON.parse(storedAvatarData);
      setAvatarData(parsedData);
      // Cache for 10 minutes
      avatarCache.set(cacheKey, parsedData, 600000);
    }
  }, [userId]);

  // Badge content based on type
  const getBadgeContent = () => {
    // If we have badge data with an image, use it instead of icons
    if (badgeData?.image) {
      // Use CSS custom property for badge background color, fallback to badge data color
      const customBgColor = getComputedStyle(document.documentElement).getPropertyValue('--badge-bg-color').trim();
      const badgeColorClass = {
        red: "bg-red-500",
        green: "bg-green-500", 
        blue: "bg-blue-500",
        yellow: "bg-yellow-500",
        purple: "bg-purple-500",
        gray: "bg-gray-400",
        default: "bg-transparent"
      }[badgeData?.badge_color] || "bg-transparent";
      
      return (
        <motion.div
          variants={badgeVariants}
          animate={badgeData?.badge_type || "default"}
          className={`${sizeMap[size].badge} rounded-full flex items-center justify-center overflow-hidden relative`}
          style={{ 
            backgroundColor: customBgColor || (badgeColorClass === "bg-transparent" ? "transparent" : undefined),
            border: (badgeColorClass === "bg-transparent" && !customBgColor) ? "none" : undefined
          }}
        >
          <img 
            src={badgeData.image}
            alt={badgeData.name || "Badge"}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback to thumbnail if image fails
              if (badgeData.thumbnail && e.target.src !== badgeData.thumbnail) {
                e.target.src = badgeData.thumbnail;
              } else {
                // Final fallback to icon
                e.target.style.display = 'none';
                const fallbackIcon = document.createElement('div');
                fallbackIcon.innerHTML = getFallbackIcon(badgeData?.badge_type || badge);
                fallbackIcon.className = 'w-full h-full flex items-center justify-center text-white';
                e.target.parentNode.appendChild(fallbackIcon);
              }
            }}
          />
        </motion.div>
      );
    }

    // Fallback to icon-based badges if no image data
    // Use CSS custom property for badge background color
    const customBgColor = getComputedStyle(document.documentElement).getPropertyValue('--badge-bg-color').trim();
    const badgeColorClass = {
      red: "bg-red-500",
      green: "bg-green-500",
      blue: "bg-blue-500", 
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      gray: "bg-gray-400",
      default: "bg-gray-400"
    }[badgeData?.badge_color || avatarData?.badge_color] || "bg-green-500";

    // Use the badge prop directly, or badgeData.badge_type if available
    const badgeType = badgeData?.badge_type || badge;

    const badgeStyle = {
      backgroundColor: customBgColor || undefined
    };

    switch (badgeType) {
      case 'streaming':
        return (
          <motion.div
            variants={badgeVariants}
            animate="streaming"
            className={`${sizeMap[size].badge} ${!customBgColor ? badgeColorClass : ''} rounded-full flex items-center justify-center text-white`}
            style={badgeStyle}
          >
            <FiVideo />
          </motion.div>
        );
      case 'recording':
        return (
          <motion.div
            variants={badgeVariants}
            animate="recording"
            className={`${sizeMap[size].badge} ${!customBgColor ? badgeColorClass : ''} rounded-full flex items-center justify-center text-white`}
            style={badgeStyle}
          >
            <FiMic />
          </motion.div>
        );
      case 'award':
        return (
          <motion.div
            variants={badgeVariants}
            animate="award"
            className={`${sizeMap[size].badge} ${!customBgColor ? badgeColorClass : ''} rounded-full flex items-center justify-center text-white`}
            style={badgeStyle}
          >
            <FiAward />
          </motion.div>
        );
      case 'active':
        return (
          <div
            className={`${sizeMap[size].badge} ${!customBgColor ? 'bg-green-500' : ''} rounded-full flex items-center justify-center text-white`}
            style={badgeStyle}
          >
            <FiBatteryCharging />
          </div>
        );
      default:
        return (
          <div
            className={`${sizeMap[size].badge} ${!customBgColor ? 'bg-green-500' : ''} rounded-full flex items-center justify-center text-white`}
            style={badgeStyle}
          >
            <FiBatteryCharging />
          </div>
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
            // Check if imageUrl is a video
            imageUrl.includes('.mp4') || imageUrl.includes('video') || imageUrl.includes('/profile/avatar/') ? (
              <video
                key={`avatar-${userId || 'default'}`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.style.display = 'none';
                  // Create fallback image element
                  const fallbackImg = document.createElement('img');
                  fallbackImg.src = imageUrl;
                  fallbackImg.className = 'w-full h-full object-cover';
                  fallbackImg.alt = alt;
                  fallbackImg.onError = () => {
                    // Final fallback to default
                    fallbackImg.src = "/img/avatar_default.png";
                  };
                  e.target.parentNode.appendChild(fallbackImg);
                }}
              >
                <source src={imageUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                src={imageUrl} 
                alt={alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/img/avatar_default.png";
                }}
              />
            )
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
