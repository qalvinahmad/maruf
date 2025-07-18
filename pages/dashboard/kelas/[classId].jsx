import { IconArrowLeft, IconArrowRight, IconBook, IconClock, IconStar, IconTrophy, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const ClassPage = () => {
  const router = useRouter();
  const { classId } = router.query;
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [classCompleted, setClassCompleted] = useState(false);

  // Sample class materials - in real app, this would come from database
  const classMaterials = {
    1: {
      id: 1,
      title: "Pengenalan Makhrojul Huruf",
      description: "Memahami dasar-dasar makhrojul huruf dalam Al-Quran",
      sections: [
        {
          id: 1,
          title: "Pengertian Makhrojul Huruf",
          content: `
            <h3>Apa itu Makhrojul Huruf?</h3>
            <p>Makhrojul huruf adalah tempat-tempat keluarnya huruf-huruf hijaiyah ketika diucapkan. Setiap huruf memiliki tempat keluarnya masing-masing yang berbeda.</p>
            
            <h4>Pentingnya Mempelajari Makhrojul Huruf:</h4>
            <ul>
              <li>Membantu pengucapan huruf yang benar</li>
              <li>Meningkatkan kualitas bacaan Al-Quran</li>
              <li>Menghindari kesalahan dalam membaca</li>
            </ul>
            
            <div class="info-box">
              <strong>Tahukah Anda?</strong> Terdapat 17 makhraj utama dalam huruf hijaiyah.
            </div>
          `,
          duration: "5 menit"
        },
        {
          id: 2,
          title: "Pembagian Makhrojul Huruf",
          content: `
            <h3>Lima Kelompok Makhraj Utama</h3>
            
            <h4>1. Al-Jauf (Rongga Mulut)</h4>
            <p>Huruf: ا، و، ي (huruf mad)</p>
            
            <h4>2. Al-Halq (Tenggorokan)</h4>
            <p>Huruf: ء، ه، ع، ح، غ، خ</p>
            
            <h4>3. Al-Lisan (Lidah)</h4>
            <p>Huruf: ق، ك، ج، ش، ي، ض، ل، ن، ر، ط، د، ت، ص، ز، س، ث، ذ، ظ</p>
            
            <h4>4. Asy-Syafatan (Bibir)</h4>
            <p>Huruf: ف، ب، م، و</p>
            
            <h4>5. Al-Khaisyum (Hidung)</h4>
            <p>Untuk ghunnah (dengung)</p>
            
            <div class="practice-box">
              <strong>Latihan:</strong> Coba ucapkan setiap huruf dengan memperhatikan tempat keluarnya.
            </div>
          `,
          duration: "8 menit"
        },
        {
          id: 3,
          title: "Praktik Pengucapan",
          content: `
            <h3>Cara Berlatih Makhrojul Huruf</h3>
            
            <h4>Langkah-langkah Berlatih:</h4>
            <ol>
              <li><strong>Posisi Duduk:</strong> Duduk tegak dengan punggung lurus</li>
              <li><strong>Pernapasan:</strong> Tarik napas dalam-dalam</li>
              <li><strong>Fokus:</strong> Konsentrasi pada tempat keluarnya huruf</li>
              <li><strong>Pengucapan:</strong> Ucapkan huruf dengan jelas dan pelan</li>
            </ol>
            
            <h4>Tips Berlatih:</h4>
            <ul>
              <li>Berlatih di depan cermin</li>
              <li>Rekam suara sendiri untuk evaluasi</li>
              <li>Berlatih bersama teman atau guru</li>
              <li>Konsisten berlatih setiap hari</li>
            </ul>
            
            <div class="warning-box">
              <strong>Perhatian:</strong> Jangan terburu-buru. Kualitas lebih penting daripada kecepatan.
            </div>
          `,
          duration: "10 menit"
        }
      ],
      quiz: {
        questions: [
          {
            id: 1,
            question: "Apa yang dimaksud dengan makhrojul huruf?",
            options: [
              "Cara membaca huruf dengan benar",
              "Tempat keluarnya huruf-huruf hijaiyah",
              "Suara yang dihasilkan oleh huruf",
              "Bentuk tulisan huruf hijaiyah"
            ],
            correct: 1
          },
          {
            id: 2,
            question: "Berapa jumlah makhraj utama dalam huruf hijaiyah?",
            options: ["15", "17", "19", "21"],
            correct: 1
          },
          {
            id: 3,
            question: "Huruf ا، و، ي termasuk dalam makhraj...",
            options: ["Al-Jauf", "Al-Halq", "Al-Lisan", "Asy-Syafatan"],
            correct: 0
          },
          {
            id: 4,
            question: "Makhraj Al-Halq adalah tempat keluarnya huruf dari...",
            options: ["Lidah", "Bibir", "Tenggorokan", "Hidung"],
            correct: 2
          },
          {
            id: 5,
            question: "Mengapa penting mempelajari makhrojul huruf?",
            options: [
              "Untuk menulis Arab dengan baik",
              "Untuk memahami tata bahasa Arab",
              "Untuk pengucapan huruf yang benar",
              "Untuk menghafal Al-Quran lebih cepat"
            ],
            correct: 2
          }
        ]
      }
    },
    // Add more classes as needed
  };

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) return;
      
      try {
        setLoading(true);
        
        // Fetch class data from database
        const { data, error } = await supabase
          .from('class')
          .select('*')
          .eq('id', classId)
          .single();
        
        if (error) {
          console.error('Error fetching class:', error);
          return;
        }
        
        setClassData(data);
        
        // Get class materials (in real app, this would come from database)
        const materials = classMaterials[classId];
        if (materials) {
          setClassData(prev => ({ ...prev, ...materials }));
        }
        
        // Check if class is already completed
        const progress = localStorage.getItem('classProgress');
        if (progress) {
          const progressData = JSON.parse(progress);
          if (progressData[classId] === 100) {
            setClassCompleted(true);
          }
        }
        
      } catch (error) {
        console.error('Error loading class:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [classId]);

  const handleSectionComplete = (sectionId) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
  };

  const handleNextSection = () => {
    if (currentSection < classData.sections.length - 1) {
      handleSectionComplete(currentSection + 1);
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleQuizAnswer = (questionId, answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answerIndex
    });
  };

  const handleQuizSubmit = async () => {
    const questions = classData.quiz.questions;
    let correct = 0;
    
    questions.forEach(question => {
      if (quizAnswers[question.id] === question.correct) {
        correct++;
      }
    });
    
    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    
    // Save progress if passed (70% or higher)
    if (score >= 70) {
      const progress = localStorage.getItem('classProgress');
      const progressData = progress ? JSON.parse(progress) : {};
      progressData[classId] = 100;
      localStorage.setItem('classProgress', JSON.stringify(progressData));
      
      // Update user XP and points
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('xp, points')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            await supabase
              .from('profiles')
              .update({
                xp: profile.xp + classData.exp,
                points: profile.points + classData.points
              })
              .eq('id', user.id);
          }
        } catch (error) {
          console.error('Error updating user progress:', error);
        }
      }
      
      setClassCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat kelas...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <IconX size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Kelas Tidak Ditemukan</h2>
          <p className="text-slate-600 mb-4">Kelas yang Anda cari tidak tersedia.</p>
          <button
            onClick={() => router.push('/dashboard/DashboardBelajar')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Daftar Kelas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Head>
        <title>{classData.title} • Makhrojul Huruf</title>
        <meta name="description" content={classData.description} />
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
                <h1 className="text-xl font-bold text-slate-800">{classData.title}</h1>
                <p className="text-sm text-slate-600">{classData.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <IconClock size={16} />
                {!showQuiz ? classData.sections[currentSection]?.duration : '10 menit'}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <IconBook size={16} />
                {!showQuiz ? `${currentSection + 1}/${classData.sections.length}` : 'Kuis'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              {showQuiz ? 'Kuis Final' : `Bagian ${currentSection + 1}: ${classData.sections[currentSection]?.title}`}
            </span>
            <span className="text-sm text-slate-600">
              {showQuiz ? '100%' : `${Math.round(((currentSection + 1) / classData.sections.length) * 100)}%`}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: showQuiz ? '100%' : `${((currentSection + 1) / classData.sections.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!showQuiz ? (
            // Material Content
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            >
              <div className="p-8">
                <div 
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: classData.sections[currentSection]?.content }}
                />
              </div>
              
              {/* Navigation */}
              <div className="bg-slate-50 px-8 py-6 flex items-center justify-between">
                <button
                  onClick={handlePrevSection}
                  disabled={currentSection === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentSection === 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <IconArrowLeft size={16} />
                  Sebelumnya
                </button>
                
                <div className="text-sm text-slate-600">
                  {currentSection + 1} dari {classData.sections.length} bagian
                </div>
                
                <button
                  onClick={handleNextSection}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentSection === classData.sections.length - 1 ? 'Lanjut ke Kuis' : 'Selanjutnya'}
                  <IconArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ) : (
            // Quiz Content
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Kuis Final</h2>
                <p className="text-blue-100">Jawab semua pertanyaan untuk menyelesaikan kelas ini</p>
              </div>
              
              <div className="p-8">
                {!quizSubmitted ? (
                  <div className="space-y-8">
                    {classData.quiz.questions.map((question, index) => (
                      <div key={question.id} className="border-b border-slate-200 pb-6 last:border-b-0">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                          {index + 1}. {question.question}
                        </h3>
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <label
                              key={optionIndex}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                quizAnswers[question.id] === optionIndex
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={optionIndex}
                                checked={quizAnswers[question.id] === optionIndex}
                                onChange={() => handleQuizAnswer(question.id, optionIndex)}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-slate-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length < classData.quiz.questions.length}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Submit Jawaban
                      </button>
                    </div>
                  </div>
                ) : (
                  // Quiz Results
                  <div className="text-center py-8">
                    <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                      quizScore >= 70 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {quizScore >= 70 ? (
                        <IconTrophy size={48} className="text-green-600" />
                      ) : (
                        <IconX size={48} className="text-red-600" />
                      )}
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-2 ${
                      quizScore >= 70 ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {quizScore >= 70 ? 'Selamat!' : 'Belum Berhasil'}
                    </h3>
                    
                    <p className="text-slate-600 mb-4">
                      Skor Anda: <span className="font-bold text-2xl">{quizScore}%</span>
                    </p>
                    
                    <p className="text-slate-600 mb-8">
                      {quizScore >= 70 
                        ? 'Anda telah menyelesaikan kelas ini dengan baik!'
                        : 'Skor minimum untuk lulus adalah 70%. Silakan coba lagi.'
                      }
                    </p>
                    
                    {quizScore >= 70 && (
                      <div className="bg-green-50 rounded-lg p-6 mb-6">
                        <h4 className="font-semibold text-green-800 mb-3">Reward yang Diperoleh:</h4>
                        <div className="flex items-center justify-center gap-6">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <IconTrophy size={24} className="text-white" />
                            </div>
                            <div className="text-sm text-slate-600">XP</div>
                            <div className="font-bold text-blue-600">+{classData.exp}</div>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <IconStar size={24} className="text-white" />
                            </div>
                            <div className="text-sm text-slate-600">Poin</div>
                            <div className="font-bold text-amber-600">+{classData.points}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4 justify-center">
                      {quizScore < 70 && (
                        <button
                          onClick={() => {
                            setQuizSubmitted(false);
                            setQuizAnswers({});
                            setQuizScore(0);
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Coba Lagi
                        </button>
                      )}
                      <button
                        onClick={() => router.push('/dashboard/DashboardBelajar')}
                        className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        Kembali ke Daftar Kelas
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClassPage;
