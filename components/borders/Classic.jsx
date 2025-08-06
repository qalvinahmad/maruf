
const Classic = ({ size = 'w-64 h-64', children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Main border with classic design */}
      <div className={`${size} rounded-full border-4 border-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden shadow-lg`}>
        
        {/* Elegant outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gold-400 opacity-80"></div>
        
        {/* Decorative corners */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full shadow-md"></div>
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full shadow-md"></div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full shadow-md"></div>
        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full shadow-md"></div>
        
        {/* Inner decorative elements */}
        <div className="absolute inset-2 rounded-full border border-blue-300 opacity-50"></div>
        <div className="absolute inset-4 rounded-full border border-purple-300 opacity-30"></div>
        
        {/* Content area */}
        <div className="absolute inset-6 rounded-full bg-transparent border border-gray-300 flex items-center justify-center">
          {children || <span className="text-gray-600 text-sm font-serif">CLASSIC</span>}
        </div>
      </div>
      
      {/* Subtle glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 blur-lg scale-105"></div>
    </div>
  );
};

export default Classic;
