import { IconActivity, IconArrowDownRight, IconArrowUpRight, IconBook, IconChartBar, IconChartPie, IconClock, IconList, IconSettings, IconUserCheck, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FloatingDock } from '../../../../components/ui/floating-dock';

const DashboardStatsAdmin = () => {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState('Minggu Ini');
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/');
  };
  
    const dockItems = [
    // { 
    //   title: "Dashboard", 
    //   icon: <IconHome />, 
    //   onClick: () => router.push('/dashboard/Dashboard')
    // },
    // { 
    //   title: "Huruf", 
    //   icon: <IconLetterA />, 
    //   onClick: () => router.push('/dashboard/DashboardHuruf')
    // },
    // { 
    //   title: "Belajar & Roadmap", 
    //   icon: <IconBook />, 
    //   onClick: () => router.push('/dashboard/DashboardBelajar')
    // },
    // { 
    //   title: "Informasi", 
    //   icon: <IconInfoCircle />, 
    //   onClick: () => router.push('/dashboard/DashboardInformasi')
    // },
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
    // { 
    //   title: "Pengumuman", 
    //   icon: <IconBell />, 
    //   onClick: () => router.push('/dashboard/Dashboard#announcement')
    // },
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
    // { 
    //   title: "Logout", 
    //   icon: <IconLogout />, 
    //   onClick: handleLogout 
    // },
  ];
  

  // Data untuk grafik performa (simulasi)
  const performanceData = [
    { day: 'Sen', value: 65 },
    { day: 'Sel', value: 72 },
    { day: 'Rab', value: 68 },
    { day: 'Kam', value: 80 },
    { day: 'Jum', value: 74 },
    { day: 'Sab', value: 62 },
    { day: 'Min', value: 70 },
  ];

  // Data untuk grafik distribusi kesulitan huruf
  const difficultyDistribution = [
    { level: 'Mudah', percentage: 45, color: 'bg-green-500' },
    { level: 'Sedang', percentage: 35, color: 'bg-yellow-500' },
    { level: 'Sulit', percentage: 20, color: 'bg-red-500' },
  ];

  // Periode waktu yang tersedia
  const timePeriods = ['Minggu Ini', 'Bulan Ini', '3 Bulan Terakhir', 'Tahun Ini'];

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <main className="container mx-auto px-4 py-10 pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Statistik Pembelajaran</h1>
            <p className="text-gray-500 mt-1">Pantau perkembangan belajar Anda</p>
          </div>
          
          {/* Pilihan Periode dengan desain yang lebih modern */}
          <div className="mt-4 md:mt-0 bg-white rounded-full shadow-sm p-1 flex space-x-1">
            {timePeriods.map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-4 py-2 text-sm rounded-full transition-all ${activePeriod === period 
                  ? 'bg-secondary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        {/* Statistik Utama dengan kartu yang lebih menarik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Pengguna</p>
                <h3 className="text-3xl font-bold text-gray-800">1,245</h3>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <IconArrowUpRight size={14} className="mr-1" />
                  <span>+5.2% dari bulan lalu</span>
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <IconUsers className="text-blue-600" size={24} />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pengguna Aktif</p>
                <h3 className="text-3xl font-bold text-gray-800">876</h3>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <IconArrowUpRight size={14} className="mr-1" />
                  <span>+3.1% dari minggu lalu</span>
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IconUserCheck className="text-green-600" size={24} />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Sesi Belajar</p>
                <h3 className="text-3xl font-bold text-gray-800">5,432</h3>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <IconArrowUpRight size={14} className="mr-1" />
                  <span>+12.3% dari bulan lalu</span>
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <IconBook className="text-purple-600" size={24} />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Rata-rata Waktu</p>
                <h3 className="text-3xl font-bold text-gray-800">23<span className="text-lg">min</span></h3>
                <p className="text-xs text-red-500 mt-2 flex items-center">
                  <IconArrowDownRight size={14} className="mr-1" />
                  <span>-1.5% dari minggu lalu</span>
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <IconClock className="text-orange-600" size={24} />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Grafik dan Detail Statistik */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Grafik Performa */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Performa Belajar Harian</h3>
            <div className="h-64 flex items-end space-x-2">
              {performanceData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${item.value}%` }}>
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-secondary rounded-t-lg transition-all duration-500" 
                      style={{ height: `${item.value}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Detail Statistik dengan desain yang lebih menarik */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Detail Statistik</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <IconUsers size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Total Pengguna</span>
                </div>
                <span className="font-bold text-gray-800">1,245</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <IconUserCheck size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Pengguna Baru</span>
                </div>
                <span className="font-bold text-gray-800">124</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <IconActivity size={16} className="text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Pengguna Aktif Harian</span>
                </div>
                <span className="font-bold text-gray-800">342</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <IconClock size={16} className="text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-600">Rata-rata Waktu</span>
                </div>
                <span className="font-bold text-gray-800">23 menit/hari</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                    <IconChartPie size={16} className="text-teal-600" />
                  </div>
                  <span className="text-sm text-gray-600">Penyelesaian Kursus</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-gray-800 mr-2">68%</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Distribusi Tingkat Kesulitan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribusi Tingkat Kesulitan Huruf</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2">
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
                {difficultyDistribution.map((item, index) => (
                  <div 
                    key={index} 
                    className={`${item.color} h-full`} 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {difficultyDistribution.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-1`}></div>
                    <span className="text-xs text-gray-600">{item.level}: {item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Huruf Tersulit</p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-800 mr-2">ض</span>
                  <div className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">62% Keberhasilan</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Huruf Termudah</p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-800 mr-2">ا</span>
                  <div className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">98% Keberhasilan</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Statistik Huruf dengan desain tabel yang lebih modern */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Statistik Huruf Hijaiyah</h3>
            <button className="text-sm text-secondary hover:text-secondary/80 transition-colors">Lihat Semua</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Huruf</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tingkat Kesulitan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tingkat Keberhasilan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Latihan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-gray-800">ض</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Tinggi</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">62%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">1,245</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-gray-800">ظ</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Tinggi</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">58%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">1,120</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-gray-800">ع</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Sedang</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">75%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">1,532</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-gray-800">ح</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Sedang</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">72%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">1,345</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-gray-800">خ</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Sedang</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">70%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">1,289</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

                        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                          <FloatingDock items={dockItems} />
                        </div>
    </div>
  );
};

export default DashboardStatsAdmin;