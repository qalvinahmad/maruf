import { IconActivity, IconBook, IconCalendarEvent, IconChartBar, IconDatabase, IconEdit, IconList, IconPlus, IconSettings, IconUserCheck } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminHeader from '../../../../components/admin/adminHeader';
import { FloatingDock } from '../../../../components/ui/floating-dock';
import { Toast } from '../../../../components/ui/toast'; // ADD: Import Toast
import { supabase } from '../../../../lib/supabaseClient';
import ContentManageQuestion from './ContentManangeQuestion';

const AdminContent = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // State for roadmap data
  const [roadmapLevels, setRoadmapLevels] = useState([]);
  const [subLessons, setSubLessons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [accuracySettings, setAccuracySettings] = useState(null);

  // Modal states
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [showAddSubLessonModal, setShowAddSubLessonModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editingSubLesson, setEditingSubLesson] = useState(null);

  // Accuracy settings
  const [isSavingAccuracy, setIsSavingAccuracy] = useState(false);
  const [accuracyChanged, setAccuracyChanged] = useState(false);
  const [isLoadingAccuracy, setIsLoadingAccuracy] = useState(true);

  // ADD: Accuracy edit modal states
  const [showAccuracyModal, setShowAccuracyModal] = useState(false);
  const [editingAccuracyLevel, setEditingAccuracyLevel] = useState(null);
  const [tempAccuracyValue, setTempAccuracyValue] = useState(70);

  // Modal states - MOVED FROM ContentManageQuestion
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState('');
  const [questionOptions, setQuestionOptions] = useState([
    { label: 'A', text: '', isCorrect: false },
    { label: 'B', text: '', isCorrect: false },
    { label: 'C', text: '', isCorrect: false },
    { label: 'D', text: '', isCorrect: false }
  ]);
  const [matchingPairsCount, setMatchingPairsCount] = useState(3);
  const [matchingPairsData, setMatchingPairsData] = useState(
    Array(3).fill({ left_item: '', right_item: '' })
  );
  const [questionTypes, setQuestionTypes] = useState([]);

  // Auth check
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace('/authentication/admin/loginAdmin');
          return;
        }

        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (adminError || !adminData) {
          await supabase.auth.signOut();
          router.replace('/authentication/admin/loginAdmin');
          return;
        }

        if (!adminData.role || !['admin', 'superadmin'].includes(adminData.role)) {
          await supabase.auth.signOut();
          router.replace('/authentication/admin/loginAdmin');
          return;
        }

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

  // Data fetching functions
  const fetchRoadmapData = async () => {
    try {
      const [levelsResponse, subLessonsResponse, questionsResponse, questionTypesResponse] = await Promise.all([
        supabase.from('roadmap_levels').select('*').order('order_sequence'),
        supabase.from('roadmap_sub_lessons').select('*').order('order_sequence'),
        // FIXED: Simplified query to avoid relational issues
        supabase.from('questions').select(`
          *,
          question_options(*)
        `).order('order_sequence'),
        supabase.from('question_types').select('*')
      ]);

      if (levelsResponse.error) throw levelsResponse.error;
      if (subLessonsResponse.error) throw subLessonsResponse.error;
      if (questionsResponse.error) throw questionsResponse.error;
      if (questionTypesResponse.error) throw questionTypesResponse.error;

      // FIXED: Manually fetch matching pairs if needed
      const questionIds = questionsResponse.data?.map(q => q.id) || [];
      let matchingPairsData = [];
      
      if (questionIds.length > 0) {
        const { data: matchingData, error: matchingError } = await supabase
          .from('matching_pairs')
          .select('*')
          .in('question_id', questionIds);
        
        if (!matchingError) {
          matchingPairsData = matchingData || [];
        }
      }
      
      // FIXED: Attach matching pairs to questions manually
      const questionsWithPairs = questionsResponse.data?.map(question => ({
        ...question,
        matching_pairs: matchingPairsData.filter(pair => pair.question_id === question.id)
      })) || [];

      setRoadmapLevels(levelsResponse.data || []);
      setSubLessons(subLessonsResponse.data || []);
      setQuestions(questionsWithPairs);
      setQuestionTypes(questionTypesResponse.data || []);
    } catch (error) {
      console.error('Error fetching roadmap data:', error);
    }
  };

  const fetchAccuracySettings = async () => {
    try {
      setIsLoadingAccuracy(true);
      
      const { data, error } = await supabase
        .from('accuracy_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const settings = {
          pemula: data.find(s => s.level === 'Pemula')?.min_accuracy || 70,
          menengah: data.find(s => s.level === 'Menengah')?.min_accuracy || 80,
          lanjutan: data.find(s => s.level === 'Lanjutan')?.min_accuracy || 90
        };
        
        setAccuracySettings(settings);
      }
    } catch (error) {
      console.error('Error fetching accuracy settings:', error);
    } finally {
      setIsLoadingAccuracy(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      fetchRoadmapData();
      fetchAccuracySettings();
    }
  }, [isLoading]);

  // Enhanced Menu Card component
  const AdminMenuCard = ({ icon, title, description, bgColor, onClick, isActive = false }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        scale: 1.02
      }}
      whileTap={{ scale: 0.98 }}
      className={`${bgColor} p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border group ${
        isActive ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-100/50'
      }`}
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

  // Tab Navigation Component
  const TabNavigation = () => {
    const tabs = [
      { id: 'overview', label: 'Ikhtisar', icon: <IconChartBar size={16} /> },
      { id: 'roadmap', label: 'Kelola Tingkatan', icon: <IconBook size={16} /> },
      { id: 'questions', label: 'Manajemen Soal', icon: <IconList size={16} /> },
      { id: 'accuracy', label: 'Pengaturan Akurasi', icon: <IconSettings size={16} /> }
    ];

    return (
      <div className="flex overflow-x-auto pb-2 mb-8 gap-3 scrollbar-hide border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // Statistics Cards
  const StatCard = ({ title, value, bgColor, textColor, icon, description }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`${bgColor} rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 group cursor-pointer`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
          {icon}
        </div>
        <div className="w-2 h-2 bg-white/40 rounded-full"></div>
      </div>
      
      <div>
        <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
        <p className={`text-3xl font-bold text-white mb-1`}>{value}</p>
        <p className="text-white/70 text-xs">{description}</p>
      </div>
    </motion.div>
  );

  // Accuracy settings
  const handleEditAccuracy = (level, currentValue) => {
    console.log('Edit accuracy for level:', level, 'current value:', currentValue);
    setEditingAccuracyLevel(level);
    setTempAccuracyValue(currentValue);
    setShowAccuracyModal(true);
  };

  const handleSaveAccuracy = async () => {
    try {
      setIsSavingAccuracy(true);
      
      // Map level names to database format
      const levelMapping = {
        'pemula': 'Pemula',
        'menengah': 'Menengah', 
        'lanjutan': 'Lanjutan'
      };
      
      const dbLevelName = levelMapping[editingAccuracyLevel];
      
      // Update in database
      const { error } = await supabase
        .from('accuracy_settings')
        .update({ 
          min_accuracy: tempAccuracyValue,
          updated_at: new Date().toISOString()
        })
        .eq('level', dbLevelName);

      if (error) throw error;

      // Update local state
      setAccuracySettings(prev => ({
        ...prev,
        [editingAccuracyLevel]: tempAccuracyValue
      }));

      setShowAccuracyModal(false);
      setEditingAccuracyLevel(null);
      alert('Pengaturan akurasi berhasil diperbarui!');
      
    } catch (error) {
      console.error('Error updating accuracy:', error);
      alert('Gagal memperbarui pengaturan akurasi: ' + error.message);
    } finally {
      setIsSavingAccuracy(false);
    }
  };

  const handleResetAccuracy = async () => {
    try {
      setIsSavingAccuracy(true);
      
      // Reset to default values
      const defaultSettings = [
        { level: 'Pemula', min_accuracy: 70 },
        { level: 'Menengah', min_accuracy: 80 },
        { level: 'Lanjutan', min_accuracy: 90 }
      ];

      for (const setting of defaultSettings) {
        const { error } = await supabase
          .from('accuracy_settings')
          .update({ 
            min_accuracy: setting.min_accuracy,
            updated_at: new Date().toISOString()
          })
          .eq('level', setting.level);

        if (error) throw error;
      }

      // Update local state
      setAccuracySettings({
        pemula: 70,
        menengah: 80,
        lanjutan: 90
      });

      alert('Pengaturan akurasi berhasil direset ke nilai default!');
      
    } catch (error) {
      console.error('Error resetting accuracy:', error);
      alert('Gagal mereset pengaturan akurasi: ' + error.message);
    } finally {
      setIsSavingAccuracy(false);
    }
  };

  // Accuracy Settings Component - FIXED with working modal
  const AccuracySettingsTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {isLoadingAccuracy ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : accuracySettings ? (
        <>
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Pengaturan Akurasi Minimal</h3>
                <p className="text-gray-600">Atur tingkat akurasi minimum untuk setiap level pembelajaran</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleResetAccuracy}
                  disabled={isSavingAccuracy}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isSavingAccuracy ? 'Mereset...' : 'Reset'}
                </button>
                <button 
                  onClick={() => fetchAccuracySettings()}
                  disabled={isSavingAccuracy}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pemula */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                  P
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Level Pemula</h3>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Akurasi Minimal</span>
                  <span className="font-bold text-2xl text-emerald-700">{accuracySettings.pemula}%</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${accuracySettings.pemula}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-4">
                Pengguna pemula harus mencapai akurasi minimal {accuracySettings.pemula}% untuk naik ke level berikutnya.
              </p>
              
              <button 
                onClick={() => handleEditAccuracy('pemula', accuracySettings.pemula)}
                className="w-full bg-white text-emerald-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
              >
                Edit Pengaturan
              </button>
            </motion.div>

            {/* Menengah */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                  M
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Level Menengah</h3>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Akurasi Minimal</span>
                  <span className="font-bold text-2xl text-blue-700">{accuracySettings.menengah}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${accuracySettings.menengah}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-4">
                Pengguna level menengah harus mencapai akurasi minimal {accuracySettings.menengah}% untuk naik ke level berikutnya.
              </p>
              
              <button 
                onClick={() => handleEditAccuracy('menengah', accuracySettings.menengah)}
                className="w-full bg-white text-blue-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Edit Pengaturan
              </button>
            </motion.div>

            {/* Lanjutan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                  L
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">Level Lanjutan</h3>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Akurasi Minimal</span>
                  <span className="font-bold text-2xl text-purple-700">{accuracySettings.lanjutan}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${accuracySettings.lanjutan}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-4">
                Pengguna level lanjutan harus mencapai akurasi minimal {accuracySettings.lanjutan}% untuk menguasai seluruh materi.
              </p>
              
              <button 
                onClick={() => handleEditAccuracy('lanjutan', accuracySettings.lanjutan)}
                className="w-full bg-white text-purple-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
              >
                Edit Pengaturan
              </button>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconSettings size={24} className="text-gray-400" />
          </div>
          <p>Gagal memuat pengaturan akurasi</p>
        </div>
      )}
    </motion.div>
  );

  // ADD: Accuracy Edit Modal Component
  const AccuracyEditModal = () => (
    <AnimatePresence>
      {showAccuracyModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            margin: 0,
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAccuracyModal(false);
              setEditingAccuracyLevel(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full shadow-2xl"
            style={{
              position: 'relative',
              zIndex: 100000,
              maxWidth: '500px',
              width: '90vw',
              margin: '0 auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Edit Pengaturan Akurasi - Level {editingAccuracyLevel?.charAt(0).toUpperCase() + editingAccuracyLevel?.slice(1)}
              </h3>
              <p className="text-gray-600 text-sm">
                Atur tingkat akurasi minimal yang diperlukan untuk naik ke level berikutnya
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Akurasi Minimal (%)
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={tempAccuracyValue}
                    onChange={(e) => setTempAccuracyValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Nilai yang dipilih:</span>
                  <span className="text-2xl font-bold text-blue-600">{tempAccuracyValue}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${tempAccuracyValue}%` }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Info:</strong> Pengguna harus mencapai akurasi minimal {tempAccuracyValue}% 
                  untuk dapat naik ke level berikutnya.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAccuracyModal(false);
                  setEditingAccuracyLevel(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-300"
                disabled={isSavingAccuracy}
              >
                Batal
              </button>
              <button
                onClick={handleSaveAccuracy}
                disabled={isSavingAccuracy}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {isSavingAccuracy ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // FIXED: Enhanced question form submission handler with better edit handling
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      console.log('=== FORM SUBMISSION START ===');
      console.log('Editing question:', editingQuestion);
      console.log('Selected question type:', selectedQuestionType);
      
      const questionTypeString = formData.get('question_type');
      console.log('Form question type:', questionTypeString);
      
      // Map question type strings to integer IDs for database
      const questionTypeMap = {
        'multiple_choice': 1,
        'true_false': 2,
        'short_answer': 3,
        'matching': 4,
        'voice_input': 5
      };
      
      const questionTypeId = questionTypeMap[questionTypeString];
      
      if (!questionTypeId) {
        throw new Error('Tipe soal tidak valid');
      }
      
      console.log('Question type mapping:', {
        string: questionTypeString,
        id: questionTypeId
      });
      
      // FIXED: Build complete question data object
      const questionData = {
        question_text: formData.get('question_text'),
        question_type_id: questionTypeId,
        sublesson_id: parseInt(formData.get('sublesson_id')),
        order_sequence: parseInt(formData.get('order_sequence')),
        updated_at: new Date().toISOString() // Add timestamp
      };

      console.log('Question data to save:', questionData);

      let questionId;

      if (editingQuestion) {
        console.log('=== UPDATING EXISTING QUESTION ===');
        console.log('Question ID:', editingQuestion.id);
        console.log('Update data:', questionData);
        
        // FIXED: Update existing question with explicit return
        const { data: updatedQuestion, error: updateError } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingQuestion.id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error(`Update failed: ${updateError.message}`);
        }
        
        if (!updatedQuestion) {
          throw new Error('No data returned from update');
        }
        
        console.log('Question updated successfully:', updatedQuestion);
        questionId = editingQuestion.id;
        
        // VERIFY the update by checking database
        const { data: verifyData, error: verifyError } = await supabase
          .from('questions')
          .select('*')
          .eq('id', questionId)
          .single();
          
        if (!verifyError && verifyData) {
          console.log('Verified updated question in DB:', verifyData);
        }
        
      } else {
        console.log('=== CREATING NEW QUESTION ===');
        console.log('Create data:', questionData);
        
        // Create new question
        const { data: newQuestion, error: createError } = await supabase
          .from('questions')
          .insert([questionData])
          .select()
          .single();

        if (createError) {
          console.error('Create error:', createError);
          throw createError;
        }
        
        console.log('Question created successfully:', newQuestion);
        questionId = newQuestion.id;
      }

      // FIXED: Handle question type specific data with better error handling
      console.log('=== HANDLING QUESTION TYPE SPECIFIC DATA ===');
      await handleQuestionTypeSpecificData(questionTypeString, formData, questionId, editingQuestion ? 'update' : 'create');

      // VERIFY all data is saved correctly
      console.log('=== VERIFYING FINAL DATA ===');
      const { data: finalQuestion, error: finalError } = await supabase
        .from('questions')
        .select(`
          *,
          question_options(*),
          matching_pairs(*)
        `)
        .eq('id', questionId)
        .single();
        
      if (!finalError && finalQuestion) {
        console.log('Final verified question:', finalQuestion);
      }

      // Close modal and refresh
      setShowEditQuestionModal(false);
      setShowAddQuestionModal(false);
      setEditingQuestion(null);
      setSelectedQuestionType('');
      
      // Force refresh data
      console.log('=== REFRESHING DATA ===');
      await fetchRoadmapData();
      
      // Trigger event for ContentManageQuestion to refresh
      window.dispatchEvent(new CustomEvent('questionsUpdated', { 
        detail: { timestamp: Date.now(), questionId, action: editingQuestion ? 'updated' : 'created' } 
      }));
      
      alert(`Soal berhasil ${editingQuestion ? 'diperbarui' : 'ditambahkan'}!`);
      
    } catch (error) {
      console.error('=== FORM SUBMISSION ERROR ===');
      console.error('Error details:', error);
      alert(`Gagal menyimpan soal: ${error.message}`);
    }
  };

  // ENHANCED: Question type specific data handler with all question types
  const handleQuestionTypeSpecificData = async (questionType, formData, questionId, operation = 'create') => {
    console.log('=== HANDLING SPECIFIC DATA ===');
    console.log('Question type:', questionType);
    console.log('Question ID:', questionId);
    console.log('Operation:', operation);
    
    try {
      switch (questionType) {
        case 'multiple_choice':
          console.log('Processing multiple choice options...');
          
          // Always delete existing options first
          const { error: deleteOptionsError } = await supabase
            .from('question_options')
            .delete()
            .eq('question_id', questionId);
            
          if (deleteOptionsError) {
            console.error('Error deleting existing options:', deleteOptionsError);
          }
          
          const options = ['A', 'B', 'C', 'D'].map(label => ({
            question_id: questionId,
            option_text: formData.get(`option_${label}`),
            is_correct: formData.get('correct_answer') === label
          }));
          
          console.log('Inserting new options:', options);
          const { data: insertedOptions, error: optionsError } = await supabase
            .from('question_options')
            .insert(options)
            .select();
            
          if (optionsError) throw optionsError;
          console.log('Options inserted successfully:', insertedOptions);
          break;

        case 'matching':
          console.log('Processing matching pairs...');
          console.log('Current matching pairs data:', matchingPairsData);
          
          // Always delete existing pairs first
          const { error: deletePairsError } = await supabase
            .from('matching_pairs')
            .delete()
            .eq('question_id', questionId);
            
          if (deletePairsError) {
            console.error('Error deleting existing pairs:', deletePairsError);
          }
          
          // Filter out empty pairs
          const validPairs = matchingPairsData.filter(pair => 
            pair.left_item && pair.left_item.trim() && 
            pair.right_item && pair.right_item.trim()
          );
          
          if (validPairs.length > 0) {
            const pairs = validPairs.map(pair => ({
              question_id: questionId,
              left_item: pair.left_item.trim(),
              right_item: pair.right_item.trim()
            }));
            
            console.log('Inserting matching pairs:', pairs);
            const { data: insertedPairs, error: pairsError } = await supabase
              .from('matching_pairs')
              .insert(pairs)
              .select();
              
            if (pairsError) throw pairsError;
            console.log('Pairs inserted successfully:', insertedPairs);
          }
          break;

        case 'true_false':
          console.log('Processing true/false answer...');
          const tfAnswer = formData.get('true_false_answer');
          console.log('True/false answer:', tfAnswer);
          
          // Store as question_options
          await supabase.from('question_options').delete().eq('question_id', questionId);
          
          const tfOptions = [
            {
              question_id: questionId,
              option_text: 'Benar',
              is_correct: tfAnswer === 'true'
            },
            {
              question_id: questionId,
              option_text: 'Salah',
              is_correct: tfAnswer === 'false'
            }
          ];
          
          console.log('Inserting true/false options:', tfOptions);
          const { error: tfError } = await supabase.from('question_options').insert(tfOptions);
          if (tfError) throw tfError;
          console.log('True/false options saved');
          break;

        case 'short_answer':
          console.log('Processing short answer...');
          const shortAnswer = formData.get('correct_answer');
          console.log('Short answer:', shortAnswer);
          
          // Store as question_options
          await supabase.from('question_options').delete().eq('question_id', questionId);
          
          const saOption = {
            question_id: questionId,
            option_text: shortAnswer,
            is_correct: true
          };
          
          console.log('Inserting short answer option:', saOption);
          const { error: saError } = await supabase.from('question_options').insert([saOption]);
          if (saError) throw saError;
          console.log('Short answer saved');
          break;

        // NEW: Fill in blank question type
        case 'fill_in_blank':
          console.log('Processing fill in blank...');
          const blankText = formData.get('blank_text');
          const blankAnswers = formData.get('blank_answers'); // Comma separated answers
          console.log('Fill in blank:', { blankText, blankAnswers });
          
          // Store template and possible answers in question_options
          await supabase.from('question_options').delete().eq('question_id', questionId);
          
          // Store the template text
          const templateOption = {
            question_id: questionId,
            option_text: blankText,
            is_correct: false,
            option_type: 'template'
          };
          
          // Store each possible answer
          const answers = blankAnswers.split(',').map(answer => answer.trim()).filter(answer => answer);
          const answerOptions = answers.map((answer, index) => ({
            question_id: questionId,
            option_text: answer,
            is_correct: true,
            option_type: 'answer',
            sequence: index + 1
          }));
          
          const fillBlankOptions = [templateOption, ...answerOptions];
          
          console.log('Inserting fill in blank options:', fillBlankOptions);
          const { error: fbError } = await supabase.from('question_options').insert(fillBlankOptions);
          if (fbError) throw fbError;
          console.log('Fill in blank saved');
          break;

        // NEW: Drag and drop question type
        case 'drag_and_drop':
          console.log('Processing drag and drop...');
          
          // Try to handle drag and drop items
          try {
            // Delete existing drag drop items
            await supabase.from('drag_drop_items').delete().eq('question_id', questionId);
            
            // Get drag items and drop zones from form
            const dragItems = [];
            const dropZones = [];
            
            // Collect drag items
            for (let i = 1; i <= 6; i++) {
              const itemText = formData.get(`drag_item_${i}`);
              const itemZone = formData.get(`drag_item_${i}_zone`);
              if (itemText && itemText.trim()) {
                dragItems.push({
                  question_id: questionId,
                  item_text: itemText.trim(),
                  target_zone: itemZone || i,
                  item_type: 'draggable',
                  sequence: i
                });
              }
            }
            
            // Collect drop zones
            for (let i = 1; i <= 4; i++) {
              const zoneLabel = formData.get(`drop_zone_${i}`);
              if (zoneLabel && zoneLabel.trim()) {
                dropZones.push({
                  question_id: questionId,
                  item_text: zoneLabel.trim(),
                  target_zone: i,
                  item_type: 'drop_zone',
                  sequence: i
                });
              }
            }
            
            const allDragDropItems = [...dragItems, ...dropZones];
            
            if (allDragDropItems.length > 0) {
              console.log('Inserting drag drop items:', allDragDropItems);
              const { error: ddError } = await supabase.from('drag_drop_items').insert(allDragDropItems);
              if (ddError) throw ddError;
              console.log('Drag drop items saved');
            }
            
          } catch (ddError) {
            console.warn('Could not save drag drop items (table may not exist):', ddError);
            // Fallback: store as question_options
            await supabase.from('question_options').delete().eq('question_id', questionId);
            
            const ddData = {
              drag_items: [],
              drop_zones: []
            };
            
            // Collect data for fallback storage
            for (let i = 1; i <= 6; i++) {
              const itemText = formData.get(`drag_item_${i}`);
              const itemZone = formData.get(`drag_item_${i}_zone`);
              if (itemText && itemText.trim()) {
                ddData.drag_items.push({
                  text: itemText.trim(),
                  zone: itemZone || i
                });
              }
            }
            
            for (let i = 1; i <= 4; i++) {
              const zoneLabel = formData.get(`drop_zone_${i}`);
              if (zoneLabel && zoneLabel.trim()) {
                ddData.drop_zones.push({
                  label: zoneLabel.trim(),
                  id: i
                });
              }
            }
            
            const ddOption = {
              question_id: questionId,
              option_text: JSON.stringify(ddData),
              is_correct: true,
              option_type: 'drag_drop_data'
            };
            
            const { error: ddFallbackError } = await supabase.from('question_options').insert([ddOption]);
            if (ddFallbackError) throw ddFallbackError;
            console.log('Drag drop data saved as fallback');
          }
          break;

        case 'voice_input':
          console.log('Processing voice input...');
          
          try {
            const voiceData = {
              instruction: formData.get('instruction'),
              expected_answer: formData.get('expected_answer'),
              transcription_model: formData.get('transcription_model'),
              tolerance_level: parseInt(formData.get('tolerance_level')),
              updated_at: new Date().toISOString()
            };
            
            console.log('Voice data:', voiceData);
            const { error: voiceError } = await supabase
              .from('questions')
              .update(voiceData)
              .eq('id', questionId);
              
            if (voiceError) {
              console.log('Voice columns not found, storing as options...');
              
              await supabase.from('question_options').delete().eq('question_id', questionId);
              
              const voiceOption = {
                question_id: questionId,
                option_text: JSON.stringify({
                  instruction: formData.get('instruction'),
                  expected_answer: formData.get('expected_answer'),
                  transcription_model: formData.get('transcription_model'),
                  tolerance_level: parseInt(formData.get('tolerance_level'))
                }),
                is_correct: true
              };
              
              const { error: voiceOptionError } = await supabase
                .from('question_options')
                .insert([voiceOption]);
                
              if (voiceOptionError) throw voiceOptionError;
            }
            
          } catch (voiceError) {
            console.error('Error handling voice input:', voiceError);
            throw voiceError;
          }
          
          console.log('Voice input data saved');
          break;
          
        default:
          console.log('No specific handling needed for question type:', questionType);
      }
      
      console.log('=== SPECIFIC DATA HANDLING COMPLETE ===');
    } catch (error) {
      console.error('=== ERROR IN SPECIFIC DATA HANDLING ===');
      console.error('Error details:', error);
      throw error;
    }
  };

  // MOVED: Render answer section function
  const renderAnswerSection = () => {
    console.log('Rendering answer section for type:', selectedQuestionType);
    console.log('Editing question:', editingQuestion);
    
    switch (selectedQuestionType) {
      case 'multiple_choice':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Opsi Jawaban</label>
            <div className="space-y-3">
              {questionOptions.map((option, index) => {
                // FIXED: Better handling of existing data for edit
                const existingOption = editingQuestion?.question_options?.[index];
                const defaultText = existingOption?.option_text || '';
                const isCorrect = existingOption?.is_correct || false;
                
                console.log(`Option ${option.label}:`, { defaultText, isCorrect });
                
                return (
                  <div key={option.label} className="flex items-center gap-3">
                    <span className="font-medium w-6">{option.label}.</span>
                    <input
                      type="text"
                      name={`option_${option.label}`}
                      defaultValue={defaultText}
                      className="flex-grow p-2 border rounded"
                      placeholder={`Opsi ${option.label}`}
                      required
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="correct_answer"
                        value={option.label}
                        defaultChecked={isCorrect}
                        required
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-600">Benar</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'true_false':
        // FIXED: Get correct answer from question_options for true/false
        const getTrueFalseAnswer = () => {
          if (editingQuestion?.question_options) {
            const correctOption = editingQuestion.question_options.find(opt => opt.is_correct);
            if (correctOption) {
              return correctOption.option_text === 'Benar' ? 'true' : 'false';
            }
          }
          return null;
        };
        
        const currentTfAnswer = getTrueFalseAnswer();
        console.log('Current true/false answer:', currentTfAnswer);
        
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Jawaban Benar</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="true_false_answer"
                  value="true"
                  defaultChecked={currentTfAnswer === 'true'}
                  required
                  className="w-4 h-4 text-blue-600"
                />
                <span>Benar</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="true_false_answer"
                  value="false"
                  defaultChecked={currentTfAnswer === 'false'}
                  required
                  className="w-4 h-4 text-blue-600"
                />
                <span>Salah</span>
              </label>
            </div>
          </div>
        );

      case 'short_answer':
        // FIXED: Get correct answer from question_options for short answer
        const getShortAnswer = () => {
          if (editingQuestion?.question_options && editingQuestion.question_options.length > 0) {
            const correctOption = editingQuestion.question_options.find(opt => opt.is_correct);
            return correctOption?.option_text || '';
          }
          return '';
        };
        
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Jawaban Yang Benar</label>
            <input
              type="text"
              name="correct_answer"
              defaultValue={getShortAnswer()}
              className="w-full p-2 border rounded"
              placeholder="Masukkan jawaban yang benar"
              required
            />
          </div>
        );

      case 'matching':
        console.log('Rendering matching section with data:', matchingPairsData);
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium">Pasangan Mencocokkan</label>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                {matchingPairsCount} Pasangan
              </div>
            </div>
            <div className="space-y-4">
              {matchingPairsData.map((pair, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Item Kiri {index + 1}</label>
                    <input
                      type="text"
                      name={`matching_item_${index}`}
                      value={pair.left_item || ''}
                      onChange={(e) => {
                        const newPairs = [...matchingPairsData];
                        newPairs[index] = { ...newPairs[index], left_item: e.target.value };
                        setMatchingPairsData(newPairs);
                      }}
                      className="w-full p-2 border rounded"
                      placeholder={`Item Kiri ${index + 1}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Item Kanan {index + 1}</label>
                    <input
                      type="text"
                      name={`matching_match_${index}`}
                      value={pair.right_item || ''}
                      onChange={(e) => {
                        const newPairs = [...matchingPairsData];
                        newPairs[index] = { ...newPairs[index], right_item: e.target.value };
                        setMatchingPairsData(newPairs);
                      }}
                      className="w-full p-2 border rounded"
                      placeholder={`Item Kanan ${index + 1}`}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'fill_in_blank':
        // NEW: Render for fill in the blank
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Isi Teks Berikut</label>
            <input
              type="text"
              name="blank_text"
              defaultValue={editingQuestion?.question_text || ''}
              className="w-full p-2 border rounded mb-4"
              placeholder="Contoh: Huruf hijaiyah manakah yang berbentuk seperti huruf ___?"
              required
            />
            <label className="block text-sm font-medium mb-2">Jawaban yang Benar</label>
            <input
              type="text"
              name="blank_answers"
              defaultValue={editingQuestion?.question_options?.filter(opt => opt.is_correct).map(opt => opt.option_text).join(', ') || ''}
              className="w-full p-2 border rounded"
              placeholder="Pisahkan dengan koma jika lebih dari satu"
              required
            />
          </div>
        );

      case 'drag_and_drop':
        // NEW: Render for drag and drop
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Item Drag dan Drop</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    name={`drag_item_${index + 1}`}
                    defaultValue={editingQuestion?.question_options?.[index]?.option_text || ''}
                    className="flex-grow p-2 border rounded"
                    placeholder={`Item Drag ${index + 1}`}
                  />
                  <select
                    name={`drag_item_${index + 1}_zone`}
                    defaultValue={editingQuestion?.question_options?.[index]?.target_zone || ''}
                    className="p-2 border rounded"
                  >
                    <option value="">Pilih Zona</option>
                    {[...Array(4)].map((_, zoneIndex) => (
                      <option key={zoneIndex} value={zoneIndex + 1}>
                        Zona {zoneIndex + 1}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      case 'voice_input':
        // FIXED: Get voice data from question_options if voice columns don't exist
        const getVoiceData = () => {
          // Try to get from direct columns first
          if (editingQuestion?.instruction || editingQuestion?.expected_answer) {
            return {
              instruction: editingQuestion.instruction || '',
              expected_answer: editingQuestion.expected_answer || '',
              transcription_model: editingQuestion.transcription_model || 'wav2vec',
              tolerance_level: editingQuestion.tolerance_level || 80
            };
          }
          
          // Try to get from question_options as JSON
          if (editingQuestion?.question_options && editingQuestion.question_options.length > 0) {
            try {
              const voiceOption = editingQuestion.question_options.find(opt => opt.is_correct);
              if (voiceOption) {
                const voiceData = JSON.parse(voiceOption.option_text);
                return {
                  instruction: voiceData.instruction || '',
                  expected_answer: voiceData.expected_answer || '',
                  transcription_model: voiceData.transcription_model || 'wav2vec',
                  tolerance_level: voiceData.tolerance_level || 80
                };
              }
            } catch (e) {
              console.log('Could not parse voice data from options');
            }
          }
          
          return {
            instruction: '',
            expected_answer: '',
            transcription_model: 'wav2vec',
            tolerance_level: 80
          };
        };
        
        const voiceData = getVoiceData();
        
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instruksi</label>
              <input
                type="text"
                name="instruction"
                required
                defaultValue={voiceData.instruction}
                className="w-full p-2 border rounded"
                placeholder="Contoh: Bacakan kata berikut dengan benar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Teks yang Harus Dibaca</label>
              <input
                type="text"
                name="expected_answer"
                required
                defaultValue={voiceData.expected_answer}
                className="w-full p-2 border rounded"
                placeholder="Teks yang harus dibaca oleh pengguna"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model Transkripsi</label>
              <select
                name="transcription_model"
                required
                defaultValue={voiceData.transcription_model}
                className="w-full p-2 border rounded"
              >
                <option value="wav2vec">wav2vec (Huruf/Kalimat Biasa)</option>
                <option value="whisper">Whisper (Ayat Al-Qur'an)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tingkat Toleransi (%)</label>
              <input
                type="number"
                name="tolerance_level"
                min="1"
                max="100"
                defaultValue={voiceData.tolerance_level}
                className="w-full p-2 border rounded"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tingkat kecocokan minimal untuk menganggap jawaban benar (1-100)
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // MOVED: Question Modal Component
  const QuestionModal = () => (
    <AnimatePresence>
      {(showEditQuestionModal || showAddQuestionModal) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            margin: 0,
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // FIXED: Just close modal without refresh
              handleModalClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full shadow-2xl"
            style={{
              position: 'relative',
              zIndex: 100000,
              maxWidth: 'min(90vw, 70rem)',
              width: '85vw',
              height: 'auto',
              maxHeight: '85vh',
              minHeight: 'auto',
              margin: '0 auto',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4"> {/* Kurangi margin dari mb-6 ke mb-4 */}
              <h3 className="text-xl font-bold text-gray-800"> {/* Kurangi dari text-2xl ke text-xl */}
                {editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
              </h3>
            </div>

            {/* 2 Column Layout */}
            <form onSubmit={handleSubmitQuestion} className="space-y-4"> {/* Kurangi space dari space-y-6 ke space-y-4 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column - Question Details */}
                <div className="space-y-4"> {/* Kurangi space dari space-y-6 ke space-y-4 */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200"> {/* Kurangi padding dari p-4 ke p-3 */}
                    <h4 className="text-base font-semibold mb-3 text-blue-800"> {/* Kurangi dari text-lg ke text-base dan mb-4 ke mb-3 */}
                      Detail Soal
                    </h4>
                    
                    {/* Sub Pelajaran */}
                    <div className="mb-3"> {/* Kurangi dari mb-4 ke mb-3 */}
                      <label className="block text-sm font-semibold mb-1 text-gray-700"> {/* Kurangi margin dari mb-2 ke mb-1 */}
                        Sub Pelajaran
                      </label>
                      <select
                        name="sublesson_id"
                        required
                        defaultValue={editingQuestion?.sublesson_id || ''}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" // Kurangi padding dari p-3 ke p-2
                      >
                        <option value="">Pilih Sub Pelajaran</option>
                        {subLessons.map(subLesson => (
                          <option key={subLesson.id} value={subLesson.id}>
                            {roadmapLevels.find(l => l.id === subLesson.level_id)?.title} - {subLesson.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tipe Soal - ENHANCED with all types */}
                    <div className="mb-3">
                      <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Tipe Soal
                      </label>
                      <select
                        name="question_type"
                        required
                        value={selectedQuestionType}
                        onChange={(e) => setSelectedQuestionType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Pilih Tipe Soal</option>
                        <option value="multiple_choice">Pilihan Ganda</option>
                        <option value="true_false">Benar/Salah</option>
                        <option value="short_answer">Isian Singkat</option>
                        <option value="matching">Mencocokkan</option>
                        <option value="fill_in_blank">Isian Kosong</option>
                        <option value="drag_and_drop">Drag & Drop</option>
                        <option value="voice_input">Input Suara</option>
                      </select>
                    </div>

                    {/* Teks Soal */}
                    <div className="mb-3">
                      <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Teks Soal
                      </label>
                      <textarea
                        name="question_text"
                        required
                        defaultValue={editingQuestion?.question_text || ''}
                        className="w-full p-2 border border-gray-300 rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y" // Kurangi min-height dari 150px ke 100px
                        placeholder="Contoh: Huruf hijaiyah manakah yang bentuknya seperti huruf &#34;ب&#34; (ba)?"
                      />
                    </div>

                    {/* Urutan Soal */}
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Urutan Soal
                      </label>
                      <input
                        type="number"
                        name="order_sequence"
                        required
                        min="1"
                        defaultValue={editingQuestion?.order_sequence || 1}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Masukkan urutan soal"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Answer Section */}
                <div className="space-y-4">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 min-h-[300px]"> {/* Kurangi padding dari p-4 ke p-3 */}
                    <h4 className="text-base font-semibold mb-3 text-green-800"> {/* Kurangi dari text-lg dan mb-4 */}
                      Pengaturan Jawaban
                    </h4>
                    
                    {selectedQuestionType ? (
                      <div className="space-y-3"> {/* Kurangi space dari space-y-4 ke space-y-3 */}
                        {renderAnswerSection()}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-48 text-gray-500"> {/* Kurangi height dari h-64 ke h-48 */}
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"> {/* Kurangi ukuran dan margin */}
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-sm">Pilih tipe soal untuk mengatur jawaban</p> {/* Kurangi text size */}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleModalClose} // FIXED: Use dedicated close handler
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  {editingQuestion ? 'Simpan Perubahan' : 'Tambah Soal'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ADDED: Dedicated modal close handler that doesn't trigger refresh
  const handleModalClose = () => {
    console.log('Modal closed without saving - no refresh needed');
    setShowEditQuestionModal(false);
    setShowAddQuestionModal(false);
    setEditingQuestion(null);
    setSelectedQuestionType('');
    // REMOVED: No refresh here since no changes were made
  };

  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Kelola Konten - Admin Panel</title>
        <meta name="description" content="Kelola konten pembelajaran makhrojul huruf" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* ADD: Toast component for notifications */}
      <Toast />
      
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
              <motion.div className="relative min-h-[320px] bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white p-8 rounded-3xl overflow-hidden mb-8">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-emerald-500/40 to-teal-500/30 animate-gradient-x"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-green-500/30 to-emerald-600/25 animate-gradient-xy"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-white/15 to-white/5 rounded-full animate-float-slow backdrop-blur-sm" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-white/10 to-transparent rounded-full transform translate-x-1/3 translate-y-1/3 animate-float-reverse" />
                
                <div className="absolute top-1/4 -left-8 w-24 h-24 bg-gradient-to-r from-cyan-300/20 to-green-400/15 rounded-full animate-float-x" />
                <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-gradient-to-br from-emerald-300/25 to-teal-400/15 rounded-full animate-bounce-slow" />

                {/* Content */}
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1">
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent drop-shadow-lg"
                    >
                      Kelola Konten Pembelajaran
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/95 max-w-md text-lg leading-relaxed drop-shadow-sm"
                    >
                      Kelola tingkatan pembelajaran, soal-soal latihan, dan pengaturan akurasi untuk pengalaman belajar yang optimal
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
                    onClick={() => setActiveTab('roadmap')}
                    className="bg-white/95 backdrop-blur-sm text-green-700 font-semibold py-3 px-6 rounded-xl hover:bg-white transition-all duration-300 flex items-center gap-2 shadow-xl hover:shadow-2xl border border-white/20"
                  >
                    <IconPlus size={18} />
                    <span>Tambah Konten</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Menu Admin Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <AdminMenuCard 
                  icon={<IconDatabase className="text-blue-600" size={20} />}
                  title="Analisis Data"
                  description="Analisis penggunaan platform dan rekomendasi perbaikan"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/data/AdminData')}
                  isActive={false}
                />
                <AdminMenuCard 
                  icon={<IconBook className="text-green-600" size={20} />}
                  title="Kelola Konten"
                  description="Kelola materi, modul, dan konten pembelajaran makhrojul huruf"
                  bgColor="bg-white"
                  onClick={() => router.push('/admin/content/AdminContent')}
                  isActive={true}
                />
                <AdminMenuCard 
                  icon={<IconCalendarEvent className="text-purple-600" size={20} />}
                  title="Event & Aktivitas"
                  description="Kelola event dan aktivitas khusus pembelajaran"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/event/AdminEvent')}
                  isActive={false}
                />
                <AdminMenuCard 
                  icon={<IconUserCheck className="text-amber-600" size={20} />}
                  title="Verifikasi"
                  description="Verifikasi akun guru dan pengawasan sistem pembelajaran"
                  bgColor="bg-white"
                  onClick={() => router.push('/dashboard/admin/verification/AdminVerif')}
                  isActive={false}
                />
              </div>
              
              {/* Container */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm p-8 mb-10 border border-white/50">
                {/* Tab Navigation */}
                <TabNavigation />

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <StatCard 
                        title="Total Tingkatan"
                        value={roadmapLevels.length}
                        bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
                        icon={<IconBook className="text-white" size={20} />}
                        description="level pembelajaran tersedia"
                      />
                      <StatCard 
                        title="Sub Pelajaran"
                        value={subLessons.length}
                        bgColor="bg-gradient-to-br from-green-500 to-green-600"
                        icon={<IconList className="text-white" size={20} />}
                        description="materi pembelajaran"
                      />
                      <StatCard 
                        title="Bank Soal"
                        value={questions.length}
                        bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                        icon={<IconEdit className="text-white" size={20} />}
                        description="soal latihan aktif"
                      />
                      <StatCard 
                        title="Akurasi Rata-rata"
                        value="82%"
                        bgColor="bg-gradient-to-br from-amber-500 to-amber-600"
                        icon={<IconChartBar className="text-white" size={20} />}
                        description="standar pembelajaran"
                      />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                          onClick={() => setActiveTab('roadmap')}
                          className="p-4 bg-white rounded-xl hover:shadow-md transition-all text-left border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <IconPlus size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Tambah Tingkatan</h4>
                              <p className="text-sm text-gray-600">Buat level pembelajaran baru</p>
                            </div>
                          </div>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab('questions')}
                          className="p-4 bg-white rounded-xl hover:shadow-md transition-all text-left border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <IconEdit size={20} className="text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Buat Soal</h4>
                              <p className="text-sm text-gray-600">Tambah soal latihan baru</p>
                            </div>
                          </div>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab('accuracy')}
                          className="p-4 bg-white rounded-xl hover:shadow-md transition-all text-left border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <IconSettings size={20} className="text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">Atur Akurasi</h4>
                              <p className="text-sm text-gray-600">Sesuaikan standar minimal</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'roadmap' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Roadmap Management Content */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Manajemen Tingkatan</h3>
                          <p className="text-gray-600">Kelola struktur pembelajaran dan sub-pelajaran</p>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setShowAddSubLessonModal(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                          >
                            <IconPlus size={18} />
                            <span>Sub Pelajaran</span>
                          </button>
                          <button 
                            onClick={() => setShowAddLevelModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                          >
                            <IconPlus size={18} />
                            <span>Tingkatan</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Roadmap Tables would go here */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100">
                          <h4 className="font-semibold text-gray-800">Tingkatan Pembelajaran</h4>
                        </div>
                        <div className="p-4">
                          <div className="text-center py-8 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <IconBook size={24} className="text-gray-400" />
                            </div>
                            <p>Data tingkatan akan ditampilkan di sini</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'questions' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ContentManageQuestion 
                      showAddQuestionModal={showAddQuestionModal}
                      setShowAddQuestionModal={setShowAddQuestionModal}
                      showEditQuestionModal={showEditQuestionModal}
                      setShowEditQuestionModal={setShowEditQuestionModal}
                      editingQuestion={editingQuestion}
                      setEditingQuestion={setEditingQuestion}
                      selectedQuestionType={selectedQuestionType}
                      setSelectedQuestionType={setSelectedQuestionType}
                      matchingPairsData={matchingPairsData}
                      setMatchingPairsData={setMatchingPairsData}
                      matchingPairsCount={matchingPairsCount}
                      setMatchingPairsCount={setMatchingPairsCount}
                      roadmapLevels={roadmapLevels}
                      subLessons={subLessons}
                      questionTypes={questionTypes}
                    />
                  </motion.div>
                )}

                {activeTab === 'accuracy' && <AccuracySettingsTab />}
              </div>
            </div>
  </main>

          {/* Question Modal - Now in AdminContent */}
          <QuestionModal />
          
          {/* ADD: Accuracy Edit Modal */}
          <AccuracyEditModal />
          
          {/* Floating Dock */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <FloatingDock items={dockItems} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminContent;