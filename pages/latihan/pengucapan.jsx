import { IconArrowLeft, IconMicrophone, IconPlayerPlay, IconPlayerStop, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const isServer = typeof window === 'undefined';

const LatihanPengucapan = () => {
  const router = useRouter();
  const { huruf, nama, deskripsi, kategori } = router.query;
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showTips, setShowTips] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  
  useEffect(() => {
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
  }, []);
  
  // Fungsi untuk memulai rekaman
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // Simulasi feedback
        const randomScore = Math.floor(Math.random() * 100) + 1;
        let feedbackText = '';
        let feedbackColor = '';
        
        if (randomScore >= 80) {
          feedbackText = 'Pengucapan sangat baik!';
          feedbackColor = 'text-green-600';
        } else if (randomScore >= 60) {
          feedbackText = 'Pengucapan cukup baik, terus berlatih!';
          feedbackColor = 'text-yellow-600';
        } else {
          feedbackText = 'Perlu latihan lebih lanjut';
          feedbackColor = 'text-red-600';
        }
        
        setFeedback({
          score: randomScore,
          text: feedbackText,
          color: feedbackColor
        });
        
        // Hentikan semua track pada stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setShowTips(false);
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
  
  return (
    <div className="bg-gray-50 min-h-screen font-poppins">
      <Head>
        <title>Latihan Pengucapan Huruf {nama || 'Hijaiyah'} - Ma'ruf</title>
        <meta name="description" content={`Latihan pengucapan huruf ${nama || 'hijaiyah'}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={goBack}
            className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <IconArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Latihan Pengucapan</h1>
            <p className="text-gray-600">Berlatih mengucapkan huruf dengan benar</p>
          </div>
        </div>
        
        {/* Kartu Huruf */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="text-8xl font-bold text-secondary mb-4">{huruf || 'ا'}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{nama || 'Alif'}</h2>
              <p className="text-gray-600 mb-4">{deskripsi || 'Huruf pertama dalam abjad Arab'}</p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {kategori || 'Dasar'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AnimatePresence>
                  {isPlaying ? (
                    <motion.div
                      initial={{ scale: 1 }}
                      animate ={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-secondary/10 rounded-full"
                    ></motion.div>
                  ) : null}
                </AnimatePresence>
                <button 
                  onClick={playExampleAudio}
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isPlaying ? 'bg-secondary text-white' : 'bg-secondary/90 text-white hover:bg-secondary'
                  } transition-colors shadow-md`}
                >
                  {isPlaying ? <IconPlayerStop size={24} /> : <IconPlayerPlay size={24} />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  {isMuted ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
                </button>
                <span className="text-sm text-gray-600">
                  {isPlaying ? 'Memutar contoh...' : 'Dengarkan contoh'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Area Rekaman */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Rekam Pengucapan Anda</h3>
          
          {showTips && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
              <p className="text-blue-800">
                <span className="font-semibold">Tips:</span> Ucapkan huruf dengan jelas dan lantang. Pastikan mikrofon Anda berfungsi dengan baik.
              </p>
            </div>
          )}
          
          <div className="flex flex-col items-center py-6">
            <div className="relative w-40 h-40 mb-6">
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-red-500/20 rounded-full"
                  ></motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`absolute inset-0 rounded-full flex items-center justify-center shadow-lg ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-secondary text-white hover:bg-secondary/90'
                } transition-colors`}
              >
                <IconMicrophone size={40} />
                <span className="absolute bottom-6 text-sm font-medium">
                  {isRecording ? 'Berhenti' : 'Mulai Rekam'}
                </span>
              </button>
            </div>
            
            {recordedAudio && (
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">Hasil Rekaman</h4>
                  <button 
                    onClick={playRecording}
                    className="flex items-center gap-1 text-secondary hover:text-secondary/80 transition-colors"
                  >
                    <IconPlayerPlay size={16} />
                    <span className="text-sm">Putar</span>
                  </button>
                </div>
                <div className="bg-gray-100 rounded-lg h-12 w-full relative overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-secondary/70"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Hasil Evaluasi</h3>
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E6E6E6"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={feedback.score >= 80 ? "#48BB78" : feedback.score >= 60 ? "#ECC94B" : "#F56565"}
                        strokeWidth="3"
                        strokeDasharray={`${feedback.score}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{feedback.score}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className={`text-xl font-bold ${feedback.color} mb-2`}>{feedback.text}</h4>
                  <p className="text-gray-600 mb-4">
                    {feedback.score >= 80 
                      ? 'Pengucapan Anda sudah sangat baik! Lanjutkan ke huruf berikutnya.' 
                      : feedback.score >= 60 
                        ? 'Pengucapan Anda cukup baik, namun masih perlu sedikit perbaikan.' 
                        : 'Pengucapan Anda masih perlu banyak latihan. Dengarkan contoh dan coba lagi.'}
                  </p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={startRecording}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                    >
                      Coba Lagi
                    </button>
                    <button 
                      onClick={goBack}
                      className="px-4 py-2 bg-secondary hover:bg-secondary/90 rounded-lg text-white transition-colors"
                    >
                      Kembali ke Daftar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default dynamic(() => Promise.resolve(LatihanPengucapan), {
  ssr: false
});