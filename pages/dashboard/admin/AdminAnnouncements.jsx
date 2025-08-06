import AdminHeader from '@/components/admin/adminHeader';
import ClientOnly from '@/components/ClientOnly';
import { Toast, showToast } from '@/components/ui/toast';
import {
    IconArrowLeft,
    IconChartColumn,
    IconEye,
    IconHeart,
    IconMessageHeart,
    IconPhoto,
    IconPlayerPlay,
    IconSend,
    IconTrash,
    IconUsers
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const AdminAnnouncements = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [adminProfile, setAdminProfile] = useState(null);
  const [userSession, setUserSession] = useState(null);
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, admin, student
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, popular

  // Auth check for admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const isAdmin = localStorage.getItem('isAdmin');
        const storedUserName = localStorage.getItem('userName');
        
        if (!isAdmin || isAdmin !== 'true') {
          router.push('/authentication/admin/loginAdmin');
          return;
        }
        
        setUserName(storedUserName || 'Admin');
        
        // Try to get Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserSession(session);
          
          // Fetch admin profile
          const { data: profile } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          if (profile) {
            setAdminProfile(profile);
            setUserName(profile.full_name || profile.email || 'Admin');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        showToast.error('Terjadi kesalahan autentikasi');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  // Fetch messages
  useEffect(() => {
    if (!isLoading) {
      fetchMessages();
    }
  }, [isLoading, filter, sortBy]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('channel_messages')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          ),
          message_reactions (
            id,
            reaction_type,
            user_id
          )
        `);

      // Apply filters
      if (filter === 'admin') {
        query = query.eq('is_admin_message', true);
      } else if (filter === 'student') {
        query = query.eq('is_admin_message', false);
      }

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'popular') {
        // This would need a more complex query in real implementation
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast.error('Gagal memuat pesan');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      router.push('/authentication/admin/loginAdmin');
    } catch (error) {
      console.error('Logout error:', error);
      showToast.error('Gagal logout');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      const { error } = await supabase
        .from('channel_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      showToast.success('Pesan berhasil dihapus');
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast.error('Gagal menghapus pesan');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} hari lalu`;
    return `${Math.floor(diffInHours / 168)} minggu lalu`;
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'image': return <IconPhoto size={16} className="text-green-500" />;
      case 'video': return <IconPlayerPlay size={16} className="text-purple-500" />;
      case 'poll': return <IconChartColumn size={16} className="text-orange-500" />;
      default: return <IconMessageHeart size={16} className="text-blue-500" />;
    }
  };

  const getMessageTypeLabel = (type) => {
    switch (type) {
      case 'image': return 'Gambar';
      case 'video': return 'Video';
      case 'poll': return 'Survey';
      default: return 'Teks';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pengumuman...</p>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen">
        <Head>
          <title>Kelola Pengumuman • Admin Makhrojul Huruf</title>
          <meta name="description" content="Panel admin untuk mengelola pengumuman dan pesan" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Toast />

        <AdminHeader 
          userName={userName}
          onLogout={handleLogout}
        />

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
              >
                <IconArrowLeft size={20} className="text-gray-600" />
              </motion.button>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <IconMessageHeart size={28} className="text-pink-500" />
                  Kelola Pengumuman
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Monitor dan kelola semua pesan di channel announcement
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard/admin/CreateMessageAdmin')}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <IconSend size={18} />
                Buat Pesan Baru
              </motion.button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">Semua Pesan</option>
                    <option value="admin">Pesan Admin</option>
                    <option value="student">Pesan Siswa</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Urutkan:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="popular">Terpopuler</option>
                  </select>
                </div>

                <div className="ml-auto text-sm text-gray-600">
                  {messages.length} pesan ditemukan
                </div>
              </div>
            </div>
          </motion.div>

          {/* Messages List */}
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.is_admin_message ? (
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                          <IconMessageHeart size={18} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <IconUsers size={18} className="text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {message.is_admin_message ? 'Admin' : (message.profiles?.full_name || 'Siswa')}
                        </span>
                        
                        {message.is_admin_message && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Admin
                          </span>
                        )}

                        <div className="flex items-center gap-1 text-gray-500">
                          {getMessageTypeIcon(message.message_type)}
                          <span className="text-xs">{getMessageTypeLabel(message.message_type)}</span>
                        </div>

                        <span className="text-xs text-gray-500 ml-auto">
                          {formatTimeAgo(message.created_at)}
                        </span>
                      </div>

                      {/* Message Content */}
                      <div className="text-gray-700 mb-3">
                        {message.message_type === 'poll' ? (
                          <div>
                            <p className="font-medium mb-2">{message.content}</p>
                            {message.poll_data?.options && (
                              <div className="space-y-1">
                                {message.poll_data.options.map((option, idx) => (
                                  <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="w-5 h-5 bg-gray-100 rounded text-xs flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    {option.text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <IconHeart size={16} />
                          <span>{message.message_reactions?.length || 0}</span>
                        </div>

                        <div className="flex items-center gap-1 text-gray-500">
                          <IconEye size={16} />
                          <span>Dilihat</span>
                        </div>

                        {(message.is_admin_message || adminProfile?.role === 'superadmin') && (
                          <button
                            onClick={() => deleteMessage(message.id)}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors ml-auto"
                          >
                            <IconTrash size={16} />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <IconMessageHeart size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pesan</h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'admin' ? 'Belum ada pesan dari admin' : 
                   filter === 'student' ? 'Belum ada pesan dari siswa' : 
                   'Channel announcement masih kosong'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/dashboard/admin/CreateMessageAdmin')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Buat Pesan Pertama
                </motion.button>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </ClientOnly>
  );
};

export default AdminAnnouncements;
