import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

const ContentManageQuestion = ({
  // Props from AdminContent for modal control
  showAddQuestionModal,
  setShowAddQuestionModal,
  showEditQuestionModal,
  setShowEditQuestionModal,
  editingQuestion,
  setEditingQuestion,
  selectedQuestionType,
  setSelectedQuestionType,
  matchingPairsData,
  setMatchingPairsData,
  matchingPairsCount,
  setMatchingPairsCount,
  roadmapLevels,
  subLessons,
  questionTypes
}) => {
  const [questions, setQuestions] = useState([]);
  const [questionFilter, setQuestionFilter] = useState('all');
  const [questionSearch, setQuestionSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper function to fetch matching pairs separately
  const fetchMatchingPairs = async (questionIds) => {
    if (!questionIds || questionIds.length === 0) return [];
    
    try {
      const { data, error } = await supabase
        .from('matching_pairs')
        .select('*')
        .in('question_id', questionIds);
      
      if (error) {
        console.warn('Error fetching matching pairs:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('Exception fetching matching pairs:', error);
      return [];
    }
  };

  // COMPLETELY REWRITTEN: Enhanced fetch function with separate queries
  const fetchQuestions = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      console.log('Fetching questions...', forceRefresh ? '(force refresh)' : '');
      
      // Step 1: Fetch basic questions with safe relations
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          question_options(*),
          roadmap_sub_lessons(
            *,
            roadmap_levels(*)
          )
        `)
        .order('order_sequence');

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }
      
      console.log('Basic questions fetched:', questionsData?.length || 0);
      
      // Step 2: Fetch matching pairs separately
      const questionIds = questionsData?.map(q => q.id) || [];
      const matchingPairs = await fetchMatchingPairs(questionIds);
      
      console.log('Matching pairs fetched:', matchingPairs.length);
      
      // Step 3: Combine data manually
      const enrichedQuestions = questionsData?.map(question => ({
        ...question,
        matching_pairs: matchingPairs.filter(pair => pair.question_id === question.id)
      })) || [];
      
      console.log('Final enriched questions:', enrichedQuestions.length);
      setQuestions(enrichedQuestions);
      
      // Reset to first page when data changes
      setCurrentPage(1);
      
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to fetch questions: ' + error.message);
      // Set empty state on error
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Listen for external refresh requests (from AdminContent after saving)
  useEffect(() => {
    const handleRefresh = () => {
      console.log('External refresh request received');
      fetchQuestions(true);
    };

    // Listen for custom events
    window.addEventListener('questionsUpdated', handleRefresh);
    
    return () => {
      window.removeEventListener('questionsUpdated', handleRefresh);
    };
  }, []);

  // FIXED: Handle question operations with proper data loading for edit
  const handleEditQuestion = (question, e) => {
    e.stopPropagation();
    console.log('=== EDITING QUESTION ===');
    console.log('Raw question object:', question);
    console.log('Question type ID:', question.question_type_id);
    console.log('Question options:', question.question_options);
    console.log('Matching pairs:', question.matching_pairs);
    
    setEditingQuestion(question);
    
    // FIXED: Enhanced mapping with better debugging
    const typeMapping = {
      1: 'multiple_choice',
      2: 'true_false', 
      3: 'short_answer',
      4: 'matching',
      5: 'voice_input',
      // String fallbacks
      'multiple_choice': 'multiple_choice',
      'true_false': 'true_false',
      'short_answer': 'short_answer',
      'matching': 'matching',
      'voice_input': 'voice_input'
    };
    
    const mappedType = typeMapping[question.question_type_id] || '';
    console.log('Mapped type from', question.question_type_id, 'to', mappedType);
    setSelectedQuestionType(mappedType);
    
    // FIXED: Properly initialize matching pairs data with existing data
    if (mappedType === 'matching') {
      console.log('Setting up matching question data...');
      if (question.matching_pairs && question.matching_pairs.length > 0) {
        console.log('Using existing matching pairs:', question.matching_pairs);
        setMatchingPairsData(question.matching_pairs);
        setMatchingPairsCount(question.matching_pairs.length);
      } else {
        console.log('No existing matching pairs, using default');
        setMatchingPairsData(Array(3).fill({ left_item: '', right_item: '' }));
        setMatchingPairsCount(3);
      }
    } else {
      // Reset matching pairs for non-matching questions
      setMatchingPairsData(Array(3).fill({ left_item: '', right_item: '' }));
      setMatchingPairsCount(3);
    }
    
    console.log('=== EDIT SETUP COMPLETE ===');
    setShowEditQuestionModal(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;

    try {
      console.log('Deleting question:', questionId);
      
      // ENHANCED: Delete ALL associated data for all question types
      await Promise.all([
        // For multiple choice, true_false, short_answer, fill_in_blank
        supabase.from('question_options').delete().eq('question_id', questionId),
        // For matching questions
        supabase.from('matching_pairs').delete().eq('question_id', questionId),
        // For drag and drop questions (if you have this table)
        supabase.from('drag_drop_items').delete().eq('question_id', questionId).then(
          () => console.log('Drag drop items deleted')
        ).catch(
          (error) => {
            // If table doesn't exist, just log and continue
            if (error.code === '42P01') {
              console.log('drag_drop_items table does not exist, skipping...');
            } else {
              console.warn('Error deleting drag drop items:', error);
            }
          }
        ),
        // For any other question-specific data
        supabase.from('question_blanks').delete().eq('question_id', questionId).then(
          () => console.log('Question blanks deleted')
        ).catch(
          (error) => {
            // If table doesn't exist, just log and continue
            if (error.code === '42P01') {
              console.log('question_blanks table does not exist, skipping...');
            } else {
              console.warn('Error deleting question blanks:', error);
            }
          }
        )
      ]);

      // Then delete the main question
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      console.log('Question deleted successfully');
      
      // Refresh the list immediately
      await fetchQuestions(true);
      alert('Soal berhasil dihapus');
      
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Gagal menghapus soal: ' + error.message);
    }
  };

  // Add manual refresh button
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    fetchQuestions(true);
  };

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesFilter = questionFilter === 'all' || 
      question.roadmap_sub_lessons?.roadmap_levels?.id === parseInt(questionFilter);
    
    const matchesSearch = !questionSearch || 
      question.question_text.toLowerCase().includes(questionSearch.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-4 space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <select
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={questionFilter}
            onChange={(e) => setQuestionFilter(e.target.value)}
          >
            <option value="all">Semua Level</option>
            {roadmapLevels && roadmapLevels.map(level => (
              <option key={level.id} value={level.id}>
                {level.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Cari soal..."
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={questionSearch}
            onChange={(e) => setQuestionSearch(e.target.value)}
          />
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            title="Refresh data soal"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <button
          onClick={() => setShowAddQuestionModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <IconPlus size={18} />
          <span>Tambah Soal</span>
        </button>
      </div>

      {/* Enhanced debug info */}
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
        <strong>Debug Info:</strong> Total questions: {questions.length}, 
        Filtered: {filteredQuestions.length}, 
        Loading: {isLoading ? 'Yes' : 'No'}
        {questions.length > 0 && (
          <div className="mt-1">
            Latest question: {questions[0]?.question_text?.substring(0, 50)}...
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 text-gray-700 border-b">
              <th className="px-4 py-3 text-left font-semibold">No</th>
              <th className="px-4 py-3 text-left font-semibold">Soal</th>
              <th className="px-4 py-3 text-left font-semibold">Tipe</th>
              <th className="px-4 py-3 text-left font-semibold">Level</th>
              <th className="px-4 py-3 text-left font-semibold">Sub Pelajaran</th>
              <th className="px-4 py-3 text-left font-semibold">Urutan</th>
              <th className="px-4 py-3 text-left font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentQuestions.length > 0 ? (
              currentQuestions.map((question, index) => (
                <tr 
                  key={question.id} 
                  className={`border-b hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-md" title={question.question_text || 'No question text'}>
                      {question.question_text && question.question_text.length > 10 
                        ? `${question.question_text.substring(0, 10)}...` 
                        : question.question_text || 'No text'
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {getQuestionTypeLabel(question.question_type_id) || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const levelTitle = question.roadmap_sub_lessons?.roadmap_levels?.title || '-';
                      return (
                        <div title={levelTitle}>
                          {levelTitle.length > 10 
                            ? `${levelTitle.substring(0, 10)}...` 
                            : levelTitle
                          }
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const subLessonTitle = question.roadmap_sub_lessons?.title || '-';
                      return (
                        <div title={subLessonTitle}>
                          {subLessonTitle.length > 10 
                            ? `${subLessonTitle.substring(0, 10)}...` 
                            : subLessonTitle
                          }
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">{question.order_sequence}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleEditQuestion(question, e)}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-1 rounded-lg transition-colors"
                        title="Edit Soal"
                      >
                        <IconEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="bg-red-100 text-red-700 hover:bg-red-200 p-1 rounded-lg transition-colors"
                        title="Hapus Soal"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  Tidak ada soal yang ditemukan. Silakan tambahkan soal baru atau ubah filter pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredQuestions.length)} dari {filteredQuestions.length} soal
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 rounded-lg transition-colors ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                
                if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return (
                    <span key={pageNumber} className="px-2 py-1 text-gray-500">
                      ...
                    </span>
                  );
                }
                
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ENHANCED: Helper function to get question type label with all types
const getQuestionTypeLabel = (typeId) => {
  console.log('Getting label for type:', typeId);
  
  const typeMap = {
    // Map integer IDs to labels (updated with new types)
    1: 'Pilihan Ganda',
    2: 'Benar/Salah',
    3: 'Isian Singkat',
    4: 'Mencocokkan',
    5: 'Isian Kosong', // NEW: fill_in_blank
    6: 'Drag & Drop', // NEW: drag_and_drop
    // Keep string fallbacks for compatibility
    'multiple_choice': 'Pilihan Ganda',
    'true_false': 'Benar/Salah',
    'short_answer': 'Isian Singkat',
    'matching': 'Mencocokkan',
    'voice_input': 'Input Suara', // Keep existing for backward compatibility
    'fill_in_blank': 'Isian Kosong', // NEW
    'drag_and_drop': 'Drag & Drop' // NEW
  };
  
  const result = typeMap[typeId] || 'Unknown';
  console.log('Type label result:', result);
  return result;
};


export default ContentManageQuestion;
