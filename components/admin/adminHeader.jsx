import { IconLogout, IconMessageHeart, IconShield, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const AdminHeader = ({ userName, onLogout }) => {
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // Enhanced logout function with proper cleanup
  const handleLogout = async () => {
    try {
      // Call the parent logout function first (it has the navigation logic)
      if (onLogout && typeof onLogout === 'function') {
        await onLogout();
      } else {
        // Fallback logout implementation if no parent function is provided
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Error during logout:', error);
        }
        
        // Clear local storage
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        // Redirect to login page
        window.location.href = '/authentication/admin/loginAdmin';
      }
      
      // Clear local state
      setAdminProfile(null);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: still try to redirect
      window.location.href = '/authentication/admin/loginAdmin';
    }
  };

  // Fetch admin profile data with enhanced UX feedback
  const fetchAdminProfile = async () => {
    try {
      setIsRefreshing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data: adminData, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching admin profile:', error);
        return;
      }

      if (adminData) {
        setAdminProfile(adminData);
        
        // Update last_login with optimistic UI update
        await supabase
          .from('admin_profiles')
          .update({ 
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', adminData.id);
      }
    } catch (error) {
      console.error('Error in fetchAdminProfile:', error);
    } finally {
      setIsLoading(false);
      // Provide satisfying completion feedback
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Enhanced network monitoring with visual feedback
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Subtle success feedback when connection is restored
      if (!isOnline) {
        setTimeout(() => fetchAdminProfile(), 500);
      }
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // Semantic color system based on psychology and accessibility
  const getAdminLevelColor = (level) => {
    const colorMap = {
      superadmin: 'bg-gradient-to-r from-violet-100 via-purple-50 to-violet-100 text-violet-700 border-violet-200',
      senior: 'bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 text-blue-700 border-blue-200',
      junior: 'bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200',
      default: 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 text-slate-700 border-slate-200'
    };
    return colorMap[level?.toLowerCase()] || colorMap.default;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      superadmin: 'bg-gradient-to-r from-rose-100 via-red-50 to-rose-100 text-red-700 border-red-200',
      admin: 'bg-gradient-to-r from-indigo-100 via-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200',
      default: 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 text-slate-700 border-slate-200'
    };
    return colorMap[role?.toLowerCase()] || colorMap.default;
  };

  // Progressive disclosure - show only essential info first
  const displayName = adminProfile?.full_name || userName || 'Admin';
  const isActiveUser = adminProfile?.is_active;

  return (
    <header className="sticky top-0 z-50 border-b border-white/20">
      {/* Enhanced glassmorphism with better color theory */}
      <div className="bg-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-sm border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            
            {/* Left section: User identity with clear visual hierarchy */}
            <div className="flex items-center gap-4">
              
              {/* Avatar with enhanced visual feedback */}
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-blue-200 ring-offset-2 transition-all duration-300 group-hover:shadow-xl group-hover:ring-blue-300">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                
                {/* Admin shield with micro-interaction */}
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <IconShield size={10} className="text-white" />
                </motion.div>
                
                {/* Online status indicator with pulse animation */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ring-2 ring-white transition-all duration-300 ${
                  isOnline && isActiveUser ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                }`} />
              </motion.div>
              
              {/* User info with improved typography and spacing */}
              <div className="space-y-1">
                
                {/* Primary info: Name and role with clear hierarchy */}
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-lg text-slate-800 tracking-tight">
                    {displayName}
                  </h2>
                  
                  {/* Combined Role and Level badge with better design */}
                  {adminProfile?.role && (
                    <motion.span 
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm shadow-sm ${getRoleColor(adminProfile.role)}`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <IconUser size={8} />
                      {adminProfile.role}
                      {adminProfile.admin_level && (
                        <>
                          <span className="text-current/60">·</span>
                          <span className="capitalize">{adminProfile.admin_level}</span>
                        </>
                      )}
                    </motion.span>
                  )}
                </div>
                
                {/* Secondary info: Status indicator only */}
                <div className="flex items-center gap-3 text-xs">
                  
                  {/* Status indicator with semantic colors */}
                  <span className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isActiveUser ? 'bg-emerald-500 shadow-emerald-200 shadow-sm' : 'bg-slate-400'
                    }`} />
                    <span className={`font-medium ${
                      isActiveUser ? 'text-emerald-700' : 'text-slate-600'
                    }`}>
                      {isActiveUser ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right section: Actions with clear affordances */}
            <div className="flex items-center gap-2">
              
              {/* Message Heart Button */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/CreateMessageAdmin')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all duration-300 shadow-sm hover:shadow-md group"
                title="Buat Pesan Baru"
              >
                <IconMessageHeart size={16} className="transition-transform duration-200 group-hover:scale-110" />
                <span className="hidden md:inline font-medium text-sm">Pesan</span>
              </motion.button>
              
              {/* Enhanced logout button with proper functionality */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:border-white/60 text-slate-600 hover:text-slate-800 transition-all duration-300 shadow-sm hover:shadow-md group"
                title="Keluar dari Sistem"
              >
                <IconLogout size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span className="hidden md:inline font-medium text-sm">Keluar</span>
              </motion.button>
            </div>
          </div>
          
          {/* System status indicators with improved information architecture */}
          <div className="mt-3 flex justify-center">
            
            {/* Offline indicator with actionable messaging */}
            {!isOnline && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-full shadow-sm"
              >
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-amber-700 text-xs font-medium">
                  Mode Offline - Beberapa fitur mungkin terbatas
                </span>
              </motion.div>
            )}
            
            {/* Loading indicator with progressive disclosure */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-full shadow-sm"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <span className="text-blue-700 text-xs font-medium">
                  Memuat data admin...
                </span>
              </motion.div>
            )}
            
          
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
