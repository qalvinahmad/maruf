import {
  IconActivity,
  IconArrowRight,
  IconBell, IconBook, IconChartBar, IconCheck,
  IconEdit,
  IconFileAnalytics, IconList, IconLogout, IconSettings, IconTrash, IconUsers, IconX
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion'; // Add AnimatePresence import
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FloatingDock } from '../../../../components/ui/floating-dock';
import { supabase } from '../../../../lib/supabaseClient';

export default function AdminVerif() {
  const router = useRouter();
  const [userName, setUserName] = useState('Admin');
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    full_name: '',
    role: '',
    is_active: false
  });
  const [activeTab, setActiveTab] = useState('teachers');
  const [error, setError] = useState(null);

  const fetchVerifications = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching verifications...');

      const { data: verificationData, error } = await supabase
        .from('teacher_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }

      console.log('Fetched data:', verificationData);
      setVerifications(verificationData || []);

    } catch (error) {
      console.error('Error fetching verifications:', error);
      setError('Failed to fetch verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/authentication/admin/loginAdmin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update auth check useEffect
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace('/authentication/admin/loginAdmin');
          return;
        }

        setProfileData({
          full_name: session.user.user_metadata?.full_name || 'Admin',
          role: 'Administrator',
          is_active: true
        });

        await fetchVerifications();

      } catch (error) {
        console.error('Auth check error:', error);
        setError(error.message);
        router.replace('/authentication/admin/loginAdmin');
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  // Remove the problematic useEffect that causes infinite loop
  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       if (verifications.length > 0) {
  //         setVerifications(verifications);
  //         setIsLoading(false);
  //       } else {
  //         fetchVerifications();
  //       }
  //     } catch (error) {
  //       console.error('Load error:', error);
  //     }
  //   };
  //   
  //   loadData();
  // }, [verifications]);

  // Update the fetchVerifications function
  // const fetchVerifications = async () => {
  //   try {
  //     setIsLoading(true);
  //     console.log('Fetching verifications...');
  //
  //     const { data, error } = await supabase
  //       .from('teacher_verifications')
  //       .select('*')
  //       .order('created_at', { ascending: false });
  //
  //     if (error) {
  //       console.error('Fetch error:', error);
  //       throw error;
  //     }
  //
  //     console.log('Fetched data:', data);
  //     setVerifications(data || []);
  //
  //   } catch (error) {
  //     console.error('Error fetching verifications:', error);
  //     setError('Failed to fetch verifications');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const insertTestData = async () => {
    try {
      const testData = [
        {
          full_name: 'Ustadz Ahmad Fauzi',
          email: 'ahmad.fauzi@example.com',
          institution: 'Pondok Pesantren Al-Hikmah',
          status: 'pending'
        },
        {
          full_name: 'Ustadzah Fatimah Azzahra',
          email: 'fatimah@example.com',
          institution: 'Madrasah Aliyah Nurul Iman',
          status: 'verified'
        }
      ];

      const { error } = await supabase
        .from('teacher_verifications')
        .insert(testData);

      if (error) throw error;
      console.log('Test data inserted successfully');

    } catch (error) {
      console.error('Error inserting test data:', error);
    }
  };

  // Create new teacher verification
  const createTeacher = async (teacherData) => {
    const { data, error } = await supabase
      .from('teacher_verifications')
      .insert([teacherData])
      .select();

    if (error) {
      console.error('Error creating teacher:', error);
      return;
    }

    fetchVerifications();
  };

  // Update teacher verification status
  const updateTeacherStatus = async (id, status, reason = null) => {
    const updateData = {
      status,
      verification_date: new Date().toISOString(),
      verified_by: supabase.auth.user()?.id,
    };

    if (reason) {
      updateData.rejection_reason = reason;
    }

    const { error } = await supabase
      .from('teacher_verifications')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating teacher:', error);
      return;
    }

    fetchVerifications();
  };

  // Modified verification handler without auth check
  const handleVerification = async (id, action) => {
    try {
      // Get verification data
      const { data: verificationData, error: fetchError } = await supabase
        .from('teacher_verifications')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const status = action === 'verify' ? 'verified' : 
                     action === 'reject' ? 'rejected' : 'pending';

      if (status === 'verified') {
        // First create profile
        const profileData = {
          id: verificationData.id,
          email: verificationData.email,
          full_name: verificationData.full_name,
          teaching_experience: verificationData.credentials?.teaching_experience || '',
          institution: verificationData.institution,
          specialization: verificationData.credentials?.specializations?.[0] || '',
          certifications: '',
          is_verified: true,
          status: 'active'
        };

        // Try to delete existing profile if any
        await supabase
          .from('teacher_profiles')
          .delete()
          .eq('id', verificationData.id);

        // Create new profile
        const { error: profileError } = await supabase
          .from('teacher_profiles')
          .insert([profileData]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Gagal membuat profil guru: ' + profileError.message);
        }

        // If profile created successfully, update verification
        const { error: verificationError } = await supabase
          .from('teacher_verifications')
          .update({
            status,
            verification_date: new Date().toISOString(),
            teacher_code: 'T123'
          })
          .eq('id', id);

        if (verificationError) throw verificationError;

        alert(`Verifikasi berhasil!\nKode guru: T123\nBerikan kode ini kepada guru yang bersangkutan.`);
      } else {
        // Just update verification status for reject/revoke
        const { error: verificationError } = await supabase
          .from('teacher_verifications')
          .update({
            status,
            verification_date: new Date().toISOString(),
            teacher_code: null,
            rejection_reason: action === 'reject' ? 
              prompt('Masukkan alasan penolakan:', verificationData.rejection_reason || '') : null
          })
          .eq('id', id);

        if (verificationError) throw verificationError;

        // Delete teacher profile if exists when rejecting/revoking
        await supabase
          .from('teacher_profiles')
          .delete()
          .eq('id', id);
      }

      await fetchVerifications();

    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  // const handleLogout = () => {
  //   localStorage.removeItem('isLoggedIn');
  //   localStorage.removeItem('userName');
  //   localStorage.removeItem('userEmail');
  //   router.push('/');
  // };
  
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
      onClick: () => router.push('/dashboard/admin/DashboardActivity')
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
  

  const AddTeacherModal = () => (
    <AnimatePresence>
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAddModal(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tambah Verifikasi Guru</h3>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  name="full_name"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Institusi</label>
                <input
                  name="institution"
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-blue-700"
                                  >
                                    Tambah
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    );
                  
                    const handleAddTeacher = async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      
                      try {
                        const { data, error } = await supabase
                          .from('teacher_verifications')
                          .insert([{
                            full_name: formData.get('full_name'),
                            email: formData.get('email'),
                            institution: formData.get('institution'),
                            status: 'pending',
                            registration_date: new Date().toISOString()
                          }]);
                  
                        if (error) throw error;
                        
                        setShowAddModal(false);
                        fetchVerifications();
                        alert('Guru berhasil ditambahkan');
                      } catch (error) {
                        console.error('Error adding teacher:', error);
                        alert('Gagal menambahkan guru');
                      }
                    };
                  
                    // Modified filter handler
                    const handleFilterChange = (newFilter) => {
                      setStatusFilter(newFilter);
                      setCurrentPage(1); // Reset to first page when filter changes
                    };
                  
                    // Modified items per page handler
                    const handleItemsPerPageChange = (newValue) => {
                      setItemsPerPage(Number(newValue));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    };
                  
                    // Tab navigation component
                    const TabNavigation = () => {
                      return (
                        <div className="mb-6 border-b">
                          <ul className="flex flex-wrap -mb-px">
                            <li className="mr-2">
                              <button 
                                onClick={() => setActiveTab('teachers')}
                                className="inline-block p-4 border-b-2 border-secondary text-secondary"
                              >
                                Verifikasi Guru
                              </button>
                            </li>
                          </ul>
                        </div>
                      );
                    };
                  
                    if (error) {
                      return (
                        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                          <div className="bg-white p-8 rounded-xl shadow-md">
                            <p className="text-red-600">Error: {error}</p>
                            <button
                              onClick={() => router.push('/authentication/admin/loginAdmin')}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                              Back to Login
                            </button>
                          </div>
                        </div>
                      );
                    }
                  
                    return (
                      <div className="bg-gray-50 min-h-screen font-poppins">
                        <Head>
                          <meta name="description" content="Verifikasi akun guru dan pengawasan sistem pembelajaran" />
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
                              <div className="max-w-7xl mx-auto px-4 py-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white">
                                      {profileData.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h2 className="font-semibold text-gray-800">
                                        {profileData.full_name}
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                          Administrator
                                        </span>
                                      </h2>
                                    </div>
                                  </div>
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
                              <div className="bg-gradient-to-r from-secondary to-blue-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
                                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                  <div>
                                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel Verifikasi & Pengawasan</h1>
                                    <p className="text-white/80 max-w-md">Kelola verifikasi akun guru, pengawasan konten pembelajaran, dan laporan pengguna untuk menjaga kualitas platform.</p>
                                  </div>
                                  <button 
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-white text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 shadow-md"
                                  >
                                    <span>Tambah Guru</span>
                                    <IconArrowRight size={18} />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Menu Admin dengan Animasi */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                                  onClick={() => router.push('/dashboard/admin/data/AdminData')}
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                      <IconFileAnalytics size={20} />
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Analisis Data</h3>
                                  </div>
                                  <p className="text-sm text-gray-600">Analisis penggunaan platform dan statistik pembelajaran</p>
                                </motion.div>
                                
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                                  onClick={() => router.push('/dashboard/admin/content/AdminContent')}
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                      <IconBook size={20} />
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Kelola Konten</h3>
                                  </div>
                                  <p className="text-sm text-gray-600">Kelola materi pembelajaran dan konten edukasi</p>
                                </motion.div>
                                
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                  className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                                  onClick={() => router.push('/dashboard/admin/activity/AdminEvent')}
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                      <IconBell size={20} />
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Kelola Event</h3>
                                  </div>
                                  <p className="text-sm text-gray-600">Kelola event dan pengumuman untuk pengguna</p>
                                </motion.div>
                                
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 }}
                                  className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer bg-blue-50 border-blue-200"
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                      <IconUsers size={20} />
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Verifikasi Pengguna</h3>
                                  </div>
                                  <p className="text-sm text-gray-600">Kelola dan verifikasi akun pengguna platform</p>
                                </motion.div>
                              </div>
                              
                              {/* Content Container */}
                              <div className="bg-white rounded-xl shadow-sm p-6">
                                {/* Tab Navigation */}
                                <TabNavigation />
                                
                                {/* Tab Content - Only teacher verification remains */}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                      <thead>
                                        <tr className="bg-gray-50 text-gray-700">
                                          <th className="px-4 py-3 text-left font-semibold">Nama</th>
                                          <th className="px-4 py-3 text-left font-semibold">Email</th>
                                          <th className="px-4 py-3 text-left font-semibold">Institusi</th>
                                          <th className="px-4 py-3 text-left font-semibold">Tanggal Daftar</th>
                                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                                          <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {verifications.length === 0 ? (
                                          <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                              Belum ada data guru
                                            </td>
                                          </tr>
                                        ) : (
                                          verifications.map((teacher) => (
                                            <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                              <td className="px-4 py-3">{teacher.full_name}</td>
                                              <td className="px-4 py-3">{teacher.email}</td>
                                              <td className="px-4 py-3">{teacher.institution}</td>
                                              <td className="px-4 py-3">
                                                {new Date(teacher.registration_date || teacher.created_at).toLocaleDateString('id-ID')}
                                              </td>
                                              <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs ${
                                                  teacher.status === 'verified' ? 'bg-green-100 text-green-800' :
                                                  teacher.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                  'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                  {teacher.status === 'verified' ? 'Terverifikasi' :
                                                   teacher.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3">
                                                {teacher.status === 'pending' && (
                                                  <div className="flex gap-2">
                                                    <button 
                                                      onClick={() => handleVerification(teacher.id, 'verify')}
                                                      className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                                      title="Verifikasi"
                                                    >
                                                      <IconCheck size={18} />
                                                    </button>
                                                    <button 
                                                      onClick={() => handleVerification(teacher.id, 'reject')}
                                                      className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                      title="Tolak"
                                                    >
                                                      <IconX size={18} />
                                                    </button>
                                                  </div>
                                                )}
                                                {teacher.status === 'verified' && (
                                                  <button 
                                                    onClick={() => handleVerification(teacher.id, 'revoke')}
                                                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                    title="Cabut Verifikasi"
                                                  >
                                                    <IconTrash size={18} />
                                                  </button>
                                                )}
                                                {teacher.status === 'rejected' && (
                                                  <button 
                                                    onClick={() => handleVerification(teacher.id, 'verify')}
                                                    className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                                    title="Tinjau Ulang"
                                                  >
                                                    <IconEdit size={18} />
                                                  </button>
                                                )}
                                              </td>
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </motion.div>
                              </div>
                            </main>
                          </>
                        )}
                  
                        <AddTeacherModal />
                        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                          <FloatingDock items={dockItems} />
                        </div>
                      </div>
                    );
                  };
