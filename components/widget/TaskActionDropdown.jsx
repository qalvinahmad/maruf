import { IconCheck, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { motion } from "framer-motion";
import { useState } from "react";

const TaskActionDropdown = ({ task, onEdit, onComplete, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <IconDotsVertical size={16} />
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "-100%" }}
          className="flex flex-col gap-1 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] right-0 w-40 overflow-hidden border border-gray-100 z-50"
        >
          <TaskOption 
            setOpen={setOpen} 
            Icon={IconEdit} 
            text="Edit" 
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:bg-blue-50"
          />
          <TaskOption 
            setOpen={setOpen} 
            Icon={IconCheck} 
            text="Selesai" 
            onClick={() => onComplete(task)}
            className="text-green-600 hover:bg-green-50"
          />
          <TaskOption 
            setOpen={setOpen} 
            Icon={IconTrash} 
            text="Hapus" 
            onClick={() => onDelete(task)}
            className="text-red-600 hover:bg-red-50"
          />
        </motion.ul>
      </motion.div>
    </div>
  );
};

const TaskOption = ({
  text,
  Icon,
  setOpen,
  onClick,
  className = ""
}) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className={`flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md transition-colors cursor-pointer ${className}`}
    >
      <motion.span variants={actionIconVariants}>
        <Icon size={14} />
      </motion.span>
      <span>{text}</span>
    </motion.li>
  );
};

// Filter dropdown for categories
const FilterDropdown = ({ options, value, onChange, placeholder, icon: Icon }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 bg-white border border-gray-200 hover:border-gray-300 transition-colors min-w-[150px]"
        >
          {Icon && <Icon size={16} className="text-gray-400" />}
          <span className="font-medium text-sm flex-1 text-left">{value || placeholder}</span>
          <motion.span variants={iconVariants} className="text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "0%" }}
          className="flex flex-col gap-1 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] left-0 w-full overflow-hidden border border-gray-100 z-50"
        >
          {options.map((option, index) => (
            <FilterOption
              key={option}
              setOpen={setOpen}
              text={option}
              onClick={() => onChange(option)}
              isSelected={value === option}
              delay={index * 0.05}
            />
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
};

const FilterOption = ({
  text,
  setOpen,
  onClick,
  isSelected,
  delay = 0
}) => {
  return (
    <motion.li
      variants={{
        ...itemVariants,
        open: {
          ...itemVariants.open,
          transition: { delay }
        }
      }}
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className={`flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md transition-colors cursor-pointer ${
        isSelected 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span>{text}</span>
      {isSelected && (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto text-blue-600"
        >
          <IconCheck size={12} />
        </motion.span>
      )}
    </motion.li>
  );
};

export default TaskActionDropdown;
export { FilterDropdown };

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
    y: -10,
    transition: {
      when: "afterChildren",
    },
  },
};

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -5 },
};
