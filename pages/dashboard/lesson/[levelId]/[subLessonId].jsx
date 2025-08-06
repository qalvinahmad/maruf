import { IconArrowLeft, IconFlag, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import QuizResultDialog from '../../../../components/dialog/QuizResultDialog';
import { Toast, showToast } from '../../../../components/ui/toast';
import { supabase } from '../../../../lib/supabaseClient';

export default function LessonPage() {
  const router = useRouter();
  const { levelId, subLessonId } = router.query;
  const [loading, setLoading] = useState(true);
  const [lessonData, setLessonData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [quizResults, setQuizResults] = useState({
    answers: [],
    score: 0,
    finalCorrectAnswers: 0,
    finalTotalQuestions: 0,
    totalTime: '0m 0s',
    timeInSeconds: 0
  });
  const [streak, setStreak] = useState(0);
  const [showStreakMessage, setShowStreakMessage] = useState(false);
  const [streakMessage, setStreakMessage] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // Additional states for different question types
  const [textAnswer, setTextAnswer] = useState('');
  const [dragDropAnswers, setDragDropAnswers] = useState({});
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceAnswer, setVoiceAnswer] = useState('');
  
  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!levelId || !subLessonId) return;

      try {
        showToast.info('Memuat pelajaran...');
        
        console.log('🎯 Starting lesson fetch - Level ID:', levelId, 'SubLesson ID:', subLessonId);
        console.log('🎯 Parameter types - Level ID type:', typeof levelId, 'SubLesson ID type:', typeof subLessonId);
        console.log('🎯 Parsed integers - Level ID:', parseInt(levelId), 'SubLesson ID:', parseInt(subLessonId));
        
        // First fetch lesson data
        const { data: lessonData, error: lessonError } = await supabase
          .from('roadmap_sub_lessons')
          .select(`
            *,
            roadmap_levels(title)
          `)
          .eq('id', parseInt(subLessonId))
          .single();

        console.log('📖 Lesson data result:', { lessonData, lessonError });

        if (lessonError) {
          console.error('Lesson error:', lessonError);
          showToast.error('Gagal memuat data pelajaran: ' + lessonError.message);
          throw lessonError;
        }

        // Then fetch questions with their options and types
        console.log('🔍 Fetching questions for SubLesson ID:', subLessonId);
        console.log('🔍 Query parameters:', { 
          subLessonId: subLessonId, 
          parsed: parseInt(subLessonId),
          type: typeof subLessonId 
        });
        
        // Try simplified query first to identify the issue
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            order_sequence,
            question_type_id,
            sublesson_id
          `)
          .eq('sublesson_id', parseInt(subLessonId))
          .order('order_sequence');

        console.log('📊 Questions query result:', { 
          questionsData, 
          questionsError, 
          count: questionsData?.length || 0,
          rawData: questionsData
        });

        if (questionsError) {
          console.error('Questions error:', questionsError);
          console.error('📋 Error details:', {
            code: questionsError.code,
            message: questionsError.message,
            details: questionsError.details,
            hint: questionsError.hint
          });
          showToast.error('Gagal memuat soal-soal: ' + questionsError.message);
          throw questionsError;
        }

        // If we got questions, enrich them with additional data
        let processedQuestions = [];
        if (questionsData && questionsData.length > 0) {
          console.log('✅ Found questions, enriching with additional data...');
          
          // Get question types
          const questionTypeIds = [...new Set(questionsData.map(q => q.question_type_id))];
          const { data: questionTypes } = await supabase
            .from('question_types')
            .select('id, type_key, label, description')
            .in('id', questionTypeIds);
          
          // Get question options for all questions
          const questionIds = questionsData.map(q => q.id);
          const { data: questionOptions } = await supabase
            .from('question_options')
            .select('id, question_id, option_text, is_correct')
            .in('question_id', questionIds);
          
          // Merge the data
          processedQuestions = questionsData.map(question => {
            const questionType = questionTypes?.find(qt => qt.id === question.question_type_id);
            const options = questionOptions?.filter(opt => opt.question_id === question.id) || [];
            
            return {
              ...question,
              question_types: questionType,
              question_options: options
            };
          });
          
          console.log('✅ Questions enriched successfully:', processedQuestions.length);
        }

        // Check if questions exist
        if (!processedQuestions || processedQuestions.length === 0) {
          console.warn('⚠️ No questions found for SubLesson ID:', subLessonId);
          console.log('🔧 Creating fallback voice input question for SubLesson ID:', subLessonId);
          
          // Create fallback voice input question
          const fallbackQuestion = {
            id: `fallback_${subLessonId}`,
            question_text: 'Ucapkan Alif',
            order_sequence: 1,
            question_type_id: 6, // voice_input type
            sublesson_id: parseInt(subLessonId),
            sentence_template: null,
            model: 'openai/whisper-tiny',
            question_types: {
              id: 6,
              type_key: 'voice_input',
              label: 'Voice Input',
              description: 'Voice recognition question'
            },
            question_options: [],
            voice_input_data: {
              expected_answer: 'Alif',
              instruction: 'Ucapkan kata berikut dengan benar:',
              model: 'openai/whisper-tiny',
              tolerance_level: 80
            },
            instruction: 'Ucapkan kata berikut dengan benar:',
            expected_answer: 'Alif',
            tolerance_level: 80
          };
          
          setLessonData(lessonData);
          setQuestions([fallbackQuestion]);
          setProgress(0);
          setLoading(false);
          
          // Start timer
          const startTimer = Date.now();
          setStartTime(startTimer);
          
          const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTimer) / 1000);
            setElapsedTime(elapsed);
          }, 1000);
          
          setTimerInterval(interval);
          
          showToast.success('1 soal fallback berhasil dimuat!');
          console.log('✅ Fallback question created:', fallbackQuestion);
          return;
        }

        // Process questions with additional data like drag and drop and fill in blank
        let finalQuestions = processedQuestions;

        // For fill in blank questions, fetch answers
        if (questionsData.some(q => q.question_types?.type_key === 'fill_in_blank')) {
          console.log('📝 Processing fill in blank questions...');
          
          const fillInBlankQuestionIds = questionsData
            .filter(q => q.question_types?.type_key === 'fill_in_blank')
            .map(q => q.id);
          
          // First try to fetch from fill_in_blank_questions table to get fill_in_blank_questions.id
          const { data: fillInBlankQuestions, error: fillInBlankQuestionsError } = await supabase
            .from('fill_in_blank_questions')
            .select('id, sentence_template')
            .in('sentence_template', questionsData
              .filter(q => q.question_types?.type_key === 'fill_in_blank')
              .map(q => q.sentence_template)
              .filter(Boolean)
            );

          console.log('📝 Fill in blank questions result:', { 
            fillInBlankQuestions, 
            fillInBlankQuestionsError, 
            count: fillInBlankQuestions?.length || 0 
          });

          let fillInBlankAnswers = [];
          if (!fillInBlankQuestionsError && fillInBlankQuestions && fillInBlankQuestions.length > 0) {
            // Now fetch answers using fill_in_blank_questions.id
            const { data: answers, error: answersError } = await supabase
              .from('fill_in_blank_answers')
              .select('*')
              .in('question_id', fillInBlankQuestions.map(q => q.id));

            if (!answersError && answers) {
              fillInBlankAnswers = answers;
              console.log('📝 Fill in blank answers result:', { 
                fillInBlankAnswers, 
                count: fillInBlankAnswers?.length || 0 
              });
            }
          }

          if (fillInBlankAnswers && fillInBlankAnswers.length > 0) {
            // Map answers to their questions using sentence_template as the link
            finalQuestions = processedQuestions.map((question) => {
              if (question.question_types?.type_key === 'fill_in_blank') {
                // Find matching fill_in_blank_questions by sentence_template
                const matchingFillBlankQuestion = fillInBlankQuestions?.find(
                  fq => fq.sentence_template === (question.sentence_template || question.question_text)
                );
                
                if (matchingFillBlankQuestion) {
                  // Find answers for this fill_in_blank_questions.id
                  const answers = fillInBlankAnswers.filter(a => a.question_id === matchingFillBlankQuestion.id);
                  
                  if (answers && answers.length > 0) {
                    return {
                      ...question,
                      sentence_template: question.sentence_template || question.question_text,
                      fill_in_blank_answers: answers
                    };
                  }
                }
              }
              return question;
            });
          } else {
            console.warn('⚠️ No fill in blank answers found or error occurred, using fallback data');
            
            // Enhanced fallback for fill in blank questions with proper structure
            const fallbackFillInBlankBySublesson = {
              1: [
                { question: 'Huruf _____ adalah huruf pertama dalam abjad Arab.', correct_answer: 'Alif' },
                { question: 'Huruf _____ memiliki bentuk seperti garis lurus vertikal.', correct_answer: 'Alif' },
                { question: 'Kata "بابا" (papa) dimulai dengan huruf _____.', correct_answer: 'Ba' }
              ],
              2: [
                { question: 'Huruf _____ memiliki titik di atasnya dan tertulis seperti "ث".', correct_answer: 'Tha' },
                { question: 'Huruf _____ memiliki bentuk melengkung dengan titik di bawahnya.', correct_answer: 'Jim' },
                { question: 'Kata "جميل" (indah) dimulai dengan huruf _____.', correct_answer: 'Jim' }
              ],
              3: [
                { question: 'Huruf _____ tertulis seperti "خ" dan memiliki bunyi "kh".', correct_answer: 'Khaa' },
                { question: 'Huruf _____ memiliki bentuk seperti setengah lingkaran.', correct_answer: 'Dal' },
                { question: 'Huruf _____ sama seperti Dal tetapi memiliki titik di atasnya.', correct_answer: 'Dzal' }
              ],
              4: [
                { question: 'Huruf _____ memiliki bentuk yang melengkung ke bawah.', correct_answer: 'Ra' },
                { question: 'Huruf _____ sama seperti Ra tetapi memiliki titik di atasnya.', correct_answer: 'Zay' },
                { question: 'Huruf _____ memiliki tiga gigi kecil di atasnya.', correct_answer: 'Sin' }
              ],
              5: [
                { question: 'Huruf _____ seperti Sin tetapi memiliki tiga titik di atasnya.', correct_answer: 'Syin' },
                { question: 'Huruf _____ adalah huruf tebal yang tertulis "ص".', correct_answer: 'Shad' },
                { question: 'Huruf _____ adalah huruf tebal yang tertulis "ض".', correct_answer: 'Dhad' }
              ],
              6: [
                { question: 'Huruf _____ adalah huruf tebal yang tertulis "ط".', correct_answer: 'Tha' },
                { question: 'Huruf _____ adalah huruf tebal yang tertulis "ظ".', correct_answer: 'Zhaa' },
                { question: 'Huruf _____ memiliki bentuk yang unik dan tertulis "ع".', correct_answer: 'Ain' }
              ],
              7: [
                { question: 'Huruf _____ seperti Ain tetapi memiliki titik di atasnya.', correct_answer: 'Ghain' },
                { question: 'Huruf _____ memiliki bentuk lingkaran dengan garis di atasnya.', correct_answer: 'Fa' },
                { question: 'Huruf _____ memiliki dua titik di atasnya dan tertulis "ق".', correct_answer: 'Qaf' }
              ],
              8: [
                { question: 'Huruf _____ memiliki bentuk seperti "ك" dan bunyi "k".', correct_answer: 'Kaf' },
                { question: 'Huruf _____ memiliki bentuk panjang ke atas seperti "ل".', correct_answer: 'Lam' },
                { question: 'Huruf _____ memiliki bentuk bulat dan tertulis "م".', correct_answer: 'Mim' }
              ],
              9: [
                { question: 'Huruf _____ memiliki titik di atasnya dan tertulis "ن".', correct_answer: 'Nun' },
                { question: 'Huruf _____ memiliki bentuk seperti "و" dan dapat menjadi vokal.', correct_answer: 'Waw' },
                { question: 'Huruf _____ di akhir kata tertulis "ة" yang disebut ta marbutah.', correct_answer: 'Ha' }
              ],
              10: [
                { question: 'Tanda _____ adalah tanda yang tertulis seperti "ء".', correct_answer: 'Hamzah' },
                { question: 'Huruf _____ memiliki dua titik di bawahnya dan tertulis "ي".', correct_answer: 'Ya' },
                { question: 'Alif _____ adalah alif yang tertulis seperti "ى".', correct_answer: 'Maqsurah' }
              ],
              11: [
                { question: 'Harakat _____ tertulis seperti garis miring di atas huruf.', correct_answer: 'Fathah' },
                { question: 'Harakat _____ tertulis seperti garis miring di bawah huruf.', correct_answer: 'Kasrah' },
                { question: 'Harakat _____ tertulis seperti huruf waw kecil di atas huruf.', correct_answer: 'Dhammah' }
              ],
              12: [
                { question: 'Tanda _____ menunjukkan bahwa huruf tidak berharakat.', correct_answer: 'Sukun' },
                { question: 'Tanda _____ menunjukkan bahwa huruf dibaca ganda.', correct_answer: 'Tasydid' },
                { question: 'Tanda _____ adalah nun sakinah yang ditambahkan di akhir kata.', correct_answer: 'Tanwin' }
              ],
              13: [
                { question: 'Kata "الله" dibaca _____ dan artinya Allah.', correct_answer: 'Allah' },
                { question: 'Kata "بِسْمِ" dibaca _____ dan artinya "dengan nama".', correct_answer: 'Bismi' },
                { question: 'Kata "الرَّحْمَن" dibaca _____ dan artinya "Yang Maha Pengasih".', correct_answer: 'Ar-Rahman' }
              ]
            };

            // Use sublesson-specific fallback data or default
            const currentSublesson = parseInt(subLessonId);
            const fallbackForSublesson = fallbackFillInBlankBySublesson[currentSublesson] || fallbackFillInBlankBySublesson[1];
            
            finalQuestions = processedQuestions.map((question) => {
              if (question.question_types?.type_key === 'fill_in_blank') {
                const fillInBlankQuestions = processedQuestions.filter(q => q.question_types?.type_key === 'fill_in_blank');
                const questionIndex = fillInBlankQuestions.findIndex(q => q.id === question.id);
                const templateIndex = questionIndex % fallbackForSublesson.length;
                const template = fallbackForSublesson[templateIndex];
                
                console.log(`📝 Using fallback fill in blank template ${templateIndex} for question ${question.id} in sublesson ${currentSublesson}`);
                
                return {
                  ...question,
                  sentence_template: template.question,
                  fill_in_blank_answers: [{
                    id: `fallback_${question.id}`,
                    question_id: question.id,
                    correct_answer: template.correct_answer,
                    alternative_answers: []
                  }]
                };
              }
              return question;
            });
          }
        }

        // For drag and drop questions, fetch choices and blanks
        if (processedQuestions.some(q => q.question_types?.type_key === 'drag_and_drop')) {
          console.log('🎯 Processing drag and drop questions...');
          
          const dragDropQuestions = processedQuestions.filter(q => q.question_types?.type_key === 'drag_and_drop');
          
          // Use fallback data for drag and drop questions
          const fallbackTemplates = [
            {
              instruction: 'Seret kata ke tempat kosong',
              sentence_template: 'Huruf Ba keluar dari ___',
              choices: ['mulut', 'hidung', 'telinga', 'mata'],
              correctAnswer: 'mulut'
            },
            {
              instruction: 'Seret kata ke tempat kosong',
              sentence_template: 'Huruf ___ berbentuk seperti perahu',
              choices: ['Jim', 'Ba', 'Ta', 'Alif'],
              correctAnswer: 'Jim'
            },
            {
              instruction: 'Seret kata ke tempat kosong',
              sentence_template: 'Bunyi huruf Ta adalah ___',
              choices: ['Ta', 'Ba', 'Ma', 'Na'],
              correctAnswer: 'Ta'
            },
            {
              instruction: 'Seret kata ke tempat kosong',
              sentence_template: 'Huruf ___ memiliki titik di bawah',
              choices: ['Jim', 'Ba', 'Ya', 'Ta'],
              correctAnswer: 'Jim'
            },
            {
              instruction: 'Seret kata ke tempat kosong',
              sentence_template: 'Bunyi huruf ___ adalah Ma',
              choices: ['Mim', 'Ba', 'Ta', 'Na'],
              correctAnswer: 'Mim'
            }
          ];
          
          finalQuestions = processedQuestions.map((question) => {
            if (question.question_types?.type_key === 'drag_and_drop') {
              const dragDropIndex = dragDropQuestions.findIndex(q => q.id === question.id);
              const templateIndex = dragDropIndex % fallbackTemplates.length;
              const template = fallbackTemplates[templateIndex];
              
              console.log(`🎯 Using template ${templateIndex} for question ${question.id}`);
              
              const choices = template.choices.map((choice, index) => ({
                id: `choice_${question.id}_${index}`,
                question_id: question.id,
                choice_text: choice
              }));
              
              const blanks = [{
                id: `blank_${question.id}`,
                question_id: question.id,
                blank_index: 1,
                correct_answer: template.correctAnswer
              }];
              
              return {
                ...question,
                instruction: template.instruction,
                sentence_template: template.sentence_template,
                drag_drop_choices: choices,
                drag_drop_blanks: blanks,
                drag_drop_answers: blanks
              };
            }
            return question;
          });
        }

        // Process voice input questions - fetch data from voice_input_questions table
        if (processedQuestions.some(q => q.question_types?.type_key === 'voice_input')) {
          console.log('🎤 Processing voice input questions...');
          
          const voiceInputQuestions = processedQuestions.filter(q => q.question_types?.type_key === 'voice_input');
          console.log('🎤 Voice input questions found:', voiceInputQuestions.map(q => ({ id: q.id, text: q.question_text })));
          
          // Fetch ALL voice input data from the specialized table
          const { data: voiceInputData, error: voiceInputError } = await supabase
            .from('voice_input_questions')
            .select('*')
            .order('created_at', { ascending: false });

          console.log('🎤 Voice input data result:', { 
            voiceInputData, 
            voiceInputError, 
            count: voiceInputData?.length || 0 
          });

          if (!voiceInputError && voiceInputData && voiceInputData.length > 0) {
            // Map voice input data to questions with enhanced matching
            finalQuestions = finalQuestions.map((question) => {
              if (question.question_types?.type_key === 'voice_input') {
                console.log(`🔍 Looking for voice data for question: "${question.question_text}"`);
                
                // Try multiple matching strategies
                let voiceData = null;
                
                // Strategy 1: Exact match
                voiceData = voiceInputData.find(vd => vd.question_text === question.question_text);
                if (voiceData) {
                  console.log(`✅ Found exact match for "${question.question_text}"`);
                } else {
                  // Strategy 2: Case insensitive match
                  voiceData = voiceInputData.find(vd => 
                    vd.question_text?.toLowerCase() === question.question_text?.toLowerCase()
                  );
                  if (voiceData) {
                    console.log(`✅ Found case insensitive match for "${question.question_text}"`);
                  } else {
                    // Strategy 3: Contains match
                    voiceData = voiceInputData.find(vd => 
                      vd.question_text?.toLowerCase().includes(question.question_text?.toLowerCase()) ||
                      question.question_text?.toLowerCase().includes(vd.question_text?.toLowerCase())
                    );
                    if (voiceData) {
                      console.log(`✅ Found contains match for "${question.question_text}"`);
                    } else {
                      // Strategy 4: Use the most recent voice input data as fallback
                      voiceData = voiceInputData[0];
                      console.log(`⚠️ Using fallback (most recent) voice data for "${question.question_text}"`);
                    }
                  }
                }
                
                if (voiceData) {
                  console.log(`🎤 Found voice data for question "${question.question_text}":`, voiceData);
                  return {
                    ...question,
                    voice_input_data: voiceData,
                    instruction: voiceData.instruction,
                    expected_answer: voiceData.expected_answer,
                    model: voiceData.model || 'openai/whisper-base',
                    tolerance_level: voiceData.tolerance_level || 80
                  };
                } else {
                  console.warn(`⚠️ No voice data found for question: "${question.question_text}"`);
                }
              }
              return question;
            });
          } else {
            console.warn('⚠️ No voice input data found or error occurred:', voiceInputError);
            
            // Add fallback voice data if database is empty
            finalQuestions = finalQuestions.map((question) => {
              if (question.question_types?.type_key === 'voice_input') {
                console.log(`🔧 Adding fallback voice data for: "${question.question_text}"`);
                return {
                  ...question,
                  voice_input_data: {
                    expected_answer: 'Alif',
                    instruction: 'Ucapkan kata berikut dengan benar:',
                    model: 'facebook/wav2vec2-large-xlsr-53-arabic',
                    tolerance_level: 80
                  },
                  instruction: 'Ucapkan kata berikut dengan benar:',
                  expected_answer: 'Alif',
                  model: 'facebook/wav2vec2-large-xlsr-53-arabic',
                  tolerance_level: 80
                };
              }
              return question;
            });
          }
        }

        // Randomize questions order
        const shuffledQuestions = [...finalQuestions].sort(() => Math.random() - 0.5);
        
        // Randomize options within each question
        const questionsWithShuffledOptions = shuffledQuestions.map(question => ({
          ...question,
          question_options: question.question_options ? [...question.question_options].sort(() => Math.random() - 0.5) : []
        }));

        setLessonData(lessonData);
        setQuestions(questionsWithShuffledOptions);
        setProgress(0);
        setLoading(false);
        
        // Start timer
        const startTimer = Date.now();
        setStartTime(startTimer);
        
        const interval = setInterval(() => {
          const now = Date.now();
          const elapsed = Math.floor((now - startTimer) / 1000);
          setElapsedTime(elapsed);
        }, 1000);
        
        setTimerInterval(interval);
        
        showToast.success(`${questionsWithShuffledOptions.length} soal berhasil dimuat!`);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast.error('Terjadi kesalahan saat memuat pelajaran');
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [levelId, subLessonId]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setTextAnswer('');
    setDragDropAnswers({});
    setSelectedChoices([]);
    setVoiceAnswer('');
    setShowResult(false);
  };

  // Render question components
  const renderQuestionComponent = () => {
    const currentQuestionData = questions[currentQuestion];
    const questionType = currentQuestionData?.question_types?.type_key || 'multiple_choice';
    
    console.log('🎨 Rendering question type:', questionType, 'for question:', currentQuestionData?.id);

    switch (questionType) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'true_false':
        return renderTrueFalse();
      case 'short_answer':
        return renderShortAnswer();
      case 'fill_in_blank':
        return renderFillInBlank();
      case 'drag_and_drop':
        return renderDragAndDrop();
      case 'voice_input':
        return renderVoiceInput();
      default:
        return renderMultipleChoice();
    }
  };

  const renderMultipleChoice = () => {
    const currentQuestionData = questions[currentQuestion];
    
    if (!currentQuestionData?.question_options || currentQuestionData.question_options.length === 0) {
      return (
        <div className="text-red-500 p-4 border border-red-200 rounded-lg">
          Tidak ada pilihan jawaban tersedia untuk soal ini.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {currentQuestionData.question_options.map((option) => (
          <div key={option.id} className="relative">
            <motion.button
              onClick={() => handleAnswerSelect(option.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedAnswer === option.id
                  ? 'border-secondary bg-secondary/5'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                showResult && option.is_correct
                  ? 'border-green-500 bg-green-50'
                  : showResult && selectedAnswer === option.id && !option.is_correct
                  ? 'border-red-500 bg-red-50'
                  : ''
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={showResult}
            >
              {option.option_text}
            </motion.button>
          </div>
        ))}
      </div>
    );
  };

  const renderTrueFalse = () => {
    const currentQuestionData = questions[currentQuestion];
    
    return (
      <div className="space-y-3">
        <motion.button
          onClick={() => setSelectedAnswer('true')}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            selectedAnswer === 'true'
              ? 'border-secondary bg-secondary/5'
              : 'border-gray-200 hover:border-gray-300'
          } ${
            showResult && currentQuestionData.question_options?.find(opt => opt.is_correct)?.option_text?.toLowerCase() === 'true'
              ? 'border-green-500 bg-green-50'
              : showResult && selectedAnswer === 'true' && currentQuestionData.question_options?.find(opt => opt.is_correct)?.option_text?.toLowerCase() !== 'true'
              ? 'border-red-500 bg-red-50'
              : ''
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={showResult}
        >
          ✅ Benar (True)
        </motion.button>
        
        <motion.button
          onClick={() => setSelectedAnswer('false')}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            selectedAnswer === 'false'
              ? 'border-secondary bg-secondary/5'
              : 'border-gray-200 hover:border-gray-300'
          } ${
            showResult && currentQuestionData.question_options?.find(opt => opt.is_correct)?.option_text?.toLowerCase() === 'false'
              ? 'border-green-500 bg-green-50'
              : showResult && selectedAnswer === 'false' && currentQuestionData.question_options?.find(opt => opt.is_correct)?.option_text?.toLowerCase() !== 'false'
              ? 'border-red-500 bg-red-50'
              : ''
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={showResult}
        >
          ❌ Salah (False)
        </motion.button>
      </div>
    );
  };

  const renderShortAnswer = () => {
    const currentQuestionData = questions[currentQuestion];
    const correctAnswer = currentQuestionData.question_options?.find(opt => opt.is_correct)?.option_text;
    
    return (
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Ketik jawaban Anda di sini..."
            className={`w-full p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-secondary transition-all ${
              showResult 
                ? textAnswer.trim().toLowerCase() === correctAnswer?.toLowerCase()
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-200 focus:border-secondary'
            }`}
            rows={3}
            disabled={showResult}
          />
          
          {showResult && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800">
                Jawaban yang benar: {correctAnswer}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFillInBlank = () => {
    const currentQuestionData = questions[currentQuestion];
    const template = currentQuestionData.sentence_template || currentQuestionData.question_text;
    const correctAnswer = currentQuestionData.fill_in_blank_answers?.[0]?.correct_answer;
    
    return (
      <div className="space-y-4">
        <div className="text-lg text-gray-800 leading-relaxed">
          {template.split('___').map((part, index, array) => (
            <span key={index}>
              {part}
              {index < array.length - 1 && (
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  className={`inline-block mx-2 px-2 py-1 border-b-2 focus:outline-none min-w-[120px] ${
                    showResult 
                      ? textAnswer.trim().toLowerCase() === correctAnswer?.toLowerCase()
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-400 focus:border-secondary'
                  }`}
                  placeholder="..."
                  disabled={showResult}
                />
              )}
            </span>
          ))}
        </div>
        
        {showResult && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              Jawaban yang benar: {correctAnswer}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDragAndDrop = () => {
    const currentQuestionData = questions[currentQuestion];
    const template = currentQuestionData.sentence_template || currentQuestionData.question_text;
    const choices = currentQuestionData.drag_drop_choices || [];
    const correctAnswer = currentQuestionData.drag_drop_blanks?.[0]?.correct_answer;
    
    // Handle drag events with improved responsiveness
    const handleDragStart = (e, choiceText) => {
      e.dataTransfer.setData('text/plain', choiceText);
      e.dataTransfer.effectAllowed = 'move';
      // Add visual feedback
      setTimeout(() => {
        e.target.style.opacity = '0.5';
      }, 0);
    };

    const handleDragEnd = (e) => {
      e.target.style.opacity = '1';
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
      e.preventDefault();
      if (showResult) return;
      
      const choiceText = e.dataTransfer.getData('text/plain');
      if (choiceText && !selectedChoices.includes(choiceText)) {
        setSelectedChoices([choiceText]);
      }
    };

    const handleChoiceClick = (choiceText) => {
      if (!showResult && !selectedChoices.includes(choiceText)) {
        setSelectedChoices([choiceText]);
      }
    };
    
    // Check if choices are available
    if (!choices || choices.length === 0) {
      return (
        <div className="space-y-4">
          <div className="text-orange-600 p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="font-medium mb-2">⚠️ Data drag and drop tidak tersedia</div>
            <div className="text-sm">
              Soal ini mungkin memerlukan konfigurasi tambahan di database.
            </div>
          </div>
          
          {/* Fallback: Show as text input */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-800 font-medium mb-2">
              Mode Fallback: Jawab dengan mengetik
            </div>
            <div className="text-lg text-gray-800 leading-relaxed">
              {template.split('___').map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <input
                      type="text"
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      className="inline-block mx-2 px-2 py-1 border-b-2 focus:outline-none min-w-[120px] border-gray-400 focus:border-secondary"
                      placeholder="ketik jawaban..."
                      disabled={showResult}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Instruction */}
        {currentQuestionData.instruction && (
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-800 font-medium">{currentQuestionData.instruction}</div>
          </div>
        )}
        
        
        {/* Sentence with drop zone */}
        <div className="text-center">
          <div className="text-xl text-gray-800 leading-relaxed mb-6">
            {template.split('___').map((part, index, array) => (
              <span key={index}>
                {part}
                {index < array.length - 1 && (
                  <div 
                    className={`inline-block mx-2 px-4 py-3 min-w-[180px] min-h-[50px] border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-200 ${
                      selectedChoices.length > 0
                        ? 'border-secondary bg-secondary/10 text-secondary font-medium shadow-sm'
                        : 'border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400 hover:bg-gray-100'
                    } ${
                      showResult
                        ? selectedChoices[0] === correctAnswer
                          ? 'border-green-500 bg-green-50 text-green-800 shadow-green-200'
                          : 'border-red-500 bg-red-50 text-red-800 shadow-red-200'
                        : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{ 
                      boxShadow: showResult ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {selectedChoices[0] || (
                      <span className="flex items-center gap-2">
                        <span className="text-lg">📥</span>
                        <span>Seret jawaban ke sini</span>
                      </span>
                    )}
                  </div>
                )}
              </span>
            ))}
          </div>
        </div>
        
        {/* Draggable choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {choices.map((choice, index) => {
            const isSelected = selectedChoices.includes(choice.choice_text);
            const isCorrect = showResult && choice.choice_text === correctAnswer;
            const isWrong = showResult && isSelected && choice.choice_text !== correctAnswer;
            
            return (
              <motion.div
                key={choice.id || index}
                draggable={!showResult && !isSelected}
                onDragStart={(e) => handleDragStart(e, choice.choice_text)}
                onDragEnd={handleDragEnd}
                onClick={() => handleChoiceClick(choice.choice_text)}
                className={`p-4 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? 'border-secondary bg-secondary text-white shadow-lg transform scale-95 opacity-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                } ${
                  isCorrect
                    ? 'border-green-500 bg-green-500 text-white shadow-green-200'
                    : isWrong
                    ? 'border-red-500 bg-red-500 text-white shadow-red-200'
                    : ''
                } ${
                  !showResult && !isSelected ? 'hover:scale-105 active:scale-95' : ''
                }`}
                whileHover={!showResult && !isSelected ? { scale: 1.05 } : {}}
                whileTap={!showResult && !isSelected ? { scale: 0.95 } : {}}
                style={{ 
                  userSelect: 'none',
                  boxShadow: showResult ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  {!showResult && !isSelected && (
                    <span className="text-lg">✋</span>
                  )}
                  <span className="font-medium">{choice.choice_text}</span>
                  {isSelected && !showResult && (
                    <span className="text-lg">✓</span>
                  )}
                  {isCorrect && (
                    <span className="text-lg">✅</span>
                  )}
                  {isWrong && (
                    <span className="text-lg">❌</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Clear selection button */}
        {selectedChoices.length > 0 && !showResult && (
          <div className="text-center">
            <button
              onClick={() => setSelectedChoices([])}
              className="text-sm text-gray-500 hover:text-gray-700 underline bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              🔄 Bersihkan pilihan
            </button>
          </div>
        )}
        
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm"
          >
            <div className="text-center">
              <div className="text-sm font-medium text-blue-800 mb-2">
                💡 Jawaban yang benar: <span className="font-bold">{correctAnswer}</span>
              </div>
              {selectedChoices[0] === correctAnswer ? (
                <div className="text-green-700 font-medium">🎉 Selamat! Jawaban Anda benar!</div>
              ) : (
                <div className="text-red-700">
                  ❌ Jawaban Anda: <span className="font-medium">{selectedChoices[0] || 'Tidak ada'}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderVoiceInput = () => {
    const currentQuestionData = questions[currentQuestion];
    
    // Get target text from multiple sources with proper fallback
    let targetText = 'Target tidak tersedia';
    let instruction = 'Ucapkan kata berikut dengan benar:';
    
    // Priority 1: Check voice_input_data from specialized table
    if (currentQuestionData.voice_input_data?.expected_answer) {
      targetText = currentQuestionData.voice_input_data.expected_answer;
      instruction = currentQuestionData.voice_input_data.instruction || instruction;
    }
    // Priority 2: Check direct properties  
    else if (currentQuestionData.expected_answer) {
      targetText = currentQuestionData.expected_answer;
      instruction = currentQuestionData.instruction || instruction;
    }
    // Priority 3: Fallback to question_options
    else if (currentQuestionData.question_options?.length > 0) {
      const correctOption = currentQuestionData.question_options.find(opt => opt.is_correct);
      if (correctOption?.option_text) {
        targetText = correctOption.option_text;
      }
    }
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-lg text-gray-800 mb-4">
            {instruction}
          </div>
          <div className="text-2xl font-bold text-secondary mb-4">
            {targetText}
          </div>
          
          <motion.button
            onClick={() => handleVoiceRecording()}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-secondary text-white hover:bg-secondary-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={showResult}
          >
            {isRecording ? ' Merekam... (Max 5 detik)' : ' Mulai Rekam Suara'}
          </motion.button>
          
          {/* Add instruction text for better UX */}
          <div className="text-sm text-gray-600 mt-2 text-center">
            {isRecording ? (
              <span className="text-red-600 font-medium">🎙️ Sedang merekam... ucapkan dengan jelas!</span>
            ) : (
              <span>
                {voiceAnswer ? 
                  'Rekam ulang jika perlu, atau klik Submit untuk melanjutkan' : 
                  'Tekan tombol untuk merekam suara Anda'
                }
              </span>
            )}
          </div>
          
          {/* Clear voice answer button */}
          {voiceAnswer && !showResult && (
            <div className="mt-3">
              <button
                onClick={() => setVoiceAnswer('')}
                className="text-sm text-gray-500 hover:text-gray-700 underline bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                🔄 Hapus dan rekam ulang
              </button>
            </div>
          )}
          
          {voiceAnswer && (
            <div className={`mt-4 p-3 border rounded-lg ${
              voiceAnswer.includes('Gagal') || voiceAnswer.includes('gagal') || voiceAnswer.includes('Error') || voiceAnswer.includes('error')
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="text-sm font-medium text-gray-700 mb-1">
                {voiceAnswer.includes('Gagal') || voiceAnswer.includes('gagal') || voiceAnswer.includes('Error') || voiceAnswer.includes('error')
                  ? '❌ Status:'
                  : '✅ Hasil Analisis:'
                }
              </div>
              <div className={`${
                voiceAnswer.includes('Gagal') || voiceAnswer.includes('gagal') || voiceAnswer.includes('Error') || voiceAnswer.includes('error')
                  ? 'text-red-600'
                  : 'text-green-700'
              }`}>
                {voiceAnswer}
              </div>
              {!voiceAnswer.includes('Gagal') && !voiceAnswer.includes('gagal') && !voiceAnswer.includes('Error') && !voiceAnswer.includes('error') && (
                <div className="text-xs text-gray-500 mt-1">
                  ✓ Audio berhasil diproses dan siap untuk dinilai
                </div>
              )}
            </div>
          )}
          
          {showResult && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800">
                Target ucapan: {targetText}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Voice recording handler with Web Speech API priority
  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (window.mediaRecorder && window.mediaRecorder.state === 'recording') {
        window.mediaRecorder.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(true);
      
      // Clear any previous voice answer
      setVoiceAnswer('');
      
      // Get target text for comparison
      const currentQuestionData = questions[currentQuestion];
      let targetText = '';
      
      if (currentQuestionData.voice_input_data?.expected_answer) {
        targetText = currentQuestionData.voice_input_data.expected_answer;
      } else if (currentQuestionData.expected_answer) {
        targetText = currentQuestionData.expected_answer;
      } else if (currentQuestionData.question_options?.length > 0) {
        const correctOption = currentQuestionData.question_options.find(opt => opt.is_correct);
        targetText = correctOption?.option_text || '';
      }
      
      // Try Web Speech API first if available
      console.log('🎤🔍 Checking Web Speech API availability...');
      console.log('🎤🔍 webkitSpeechRecognition in window:', 'webkitSpeechRecognition' in window);
      console.log('🎤🔍 SpeechRecognition in window:', 'SpeechRecognition' in window);
      console.log('🎤🔍 User Agent:', navigator.userAgent);
      console.log('🎤🔍 Protocol:', window.location.protocol);
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('🎤🌐 Web Speech API available - using for direct recording...');
        showToast.info('🎤 Menggunakan Web Speech API...');
        
        try {
          console.log('🎤🌐 About to call tryWebSpeechAPI...');
          const webSpeechResult = await tryWebSpeechAPI();
          console.log('🎤🌐 Web Speech API result:', webSpeechResult);
          
          setIsRecording(false);
          
          if (webSpeechResult.success) {
            console.log('🎤✅ Web Speech API success:', webSpeechResult.text);
            
            // Try to match the result with target text using flexible matching
            const matchResult = matchVoiceResult(webSpeechResult.text, targetText);
            if (matchResult.isMatch) {
              console.log('🎤✅ Voice match found:', matchResult);
              setVoiceAnswer(webSpeechResult.text);
              showToast.success(`✅ Suara dikenali: "${webSpeechResult.text}"`);
              return;
            } else {
              console.log('🎤⚠️ Voice recognized but no match:', matchResult);
              setVoiceAnswer(webSpeechResult.text);
              showToast.warning(`⚠️ Suara dikenali: "${webSpeechResult.text}" - Periksa pengucapan`);
              return;
            }
          } else {
            console.log('🎤⚠️ Web Speech API failed:', webSpeechResult.error, '- falling back to recording...');
            showToast.info('Web Speech API gagal, menggunakan rekaman audio...');
          }
        } catch (error) {
          console.error('🎤❌ Web Speech API error:', error);
          showToast.info('Web Speech API error, menggunakan rekaman audio...');
        }
      } else {
        console.log('🎤⚠️ Web Speech API not available, using audio recording...');
        showToast.info('Menggunakan rekaman audio untuk pengenalan suara...');
      }
      
      // Fallback to audio recording if Web Speech API failed or unavailable
      console.log('🎤🎙️ Starting audio recording as fallback...');
      
      // Get microphone access for recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      window.mediaRecorder = mediaRecorder;
      
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Validate audio size - ensure it's not just silence
        const minAudioSize = 1000; // Minimum 1KB for meaningful audio
        console.log('🎤 Audio blob size:', audioBlob.size);
        
        if (audioBlob.size < minAudioSize) {
          console.log('🎤❌ Audio too small, likely silence');
          showToast.error('Audio terlalu pendek atau tidak terdeteksi. Silakan coba lagi dengan berbicara lebih jelas.');
          setVoiceAnswer(''); // Keep it empty
          return;
        }
        
        // Process with selected model
        await processVoiceInput(audioBlob);
      };
      
      mediaRecorder.start();
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      setVoiceAnswer(''); // Clear any answer
      showToast.error('Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin.');
    }
  };

  // Process voice input with working models and Web Speech API fallback
  const processVoiceInput = async (audioBlob) => {
    try {
      const currentQuestionData = questions[currentQuestion];
      
      // Get target text from voice input data with proper fallback
      let targetText = '';
      
      // Priority 1: Check voice_input_data from specialized table
      if (currentQuestionData.voice_input_data?.expected_answer) {
        targetText = currentQuestionData.voice_input_data.expected_answer;
        console.log('🎤 Processing with voice_input_data:', { targetText });
      }
      // Priority 2: Check direct properties  
      else if (currentQuestionData.expected_answer) {
        targetText = currentQuestionData.expected_answer;
        console.log('🎤 Processing with direct properties:', { targetText });
      }
      // Priority 3: Fallback to question_options
      else {
        const correctOption = currentQuestionData.question_options?.find(opt => opt.is_correct);
        targetText = correctOption?.option_text || '';
        console.log('🎤 Processing with question_options fallback:', targetText);
      }
      
      // Validate that we have a target text
      if (!targetText || targetText.trim().length === 0) {
        console.log('🎤❌ No target text available');
        setVoiceAnswer('');
        showToast.error('Target jawaban tidak tersedia untuk soal ini.');
        return;
      }

      // First try Web Speech API if available (more reliable)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('🎤🌐 Web Speech API available - trying first...');
        console.log('🎤🌐 Browser support:', {
          webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
          SpeechRecognition: 'SpeechRecognition' in window,
          userAgent: navigator.userAgent
        });
        
        try {
          const webSpeechResult = await tryWebSpeechAPI();
          console.log('🎤🌐 Web Speech API result:', webSpeechResult);
          
          if (webSpeechResult.success) {
            console.log('🎤✅ Web Speech API success:', webSpeechResult.text);
            
            // Try to match the result with target text using flexible matching
            const matchResult = matchVoiceResult(webSpeechResult.text, targetText);
            if (matchResult.isMatch) {
              console.log('🎤✅ Voice match found:', matchResult);
              setVoiceAnswer(webSpeechResult.text);
              showToast.success(`✅ Suara dikenali: "${webSpeechResult.text}"`);
              return;
            } else {
              console.log('🎤⚠️ Voice recognized but no match:', matchResult);
              setVoiceAnswer(webSpeechResult.text);
              showToast.warning(`⚠️ Suara dikenali: "${webSpeechResult.text}" - Periksa pengucapan`);
              return;
            }
          } else {
            console.log('🎤⚠️ Web Speech API failed:', webSpeechResult.error, 'trying server-side API...');
          }
        } catch (error) {
          console.error('🎤❌ Web Speech API error:', error);
        }
      } else {
        console.log('🎤⚠️ Web Speech API not available, using server-side API...');
      }
      
      // Fallback to server-side API with working models
      console.log('🎤📡 Using server-side API with working models...');
      
      showToast.info('Memproses audio dengan model pengenalan suara...');
      
      // Prepare form data for API
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('model', 'facebook/wav2vec2-large-960h'); // Use working model
      formData.append('target_text', targetText);
      
      // Call the voice recognition API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/api/voice-recognition', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('🎤📡 API Response status:', response.status);
      
      if (!response.ok) {
        console.log('🎤❌ API Response not OK:', response.status, response.statusText);
        setVoiceAnswer('');
        showToast.error(`API error: ${response.status}. Silakan coba lagi atau gunakan Web Speech API.`);
        return;
      }
      
      let result;
      try {
        result = await response.json();
        console.log('🎤📡 API Response data:', result);
      } catch (parseError) {
        console.error('🎤❌ Failed to parse API response:', parseError);
        setVoiceAnswer('');
        showToast.error('Gagal memproses respons server. Silakan coba lagi.');
        return;
      }
      
      if (result.success && result.transcription) {
        // Validate the transcription is meaningful (not empty or too short)
        const transcription = result.transcription.trim();
        
        if (transcription.length === 0) {
          console.log('🎤❌ Empty transcription received');
          setVoiceAnswer('');
          showToast.error('Tidak ada suara yang terdeteksi. Silakan coba lagi.');
          return;
        }
        
        if (transcription.length < 2) {
          console.log('🎤❌ Transcription too short:', transcription);
          setVoiceAnswer('');
          showToast.error('Audio terlalu pendek atau tidak jelas. Silakan coba lagi.');
          return;
        }
        
        console.log('🎤✅ Server-side Voice Recognition SUCCESS - Setting answer to:', transcription);
        setVoiceAnswer(transcription);
        
        if (result.processed) {
          showToast.success(`✅ Audio berhasil diproses! Terdeteksi: "${transcription}" (${result.similarity}% akurasi)`);
        } else if (result.fallback) {
          showToast.success(`✅ Audio berhasil direkam! Jawaban: "${transcription}"`);
        } else {
          showToast.success(`✅ Audio diproses: "${transcription}"`);
        }
      } else if (result.silenceDetected) {
        // Handle silence detection specifically
        console.log('🎤🔇 Silence detected in audio');
        setVoiceAnswer('');
        showToast.error('Tidak ada suara yang terdeteksi. Pastikan Anda berbicara dengan jelas.');
        return;
      } else {
        // Handle API failure gracefully without throwing error
        console.log('🎤❌ Voice Recognition API returned failure:', result);
        setVoiceAnswer('');
        
        // Use the error message from the API response if available
        let errorMessage = result.error || result.details || 'Gagal mengenali suara. Silakan coba lagi.';
        
        // Provide specific error messages for configuration issues
        if (result.debugInfo?.apiKeyPresent === false) {
          errorMessage = '⚠️ Konfigurasi API tidak lengkap. Hubungi administrator.';
        } else if (result.error === 'Authentication failed - invalid API key') {
          errorMessage = '⚠️ Kunci API tidak valid. Hubungi administrator.';
        } else if (result.error === 'Missing API key configuration') {
          errorMessage = '⚠️ Konfigurasi API tidak ditemukan. Hubungi administrator.';
        } else if (result.error === 'Speech recognition failed') {
          errorMessage = '❌ Semua model pengenalan suara gagal. Silakan coba lagi atau hubungi administrator.';
        }
        
        showToast.error(errorMessage);
        return;
      }
      
    } catch (error) {
      console.error('❌ Error processing voice input:', error);
      
      // Clear any previous voice answer and show appropriate error message
      console.log('🎤❌ Voice Recognition FAILED - Clearing voice answer');
      setVoiceAnswer("");
      
      // Provide specific error messages based on error type
      if (error.name === 'AbortError') {
        showToast.error('❌ Pemrosesan audio timeout. Silakan coba lagi.');
      } else if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        showToast.error('❌ Koneksi bermasalah. Periksa internet Anda dan coba lagi.');
      } else if (error.message.includes('API error')) {
        showToast.error('❌ Server sedang bermasalah. Silakan coba lagi dalam beberapa saat.');
      } else if (error.message.includes('Speech recognition failed')) {
        showToast.error('❌ Gagal mengenali suara. Pastikan Anda berbicara dengan jelas.');
      } else {
        showToast.error('❌ Gagal memproses audio. Silakan coba lagi dengan merekam ulang.');
      }
    }
  };

  // Match voice result with target text using flexible matching
  const matchVoiceResult = (recognizedText, targetText) => {
    if (!recognizedText || !targetText) {
      return { isMatch: false, similarity: 0, reason: 'Empty input' };
    }

    const recognized = recognizedText.toLowerCase().trim();
    const target = targetText.toLowerCase().trim();

    // Direct match
    if (recognized === target) {
      return { isMatch: true, similarity: 1.0, method: 'exact_match' };
    }

    // Calculate similarity
    const similarity = calculateStringSimilarity(recognized, target);
    
    // High similarity threshold
    if (similarity >= 0.8) {
      return { isMatch: true, similarity, method: 'similarity_match' };
    }

    // Try common Arabic-to-Latin transliterations for قَالَ
    const arabicTransliterations = {
      'قَالَ': ['qala', 'qaala', 'gala', 'gaala', 'kala', 'kaala'],
      'بَابَ': ['baba', 'baaba', 'bab', 'baab'],
      'أَلِف': ['alif', 'aleef', 'alef']
    };

    // Check if target is Arabic and try transliterations
    const transliterations = arabicTransliterations[targetText] || [];
    for (const transliteration of transliterations) {
      const translit_similarity = calculateStringSimilarity(recognized, transliteration);
      if (translit_similarity >= 0.7) {
        return { 
          isMatch: true, 
          similarity: translit_similarity, 
          method: 'transliteration_match',
          transliteration: transliteration
        };
      }
    }

    return { 
      isMatch: false, 
      similarity, 
      reason: 'Low similarity',
      threshold: 0.8
    };
  };

  // Web Speech API implementation for client-side speech recognition
  const tryWebSpeechAPI = () => {
    return new Promise(async (resolve) => {
      console.log('🎤🌐 tryWebSpeechAPI called');
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        console.log('🎤🌐 SpeechRecognition constructor:', SpeechRecognition);
        
        if (!SpeechRecognition) {
          console.log('🎤❌ SpeechRecognition constructor not found');
          resolve({ success: false, error: 'SpeechRecognition not available' });
          return;
        }
        
        // Try Arabic first, then fallback to English for transliteration
        const languages = ['ar-SA', 'en-US'];
        console.log('🎤🌐 Will try languages:', languages);
        
        for (const lang of languages) {
          console.log(`🎤🌐 Trying Web Speech API with language: ${lang}`);
          
          const result = await tryRecognitionWithLanguage(SpeechRecognition, lang);
          if (result.success) {
            console.log(`🎤✅ Web Speech API success with ${lang}:`, result.text);
            resolve(result);
            return;
          } else {
            console.log(`🎤⚠️ Web Speech API failed with ${lang}:`, result.error);
          }
        }
        
        // All languages failed
        resolve({ success: false, error: 'All language attempts failed' });
        
      } catch (error) {
        console.error('🎤❌ Web Speech API setup error:', error);
        resolve({ success: false, error: error.message });
      }
    });
  };

  // Helper function to try recognition with a specific language
  const tryRecognitionWithLanguage = (SpeechRecognition, language) => {
    return new Promise((resolve) => {
      console.log(`🎤🌐 tryRecognitionWithLanguage called with: ${language}`);
      try {
        const recognition = new SpeechRecognition();
        console.log(`🎤🌐 Created recognition instance for ${language}`);
        
        // Use the provided language for recognition
        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3; // Get multiple alternatives for better matching
        
        console.log(`🎤🌐 Configured recognition for ${language}:`, {
          lang: recognition.lang,
          continuous: recognition.continuous,
          interimResults: recognition.interimResults,
          maxAlternatives: recognition.maxAlternatives
        });
        
        let hasResult = false;
        
        recognition.onresult = (event) => {
          if (hasResult) return; // Prevent multiple results
          hasResult = true;
          
          // Get the best result from alternatives
          const results = event.results[0];
          let bestTranscript = '';
          let bestConfidence = 0;
          
          for (let i = 0; i < results.length; i++) {
            const alternative = results[i];
            console.log(`🎤🌐 Web Speech alternative ${i}:`, alternative.transcript, 'confidence:', alternative.confidence);
            
            if (alternative.confidence > bestConfidence) {
              bestConfidence = alternative.confidence;
              bestTranscript = alternative.transcript;
            }
          }
          
          console.log('🎤🌐 Web Speech API best result:', bestTranscript, 'confidence:', bestConfidence);
          resolve({ success: true, text: bestTranscript.trim(), confidence: bestConfidence });
        };
        
        recognition.onerror = (event) => {
          if (hasResult) return; // Ignore errors after success
          
          console.error(`🎤❌ Web Speech API error for ${language}:`, event.error, event);
          resolve({ success: false, error: event.error });
        };
        
        recognition.onend = () => {
          console.log(`🎤🔚 Recognition ended for ${language}, hasResult:`, hasResult);
          if (!hasResult) {
            resolve({ success: false, error: 'No speech detected' });
          }
        };
        
        // Start recognition
        console.log(`🎤🌐 Starting recognition for ${language}...`);
        recognition.start();
        
        // Timeout after 8 seconds
        setTimeout(() => {
          if (!hasResult) {
            console.log(`🎤⏰ Recognition timeout for ${language}`);
            recognition.stop();
            resolve({ success: false, error: 'Recognition timeout' });
          }
        }, 8000);
        
      } catch (error) {
        console.error('🎤❌ Web Speech API setup error:', error);
        resolve({ success: false, error: error.message });
      }
    });
  };

  // Calculate string similarity for voice input evaluation
  const calculateStringSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLength = Math.max(len1, len2);
    
    if (maxLength === 0) return 1;
    
    // Levenshtein distance
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
    
    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    const distance = matrix[len2][len1];
    return (maxLength - distance) / maxLength;
  };

  // Helper function to check if answer can be submitted
  const canSubmitAnswer = () => {
    const currentQuestionData = questions[currentQuestion];
    const questionType = currentQuestionData?.question_types?.type_key || 'multiple_choice';
    
    switch (questionType) {
      case 'multiple_choice':
      case 'true_false':
        return selectedAnswer !== null;
      case 'short_answer':
      case 'fill_in_blank':
        return textAnswer.trim().length > 0;
      case 'drag_and_drop':
        const hasChoices = currentQuestionData.drag_drop_choices && currentQuestionData.drag_drop_choices.length > 0;
        return hasChoices ? selectedChoices.length > 0 : textAnswer.trim().length > 0;
      case 'voice_input':
        // Only allow submission if we have a valid voice answer (not error messages)
        return voiceAnswer.length > 0 && 
               !voiceAnswer.includes('Gagal') && 
               !voiceAnswer.includes('gagal') &&
               !voiceAnswer.includes('Error') &&
               !voiceAnswer.includes('error') &&
               !voiceAnswer.includes('coba lagi') &&
               voiceAnswer !== 'Target tidak tersedia';
      default:
        return selectedAnswer !== null;
    }
  };

  const calculateProgress = () => {
    if (questions.length === 0) return 0;
    return Math.round((currentQuestion / questions.length) * 100);
  };

  const handleStreakCheck = (isCorrect) => {
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      if (newStreak === 3) {
        setStreakMessage("🔥 Streak 3! Kamu hebat!");
        setShowStreakMessage(true);
        showToast.success("🔥 Streak 3! Kamu hebat!");
      } else if (newStreak === 5) {
        setStreakMessage("🚀 Streak 5! Luar biasa!");
        setShowStreakMessage(true);
        showToast.success("🚀 Streak 5! Luar biasa!");
      } else if (newStreak === 10) {
        setStreakMessage("🏆 PERFECT! 10 jawaban benar berturut-turut!");
        setShowStreakMessage(true);
        showToast.success("🏆 PERFECT! 10 jawaban benar berturut-turut!");
      }
      
      if (newStreak === 3 || newStreak === 5 || newStreak === 10) {
        setTimeout(() => {
          setShowStreakMessage(false);
        }, 3000);
      }
    } else {
      if (streak > 0) {
        showToast.error(`Streak terputus! Streak sebelumnya: ${streak}`);
      }
      setStreak(0);
    }
  };

  // Handle report submission
  const handleReportSubmission = async () => {
    if (!reportReason.trim()) {
      showToast.error('Mohon berikan alasan untuk melaporkan soal ini.');
      return;
    }

    setIsSubmittingReport(true);

    try {
      // Get current user from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        showToast.error('Tidak dapat mengidentifikasi user. Silakan login ulang.');
        return;
      }

      const currentQuestionData = questions[currentQuestion];
      
      const reportData = {
        user_id: user.id,
        target_type: 'question',
        question_id: currentQuestionData.id,
        lesson_id: subLessonId,
        level_id: levelId,
        reason: reportReason.trim(),
        question_context: {
          question_text: currentQuestionData.question_text,
          question_type: currentQuestionData.question_types?.type_name || 'Unknown',
          sub_lesson: lessonData?.title || 'Unknown',
          current_question_number: currentQuestion + 1,
          total_questions: questions.length
        }
      };

      const response = await fetch('/api/submit-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (result.success) {
        showToast.success('✅ Laporan berhasil dikirim. Terima kasih atas feedback Anda!');
        setShowReportModal(false);
        setReportReason('');
      } else {
        showToast.error('❌ Gagal mengirim laporan: ' + (result.error || 'Unknown error'));
      }

    } catch (error) {
      console.error('Error submitting report:', error);
      showToast.error('❌ Terjadi kesalahan saat mengirim laporan.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Function to analyze voice input and provide specific feedback
  const analyzeVoiceInput = (recognizedText, targetText) => {
    if (!recognizedText || recognizedText.trim().length === 0) {
      return "Suara tidak terdengar atau terlalu pelan";
    }
    
    const recognized = recognizedText.toLowerCase().trim();
    const target = targetText.toLowerCase().trim();
    
    // Check if audio is too short
    if (recognized.length < 2) {
      return "Suara terlalu pendek, coba ucapkan lebih panjang";
    }
    
    // Specific feedback based on Arabic letters/sounds
    const arabicLetterFeedback = {
      'alif': {
        keywords: ['alif', 'ا'],
        feedback: recognized.includes('a') ? "Baik! Suara 'A' terdengar jelas" : "Coba tekankan suara 'A' yang panjang"
      },
      'ba': {
        keywords: ['ba', 'ب'],
        feedback: recognized.includes('b') ? "Bagus! Suara 'B' dari bibir terdengar" : "Kurang penekanan bibir untuk huruf 'Ba'"
      },
      'ta': {
        keywords: ['ta', 'ت'],
        feedback: recognized.includes('t') ? "Baik! Suara 'T' dari ujung lidah terdengar" : "Kurang penekanan ujung lidah untuk huruf 'Ta'"
      },
      'tha': {
        keywords: ['tha', 'ث'],
        feedback: recognized.includes('th') ? "Bagus! Suara 'Th' terdengar jelas" : "Kurang penekanan lidah di gigi untuk 'Tha'"
      },
      'jim': {
        keywords: ['jim', 'ج'],
        feedback: recognized.includes('j') ? "Baik! Suara 'J' dari tenggorokan terdengar" : "Kurang penekanan di tenggorokan untuk 'Jim'"
      },
      'ha': {
        keywords: ['ha', 'ح'],
        feedback: recognized.includes('h') ? "Bagus! Suara 'H' halus terdengar" : "Kurang hembusan napas untuk huruf 'Ha'"
      },
      'kha': {
        keywords: ['kha', 'خ'],
        feedback: recognized.includes('kh') || recognized.includes('x') ? "Baik! Suara 'Kh' kasar terdengar" : "Kurang penekanan di tenggorokan untuk 'Kha'"
      },
      'dal': {
        keywords: ['dal', 'د'],
        feedback: recognized.includes('d') ? "Bagus! Suara 'D' dari ujung lidah terdengar" : "Kurang penekanan ujung lidah untuk 'Dal'"
      },
      'dzal': {
        keywords: ['dzal', 'ذ'],
        feedback: recognized.includes('dz') || recognized.includes('z') ? "Baik! Suara 'Dz' terdengar" : "Kurang penekanan lidah di gigi untuk 'Dzal'"
      },
      'ra': {
        keywords: ['ra', 'ر'],
        feedback: recognized.includes('r') ? "Bagus! Getaran lidah untuk 'Ra' terdengar" : "Kurang getaran lidah untuk huruf 'Ra'"
      },
      'zay': {
        keywords: ['zay', 'ز'],
        feedback: recognized.includes('z') ? "Baik! Suara 'Z' bergetar terdengar" : "Kurang getaran untuk huruf 'Zay'"
      },
      'sin': {
        keywords: ['sin', 'س'],
        feedback: recognized.includes('s') ? "Bagus! Suara 'S' bersiul terdengar" : "Kurang siulan udara untuk huruf 'Sin'"
      },
      'syin': {
        keywords: ['syin', 'ش'],
        feedback: recognized.includes('sy') || recognized.includes('sh') ? "Baik! Suara 'Sy' terdengar jelas" : "Kurang penekanan lidah untuk 'Syin'"
      },
      'shad': {
        keywords: ['shad', 'ص'],
        feedback: recognized.includes('sh') || recognized.includes('s') ? "Bagus! Suara 'Sh' tebal terdengar" : "Kurang penekanan tebal untuk 'Shad'"
      },
      'dhad': {
        keywords: ['dhad', 'ض'],
        feedback: recognized.includes('dh') || recognized.includes('d') ? "Baik! Suara 'Dh' tebal terdengar" : "Kurang penekanan tebal di tenggorokan untuk 'Dhad'"
      },
      'tha': {
        keywords: ['tha', 'ط'],
        feedback: recognized.includes('th') || recognized.includes('t') ? "Bagus! Suara 'Th' tebal terdengar" : "Kurang penekanan tebal untuk 'Tha'"
      },
      'zhaa': {
        keywords: ['zhaa', 'ظ'],
        feedback: recognized.includes('zh') || recognized.includes('z') ? "Baik! Suara 'Zh' tebal terdengar" : "Kurang penekanan tebal di lidah untuk 'Zhaa'"
      },
      'ain': {
        keywords: ['ain', 'ع'],
        feedback: recognized.includes('a') ? "Bagus! Suara 'Ain dari tenggorokan terdengar" : "Kurang penekanan dalam di tenggorokan untuk 'Ain'"
      },
      'ghain': {
        keywords: ['ghain', 'غ'],
        feedback: recognized.includes('gh') || recognized.includes('g') ? "Baik! Suara 'Gh' kasar terdengar" : "Kurang penekanan kasar di tenggorokan untuk 'Ghain'"
      },
      'fa': {
        keywords: ['fa', 'ف'],
        feedback: recognized.includes('f') ? "Bagus! Suara 'F' dari bibir dan gigi terdengar" : "Kurang kontak bibir bawah dengan gigi atas untuk 'Fa'"
      },
      'qaf': {
        keywords: ['qaf', 'ق'],
        feedback: recognized.includes('q') || recognized.includes('k') ? "Baik! Suara 'Q' dari pangkal lidah terdengar" : "Kurang penekanan pangkal lidah untuk 'Qaf'"
      },
      'kaf': {
        keywords: ['kaf', 'ك'],
        feedback: recognized.includes('k') ? "Bagus! Suara 'K' terdengar jelas" : "Kurang penekanan pangkal lidah untuk 'Kaf'"
      },
      'lam': {
        keywords: ['lam', 'ل'],
        feedback: recognized.includes('l') ? "Baik! Suara 'L' dari samping lidah terdengar" : "Kurang kontak samping lidah untuk 'Lam'"
      },
      'mim': {
        keywords: ['mim', 'م'],
        feedback: recognized.includes('m') ? "Bagus! Suara 'M' dari bibir terdengar" : "Kurang penutupan bibir untuk 'Mim'"
      },
      'nun': {
        keywords: ['nun', 'ن'],
        feedback: recognized.includes('n') ? "Baik! Suara 'N' dari ujung lidah terdengar" : "Kurang kontak ujung lidah untuk 'Nun'"
      },
      'waw': {
        keywords: ['waw', 'و'],
        feedback: recognized.includes('w') || recognized.includes('u') ? "Bagus! Suara 'W' bulat terdengar" : "Kurang pembulatan bibir untuk 'Waw'"
      },
      'ya': {
        keywords: ['ya', 'ي'],
        feedback: recognized.includes('y') || recognized.includes('i') ? "Baik! Suara 'Y' terdengar jelas" : "Kurang penekanan tengah lidah untuk 'Ya'"
      }
    };
    
    // Check for specific Arabic letter feedback
    for (const [letter, config] of Object.entries(arabicLetterFeedback)) {
      for (const keyword of config.keywords) {
        if (target.includes(keyword)) {
          return config.feedback;
        }
      }
    }
    
    // General feedback based on similarity
    const similarity = calculateStringSimilarity(recognized, target);
    if (similarity >= 0.8) {
      return "Sangat baik! Pengucapan hampir sempurna";
    } else if (similarity >= 0.6) {
      return "Bagus! Masih bisa diperbaiki sedikit";
    } else if (similarity >= 0.4) {
      return "Cukup baik, coba lebih jelas lagi";
    } else if (similarity >= 0.2) {
      return "Kurang jelas, coba ulangi dengan lebih perlahan";
    } else {
      return "Suara tidak cocok dengan target, coba fokus pada makhraj yang benar";
    }
  };

  const handleAnswerSelect = (optionId) => {
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = async () => {
    const currentQuestionData = questions[currentQuestion];
    const questionType = currentQuestionData?.question_types?.type_key || 'multiple_choice';
    let isAnswerCorrect = false;
    let selectedAnswerText = '';
    let correctAnswerText = '';

    // Determine correctness based on question type
    switch (questionType) {
      case 'multiple_choice':
        if (selectedAnswer === null) return;
        const selectedOption = currentQuestionData.question_options.find(opt => opt.id === selectedAnswer);
        isAnswerCorrect = selectedOption?.is_correct || false;
        selectedAnswerText = selectedOption?.option_text || '';
        correctAnswerText = currentQuestionData.question_options.find(opt => opt.is_correct)?.option_text || '';
        break;
        
      case 'true_false':
        const correctTrueFalse = currentQuestionData.question_options?.find(opt => opt.is_correct)?.option_text?.toLowerCase();
        isAnswerCorrect = selectedAnswer === correctTrueFalse;
        selectedAnswerText = selectedAnswer === 'true' ? 'Benar' : 'Salah';
        correctAnswerText = correctTrueFalse === 'true' ? 'Benar' : 'Salah';
        break;
        
      case 'short_answer':
        const correctShortAnswer = currentQuestionData.question_options?.find(opt => opt.is_correct)?.option_text;
        isAnswerCorrect = textAnswer.trim().toLowerCase() === correctShortAnswer?.toLowerCase();
        selectedAnswerText = textAnswer.trim();
        correctAnswerText = correctShortAnswer || '';
        break;
        
      case 'fill_in_blank':
        const correctFillBlank = currentQuestionData.fill_in_blank_answers?.[0]?.correct_answer;
        const alternativeFillBlank = currentQuestionData.fill_in_blank_answers?.[0]?.alternative_answers || [];
        const userAnswer = textAnswer.trim().toLowerCase();
        
        // Check if answer matches correct answer or any alternative
        isAnswerCorrect = userAnswer === correctFillBlank?.toLowerCase() || 
                         alternativeFillBlank.some(alt => userAnswer === alt.toLowerCase());
        selectedAnswerText = textAnswer.trim();
        correctAnswerText = correctFillBlank || '';
        break;
        
      case 'drag_and_drop':
        const correctDragDrop = currentQuestionData.drag_drop_blanks?.[0]?.correct_answer;
        const hasChoices = currentQuestionData.drag_drop_choices && currentQuestionData.drag_drop_choices.length > 0;
        
        if (hasChoices) {
          isAnswerCorrect = selectedChoices[0] === correctDragDrop;
          selectedAnswerText = selectedChoices[0] || '';
          correctAnswerText = correctDragDrop || '';
        } else {
          isAnswerCorrect = textAnswer.trim().toLowerCase() === correctDragDrop?.toLowerCase();
          selectedAnswerText = textAnswer.trim();
          correctAnswerText = correctDragDrop || '';
        }
        break;
        
      case 'voice_input':
        // Get target text from voice input data with proper fallback
        let targetVoice = '';
        
        // Priority 1: Check voice_input_data from specialized table
        if (currentQuestionData.voice_input_data?.expected_answer) {
          targetVoice = currentQuestionData.voice_input_data.expected_answer;
          console.log('🎤 Submit using voice_input_data target:', targetVoice);
        }
        // Priority 2: Check direct properties  
        else if (currentQuestionData.expected_answer) {
          targetVoice = currentQuestionData.expected_answer;
          console.log('🎤 Submit using direct property target:', targetVoice);
        }
        // Priority 3: Fallback to question_options
        else {
          const correctOption = currentQuestionData.question_options?.find(opt => opt.is_correct);
          targetVoice = correctOption?.option_text || '';
          console.log('🎤 Submit using question_options fallback target:', targetVoice);
        }
        
        // Strict validation: Don't accept empty targets or error responses
        if (!targetVoice || targetVoice === 'Target tidak tersedia') {
          console.log('🎤❌ No valid target available for voice input');
          isAnswerCorrect = false;
          selectedAnswerText = voiceAnswer;
          correctAnswerText = 'Target tidak tersedia';
          break;
        }
        
        // Strict validation: Don't accept error messages as valid answers
        const userVoiceAnswer = voiceAnswer.trim();
        if (userVoiceAnswer.includes('Gagal') || 
            userVoiceAnswer.includes('gagal') ||
            userVoiceAnswer.includes('Error') ||
            userVoiceAnswer.includes('error') ||
            userVoiceAnswer.includes('coba lagi') ||
            userVoiceAnswer.length === 0) {
          console.log('🎤❌ Voice answer contains error message or is empty');
          isAnswerCorrect = false;
          selectedAnswerText = voiceAnswer;
          correctAnswerText = targetVoice;
          break;
        }
        
        const userVoiceAnswerNormalized = userVoiceAnswer.toLowerCase().trim();
        const targetVoiceLowerNormalized = targetVoice.toLowerCase().trim();
        
        // Strict matching for voice input - only accept high similarity or exact matches
        const exactMatch = userVoiceAnswerNormalized === targetVoiceLowerNormalized;
        const similarity = calculateStringSimilarity(userVoiceAnswerNormalized, targetVoiceLowerNormalized);
        const strictSimilarityThreshold = 0.85; // 85% similarity threshold (stricter)
        
        console.log('🎤 Voice comparison (STRICT):', { 
          userVoiceAnswerNormalized, 
          targetVoiceLowerNormalized, 
          exactMatch, 
          similarity,
          threshold: strictSimilarityThreshold
        });
        
        // Only accept exact matches or very high similarity scores
        isAnswerCorrect = exactMatch || similarity >= strictSimilarityThreshold;
        selectedAnswerText = voiceAnswer;
        correctAnswerText = targetVoice;
        
        // Log the result for debugging
        console.log('🎤 Voice input result:', {
          isCorrect: isAnswerCorrect,
          similarity: similarity,
          exactMatch: exactMatch
        });
        break;
        
      default:
        if (selectedAnswer === null) return;
        const defaultOption = currentQuestionData.question_options.find(opt => opt.id === selectedAnswer);
        isAnswerCorrect = defaultOption?.is_correct || false;
        selectedAnswerText = defaultOption?.option_text || '';
        correctAnswerText = currentQuestionData.question_options.find(opt => opt.is_correct)?.option_text || '';
    }

    // Save answer to user_answers table
    try {
      const userId = localStorage.getItem('userId');
      await supabase
        .from('user_answers')
        .insert({
          user_id: userId,
          question_id: currentQuestionData.id,
          selected_option_id: questionType === 'multiple_choice' ? selectedAnswer : null,
          answer_text: selectedAnswerText,
          is_correct: isAnswerCorrect,
          answered_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving user answer:', error);
    }

    // Update quiz results
    setQuizResults(prev => ({
      ...prev,
      answers: [...prev.answers, {
        questionId: currentQuestionData.id,
        question: currentQuestionData.question_text,
        selectedAnswer: selectedAnswerText,
        correctAnswer: correctAnswerText,
        isCorrect: isAnswerCorrect,
        questionType: questionType
      }]
    }));

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    let currentScore = score;
    if (isAnswerCorrect) {
      currentScore = score + 1;
      setScore(currentScore);
    }

    // Handle streak checking
    handleStreakCheck(isAnswerCorrect);

    // Auto-proceed to next question or show final results
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        resetQuestionState();
      } else {
        handleQuizComplete(currentScore);
      }
    }, 1500);
  };

  const handleQuizComplete = async (finalCorrectAnswers = null) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    const correctAnswers = finalCorrectAnswers !== null ? finalCorrectAnswers : score;
    const totalQuestions = questions.length;
    const finalScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    const totalTimeSeconds = elapsedTime;
    const minutes = Math.floor(totalTimeSeconds / 60);
    const seconds = totalTimeSeconds % 60;
    const timeString = `${minutes}m ${seconds}s`;
    
    console.log('Quiz completed - Final data:', {
      correctAnswers,
      totalQuestions,
      finalScore,
      timeString,
      answersLength: quizResults.answers?.length || 0
    });
    
    setQuizResults(prev => ({ 
      ...prev, 
      score: finalScore,
      finalCorrectAnswers: correctAnswers,
      finalTotalQuestions: totalQuestions,
      totalTime: timeString,
      timeInSeconds: totalTimeSeconds
    }));
    
    if (finalScore === 100) {
      showToast.success(`🏆 Sempurna! Skor: ${finalScore}% dalam waktu ${timeString}!`);
    } else if (finalScore >= 80) {
      showToast.success(`🎉 Bagus sekali! Skor: ${Math.round(finalScore)}% dalam waktu ${timeString}`);
    } else if (finalScore >= 60) {
      showToast.info(`👍 Tidak buruk! Skor: ${Math.round(finalScore)}% dalam waktu ${timeString}`);
    } else {
      showToast.warning(`📚 Perlu belajar lagi. Skor: ${Math.round(finalScore)}% dalam waktu ${timeString}`);
    }
    
    setShowResultDialog(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat pelajaran...</p>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tidak Ada Soal</h2>
          <p className="text-gray-600 mb-6">
            Belum ada soal tersedia untuk pelajaran ini. Silakan hubungi administrator.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary-600 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <>
      <Head>
        <title>{lessonData?.title} - Belajar Mengaji</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IconArrowLeft size={24} />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {lessonData?.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Soal {currentQuestion + 1} dari {questions.length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Timer */}
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  ⏱️ {formatTime(elapsedTime)}
                </div>
                
                {/* Score */}
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  📊 {score}/{questions.length}
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-secondary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 leading-relaxed">
                  {currentQuestionData.question_text}
                </h2>
                
                {/* Question type badge */}
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {currentQuestionData.question_types?.label || 'Multiple Choice'}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Component */}
            <div className="mb-8">
              {renderQuestionComponent()}
            </div>

            {/* Submit button */}
            <div className="flex justify-center">
              <motion.button
                onClick={handleSubmitAnswer}
                disabled={!canSubmitAnswer() || showResult}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  canSubmitAnswer() && !showResult
                    ? 'bg-secondary text-white hover:bg-secondary-600 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={canSubmitAnswer() && !showResult ? { scale: 1.05 } : {}}
                whileTap={canSubmitAnswer() && !showResult ? { scale: 0.95 } : {}}
              >
                {showResult ? 'Menuju Soal Berikutnya...' : 'Submit Jawaban'}
              </motion.button>
            </div>

            {/* Streak message */}
            {showStreakMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="inline-block bg-yellow-100 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg font-medium">
                  {streakMessage}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating Report Button */}
        <AnimatePresence>
          {!showReportModal && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => setShowReportModal(true)}
              className="fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Laporkan Soal Bermasalah"
            >
              <IconFlag size={20} />
              <span className="text-sm font-medium">Laporkan Soal</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Report Modal */}
        <AnimatePresence>
          {showReportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowReportModal(false);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <IconFlag className="mr-2 text-red-500" size={24} />
                      Laporkan Soal
                    </h3>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <IconX size={20} />
                    </button>
                  </div>

                  {/* Question Details (Disabled) */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Soal
                      </label>
                      <input
                        type="text"
                        value={`Soal ${currentQuestion + 1} dari ${questions.length}`}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pertanyaan
                      </label>
                      <textarea
                        value={currentQuestionData?.question_text || 'Tidak ada teks soal'}
                        disabled
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Soal
                      </label>
                      <input
                        type="text"
                        value={currentQuestionData?.question_types?.label || 'Multiple Choice'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pelajaran
                      </label>
                      <input
                        type="text"
                        value={lessonData?.title || 'Pelajaran tidak diketahui'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub Lesson ID
                      </label>
                      <input
                        type="text"
                        value={subLessonId || 'Tidak diketahui'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Report Reason (Editable) */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alasan Laporan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Jelaskan masalah dengan soal ini (misal: jawaban salah, pertanyaan tidak jelas, pilihan rangkap, dll.)"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isSubmittingReport}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleReportSubmission}
                      disabled={!reportReason.trim() || isSubmittingReport}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast component */}
        <Toast />

        {/* Quiz result dialog */}
        {showResultDialog && (
          <QuizResultDialog
            isOpen={showResultDialog}
            onClose={() => setShowResultDialog(false)}
            results={quizResults}
            onRetry={() => {
              setShowResultDialog(false);
              setCurrentQuestion(0);
              setScore(0);
              setStreak(0);
              resetQuestionState();
              // Restart timer
              const startTimer = Date.now();
              setStartTime(startTimer);
              setElapsedTime(0);
              const interval = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - startTimer) / 1000);
                setElapsedTime(elapsed);
              }, 1000);
              setTimerInterval(interval);
            }}
            onContinue={() => {
              setShowResultDialog(false);
              router.push('/dashboard/dashboardBelajar');
            }}
          />
        )}
      </div>
    </>
  );
}

// Voice recording handler with Arabic speech recognition integration
const handleVoiceRecording = async () => {
  if (isRecording) {
    // Stop recording
    if (window.mediaRecorder && window.mediaRecorder.state === 'recording') {
      window.mediaRecorder.stop();
    }
    setIsRecording(false);
    return;
  }

  try {
    setIsRecording(true);
    
    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    window.mediaRecorder = mediaRecorder;
    
    const audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      
      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
      
      // Process with Arabic speech recognition
      await processArabicVoiceInput(audioBlob);
    };
    
    mediaRecorder.start();
    
    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }, 5000);
    
  } catch (error) {
    setIsRecording(false);
    showToast.error('Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin.');
  }
};

// Process voice input with Web Speech API (primary) and server fallback
const processArabicVoiceInput = async (audioBlob) => {
  try {
    const currentQuestionData = questions[currentQuestion];
    
    // Get target text from voice input data with proper fallback
    let targetText = '';
    
    // Priority 1: Check voice_input_data from specialized table
    if (currentQuestionData.voice_input_data?.expected_answer) {
      targetText = currentQuestionData.voice_input_data.expected_answer;
    }
    // Priority 2: Check direct properties  
    else if (currentQuestionData.expected_answer) {
      targetText = currentQuestionData.expected_answer;
    }
    // Priority 3: Fallback to question_options
    else if (currentQuestionData.question_options?.length > 0) {
      const correctOption = currentQuestionData.question_options.find(opt => opt.is_correct);
      if (correctOption?.option_text) {
        targetText = correctOption.option_text;
      }
    }
    
    // Validate that we have a target text
    if (!targetText || targetText.trim().length === 0) {
      setVoiceAnswer('');
      showToast.error('Target jawaban tidak tersedia untuk soal ini.');
      return;
    }

    // First try Web Speech API (much more reliable than server-side models)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      showToast.info('Memproses suara...');
      
      try {
        const webSpeechResult = await tryWebSpeechAPI();
        if (webSpeechResult.success) {
          const feedback = analyzeVoiceInput(webSpeechResult.text, targetText);
          setVoiceAnswer(feedback);
          
          // Calculate similarity with target
          const similarity = calculateStringSimilarity(webSpeechResult.text.toLowerCase().trim(), targetText.toLowerCase().trim());
          const similarityPercent = Math.round(similarity * 100);
          
          if (similarityPercent >= 70) {
            showToast.success(`✅ ${feedback}`);
          } else {
            showToast.info(`🎤 ${feedback}`);
          }
          return;
        } else {
          showToast.warning('Analisis suara gagal, menggunakan fallback...');
        }
      } catch (error) {
        showToast.warning('Analisis suara error, menggunakan fallback...');
      }
    } else {
      showToast.info('Menggunakan analisis suara alternatif...');
    }
    
    // Fallback to server-side API
    showToast.info('Memproses audio dengan server...');
    
    // Prepare form data for API
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('model', 'facebook/wav2vec2-large-960h');
    formData.append('target_text', targetText);
    
    // Call the voice recognition API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch('/api/voice-recognition', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.transcription) {
        const transcription = result.transcription.trim();
        const feedback = analyzeVoiceInput(transcription, targetText);
        setVoiceAnswer(feedback);
        showToast.success(`✅ ${feedback}`);
      } else {
        // Server API failed, provide manual input option
        throw new Error(result.error || 'Speech recognition failed');
      }
      
    } catch (error) {
      // Provide manual input option when all methods fail
      setVoiceAnswer('Suara tidak dapat diproses. Silakan coba lagi dengan pengucapan yang lebih jelas.');
      showToast.error('Analisis suara gagal. Silakan coba lagi atau ketik jawaban manual.');
    }
    
  } catch (error) {
    setVoiceAnswer('Gagal memproses audio. Silakan coba lagi.');
    showToast.error('❌ Gagal memproses audio. Silakan coba lagi.');
  }
};

// Web Speech API implementation for client-side speech recognition
const tryWebSpeechAPI = () => {
  return new Promise((resolve) => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configure for Arabic/Indonesian recognition
      recognition.lang = 'ar-SA'; // Arabic Saudi Arabia for Quranic text
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3; // Get multiple alternatives
      
      let hasResult = false;
      
      recognition.onresult = (event) => {
        if (hasResult) return; // Prevent multiple results
        hasResult = true;
        
        // Get the best result
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        resolve({ success: true, text: transcript.trim(), confidence });
      };
      
      recognition.onerror = (event) => {
        if (hasResult) return; // Ignore errors after success
        resolve({ success: false, error: event.error });
      };
      
      recognition.onend = () => {
        if (!hasResult) {
          resolve({ success: false, error: 'No speech detected' });
        }
      };
      
      // Start recognition
      recognition.start();
      
      // Timeout after 8 seconds
      setTimeout(() => {
        if (!hasResult) {
          recognition.stop();
          resolve({ success: false, error: 'Recognition timeout' });
        }
      }, 8000);
      
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
};

// Calculate string similarity for voice input evaluation
const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  // Normalize strings for comparison
  const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  const normalized1 = normalize(str1);
  const normalized2 = normalize(str2);
  
  // Exact match gets 100%
  if (normalized1 === normalized2) {
    return 1;
  }
  
  // Calculate Levenshtein distance for similarity
  const len1 = normalized1.length;
  const len2 = normalized2.length;
  const maxLength = Math.max(len1, len2);
  
  if (maxLength === 0) return 1;
  
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = normalized1[i - 1] === normalized2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,       // deletion
        matrix[j][i - 1] + 1,       // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  const distance = matrix[len2][len1];
  const similarity = (maxLength - distance) / maxLength;
  
  return similarity;
};
