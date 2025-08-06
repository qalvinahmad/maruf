import { IconDeviceFloppy, IconEdit, IconPlus, IconStar, IconTrash } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { updateRatingRewardConfig } from '../../lib/ratingRewardConfig';
import { supabase } from '../../lib/supabaseClient';

const RatingRewardConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load configurations
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rating_reward_config')
        .select('*')
        .order('rating_value', { ascending: true });

      if (error) throw error;
      
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading configs:', error);
      alert('Gagal memuat konfigurasi reward');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (configData) => {
    try {
      setIsSaving(true);
      
      const result = await updateRatingRewardConfig([configData]);
      
      if (result.success) {
        await loadConfigs();
        setEditingConfig(null);
        setShowAddForm(false);
        alert('Konfigurasi berhasil disimpan!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Gagal menyimpan konfigurasi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async (id) => {
    if (!confirm('Yakin ingin menghapus konfigurasi ini?')) return;

    try {
      const { error } = await supabase
        .from('rating_reward_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadConfigs();
      alert('Konfigurasi berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting config:', error);
      alert('Gagal menghapus konfigurasi');
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <IconStar
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Konfigurasi Reward Rating</h2>
            <p className="text-yellow-100">Kelola poin reward untuk setiap rating yang diberikan pengguna</p>
          </div>
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconPlus size={20} />
            Tambah Konfigurasi
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {configs.length === 0 ? (
          <div className="text-center py-12">
            <IconStar size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum Ada Konfigurasi</h3>
            <p className="text-gray-500">Tambah konfigurasi reward untuk rating pengguna</p>
          </div>
        ) : (
          <div className="space-y-4">
            {configs.map((config, index) => (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-xl p-6 transition-all duration-200 ${
                  config.is_active 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {editingConfig?.id === config.id ? (
                  <ConfigForm
                    config={config}
                    onSave={handleSaveConfig}
                    onCancel={() => setEditingConfig(null)}
                    isSaving={isSaving}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1">
                        {getRatingStars(config.rating_value)}
                      </div>
                      
                      {/* Rating Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {config.rating_value} Star{config.rating_value > 1 ? 's' : ''}
                        </h4>
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                      
                      {/* Reward Points */}
                      <div className="bg-yellow-100 border border-yellow-200 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium text-yellow-800">
                          🎁 {config.reward_points} poin
                        </span>
                      </div>
                      
                      {/* Status */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        config.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {config.is_active ? 'Aktif' : 'Nonaktif'}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => setEditingConfig(config)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Edit"
                      >
                        <IconEdit size={18} />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleDeleteConfig(config.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Hapus"
                      >
                        <IconTrash size={18} />
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border border-blue-200 rounded-xl p-6 bg-blue-50"
            >
              <ConfigForm
                config={{
                  rating_value: configs.length + 1,
                  reward_points: 10,
                  description: '',
                  is_active: true
                }}
                onSave={handleSaveConfig}
                onCancel={() => setShowAddForm(false)}
                isSaving={isSaving}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Config Form Component
const ConfigForm = ({ config, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState(config);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating Value
          </label>
          <select
            value={formData.rating_value}
            onChange={(e) => setFormData({ ...formData, rating_value: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {[1, 2, 3, 4, 5].map(value => (
              <option key={value} value={value}>{value} Star{value > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        {/* Reward Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reward Points
          </label>
          <input
            type="number"
            value={formData.reward_points}
            onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            required
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <motion.button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: isSaving ? 1 : 1.02 }}
            whileTap={{ scale: isSaving ? 1 : 0.98 }}
          >
            <IconDeviceFloppy size={16} />
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </motion.button>
          
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Batal
          </motion.button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
          placeholder="Deskripsi untuk rating ini..."
        />
      </div>
    </form>
  );
};

export default RatingRewardConfig;
