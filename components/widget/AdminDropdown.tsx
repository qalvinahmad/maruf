import { IconChevronDown } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface DropdownOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  disabled?: boolean;
  action?: () => void;
}

interface DropdownProps {
  label?: string;
  name?: string;
  value?: string | number;
  options: DropdownOption[];
  onChange?: (value: string | number) => void;
  className?: string;
  placeholder?: string;
  variant?: 'select' | 'menu';
  buttonText?: string;
  buttonColor?: string;
}

const AdminDropdown = ({ 
  label, 
  name,
  value, 
  options, 
  onChange, 
  className = "", 
  placeholder = "Pilih opsi...",
  variant = 'select',
  buttonText = "Actions",
  buttonColor = "bg-indigo-500 hover:bg-indigo-600"
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    
    if (variant === 'menu' && option.action) {
      option.action();
    } else if (variant === 'select' && onChange) {
      onChange(option.value);
    }
    
    setIsOpen(false);
  };

  // Animation variants matching dropdown.tsx
  const wrapperVariants = {
    open: {
      scaleY: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
    closed: {
      scaleY: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.05,
      },
    },
  };

  const iconVariants = {
    open: { rotate: 180 },
    closed: { rotate: 0 },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
      },
    },
    closed: {
      opacity: 0,
      y: -15,
      transition: {
        when: "afterChildren",
      },
    },
  };

  const actionIconVariants = {
    open: { scale: 1, y: 0 },
    closed: { scale: 0, y: -7 },
  };

  if (variant === 'menu') {
    return (
      <div className={`relative ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        
        <motion.div animate={isOpen ? "open" : "closed"} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${buttonColor} transition-colors font-medium text-sm shadow-md hover:shadow-lg`}
          >
            <span>{buttonText}</span>
            <motion.div variants={iconVariants} transition={{ duration: 0.2 }}>
              <IconChevronDown size={16} />
            </motion.div>
          </button>

          <motion.ul
            initial={wrapperVariants.closed}
            variants={wrapperVariants}
            style={{ originY: "top", translateX: "-50%" }}
            className="flex flex-col gap-1 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden border border-gray-200 z-50"
          >
            {options.map((option, index) => (
              <motion.li
                key={`${option.value}-${index}`}
                variants={itemVariants}
                onClick={() => handleSelect(option)}
                className={`flex items-center gap-3 w-full p-3 text-sm font-medium whitespace-nowrap rounded-md transition-all cursor-pointer ${
                  option.disabled 
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                    : `text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${option.color ? option.color : ''}`
                }`}
              >
                {option.icon && (
                  <motion.span 
                    variants={actionIconVariants}
                    className="flex items-center justify-center w-4 h-4"
                  >
                    {option.icon}
                  </motion.span>
                )}
                <span className="flex-1">{option.label}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Overlay to close dropdown when clicking outside */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Original select variant
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <motion.div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors flex items-center justify-between"
        >
          <span className={`flex items-center gap-2 ${selectedOption ? "text-gray-900" : "text-gray-500"}`}>
            {selectedOption?.icon && (
              <span className="w-4 h-4 flex items-center justify-center">
                {selectedOption.icon}
              </span>
            )}
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <IconChevronDown size={20} className="text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              <div className="py-1">
                {options.map((option, index) => (
                  <motion.button
                    key={`${option.value}-${option.label}-${index}`}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-2 ${
                      option.disabled
                        ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                        : option.value === value 
                          ? 'bg-blue-50 text-blue-700 font-medium hover:bg-blue-100' 
                          : 'text-gray-900 hover:bg-gray-100'
                    }`}
                    whileHover={!option.disabled ? { backgroundColor: option.value === value ? "rgb(219 234 254)" : "rgb(243 244 246)" } : {}}
                  >
                    {option.icon && (
                      <span className="w-4 h-4 flex items-center justify-center">
                        {option.icon}
                      </span>
                    )}
                    <span className="flex-1">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDropdown;
