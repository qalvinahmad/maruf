import {
    IconCalendar,
    IconClock,
    IconMapPin,
    IconRefresh,
    IconSearch,
    IconSparkles,
    IconUser,
    IconUsers,
    IconX
} from '@tabler/icons-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useHijriCalendar } from '../../utils/hijriCalendar';

// Custom hook for accessibility
const useAccessibility = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  
  useEffect(() => {
    // Check for user preferences
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    setIsHighContrast(highContrast);
  }, []);

  return { isHighContrast, fontSize, setFontSize };
};

// Loading skeleton component
const EventSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 animate-pulse">
    <div className="lg:flex lg:min-h-[280px]">
      <div className="lg:w-2/5 h-64 lg:h-auto bg-slate-200"></div>
      <div className="lg:w-3/5 p-8 lg:p-10 space-y-4">
        <div className="h-8 bg-slate-200 rounded-lg w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        <div className="flex justify-between items-center pt-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-3 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
          <div className="h-12 bg-slate-200 rounded-2xl w-32"></div>
        </div>
      </div>
    </div>
  </div>
);

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use Hijri calendar hook
  const { currentHijriDate } = useHijriCalendar();
  
  // Accessibility hooks
  const { isHighContrast, fontSize } = useAccessibility();
  const shouldReduceMotion = useReducedMotion();
  const searchInputRef = useRef(null);

  const hijriMonths = [
    'Muharram', 'Safar', 'Rabiul Awwal', 'Rabiul Akhir',
    'Jumadil Ula', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
    'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah'
  ];

  // Enhanced animation variants with reduced motion support
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 30,
      scale: shouldReduceMotion ? 1 : 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: shouldReduceMotion ? "tween" : "spring",
        stiffness: 200,
        damping: 25,
        duration: shouldReduceMotion ? 0.2 : undefined
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 20,
      scale: shouldReduceMotion ? 1 : 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: shouldReduceMotion ? "tween" : "spring",
        stiffness: 200,
        damping: 25,
        duration: shouldReduceMotion ? 0.2 : undefined
      }
    },
    hover: shouldReduceMotion ? {} : {
      y: -4,
      scale: 1.01,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Enhanced date formatting functions
  const formatDate = useCallback((dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Tanggal tidak tersedia';
    }
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }, []);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return 'Waktu belum ditentukan';
    return timeString.substring(0, 5) + ' WIB';
  }, []);

  // Enhanced fetch function with retry logic
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: eventData, error } = await supabase
        .from('events')
        .select('*')
        .in('type', ['Acara', 'Program'])
        .in('status', ['Aktif', 'Dijadwalkan'])
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(eventData || []);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Gagal memuat event. Silakan coba lagi.');
      
      // Auto retry with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchEvents();
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Enhanced color system with accessibility support
  const getEventStyle = useCallback((type) => {
    const baseStyles = {
      'ACARA': {
        gradient: isHighContrast 
          ? 'from-purple-700 via-purple-800 to-indigo-800' 
          : 'from-violet-500 via-purple-500 to-indigo-600',
        gradientHover: isHighContrast 
          ? 'from-purple-800 via-purple-900 to-indigo-900'
          : 'from-violet-600 via-purple-600 to-indigo-700',
        badge: isHighContrast 
          ? 'bg-purple-100 text-purple-900 border-purple-300'
          : 'bg-violet-50 text-violet-700 border-violet-200',
        icon: isHighContrast ? 'text-purple-800' : 'text-violet-600',
        button: isHighContrast 
          ? 'bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900'
          : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700',
        shadow: isHighContrast ? 'shadow-purple-600/30' : 'shadow-violet-500/20'
      },
      'PROGRAM': {
        gradient: isHighContrast 
          ? 'from-blue-700 via-cyan-700 to-teal-800'
          : 'from-blue-500 via-cyan-500 to-teal-600',
        gradientHover: isHighContrast 
          ? 'from-blue-800 via-cyan-800 to-teal-900'
          : 'from-blue-600 via-cyan-600 to-teal-700',
        badge: isHighContrast 
          ? 'bg-blue-100 text-blue-900 border-blue-300'
          : 'bg-blue-50 text-blue-700 border-blue-200',
        icon: isHighContrast ? 'text-blue-800' : 'text-blue-600',
        button: isHighContrast 
          ? 'bg-gradient-to-r from-blue-700 to-teal-800 hover:from-blue-800 hover:to-teal-900'
          : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
        shadow: isHighContrast ? 'shadow-blue-600/30' : 'shadow-blue-500/20'
      }
    };

    return baseStyles[type.toUpperCase()] || baseStyles['PROGRAM'];
  }, [isHighContrast]);

  // Enhanced filtering and sorting
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.speaker?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(event => 
        event.type?.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'title':
          return a.title?.localeCompare(b.title) || 0;
        case 'type':
          return a.type?.localeCompare(b.type) || 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, filterType, sortBy]);

  // Helper function to get event status info
  const getEventStatusInfo = useCallback((event) => {
    const eventDate = new Date(event.date);
    const currentDate = new Date();
    const status = event.status?.toLowerCase();
    
    // Determine if event is actionable based on status and date
    const isActionable = status === 'aktif' || status === 'dijadwalkan';
    const isCompleted = status === 'selesai';
    const isSystemEvent = event.type?.toLowerCase() === 'sistem' || event.type?.toLowerCase() === 'fitur';
    
    let statusText = '';
    let statusColor = '';
    let buttonText = '';
    let buttonDisabled = false;
    
    switch (status) {
      case 'aktif':
        statusText = '🎯 Aktif';
        statusColor = 'bg-green-50 text-green-700 border border-green-200';
        buttonText = isSystemEvent ? 'Lihat Detail' : 'Mulai Event';
        buttonDisabled = false;
        break;
      case 'dijadwalkan':
        statusText = '📅 Dijadwalkan';
        statusColor = 'bg-blue-50 text-blue-700 border border-blue-200';
        buttonText = 'Daftar Sekarang';
        buttonDisabled = false;
        break;
      case 'selesai':
        statusText = '✅ Selesai';
        statusColor = 'bg-gray-50 text-gray-700 border border-gray-200';
        buttonText = 'Lihat Recap';
        buttonDisabled = true;
        break;
      default:
        statusText = '❓ Status Tidak Diketahui';
        statusColor = 'bg-gray-50 text-gray-700 border border-gray-200';
        buttonText = 'Lihat Detail';
        buttonDisabled = true;
    }
    
    return {
      isActionable,
      isCompleted,
      isSystemEvent,
      statusText,
      statusColor,
      buttonText,
      buttonDisabled
    };
  }, []);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  // Handle event action based on type and status
  const handleEventAction = useCallback((event) => {
    const statusInfo = getEventStatusInfo(event);
    
    if (statusInfo.buttonDisabled) {
      return; // Don't do anything for disabled buttons
    }
    
    if (statusInfo.isSystemEvent) {
      // For system events, just show an alert or modal
      alert(`${event.title}\n\n${event.description}`);
    } else {
      // For regular events, navigate to event page
      window.location.href = `/dashboard/event/${event.id}`;
    }
  }, [getEventStatusInfo]);

  // Loading state with better UX
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[60vh] space-y-8 max-w-6xl mx-auto px-4 py-8"
      >
        <div className="text-center space-y-6 mb-8">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-700">Memuat Event</h3>
            <p className="text-sm text-slate-500">Sedang mengambil data event terbaru...</p>
          </div>
        </div>
        
        {/* Loading skeletons */}
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <EventSkeleton key={i} />
          ))}
        </div>
      </motion.div>
    );
  }
  
  // Enhanced error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[40vh] flex items-center justify-center px-4"
      >
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-md mx-auto shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconX className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-3">Oops! Terjadi Kesalahan</h3>
          <p className="text-red-600 text-sm mb-6 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={fetchEvents}
              className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Coba muat ulang event"
            >
              <IconRefresh className="w-4 h-4 inline mr-2" />
              Coba Lagi
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-slate-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-8 max-w-6xl mx-auto px-4 py-8 ${fontSize === 'large' ? 'text-lg' : ''}`}
    >
      {/* Enhanced Date Header with better accessibility */}
    <motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  className={`max-w-3xl mx-auto px-6 py-12 ${fontSize === 'large' ? 'text-base' : 'text-sm'}`}
>
  <motion.header
    variants={cardVariants}
    className="relative rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-2xl p-8"
    role="banner"
    aria-labelledby="date-header"
  >
    {/* Glow subtle */}
    <div className="absolute inset-0 rounded-3xl bg-white/10 blur-lg pointer-events-none"></div>

    <div className="relative flex items-center justify-between mb-6">
      <div>
        <h1
          id="date-header"
          className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md leading-tight"
        >
          Hari Ini
        </h1>
      </div>
      <motion.div
        whileHover={{ rotate: 20, scale: 1.25 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-14 h-14 sm:w-16 sm:h-16 bg-white/30 rounded-3xl flex items-center justify-center shadow-lg backdrop-blur-sm cursor-pointer"
        aria-hidden="true"
      >
        <IconCalendar className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
      </motion.div>
    </div>

    {/* Card with both dates */}
    <motion.div
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: 1.07,
              boxShadow: "0 20px 40px rgba(255, 255, 255, 0.5)",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            }
      }
      transition={{ type: "spring", stiffness: 260 }}
      tabIndex={0}
      role="region"
      aria-label="Tanggal Masehi dan Hijriyah"
      className="rounded-2xl bg-white/10 p-8 text-white cursor-pointer select-none"
    >
      <div className="text-xl sm:text-2xl font-bold leading-snug drop-shadow-md mb-4">
        {formatDate(new Date())}
      </div>

      <hr className="border-white/30 mb-4" />

      <div className="text-lg sm:text-xl font-semibold tracking-wide text-cyan-200 drop-shadow-sm">
        {currentHijriDate || 'Memuat tanggal Hijriyah...'}
      </div>
    </motion.div>
  </motion.header>
</motion.div>



      {/* Events List with Enhanced Accessibility */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
        role="main"
        aria-label="Daftar event"
      >
        <AnimatePresence mode="popLayout">
          {filteredAndSortedEvents.length === 0 && !loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16 bg-white rounded-3xl shadow-lg"
              role="status"
              aria-live="polite"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <IconSearch className="w-10 h-10 text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Tidak Ada Event Ditemukan</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {searchTerm 
                  ? `Tidak ada event yang cocok dengan pencarian "${searchTerm}". Coba kata kunci lain atau hapus filter.`
                  : 'Belum ada event yang tersedia saat ini. Silakan cek kembali nanti.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    searchInputRef.current?.focus();
                  }}
                  className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Reset Pencarian
                </button>
              )}
            </motion.div>
          ) : (
            filteredAndSortedEvents.map((event, index) => {
              const eventStyle = getEventStyle(event.type);
              const statusInfo = getEventStatusInfo(event);

              return (
                <motion.article
                  key={event.id}
                  variants={itemVariants}
                  whileHover={cardVariants.hover}
                  layout
                  className={`group bg-white rounded-3xl shadow-xl hover:shadow-2xl ${eventStyle.shadow} transition-all duration-500 overflow-hidden border border-slate-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
                    statusInfo.isCompleted ? 'opacity-75' : ''
                  }`}
                  role="article"
                  aria-labelledby={`event-title-${event.id}`}
                  tabIndex="0"
                  onKeyDown={(e) => handleKeyDown(e, () => {
                    console.log('Event selected:', event.title);
                  })}
                >
                  {/* Event Card - Enhanced Layout */}
                  <div className="lg:flex lg:min-h-[300px]">
                    
                    {/* Left Side - Event Visual Header */}
                    <div className={`lg:w-2/5 h-64 lg:h-auto relative overflow-hidden bg-gradient-to-br ${eventStyle.gradient} group-hover:${eventStyle.gradientHover} transition-all duration-500 ${
                      statusInfo.isCompleted ? 'opacity-80' : ''
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                      
                      {/* Enhanced Badges */}
                      <div className="absolute top-6 left-6 flex flex-wrap gap-3">
                        <span 
                          className={`px-4 py-2 rounded-full text-sm font-bold border backdrop-blur-sm ${eventStyle.badge}`}
                          role="badge"
                          aria-label={`Tipe event: ${event.type}`}
                        >
                          {event.type}
                        </span>
                        <span 
                          className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${statusInfo.statusColor}`}
                          role="badge"
                          aria-label={`Status: ${statusInfo.statusText}`}
                        >
                          {statusInfo.statusText}
                        </span>
                      </div>

                      {/* Enhanced Date & Time Info */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex flex-wrap gap-3">
                          <div 
                            className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl text-white"
                            role="group"
                            aria-label={`Tanggal event: ${formatDate(event.date)}`}
                          >
                            <IconCalendar size={18} aria-hidden="true" />
                            <span className="font-semibold text-sm">{formatDate(event.date)}</span>
                          </div>
                          <div 
                            className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl text-white"
                            role="group"
                            aria-label={`Waktu event: ${formatTime(event.time)}`}
                          >
                            <IconClock size={18} aria-hidden="true" />
                            <span className="font-semibold text-sm">{formatTime(event.time)}</span>
                          </div>
                        </div>
                        
                        {/* Additional Info */}
                        {(event.location || event.capacity) && (
                          <div className="flex flex-wrap gap-3 mt-3">
                            {event.location && (
                              <div 
                                className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl text-white"
                                role="group"
                                aria-label={`Lokasi: ${event.location}`}
                              >
                                <IconMapPin size={16} aria-hidden="true" />
                                <span className="font-medium text-xs">{event.location}</span>
                              </div>
                            )}
                            {event.capacity && (
                              <div 
                                className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl text-white"
                                role="group"
                                aria-label={`Kapasitas: ${event.capacity} peserta`}
                              >
                                <IconUsers size={16} aria-hidden="true" />
                                <span className="font-medium text-xs">{event.capacity}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Event Content */}
                    <div className="lg:w-3/5 p-8 lg:p-10 flex flex-col justify-between">
                      
                      {/* Event Title & Description */}
                      <div className="space-y-4 mb-6">
                        <h3 
                          id={`event-title-${event.id}`}
                          className="font-bold text-2xl lg:text-3xl text-slate-900 leading-tight group-hover:text-slate-800 transition-colors"
                        >
                          {event.title}
                        </h3>
                        <p className="text-slate-600 text-base lg:text-lg leading-relaxed">
                          {event.description || 'Bergabunglah dengan kami dalam event menarik ini. Dapatkan pengalaman dan wawasan baru yang bermanfaat untuk pengembangan diri Anda.'}
                        </p>
                        
                        {/* Event Tags */}
                        {event.tags && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {event.tags.split(',').map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium"
                                role="tag"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Enhanced Speaker & CTA Section */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <div 
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${eventStyle.button}`}
                            role="img"
                            aria-label="Avatar pembicara"
                          >
                            <IconUser size={22} aria-hidden="true" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-lg">
                              {event.speaker || 'Pembicara Ahli'}
                            </div>
                            <div className="text-slate-500 text-sm">
                              {event.speaker_title || 'Pakar di bidangnya'}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced CTA Button */}
                        <button
                          onClick={() => handleEventAction(event)}
                          className={`px-8 py-4 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl flex items-center gap-3 transition-all duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            statusInfo.buttonDisabled 
                              ? 'bg-gray-400 cursor-not-allowed opacity-60 focus:ring-gray-400' 
                              : `${eventStyle.button} focus:ring-blue-500`
                          }`}
                          disabled={statusInfo.buttonDisabled}
                          aria-label={`${statusInfo.buttonText} untuk event ${event.title}`}
                          onKeyDown={(e) => handleKeyDown(e, () => {
                            handleEventAction(event);
                          })}
                        >
                          <IconSparkles size={20} aria-hidden="true" />
                          <span className="hidden sm:inline">
                            {statusInfo.buttonText}
                          </span>
                          <span className="sm:hidden">
                            {statusInfo.isSystemEvent ? 'Detail' : 
                             statusInfo.buttonDisabled ? 'Selesai' : 'Aksi'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })
          )}
        </AnimatePresence>
      </motion.section>

      {/* Results Summary */}
      {filteredAndSortedEvents.length > 0 && (
        <motion.div
          variants={cardVariants}
          className="text-center py-6"
          role="status"
          aria-live="polite"
        >
          <p className="text-slate-600">
            Menampilkan {filteredAndSortedEvents.length} dari {events.length} event
            {searchTerm && ` untuk "${searchTerm}"`}
            {filterType !== 'all' && ` dalam kategori ${filterType}`}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Events;

