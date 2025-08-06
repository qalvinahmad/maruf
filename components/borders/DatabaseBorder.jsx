import { IconBorderAll } from '@tabler/icons-react';

const DatabaseBorder = ({ size = 'w-64 h-64', children, className = '', borderData }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Database border container */}
      <div className={`${size} rounded-full border-4 border-gray-300 relative overflow-hidden`}>
        
        {/* Background pattern or image */}
        {borderData?.image ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${borderData.image})` }}
          />
        ) : borderData?.thumbnail ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${borderData.thumbnail})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />
        )}
        
        {/* Overlay pattern for database borders */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
        
        {/* Border name indicator */}
        <div className="absolute top-1 left-1 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">
          DB
        </div>
        
        {/* Content area */}
        <div className="absolute inset-4 rounded-full bg-black/20 border border-white/30 flex items-center justify-center">
          {children || <IconBorderAll size={32} className="text-white" />}
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg scale-105"></div>
    </div>
  );
};

export default DatabaseBorder;
