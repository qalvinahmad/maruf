import { IconActivity, IconArrowRight, IconAward, IconBell, IconCalendar, IconCertificate, IconChartBar, IconChevronRight, IconConfetti, IconInfoCircle, IconLogout, IconMedal, IconSettings, IconStar, IconTrophy } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiAlertCircle, FiAward } from 'react-icons/fi';
import { FloatingDock } from '../../../components/ui/floating-dock';
import { supabase } from '../../../lib/supabaseClient';


export default function DashboardInformasi() {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pengumuman');
  const [teacherProfile, setTeacherProfile] = useState(null);
  const router = useRouter();
  
  // Cek apakah user sudah login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    // Ambil data user dari localStorage
    setUserName(localStorage.getItem('userName') || 'Pengguna');
    fetchTeacherProfile();
    
    // Simulasi loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [router]);
  
  const fetchTeacherProfile = async () => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) return;

      const { data, error } = await supabase
        .from('teacher_profiles')
        .select(`
          id,
          email,
          full_name,
          teaching_experience,
          institution,
          specialization,
          certifications,
          is_verified,
          status,
          updated_at
        `)
        .eq('id', teacherId)
        .single();

      if (error) throw error;
      setTeacherProfile(data);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
    }
  };
  
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
    //   href: "/dashboard/Dashboard", 
    //   onClick: () => router.push('/dashboard/Dashboard')
    // },
    // { 
    //   title: "Huruf", 
    //   icon: <IconLetterA />, 
    //   href: "/dashboard/DashboardHuruf", 
    //   onClick: () => router.push('/dashboard/DashboardHuruf')
    // },
    // { 
    //   title: "Belajar & Roadmap", 
    //   icon: <IconBook />, 
    //   href: "/dashboard/DashboardBelajar", 
    //   onClick: () => router.push('/dashboard/DashboardBelajar')
    // },
    { 
      title: "Informasi", 
      icon: <IconInfoCircle />, 
      href: "/dashboard/teacher/DashboardInformasi", 
      onClick: () => router.push('/dashboard/teacher/DashboardInformasi')
    },
    { 
      title: "Statistik", 
      icon: <IconChartBar />, 
      href: "/dashboard/teacher/DashboardStats", 
      onClick: () => router.push('/dashboard/teacher/DashboardStats')
    },
    { 
      title: "Aktivitas", 
      icon: <IconActivity />, 
      href: "/dashboard/teacher/DashboardActivityTeacher", 
      onClick: () => router.push('/dashboard/teacher/DashboardActivityTeacher')
    },
    // { 
    //   title: "Pengumuman", 
    //   icon: <IconBell />, 
    //   href: "/dashboard/Dashboard#announcement", 
    //   onClick: () => router.push('/dashboard/Dashboard#announcement')
    // },
    // { 
    //   title: "Proyek", 
    //   icon: <IconList />, 
    //   href: "/dashboard/Dashboard#projects", 
    //   onClick: () => router.push('/dashboard/Dashboard#projects')
    // },
    { 
      title: "Pengaturan", 
      icon: <IconSettings />, 
      href: "/dashboard/teacher/DashboardSettingsTeacher", 
      onClick: () => router.push('/dashboard/teacher/DashboardSettingsTeacher')
    },
  ];

  // Tab navigation
  const TabNavigation = () => {
    return (
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('pengumuman')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'pengumuman' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pengumuman
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'leaderboard' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Leaderboard
        </button>
        <button 
          onClick={() => setActiveTab('pencapaian')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === 'pencapaian' 
              ? 'bg-secondary text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pencapaian Terbaru
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Informasi - Belajar Makhrojul Huruf</title>
        <meta name="description" content="Informasi, pengumuman, dan pencapaian terbaru" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    {userName}
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Administrator</span>
                  </h2>
                  <div className="flex items-center text-xs text-gray-500 gap-3">
                    <span>{teacherProfile?.is_verified ? 'Terverifikasi • ' : ''}{teacherProfile?.status || 'Pending'}</span>
                    <span className="flex items-center gap-1 text-purple-600">
                      <IconCalendar size={12} />
                      <span>{teacherProfile?.teaching_experience || 'Belum ada'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      <IconTrophy size={12} />
                      <span>{teacherProfile?.specialization || 'Belum ada'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <FiAward size={12} />
                      <span>{teacherProfile?.institution || 'Belum ada'}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <IconBell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <IconLogout size={16} />
                  <span className="hidden md:inline">Keluar</span>
                </button>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-6 pb-24">
            {/* Welcome Banner */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-secondary to-blue-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden shadow-lg"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Informasi & Komunitas</h1>
                  <p className="text-white/80 max-w-md">Dapatkan informasi terbaru, lihat pencapaian pengguna lain, dan ikuti perkembangan komunitas belajar makhrojul huruf.</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('pengumuman')}
                  className="bg-white text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 shadow-md"
                >
                  <span>Lihat Pengumuman</span>
                  <IconArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
            
            {/* Tab Navigation */}
            <TabNavigation />
            
            {/* Tab Content */}
            <div className="space-y-6">
              {/* Pengumuman Tab */}
              {activeTab === 'pengumuman' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Pengumuman Penting */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Pengumuman Penting</h2>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Penting</span>
                    </div>
                    
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center text-red-600">
                          <FiAlertCircle size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Pemeliharaan Server</h3>
                          <p className="text-sm text-gray-600 mb-2">Kami akan melakukan pemeliharaan server pada tanggal 25 Juli 2023 pukul 01.00 - 03.00 WIB. Selama waktu tersebut, aplikasi tidak dapat diakses.</p>
                          <p className="text-xs text-gray-500">20 Juli 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pengumuman Terbaru */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Pengumuman Terbaru</h2>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">3 Baru</span>
                    </div>
                    
                    <div className="space-y-5">
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="border-l-4 border-blue-500 pl-4 py-1 bg-white hover:bg-blue-50 rounded-r-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-800">Update Fitur: Validasi Makhraj dengan AI</h3>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Baru</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">15 Juli 2023</p>
                        <p className="text-gray-600">Kami telah menambahkan fitur validasi makhraj berbasis AI yang dapat membantu Anda memperbaiki pelafalan huruf hijaiyah dengan lebih akurat. Fitur ini tersedia untuk semua pengguna.</p>
                        <div className="mt-3 flex gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-sm text-secondary hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <span>Baca Selengkapnya</span>
                            <IconChevronRight size={14} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                          >
                            Coba Sekarang
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="border-l-4 border-yellow-500 pl-4 py-1 bg-white hover:bg-yellow-50 rounded-r-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-800">Webinar: Metode Efektif Belajar Al-Qur'an</h3>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Baru</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">10 Juli 2023</p>
                        <p className="text-gray-600">Bergabunglah dalam webinar kami pada tanggal 20 Juli 2023 untuk mempelajari metode efektif dalam belajar Al-Qur'an bersama Ustadz Ahmad Zuhdi, M.Pd.I.</p>
                        <div className="mt-3 flex gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-sm text-secondary hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <span>Daftar Webinar</span>
                            <IconChevronRight size={14} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                          >
                            Lihat Detail
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="border-l-4 border-purple-500 pl-4 py-1 bg-white hover:bg-purple-50 rounded-r-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-800">Kompetisi Hafalan Juz 'Amma</h3>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Baru</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">5 Juli 2023</p>
                        <p className="text-gray-600">Daftarkan diri Anda dalam kompetisi hafalan Juz 'Amma yang akan diadakan secara online pada bulan Agustus 2023. Hadiah total senilai 10 juta rupiah.</p>
                        <div className="mt-3 flex gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-sm text-secondary hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <span>Daftar Kompetisi</span>
                            <IconChevronRight size={14} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                          >
                            Syarat & Ketentuan
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="border-l-4 border-gray-300 pl-4 py-1 bg-white hover:bg-gray-50 rounded-r-lg transition-colors"
                      >
                        <h3 className="font-semibold text-gray-800">Pembaruan Aplikasi v2.5</h3>
                        <p className="text-sm text-gray-500 mb-2">28 Juni 2023</p>
                        <p className="text-gray-600">Kami telah merilis pembaruan aplikasi v2.5 dengan peningkatan performa dan perbaikan bug. Pastikan aplikasi Anda sudah diperbarui ke versi terbaru.</p>
                        <div className="mt-3 flex gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-sm text-secondary hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <span>Lihat Perubahan</span>
                            <IconChevronRight size={14} />
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Leaderboard Tab */}
              {activeTab === 'leaderboard' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Filter Periode */}
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary text-white shadow-sm">Minggu Ini</button>
                      <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Bulan Ini</button>
                      <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Sepanjang Waktu</button>
                    </div>
                  </div>
                  
                  {/* Top 3 */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-xl font-bold text-gray-800">Top Performers</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Minggu Ini</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      {/* Second Place */}
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="relative pt-8 pb-4 px-4 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl text-center border border-gray-200"
                      >
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-[#C0C0C0] text-white flex items-center justify-center font-bold shadow-lg">2</div>
                        <div className="w-20 h-20 rounded-full bg-white mx-auto mb-3 flex items-center justify-center text-xl font-bold text-secondary border-4 border-[#C0C0C0] shadow-md">
                          F
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Fatimah</h3>
                        <p className="text-sm text-gray-600 mb-2">Level 6 • Menengah</p>
                        <p className="text-lg font-bold text-gray-800 mb-2">2,850 XP</p>
                        <div className="flex justify-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">21 Huruf</span>
                        </div>
                      </motion.div>

                      {/* First Place */}
                      <motion.div 
                        whileHover={{ y: -8 }}
                        className="relative pt-10 pb-6 px-4 bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-xl text-center border-2 border-yellow-300 shadow-xl -mt-4"
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">1</div>
                        <div className="w-24 h-24 rounded-full bg-white mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-yellow-600 border-4 border-yellow-400 shadow-md">
                          A
                        </div>
                        <h3 className="font-bold text-xl mb-1">Ahmad Fauzi</h3>
                        <p className="text-sm text-gray-600 mb-2">Level 8 • Mahir</p>
                        <p className="text-xl font-bold text-gray-800 mb-3">3,420 XP</p>
                        <div className="flex justify-center gap-2">
                          <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full">28 Huruf</span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">14 Hari Streak</span>
                        </div>
                      </motion.div>

                      {/* Third Place */}
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="relative pt-8 pb-4 px-4 bg-gradient-to-b from-[#FFA07A] to-[#CD853F] bg-opacity-10 rounded-xl text-center border border-[#CD853F]"
                      >
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-[#CD853F] text-white flex items-center justify-center font-bold shadow-lg">3</div>
                        <div className="w-20 h-20 rounded-full bg-white mx-auto mb-3 flex items-center justify-center text-xl font-bold text-secondary border-4 border-[#CD853F] shadow-md">
                          M
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Maemunah</h3>
                        <p className="text-sm text-gray-600 mb-2">Level 5 • Pemula Lanjutan</p>
                        <p className="text-lg font-bold text-gray-800 mb-2">2,340 XP</p>
                        <div className="flex justify-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">18 Huruf</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Daftar Lainnya */}
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peringkat</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Huruf</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {[4, 5, 6, 7, 8].map((rank) => (
                            <tr key={rank} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rank}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold mr-3">
                                    {['R', 'S', 'H', 'Z', 'N'][rank-4]}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {['Rahmat', 'Siti Aisyah', 'Hasan', 'Zainab', 'Nur Hidayah'][rank-4]}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Level {[5, 4, 4, 3, 3][rank-4]} • {['Pemula Lanjutan', 'Pemula Lanjutan', 'Pemula Lanjutan', 'Pemula', 'Pemula'][rank-4]}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {[2100, 1950, 1820, 1650, 1540][rank-4]} XP
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                  {[16, 15, 14, 12, 10][rank-4]} Huruf
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Your text-center section */}
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-500 mb-2">Peringkat Anda</p>
                      <div className="bg-blue-50 rounded-lg p-3 inline-block">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-700">12</span>
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{userName}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-700">1250 XP</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">12 Huruf</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Pencapaian Tab */}
              {activeTab === 'pencapaian' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Pencapaian Terbaru</h2>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Hari Ini</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                          <IconTrophy size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-gray-800">Ahmad Fauzi</h3>
                            <span className="text-xs text-gray-500">10 menit yang lalu</span>
                          </div>
                          <p className="text-gray-600">Telah menyelesaikan seluruh kelas Makhrojul Huruf</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <IconMedal size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-gray-800">Maemunah</h3>
                            <span className="text-xs text-gray-500">45 menit yang lalu</span>
                          </div>
                          <p className="text-gray-600">Mencapai tingkat Mahir dalam pembelajaran Makhrojul Huruf</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <IconStar size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-gray-800">Fatimah</h3>
                            <span className="text-xs text-gray-500">1 jam yang lalu</span>
                          </div>
                          <p className="text-gray-600">Mendapatkan 5 bintang dalam latihan pengucapan huruf</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <IconAward size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-gray-800">Hasan</h3>
                            <span className="text-xs text-gray-500">2 jam yang lalu</span>
                          </div>
                          <p className="text-gray-600">Menyelesaikan 10 hari streak belajar berturut-turut</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                          <IconCertificate size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-gray-800">Siti Aisyah</h3>
                            <span className="text-xs text-gray-500">3 jam yang lalu</span>
                          </div>
                          <p className="text-gray-600">Mendapatkan sertifikat penyelesaian kursus dasar Makhrojul Huruf</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <IconConfetti size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-gray-800">Zainab</h3>
                            <span className="text-xs text-gray-500">5 jam yang lalu</span>
                          </div>
                          <p className="text-gray-600">Berhasil menyelesaikan tantangan mingguan dengan skor sempurna</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-secondary hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
                      >
                        <span>Lihat Semua Pencapaian</span>
                        <IconChevronRight size={14} />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Pencapaian Anda</h2>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">2 Baru</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/50 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 z-10">
                            <IconStar size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">Penguasaan Huruf</h3>
                            <p className="text-sm text-gray-600 mb-2">Anda telah menguasai 12 dari 28 huruf hijaiyah</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '43%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">43% selesai</p>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200/50 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 z-10">
                            <IconCalendar size={24} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">Streak Belajar</h3>
                            <p className="text-sm text-gray-600 mb-2">Anda telah belajar selama 7 hari berturut-turut</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                <div key={day} className="w-8 h-2 bg-purple-400 rounded-full"></div>
                              ))}
                              {[8, 9, 10].map((day) => (
                                <div key={day} className="w-8 h-2 bg-gray-200 rounded-full"></div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">3 hari lagi untuk mencapai 10 hari</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </main>
          {/* Floating Dock */}
                  <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <FloatingDock items={dockItems} />
        </div>
        </>
      )}
    </div>
  );
}