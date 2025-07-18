import { IconActivity, IconAlertTriangle, IconArrowRight, IconCalendar, IconChartBar, IconCheck, IconClock, IconEdit, IconFilter, IconList, IconPlus, IconSearch, IconSettings, IconTrash, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FloatingDock } from '../../../../components/ui/floating-dock';

function DashboardActivity({ user, profile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua Aktivitas');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('Semua');
  
  useEffect(() => {
    // Cek apakah user sudah login
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);
  
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
  

  const activities = [
    {
      user: "Ahmad",
      action: "menyelesaikan latihan huruf ض",
      time: "2 jam yang lalu",
      color: "blue"
    },
    {
      user: "Fatimah",
      action: "menyelesaikan Level 3",
      time: "Kemarin, 15:30",
      color: "green"
    },
    {
      user: "Umar",
      action: "mendapatkan lencana 'Mahir Huruf'",
      time: "2 hari yang lalu",
      color: "purple"
    },
    {
      user: "Aisyah",
      action: "menyelesaikan kuis tajwid dengan skor 95%",
      time: "3 hari yang lalu",
      color: "yellow"
    },
    {
      user: "Ali",
      action: "bergabung dengan kelas 'Tajwid Lanjutan'",
      time: "5 hari yang lalu",
      color: "red"
    }
  ];

  const activeUsers = [
    { name: "Ahmad Fauzi", level: 8, streak: "15 hari", points: "2,450" },
    { name: "Fatimah Azzahra", level: 7, streak: "12 hari", points: "2,120" },
    { name: "Umar Hadi", level: 9, streak: "20 hari", points: "3,245" },
    { name: "Aisyah Putri", level: 6, streak: "8 hari", points: "1,890" },
    { name: "Ali Rahman", level: 5, streak: "7 hari", points: "1,560" }
  ];

  // Data tugas
  const tasks = [
    { 
      id: 1, 
      name: "Latihan Huruf ض", 
      deadline: "Hari ini, 15:00", 
      priority: "Tinggi", 
      status: "Belum Selesai",
      category: "Latihan"
    },
    { 
      id: 2, 
      name: "Kuis Tajwid Dasar", 
      deadline: "Besok, 10:00", 
      priority: "Sedang", 
      status: "Belum Selesai",
      category: "Kuis"
    },
    { 
      id: 3, 
      name: "Menyelesaikan Level 3", 
      deadline: "3 hari lagi", 
      priority: "Rendah", 
      status: "Dalam Proses",
      category: "Level"
    },
    { 
      id: 4, 
      name: "Latihan Huruf ظ", 
      deadline: "Kemarin", 
      priority: "Tinggi", 
      status: "Terlambat",
      category: "Latihan"
    },
    { 
      id: 5, 
      name: "Praktik Membaca Surah Al-Fatihah", 
      deadline: "5 hari lagi", 
      priority: "Sedang", 
      status: "Belum Selesai",
      category: "Praktik"
    }
  ];

  const filterOptions = [
    "Semua Aktivitas",
    "Latihan Huruf",
    "Kuis",
    "Penyelesaian Level"
  ];

  const taskFilterOptions = [
    "Semua",
    "Belum Selesai",
    "Dalam Proses",
    "Selesai",
    "Terlambat"
  ];

  const getColorClass = (color) => {
    const colorMap = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500"
    };
    return colorMap[color] || "bg-gray-500";
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      "Tinggi": "bg-red-100 text-red-700",
      "Sedang": "bg-yellow-100 text-yellow-700",
      "Rendah": "bg-green-100 text-green-700"
    };
    return priorityMap[priority] || "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "Belum Selesai": "bg-blue-100 text-blue-700",
      "Dalam Proses": "bg-purple-100 text-purple-700",
      "Selesai": "bg-green-100 text-green-700",
      "Terlambat": "bg-red-100 text-red-700"
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      "Belum Selesai": <IconClock size={14} className="text-blue-600" />,
      "Dalam Proses": <IconActivity size={14} className="text-purple-600" />,
      "Selesai": <IconCheck size={14} className="text-green-600" />,
      "Terlambat": <IconAlertTriangle size={14} className="text-red-600" />
    };
    return iconMap[status] || <IconClock size={14} className="text-gray-600" />;
  };

  // Filter tugas berdasarkan status
  const filteredTasks = taskFilter === 'Semua' 
    ? tasks 
    : tasks.filter(task => task.status === taskFilter);

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Aktivitas Pengguna - Dashboard</title>
        <meta name="description" content="Aktivitas pengguna dalam pembelajaran makhrojul huruf" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-10 pb-24 max-w-6xl">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Aktivitas Pengguna</h1>
            <p className="text-gray-600">Pantau aktivitas terbaru dari semua pengguna platform</p>
          </motion.div>
          
          {/* Filter & Search Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconFilter size={18} className="text-gray-400" />
                </div>
                <select 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-700 w-full md:w-auto"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  {filterOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconSearch size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari aktivitas..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
          
          {/* Tabel Tugas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <IconCalendar size={20} className="text-blue-500" />
                  Daftar Tugas
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      className="text-sm border border-gray-200 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-700"
                      value={taskFilter}
                      onChange={(e) => setTaskFilter(e.target.value)}
                    >
                      {taskFilterOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1">
                    <IconPlus size={16} />
                    Tambah Tugas
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                      <th className="px-6 py-3">Nama Tugas</th>
                      <th className="px-6 py-3">Tenggat Waktu</th>
                      <th className="px-6 py-3">Prioritas</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTasks.map((task, index) => (
                      <motion.tr 
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{task.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{task.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm">
                            <IconClock size={16} className="text-gray-500" />
                            <span>{task.deadline}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                            {getStatusIcon(task.status)}
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                              <IconEdit size={16} />
                            </button>
                            <button className="p-1.5 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors">
                              <IconCheck size={16} />
                            </button>
                            <button className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <IconTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredTasks.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <p>Tidak ada tugas yang ditemukan</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <IconActivity size={20} className="text-blue-500" />
                    Aktivitas Terbaru
                  </h2>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors">
                    Lihat Semua
                    <IconArrowRight size={16} />
                  </button>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {activities.map((activity, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getColorClass(activity.color)}`}></div>
                        <div className="flex-1">
                          <p className="text-gray-800">
                            <span className="font-medium">{activity.user}</span> telah {activity.action}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <IconCalendar size={14} />
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Active Users */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <IconUser size={20} className="text-blue-500" />
                    Pengguna Paling Aktif
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {activeUsers.map((user, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Level {user.level}</span>
                              <span>{user.streak}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{user.points}</p>
                          <p className="text-xs text-gray-500">Poin</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-100">
                  <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-1">
                    Lihat Semua Pengguna
                    <IconArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      )}

                        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                          <FloatingDock items={dockItems} />
                        </div>
    </div>
  );
};

export default DashboardActivity;