import { IconArrowLeft } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import QuizResultDialog from '../../../../components/dialog/QuizResultDialog';
import { supabase } from '../../../../lib/supabaseClient';

export default function LessonPage() {
  const router = useRouter();
  const { levelId, subLessonId } = router.query;
  const [loading, setLoading] = useState(true);
  const [lessonData, setLessonData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [quizResults, setQuizResults] = useState({
    answers: [],
    score: 0
  });

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!levelId || !subLessonId) return;

      try {
        // First fetch lesson data
        const { data: lessonData, error: lessonError } = await supabase
          .from('roadmap_sub_lessons')
          .select(`
            *,
            roadmap_levels(title)
          `)
          .eq('id', subLessonId)
          .single();

        if (lessonError) throw lessonError;

        // Then fetch questions with their options
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            order_sequence,
            question_options (
              id,
              option_text,
              is_correct
            )
          `)
          .eq('sublesson_id', subLessonId)
          .order('order_sequence');

        if (questionsError) throw questionsError;

        // Sort questions by order_sequence
        const sortedQuestions = questionsData.sort((a, b) => a.order_sequence - b.order_sequence);

        setLessonData(lessonData);
        setQuestions(sortedQuestions);
        setProgress(0); // Reset progress
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [levelId, subLessonId]);

  const calculateProgress = () => {
    if (questions.length === 0) return 0;
    return Math.round((currentQuestion / questions.length) * 100);
  };

  const handleNextStep = async () => {
    if (currentStep < lessonData?.steps?.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress((currentStep + 1) / lessonData.steps.length * 100);
    } else {
      // Mark lesson as completed
      try {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: localStorage.getItem('userId'),
            sub_lesson_id: subLessonId,
            completed: true,
            completed_at: new Date().toISOString()
          });

        router.push('/dashboard/DashboardBelajar');
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const handleAnswerSelect = (optionId) => {
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    const currentQuestionData = questions[currentQuestion];
    const selectedOption = currentQuestionData.question_options.find(
      opt => opt.id === selectedAnswer
    );
    const isAnswerCorrect = selectedOption.is_correct;

    // Update quiz results
    setQuizResults(prev => ({
      ...prev,
      answers: [...prev.answers, {
        questionId: currentQuestionData.id,
        question: currentQuestionData.question_text,
        selectedAnswer: selectedOption.option_text,
        correctAnswer: currentQuestionData.question_options.find(opt => opt.is_correct).option_text,
        isCorrect: isAnswerCorrect
      }]
    }));

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    if (isAnswerCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    // Auto-proceed to next question or show final results
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        handleQuizComplete();
      }
    }, 1500);
  };

  const handleQuizComplete = async () => {
    const finalScore = (score / questions.length) * 100;
    setQuizResults(prev => ({ ...prev, score: finalScore }));
    setShowResultDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{lessonData?.title || 'Pelajaran'} - Ma'ruf</title>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/DashboardBelajar')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{lessonData?.title}</h1>
                <p className="text-sm text-gray-500">{lessonData?.roadmap_levels?.title}</p>
                {/* Debug Info - Level and SubLesson IDs */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                    Debug: Level ID: {levelId} | SubLesson ID: {subLessonId}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 rounded-full w-32 h-2">
                <div
                  className="bg-secondary h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          {questions.length > 0 ? (
            <div className="space-y-6">
              {/* Enhanced Progress indicator with debug info */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Soal {currentQuestion + 1} dari {questions.length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    Skor: {score}/{questions.length}
                  </div>
                </div>
                
                {/* Debug Panel - Question IDs */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
                    <div className="font-semibold text-gray-700 mb-2">🔧 Debug Information:</div>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div>
                        <strong>Current Question ID:</strong> {questions[currentQuestion]?.id || 'N/A'}
                      </div>
                      <div>
                        <strong>Question Order:</strong> {questions[currentQuestion]?.order_sequence || 'N/A'}
                      </div>
                      <div>
                        <strong>Total Questions:</strong> {questions.length}
                      </div>
                      <div>
                        <strong>Options Count:</strong> {questions[currentQuestion]?.question_options?.length || 0}
                      </div>
                    </div>
                    
                    {/* All Question IDs */}
                    <div className="mt-2">
                      <strong>All Question IDs:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {questions.map((q, index) => (
                          <span 
                            key={q.id}
                            className={`px-2 py-1 rounded text-xs ${
                              index === currentQuestion 
                                ? 'bg-blue-100 text-blue-700 font-bold' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {index + 1}: {q.id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-secondary"
                    initial={{ width: '0%' }}
                    animate={{ width: `${calculateProgress()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Question content */}
              {questions[currentQuestion] && (
                <div className="space-y-6">
                  {/* Question Header with Debug Info */}
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {questions[currentQuestion].question_text}
                    </h2>
                    
                    {/* Debug Info for Current Question */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                        <div className="text-yellow-800">
                          <strong>Question Debug:</strong> ID = {questions[currentQuestion].id}, 
                          Order = {questions[currentQuestion].order_sequence}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {questions[currentQuestion].question_options.map((option, optionIndex) => (
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
                        
                        {/* Debug Info for Each Option */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="absolute top-1 right-1 text-xs">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              option.is_correct 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              ID: {option.id} {option.is_correct ? '✓' : '✗'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit button */}
                  {!showResult && (
                    <motion.button
                      onClick={handleSubmitAnswer}
                      className={`w-full py-3 rounded-lg font-medium mt-4 ${
                        selectedAnswer
                          ? 'bg-secondary text-white hover:bg-secondary-dark'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!selectedAnswer}
                      whileHover={selectedAnswer ? { scale: 1.02 } : {}}
                      whileTap={selectedAnswer ? { scale: 0.98 } : {}}
                    >
                      Jawab
                      {/* Debug - Show selected answer ID */}
                      {process.env.NODE_ENV === 'development' && selectedAnswer && (
                        <span className="ml-2 text-xs opacity-75">
                          (Selected ID: {selectedAnswer})
                        </span>
                      )}
                    </motion.button>
                  )}

                  {/* Result feedback */}
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg ${
                        isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{isCorrect ? 'Jawaban Benar!' : 'Jawaban Salah!'}</span>
                        
                        {/* Debug - Show answer details */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs opacity-75">
                            Selected: {selectedAnswer} | 
                            Correct: {questions[currentQuestion].question_options.find(opt => opt.is_correct)?.id}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                Tidak ada soal tersedia untuk pelajaran ini.
              </div>
              
              {/* Debug Info when no questions */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                  <div className="font-semibold mb-2">🚫 Debug - No Questions Found:</div>
                  <div className="text-left space-y-1">
                    <div><strong>SubLesson ID:</strong> {subLessonId}</div>
                    <div><strong>Level ID:</strong> {levelId}</div>
                    <div><strong>Lesson Data:</strong> {lessonData ? 'Loaded' : 'Not loaded'}</div>
                    <div><strong>Questions Array:</strong> {JSON.stringify(questions)}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>

      <QuizResultDialog
        isOpen={showResultDialog}
        onClose={() => {
          setShowResultDialog(false);
          router.push('/dashboard/DashboardBelajar');
        }}
        results={quizResults}
        totalQuestions={questions.length}
      />
    </div>
  );
}
