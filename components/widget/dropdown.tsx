import { motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

const Dropdown = ({ options, value, onChange, placeholder = "Pilih opsi", icon, className = "" }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.div 
      ref={dropdownRef}
      animate={open ? "open" : "closed"} 
      className={`relative ${className}`}
    >
      <button
        onClick={() => setOpen((pv) => !pv)}
        className="flex items-center gap-2 pl-10 pr-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-700 w-full md:w-auto font-['Poppins'] shadow-sm hover:bg-blue-50 transition-colors"
      >
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <span className="font-medium text-sm flex-1 text-left">{value || placeholder}</span>
        <motion.span variants={iconVariants}>
          <FiChevronDown />
        </motion.span>
      </button>

      <motion.ul
        initial={wrapperVariants.closed}
        variants={wrapperVariants}
        style={{ originY: "top", translateX: "0%" }}
        className="flex flex-col gap-1 p-2 rounded-lg bg-white shadow-xl absolute top-[110%] left-0 right-0 w-full overflow-hidden border border-gray-200 z-50"
      >
        {options.map((option, index) => (
          <Option 
            key={option} 
            text={option} 
            setOpen={setOpen} 
            onClick={() => onChange(option)}
            isSelected={value === option}
            index={index}
          />
        ))}
      </motion.ul>
    </motion.div>
  );
};

const Option = ({
  text,
  setOpen,
  onClick,
  isSelected,
  index
}: {
  text: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onClick: () => void;
  isSelected: boolean;
  index: number;
}) => {
  return (
    <motion.li
      variants={itemVariants}
      custom={index}
      onClick={() => {
        onClick();
        setOpen(false);
      }}
      className={`flex items-center gap-2 w-full p-3 text-sm font-medium whitespace-nowrap rounded-md transition-colors cursor-pointer ${
        isSelected 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <span>{text}</span>
    </motion.li>
  );
};

export default Dropdown;

const wrapperVariants = {
  open: {
    scaleY: 1,
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
      duration: 0.2,
      ease: "easeOut"
    },
  },
  closed: {
    scaleY: 0,
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.02,
      staggerDirection: -1,
      duration: 0.15,
      ease: "easeIn"
    },
  },
};

const iconVariants = {
  open: { 
    rotate: 180,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  closed: { 
    rotate: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  },
};

const itemVariants = {
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
      ease: "easeOut"
    },
  }),
  closed: (i: number) => ({
    opacity: 0,
    y: -10,
    transition: {
      delay: i * 0.02,
      duration: 0.15,
      ease: "easeIn"
    },
  }),
};