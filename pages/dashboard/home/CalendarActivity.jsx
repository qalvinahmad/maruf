import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CalendarActivity = ({ profileData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // Generate calendar days for current month
  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      
      const days = [];
      
      // Add empty cells for days before the first day of month
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
      
      // Add empty cells to complete the grid (42 cells = 6 weeks)
      while (days.length < 42) {
        days.push(null);
      }
      
      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentDate]);

  // Simulate active learning days (you can replace this with actual data)
  const getActiveDays = () => {
    // Example: user was active on these days of current month
    const activeDays = [];
    const today = new Date();
    const currentDay = today.getDate();
    
    // Simulate some active days based on streak
    for (let i = Math.max(1, currentDay - (profileData?.streak || 0)); i <= currentDay; i++) {
      activeDays.push(i);
    }
    
    return activeDays;
  };

  const activeDays = getActiveDays();
  const today = new Date().getDate();
  const currentMonth = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isActiveDay = (day) => {
    return activeDays.includes(day);
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.8 }}
      className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"></div>
      
      <div className="space-y-10">
        {/* Enhanced section header */}
        <div className="text-center space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="text-3xl font-bold text-gray-900"
          >
            Kalender Aktivitas
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.6 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Visualisasi konsistensi pembelajaran harian untuk bulan {currentMonth}
          </motion.p>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Sebelumnya</span>
          </button>
          
          <h3 className="text-xl font-bold text-gray-800">{currentMonth}</h3>
          
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <span>Selanjutnya</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Calendar Grid with enhanced styling */}
        <div className="space-y-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-3">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, index) => (
              <motion.div 
                key={day} 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 + (index * 0.1), duration: 0.4 }}
                className="text-center text-sm font-bold text-gray-700 py-4 bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl border border-gray-200"
              >
                {day}
              </motion.div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div 
                    key={`empty-${index}`}
                    className="h-16 rounded-2xl"
                  />
                );
              }

              const isDayToday = isToday(day);
              const isDayActive = isActiveDay(day);
              
              return (
                <motion.div 
                  key={`day-${day}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.2 + (index * 0.02), duration: 0.3 }}
                  className={`h-16 rounded-2xl flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-300 relative group ${
                    isDayToday 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl transform scale-110 ring-4 ring-indigo-200 z-10' 
                      : isDayActive 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:from-green-100 hover:to-emerald-100 hover:shadow-md transform hover:scale-105' 
                        : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100 hover:text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="relative z-10">{day}</span>
                  
                  {/* Activity indicator for active days */}
                  {isDayActive && !isDayToday && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></div>
                  )}
                  
                  {/* Tooltip for active days */}
                  {(isDayActive || isDayToday) && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                      <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                        {isDayToday ? 'Hari ini' : 'Belajar selesai'}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Enhanced legend with statistics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.6 }}
          className="space-y-6 pt-8 border-t-2 border-gray-100"
        >
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-2xl font-bold text-green-700">{activeDays.length}</div>
              <div className="text-sm text-green-600">Hari aktif bulan ini</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">{profileData?.streak || 0}</div>
              <div className="text-sm text-blue-600">Streak saat ini</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="text-2xl font-bold text-purple-700">
                {Math.round((activeDays.length / new Date().getDate()) * 100)}%
              </div>
              <div className="text-sm text-purple-600">Konsistensi bulan ini</div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-emerald-200 rounded-xl group-hover:scale-110 transition-transform duration-200 relative">
                <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
              <span className="text-gray-700 font-medium group-hover:text-emerald-600 transition-colors duration-200">Aktif Belajar</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200"></div>
              <span className="text-gray-700 font-medium group-hover:text-indigo-600 transition-colors duration-200">Hari Ini</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-gray-50 border-2 border-gray-200 rounded-xl group-hover:scale-110 transition-transform duration-200"></div>
              <span className="text-gray-700 font-medium group-hover:text-gray-600 transition-colors duration-200">Belum Aktif</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CalendarActivity;
