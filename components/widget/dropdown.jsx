import { IconChevronDown } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

export const Dropdown = ({ 
  label, 
  value, 
  options, 
  onChange, 
  className = '', 
  name = '',
  placeholder = 'Pilih...' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get the selected label from options
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  
  // Close dropdown when clicking outside
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
        className="w-full border rounded-lg p-2 flex justify-between items-center cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${!selectedOption ? 'text-gray-400' : 'text-gray-800'}`}>
          {displayText}
        </span>
        <IconChevronDown 
          size={18} 
          className={`transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {options.map((option) => (
            <div
              key={option.value}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                value === option.value ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

