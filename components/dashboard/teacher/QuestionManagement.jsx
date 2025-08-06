import { IconArrowRight, IconBooks, IconBulb, IconCheck, IconDragDrop, IconEdit, IconEye, IconInfoCircle, IconListCheck, IconMicrophone, IconPencil, IconPlus, IconSearch, IconTarget, IconTrash, IconWriting, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Toast, showModalToast, showToast } from '../../ui/toast';

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
  const [showShortAnswerModal, setShowShortAnswerModal] = useState(false);
  const [showEditShortAnswerModal, setShowEditShortAnswerModal] = useState(false);
  const [showFillBlankModal, setShowFillBlankModal] = useState(false);
  const [showEditFillBlankModal, setShowEditFillBlankModal] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [showEditMatchingModal, setShowEditMatchingModal] = useState(false);
  const [showMultipleChoiceModal, setShowMultipleChoiceModal] = useState(false);
  const [showEditMultipleChoiceModal, setShowEditMultipleChoiceModal] = useState(false);
  const [showVoiceInputModal, setShowVoiceInputModal] = useState(false);
  const [showEditVoiceInputModal, setShowEditVoiceInputModal] = useState(false);
  
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingDragDropQuestion, setEditingDragDropQuestion] = useState(null);
  const [editingTrueFalseQuestion, setEditingTrueFalseQuestion] = useState(null);
  const [editingShortAnswerQuestion, setEditingShortAnswerQuestion] = useState(null);
  const [editingFillBlankQuestion, setEditingFillBlankQuestion] = useState(null);
  const [editingMatchingQuestion, setEditingMatchingQuestion] = useState(null);
  const [editingMultipleChoiceQuestion, setEditingMultipleChoiceQuestion] = useState(null);
  const [editingVoiceInputQuestion, setEditingVoiceInputQuestion] = useState(null);
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

  // Short Answer specific states
  const [shortAnswerData, setShortAnswerData] = useState({
    question: '',
    correct_answer: '',
    sublesson_id: '',
    order_sequence: 1
  });

  // Fill in the Blank specific states
  const [fillBlankData, setFillBlankData] = useState({
    question: '',
    sublesson_id: '',
    order_sequence: 1,
    blanks: [{ correct_answer: '' }]
  });

  // Matching specific states
  const [matchingData, setMatchingData] = useState({
    question: '',
    sublesson_id: '',
    order_sequence: 1,
    pairs: [{ left_item: '', right_item: '' }]
  });

  // Multiple Choice specific states
  const [multipleChoiceData, setMultipleChoiceData] = useState({
    question: '',
    sublesson_id: '',
    order_sequence: 1,
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });

  // Voice Input specific states
  const [voiceInputData, setVoiceInputData] = useState({
    question_text: '',
    instruction: '',
    expected_answer: '',
    tolerance_level: 80,
    model: 'ojisetyawan/whisper-base-ar-quran-ft-hijaiyah-2',
    sublesson_id: '',
    order_sequence: 1
  });

  // Helper function to get question type key
  const getQuestionTypeKey = (typeId) => {
    const type = questionTypes.find(t => t.id === typeId);
    return type?.type_key || 'multiple_choice';
  };

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
          ),
          question_options(*)
        `)
        .order('order_sequence', { ascending: true });

      if (error) throw error;

      // Fetch additional data for each question type separately
      const questionsWithAdditionalData = await Promise.all((data || []).map(async (question) => {
        const questionTypeKey = getQuestionTypeKey(question.question_type_id);
        
        try {
          // Fetch voice input data
          if (questionTypeKey === 'voice_input') {
            try {
              // Try multiple approaches to find voice input data
              let voiceData = null;
              
              console.log('Fetching voice data for question:', question.id, question.question_text);
              
              // Strategy 1: Try by exact question_text match
              const { data: voiceData1, error: voiceError1 } = await supabase
                .from('voice_input_questions')
                .select('*')
                .eq('question_text', question.question_text);
              
              if (!voiceError1 && voiceData1?.length > 0) {
                voiceData = voiceData1[0];
                console.log('Found voice data by question_text:', voiceData);
              } else {
                // Strategy 2: Try by similar question_text (case insensitive)
                const { data: voiceData2, error: voiceError2 } = await supabase
                  .from('voice_input_questions')
                  .select('*')
                  .ilike('question_text', `%${question.question_text}%`);
                
                if (!voiceError2 && voiceData2?.length > 0) {
                  voiceData = voiceData2[0];
                  console.log('Found voice data by similar question_text:', voiceData);
                } else {
                  // Strategy 3: Try to find by sublesson_id and order_sequence
                  const { data: voiceData3, error: voiceError3 } = await supabase
                    .from('voice_input_questions')
                    .select('*')
                    .eq('sublesson_id', question.sublesson_id)
                    .eq('order_sequence', question.order_sequence);
                  
                  if (!voiceError3 && voiceData3?.length > 0) {
                    voiceData = voiceData3[0];
                    console.log('Found voice data by sublesson and order:', voiceData);
                  } else {
                    // Strategy 4: Get the most recent voice input question
                    const { data: voiceData4, error: voiceError4 } = await supabase
                      .from('voice_input_questions')
                      .select('*')
                      .order('created_at', { ascending: false })
                      .limit(1);
                    
                    if (!voiceError4 && voiceData4?.length > 0) {
                      voiceData = voiceData4[0];
                      console.log('Found voice data by most recent:', voiceData);
                    }
                  }
                }
              }
              
              if (voiceData) {
                question.voice_input_data = voiceData;
              } else {
                console.log('No voice data found for question:', question.id);
              }
            } catch (err) {
              console.log('Error fetching voice data for question:', question.id, err);
            }
          }
          
          // Fetch true/false data
          else if (questionTypeKey === 'true_false') {
            try {
              // Try multiple approaches to find true/false data
              let trueFalseData = null;
              
              console.log('Fetching true/false data for question:', question.id, question.question_text);
              
              // Strategy 1: Try by exact question match
              const { data: tfData1, error: tfError1 } = await supabase
                .from('true_false_questions')
                .select('*')
                .eq('question', question.question_text);
              
              if (!tfError1 && tfData1?.length > 0) {
                trueFalseData = tfData1[0];
                console.log('Found true/false data by question text:', trueFalseData);
              } else {
                // Strategy 2: Try by similar question text (case insensitive)
                const { data: tfData2, error: tfError2 } = await supabase
                  .from('true_false_questions')
                  .select('*')
                  .ilike('question', `%${question.question_text}%`);
                
                if (!tfError2 && tfData2?.length > 0) {
                  trueFalseData = tfData2[0];
                  console.log('Found true/false data by similar question:', trueFalseData);
                } else {
                  // Strategy 3: Try to find by question_type_id
                  const { data: tfData3, error: tfError3 } = await supabase
                    .from('true_false_questions')
                    .select('*')
                    .eq('question_type_id', question.question_type_id)
                    .order('created_at', { ascending: false })
                    .limit(1);
                  
                  if (!tfError3 && tfData3?.length > 0) {
                    trueFalseData = tfData3[0];
                    console.log('Found true/false data by question_type_id:', trueFalseData);
                  } else {
                    // Strategy 4: Get the most recent true/false question
                    const { data: tfData4, error: tfError4 } = await supabase
                      .from('true_false_questions')
                      .select('*')
                      .order('created_at', { ascending: false })
                      .limit(1);
                    
                    if (!tfError4 && tfData4?.length > 0) {
                      trueFalseData = tfData4[0];
                      console.log('Found true/false data by most recent:', trueFalseData);
                    }
                  }
                }
              }
              
              if (trueFalseData) {
                question.true_false_data = trueFalseData;
              } else {
                console.log('No true/false data found for question:', question.id);
              }
            } catch (err) {
              console.log('Error fetching true/false data for question:', question.id, err);
            }
          }
          
          // Fetch fill in blank answers
          else if (questionTypeKey === 'fill_in_blank') {
            const { data: fillBlankData, error: fillBlankError } = await supabase
              .from('fill_in_blank_answers')
              .select('*')
              .eq('question_id', question.id);
            
            if (!fillBlankError && fillBlankData) {
              question.fill_in_blank_answers = fillBlankData;
            }
          }
          
          // Fetch drag drop choices
          else if (questionTypeKey === 'drag_and_drop') {
            const { data: dragDropData, error: dragDropError } = await supabase
              .from('drag_drop_choices')
              .select('*')
              .eq('question_id', question.id);
            
            if (!dragDropError && dragDropData) {
              question.drag_drop_choices = dragDropData;
            }
          }
          
          // Fetch matching pairs
          else if (questionTypeKey === 'matching') {
            const { data: matchingData, error: matchingError } = await supabase
              .from('matching_pairs')
              .select('*')
              .eq('question_id', question.id);
            
            if (!matchingError && matchingData) {
              question.matching_pairs = matchingData;
            }
          }
        } catch (err) {
          console.log('Error fetching additional data for question:', question.id, err);
        }
        
        return question;
      }));

      setQuestions(questionsWithAdditionalData);
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
      
      // Custom ordering based on your specified sequence
      const customOrder = [
        'Mengenal Bentuk Huruf Hijaiyah',
        'Mengenal Bunyi Huruf Hijaiyah',
        'Latihan Interaktif',
        'Fathah',
        'Kasrah',
        'Dhammah',
        'Sukun & Tanwin',
        'Ghunnah & Idgham',
        'Ikhfa & Iqlab',
        'Mad & Qalqalah',
        'Membaca Al-Fatihah',
        'Membaca Al-Ikhlas',
        'Membaca Al-Falaq & An-Nas'
      ];

      const sortedData = (data || []).sort((a, b) => {
        const titleA = a.title || '';
        const titleB = b.title || '';
        
        // Find index in custom order, if not found use high number to place at end
        const indexA = customOrder.findIndex(item => titleA.toLowerCase().includes(item.toLowerCase()));
        const indexB = customOrder.findIndex(item => titleB.toLowerCase().includes(item.toLowerCase()));
        
        const finalIndexA = indexA === -1 ? 999 : indexA;
        const finalIndexB = indexB === -1 ? 999 : indexB;
        
        // If both have same custom order index, fall back to original order_sequence
        if (finalIndexA === finalIndexB) {
          return (a.order_sequence || 0) - (b.order_sequence || 0);
        }
        
        return finalIndexA - finalIndexB;
      });

      setSubLessons(sortedData);
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

  // Function to render question type specific details
  const renderQuestionDetails = (question) => {
    const questionTypeKey = getQuestionTypeKey(question.question_type_id);
    
    // Debug: Log question data to see what we have
    console.log('Question detail data:', {
      id: question.id,
      type: questionTypeKey,
      question_text: question.question_text,
      voice_input_data: question.voice_input_data,
      true_false_data: question.true_false_data,
      question_options: question.question_options
    });
    
    switch (questionTypeKey) {
      case 'multiple_choice':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Pilihan Jawaban</label>
            <div className="space-y-2">
              {question.question_options?.map((option, index) => (
                <div key={option.id} className={`p-3 rounded-lg border ${option.is_correct ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">{String.fromCharCode(65 + index)}.</span>
                    <span className="text-gray-800">{option.option_text}</span>
                    {option.is_correct && (
                      <span className="ml-auto text-green-600 text-sm font-medium">✓ Benar</span>
                    )}
                  </div>
                </div>
              )) || <div className="text-gray-500 italic">Tidak ada pilihan jawaban</div>}
            </div>
          </div>
        );
      
      case 'true_false':
        // Enhanced logic to find correct answer with multiple fallback strategies
        let trueFalseAnswer = 'Tidak diketahui';
        let foundSource = 'none';
        
        console.log('Debugging true/false answer for question:', question.id);
        console.log('Available data sources:', {
          true_false_data: question.true_false_data,
          question_options: question.question_options,
          direct_correct_answer: question.correct_answer
        });
        
        // Strategy 1: Check the specialized true_false_data
        if (question.true_false_data?.correct_answer !== undefined) {
          trueFalseAnswer = question.true_false_data.correct_answer ? 'Benar' : 'Salah';
          foundSource = 'true_false_data';
          console.log('Found answer from true_false_data:', trueFalseAnswer);
        }
        // Strategy 2: Check question_options for correct answer
        else if (question.question_options?.length > 0) {
          const correctTrueFalse = question.question_options.find(opt => opt.is_correct);
          if (correctTrueFalse?.option_text) {
            trueFalseAnswer = correctTrueFalse.option_text;
            foundSource = 'question_options_correct';
            console.log('Found answer from question_options (correct):', trueFalseAnswer);
          } else {
            // Find any option that looks like a true/false answer
            const booleanOption = question.question_options.find(opt => 
              opt.option_text?.toLowerCase().includes('benar') || 
              opt.option_text?.toLowerCase().includes('salah') ||
              opt.option_text?.toLowerCase().includes('true') ||
              opt.option_text?.toLowerCase().includes('false')
            );
            if (booleanOption && booleanOption.is_correct) {
              trueFalseAnswer = booleanOption.option_text;
              foundSource = 'question_options_boolean';
              console.log('Found answer from question_options (boolean):', trueFalseAnswer);
            } else if (booleanOption) {
              // Use the first boolean option even if not marked correct
              trueFalseAnswer = booleanOption.option_text;
              foundSource = 'question_options_fallback';
              console.log('Found answer from question_options (fallback):', trueFalseAnswer);
            }
          }
        }
        // Strategy 3: Check direct property
        else if (question.correct_answer !== undefined) {
          trueFalseAnswer = question.correct_answer ? 'Benar' : 'Salah';
          foundSource = 'direct_property';
          console.log('Found answer from direct property:', trueFalseAnswer);
        }
        
        console.log('Final true/false answer:', trueFalseAnswer, 'from source:', foundSource);
        
        return (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Jawaban Benar</label>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <span className="text-green-800 font-medium">
                {trueFalseAnswer}
              </span>
              {foundSource !== 'none' && (
                <div className="text-xs text-gray-500 mt-1">
                  Sumber: {foundSource}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'short_answer':
        const correctShortAnswer = question.question_options?.find(opt => opt.is_correct);
        return (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Jawaban yang Benar</label>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <span className="text-green-800 font-medium">
                {correctShortAnswer?.option_text || 'Tidak ada jawaban'}
              </span>
            </div>
          </div>
        );
      
      case 'voice_input':
        // Enhanced logic to find expected answer with multiple fallback strategies
        let expectedAnswerText = 'Tidak ada jawaban yang diharapkan';
        let voiceFoundSource = 'none';
        
        console.log('Debugging voice input answer for question:', question.id);
        console.log('Available voice data sources:', {
          voice_input_data: question.voice_input_data,
          question_options: question.question_options
        });
        
        // Strategy 1: Check voice_input_data.expected_answer
        if (question.voice_input_data?.expected_answer) {
          expectedAnswerText = question.voice_input_data.expected_answer;
          voiceFoundSource = 'voice_input_data';
          console.log('Found answer from voice_input_data:', expectedAnswerText);
        }
        // Strategy 2: Check question_options for correct answer
        else {
          const expectedAnswerFromOptions = question.question_options?.find(opt => opt.is_correct);
          if (expectedAnswerFromOptions?.option_text) {
            expectedAnswerText = expectedAnswerFromOptions.option_text;
            voiceFoundSource = 'question_options';
            console.log('Found answer from question_options:', expectedAnswerText);
          } else if (question.question_options?.length > 0) {
            // Use the first option as fallback
            expectedAnswerText = question.question_options[0].option_text;
            voiceFoundSource = 'question_options_fallback';
            console.log('Found answer from question_options (fallback):', expectedAnswerText);
          }
        }
        
        console.log('Final voice input answer:', expectedAnswerText, 'from source:', voiceFoundSource);
        
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Jawaban yang Diharapkan</label>
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <span className="text-green-800 font-medium">
                  {expectedAnswerText}
                </span>
                {voiceFoundSource !== 'none' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Sumber: {voiceFoundSource}
                  </div>
                )}
              </div>
            </div>
            {question.voice_input_data?.instruction && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Instruksi</label>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <span className="text-gray-800">{question.voice_input_data.instruction}</span>
                </div>
              </div>
            )}
            {question.voice_input_data?.model && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Model Recognition</label>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <span className="text-blue-800 font-mono text-sm">{question.voice_input_data.model}</span>
                </div>
              </div>
            )}
            {question.voice_input_data?.tolerance_level && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Tingkat Toleransi</label>
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                  <span className="text-purple-800 font-medium">{question.voice_input_data.tolerance_level}%</span>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'fill_in_blank':
        return (
          <div className="space-y-4">
            {question.sentence_template && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Template Kalimat</label>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <span className="text-gray-800">{question.sentence_template}</span>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Jawaban yang Benar</label>
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <span className="text-green-800 font-medium">
                  {question.fill_in_blank_answers?.[0]?.correct_answer || 'Tidak ada jawaban'}
                </span>
              </div>
            </div>
          </div>
        );
      
      case 'drag_and_drop':
        return (
          <div className="space-y-4">
            {question.sentence_template && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Template Kalimat</label>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <span className="text-gray-800">{question.sentence_template}</span>
                </div>
              </div>
            )}
            {question.drag_drop_choices?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Pilihan yang Tersedia</label>
                <div className="flex flex-wrap gap-2">
                  {question.drag_drop_choices.map((choice, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm">
                      {choice.choice_text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'matching':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Pasangan yang Harus Dicocokkan</label>
            {question.matching_pairs?.length > 0 ? (
              <div className="space-y-2">
                {question.matching_pairs.map((pair, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center gap-3">
                    <span className="text-gray-800">{pair.left_item}</span>
                    <span className="text-gray-400">↔</span>
                    <span className="text-gray-800">{pair.right_item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">Tidak ada pasangan yang didefinisikan</div>
            )}
          </div>
        );
      
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Detail Tambahan</label>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
              <span className="text-gray-600 italic">Detail untuk tipe soal ini tidak tersedia</span>
            </div>
          </div>
        );
    }
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
    } else if (selectedType && selectedType.type_key === 'short_answer') {
      setShowShortAnswerModal(true);
    } else if (selectedType && selectedType.type_key === 'fill_in_blank') {
      setShowFillBlankModal(true);
    } else if (selectedType && selectedType.type_key === 'matching') {
      setShowMatchingModal(true);
    } else if (selectedType && selectedType.type_key === 'multiple_choice') {
      setShowMultipleChoiceModal(true);
    } else if (selectedType && selectedType.type_key === 'voice_input') {
      setShowVoiceInputModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleViewQuestion = (question) => {
    setViewingQuestion(question);
    setShowDetailModal(true);
  };

  const handleEditQuestion = (question) => {
    const questionTypeKey = getQuestionTypeKey(question.question_type_id);
    
    switch (questionTypeKey) {
      case 'drag_and_drop':
        setEditingDragDropQuestion(question);
        // Populate form with existing data
        setDragDropData({
          instruction: question.question_text || '',
          sentence_template: question.sentence_template || '',
          sublesson_id: question.sublesson_id?.toString() || '',
          order_sequence: question.order_sequence || 1,
          choices: question.drag_drop_choices?.map(choice => ({
            text: choice.choice_text,
            isCorrect: choice.is_correct || false
          })) || [{ text: '', isCorrect: false }]
        });
        setShowEditDragDropModal(true);
        break;
      
      case 'true_false':
        setEditingTrueFalseQuestion(question);
        const correctTF = question.question_options?.find(opt => opt.is_correct);
        setTrueFalseData({
          question: question.question_text || '',
          correct_answer: correctTF?.option_text === 'Benar' || correctTF?.option_text === 'True' || true,
          sublesson_id: question.sublesson_id?.toString() || '',
          order_sequence: question.order_sequence || 1
        });
        setShowEditTrueFalseModal(true);
        break;
      
      case 'short_answer':
        setEditingShortAnswerQuestion(question);
        const correctSA = question.question_options?.find(opt => opt.is_correct);
        setShortAnswerData({
          question: question.question_text || '',
          correct_answer: correctSA?.option_text || '',
          sublesson_id: question.sublesson_id?.toString() || '',
          order_sequence: question.order_sequence || 1
        });
        setShowEditShortAnswerModal(true);
        break;
      
      case 'fill_in_blank':
        setEditingFillBlankQuestion(question);
        setFillBlankData({
          question: question.question_text || '',
          sublesson_id: question.sublesson_id?.toString() || '',
          order_sequence: question.order_sequence || 1,
          blanks: question.fill_in_blank_answers?.map(answer => ({
            correct_answer: answer.correct_answer
          })) || [{ correct_answer: '' }]
        });
        setShowEditFillBlankModal(true);
        break;
      
      case 'matching':
        setEditingMatchingQuestion(question);
        setMatchingData({
          question: question.question_text || '',
          sublesson_id: question.sublesson_id?.toString() || '',
          order_sequence: question.order_sequence || 1,
          pairs: question.matching_pairs?.map(pair => ({
            left_item: pair.left_item,
            right_item: pair.right_item
          })) || [{ left_item: '', right_item: '' }]
        });
        setShowEditMatchingModal(true);
        break;
      
      case 'multiple_choice':
        setEditingMultipleChoiceQuestion(question);
        setMultipleChoiceData({
          question: question.question_text || '',
          sublesson_id: question.sublesson_id?.toString() || '',
          order_sequence: question.order_sequence || 1,
          options: question.question_options?.map(option => ({
            option_text: option.option_text,
            is_correct: option.is_correct
          })) || [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false }
          ]
        });
        setShowEditMultipleChoiceModal(true);
        break;
      
      case 'voice_input':
        setEditingVoiceInputQuestion(question);
        setVoiceInputData({
          question_text: question.question_text || '',
          instruction: question.voice_input_data?.instruction || '',
          expected_answer: question.voice_input_data?.expected_answer || '',
          tolerance_level: question.voice_input_data?.tolerance_level || 80,
          model: question.voice_input_data?.model || 'ojisetyawan/whisper-base-ar-quran-ft-hijaiyah-2',
          sublesson_id: question.sublesson_id?.toString() || '',
          order_sequence: question.order_sequence || 1
        });
        setShowEditVoiceInputModal(true);
        break;
      
      default:
        showToast.warning('Tipe soal ini belum mendukung edit');
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus soal "${question.question_text}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', question.id);

      if (error) throw error;

      // Refresh questions list
      await fetchQuestions();
      showToast.success('Soal berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting question:', error);
      showToast.error('Gagal menghapus soal: ' + error.message);
    }
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

  // Short Answer form handlers
  const handleShortAnswerInputChange = (e) => {
    const { name, value } = e.target;
    setShortAnswerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetShortAnswerForm = () => {
    setShortAnswerData({
      question: '',
      correct_answer: '',
      sublesson_id: '',
      order_sequence: 1
    });
  };

  // Fill in the Blank form handlers
  const handleFillBlankInputChange = (e) => {
    const { name, value } = e.target;
    setFillBlankData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addBlank = () => {
    setFillBlankData(prev => ({
      ...prev,
      blanks: [...prev.blanks, { correct_answer: '' }]
    }));
  };

  const removeBlank = (index) => {
    setFillBlankData(prev => ({
      ...prev,
      blanks: prev.blanks.filter((_, i) => i !== index)
    }));
  };

  const updateBlank = (index, value) => {
    setFillBlankData(prev => ({
      ...prev,
      blanks: prev.blanks.map((blank, i) => 
        i === index ? { ...blank, correct_answer: value } : blank
      )
    }));
  };

  const resetFillBlankForm = () => {
    setFillBlankData({
      question: '',
      sublesson_id: '',
      order_sequence: 1,
      blanks: [{ correct_answer: '' }]
    });
  };

  // Matching form handlers
  const handleMatchingInputChange = (e) => {
    const { name, value } = e.target;
    setMatchingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMatchingPair = () => {
    setMatchingData(prev => ({
      ...prev,
      pairs: [...prev.pairs, { left_item: '', right_item: '' }]
    }));
  };

  const removeMatchingPair = (index) => {
    setMatchingData(prev => ({
      ...prev,
      pairs: prev.pairs.filter((_, i) => i !== index)
    }));
  };

  const updateMatchingPair = (index, field, value) => {
    setMatchingData(prev => ({
      ...prev,
      pairs: prev.pairs.map((pair, i) => 
        i === index ? { ...pair, [field]: value } : pair
      )
    }));
  };

  const resetMatchingForm = () => {
    setMatchingData({
      question: '',
      sublesson_id: '',
      order_sequence: 1,
      pairs: [{ left_item: '', right_item: '' }]
    });
  };

  // Multiple Choice form handlers
  const handleMultipleChoiceInputChange = (e) => {
    const { name, value } = e.target;
    setMultipleChoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addOption = () => {
    setMultipleChoiceData(prev => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }]
    }));
  };

  const removeOption = (index) => {
    setMultipleChoiceData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index, field, value) => {
    setMultipleChoiceData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const toggleCorrectOption = (index) => {
    setMultipleChoiceData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, is_correct: !option.is_correct } : option
      )
    }));
  };

  const resetMultipleChoiceForm = () => {
    setMultipleChoiceData({
      question: '',
      sublesson_id: '',
      order_sequence: 1,
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false }
      ]
    });
  };

  // Voice Input form handlers
  const handleVoiceInputInputChange = (e) => {
    const { name, value } = e.target;
    setVoiceInputData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetVoiceInputForm = () => {
    setVoiceInputData({
      question_text: '',
      instruction: '',
      expected_answer: '',
      tolerance_level: 80,
      model: 'ojisetyawan/whisper-base-ar-quran-ft-hijaiyah-2',
      sublesson_id: '',
      order_sequence: 1
    });
  };

  // True/False CRUD operations
  const handleAddTrueFalseQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // Use default instruction if not provided
      const defaultInstruction = "Pilih jawaban yang benar: Benar atau Salah";
      const finalQuestion = trueFalseData.question || defaultInstruction;
      
      const questionData = {
        question: finalQuestion,
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
        question_text: finalQuestion,
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
      
      showModalToast.success('Soal True/False berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding true/false question:', err);
      showModalToast.error('Gagal menambahkan soal: ' + err.message);
    }
  };

  // Drag and Drop CRUD operations
  const handleAddDragDropQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // Validate that we have at least one correct answer
      const correctAnswers = dragDropData.choices.filter(choice => choice.isCorrect && choice.text.trim());
      if (correctAnswers.length === 0) {
        showModalToast.warning('Pilih minimal satu jawaban yang benar!');
        return;
      }

      // Validate that all choices have text
      const validChoices = dragDropData.choices.filter(choice => choice.text.trim());
      if (validChoices.length < 2) {
        showModalToast.warning('Minimal harus ada 2 pilihan!');
        return;
      }

      // Use default instruction if not provided
      const defaultInstruction = "Seret kata yang tepat ke tempat yang kosong";
      const finalInstruction = dragDropData.instruction.trim() || defaultInstruction;

      const questionData = {
        sublesson_id: parseInt(dragDropData.sublesson_id),
        order_sequence: parseInt(dragDropData.order_sequence),
        instruction: finalInstruction,
        sentence_template: dragDropData.sentence_template,
        choices: validChoices,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: questionResult, error: questionError } = await supabase
        .from('drag_drop_questions')
        .insert([questionData])
        .select();

      if (questionError) throw questionError;

      // Also insert into main questions table for consistency
      const mainQuestionData = {
        question_text: finalInstruction,
        question_type_id: 3, // Drag and drop type
        sublesson_id: parseInt(dragDropData.sublesson_id),
        order_sequence: parseInt(dragDropData.order_sequence),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: mainQuestionError } = await supabase
        .from('questions')
        .insert([mainQuestionData]);

      if (mainQuestionError) throw mainQuestionError;

      await fetchQuestions();
      setShowDragDropModal(false);
      resetDragDropForm();
      
      showModalToast.success('Soal Drag and Drop berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding drag and drop question:', err);
      showModalToast.error('Gagal menambahkan soal: ' + err.message);
    }
  };

  // Short Answer CRUD operations
  const handleAddShortAnswerQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // Use default question if not provided
      const defaultQuestion = "Jawab pertanyaan berikut dengan singkat dan tepat:";
      const finalQuestion = shortAnswerData.question.trim() || defaultQuestion;
      
      const questionData = {
        question: finalQuestion,
        correct_answer: shortAnswerData.correct_answer,
        question_type_id: selectedQuestionTypeForAdd,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: questionResult, error: questionError } = await supabase
        .from('short_answer_questions')
        .insert([questionData])
        .select();

      if (questionError) throw questionError;

      // Also insert into main questions table for consistency
      const mainQuestionData = {
        question_text: finalQuestion,
        question_type_id: selectedQuestionTypeForAdd,
        sublesson_id: parseInt(shortAnswerData.sublesson_id),
        order_sequence: parseInt(shortAnswerData.order_sequence),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: mainQuestionError } = await supabase
        .from('questions')
        .insert([mainQuestionData]);

      if (mainQuestionError) throw mainQuestionError;

      await fetchQuestions();
      setShowShortAnswerModal(false);
      resetShortAnswerForm();
      
      showModalToast.success('Soal Short Answer berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding short answer question:', err);
      showModalToast.error('Gagal menambahkan soal: ' + err.message);
    }
  };

  // Fill in the Blank CRUD operations
  const handleAddFillBlankQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // Validate that all blanks have answers
      const validBlanks = fillBlankData.blanks.filter(blank => blank.correct_answer.trim());
      if (validBlanks.length === 0) {
        showModalToast.warning('Isi minimal satu jawaban untuk tempat kosong!');
        return;
      }

      // Use default question if not provided
      const defaultQuestion = "Lengkapi kalimat berikut dengan kata yang tepat pada tempat kosong yang tersedia:";
      const finalQuestion = fillBlankData.question.trim() || defaultQuestion;

      const questionData = {
        question: finalQuestion,
        question_type_id: selectedQuestionTypeForAdd,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: questionResult, error: questionError } = await supabase
        .from('fill_in_blank_questions')
        .insert([questionData])
        .select();

      if (questionError) throw questionError;

      // Insert answers for each blank
      const answerPromises = validBlanks.map((blank, index) => 
        supabase
          .from('fill_in_blank_answers')
          .insert([{
            question_id: questionResult[0].id,
            blank_index: index,
            correct_answer: blank.correct_answer
          }])
      );

      await Promise.all(answerPromises);

      // Also insert into main questions table for consistency
      const mainQuestionData = {
        question_text: finalQuestion,
        question_type_id: selectedQuestionTypeForAdd,
        sublesson_id: parseInt(fillBlankData.sublesson_id),
        order_sequence: parseInt(fillBlankData.order_sequence),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: mainQuestionError } = await supabase
        .from('questions')
        .insert([mainQuestionData]);

      if (mainQuestionError) throw mainQuestionError;

      await fetchQuestions();
      setShowFillBlankModal(false);
      resetFillBlankForm();
      
      showModalToast.success('Soal Fill in the Blank berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding fill in blank question:', err);
      showModalToast.error('Gagal menambahkan soal: ' + err.message);
    }
  };

  // Matching CRUD operations
  const handleAddMatchingQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // Validate that all pairs have both items
      const validPairs = matchingData.pairs.filter(pair => pair.left_item.trim() && pair.right_item.trim());
      if (validPairs.length === 0) {
        showModalToast.warning('Isi minimal satu pasangan yang lengkap!');
        return;
      }

      // Use default question if not provided
      const defaultQuestion = "Cocokkan pasangan item di bawah ini dengan cara menghubungkan item yang sesuai:";
      const finalQuestion = matchingData.question.trim() || defaultQuestion;

      const questionData = {
        question: finalQuestion,
        question_type_id: selectedQuestionTypeForAdd,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: questionResult, error: questionError } = await supabase
        .from('matching_questions')
        .insert([questionData])
        .select();

      if (questionError) throw questionError;

      // Insert pairs
      const pairPromises = validPairs.map(pair => 
        supabase
          .from('matching_pairs')
          .insert([{
            question_id: questionResult[0].id,
            left_item: pair.left_item,
            right_item: pair.right_item
          }])
      );

      await Promise.all(pairPromises);

      // Also insert into main questions table for consistency
      const mainQuestionData = {
        question_text: finalQuestion,
        question_type_id: selectedQuestionTypeForAdd,
        sublesson_id: parseInt(matchingData.sublesson_id),
        order_sequence: parseInt(matchingData.order_sequence),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: mainQuestionError } = await supabase
        .from('questions')
        .insert([mainQuestionData]);

      if (mainQuestionError) throw mainQuestionError;

      await fetchQuestions();
      setShowMatchingModal(false);
      resetMatchingForm();
      
      showModalToast.success('Soal Matching berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding matching question:', err);
      showModalToast.error('Gagal menambahkan soal: ' + err.message);
    }
  };

  // Multiple Choice CRUD operations
  const handleAddMultipleChoiceQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // Validate that at least one option is correct
      const correctOptions = multipleChoiceData.options.filter(option => option.is_correct && option.option_text.trim());
      if (correctOptions.length === 0) {
        showModalToast.warning('Pilih minimal satu jawaban yang benar!');
        return;
      }

      // Validate that all options have text
      const validOptions = multipleChoiceData.options.filter(option => option.option_text.trim());
      if (validOptions.length < 2) {
        showModalToast.warning('Minimal harus ada 2 pilihan!');
        return;
      }

      // Use default question if not provided
      const defaultQuestion = "Pilih jawaban yang paling tepat dari pilihan di bawah ini:";
      const finalQuestion = multipleChoiceData.question.trim() || defaultQuestion;

      // First insert into main questions table to get question_id
      const mainQuestionData = {
        question_text: finalQuestion,
        question_type_id: selectedQuestionTypeForAdd,
        sublesson_id: parseInt(multipleChoiceData.sublesson_id),
        order_sequence: parseInt(multipleChoiceData.order_sequence),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: mainQuestionResult, error: mainQuestionError } = await supabase
        .from('questions')
        .insert([mainQuestionData])
        .select();

      if (mainQuestionError) throw mainQuestionError;

      // Insert options
      const optionPromises = validOptions.map(option => 
        supabase
          .from('question_options')
          .insert([{
            question_id: mainQuestionResult[0].id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
      );

      await Promise.all(optionPromises);

      await fetchQuestions();
      setShowMultipleChoiceModal(false);
      resetMultipleChoiceForm();
      
      showModalToast.success('Soal Multiple Choice berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding multiple choice question:', err);
      showModalToast.error('Gagal menambahkan soal: ' + err.message);
    }
  };

  // Voice Input CRUD operations
  const handleAddVoiceInputQuestion = async (e) => {
    e.preventDefault();
    
    try {
      // Use default values if not provided
      const defaultQuestionText = "Ucapkan kata/kalimat berikut dengan jelas dan benar:";
      const defaultInstruction = "Tekan tombol rekam, lalu ucapkan kata/kalimat yang ditampilkan dengan pelafalan yang tepat";
      
      const finalQuestionText = voiceInputData.question_text.trim() || defaultQuestionText;
      const finalInstruction = voiceInputData.instruction.trim() || defaultInstruction;
      
      // First insert into main questions table to get question_id
      const mainQuestionData = {
        question_text: finalQuestionText,
        question_type_id: selectedQuestionTypeForAdd,
        sublesson_id: parseInt(voiceInputData.sublesson_id),
        order_sequence: parseInt(voiceInputData.order_sequence),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: mainQuestionResult, error: mainQuestionError } = await supabase
        .from('questions')
        .insert([mainQuestionData])
        .select();

      if (mainQuestionError) throw mainQuestionError;

      // Insert into voice_input_questions table
      const questionData = {
        question_text: finalQuestionText,
        instruction: finalInstruction,
        expected_answer: voiceInputData.expected_answer,
        tolerance_level: parseInt(voiceInputData.tolerance_level),
        model: voiceInputData.model,
        question_type_id: selectedQuestionTypeForAdd,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: questionResult, error: questionError } = await supabase
        .from('voice_input_questions')
        .insert([questionData])
        .select();

      if (questionError) throw questionError;

      // Also insert into question_options table for consistency with other question types
      const { error: optionError } = await supabase
        .from('question_options')
        .insert([{
          question_id: mainQuestionResult[0].id,
          option_text: voiceInputData.expected_answer,
          is_correct: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (optionError) throw optionError;

      await fetchQuestions();
      setShowVoiceInputModal(false);
      resetVoiceInputForm();
      
      showModalToast.success('Soal Voice Input berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding voice input question:', err);
      showModalToast.error('Gagal menambahkan soal: ' + err.message);
    }
  };

  // Edit Voice Input Question
  const handleEditVoiceInputQuestion = async (e) => {
    e.preventDefault();
    
    try {
      const finalQuestionText = voiceInputData.question_text.trim() || "Ucapkan kata/kalimat berikut dengan jelas dan benar:";
      const finalInstruction = voiceInputData.instruction.trim() || "Tekan tombol rekam, lalu ucapkan kata/kalimat yang ditampilkan dengan pelafalan yang tepat";
      
      // Update main questions table
      const { error: mainQuestionError } = await supabase
        .from('questions')
        .update({
          question_text: finalQuestionText,
          sublesson_id: parseInt(voiceInputData.sublesson_id),
          order_sequence: parseInt(voiceInputData.order_sequence),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingVoiceInputQuestion.id);

      if (mainQuestionError) throw mainQuestionError;

      // Update voice_input_questions table
      const { error: voiceError } = await supabase
        .from('voice_input_questions')
        .update({
          question_text: finalQuestionText,
          instruction: finalInstruction,
          expected_answer: voiceInputData.expected_answer,
          tolerance_level: parseInt(voiceInputData.tolerance_level),
          model: voiceInputData.model,
          updated_at: new Date().toISOString()
        })
        .eq('question_text', editingVoiceInputQuestion.question_text);

      if (voiceError) throw voiceError;

      // Update question_options table
      const { error: deleteOptionError } = await supabase
        .from('question_options')
        .delete()
        .eq('question_id', editingVoiceInputQuestion.id);

      if (deleteOptionError) throw deleteOptionError;

      const { error: insertOptionError } = await supabase
        .from('question_options')
        .insert([{
          question_id: editingVoiceInputQuestion.id,
          option_text: voiceInputData.expected_answer,
          is_correct: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertOptionError) throw insertOptionError;

      await fetchQuestions();
      setShowEditVoiceInputModal(false);
      setEditingVoiceInputQuestion(null);
      resetVoiceInputForm();
      
      showModalToast.success('Soal Voice Input berhasil diperbarui!');
    } catch (err) {
      console.error('Error updating voice input question:', err);
      showModalToast.error('Gagal memperbarui soal: ' + err.message);
    }
  };

  // Edit Multiple Choice Question
  const handleEditMultipleChoiceQuestion = async (e) => {
    e.preventDefault();
    
    try {
      const validOptions = multipleChoiceData.options.filter(option => option.option_text.trim());
      if (validOptions.length < 2) {
        showModalToast.warning('Minimal harus ada 2 pilihan jawaban!');
        return;
      }

      const correctAnswers = validOptions.filter(option => option.is_correct);
      if (correctAnswers.length === 0) {
        showModalToast.warning('Pilih minimal satu jawaban yang benar!');
        return;
      }

      const finalQuestion = multipleChoiceData.question.trim() || "Pilih jawaban yang paling tepat:";

      // Update main questions table
      const { error: mainQuestionError } = await supabase
        .from('questions')
        .update({
          question_text: finalQuestion,
          sublesson_id: parseInt(multipleChoiceData.sublesson_id),
          order_sequence: parseInt(multipleChoiceData.order_sequence),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMultipleChoiceQuestion.id);

      if (mainQuestionError) throw mainQuestionError;

      // Delete existing options
      const { error: deleteOptionsError } = await supabase
        .from('question_options')
        .delete()
        .eq('question_id', editingMultipleChoiceQuestion.id);

      if (deleteOptionsError) throw deleteOptionsError;

      // Insert new options
      const optionPromises = validOptions.map(option => 
        supabase
          .from('question_options')
          .insert([{
            question_id: editingMultipleChoiceQuestion.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
      );

      await Promise.all(optionPromises);

      await fetchQuestions();
      setShowEditMultipleChoiceModal(false);
      setEditingMultipleChoiceQuestion(null);
      resetMultipleChoiceForm();
      
      showModalToast.success('Soal Multiple Choice berhasil diperbarui!');
    } catch (err) {
      console.error('Error updating multiple choice question:', err);
      showModalToast.error('Gagal memperbarui soal: ' + err.message);
    }
  };

  // Edit other question types (simplified for now)
  const handleEditDragDropQuestion = async (e) => {
    e.preventDefault();
    showModalToast.warning('Edit Drag & Drop akan segera tersedia. Untuk sementara, hapus dan buat soal baru.');
  };

  const handleEditTrueFalseQuestion = async (e) => {
    e.preventDefault();
    
    try {
      const finalQuestion = trueFalseData.question.trim() || "Pilih jawaban yang benar: Benar atau Salah";

      // Update main questions table
      const { error: mainQuestionError } = await supabase
        .from('questions')
        .update({
          question_text: finalQuestion,
          sublesson_id: parseInt(trueFalseData.sublesson_id),
          order_sequence: parseInt(trueFalseData.order_sequence),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTrueFalseQuestion.id);

      if (mainQuestionError) throw mainQuestionError;

      // Update question_options table
      const { error: deleteOptionError } = await supabase
        .from('question_options')
        .delete()
        .eq('question_id', editingTrueFalseQuestion.id);

      if (deleteOptionError) throw deleteOptionError;

      // Insert correct answer option
      const correctAnswerText = trueFalseData.correct_answer ? 'Benar' : 'Salah';
      const incorrectAnswerText = trueFalseData.correct_answer ? 'Salah' : 'Benar';

      const optionPromises = [
        supabase.from('question_options').insert([{
          question_id: editingTrueFalseQuestion.id,
          option_text: correctAnswerText,
          is_correct: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]),
        supabase.from('question_options').insert([{
          question_id: editingTrueFalseQuestion.id,
          option_text: incorrectAnswerText,
          is_correct: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
      ];

      await Promise.all(optionPromises);

      await fetchQuestions();
      setShowEditTrueFalseModal(false);
      setEditingTrueFalseQuestion(null);
      resetTrueFalseForm();
      
      showModalToast.success('Soal True/False berhasil diperbarui!');
    } catch (err) {
      console.error('Error updating true/false question:', err);
      showModalToast.error('Gagal memperbarui soal: ' + err.message);
    }
  };

  const handleEditShortAnswerQuestion = async (e) => {
    e.preventDefault();
    showModalToast.warning('Edit Short Answer akan segera tersedia. Untuk sementara, hapus dan buat soal baru.');
  };

  const handleEditFillBlankQuestion = async (e) => {
    e.preventDefault();
    showModalToast.warning('Edit Fill in Blank akan segera tersedia. Untuk sementara, hapus dan buat soal baru.');
  };

  const handleEditMatchingQuestion = async (e) => {
    e.preventDefault();
    showModalToast.warning('Edit Matching akan segera tersedia. Untuk sementara, hapus dan buat soal baru.');
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
                            handleDeleteQuestion(question);
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
                      Pertanyaan/Pernyataan
                    </label>
                    <textarea
                      name="question"
                      value={trueFalseData.question}
                      onChange={handleTrueFalseInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Contoh: Huruf Alif adalah huruf pertama dalam alphabet Arab (Opsional - akan menggunakan instruksi default jika kosong)"
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

            <form className="p-6" onSubmit={handleAddDragDropQuestion}>
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
                      Instruksi untuk Siswa
                    </label>
                    <textarea
                      name="instruction"
                      value={dragDropData.instruction}
                      onChange={handleDragDropInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Opsional - Jika kosong akan menggunakan: 'Seret kata yang tepat ke tempat yang kosong'"
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

      {/* Short Answer Question Modal */}
      {showShortAnswerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <IconPencil size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Buat Soal Short Answer</h3>
                    <p className="text-sm text-gray-600">Soal dengan jawaban singkat berupa teks</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowShortAnswerModal(false);
                    resetShortAnswerForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddShortAnswerQuestion} className="p-6">
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
                        value={shortAnswerData.sublesson_id}
                        onChange={handleShortAnswerInputChange}
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
                        value={shortAnswerData.order_sequence}
                        onChange={handleShortAnswerInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pertanyaan
                    </label>
                    <textarea
                      name="question"
                      value={shortAnswerData.question}
                      onChange={handleShortAnswerInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Opsional - Jika kosong akan menggunakan instruksi default: 'Jawab pertanyaan berikut dengan singkat dan tepat:'"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jawaban yang Benar *
                    </label>
                    <textarea
                      name="correct_answer"
                      value={shortAnswerData.correct_answer}
                      onChange={handleShortAnswerInputChange}
                      required
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Contoh: A / Alif"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Tulis jawaban yang paling tepat. Sistem akan mencocokkan jawaban siswa dengan ini.
                    </p>
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
                      <span className="text-sm text-gray-900">{shortAnswerData.question || 'Belum diisi'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Jawaban yang Benar: </span>
                      <span className="text-sm text-gray-900 bg-green-100 px-2 py-1 rounded">
                        {shortAnswerData.correct_answer || 'Belum diisi'}
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
                    setShowShortAnswerModal(false);
                    resetShortAnswerForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <IconPlus size={16} />
                  Buat Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Fill in the Blank Question Modal */}
      {showFillBlankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <IconWriting size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Buat Soal Fill in the Blank</h3>
                    <p className="text-sm text-gray-600">Soal dengan tempat kosong yang harus diisi</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFillBlankModal(false);
                    resetFillBlankForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddFillBlankQuestion} className="p-6">
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
                        value={fillBlankData.sublesson_id}
                        onChange={handleFillBlankInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
                        value={fillBlankData.order_sequence}
                        onChange={handleFillBlankInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pertanyaan dengan Tempat Kosong *
                    </label>
                    <textarea
                      name="question"
                      value={fillBlankData.question}
                      onChange={handleFillBlankInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Contoh: Huruf _____ adalah huruf pertama dalam alphabet Arab dan huruf _____ adalah huruf kedua"
                    />
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <IconBulb size={16} className="text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Tips membuat soal:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Gunakan <code className="bg-yellow-100 px-1 rounded">_____</code> untuk setiap tempat kosong</li>
                            <li>Jumlah tempat kosong harus sama dengan jumlah jawaban di bawah</li>
                            <li>Urutan jawaban akan sesuai dengan urutan tempat kosong</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answers Section */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Jawaban untuk Tempat Kosong</h4>
                    <button
                      type="button"
                      onClick={addBlank}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                    >
                      <IconPlus size={14} />
                      Tambah Jawaban
                    </button>
                  </div>
                  
                  <p className="text-sm text-yellow-700 mb-4">Masukkan jawaban sesuai urutan tempat kosong dalam pertanyaan.</p>
                  
                  <div className="space-y-3">
                    {fillBlankData.blanks.map((blank, index) => (
                      <div key={index} className="flex gap-3 items-center bg-white p-3 rounded-lg border border-yellow-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={blank.correct_answer}
                          onChange={(e) => updateBlank(index, e.target.value)}
                          placeholder={`Jawaban untuk kosong ke-${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        {fillBlankData.blanks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBlank(index)}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus jawaban ini"
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
                      <span className="text-sm font-medium text-gray-600">Pertanyaan: </span>
                      <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                        {fillBlankData.question || 'Belum diisi'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Jawaban: </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {fillBlankData.blanks.filter(b => b.correct_answer.trim()).map((blank, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-sm"
                          >
                            {i + 1}. {blank.correct_answer}
                          </span>
                        ))}
                        {fillBlankData.blanks.filter(b => b.correct_answer.trim()).length === 0 && (
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
                    setShowFillBlankModal(false);
                    resetFillBlankForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                >
                  <IconPlus size={16} />
                  Buat Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Matching Question Modal */}
      {showMatchingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <IconTarget size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Buat Soal Matching</h3>
                    <p className="text-sm text-gray-600">Soal mencocokkan pasangan yang sesuai</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMatchingModal(false);
                    resetMatchingForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMatchingQuestion} className="p-6">
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
                        value={matchingData.sublesson_id}
                        onChange={handleMatchingInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                        value={matchingData.order_sequence}
                        onChange={handleMatchingInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instruksi Soal *
                    </label>
                    <textarea
                      name="question"
                      value={matchingData.question}
                      onChange={handleMatchingInputChange}
                      required
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Contoh: Cocokkan huruf Arab dengan bunyi yang tepat"
                    />
                  </div>
                </div>

                {/* Matching Pairs Section */}
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Pasangan yang Harus Dicocokkan</h4>
                    <button
                      type="button"
                      onClick={addMatchingPair}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                    >
                      <IconPlus size={14} />
                      Tambah Pasangan
                    </button>
                  </div>
                  
                  <p className="text-sm text-purple-700 mb-4">Buat pasangan item yang harus dicocokkan siswa.</p>
                  
                  <div className="space-y-4">
                    {matchingData.pairs.map((pair, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <h5 className="font-medium text-gray-800">Pasangan {index + 1}</h5>
                          {matchingData.pairs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMatchingPair(index)}
                              className="ml-auto text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Hapus pasangan ini"
                            >
                              <IconTrash size={16} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Item Kiri *
                            </label>
                            <input
                              type="text"
                              value={pair.left_item}
                              onChange={(e) => updateMatchingPair(index, 'left_item', e.target.value)}
                              placeholder="Contoh: ا (Alif)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Item Kanan *
                            </label>
                            <input
                              type="text"
                              value={pair.right_item}
                              onChange={(e) => updateMatchingPair(index, 'right_item', e.target.value)}
                              placeholder="Contoh: Bunyi A"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Section */}
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-4">
                    <IconEye size={20} className="text-indigo-600" />
                    <h4 className="text-lg font-medium text-gray-900">Preview Soal</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Instruksi: </span>
                      <span className="text-sm text-gray-900">{matchingData.question || 'Belum diisi'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Pasangan: </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Item Kiri:</p>
                          {matchingData.pairs.filter(p => p.left_item.trim()).map((pair, i) => (
                            <div key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mb-1">
                              {pair.left_item}
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Item Kanan:</p>
                          {matchingData.pairs.filter(p => p.right_item.trim()).map((pair, i) => (
                            <div key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mb-1">
                              {pair.right_item}
                            </div>
                          ))}
                        </div>
                      </div>
                      {matchingData.pairs.filter(p => p.left_item.trim() && p.right_item.trim()).length === 0 && (
                        <span className="text-gray-400 text-sm">Belum ada pasangan</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowMatchingModal(false);
                    resetMatchingForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <IconPlus size={16} />
                  Buat Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Multiple Choice Question Modal */}
      {showMultipleChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <IconListCheck size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Buat Soal Multiple Choice</h3>
                    <p className="text-sm text-gray-600">Soal pilihan ganda dengan beberapa opsi jawaban</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMultipleChoiceModal(false);
                    resetMultipleChoiceForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMultipleChoiceQuestion} className="p-6">
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
                        value={multipleChoiceData.sublesson_id}
                        onChange={handleMultipleChoiceInputChange}
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
                        value={multipleChoiceData.order_sequence}
                        onChange={handleMultipleChoiceInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pertanyaan *
                    </label>
                    <textarea
                      name="question"
                      value={multipleChoiceData.question}
                      onChange={handleMultipleChoiceInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contoh: Huruf manakah yang merupakan huruf pertama dalam alphabet Arab?"
                    />
                  </div>
                </div>

                {/* Options Section */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Pilihan Jawaban</h4>
                    <button
                      type="button"
                      onClick={addOption}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                    >
                      <IconPlus size={14} />
                      Tambah Pilihan
                    </button>
                  </div>
                  
                  <p className="text-sm text-blue-700 mb-4">Tambahkan pilihan jawaban. Centang pilihan yang merupakan jawaban benar.</p>
                  
                  <div className="space-y-3">
                    {multipleChoiceData.options.map((option, index) => (
                      <div key={index} className="flex gap-3 items-center bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <input
                          type="text"
                          value={option.option_text}
                          onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                          placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={option.is_correct}
                              onChange={() => toggleCorrectOption(index)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Jawaban Benar</span>
                          </label>
                        </div>
                        {multipleChoiceData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
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
                      <span className="text-sm font-medium text-gray-600">Pertanyaan: </span>
                      <span className="text-sm text-gray-900">{multipleChoiceData.question || 'Belum diisi'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Pilihan: </span>
                      <div className="space-y-1 mt-2">
                        {multipleChoiceData.options.filter(o => o.option_text.trim()).map((option, i) => (
                          <div 
                            key={i} 
                            className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                              option.is_correct 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <span className="font-medium">{String.fromCharCode(65 + i)}.</span>
                            <span>{option.option_text}</span>
                            {option.is_correct && <span className="ml-auto text-green-600">✓</span>}
                          </div>
                        ))}
                        {multipleChoiceData.options.filter(o => o.option_text.trim()).length === 0 && (
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
                    setShowMultipleChoiceModal(false);
                    resetMultipleChoiceForm();
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

      {/* Voice Input Question Modal */}
      {showVoiceInputModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500 rounded-lg">
                    <IconMicrophone size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Buat Soal Voice Input</h3>
                    <p className="text-sm text-gray-600">Soal dengan input suara untuk latihan pronunciation</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowVoiceInputModal(false);
                    resetVoiceInputForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddVoiceInputQuestion} className="p-6">
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
                        value={voiceInputData.sublesson_id}
                        onChange={handleVoiceInputInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                        value={voiceInputData.order_sequence}
                        onChange={handleVoiceInputInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pertanyaan/Soal *
                    </label>
                    <textarea
                      name="question_text"
                      value={voiceInputData.question_text}
                      onChange={handleVoiceInputInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Contoh: Ucapkan huruf Alif dengan pronunciation yang benar"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IconInfoCircle size={16} className="inline mr-1" />
                      Instruksi untuk Siswa *
                    </label>
                    <textarea
                      name="instruction"
                      value={voiceInputData.instruction}
                      onChange={handleVoiceInputInputChange}
                      required
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Contoh: Tekan tombol rekam dan ucapkan dengan jelas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jawaban yang Diharapkan *
                    </label>
                    <input
                      type="text"
                      name="expected_answer"
                      value={voiceInputData.expected_answer}
                      onChange={handleVoiceInputInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Contoh: Alif"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Teks yang akan dibandingkan dengan hasil speech recognition siswa
                    </p>
                  </div>
                </div>

                {/* Voice Recognition Settings */}
                <div className="bg-pink-50 p-6 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Pengaturan Voice Recognition</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tingkat Toleransi (%) *
                      </label>
                      <input
                        type="range"
                        name="tolerance_level"
                        value={voiceInputData.tolerance_level}
                        onChange={handleVoiceInputInputChange}
                        min="50"
                        max="100"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>50% (Ketat)</span>
                        <span className="font-medium text-pink-600">{voiceInputData.tolerance_level}%</span>
                        <span>100% (Longgar)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Seberapa mirip jawaban siswa harus dengan jawaban yang diharapkan
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model Speech Recognition
                      </label>
                      <select
                        name="model"
                        value={voiceInputData.model}
                        onChange={handleVoiceInputInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="ojisetyawan/whisper-base-ar-quran-ft-hijaiyah-2">ojisetyawan/whisper-base-ar-quran-ft-hijaiyah-2</option>
                        <option value="tarteel-ai/whisper-base-ar-quran">tarteel-ai/whisper-base-ar-quran</option>
                        <option value="quran.com">quran.com</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Model AI yang akan digunakan untuk mengenali suara
                      </p>
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
                      <span className="text-sm text-gray-900">{voiceInputData.question_text || 'Belum diisi'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Instruksi: </span>
                      <span className="text-sm text-gray-900">{voiceInputData.instruction || 'Belum diisi'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Jawaban yang Diharapkan: </span>
                      <span className="text-sm text-gray-900 bg-green-100 px-2 py-1 rounded">
                        {voiceInputData.expected_answer || 'Belum diisi'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Toleransi: </span>
                      <span className="text-sm text-pink-600 font-medium">{voiceInputData.tolerance_level}%</span>
                      <span className="text-sm text-gray-500 ml-2">({voiceInputData.model})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowVoiceInputModal(false);
                    resetVoiceInputForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                >
                  <IconPlus size={16} />
                  Buat Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Question Detail Modal */}
      {showDetailModal && viewingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Detail Soal</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setViewingQuestion(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">ID Soal</label>
                  <div className="text-gray-800 font-mono">#{viewingQuestion.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Urutan</label>
                  <div className="text-gray-800">{viewingQuestion.order_sequence}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tipe Soal</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQuestionTypeColor(viewingQuestion.question_type_id)}`}>
                  {getQuestionTypeLabel(viewingQuestion.question_type_id)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Materi</label>
                <div className="text-gray-800">{getSubLessonTitle(viewingQuestion)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Pertanyaan</label>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-800">
                  {viewingQuestion.question_text || 'Tidak ada teks pertanyaan'}
                </div>
              </div>

              {/* Question Type Specific Details */}
              {renderQuestionDetails(viewingQuestion)}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Dibuat</label>
                  <div className="text-gray-800 text-sm">
                    {viewingQuestion.created_at ? new Date(viewingQuestion.created_at).toLocaleString('id-ID') : 'Tidak diketahui'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Diupdate</label>
                  <div className="text-gray-800 text-sm">
                    {viewingQuestion.updated_at ? new Date(viewingQuestion.updated_at).toLocaleString('id-ID') : 'Tidak diketahui'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setViewingQuestion(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Voice Input Modal */}
      {showEditVoiceInputModal && editingVoiceInputQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Edit Soal Voice Input</h3>
              <button
                onClick={() => {
                  setShowEditVoiceInputModal(false);
                  setEditingVoiceInputQuestion(null);
                  resetVoiceInputForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleEditVoiceInputQuestion} className="p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Sub Lesson Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IconInfoCircle size={16} className="inline mr-1" />
                    Materi *
                  </label>
                  <select
                    name="sublesson_id"
                    value={voiceInputData.sublesson_id}
                    onChange={handleVoiceInputInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">Pilih Materi</option>
                    {subLessons.map(subLesson => (
                      <option key={subLesson.id} value={subLesson.id}>
                        {subLesson.roadmap_levels?.title} - {subLesson.title}
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
                    value={voiceInputData.order_sequence}
                    onChange={handleVoiceInputInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pertanyaan/Soal *
                </label>
                <textarea
                  name="question_text"
                  value={voiceInputData.question_text}
                  onChange={handleVoiceInputInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Contoh: Ucapkan huruf Alif dengan pronunciation yang benar"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <IconInfoCircle size={16} className="inline mr-1" />
                  Instruksi untuk Siswa *
                </label>
                <textarea
                  name="instruction"
                  value={voiceInputData.instruction}
                  onChange={handleVoiceInputInputChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Contoh: Tekan tombol rekam dan ucapkan dengan jelas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jawaban yang Diharapkan *
                </label>
                <input
                  type="text"
                  name="expected_answer"
                  value={voiceInputData.expected_answer}
                  onChange={handleVoiceInputInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Contoh: Alif"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Teks yang akan dibandingkan dengan hasil speech recognition siswa
                </p>
              </div>

              {/* Voice Recognition Settings */}
              <div className="bg-pink-50 p-6 rounded-lg mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Pengaturan Voice Recognition</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tingkat Toleransi (%) *
                    </label>
                    <input
                      type="range"
                      name="tolerance_level"
                      value={voiceInputData.tolerance_level}
                      onChange={handleVoiceInputInputChange}
                      min="50"
                      max="100"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50% (Ketat)</span>
                      <span className="font-medium text-pink-600">{voiceInputData.tolerance_level}%</span>
                      <span>100% (Longgar)</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Seberapa mirip jawaban siswa harus dengan jawaban yang diharapkan
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Speech Recognition
                    </label>
                    <select
                      name="model"
                      value={voiceInputData.model}
                      onChange={handleVoiceInputInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="ojisetyawan/whisper-base-ar-quran-ft-hijaiyah-2">ojisetyawan/whisper-base-ar-quran-ft-hijaiyah-2</option>
                      <option value="tarteel-ai/whisper-base-ar-quran">tarteel-ai/whisper-base-ar-quran</option>
                      <option value="quran.com">quran.com</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Model AI yang akan digunakan untuk mengenali suara
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditVoiceInputModal(false);
                    setEditingVoiceInputQuestion(null);
                    resetVoiceInputForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                >
                  <IconEdit size={16} />
                  Update Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Multiple Choice Modal */}
      {showEditMultipleChoiceModal && editingMultipleChoiceQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Edit Soal Multiple Choice</h3>
              <button
                onClick={() => {
                  setShowEditMultipleChoiceModal(false);
                  setEditingMultipleChoiceQuestion(null);
                  resetMultipleChoiceForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleEditMultipleChoiceQuestion} className="p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IconInfoCircle size={16} className="inline mr-1" />
                    Materi *
                  </label>
                  <select
                    name="sublesson_id"
                    value={multipleChoiceData.sublesson_id}
                    onChange={handleMultipleChoiceInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Materi</option>
                    {subLessons.map(subLesson => (
                      <option key={subLesson.id} value={subLesson.id}>
                        {subLesson.roadmap_levels?.title} - {subLesson.title}
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
                    value={multipleChoiceData.order_sequence}
                    onChange={handleMultipleChoiceInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pertanyaan *
                </label>
                <textarea
                  name="question"
                  value={multipleChoiceData.question}
                  onChange={handleMultipleChoiceInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan teks pertanyaan di sini..."
                />
              </div>

              {/* Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pilihan Jawaban *
                </label>
                <div className="space-y-3">
                  {multipleChoiceData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 min-w-[30px]">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.is_correct}
                          onChange={() => toggleCorrectOption(index)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Benar</span>
                      </label>
                      {multipleChoiceData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <IconTrash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {multipleChoiceData.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-3 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <IconPlus size={16} />
                    Tambah Pilihan
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditMultipleChoiceModal(false);
                    setEditingMultipleChoiceQuestion(null);
                    resetMultipleChoiceForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <IconEdit size={16} />
                  Update Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit True/False Modal */}
      {showEditTrueFalseModal && editingTrueFalseQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Edit Soal True/False</h3>
              <button
                onClick={() => {
                  setShowEditTrueFalseModal(false);
                  setEditingTrueFalseQuestion(null);
                  resetTrueFalseForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleEditTrueFalseQuestion} className="p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IconInfoCircle size={16} className="inline mr-1" />
                    Materi *
                  </label>
                  <select
                    name="sublesson_id"
                    value={trueFalseData.sublesson_id}
                    onChange={handleTrueFalseInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Pilih Materi</option>
                    {subLessons.map(subLesson => (
                      <option key={subLesson.id} value={subLesson.id}>
                        {subLesson.roadmap_levels?.title} - {subLesson.title}
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

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pertanyaan *
                </label>
                <textarea
                  name="question"
                  value={trueFalseData.question}
                  onChange={handleTrueFalseInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Masukkan pernyataan yang akan dinilai benar atau salah..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Jawaban yang Benar *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="correct_answer"
                      value="true"
                      checked={trueFalseData.correct_answer === true}
                      onChange={handleTrueFalseInputChange}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-800 font-medium">Benar</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="correct_answer"
                      value="false"
                      checked={trueFalseData.correct_answer === false}
                      onChange={handleTrueFalseInputChange}
                      className="mr-3 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-800 font-medium">Salah</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTrueFalseModal(false);
                    setEditingTrueFalseQuestion(null);
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
                  <IconEdit size={16} />
                  Update Soal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Toast Component */}
      <Toast />
    </div>
  );
};

export default QuestionManagement;
