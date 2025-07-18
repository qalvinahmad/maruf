import { IconArrowRight, IconAward, IconBook, IconClock, IconCoin, IconFlame, IconShield, IconStar } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lock, Play, Star, Target, TrendingUp } from 'lucide-react';

const Roadmap = ({ roadmapData, expandedLevel, setExpandedLevel, handleStartLesson, userProfile, onEnergyUpdate }) => {
  
  // Check if user has enough energy for a sub lesson
  const checkEnergyRequirement = (requiredEnergy = 2) => {
    return (userProfile?.energy || 0) >= requiredEnergy;
  };

  // Handle sub lesson start with energy deduction
  const handleSubLessonStart = async (levelId, subLessonId, requiredEnergy = 2) => {
    if (!checkEnergyRequirement(requiredEnergy)) {
      alert(`Anda membutuhkan ${requiredEnergy} energi untuk memulai pelajaran ini. Energi saat ini: ${userProfile?.energy || 0}`);
      return;
    }

    try {
      // Update energy in database
      const response = await fetch('/api/update-energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userProfile?.id,
          energyToDeduct: requiredEnergy,
          operation: 'deduct'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newEnergy = result.updatedProfile.energy;
        
        // Update local energy state
        if (onEnergyUpdate) {
          onEnergyUpdate(newEnergy);
        }
        
        // Dispatch energy update event
        window.dispatchEvent(new CustomEvent('energyUpdated', {
          detail: { newEnergy }
        }));
        
        // Start the lesson
        handleStartLesson(levelId, subLessonId);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update energy');
      }
    } catch (error) {
      console.error('Error deducting energy:', error);
      alert('Terjadi kesalahan saat memulai pelajaran. Silakan coba lagi.');
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full transform translate-x-32 -translate-y-32 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-50 to-green-50 rounded-full transform -translate-x-16 translate-y-16 opacity-40"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <TrendingUp size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">🎯 Progress Keseluruhan</h3>
                <p className="text-gray-600 font-medium">Perjalanan pembelajaran makhrojul huruf Anda</p>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
                {overallProgress}%
              </div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Selesai</div>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-gray-700">Progress pembelajaran</span>
              <span className="text-emerald-600">{completedLevels} dari {roadmapData?.length || 0} tingkat</span>
            </div>
            
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-sm relative"
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full"></div>
              </motion.div>
            </div>
            
            {/* Progress indicators */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Pemula</span>
              <span>Menengah</span>
              <span>Mahir</span>
            </div>
          </div>

          {/* Achievement milestones */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <IconBook size={18} />
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-700">{roadmapData?.reduce((sum, item) => sum + (item.completedLessons || 0), 0) || 0}</div>
                  <div className="text-xs text-blue-600 font-medium">Pelajaran Selesai</div>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white">
                  <IconCoin size={18} />
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-700">{roadmapData?.reduce((sum, item) => sum + (item.points || 0), 0) || 0}</div>
                  <div className="text-xs text-amber-600 font-medium">Total Poin</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                  <IconStar size={18} />
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-700">{completedLevels}</div>
                  <div className="text-xs text-purple-600 font-medium">Level Selesai</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Roadmap Steps */}
      <div className="relative space-y-8">
        {/* Connecting line */}
        <div className="absolute left-8 top-16 bottom-16 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-emerald-200 rounded-full opacity-60"></div>
        
        {roadmapData?.map((item, index) => {
          const roadmapProgress = getRoadmapProgress(item);
          const colorClasses = getColorClasses(item.color, roadmapProgress.status);
          const isActive = roadmapProgress.status === 'active' || roadmapProgress.status === 'in_progress';
          const isCompleted = roadmapProgress.progress === 100 || roadmapProgress.status === 'completed';
          
          // Enhanced logic to determine if level should be locked
          let isLocked = false;
          if (index === 0) {
            // First level is never locked
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
              initial={{ opacity: 0, x: -40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.3 + index * 0.15,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={`relative ${index !== roadmapData.length - 1 ? 'pb-8' : ''}`}
            >
              <div className={`flex gap-6 ${isLocked ? 'opacity-60' : ''} group`}>
                {/* Enhanced Status Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`w-16 h-16 rounded-2xl ${colorClasses.accent} flex items-center justify-center text-white shadow-lg relative overflow-hidden ${isActive ? 'ring-4 ring-blue-200' : ''}`}
                  >
                    {/* Floating particles for active items */}
                    {isActive && (
                      <div className="absolute inset-0 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white/40 rounded-full"
                            animate={{
                              y: [-5, -25],
                              opacity: [0, 1, 0],
                              scale: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                            style={{
                              left: `${30 + i * 20}%`,
                              top: '80%',
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    <motion.div
                      animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getStatusIcon(roadmapProgress.status, roadmapProgress.progress)}
                    </motion.div>
                    
                    {/* Shine effect for completed items */}
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                        animate={{ x: ['0%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />
                    )}
                  </motion.div>
                  
                  {/* Level number badge */}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                
                {/* Enhanced Content Card */}
                <div className={`flex-grow rounded-2xl ${colorClasses.bg} border-2 ${colorClasses.border} shadow-sm hover:shadow-lg transition-all duration-300 group-hover:shadow-xl overflow-hidden relative`}>
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 p-6 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className={`text-xl font-bold ${colorClasses.text}`}>{item.title}</h3>
                          {isCompleted && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold"
                            >
                              <Check size={12} />
                              Selesai
                            </motion.div>
                          )}
                          {isActive && (
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold"
                            >
                              <IconFlame size={12} />
                              Aktif
                            </motion.div>
                          )}
                        </div>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                    
                    {/* Enhanced Info Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${colorClasses.badge}`}>
                        Level: {item.level}
                      </span>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${colorClasses.badge}`}>
                        <IconClock size={12} className="inline mr-1" />
                        {item.duration}
                      </span>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${colorClasses.badge}`}>
                        <IconBook size={12} className="inline mr-1" />
                        {roadmapProgress.completedSubLessons.length}/{item.lessons_total || item.sub_lessons?.length || 0} Pelajaran
                      </span>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${colorClasses.badge}`}>
                        <IconCoin size={12} className="inline mr-1" />
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
                                if (!isSubLessonCompleted) {
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
                        <div className="text-center space-y-2">
                          <IconShield size={32} className="text-slate-400 mx-auto" />
                          <div className="text-sm font-semibold text-slate-600">Selesaikan Level {index} terlebih dahulu</div>
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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 lg:p-12 border border-blue-100 relative overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full transform -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-indigo-100/40 to-blue-100/40 rounded-full transform translate-x-24 translate-y-24"></div>
        
        <div className="relative z-10 text-center space-y-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl"
          >
            <Star className="text-white" size={32} />
          </motion.div>
          
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-gray-900">
              🌟 Raih Pencapaian Terbaik
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Selesaikan setiap tahap pembelajaran untuk mendapatkan sertifikat 
              dan membuka level selanjutnya dalam perjalanan menguasai makhrojul huruf
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white px-6 py-4 rounded-2xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="text-2xl font-bold text-blue-600 mb-1">850</div>
              <div className="text-sm text-gray-500 font-medium">Total Poin</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white px-6 py-4 rounded-2xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="text-2xl font-bold text-blue-600 mb-1">{completedLevels}</div>
              <div className="text-sm text-gray-500 font-medium">Level Selesai</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white px-6 py-4 rounded-2xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="text-2xl font-bold text-blue-600 mb-1">4</div>
              <div className="text-sm text-gray-500 font-medium">Sertifikat</div>
            </motion.div>
          </div>
          
          {/* Call to action */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <IconAward size={18} />
            Lihat Semua Pencapaian
            <IconArrowRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Roadmap;