
const AdminMenuCard = ({ 
  icon, 
  title, 
  description, 
  bgColor = "bg-white", 
  onClick, 
  isActive = false 
}) => {
  return (
    <div
      className={`${bgColor} rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
        isActive ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
        {isActive && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default AdminMenuCard;
