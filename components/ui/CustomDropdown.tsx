import { motion } from "framer-motion";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Pilih opsi...",
  className = ""
}: CustomDropdownProps) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div animate={open ? "open" : "closed"}>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <span className="text-sm text-gray-700 truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <motion.span 
            variants={iconVariants}
            className="text-gray-400 flex-shrink-0"
          >
            <FiChevronDown />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top" }}
          className="absolute top-full left-0 right-0 z-50 flex flex-col gap-1 p-2 mt-1 rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden"
        >
          {options.map((option, index) => (
            <motion.li
              key={option.value}
              variants={itemVariants}
              custom={index}
              onClick={() => handleSelect(option.value)}
              className={`flex items-center w-full p-2 text-sm rounded-md hover:bg-blue-50 transition-colors cursor-pointer ${
                value === option.value 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <span>{option.label}</span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Overlay to close dropdown when clicking outside */}
      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomDropdown;

const wrapperVariants = {
  open: {
    scaleY: 1,
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
      duration: 0.15,
    },
  },
  closed: {
    scaleY: 0,
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.02,
      duration: 0.1,
    },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.15,
    },
  }),
  closed: (index: number) => ({
    opacity: 0,
    y: -10,
    transition: {
      delay: index * 0.02,
      duration: 0.1,
    },
  }),
};
