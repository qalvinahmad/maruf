import { IconChevronDown } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

export const Dropdown = ({ 
  label, 
  value, 
  options, 
  onChange, 
  className = '', 
  name = '',
  placeholder = 'Pilih...',
  theme = 'blue' // New prop for theme color
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Support both array of strings and array of objects
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { value: option, label: option, icon: null };
    }
    return { ...option, icon: option.icon || null };
  });
  
  // Get theme-based classes
  const getThemeClasses = () => {
    const themeMap = {
      blue: {
        border: 'border-blue-200 focus:ring-blue-500 focus:border-blue-500 hover:bg-blue-50',
        active: 'bg-blue-50 text-blue-600'
      },
      red: {
        border: 'border-red-200 focus:ring-red-500 focus:border-red-500 hover:bg-red-50',
        active: 'bg-red-50 text-red-600'
      },
      green: {
        border: 'border-green-200 focus:ring-green-500 focus:border-green-500 hover:bg-green-50',
        active: 'bg-green-50 text-green-600'
      },
      purple: {
        border: 'border-purple-200 focus:ring-purple-500 focus:border-purple-500 hover:bg-purple-50',
        active: 'bg-purple-50 text-purple-600'
      }
    };
    return themeMap[theme] || themeMap.blue;
  };

  const themeClasses = getThemeClasses();
  
  const selectedOption = normalizedOptions.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>}
      
      <div 
        className={`w-full border rounded-lg p-2 flex justify-between items-center cursor-pointer bg-white focus:outline-none focus:ring-2 transition-colors ${themeClasses.border}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`flex items-center gap-2 ${!selectedOption ? 'text-gray-400' : 'text-gray-800'}`}>
          {selectedOption && selectedOption.icon && (
            <span className="flex items-center text-current">{selectedOption.icon}</span>
          )}
          <span>{displayText}</span>
        </div>
        <IconChevronDown 
          size={18} 
          className={`transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {normalizedOptions.map((option) => (
            <div
              key={option.value}
              className={`p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                value === option.value ? themeClasses.active : ''
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.icon && (
                <span className="flex items-center text-current">{option.icon}</span>
              )}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;


