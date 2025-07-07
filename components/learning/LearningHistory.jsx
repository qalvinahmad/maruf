import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const LearningHistory = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('progress');
  const [errorFilter, setErrorFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorHistory, setErrorHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user errors from database
  const fetchUserErrors = async () => {
    if (!user?.id) {
      console.log('No user ID found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching errors for user:', user.id);
      
      // First, try to get simple incorrect answers
      const { data: simpleAnswers, error: simpleError } = await supabase
        .from('user_answers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_correct', false)
        .order('answered_at', { ascending: false });

      console.log('Simple incorrect answers:', simpleAnswers);
      console.log('Simple query error:', simpleError);

      if (simpleError) {
        console.error('Error fetching simple answers:', simpleError);
        setLoading(false);
        return;
      }

      if (simpleAnswers && simpleAnswers.length > 0) {
        // If we have simple data, try to get detailed data with questions
        const { data: allAnswers, error: allAnswersError } = await supabase
          .from('user_answers')
          .select(`
            id,
            question_id,
            selected_option_id,
            is_correct,
            answered_at,
            questions (
              id,
              question_text,
              category,
              difficulty,
              options (
                id,
                option_text,
                is_correct
              )
            )
          `)
          .eq('user_id', user.id)
          .order('answered_at', { ascending: false });

        console.log('All answers with questions:', allAnswers);
        console.log('Detailed query error:', allAnswersError);

        if (allAnswersError) {
          console.error('Error fetching detailed answers:', allAnswersError);
          // Fallback to simple data
          const fallbackErrors = simpleAnswers.map((answer, index) => ({
            id: answer.id,
            type: 'answer_error',
            title: `Kesalahan pada Soal ID ${answer.question_id}`,
            description: `Jawaban salah pada soal ID ${answer.question_id}`,
            lesson: 'Pelajaran Makhraj',
            question_text: '',
            time: formatTimeAgo(answer.answered_at),
            severity: 'medium',
            attempts: 1,
            resolved: false,
            question_id: answer.question_id
          }));
          setErrorHistory(fallbackErrors);
          setLoading(false);
          return;
        }

        // Filter only incorrect answers
        const incorrectAnswers = allAnswers?.filter(answer => !answer.is_correct) || [];
        console.log('Incorrect answers:', incorrectAnswers);

        // Transform data to match our component structure
        const transformedErrors = incorrectAnswers?.map((answer, index) => {
          const question = answer.questions;
          const correctOption = question?.options?.find(opt => opt.is_correct);
          const selectedOption = question?.options?.find(opt => opt.id === answer.selected_option_id);
          
          // Count how many times user got this question wrong
          const errorCount = incorrectAnswers.filter(a => a.question_id === answer.question_id).length;
          
          // Check if user answered correctly after this error
          const laterCorrectAnswer = allAnswers?.find(a => 
            a.question_id === answer.question_id && 
            a.is_correct === true && 
            new Date(a.answered_at) > new Date(answer.answered_at)
          );
          
          // Determine severity based on error count and difficulty
          let severity = 'low';
          if (errorCount >= 3 || question?.difficulty === 'hard') severity = 'high';
          else if (errorCount >= 2 || question?.difficulty === 'medium') severity = 'medium';

          return {
            id: answer.id,
            type: 'answer_error',
            title: `Kesalahan pada Soal ${question?.category || 'Makhraj'}`,
            description: `Jawaban yang dipilih: "${selectedOption?.option_text || 'Tidak diketahui'}" | Jawaban yang benar: "${correctOption?.option_text || 'Tidak diketahui'}"`,
            lesson: question?.category || 'Pelajaran Makhraj',
            question_text: question?.question_text || '',
            time: formatTimeAgo(answer.answered_at),
            severity: severity,
            attempts: errorCount,
            resolved: !!laterCorrectAnswer,
            question_id: answer.question_id
          };
        }) || [];

        // Remove duplicates by question_id (keep the latest error for each question)
        const uniqueErrors = transformedErrors.reduce((acc, current) => {
          const existingError = acc.find(error => error.question_id === current.question_id);
          if (!existingError) {
            acc.push(current);
          } else {
            // Keep the more recent error if timestamps are different
            if (new Date(current.time) > new Date(existingError.time)) {
              const index = acc.findIndex(error => error.question_id === current.question_id);
              acc[index] = current;
            }
          }
          return acc;
        }, []);

        console.log('Final unique errors:', uniqueErrors);
        setErrorHistory(uniqueErrors);
      } else {
        console.log('No incorrect answers found');
        setErrorHistory([]);
      }
    } catch (error) {
      console.error('Error fetching user errors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format time ago helper
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const answerTime = new Date(timestamp);
    const diffInMilliseconds = now - answerTime;
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    return `${Math.floor(diffInDays / 7)} minggu yang lalu`;
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchUserErrors();
  }, [user?.id]);

  // Mock data untuk statistik
  const learningStats = {
    totalStudyTime: '24 jam',
    dailyStreak: 8,
    lettersLearned: 15,
    totalPoints: 1250,
    completionRate: 35,
    averageScore: 87
  };

  // Mock data untuk aktivitas
  const recentActivities = [
    {
      id: 1,
      type: 'completion',
      title: 'Menyelesaikan Pelajaran Ba',
      description: 'Berhasil menguasai huruf Ba dengan skor 95%',
      time: '2 jam yang lalu',
      icon: '📚',
      color: 'blue'
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Mendapatkan Lencana "Konsisten 7 Hari"',
      description: 'Belajar rutin selama 7 hari berturut-turut',
      time: 'Kemarin, 20:15',
      icon: '🏆',
      color: 'green'
    },
    {
      id: 3,
      type: 'level-up',
      title: 'Naik ke Level 3',
      description: 'Mencapai total 1000 XP',
      time: '2 hari yang lalu',
      icon: '📈',
      color: 'purple'
    },
    {
      id: 4,
      type: 'class',
      title: 'Mengikuti Kelas Live "Makhraj Huruf"',
      description: 'Sesi pembelajaran interaktif dengan Ustadz Ahmad',
      time: '3 hari yang lalu',
      icon: '📅',
      color: 'orange'
    }
  ];

  // Enhanced severity styling with better contrast
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high': return {
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-700 border border-red-200'
      };
      case 'medium': return {
        bg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700 border border-amber-200'
      };
      case 'low': return {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-700 border border-green-200'
      };
      default: return {
        bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
        border: 'border-slate-200',
        text: 'text-slate-700',
        icon: 'text-slate-600',
        badge: 'bg-slate-100 text-slate-700 border border-slate-200'
      };
    }
  };

  // Enhanced activity styling
  const getActivityStyle = (color) => {
    const styles = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-100 to-blue-200',
        text: 'text-blue-600',
        icon: 'text-blue-700'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-100 to-emerald-200',
        text: 'text-green-600',
        icon: 'text-green-700'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-100 to-violet-200',
        text: 'text-purple-600',
        icon: 'text-purple-700'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-100 to-amber-200',
        text: 'text-orange-600',
        icon: 'text-orange-700'
      }
    };
    return styles[color] || styles.blue;
  };

  // Filter errors based on search and severity
  const getFilteredErrors = () => {
    let filtered = errorHistory;

    if (searchTerm) {
      filtered = filtered.filter(error => 
        error.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.lesson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (errorFilter !== 'all') {
      if (errorFilter === 'resolved') {
        filtered = filtered.filter(error => error.resolved);
      } else if (errorFilter === 'unresolved') {
        filtered = filtered.filter(error => !error.resolved);
      } else {
        filtered = filtered.filter(error => error.severity === errorFilter);
      }
    }

    return filtered;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen font-inter antialiased">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-8"
      >
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">📊 Riwayat Belajar</h2>
                <p className="text-slate-600 text-sm font-medium">Analisis progres dan identifikasi area perbaikan</p>
              </div>
              
              {/* Enhanced Sub Tabs */}
              <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-slate-200">
                <button
                  onClick={() => setActiveSubTab('progress')}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    activeSubTab === 'progress'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  📊
                  Progress & Statistik
                </button>
                <button
                  onClick={() => setActiveSubTab('errors')}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    activeSubTab === 'errors'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  ⚠️
                  Riwayat Kesalahan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeSubTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Enhanced Overall Progress */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      🎯
                      Penyelesaian Keseluruhan
                    </h3>
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {learningStats.completionRate}%
                    </span>
                  </div>
                  
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full shadow-sm relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${learningStats.completionRate}%` }}
                      transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                    </motion.div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Pemula</span>
                    <span>Menengah</span>
                    <span>Mahir</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Enhanced Statistics Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      📊
                    </div>
                    Statistik Belajar
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        🕒
                        <p className="text-xs text-blue-700 font-medium uppercase tracking-wide">Total Waktu</p>
                      </div>
                      <p className="text-xl font-bold text-blue-700">{learningStats.totalStudyTime}</p>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        ⭐
                        <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Streak Harian</p>
                      </div>
                      <p className="text-xl font-bold text-green-700">{learningStats.dailyStreak} hari</p>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4 border border-purple-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        📖
                        <p className="text-xs text-purple-700 font-medium uppercase tracking-wide">Huruf Dikuasai</p>
                      </div>
                      <p className="text-xl font-bold text-purple-700">{learningStats.lettersLearned}/28</p>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-4 border border-amber-200"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        🏆
                        <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Rata-rata Skor</p>
                      </div>
                      <p className="text-xl font-bold text-amber-700">{learningStats.averageScore}%</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Activities Card */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      📈
                    </div>
                    Aktivitas Terakhir
                  </h3>
                  
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {recentActivities.slice(0, 3).map((activity, index) => {
                      const style = getActivityStyle(activity.color);
                      return (
                        <motion.div 
                          key={activity.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.bg} shadow-sm flex-shrink-0`}>
                            <div className={style.icon}>{activity.icon}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activity.description}</p>
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                              🕒
                              {activity.time}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'errors' && (
            <motion.div
              key="errors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Enhanced Search and Filter Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔍</span>
                      <input
                        type="text"
                        placeholder="Cari kesalahan, pelajaran, atau deskripsi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔽</span>
                      <select 
                        value={errorFilter}
                        onChange={(e) => setErrorFilter(e.target.value)}
                        className="pl-10 pr-8 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer min-w-[150px]"
                      >
                        <option value="all">Semua Kesalahan</option>
                        <option value="high">Tingkat Tinggi</option>
                        <option value="medium">Tingkat Sedang</option>
                        <option value="low">Tingkat Rendah</option>
                        <option value="resolved">Sudah Diperbaiki</option>
                        <option value="unresolved">Belum Diperbaiki</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Menampilkan {getFilteredErrors().length} dari {errorHistory.length} kesalahan
                      {searchTerm && (
                        <span className="ml-2 text-blue-600 font-medium">
                          untuk "{searchTerm}"
                        </span>
                      )}
                    </span>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span>Tinggi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <span>Sedang</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Rendah</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Error History */}
              <div className="space-y-4">
                {loading ? (
                  // Loading State
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="animate-pulse">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-slate-200 rounded w-full mb-3"></div>
                              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {getFilteredErrors().map((error, index) => {
                      const severityStyle = getSeverityStyle(error.severity);
                      return (
                        <motion.div
                          key={error.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`${severityStyle.bg} border-2 ${severityStyle.border} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
                        >
                          {/* Background pattern */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl ${severityStyle.badge} flex items-center justify-center flex-shrink-0`}>
                                  ⚠️
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className={`font-bold text-lg ${severityStyle.text}`}>{error.title}</h3>
                                    {error.resolved ? (
                                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium border border-green-200">
                                        ✅
                                        Diperbaiki
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium border border-red-200">
                                        ⚠️
                                        Perlu Diperbaiki
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-sm leading-relaxed mb-3 ${severityStyle.text}`}>
                                    {error.description}
                                  </p>
                                  {error.question_text && (
                                    <div className={`mt-3 p-3 rounded-lg ${severityStyle.badge}`}>
                                      <div className="text-xs font-medium uppercase tracking-wide mb-1">Soal:</div>
                                      <div className="text-sm font-medium">{error.question_text}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Error Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className={`${severityStyle.badge} rounded-lg p-3`}>
                                <div className="flex items-center gap-2 mb-1">
                                  📚
                                  <span className="text-xs font-medium uppercase tracking-wide">Pelajaran</span>
                                </div>
                                <span className="text-sm font-semibold">{error.lesson}</span>
                              </div>
                              
                              <div className={`${severityStyle.badge} rounded-lg p-3`}>
                                <div className="flex items-center gap-2 mb-1">
                                  🕒
                                  <span className="text-xs font-medium uppercase tracking-wide">Waktu</span>
                                </div>
                                <span className="text-sm font-semibold">{error.time}</span>
                              </div>
                            </div>

                            {/* Error Metrics */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  🔄
                                  <span className={severityStyle.text}><strong>{error.attempts}</strong> kali salah</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  🎯
                                  <span className={`${severityStyle.text} capitalize`}>Tingkat <strong>{error.severity}</strong></span>
                                </div>
                              </div>
                              
                              {!error.resolved && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    // Navigate to practice this specific question
                                    console.log('Practice question:', error.question_id);
                                  }}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                  🔄
                                  Latihan Ulang
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Enhanced Empty State */}
              {!loading && getFilteredErrors().length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      {errorHistory.length === 0 ? '🎉' : '🔍'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">
                        {errorHistory.length === 0 ? 'Tidak Ada Kesalahan!' : 'Tidak Ada Kesalahan Ditemukan'}
                      </h3>
                      <p className="text-slate-500 max-w-md mx-auto mb-4">
                        {errorHistory.length === 0 
                          ? 'Hebat! Anda belum melakukan kesalahan dalam menjawab soal.'
                          : searchTerm 
                            ? `Tidak ada kesalahan yang cocok dengan pencarian "${searchTerm}".`
                            : 'Tidak ada kesalahan yang sesuai dengan filter yang dipilih.'
                        }
                      </p>
                      {(searchTerm || errorFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setErrorFilter('all');
                          }}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Tips Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    💡
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 mb-3">💡 Tips Perbaikan</h4>
                    <ul className="text-sm text-blue-800 space-y-2 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Latih makhraj huruf secara teratur dengan rekaman audio untuk meningkatkan akurasi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Perlambat tempo membaca untuk fokus pada pelafalan yang benar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Ulangi latihan pada huruf yang sering salah hingga dikuasai sepenuhnya</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Minta feedback dari pengajar atau gunakan fitur rekaman untuk evaluasi mandiri</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LearningHistory;