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
import Admin from '../../../../components/dashboard/admin/Admin';
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
  const [activeTab, setActiveTab] = useState('admin');
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('Fetching users...');

      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch users error:', error);
        throw error;
      }

      console.log('Fetched users:', usersData);
      setUsers(usersData || []);

    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
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

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // User management functions
  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: newStatus === 'admin',
          role: newStatus === 'admin' ? 'admin' : 'user',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      await fetchUsers();
      alert(`Status pengguna berhasil diperbarui!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Gagal memperbarui status pengguna');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      await fetchUsers();
      alert('Pengguna berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus pengguna');
    }
  };

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

  // Enhanced teacher management functions
  const checkDataConsistency = async () => {
    try {
      console.log('=== DATA CONSISTENCY CHECK ===');
      
      // Get all verifications
      const { data: verifications, error: verError } = await supabase
        .from('teacher_verifications')
        .select('*')
        .order('email');
      
      if (verError) throw verError;
      
      // Get all profiles
      const { data: profiles, error: profError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .order('email');
      
      if (profError) throw profError;
      
      // Analyze data
      const issues = [];
      const emailMap = new Map();
      
      // Check for duplicates in verifications
      verifications.forEach(v => {
        if (emailMap.has(v.email)) {
          issues.push(`DUPLICATE VERIFICATION: ${v.email}`);
        } else {
          emailMap.set(v.email, { verification: v });
        }
      });
      
      // Check profiles alignment
      profiles.forEach(p => {
        const existing = emailMap.get(p.email);
        if (existing) {
          existing.profile = p;
          
          // Check status consistency
          if (existing.verification.status === 'verified' && 
              (!p.is_verified || p.status !== 'verified')) {
            issues.push(`STATUS MISMATCH: ${p.email} - verification verified but profile not verified`);
          }
        } else {
          issues.push(`ORPHANED PROFILE: ${p.email} - profile exists but no verification`);
        }
      });
      
      // Check for missing profiles
      emailMap.forEach((data, email) => {
        if (data.verification && !data.profile && data.verification.status === 'verified') {
          issues.push(`MISSING PROFILE: ${email} - verification verified but no profile`);
        }
      });
      
      // Display results
      let message = `DATA CONSISTENCY CHECK RESULTS:\n\n`;
      message += `Total Verifications: ${verifications.length}\n`;
      message += `Total Profiles: ${profiles.length}\n`;
      message += `Issues Found: ${issues.length}\n\n`;
      
      if (issues.length > 0) {
        message += `ISSUES:\n${issues.join('\n')}\n\n`;
        message += `Would you like to run automated fixes?`;
        
        if (confirm(message)) {
          await fixDataConsistency();
        }
      } else {
        message += `✅ All data is consistent!`;
        alert(message);
      }
      
    } catch (error) {
      console.error('Data consistency check error:', error);
      alert(`Error checking data consistency: ${error.message}`);
    }
  };

  const fixDataConsistency = async () => {
    try {
      console.log('=== FIXING DATA CONSISTENCY ===');
      
      // 1. Remove duplicate verifications (keep latest)
      const { data: duplicates } = await supabase
        .from('teacher_verifications')
        .select('email, id, created_at')
        .order('email, created_at DESC');
      
      const emailGroups = {};
      duplicates.forEach(item => {
        if (!emailGroups[item.email]) {
          emailGroups[item.email] = [];
        }
        emailGroups[item.email].push(item);
      });
      
      for (const [email, items] of Object.entries(emailGroups)) {
        if (items.length > 1) {
          // Keep the first (latest), delete the rest
          const toDelete = items.slice(1);
          for (const item of toDelete) {
            await supabase
              .from('teacher_verifications')
              .delete()
              .eq('id', item.id);
          }
          console.log(`Removed ${toDelete.length} duplicate(s) for ${email}`);
        }
      }
      
      // 2. Create missing profiles for verified teachers
      const { data: verifiedWithoutProfile } = await supabase
        .from('teacher_verifications')
        .select('*')
        .eq('status', 'verified')
        .not('email', 'in', 
          await supabase.from('teacher_profiles').select('email').then(r => 
            r.data?.map(p => p.email) || []
          )
        );
      
      for (const verification of verifiedWithoutProfile || []) {
        const profileData = {
          id: verification.id,
          email: verification.email,
          full_name: verification.full_name,
          institution: verification.institution,
          teaching_experience: verification.credentials?.teaching_experience || 'N/A',
          specialization: verification.credentials?.specializations?.join(', ') || 'N/A',
          certifications: verification.credentials?.certifications || 'N/A',
          is_verified: true,
          status: 'verified',
          created_at: verification.created_at,
          updated_at: new Date().toISOString()
        };
        
        await supabase
          .from('teacher_profiles')
          .insert([profileData]);
        
        console.log(`Created profile for ${verification.email}`);
      }
      
      // 3. Fix status mismatches
      const { data: statusMismatches } = await supabase
        .from('teacher_verifications')
        .select(`
          id, email, status,
          teacher_profiles!inner(id, email, is_verified, status)
        `)
        .eq('status', 'verified')
        .neq('teacher_profiles.is_verified', true);
      
      for (const mismatch of statusMismatches || []) {
        await supabase
          .from('teacher_profiles')
          .update({
            is_verified: true,
            status: 'verified',
            updated_at: new Date().toISOString()
          })
          .eq('id', mismatch.id);
        
        console.log(`Fixed status mismatch for ${mismatch.email}`);
      }
      
      alert('Data consistency fixes completed! Please refresh the page.');
      await fetchVerifications();
      
    } catch (error) {
      console.error('Fix data consistency error:', error);
      alert(`Error fixing data consistency: ${error.message}`);
    }
  };

  const bulkUpdateStatus = async (newStatus) => {
    try {
      const selectedIds = verifications
        .filter(v => v.selected)
        .map(v => v.id);
      
      if (selectedIds.length === 0) {
        alert('Please select teachers to update');
        return;
      }
      
      const confirmMessage = `Are you sure you want to ${newStatus} ${selectedIds.length} teacher(s)?`;
      if (!confirm(confirmMessage)) return;
      
      for (const id of selectedIds) {
        await handleVerification(id, newStatus);
      }
      
      alert(`Bulk update completed for ${selectedIds.length} teacher(s)`);
      await fetchVerifications();
      
    } catch (error) {
      console.error('Bulk update error:', error);
      alert(`Error in bulk update: ${error.message}`);
    }
  };

  const exportTeacherData = async () => {
    try {
      const { data: allData, error } = await supabase
        .from('teacher_verifications')
        .select(`
          *,
          teacher_profiles(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const csvData = allData.map(v => ({
        email: v.email,
        full_name: v.full_name,
        institution: v.institution,
        verification_status: v.status,
        profile_verified: v.teacher_profiles?.[0]?.is_verified || false,
        created_at: v.created_at,
        verification_date: v.verification_date
      }));
      
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teacher_data_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      alert(`Error exporting data: ${error.message}`);
    }
  };

  // Enhanced verification with better error handling
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
                                onClick={() => setActiveTab('admin')}
                                className={`inline-block p-4 border-b-2 transition-colors ${
                                  activeTab === 'admin' 
                                    ? 'border-secondary text-secondary' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Kelola Admin
                              </button>
                            </li>
                            <li className="mr-2">
                              <button 
                                onClick={() => setActiveTab('teachers')}
                                className={`inline-block p-4 border-b-2 transition-colors ${
                                  activeTab === 'teachers' 
                                    ? 'border-secondary text-secondary' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Verifikasi Guru
                              </button>
                            </li>
                            <li className="mr-2">
                              <button 
                                onClick={() => setActiveTab('users')}
                                className={`inline-block p-4 border-b-2 transition-colors ${
                                  activeTab === 'users' 
                                    ? 'border-secondary text-secondary' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Kelola Pengguna
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
                          <title>Admin & Verifikasi Center - Belajar Makhrojul Huruf</title>
                          <meta name="description" content="Kelola admin profiles, verifikasi akun guru dan pengawasan sistem pembelajaran" />
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
                            
                            <main className="max-w-5xl mx-auto px-4 py-4 pb-24">
                              {/* Welcome Banner */}
                              <div className="bg-gradient-to-r from-secondary to-blue-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
                                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full"></div>
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-1/4 translate-y-1/4"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                  <div>
                                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin & Verifikasi Center</h1>
                                    <p className="text-white/80 max-w-md">Kelola admin profiles, verifikasi akun guru, pengawasan konten pembelajaran, dan laporan pengguna untuk menjaga kualitas platform.</p>
                                  </div>
                                  <button 
                                    onClick={() => activeTab === 'admin' ? setShowAddModal(true) : setShowAddModal(true)}
                                    className="bg-white text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 shadow-md"
                                  >
                                    <span>{activeTab === 'admin' ? 'Tambah Admin' : 'Tambah Guru'}</span>
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
                                  onClick={() => router.push('/dashboard/admin/event/AdminEvent')}
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
                                
                     
                                
                                {/* Tab Content */}
                                {activeTab === 'admin' && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <Admin />
                                  </motion.div>
                                )}

                                {activeTab === 'teachers' && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                      <thead>
                                        <tr className="bg-gray-50 text-gray-700">
                                          <th className="px-4 py-3 text-left font-semibold">
                                            <input
                                              type="checkbox"
                                              onChange={(e) => {
                                                const updatedVerifications = verifications.map(v => ({
                                                  ...v,
                                                  selected: e.target.checked
                                                }));
                                                setVerifications(updatedVerifications);
                                              }}
                                              className="rounded"
                                            />
                                          </th>
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
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                              Belum ada data guru
                                            </td>
                                          </tr>
                                        ) : (
                                          verifications.map((teacher) => (
                                            <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                              <td className="px-4 py-3">
                                                <input
                                                  type="checkbox"
                                                  checked={teacher.selected || false}
                                                  onChange={(e) => {
                                                    const updatedVerifications = verifications.map(v => 
                                                      v.id === teacher.id ? { ...v, selected: e.target.checked } : v
                                                    );
                                                    setVerifications(updatedVerifications);
                                                  }}
                                                  className="rounded"
                                                />
                                              </td>
                                              <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                                                    {teacher.full_name.charAt(0).toUpperCase()}
                                                  </div>
                                                  <div>
                                                    <div className="font-medium">{teacher.full_name}</div>
                                                    {teacher.credentials?.specializations && (
                                                      <div className="text-xs text-gray-500">
                                                        {teacher.credentials.specializations.join(', ')}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="px-4 py-3">
                                                <div className="font-medium">{teacher.email}</div>
                                                {teacher.teacher_code && (
                                                  <div className="text-xs text-green-600 font-mono">
                                                    Code: {teacher.teacher_code}
                                                  </div>
                                                )}
                                              </td>
                                              <td className="px-4 py-3">
                                                <div className="font-medium">{teacher.institution}</div>
                                                {teacher.credentials?.teaching_experience && (
                                                  <div className="text-xs text-gray-500">
                                                    {teacher.credentials.teaching_experience} tahun pengalaman
                                                  </div>
                                                )}
                                              </td>
                                              <td className="px-4 py-3">
                                                <div className="text-sm">
                                                  {new Date(teacher.registration_date || teacher.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                                {teacher.verification_date && (
                                                  <div className="text-xs text-gray-500">
                                                    Verified: {new Date(teacher.verification_date).toLocaleDateString('id-ID')}
                                                  </div>
                                                )}
                                              </td>
                                              <td className="px-4 py-3">
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                  teacher.status === 'verified' ? 'bg-green-100 text-green-800' :
                                                  teacher.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                  'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                  {teacher.status === 'verified' ? 'Terverifikasi' :
                                                   teacher.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                                </span>
                                                {teacher.rejection_reason && (
                                                  <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={teacher.rejection_reason}>
                                                    {teacher.rejection_reason}
                                                  </div>
                                                )}
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
                                )}

                                {activeTab === 'users' && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    {loadingUsers ? (
                                      <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full table-auto">
                                          <thead>
                                            <tr className="bg-gray-50 text-gray-700">
                                              <th className="px-4 py-3 text-left font-semibold">Nama</th>
                                              <th className="px-4 py-3 text-left font-semibold">Email</th>
                                              <th className="px-4 py-3 text-left font-semibold">Level</th>
                                              <th className="px-4 py-3 text-left font-semibold">XP / Points</th>
                                              <th className="px-4 py-3 text-left font-semibold">Streak</th>
                                              <th className="px-4 py-3 text-left font-semibold">Energy</th>
                                              <th className="px-4 py-3 text-left font-semibold">Role</th>
                                              <th className="px-4 py-3 text-left font-semibold">Status</th>
                                              <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100">
                                            {users.length === 0 ? (
                                              <tr>
                                                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                                  Belum ada data pengguna
                                                </td>
                                              </tr>
                                            ) : (
                                              users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                  <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">
                                                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                                      </div>
                                                      <div>
                                                        <div className="font-medium">{user.full_name || 'Nama tidak tersedia'}</div>
                                                        <div className="text-xs text-gray-500">
                                                          {user.level_description || `Level ${user.level || 1}`}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <div className="font-medium">{user.email}</div>
                                                    {user.admin_id && (
                                                      <div className="text-xs text-blue-600">
                                                        Admin ID: {user.admin_id.slice(0, 8)}...
                                                      </div>
                                                    )}
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <div className="text-center">
                                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {user.level || 1}
                                                      </span>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <div className="text-sm space-y-1">
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-yellow-600">XP:</span>
                                                        <span className="font-medium">{user.xp || 0}</span>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-green-600">Poin:</span>
                                                        <span className="font-medium">{user.points || 0}</span>
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <div className="text-center">
                                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        (user.streak || 0) > 7 ? 'bg-green-100 text-green-800' :
                                                        (user.streak || 0) > 3 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                      }`}>
                                                        🔥 {user.streak || 0}
                                                      </span>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <div className="text-center">
                                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        (user.energy || 0) > 80 ? 'bg-green-100 text-green-800' :
                                                        (user.energy || 0) > 50 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                      }`}>
                                                        ⚡ {user.energy || 0}%
                                                      </span>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                      user.is_admin ? 'bg-purple-100 text-purple-800' :
                                                      user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                                                      'bg-gray-100 text-gray-800'
                                                    }`}>
                                                      {user.is_admin ? 'Admin' : user.role || 'User'}
                                                    </span>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-500">
                                                      <div>Dibuat: {new Date(user.created_at).toLocaleDateString('id-ID')}</div>
                                                      {user.updated_at && (
                                                        <div>Update: {new Date(user.updated_at).toLocaleDateString('id-ID')}</div>
                                                      )}
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                      {!user.is_admin && (
                                                        <button 
                                                          onClick={() => handleUserStatusUpdate(user.id, 'admin')}
                                                          className="p-1.5 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                                                          title="Jadikan Admin"
                                                        >
                                                          <IconUsers size={18} />
                                                        </button>
                                                      )}
                                                      {user.is_admin && (
                                                        <button 
                                                          onClick={() => handleUserStatusUpdate(user.id, 'user')}
                                                          className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                          title="Hapus Admin"
                                                        >
                                                          <IconX size={18} />
                                                        </button>
                                                      )}
                                                      <button 
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                        title="Hapus Pengguna"
                                                      >
                                                        <IconTrash size={18} />
                                                      </button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              ))
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
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
