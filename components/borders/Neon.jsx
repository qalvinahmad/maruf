
const Neon = ({ size = 'w-64 h-64', children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Main neon border */}
      <div className={`${size} rounded-full border-4 border-cyan-400 relative overflow-hidden`}>
        
        {/* Neon glow layers */}
        <div className="absolute inset-0 rounded-full border-4 border-cyan-400 blur-sm animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-2 border-cyan-300 blur-md opacity-75 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border border-cyan-200 blur-lg opacity-50 animate-pulse"></div>
        
        {/* Electric sparks */}
        <div className="absolute top-4 left-8 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute top-12 right-6 w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute bottom-8 left-12 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute bottom-16 right-10 w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
        <div className="absolute top-20 left-4 w-1 h-1 bg-cyan-200 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute top-6 right-16 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        
        {/* Electric lines */}
        <div className="absolute top-8 left-6 w-16 h-0.5 bg-cyan-400 transform rotate-45 opacity-60 animate-pulse"></div>
        <div className="absolute bottom-12 right-8 w-12 h-0.5 bg-cyan-300 transform -rotate-30 opacity-40 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-16 right-4 w-8 h-0.5 bg-cyan-400 transform rotate-90 opacity-50 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
        
        {/* Content area */}
        <div className="absolute inset-6 rounded-full bg-black bg-opacity-20 border border-cyan-400 flex items-center justify-center">
          {children || <span className="text-cyan-400 text-sm font-mono">NEON</span>}
        </div>
      </div>
      
      {/* Outer neon glow */}
      <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 blur-xl scale-110 animate-pulse"></div>
      <div className="absolute inset-0 rounded-full bg-cyan-300 opacity-10 blur-2xl scale-125 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

export default Neon;
