import { IconAward, IconBolt, IconBookmark, IconChartBar, IconClock, IconFilter, IconSearch, IconShield, IconSparkles, IconStar, IconTrophy } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const AvailableClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredClass, setHoveredClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  // Fetch classes from database with sections and progress data
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        console.log('Fetching classes from database...');
        
        // Fetch classes data
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select(`
            *,
            class_sections (
              id,
              section_order,
              title,
              duration_minutes
            ),
            class_quizzes (
              id,
              title,
              passing_score,
              max_attempts,
              time_limit_minutes
            )
          `)
          .eq('status', 'Aktif')
          .order('id', { ascending: true });

        if (classError) {
          console.error('Error fetching classes:', classError);
          setError(classError.message);
          return;
        }

        // Fetch user progress if authenticated
        let userProgress = [];
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_class_progress')
            .select('*')
            .eq('user_id', user.id);

          if (progressError) {
            console.warn('Error fetching user progress:', progressError);
          } else {
            userProgress = progressData || [];
          }
        }

        // Combine class data with user progress
        const enrichedClasses = (classData || []).map(classItem => {
          const progress = userProgress.find(p => p.class_id === classItem.id);
          return {
            ...classItem,
            userProgress: progress || null,
            totalSections: classItem.class_sections?.length || 0,
            hasQuiz: classItem.class_quizzes?.length > 0
          };
        });

        console.log('Classes fetched with progress:', enrichedClasses);
        setClasses(enrichedClasses);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Enhanced level styling with modern gradients - use actual level from database
  const getLevelStyle = (level) => {
    const normalizedLevel = level || 'Pemula';
    switch (normalizedLevel) {
      case 'Pemula': return {
        gradient: 'from-emerald-500 via-green-500 to-teal-600',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: 'text-emerald-600',
        button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
      };
      case 'Menengah': return {
        gradient: 'from-amber-500 via-orange-500 to-yellow-600',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
      };
      case 'Lanjutan': return {
        gradient: 'from-red-500 via-pink-500 to-rose-600',
        badge: 'bg-red-100 text-red-800 border-red-200',
        icon: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      };
      default: return {
        gradient: 'from-slate-500 via-gray-500 to-slate-600',
        badge: 'bg-slate-100 text-slate-800 border-slate-200',
        icon: 'text-slate-600',
        button: 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500'
      };
    }
  };

  // Enhanced class progression logic - use database progress
  const getClassProgress = (classItem) => {
    if (classItem.userProgress) {
      return classItem.userProgress.progress_percentage || 0;
    }
    return 0;
  };

  // Enhanced lock status with database-driven logic
  const getClassStatus = (classItem) => {
    const progress = getClassProgress(classItem);
    const isCompleted = classItem.userProgress?.status === 'completed' || progress >= 100;
    
    // Class 1 is always available, others require previous class completion
    let isAvailable = classItem.id === 1;
    
    if (classItem.id > 1) {
      // Check if previous class is completed
      const previousClass = classes.find(c => c.id === classItem.id - 1);
      if (previousClass && previousClass.userProgress) {
        isAvailable = previousClass.userProgress.status === 'completed' || 
                     (previousClass.userProgress.progress_percentage || 0) >= 100;
      }
    }
    
    const isLocked = !isAvailable;
    const isInProgress = classItem.userProgress?.status === 'in_progress';
    
    return { isCompleted, isAvailable, isLocked, progress, isInProgress };
  };

  // Handle class navigation
  const handleClassClick = (classItem) => {
    const { isLocked } = getClassStatus(classItem);
    
    if (isLocked) {
      // Show locked message
      alert(`Selesaikan kelas "${classes.find(c => c.id === classItem.id - 1)?.classname}" terlebih dahulu untuk membuka kelas ini.`);
      return;
    }
    
    // Navigate to class detail page
    window.location.href = `/dashboard/kelas/${classItem.id}`;
  };

  // Filter and sort classes with enhanced logic
  const getFilteredClasses = () => {
    let filtered = [...classes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.classname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacher?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Level filter - use actual level from database
    if (levelFilter !== 'all') {
      filtered = filtered.filter(cls => {
        const level = cls.level || 'Pemula';
        return level.toLowerCase() === levelFilter;
      });
    }

    // Sort classes
    switch (sortBy) {
      case 'popular':
        filtered = [...filtered].sort((a, b) => (b.points || 0) - (a.points || 0));
        break;
      case 'shortest':
        filtered = [...filtered].sort((a, b) => (a.durationweeks || 0) - (b.durationweeks || 0));
        break;
      case 'difficulty':
        // Sort by level and then by id
        const levelOrder = { 'Pemula': 1, 'Menengah': 2, 'Lanjutan': 3 };
        filtered = [...filtered].sort((a, b) => {
          const levelA = levelOrder[a.level] || 1;
          const levelB = levelOrder[b.level] || 1;
          if (levelA !== levelB) return levelA - levelB;
          return a.id - b.id;
        });
        break;
      case 'newest':
      default:
        filtered = [...filtered].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    return filtered;
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
      >
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
          </div>
          <div className="text-slate-600 font-medium">Memuat kelas tersedia...</div>
          <div className="text-sm text-slate-400">Mengumpulkan informasi kelas terbaru</div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-red-200 p-8"
      >
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <IconSparkles className="text-red-600" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Enhanced Header with Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">📚 Kelas Tersedia</h2>
              <p className="text-slate-600 text-sm font-medium">Pilih kelas yang sesuai dengan level Anda</p>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari kelas atau pengajar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full sm:w-64"
                />
              </div>
              
              {/* Level Filter */}
              <div className="relative">
                <IconFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">Semua Level</option>
                  <option value="pemula">Pemula</option>
                  <option value="menengah">Menengah</option>
                  <option value="lanjutan">Lanjutan</option>
                </select>
              </div>
              
              {/* Sort */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="popular">Terpopuler</option>
                <option value="shortest">Durasi Terpendek</option>
                <option value="difficulty">Berdasarkan Level</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Menampilkan {getFilteredClasses().length} dari {classes.length} kelas
              {searchTerm && (
                <span className="ml-2 text-blue-600 font-medium">
                  untuk "{searchTerm}"
                </span>
              )}
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Hapus filter
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Classes Grid - 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {getFilteredClasses().map((classItem, index) => {
            const level = classItem.level || 'Pemula';
            const levelStyle = getLevelStyle(level);
            const { isLocked, isCompleted, isAvailable, progress, isInProgress } = getClassStatus(classItem);
            
            return (
              <motion.div 
                key={classItem.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.05,
                  layout: { duration: 0.3 }
                }}
                whileHover={{ 
                  y: isLocked ? 0 : -8,
                  transition: { duration: 0.2 }
                }}
                onHoverStart={() => setHoveredClass(classItem.id)}
                onHoverEnd={() => setHoveredClass(null)}
                onClick={() => handleClassClick(classItem)}
                className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
                  isLocked 
                    ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 opacity-75' 
                    : isCompleted
                    ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-md hover:shadow-xl'
                    : `bg-gradient-to-br from-white to-${levelStyle.gradient.split(' ')[1].replace('via-', '').replace('-500', '-50')} border-slate-200 shadow-md hover:shadow-xl hover:border-blue-200`
                }`}
              >
                {/* Enhanced Header Image/Banner */}
                <div className={`h-48 relative overflow-hidden bg-gradient-to-br ${levelStyle.gradient} ${isCompleted ? 'opacity-70' : ''}`}>
                  {/* Floating particles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        animate={{
                          y: [-10, -50],
                          opacity: [0, 0.8, 0],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.4,
                        }}
                        style={{
                          left: `${20 + i * 30}%`,
                          top: '100%',
                        }}
                      />
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${levelStyle.gradient.includes('emerald') ? 'bg-emerald-600' : levelStyle.gradient.includes('amber') ? 'bg-amber-600' : 'bg-red-600'}`}>
                      {level}
                    </span>
                    {isCompleted && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white shadow-lg">
                        ✓ Selesai
                      </span>
                    )}
                    {isInProgress && !isCompleted && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-lg">
                        📚 Sedang Belajar
                      </span>
                    )}
                    {isLocked && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-600 text-white shadow-lg">
                        🔒 Terkunci
                      </span>
                    )}
                  </div>

                  {/* Class Stats */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <IconClock size={16} className="drop-shadow-sm" />
                          <span className="font-medium">{classItem.durationweeks} minggu</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconBolt size={16} className="drop-shadow-sm" />
                          <span className="font-medium">{classItem.energy} energi</span>
                        </div>
                        {classItem.totalSections > 0 && (
                          <div className="flex items-center gap-1">
                            <IconBookmark size={16} className="drop-shadow-sm" />
                            <span className="font-medium">{classItem.totalSections} materi</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Quiz indicator */}
                      {classItem.hasQuiz && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                          title="Memiliki kuis"
                        >
                          <IconAward size={14} />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
                      <div className="text-center text-white">
                        <IconShield size={32} className="mx-auto mb-2 opacity-80" />
                        <div className="text-sm font-semibold">
                          Selesaikan kelas sebelumnya
                        </div>
                        <div className="text-xs opacity-80 mt-1">untuk membuka kelas ini</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Content Section */}
                <div className={`p-6 space-y-4 ${isCompleted ? 'opacity-70' : ''}`}>
                  {/* Title and Progress */}
                  <div>
                    <h3 className={`font-bold text-xl mb-2 leading-tight ${isLocked ? 'text-slate-600' : 'text-slate-900'}`}>
                      {classItem.classname}
                    </h3>
                    
                    {/* Description */}
                    <p className={`text-sm leading-relaxed mb-3 ${isLocked ? 'text-slate-500' : 'text-slate-600'}`}>
                      {classItem.description}
                    </p>
                    
                    {/* Progress Bar (if started) */}
                    {progress > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}

                    <p className={`text-sm leading-relaxed ${isLocked ? 'text-slate-500' : 'text-slate-600'}`}>
                      Dapatkan <span className="font-semibold text-blue-600">{classItem.exp} XP</span> dan <span className="font-semibold text-amber-600">{classItem.points} poin</span> setelah menyelesaikan kelas ini.
                    </p>
                  </div>

                  {/* Enhanced Rewards Preview */}
                  <div className={`grid grid-cols-3 gap-3 p-3 rounded-xl ${isLocked ? 'bg-slate-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${isLocked ? 'bg-slate-300' : 'bg-blue-500'}`}>
                        <IconTrophy size={14} className="text-white" />
                      </div>
                      <div className="text-xs text-slate-500 font-medium">XP</div>
                      <div className={`text-sm font-bold ${isLocked ? 'text-slate-600' : 'text-blue-600'}`}>
                        {classItem.exp}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${isLocked ? 'bg-slate-300' : 'bg-amber-500'}`}>
                        <IconStar size={14} className="text-white" />
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Poin</div>
                      <div className={`text-sm font-bold ${isLocked ? 'text-slate-600' : 'text-amber-600'}`}>
                        {classItem.points}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${isLocked ? 'bg-slate-300' : 'bg-emerald-500'}`}>
                        <IconAward size={14} className="text-white" />
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Badge</div>
                      <div className={`text-xs font-bold ${isLocked ? 'text-slate-600' : 'text-emerald-600'}`}>
                        +1
                      </div>
                    </div>
                  </div>

                  {/* Teacher and Action */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${
                        isLocked ? 'bg-slate-500' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        {classItem.teacher ? classItem.teacher.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${isLocked ? 'text-slate-500' : 'text-slate-700'}`}>
                          {classItem.teacher || 'Pengajar'}
                        </div>
                        <div className="text-xs text-slate-500">Instruktur</div>
                      </div>
                    </div>

                    {/* Enhanced Action Button */}
                    {isLocked ? (
                      <motion.button 
                        disabled
                        className="px-4 py-2 bg-slate-400 text-white rounded-xl text-sm font-medium cursor-not-allowed flex items-center gap-2"
                      >
                        <IconShield size={14} />
                        Terkunci
                      </motion.button>
                    ) : isCompleted ? (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <IconTrophy size={14} />
                        Ulangi
                      </motion.button>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 ${levelStyle.button}`}
                      >
                        <IconSparkles size={14} />
                        {progress > 0 ? 'Lanjutkan' : 'Mulai Kelas'}
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Completed overlay */}
                {isCompleted && (
                  <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
                )}

                {/* Hover Effect Overlay */}
                {!isLocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    initial={false}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Enhanced Empty State */}
      {getFilteredClasses().length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <IconSearch size={32} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Tidak Ada Kelas Ditemukan</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-4">
                {searchTerm 
                  ? `Tidak ada kelas yang cocok dengan pencarian "${searchTerm}". Coba kata kunci lain.`
                  : 'Tidak ada kelas yang sesuai dengan filter yang dipilih.'
                }
              </p>
              {(searchTerm || levelFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setLevelFilter('all');
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

      {/* Enhanced Load More Section */}
      <div className="text-center">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          Lihat Semua Kelas 
          <IconChartBar size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AvailableClasses;