import { IconCalendar, IconLetterA, IconTrophy } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const StatisticsCards = ({ profileData, streakCountdown, roadmapProgress, allSubLessons, hijaiyahProgress, userAnswers }) => {
  // Calculate statistics from roadmap progress data
  const calculateStats = () => {
    if (!roadmapProgress || roadmapProgress.length === 0) {
      return {
        totalLevels: 0,
        completedLevels: 0,
        totalSubLessons: 0,
        completedSubLessons: 0,
        overallProgress: 0,
        averageProgress: 0,
        currentLevel: 'Belum Mulai',
        accuracyRate: 0,
        totalAnswered: 0,
        correctAnswers: 0
      };
    }

    const totalLevels = roadmapProgress.length;
    const completedLevels = roadmapProgress.filter(item => item.progress === 100).length;
    
    // Calculate total sub lessons from allSubLessons data or roadmap_levels
    let totalSubLessons = 0;
    if (allSubLessons && allSubLessons.length > 0) {
      totalSubLessons = allSubLessons.length;
    } else {
      totalSubLessons = roadmapProgress.reduce((sum, item) => {
        return sum + (item.roadmap_levels?.lessons_total || 0);
      }, 0);
    }
    
    const completedSubLessons = roadmapProgress.reduce((sum, item) => {
      return sum + (item.sub_lessons_completed?.length || 0);
    }, 0);

    const totalProgress = roadmapProgress.reduce((sum, item) => sum + (item.progress || 0), 0);
    const averageProgress = totalLevels > 0 ? Math.round(totalProgress / totalLevels) : 0;
    
    const overallProgress = totalSubLessons > 0 ? Math.round((completedSubLessons / totalSubLessons) * 100) : 0;

    // Calculate accuracy from user_answers
    let accuracyRate = 0;
    let totalAnswered = 0;
    let correctAnswers = 0;

    if (userAnswers && userAnswers.length > 0) {
      totalAnswered = userAnswers.length;
      correctAnswers = userAnswers.filter(answer => answer.is_correct).length;
      accuracyRate = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    }

    // Determine current level based on hijaiyah progress and roadmap completion
    let currentLevel = 'Belum Mulai';
    
    if (hijaiyahProgress && hijaiyahProgress.length > 0) {
      const completedHijaiyah = hijaiyahProgress.filter(item => item.is_completed).length;
      const totalHijaiyah = 28; // Total Arabic letters
      
      if (completedHijaiyah === 0) {
        currentLevel = 'Belum Mulai';
      } else if (completedHijaiyah < totalHijaiyah) {
        currentLevel = 'Dasar'; // Still learning basic hijaiyah
      } else if (completedHijaiyah === totalHijaiyah) {
        // Hijaiyah complete, check roadmap progress
        if (completedSubLessons >= 13) { // Completed level 4 (Praktik Membaca Surah Pendek)
          currentLevel = 'Mahir';
        } else if (completedSubLessons >= 10) { // Completed level 3 (Tajwid Dasar)
          currentLevel = 'Lanjutan';
        } else if (completedSubLessons >= 7) { // Completed level 2 (Harakat & Tanda Baca)
          currentLevel = 'Menengah';
        } else {
          currentLevel = 'Dasar'; // Just finished hijaiyah, moving to next level
        }
      }
    } else {
      // No hijaiyah progress data, fallback to sub lessons count
      if (completedSubLessons === 0) {
        currentLevel = 'Belum Mulai';
      } else if (completedSubLessons < 7) {
        currentLevel = 'Dasar';
      } else if (completedSubLessons < 10) {
        currentLevel = 'Menengah';
      } else if (completedSubLessons < 13) {
        currentLevel = 'Lanjutan';
      } else {
        currentLevel = 'Mahir';
      }
    }

    return {
      totalLevels,
      completedLevels,
      totalSubLessons,
      completedSubLessons,
      overallProgress,
      averageProgress,
      currentLevel,
      accuracyRate,
      totalAnswered,
      correctAnswers
    };
  };

  const stats = calculateStats();

  // Get badge color based on level
  const getBadgeColor = (level) => {
    switch (level) {
      case 'Belum Mulai':
        return 'bg-gray-100 text-gray-600';
      case 'Dasar':
        return 'bg-blue-100 text-blue-700';
      case 'Menengah':
        return 'bg-green-100 text-green-700';
      case 'Lanjutan':
        return 'bg-purple-100 text-purple-700';
      case 'Mahir':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Get accuracy badge color and text
  const getAccuracyBadge = (accuracy, totalAnswered) => {
    if (totalAnswered === 0) {
      return { color: 'bg-gray-100 text-gray-600', text: 'Belum Mulai' };
    } else if (accuracy >= 90) {
      return { color: 'bg-green-100 text-green-700', text: 'Sangat Baik' };
    } else if (accuracy >= 80) {
      return { color: 'bg-blue-100 text-blue-700', text: 'Baik' };
    } else if (accuracy >= 70) {
      return { color: 'bg-yellow-100 text-yellow-700', text: 'Cukup' };
    } else if (accuracy >= 60) {
      return { color: 'bg-orange-100 text-orange-700', text: 'Perlu Latihan' };
    } else {
      return { color: 'bg-red-100 text-red-700', text: 'Butuh Perbaikan' };
    }
  };

  const accuracyBadge = getAccuracyBadge(stats.accuracyRate, stats.totalAnswered);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="py-12"
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
        >
          Ringkasan Pembelajaran
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Pantau progres dan pencapaian pembelajaran makhrojul huruf Anda
        </motion.p>
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Card 1 - Sub Lessons Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IconLetterA size={28} />
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium px-3 py-1 rounded-full uppercase tracking-wide ${getBadgeColor(stats.currentLevel)}`}>
                  {stats.currentLevel}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{stats.overallProgress}%</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Pelajaran Selesai</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Sub pelajaran yang telah diselesaikan</p>
              
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{stats.completedSubLessons}</span>
                <span className="text-2xl text-gray-400 font-medium mb-1">/{stats.totalSubLessons}</span>
              </div>
              
              <div className="space-y-2">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.overallProgress}%` }}
                    transition={{ delay: 1.6, duration: 1.2, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full shadow-sm relative"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Belum Mulai</span>
                  <span>Target: {stats.totalSubLessons} pelajaran</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Card 2 - Accuracy Rate */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 transform hover:-translate-y-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IconTrophy size={28} />
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium px-3 py-1 rounded-full uppercase tracking-wide ${accuracyBadge.color}`}>
                  {accuracyBadge.text}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{stats.accuracyRate}%</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Tingkat Akurasi</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Persentase jawaban benar dari total soal</p>
              
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{stats.correctAnswers}</span>
                <span className="text-2xl text-gray-400 font-medium mb-1">/{stats.totalAnswered}</span>
              </div>
              
              <div className="space-y-2">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.accuracyRate}%` }}
                    transition={{ delay: 1.7, duration: 1.2, ease: "easeOut" }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full shadow-sm relative"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Jawaban benar</span>
                  <span>Target: 90%+</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Card 3 - Streak Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-3 relative overflow-hidden md:col-span-2 xl:col-span-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-violet-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IconCalendar size={28} />
              </div>
              <div className="text-right space-y-2">
                <div className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wide">
                  Konsisten
                </div>
                {streakCountdown && (
                  <div className="flex items-center gap-1 font-mono text-purple-800">
                    <span className="bg-purple-200 px-2 py-1 rounded text-xs font-bold">
                      {String(streakCountdown.hours).padStart(2, '0')}
                    </span>
                    <span className="text-purple-600">:</span>
                    <span className="bg-purple-200 px-2 py-1 rounded text-xs font-bold">
                      {String(streakCountdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-purple-600">:</span>
                    <span className="bg-purple-200 px-2 py-1 rounded text-xs font-bold">
                      {String(streakCountdown.seconds).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Streak Belajar</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Konsistensi pembelajaran harian Anda</p>
              
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900">{profileData?.streak || 0}</span>
                <span className="text-lg text-gray-500 font-medium mb-2">hari</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  {[...Array(7)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.8 + (i * 0.1), duration: 0.4, ease: "easeOut" }}
                      className={`flex-1 h-4 rounded-lg transition-all duration-300 ${
                        i < ((profileData?.streak || 0) % 7) 
                          ? 'bg-gradient-to-t from-purple-500 to-violet-600 shadow-sm transform hover:scale-105' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    ></motion.div>
                  ))}
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Minggu ini</span>
                  <span>🔥 Terus pertahankan!</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default StatisticsCards;
