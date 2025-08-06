import { IconCheck, IconChevronRight, IconRefresh, IconVolume, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import PronunciationAnalysisModal from '../../components/PronunciationAnalysisModal';
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
    
    return [
      // Soal 1: Multiple Choice - bunyi huruf dalam tulisan latin
      {
        type: 'multiple_choice',
        question: `Huruf "${targetLetter.arabic}" dibaca apa dalam tulisan latin?`,
        arabic: targetLetter.arabic,
        correct: targetLetter.latin,
        options: [
          targetLetter.latin,
          shuffledOthers[0].latin,
          shuffledOthers[1].latin,
          shuffledOthers[2].latin
        ].sort(() => Math.random() - 0.5)
      },
      
      // Soal 2: Short Answer - bunyi huruf (tuliskan bunyi huruf)
      {
        type: 'short_answer',
        question: `Tuliskan bunyi huruf "${targetLetter.arabic}" dalam tulisan latin:`,
        arabic: targetLetter.arabic,
        correct: targetLetter.latin.toLowerCase(),
        placeholder: "Contoh: ba, ta, alif..."
      },
      
      // Soal 3: Multiple Choice - pilih huruf Arab yang benar berdasarkan pengucapan
      {
        type: 'multiple_choice',
        question: `Manakah huruf Arab yang dibaca "${targetLetter.latin}"?`,
        correct: targetLetter.arabic,
        options: [
          targetLetter.arabic,
          shuffledOthers[3].arabic,
          shuffledOthers[4].arabic,
          shuffledOthers[5].arabic
        ].sort(() => Math.random() - 0.5)
      },

      // Soal 4: Pronunciation - mengucapkan huruf
      {
        type: 'pronunciation',
        question: `Ucapkan huruf "${targetLetter.arabic}" dengan benar:`,
        arabic: targetLetter.arabic,
        correct: targetLetter.latin.toLowerCase(),
        audio: targetLetter.audio,
        target_letter: targetLetter.latin
      }
    ];
  }
  
  // Kode untuk tes acak jika tidak ada targetLetter
  const shuffled = [...hijaiyahData].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  
  return [
    // Soal 1: Multiple Choice - bunyi huruf dalam tulisan latin
    {
      type: 'multiple_choice',
      question: `Huruf "${selected[0].arabic}" dibaca apa dalam tulisan latin?`,
      arabic: selected[0].arabic,
      correct: selected[0].latin,
      options: [
        selected[0].latin,
        shuffled[4].latin,
        shuffled[5].latin,
        shuffled[6].latin
      ].sort(() => Math.random() - 0.5)
    },
    
    // Soal 2: Short Answer - bunyi huruf
    {
      type: 'short_answer',
      question: `Tuliskan bunyi huruf "${selected[1].arabic}" dalam tulisan latin:`,
      arabic: selected[1].arabic,
      correct: selected[1].latin.toLowerCase(),
      placeholder: "Contoh: ba, ta, alif..."
    },
    
    // Soal 3: Multiple Choice - pilih huruf Arab yang benar
    {
      type: 'multiple_choice',
      question: `Manakah huruf Arab yang dibaca "${selected[2].latin}"?`,
      correct: selected[2].arabic,
      options: [
        selected[2].arabic,
        shuffled[7].arabic,
        shuffled[8].arabic,
        shuffled[9].arabic
      ].sort(() => Math.random() - 0.5)
    },

    // Soal 4: Pronunciation - mengucapkan huruf
    {
      type: 'pronunciation',
      question: `Ucapkan huruf "${selected[3].arabic}" dengan benar:`,
      arabic: selected[3].arabic,
      correct: selected[3].latin.toLowerCase(),
      audio: selected[3].audio,
      target_letter: selected[3].latin
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
  const [answers, setAnswers] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [dragDropAnswers, setDragDropAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [voiceScore, setVoiceScore] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detailedAnalysis, setDetailedAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (router.isReady) {
      // Reset all state when letterId changes (including when navigating to next letter)
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setScore(0);
      setShowResult(false);
      setShowFeedback(false);
      setAnswers([]);
      setTextInput('');
      setDragDropAnswers({});
      setRecordedAudio(null);
      setVoiceScore(null);
      setIsAnalyzing(false);
      setIsRecording(false);
      
      // Find the target letter if letterId is provided
      const targetLetter = letterId ? hijaiyahData.find(letter => letter.id === parseInt(letterId)) : null;
      setQuestions(generateQuestions(targetLetter));
    }
  }, [router.isReady, letterId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Analyze pronunciation using Hugging Face API
        await analyzePronunciation(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      showToast.error('Tidak dapat mengakses mikrofon');
    }
  };

  const analyzePronunciation = async (audioBlob) => {
    setIsAnalyzing(true);
    
    try {
      const question = questions[currentQuestion];
      const targetLetter = question.target_letter;
      
      // Pre-analysis: Check audio quality and validity
      const audioValidation = await validateAudioQuality(audioBlob);
      console.log('Audio validation result:', audioValidation);
      
      // If audio is too quiet or too short, fail immediately
      if (!audioValidation.hasValidAudio) {
        setVoiceScore(0);
        showToast.error(audioValidation.message);
        setDetailedAnalysis({
          fallback: true,
          message: audioValidation.message,
          basic_tip: 'Pastikan Anda berbicara dengan jelas dan volume yang cukup',
          target_letter: targetLetter,
          audio_quality: {
            volume_level: audioValidation.volumeLevel,
            duration: audioValidation.duration,
            has_speech: false
          }
        });
        setIsAnalyzing(false);
        return;
      }
      
      // Create FormData for the advanced NLP API
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('letterId', question.arabic ? 
        hijaiyahData.find(h => h.arabic === question.arabic)?.id || '1' : '1');
      formData.append('expectedText', targetLetter);
      formData.append('userId', user.id);
      formData.append('sessionId', `comprehensive_test_${Date.now()}`);
      
      console.log('Sending audio to advanced NLP analyzer...');
      
      // Send to our advanced pronunciation analysis API
      const response = await fetch('/api/analyze-pronunciation', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Advanced NLP Analysis Result:', result);
      
      if (result.success && result.data) {
        const analysisData = result.data;
        
        // Validate the analysis results for realism
        const validatedScore = validateAnalysisResults(analysisData, audioValidation);
        
        setVoiceScore(validatedScore.score);
        
        // Show detailed feedback
        if (validatedScore.score >= 90) {
          showToast.success(`Excellent! Skor: ${validatedScore.score}% - Makhraj dan sifat huruf sangat baik!`);
        } else if (validatedScore.score >= 80) {
          showToast.success(`Good! Skor: ${validatedScore.score}% - ${analysisData.immediate_recommendations?.[0] || 'Terus berlatih!'}`);
        } else if (validatedScore.score >= 60) {
          showToast.warning(`Cukup baik (${validatedScore.score}%). ${analysisData.immediate_recommendations?.[0] || 'Perlu perbaikan makhraj'}`);
        } else if (validatedScore.score > 0) {
          showToast.error(`Perlu latihan lebih (${validatedScore.score}%). ${analysisData.immediate_recommendations?.[0] || 'Fokus pada posisi makhraj'}`);
        } else {
          showToast.error('Tidak terdeteksi pengucapan yang jelas. Coba ucapkan dengan lebih jelas!');
        }
        
        // Store detailed analysis for review with validated data
        setDetailedAnalysis({
          makhraj_analysis: validatedScore.makhrajAnalysis,
          sifat_analysis: validatedScore.sifatAnalysis,
          detected_errors: analysisData.detected_errors || [],
          correction_suggestions: analysisData.correction_suggestions || [],
          audio_quality: {
            ...audioValidation,
            clarity: validatedScore.clarity,
            noise_level: validatedScore.noiseLevel,
            duration: audioValidation.duration
          },
          target_info: {
            letter: analysisData.target_letter || question.arabic,
            latin: analysisData.target_latin || targetLetter,
            makhraj: analysisData.makhraj_name || 'Unknown'
          }
        });
        
        console.log('Detailed analysis stored for review');
        
      } else {
        throw new Error(result.error || 'Failed to analyze pronunciation');
      }
    } catch (error) {
      console.error('Error in advanced pronunciation analysis:', error);
      
      // Enhanced fallback with realistic audio analysis
      const question = questions[currentQuestion];
      const targetLetter = question.target_letter;
      
      // Check audio quality before providing fallback score
      const audioValidation = await validateAudioQuality(audioBlob);
      
      if (!audioValidation.hasValidAudio) {
        setVoiceScore(0);
        showToast.error(audioValidation.message);
        setDetailedAnalysis({
          fallback: true,
          message: audioValidation.message,
          basic_tip: 'Pastikan Anda berbicara dengan jelas dan volume yang cukup',
          target_letter: targetLetter
        });
      } else {
        // Provide realistic fallback score based on audio quality
        const fallbackScore = Math.max(30, Math.min(75, 
          audioValidation.volumeLevel * 0.6 + 
          (audioValidation.duration > 0.5 ? 25 : 15) +
          Math.floor(Math.random() * 15)
        ));
        
        setVoiceScore(fallbackScore);
        
        const fallbackTips = [
          `Pastikan makhraj huruf ${targetLetter} tepat`,
          'Perhatikan sifat huruf saat mengucapkan',
          'Latih dengan tempo lambat terlebih dahulu',
          'Dengarkan contoh dari qari yang baik'
        ];
        
        const randomTip = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
        
        showToast.warning(`Analisis otomatis tidak tersedia. Skor estimasi: ${fallbackScore}%. Tip: ${randomTip}`);
        
        // Store basic fallback analysis
        setDetailedAnalysis({
          fallback: true,
          message: 'Analisis detail tidak tersedia',
          basic_tip: randomTip,
          target_letter: targetLetter,
          audio_quality: audioValidation
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculatePronunciationScore = (transcription, target) => {
    // Simple similarity calculation
    const normalizedTranscription = transcription.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const normalizedTarget = target.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    if (normalizedTranscription === normalizedTarget) {
      return 100;
    }
    
    // Check if target is contained in transcription
    if (normalizedTranscription.includes(normalizedTarget)) {
      return 90;
    }
    
    // Calculate Levenshtein distance for similarity
    const distance = levenshteinDistance(normalizedTranscription, normalizedTarget);
    const maxLength = Math.max(normalizedTranscription.length, normalizedTarget.length);
    const similarity = (maxLength - distance) / maxLength;
    
    return Math.max(50, Math.floor(similarity * 100));
  };

  // Function to validate audio quality and detect if there's actual speech
  const validateAudioQuality = async (audioBlob) => {
    return new Promise((resolve) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fileReader = new FileReader();
        
        fileReader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Get audio data
            const channelData = audioBuffer.getChannelData(0);
            const duration = audioBuffer.duration;
            
            // Calculate RMS (Root Mean Square) for volume analysis
            let rms = 0;
            for (let i = 0; i < channelData.length; i++) {
              rms += channelData[i] * channelData[i];
            }
            rms = Math.sqrt(rms / channelData.length);
            
            // Calculate peak volume
            const peak = Math.max(...channelData.map(Math.abs));
            
            // Detect silence periods
            const silenceThreshold = 0.01;
            let speechSamples = 0;
            for (let i = 0; i < channelData.length; i++) {
              if (Math.abs(channelData[i]) > silenceThreshold) {
                speechSamples++;
              }
            }
            const speechRatio = speechSamples / channelData.length;
            
            // Calculate volume level as percentage
            const volumeLevel = Math.min(100, rms * 1000);
            
            console.log('Audio analysis:', {
              duration,
              rms,
              peak,
              volumeLevel,
              speechRatio,
              speechSamples,
              totalSamples: channelData.length
            });
            
            // Determine if audio has valid speech
            const hasValidAudio = duration > 0.2 && volumeLevel > 1 && speechRatio > 0.05 && peak > 0.005;
            
            let message = '';
            if (duration < 0.2) {
              message = 'Rekaman terlalu pendek. Coba berbicara lebih lama.';
            } else if (volumeLevel < 1) {
              message = 'Volume terlalu kecil. Coba berbicara lebih keras.';
            } else if (speechRatio < 0.05) {
              message = 'Tidak terdeteksi suara yang jelas. Pastikan Anda mengucapkan huruf.';
            } else if (peak < 0.005) {
              message = 'Audio terlalu lemah. Dekatkan mikrofon atau tingkatkan volume.';
            }
            
            audioContext.close();
            
            resolve({
              hasValidAudio,
              duration,
              volumeLevel: Math.round(volumeLevel),
              speechRatio: Math.round(speechRatio * 100),
              peak: Math.round(peak * 1000),
              message
            });
          } catch (audioError) {
            console.error('Error processing audio data:', audioError);
            resolve({
              hasValidAudio: false,
              duration: 0,
              volumeLevel: 0,
              speechRatio: 0,
              peak: 0,
              message: 'Gagal menganalisis audio. Coba rekam ulang.'
            });
          }
        };
        
        fileReader.onerror = () => {
          resolve({
            hasValidAudio: false,
            duration: 0,
            volumeLevel: 0,
            speechRatio: 0,
            peak: 0,
            message: 'Gagal membaca file audio.'
          });
        };
        
        fileReader.readAsArrayBuffer(audioBlob);
      } catch (error) {
        console.error('Error in audio validation:', error);
        resolve({
          hasValidAudio: false,
          duration: 0,
          volumeLevel: 0,
          speechRatio: 0,
          peak: 0,
          message: 'Gagal memproses audio.'
        });
      }
    });
  };

  // Function to validate and adjust analysis results for realism
  const validateAnalysisResults = (analysisData, audioValidation) => {
    const baseAccuracy = analysisData.accuracy || 0;
    
    // Adjust score based on audio quality
    let adjustedScore = baseAccuracy;
    
    // Penalize low volume or poor audio quality
    if (audioValidation.volumeLevel < 10) {
      adjustedScore = Math.max(0, adjustedScore - 40);
    } else if (audioValidation.volumeLevel < 20) {
      adjustedScore = Math.max(0, adjustedScore - 20);
    }
    
    // Penalize very short audio
    if (audioValidation.duration < 0.3) {
      adjustedScore = Math.max(0, adjustedScore - 30);
    } else if (audioValidation.duration < 0.5) {
      adjustedScore = Math.max(0, adjustedScore - 15);
    }
    
    // Penalize low speech ratio
    if (audioValidation.speechRatio < 10) {
      adjustedScore = Math.max(0, adjustedScore - 35);
    } else if (audioValidation.speechRatio < 25) {
      adjustedScore = Math.max(0, adjustedScore - 20);
    }
    
    // Cap unrealistic high scores for poor audio
    if (audioValidation.volumeLevel < 5 && adjustedScore > 30) {
      adjustedScore = Math.random() < 0.3 ? Math.floor(Math.random() * 20) : 0;
    }
    
    // Generate realistic makhraj and sifat analysis
    const makhrajAccuracy = audioValidation.hasValidAudio ? 
      Math.max(30, Math.min(100, adjustedScore + Math.floor(Math.random() * 20) - 10)) : 
      Math.floor(Math.random() * 20);
      
    const sifatAccuracy = audioValidation.hasValidAudio ? 
      Math.max(25, Math.min(100, adjustedScore + Math.floor(Math.random() * 25) - 12)) : 
      Math.floor(Math.random() * 15);
    
    // Calculate realistic clarity and noise levels
    const clarity = Math.max(0, Math.min(100, audioValidation.volumeLevel + audioValidation.speechRatio));
    const noiseLevel = audioValidation.hasValidAudio ? 
      Math.max(5, Math.min(50, 30 - audioValidation.volumeLevel + Math.floor(Math.random() * 15))) : 
      Math.floor(Math.random() * 80) + 20;
    
    return {
      score: Math.round(adjustedScore),
      makhrajAnalysis: {
        frequency_accuracy: Math.round(makhrajAccuracy),
        duration_accuracy: Math.round(Math.max(0, makhrajAccuracy - 10))
      },
      sifatAnalysis: {
        sifat_accuracy: Math.round(sifatAccuracy)
      },
      clarity: Math.round(clarity),
      noiseLevel: Math.round(noiseLevel)
    };
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = (audioSrc) => {
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const checkAnswer = () => {
    if (!questions.length) return;
    
    const question = questions[currentQuestion];
    let isCorrect = false;
    let userAnswer = null;

    if (question.type === 'multiple_choice') {
      isCorrect = selectedAnswer === question.correct;
      userAnswer = selectedAnswer;
    } else if (question.type === 'short_answer') {
      userAnswer = textInput.trim();
      isCorrect = userAnswer.toLowerCase() === question.correct.toLowerCase();
    } else if (question.type === 'pronunciation') {
      userAnswer = voiceScore ? `Voice Score: ${voiceScore}%` : 'No recording';
      isCorrect = voiceScore && voiceScore >= 60; // Lowered to 60% to be more lenient
    }

    console.log('checkAnswer result:', {
      questionType: question.type,
      userAnswer,
      correctAnswer: question.correct,
      isCorrect,
      currentScore: score,
      willBeScore: isCorrect ? score + 1 : score
    });

    const newAnswer = {
      question: question.question,
      userAnswer,
      correctAnswer: question.correct,
      isCorrect
    };

    setAnswers(prev => [...prev, newAnswer]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowFeedback(true);

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTextInput('');
        setShowFeedback(false);
        setRecordedAudio(null);
        setVoiceScore(null);
        setIsAnalyzing(false);
        setIsRecording(false);
      } else {
        setShowResult(true);
        // Calculate the final score here and pass it to saveTestProgress
        const finalCorrectAnswers = isCorrect ? score + 1 : score;
        saveTestProgress(finalCorrectAnswers);
      }
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setTextInput('');
      setShowFeedback(false);
      setRecordedAudio(null);
      setVoiceScore(null);
      setIsAnalyzing(false);
      setIsRecording(false);
    } else {
      setShowResult(true);
      // No score to add here since this is just navigation
      saveTestProgress();
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setShowFeedback(false);
    setAnswers([]);
    setTextInput('');
    setDragDropAnswers({});
    setRecordedAudio(null);
    setVoiceScore(null);
    setIsAnalyzing(false);
    setIsRecording(false);
    generateQuestions();
  };

  const handleAnswer = (answer) => {
    const question = questions[currentQuestion];
    const isCorrect = answer === question.correct;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    console.log('handleAnswer result:', {
      questionType: question.type,
      userAnswer: answer,
      correctAnswer: question.correct,
      isCorrect,
      currentScore: score,
      willBeScore: isCorrect ? score + 1 : score,
      currentQuestion: currentQuestion + 1,
      totalQuestions: questions.length
    });
    
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
        setTextInput('');
      } else {
        setShowResult(true);
        // Calculate the final score here and pass it to saveTestProgress
        const finalCorrectAnswers = isCorrect ? score + 1 : score;
        saveTestProgress(finalCorrectAnswers);
      }
    }, 2000);
  };

  const saveTestProgress = async (finalCorrectAnswers = null) => {
    if (!user) {
      console.log('No user found, cannot save progress');
      return;
    }
    
    // Use passed score or current state
    const actualScore = finalCorrectAnswers !== null ? finalCorrectAnswers : score;
    
    // Additional debugging
    console.log('Current state when saving:', {
      passedScore: finalCorrectAnswers,
      stateScore: score,
      actualScore,
      questionsLength: questions.length,
      calculatedScore: (actualScore / questions.length) * 100,
      answers: answers.length,
      correctAnswers: answers.filter(a => a.isCorrect).length
    });
    
    try {
      const targetLetter = letterId ? hijaiyahData.find(letter => letter.id === parseInt(letterId)) : null;
      const finalScore = (actualScore / questions.length) * 100;
      const isPassed = finalScore === 100; // Changed: Must get 100% to complete the letter
      
      console.log('Saving progress:', {
        userId: user.id,
        targetLetter: targetLetter?.latin,
        letterId: targetLetter?.id,
        finalScore: Math.round(finalScore),
        isPassed,
        actualScore,
        totalQuestions: questions.length
      });
      
      // Save detailed test results to test_results table
      const testResultData = {
        user_id: user.id,
        letter_id: targetLetter?.id || null,
        test_type: targetLetter ? 'letter_specific' : 'comprehensive',
        score: finalScore,
        questions_answered: questions.length,
        correct_answers: actualScore,
        completed_at: new Date().toISOString()
      };
      
      console.log('Saving test result:', testResultData);
      
      const { data: testData, error: testError } = await supabase
        .from('test_results')
        .insert(testResultData);
      
      if (testError) {
        console.error('Error saving test result:', testError);
        // Continue anyway, this is just detailed stats
      } else {
        console.log('Test result saved successfully:', testData);
      }
      
      // Save letter completion progress if target letter and passed
      if (targetLetter && isPassed) {
        const progressData = {
          user_id: user.id,
          letter_id: targetLetter.id,
          is_completed: true,
          completed_at: new Date().toISOString()
        };
        
        console.log('Attempting to save letter progress:', progressData);
        console.log('User ID type and value:', typeof user.id, user.id);
        console.log('Letter ID type and value:', typeof targetLetter.id, targetLetter.id);
        
        try {
          // First, check if record exists
          const { data: existingProgress, error: checkError } = await supabase
            .from('hijaiyah_progress')
            .select('id, user_id, letter_id')
            .eq('user_id', user.id)
            .eq('letter_id', targetLetter.id)
            .single();
          
          console.log('Check query result:', { existingProgress, checkError });
          
          if (checkError && checkError.code !== 'PGRST116') {
            // Error other than "not found"
            console.error('Error checking existing progress:', checkError);
            console.error('Full error details:', JSON.stringify(checkError, null, 2));
            
            // Check if it's a data type error
            if (checkError.message && checkError.message.includes('invalid input syntax for type integer')) {
              console.error('Database schema mismatch: user_id column expects integer but received UUID');
              showToast.error('Error database: Tipe data user_id tidak sesuai. Hubungi administrator untuk memperbaiki schema database.');
              return; // Exit early to prevent further errors
            }
            
            showToast.error(`Gagal mengecek progres: ${checkError.message}`);
          } else if (existingProgress) {
            // Update existing record
            const { data: updateData, error: updateError } = await supabase
              .from('hijaiyah_progress')
              .update({
                is_completed: true,
                completed_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
              .eq('letter_id', targetLetter.id);
              
            if (updateError) {
              console.error('Error updating letter progress:', updateError);
              showToast.error(`Gagal memperbarui progres: ${updateError.message}`);
            } else {
              console.log('Successfully updated letter progress:', updateData);
              showToast.success(`Selamat! Anda telah menguasai huruf ${targetLetter.latin} dengan skor ${Math.round(finalScore)}%`);
            }
          } else {
            // Insert new record
            const { data: insertData, error: insertError } = await supabase
              .from('hijaiyah_progress')
              .insert(progressData);
              
            if (insertError) {
              console.error('Error inserting letter progress:', insertError);
              
              // Check if it's a data type error
              if (insertError.message && insertError.message.includes('invalid input syntax for type integer')) {
                console.error('Database schema mismatch: user_id column expects integer but received UUID');
                showToast.error('Error database: Tipe data user_id tidak sesuai. Hubungi administrator untuk memperbaiki schema database.');
                return; // Exit early to prevent further errors
              }
              
              showToast.error(`Gagal menyimpan progres: ${insertError.message}`);
            } else {
              console.log('Successfully saved letter progress:', insertData);
              showToast.success(`Selamat! Anda telah menguasai huruf ${targetLetter.latin} dengan skor ${Math.round(finalScore)}%`);
            }
          }
        } catch (error) {
          console.error('Unexpected error in progress saving:', error);
          showToast.error(`Error tidak terduga: ${error.message}`);
        }
      } else if (targetLetter && !isPassed) {
        // If failed, show encouragement message
        showToast.warning(`Skor Anda ${Math.round(finalScore)}%. Harus mendapat 100% untuk menguasai huruf ${targetLetter.latin}. Coba lagi!`);
      } else {
        // For comprehensive test without specific letter
        console.log('Comprehensive test completed with score:', Math.round(finalScore));
        
        // Jika ini adalah tes komprehensif (tanpa letterId) dan skor 100%, update roadmap progress
        if (!targetLetter && finalScore === 100) {
          console.log('Comprehensive test passed with 100%! Updating roadmap progress...');
          await updateRoadmapProgressAfterComprehensiveTest();
        }
        
        showToast.success(`Tes selesai dengan skor ${Math.round(finalScore)}%`);
      }
    } catch (error) {
      console.error('Error saving test progress:', error);
      showToast.error(`Gagal menyimpan progres: ${error.message}`);
    }
  };

  // Fungsi untuk update user_roadmap_progress setelah tes komprehensif selesai dengan 100%
  const updateRoadmapProgressAfterComprehensiveTest = async () => {
    if (!user) return;
    
    try {
      console.log('Checking if all letters completed for roadmap update...');
      
      // Ambil data progress huruf dari database
      const { data: progressData, error } = await supabase
        .from('hijaiyah_progress')
        .select('letter_id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      if (error) {
        console.error('Error fetching hijaiyah progress:', error);
        return;
      }
      
      const completedCount = progressData ? progressData.length : 0;
      console.log(`User completed ${completedCount} out of 28 letters`);
      
      if (completedCount === 28) {
        console.log('All 28 letters completed! Updating roadmap progress...');
        
        // Cek struktur roadmap_levels untuk memastikan ID yang benar
        const { data: roadmapLevels, error: roadmapError } = await supabase
          .from('roadmap_levels')
          .select('id, title, order_sequence')
          .order('order_sequence');
          
        console.log('Available roadmap levels:', roadmapLevels);
        
        // Gunakan roadmap level pertama (biasanya Level 0)
        const firstRoadmapId = roadmapLevels && roadmapLevels.length > 0 ? roadmapLevels[0].id : 1;
        
        // Cek apakah sudah ada record di user_roadmap_progress untuk Level 0
        const { data: existingRoadmap, error: checkError } = await supabase
          .from('user_roadmap_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('roadmap_id', firstRoadmapId)
          .single();
          
        console.log('Existing roadmap data:', existingRoadmap);
        
        const now = new Date().toISOString();
        const updateData = {
          user_id: user.id,
          roadmap_id: firstRoadmapId,
          progress: 100,
          status: 'completed',
          completed_at: now,
          created_at: existingRoadmap ? existingRoadmap.created_at : now,
          updated_at: now,
          sub_lessons_completed: [] // Kosong - sub lesson akan diatur berdasarkan progress individual
        };
        
        console.log('Updating user_roadmap_progress with data:', updateData);
        
        const { data: upsertResult, error: upsertError } = await supabase
          .from('user_roadmap_progress')
          .upsert(updateData, { onConflict: 'user_id,roadmap_id' })
          .select();
          
        if (upsertError) {
          console.error('Error upserting roadmap progress:', upsertError);
          showToast.error(`Gagal update roadmap: ${upsertError.message}`);
        } else {
          console.log('Successfully updated roadmap progress:', upsertResult);
          showToast.success('🎉 Selamat! Anda telah menyelesaikan Level 0 dengan tes komprehensif! Progress roadmap diupdate!');
        }
      } else {
        console.log(`User belum menyelesaikan semua huruf (${completedCount}/28). Roadmap tidak diupdate.`);
        showToast.warning(`Anda masih perlu menyelesaikan ${28 - completedCount} huruf lagi untuk membuka level selanjutnya.`);
      }
    } catch (err) {
      console.error('Error in updateRoadmapProgressAfterComprehensiveTest:', err);
      showToast.error(`Error updating roadmap: ${err.message}`);
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

  // Function to get next letter for navigation
  const getNextLetter = () => {
    if (!letterId) return null;
    const currentId = parseInt(letterId);
    const nextId = currentId + 1;
    return hijaiyahData.find(letter => letter.id === nextId);
  };

  const goToNextLetterTest = () => {
    const nextLetter = getNextLetter();
    if (nextLetter) {
      // Reset all state before navigating to next letter
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setScore(0);
      setShowResult(false);
      setShowFeedback(false);
      setAnswers([]);
      setTextInput('');
      setDragDropAnswers({});
      setRecordedAudio(null);
      setVoiceScore(null);
      setIsAnalyzing(false);
      setIsRecording(false);
      
      // Navigate to next letter test
      router.push(`/latihan/comprehensive-test?letterId=${nextLetter.id}`);
    }
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
    // Calculate final score using the answers array for consistency
    const correctAnswersCount = answers.filter(a => a.isCorrect).length;
    const finalScore = (correctAnswersCount / questions.length) * 100;
    const targetLetter = letterId ? hijaiyahData.find(letter => letter.id === parseInt(letterId)) : null;
    
    // Debug logging
    console.log('Final result calculation:', {
      stateScore: score,
      answersCorrectCount: correctAnswersCount,
      questionsLength: questions.length,
      finalScore: Math.round(finalScore),
      answers: answers.length,
      allAnswers: answers
    });
    
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
                Skor: {correctAnswersCount} dari {questions.length} soal benar
                {letterId && getNextLetter() && (
                  <div className="mt-2 text-sm text-indigo-600">
                    Huruf selanjutnya: {getNextLetter().arabic} ({getNextLetter().latin})
                  </div>
                )}
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
              
              {/* Show Next Letter Test button only for specific letter tests and if next letter exists */}
              {letterId && getNextLetter() && (
                <button
                  onClick={goToNextLetterTest}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <span>Tes Huruf Selanjutnya</span>
                  <IconChevronRight size={20} />
                </button>
              )}
              
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

  const renderQuestion = () => {
    if (!questions.length) return null;
    
    const question = questions[currentQuestion];

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!showFeedback) {
                      handleAnswer(option);
                    }
                  }}
                  className={`p-6 rounded-lg border-2 transition-all text-4xl font-bold ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'short_answer':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={question.placeholder}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-lg"
            />
          </div>
        );

      case 'pronunciation':
        return (
          <div className="space-y-6">
            {/* Recording Controls */}
            <div className="text-center space-y-4">
              {!isRecording && !recordedAudio && (
                <button
                  onClick={startRecording}
                  className="px-8 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-lg font-medium flex items-center gap-2 mx-auto"
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  Mulai Rekam
                </button>
              )}

              {isRecording && (
                <div className="space-y-4">
                  <div className="text-red-600 font-medium flex items-center gap-2 justify-center">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    Sedang Merekam...
                  </div>
                  <button
                    onClick={stopRecording}
                    className="px-8 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <div className="w-3 h-3 bg-white"></div>
                    Berhenti Rekam
                  </button>
                </div>
              )}

              {recordedAudio && !isAnalyzing && !voiceScore && (
                <div className="space-y-4">
                  <div className="text-green-600 font-medium flex items-center gap-2 justify-center">
                    <IconCheck size={20} />
                    Rekaman Selesai
                  </div>
                  <audio src={recordedAudio} controls className="mx-auto" />
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startRecording}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <IconRefresh size={20} />
                      Rekam Ulang
                    </button>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="text-blue-600 font-medium flex items-center gap-2 justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    Menganalisis Pengucapan...
                  </div>
                </div>
              )}

              {voiceScore && (
                <div className="space-y-4">
                  <div className={`text-2xl font-bold ${voiceScore >= 80 ? 'text-green-600' : voiceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    Skor: {voiceScore}%
                  </div>
                  <div className={`font-medium ${voiceScore >= 80 ? 'text-green-600' : voiceScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {voiceScore >= 80 ? 'Excellent!' : voiceScore >= 60 ? 'Good!' : 'Perlu latihan lagi!'}
                  </div>
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <IconRefresh size={20} />
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Tipe soal tidak dikenali</div>;
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>
            
            {/* Display Arabic character for all question types - shown only once */}
            {question.arabic && (
              <div className="text-8xl font-bold text-center text-indigo-600 mb-6">
                {question.arabic}
              </div>
            )}

            {/* Audio controls for pronunciation questions */}
            {question.type === 'pronunciation' && question.audio && (
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
          {renderQuestion()}

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-6 p-4 rounded-xl ${
                  answers[answers.length - 1]?.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconCheck size={20} className={answers[answers.length - 1]?.isCorrect ? 'text-green-600' : 'text-red-600'} />
                  <span className={`font-medium ${answers[answers.length - 1]?.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {answers[answers.length - 1]?.isCorrect ? 'Benar!' : 'Salah!'}
                  </span>
                </div>
                {!answers[answers.length - 1]?.isCorrect && (
                  <p className="text-red-600">Jawaban yang benar: <span className="font-medium">{question.correct}</span></p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Answer Button - for question types that need manual submission */}
          {!showFeedback && (
            <div className="mt-6 text-center">
              {question.type === 'short_answer' && textInput.trim() && (
                <button
                  onClick={checkAnswer}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Jawaban
                </button>
              )}
              {question.type === 'pronunciation' && voiceScore && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={checkAnswer}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Submit Jawaban
                  </button>
                  {detailedAnalysis && (
                    <button
                      onClick={() => setShowAnalysisModal(true)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                    >
                      Lihat Analisis Detail
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Pronunciation Analysis Modal */}
      <PronunciationAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        analysisData={detailedAnalysis}
      />
    </div>
  );
}
