import { IconBell, IconCalendar, IconCheck, IconDots, IconTrash, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const teacherId = localStorage.getItem('teacherId');
      
      if (!teacherId) {
        setError('Teacher ID not found');
        return;
      }

      let query = supabase
        .from('personal_notifications')
        .select('*')
        .eq('user_id', teacherId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply filter
      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'read') {
        query = query.eq('is_read', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('personal_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      const { error } = await supabase
        .from('personal_notifications')
        .update({ is_read: true })
        .eq('user_id', teacherId)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('personal_notifications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'announcement':
      case 'pengumuman':
        return <IconBell size={20} />;
      case 'achievement':
      case 'pencapaian':
        return <IconCheck size={20} />;
      case 'system':
      case 'sistem':
        return <IconDots size={20} />;
      case 'user':
      case 'pengguna':
        return <IconUser size={20} />;
      default:
        return <IconBell size={20} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'announcement':
      case 'pengumuman':
        return 'bg-blue-100 text-blue-600';
      case 'achievement':
      case 'pencapaian':
        return 'bg-green-100 text-green-600';
      case 'system':
      case 'sistem':
        return 'bg-gray-100 text-gray-600';
      case 'user':
      case 'pengguna':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) return `${diffInDays} hari yang lalu`;
    if (diffInHours > 0) return `${diffInHours} jam yang lalu`;
    if (diffInMinutes > 0) return `${diffInMinutes} menit yang lalu`;
    return 'Baru saja';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchNotifications}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Filter and Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'unread', 'read'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' ? 'Semua' : filterType === 'unread' ? 'Belum Dibaca' : 'Sudah Dibaca'}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-secondary hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <IconCheck size={16} />
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Notifikasi Personal</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {notifications.length} Notifikasi
            </span>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <IconBell size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">Belum ada notifikasi</p>
            <p className="text-gray-400 text-sm">Notifikasi baru akan muncul di sini</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-semibold text-gray-800 ${!notification.is_read ? 'font-bold' : ''}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500 gap-4">
                        <span className="flex items-center gap-1">
                          <IconCalendar size={12} />
                          {formatDate(notification.created_at)}
                        </span>
                        <span>{getTimeAgo(notification.created_at)}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {notification.type}
                        </span>
                      </div>
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-secondary hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <IconCheck size={14} />
                          Tandai Dibaca
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-100 text-center">
            <button className="text-sm text-secondary hover:text-blue-700 font-medium">
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationManagement;
