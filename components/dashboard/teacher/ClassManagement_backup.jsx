import { IconCheck, IconEdit, IconEye, IconPlus, IconRefresh, IconTrash, IconUsersGroup, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { showToast } from '../../ui/toast';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState({
    sections: [],
    quizzes: [],
    progress: []
  });
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      setError(err.message);
      showToast.error('Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const getClassStatus = (exp, points) => {
    // Determine status based on exp and points
    if (exp > 500 && points > 1000) return 'Aktif';
    if (exp > 200 && points > 500) return 'Menengah';
    return 'Pemula';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif': return 'bg-green-100 text-green-700';
      case 'Menengah': return 'bg-yellow-100 text-yellow-700';
      case 'Pemula': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Handler functions
  const handleAddClass = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleEditClass = (classData) => {
    setEditingClass(classData);
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (classId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini? Semua data terkait akan ikut terhapus.')) {
      return;
    }

    try {
      // Delete related data first
      await supabase.from('user_class_progress').delete().eq('class_id', classId);
      await supabase.from('class_quizzes').delete().eq('class_id', classId);
      await supabase.from('class_sections').delete().eq('class_id', classId);
      
      // Delete the class
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      showToast.success('Kelas berhasil dihapus');
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      showToast.error('Gagal menghapus kelas');
    }
  };

  const handleViewClass = async (classData) => {
    setSelectedClass(classData);
    setLoadingDetails(true);
    setIsDetailModalOpen(true);
    
    try {
      // Initialize empty arrays
      let sections = [];
      let quizzes = [];
      let progress = [];

      // Try to fetch class sections (might not exist)
      try {
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('class_sections')
          .select('*')
          .eq('class_id', classData.id)
          .order('section_order', { ascending: true });
        
        if (!sectionsError && sectionsData) {
          sections = sectionsData;
        }
      } catch (err) {
        console.log('Class sections table not found or empty:', err);
      }

      // Try to fetch class quizzes (might not exist)
      try {
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('class_quizzes')
          .select('*')
          .eq('class_id', classData.id);
        
        if (!quizzesError && quizzesData) {
          quizzes = quizzesData;
        }
      } catch (err) {
        console.log('Class quizzes table not found or empty:', err);
      }

      // Try to fetch user progress (might not exist)
      try {
        const { data: progressData, error: progressError } = await supabase
          .from('user_class_progress')
          .select(`
            *,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .eq('class_id', classData.id);
        
        if (!progressError && progressData) {
          progress = progressData;
        }
      } catch (err) {
        console.log('User class progress table not found or empty:', err);
      }

      setClassDetails({
        sections: sections || [],
        quizzes: quizzes || [],
        progress: progress || []
      });
    } catch (error) {
      console.error('Error fetching class details:', error);
      showToast.error('Gagal memuat detail kelas');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmitClass = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingClass) {
        // Update existing class
        const { error } = await supabase
          .from('classes')
          .update({
            classname: formData.classname,
            description: formData.description,
            exp: parseInt(formData.exp),
            points: parseInt(formData.points),
            durationweeks: parseInt(formData.durationweeks),
            teacher: formData.teacher,
            energy: parseInt(formData.energy),
            level: formData.level,
            status: formData.status,
            image_url: formData.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingClass.id);

        if (error) throw error;
        fetchClasses();
        return { id: editingClass.id };
      } else {
        // Create new class and return the created data
        const { data, error } = await supabase
          .from('classes')
          .insert([{
            classname: formData.classname,
            description: formData.description,
            exp: parseInt(formData.exp),
            points: parseInt(formData.points),
            durationweeks: parseInt(formData.durationweeks),
            teacher: formData.teacher,
            energy: parseInt(formData.energy),
            level: formData.level,
            status: formData.status,
            image_url: formData.image_url
          }])
          .select()
          .single();

        if (error) throw error;
        fetchClasses();
        return data;
      }
    } catch (error) {
      console.error('Error saving class:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        Error loading classes: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <IconUsersGroup size={20} />
          Manajemen Kelas
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchClasses()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg flex items-center transition-colors"
            title="Refresh data"
          >
            <IconRefresh size={16} />
          </button>
          <button 
            onClick={handleAddClass}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <IconPlus size={16} />
            Tambah Kelas
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada kelas yang tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((kelas, index) => {
            const status = getClassStatus(kelas.exp, kelas.points);
            return (
              <motion.div
                key={kelas.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-800">{kelas.classname}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="text-xs text-gray-500 line-clamp-2">{kelas.description || 'Tidak ada deskripsi'}</p>
                  <p><span className="font-medium">Guru:</span> {kelas.teacher || 'Belum ditentukan'}</p>
                  <p><span className="font-medium">Level:</span> {kelas.level || 'Pemula'}</p>
                  <p><span className="font-medium">Durasi:</span> {kelas.durationweeks} minggu</p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <div className="text-xs text-gray-500">EXP</div>
                      <div className="font-semibold text-blue-600">{kelas.exp}</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                      <div className="text-xs text-gray-500">Points</div>
                      <div className="font-semibold text-green-600">{kelas.points}</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded text-center">
                      <div className="text-xs text-gray-500">Energy</div>
                      <div className="font-semibold text-purple-600">{kelas.energy}</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-1 mt-4">
                  <button 
                    onClick={() => handleViewClass(kelas)}
                    className="p-1.5 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                    title="Lihat Detail Kelas"
                  >
                    <IconEye size={16} />
                  </button>
                  <button 
                    onClick={() => handleEditClass(kelas)}
                    className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Kelas"
                  >
                    <IconEdit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClass(kelas.id)}
                    className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus Kelas"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Class Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ClassFormModal 
              classData={editingClass} 
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleSubmitClass}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          </motion.div>
        </div>
      )}

      {/* Class Detail Modal */}
      <ClassDetailModal 
        classData={selectedClass}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClass(null);
          setClassDetails({ sections: [], quizzes: [], progress: [] });
        }}
        details={classDetails}
        loading={loadingDetails}
      />
    </div>
  );
};

// Class Form Modal Component
const ClassFormModal = ({ classData, onClose, onSubmit, isSubmitting, setIsSubmitting }) => {
  const [formData, setFormData] = useState({
    classname: classData?.classname || '',
    description: classData?.description || '',
    exp: classData?.exp || 100,
    points: classData?.points || 50,
    durationweeks: classData?.durationweeks || 4,
    teacher: classData?.teacher || '',
    energy: classData?.energy || 10,
    level: classData?.level || 'Pemula',
    status: classData?.status || 'active',
    image_url: classData?.image_url || ''
  });

  // Reset modal state when opening
  useEffect(() => {
    console.log('ClassFormModal useEffect triggered with classData:', classData);
    setCurrentPage(1);
    // Update form data when classData changes
    const newFormData = {
      classname: classData?.classname || '',
      description: classData?.description || '',
      exp: classData?.exp || 100,
      points: classData?.points || 50,
      durationweeks: classData?.durationweeks || 4,
      teacher: classData?.teacher || '',
      energy: classData?.energy || 10,
      level: classData?.level || 'Pemula',
      status: classData?.status || 'active',
      image_url: classData?.image_url || ''
    };
    console.log('Setting form data:', newFormData);
    setFormData(newFormData);
    
    if (!classData) {
      // Reset for new class
      console.log('New class - setting default quiz data');
      setQuizzesData([{
        id: null,
        title: '',
        description: '',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 30,
        questions: []
      }]);
    } else {
      // Fetch existing data for edit
      console.log('Editing existing class - fetching quizzes');
      fetchClassQuizzes();
    }
  }, [classData]);

  const fetchClassQuizzes = async () => {
    if (!classData?.id) return;
    
    console.log('Fetching quizzes for class ID:', classData.id);
    
    try {
      setLoadingQuizzes(true);
      const { data, error } = await supabase
        .from('class_quizzes')
        .select('*')
        .eq('class_id', classData.id);

      if (error) throw error;
      
      console.log('Fetched quiz data:', data);
      
      if (data && data.length > 0) {
        const formattedQuizzes = data.map(quiz => ({
          id: quiz.id,
          title: quiz.title || '',
          description: quiz.description || '',
          passing_score: quiz.passing_score || 70,
          max_attempts: quiz.max_attempts || 3,
          time_limit_minutes: quiz.time_limit_minutes || 30,
          questions: []
        }));
        
        console.log('Setting formatted quizzes:', formattedQuizzes);
        setQuizzesData(formattedQuizzes);
      } else {
        // No existing quizzes, set default empty quiz
        console.log('No existing quizzes found, setting default');
        setQuizzesData([{
          id: null,
          title: '',
          description: '',
          passing_score: 70,
          max_attempts: 3,
          time_limit_minutes: 30,
          questions: []
        }]);
      }
    } catch (error) {
      console.error('Error fetching class quizzes:', error);
      // Set default quiz on error
      setQuizzesData([{
        id: null,
        title: '',
        description: '',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 30,
        questions: []
      }]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Quiz handling functions
  const handleQuizChange = (index, field, value) => {
    const updatedQuizzes = [...quizzesData];
    updatedQuizzes[index][field] = value;
    setQuizzesData(updatedQuizzes);
  };

  const addQuiz = () => {
    setQuizzesData([...quizzesData, {
      id: null,
      title: '',
      description: '',
      passing_score: 70,
      max_attempts: 3,
      time_limit_minutes: 30,
      questions: []
    }]);
  };

  const loadSampleQuizzes = () => {
    const quizzesWithSampleData = sampleQuizzes.map(quiz => ({
      id: null,
      title: quiz.title,
      description: quiz.description,
      passing_score: quiz.passing_score,
      max_attempts: quiz.max_attempts,
      time_limit_minutes: quiz.time_limit_minutes,
      questions: []
    }));
    setQuizzesData(quizzesWithSampleData);
    showToast.success('Data sample quiz telah dimuat');
  };

  const handleClose = () => {
    // Reset state when closing
    setCurrentPage(1);
    setFormData({
      classname: '',
      description: '',
      exp: 100,
      points: 50,
      durationweeks: 4,
      teacher: '',
      energy: 10,
      level: 'Pemula',
      status: 'active',
      image_url: ''
    });
    setQuizzesData([{
      id: null,
      title: '',
      description: '',
      passing_score: 70,
      max_attempts: 3,
      time_limit_minutes: 30,
      questions: []
    }]);
    setLoadingQuizzes(false);
    setIsSubmitting(false); // Reset submitting state
    onClose();
  };

  const removeQuiz = (index) => {
    if (quizzesData.length > 1) {
      setQuizzesData(quizzesData.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only handle submit on page 2 (final submission)
    if (currentPage !== 2) {
      return;
    }

    setIsSubmitting(true);
    try {
      // On page 2, save everything
      let savedClassId = classData?.id;
      
      // Save class data first and get the class ID
      if (!savedClassId) {
        // For new class, we need to save and get the ID
        try {
          const result = await onSubmit(formData);
          savedClassId = result?.id;
          if (!savedClassId) {
            throw new Error('Failed to get class ID after creation');
          }
        } catch (error) {
          console.error('Error creating class:', error);
          showToast.error('Gagal menyimpan kelas: ' + error.message);
          return;
        }
      } else {
        // For existing class, just update
        try {
          await onSubmit(formData);
        } catch (error) {
          console.error('Error updating class:', error);
          showToast.error('Gagal memperbarui kelas: ' + error.message);
          return;
        }
      }

      // Save quiz data if we have a valid class ID
      if (savedClassId) {
        try {
          await saveQuizzesData(savedClassId);
        } catch (error) {
          console.error('Error saving quizzes:', error);
          // Class was saved but quiz failed, show specific message
          showToast.error('Kelas tersimpan tetapi gagal menyimpan quiz: ' + error.message);
          handleClose();
          return;
        }
      }
      
      showToast.success(classData ? 'Kelas berhasil diperbarui' : 'Kelas berhasil ditambahkan');
      
      // Close modal after successful submission
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast.error('Gagal menyimpan data: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveQuizzesData = async (classId) => {
    if (!classId) {
      throw new Error('No class ID provided for saving quizzes');
    }

    try {
      // Always delete existing quizzes first to avoid duplicate key conflicts
      console.log('Deleting existing quizzes for class ID:', classId);
      
      // Use more specific delete to ensure all related quizzes are removed
      const { error: deleteError, count } = await supabase
        .from('class_quizzes')
        .delete({ count: 'exact' })
        .eq('class_id', classId);
      
      if (deleteError) {
        console.error('Error deleting existing quizzes:', deleteError);
        // For certain errors, we might want to continue anyway
        if (deleteError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.warn('Continuing despite delete error...');
        }
      } else {
        console.log(`Successfully deleted ${count || 0} existing quizzes`);
      }

      // Add small delay to ensure delete operation is fully completed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Filter and prepare quizzes to insert
      const quizzesToInsert = quizzesData
        .filter(quiz => quiz.title && quiz.title.trim() !== '')
        .map((quiz, index) => {
          const quizData = {
            class_id: classId,
            title: quiz.title.trim(),
            description: quiz.description || '',
            passing_score: parseInt(quiz.passing_score) || 70,
            max_attempts: parseInt(quiz.max_attempts) || 3,
            time_limit_minutes: parseInt(quiz.time_limit_minutes) || 30
          };
          console.log(`Quiz ${index + 1} data:`, quizData);
          return quizData;
        });

      if (quizzesToInsert.length > 0) {
        console.log('Inserting quizzes:', quizzesToInsert);
        const { error } = await supabase
          .from('class_quizzes')
          .insert(quizzesToInsert);

        if (error) {
          console.error('Supabase error inserting quizzes:', error);
          if (error.code === '23505') {
            throw new Error('Duplikasi data quiz terdeteksi. Silakan coba lagi.');
          }
          throw new Error(`Database error: ${error.message}`);
        }
        console.log(`Successfully saved ${quizzesToInsert.length} quizzes`);
      } else {
        console.log('No quizzes to save (all titles empty)');
      }
    } catch (error) {
      console.error('Error saving quizzes:', error);
      throw error; // Re-throw to be handled by caller
    }
  };

  const handleNext = () => {
    // Validate page 1 before proceeding
    if (!formData.classname.trim()) {
      showToast.error('Nama kelas wajib diisi');
      return;
    }
    
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {classData ? 'Edit Kelas' : 'Tambah Kelas'}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${currentPage === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-500">Informasi Kelas</span>
            <div className={`w-3 h-3 rounded-full ${currentPage === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-500">Pengaturan Quiz</span>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <IconX size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentPage === 1 ? (
          <>
            {/* Page 1: Class Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kelas *
                </label>
                <input
                  type="text"
                  name="classname"
                  value={formData.classname}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama kelas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guru
                </label>
                <input
                  type="text"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama guru"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deskripsi kelas"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EXP
                </label>
                <input
                  type="number"
                  name="exp"
                  value={formData.exp}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durasi (minggu)
                </label>
                <input
                  type="number"
                  name="durationweeks"
                  value={formData.durationweeks}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Energy
                </label>
                <input
                  type="number"
                  name="energy"
                  value={formData.energy}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pemula">Pemula</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Lanjutan">Lanjutan</option>
                  <option value="Ahli">Ahli</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Arsip</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Gambar
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </>
        ) : (
          <>
            {/* Page 2: Quiz Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Pengaturan Quiz</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadSampleQuizzes}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                  >
                    <IconRefresh size={16} />
                    Muat Sample
                  </button>
                  <button
                    type="button"
                    onClick={addQuiz}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <IconPlus size={16} />
                    Tambah Quiz
                  </button>
                </div>
              </div>

              {loadingQuizzes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Memuat data quiz...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzesData.map((quiz, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-800">Quiz {index + 1}</h4>
                        {quizzesData.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuiz(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <IconTrash size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Judul Quiz *
                          </label>
                          <input
                            type="text"
                            value={quiz.title}
                            onChange={(e) => handleQuizChange(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Masukkan judul quiz"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nilai Lulus
                          </label>
                          <input
                            type="number"
                            value={quiz.passing_score}
                            onChange={(e) => handleQuizChange(index, 'passing_score', e.target.value)}
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deskripsi
                        </label>
                        <textarea
                          value={quiz.description}
                          onChange={(e) => handleQuizChange(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Deskripsi quiz"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maksimal Percobaan
                          </label>
                          <input
                            type="number"
                            value={quiz.max_attempts}
                            onChange={(e) => handleQuizChange(index, 'max_attempts', e.target.value)}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Batas Waktu (menit)
                          </label>
                          <input
                            type="number"
                            value={quiz.time_limit_minutes}
                            onChange={(e) => handleQuizChange(index, 'time_limit_minutes', e.target.value)}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
          {currentPage > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Kembali
            </button>
          )}
          
          <div className={`flex gap-3 ${currentPage === 1 ? 'ml-auto' : ''}`}>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            
            {currentPage < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Lanjut
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    {classData ? 'Perbarui' : 'Simpan'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

// Class Detail Modal Component
const ClassDetailModal = ({ classData, isOpen, onClose, details, loading }) => {
  if (!isOpen || !classData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Detail Kelas: {classData.classname}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IconX size={20} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Class Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Informasi Kelas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Deskripsi:</span> {classData.description || 'Tidak ada deskripsi'}</div>
                  <div><span className="font-medium">Guru:</span> {classData.teacher || 'Belum ditentukan'}</div>
                  <div><span className="font-medium">Level:</span> {classData.level}</div>
                  <div><span className="font-medium">Status:</span> {classData.status}</div>
                  <div><span className="font-medium">Durasi:</span> {classData.durationweeks} minggu</div>
                  <div><span className="font-medium">EXP:</span> {classData.exp}</div>
                  <div><span className="font-medium">Points:</span> {classData.points}</div>
                  <div><span className="font-medium">Energy:</span> {classData.energy}</div>
                </div>
              </div>

              {/* Class Sections */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Bagian Kelas ({details.sections.length})</h3>
                {details.sections.length === 0 ? (
                  <p className="text-gray-500 text-sm">Belum ada bagian yang ditambahkan</p>
                ) : (
                  <div className="space-y-2">
                    {details.sections.map((section) => (
                      <div key={section.id} className="bg-white border border-gray-200 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {section.section_order}. {section.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{section.content}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Durasi: {section.duration_minutes} menit
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Class Quizzes */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Kuis ({details.quizzes.length})</h3>
                {details.quizzes.length === 0 ? (
                  <p className="text-gray-500 text-sm">Belum ada kuis yang ditambahkan</p>
                ) : (
                  <div className="space-y-2">
                    {details.quizzes.map((quiz) => (
                      <div key={quiz.id} className="bg-white border border-gray-200 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-800">{quiz.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500 mt-2">
                          <span>Nilai Lulus: {quiz.passing_score}</span>
                          <span>Maksimal Percobaan: {quiz.max_attempts}</span>
                          <span>Batas Waktu: {quiz.time_limit_minutes} menit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Progress */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Progress Siswa ({details.progress.length})</h3>
                {details.progress.length === 0 ? (
                  <p className="text-gray-500 text-sm">Belum ada siswa yang mengikuti kelas</p>
                ) : (
                  <div className="space-y-2">
                    {details.progress.map((progress) => (
                      <div key={progress.id} className="bg-white border border-gray-200 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {progress.profiles?.full_name || progress.users?.username || 'Unknown User'}
                            </h4>
                            <p className="text-sm text-gray-600">{progress.profiles?.email || progress.users?.email || 'No email'}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-800">
                              Progress: {progress.progress_percentage}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Status: {progress.status}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${progress.progress_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ClassManagement;
