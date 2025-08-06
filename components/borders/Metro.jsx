
const Metro = ({ size = 'w-64 h-64', children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Main circular border */}
      <div className={`${size} rounded-full border-8 border-purple-900 relative overflow-hidden`}>
        
        {/* Glitch effect layers */}
        <div className="absolute inset-0 rounded-full border-8 border-cyan-400 opacity-70 animate-pulse transform translate-x-1 translate-y-1"></div>
        <div className="absolute inset-0 rounded-full border-8 border-pink-500 opacity-70 animate-pulse transform -translate-x-1 -translate-y-1"></div>
        
        {/* Glitch fragments - top */}
        <div className="absolute -top-2 left-8 w-12 h-4 bg-cyan-400 transform rotate-12 animate-bounce"></div>
        <div className="absolute -top-1 left-20 w-8 h-3 bg-pink-500 transform -rotate-6"></div>
        <div className="absolute -top-3 right-12 w-16 h-2 bg-purple-900"></div>
        <div className="absolute -top-2 right-24 w-6 h-5 bg-cyan-400 transform rotate-45 animate-pulse"></div>
        
        {/* Glitch fragments - right */}
        <div className="absolute -right-3 top-16 w-4 h-10 bg-pink-500 transform rotate-90 animate-bounce"></div>
        <div className="absolute -right-2 top-28 w-6 h-8 bg-cyan-400 transform -rotate-12"></div>
        <div className="absolute -right-4 top-40 w-3 h-12 bg-purple-900 animate-pulse"></div>
        <div className="absolute -right-1 bottom-20 w-8 h-6 bg-pink-500 transform rotate-30"></div>
        
        {/* Glitch fragments - bottom */}
        <div className="absolute -bottom-2 right-8 w-14 h-3 bg-cyan-400 transform -rotate-15 animate-bounce"></div>
        <div className="absolute -bottom-3 right-20 w-10 h-4 bg-pink-500 transform rotate-8"></div>
        <div className="absolute -bottom-1 left-16 w-12 h-2 bg-purple-900 animate-pulse"></div>
        <div className="absolute -bottom-4 left-28 w-7 h-5 bg-cyan-400 transform -rotate-25"></div>
        
        {/* Glitch fragments - left */}
        <div className="absolute -left-2 top-12 w-5 h-14 bg-pink-500 transform rotate-75 animate-bounce"></div>
        <div className="absolute -left-3 top-32 w-4 h-10 bg-cyan-400 transform -rotate-30"></div>
        <div className="absolute -left-4 top-48 w-6 h-8 bg-purple-900 animate-pulse"></div>
        <div className="absolute -left-1 bottom-16 w-8 h-7 bg-pink-500 transform rotate-60"></div>
        
        {/* Inner glitch elements */}
        <div className="absolute top-8 left-12 w-4 h-6 bg-cyan-400 transform rotate-45 animate-pulse"></div>
        <div className="absolute top-12 right-16 w-6 h-4 bg-pink-500 transform -rotate-30 animate-bounce"></div>
        <div className="absolute bottom-10 left-20 w-5 h-8 bg-purple-900 transform rotate-60"></div>
        <div className="absolute bottom-16 right-12 w-7 h-3 bg-cyan-400 transform -rotate-45 animate-pulse"></div>
        
        {/* Glow effects */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 blur-sm opacity-50 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-2 border-pink-500 blur-sm opacity-50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Content area */}
        <div className="absolute inset-4 rounded-full bg-transparent border-2 border-dashed border-gray-400 flex items-center justify-center">
          {children || <span className="text-gray-600 text-sm font-mono">CONTENT</span>}
        </div>
      </div>
      
      {/* Additional outer glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-20 blur-xl scale-110 animate-pulse"></div>
    </div>
  );
};

export default Metro;
