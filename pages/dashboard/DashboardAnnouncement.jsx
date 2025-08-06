import ClientOnly from '@/components/ClientOnly';
import Header from '@/components/Header';
import { IconAlertTriangle, IconBell, IconCheck, IconInfoCircle, IconMessageHeart, IconTrophy } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Dock } from '../../components/ui/dock';
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
  const [channelMessages, setChannelMessages] = useState([]);
  const fileInputRef = useRef(null);
  
  // Add new profile state
  const [profileData, setProfileData] = useState({
    level: 1,
    xp: 0,
    points: 0,
    streak: 0,
    level_description: 'Pemula',
    energy: 5,
    role: 'student' // Add role to profile data
  });

  // Add user session state
  const [userSession, setUserSession] = useState(null);

  // Add notification for new messages
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Detect new messages and show notification
  useEffect(() => {
    if (channelMessages.length > lastMessageCount && lastMessageCount > 0) {
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        const latestMessage = channelMessages[channelMessages.length - 1];
        if (latestMessage.user_id !== userSession?.user?.id) {
          new Notification('Pesan Baru dari Komunitas', {
            body: `${latestMessage.profiles?.full_name}: ${latestMessage.content?.substring(0, 50)}...`,
            icon: '/favicon.ico'
          });
        }
      }
    }
    setLastMessageCount(channelMessages.length);
  }, [channelMessages, userSession, lastMessageCount]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Add ref for auto-scroll
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  // Cek apakah user sudah login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Ambil data user dari localStorage
    setUserName(localStorage.getItem('userName') || 'Pengguna');
    
    // Check if should open channel tab from query params
    if (router.query.tab === 'channel') {
      setActiveTab('channel');
    }
    
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
          setUserSession(session);
          
          // Fetch announcements
          const { data: announcements, error: annError } = await supabase
            .from('announcements')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          
          if (annError) throw annError;
          setAnnouncements(announcements || []);

          // Fetch channel messages
          const { data: messages, error: msgError } = await supabase
            .from('channel_messages')
            .select(`
              *,
              profiles!channel_messages_user_id_fkey(full_name, role),
              message_reactions(*),
              poll_votes(*)
            `)
            .order('created_at', { ascending: true });
          
          if (msgError) throw msgError;
          setChannelMessages(messages || []);

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
      icon: <img src="/icon/icons8-home-100.png" alt="Home" className="w-6 h-6" />, 
      href: '/dashboard/home/Dashboard'
    },
    { 
      title: "Huruf", 
      icon: <img src="/icon/icons8-scroll-100.png" alt="Huruf" className="w-6 h-6" />, 
      href: '/dashboard/DashboardHuruf'
    },
    { 
      title: "Belajar & Roadmap", 
      icon: <img src="/icon/icons8-course-assign-100.png" alt="Belajar" className="w-6 h-6" />, 
      href: '/dashboard/DashboardBelajar'
    },
    {
      title: "Toko",
      icon: <img src="/icon/icons8-shopping-cart-100.png" alt="Toko" className="w-6 h-6" />,
      href: '/dashboard/toko/DashboardShop'
    },
    { 
      title: "Pengaturan", 
      icon: <img src="/icon/setting.png" alt="Pengaturan" className="w-6 h-6" />, 
      href: '/dashboard/setting/DashboardSettings'
    },
  ];

  // Hitung notifikasi yang belum dibaca
  const unreadCount = personalNotifications.filter(notif => !notif.is_read).length;
  
  // Hitung channel messages yang belum dibaca (misalnya 24 jam terakhir)
  const unreadChannelCount = channelMessages.filter(msg => {
    const messageDate = new Date(msg.created_at);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return messageDate > oneDayAgo && msg.user_id !== userSession?.user?.id;
  }).length;

  // Channel message functions - Students can only react with stickers
  // handleSendMessage removed - students cannot send messages
  
  const handleReaction = async (messageId, sticker) => {
    try {
      // Check if user already has any reaction on this message
      const { data: existingUserReactions } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', userSession?.user?.id);

      // Check if user clicked the same sticker they already reacted with
      const sameSticker = existingUserReactions?.find(reaction => reaction.sticker === sticker);

      if (sameSticker) {
        // Remove reaction (unreact)
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', sameSticker.id);
      } else {
        // Remove any existing reaction from this user first (1 user = 1 reaction per message)
        if (existingUserReactions && existingUserReactions.length > 0) {
          await supabase
            .from('message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', userSession?.user?.id);
        }

        // Add new reaction
        await supabase
          .from('message_reactions')
          .insert([{
            message_id: messageId,
            user_id: userSession?.user?.id,
            sticker: sticker
          }]);
      }

      // Refresh messages
      const { data: messages } = await supabase
        .from('channel_messages')
        .select(`
          *,
          profiles!channel_messages_user_id_fkey(full_name, role),
          message_reactions(*),
          poll_votes(*)
        `)
        .order('created_at', { ascending: true });
      
      setChannelMessages(messages || []);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  // Add loading state for poll voting
  const [votingLoadingStates, setVotingLoadingStates] = useState({});
  
  // Add poll timer state
  const [pollTimers, setPollTimers] = useState({});

  // Function to calculate remaining time for polls (24 hours from creation)
  const calculateRemainingTime = (createdAt) => {
    const createdTime = new Date(createdAt);
    const expiryTime = new Date(createdTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const now = new Date();
    const remainingMs = expiryTime.getTime() - now.getTime();
    
    if (remainingMs <= 0) return null;
    
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, totalMs: remainingMs };
  };

  // Update poll timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setPollTimers(prev => {
        const updated = {};
        channelMessages.forEach(message => {
          if (message.message_type === 'poll') {
            updated[message.id] = calculateRemainingTime(message.created_at);
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [channelMessages]);

  const handlePollVote = async (messageId, optionIndex) => {
    // Set loading state
    setVotingLoadingStates(prev => ({ ...prev, [`${messageId}-${optionIndex}`]: true }));
    
    try {
      // Check if user is logged in
      if (!userSession?.user?.id) {
        alert('Silakan login terlebih dahulu untuk memberikan suara');
        return;
      }

      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', userSession?.user?.id)
        .single();

      if (existingVote) {
        // Update vote if different option
        if (existingVote.option_index !== optionIndex) {
          await supabase
            .from('poll_votes')
            .update({ option_index: optionIndex })
            .eq('id', existingVote.id);
        } else {
          // Remove vote if same option (toggle off)
          await supabase
            .from('poll_votes')
            .delete()
            .eq('id', existingVote.id);
        }
      } else {
        // Add new vote
        await supabase
          .from('poll_votes')
          .insert([{
            message_id: messageId,
            user_id: userSession?.user?.id,
            option_index: optionIndex
          }]);
      }

      // Refresh messages with better error handling
      const { data: messages, error } = await supabase
        .from('channel_messages')
        .select(`
          *,
          profiles!channel_messages_user_id_fkey(full_name, role),
          message_reactions(*),
          poll_votes(*)
        `)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setChannelMessages(messages || []);
      
    } catch (error) {
      console.error('Error voting on poll:', error);
      alert('Gagal memberikan suara. Silakan coba lagi.');
    } finally {
      // Clear loading state
      setVotingLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[`${messageId}-${optionIndex}`];
        return newState;
      });
    }
  };

  // File upload and poll functions removed - students can only react with stickers

  // Tab navigation dengan gaya dari Dashboard.jsx
  const TabNavigation = () => {
    return (
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('pengumuman')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center ${
            activeTab === 'pengumuman' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pengumuman Umum
          {announcements.length > 0 && (
            <span className="ml-2 bg-white text-secondary text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {announcements.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('channel')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center ${
            activeTab === 'channel' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Komunitas
          {channelMessages.length > 0 && (
            <span className="ml-2 bg-white text-secondary text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {channelMessages.length}
            </span>
          )}
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
                  className={`px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 min-w-[160px] justify-center ${
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
                  onClick={() => setActiveTab('channel')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 min-w-[160px] justify-center ${
                    activeTab === 'channel' 
                      ? 'bg-white text-green-600 shadow-md shadow-green-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <motion.div
                    animate={{ 
                      rotate: activeTab === 'channel' ? [0, 15, 0] : 0,
                      scale: activeTab === 'channel' ? 1.1 : 1 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <IconMessageHeart size={20} />
                  </motion.div>
                  <span>Komunitas</span>
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-bold">
                    {channelMessages.length}
                  </span>
                </motion.button>
                
                <motion.button 
                  onClick={() => setActiveTab('personal')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 min-w-[160px] justify-center relative ${
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
                  <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-bold">
                    {personalNotifications.length}
                  </span>
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold absolute -top-1 -right-1"
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
                  ) : activeTab === 'channel' ? (
                    <motion.div
                      key="channel"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="p-8"
                    >

                      {/* Messages Container */}
                      <div className="bg-gray-50 rounded-2xl overflow-hidden">
                        {/* Messages Area */}
                        <div className="h-96 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                          {channelMessages.length === 0 ? (
                            <div className="text-center py-12">
                              <IconMessageHeart size={48} className="mx-auto text-gray-300 mb-4" />
                              <p className="text-gray-500 font-medium">Belum ada pesan di komunitas</p>
                              <p className="text-gray-400 text-sm">Mulai percakapan pertama!</p>
                            </div>
                          ) : (
                            channelMessages.map((message, index) => {
                              // Check if this message is from the last 24 hours and should show divider
                              const messageDate = new Date(message.created_at);
                              const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                              const isNewMessage = messageDate > oneDayAgo && message.user_id !== userSession?.user?.id;
                              
                              // Check if previous message was older than 24 hours to show divider
                              const prevMessage = channelMessages[index - 1];
                              const shouldShowDivider = prevMessage && 
                                new Date(prevMessage.created_at) <= oneDayAgo && 
                                messageDate > oneDayAgo;

                              return (
                                <div key={message.id}>
                                  {/* New Messages Divider */}
                                  {shouldShowDivider && (
                                    <div className="flex items-center gap-3 my-4">
                                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
                                      <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                                        📍 Pesan Baru
                                      </span>
                                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
                                    </div>
                                  )}
                                  
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex gap-3 ${message.user_id === userSession?.user?.id ? 'flex-row-reverse' : ''} ${isNewMessage ? 'bg-blue-50/30 rounded-lg p-2 border-l-2 border-blue-400' : ''}`}
                                  >
                                {/* Avatar */}
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                  {message.profiles?.full_name?.charAt(0) || message.profiles?.role?.charAt(0) || 'U'}
                                </div>
                                
                                {/* Message Content */}
                                <div className={`max-w-xs lg:max-w-md ${message.user_id === userSession?.user?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                                  {/* Sender Info with Time */}
                                  <div className={`flex items-center gap-2 mb-1 ${message.user_id === userSession?.user?.id ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {message.profiles?.full_name || 'Unknown User'}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      message.profiles?.role === 'admin' ? 'bg-red-100 text-red-600' :
                                      message.profiles?.role === 'teacher' ? 'bg-blue-100 text-blue-600' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {message.profiles?.role === 'admin' ? 'Admin' :
                                       message.profiles?.role === 'teacher' ? 'Guru' : 'Siswa'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {(() => {
                                        const messageDate = new Date(message.created_at);
                                        const today = new Date();
                                        const yesterday = new Date(today);
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        
                                        const isToday = messageDate.toDateString() === today.toDateString();
                                        const isYesterday = messageDate.toDateString() === yesterday.toDateString();
                                        
                                        const time = messageDate.toLocaleTimeString('id-ID', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        });
                                        
                                        if (isToday) {
                                          return `Hari ini ${time}`;
                                        } else if (isYesterday) {
                                          return `Kemarin ${time}`;
                                        } else {
                                          return `${messageDate.toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short'
                                          })} ${time}`;
                                        }
                                      })()}
                                    </span>
                                  </div>
                                  
                                  {/* Message Bubble */}
                                  <div className={`rounded-2xl px-4 py-3 ${
                                    message.user_id === userSession?.user?.id 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-white text-gray-900 border border-gray-200'
                                  }`}>
                                    {/* Text Message */}
                                    {message.message_type === 'text' && (
                                      <p className="text-sm">{message.content}</p>
                                    )}
                                    
                                    {/* Image Message */}
                                    {message.message_type === 'image' && (
                                      <div className="space-y-2">
                                        {message.content && <p className="text-sm">{message.content}</p>}
                                        <img 
                                          src={message.media_url} 
                                          alt="Shared image"
                                          className="rounded-lg max-w-full h-auto"
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Video Message */}
                                    {message.message_type === 'video' && (
                                      <div className="space-y-2">
                                        {message.content && <p className="text-sm">{message.content}</p>}
                                        <video 
                                          src={message.media_url} 
                                          controls
                                          className="rounded-lg max-w-full h-auto"
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Poll Message */}
                                    {message.message_type === 'poll' && message.poll_data && (
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-4">
                                          <p className="text-sm font-semibold text-gray-900">{message.content}</p>
                                          {/* Poll Timer - Simplified */}
                                          <div className="text-xs">
                                            {(() => {
                                              const remainingTime = pollTimers[message.id];
                                              if (!remainingTime) {
                                                return (
                                                  <span className="text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full border border-red-200">
                                                    Berakhir
                                                  </span>
                                                );
                                              }
                                              return (
                                                <span className="text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                                                  {remainingTime.hours}j {remainingTime.minutes}m
                                                </span>
                                              );
                                            })()}
                                          </div>
                                        </div>
                                        
                                        {/* Expired Poll Notice - Clean & Minimal */}
                                        {!pollTimers[message.id] && (
                                          <div className="mb-4 p-3 bg-gray-100 rounded-lg border-l-4 border-red-400">
                                            <p className="text-sm text-gray-700 font-medium">
                                              Periode voting telah berakhir
                                            </p>
                                          </div>
                                        )}
                                        <div className="space-y-2">
                                          {message.poll_data.options.map((option, optionIndex) => {
                                            // Calculate votes for this option
                                            const votesForOption = message.poll_votes?.filter(vote => 
                                              vote.option_index === optionIndex
                                            ).length || 0;
                                            
                                            // Check if current user voted for this option
                                            const userVoted = message.poll_votes?.some(vote => 
                                              vote.option_index === optionIndex && vote.user_id === userSession?.user?.id
                                            );
                                            
                                            // Calculate total votes
                                            const totalVotes = message.poll_votes?.length || 0;
                                            const percentage = totalVotes > 0 ? Math.round((votesForOption / totalVotes) * 100) : 0;
                                            
                                            // Check if this option is currently being voted on
                                            const isLoading = votingLoadingStates[`${message.id}-${optionIndex}`];
                                            
                                            // Check if poll has expired
                                            const pollExpired = !pollTimers[message.id];
                                            const isDisabled = isLoading || pollExpired;

                                            return (
                                              <motion.button
                                                key={optionIndex}
                                                whileHover={{ scale: isDisabled ? 1 : 1.01 }}
                                                whileTap={{ scale: isDisabled ? 1 : 0.99 }}
                                                onClick={() => !isDisabled && handlePollVote(message.id, optionIndex)}
                                                disabled={isDisabled}
                                                className={`w-full p-4 rounded-xl text-left text-sm transition-all duration-200 relative overflow-hidden group ${
                                                  pollExpired
                                                    ? 'bg-gray-50 border border-gray-200 cursor-not-allowed'
                                                    : isLoading
                                                    ? 'bg-gray-50 border border-gray-200 cursor-wait'
                                                    : userVoted
                                                    ? 'bg-blue-50 border border-blue-200 text-blue-900'
                                                    : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                                }`}
                                              >
                                                {/* Progress indicator - Visual hierarchy */}
                                                <div 
                                                  className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out rounded-l-xl ${
                                                    pollExpired 
                                                      ? 'bg-gray-200' 
                                                      : userVoted 
                                                      ? 'bg-blue-200/60' 
                                                      : 'bg-blue-100/40'
                                                  }`}
                                                  style={{ width: `${Math.max(percentage, 2)}%` }}
                                                ></div>
                                                
                                                <div className="relative flex items-center justify-between">
                                                  <div className="flex items-center gap-3">
                                                    {/* Status indicator - Minimal & Clean */}
                                                    <div className={`w-2 h-2 rounded-full transition-colors ${
                                                      isLoading 
                                                        ? 'bg-gray-400 animate-pulse' 
                                                        : pollExpired 
                                                        ? 'bg-gray-400' 
                                                        : userVoted 
                                                        ? 'bg-blue-500' 
                                                        : 'bg-gray-300 group-hover:bg-blue-400'
                                                    }`}></div>
                                                    <span className={`font-medium transition-colors ${
                                                      pollExpired 
                                                        ? 'text-gray-500' 
                                                        : userVoted 
                                                        ? 'text-blue-900' 
                                                        : 'text-gray-900 group-hover:text-blue-900'
                                                    }`}>
                                                      {option.text}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-3 text-xs">
                                                    <span className={`font-semibold tabular-nums ${
                                                      pollExpired 
                                                        ? 'text-gray-500' 
                                                        : userVoted 
                                                        ? 'text-blue-700' 
                                                        : 'text-gray-600'
                                                    }`}>
                                                      {votesForOption}
                                                    </span>
                                                    {totalVotes > 0 && (
                                                      <span className={`tabular-nums ${
                                                        pollExpired 
                                                          ? 'text-gray-400' 
                                                          : userVoted 
                                                          ? 'text-blue-600' 
                                                          : 'text-gray-500'
                                                      }`}>
                                                        {percentage}%
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </motion.button>
                                            );
                                          })}
                                        </div>
                                        
                                        {/* Poll summary - Information Architecture */}
                                        <div className={`pt-4 border-t transition-colors ${
                                          !pollTimers[message.id] 
                                            ? 'border-gray-200' 
                                            : 'border-gray-150'
                                        }`}>
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 font-medium">
                                              {message.poll_votes?.length || 0} total suara
                                            </span>
                                            <span className={`text-xs font-medium ${
                                              !pollTimers[message.id] 
                                                ? 'text-gray-500'
                                                : message.poll_votes?.some(vote => vote.user_id === userSession?.user?.id) 
                                                  ? 'text-blue-600' 
                                                  : 'text-gray-600'
                                            }`}>
                                              {!pollTimers[message.id] 
                                                ? 'Voting ditutup'
                                                : message.poll_votes?.some(vote => vote.user_id === userSession?.user?.id) 
                                                  ? 'Anda telah memilih' 
                                                  : 'Pilih salah satu'
                                              }
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Message Actions */}
                                  <div className={`flex items-center gap-2 mt-2 ${message.user_id === userSession?.user?.id ? 'flex-row-reverse' : ''}`}>
                                    {/* Sticker Reactions */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {['👍', '❤️', '😊', '👏', '🔥', '💯', '🎉', '🤔'].map((sticker) => {
                                        // Count reactions for this specific sticker
                                        const stickerCount = message.message_reactions?.filter(reaction => 
                                          reaction.sticker === sticker
                                        ).length || 0;
                                        
                                        // Check if current user reacted with this sticker
                                        const userReacted = message.message_reactions?.some(reaction => 
                                          reaction.sticker === sticker && reaction.user_id === userSession?.user?.id
                                        );

                                        return (
                                          <motion.div
                                            key={sticker}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-full border-2 transition-all cursor-pointer ${
                                              userReacted 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                            onClick={() => handleReaction(message.id, sticker)}
                                          >
                                            <span className="text-sm">{sticker}</span>
                                            {stickerCount > 0 && (
                                              <span className={`text-xs font-medium ${
                                                userReacted ? 'text-blue-600' : 'text-gray-500'
                                              }`}>
                                                {stickerCount}
                                              </span>
                                            )}
                                          </motion.div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                                </div>
                              );
                            })
                          )}
                          
                          {/* Auto-scroll target */}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input Form - Disabled for students */}
                        <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="relative">
                                <input 
                                  type="text"
                                  disabled
                                  value="Hanya guru dan admin yang dapat mengirim pesan - berikan 1 reaksi nya"
                                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed opacity-75"
                                  readOnly
                                />

                              </div>
                            </div>
                            <button 
                              disabled
                              className="px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-medium cursor-not-allowed opacity-50"
                            >
                              Kirim
                            </button>
                          </div>

                        </div>
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
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl">
              <Dock items={dockItems} />
            </div>
          </div>
         
            </motion.div>
          </>
        )}
      </div>
    </ClientOnly>
  );
};

export default DashboardAnnouncement;