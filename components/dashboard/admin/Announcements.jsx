import { IconChartColumn, IconEye, IconHeart, IconMessageHeart, IconPhoto, IconPlayerPlay, IconSend, IconTrash, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { showToast } from '../../ui/toast';

const Announcements = () => {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    adminMessages: 0,
    studentMessages: 0,
    totalReactions: 0
  });

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
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
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast.error('Gagal memuat pesan');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: allMessages, error } = await supabase
        .from('channel_messages')
        .select('id, is_admin_message, message_reactions(id)');

      if (error) throw error;

      const totalMessages = allMessages.length;
      const adminMessages = allMessages.filter(msg => msg.is_admin_message).length;
      const studentMessages = totalMessages - adminMessages;
      const totalReactions = allMessages.reduce((sum, msg) => sum + (msg.message_reactions?.length || 0), 0);

      setStats({
        totalMessages,
        adminMessages,
        studentMessages,
        totalReactions
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      fetchStats(); // Refresh stats
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kelola Pengumuman</h2>
          <p className="text-gray-600 text-sm">Monitor dan kelola pesan di channel announcement</p>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/admin/CreateMessageAdmin')}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <IconSend size={16} />
            Buat Pesan
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/admin/AdminAnnouncements')}
            className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
          >
            <IconEye size={16} />
            Lihat Semua
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <IconMessageHeart size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              <p className="text-xs text-gray-500">Total Pesan</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <IconUsers size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.adminMessages}</p>
              <p className="text-xs text-gray-500">Pesan Admin</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <IconUsers size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.studentMessages}</p>
              <p className="text-xs text-gray-500">Pesan Siswa</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <IconHeart size={20} className="text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReactions}</p>
              <p className="text-xs text-gray-500">Total Reaksi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Pesan Terbaru</h3>
          <p className="text-sm text-gray-600 mt-1">10 pesan terakhir di channel announcement</p>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat pesan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center">
              <IconMessageHeart size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada pesan</p>
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.is_admin_message ? (
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <IconMessageHeart size={14} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <IconUsers size={14} className="text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {message.is_admin_message ? 'Admin' : (message.profiles?.full_name || 'Siswa')}
                      </span>
                      
                      {message.is_admin_message && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Admin
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-gray-400">
                        {getMessageTypeIcon(message.message_type)}
                      </div>

                      <span className="text-xs text-gray-500 ml-auto">
                        {formatTimeAgo(message.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {message.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <IconHeart size={12} />
                        {message.message_reactions?.length || 0}
                      </span>

                      {message.is_admin_message && (
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <IconTrash size={12} />
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Announcements;
