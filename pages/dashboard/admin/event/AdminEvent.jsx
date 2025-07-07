import { IconActivity, IconArrowRight, IconBell, IconBook, IconCalendar, IconChartBar, IconCheck, IconChevronDown, IconChevronUp, IconEdit, IconFileAnalytics, IconList, IconLogout, IconPlus, IconSearch, IconSettings, IconTrash, IconTrophy, IconUsers, IconX } from '@tabler/icons-react';
import { eachMonthOfInterval, endOfYear, format, startOfYear } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FloatingDock } from '../../../../components/ui/floating-dock';
import { Dropdown } from '../../../../components/widget/dropdown';
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
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  // Pindahkan deklarasi state filter ke atas
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarEvents, setCalendarEvents] = useState({});
  
  // Add filter function
  const getFilteredEvents = (data) => {
    return data.filter(event => {
      const matchesType = typeFilter === 'all' || event.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  };
  
  // Pindahkan deklarasi fetchEvents ke atas sebelum digunakan
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const filteredData = getFilteredEvents(data || []);
      setEvents(filteredData);
      processEventsForCalendar(data || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching events');
    } finally {
      setIsLoading(false);
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

  // Cek apakah user sudah login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Ambil data user dari localStorage
    setUserName(localStorage.getItem('userName') || 'Admin');
    
    fetchEvents();
  }, [router]);

  // Effect untuk filter yang tidak menyebabkan infinite loop
  useEffect(() => {
    if (rawEvents.length > 0) {
      setEvents(getFilteredEvents(rawEvents));
    }
  }, [typeFilter, statusFilter, searchTerm, rawEvents]);
  
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
      fetchEvents();
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting event');
    }
  };

  // Modified handleSaveEvent with optimistic updates
  const handleSaveEvent = async () => {
    try {
      if (isEditing) {
        // Optimistic update for edit
        setEvents(current =>
          current.map(event =>
            event.id === currentEvent.id ? currentEvent : event
          )
        );
        await updateEvent(currentEvent.id, currentEvent);
      } else {
        // Optimistic update for create
        const newEvent = {
          ...currentEvent,
          id: Date.now(), // Temporary ID
          created_at: new Date().toISOString()
        };
        setEvents(current => [newEvent, ...current]);
        await createEvent(currentEvent);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
      // Revert optimistic update on error
      fetchEvents();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/');
  };
  
  const handleAddEvent = () => {
    setIsEditing(false);
    setCurrentEvent({
      id: events.length + 1,
      title: '',
      type: 'Acara',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Aktif'
    });
    setShowModal(true);
  };
  
  const handleEditEvent = (event) => {
    setIsEditing(true);
    setCurrentEvent(event);
    setShowModal(true);
  };
  
  // Modified handleDeleteEvent with optimistic update
  const handleDeleteEvent = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      try {
        // Optimistic delete
        setEvents(current => current.filter(event => event.id !== id));
        await deleteEvent(id);
      } catch (error) {
        console.error('Error deleting event:', error);
        // Revert optimistic delete on error
        fetchEvents();
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
      onClick: () => router.push('/dashboard/admin/DashboardActivity')
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
  

  // Add this function after fetchEvents
  const processEventsForCalendar = (events) => {
    const eventsByMonth = {};
    events.forEach(event => {
      const monthKey = format(new Date(event.date), 'MM-yyyy');
      if (!eventsByMonth[monthKey]) {
        eventsByMonth[monthKey] = [];
      }
      eventsByMonth[monthKey].push(event);
    });
    setCalendarEvents(eventsByMonth);
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

  // Filter options
  const filterOptions = {
    type: [
      { value: 'all', label: 'Semua Tipe' },
      { value: 'Kegiatan', label: 'Kegiatan' },
      { value: 'Pengumuman', label: 'Pengumuman' },
      { value: 'Maintenance', label: 'Maintenance' },
      { value: 'Update', label: 'Update Sistem' }
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

  // Replace renderFilters with this updated version
  const renderFilters = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-6 p-4 bg-white rounded-xl shadow-sm"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Dropdown
            label="Tipe Event"
            value={typeFilter}
            options={filterOptions.type}
            onChange={(value) => setTypeFilter(value)}
            className="min-w-[180px]"
          />
          <Dropdown
            label="Status"
            value={statusFilter}
            options={filterOptions.status}
            onChange={(value) => setStatusFilter(value)}
            className="min-w-[180px]"
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

  // Update calendar year selector
  const renderCalendarHeader = () => (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Kalender Event</h2>
        <Dropdown
          value={selectedYear}
          options={filterOptions.year}
          onChange={(value) => setSelectedYear(parseInt(value))}
          className="w-32"
        />
      </div>
      <button
        onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        {isCalendarExpanded ? (
          <>
            <span>Tutup Kalender</span>
            <IconChevronUp size={20} />
          </>
        ) : (
          <>
            <span>Buka Kalender</span>
            <IconChevronDown size={20} />
          </>
        )}
      </button>
    </div>
  );

  // Update event modal type selector
  const renderEventTypeSelect = () => (
    <Dropdown
      label="Tipe"
      name="type"
      value={currentEvent.type}
      options={filterOptions.type.filter(opt => opt.value !== 'all')}
      onChange={(value) => handleInputChange({ target: { name: 'type', value }})}
      className="w-full"
    />
  );

  // Update event modal status selector
  const renderEventStatusSelect = () => (
    <Dropdown
      label="Status"
      name="status" 
      value={currentEvent.status}
      options={filterOptions.status.filter(opt => opt.value !== 'all')}
      onChange={(value) => handleInputChange({ target: { name: 'status', value }})}
      className="w-full"
    />
  );

  // Add these state variables after other state declarations
  const [challenges, setChallenges] = useState([]);
  const [challengeFilter, setChallengeFilter] = useState('all');
  const [challengeSearch, setChallengeSearch] = useState('');
  const [showAddChallengeModal, setShowAddChallengeModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);

  // Add this fetch function after other fetch functions
  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  // Add useEffect to fetch challenges
  useEffect(() => {
    fetchChallenges();
  }, []);

  // Add handler for challenge submission
  const handleSubmitChallenge = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const challengeData = {
        title: formData.get('title'),
        description: formData.get('description'),
        difficulty: formData.get('difficulty'),
        points: parseInt(formData.get('points')),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        is_active: true
      };

      if (editingChallenge) {
        const { error } = await supabase
          .from('daily_challenges')
          .update(challengeData)
          .eq('id', editingChallenge.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_challenges')
          .insert([challengeData]);

        if (error) throw error;
      }

      setShowAddChallengeModal(false);
      setEditingChallenge(null);
      fetchChallenges();

    } catch (error) {
      console.error('Error saving challenge:', error);
      alert('Failed to save challenge');
    }
  };

  // Add ChallengeModal component
  const ChallengeModal = () => (
    <AnimatePresence>
      {showAddChallengeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingChallenge ? 'Edit Tantangan' : 'Tambah Tantangan Baru'}
            </h3>
            <form onSubmit={handleSubmitChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingChallenge?.title}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  required
                  defaultValue={editingChallenge?.description}
                  className="w-full p-2 border rounded h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <select
                    name="difficulty"
                    required
                    defaultValue={editingChallenge?.difficulty || 'beginner'}
                    className="w-full p-2 border rounded"
                  >
                    <option value="beginner">Pemula</option>
                    <option value="intermediate">Menengah</option>
                    <option value="advanced">Lanjutan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poin</label>
                  <input
                    type="number"
                    name="points"
                    required
                    min="1"
                    defaultValue={editingChallenge?.points || 100}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    defaultValue={editingChallenge?.start_date?.split('T')[0]}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    name="end_date"
                    required
                    defaultValue={editingChallenge?.end_date?.split('T')[0]}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChallengeModal(false);
                    setEditingChallenge(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingChallenge ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Add these challenge handlers
  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setShowAddChallengeModal(true);
  };

  const handleDeleteChallenge = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tantangan ini?')) return;

    try {
      const { error } = await supabase
        .from('daily_challenges')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchChallenges();
      alert('Tantangan berhasil dihapus');
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Gagal menghapus tantangan');
    }
  };

  // Add new state for tab control after other state declarations
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'challenges'

  // Add this TabNavigation component before the return statement
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
            activeTab === 'challenges'
              ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('challenges')}
        >
          Tantangan Harian
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
      
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    {userName}
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Administrator</span>
                  </h2>
                  <div className="flex items-center text-xs text-gray-500 gap-3">
                    <span>Level 10 • Admin</span>
                    <span className="flex items-center gap-1 text-purple-600">
                      <IconCalendar size={12} />
                      <span>Admin Panel</span>
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      <IconTrophy size={12} />
                      <span>Full Access</span>
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <IconLogout size={16} />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="bg-gradient-to-r from-secondary to-blue-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel Pengumuman dan kelola konten</h1>
                  <p className="text-white/80 max-w-md">Manajemen pengumuman penting dan mengelola konten platform</p>
                </div>
                <button 
                  
                  onClick={handleAddEvent}
                  className="bg-white text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 shadow-md"
                >
                  <span>Buat Event</span>
                  <IconArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                onClick={() => router.push('/dashboard/admin/data/AdminData')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <IconFileAnalytics size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Analisis Data</h3>
                </div>
                <p className="text-sm text-gray-600">Analisis penggunaan platform dan statistik pembelajaran</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                onClick={() => router.push('/dashboard/admin/content/AdminContent')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <IconBook size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Kelola Konten</h3>
                </div>
                <p className="text-sm text-gray-600">Kelola materi pembelajaran dan konten edukasi</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer bg-blue-50 border-blue-200"
                
                onClick={() => router.push('/dashboard/admin/activity/AdminEvent')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <IconBell size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Kelola Event</h3>
                </div>
                <p className="text-sm text-gray-600">Kelola event dan pengumuman untuk pengguna</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                onClick={() => router.push('/dashboard/admin/verification/AdminVerif')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <IconUsers size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">Verifikasi Pengguna</h3>
                </div>
                <p className="text-sm text-gray-600">Kelola dan verifikasi akun pengguna platform</p>
              </motion.div>
            </div>


            {/* Add TabNavigation */}
            <TabNavigation />

            {/* Conditional rendering based on active tab */}
            {activeTab === 'events' ? (
              <>
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
        
                {/* Admin Menu Cards */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <IconCalendar size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800">Total Event</h3>
                      </div>
                      <p className="text-2xl font-bold">{events.length}</p>
                    </div>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <IconArrowRight size={12} className="transform rotate-45" />
                      <span>10% dari bulan lalu</span>
                    </p>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <IconBell size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800">Event Aktif</h3>
                      </div>
                      <p className="text-2xl font-bold">{events.filter(e => e.status === 'Aktif').length}</p>
                    </div>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <IconArrowRight size={12} className="transform rotate-45" />
                      <span>5% dari bulan lalu</span>
                    </p>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                          <IconUsers size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800">Dijadwalkan</h3>
                      </div>
                      <p className="text-2xl font-bold">{events.filter(e => e.status === 'Dijadwalkan').length}</p>
                    </div>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <IconArrowRight size={12} className="transform rotate-45" />
                      <span>15% dari bulan lalu</span>
                    </p>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </motion.div>
                </motion.div>
                
                {/* Filter dan Pencarian */}
                {renderFilters()}
                
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
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">Tanggal</th>
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.length > 0 ? (
                          events.map((event) => (
                            <tr key={event.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4">{event.title}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  event.type === 'Acara' ? 'bg-purple-100 text-purple-800' : 
                                  event.type === 'Sistem' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {event.type}
                                </span>
                              </td>
                              <td className="py-3 px-4">{new Date(event.date).toLocaleDateString('id-ID')}</td>
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
                                  {event.status === 'Dijadwalkan' && (
                                    <>
                                      <button 
                                        onClick={() => handleEditEvent(event)}
                                        className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                        title="Aktifkan"
                                      >
                                        <IconCheck size={18} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                        title="Hapus"
                                      >
                                        <IconX size={18} />
                                      </button>
                                    </>
                                  )}
                                  {event.status === 'Aktif' && (
                                    <>
                                      <button 
                                        onClick={() => handleEditEvent(event)}
                                        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                        title="Edit"
                                      >
                                        <IconEdit size={18} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                        title="Hapus"
                                      >
                                        <IconTrash size={18} />
                                      </button>
                                    </>
                                  )}
                                  {event.status === 'Selesai' && (
                                    <button 
                                      onClick={() => handleEditEvent(event)}
                                      className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                      title="Lihat Detail"
                                    >
                                      <IconEdit size={18} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
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
              </>
            ) : (
              <>
                {/* Tantangan Harian */}
                <div className="mt-8">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Tantangan Harian</h2>
                      <button
                        onClick={() => setShowAddChallengeModal(true)}
                        className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <IconPlus size={18} />
                        <span>Tambah Tantangan</span>
                      </button>
                    </div>

                    <div className="flex gap-4 mb-6">
                      <select
                        className="border rounded-lg px-3 py-2"
                        value={challengeFilter}
                        onChange={(e) => setChallengeFilter(e.target.value)}
                      >
                        <option value="all">Semua Level</option>
                        <option value="beginner">Pemula</option>
                        <option value="intermediate">Menengah</option>
                        <option value="advanced">Lanjutan</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Cari tantangan..."
                        className="border rounded-lg px-3 py-2 flex-1"
                        value={challengeSearch}
                        onChange={(e) => setChallengeSearch(e.target.value)}
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead className="bg-gray-50 text-gray-700 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Judul</th>
                            <th className="px-4 py-3 text-left font-semibold">Level</th>
                            <th className="px-4 py-3 text-left font-semibold">Poin</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Periode</th>
                            <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {challenges
                            .filter(challenge => 
                              (challengeFilter === 'all' || challenge.difficulty === challengeFilter) &&
                              (challenge.title.toLowerCase().includes(challengeSearch.toLowerCase()) ||
                               challenge.description?.toLowerCase().includes(challengeSearch.toLowerCase()))
                            )
                            .map((challenge) => (
                              <tr key={challenge.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <div>
                                    <div className="font-medium text-gray-800">{challenge.title}</div>
                                    <div className="text-sm text-gray-500">{challenge.description}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                    challenge.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {challenge.difficulty === 'beginner' ? 'Pemula' :
                                     challenge.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">{challenge.points} poin</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    challenge.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {challenge.is_active ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm">
                                    <div>{new Date(challenge.start_date).toLocaleDateString('id-ID')}</div>
                                    <div className="text-gray-500">hingga</div>
                                    <div>{new Date(challenge.end_date).toLocaleDateString('id-ID')}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditChallenge(challenge)}
                                      className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                                    >
                                      <IconEdit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteChallenge(challenge.id)}
                                      className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                                    >
                                      <IconTrash size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Modal Tambah/Edit Event */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md"
                >
                  <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Event' : 'Tambah Event Baru'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Judul</label>
                      <input 
                        type="text" 
                        name="title"
                        value={currentEvent.title}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Masukkan judul event"
                      />
                    </div>
                    {renderEventTypeSelect()}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Deskripsi</label>
                      <textarea 
                        name="description"
                        value={currentEvent.description}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-2 h-24 focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Masukkan deskripsi event"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Tanggal</label>
                      <input 
                        type="date" 
                        name="date"
                        value={currentEvent.date}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                    {renderEventStatusSelect()}
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button 
                      className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowModal(false)}
                    >
                      Batal
                    </button>
                    <button 
                      className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={handleSaveEvent}
                    >
                      Simpan
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Add ChallengeModal here */}
            <ChallengeModal />

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
