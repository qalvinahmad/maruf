import { IconBooks, IconCheck, IconEdit, IconEye, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [showDragDropModal, setShowDragDropModal] = useState(false);
  const [showEditDragDropModal, setShowEditDragDropModal] = useState(false);
  const [showTrueFalseModal, setShowTrueFalseModal] = useState(false);
  const [showEditTrueFalseModal, setShowEditTrueFalseModal] = useState(false);
  
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingDragDropQuestion, setEditingDragDropQuestion] = useState(null);
  const [editingTrueFalseQuestion, setEditingTrueFalseQuestion] = useState(null);
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
    choices: [{ text: '', isCorrect: false }]
  });

  // True/False specific states
  const [trueFalseData, setTrueFalseData] = useState({
    question: '',
    correct_answer: true,
    sublesson_id: '',
    order_sequence: 1
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

  // Handle question type selection
  const handleTypeSelection = (typeId) => {
    setSelectedQuestionTypeForAdd(typeId);
    setShowTypeSelectionModal(false);
    
    const selectedType = questionTypes.find(type => type.id === typeId);
    if (selectedType && selectedType.type_key === 'drag_and_drop') {
      setShowDragDropModal(true);
    } else if (selectedType && selectedType.type_key === 'true_false') {
      setShowTrueFalseModal(true);
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

  // True/False form handlers
  const handleTrueFalseInputChange = (e) => {
    const { name, value, type } = e.target;
    setTrueFalseData(prev => ({
      ...prev,
      [name]: type === 'radio' ? value === 'true' : value
    }));
  };

  const resetTrueFalseForm = () => {
    setTrueFalseData({
      question: '',
      correct_answer: true,
      sublesson_id: '',
      order_sequence: 1
    });
  };

  // True/False CRUD operations
  const handleAddTrueFalseQuestion = async (e) => {
    e.preventDefault();
    
    try {
      const questionData = {
        question: trueFalseData.question,
        correct_answer: trueFalseData.correct_answer,
        question_type_id: selectedQuestionTypeForAdd,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: questionResult, error: questionError } = await supabase
        .from('true_false_questions')
        .insert([questionData])
        .select();

      if (questionError) throw questionError;

      // Also insert into main questions table for consistency
      const mainQuestionData = {
        question_text: trueFalseData.question,
        question_type_id: selectedQuestionTypeForAdd,
        sublesson_id: parseInt(trueFalseData.sublesson_id),
        order_sequence: parseInt(trueFalseData.order_sequence),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: mainQuestionError } = await supabase
        .from('questions')
        .insert([mainQuestionData]);

      if (mainQuestionError) throw mainQuestionError;

      await fetchQuestions();
      setShowTrueFalseModal(false);
      resetTrueFalseForm();
      
      alert('Soal True/False berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding true/false question:', err);
      alert('Gagal menambahkan soal: ' + err.message);
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

      {/* Questions Table */}
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
                        {question.question_text?.length > 50 ? 
                         question.question_text.substring(0, 50) + '...' : 
                         question.question_text || 'Tidak ada teks'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <div title={getSubLessonTitle(question)}>
                        {getSubLessonTitle(question).length > 30 ? 
                         getSubLessonTitle(question).substring(0, 30) + '...' : 
                         getSubLessonTitle(question)}
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
                            // Will implement edit later
                          }}
                          className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Soal"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Will implement delete later
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

      {/* True/False Question Modal */}
      {showTrueFalseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <IconCheck size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Buat Soal True/False</h3>
                    <p className="text-sm text-gray-600">Soal dengan jawaban Benar atau Salah</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTrueFalseModal(false);
                    resetTrueFalseForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddTrueFalseQuestion} className="p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Informasi Soal</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <IconBooks size={16} className="inline mr-1" />
                        Materi *
                      </label>
                      <select
                        name="sublesson_id"
                        value={trueFalseData.sublesson_id}
                        onChange={handleTrueFalseInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                        value={trueFalseData.order_sequence}
                        onChange={handleTrueFalseInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pertanyaan/Pernyataan *
                    </label>
                    <textarea
                      name="question"
                      value={trueFalseData.question}
                      onChange={handleTrueFalseInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Contoh: Huruf Alif adalah huruf pertama dalam alphabet Arab"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jawaban yang Benar *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="correct_answer"
                          value="true"
                          checked={trueFalseData.correct_answer === true}
                          onChange={handleTrueFalseInputChange}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Benar</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="correct_answer"
                          value="false"
                          checked={trueFalseData.correct_answer === false}
                          onChange={handleTrueFalseInputChange}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Salah</span>
                      </label>
                    </div>
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
                      <span className="text-sm font-medium text-gray-600">Pertanyaan: </span>
                      <span className="text-sm text-gray-900">{trueFalseData.question || 'Belum diisi'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Jawaban Benar: </span>
                      <span className={`text-sm px-2 py-1 rounded ${trueFalseData.correct_answer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {trueFalseData.correct_answer ? 'Benar' : 'Salah'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowTrueFalseModal(false);
                    resetTrueFalseForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
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
  );
};

export default QuestionManagement;
