import { IconArrowLeft, IconAward, IconMicrophone, IconPlayerPlay, IconPlayerStop, IconRefresh, IconStar, IconTrophy, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const EventPage = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const { user } = useAuth();
  const [eventData, setEventData] = useState(null);
  const [pronunciationTests, setPronunciationTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTest, setCurrentTest] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [eventCompleted, setEventCompleted] = useState(false);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [error, setError] = useState(null);
  const [userEventResult, setUserEventResult] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId || !user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch event data from database
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        
        if (eventError) {
          console.error('Error fetching event:', eventError);
          setError('Event tidak ditemukan');
          return;
        }
        
        setEventData(event);
        
        // Fetch pronunciation tests for this event
        const response = await fetch(`/api/events/${eventId}/tests`);
        const testsData = await response.json();
        
        if (!testsData.success) {
          console.error('Error fetching tests:', testsData.error);
          setError('Gagal memuat soal tes');
          return;
        }
        
        setPronunciationTests(testsData.tests || []);
        
        // Check if user has already started/completed this event
        const resultsResponse = await fetch(`/api/events/${eventId}/results?userId=${user.id}`);
        const resultsData = await resultsResponse.json();
        
        if (resultsData.success && resultsData.userResult) {
          setUserEventResult(resultsData.userResult);
          
          if (resultsData.userResult.status === 'completed') {
            // User has completed the event, show results
            setEventCompleted(true);
            setShowResults(true);
            setOverallScore(resultsData.userResult.overall_score);
            
            // Convert test details to results format
            const convertedResults = resultsData.userResult.event_test_details.map(detail => ({
              testId: detail.test_id,
              arabicText: detail.event_pronunciation_tests.arabic_text,
              transliteration: detail.event_pronunciation_tests.transliteration,
              translation: detail.event_pronunciation_tests.translation,
              transcription: detail.user_transcription,
              expectedSound: detail.event_pronunciation_tests.expected_sound,
              score: detail.score,
              difficulty: detail.event_pronunciation_tests.difficulty
            }));
            
            setTestResults(convertedResults);
          } else if (resultsData.userResult.status === 'in_progress') {
            // User has started but not completed, resume from where they left off
            setCurrentTest(resultsData.userResult.completed_tests || 0);
            
            // Load existing test results
            const existingResults = resultsData.userResult.event_test_details.map(detail => ({
              testId: detail.test_id,
              arabicText: detail.event_pronunciation_tests.arabic_text,
              transliteration: detail.event_pronunciation_tests.transliteration,
              translation: detail.event_pronunciation_tests.translation,
              transcription: detail.user_transcription,
              expectedSound: detail.event_pronunciation_tests.expected_sound,
              score: detail.score,
              difficulty: detail.event_pronunciation_tests.difficulty
            }));
            
            setTestResults(existingResults);
          }
        }
        
      } catch (error) {
        console.error('Error loading event:', error);
        setError('Gagal memuat event');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId, user]);

  const startRecording = useCallback(async () => {
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
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Tidak dapat mengakses microphone. Pastikan izin telah diberikan.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const playAudio = useCallback(() => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  }, [audioBlob]);

  const submitAudio = useCallback(async () => {
    if (!audioBlob || !user) return;
    
    setProcessingAudio(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      console.log('Submitting audio blob:', audioBlob.size, 'bytes');
      
      // Send to server for transcription
      const response = await fetch('http://localhost:3000/transkrip?model=whisper', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let the browser set it with boundary for FormData
        }
      });
      
      console.log('Server response status:', response.status);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = 'Gagal memproses audio';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('Server error details:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          // Try to get text response
          try {
            const errorText = await response.text();
            console.error('Server error text:', errorText);
          } catch (textError) {
            console.error('Could not get error text:', textError);
          }
        }
        
        // Provide specific error messages based on status code
        if (response.status === 503) {
          errorMessage = 'Model AI sedang loading, silakan coba lagi dalam beberapa detik';
        } else if (response.status === 429) {
          errorMessage = 'Terlalu banyak permintaan, silakan tunggu sebentar';
        } else if (response.status === 500) {
          errorMessage = 'Kesalahan server, silakan coba lagi';
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Transcription result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal memproses audio');
      }
      
      const transcribedText = result.hasil || '';
      
      if (!transcribedText) {
        throw new Error('Tidak ada hasil transkripsi. Silakan coba lagi dengan suara yang lebih jelas.');
      }
      
      setTranscription(transcribedText);
      
      // Calculate score based on similarity
      const currentTestData = pronunciationTests[currentTest];
      const score = calculatePronunciationScore(transcribedText, currentTestData.expected_sound);
      
      // Submit test result to database
      const submitResponse = await fetch(`/api/events/${eventId}/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          testId: currentTestData.id,
          userTranscription: transcribedText,
          score: score,
          audioBlobUrl: null // Could upload audio to storage if needed
        })
      });
      
      const submitData = await submitResponse.json();
      
      if (!submitData.success) {
        throw new Error(submitData.error || 'Gagal menyimpan hasil tes');
      }
      
      const testResult = {
        testId: currentTestData.id,
        arabicText: currentTestData.arabic_text,
        transliteration: currentTestData.transliteration,
        translation: currentTestData.translation,
        transcription: transcribedText,
        expectedSound: currentTestData.expected_sound,
        score: score,
        difficulty: currentTestData.difficulty
      };
      
      setTestResults(prev => [...prev, testResult]);
      setUserEventResult(submitData.userResult);
      
      // Move to next test after 3 seconds
      setTimeout(() => {
        if (currentTest < pronunciationTests.length - 1) {
          setCurrentTest(prev => prev + 1);
          setAudioBlob(null);
          setTranscription('');
        } else {
          // All tests completed
          completeEvent(submitData.userResult);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      
      if (error.message.includes('fetch')) {
        userMessage = 'Tidak dapat terhubung ke server. Pastikan server AI berjalan di localhost:3000';
      } else if (error.message.includes('NetworkError')) {
        userMessage = 'Masalah koneksi jaringan. Periksa koneksi internet Anda.';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Timeout memproses audio. Silakan coba dengan audio yang lebih pendek.';
      }
      
      setError(userMessage);
      
      // Provide retry suggestion
      setTimeout(() => {
        setError(prev => prev + '\n\nSilakan coba lagi atau gunakan audio yang lebih pendek.');
      }, 2000);
      
    } finally {
      setProcessingAudio(false);
    }
  }, [audioBlob, currentTest, pronunciationTests, eventId, user]);

  const calculatePronunciationScore = (transcribed, expected) => {
    // Simple similarity calculation
    const transcribedWords = transcribed.toLowerCase().split(/\s+/);
    const expectedWords = expected.toLowerCase().split(/\s+/);
    
    let matches = 0;
    const maxLength = Math.max(transcribedWords.length, expectedWords.length);
    
    for (let i = 0; i < Math.min(transcribedWords.length, expectedWords.length); i++) {
      if (transcribedWords[i] === expectedWords[i]) {
        matches++;
      } else {
        // Check for partial matches
        const similarity = calculateStringSimilarity(transcribedWords[i], expectedWords[i]);
        if (similarity > 0.7) {
          matches += similarity;
        }
      }
    }
    
    return Math.min(100, Math.round((matches / maxLength) * 100));
  };

  const calculateStringSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
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

  const completeEvent = async (finalResult = null) => {
    const result = finalResult || userEventResult;
    if (result) {
      setOverallScore(result.overall_score);
      setShowResults(true);
      setEventCompleted(true);
    }
  };

  const retryTest = () => {
    setCurrentTest(0);
    setTestResults([]);
    setOverallScore(0);
    setShowResults(false);
    setAudioBlob(null);
    setTranscription('');
    setEventCompleted(false);
    setUserEventResult(null);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat event...</p>
        </div>
      </div>
    );
  }

  if (error && !eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <IconX size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Event Tidak Ditemukan</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/DashboardBelajar')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (pronunciationTests.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <IconX size={48} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Soal Tes</h2>
          <p className="text-slate-600 mb-6">
            Event <strong>"{eventData?.title}"</strong> belum memiliki soal pronunciation test. 
            Silakan hubungi admin untuk menambahkan soal tes atau kembali ke dashboard.
          </p>
          
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">💡 Untuk Admin</h3>
            <p className="text-sm text-blue-700 mb-4">
              Anda dapat menambahkan pronunciation tests untuk event ini melalui:
            </p>
            <ul className="text-sm text-blue-600 text-left space-y-2">
              <li>• Supabase Dashboard → tabel event_pronunciation_tests</li>
              <li>• API endpoint: POST /api/events/{eventId}/tests</li>
              <li>• Script database: database/add_pronunciation_tests.sql</li>
            </ul>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard/DashboardBelajar')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Dashboard
            </button>
            <button
              onClick={() => router.reload()}
              className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Head>
        <title>{eventData?.title} • Event Pronunciation Test</title>
        <meta name="description" content={eventData?.description} />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/DashboardBelajar')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <IconArrowLeft size={20} />
                Kembali
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{eventData?.title}</h1>
                <p className="text-sm text-slate-600">Tes Pengucapan Al-Quran</p>
              </div>
            </div>
            
            {!showResults && pronunciationTests.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">
                  Tes {currentTest + 1} dari {pronunciationTests.length}
                </div>
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentTest + 1) / pronunciationTests.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!showResults ? (
            // Pronunciation Test
            <motion.div
              key={currentTest}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            >
              {/* Test Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Tes Pengucapan #{currentTest + 1}</h2>
                    <p className="text-blue-100">Bacakan ayat berikut dengan benar</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-200">Tingkat Kesulitan</div>
                    <div className="text-lg font-semibold">{pronunciationTests[currentTest]?.difficulty}</div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Arabic Text */}
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-slate-800 mb-4 leading-relaxed" style={{ fontFamily: 'Arabic' }}>
                    {pronunciationTests[currentTest]?.arabic_text}
                  </div>
                  <div className="text-lg text-slate-600 mb-2">
                    {pronunciationTests[currentTest]?.transliteration}
                  </div>
                  <div className="text-sm text-slate-500">
                    {pronunciationTests[currentTest]?.translation}
                  </div>
                </div>

                {/* Recording Section */}
                <div className="bg-slate-50 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={processingAudio}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 ${
                          isRecording 
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } ${processingAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isRecording ? <IconPlayerStop size={24} /> : <IconMicrophone size={24} />}
                      </button>
                      
                      {audioBlob && (
                        <button
                          onClick={playAudio}
                          className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
                        >
                          <IconPlayerPlay size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="text-sm text-slate-600 mb-4">
                      {isRecording ? 'Sedang merekam... Tekan untuk berhenti' : 'Tekan untuk mulai merekam'}
                    </div>
                    
                    {audioBlob && !processingAudio && (
                      <button
                        onClick={submitAudio}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Kirim Audio
                      </button>
                    )}
                    
                    {processingAudio && (
                      <div className="flex items-center justify-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Memproses audio...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transcription Result */}
                {transcription && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 rounded-xl p-6 border border-blue-200"
                  >
                    <h3 className="font-semibold text-blue-800 mb-3">Hasil Transkripsi:</h3>
                    <div className="text-blue-700 mb-4">"{transcription}"</div>
                    <div className="text-sm text-blue-600">
                      Yang diharapkan: "{pronunciationTests[currentTest]?.expected_sound}"
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    <div className="flex items-start gap-2">
                      <IconX size={16} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium mb-1">Terjadi Kesalahan</div>
                        <div className="text-sm whitespace-pre-line">{error}</div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => setError(null)}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs transition-colors"
                          >
                            Tutup
                          </button>
                          <button
                            onClick={() => {
                              setError(null);
                              setAudioBlob(null);
                            }}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs transition-colors"
                          >
                            Rekam Ulang
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <audio ref={audioRef} style={{ display: 'none' }} />
            </motion.div>
          ) : (
            // Results Page
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            >
              {/* Results Header */}
              <div className={`p-6 text-center ${overallScore >= 70 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                  {overallScore >= 70 ? (
                    <IconTrophy size={48} className="text-white" />
                  ) : (
                    <IconRefresh size={48} className="text-white" />
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {overallScore >= 70 ? 'Selamat!' : 'Perlu Perbaikan'}
                </h2>
                <p className="text-lg mb-4">
                  Skor Anda: <span className="font-bold text-4xl">{overallScore}%</span>
                </p>
                <p className="text-white/90">
                  {overallScore >= 70 
                    ? 'Pengucapan Anda sudah sangat baik!' 
                    : 'Terus berlatih untuk meningkatkan pengucapan Anda'
                  }
                </p>
              </div>

              {/* Detailed Results */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Detail Hasil Tes</h3>
                
                <div className="space-y-4 mb-8">
                  {testResults.map((result, index) => (
                    <div key={result.testId} className={`p-4 rounded-xl border-2 ${getScoreBackground(result.score)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-slate-800">Tes #{index + 1}</div>
                        <div className={`font-bold ${getScoreColor(result.score)}`}>{result.score}%</div>
                      </div>
                      <div className="text-sm text-slate-600 mb-1">
                        <strong>Ayat:</strong> {result.arabicText}
                      </div>
                      <div className="text-sm text-slate-600 mb-1">
                        <strong>Anda ucapkan:</strong> "{result.transcription}"
                      </div>
                      <div className="text-sm text-slate-500">
                        <strong>Yang diharapkan:</strong> "{result.expectedSound}"
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rewards */}
                {overallScore >= 70 && (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <IconAward size={20} />
                      Reward yang Diperoleh
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <IconTrophy size={24} className="text-white" />
                        </div>
                        <div className="text-sm text-slate-600">XP</div>
                        <div className="font-bold text-blue-600">+{Math.round(overallScore * 0.5)}</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <IconStar size={24} className="text-white" />
                        </div>
                        <div className="text-sm text-slate-600">Poin</div>
                        <div className="font-bold text-amber-600">+{Math.round(overallScore * 0.3)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  {overallScore < 70 && (
                    <button
                      onClick={retryTest}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <IconRefresh size={16} />
                      Coba Lagi
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/dashboard/DashboardBelajar')}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default EventPage;
