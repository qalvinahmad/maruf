import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { convertToHijri } from '../../../utils/hijriCalendar';

const CalendarYearDropdown = ({ options, value, onChange }) => {
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

const CalendarSection = ({ 
  isCalendarExpanded, 
  setIsCalendarExpanded, 
  selectedYear, 
  setSelectedYear, 
  filterOptions, 
  calendarEvents,
  generateCalendarGrid,
  getMonthName 
}) => {
  const [currentHijriDate, setCurrentHijriDate] = useState('');

  // Get Hijri date for current year
  useEffect(() => {
    const getCurrentHijriYear = async () => {
      try {
        // Get Hijri date for January 1st of selected year
        const gregorianDate = new Date(selectedYear, 0, 1);
        const hijriResult = await convertToHijri(gregorianDate);
        if (hijriResult && hijriResult.year) {
          setCurrentHijriDate(`${hijriResult.year} H`);
        }
      } catch (error) {
        console.error('Error getting Hijri year:', error);
        setCurrentHijriDate('');
      }
    };

    getCurrentHijriYear();
  }, [selectedYear]);

  const renderCalendarHeader = () => (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kalender Event</h2>
          {currentHijriDate && (
            <p className="text-sm text-gray-600 mt-1">
              Tahun Hijriah: {currentHijriDate}
            </p>
          )}
        </div>
        <CalendarYearDropdown
          className="z-50"
          options={filterOptions.year}
          value={selectedYear}
          onChange={(value) => setSelectedYear(parseInt(value))}
        />
      </div>
      <motion.button
        onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{isCalendarExpanded ? 'Tutup Kalender' : 'Buka Kalender'}</span>
        <motion.div
          animate={{ rotate: isCalendarExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isCalendarExpanded ? (
            <IconChevronUp size={20} />
          ) : (
            <IconChevronDown size={20} />
          )}
        </motion.div>
      </motion.button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b">
        {renderCalendarHeader()}
      </div>

      <motion.div
        initial={false}
        animate={{ 
          height: isCalendarExpanded ? 'auto' : 0,
          opacity: isCalendarExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const monthKey = format(new Date(selectedYear, monthIndex), 'MM-yyyy');
              const monthEvents = calendarEvents[monthKey] || [];
              const days = generateCalendarGrid(monthIndex);
              
              return (
                <div key={monthIndex} className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="font-semibold text-center mb-3">
                    {getMonthName(monthIndex + 1)}
                  </h3>
                  
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => (
                      <div
                        key={index}
                        className={`
                          aspect-square flex items-center justify-center text-xs
                          ${day === null ? '' : 'hover:bg-gray-50 cursor-pointer rounded'}
                          ${day === new Date().getDate() && 
                            monthIndex === new Date().getMonth() && 
                            selectedYear === new Date().getFullYear()
                              ? 'bg-secondary text-white rounded'
                              : ''}
                        `}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {monthEvents.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-gray-600 mb-1">
                        {monthEvents.length} event
                      </div>
                      {monthEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded mb-1 truncate ${
                            event.status === 'Aktif' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {monthEvents.length > 2 && (
                        <div className="text-xs text-blue-600 text-center">
                          +{monthEvents.length - 2} lainnya
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarSection;
