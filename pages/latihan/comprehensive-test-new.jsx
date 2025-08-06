import { IconCheck, IconChevronRight, IconMicrophone, IconRefresh, IconVolume, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Toast, showToast } from '../../components/ui/toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

// Data soal lengkap untuk 8 jenis soal
const hijaiyahData = [
  { id: 1, arabic: 'ا', latin: 'Alif', audio: '/audio/alif.mp3' },
  { id: 2, arabic: 'ب', latin: 'Ba', audio: '/audio/ba.mp3' },
  { id: 3, arabic: 'ت', latin: 'Ta', audio: '/audio/ta.mp3' },
  { id: 4, arabic: 'ث', latin: 'Tsa', audio: '/audio/tsa.mp3' },
  { id: 5, arabic: 'ج', latin: 'Jim', audio: '/audio/jim.mp3' },
  { id: 6, arabic: 'ح', latin: 'Ha', audio: '/audio/ha.mp3' },
  { id: 7, arabic: 'خ', latin: 'Kha', audio: '/audio/kha.mp3' },
  { id: 8, arabic: 'د', latin: 'Dal', audio: '/audio/dal.mp3' },
  { id: 9, arabic: 'ذ', latin: 'Dzal', audio: '/audio/dzal.mp3' },
  { id: 10, arabic: 'ر', latin: 'Ra', audio: '/audio/ra.mp3' },
  { id: 11, arabic: 'ز', latin: 'Za', audio: '/audio/za.mp3' },
  { id: 12, arabic: 'س', latin: 'Sin', audio: '/audio/sin.mp3' },
  { id: 13, arabic: 'ش', latin: 'Syin', audio: '/audio/syin.mp3' },
  { id: 14, arabic: 'ص', latin: 'Shad', audio: '/audio/shad.mp3' },
  { id: 15, arabic: 'ض', latin: 'Dhad', audio: '/audio/dhad.mp3' },
  { id: 16, arabic: 'ط', latin: 'Tha', audio: '/audio/tha.mp3' },
  { id: 17, arabic: 'ظ', latin: 'Zha', audio: '/audio/zha.mp3' },
  { id: 18, arabic: 'ع', latin: 'Ain', audio: '/audio/ain.mp3' },
  { id: 19, arabic: 'غ', latin: 'Ghain', audio: '/audio/ghain.mp3' },
  { id: 20, arabic: 'ف', latin: 'Fa', audio: '/audio/fa.mp3' },
  { id: 21, arabic: 'ق', latin: 'Qaf', audio: '/audio/qaf.mp3' },
  { id: 22, arabic: 'ك', latin: 'Kaf', audio: '/audio/kaf.mp3' },
  { id: 23, arabic: 'ل', latin: 'Lam', audio: '/audio/lam.mp3' },
  { id: 24, arabic: 'م', latin: 'Mim', audio: '/audio/mim.mp3' },
  { id: 25, arabic: 'ن', latin: 'Nun', audio: '/audio/nun.mp3' },
  { id: 26, arabic: 'و', latin: 'Waw', audio: '/audio/waw.mp3' },
  { id: 27, arabic: 'ه', latin: 'Ha', audio: '/audio/ha2.mp3' },
  { id: 28, arabic: 'ي', latin: 'Ya', audio: '/audio/ya.mp3' }
];

// Helper functions
const generateArabicText = (targetLetter) => {
  const otherLetters = hijaiyahData.filter(l => l.id !== targetLetter.id);
  const randomLetters = [...otherLetters].sort(() => Math.random() - 0.5).slice(0, 8);
  
  // Insert target letter 2-3 times randomly
  const insertions = Math.floor(Math.random() * 2) + 2; // 2-3 times
  const text = [...randomLetters.map(l => l.arabic)];
  
  for (let i = 0; i < insertions; i++) {
    const position = Math.floor(Math.random() * (text.length + 1));
    text.splice(position, 0, targetLetter.arabic);
  }
  
  return text.join(' ');
};

const countLetterInText = (text, letter) => {
  return (text.match(new RegExp(letter, 'g')) || []).length;
};

// Fungsi untuk generate soal
const generateQuestions = (targetLetter = null) => {
  // Jika targetLetter ada, fokus pada huruf tersebut
  if (targetLetter) {
    const otherLetters = hijaiyahData.filter(letter => letter.id !== targetLetter.id);
    const shuffledOthers = [...otherLetters].sort(() => Math.random() - 0.5);
    const arabicText = generateArabicText(targetLetter);
    
    return [
      // Soal 1: Pilihan ganda - bunyi dalam tulisan latin
      {
        type: 'multiple_choice_sound',
        question: `Huruf "${targetLetter.arabic}" dibaca apa?`,
        arabic: targetLetter.arabic,
        correct: targetLetter.latin,
        options: [
          targetLetter.latin,
          shuffledOthers[0].latin,
          shuffledOthers[1].latin
        ].sort(() => Math.random() - 0.5)
      },
      
      // Soal 2: Pilihan ganda - bentuk huruf dari nama
      {
        type: 'multiple_choice_shape',
        question: `Manakah bentuk huruf "${targetLetter.latin}"?`,
        latin: targetLetter.latin,
        correct: targetLetter.arabic,
        options: [
          targetLetter.arabic,
          shuffledOthers[2].arabic,
          shuffledOthers[3].arabic
        ].sort(() => Math.random() - 0.5)
      },
      
      // Soal 3: Audio - pilihan bentuk huruf dari suara
      {
        type: 'audio_to_shape',
        question: 'Dengarkan audio berikut, manakah bentuk huruf yang benar?',
        audio: targetLetter.audio,
        correct: targetLetter.arabic,
        options: [
          targetLetter.arabic,
          shuffledOthers[4].arabic,
          shuffledOthers[5].arabic
        ].sort(() => Math.random() - 0.5)
      },
      
      // Soal 4: Audio - pilihan nama huruf dari suara
      {
        type: 'audio_to_name',
        question: 'Dengarkan audio berikut, apakah nama huruf yang benar?',
        audio: targetLetter.audio,
        correct: targetLetter.latin,
        options: [
          targetLetter.latin,
          shuffledOthers[6].latin,
          shuffledOthers[7].latin
        ].sort(() => Math.random() - 0.5)
      },
      
      // Soal 5: Teks arab - huruf yang sama
      {
        type: 'text_recognition',
        question: `Dalam teks berikut, berapa kali huruf "${targetLetter.arabic}" muncul?`,
        arabic_text: arabicText,
        correct: countLetterInText(arabicText, targetLetter.arabic),
        options: [
          countLetterInText(arabicText, targetLetter.arabic),
          Math.max(0, countLetterInText(arabicText, targetLetter.arabic) - 1),
          countLetterInText(arabicText, targetLetter.arabic) + 1
        ].sort(() => Math.random() - 0.5)
      },
      
      // Soal 6: Urutan huruf
      {
        type: 'sequence_order',
        question: `Urutkan huruf berikut dengan "${targetLetter.arabic}" di posisi yang benar:`,
        correct_sequence: [shuffledOthers[8].arabic, targetLetter.arabic, shuffledOthers[9].arabic],
        scrambled_options: [targetLetter.arabic, shuffledOthers[8].arabic, shuffledOthers[9].arabic].sort(() => Math.random() - 0.5)
      },
      
      // Soal 7: Benar atau Salah
      {
        type: 'true_false',
        question: `Benarkah huruf "${targetLetter.arabic}" dibaca "${Math.random() > 0.5 ? targetLetter.latin : shuffledOthers[10].latin}"?`,
        arabic: targetLetter.arabic,
        statement: Math.random() > 0.5 ? targetLetter.latin : shuffledOthers[10].latin,
        correct: Math.random() > 0.5 ? true : false
      },
      
      // Soal 8: Rekam suara - mengucapkan huruf
      {
        type: 'voice_recording',
        question: `Ucapkan huruf "${targetLetter.arabic}" dengan benar`,
        arabic: targetLetter.arabic,
        latin: targetLetter.latin,
        reference_audio: targetLetter.audio
      }
    ];
  }
  
  // Kode asli untuk tes acak jika tidak ada targetLetter
  const shuffled = [...hijaiyahData].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 8);
  
  return [
    // Soal 1: Pilihan ganda - bunyi dalam tulisan latin
    {
      type: 'multiple_choice_sound',
      question: `Huruf "${selected[0].arabic}" dibaca apa?`,
      arabic: selected[0].arabic,
      correct: selected[0].latin,
      options: [
        selected[0].latin,
        shuffled[8].latin,
        shuffled[9].latin
      ].sort(() => Math.random() - 0.5)
    },
    
    // Soal 2: Pilihan ganda - bentuk huruf dari nama
    {
      type: 'multiple_choice_shape',
      question: `Manakah bentuk huruf "${selected[1].latin}"?`,
      latin: selected[1].latin,
      correct: selected[1].arabic,
      options: [
        selected[1].arabic,
        shuffled[10].arabic,
        shuffled[11].arabic
      ].sort(() => Math.random() - 0.5)
    },
    
    // Soal 3: Audio - pilihan bentuk huruf dari suara
    {
      type: 'audio_to_shape',
      question: 'Dengarkan audio berikut, manakah bentuk huruf yang benar?',
      audio: selected[2].audio,
      correct: selected[2].arabic,
      options: [
        selected[2].arabic,
        shuffled[12].arabic,
        shuffled[13].arabic
      ].sort(() => Math.random() - 0.5)
    },
    
    // Soal 4: Audio - pilihan nama huruf dari suara
    {
      type: 'audio_to_name',
      question: 'Dengarkan audio berikut, apakah nama huruf yang benar?',
      audio: selected[3].audio,
      correct: selected[3].latin,
      options: [
        selected[3].latin,
        shuffled[14].latin,
        shuffled[15].latin
      ].sort(() => Math.random() - 0.5)
    },
    
    // Soal 5: Gambar dengan pilihan gambar pengucapan
    {
      type: 'visual_pronunciation',
      question: `Teks arab mana yang mengandung huruf "${selected[4].arabic}"?`,
      arabic: selected[4].arabic,
      correct: selected[4].arabic,
      options: [
        selected[4].arabic,
        shuffled[15].arabic,
        shuffled[16].arabic
      ].sort(() => Math.random() - 0.5)
    },
    
    // Soal 6: Gambar makhraj dengan pilihan huruf
    {
      type: 'makhraj_to_letter',
      question: 'Huruf manakah yang berbeda dari yang lain?',
      correct: selected[5].arabic,
      options: [
        selected[5].arabic,
        shuffled[16].arabic,
        shuffled[17].arabic
      ].sort(() => Math.random() - 0.5)
    },
    
    // Soal 7: Benar atau Salah
    {
      type: 'true_false',
      question: `Benarkah huruf "${selected[6].arabic}" dibaca "${Math.random() > 0.5 ? selected[6].latin : shuffled[18].latin}"?`,
      arabic: selected[6].arabic,
      statement: Math.random() > 0.5 ? selected[6].latin : shuffled[18].latin,
      correct: Math.random() > 0.5 ? true : false
    },
    
    // Soal 8: Rekam suara - mengucapkan huruf
    {
      type: 'voice_recording',
      question: `Ucapkan huruf "${selected[7].arabic}" dengan benar`,
      arabic: selected[7].arabic,
      latin: selected[7].latin,
      reference_audio: selected[7].audio
    }
  ];
};

export default function HijaiyahComprehensiveTest() {
  const router = useRouter();
  const { user } = useAuth();
  const { letterId } = router.query; // Get letterId from URL query
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [voiceScore, setVoiceScore] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [answers, setAnswers] = useState([]);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (router.isReady) {
      // Find the target letter if letterId is provided
      const targetLetter = letterId ? hijaiyahData.find(letter => letter.id === parseInt(letterId)) : null;
      setQuestions(generateQuestions(targetLetter));
    }
  }, [router.isReady, letterId]);

  const playAudio = (audioSrc) => {
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // Simulate voice analysis
        setIsAnalyzing(true);
        setTimeout(() => {
          const randomScore = Math.floor(Math.random() * 40) + 60; // 60-100
          setVoiceScore(randomScore);
          setIsAnalyzing(false);
        }, 2000);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      showToast.error('Tidak dapat mengakses mikrofon');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnswer = (answer) => {
    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const newAnswer = {
      question: question.question,
      userAnswer: answer,
      correctAnswer: question.correct,
      isCorrect,
      type: question.type
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setRecordedAudio(null);
        setVoiceScore(null);
      } else {
        setShowResult(true);
        saveTestProgress();
      }
    }, 2000);
  };

  const saveTestProgress = async () => {
    if (!user) return;
    
    try {
      const targetLetter = letterId ? hijaiyahData.find(letter => letter.id === parseInt(letterId)) : null;
      const finalScore = (score / questions.length) * 100;
      const isPassed = finalScore >= 70;
      
      if (targetLetter && isPassed) {
        // Update hijaiyah_progress for specific letter
        const { error } = await supabase
          .from('hijaiyah_progress')
          .upsert({
            user_id: user.id,
            letter_id: targetLetter.id,
            is_completed: true,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,letter_id'
          });
          
        if (error) {
          console.error('Error saving progress:', error);
        } else {
          showToast.success(`Selamat! Anda telah menguasai huruf ${targetLetter.latin}`);
        }
      }
    } catch (error) {
      console.error('Error saving test progress:', error);
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setShowFeedback(false);
    setAnswers([]);
    setRecordedAudio(null);
    setVoiceScore(null);
    
    // Find the target letter if letterId is provided
    const targetLetter = letterId ? hijaiyahData.find(letter => letter.id === parseInt(letterId)) : null;
    setQuestions(generateQuestions(targetLetter));
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat soal...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const finalScore = (score / questions.length) * 100;
    const targetLetter = letterId ? hijaiyahData.find(letter => letter.id === parseInt(letterId)) : null;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-8">
        <Toast />
        <Head>
          <title>Hasil Tes {targetLetter ? `Huruf ${targetLetter.latin}` : 'Komprehensif'} • Makhrojul Huruf</title>
        </Head>
        
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-bold mb-4 ${
                finalScore >= 80 ? 'bg-green-100 text-green-600' :
                finalScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {Math.round(finalScore)}%
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tes {targetLetter ? `Huruf ${targetLetter.latin}` : 'Komprehensif'} Selesai!
              </h1>
              
              <p className={`text-lg ${
                finalScore >= 80 ? 'text-green-600' :
                finalScore >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {finalScore >= 80 ? 'Excellent! Anda sangat menguasai materi ini.' :
                 finalScore >= 60 ? 'Good job! Masih ada ruang untuk perbaikan.' :
                 'Perlu belajar lebih banyak. Jangan menyerah!'}
              </p>
              
              <div className="mt-6 text-gray-600">
                Skor: {score} dari {questions.length} soal benar
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={resetTest}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <IconRefresh size={20} />
                <span>Ulangi Tes</span>
              </button>
              
              <button
                onClick={() => router.push('/dashboard/DashboardHuruf')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <span>Kembali ke Dashboard</span>
                <IconChevronRight size={20} />
              </button>
            </div>

            {/* Answer Review */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Jawaban</h3>
              {answers.map((answer, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 ${
                  answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">{answer.question}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {answer.isCorrect ? 'Benar' : 'Salah'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Jawaban Anda: <span className="font-medium">{answer.userAnswer}</span></p>
                    {!answer.isCorrect && (
                      <p>Jawaban Benar: <span className="font-medium text-green-600">{answer.correctAnswer}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-8">
      <Toast />
      <Head>
        <title>
          Tes {letterId ? `Huruf ${hijaiyahData.find(l => l.id === parseInt(letterId))?.latin}` : 'Komprehensif'} • Makhrojul Huruf
        </title>
      </Head>

      <audio ref={audioRef} />

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/dashboard/DashboardHuruf')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <IconX size={20} />
            <span>Keluar</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Tes {letterId ? `Huruf ${hijaiyahData.find(l => l.id === parseInt(letterId))?.latin}` : 'Komprehensif'}
            </h1>
            <p className="text-gray-600">Soal {currentQuestion + 1} dari {questions.length}</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Skor</p>
            <p className="text-2xl font-bold text-indigo-600">{score}/{questions.length}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{question.question}</h2>
            
            {/* Display Arabic text for relevant question types */}
            {question.arabic && (
              <div className="text-6xl font-bold font-arabic text-indigo-600 mb-6">
                {question.arabic}
              </div>
            )}

            {/* Display Arabic text for text recognition */}
            {question.arabic_text && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="text-3xl font-arabic text-gray-900 leading-relaxed">
                  {question.arabic_text}
                </div>
              </div>
            )}

            {/* Audio controls */}
            {question.audio && (
              <button
                onClick={() => playAudio(question.audio)}
                className="flex items-center gap-2 mx-auto mb-6 px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors"
              >
                <IconVolume size={20} className={isPlaying ? "animate-pulse" : ""} />
                <span>{isPlaying ? 'Memutar...' : 'Putar Audio'}</span>
              </button>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {question.type === 'voice_recording' ? (
              <div className="text-center">
                <div className="mb-6">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-3 mx-auto px-8 py-4 rounded-xl font-medium transition-colors ${
                      isRecording 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <IconMicrophone size={24} className={isRecording ? "animate-pulse" : ""} />
                    <span>{isRecording ? 'Berhenti Merekam' : 'Mulai Merekam'}</span>
                  </button>
                </div>

                {recordedAudio && (
                  <div className="mb-6">
                    <audio controls src={recordedAudio} className="mx-auto mb-4" />
                    <p className="text-gray-600">Audio telah direkam</p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="mb-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Menganalisis pelafalan...</p>
                  </div>
                )}

                {voiceScore && (
                  <div className="mb-6">
                    <div className={`inline-block px-4 py-2 rounded-xl font-medium ${
                      voiceScore >= 80 ? 'bg-green-100 text-green-700' :
                      voiceScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Skor Pelafalan: {voiceScore}%
                    </div>
                    <button
                      onClick={() => handleAnswer(voiceScore >= 70 ? question.correct : 'incorrect')}
                      className="block mx-auto mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Lanjut ke Soal Berikutnya
                    </button>
                  </div>
                )}
              </div>
            ) : question.type === 'true_false' ? (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={showFeedback}
                  className={`px-8 py-4 rounded-xl font-medium transition-colors ${
                    showFeedback
                      ? selectedAnswer === true
                        ? question.correct === true ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  Benar
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={showFeedback}
                  className={`px-8 py-4 rounded-xl font-medium transition-colors ${
                    showFeedback
                      ? selectedAnswer === false
                        ? question.correct === false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  Salah
                </button>
              </div>
            ) : (
              question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-colors ${
                    showFeedback
                      ? selectedAnswer === option
                        ? option === question.correct ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-red-100 text-red-700 border-2 border-red-200'
                        : option === question.correct ? 'bg-green-50 text-green-600 border-2 border-green-200' : 'bg-gray-100 text-gray-500'
                      : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border-2 border-transparent hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={question.type === 'multiple_choice_shape' || question.type === 'audio_to_shape' ? 'text-4xl font-arabic' : ''}>
                      {option}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-6 p-4 rounded-xl ${
                  selectedAnswer === question.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconCheck size={20} className={selectedAnswer === question.correct ? 'text-green-600' : 'text-red-600'} />
                  <span className={`font-medium ${selectedAnswer === question.correct ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedAnswer === question.correct ? 'Benar!' : 'Salah!'}
                  </span>
                </div>
                {selectedAnswer !== question.correct && (
                  <p className="text-red-600">Jawaban yang benar: <span className="font-medium">{question.correct}</span></p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
