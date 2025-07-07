import { IconAlertTriangle, IconCheck, IconSettings } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

const ContentAccuracySetting = () => {
  const [accuracySettings, setAccuracySettings] = useState(null);
  const [isSavingAccuracy, setIsSavingAccuracy] = useState(false);
  const [accuracyChanged, setAccuracyChanged] = useState(false);
  const [isLoadingAccuracy, setIsLoadingAccuracy] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Fetch accuracy settings
  const fetchAccuracySettings = async () => {
    try {
      setIsLoadingAccuracy(true);
      
      const { data, error } = await supabase
        .from('accuracy_settings')
        .select('*');

      if (error) throw error;

      console.log('Fetched accuracy data:', data);

      if (data && data.length > 0) {
        const settings = {
          pemula: data.find(s => s.level === 'Pemula')?.min_accuracy || 70,
          menengah: data.find(s => s.level === 'Menengah')?.min_accuracy || 80,
          lanjutan: data.find(s => s.level === 'Lanjutan')?.min_accuracy || 90
        };
        
        console.log('Formatted settings:', settings);
        setAccuracySettings(settings);
      } else {
        // Set default values if no data exists
        setAccuracySettings({
          pemula: 70,
          menengah: 80,
          lanjutan: 90
        });
      }
    } catch (error) {
      console.error('Error fetching accuracy settings:', error);
      alert('Error mengambil pengaturan akurasi: ' + error.message);
    } finally {
      setIsLoadingAccuracy(false);
    }
  };

  useEffect(() => {
    fetchAccuracySettings();
  }, []);

  // Handle accuracy change
  const handleAccuracyChange = (level, value) => {
    setAccuracySettings(prev => ({
      ...prev,
      [level]: parseInt(value)
    }));
    setAccuracyChanged(true);
  };

  // Edit accuracy dialog
  const handleEditAccuracy = (level, currentValue) => {
    setEditingLevel(level);
    setEditingValue(currentValue.toString());
    setIsDialogOpen(true);
  };

  const handleSaveDialog = () => {
    const newValue = parseInt(editingValue);
    if (newValue >= 0 && newValue <= 100) {
      handleAccuracyChange(editingLevel, newValue);
      setIsDialogOpen(false);
    } else {
      alert('Nilai akurasi harus antara 0-100');
    }
  };

  // Save accuracy settings
  const handleSaveAccuracy = async () => {
    try {
      setIsSavingAccuracy(true);

      // Save all changes sequentially
      for (const [level, value] of Object.entries(accuracySettings)) {
        const levelName = level.charAt(0).toUpperCase() + level.slice(1);
        console.log(`Saving ${levelName} with value ${value}`);
        
        const { error } = await supabase
          .from('accuracy_settings')
          .upsert({ 
            level: levelName,
            min_accuracy: value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'level'
          });

        if (error) {
          console.error(`Error updating ${levelName}:`, error);
          throw error;
        }
      }

      setAccuracyChanged(false);
      alert('Pengaturan akurasi berhasil disimpan');
      
      // Refresh data from database
      await fetchAccuracySettings();

    } catch (error) {
      console.error('Error saving accuracy:', error);
      alert('Gagal menyimpan pengaturan akurasi: ' + error.message);
    } finally {
      setIsSavingAccuracy(false);
    }
  };

  // Reset accuracy settings
  const handleResetAccuracy = async () => {
    if (!confirm('Apakah Anda yakin ingin mereset pengaturan akurasi?')) return;
    
    try {
      setIsSavingAccuracy(true);
      await fetchAccuracySettings(); // Reload from database instead of using defaults
      setAccuracyChanged(false);
    } catch (error) {
      console.error('Error resetting accuracy:', error);
      alert('Gagal mereset pengaturan akurasi');
    } finally {
      setIsSavingAccuracy(false);
    }
  };

  if (isLoadingAccuracy) {
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
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <IconSettings size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Pengaturan Akurasi</h3>
            <p className="text-sm text-gray-600">Atur tingkat akurasi minimum untuk setiap level</p>
          </div>
        </div>
        
        {accuracyChanged && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <IconAlertTriangle size={16} />
            <span className="text-sm">Ada perubahan yang belum disimpan</span>
          </div>
        )}
      </div>

      {/* Accuracy Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(accuracySettings || {}).map(([level, value]) => (
          <motion.div
            key={level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl ${
                level === 'pemula' ? 'bg-green-500' :
                level === 'menengah' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {value}%
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 capitalize mb-1">
                  Level {level}
                </h4>
                <p className="text-sm text-gray-600">
                  Akurasi minimum yang diperlukan
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      level === 'pemula' ? 'bg-green-500' :
                      level === 'menengah' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>

                <button
                  onClick={() => handleEditAccuracy(level, value)}
                  className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
                >
                  Edit Nilai
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={handleResetAccuracy}
          disabled={isSavingAccuracy}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Reset ke Default
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setAccuracyChanged(false)}
            disabled={!accuracyChanged || isSavingAccuracy}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSaveAccuracy}
            disabled={!accuracyChanged || isSavingAccuracy}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSavingAccuracy ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <IconCheck size={16} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4 capitalize">
              Edit Akurasi Level {editingLevel}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nilai Akurasi (0-100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nilai 0-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveDialog}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <IconAlertTriangle size={14} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Informasi Pengaturan Akurasi</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Akurasi minimum menentukan batas kelulusan untuk setiap level</li>
              <li>• Pengguna harus mencapai akurasi ini untuk melanjutkan ke level berikutnya</li>
              <li>• Nilai akurasi dapat disesuaikan dari 0% hingga 100%</li>
              <li>• Perubahan akan berlaku untuk semua pengguna baru</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentAccuracySetting;
