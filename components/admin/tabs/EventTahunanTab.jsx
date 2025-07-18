import { IconCalendarEvent, IconCheck, IconChevronDown, IconChevronUp, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { eachMonthOfInterval, endOfYear, format, startOfYear } from 'date-fns';
import { motion } from 'framer-motion';
import { useState } from 'react';
import AdminDropdown from '../../widget/AdminDropdown';

const getMonthName = (monthNumber) => {
  return new Date(2024, monthNumber - 1).toLocaleString('id-ID', { month: 'long' });
};

const EventTahunanTab = ({
  events,
  statistics,
  isCalendarExpanded,
  setIsCalendarExpanded,
  selectedYear,
  setSelectedYear,
  calendarEvents,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  handleAddEvent,
  handleEditEvent,
  handleDeleteEvent,
  filterOptions,
  FilterDropdown
}) => {
  // Calendar functions
  const getMonthsForYear = (year) => {
    return eachMonthOfInterval({
      start: startOfYear(new Date(year, 0)),
      end: endOfYear(new Date(year, 0))
    });
  };

  const generateCalendarGrid = (month) => {
    const firstDay = new Date(selectedYear, month, 1);
    const lastDay = new Date(selectedYear, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Calendar Year Dropdown Component
  const CalendarYearDropdown = ({ options, value, onChange }) => {
    const [open, setOpen] = useState(false);

    const wrapperVariants = {
      open: {
        scaleY: 1,
        transition: {
          when: "beforeChildren",
          staggerChildren: 0.1,
        },
      },
      closed: {
        scaleY: 0,
        transition: {
          when: "afterChildren",
          staggerChildren: 0.1,
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

    return (
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-sm"
        >
          <span>{value}</span>
          <motion.span variants={iconVariants}>
            <IconChevronDown size={16} />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "0" }}
          className="flex flex-col gap-1 p-2 rounded-lg bg-white shadow-xl absolute top-[105%] left-0 w-24 z-50 overflow-hidden border border-gray-200"
        >
          {options.map((option, index) => (
            <motion.li
              key={`${option.value}-${index}`}
              variants={itemVariants}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full p-1 text-xs font-medium whitespace-nowrap rounded-md hover:bg-indigo-100 transition-colors cursor-pointer ${
                value === option.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:text-indigo-500'
              }`}
            >
              <span>{option.label}</span>
            </motion.li>
          ))}
        </motion.ul>

        {/* Overlay to close dropdown when clicking outside */}
        {open && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </motion.div>
    );
  };

  // Calendar Header
  const renderCalendarHeader = () => {
    // Filter events by selected year for accurate count
    const eventsForSelectedYear = events.filter(event => 
      new Date(event.date).getFullYear() === selectedYear
    );
    
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Kalender Event</h2>
          <div className="flex items-center gap-2">
            <CalendarYearDropdown
              className="z-50"
              options={[
                ...filterOptions.year,
                { value: 2023, label: '2023' },
                { value: 2024, label: '2024' },
                { value: 2025, label: '2025' }
              ]}
              value={selectedYear}
              onChange={(value) => setSelectedYear(parseInt(value))}
            />
            <span className="text-sm text-gray-600">
              ({eventsForSelectedYear.length} events)
            </span>
          </div>
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
  };

  // Filters
  const renderFilters = () => (
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">

      
      {/* Yearly Calendar */}
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
                
                // Filter events by month and year
                const monthEvents = events.filter(event => {
                  if (!event.date) return false;
                  
                  const eventDate = new Date(event.date);
                  return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === selectedYear;
                });
                
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
                      {days.map((day, index) => {
                        // Check if there are events on this day
                        const dayEvents = monthEvents.filter(event => {
                          const eventDate = new Date(event.date);
                          return eventDate.getDate() === day;
                        });
                        
                        return (
                          <div
                            key={index}
                            className={`
                              aspect-square flex items-center justify-center text-xs relative
                              ${day === null ? '' : 'hover:bg-gray-50 cursor-pointer rounded'}
                              ${day === new Date().getDate() && 
                                monthIndex === new Date().getMonth() && 
                                selectedYear === new Date().getFullYear()
                                  ? 'bg-blue-600 text-white rounded'
                                  : ''}
                              ${dayEvents.length > 0 ? 'bg-green-50 text-green-800 font-medium' : ''}
                            `}
                            title={dayEvents.length > 0 ? dayEvents.map(e => e.title).join(', ') : ''}
                          >
                            {day}
                            {dayEvents.length > 0 && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {monthEvents.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-xs text-gray-600 mb-1 font-medium">
                          {monthEvents.length} event{monthEvents.length > 1 ? 's' : ''}
                        </div>
                        {monthEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded mb-1 truncate ${
                              event.status === 'Aktif' 
                                ? 'bg-green-100 text-green-800' 
                                : event.status === 'Dijadwalkan'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                            title={`${event.title} - ${new Date(event.date).toLocaleDateString('id-ID')}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {monthEvents.length > 3 && (
                          <div className="text-xs text-blue-600 text-center font-medium">
                            +{monthEvents.length - 3} lainnya
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <IconCalendarEvent size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">Total Events</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{statistics.totalEvents}</p>
          <p className="text-sm text-gray-600">Event aktif</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
              <IconCalendarEvent size={20} />
            </div>
            <h3 className="font-semibold text-gray-800">Registrasi</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{statistics.totalRegistrations}</p>
          <p className="text-sm text-gray-600">Peserta terdaftar</p>
        </motion.div>
      </div>
      
      {/* Filter dan Pencarian */}
      {renderFilters()}
      
      {/* Header Tabel dengan Button Tambah Event */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Event Tahunan</h2>
        <motion.button
          onClick={handleAddEvent}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <IconPlus size={18} />
          <span>Tambah Event</span>
        </motion.button>
      </div>
      
      {/* Tabel Event */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Judul</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Tipe</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Speaker</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Register</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Reward</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{event.title}</div>
                      {event.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.type === 'Acara' ? 'bg-purple-100 text-purple-800' : 
                        event.type === 'Program' ? 'bg-green-100 text-green-800' :
                        event.type === 'Sistem' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {event.speaker ? (
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{event.speaker}</div>
                          {event.speaker_title && (
                            <div className="text-xs text-gray-500">{event.speaker_title}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(event.date).toLocaleDateString('id-ID')}
                      </div>
                      {event.time && (
                        <div className="text-xs text-gray-500">{event.time}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {event.totalRegistrations || 0}
                        </span>
                        <span className="text-xs text-gray-500">peserta</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {event.rewards && event.rewards.length > 0 ? (
                        <div className="space-y-1">
                          {event.rewards.slice(0, 2).map((reward, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs">
                              {reward.xp_reward && (
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  {reward.xp_reward} XP
                                </span>
                              )}
                              {reward.points_reward && (
                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                                  {reward.points_reward} Pts
                                </span>
                              )}
                              {reward.badge_reward && (
                                <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                                  🏆 {reward.badge_reward}
                                </span>
                              )}
                            </div>
                          ))}
                          {event.rewards.length > 2 && (
                            <div className="text-xs text-gray-500">+{event.rewards.length - 2} lainnya</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.status === 'Aktif' ? 'bg-green-100 text-green-800' : 
                        event.status === 'Dijadwalkan' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <AdminDropdown
                          variant="menu"
                          buttonText="Actions"
                          buttonColor="bg-gray-600 hover:bg-gray-700"
                          options={[
                            ...(event.status === 'Dijadwalkan' ? [
                              {
                                value: 'activate',
                                label: 'Aktifkan Event',
                                icon: <IconCheck size={16} />,
                                action: () => handleEditEvent(event),
                                color: 'hover:bg-green-50 hover:text-green-700'
                              },
                              {
                                value: 'edit',
                                label: 'Edit Event',
                                icon: <IconEdit size={16} />,
                                action: () => handleEditEvent(event),
                                color: 'hover:bg-blue-50 hover:text-blue-700'
                              },
                              {
                                value: 'delete',
                                label: 'Hapus Event',
                                icon: <IconTrash size={16} />,
                                action: () => handleDeleteEvent(event.id),
                                color: 'hover:bg-red-50 hover:text-red-700'
                              }
                            ] : []),
                            ...(event.status === 'Aktif' ? [
                              {
                                value: 'edit',
                                label: 'Edit Event',
                                icon: <IconEdit size={16} />,
                                action: () => handleEditEvent(event),
                                color: 'hover:bg-blue-50 hover:text-blue-700'
                              },
                              {
                                value: 'complete',
                                label: 'Tandai Selesai',
                                icon: <IconCheck size={16} />,
                                action: () => {
                                  const updatedEvent = { ...event, status: 'Selesai' };
                                  handleEditEvent(updatedEvent);
                                },
                                color: 'hover:bg-green-50 hover:text-green-700'
                              },
                              {
                                value: 'delete',
                                label: 'Hapus Event',
                                icon: <IconTrash size={16} />,
                                action: () => handleDeleteEvent(event.id),
                                color: 'hover:bg-red-50 hover:text-red-700'
                              }
                            ] : []),
                            ...(event.status === 'Selesai' ? [
                              {
                                value: 'view',
                                label: 'Lihat Detail',
                                icon: <IconEdit size={16} />,
                                action: () => handleEditEvent(event),
                                color: 'hover:bg-blue-50 hover:text-blue-700'
                              },
                              {
                                value: 'reactivate',
                                label: 'Aktifkan Lagi',
                                icon: <IconCheck size={16} />,
                                action: () => {
                                  const updatedEvent = { ...event, status: 'Aktif' };
                                  handleEditEvent(updatedEvent);
                                },
                                color: 'hover:bg-green-50 hover:text-green-700'
                              }
                            ] : [])
                          ]}
                          className="w-auto"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Tidak ada event yang ditemukan. Silakan tambahkan event baru atau ubah filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="mt-4 mb-4 px-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Menampilkan {events.length > 0 ? '1' : '0'}-{events.length} dari {events.length} event
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Sebelumnya</button>
            <button className="px-3 py-1 border rounded bg-blue-600 text-white">1</button>
            <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 transition-colors">Selanjutnya</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventTahunanTab;
