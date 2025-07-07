import { IconBorderAll, IconClock, IconCoin, IconFlame, IconPalette, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { formatNumber } from '../../../utils/formatNumber';

const RandomDiscountCard = ({ randomDiscountItem, randomItemTimeLeft, handlePurchase }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!randomDiscountItem) return null;
  
  console.log('=== Flash Sale Card Debug ===');
  console.log('randomDiscountItem:', randomDiscountItem);
  console.log('discountPercent value:', randomDiscountItem.discountPercent);
  console.log('discountPercent type:', typeof randomDiscountItem.discountPercent);
  console.log('originalPrice:', randomDiscountItem.originalPrice);
  console.log('discounted price:', randomDiscountItem.price);
  console.log('=== End Debug ===');

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
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-xl shadow-lg mb-8 text-white relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
      
      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        <div 
          className="md:w-1/3 bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center relative overflow-hidden">
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
                      console.log('Flash sale video failed to load');
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
                      console.log('Flash sale image failed to load');
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
          </div>
        </div>
        
        <div className="md:w-2/3 space-y-3">
          <div className="flex items-center gap-2">
            <IconFlame size={32} className="text-yellow-300" />
            <h2 className="text-3xl md:text-4xl font-black tracking-wider">FLASH SALE</h2>
          </div>
          
          <h3 className="text-2xl font-bold">{randomDiscountItem.name}</h3>
          <p className="text-white/80">{randomDiscountItem.description}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
              <p className="text-sm text-white/80">Harga Normal</p>
              <p className="text-lg font-bold line-through">{formatNumber(randomDiscountItem.originalPrice)} Point</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
              <p className="text-sm text-white/80">Harga Spesial</p>
              <p className="text-xl font-bold flex items-center gap-1">
                <IconCoin size={16} className="text-yellow-300" />
                {formatNumber(randomDiscountItem.price)} Point
              </p>
            </div>
            
            <div className="bg-purple-600/70 backdrop-blur-sm px-3 py-2 rounded-lg">
              <p className="text-sm text-white/80">Diskon</p>
              <p className="text-xl font-bold">{randomDiscountItem.discountPercent}%</p>
              {/* Enhanced debug info */}
              <p className="text-xs opacity-50">
                Debug: {randomDiscountItem.discountPercent} (type: {typeof randomDiscountItem.discountPercent})
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <IconClock size={18} />
              <span>Berubah dalam: </span>
              <span className="font-mono font-bold">
                {String(randomItemTimeLeft.hours || 0).padStart(2, '0')}:
                {String(randomItemTimeLeft.minutes || 0).padStart(2, '0')}:
                {String(randomItemTimeLeft.seconds || 0).padStart(2, '0')}
              </span>
            </div>
            
            <button 
              onClick={() => handlePurchase(randomDiscountItem)}
              className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              <IconShoppingCart size={18} />
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomDiscountCard;
