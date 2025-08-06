import { IconActivity, IconBook, IconCalendarEvent, IconChartBar, IconDatabase, IconList, IconMessageHeart, IconPlus, IconSettings, IconUserCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminHeader from '../../../../components/admin/adminHeader';

import Announcements from '../../../../components/dashboard/admin/Announcements';
import Overview from '../../../../components/dashboard/admin/Overview';
import Penilaian from '../../../../components/dashboard/admin/Penilaian';
import Report from '../../../../components/dashboard/admin/Report';
import Store from '../../../../components/dashboard/admin/Store';
import { FloatingDock } from '../../../../components/ui/floating-dock';
import { supabase } from '../../../../lib/supabaseClient';

export default function DashboardProjects() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [activeTab, setActiveTab] = useState('overview');

  // Update auth check
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace('/authentication/admin/loginAdmin');
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

        // Set admin data
        setUserName(adminData.full_name || 'Admin');
        setIsLoading(false);

      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/authentication/admin/loginAdmin');
      }
    };

    checkAdminAuth();
  }, [router]);
  
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
  
  const dockItems = [
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
  ];

  // Enhanced Admin Menu Card with better hover effects
  const AdminMenuCard = ({ icon, title, description, bgColor, onClick }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        scale: 1.02
      }}
      whileTap={{ scale: 0.98 }}
      className={`${bgColor} p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100/50 backdrop-blur-sm group`}
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

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Panel Admin - Belajar Makhrojul Huruf</title>
        <meta name="description" content="Panel admin untuk mengelola konten pembelajaran makhrojul huruf" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          <AdminHeader userName={userName} onLogout={handleLogout} />

          <main className="container mx-auto px-4 py-6 pb-24">
            <div className="max-w-5xl mx-auto">
              {/* Enhanced Welcome Banner */}
              <motion.div className="relative min-h-[320px] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white p-8 rounded-3xl overflow-hidden">
                {/* Animated Gradient Background Layers */}
                <div className="absolute inset-0">
                  {/* Main animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-500/40 to-pink-500/30 animate-gradient-x"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-500/30 to-purple-600/25 animate-gradient-xy"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-indigo-500/25 via-purple-400/20 to-blue-500/30 animate-gradient-slow"></div>
                </div>

                {/* Enhanced Floating Elements with Continuous Movement */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-white/15 to-white/5 rounded-full animate-float-slow backdrop-blur-sm" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-white/10 to-transparent rounded-full transform translate-x-1/3 translate-y-1/3 animate-float-reverse" />
                
                {/* Additional Moving Elements */}
                <div className="absolute top-1/4 -left-8 w-24 h-24 bg-gradient-to-r from-cyan-300/20 to-blue-400/15 rounded-full animate-float-x" />
                <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-gradient-to-br from-purple-300/25 to-pink-400/15 rounded-full animate-bounce-slow" />
                
                {/* Small Floating Particles */}
                <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/30 rounded-full animate-pulse-slow shadow-lg" />
                <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-gradient-to-r from-white/20 to-cyan-200/25 rounded-full animate-float-gentle" />
                <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-white/25 rounded-full animate-twinkle" />
                <div className="absolute top-3/4 right-1/4 w-5 h-5 bg-gradient-to-br from-purple-200/30 to-white/15 rounded-full animate-orbit" />

                {/* Content */}
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1">
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent drop-shadow-lg"
                    >
                      Panel Admin
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/95 max-w-md text-lg leading-relaxed drop-shadow-sm"
                    >
                      Kelola konten pembelajaran makhrojul huruf dan pantau aktivitas pengguna dengan mudah
                    </motion.p>
                  </div>
                  
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -2,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/dashboard/admin/verification/AdminVerif')}
                    className="bg-white/95 backdrop-blur-sm text-blue-700 font-semibold py-3 px-6 rounded-xl hover:bg-white transition-all duration-300 flex items-center gap-2 shadow-xl hover:shadow-2xl border border-white/20"
                  >
                    <IconPlus size={18} />
                    <span>Tambah Admin</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Menu Admin Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-8">
                <AdminMenuCard 
                  icon={<IconDatabase className="text-blue-600" size={20} />}
                  title="Analisis Data"
                  description="Analisis penggunaan platform dan rekomendasi perbaikan"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/data/AdminData')}
                />
                <AdminMenuCard 
                  icon={<IconBook className="text-green-600" size={20} />}
                  title="Kelola Konten"
                  description="Kelola materi, modul, dan konten pembelajaran makhrojul huruf"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/content/AdminContent')}
                />
                <AdminMenuCard 
                  icon={<IconCalendarEvent className="text-purple-600" size={20} />}
                  title="Event & Aktivitas"
                  description="Kelola event dan aktivitas khusus pembelajaran"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/event/AdminEvent')}
                />
                <AdminMenuCard 
                  icon={<IconUserCheck className="text-amber-600" size={20} />}
                  title="Verifikasi"
                  description="Verifikasi akun guru dan pengawasan sistem pembelajaran"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/verification/AdminVerif')}
                />
              </div>
              
              {/* Container */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm p-8 mb-10 border border-white/50">
                {/* Tab Navigation */}
                <div className="flex gap-6 border-b border-gray-200 mb-8">
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'announcements', label: 'Pengumuman' },
                    { key: 'store', label: 'Store' },
                    { key: 'report', label: 'Report' },
                    { key: 'penilaian', label: 'Penilaian' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`pb-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeTab === tab.key
                          ? 'border-b-2 border-secondary text-secondary'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.key === 'announcements' && <IconMessageHeart size={16} />}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && <Overview />}
                {activeTab === 'announcements' && <Announcements />}
                {activeTab === 'store' && <Store />}
                {activeTab === 'report' && <Report />}
                {activeTab === 'penilaian' && <Penilaian />}
              </div>
            </div>
          </main>

          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <FloatingDock items={dockItems} />
          </div>
        </>
      )}
    </div>
  );
}
