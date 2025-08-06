import { IconBell, IconCalendar, IconLogout, IconMessageHeart, IconRosetteDiscountCheckFilled, IconTrophy } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiAward } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const HeaderTeacher = ({ userName = '', teacherProfile }) => {
  const router = useRouter();
  const [messageCount, setMessageCount] = useState(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Fetch unread message count
  useEffect(() => {
    const fetchMessageCount = async () => {
      try {
        // Get unread channel messages count
        const { data: messages, error } = await supabase
          .from('channel_messages')
          .select('id, created_at, is_read')
          .eq('is_read', false); // Only get unread messages
        
        if (!error && messages) {
          setMessageCount(messages.length);
        }
      } catch (error) {
        console.error('Error fetching message count:', error);
      }
    };

    fetchMessageCount();
    
    // Set up interval to refresh count every 30 seconds
    const interval = setInterval(fetchMessageCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch unread notifications/announcements
  useEffect(() => {
    const fetchNotificationStatus = async () => {
      try {
        // Check for unread announcements or notifications
        const { data: announcements, error } = await supabase
          .from('announcements')
          .select('id, created_at, is_read')
          .eq('is_read', false)
          .limit(1);
        
        if (!error) {
          setHasUnreadNotifications(announcements && announcements.length > 0);
        }
      } catch (error) {
        console.error('Error fetching notification status:', error);
      }
    };

    fetchNotificationStatus();
    
    // Set up interval to refresh notification status every 30 seconds
    const interval = setInterval(fetchNotificationStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // Clear all teacher-related localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isTeacher');
    localStorage.removeItem('teacherEmail');
    localStorage.removeItem('teacherName');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('userId');
    localStorage.removeItem('teacherInstitution');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Clear all other possible auth keys
    localStorage.removeItem('teacherAuth');
    localStorage.removeItem('authToken');
    
    // Clear session storage as well
    sessionStorage.clear();
    
    // Redirect to teacher login page
    window.location.href = '/authentication/teacher/loginTeacher';
  };

  const handleAvatarClick = () => {
    router.push('/dashboard/teacher/DashboardSettingsTeacher?tab=account');
  };

  // Safe display name with fallback
  const displayName = userName || 'Teacher';

  // Get status display - fix duplicate issue
  const getStatusDisplay = () => {
    if (!teacherProfile) return { text: 'Pending', color: 'yellow', icon: null };
    
    const isVerified = teacherProfile.is_verified;
    const status = teacherProfile.status;
    
    // Only show one status, prioritize verification
    if (isVerified) {
      return { 
        text: 'Terverifikasi', 
        color: 'blue', // Changed to blue
        icon: IconRosetteDiscountCheckFilled 
      };
    } else if (status === 'pending') {
      return { 
        text: 'Pending', 
        color: 'yellow',
        icon: null 
      };
    } else if (status) {
      return { 
        text: status, 
        color: 'gray',
        icon: null 
      };
    } else {
      return { 
        text: 'Belum Terverifikasi', 
        color: 'red',
        icon: null 
      };
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-100 to-blue-200 shadow-lg sticky top-0 z-50 w-full overflow-hidden relative">
      {/* Animated wave background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-300"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            backgroundSize: '200% 200%'
          }}
        />
      </div>
      
      {/* Wave animation overlay */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <div className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-6 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Enhanced Clickable Avatar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAvatarClick}
              className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 cursor-pointer ring-2 ring-white/30 ring-offset-2 ring-offset-blue-100"
              title="Klik untuk mengatur akun"
            >
              {displayName.charAt(0).toUpperCase()}
            </motion.button>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-lg text-blue-900 font-['Poppins']">
                  {displayName}
                </h2>
                <span className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium font-['Poppins']">
                  Teacher
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Enhanced status display */}
                {(() => {
                  const statusInfo = getStatusDisplay();
                  const StatusIcon = statusInfo.icon;
                  return (
                    <motion.span 
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm relative overflow-hidden ${
                        statusInfo.color === 'blue' 
                          ? 'text-white' 
                          : statusInfo.color === 'green'
                          ? 'bg-green-500 text-white'
                          : statusInfo.color === 'yellow'
                          ? 'bg-yellow-500 text-white'
                          : statusInfo.color === 'red'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                      } font-['Poppins']`}
                      style={statusInfo.color === 'blue' ? { backgroundColor: '#00acee' } : {}}
                    >
                      {/* Shimmer effect for verified badge */}
                      {statusInfo.color === 'blue' && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 4,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                      {StatusIcon && <StatusIcon size={12} />}
                      <span className="relative z-10">{statusInfo.text}</span>
                    </motion.span>
                  );
                })()}
                
                <span className="flex items-center gap-1 bg-white/90 px-3 py-1.5 rounded-full text-xs font-medium text-purple-700 shadow-sm font-['Poppins']">
                  <IconCalendar size={12} />
                  <span>{teacherProfile?.teaching_experience || 'Belum ada'}</span>
                </span>
                <span className="flex items-center gap-1 bg-white/90 px-3 py-1.5 rounded-full text-xs font-medium text-yellow-700 shadow-sm font-['Poppins']">
                  <IconTrophy size={12} />
                  <span>{teacherProfile?.specialization || 'Belum ada'}</span>
                </span>
                <span className="flex items-center gap-1 bg-white/90 px-3 py-1.5 rounded-full text-xs font-medium text-green-700 shadow-sm font-['Poppins']">
                  <FiAward size={12} />
                  <span>{teacherProfile?.institution || 'Belum ada'}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Enhanced Message Button with Badge */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/message/CreateMessage')}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all duration-300 hover:shadow-lg font-['Poppins']"
              title="Buat Pesan Baru"
            >
              <IconMessageHeart size={16} />

              {/* Message Count Badge */}
              {messageCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center shadow-sm"
                >
                  {messageCount > 99 ? '99+' : messageCount}
                </motion.span>
              )}
            </motion.button>
            
            {/* Enhanced Notification Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/teacher/DashboardInformasi')}
              className="relative p-2.5 text-blue-700 hover:text-blue-900 hover:bg-white/20 rounded-lg transition-all duration-300 font-['Poppins']"
              title="Informasi & Notifikasi"
            >
              <IconBell size={18} />
              
              {/* Enhanced Notification Badge with Animation */}
              {hasUnreadNotifications && (
                <>
                  {/* Pulsing red dot */}
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"
                  />
                  
                  {/* Radiating light effect */}
                  <motion.span
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute top-1 right-1 w-3 h-3 bg-red-400 rounded-full"
                  />
                  
                  {/* Outer glow effect */}
                  <motion.span
                    animate={{
                      scale: [1, 3, 1],
                      opacity: [0.4, 0, 0.4]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute top-1 right-1 w-3 h-3 bg-red-300 rounded-full"
                  />
                </>
              )}
            </motion.button>
            
            {/* Enhanced Logout Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-300 font-['Poppins'] font-medium"
            >
              <IconLogout size={16} />
              <span className="hidden md:inline">Keluar</span>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderTeacher;
