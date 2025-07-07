import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

const ContentManageLevel = () => {
  const [roadmapLevels, setRoadmapLevels] = useState([]);
  const [subLessons, setSubLessons] = useState([]);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [showAddSubLessonModal, setShowAddSubLessonModal] = useState(false);
  const [showEditLevelModal, setShowEditLevelModal] = useState(false);
  const [showEditSubLessonModal, setShowEditSubLessonModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editingSubLesson, setEditingSubLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch roadmap data
  const fetchRoadmapData = async () => {
    try {
      setIsLoading(true);
      const [levelsResponse, subLessonsResponse] = await Promise.all([
        supabase.from('roadmap_levels').select('*').order('order_sequence'),
        supabase.from('roadmap_sub_lessons').select('*').order('order_sequence')
      ]);

      if (levelsResponse.error) throw levelsResponse.error;
      if (subLessonsResponse.error) throw subLessonsResponse.error;

      setRoadmapLevels(levelsResponse.data || []);
      setSubLessons(subLessonsResponse.data || []);
    } catch (error) {
      console.error('Error fetching roadmap data:', error);
      alert('Gagal memuat data roadmap: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  // Handle level operations
  const handleEditLevel = (level, e) => {
    e.stopPropagation();
    setEditingLevel(level);
    setShowEditLevelModal(true);
  };

  const handleDeleteLevel = async (levelId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tingkatan ini?')) return;

    try {
      const { error } = await supabase
        .from('roadmap_levels')
        .delete()
        .eq('id', levelId);

      if (error) throw error;
      
      alert('Tingkatan berhasil dihapus');
      fetchRoadmapData();
    } catch (error) {
      console.error('Error deleting level:', error);
      alert('Gagal menghapus tingkatan: ' + error.message);
    }
  };

  const handleSubmitLevel = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const levelData = {
        title: formData.get('title'),
        description: formData.get('description'),
        level: formData.get('level'),
        duration: formData.get('duration'),
        points: parseInt(formData.get('points')) || 0,
        lessons_total: parseInt(formData.get('lessons_total')) || 0,
        order_sequence: parseInt(formData.get('order_sequence')) || 1,
        status: formData.get('status') || 'active',
        color: formData.get('color') || 'bg-blue-100 text-blue-800'
      };

      if (editingLevel) {
        const { error } = await supabase
          .from('roadmap_levels')
          .update({ ...levelData, updated_at: new Date().toISOString() })
          .eq('id', editingLevel.id);

        if (error) throw error;
        alert('Tingkatan berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('roadmap_levels')
          .insert([{ ...levelData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        alert('Tingkatan berhasil ditambahkan');
      }

      setShowEditLevelModal(false);
      setShowAddLevelModal(false);
      setEditingLevel(null);
      fetchRoadmapData();
    } catch (error) {
      console.error('Error saving level:', error);
      alert('Gagal menyimpan tingkatan: ' + error.message);
    }
  };

  // Handle sub lesson operations
  const handleEditSubLesson = (subLesson) => {
    setEditingSubLesson(subLesson);
    setShowEditSubLessonModal(true);
  };

  const handleDeleteSubLesson = async (subLessonId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sub pelajaran ini?')) return;

    try {
      const { error } = await supabase
        .from('roadmap_sub_lessons')
        .delete()
        .eq('id', subLessonId);

      if (error) throw error;
      
      alert('Sub pelajaran berhasil dihapus');
      fetchRoadmapData();
    } catch (error) {
      console.error('Error deleting sub lesson:', error);
      alert('Gagal menghapus sub pelajaran: ' + error.message);
    }
  };

  const handleSubmitSubLesson = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const subLessonData = {
        title: formData.get('title'),
        description: formData.get('description'),
        level_id: parseInt(formData.get('level_id')),
        order_sequence: parseInt(formData.get('order_sequence')) || 1,
        content: formData.get('content') || '',
        duration: formData.get('duration') || '15 menit',
        points: parseInt(formData.get('points')) || 10
      };

      if (editingSubLesson) {
        const { error } = await supabase
          .from('roadmap_sub_lessons')
          .update({ ...subLessonData, updated_at: new Date().toISOString() })
          .eq('id', editingSubLesson.id);

        if (error) throw error;
        alert('Sub pelajaran berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('roadmap_sub_lessons')
          .insert([{ ...subLessonData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        alert('Sub pelajaran berhasil ditambahkan');
      }

      setShowEditSubLessonModal(false);
      setShowAddSubLessonModal(false);
      setEditingSubLesson(null);
      fetchRoadmapData();
    } catch (error) {
      console.error('Error saving sub lesson:', error);
      alert('Gagal menyimpan sub pelajaran: ' + error.message);
    }
  };

  // Render functions
  const renderLevelButtons = (level) => (
    <div className="flex gap-2">
      <button 
        onClick={(e) => handleEditLevel(level, e)}
        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
        title="Edit Tingkatan"
      >
        <IconEdit size={16} />
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteLevel(level.id);
        }}
        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
        title="Hapus Tingkatan"
      >
        <IconTrash size={16} />
      </button>
    </div>
  );

  const renderSubLessonButtons = (subLesson) => (
    <div className="flex gap-2">
      <button 
        onClick={() => handleEditSubLesson(subLesson)}
        className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
        title="Edit Sub Pelajaran"
      >
        <IconEdit size={16} />
      </button>
      <button 
        onClick={() => handleDeleteSubLesson(subLesson.id)}
        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
        title="Hapus Sub Pelajaran"
      >
        <IconTrash size={16} />
      </button>
    </div>
  );

  // Modal components
  const LevelModal = () => (
    <AnimatePresence>
      {(showEditLevelModal || showAddLevelModal) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingLevel ? 'Edit Tingkatan' : 'Tambah Tingkatan'}
            </h3>
            <form onSubmit={handleSubmitLevel} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Judul</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingLevel?.title}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Tingkatan Pemula"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <select 
                    name="level"
                    required
                    defaultValue={editingLevel?.level}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Level</option>
                    <option value="beginner">Pemula</option>
                    <option value="intermediate">Menengah</option>
                    <option value="advanced">Lanjutan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  rows="3"
                  defaultValue={editingLevel?.description}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi tingkatan pembelajaran..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Durasi</label>
                  <input
                    type="text"
                    name="duration"
                    defaultValue={editingLevel?.duration}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: 2 minggu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Pelajaran</label>
                  <input
                    type="number"
                    name="lessons_total"
                    min="0"
                    defaultValue={editingLevel?.lessons_total}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poin</label>
                  <input
                    type="number"
                    name="points"
                    min="0"
                    defaultValue={editingLevel?.points}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Urutan</label>
                  <input
                    type="number"
                    name="order_sequence"
                    min="1"
                    required
                    defaultValue={editingLevel?.order_sequence}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    name="status"
                    defaultValue={editingLevel?.status || 'active'}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warna Badge</label>
                  <select 
                    name="color"
                    defaultValue={editingLevel?.color}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bg-blue-100 text-blue-800">Biru</option>
                    <option value="bg-green-100 text-green-800">Hijau</option>
                    <option value="bg-yellow-100 text-yellow-800">Kuning</option>
                    <option value="bg-purple-100 text-purple-800">Ungu</option>
                    <option value="bg-red-100 text-red-800">Merah</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditLevelModal(false);
                    setShowAddLevelModal(false);
                    setEditingLevel(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingLevel ? 'Simpan Perubahan' : 'Tambah Tingkatan'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const SubLessonModal = () => (
    <AnimatePresence>
      {(showEditSubLessonModal || showAddSubLessonModal) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingSubLesson ? 'Edit Sub Pelajaran' : 'Tambah Sub Pelajaran'}
            </h3>
            <form onSubmit={handleSubmitSubLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tingkatan</label>
                <select 
                  name="level_id"
                  required
                  defaultValue={editingSubLesson?.level_id}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Tingkatan</option>
                  {roadmapLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Judul Sub Pelajaran</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingSubLesson?.title}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Pengenalan Huruf Alif"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  name="description"
                  rows="3"
                  defaultValue={editingSubLesson?.description}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi sub pelajaran..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Konten</label>
                <textarea
                  name="content"
                  rows="5"
                  defaultValue={editingSubLesson?.content}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Konten pembelajaran..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Urutan</label>
                  <input
                    type="number"
                    name="order_sequence"
                    min="1"
                    required
                    defaultValue={editingSubLesson?.order_sequence}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Durasi</label>
                  <input
                    type="text"
                    name="duration"
                    defaultValue={editingSubLesson?.duration}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: 15 menit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poin</label>
                  <input
                    type="number"
                    name="points"
                    min="0"
                    defaultValue={editingSubLesson?.points}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditSubLessonModal(false);
                    setShowAddSubLessonModal(false);
                    setEditingSubLesson(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSubLesson ? 'Simpan Perubahan' : 'Tambah Sub Pelajaran'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-gray-800">Manajemen Tingkatan</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddSubLessonModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <IconPlus size={18} />
              <span>Tambah Sub Pelajaran</span>
            </button>
            <button 
              onClick={() => setShowAddLevelModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <IconPlus size={18} />
              <span>Tambah Tingkatan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roadmap Levels Table */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <h4 className="p-4 border-b font-medium">Tingkatan</h4>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-3">Urutan</th>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total Pelajaran</th>
                <th className="px-4 py-3">Poin</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {roadmapLevels.map((level) => (
                <tr 
                  key={level.id} 
                  className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedLevel(expandedLevel === level.id ? null : level.id)}
                >
                  <td className="px-4 py-3">{level.order_sequence}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-800">{level.title}</div>
                      <div className="text-sm text-gray-500">{level.description}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${level.color || 'bg-gray-100 text-gray-800'}`}>
                      {level.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">{level.duration || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      level.status === 'active' ? 'bg-green-100 text-green-800' :
                      level.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {level.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{level.lessons_total || 0}</td>
                  <td className="px-4 py-3">{level.points || 0}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    {renderLevelButtons(level)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub Lessons Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <h4 className="p-4 border-b font-medium">Sub Pelajaran</h4>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-3">Urutan</th>
                <th className="px-4 py-3">Tingkatan</th>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Poin</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {subLessons.map((lesson) => (
                <tr key={lesson.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">{lesson.order_sequence}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">
                      {roadmapLevels.find(l => l.id === lesson.level_id)?.title || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{lesson.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {lesson.description || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">{lesson.duration || '-'}</td>
                  <td className="px-4 py-3">{lesson.points || 0}</td>
                  <td className="px-4 py-3">
                    {renderSubLessonButtons(lesson)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <LevelModal />
      <SubLessonModal />
    </motion.div>
  );
};

export default ContentManageLevel;

// Fix: Make sure the file /Users/alvinahmad/Downloads/nextjs-tailwindcss-navbar-main/lib/supabaseClient.js exists.
// If it does not, create it and export your supabase client instance.
// Example:
// import { createClient } from '@supabase/supabase-js';
// export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
