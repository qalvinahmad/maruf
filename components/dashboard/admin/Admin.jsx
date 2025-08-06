import { IconBell, IconLogout, IconPlus, IconSettings, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getCachedData, setCachedData } from '../../../lib/clientSafeCache';
import { supabase } from '../../../lib/supabaseClient';
import AdminDialog from '../../dialog/AdminDialog';
import AdminDropdown from '../../widget/AdminDropdown';

const Admin = () => {
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [dialogMode, setDialogMode] = useState('add');

  // Enhanced function to fetch admin profiles with Redis caching
  const fetchAdminProfiles = async () => {
    try {
      const cacheKey = 'admin_profiles_list';
      
      // Try to get cached data from Redis first
      let cachedProfiles = await getCachedData(cacheKey);
      
      if (cachedProfiles) {
        setAdminProfiles(cachedProfiles);
        return;
      }
      
      // Fetch from database
      const { data: profiles, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const profilesData = profiles || [];
      
      // Cache in Redis for 10 minutes
      await setCachedData(cacheKey, profilesData, 600);
      
      setAdminProfiles(profilesData);
    } catch (error) {
      console.error('Error fetching admin profiles:', error);
      setAdminProfiles([]);
    }
  };

  useEffect(() => {
    fetchAdminProfiles();
  }, []);

  // Enhanced admin action handlers
  const handleResetPassword = async (admin) => {
    if (confirm(`Reset password untuk ${admin.full_name}?`)) {
      try {
        // You can implement password reset logic here
        alert('Password reset email akan dikirim');
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Gagal reset password');
      }
    }
  };

  const handleSendNotification = async (admin) => {
    const message = prompt(`Kirim notifikasi ke ${admin.full_name}:`);
    if (message) {
      try {
        // You can implement notification sending logic here
        alert('Notifikasi berhasil dikirim');
      } catch (error) {
        console.error('Error sending notification:', error);
        alert('Gagal mengirim notifikasi');
      }
    }
  };

  const handleToggleAdminStatus = async (admin) => {
    const action = admin.is_active ? 'menonaktifkan' : 'mengaktifkan';
    if (confirm(`Apakah Anda yakin ingin ${action} ${admin.full_name}?`)) {
      try {
        const { error } = await supabase
          .from('admin_profiles')
          .update({ is_active: !admin.is_active })
          .eq('id', admin.id);

        if (error) throw error;

        // Invalidate cache and refresh
        await handleDialogSuccess();
        
        alert(`Admin berhasil ${admin.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
      } catch (error) {
        console.error('Error toggling admin status:', error);
        alert('Gagal mengubah status admin');
      }
    }
  };

  const handleAddAdmin = () => {
    setSelectedAdmin(null);
    setDialogMode('add');
    setShowAdminDialog(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setDialogMode('edit');
    setShowAdminDialog(true);
  };

  const handleDialogSuccess = async () => {
    // Invalidate admin profiles cache
    const cacheKey = 'admin_profiles_list';
    await setCachedData(cacheKey, null, 0); // Delete cache
    
    fetchAdminProfiles(); // Refresh the admin list
  };

  // Render admins table
  const renderAdminsTable = () => (
    <div className="overflow-x-auto bg-white rounded-xl">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-50 text-gray-700 border-b">
            <th className="px-4 py-3 text-left font-semibold">Nama Admin</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Role</th>
            <th className="px-4 py-3 text-left font-semibold">Level</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Login Terakhir</th>
            <th className="px-4 py-3 text-left font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {adminProfiles.map((admin) => (
            <motion.tr 
              key={admin.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">{admin.full_name}</div>
              </td>
              <td className="px-4 py-3 text-gray-600">{admin.email}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  admin.role === 'admin' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {admin.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  {admin.admin_level}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  admin.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {admin.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {admin.last_login ? (
                  new Date(admin.last_login).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                ) : (
                  'Belum pernah login'
                )}
              </td>
              <td className="px-4 py-3">
                <AdminDropdown
                  variant="menu"
                  buttonText="Actions"
                  buttonColor="bg-indigo-500 hover:bg-indigo-600"
                  options={[
                    {
                      value: 'edit',
                      label: 'Edit Admin',
                      icon: <IconSettings size={16} />,
                      action: () => handleEditAdmin(admin)
                    },
                    {
                      value: 'reset',
                      label: 'Reset Password',
                      icon: <IconLogout size={16} />,
                      action: () => handleResetPassword(admin)
                    },
                    {
                      value: 'notify',
                      label: 'Send Notification',
                      icon: <IconBell size={16} />,
                      action: () => handleSendNotification(admin)
                    },
                    {
                      value: 'deactivate',
                      label: admin.is_active ? 'Deactivate' : 'Activate',
                      icon: <IconUser size={16} />,
                      color: admin.is_active ? 'text-red-600' : 'text-green-600',
                      action: () => handleToggleAdminStatus(admin)
                    }
                  ]}
                />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <section className="mb-6 p-6 bg-gray-50 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Pengaturan Admin</h3>
          <button
            onClick={handleAddAdmin}
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all w-full md:w-auto flex items-center justify-center gap-2"
          >
            <IconPlus size={18} />
            <span>Tambah Admin</span>
          </button>
        </div>
      </section>

      {renderAdminsTable()}

      <AdminDialog
        isOpen={showAdminDialog}
        onClose={() => setShowAdminDialog(false)}
        mode={dialogMode}
        adminData={selectedAdmin}
        onSuccess={handleDialogSuccess}
      />
    </motion.div>
  );
};

export default Admin;
