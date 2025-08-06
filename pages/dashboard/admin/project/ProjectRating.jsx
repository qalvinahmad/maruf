import { IconChevronLeft, IconChevronRight, IconEdit, IconRefresh, IconSettings, IconStar, IconTrash, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import RatingRewardConfig from '../../../../components/admin/RatingRewardConfig';
import { safeCache } from '../../../../lib/clientSafeCache';
import { supabase } from '../../../../lib/supabaseClient';
import { ContainerTextFlip } from '../../../../src/components/ui/container-text-flip';

const getStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);

const ProjectRating = () => {
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [editingRating, setEditingRating] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0], // index 0: 1-star, ..., index 4: 5-star
    comments: [], // Store comments for text flip
  });

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async (useCache = true) => {
    setIsLoading(true);
    
    try {
      // Try to get from cache first
      if (useCache) {
        const cachedRatings = await safeCache.getUserInventory('all_ratings');
        if (cachedRatings) {
          console.log('📊 Ratings loaded from cache');
          setRatings(cachedRatings);
          calculateStats(cachedRatings);
          setIsLoading(false);
          return;
        }
      }

      console.log('📊 Fetching ratings from database...');
      
      // Fetch from database with better error handling
      const { data, error } = await supabase
        .from('rating')
        .select(`
          *,
          users!rating_user_id_fkey (
            id,
            email,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('📊 Fetched ratings:', data?.length || 0, 'records');
      
      if (data) {
        setRatings(data);
        calculateStats(data);
        
        // Cache the results for 5 minutes
        await safeCache.setUserInventory('all_ratings', data, 300);
        console.log('📊 Ratings cached successfully');
      } else {
        setRatings([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      
      // Try fallback query without users join
      try {
        console.log('📊 Trying fallback query...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('rating')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.error('Fallback query error:', fallbackError);
          throw fallbackError;
        }

        console.log('📊 Fallback query success:', fallbackData?.length || 0, 'records');
        setRatings(fallbackData || []);
        calculateStats(fallbackData || []);
        
        // Cache fallback results
        await safeCache.setUserInventory('all_ratings', fallbackData || [], 300);
      } catch (fallbackError) {
        console.error('Both queries failed:', fallbackError);
        setRatings([]);
        calculateStats([]);
        alert('Gagal memuat data rating. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const sum = data.reduce((acc, r) => acc + (r.rating || 0), 0);
    const average = total ? (sum / total) : 0;
    const distribution = [0, 0, 0, 0, 0];
    
    // Extract comments for text flip (only non-empty comments)
    const comments = data
      .filter(r => r.comment && r.comment.trim().length > 0)
      .map(r => r.comment.trim())
      .slice(0, 10); // Limit to 10 comments for better performance
    
    data.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
    });
    
    setStats({
      average,
      total,
      distribution,
      comments: comments.length > 0 ? comments : ['Belum ada komentar'],
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(ratings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRatings = ratings.slice(startIndex, endIndex);
  const showPagination = ratings.length > itemsPerPage;

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleEditRating = async (updatedRating) => {
    try {
      const { error } = await supabase
        .from('rating')
        .update({
          rating: updatedRating.rating,
          comment: updatedRating.comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedRating.id);

      if (error) throw error;

      // Clear cache and refresh data
      await safeCache.clearUserCache('all_ratings');
      await fetchRatings(false); // Force fresh fetch
      setEditingRating(null);
      alert('Rating berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Gagal memperbarui rating');
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!confirm('Yakin ingin menghapus rating ini?')) return;

    try {
      setIsDeleting(ratingId);
      const { error } = await supabase
        .from('rating')
        .delete()
        .eq('id', ratingId);

      if (error) throw error;

      // Clear cache and refresh data
      await safeCache.clearUserCache('all_ratings');
      await fetchRatings(false); // Force fresh fetch
      alert('Rating berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Gagal menghapus rating');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Penilaian Pengguna</h2>
          <p className="text-gray-600 mt-1">Kelola dan monitor rating dari pengguna</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            onClick={() => fetchRatings(false)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            <IconRefresh size={20} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Memuat...' : 'Refresh Data'}
          </motion.button>
        
          
          <motion.button
            onClick={() => setShowConfig(!showConfig)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <IconSettings size={20} />
            {showConfig ? 'Tutup Konfigurasi' : 'Konfigurasi Reward'}
          </motion.button>
        </div>
      </div>

      {/* Rating Reward Configuration */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <RatingRewardConfig />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Memuat data penilaian...</div>
      ) : (
        <>
          {/* Statistik Rating - 4 Cards Layout */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Rata-rata Rating */}
            <div className="bg-white rounded-xl p-6 shadow border flex flex-col items-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">
                {stats.average.toFixed(2)}
              </div>
              <div className="text-lg text-gray-700 mb-1">Rata-rata Rating</div>
              <div className="flex gap-1 text-yellow-400 text-xl">
                {getStars(Math.round(stats.average))}
              </div>
            </div>

            {/* Card 2: Total Penilaian */}
            <div className="bg-white rounded-xl p-6 shadow border flex flex-col items-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.total}
              </div>
              <div className="text-lg text-gray-700 mb-1">Total Penilaian</div>
            </div>
            
            {/* Card 3: Komentar dengan Text Flip */}
            <div className="bg-white rounded-xl p-6 shadow border flex flex-col items-center">
              <div className="text-lg text-gray-700 mb-4 font-semibold text-center">Terbaru</div>
              <div className="text-center min-h-[80px] flex items-center justify-center px-2">
                <ContainerTextFlip 
                  words={stats.comments}
                  interval={4000}
                  className="text-lg text-gray-600 bg-gray-50 max-w-full h-auto shadow-none border-none"
                  textClassName="text-xl px-3 py-2 text-center leading-relaxed"
                  animationDuration={500}
                />
              </div>
            </div>

            {/* Card 4: Distribusi Rating */}
            <div className="bg-white rounded-xl p-6 shadow border">
              <div className="font-semibold text-gray-700 mb-2">Distribusi Rating</div>
              <div className="space-y-1">
                {[5,4,3,2,1].map((star, idx) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-10 text-yellow-500">{star}★</span>
                    <div className="flex-1 bg-gray-100 rounded h-3">
                      <div
                        className="bg-yellow-400 h-3 rounded"
                        style={{
                          width: stats.total ? `${(stats.distribution[star-1] / stats.total) * 100}%` : '0%',
                          minWidth: stats.distribution[star-1] > 0 ? '8px' : 0
                        }}
                      />
                    </div>
                    <span className="w-8 text-gray-600 text-sm text-right">{stats.distribution[star-1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daftar Rating */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 text-gray-700 border-b">
                  <th className="px-4 py-3 text-left font-semibold">Pengguna</th>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold">Komentar</th>
                  <th className="px-4 py-3 text-left font-semibold">Reward Points</th>
                  <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                  <th className="px-4 py-3 text-left font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ratings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Tidak ada penilaian ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentRatings.map((r) => (
                    <motion.tr 
                      key={r.id} 
                      className="border-b hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {r.users?.name || r.users?.email || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            ID: {r.user_id.slice(0, 8)}...
                          </div>
                          {!r.users && (
                            <div className="text-xs text-orange-500">
                              ⚠️ User data not loaded
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 font-bold">
                            {getStars(r.rating)}
                          </span>
                          <span className="text-gray-700 font-semibold">{r.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          {r.comment ? (
                            <p className="text-gray-700 truncate" title={r.comment}>
                              {r.comment}
                            </p>
                          ) : (
                            <span className="text-gray-400 italic">Tidak ada komentar</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.reward_points ? (
                          <div className="bg-yellow-100 border border-yellow-200 rounded-lg px-3 py-1 inline-block">
                            <span className="text-sm font-medium text-yellow-800">
                              🎁 {r.reward_points} poin
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => setEditingRating(r)}
                            className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Edit Rating"
                          >
                            <IconEdit size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteRating(r.id)}
                            disabled={isDeleting === r.id}
                            className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                            whileHover={{ scale: isDeleting === r.id ? 1 : 1.1 }}
                            whileTap={{ scale: isDeleting === r.id ? 1 : 0.9 }}
                            title="Hapus Rating"
                          >
                            {isDeleting === r.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <IconTrash size={16} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-600">
                Menampilkan {startIndex + 1} - {Math.min(endIndex, stats.total)} dari {stats.total} penilaian
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                  whileHover={{ scale: currentPage === 1 ? 1 : 1.02 }}
                  whileTap={{ scale: currentPage === 1 ? 1 : 0.98 }}
                >
                  <IconChevronLeft size={16} />
                  Sebelumnya
                </motion.button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>
                
                <motion.button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                  whileHover={{ scale: currentPage === totalPages ? 1 : 1.02 }}
                  whileTap={{ scale: currentPage === totalPages ? 1 : 0.98 }}
                >
                  Selanjutnya
                  <IconChevronRight size={16} />
                </motion.button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Rating Dialog */}
      <EditRatingDialog 
        rating={editingRating}
        onClose={() => setEditingRating(null)}
        onSave={handleEditRating}
      />
    </div>
  );
};

// Edit Rating Dialog Component
const EditRatingDialog = ({ rating, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rating) {
      setFormData({
        rating: rating.rating || 5,
        comment: rating.comment || ''
      });
    }
  }, [rating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    await onSave({
      ...rating,
      ...formData
    });
    
    setIsSaving(false);
  };

  const getRatingText = (ratingValue) => {
    switch (ratingValue) {
      case 1: return 'Sangat Buruk';
      case 2: return 'Buruk';
      case 3: return 'Cukup';
      case 4: return 'Baik';
      case 5: return 'Sangat Baik';
      default: return 'Pilih Rating';
    }
  };

  const getRatingColor = (ratingValue) => {
    switch (ratingValue) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-blue-500';
      case 5: return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (!rating) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full transform translate-x-16 -translate-y-16 opacity-60"></div>
          
          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconX size={16} className="text-gray-600" />
          </motion.button>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                <IconEdit size={32} className="text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Edit Rating</h3>
              <p className="text-gray-600">Ubah rating dan komentar pengguna</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Informasi Pengguna</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Nama:</strong> {rating.users?.name || rating.users?.email || 'Unknown User'}</p>
                  <p><strong>User ID:</strong> {rating.user_id.slice(0, 8)}...</p>
                  <p><strong>Tanggal:</strong> {new Date(rating.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating Baru
                </label>
                <div className="flex justify-center items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="relative p-1"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconStar
                        size={32}
                        className={`transition-all duration-200 ${
                          star <= formData.rating
                            ? 'text-yellow-400 fill-current drop-shadow-lg'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                
                {/* Rating text */}
                <div className="text-center mb-4">
                  <span className={`font-semibold text-lg ${getRatingColor(formData.rating)}`}>
                    {getRatingText(formData.rating)}
                  </span>
                </div>
              </div>

              {/* Comment input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar
                </label>
                <motion.textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Ubah komentar pengguna..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                  whileFocus={{ scale: 1.02 }}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formData.comment.length}/500
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSaving}
                >
                  Batal
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl hover:from-blue-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                  whileHover={{ scale: isSaving ? 1 : 1.02 }}
                  whileTap={{ scale: isSaving ? 1 : 0.98 }}
                >
                  {isSaving ? (
                    <motion.div 
                      className="flex items-center justify-center gap-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </motion.div>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectRating;
