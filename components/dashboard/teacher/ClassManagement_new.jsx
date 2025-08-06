'use client';

import { IconCheck, IconEdit, IconEye, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { showToast } from '../../../utils/toast';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [classDetails, setClassDetails] = useState({ sections: [], quizzes: [], progress: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch classes data from Supabase
  const fetchClasses = async () => {
    try {
      setLoading(true);
      console.log('Fetching classes...');
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        showToast.error('Gagal memuat data kelas: ' + error.message);
        return;
      }

      console.log('Fetched classes:', data);
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      showToast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch class details
  const fetchClassDetails = async (classId) => {
    try {
      setLoadingDetails(true);
      
      // Fetch sections
      const { data: sections, error: sectionsError } = await supabase
        .from('class_sections')
        .select('*')
        .eq('class_id', classId)
        .order('section_order', { ascending: true });

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        showToast.error('Gagal memuat data bagian kelas');
        return;
      }

      // Fetch quizzes
      const { data: quizzes, error: quizzesError } = await supabase
        .from('class_quizzes')
        .select('*')
        .eq('class_id', classId);

      if (quizzesError) {
        console.error('Error fetching quizzes:', quizzesError);
        showToast.error('Gagal memuat data kuis');
        return;
      }

      // Fetch user progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          *,
          profiles (full_name, email),
          users (username, email)
        `)
        .eq('class_id', classId);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        // Don't show error for progress as it's not critical
      }

      setClassDetails({
        sections: sections || [],
        quizzes: quizzes || [],
        progress: progress || []
      });
    } catch (error) {
      console.error('Error fetching class details:', error);
      showToast.error('Terjadi kesalahan saat memuat detail kelas');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Submit class data (create or update)
  const handleSubmitClass = async (formData) => {
    try {
      console.log('Submitting class data:', formData);
      
      if (editingClass?.id) {
        // Update existing class
        const { data, error } = await supabase
          .from('classes')
          .update(formData)
          .eq('id', editingClass.id)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        console.log('Class updated successfully:', data);
        
        // Update local state
        setClasses(prev => prev.map(cls => 
          cls.id === editingClass.id ? { ...cls, ...data } : cls
        ));
        
        return data;
      } else {
        // Create new class
        const { data, error } = await supabase
          .from('classes')
          .insert([formData])
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        console.log('Class created successfully:', data);
        
        // Add to local state
        setClasses(prev => [data, ...prev]);
        
        return data;
      }
    } catch (error) {
      console.error('Error submitting class:', error);
      throw error;
    }
  };

  // Delete class
  const handleDeleteClass = async (classId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      setClasses(prev => prev.filter(cls => cls.id !== classId));
      showToast.success('Kelas berhasil dihapus');
    } catch (error) {
      console.error('Error deleting class:', error);
      showToast.error('Gagal menghapus kelas: ' + error.message);
    }
  };

  // Handle view details
  const handleViewDetails = (classData) => {
    setSelectedClass(classData);
    setIsDetailModalOpen(true);
    fetchClassDetails(classData.id);
  };

  // Handle edit class
  const handleEditClass = (classData) => {
    setEditingClass(classData);
    setIsModalOpen(true);
  };

  // Handle add new class
  const handleAddClass = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  // Filter classes based on search term
  const filteredClasses = classes.filter(cls =>
    cls.classname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Manajemen Kelas</h1>
        <p className="text-gray-600">Kelola kelas dan konten pembelajaran</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleAddClass}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <IconPlus size={20} />
          Tambah Kelas
        </button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <motion.div
              key={classItem.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {classItem.classname}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {classItem.teacher || 'Belum ditentukan'}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    classItem.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : classItem.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {classItem.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {classItem.description || 'Tidak ada deskripsi'}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Level: {classItem.level}</span>
                <span>{classItem.durationweeks} minggu</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(classItem)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <IconEye size={16} />
                  Detail
                </button>
                <button
                  onClick={() => handleEditClass(classItem)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <IconEdit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClass(classItem.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* No Classes Found */}
      {!loading && filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Tidak ada kelas yang ditemukan' : 'Belum ada kelas yang ditambahkan'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddClass}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Tambah Kelas Pertama
            </button>
          )}
        </div>
      )}

      {/* Class Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
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

// Class Form Modal Component (Simplified - No Pagination)
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

  // Reset form data when classData changes
  useEffect(() => {
    if (classData) {
      setFormData({
        classname: classData.classname || '',
        description: classData.description || '',
        exp: classData.exp || 100,
        points: classData.points || 50,
        durationweeks: classData.durationweeks || 4,
        teacher: classData.teacher || '',
        energy: classData.energy || 10,
        level: classData.level || 'Pemula',
        status: classData.status || 'active',
        image_url: classData.image_url || ''
      });
    }
  }, [classData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.classname.trim()) {
      showToast.error('Nama kelas wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      showToast.success(classData ? 'Kelas berhasil diperbarui' : 'Kelas berhasil ditambahkan');
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast.error('Gagal menyimpan data: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
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
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {classData ? 'Edit Kelas' : 'Tambah Kelas'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class Information Form */}
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
                placeholder="Masukkan nama kelas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guru/Pengajar
              </label>
              <input
                type="text"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                placeholder="Nama guru pengajar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi kelas"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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
              </select>
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
                EXP Points
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
                Energy Cost
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Gambar
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            
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
          </div>
        </form>
      </div>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Informasi Kelas</h3>
                  <button className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm">
                    <IconEdit size={16} className="inline mr-1" />
                    Edit
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Bagian Kelas ({details.sections.length})</h3>
                  <button className="text-green-600 hover:text-green-700 px-3 py-1 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-sm">
                    <IconEdit size={16} className="inline mr-1" />
                    Edit Bagian
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Kuis ({details.quizzes.length})</h3>
                  <button className="text-purple-600 hover:text-purple-700 px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-sm">
                    <IconEdit size={16} className="inline mr-1" />
                    Edit Kuis
                  </button>
                </div>
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
