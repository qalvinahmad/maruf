
const Simple = ({ size = 'w-64 h-64', children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Simple clean border */}
      <div className={`${size} rounded-full border-3 border-gray-300 relative overflow-hidden bg-white shadow-md`}>
        
        {/* Minimal inner ring */}
        <div className="absolute inset-2 rounded-full border border-gray-200"></div>
        
        {/* Content area */}
        <div className="absolute inset-4 rounded-full bg-transparent flex items-center justify-center">
          {children || <span className="text-gray-600 text-sm font-sans">SIMPLE</span>}
        </div>
      </div>
      
      {/* Subtle shadow */}
      <div className="absolute inset-0 rounded-full bg-gray-300 opacity-20 blur-md scale-102"></div>
    </div>
  );
};

export default Simple;
