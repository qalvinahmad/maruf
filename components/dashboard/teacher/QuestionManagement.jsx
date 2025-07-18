import { IconBooks, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('order_sequence', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Belum ditentukan';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'Tidak ada teks';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
        Error loading questions: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <IconBooks size={20} />
          Pengaturan Soal
        </h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <IconPlus size={16} />
          Tambah Soal
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada soal yang tersedia</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Urutan</th>
                <th className="px-4 py-3">Pertanyaan</th>
                <th className="px-4 py-3">Sub Lesson ID</th>
                <th className="px-4 py-3">Type ID</th>
                <th className="px-4 py-3">Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((question, index) => (
                <motion.tr
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">#{question.id}</td>
                  <td className="px-4 py-3 text-gray-600">{question.order_sequence}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <div title={question.question_text}>
                      {truncateText(question.question_text)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{question.sublesson_id}</td>
                  <td className="px-4 py-3 text-gray-600">{question.question_type_id}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(question.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <IconEdit size={16} />
                      </button>
                      <button className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
