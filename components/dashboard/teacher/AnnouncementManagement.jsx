import { IconCalendar, IconChevronRight } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { supabase } from '../../../lib/supabaseClient';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getAnnouncementTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'urgent': 
      case 'penting': 
        return 'bg-red-100 text-red-700 border-red-200';
      case 'info':
      case 'informasi':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'update':
      case 'pembaruan':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'event':
      case 'acara':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAnnouncementBorderColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'urgent': 
      case 'penting': 
        return 'border-red-500';
      case 'info':
      case 'informasi':
        return 'border-blue-500';
      case 'update':
      case 'pembaruan':
        return 'border-green-500';
      case 'event':
      case 'acara':
        return 'border-purple-500';
      default: 
        return 'border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
          onClick={fetchAnnouncements}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Separate urgent/important announcements
  const urgentAnnouncements = announcements.filter(item => 
    item.type?.toLowerCase() === 'urgent' || item.type?.toLowerCase() === 'penting'
  );
  
  const regularAnnouncements = announcements.filter(item => 
    item.type?.toLowerCase() !== 'urgent' && item.type?.toLowerCase() !== 'penting'
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Pengumuman Penting */}
      {urgentAnnouncements.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Pengumuman Penting</h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
              {urgentAnnouncements.length} Penting
            </span>
          </div>
          
          <div className="space-y-4">
            {urgentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center text-red-600">
                    <FiAlertCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getAnnouncementTypeColor(announcement.type)}`}>
                        {announcement.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
                    <div className="flex items-center text-xs text-gray-500 gap-4">
                      <span className="flex items-center gap-1">
                        <IconCalendar size={12} />
                        {formatDate(announcement.created_at)}
                      </span>
                      <span>{getTimeAgo(announcement.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Pengumuman Terbaru */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Pengumuman Terbaru</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {regularAnnouncements.length} Pengumuman
          </span>
        </div>
        
        {regularAnnouncements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada pengumuman terbaru</p>
          </div>
        ) : (
          <div className="space-y-5">
            {regularAnnouncements.map((announcement) => (
              <motion.div 
                key={announcement.id}
                whileHover={{ x: 5 }}
                className={`border-l-4 pl-4 py-3 bg-white hover:bg-gray-50 rounded-r-lg transition-colors ${getAnnouncementBorderColor(announcement.type)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getAnnouncementTypeColor(announcement.type)}`}>
                    {announcement.type}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500 mb-3 gap-4">
                  <span className="flex items-center gap-1">
                    <IconCalendar size={12} />
                    {formatDate(announcement.created_at)}
                  </span>
                  <span>{getTimeAgo(announcement.created_at)}</span>
                </div>
                <p className="text-gray-600 mb-3">{announcement.message}</p>
                <div className="flex gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-secondary hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <span>Baca Selengkapnya</span>
                    <IconChevronRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {regularAnnouncements.length > 5 && (
          <div className="mt-6 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-secondary hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
            >
              <span>Lihat Semua Pengumuman</span>
              <IconChevronRight size={14} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnnouncementManagement;
