import { IconArrowRight, IconAward, IconBook, IconClock, IconCoin, IconFlame, IconShield, IconStar } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lock, Play, Star, Target } from 'lucide-react';
import { useRouter } from 'next/router';
import GradientText from '../../src/blocks/TextAnimations/GradientText/GradientText';
import BlurText from '../ui/blur-text';
import { showToast } from '../ui/toast';

const Roadmap = ({ roadmapData, expandedLevel, setExpandedLevel, handleStartLesson, userProfile, onEnergyUpdate }) => {
  const router = useRouter();
  
  // Check if user is at Level 0 (Persiapan) - disable all lessons
  const isLevel0User = () => {
    // Check multiple conditions to ensure user is at Level 0/Persiapan
    return (
      userProfile?.level === 0 || 
      userProfile?.level === '0' ||
      userProfile?.level_description === 'Persiapan' ||
      userProfile?.combined === 'Level 0: Persiapan' ||
      (userProfile?.level === undefined && userProfile?.level_description === undefined)
    );
  };
  
  // Check if user has enough energy for a sub lesson
  const checkEnergyRequirement = (requiredEnergy = 2) => {
    return (userProfile?.energy || 0) >= requiredEnergy;
  };

  // Navigate to DashboardHuruf for Level 0 completion
  const navigateToDashboardHuruf = () => {
    router.push('/dashboard/DashboardHuruf');
  };

  // Handle sub lesson start with energy deduction
  const handleSubLessonStart = async (levelId, subLessonId, requiredEnergy = 2) => {
    // Check if user is Level 0 (Persiapan) - block access
    if (isLevel0User()) {
      showToast.warning('Anda perlu menyelesaikan level persiapan terlebih dahulu. Klik tombol "Mulai Level Persiapan" untuk memulai.');
      return;
    }
    
    if (!checkEnergyRequirement(requiredEnergy)) {
      showToast.warning(`Anda membutuhkan ${requiredEnergy} energi untuk memulai pelajaran ini. Energi saat ini: ${userProfile?.energy || 0}`);
      return;
    }

    try {
      // Check if user profile exists
      if (!userProfile?.id) {
        showToast.error('Profil pengguna tidak ditemukan. Silakan refresh halaman.');
        return;
      }

      // Show loading toast
      showToast.info('Memulai pelajaran...');

      // Update energy in database
      const response = await fetch('/api/update-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userProfile.id,
          energyToDeduct: requiredEnergy,
          operation: 'deduct'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newEnergy = result.updatedProfile?.energy;
        
        // Update local energy state
        if (onEnergyUpdate && newEnergy !== undefined) {
          onEnergyUpdate(newEnergy);
        }
        
        // Dispatch energy update event
        window.dispatchEvent(new CustomEvent('energyUpdated', {
          detail: { newEnergy }
        }));
        
        // Show success toast
        showToast.success(`Energi dikurangi ${requiredEnergy}. Sisa energi: ${newEnergy}`);
        
        // Start the lesson
        handleStartLesson(levelId, subLessonId);
      } else {
        let errorMessage = 'Gagal memperbarui energi';
        let errorDetails = '';
        
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
          
          // Show more specific error details
          if (error.details) {
            errorDetails = ` (${error.details})`;
          }
          
          if (error.hint) {
            errorDetails += ` Hint: ${error.hint}`;
          }
          
          // Handle specific error cases
          if (error.error === 'Database connection failed') {
            errorMessage = 'Koneksi database bermasalah. Silakan coba beberapa saat lagi.';
          } else if (error.error === 'Failed to fetch current profile') {
            errorMessage = 'Gagal mengambil profil pengguna. Silakan refresh halaman.';
          }
          
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = `API Error (${response.status}): ${response.statusText}`;
        }
        
        showToast.error(errorMessage + errorDetails);
        console.error('Energy update failed:', { response, errorMessage, errorDetails });
      }
    } catch (error) {
      console.error('Error deducting energy:', error);
      showToast.error('Terjadi kesalahan saat memulai pelajaran. Silakan coba lagi.');
    }
  };

  // Get sub lesson score from completed data
  const getSubLessonScore = (subLesson) => {
    if (subLesson.status === 'completed' && subLesson.score) {
      return {
        correct: subLesson.score.correct || 0,
        total: subLesson.score.total || 0,
        percentage: subLesson.score.percentage || 0
      };
    }
    return null;
  };

  // Enhanced function to get roadmap progress from user_roadmap_progress
  const getRoadmapProgress = (item) => {
    if (item.user_roadmap_progress && item.user_roadmap_progress.length > 0) {
      const progress = item.user_roadmap_progress[0];
      return {
        progress: progress.progress || 0,
        status: progress.status || 'locked',
        completedSubLessons: progress.sub_lessons_completed || [],
        completedAt: progress.completed_at
      };
    }
    return {
      progress: 0,
      status: 'locked',
      completedSubLessons: [],
      completedAt: null
    };
  };

  // Enhanced color system with modern gradients
  const getColorClasses = (color, status) => {
    if (status === 'locked') {
      return {
        bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
        border: 'border-slate-200',
        accent: 'bg-gradient-to-br from-slate-400 to-slate-500',
        text: 'text-slate-600',
        badge: 'bg-slate-100 text-slate-600 border border-slate-200',
        icon: 'text-slate-400',
        progress: 'from-slate-400 to-slate-500'
      };
    }

    const colors = {
      emerald: {
        bg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
        border: 'border-emerald-200',
        accent: 'bg-gradient-to-br from-emerald-500 to-green-600',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        icon: 'text-emerald-600',
        progress: 'from-emerald-500 to-green-600',
        glow: 'shadow-emerald-200'
      },
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
        border: 'border-blue-200',
        accent: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-700 border border-blue-200',
        icon: 'text-blue-600',
        progress: 'from-blue-500 to-indigo-600',
        glow: 'shadow-blue-200'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50',
        border: 'border-purple-200',
        accent: 'bg-gradient-to-br from-purple-500 to-violet-600',
        text: 'text-purple-700',
        badge: 'bg-purple-100 text-purple-700 border border-purple-200',
        icon: 'text-purple-600',
        progress: 'from-purple-500 to-violet-600',
        glow: 'shadow-purple-200'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
        border: 'border-orange-200',
        accent: 'bg-gradient-to-br from-orange-500 to-amber-600',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-700 border border-orange-200',
        icon: 'text-orange-600',
        progress: 'from-orange-500 to-amber-600',
        glow: 'shadow-orange-200'
      }
    };

    return colors[color] || colors.blue;
  };

  // Enhanced status icon with animations
  const getStatusIcon = (status, progress) => {
    if (status === 'locked') return <Lock size={20} className="animate-pulse" />;
    if (progress === 100 || status === 'completed') return <Check size={20} className="animate-bounce" />;
    if (progress > 0) return <Play size={20} className="animate-pulse" />;
    return <Target size={20} />;
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!roadmapData || roadmapData.length === 0) return 0;
    const totalProgress = roadmapData.reduce((sum, item) => {
      const roadmapProgress = getRoadmapProgress(item);
      return sum + (roadmapProgress.progress || 0);
    }, 0);
    return Math.round(totalProgress / roadmapData.length);
  };

  const overallProgress = calculateOverallProgress();
  const completedLevels = roadmapData?.filter(item => {
    const roadmapProgress = getRoadmapProgress(item);
    return roadmapProgress.progress === 100 || roadmapProgress.status === 'completed';
  }).length || 0;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen font-inter antialiased">

      {/* Enhanced Overall Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20 bg-white rounded-3xl p-8 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 relative overflow-hidden backdrop-blur-sm"
      >
        {/* Enhanced background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full transform translate-x-48 -translate-y-48 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-100/30 to-green-100/20 rounded-full transform -translate-x-32 translate-y-32 opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full transform -translate-x-16 -translate-y-16 opacity-30"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-10">
            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <GradientText 
                  className="text-3xl lg:text-4xl font-black"
                  colors={["#00acee", "#9146FF", "#00acee"]}
                  animationSpeed={6}
                >
                  Kemajuan Pembelajaran
                </GradientText>
                <BlurText
                  text="Perjalanan pembelajaran makhrojul huruf Anda"
                  delay={200}
                  className="inline-block text-lg text-gray-600 font-medium backdrop-blur-sm px-4 py-2 rounded-xl bg-white/30"
                  animateBy="words"
                  direction="bottom"
                  stepDuration={0.4}
                />
              </div>
            </div>
            
            <div className="text-center lg:text-right space-y-2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent"
              >
                {overallProgress}%
              </motion.div>
              <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Progres Selesai</div>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="space-y-6">
            <div className="flex items-center justify-between text-base font-semibold">
              <span className="text-gray-800">Progress pembelajaran</span>
              <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">
                {completedLevels} dari {roadmapData?.length || 0} tingkat
              </span>
            </div>
            
            <div className="relative">
              <div className="w-full h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg relative"
                >
                  <div className="absolute inset-0 bg-white/30 rounded-2xl animate-pulse"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/50 rounded-r-2xl"></div>
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-2xl"
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    style={{ width: '100px' }}
                  />
                </motion.div>
              </div>
              
              {/* Progress milestone indicators */}
              <div className="flex justify-between mt-3 text-sm font-medium">
                <span className="text-gray-500">Pemula</span>
                <span className={overallProgress >= 25 ? 'text-emerald-600' : 'text-gray-400'}>25%</span>
                <span className={overallProgress >= 50 ? 'text-emerald-600' : 'text-gray-400'}>Menengah</span>
                <span className={overallProgress >= 75 ? 'text-emerald-600' : 'text-gray-400'}>75%</span>
                <span className={overallProgress === 100 ? 'text-emerald-600' : 'text-gray-400'}>Mahir</span>
              </div>
            </div>
          </div>

          {/* Enhanced Achievement milestones */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-blue-200"
                >
                  <IconBook size={24} strokeWidth={2.5} />
                </motion.div>
                <div>
                  <div className="text-2xl font-black text-blue-700">
                    {roadmapData?.reduce((sum, item) => {
                      const roadmapProgress = getRoadmapProgress(item);
                      return sum + (roadmapProgress.completedSubLessons?.length || 0);
                    }, 0) || 0}
                  </div>
                  <div className="text-sm text-blue-600 font-semibold">Pelajaran Selesai</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-amber-200"
                >
                  <IconCoin size={24} strokeWidth={2.5} />
                </motion.div>
                <div>
                  <div className="text-2xl font-black text-amber-700">
                    {roadmapData?.reduce((sum, item) => {
                      const roadmapProgress = getRoadmapProgress(item);
                      // Calculate points based on completed sub lessons
                      const completedLessonsCount = roadmapProgress.completedSubLessons?.length || 0;
                      const pointsPerLesson = Math.floor((item.points || 0) / (item.sub_lessons?.length || 1));
                      return sum + (completedLessonsCount * pointsPerLesson);
                    }, 0) || 0}
                  </div>
                  <div className="text-sm text-amber-600 font-semibold">Total Poin</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Roadmap Steps */}
      <div className="relative space-y-12">
        {/* Enhanced connecting line with gradient */}
        <div className="absolute left-10 top-20 bottom-20 w-1.5 bg-gradient-to-b from-blue-300 via-purple-300 to-emerald-300 rounded-full opacity-70 shadow-sm"></div>
        
        {roadmapData?.map((item, index) => {
          const roadmapProgress = getRoadmapProgress(item);
          const colorClasses = getColorClasses(item.color, roadmapProgress.status);
          const isActive = roadmapProgress.status === 'active' || roadmapProgress.status === 'in_progress';
          const isCompleted = roadmapProgress.progress === 100 || roadmapProgress.status === 'completed';
          
          // Enhanced logic to determine if level should be locked
          let isLocked = false;
          
          // If user is Level 0 (Persiapan), lock all levels
          if (isLevel0User()) {
            isLocked = true;
          } else if (index === 0) {
            // First level is never locked for non-Level 0 users
            isLocked = false;
          } else {
            // Check if previous level is completed
            const previousItem = roadmapData[index - 1];
            const previousProgress = getRoadmapProgress(previousItem);
            const isPreviousCompleted = previousProgress.progress === 100 || previousProgress.status === 'completed';
            
            // Level is locked if previous level is not completed AND current level status is locked
            isLocked = !isPreviousCompleted && roadmapProgress.status === 'locked';
          }
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.6 + index * 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={`relative ${index !== roadmapData.length - 1 ? 'pb-12' : ''}`}
            >
              <div className={`flex gap-8 ${isLocked ? 'opacity-50' : ''} group`}>
                {/* Enhanced Status Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className={`w-20 h-20 rounded-3xl ${colorClasses.accent} flex items-center justify-center text-white shadow-xl relative overflow-hidden ${isActive ? 'ring-4 ring-blue-300/50 shadow-2xl' : ''} ${isCompleted ? 'ring-4 ring-green-300/50' : ''}`}
                  >
                    {/* Enhanced floating particles for active items */}
                    {isActive && (
                      <div className="absolute inset-0 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-white/60 rounded-full"
                            animate={{
                              y: [-8, -35],
                              opacity: [0, 1, 0],
                              scale: [0.5, 1.2, 0.5],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              delay: i * 0.4,
                            }}
                            style={{
                              left: `${20 + i * 15}%`,
                              top: '85%',
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    <motion.div
                      animate={isActive ? { rotate: [0, 15, -15, 0] } : {}}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {getStatusIcon(roadmapProgress.status, roadmapProgress.progress)}
                    </motion.div>
                    
                    {/* Enhanced shine effect for completed items */}
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                        animate={{ x: ['0%', '250%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                      />
                    )}
                  </motion.div>
                  
                  {/* Enhanced level number badge */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-2xl border-3 border-gray-200 flex items-center justify-center text-sm font-black text-gray-700 shadow-lg"
                  >
                    {index + 1}
                  </motion.div>
                </div>
                
                {/* Enhanced Content Card */}
                <div className={`flex-grow rounded-3xl ${colorClasses.bg} border-2 ${colorClasses.border} shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:shadow-3xl overflow-hidden relative backdrop-blur-sm`}>
                  {/* Enhanced background pattern */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full transform translate-x-24 -translate-y-24 group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full transform -translate-x-16 translate-y-16 group-hover:scale-125 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 p-8 space-y-6">
                    {/* Enhanced Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <h3 className={`text-2xl font-black ${colorClasses.text}`}>{item.title}</h3>
                          {isCompleted && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-2xl text-sm font-bold shadow-md"
                            >
                              <Check size={16} />
                              Selesai
                            </motion.div>
                          )}
                          {isActive && (
                            <motion.div
                              animate={{ 
                                opacity: [0.7, 1, 0.7],
                                scale: [0.95, 1.05, 0.95]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-2xl text-sm font-bold shadow-md"
                            >
                              <IconFlame size={16} />
                              Aktif
                            </motion.div>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed text-lg">{item.description}</p>
                      </div>
                    </div>
                    
                    {/* Enhanced Info Badges */}
                    <div className="flex flex-wrap gap-3">
                      <span className={`text-sm px-4 py-2 rounded-2xl font-semibold ${colorClasses.badge} shadow-sm`}>
                        Level: {item.level}
                      </span>
                      <span className={`text-sm px-4 py-2 rounded-2xl font-semibold ${colorClasses.badge} shadow-sm flex items-center gap-2`}>
                        <IconClock size={14} />
                        {item.duration}
                      </span>
                      <span className={`text-sm px-4 py-2 rounded-2xl font-semibold ${colorClasses.badge} shadow-sm flex items-center gap-2`}>
                        <IconBook size={14} />
                        {roadmapProgress.completedSubLessons.length}/{item.lessons_total || item.sub_lessons?.length || 0} Pelajaran
                      </span>
                      <span className={`text-sm px-4 py-2 rounded-2xl font-semibold ${colorClasses.badge} shadow-sm flex items-center gap-2`}>
                        <IconCoin size={14} />
                        {item.points} Poin
                      </span>
                    </div>
                    
                    {/* Enhanced Progress Section */}
                    {!isLocked && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${colorClasses.text}`}>Progress Pembelajaran</span>
                          <span className={`text-sm font-bold ${colorClasses.text}`}>{roadmapProgress.progress}%</span>
                        </div>
                        
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${roadmapProgress.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${colorClasses.progress} rounded-full shadow-sm relative`}
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                          </motion.div>
                        </div>
                        
                        {/* Progress milestones */}
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Mulai</span>
                          <span className={roadmapProgress.progress >= 50 ? colorClasses.text : 'text-gray-400'}>50%</span>
                          <span className={roadmapProgress.progress === 100 ? colorClasses.text : 'text-gray-400'}>Selesai</span>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Sub Lessons Section */}
                    {item.sub_lessons && item.sub_lessons.length > 0 && !isLocked && (
                      <div className="space-y-3">
                        <button
                          onClick={() => setExpandedLevel(expandedLevel === item.id ? null : item.id)}
                          className={`flex items-center gap-2 text-sm font-medium ${colorClasses.text} hover:opacity-80 transition-opacity`}
                        >
                          <span>{expandedLevel === item.id ? 'Sembunyikan' : 'Lihat'} Sub Pelajaran ({item.sub_lessons.length})</span>
                          <motion.div
                            animate={{ rotate: expandedLevel === item.id ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <IconArrowRight size={16} />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {expandedLevel === item.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-gray-200 pt-4 space-y-3"
                            >
                              {item.sub_lessons.map((subLesson, subIndex) => {
                                const subLessonScore = getSubLessonScore(subLesson);
                                const requiredEnergy = 2; // Energy requirement per sub lesson
                                const hasEnoughEnergy = checkEnergyRequirement(requiredEnergy);
                                
                                // Use roadmap progress data to determine actual completion status
                                const isSubLessonCompleted = roadmapProgress.completedSubLessons.includes(subLesson.id) || subLesson.status === 'completed';
                                
                                // Determine if sub-lesson should be active
                                let isSubLessonActive = false;
                                
                                // If user is Level 0 (Persiapan), disable all sub-lessons
                                if (isLevel0User()) {
                                  isSubLessonActive = false;
                                } else if (!isSubLessonCompleted) {
                                  if (subIndex === 0) {
                                    // First sub-lesson is active if roadmap is not locked
                                    isSubLessonActive = !isLocked;
                                  } else {
                                    // Check if previous sub-lesson is completed
                                    const previousSubLesson = item.sub_lessons[subIndex - 1];
                                    const isPreviousCompleted = roadmapProgress.completedSubLessons.includes(previousSubLesson.id);
                                    isSubLessonActive = isPreviousCompleted;
                                  }
                                }

                                return (
                                  <motion.div
                                    key={subLesson.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: subIndex * 0.1 }}
                                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 border ${
                                      !isSubLessonActive && !isSubLessonCompleted ? 'opacity-60 bg-gray-50 border-gray-200' : 
                                      isSubLessonCompleted ? 'bg-green-50/70 border-green-200 hover:bg-green-50' :
                                      'bg-white/70 hover:bg-white border-gray-200 hover:border-blue-200 hover:shadow-md'
                                    }`}
                                  >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                      isSubLessonCompleted ? 'bg-green-500 text-white shadow-md' :
                                      isSubLessonActive ? 'bg-blue-500 text-white shadow-md animate-pulse' :
                                      'bg-gray-200 text-gray-500'
                                    }`}>
                                      {isSubLessonCompleted ? <Check size={16} /> : subIndex + 1}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900 truncate">{subLesson.title}</h4>
                                        
                                        {/* Energy Requirement Badge */}
                                        {!isSubLessonCompleted && (
                                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                            hasEnoughEnergy ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                          }`}>
                                            <IconFlame size={12} />
                                            {requiredEnergy} Energi
                                          </div>
                                        )}
                                      </div>
                                      
                                      <p className="text-sm text-gray-600 mb-2">{subLesson.description}</p>
                                      
                                      {/* Score Display for Completed Lessons */}
                                      {subLessonScore && isSubLessonCompleted && (
                                        <div className="flex items-center gap-3 text-xs mt-2">
                                          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                            <Check size={10} />
                                            Benar: {subLessonScore.correct}
                                          </div>
                                          <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                            <span>✗</span>
                                            Salah: {subLessonScore.total - subLessonScore.correct}
                                          </div>
                                          <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            <IconStar size={10} />
                                            Skor: {subLessonScore.percentage}%
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Action Button */}
                                    {isSubLessonCompleted ? (
                                      <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                          <Check size={16} />
                                          Selesai
                                        </div>
                                        {subLessonScore && (
                                          <div className="text-xs text-gray-500">
                                            {subLessonScore.percentage}% benar
                                          </div>
                                        )}
                                      </div>
                                    ) : isLevel0User() ? (
                                      <div className="flex flex-col items-end gap-2">
                                        <div className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-sm font-medium flex items-center gap-2">
                                          <IconShield size={14} />
                                          Level Persiapan
                                        </div>
                                        <div className="text-xs text-gray-500 mb-1">
                                          Selesaikan persiapan dulu
                                        </div>
                                        <button
                                          onClick={navigateToDashboardHuruf}
                                          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                                        >
                                          Mulai Persiapan
                                        </button>
                                      </div>
                                    ) : isSubLessonActive ? (
                                      hasEnoughEnergy ? (
                                        <motion.button 
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleSubLessonStart(item.id, subLesson.id, requiredEnergy)}
                                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                                        >
                                          <Play size={14} />
                                          Mulai
                                          <IconArrowRight size={14} />
                                        </motion.button>
                                      ) : (
                                        <div className="flex flex-col items-end gap-1">
                                          <div className="px-3 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                                            <IconFlame size={14} />
                                            Energi Kurang
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Butuh {requiredEnergy} energi
                                          </div>
                                        </div>
                                      )
                                    ) : (
                                      <div className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium flex items-center gap-2">
                                        <Lock size={14} />
                                        Terkunci
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Lock overlay for locked items */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <IconShield size={32} className="text-slate-400 mx-auto" />
                          <div className="text-sm font-semibold text-slate-600">
                            {isLevel0User() 
                              ? "Selesaikan level persiapan terlebih dahulu" 
                              : `Selesaikan Level ${index} terlebih dahulu`
                            }
                          </div>
                          {isLevel0User() && (
                            <button
                              onClick={navigateToDashboardHuruf}
                              className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                              Mulai Level Persiapan
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Enhanced Achievement Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="mt-24 bg-gradient-to-br from-blue-100/50 via-indigo-100/30 to-purple-100/50 rounded-3xl p-12 lg:p-16 border border-blue-200/50 relative overflow-hidden shadow-2xl backdrop-blur-sm"
      >
        {/* Enhanced background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full transform -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-indigo-200/20 to-blue-200/20 rounded-full transform translate-x-40 translate-y-40"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-100/30 to-pink-100/20 rounded-full transform -translate-x-32 -translate-y-32"></div>
        
        <div className="relative z-10 text-center space-y-8">
          <motion.div
            animate={{ 
              rotate: [0, 15, -15, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-300/50"
          >
            <Star className="text-white" size={36} strokeWidth={2.5} />
          </motion.div>
          
          <div className="space-y-4">
            <h3 className="text-4xl lg:text-5xl font-black text-gray-900">
              Pencapaian
            </h3>
            <p className="text-gray-700 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Selesaikan setiap tahap pembelajaran untuk menguasai makhrojul huruf
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8">
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 backdrop-blur-sm px-8 py-6 rounded-3xl border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-3xl font-black text-blue-600 mb-2">
                {roadmapData?.reduce((sum, item) => {
                  const roadmapProgress = getRoadmapProgress(item);
                  return sum + (roadmapProgress.completedSubLessons?.length || 0);
                }, 0) || 0}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Pelajaran Selesai</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 backdrop-blur-sm px-8 py-6 rounded-3xl border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-3xl font-black text-blue-600 mb-2">
                {roadmapData?.reduce((sum, item) => {
                  const roadmapProgress = getRoadmapProgress(item);
                  // Calculate points based on completed sub lessons
                  const completedLessonsCount = roadmapProgress.completedSubLessons?.length || 0;
                  const pointsPerLesson = Math.floor((item.points || 0) / (item.sub_lessons?.length || 1));
                  return sum + (completedLessonsCount * pointsPerLesson);
                }, 0) || 0}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Total Poin</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 backdrop-blur-sm px-8 py-6 rounded-3xl border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-3xl font-black text-blue-600 mb-2">4</div>
              <div className="text-sm text-gray-600 font-semibold">Sertifikat</div>
            </motion.div>
          </div>
          
          {/* Enhanced call to action */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
          >
            <IconAward size={20} />
            Lihat Semua Pencapaian
            <IconArrowRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Roadmap;