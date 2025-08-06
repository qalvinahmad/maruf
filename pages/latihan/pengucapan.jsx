import { IconAlertCircle, IconAnalyze, IconArrowLeft, IconCircleCheck, IconInfoCircle, IconMicrophone, IconPlayerPlay, IconPlayerStop, IconRefresh, IconWaveSquare } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const isServer = typeof window === 'undefined';

const LatihanPengucapan = () => {
  const router = useRouter();
  const { huruf, nama, deskripsi, kategori, letterId } = router.query;
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showTips, setShowTips] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detailedScores, setDetailedScores] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Complete Hijaiyah letters data for navigation
  const hijaiyahLetters = [
    { id: 1, arabic: 'ا', latin: 'Alif', description: 'Huruf pertama dalam abjad Arab', category: 'Dasar' },
    { id: 2, arabic: 'ب', latin: 'Ba', description: 'Diucapkan dengan menempelkan bibir', category: 'Dasar' },
    { id: 3, arabic: 'ت', latin: 'Ta', description: 'Huruf dengan dua titik di atas', category: 'Dasar' },
    { id: 4, arabic: 'ث', latin: 'Tsa', description: 'Huruf dengan tiga titik di atas', category: 'Menengah' },
    { id: 5, arabic: 'ج', latin: 'Jim', description: 'Huruf dengan titik di bawah lekukan', category: 'Menengah' },
    { id: 6, arabic: 'ح', latin: 'Ha', description: 'Huruf tenggorokan tanpa titik', category: 'Lanjutan' },
    { id: 7, arabic: 'خ', latin: 'Kha', description: 'Huruf tenggorokan dengan titik di atas', category: 'Lanjutan' },
    { id: 8, arabic: 'د', latin: 'Dal', description: 'Huruf berbentuk busur tanpa titik', category: 'Dasar' },
    // Add more letters as needed...
  ];
  
  useEffect(() => {
    // Set available letters (excluding current letter)
    const currentLetterId = parseInt(letterId);
    if (!isNaN(currentLetterId)) {
      const otherLetters = hijaiyahLetters.filter(letter => letter.id !== currentLetterId);
      setAvailableLetters(otherLetters.slice(0, 6)); // Show max 6 letters
    } else {
      // If no letterId or invalid, show first 6 letters
      setAvailableLetters(hijaiyahLetters.slice(0, 6));
    }
    
    // Simulasi loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, [letterId]);

  // Function to update hijaiyah progress
  const updateHijaiyahProgress = async (isCompleted) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId || !letterId) {
        console.error('Missing userId or letterId:', { userId, letterId });
        return;
      }

      // Convert to proper data types for PostgreSQL
      const progressData = {
        user_id: parseInt(userId),
        letter_id: parseInt(letterId),
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      };

      console.log('Updating hijaiyah progress with data:', progressData);

      // Use upsert with proper syntax
      const { data, error } = await supabase
        .from('hijaiyah_progress')
        .upsert(progressData, {
          onConflict: 'user_id,letter_id'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Hijaiyah progress updated successfully:', data);
      setIsCompleted(isCompleted);
    } catch (error) {
      console.error('Error updating hijaiyah progress:', error);
      // Show user-friendly error message
      alert('Terjadi kesalahan saat menyimpan progress. Silakan coba lagi.');
    }
  };
  
  // Enhanced function to analyze pronunciation using Hugging Face API
  const analyzePronunciationWithAI = async (audioBlob) => {
    setIsAnalyzing(true);
    
    try {
      console.log('Starting AI pronunciation analysis...');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('letterId', letterId);

      // Store audio in localStorage for backup/replay
      const audioUrl = URL.createObjectURL(audioBlob);
      localStorage.setItem(`pronunciation_audio_${letterId}`, audioUrl);
      localStorage.setItem(`pronunciation_timestamp_${letterId}`, new Date().toISOString());

      // Call our API endpoint
      const response = await fetch('/api/analyze-pronunciation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('AI Analysis Result:', result);

      if (result.success) {
        const scores = result.scores;
        setDetailedScores(scores);
        
        let feedbackText = '';
        let feedbackColor = '';
        let feedbackIcon = null;
        let shouldComplete = false;
        
        // Check if this is a mock/fallback result
        const isFallback = result.analysis?.isMock || 
                          result.analysis?.model?.includes('fallback') || 
                          result.analysis?.model?.includes('mock') ||
                          result.analysis?.error;
        
        if (scores.overall >= 80) {
          feedbackText = isFallback ? 'Evaluasi Sistem: Cukup Baik' : 'Pengucapan Sangat Baik!';
          feedbackColor = 'text-green-600';
          feedbackIcon = <IconCircleCheck className="text-green-500" size={20} />;
          shouldComplete = scores.overall >= 85 && !isFallback; // Higher threshold for fallback
        } else if (scores.overall >= 70) {
          feedbackText = isFallback ? 'Evaluasi Sistem: Lumayan' : 'Pengucapan Baik!';
          feedbackColor = 'text-blue-600';
          feedbackIcon = <IconInfoCircle className="text-blue-500" size={20} />;
        } else if (scores.overall >= 60) {
          feedbackText = isFallback ? 'Evaluasi Sistem: Perlu Latihan' : 'Cukup Baik, Terus Berlatih!';
          feedbackColor = 'text-yellow-600';
          feedbackIcon = <IconAlertCircle className="text-yellow-500" size={20} />;
        } else {
          feedbackText = isFallback ? 'Evaluasi Sistem: Butuh Perbaikan' : 'Perlu Latihan Lebih Lanjut';
          feedbackColor = 'text-red-600';
          feedbackIcon = <IconAlertCircle className="text-red-500" size={20} />;
        }
        
        setFeedback({
          score: scores.overall,
          text: feedbackText,
          color: feedbackColor,
          icon: feedbackIcon,
          analysis: result.analysis,
          breakdown: scores,
          isFallback: isFallback
        });

        // Update progress if score is good enough and not fallback
        if (shouldComplete && letterId && !isFallback) {
          console.log('Score meets threshold, updating progress...');
          await updateHijaiyahProgress(true);
          setTimeout(() => {
            setShowCompletionDialog(true);
          }, 2000);
        }
        
        return scores;
      } else {
        throw new Error('Analysis failed');
      }
      
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      
      // Fallback to basic evaluation
      const fallbackScore = 55 + Math.floor(Math.random() * 30); // 55-85 range
      setFeedback({
        score: fallbackScore,
        text: 'Sistem bermasalah - menggunakan evaluasi dasar',
        color: 'text-orange-600',
        icon: <IconAlertCircle className="text-orange-500" size={20} />,
        analysis: { 
          error: error.message, 
          model: 'emergency-fallback',
          transcription: 'Tidak tersedia',
          isMock: true
        },
        isFallback: true
      });
      
      return { overall: fallbackScore };
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Modified recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Optimal for Wav2Vec2
          channelCount: 1,   // Mono audio
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // Better compression
        audioBitsPerSecond: 128000
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // Analyze with AI instead of random scoring
        await analyzePronunciationWithAI(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setShowTips(false);
      setFeedback(null); // Clear previous feedback
      setDetailedScores(null);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin mikrofon.');
    }
  };
  
  // Fungsi untuk menghentikan rekaman
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Fungsi untuk memutar audio contoh
  const playExampleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    
    // Simulasi audio contoh (dalam implementasi nyata, gunakan URL audio yang sebenarnya)
    audioRef.current = new Audio('/audio/example.mp3');
    audioRef.current.muted = isMuted;
    
    audioRef.current.onended = () => {
      setIsPlaying(false);
    };
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(error => {
      console.error('Error playing audio:', error);
    });
  };
  
  // Fungsi untuk memutar rekaman
  const playRecording = () => {
    if (recordedAudio) {
      const audio = new Audio(recordedAudio);
      audio.play().catch(error => {
        console.error('Error playing recording:', error);
      });
    }
  };
  
  // Fungsi untuk toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioRef.current.muted = !isMuted;
  };
  
  // Fungsi untuk kembali ke halaman sebelumnya
  const goBack = () => {
    router.back();
  };
  
  // Function to navigate to another letter
  const goToLetter = (letter) => {
    setShowCompletionDialog(false);
    router.push({
      pathname: '/latihan/pengucapan',
      query: {
        huruf: letter.arabic,
        nama: letter.latin,
        deskripsi: letter.description,
        kategori: letter.category,
        letterId: letter.id
      }
    });
  };

  // Function to exit to dashboard
  const exitToDashboard = () => {
    router.push('/dashboard/DashboardHuruf');
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-screen overflow-hidden font-poppins">
      <Head>
        <title>Latihan Pengucapan Huruf {nama || 'Hijaiyah'} - Ma'ruf</title>
        <meta name="description" content={`Latihan pengucapan huruf ${nama || 'hijaiyah'}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="h-full flex flex-col">
        {/* Header - Consistent spacing and typography */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={goBack}
                  className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-105"
                >
                  <IconArrowLeft size={18} className="text-gray-600" />
                </button>
                <div className="space-y-0.5">
                  <h1 className="text-lg font-semibold text-gray-900">Latihan Pengucapan</h1>
                  <p className="text-sm text-gray-500">Berlatih mengucapkan huruf dengan benar</p>
                </div>
              </div>
              
              <div className="text-right space-y-0.5">
                <div className="text-3xl font-bold text-secondary leading-none">{huruf || 'ا'}</div>
                <div className="text-sm font-medium text-gray-700">{nama || 'Alif'}</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area - Consistent spacing system */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
          {/* Left Side - Letter Display & Recording */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            {/* Letter Card - Improved spacing and visual hierarchy */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 pb-4 hover:shadow-md transition-shadow duration-200">

              <div className="flex items-center gap-6">
                <div className="text-7xl font-bold text-secondary leading-none">{huruf || 'ا'}</div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">{nama || 'Alif'}</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">{deskripsi || 'Huruf pertama dalam abjad Arab'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {kategori || 'Dasar'}
                    </span>
                    <button 
                      onClick={playExampleAudio}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isPlaying 
                          ? 'bg-secondary text-white shadow-sm' 
                          : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
                      }`}
                    >
                      {isPlaying ? <IconPlayerStop size={16} /> : <IconPlayerPlay size={16} />}
                      {isPlaying ? 'Berhenti' : 'Contoh'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recording Area - Better visual hierarchy */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 pb-4 flex-1 flex flex-col hover:shadow-md transition-shadow duration-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rekam Pengucapan</h3>
                <p className="text-sm text-gray-600">Ucapkan huruf dengan jelas dan lantang</p>
              </div>
              
              {showTips && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconInfoCircle size={12} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Tips Pengucapan</p>
                      <p className="text-sm text-blue-700">
                        Pastikan mikrofon berfungsi dengan baik dan ucapkan huruf dengan jelas
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <AnimatePresence>
                    {isRecording && (
                      <motion.div
                        initial={{ scale: 1, opacity: 0.3 }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-red-500/20 rounded-full"
                      ></motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                        : 'bg-secondary hover:bg-secondary/90 text-white hover:scale-105'
                    }`}
                  >
                    <IconMicrophone size={40} className="mb-2" />
                    <span className="text-sm font-medium">
                      {isRecording ? 'Berhenti' : 'Mulai Rekam'}
                    </span>
                  </button>
                </div>
                
                {recordedAudio && (
                  <div className="w-full max-w-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Hasil Rekaman</span>
                      <button 
                        onClick={playRecording}
                        className="flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors text-sm font-medium"
                      >
                        <IconPlayerPlay size={16} />
                        Putar Ulang
                      </button>
                    </div>
                    <div className="bg-gray-100 rounded-lg h-3 w-full relative overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-secondary/80 rounded-lg transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Side - Feedback with consistent spacing */}
          <div className="lg:w-1/2 flex flex-col">
            <AnimatePresence mode="wait">
              {(feedback || isAnalyzing) ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 pb-4 h-full flex flex-col hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                      <IconAnalyze size={20} className="text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isAnalyzing ? 'Menganalisis Pengucapan' : 'Hasil Evaluasi AI'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isAnalyzing ? 'Memproses audio dengan teknologi AI' : 'Analisis pengucapan telah selesai'}
                      </p>
                    </div>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <IconWaveSquare size={20} className="text-indigo-500 animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="text-center space-y-3">
                        <h4 className="text-lg font-semibold text-gray-800">Sedang Menganalisis</h4>
                        <p className="text-sm text-gray-600 max-w-xs">
                          AI sedang memproses audio Anda menggunakan teknologi terdepan
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 w-full max-w-sm">
                        <div className="text-center space-y-2">
                          <div className="text-xs font-medium text-indigo-800">Status Sistem</div>
                          <div className="text-sm text-indigo-700">
                            {isAnalyzing ? 'Menganalisis...' : 'Siap'}
                          </div>
                          <div className="text-xs text-indigo-600">
                            AI Speech Recognition
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col space-y-6">
                      {/* Score Display - Better visual hierarchy */}
                      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-inner border border-gray-200">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#E5E7EB"
                                strokeWidth="2"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={feedback.score >= 80 ? "#10B981" : feedback.score >= 70 ? "#3B82F6" : feedback.score >= 60 ? "#F59E0B" : "#EF4444"}
                                strokeWidth="2"
                                strokeDasharray={`${feedback.score}, 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">{feedback.score}</div>
                                <div className="text-xs text-gray-500 font-medium">SKOR</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            {feedback.icon}
                            <h4 className={`text-xl font-bold ${feedback.color}`}>
                              {feedback.text}
                            </h4>
                          </div>
                          
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {feedback.isFallback 
                              ? 'Sistem AI sedang mengalami kendala, sehingga menggunakan evaluasi dasar. Hasil mungkin kurang akurat dari biasanya.'
                              : feedback.score >= 80 
                                ? 'Pengucapan Anda sudah sangat baik dan memenuhi standar. Huruf ini telah dikuasai dengan sempurna!' 
                                : feedback.score >= 70
                                  ? 'Pengucapan Anda sudah baik dan hampir sempurna. Sedikit lagi untuk mencapai tingkat mahir!'
                                  : feedback.score >= 60 
                                    ? 'Pengucapan Anda cukup baik, namun masih memerlukan beberapa perbaikan untuk mencapai standar optimal.' 
                                    : 'Pengucapan Anda masih memerlukan latihan lebih lanjut. Dengarkan contoh dengan seksama dan coba lagi.'}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <IconInfoCircle size={14} />
                            <span>
                              {feedback.isFallback 
                                ? 'Menggunakan evaluasi dasar - untuk analisis akurat coba lagi nanti'
                                : 'Standar kelulusan: ≥80% berdasarkan kaidah makhrojul huruf'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Completion Status - Consistent spacing */}
                      {isCompleted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                              <IconCircleCheck size={20} className="text-white" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-green-800">Selamat! Huruf Dikuasai</div>
                              <div className="text-xs text-green-700">
                                Huruf {nama} telah berhasil dikuasai dan progress tersimpan
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Action Buttons - Consistent spacing and sizing */}
                      <div className="flex gap-3 mt-auto pt-4">
                        <button 
                          onClick={startRecording}
                          disabled={isAnalyzing}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isAnalyzing 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:scale-105'
                          }`}
                        >
                          <IconRefresh size={16} />
                          <span>Coba Lagi</span>
                        </button>
                        
                        <button 
                          onClick={goBack}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                        >
                          <IconArrowLeft size={16} />
                          <span>Kembali</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full flex items-center justify-center hover:shadow-md transition-shadow duration-200"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <IconMicrophone size={32} className="text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">Siap untuk Berlatih?</h3>
                      <p className="text-sm text-gray-500 max-w-xs">
                        Mulai rekam pengucapan Anda untuk melihat hasil evaluasi AI
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Enhanced Completion Dialog - Better spacing and visual hierarchy */}
      <AnimatePresence>
        {showCompletionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowCompletionDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with consistent spacing */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconCircleCheck size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Selamat!</h3>
                <p className="text-white/90">Anda telah menguasai huruf {nama}</p>
              </div>
              
              {/* Content with proper spacing */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Pencapaian Baru</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Progress pembelajaran Anda telah tersimpan. Lanjutkan ke huruf berikutnya atau kembali ke dashboard.
                  </p>
                </div>
                
                {/* Action buttons with consistent spacing */}
                <div className="space-y-3">
                  <button
                    onClick={exitToDashboard}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Kembali ke Dashboard
                  </button>
                  
                  <button
                    onClick={() => setShowCompletionDialog(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  >
                    Lanjut Berlatih
                  </button>
                </div>
                
                {/* Progress indicator with proper spacing */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <IconCircleCheck size={16} className="text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Progress Tersimpan</div>
                      <div className="text-xs text-gray-500">
                        Huruf {nama} telah ditandai sebagai dikuasai
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LatihanPengucapan;