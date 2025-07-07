import { IconActivity, IconAward, IconBell, IconBook, IconBorderAll, IconCalendarEvent, IconChartBar, IconChartBarPopular, IconCoin, IconCpu, IconDatabase, IconEdit, IconFileAnalytics, IconList, IconLogout, IconNetwork, IconPhoto, IconPlus, IconServer, IconSettings, IconShieldCheck, IconTrash, IconUser, IconUsers } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useCallback, useEffect, useState } from 'react';
import AdminHeader from '../../../../components/admin/adminHeader';
import AdminDialog from '../../../../components/dialog/AdminDialog';
import { FloatingDock } from '../../../../components/ui/floating-dock';
import { useStore } from '../../../../context/StoreContext';
import { supabase } from '../../../../lib/supabaseClient';
import ProjectRating from './ProjectRating';
import ProjectReport from './ProjectReport';

const ShopItem = memo(({ item, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-all border border-gray-100"
    >
      <div className="relative w-full pb-[100%] mb-4 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={item.thumbnail || '/img/avatar_default.png'}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover" // Changed to object-cover
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/img/avatar_default.png';
          }}
          loading="lazy"
        />
        {item.type === 'avatar' && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded-lg">
            <IconUser size={16} className="text-white" />
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{item.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          item.type === 'avatar' ? 'bg-blue-100 text-blue-800' :
          item.type === 'badge' ? 'bg-purple-100 text-purple-800' :
          item.type === 'theme' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {item.type}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {item.description}
      </p>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
          <IconCoin size={16} />
          {item.price} poin
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
          >
            <IconEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default function DashboardProjects() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [activeTab, setActiveTab] = useState('overview');
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [dialogMode, setDialogMode] = useState('add');
  const [serverStats, setServerStats] = useState({
    dbSize: '0 MB',
    totalRows: '0',
    activeConnections: '0',
    uptime: '0',
    maxCapacity: '1024' // Default max capacity in MB
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);

  // Add new state variables for shop items
  const [shopItems, setShopItems] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  // Add new state for tracking paused items
  const [pausedItems, setPausedItems] = useState({});

  // Add new state variables for shop
  const [shopStats, setShopStats] = useState({
    avatars: 0,
    borders: 0, 
    badges: 0
  });
  const [shopItemFilter, setShopItemFilter] = useState('all');
  const [shopSearchTerm, setShopSearchTerm] = useState('');

  // Get store functions
  const { getCachedItems, setCachedItems } = useStore();

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
  
  const fetchUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        setUserName(profile.full_name);
        // Add any other profile data you need to set
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.replace('/authentication/admin/loginAdmin');
    }
  };

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
  
  // Data statistik untuk dashboard
  const statsData = [
    { title: "Total Konten", value: "124", bgColor: "bg-blue-50", textColor: "text-blue-600", icon: <IconBook size={20} /> },
    { title: "Guru Terverifikasi", value: "37", bgColor: "bg-green-50", textColor: "text-green-600", icon: <IconShieldCheck size={20} /> },
    { title: "Pengguna Aktif", value: "1,245", bgColor: "bg-purple-50", textColor: "text-purple-600", icon: <IconUsers size={20} /> },
    { title: "Event Mendatang", value: "5", bgColor: "bg-amber-50", textColor: "text-amber-600", icon: <IconCalendarEvent size={20} /> }
  ];

  // Tab Navigation (tambahkan tab report dan penilaian)
  const TabNavigation = () => (
    <div className="flex gap-2 mb-6">
      <button
        className={`px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        onClick={() => setActiveTab('overview')}
      >
        Overview
      </button>
      <button
        className={`px-4 py-2 rounded ${activeTab === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        onClick={() => setActiveTab('admin')}
      >
        Admin
      </button>
      <button
        className={`px-4 py-2 rounded ${activeTab === 'store' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        onClick={() => setActiveTab('store')}
      >
        Store
      </button>
      <button
        className={`px-4 py-2 rounded ${activeTab === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        onClick={() => setActiveTab('report')}
      >
        Laporan
      </button>
      <button
        className={`px-4 py-2 rounded ${activeTab === 'penilaian' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        onClick={() => setActiveTab('penilaian')}
      >
        Penilaian
      </button>
    </div>
  );

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

  // Komponen Card untuk statistik
  const StatCard = ({ title, value, bgColor, textColor, icon }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${bgColor} rounded-xl p-5 shadow-sm hover:shadow-md transition-all`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center ${textColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${textColor.replace('text', 'bg')}`} style={{ width: '78%' }}></div>
      </div>
    </motion.div>
  );

  // Add function to fetch admin profiles
  const fetchAdminProfiles = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAdminProfiles(profiles || []);
    } catch (error) {
      console.error('Error fetching admin profiles:', error);
    }
  };

  // Add useEffect to fetch admin profiles
  useEffect(() => {
    fetchAdminProfiles();
  }, []);

  // Add fetch function for server stats
  const fetchServerStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_server_stats');
      
      if (error) throw error;
      
      setServerStats({
        dbSize: data.db_size || '0 MB',
        totalRows: data.total_rows || '0',
        activeConnections: data.active_connections || '0',
        uptime: data.uptime || '0',
        maxCapacity: data.max_capacity || '1024' // Get max capacity from server
      });
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

  // Update renderAdminsTable function
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditAdmin(admin)}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-1 rounded-lg transition-colors"
                  >
                    <IconSettings size={18} />
                  </button>
                  <button className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 p-1 rounded-lg transition-colors">
                    <IconLogout size={18} />
                  </button>
                  <button className="bg-red-100 text-red-700 hover:bg-red-200 p-1 rounded-lg transition-colors">
                    <IconBell size={18} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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

  const handleDialogSuccess = () => {
    fetchAdminProfiles(); // Refresh the admin list
  };

  // Add this helper function after the component declarations
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days} hari, ${hours} jam, ${minutes} menit`;
  };

  // Add this helper function near your other utility functions
  const calculateDatabaseUsage = (size, maxSize) => {
    // Extract number from size string (e.g. "13 MB" -> 13)
    const currentSize = parseFloat(size);
    const maxCapacity = parseFloat(maxSize);
    return (currentSize / maxCapacity) * 100;
  };

  // Add handle edit function
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowEditQuestionModal(true);
  };

  // Add QuestionModal component
  const QuestionModal = () => (
    <AnimatePresence>
      {(showEditQuestionModal && editingQuestion) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl"
          >
            <h3 className="text-xl font-semibold mb-4">
              Edit Soal
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle question update
              setShowEditQuestionModal(false);
              setEditingQuestion(null);
            }} 
            className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Teks Soal</label>
                <textarea
                  defaultValue={editingQuestion.question_text}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipe Soal</label>
                <select 
                  defaultValue={editingQuestion.question_type?.id}
                  className="w-full p-2 border rounded"
                >
                  {questionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select 
                  defaultValue={editingQuestion.roadmap_sub_lesson?.roadmap_level?.id}
                  className="w-full p-2 border rounded"
                >
                  {roadmapLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditQuestionModal(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Add shop items fetch function
  const fetchShopItems = useCallback(async () => {
    try {
      let items = getCachedItems('shopItems');
      
      if (!items) {
        const { data, error } = await supabase
          .from('shop_items')
          .select('*')
          .order('id');

        if (error) throw error;
        
        items = data || [];
        setCachedItems('shopItems', items);
      }
      
      setShopItems(items);
      setShopStats(calculateShopStats(items));
    } catch (error) {
      console.error('Error fetching shop items:', error);
      setShopItems([]);
      setShopStats({ avatars: 0, borders: 0, badges: 0 });
    }
  }, [getCachedItems, setCachedItems]);

  // Add useEffect for shop items
  useEffect(() => {
    if (activeTab === 'store') {
      fetchShopItems();
    }
  }, [activeTab, fetchShopItems]);

  // Add function to handle item deletion
  const handleDeleteItem = async (itemId) => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      try {
        await supabase
          .from('shop_items')
          .delete()
          .eq('id', itemId);

        // Refresh shop items
        fetchShopItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const togglePause = (itemId) => {
    setPausedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Add filter function for shop items
  const getFilteredShopItems = () => {
    return shopItems.filter(item => {
      const matchesFilter = shopItemFilter === 'all' || item.type === shopItemFilter;
      const matchesSearch = 
        item.name.toLowerCase().includes(shopSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(shopSearchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  // Add calculateShopStats function near the top with other utility functions
  const calculateShopStats = (items) => {
    return items.reduce((acc, item) => ({
      avatars: acc.avatars + (item.type === 'avatar' ? 1 : 0),
      borders: acc.borders + (item.type === 'border' ? 1 : 0),
      badges: acc.badges + (item.type === 'badge' ? 1 : 0),
    }), { avatars: 0, borders: 0, badges: 0 });
  };

  // Add new state for image preview
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Add shop item dialog component
  const ShopItemDialog = () => (
    <AnimatePresence>
      {(showAddItemModal || editingItem) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingItem ? 'Edit Item' : 'Tambah Item'}
            </h3>
            
            <form onSubmit={handleSubmitItem} className="space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-1">Gambar</label>
                <div className="flex items-start gap-4">
                  {/* Image Preview */}
                  <motion.div 
                    className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                  >
                    {(imagePreview || editingItem?.image) ? (
                      <img
                        src={imagePreview || editingItem?.image}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover" // Changed to object-cover
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <IconPhoto size={32} />
                      </div>
                    )}
                    
                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                      </div>
                    )}
                  </motion.div>

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="item-image"
                    />
                    <label
                      htmlFor="item-image"
                      className="block w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors text-center"
                    >
                      Pilih Gambar
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Format: JPG, PNG. Maks: 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div>
                <label className="block text-sm font-medium mb-1">Nama Item</label>
                <input
                  type="text"
                  required
                  name="name"
                  defaultValue={editingItem?.name}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipe Item</label>
                <select
                  required
                  name="type"
                  defaultValue={editingItem?.type}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Pilih Tipe</option>
                  <option value="avatar">Avatar</option>
                  <option value="border">Border</option>
                  <option value="badge">Badge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  required
                  name="description"
                  defaultValue={editingItem?.description}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Harga (Poin)</label>
                <input
                  type="number"
                  required
                  name="price"
                  min="0"
                  defaultValue={editingItem?.price}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddItemModal(false);
                    setEditingItem(null);
                    setImagePreview('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Add image handling functions
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  // Add submit handler
  const handleSubmitItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      let thumbnailUrl = editingItem?.thumbnail;

      // Upload new thumbnail if provided
      if (imagePreview && !imagePreview.startsWith('http')) {
        setUploadProgress(0);
        const file = e.target.querySelector('input[type="file"]').files[0];
        
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `shop-thumbnails/${fileName}`;

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100);
            }
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        thumbnailUrl = publicUrl;
      }

      const itemData = {
        name: formData.get('name'),
        type: formData.get('type'),
        description: formData.get('description'),
        price: parseInt(formData.get('price')),
        thumbnail: thumbnailUrl || '/img/avatar_default.png' // Set default if no image
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('shop_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('shop_items')
          .insert([itemData]);

        if (error) throw error;
      }

      // Reset form and refresh
      setShowAddItemModal(false);
      setEditingItem(null);
      setImagePreview('');
      await fetchShopItems(); // Wait for refresh
    
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Gagal menyimpan item');
    } finally {
      setUploadProgress(0);
    }
  };

  // Add useEffect to reset image preview when dialog closes
  useEffect(() => {
    if (!showAddItemModal) {
      setImagePreview('');
      setEditingItem(null);
    }
  }, [showAddItemModal]);

  // Add useEffect to set image preview when editing
  useEffect(() => {
    if (editingItem?.thumbnail) {
      setImagePreview(editingItem.thumbnail);
    }
  }, [editingItem]);



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
                    onClick={() => setActiveTab('admin')}
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
                  icon={<IconFileAnalytics className="text-blue-600" size={20} />}
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
                  onClick={() => router.push('/dashboard/admin/AdminEvent')}
                />
                <AdminMenuCard 
                  icon={<IconShieldCheck className="text-amber-600" size={20} />}
                  title="Verifikasi"
                  description="Verifikasi akun guru dan pengawasan sistem pembelajaran"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/AdminVerif')}
                />
              </div>
              
              {/* Container */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm p-8 mb-10 border border-white/50">
                {/* Tab Navigation */}
                <div className="flex gap-6 border-b border-gray-200 mb-8">
                  {['overview', 'admin', 'store', 'report', 'penilaian'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-sm font-medium capitalize transition-colors ${
                        activeTab === tab
                          ? 'border-b-2 border-secondary text-secondary'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <section className="mb-10">
                      {/* Enhanced Header */}
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                          Statistik Platform
                        </h2>
                        <p className="text-sm text-gray-600">
                          Overview performa dan aktivitas platform
                        </p>
                      </div>

                      {/* Stats Grid - Direct Implementation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Stat Card 1 - Users */}
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-100/50 group cursor-pointer relative overflow-hidden"
                        >
                          {/* Subtle background pattern */}
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

                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Aktivitas Terbaru</h2>
                      <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center border border-gray-100">
                        <p className="text-gray-500 text-sm">Grafik aktivitas pengguna akan muncul di sini.</p>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === 'admin' && (
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
                          <span>+ Tambah Admin</span>
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
                )}

                {activeTab === 'store' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-200 rounded-lg">
                            <IconUser className="w-6 h-6 text-purple-700" />
                          </div>
                          <div>
                            <p className="text-sm text-purple-700">Total Avatar</p>
                            <h3 className="text-2xl font-bold text-purple-900">{shopStats.avatars}</h3>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-200 rounded-lg">
                            <IconBorderAll className="w-6 h-6 text-blue-700" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-700">Total Border</p>
                            <h3 className="text-2xl font-bold text-blue-900">{shopStats.borders}</h3>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-200 rounded-lg">
                            <IconAward className="w-6 h-6 text-amber-700" />
                          </div>
                          <div>
                            <p className="text-sm text-amber-700">Total Badge</p>
                            <h3 className="text-2xl font-bold text-amber-900">{shopStats.badges}</h3>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <select
                            value={shopItemFilter}
                            onChange={(e) => setShopItemFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">Semua Item</option>
                            <option value="avatar">Avatar</option>
                            <option value="border">Border</option>
                            <option value="badge">Badge</option>
                          </select>
                          
                          <div className="flex-1 md:w-64">
                            <input
                              type="text"
                              placeholder="Cari item..."
                              value={shopSearchTerm}
                              onChange={(e) => setShopSearchTerm(e.target.value)}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setShowAddItemModal(true)}
                          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                        >
                          <IconPlus size={18} className="inline mr-2" />
                          Tambah Item
                        </button>
                      </div>
                    </div>

                    {/* Shop Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {getFilteredShopItems().map(item => (
                        <ShopItem
                          key={item.id}
                          item={item}
                          onEdit={() => {
                            setEditingItem(item);
                            setShowAddItemModal(true);
                          }}
                          onDelete={handleDeleteItem}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'report' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProjectReport />
                  </motion.div>
                )}

                {activeTab === 'penilaian' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProjectRating />
                  </motion.div>
                )}
              </div>

              {/* Server Statistics - Improved Version */}
              <section className="mt-12">
                {/* Enhanced Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                    Statistik Server
                  </h2>
                  <p className="text-sm text-gray-600">
                    Pantau performa sistem secara real-time
                  </p>
                </div>

                {/* Improved Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                  
                  {/* Database Stats - Enhanced */}
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
                        {calculateDatabaseUsage(serverStats.dbSize, serverStats.maxCapacity)}%
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Ukuran Database</p>
                      <p className="text-2xl font-bold text-indigo-700 mb-1">{serverStats.dbSize} MB</p>
                      <p className="text-xs text-gray-500 mb-3">dari {serverStats.maxCapacity} MB</p>
                      
                      {/* Enhanced Progress Bar */}
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

                  {/* Total Data - Enhanced */}
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
                      <p className="text-2xl font-bold text-emerald-700 mb-1">{serverStats.totalRows.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">records tersimpan</p>
                    </div>
                  </motion.div>

                  {/* Active Connections - Enhanced */}
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

                  {/* Server Uptime - Enhanced */}
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
            </div>
          </main>

          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <FloatingDock items={dockItems} />
          </div>

          <AnimatePresence>
            {showAddItemModal && (
              <ShopItemDialog
                isOpen={showAddItemModal}
                onClose={() => {
                  setShowAddItemModal(false);
                  setEditingItem(null);
                  setImagePreview('');
                }}
                editingItem={editingItem}
                onSuccess={fetchShopItems}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showEditQuestionModal && editingQuestion && (
              <QuestionModal />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

// API dan Database
// Jumlah request API tidak dibatasi (unlimited), artinya kamu bisa membuat sebanyak-banyaknya panggilan API ke database Postgres mereka tanpa dikenakan biaya tambahan

// Namun, perlu diingat bahwa infrastruktur free tier terbatas:
// Database hanya berukuran 500 MB.
// Ada batas output data (egress) sekitar 2 GB–5 GB per bulan
// Kapasitas koneksi terbatas: ~50 koneksi aktif, serta maksimum 200 koneksi realtime

// 🛠️ Realtime
// Mendukung hingga 200 koneksi realtime dan 2 juta pesan realtime per bulan, dengan ukuran pesan maksimum 250 KB
// Rate limit server: 100 pesan per detik per free tier. Client default adalah 10 pesan/detik

// 🔧 Edge Functions
// Gratis hingga 500,000 invocations/bulan, dengan maksimal 10 functions dan script size ~2–10 MB

// 📦 Storan dan Bandwidth
// Storage file: 1 GB.
// Upload maksimal per file: 50 MB.
// Bandwidth / egress: sekitar 2–5 GB/bulan, tergantung sumber

// 👤 Autentikasi (Auth)
// Monthly Active Users (MAU) hingga 50,000 aktif.
// Email free rate limit: sekitar 30–100 email per jam, tergantung konfigurasi SMTP

// Edge Functions yang bisa dijalankan secara terjadwal menggunakan cron expression