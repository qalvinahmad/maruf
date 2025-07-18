import ClientOnly from '@/components/ClientOnly';
import Header from '@/components/Header';
import { IconAlertTriangle, IconBell, IconBook, IconCheck, IconCoin, IconHome, IconInfoCircle, IconLetterA, IconSettings, IconTrophy } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FloatingDock } from '../../components/ui/floating-dock';
import AdminDropdown from '../../components/widget/AdminDropdown';
import { supabase } from '../../lib/supabaseClient';
import { announcementQueries, notificationQueries } from '../../lib/supabaseQueries';

const DashboardAnnouncement = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pengumuman');
  const [personalNotifications, setPersonalNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  // Add new profile state
  const [profileData, setProfileData] = useState({
    level: 1,
    xp: 0,
    points: 0,
    streak: 0,
    level_description: 'Pemula',
    energy: 5
  });

  // Cek apakah user sudah login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Ambil data user dari localStorage
    setUserName(localStorage.getItem('userName') || 'Pengguna');
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);
  
  // Update useEffect to fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          // Fetch announcements
          const { data: announcements, error: annError } = await supabase
            .from('announcements')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          
          if (annError) throw annError;
          setAnnouncements(announcements || []);

          // Fetch personal notifications if user is logged in
          if (session?.user?.id) {
            const { data: notifications, error: notifError } = await supabase
              .from('personal_notifications')
              .select('*')
              .eq('user_id', session.user.id)
              .is('deleted_at', null)
              .order('created_at', { ascending: false });
            
            if (notifError) throw notifError;
            setPersonalNotifications(notifications || []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          // Use more descriptive error message
          alert('Gagal mengambil data notifikasi: ' + error.message);
        }
      }
    };

    fetchData();
  }, [isLoading]);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;
          if (profile) {
            setProfileData(profile);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear all localStorage data
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Terjadi kesalahan saat logout. Silakan coba lagi.');
    }
  };
  
  // Update notification handlers to work with Supabase
  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('personal_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setPersonalNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Gagal menandai notifikasi sebagai dibaca: ' + error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        alert('Sesi login tidak valid. Silakan login ulang.');
        return;
      }

      const { error } = await supabase
        .from('personal_notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .is('deleted_at', null);

      if (error) throw error;

      setPersonalNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Gagal menandai semua notifikasi sebagai dibaca: ' + error.message);
    }
  };

  // Update deleteNotification function
  const deleteNotification = async (id) => {
    try {
      const { error } = await notificationQueries.delete(id);
      if (error) throw error;
      
      setPersonalNotifications(prev => 
        prev.filter(notif => notif.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Add filter state
  const [filter, setFilter] = useState('all');

  // Update the dropdown to use proper options format
  const filterOptions = [
    { label: 'Semua Pengumuman', value: 'all' },
    { label: 'Pemeliharaan Sistem', value: 'system' },
    { label: 'Update Fitur', value: 'feature' },
    { label: 'Informasi Penting', value: 'important' }
  ];

   const dockItems = [
     { 
       title: "Dashboard", 
       icon: <IconHome />, 
       onClick: () => router.push('/dashboard/home/Dashboard')
     },
     { 
       title: "Huruf", 
       icon: <IconLetterA />, 
       onClick: () => router.push('/dashboard/DashboardHuruf')
     },
     { 
       title: "Belajar & Roadmap", 
       icon: <IconBook />, 
       onClick: () => router.push('/dashboard/DashboardBelajar')
     },
     {
       title: "Toko",
       icon: <IconCoin />,
       onClick: () => router.push('/dashboard/toko/DashboardShop')
     },
     { 
       title: "Pengaturan", 
       icon: <IconSettings />, 
       onClick: () => router.push('/dashboard/setting/DashboardSettings')
     },
   ];

  // Hitung notifikasi yang belum dibaca
  const unreadCount = personalNotifications.filter(notif => !notif.is_read).length;

  // Tab navigation dengan gaya dari Dashboard.jsx
  const TabNavigation = () => {
    return (
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('pengumuman')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'pengumuman' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pengumuman Umum
        </button>
        <button 
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center ${
            activeTab === 'personal' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Notifikasi Personal
          {unreadCount > 0 && (
            <span className="ml-2 bg-white text-secondary text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  };

  // Update the announcements rendering section
  const renderAnnouncements = () => {
    return announcements.map((announcement) => (
      <motion.div 
        key={announcement.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium text-gray-800">{announcement.title}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${
            announcement.type === 'system' ? 'bg-blue-100 text-blue-800' :
            announcement.type === 'feature' ? 'bg-green-100 text-green-800' :
            announcement.type === 'important' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
          </span>
        </div>
        <p className="text-sm mb-2 text-gray-600">{announcement.message}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Diposting: {new Date(announcement.created_at).toLocaleDateString('id-ID')}</span>
          {async () => {
            const { data: { session } } = await supabase.auth.getSession();
            return session?.user?.id === announcement.created_by && (
              <div>
                <button 
                  onClick={() => handleEditAnnouncement(announcement)} 
                  className="mr-2 text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Hapus
                </button>
              </div>
            );
          }}
        </div>
      </motion.div>
    ));
  };

  // Add handlers for announcements
  const handleEditAnnouncement = async (announcement) => {
    // Implement edit functionality
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      try {
        const { error } = await announcementQueries.delete(id);
        if (error) throw error;
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Gagal menghapus pengumuman');
      }
    }
  };

  // Update the dropdown implementation
  const handleFilterChange = (value) => {
    setFilter(value);
  };

  return (
    <ClientOnly>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen font-inter antialiased">
        <Head>
          <title>Pengumuman • Makhrojul Huruf</title>
          <meta name="description" content="Pusat pengumuman dan notifikasi pembelajaran makhrojul huruf" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        </Head>
        
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-screen bg-white">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animate-reverse"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Memuat Pengumuman</h3>
              <p className="text-sm text-gray-500">Sedang menyiapkan notifikasi pembelajaran Anda...</p>
            </div>
          </div>
        ) : (
          <>
            <Header 
              userName={userName}
              profileData={profileData}
              onLogout={handleLogout}
              onProfileUpdate={(updatedProfile) => {
                setProfileData(updatedProfile);
                setUserName(updatedProfile.full_name || 'User');
              }}
            />
            
            <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-16 pb-32 space-y-20">

              {/* Enhanced Tab Navigation - Gestalt Principles */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-gray-50 p-2 rounded-2xl inline-flex mx-auto"
              >
                <motion.button 
                  onClick={() => setActiveTab('pengumuman')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 min-w-[180px] justify-center ${
                    activeTab === 'pengumuman' 
                      ? 'bg-white text-blue-600 shadow-md shadow-blue-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <motion.div
                    animate={{ 
                      rotate: activeTab === 'pengumuman' ? [0, 15, 0] : 0,
                      scale: activeTab === 'pengumuman' ? 1.1 : 1 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <IconBell size={20} />
                  </motion.div>
                  <span>Pengumuman</span>
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-bold">
                    {announcements.length}
                  </span>
                </motion.button>
                
                <motion.button 
                  onClick={() => setActiveTab('personal')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 min-w-[180px] justify-center relative ${
                    activeTab === 'personal' 
                      ? 'bg-white text-purple-600 shadow-md shadow-purple-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <motion.div
                    animate={{ 
                      rotate: activeTab === 'personal' ? [0, 15, 0] : 0,
                      scale: activeTab === 'personal' ? 1.1 : 1 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <IconInfoCircle size={20} />
                  </motion.div>
                  <span>Personal</span>
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.button>
              </motion.div>
              
              {/* Enhanced Content Area - Visual Hierarchy */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {activeTab === 'pengumuman' ? (
                    <motion.div
                      key="announcements"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="p-8"
                    >
                      {/* Header Section with Progressive Disclosure */}
                      <div className="mb-8 space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                              Pengumuman Resmi
                            </h2>
                            <p className="text-gray-600 text-sm">
                              {announcements.length === 0 
                                ? 'Belum ada pengumuman terbaru' 
                                : `${announcements.length} pengumuman tersedia`
                              }
                            </p>
                          </div>
                          
                          {/* Advanced Filter with Better UX */}
                          <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-500 hidden lg:block">Filter:</div>
                            <AdminDropdown 
                              label="Semua Kategori"
                              options={filterOptions}
                              value={filter}
                              onChange={handleFilterChange}
                              className="min-w-[160px]"
                            />
                          </div>
                        </div>
                        
                        {/* Quick Stats Bar */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Total', value: announcements.length, color: 'blue' },
                            { label: 'Sistem', value: announcements.filter(a => a.type === 'system').length, color: 'indigo' },
                            { label: 'Fitur', value: announcements.filter(a => a.type === 'feature').length, color: 'green' },
                            { label: 'Penting', value: announcements.filter(a => a.type === 'important').length, color: 'red' }
                          ].map((stat, index) => (
                            <motion.div
                              key={stat.label}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-xl p-3 text-center`}
                            >
                              <div className={`text-lg font-bold text-${stat.color}-600`}>{stat.value}</div>
                              <div className={`text-xs text-${stat.color}-500 uppercase tracking-wide`}>{stat.label}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Announcements List with Enhanced Visual Design */}
                      <div className="space-y-4">
                        {announcements.length > 0 ? (
                          announcements.map((announcement, index) => (
                            <motion.div
                              key={announcement.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 relative overflow-hidden"
                            >
                              {/* Type Indicator */}
                              <div className={`absolute top-0 left-0 w-full h-1 ${
                                announcement.type === 'system' ? 'bg-blue-500' :
                                announcement.type === 'feature' ? 'bg-green-500' :
                                announcement.type === 'important' ? 'bg-red-500' :
                                'bg-gray-400'
                              }`}></div>
                              
                              <div className="flex items-start gap-4">
                                {/* Icon Container */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  announcement.type === 'system' ? 'bg-blue-100 text-blue-600' :
                                  announcement.type === 'feature' ? 'bg-green-100 text-green-600' :
                                  announcement.type === 'important' ? 'bg-red-100 text-red-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  <IconBell size={20} />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                      {announcement.title}
                                    </h3>
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wide ${
                                      announcement.type === 'system' ? 'bg-blue-100 text-blue-700' :
                                      announcement.type === 'feature' ? 'bg-green-100 text-green-700' :
                                      announcement.type === 'important' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {announcement.type}
                                    </span>
                                  </div>
                                  
                                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                    {announcement.message}
                                  </p>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                      <span>Dipublikasi {new Date(announcement.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })}</span>
                                    </div>
                                    
                                    {/* Action Buttons with Better UX */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                      >
                                        Baca Selengkapnya
                                      </motion.button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          /* Enhanced Empty State */
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                              <IconBell size={40} className="text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              Belum Ada Pengumuman
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                              Saat ini belum ada pengumuman terbaru. Kami akan memberitahu Anda ketika ada informasi penting.
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                              onClick={() => window.location.reload()}
                            >
                              Refresh Halaman
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="personal"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-8"
                    >
                      {/* Enhanced Personal Notifications Header */}
                      <div className="mb-8 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                              Notifikasi Personal
                            </h2>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                {personalNotifications.length} total notifikasi
                              </span>
                              {unreadCount > 0 && (
                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                  {unreadCount} belum dibaca
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Enhanced Action Button */}
                          {unreadCount > 0 && (
                            <motion.button 
                              onClick={markAllAsRead}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <IconCheck size={18} />
                              <span>Tandai Semua Dibaca</span>
                            </motion.button>
                          )}
                        </div>

                        {/* Notification Status Bar */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-600">Info: {personalNotifications.filter(n => n.type === 'info').length}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-gray-600">Pencapaian: {personalNotifications.filter(n => n.type === 'achievement').length}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-gray-600">Pengingat: {personalNotifications.filter(n => n.type === 'reminder').length}</span>
                              </div>
                            </div>
                            <span className="text-gray-500 text-xs">
                              Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Notifications List with Better UX */}
                      <div className="space-y-4">
                        {personalNotifications.length > 0 ? (
                          personalNotifications.map((notif, index) => (
                            <motion.div 
                              key={notif.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`group relative rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                                notif.is_read 
                                  ? 'bg-white border-gray-200 hover:border-gray-300' 
                                  : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200 hover:border-blue-300 shadow-sm'
                              }`}
                            >
                              {/* Priority Indicator */}
                              {!notif.is_read && (
                                <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
                              )}
                              
                              <div className="p-6">
                                <div className="flex items-start gap-4">
                                  {/* Enhanced Icon with Better Visual Hierarchy */}
                                  <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg ${
                                      notif.type === 'achievement' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 
                                      notif.type === 'reminder' ? 'bg-gradient-to-br from-red-500 to-pink-600' : 
                                      'bg-gradient-to-br from-blue-500 to-indigo-600'
                                    }`}
                                  >
                                    {notif.type === 'achievement' && <IconTrophy size={24} />}
                                    {notif.type === 'reminder' && <IconAlertTriangle size={24} />}
                                    {notif.type === 'info' && <IconInfoCircle size={24} />}
                                  </motion.div>
                                  
                                  {/* Enhanced Content Layout */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="space-y-1">
                                        <h4 className="text-lg font-bold text-gray-900 leading-tight">
                                          {notif.title}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                          <span className={`px-2 py-1 rounded-full font-medium uppercase tracking-wide ${
                                            notif.type === 'achievement' ? 'bg-yellow-100 text-yellow-700' :
                                            notif.type === 'reminder' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                          }`}>
                                            {notif.type === 'achievement' ? 'Pencapaian' :
                                             notif.type === 'reminder' ? 'Pengingat' : 'Info'}
                                          </span>
                                          <span>
                                            {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                              day: 'numeric',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                                      {notif.message}
                                    </p>
                                    
                                    {/* Enhanced Action Buttons with Better Spacing */}
                                    <div className="flex items-center justify-end gap-3">
                                      {!notif.is_read && (
                                        <motion.button 
                                          onClick={() => markAsRead(notif.id)}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                          <IconCheck size={14} />
                                          <span>Tandai Dibaca</span>
                                        </motion.button>
                                      )}
                                      <motion.button 
                                        onClick={() => deleteNotification(notif.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Hapus</span>
                                      </motion.button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          /* Enhanced Empty State with Better Visual Design */
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                              <IconBell size={40} className="text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              Tidak Ada Notifikasi Personal
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                              Anda sudah mengikuti semua informasi terbaru. Notifikasi baru akan muncul di sini saat tersedia.
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                              onClick={() => window.location.reload()}
                            >
                              Refresh Notifikasi
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </main>
            
            {/* Enhanced FloatingDock */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
<motion.div
initial={{ opacity: 0, y: 50 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 2, duration: 0.6 }}
className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
>
<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
<div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl">
<FloatingDock items={dockItems} />
</div>
</div>
</motion.div>
            </motion.div>
          </>
        )}
      </div>
    </ClientOnly>
  );
};

export default DashboardAnnouncement;