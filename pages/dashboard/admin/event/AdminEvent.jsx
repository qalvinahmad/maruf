import { IconActivity, IconBook, IconCalendarEvent, IconChartBar, IconChevronDown, IconChevronUp, IconDatabase, IconList, IconSearch, IconSettings, IconUserCheck } from '@tabler/icons-react';
import { eachMonthOfInterval, endOfYear, format, startOfYear } from 'date-fns';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminHeader from '../../../../components/admin/adminHeader';
import EventTahunanTab from '../../../../components/admin/tabs/EventTahunanTab';
import PengumumanTab from '../../../../components/admin/tabs/PengumumanTab';
import { FloatingDock } from '../../../../components/ui/floating-dock';
import AdminDropdown from '../../../../components/widget/AdminDropdown';
import { getCachedData, setCachedData } from '../../../../lib/clientSafeCache';
import { supabase } from '../../../../lib/supabaseClient';

const getMonthName = (monthNumber) => {
  return new Date(2024, monthNumber - 1).toLocaleString('id-ID', { month: 'long' });
};

const AdminEvent = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(true);
  const [rawEvents, setRawEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    id: null,
    title: '',
    type: 'Acara',
    description: '',
    date: '',
    status: 'Aktif'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false); // Default tertutup

  // Pindahkan deklarasi state filter ke atas
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarEvents, setCalendarEvents] = useState({});
  const [dailyAgenda, setDailyAgenda] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAgenda, setShowAgenda] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // Tab state for events/announcements/challenges
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Statistics state
  const [statistics, setStatistics] = useState({
    totalEvents: 0,
    totalAnnouncements: 0,
    totalChallenges: 0,
    totalRegistrations: 0,
    totalTests: 0,
    avgScore: 0,
    activeRewards: 0
  });
  
  // Custom Filter Dropdown Component with animations
  const FilterDropdown = ({ label, options, value, onChange, buttonText }) => {
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

    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="relative min-w-[180px]">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <motion.div animate={open ? "open" : "closed"} className="relative">
          <button
            onClick={() => setOpen((pv) => !pv)}
            className="flex items-center justify-between w-full gap-2 px-3 py-2 rounded-md text-slate-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-sm">
              {selectedOption ? selectedOption.label : buttonText}
            </span>
            <motion.span variants={iconVariants}>
              <IconChevronDown size={16} />
            </motion.span>
          </button>

          <motion.ul
            initial={wrapperVariants.closed}
            variants={wrapperVariants}
            style={{ originY: "top", translateX: "0" }}
            className="flex flex-col gap-1 p-2 rounded-lg bg-white shadow-xl absolute top-[105%] left-0 w-full z-50 overflow-hidden border border-gray-200"
          >
            {options.map((option, index) => (
              <motion.li
                key={`${option.value}-${index}`}
                variants={itemVariants}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md hover:bg-indigo-100 transition-colors cursor-pointer ${
                  value === option.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:text-indigo-500'
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

  // Custom Calendar Header Dropdown
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
  const AdminMenuCard = ({ icon, title, description, bgColor, onClick, isActive = false }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        scale: 1.02
      }}
      whileTap={{ scale: 0.98 }}
      className={`${bgColor} p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border group ${
        isActive ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-100/50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">{description}</p>
    </motion.div>
  );

  // Simplified Redis caching for events only
  const CACHE_KEYS = {
    EVENTS: 'admin_events_data',
    STATISTICS: 'admin_event_statistics', 
    CALENDAR_EVENTS: 'admin_calendar_events',
    USER_PROFILE: 'admin_user_profile'
  };

  const CACHE_DURATIONS = {
    EVENTS: 300, // 5 minutes
    STATISTICS: 180, // 3 minutes
    CALENDAR_EVENTS: 900, // 15 minutes
    USER_PROFILE: 1800 // 30 minutes
  };

  // Clear cache helper function with specific key targeting
  const clearCache = async (keys) => {
    try {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      for (const key of keysArray) {
        await setCachedData(key, null);
      }
      console.log('Cache cleared for keys:', keysArray);
    } catch (error) {
      console.log('Cache clear error:', error.message);
    }
  };

  // Simplified cache management for events only
  const invalidateRelatedCaches = async (dataType) => {
    const cacheMap = {
      'events': [CACHE_KEYS.EVENTS, CACHE_KEYS.STATISTICS, CACHE_KEYS.CALENDAR_EVENTS],
      'all': [CACHE_KEYS.EVENTS, CACHE_KEYS.STATISTICS, CACHE_KEYS.CALENDAR_EVENTS, CACHE_KEYS.USER_PROFILE]
    };
    
    await clearCache(cacheMap[dataType] || []);
  };

  // Simplified filter function for events only
  const getFilteredEvents = (data) => {
    return data.filter(event => {
      // Exclude "Fitur" type from all displays as requested
      if (event.type === 'Fitur') {
        return false;
      }
      
      // Filter by active tab
      const isAnnouncement = event.type === 'Pengumuman' || event.type === 'Sistem';
      const isChallenge = event.type === 'Tantangan';
      let tabMatch = false;
      
      if (activeTab === 'events') {
        tabMatch = !isAnnouncement && !isChallenge;
      } else if (activeTab === 'announcements') {
        tabMatch = isAnnouncement;
      }
      
      const matchesType = typeFilter === 'all' || event.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return tabMatch && matchesType && matchesStatus && matchesSearch;
    });
  };
  
  // Enhanced fetch function with comprehensive Redis caching
  const fetchEvents = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      // Try to get cached data from Redis first
      if (!forceRefresh) {
        let cachedEvents = await getCachedData(CACHE_KEYS.EVENTS);
        
        if (cachedEvents) {
          console.log('Loading events from Redis cache');
          setRawEvents(cachedEvents);
          setEvents(getFilteredEvents(cachedEvents));
          processEventsForCalendar(cachedEvents);
          setIsLoading(false);
          return;
        }
      }
      
      console.log('Fetching events from database');
      // Fetch from database with additional metadata
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          created_at,
          updated_at
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const eventsData = data || [];
      
      // Cache in Redis with appropriate duration
      await setCachedData(CACHE_KEYS.EVENTS, eventsData, CACHE_DURATIONS.EVENTS);
      console.log('Events cached in Redis for', CACHE_DURATIONS.EVENTS, 'seconds');
      
      setRawEvents(eventsData);
      setEvents(getFilteredEvents(eventsData));
      processEventsForCalendar(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Error fetching events: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced statistics fetching with Redis caching
  const fetchStatistics = async (forceRefresh = false) => {
    try {
      // Try cache first
      if (!forceRefresh) {
        let cachedStats = await getCachedData(CACHE_KEYS.STATISTICS);
        
        if (cachedStats) {
          console.log('Loading statistics from Redis cache');
          setStatistics(cachedStats);
          return;
        }
      }

      console.log('Fetching statistics from database');
      // Fetch data from multiple tables in parallel
      const [
        eventsResult,
        registrationsResult,
        testsResult,
        testDetailsResult,
        rewardsResult
      ] = await Promise.all([
        supabase.from('events').select('id, type'),
        supabase.from('event_registrations').select('id, registration_status'),
        supabase.from('event_pronunciation_tests').select('id'),
        supabase.from('event_test_details').select('score').not('score', 'is', null),
        supabase.from('event_rewards').select('id')
      ]);

      const events = eventsResult.data || [];
      const registrations = registrationsResult.data || [];
      const tests = testsResult.data || [];
      const testDetails = testDetailsResult.data || [];
      const rewards = rewardsResult.data || [];

      // Calculate statistics - exclude "Fitur" type
      const stats = {
        totalEvents: events.filter(e => e.type !== 'Pengumuman' && e.type !== 'Sistem' && e.type !== 'Tantangan' && e.type !== 'Fitur').length,
        totalAnnouncements: events.filter(e => e.type === 'Pengumuman' || e.type === 'Sistem').length,
        totalChallenges: events.filter(e => e.type === 'Tantangan').length,
        totalRegistrations: registrations.filter(r => r.registration_status === 'confirmed').length,
        totalTests: tests.length,
        avgScore: testDetails.length > 0 ? Math.round(testDetails.reduce((sum, t) => sum + t.score, 0) / testDetails.length) : 0,
        activeRewards: rewards.length
      };

      // Cache with shorter duration for frequently changing data
      await setCachedData(CACHE_KEYS.STATISTICS, stats, CACHE_DURATIONS.STATISTICS);
      console.log('Statistics cached in Redis for', CACHE_DURATIONS.STATISTICS, 'seconds');
      setStatistics(stats);

    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };
  
  // Modified fetchEvents function to store raw data
  const fetchEventsData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setRawEvents(data || []);
      // Apply filters to set filtered events
      setEvents(getFilteredEvents(data || []));
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching events');
    } finally {
      setIsLoading(false);
    }
  };

  // Update auth check with user profile caching
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace('/authentication/admin/loginAdmin');
          return;
        }

        // Try to get user profile from cache first
        let cachedProfile = await getCachedData(CACHE_KEYS.USER_PROFILE);
        
        if (cachedProfile && cachedProfile.email === session.user.email) {
          console.log('Loading user profile from Redis cache');
          setUserName(cachedProfile.full_name || 'Admin');
          setIsLoading(false);
          
          // Load data in parallel
          await Promise.all([
            fetchEvents(),
            fetchStatistics()
          ]);
          return;
        }

        // Check if user is admin - update query to use email
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        console.log('Admin check:', { adminData, adminError }); // Debug log

        if (adminError || !adminData) {
          // Not an admin, redirect to login
          await supabase.auth.signOut();
          router.replace('/authentication/admin/loginAdmin');
          return;
        }

        // Verify admin role
        if (!adminData.role || !['admin', 'superadmin'].includes(adminData.role)) {
          await supabase.auth.signOut();
          router.replace('/authentication/admin/loginAdmin');
          return;
        }

        // Cache admin profile
        await setCachedData(CACHE_KEYS.USER_PROFILE, adminData, CACHE_DURATIONS.USER_PROFILE);
        console.log('User profile cached in Redis for', CACHE_DURATIONS.USER_PROFILE, 'seconds');

        // Set admin data
        setUserName(adminData.full_name || 'Admin');
        setIsLoading(false);

        // Load data in parallel for better performance
        await Promise.all([
          fetchEvents(),
          fetchStatistics()
        ]);

      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/authentication/admin/loginAdmin');
      }
    };

    checkAdminAuth();
  }, [router]);

  // Simple toast notification functions
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Calendar manual control (removed auto-expand)
  // useEffect(() => {
  //   // Auto-expand calendar when events tab is active and has events
  //   if (activeTab === 'events' && events.length > 0 && !isCalendarExpanded) {
  //     const timer = setTimeout(() => {
  //       setIsCalendarExpanded(true);
  //     }, 1000); // Delay 1 second after loading
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [activeTab, events.length]);

  // Effect untuk filter yang tidak menyebabkan infinite loop
  useEffect(() => {
    if (rawEvents.length > 0) {
      setEvents(getFilteredEvents(rawEvents));
    }
  }, [typeFilter, statusFilter, searchTerm, rawEvents, activeTab]);
  
  // Handle real-time updates
  const handleRealTimeUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      setEvents(current => [payload.new, ...current]);
    } else if (payload.eventType === 'DELETE') {
      setEvents(current => current.filter(event => event.id !== payload.old.id));
    } else if (payload.eventType === 'UPDATE') {
      setEvents(current => 
        current.map(event => 
          event.id === payload.new.id ? payload.new : event
        )
      );
    }
  };

  // Create new event
  const createEvent = async (eventData) => {
    try {
      const { error } = await supabase
        .from('events')
        .insert([{
          title: eventData.title,
          type: eventData.type,
          description: eventData.description,
          date: eventData.date,
          status: eventData.status
        }]);

      if (error) throw error;
      
      // Invalidate cache and refresh data
      await invalidateRelatedCaches('events');
      fetchEvents();
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating event');
    }
  };

  // Update event
  const updateEvent = async (id, eventData) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          type: eventData.type,
          description: eventData.description,
          date: eventData.date,
          status: eventData.status,
          updated_at: new Date()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Invalidate cache and refresh data
      await invalidateRelatedCaches('events');
      fetchEvents();
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating event');
    }
  };

  // Delete event
  const deleteEvent = async (id) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Invalidate cache and refresh data
      await invalidateRelatedCaches('events');
      fetchEvents();
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting event');
    }
  };

  // Enhanced handleSaveEvent with cache invalidation and toast notifications
  const handleSaveEvent = async () => {
    try {
      // Validation
      if (!currentEvent.title.trim()) {
        showToast('Judul event tidak boleh kosong!', 'error');
        return;
      }
      
      if (!currentEvent.date) {
        showToast('Tanggal event harus diisi!', 'error');
        return;
      }

      // Validate date is not in the past for new events
      if (!isEditing) {
        const selectedDate = new Date(currentEvent.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          showToast('Tanggal event tidak boleh di masa lalu!', 'error');
          return;
        }
      }

      if (isEditing) {
        // Optimistic update for edit
        setEvents(current =>
          current.map(event =>
            event.id === currentEvent.id ? currentEvent : event
          )
        );
        await updateEvent(currentEvent.id, currentEvent);
        showToast('Event berhasil diperbarui!', 'success');
      } else {
        // Optimistic update for create
        const newEvent = {
          ...currentEvent,
          id: Date.now(), // Temporary ID
          created_at: new Date().toISOString()
        };
        setEvents(current => [newEvent, ...current]);
        await createEvent(currentEvent);
        showToast('Event berhasil ditambahkan!', 'success');
      }
      
      // Invalidate related caches after successful save
      await invalidateRelatedCaches('events');
      
      setShowModal(false);
      
      // Refresh data to ensure consistency
      await Promise.all([
        fetchEvents(true),
        fetchStatistics(true)
      ]);
    } catch (error) {
      console.error('Error saving event:', error);
      showToast('Gagal menyimpan event. Silakan coba lagi.', 'error');
      // Revert optimistic update on error
      fetchEvents(true);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.href = '/authentication/admin/loginAdmin';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleAddEvent = () => {
    setIsEditing(false);
    setCurrentEvent({
      id: events.length + 1,
      title: '',
      type: 'Acara',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      speaker: '',
      speaker_title: '',
      status: 'Aktif'
    });
    setShowModal(true);
  };
  
  const handleEditEvent = (event) => {
    setIsEditing(true);
    setCurrentEvent(event);
    setShowModal(true);
  };
  
  // Enhanced handleDeleteEvent with cache invalidation and toast notifications
  const handleDeleteEvent = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      try {
        // Optimistic delete
        setEvents(current => current.filter(event => event.id !== id));
        await deleteEvent(id);
        
        // Invalidate related caches after successful delete
        await invalidateRelatedCaches('events');
        
        showToast('Event berhasil dihapus!', 'success');
        
        // Refresh data to ensure consistency
        await Promise.all([
          fetchEvents(true),
          fetchStatistics(true)
        ]);
      } catch (error) {
        console.error('Error deleting event:', error);
        showToast('Gagal menghapus event. Silakan coba lagi.', 'error');
        // Revert optimistic delete on error
        fetchEvents(true);
      }
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent({
      ...currentEvent,
      [name]: value
    });
  };
  
   const dockItems = [
    // { 
    //   title: "Dashboard", 
    //   icon: <IconHome />, 
    //   onClick: () => router.push('/dashboard/Dashboard')
    // },
    // { 
    //   title: "Huruf", 
    //   icon: <IconLetterA />, 
    //   onClick: () => router.push('/dashboard/DashboardHuruf')
    // },
    // { 
    //   title: "Belajar & Roadmap", 
    //   icon: <IconBook />, 
    //   onClick: () => router.push('/dashboard/DashboardBelajar')
    // },
    // { 
    //   title: "Informasi", 
    //   icon: <IconInfoCircle />, 
    //   onClick: () => router.push('/dashboard/DashboardInformasi')
    // },
    { 
      title: "Statistik", 
      icon: <IconChartBar />, 
      onClick: () => router.push('/dashboard/admin/statistic/DashboardStatsAdmin')
    },
    { 
      title: "Aktivitas", 
      icon: <IconActivity />, 
      onClick: () => router.push('/dashboard/admin/activity/DashboardActivity')
    },
    // { 
    //   title: "Pengumuman", 
    //   icon: <IconBell />, 
    //   onClick: () => router.push('/dashboard/Dashboard#announcement')
    // },
    { 
      title: "Admin Panel", 
      icon: <IconList />, 
      onClick: () => router.push('/dashboard/admin/project/DashboardProjects')
    },
    { 
      title: "Pengaturan", 
      icon: <IconSettings />, 
      onClick: () => router.push('/dashboard/admin/setting/DashboardSettingsAdmin')
    },
    // { 
    //   title: "Logout", 
    //   icon: <IconLogout />, 
    //   onClick: handleLogout 
    // },
  ];
  

  // Simplified function to process events data for calendar
  const processEventsForCalendar = (eventsData = []) => {
    const eventsByMonth = {};
    const dailyAgenda = {};
    
    // Process events only - removed announcements and challenges dependencies
    eventsData.forEach(event => {
      const eventDate = new Date(event.date);
      const monthKey = format(eventDate, 'MM-yyyy');
      const dateKey = format(eventDate, 'yyyy-MM-dd');
      
      // Group by month for calendar display
      if (!eventsByMonth[monthKey]) {
        eventsByMonth[monthKey] = [];
      }
      eventsByMonth[monthKey].push({
        ...event,
        type: event.type || 'event',
        priority: event.priority || 'medium'
      });

      // Group by date for daily agenda
      if (!dailyAgenda[dateKey]) {
        dailyAgenda[dateKey] = [];
      }
      dailyAgenda[dateKey].push({
        id: event.id,
        title: event.title,
        type: event.type || 'event',
        priority: event.priority || 'medium',
        location: event.location || 'TBA',
        time: event.time || '00:00',
        description: event.description || ''
      });
    });
    
    setCalendarEvents(eventsByMonth);
    setDailyAgenda(dailyAgenda);
  };

  // Add this before the return statement
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

  useEffect(() => {
    if (rawEvents.length > 0) {
      setEvents(getFilteredEvents(rawEvents));
    }
  }, [typeFilter, statusFilter, searchTerm]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Restore scroll
    };
  }, [showModal]);

  // Filter options - removed "Fitur" type for annual events
  const filterOptions = {
    type: [
      { value: 'all', label: 'Semua Tipe' },
      { value: 'Kegiatan', label: 'Kegiatan' },
      { value: 'Pengumuman', label: 'Pengumuman' },
      { value: 'Sistem', label: 'Sistem' },
      { value: 'Tantangan', label: 'Tantangan Harian' },
      { value: 'Maintenance', label: 'Maintenance' },
      { value: 'Update', label: 'Update Sistem' }
      // Removed "Fitur" type as requested
    ],
    status: [
      { value: 'all', label: 'Semua Status' },
      { value: 'Aktif', label: 'Aktif' },
      { value: 'Dijadwalkan', label: 'Dijadwalkan' },
      { value: 'Selesai', label: 'Selesai' },
      { value: 'Dibatalkan', label: 'Dibatalkan' }
    ],
    year: Array.from({ length: 5 }, (_, i) => {
      const year = new Date().getFullYear() - 2 + i;
      return { value: year, label: year.toString() };
    })
  };

  // Updated renderFilters with custom dropdown components
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

  // Enhanced calendar header with auto-expand functionality
  const renderCalendarHeader = () => (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Kalender Event</h2>
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

  // Enhanced dropdown component for event form
  const EventFormDropdown = ({ label, value, options, onChange, placeholder }) => {
    const [open, setOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
        <motion.div animate={open ? "open" : "closed"} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-sm text-gray-900">
              {selectedOption ? selectedOption.label : placeholder || 'Pilih...'}
            </span>
            <motion.span
              variants={{
                open: { rotate: 180 },
                closed: { rotate: 0 }
              }}
              transition={{ duration: 0.2 }}
            >
              <IconChevronDown size={16} />
            </motion.span>
          </button>

          <motion.ul
            initial={{ scaleY: 0, opacity: 0 }}
            variants={{
              open: {
                scaleY: 1,
                opacity: 1,
                transition: {
                  when: "beforeChildren",
                  staggerChildren: 0.05,
                },
              },
              closed: {
                scaleY: 0,
                opacity: 0,
                transition: {
                  when: "afterChildren",
                  staggerChildren: 0.05,
                },
              },
            }}
            style={{ originY: "top" }}
            className="flex flex-col gap-1 p-2 rounded-lg bg-white shadow-xl border absolute top-full left-0 w-full mt-1 z-10 max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <motion.li
                key={option.value}
                variants={{
                  open: {
                    opacity: 1,
                    y: 0,
                  },
                  closed: {
                    opacity: 0,
                    y: -15,
                  },
                }}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full p-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors cursor-pointer ${
                  value === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <span>{option.label}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    );
  };

  // Update event modal type selector
  const renderEventTypeSelect = () => (
    <EventFormDropdown
      label="Tipe"
      value={currentEvent.type}
      options={filterOptions.type.filter(opt => opt.value !== 'all')}
      onChange={(value) => handleInputChange({ target: { name: 'type', value }})}
      placeholder="Pilih tipe event"
    />
  );

  // Update event modal status selector
  const renderEventStatusSelect = () => (
    <EventFormDropdown
      label="Status"
      value={currentEvent.status}
      options={filterOptions.status.filter(opt => opt.value !== 'all')}
      onChange={(value) => handleInputChange({ target: { name: 'status', value }})}
      placeholder="Pilih status event"
    />
  );





  // Update useEffect to not fetch challenges separately since they're loaded in auth check
  // useEffect(() => {
  //   fetchChallenges();
  // }, [];

  // Manual refresh handler for cache management
  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      
      // Clear all caches
      await invalidateRelatedCaches('all');
      
      // Refresh all data
      await Promise.all([
        fetchEvents(true),
        fetchStatistics(true)
      ]);
      
      console.log('All data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified TabNavigation component - removed challenges tab
  const TabNavigation = () => (
    <div className="mb-6 border-b">
      <div className="flex space-x-4">
        <button
          className={`py-4 px-6 focus:outline-none ${
            activeTab === 'events'
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('events')}
        >
          Event Tahunan
        </button>
        <button
          className={`py-4 px-6 focus:outline-none ${
            activeTab === 'announcements'
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('announcements')}
        >
          Pengumuman
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Kelola Event - Admin Panel</title>
        <meta name="description" content="Kelola event dan pengumuman platform pembelajaran" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Simple Toast Notification */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </motion.div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Admin Header */}
          <AdminHeader 
            user={{
              name: userName,
              level: 10,
              role: 'Administrator',
              accessLevel: 'Full Access'
            }}
            onLogout={handleLogout}
            title="Panel Pengumuman dan kelola konten"
            subtitle="Kelola konten mingguan dan pengumuman untuk menjaga peserta didik tetap terlibat dalam pembelajaran"
          />

          <main className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto px-4 py-4">

            {/* Hero Content Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                background: [
                  "linear-gradient(135deg, #00acee 0%, #38bdf8 50%, #87ceeb 100%)",
                  "linear-gradient(135deg, #0891b2 0%, #00acee 50%, #bae6fd 100%)", 
                  "linear-gradient(135deg, #00acee 0%, #38bdf8 50%, #87ceeb 100%)"
                ]
              }}
              transition={{ 
                delay: 0.5, 
                duration: 0.8,
                background: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="relative min-h-[320px] text-white p-8 rounded-3xl overflow-hidden mb-8"
              style={{
                background: "linear-gradient(135deg, #00acee 0%, #38bdf8 50%, #87ceeb 100%)"
              }}
            >
              {/* Dynamic decorative elements */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.1, 0.15, 0.1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-12 -right-12 w-40 h-40 bg-white rounded-full"
              ></motion.div>
              <motion.div 
                animate={{ 
                  scale: [1, 0.8, 1],
                  x: [0, 20, 0],
                  y: [0, -10, 0],
                  opacity: [0.05, 0.1, 0.05]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-1/4 translate-y-1/4"
              ></motion.div>
              
              {/* Additional floating elements */}
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                  x: [0, 15, 0],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                className="absolute top-1/4 left-1/4 w-20 h-20 bg-white rounded-full"
              ></motion.div>
                {/* Content */}
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1">
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent drop-shadow-lg"
                    >
                      Manajemen Event
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/95 max-w-md text-lg leading-relaxed drop-shadow-sm"
                    >
                      Kelola event pembelajaran dan pengumuman sistem untuk menciptakan pengalaman belajar yang engaging dan terorganisir
                    </motion.p>
                  </div>
                  
                 
                </div>
              </motion.div>

              {/* Menu Admin Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <AdminMenuCard 
                  icon={<IconDatabase className="text-blue-600" size={20} />}
                  title="Analisis Data"
                  description="Analisis penggunaan platform dan rekomendasi perbaikan"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/data/AdminData')}
                  isActive={false}
                />
                <AdminMenuCard 
                  icon={<IconBook className="text-green-600" size={20} />}
                  title="Kelola Konten"
                  description="Kelola materi, modul, dan konten pembelajaran makhrojul huruf"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/content/AdminContent')}
                  isActive={false}
                />
                <AdminMenuCard 
                  icon={<IconCalendarEvent className="text-purple-600" size={20} />}
                  title="Event & Aktivitas"
                  description="Kelola event dan aktivitas khusus pembelajaran"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/event/AdminEvent')}
                  isActive={true}
                />
                <AdminMenuCard 
                  icon={<IconUserCheck className="text-amber-600" size={20} />}
                  title="Verifikasi"
                  description="Verifikasi akun guru dan pengawasan sistem pembelajaran"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/verification/AdminVerif')}
                  isActive={false}
                />
              </div>

            {/* Add TabNavigation */}
            <TabNavigation />

            {/* Conditional rendering based on active tab */}
            {activeTab === 'events' ? (
              <EventTahunanTab
                events={events.filter(event => 
                  event.type === 'Acara' || 
                  event.type === 'Event' || 
                  (event.type !== 'Pengumuman' && event.type !== 'Sistem')
                )}
                statistics={statistics}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleAddEvent={handleAddEvent}
                handleEditEvent={handleEditEvent}
                handleDeleteEvent={handleDeleteEvent}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                isCalendarExpanded={isCalendarExpanded}
                setIsCalendarExpanded={setIsCalendarExpanded}
                calendarEvents={calendarEvents}
                renderCalendarHeader={renderCalendarHeader}
                generateCalendarGrid={generateCalendarGrid}
                getMonthName={getMonthName}
                filterOptions={filterOptions}
                FilterDropdown={FilterDropdown}
                AdminDropdown={AdminDropdown}
              />
            ) : activeTab === 'announcements' ? (
              <PengumumanTab
                events={events.filter(event => 
                  event.type === 'Pengumuman' || 
                  event.type === 'Sistem'
                )}
                statistics={statistics}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleAddEvent={handleAddEvent}
                handleEditEvent={handleEditEvent}
                handleDeleteEvent={handleDeleteEvent}
                filterOptions={filterOptions}
                FilterDropdown={FilterDropdown}
              />
            ) : null}
            </div> {/* Close max-w-5xl container */}

            {/* Modal Tambah/Edit Event */}
            {showModal && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowModal(false);
                  }
                }}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Event' : 'Tambah Event Baru'}</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Judul</label>
                      <input 
                        type="text" 
                        name="title"
                        value={currentEvent.title}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan judul event"
                      />
                    </div>
                    {renderEventTypeSelect()}
                    
                    {/* Speaker Information */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Speaker</label>
                        <input 
                          type="text" 
                          name="speaker"
                          value={currentEvent.speaker || ''}
                          onChange={handleInputChange}
                          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nama pembicara"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Gelar/Posisi</label>
                        <input 
                          type="text" 
                          name="speaker_title"
                          value={currentEvent.speaker_title || ''}
                          onChange={handleInputChange}
                          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Dr., Prof., CEO, etc."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Deskripsi</label>
                      <textarea 
                        name="description"
                        value={currentEvent.description}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan deskripsi event"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Tanggal</label>
                        <input 
                          type="date" 
                          name="date"
                          value={currentEvent.date}
                          onChange={handleInputChange}
                          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Waktu</label>
                        <input 
                          type="time" 
                          name="time"
                          value={currentEvent.time || ''}
                          onChange={handleInputChange}
                          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    {renderEventStatusSelect()}
                  </div>
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                      onClick={() => setShowModal(false)}
                    >
                      Batal
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                      onClick={handleSaveEvent}
                    >
                      {isEditing ? 'Perbarui' : 'Simpan'}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}

            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
              <FloatingDock items={dockItems} />
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default AdminEvent;
