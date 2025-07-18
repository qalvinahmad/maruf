import { IconEdit, IconPlus, IconTrash, IconUsersGroup } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('class')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      setError(err.message);
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
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <IconPlus size={16} />
          Tambah Kelas
        </button>
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
                  <p><span className="font-medium">Guru:</span> {kelas.teacher || 'Belum ditentukan'}</p>
                  <p><span className="font-medium">Durasi:</span> {kelas.durationweeks} minggu</p>
                  <p><span className="font-medium">EXP:</span> {kelas.exp}</p>
                  <p><span className="font-medium">Points:</span> {kelas.points}</p>
                  <p><span className="font-medium">Energy:</span> {kelas.energy}</p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <IconEdit size={16} />
                  </button>
                  <button className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <IconTrash size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
