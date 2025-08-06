import { IconArrowRight, IconBooks, IconBulb, IconDragDrop, IconEdit, IconEye, IconInfoCircle, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionTypes, setQuestionTypes] = useState([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDragDropModal, setShowDragDropModal] = useState(false);
  const [showEditDragDropModal, setShowEditDragDropModal] = useState(false);
  const [editingDragDropQuestion, setEditingDragDropQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [subLessons, setSubLessons] = useState([]);
  const [selectedQuestionTypeForAdd, setSelectedQuestionTypeForAdd] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    question_text: '',
    question_type_id: '',
    sublesson_id: '',
    order_sequence: 1,
    instruction: '',
    sentence_template: ''
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [selectedSubLessonFilter, setSelectedSubLessonFilter] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Drag and Drop specific states
  const [dragDropData, setDragDropData] = useState({
    instruction: '',
    sentence_template: '',
    sublesson_id: '',
    order_sequence: 1,
    choices: [{ text: '', isCorrect: false }] // Array of choices with correct answer markers
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          roadmap_sub_lessons!inner(
            id,
            title,
            description,
            level_id,
            order_sequence,
            roadmap_levels!inner(
              id,
              title
            )
          )
        `)
        .order('order_sequence', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('question_types')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setQuestionTypes(data || []);
    } catch (err) {
      console.error('Error fetching question types:', err);
    }
  };

  const fetchSubLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('roadmap_sub_lessons')
        .select(`
          id,
          title,
          order_sequence,
          roadmap_levels!inner(
            id,
            title
          )
        `)
        .order('order_sequence', { ascending: true });

      if (error) throw error;
      setSubLessons(data || []);
    } catch (err) {
      console.error('Error fetching sub lessons:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchQuestionTypes();
    fetchSubLessons();
  }, []);

  // Initialize filtered questions when questions change
  useEffect(() => {
    if (questions.length > 0 && filteredQuestions.length === 0 && !searchTerm && !selectedTypeFilter && !selectedSubLessonFilter) {
      setFilteredQuestions(questions);
    }
  }, [questions, filteredQuestions.length, searchTerm, selectedTypeFilter, selectedSubLessonFilter]);

  // Filter questions based on search and filters
  useEffect(() => {
    let filtered = questions;

    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      filtered = filtered.filter(question => {
        const questionText = question.question_text?.toLowerCase() || '';
        const subLessonTitle = getSubLessonTitle(question)?.toLowerCase() || '';
        const typeLabel = getQuestionTypeLabel(question.question_type_id)?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return questionText.includes(searchLower) || 
               subLessonTitle.includes(searchLower) || 
               typeLabel.includes(searchLower);
      });
    }

    // Type filter
    if (selectedTypeFilter && selectedTypeFilter !== '') {
      filtered = filtered.filter(question => question.question_type_id === parseInt(selectedTypeFilter));
    }

    // Sub lesson filter
    if (selectedSubLessonFilter && selectedSubLessonFilter !== '') {
      filtered = filtered.filter(question => question.sublesson_id === parseInt(selectedSubLessonFilter));
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedTypeFilter, selectedSubLessonFilter, questionTypes, subLessons]);

  // Function to get question type label by ID
  const getQuestionTypeLabel = (typeId) => {
    if (!typeId || questionTypes.length === 0) return 'Unknown';
    
    const questionType = questionTypes.find(type => type.id === typeId);
    return questionType ? questionType.label : `Type ${typeId}`;
  };

  // Function to get question type color by type key
  const getQuestionTypeColor = (typeId) => {
    if (!typeId || questionTypes.length === 0) return 'bg-gray-100 text-gray-700';
    
    const questionType = questionTypes.find(type => type.id === typeId);
    if (!questionType) return 'bg-gray-100 text-gray-700';
    
    const colorMap = {
      'multiple_choice': 'bg-blue-100 text-blue-700',
      'true_false': 'bg-green-100 text-green-700',
      'short_answer': 'bg-yellow-100 text-yellow-700',
      'matching': 'bg-purple-100 text-purple-700',
      'fill_in_blank': 'bg-orange-100 text-orange-700',
      'drag_and_drop': 'bg-indigo-100 text-indigo-700',
      'voice_input': 'bg-pink-100 text-pink-700'
    };
    
    return colorMap[questionType.type_key] || 'bg-gray-100 text-gray-700';
  };

  // Function to get sub lesson title by ID
  const getSubLessonTitle = (question) => {
    if (question.roadmap_sub_lessons?.title) {
      const levelTitle = question.roadmap_sub_lessons.roadmap_levels?.title || '';
      const subLessonTitle = question.roadmap_sub_lessons.title;
      return levelTitle ? `${levelTitle} - ${subLessonTitle}` : subLessonTitle;
    }
    return `Sub Lesson ${question.sublesson_id || 'Unknown'}`;
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type_id: '',
      sublesson_id: '',
      order_sequence: 1,
      instruction: '',
      sentence_template: ''
    });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    try {
      const questionData = {
        ...formData,
        question_type_id: parseInt(formData.question_type_id),
        sublesson_id: parseInt(formData.sublesson_id),
        order_sequence: parseInt(formData.order_sequence),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('questions')
        .insert([questionData])
        .select();

      if (error) throw error;

      // Refresh questions list
      await fetchQuestions();
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      
      alert('Soal berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding question:', err);
      alert('Gagal menambahkan soal: ' + err.message);
    }
  };

  const handleAddDragDropQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // First, create the main question record
      const questionData = {
        instruction: dragDropData.instruction,
        sentence_template: dragDropData.sentence_template,
        question_type_id: selectedQuestionTypeForAdd,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: questionResult, error: questionError } = await supabase
        .from('drag_and_drop_questions')
        .insert([questionData])
        .select();

      if (questionError) throw questionError;

      const questionId = questionResult[0].id;

      // Insert choices
      if (dragDropData.choices.length > 0) {
        const choicesData = dragDropData.choices
          .filter(choice => choice.text.trim() !== '')
          .map(choice => ({
            question_id: questionId,
            choice_text: choice.text.trim()
          }));

        if (choicesData.length > 0) {
          const { error: choicesError } = await supabase
            .from('drag_and_drop_choices')
            .insert(choicesData);

          if (choicesError) throw choicesError;
        }
      }

      // Insert correct answers (blanks)
      if (dragDropData.choices.length > 0) {
        const correctAnswers = dragDropData.choices
          .filter(choice => choice.isCorrect && choice.text.trim() !== '')
          .map((choice, index) => ({
            question_id: questionId,
            blank_index: index,
            correct_answer: choice.text.trim()
          }));

        if (correctAnswers.length > 0) {
          const { error: blanksError } = await supabase
            .from('drag_and_drop_blanks')
            .insert(correctAnswers);

          if (blanksError) throw blanksError;
        }
      }

      // Refresh questions list
      await fetchQuestions();
      
      // Close modal and reset form
      setShowDragDropModal(false);
      resetDragDropForm();
      
      alert('Soal Drag and Drop berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding drag and drop question:', err);
      alert('Gagal menambahkan soal: ' + err.message);
    }
  };

  const handleUpdateDragDropQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // Update the main question record
      const questionData = {
        instruction: dragDropData.instruction,
        sentence_template: dragDropData.sentence_template,
        updated_at: new Date().toISOString()
      };

      const { error: questionError } = await supabase
        .from('drag_and_drop_questions')
        .update(questionData)
        .eq('id', editingDragDropQuestion.id);

      if (questionError) throw questionError;

      // Delete existing choices and blanks
      await supabase.from('drag_and_drop_choices').delete().eq('question_id', editingDragDropQuestion.id);
      await supabase.from('drag_and_drop_blanks').delete().eq('question_id', editingDragDropQuestion.id);

      // Insert new choices
      if (dragDropData.choices.length > 0) {
        const choicesData = dragDropData.choices
          .filter(choice => choice.text.trim() !== '')
          .map(choice => ({
            question_id: editingDragDropQuestion.id,
            choice_text: choice.text.trim()
          }));

        if (choicesData.length > 0) {
          const { error: choicesError } = await supabase
            .from('drag_and_drop_choices')
            .insert(choicesData);

          if (choicesError) throw choicesError;
        }
      }

      // Insert new correct answers (blanks)
      if (dragDropData.choices.length > 0) {
        const correctAnswers = dragDropData.choices
          .filter(choice => choice.isCorrect && choice.text.trim() !== '')
          .map((choice, index) => ({
            question_id: editingDragDropQuestion.id,
            blank_index: index,
            correct_answer: choice.text.trim()
          }));

        if (correctAnswers.length > 0) {
          const { error: blanksError } = await supabase
            .from('drag_and_drop_blanks')
            .insert(correctAnswers);

          if (blanksError) throw blanksError;
        }
      }

      // Update main questions table with sublesson and order
      const { error: mainQuestionError } = await supabase
        .from('questions')
        .update({
          sublesson_id: parseInt(dragDropData.sublesson_id),
          order_sequence: parseInt(dragDropData.order_sequence),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDragDropQuestion.id);

      if (mainQuestionError) throw mainQuestionError;

      // Refresh questions list
      await fetchQuestions();
      
      // Close modal and reset form
      setShowEditDragDropModal(false);
      setEditingDragDropQuestion(null);
      resetDragDropForm();
      
      alert('Soal Drag and Drop berhasil diperbarui!');
    } catch (err) {
      console.error('Error updating drag and drop question:', err);
      alert('Gagal memperbarui soal: ' + err.message);
    }
  };

  // Handle question type selection
  const handleTypeSelection = (typeId) => {
    setSelectedQuestionTypeForAdd(typeId);
    setShowTypeSelectionModal(false);
    
    // Check if it's drag and drop type (assuming drag_and_drop has id 6)
    const selectedType = questionTypes.find(type => type.id === typeId);
    if (selectedType && selectedType.type_key === 'drag_and_drop') {
      setShowDragDropModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleViewQuestion = (question) => {
    setViewingQuestion(question);
    setShowDetailModal(true);
  };

  // Drag and Drop form handlers
  const handleDragDropInputChange = (e) => {
    const { name, value } = e.target;
    setDragDropData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addChoice = () => {
    setDragDropData(prev => ({
      ...prev,
      choices: [...prev.choices, { text: '', isCorrect: false }]
    }));
  };

  const removeChoice = (index) => {
    setDragDropData(prev => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index)
    }));
  };

  const updateChoice = (index, field, value) => {
    setDragDropData(prev => ({
      ...prev,
      choices: prev.choices.map((choice, i) => 
        i === index ? { ...choice, [field]: value } : choice
      )
    }));
  };

  const toggleCorrectAnswer = (index) => {
    setDragDropData(prev => ({
      ...prev,
      choices: prev.choices.map((choice, i) => 
        i === index ? { ...choice, isCorrect: !choice.isCorrect } : choice
      )
    }));
  };

  const resetDragDropForm = () => {
    setDragDropData({
      instruction: '',
      sentence_template: '',
      sublesson_id: '',
      order_sequence: 1,
      choices: [{ text: '', isCorrect: false }]
    });
  };

  const handleEditQuestion = async (question) => {
    // Check if it's a drag and drop question
    const questionType = questionTypes.find(type => type.id === question.question_type_id);
    if (questionType && questionType.type_key === 'drag_and_drop') {
      await handleEditDragDropQuestion(question);
    } else {
      setEditingQuestion(question);
      setFormData({
        question_text: question.question_text || '',
        question_type_id: question.question_type_id || '',
        sublesson_id: question.sublesson_id || '',
        order_sequence: question.order_sequence || 1,
        instruction: question.instruction || '',
        sentence_template: question.sentence_template || ''
      });
      setShowEditModal(true);
    }
  };

  const handleEditDragDropQuestion = async (question) => {
    try {
      // Fetch drag and drop specific data
      const { data: dragDropQuestion, error: questionError } = await supabase
        .from('drag_and_drop_questions')
        .select('*')
        .eq('id', question.id)
        .single();

      if (questionError) throw questionError;

      // Fetch choices
      const { data: choices, error: choicesError } = await supabase
        .from('drag_and_drop_choices')
        .select('*')
        .eq('question_id', question.id)
        .order('id');

      if (choicesError) throw choicesError;

      // Fetch blanks
      const { data: blanks, error: blanksError } = await supabase
        .from('drag_and_drop_blanks')
        .select('*')
        .eq('question_id', question.id)
        .order('blank_index');

      if (blanksError) throw blanksError;

      // Set the editing data
      setEditingDragDropQuestion(dragDropQuestion);
      
      // Convert choices and blanks to the new format
      const choicesWithCorrectAnswers = choices.map(choice => {
        const isCorrect = blanks.some(blank => blank.correct_answer === choice.choice_text);
        return {
          text: choice.choice_text,
          isCorrect: isCorrect
        };
      });
      
      setDragDropData({
        instruction: dragDropQuestion.instruction || '',
        sentence_template: dragDropQuestion.sentence_template || '',
        sublesson_id: question.sublesson_id || '',
        order_sequence: question.order_sequence || 1,
        choices: choicesWithCorrectAnswers.length > 0 ? choicesWithCorrectAnswers : [{ text: '', isCorrect: false }]
      });
      
      setShowEditDragDropModal(true);
    } catch (err) {
      console.error('Error fetching drag and drop question:', err);
      alert('Gagal memuat data soal: ' + err.message);
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    
    try {
      const questionData = {
        ...formData,
        question_type_id: parseInt(formData.question_type_id),
        sublesson_id: parseInt(formData.sublesson_id),
        order_sequence: parseInt(formData.order_sequence),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('questions')
        .update(questionData)
        .eq('id', editingQuestion.id);

      if (error) throw error;

      // Refresh questions list
      await fetchQuestions();
      
      // Close modal and reset form
      setShowEditModal(false);
      setEditingQuestion(null);
      resetForm();
      
      alert('Soal berhasil diperbarui!');
    } catch (err) {
      console.error('Error updating question:', err);
      alert('Gagal memperbarui soal: ' + err.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      // Refresh questions list
      await fetchQuestions();
      
      alert('Soal berhasil dihapus!');
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Gagal menghapus soal: ' + err.message);
    }
  };

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
        <button 
          onClick={() => setShowTypeSelectionModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <IconPlus size={16} />
          Tambah Soal
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Soal
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconSearch size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan teks pertanyaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Tipe
            </label>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Tipe</option>
              {questionTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Lesson Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Materi
            </label>
            <select
              value={selectedSubLessonFilter}
              onChange={(e) => setSelectedSubLessonFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Materi</option>
              {subLessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.roadmap_levels?.title} - {lesson.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{questions.length === 0 ? 'Belum ada soal yang tersedia' : 'Tidak ada soal yang sesuai filter'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            💡 <strong>Tips:</strong> Klik pada baris soal untuk melihat detail lengkap
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Urutan</th>
                <th className="px-4 py-3">Pertanyaan</th>
                <th className="px-4 py-3">Materi</th>
                <th className="px-4 py-3">Tipe Soal</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuestions.map((question, index) => (
                <motion.tr
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewQuestion(question)}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">#{question.id}</td>
                  <td className="px-4 py-3 text-gray-600">{question.order_sequence}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <div title={question.question_text}>
                      {truncateText(question.question_text)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <div title={getSubLessonTitle(question)}>
                      {truncateText(getSubLessonTitle(question), 30)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(question.question_type_id)}`}>
                      {getQuestionTypeLabel(question.question_type_id)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditQuestion(question);
                        }}
                        className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Soal"
                      >
                        <IconEdit size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(question.id);
                        }}
                        className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Soal"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Question Type Selection Modal */}
      {showTypeSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pilih Tipe Soal</h3>
              <button
                onClick={() => setShowTypeSelectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <IconX size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {questionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelection(type.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getQuestionTypeColor(type.id)}`}></div>
                    <div>
                      <div className="font-medium text-sm">{getQuestionTypeLabel(type.id)}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowTypeSelectionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Tambah Soal Baru</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddQuestion} className="p-6 space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teks Pertanyaan *
                </label>
                <textarea
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan teks pertanyaan..."
                />
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Soal *
                </label>
                <select
                  name="question_type_id"
                  value={formData.question_type_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih tipe soal...</option>
                  {questionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Lesson */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materi *
                </label>
                <select
                  name="sublesson_id"
                  value={formData.sublesson_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih materi...</option>
                  {subLessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.roadmap_levels?.title} - {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Sequence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutan Soal *
                </label>
                <input
                  type="number"
                  name="order_sequence"
                  value={formData.order_sequence}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Instruction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruksi (Opsional)
                </label>
                <input
                  type="text"
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Pilih jawaban yang benar"
                />
              </div>

              {/* Sentence Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Kalimat (Opsional)
                </label>
                <input
                  type="text"
                  name="sentence_template"
                  value={formData.sentence_template}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Huruf ___ adalah..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tambah Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditModal && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Edit Soal #{editingQuestion.id}</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingQuestion(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateQuestion} className="p-6 space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teks Pertanyaan *
                </label>
                <textarea
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan teks pertanyaan..."
                />
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Soal *
                </label>
                <select
                  name="question_type_id"
                  value={formData.question_type_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih tipe soal...</option>
                  {questionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Lesson */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materi *
                </label>
                <select
                  name="sublesson_id"
                  value={formData.sublesson_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih materi...</option>
                  {subLessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.roadmap_levels?.title} - {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Sequence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutan Soal *
                </label>
                <input
                  type="number"
                  name="order_sequence"
                  value={formData.order_sequence}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Instruction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruksi (Opsional)
                </label>
                <input
                  type="text"
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Pilih jawaban yang benar"
                />
              </div>

              {/* Sentence Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Kalimat (Opsional)
                </label>
                <input
                  type="text"
                  name="sentence_template"
                  value={formData.sentence_template}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Huruf ___ adalah..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingQuestion(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Drag and Drop Question Modal */}
      {showDragDropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <IconDragDrop size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Buat Soal Drag and Drop</h3>
                    <p className="text-sm text-gray-600">Soal dimana siswa menarik kata ke tempat yang tepat</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDragDropModal(false);
                    resetDragDropForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddDragDropQuestion} className="p-6">
              {/* Step Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium">1</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Informasi Soal</p>
                    </div>
                  </div>
                  <IconArrowRight className="text-gray-400 mx-4" size={20} />
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium">2</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Pilihan & Jawaban</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Step 1: Basic Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-medium">1</div>
                    <h4 className="text-lg font-medium text-gray-900">Informasi Soal</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <IconBooks size={16} className="inline mr-1" />
                        Materi *
                      </label>
                      <select
                        name="sublesson_id"
                        value={dragDropData.sublesson_id}
                        onChange={handleDragDropInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih materi...</option>
                        {subLessons.map(lesson => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.roadmap_levels?.title} - {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urutan Soal *
                      </label>
                      <input
                        type="number"
                        name="order_sequence"
                        value={dragDropData.order_sequence}
                        onChange={handleDragDropInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IconInfoCircle size={16} className="inline mr-1" />
                      Instruksi untuk Siswa *
                    </label>
                    <textarea
                      name="instruction"
                      value={dragDropData.instruction}
                      onChange={handleDragDropInputChange}
                      required
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contoh: Seret kata yang tepat ke tempat yang kosong"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kalimat dengan Tempat Kosong *
                    </label>
                    <textarea
                      name="sentence_template"
                      value={dragDropData.sentence_template}
                      onChange={handleDragDropInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contoh: _____ adalah huruf pertama dalam alphabet Arab"
                    />
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <IconBulb size={16} className="text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Tips membuat kalimat:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Gunakan <code className="bg-blue-100 px-1 rounded">_____</code> untuk tempat kosong</li>
                            <li>Siswa akan menarik kata dari pilihan ke tempat kosong ini</li>
                            <li>Buat kalimat yang mudah dipahami siswa</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Choices & Answers Combined */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs font-medium">2</div>
                      <h4 className="text-lg font-medium text-gray-900">Pilihan Kata/Frasa</h4>
                    </div>
                    <button
                      type="button"
                      onClick={addChoice}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                    >
                      <IconPlus size={14} />
                      Tambah Pilihan
                    </button>
                  </div>
                  
                  <p className="text-sm text-green-700 mb-4">Tambahkan pilihan kata/frasa. Centang yang merupakan jawaban benar.</p>
                  
                  <div className="space-y-3">
                    {dragDropData.choices.map((choice, index) => (
                      <div key={index} className="flex gap-3 items-center bg-white p-3 rounded-lg border border-green-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) => updateChoice(index, 'text', e.target.value)}
                          placeholder={`Kata/frasa pilihan ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={choice.isCorrect}
                              onChange={() => toggleCorrectAnswer(index)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Jawaban Benar</span>
                          </label>
                        </div>
                        {dragDropData.choices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChoice(index)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus pilihan ini"
                          >
                            <IconTrash size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Section */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <IconEye size={20} className="text-purple-600" />
                    <h4 className="text-lg font-medium text-gray-900">Preview Soal</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Instruksi: </span>
                      <span className="text-sm text-gray-900">{dragDropData.instruction || 'Belum diisi'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Kalimat: </span>
                      <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                        {dragDropData.sentence_template || 'Belum diisi'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Pilihan: </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dragDropData.choices.filter(c => c.text.trim()).map((choice, i) => (
                          <span 
                            key={i} 
                            className={`px-2 py-1 rounded text-sm ${
                              choice.isCorrect 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {choice.text}
                            {choice.isCorrect && <span className="ml-1">✓</span>}
                          </span>
                        ))}
                        {dragDropData.choices.filter(c => c.text.trim()).length === 0 && (
                          <span className="text-gray-400 text-sm">Belum ada pilihan</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowDragDropModal(false);
                    resetDragDropForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <IconPlus size={16} />
                  Buat Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Pilihan: </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dragDropData.choices.filter(c => c.trim()).map((choice, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {choice}
                          </span>
                        ))}
                        {dragDropData.choices.filter(c => c.trim()).length === 0 && (
                          <span className="text-gray-400 text-sm">Belum ada pilihan</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Jawaban Benar: </span>
                      <div className="mt-2 space-y-1">
                        {dragDropData.blanks.filter(b => b.correct_answer.trim()).map((blank, i) => (
                          <div key={i} className="text-sm">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Index {blank.blank_index}: {blank.correct_answer}
                            </span>
                          </div>
                        ))}
                        {dragDropData.blanks.filter(b => b.correct_answer.trim()).length === 0 && (
                          <span className="text-gray-400 text-sm">Belum ada jawaban</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowDragDropModal(false);
                    resetDragDropForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <IconPlus size={16} />
                  Simpan Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Drag and Drop Question Modal */}
      {showEditDragDropModal && editingDragDropQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <IconEdit size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Edit Soal Drag and Drop</h3>
                    <p className="text-sm text-gray-600">ID: #{editingDragDropQuestion.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditDragDropModal(false);
                    setEditingDragDropQuestion(null);
                    resetDragDropForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateDragDropQuestion} className="p-6">
              {/* Step Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-medium">1</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Informasi Soal</p>
                    </div>
                  </div>
                  <IconArrowRight className="text-gray-400 mx-4" size={20} />
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-medium">2</div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Pilihan & Jawaban</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Step 1: Basic Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-medium">1</div>
                    <h4 className="text-lg font-medium text-gray-900">Informasi Dasar Soal</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <IconBooks size={16} className="inline mr-1" />
                        Materi *
                      </label>
                      <select
                        name="sublesson_id"
                        value={dragDropData.sublesson_id}
                        onChange={handleDragDropInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Pilih materi...</option>
                        {subLessons.map(lesson => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.roadmap_levels?.title} - {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urutan Soal *
                      </label>
                      <input
                        type="number"
                        name="order_sequence"
                        value={dragDropData.order_sequence}
                        onChange={handleDragDropInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IconInfoCircle size={16} className="inline mr-1" />
                      Instruksi untuk Siswa *
                    </label>
                    <textarea
                      name="instruction"
                      value={dragDropData.instruction}
                      onChange={handleDragDropInputChange}
                      required
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Contoh: Seret kata yang tepat ke tempat yang kosong dalam kalimat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Kalimat dengan Tempat Kosong *
                    </label>
                    <textarea
                      name="sentence_template"
                      value={dragDropData.sentence_template}
                      onChange={handleDragDropInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Contoh: ___[0]___ adalah huruf pertama dalam alphabet Arab, dan ___[1]___ adalah huruf kedua"
                    />
                    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <IconBulb size={16} className="text-orange-600 mt-0.5" />
                        <div className="text-sm text-orange-800">
                          <p className="font-medium mb-1">Cara menggunakan template:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Gunakan <code className="bg-orange-100 px-1 rounded">___[0]___</code> untuk tempat kosong pertama</li>
                            <li>Gunakan <code className="bg-orange-100 px-1 rounded">___[1]___</code> untuk tempat kosong kedua, dan seterusnya</li>
                            <li>Angka dalam kurung harus sesuai dengan index jawaban benar</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Choices */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs font-medium">2</div>
                      <h4 className="text-lg font-medium text-gray-900">Kata/Frasa yang Bisa Dipilih</h4>
                    </div>
                    <button
                      type="button"
                      onClick={addChoice}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                    >
                      <IconPlus size={14} />
                      Tambah Pilihan
                    </button>
                  </div>
                  
                  <p className="text-sm text-green-700 mb-4">Tambahkan kata atau frasa yang bisa diseret oleh siswa (termasuk jawaban yang benar dan pengecoh)</p>
                  
                  <div className="space-y-3">
                    {dragDropData.choices.map((choice, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={choice}
                          onChange={(e) => updateChoice(index, e.target.value)}
                          placeholder={`Kata/frasa pilihan ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        {dragDropData.choices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChoice(index)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus pilihan ini"
                          >
                            <IconTrash size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3: Correct Answers */}
                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-medium">3</div>
                      <h4 className="text-lg font-medium text-gray-900">Jawaban yang Benar</h4>
                    </div>
                    <button
                      type="button"
                      onClick={addBlank}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                    >
                      <IconPlus size={14} />
                      Tambah Tempat Kosong
                    </button>
                  </div>
                  
                  <p className="text-sm text-orange-700 mb-4">Tentukan jawaban yang benar untuk setiap tempat kosong</p>
                  
                  <div className="space-y-4">
                    {dragDropData.blanks.map((blank, index) => (
                      <div key={index} className="border border-orange-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Tempat Kosong #{index + 1}</h5>
                          {dragDropData.blanks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBlank(index)}
                              className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                              title="Hapus tempat kosong ini"
                            >
                              <IconTrash size={14} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Index dalam Template</label>
                            <input
                              type="number"
                              value={blank.blank_index}
                              onChange={(e) => updateBlank(index, 'blank_index', parseInt(e.target.value) || 0)}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="0, 1, 2, ..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Jawaban yang Benar</label>
                            <input
                              type="text"
                              value={blank.correct_answer}
                              onChange={(e) => updateBlank(index, 'correct_answer', e.target.value)}
                              placeholder="Jawaban yang benar"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Section */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <IconEye size={20} className="text-purple-600" />
                    <h4 className="text-lg font-medium text-gray-900">Preview Soal</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Instruksi: </span>
                      <span className="text-sm text-gray-900">{dragDropData.instruction || 'Belum diisi'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Kalimat: </span>
                      <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                        {dragDropData.sentence_template || 'Belum diisi'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Pilihan: </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dragDropData.choices.filter(c => c.trim()).map((choice, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {choice}
                          </span>
                        ))}
                        {dragDropData.choices.filter(c => c.trim()).length === 0 && (
                          <span className="text-gray-400 text-sm">Belum ada pilihan</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Jawaban Benar: </span>
                      <div className="mt-2 space-y-1">
                        {dragDropData.blanks.filter(b => b.correct_answer.trim()).map((blank, i) => (
                          <div key={i} className="text-sm">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Index {blank.blank_index}: {blank.correct_answer}
                            </span>
                          </div>
                        ))}
                        {dragDropData.blanks.filter(b => b.correct_answer.trim()).length === 0 && (
                          <span className="text-gray-400 text-sm">Belum ada jawaban</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDragDropModal(false);
                    setEditingDragDropQuestion(null);
                    resetDragDropForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <IconEdit size={16} />
                  Update Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Question Detail Modal */}
      {showDetailModal && viewingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Detail Soal #{viewingQuestion.id}</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setViewingQuestion(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Soal</label>
                  <p className="text-gray-900 font-medium">#{viewingQuestion.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                  <p className="text-gray-900">{viewingQuestion.order_sequence}</p>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teks Pertanyaan</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{viewingQuestion.question_text || 'Tidak ada teks pertanyaan'}</p>
                </div>
              </div>

              {/* Type and Material */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Soal</label>
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getQuestionTypeColor(viewingQuestion.question_type_id)}`}>
                    {getQuestionTypeLabel(viewingQuestion.question_type_id)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Materi</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{getSubLessonTitle(viewingQuestion)}</p>
                </div>
              </div>

              {/* Optional Fields */}
              {(viewingQuestion.instruction || viewingQuestion.sentence_template) && (
                <div className="space-y-4">
                  {viewingQuestion.instruction && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instruksi</label>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-900">{viewingQuestion.instruction}</p>
                      </div>
                    </div>
                  )}
                  
                  {viewingQuestion.sentence_template && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Template Kalimat</label>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-purple-900 font-mono">{viewingQuestion.sentence_template}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dibuat</label>
                  <p className="text-gray-600 text-sm">{formatDate(viewingQuestion.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terakhir Diubah</label>
                  <p className="text-gray-600 text-sm">{formatDate(viewingQuestion.updated_at)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setViewingQuestion(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditQuestion(viewingQuestion);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <IconEdit size={16} />
                  Edit Soal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
