import { IconSearch } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const FilterDropdown = ({ label, options, value, onChange, buttonText }) => {
  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <motion.div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
          animate={{ rotate: 0 }}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

const FilterSection = ({ 
  filterOptions, 
  typeFilter, 
  setTypeFilter, 
  statusFilter, 
  setStatusFilter, 
  searchTerm, 
  setSearchTerm 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-6 p-4 bg-white rounded-xl shadow-sm"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <FilterDropdown
            label="Tipe Event"
            options={filterOptions.type}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            buttonText="Semua Tipe"
          />
          <FilterDropdown
            label="Status"
            options={filterOptions.status}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            buttonText="Semua Status"
          />
        </div>

        <div className="relative w-full md:w-auto flex-1 md:max-w-xs">
          <input
            type="text"
            placeholder="Cari event..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <IconSearch size={18} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterSection;
