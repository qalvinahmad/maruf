
const Galaxy = ({ size = 'w-64 h-64', children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Main galaxy border */}
      <div className={`${size} rounded-full border-4 border-purple-900 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-black`}>
        
        {/* Star field */}
        <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
        <div className="absolute top-12 right-16 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-20 left-12 w-1 h-1 bg-blue-300 rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-8 right-8 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-16 left-20 w-1 h-1 bg-purple-300 rounded-full animate-twinkle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-8 right-24 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-twinkle" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-20 right-12 w-1 h-1 bg-pink-300 rounded-full animate-twinkle" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-16 left-4 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-twinkle" style={{ animationDelay: '3.5s' }}></div>
        
        {/* Nebula clouds */}
        <div className="absolute top-6 right-6 w-12 h-8 bg-purple-500 opacity-30 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute bottom-8 left-8 w-16 h-6 bg-blue-500 opacity-20 rounded-full blur-md animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-12 bg-pink-500 opacity-25 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Planetary rings */}
        <div className="absolute inset-8 rounded-full border border-purple-400 opacity-40 animate-spin-slow"></div>
        <div className="absolute inset-12 rounded-full border border-blue-400 opacity-30 animate-spin-reverse"></div>
        
        {/* Content area */}
        <div className="absolute inset-16 rounded-full bg-black bg-opacity-40 border border-purple-300 flex items-center justify-center">
          {children || <span className="text-purple-300 text-sm font-mono">GALAXY</span>}
        </div>
      </div>
      
      {/* Cosmic glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 opacity-30 blur-xl scale-110 animate-pulse"></div>
    </div>
  );
};

export default Galaxy;
