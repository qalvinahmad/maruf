import { IconBuilding, IconChartBar, IconList, IconReport, IconSettings, IconStar } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../../../components/Layout';
import { useAuth } from '../../../../context/AuthContext';

const AdminProjectDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin access
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    setIsLoading(false);
  }, [user, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const menuItems = [
    {
      title: 'Project Overview',
      description: 'Ringkasan proyek dan statistik utama',
      icon: IconChartBar,
      href: '/dashboard/admin/project/overview',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Project Management',
      description: 'Kelola proyek dan pengaturan admin',
      icon: IconSettings,
      href: '/dashboard/admin/project/management',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Project Rating',
      description: 'Kelola rating dan review pengguna',
      icon: IconStar,
      href: '/dashboard/admin/project/rating',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600'
    },
    {
      title: 'Project Store',
      description: 'Kelola toko dan item dalam game',
      icon: IconBuilding,
      href: '/dashboard/admin/project/store',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'Project Reports',
      description: 'Laporan dan analisis data proyek',
      icon: IconReport,
      href: '/dashboard/admin/project/reports',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    },
    {
      title: 'Project List',
      description: 'Daftar semua proyek yang dikelola',
      icon: IconList,
      href: '/dashboard/admin/project/list',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Admin Project Dashboard
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Kelola semua aspek proyek dari satu dashboard terpusat
            </motion.p>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group cursor-pointer"
                  onClick={() => router.push(item.href)}
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 group-hover:shadow-2xl group-hover:border-gray-300">
                    {/* Icon Header */}
                    <div className={`${item.color} ${item.hoverColor} transition-colors duration-300 p-6`}>
                      <div className="flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                          <IconComponent size={40} className="text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                        <span>Buka Dashboard</span>
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <motion.div 
            className="mt-16 bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                <div className="text-gray-600">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">856</div>
                <div className="text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">4.8</div>
                <div className="text-gray-600">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">2.4M</div>
                <div className="text-gray-600">Total Points</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminProjectDashboard;
