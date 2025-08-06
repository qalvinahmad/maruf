import { IconBorderAll, IconCoin, IconPalette, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { formatNumber } from '../../../utils/formatNumber';

// Add isServer check to prevent errors during static rendering
const isServer = typeof window === 'undefined';

const ShopItemCard = ({ 
  item = {}, // Provide default empty object
  activeTab = 'badge', 
  isItemOwned = () => false, // Default function
  handlePurchase = () => {} // Default function
}) => {
  const router = useRouter();
  
  // FIX: Always call useAuth unconditionally 
  const { user } = useAuth() || { user: null };
  
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Only run client-side checks to avoid SSR errors
  const owned = !isServer && item && item.id ? isItemOwned(item.id) : false;

  // Prevent SSR errors by skipping user-dependent code during build
  const isPremiumMembership = item && item.name === 'Premium Membership';

  // Function to handle equipment - skip execution during static rendering
  const handleEquip = async () => {
    if (isServer) return;
    
    try {
      setLoading(true);
      const userId = user?.id || localStorage.getItem('userId');
      
      if (!userId) {
        alert('User ID tidak ditemukan. Silakan login ulang.');
        router.push('/authentication/login');
        return;
      }
      
      // Find the inventory item first
      const { data: inventoryItem, error: findError } = await supabase
        .from('user_inventory')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', item.id)
        .single();
        
      if (findError || !inventoryItem) {
        console.error('Error finding item:', findError);
        throw new Error('Item tidak ditemukan di inventori Anda');
      }

      // Use API endpoint for equipping
      const response = await fetch('/api/equip-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          inventoryId: inventoryItem.id,
          itemType: item.type
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', result);
        throw new Error(result.error || 'Failed to equip item');
      }

      if (result.success) {
        alert('Item berhasil dipakai!');
        
        // Notify other components to refresh INCLUDING HEADER
        localStorage.setItem('inventoryUpdated', Date.now().toString());
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'inventoryUpdated',
          newValue: Date.now().toString()
        }));
        
        window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
          detail: { userId, timestamp: Date.now(), itemType: item.type } 
        }));
      } else {
        throw new Error(result.error || 'Failed to equip item');
      }
      
    } catch (error) {
      console.error('Error equipping item:', error);
      alert(`Gagal memakai item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Safe media source getter with null checks
  const getImageSource = () => {
    if (!item) return null;
    
    // For hover state, prioritize video if available
    if (isHovered && item.image && item.image.endsWith('.mp4')) {
      return { src: item.image, type: 'video' };
    }
    
    // For normal state, use thumbnail first, then image
    const src = item.thumbnail || item.image;
    if (!src) return null;
    
    return { 
      src: src, 
      type: src.endsWith('.mp4') ? 'video' : 'image' 
    };
  };

  // Skip rendering completely during static generation if no item
  if (isServer || !item || !item.id) {
    return null; // Return null instead of component during build
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min((item?.id || 0) * 0.02, 0.5) }}
      className={`p-4 rounded-xl shadow-sm hover:shadow-md transition-all border overflow-hidden relative ${
        isPremiumMembership 
          ? 'border-blue-300 shadow-xl hover:shadow-2xl' 
          : 'bg-white border-gray-100'
      }`}
      style={isPremiumMembership ? {
        background: 'linear-gradient(135deg, #00acee 0%, #9146FF 100%)',
      } : {}}
    >
      {/* Premium Membership cosmic background animation */}
      {isPremiumMembership && (
        <>
          {/* Revolving stars in orbital patterns - REMOVED all circular colors */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Central star system */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-full h-full bg-yellow-300 rounded-full"></div>
            </div>
            
            {/* First orbital ring - 5 stars */}
            {[...Array(5)].map((_, i) => (
              <div
                key={`orbit1-${i}`}
                className="absolute top-1/2 left-1/2 w-1 h-1 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  animation: `orbit-${1} ${8 + i * 0.5}s linear infinite`,
                  animationDelay: `${i * 1.6}s`
                }}
              >
                <div 
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: '40px',
                    top: '0px',
                    transform: 'translateY(-50%)'
                  }}
                />
              </div>
            ))}
            
            {/* Second orbital ring - 7 stars, elliptical */}
            {[...Array(7)].map((_, i) => (
              <div
                key={`orbit2-${i}`}
                className="absolute top-1/2 left-1/2 w-1 h-1 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  animation: `orbit-${2} ${12 + i * 0.3}s linear infinite`,
                  animationDelay: `${i * 1.7}s`
                }}
              >
                <div 
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{
                    left: '60px',
                    top: '0px',
                    transform: 'translateY(-50%)'
                  }}
                />
              </div>
            ))}
            
            {/* Third orbital ring - 3 larger stars, tilted orbit */}
            {[...Array(3)].map((_, i) => (
              <div
                key={`orbit3-${i}`}
                className="absolute top-1/2 left-1/2 w-1 h-1 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  animation: `orbit-${3} ${15 + i * 0.8}s linear infinite`,
                  animationDelay: `${i * 5}s`,
                  transform: 'translate(-50%, -50%) rotateX(30deg)'
                }}
              >
                <div 
                  className="absolute w-1.5 h-1.5 bg-white rounded-full"
                  style={{
                    left: '80px',
                    top: '0px',
                    transform: 'translateY(-50%)'
                  }}
                />
              </div>
            ))}
            
            {/* Outer ring - 4 distant stars */}
            {[...Array(4)].map((_, i) => (
              <div
                key={`orbit4-${i}`}
                className="absolute top-1/2 left-1/2 w-1 h-1 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  animation: `orbit-${4} ${20 + i * 1.2}s linear infinite`,
                  animationDelay: `${i * 7.5}s`
                }}
              >
                <div 
                  className="absolute w-0.5 h-0.5 bg-white rounded-full"
                  style={{
                    left: '100px',
                    top: '0px',
                    transform: 'translateY(-50%)'
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Floating cosmic dust particles */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={`dust-${i}`}
                className="absolute w-1 h-1 bg-white/10 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${15 + i * 12}%`,
                  animation: `float ${4 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Premium badge */}
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
            <span>👑</span>
            <span>PREMIUM</span>
          </div>
        </>
      )}

      <div 
        className={`h-40 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative cursor-pointer ${
          isPremiumMembership ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-100'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {(() => {
          const mediaSource = getImageSource();
          
          if (!mediaSource) {
            // Show fallback icon immediately if no media
            return (
              <div 
                className={`w-16 h-16 ${
                  isPremiumMembership ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-400'
                } rounded-full flex items-center justify-center`}
              >
                {(item.type === 'item' || item.type === 'badge') && <IconShoppingCart size={24} />}
                {item.type === 'border' && <IconBorderAll size={24} />}
                {item.type === 'avatar' && <IconUser size={24} />}
                {item.type === 'theme' && <IconPalette size={24} />}
                {(item.type === 'power_up' || item.type === 'powerup') && <IconCoin size={24} />}
              </div>
            );
          }

          if (mediaSource.type === 'video') {
            return (
              <video
                key={`${item.id}-${isHovered ? 'hover' : 'static'}-video`}
                autoPlay={isHovered}
                loop
                muted
                playsInline
                controls={false}
                className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                style={{ objectFit: 'cover' }}
                onLoadStart={() => {}}
                onCanPlay={() => {}}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon');
                  if (fallbackIcon) fallbackIcon.style.display = 'flex';
                }}
              >
                <source src={mediaSource.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            );
          } else {
            return (
              <img 
                src={mediaSource.src}
                alt={item.name}
                className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                onLoad={() => {}}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon');
                  if (fallbackIcon) fallbackIcon.style.display = 'flex';
                }}
              />
            );
          }
        })()}
        
        {/* Fallback icon - hidden by default, shown on error */}
        <div 
          className={`fallback-icon absolute inset-0 w-16 h-16 ${
            isPremiumMembership ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-400'
          } rounded-full flex items-center justify-center mx-auto my-auto hidden`}
        >
          {(item.type === 'item' || item.type === 'badge') && <IconShoppingCart size={24} />}
          {item.type === 'border' && <IconBorderAll size={24} />}
          {item.type === 'avatar' && <IconUser size={24} />}
          {item.type === 'theme' && <IconPalette size={24} />}
          {(item.type === 'power_up' || item.type === 'powerup') && <IconCoin size={24} />}
        </div>

        {/* Video/Hover indicator */}
        {item.image && item.image.endsWith('.mp4') && !isHovered && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <span>🎥</span>
            <span>Hover untuk video</span>
          </div>
        )}

        {/* Video playing indicator */}
        {item.image && item.image.endsWith('.mp4') && isHovered && (
          <div className="absolute top-2 left-2 bg-green-500/80 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <span>▶️</span>
            <span>Playing</span>
          </div>
        )}

        {/* Premium membership special effects - REMOVED all colored gradients */}
        {isPremiumMembership && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Simple cosmic effect without colored circles */}
            <div className="w-20 h-20 bg-white/10 rounded-full blur-sm"></div>
            <div className="absolute w-12 h-12 bg-white/5 rounded-full"></div>
          </div>
        )}
      </div>

      <h3 className={`font-semibold mb-1 line-clamp-2 ${
        isPremiumMembership ? 'text-white' : 'text-gray-800'
      }`}>
        {item.name || 'Unnamed Item'}
      </h3>
      <p className={`text-sm mb-3 line-clamp-2 ${
        isPremiumMembership ? 'text-white/90' : 'text-gray-600'
      }`}>
        {item.description || 'No description available'}
      </p>
      
      <div className="flex justify-between items-center relative z-10">
        <span className={`font-bold flex items-center gap-1 ${
          isPremiumMembership ? 'text-yellow-300' : 'text-secondary'
        }`}>
          <IconCoin size={16} className={isPremiumMembership ? 'text-yellow-300' : 'text-yellow-300'} />
          {formatNumber(item.price || 0)} Point
        </span>
        {owned ? (
          <button
            onClick={handleEquip}
            disabled={loading}
            className={`px-4 py-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 ${
              isPremiumMembership 
                ? 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? 'Memproses...' : 'Pakai'}
          </button>
        ) : (
          <button 
            onClick={() => item && handlePurchase(item)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors font-medium ${
              isPremiumMembership
                ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
                : 'bg-secondary hover:bg-blue-700 text-white'
            }`}
          >
            <IconShoppingCart size={14} />
            Beli
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Export a default component
export default ShopItemCard;
