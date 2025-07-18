import { IconActivity, IconBook, IconChartBarPopular, IconCpu, IconDatabase, IconNetwork, IconServer, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getCachedData, setCachedData } from '../../../lib/clientSafeCache';
import { supabase } from '../../../lib/supabaseClient';

const Overview = () => {
  const [serverStats, setServerStats] = useState({
    dbSize: '0 MB',
    totalRows: '0',
    activeConnections: '0',
    uptime: '0',
    maxCapacity: '500'
  });

  // Enhanced fetch function for server stats with Redis caching
  const fetchServerStats = async () => {
    try {
      const cacheKey = 'server_stats_data';
      
      // Try to get cached data from Redis first (1 minute cache for real-time stats)
      let cachedStats = await getCachedData(cacheKey);
      
      if (cachedStats) {
        setServerStats(cachedStats);
        return;
      }
      
      // Fetch from database
      const { data, error } = await supabase
        .rpc('get_server_stats');
      
      if (error) throw error;
      
      const statsData = {
        dbSize: data.db_size || '0 MB',
        totalRows: data.total_rows || '0',
        activeConnections: data.active_connections || '0',
        uptime: data.uptime || '0',
        maxCapacity: data.max_capacity || '1024'
      };
      
      // Cache in Redis for 1 minute (short cache for real-time data)
      await setCachedData(cacheKey, statsData, 60);
      
      setServerStats(statsData);
    } catch (error) {
      console.error('Error fetching server stats:', error);
      setServerStats({
        dbSize: '0 MB',
        totalRows: '0',
        activeConnections: '0',
        uptime: '0',
        maxCapacity: '1024'
      });
    }
  };

  useEffect(() => {
    fetchServerStats();
    // Set up interval to refresh stats every 5 minutes
    const interval = setInterval(fetchServerStats, 300000);
    return () => clearInterval(interval);
  }, []);

  // Helper functions
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days} hari, ${hours} jam, ${minutes} menit`;
  };

  const calculateDatabaseUsage = (size, maxSize) => {
    const currentSize = parseFloat(size);
    const maxCapacity = parseFloat(maxSize);
    return (currentSize / maxCapacity) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Platform Statistics Section */}
      <section className="mb-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Statistik Platform
          </h2>
          <p className="text-sm text-gray-600">
            Overview performa dan aktivitas platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Stat Card 1 - Users */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-100/50 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <IconUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Pengguna</p>
                <p className="text-2xl font-bold text-blue-700 mb-1">1,247</p>
                <p className="text-xs text-gray-500">aktif bulan ini</p>
              </div>
            </div>
          </motion.div>

          {/* Stat Card 2 - Content */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100/50 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <IconBook className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                  +12
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Konten Pembelajaran</p>
                <p className="text-2xl font-bold text-emerald-700 mb-1">89</p>
                <p className="text-xs text-gray-500">materi tersedia</p>
              </div>
            </div>
          </motion.div>

          {/* Stat Card 3 - Activity */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-100/50 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <IconActivity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <span className="text-xs text-purple-600 font-medium">Live</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Aktivitas Harian</p>
                <p className="text-2xl font-bold text-purple-700 mb-1">432</p>
                <p className="text-xs text-gray-500">interaksi hari ini</p>
              </div>
            </div>
          </motion.div>

          {/* Stat Card 4 - Performance */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-orange-100/50 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <IconChartBarPopular className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                    <polygon points="0,8 4,0 8,8" />
                  </svg>
                  <span className="text-xs text-green-600 font-medium">+15%</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Tingkat Penyelesaian</p>
                <p className="text-2xl font-bold text-orange-700 mb-1">78%</p>
                <p className="text-xs text-gray-500">rata-rata completion</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Activity Chart Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Aktivitas Terbaru</h2>
        <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center border border-gray-100">
          <p className="text-gray-500 text-sm">Grafik aktivitas pengguna akan muncul di sini.</p>
        </div>
      </section>

      {/* Server Statistics Section */}
      <section className="mt-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Statistik Server
          </h2>
          <p className="text-sm text-gray-600">
            Pantau performa sistem secara real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Database Stats */}
          <motion.div
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-indigo-100/50 group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <IconDatabase className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                {calculateDatabaseUsage(serverStats.dbSize, serverStats.maxCapacity).toFixed(1)}%
              </span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Ukuran Database</p>
              <p className="text-2xl font-bold text-indigo-700 mb-1">{serverStats.dbSize}</p>
              <p className="text-xs text-gray-500 mb-3">dari {serverStats.maxCapacity} MB</p>
              
              <div className="w-full bg-gray-200/60 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateDatabaseUsage(serverStats.dbSize, serverStats.maxCapacity)}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="bg-indigo-500 h-2 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Total Data */}
          <motion.div
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100/50 group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <IconServer className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-600 font-medium">Live</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Data</p>
              <p className="text-2xl font-bold text-emerald-700 mb-1">{parseInt(serverStats.totalRows).toLocaleString()}</p>
              <p className="text-xs text-gray-500">records tersimpan</p>
            </div>
          </motion.div>

          {/* Active Connections */}
          <motion.div
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-100/50 group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <IconNetwork className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span className="text-xs text-blue-600 font-medium">Online</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Koneksi Aktif</p>
              <p className="text-2xl font-bold text-blue-700 mb-1">{serverStats.activeConnections}</p>
              <p className="text-xs text-gray-500">koneksi real-time</p>
            </div>
          </motion.div>

          {/* Server Uptime */}
          <motion.div
            whileHover={{ y: -8, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-100/50 group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <IconCpu className="w-6 h-6 text-purple-600" />
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Server Uptime</p>
              <p className="text-2xl font-bold text-purple-700 mb-1">{formatUptime(parseFloat(serverStats.uptime))}</p>
              <p className="text-xs text-gray-500">availability 99.9%</p>
            </div>
          </motion.div>
          
        </div>
      </section>
    </motion.div>
  );
};

export default Overview;
