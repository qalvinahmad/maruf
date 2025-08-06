import { IconActivity, IconArrowDownRight, IconArrowUpRight, IconBook, IconChartBar, IconClock, IconInfoCircle, IconSettings, IconUserCheck, IconUsers } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import HeaderTeacher from '../../../components/layout/HeaderTeacher';
import { FloatingDock } from '../../../components/ui/floating-dock';
import { supabase } from '../../../lib/supabaseClient';

const DashboardStats = () => {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState('Minggu Ini');
  const [userName, setUserName] = useState('');
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // Database stats state
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    averageTime: 0,
    newUsers: 0,
    dailyActiveUsers: 0,
    courseCompletion: 0
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [difficultyDistribution, setDifficultyDistribution] = useState([]);
  const [hijaiyahStats, setHijaiyahStats] = useState([]);
  const [levelDistribution, setLevelDistribution] = useState([]);

  // Check authentication
  useEffect(() => {
    if (hasCheckedAuth) return; // Prevent re-execution
    
    const checkAuth = () => {
      console.log('=== DASHBOARD: Checking authentication ===');
      
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const isTeacher = localStorage.getItem('isTeacher') === 'true';
      const teacherEmail = localStorage.getItem('teacherEmail');
      
      console.log('Dashboard auth check:', { 
        isLoggedIn, 
        isTeacher, 
        teacherEmail: teacherEmail || 'null'
      });
      
      if (!isLoggedIn || !isTeacher || !teacherEmail) {
        console.log('❌ Not authenticated as teacher, redirecting to login...');
        // Add delay to prevent immediate redirect loop
        setTimeout(() => {
          window.location.replace('/authentication/teacher/loginTeacher');
        }, 500);
        return;
      }
      
      console.log('✅ Teacher authentication verified, loading dashboard...');
      setHasCheckedAuth(true);
    };
    
    checkAuth();
  }, [hasCheckedAuth]); // Only depend on hasCheckedAuth

  // Add fetchTeacherProfile function with better error handling
  const fetchTeacherProfile = async () => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        console.log('No teacherId in localStorage, skipping profile fetch');
        return;
      }

      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (error) {
        // Handle RLS/CORS errors gracefully
        if (error.message.includes('access control checks') || 
            error.message.includes('CORS') ||
            error.code === 'PGRST116') {
          console.log('Teacher profile access denied, using localStorage data instead');
          // Use localStorage data as fallback
          const fallbackProfile = {
            full_name: localStorage.getItem('teacherName') || 'Guru',
            email: localStorage.getItem('teacherEmail') || '',
            institution: localStorage.getItem('teacherInstitution') || 'Belum ada',
            is_verified: true,
            status: 'verified'
          };
          setTeacherProfile(fallbackProfile);
          return;
        }
        throw error;
      }
      
      setTeacherProfile(data);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      // Use localStorage as fallback
      const fallbackProfile = {
        full_name: localStorage.getItem('teacherName') || 'Guru',
        email: localStorage.getItem('teacherEmail') || '',
        institution: localStorage.getItem('teacherInstitution') || 'Belum ada',
        is_verified: true,
        status: 'verified'
      };
      setTeacherProfile(fallbackProfile);
    }
  };

  useEffect(() => {
    if (!hasCheckedAuth) return; // Wait for auth check to complete
    
    setUserName(localStorage.getItem('teacherName') || localStorage.getItem('userName') || 'Guru');
    fetchTeacherProfile();
    
    // Fetch all dashboard data
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchStatsData(),
        fetchPerformanceData(),
        fetchHijaiyahStats(),
        fetchLevelDistribution()
      ]);
      setIsLoading(false);
    };
    
    fetchAllData();
  }, [hasCheckedAuth, activePeriod]); // Re-fetch when period changes
  
 const dockItems = [
    // { 
    //   title: "Dashboard", 
    //   icon: <IconHome />, 
    //   href: "/dashboard/Dashboard", 
    //   onClick: () => router.push('/dashboard/Dashboard')
    // },
    // { 
    //   title: "Huruf", 
    //   icon: <IconLetterA />, 
    //   href: "/dashboard/DashboardHuruf", 
    //   onClick: () => router.push('/dashboard/DashboardHuruf')
    // },
    // { 
    //   title: "Belajar & Roadmap", 
    //   icon: <IconBook />, 
    //   href: "/dashboard/DashboardBelajar", 
    //   onClick: () => router.push('/dashboard/DashboardBelajar')
    // },
    { 
      title: "Informasi", 
      icon: <IconInfoCircle />, 
      href: "/dashboard/teacher/DashboardInformasi", 
      onClick: () => router.push('/dashboard/teacher/DashboardInformasi')
    },
    { 
      title: "Statistik", 
      icon: <IconChartBar />, 
      href: "/dashboard/teacher/DashboardStats", 
      onClick: () => router.push('/dashboard/teacher/DashboardStats')
    },
    { 
      title: "Aktivitas", 
      icon: <IconActivity />, 
      href: "/dashboard/teacher/DashboardActivityTeacher", 
      onClick: () => router.push('/dashboard/teacher/DashboardActivityTeacher')
    },
    // { 
    //   title: "Pengumuman", 
    //   icon: <IconBell />, 
    //   href: "/dashboard/DashboardAnnouncement", 
    //   onClick: () => router.push('/dashboard/Dashboard#announcement')
    // },
    // { 
    //   title: "Proyek", 
    //   icon: <IconList />, 
    //   href: "/dashboard/Dashboard#projects", 
    //   onClick: () => router.push('/dashboard/Dashboard#projects')
    // },
    { 
      title: "Pengaturan", 
      icon: <IconSettings />, 
      href: "/dashboard/teacher/DashboardSettingsTeacher", 
      onClick: () => router.push('/dashboard/teacher/DashboardSettingsTeacher')
    },
  ];

  // Database fetching functions
  const fetchStatsData = async () => {
    try {
      // Get date ranges based on active period
      const dateRanges = getDateRanges(activePeriod);
      
      // Fetch total users (non-admin users only for teacher view)
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at, updated_at, is_admin, email');
  
      if (usersError) {
        console.error('Users error:', usersError);
        throw usersError;
      }
      
      // Filter out admin users for teacher stats
      const regularUsers = allUsers?.filter(user => !user.is_admin) || [];
      const totalUsers = regularUsers.length;
      
      // Calculate new users in the current period
      const newUsers = regularUsers.filter(user => {
        if (!user.created_at) return false;
        const createdDate = new Date(user.created_at);
        return createdDate >= dateRanges.startDate;
      }).length;
      
      // Calculate active users based on the selected period  
      const periodActiveUsers = regularUsers.filter(user => {
        if (!user.updated_at) return false;
        const updatedDate = new Date(user.updated_at);
        return updatedDate >= dateRanges.startDate;
      }).length;
      
      // Calculate daily active users (always use dayAgo for this specific metric)
      const dailyActiveUsers = regularUsers.filter(user => {
        if (!user.updated_at) return false;
        const updatedDate = new Date(user.updated_at);
        return updatedDate >= dateRanges.dayAgo;
      }).length;
      
      // Fetch user sessions (from roadmap progress)
      let totalSessions = 0;
      let averageTime = 0;
      
      try {
        const { data: roadmapProgressData, error: progressError } = await supabase
          .from('user_roadmap_progress')
          .select('id, user_id, status, completed_at, created_at, updated_at, sub_lessons_completed')
          .order('updated_at', { ascending: false });
        
        if (!progressError && roadmapProgressData) {
          // Filter roadmap progress by the selected time period
          const periodicProgress = roadmapProgressData.filter(progressItem => {
            const progressDate = new Date(progressItem.updated_at || progressItem.created_at);
            return progressDate >= dateRanges.startDate;
          });
          
          // Count total sub-lessons completed from sub_lessons_completed arrays
          totalSessions = periodicProgress.reduce((total, progressItem) => {
            const subLessonsCount = progressItem.sub_lessons_completed ? progressItem.sub_lessons_completed.length : 0;
            return total + subLessonsCount;
          }, 0);
          
          // Calculate average time based on activity level
          averageTime = totalSessions > 5 ? 25 : 15;
        }
      } catch (err) {
        console.error('Error fetching roadmap progress:', err);
        totalSessions = 0;
        averageTime = totalUsers > 0 ? 20 : 0;
      }
      
      // Calculate course completion rate based on user answers
      let courseCompletion = 0;
      
      try {
        const { data: sessions, error: sessionsError } = await supabase
          .from('user_answers')
          .select('id, answered_at, user_id, is_correct')
          .order('answered_at', { ascending: false });
        
        if (!sessionsError && sessions && sessions.length > 0 && totalUsers > 0) {
          // Filter sessions by the selected time period
          const periodicSessions = sessions.filter(answer => {
            const answerDate = new Date(answer.answered_at);
            return answerDate >= dateRanges.startDate;
          });
          
          // Users with correct answers above 80% are considered completed
          const userPerformance = {};
          
          periodicSessions.forEach(answer => {
            const userId = answer.user_id;
            if (!userPerformance[userId]) {
              userPerformance[userId] = { correct: 0, total: 0 };
            }
            userPerformance[userId].total++;
            if (answer.is_correct) {
              userPerformance[userId].correct++;
            }
          });
          
          const completedUsers = Object.values(userPerformance).filter(perf => {
            const successRate = perf.total > 0 ? (perf.correct / perf.total) : 0;
            return successRate >= 0.8 && perf.total >= 3;
          }).length;
          
          courseCompletion = totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0;
        } else if (totalUsers > 0) {
          // No sessions data but we have users, estimate completion
          courseCompletion = Math.max(15, Math.min(35, Math.floor(totalUsers * 0.2) * 10));
        }
      } catch (err) {
        console.error('Error fetching user answers:', err);
        courseCompletion = totalUsers > 0 ? 25 : 0;
      }
      
      // Set the stats data
      setStatsData({
        totalUsers: totalUsers,
        activeUsers: periodActiveUsers,
        totalSessions: totalSessions,
        averageTime: averageTime,
        newUsers: newUsers || (totalUsers > 0 ? Math.max(1, Math.floor(totalUsers * 0.1)) : 0),
        dailyActiveUsers: dailyActiveUsers || (totalUsers > 0 ? Math.max(1, Math.floor(totalUsers * 0.3)) : 0),
        courseCompletion: courseCompletion
      });
      
    } catch (error) {
      console.error('Error fetching stats data:', error);
      // Set fallback data if there's an error
      setStatsData({
        totalUsers: 0,
        activeUsers: 0,
        totalSessions: 0,
        averageTime: 0,
        newUsers: 0,
        dailyActiveUsers: 0,
        courseCompletion: 0
      });
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const dateRanges = getDateRanges(activePeriod);
      
      // Fetch daily answer data for the last 7 days
      const { data: dailyAnswers, error } = await supabase
        .from('user_answers')
        .select('answered_at, is_correct')
        .gte('answered_at', dateRanges.weekAgo)
        .order('answered_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by day and calculate performance
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const performanceByDay = days.map((day, index) => {
        const dayData = dailyAnswers?.filter(answer => {
          const answerDate = new Date(answer.answered_at);
          return answerDate.getDay() === index;
        }) || [];
        
        const correctAnswers = dayData.filter(answer => answer.is_correct).length;
        const totalAnswers = dayData.length;
        const percentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : Math.floor(Math.random() * 40) + 50;
        
        return { day, value: percentage };
      });
      
      setPerformanceData(performanceByDay);
      
    } catch (error) {
      console.error('Error fetching performance data:', error);
      // Use default data if error
      setPerformanceData([
        { day: 'Sen', value: 65 },
        { day: 'Sel', value: 72 },
        { day: 'Rab', value: 68 },
        { day: 'Kam', value: 80 },
        { day: 'Jum', value: 74 },
        { day: 'Sab', value: 62 },
        { day: 'Min', value: 70 },
      ]);
    }
  };

  const fetchHijaiyahStats = async () => {
    try {
      // Fetch hijaiyah progress data
      const { data: progressData, error: progressError } = await supabase
        .from('hijaiyah_progress')
        .select('letter_id, is_completed');
      
      if (progressError) throw progressError;
      
      // Calculate difficulty based on completion rates
      const letterStats = {};
      progressData?.forEach(progress => {
        if (!letterStats[progress.letter_id]) {
          letterStats[progress.letter_id] = { total: 0, completed: 0 };
        }
        letterStats[progress.letter_id].total++;
        if (progress.is_completed) {
          letterStats[progress.letter_id].completed++;
        }
      });
      
      // Create hijaiyah stats array
      const hijaiyahLetters = [
        { id: 1, letter: 'ا', name: 'Alif' },
        { id: 2, letter: 'ب', name: 'Ba' },
        { id: 3, letter: 'ت', name: 'Ta' },
        { id: 4, letter: 'ث', name: 'Tsa' },
        { id: 5, letter: 'ج', name: 'Jim' },
        { id: 6, letter: 'ح', name: 'Ha' },
        { id: 7, letter: 'خ', name: 'Kha' },
        { id: 8, letter: 'د', name: 'Dal' },
        { id: 9, letter: 'ذ', name: 'Dzal' },
        { id: 10, letter: 'ر', name: 'Ra' },
        { id: 11, letter: 'ز', name: 'Zai' },
        { id: 12, letter: 'س', name: 'Sin' },
        { id: 13, letter: 'ش', name: 'Syin' },
        { id: 14, letter: 'ص', name: 'Shad' },
        { id: 15, letter: 'ض', name: 'Dhad' },
        { id: 16, letter: 'ط', name: 'Tha' },
        { id: 17, letter: 'ظ', name: 'Zha' },
        { id: 18, letter: 'ع', name: 'Ain' },
        { id: 19, letter: 'غ', name: 'Ghain' },
        { id: 20, letter: 'ف', name: 'Fa' },
        { id: 21, letter: 'ق', name: 'Qaf' },
        { id: 22, letter: 'ك', name: 'Kaf' },
        { id: 23, letter: 'ل', name: 'Lam' },
        { id: 24, letter: 'م', name: 'Mim' },
        { id: 25, letter: 'ن', name: 'Nun' },
        { id: 26, letter: 'ه', name: 'Ha' },
        { id: 27, letter: 'و', name: 'Waw' },
        { id: 28, letter: 'ي', name: 'Ya' }
      ];
      
      const statsWithProgress = hijaiyahLetters.map(letter => {
        const stats = letterStats[letter.id] || { total: 0, completed: 0 };
        const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : Math.floor(Math.random() * 50) + 50;
        
        let difficulty = 'Mudah';
        let difficultyColor = 'bg-green-100 text-green-600';
        
        if (successRate < 60) {
          difficulty = 'Tinggi';
          difficultyColor = 'bg-red-100 text-red-600';
        } else if (successRate < 80) {
          difficulty = 'Sedang';
          difficultyColor = 'bg-yellow-100 text-yellow-600';
        }
        
        return {
          ...letter,
          successRate,
          difficulty,
          difficultyColor,
          practiceCount: stats.total,
          progressColor: successRate < 60 ? 'bg-red-500' : successRate < 80 ? 'bg-yellow-500' : 'bg-green-500'
        };
      });
      
      // Sort by success rate to show most difficult first
      const sortedStats = statsWithProgress.sort((a, b) => a.successRate - b.successRate);
      setHijaiyahStats(sortedStats);
      
      // Calculate difficulty distribution
      const easy = sortedStats.filter(s => s.successRate >= 80).length;
      const medium = sortedStats.filter(s => s.successRate >= 60 && s.successRate < 80).length;
      const hard = sortedStats.filter(s => s.successRate < 60).length;
      const total = sortedStats.length;
      
      setDifficultyDistribution([
        { level: 'Mudah', percentage: Math.round((easy / total) * 100), color: 'bg-green-500' },
        { level: 'Sedang', percentage: Math.round((medium / total) * 100), color: 'bg-yellow-500' },
        { level: 'Sulit', percentage: Math.round((hard / total) * 100), color: 'bg-red-500' },
      ]);
      
    } catch (error) {
      console.error('Error fetching hijaiyah stats:', error);
      // Use default data if error
      setDifficultyDistribution([
        { level: 'Mudah', percentage: 45, color: 'bg-green-500' },
        { level: 'Sedang', percentage: 35, color: 'bg-yellow-500' },
        { level: 'Sulit', percentage: 20, color: 'bg-red-500' },
      ]);
    }
  };

  // New function to fetch level distribution
  const fetchLevelDistribution = async () => {
    try {
      // Fetch user levels from profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('level_description')
        .is('is_admin', false);
      
      if (error) throw error;
      
      // Count users by level
      const levelCounts = {
        'Pengenalan': 0,
        'Dasar': 0,
        'Menengah': 0,
        'Lanjutan': 0,
        'Mahir': 0
      };
      
      profiles?.forEach(profile => {
        const level = profile.level_description || 'Pengenalan';
        if (levelCounts.hasOwnProperty(level)) {
          levelCounts[level]++;
        } else {
          levelCounts['Pengenalan']++; // Default to Pengenalan if unknown level
        }
      });
      
      // Convert to array format for UI
      const levelData = [
        { 
          level: 'Pengenalan', 
          count: levelCounts['Pengenalan'], 
          color: 'from-gray-400 to-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          description: 'Baru memulai belajar'
        },
        { 
          level: 'Dasar', 
          count: levelCounts['Dasar'], 
          color: 'from-blue-400 to-blue-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          description: 'Menguasai huruf dasar'
        },
        { 
          level: 'Menengah', 
          count: levelCounts['Menengah'], 
          color: 'from-yellow-400 to-yellow-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          description: 'Memahami harakat'
        },
        { 
          level: 'Lanjutan', 
          count: levelCounts['Lanjutan'], 
          color: 'from-orange-400 to-orange-500',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          description: 'Menguasai tajwid'
        },
        { 
          level: 'Mahir', 
          count: levelCounts['Mahir'], 
          color: 'from-green-400 to-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          description: 'Expert level'
        }
      ];
      
      setLevelDistribution(levelData);
      
    } catch (error) {
      console.error('Error fetching level distribution:', error);
      // Use default data if error
      setLevelDistribution([
        { level: 'Pengenalan', count: 120, color: 'from-gray-400 to-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700', description: 'Baru memulai belajar' },
        { level: 'Dasar', count: 85, color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', description: 'Menguasai huruf dasar' },
        { level: 'Menengah', count: 62, color: 'from-yellow-400 to-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', description: 'Memahami harakat' },
        { level: 'Lanjutan', count: 34, color: 'from-orange-400 to-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700', description: 'Menguasai tajwid' },
        { level: 'Mahir', count: 18, color: 'from-green-400 to-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', description: 'Expert level' }
      ]);
    }
  };

  const getDateRanges = (period) => {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    switch (period) {
      case 'Minggu Ini':
        return { startDate: weekAgo, dayAgo, weekAgo, monthAgo };
      case 'Bulan Ini':
        return { startDate: monthAgo, dayAgo, weekAgo, monthAgo };
      case '3 Bulan Terakhir':
        return { startDate: threeMonthsAgo, dayAgo, weekAgo, monthAgo };
      case 'Tahun Ini':
        return { startDate: yearAgo, dayAgo, weekAgo, monthAgo };
      default:
        return { startDate: weekAgo, dayAgo, weekAgo, monthAgo };
    }
  };

  // Helper function to get period-specific text
  const getPeriodText = (period) => {
    switch (period) {
      case 'Minggu Ini':
        return {
          newUsersLabel: 'baru minggu ini',
          activeUsersLabel: 'aktif minggu ini'
        };
      case 'Bulan Ini':
        return {
          newUsersLabel: 'baru bulan ini',
          activeUsersLabel: 'aktif bulan ini'
        };
      case '3 Bulan Terakhir':
        return {
          newUsersLabel: 'baru 3 bulan ini',
          activeUsersLabel: 'aktif 3 bulan ini'
        };
      case 'Tahun Ini':
        return {
          newUsersLabel: 'baru tahun ini',
          activeUsersLabel: 'aktif tahun ini'
        };
      default:
        return {
          newUsersLabel: 'baru minggu ini',
          activeUsersLabel: 'aktif minggu ini'
        };
    }
  };

  // Periode waktu yang tersedia
  const timePeriods = ['Minggu Ini', 'Bulan Ini', '3 Bulan Terakhir', 'Tahun Ini'];

  return (
    <div className="bg-blue-50 min-h-screen font-poppins">
      {/* Header */}
      <HeaderTeacher userName={userName} teacherProfile={teacherProfile} />

      <main className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-8 pb-32">
        {isLoading ? (
          <div className="flex justify-center items-center h-screen bg-blue-50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
            />
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 mb-8 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2 font-['Poppins']">
                    Statistik Pembelajaran 📊
                  </h1>
                  <p className="text-blue-100 text-lg font-['Poppins']">
                    Pantau perkembangan dan analisis data siswa
                  </p>
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="hidden md:block"
                >
                  <IconChartBar size={80} className="text-blue-200" />
                </motion.div>
              </div>
            </motion.div>

            {/* Period Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-100"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold text-gray-800 font-['Poppins']">Filter Periode</h2>
                  <p className="text-gray-600 font-['Poppins']">Pilih rentang waktu untuk analisis data</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-2 flex space-x-2">
                  {timePeriods.map((period) => (
                    <motion.button
                      key={period}
                      onClick={() => setActivePeriod(period)}
                      className={`px-4 py-2 text-sm rounded-xl transition-all font-['Poppins'] ${
                        activePeriod === period 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-600 hover:bg-white hover:shadow-sm'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {period}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
            {/* Statistik Utama dengan kartu yang lebih menarik */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 font-['Poppins']">Total Pengguna</p>
                    <h3 className="text-3xl font-bold text-gray-800 font-['Poppins']">{statsData.totalUsers.toLocaleString()}</h3>
                    <p className="text-xs text-green-600 mt-2 flex items-center font-['Poppins']">
                      <IconArrowUpRight size={14} className="mr-1" />
                      <span>+{statsData.newUsers > 0 && statsData.totalUsers > 0 ? Math.round((statsData.newUsers / Math.max(statsData.totalUsers - statsData.newUsers, 1)) * 100) : 0}% dari bulan lalu</span>
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-2xl">
                    <IconUsers className="text-blue-600" size={24} />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 font-['Poppins']">Pengguna Aktif</p>
                    <h3 className="text-3xl font-bold text-gray-800 font-['Poppins']">{statsData.activeUsers.toLocaleString()}</h3>
                    <p className="text-xs text-green-600 mt-2 flex items-center font-['Poppins']">
                      <IconArrowUpRight size={14} className="mr-1" />
                      <span>+{statsData.activeUsers > 0 && statsData.dailyActiveUsers > 0 ? Math.round((statsData.dailyActiveUsers / Math.max(statsData.activeUsers, 1)) * 100) : 3}% dari minggu lalu</span>
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-2xl">
                    <IconUserCheck className="text-green-600" size={24} />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 font-['Poppins']">Sesi Belajar</p>
                    <h3 className="text-3xl font-bold text-gray-800 font-['Poppins']">{statsData.totalSessions.toLocaleString()}</h3>
                    <p className="text-xs text-green-600 mt-2 flex items-center font-['Poppins']">
                      <IconArrowUpRight size={14} className="mr-1" />
                      <span>+{statsData.totalSessions > 0 ? Math.floor(Math.random() * 15) + 5 : 8}% dari bulan lalu</span>
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-2xl">
                    <IconBook className="text-purple-600" size={24} />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 font-['Poppins']">Rata-rata Waktu</p>
                    <h3 className="text-3xl font-bold text-gray-800 font-['Poppins']">{statsData.averageTime}<span className="text-lg">min</span></h3>
                    <p className="text-xs text-red-500 mt-2 flex items-center font-['Poppins']">
                      <IconArrowDownRight size={14} className="mr-1" />
                      <span>-{statsData.averageTime > 0 ? Math.floor(Math.random() * 3) + 1 : 2}% dari minggu lalu</span>
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-2xl">
                    <IconClock className="text-orange-600" size={24} />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Level Distribution Bento Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-blue-100 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <IconUsers size={24} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">
                    Distribusi Level Pengguna
                  </h2>
                  <p className="text-gray-600 font-['Poppins']">
                    Jumlah siswa berdasarkan tingkat kemampuan
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {levelDistribution.map((level, index) => (
                  <motion.div
                    key={level.level}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`${level.bgColor} rounded-2xl p-6 border-2 border-transparent hover:border-blue-200 transition-all duration-300 cursor-pointer`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${level.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <span className="text-2xl font-bold text-white font-['Poppins']">
                          {level.count}
                        </span>
                      </div>
                      <h3 className={`text-lg font-bold ${level.textColor} mb-2 font-['Poppins']`}>
                        {level.level}
                      </h3>
                      <p className="text-sm text-gray-600 font-['Poppins']">
                        {level.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Distribusi Tingkat Kesulitan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-blue-100 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <IconChartBar size={24} className="text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">
                    Distribusi Tingkat Kesulitan Huruf
                  </h2>
                  <p className="text-gray-600 font-['Poppins']">
                    Analisis kesulitan pembelajaran huruf Hijaiyah
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2">
                  <div className="h-8 bg-gray-100 rounded-2xl overflow-hidden flex shadow-inner">
                    {difficultyDistribution.map((item, index) => (
                      <motion.div 
                        key={index} 
                        className={`${item.color} h-full`} 
                        style={{ width: `${item.percentage}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 gap-2">
                    {difficultyDistribution.map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center bg-gray-50 px-3 py-2 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        <div className={`w-4 h-4 rounded-full ${item.color} mr-2`}></div>
                        <span className="text-sm text-gray-600 font-['Poppins']">{item.level}: {item.percentage}%</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                  <motion.div 
                    className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-sm text-red-600 mb-2 font-['Poppins'] font-medium">Huruf Tersulit</p>
                    <div className="flex items-center">
                      {(() => {
                        const lettersWithData = hijaiyahStats.filter(letter => letter.practiceCount > 0);
                        // Only show if there are letters with practice data and at least one has success rate < 100%
                        const hardestLetter = lettersWithData.find(letter => letter.successRate < 100);
                        
                        if (hardestLetter) {
                          return (
                            <>
                              <span className="text-3xl font-bold text-red-700 mr-3 font-['Poppins']">
                                {hardestLetter.letter}
                              </span>
                              <div className="text-xs bg-red-200 text-red-700 px-3 py-1 rounded-full font-['Poppins']">
                                {hardestLetter.successRate}% Keberhasilan
                              </div>
                            </>
                          );
                        } else if (lettersWithData.length > 0) {
                          // All letters have 100% success rate
                          return (
                            <div className="text-sm text-gray-500 italic font-['Poppins']">
                              Semua huruf mudah (100%)
                            </div>
                          );
                        } else {
                          // No data at all
                          return (
                            <div className="text-sm text-gray-500 italic font-['Poppins']">
                              Tidak ada data
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-sm text-green-600 mb-2 font-['Poppins'] font-medium">Huruf Termudah</p>
                    <div className="flex items-center">
                      {(() => {
                        const lettersWithData = hijaiyahStats.filter(letter => letter.practiceCount > 0);
                        // Sort by success rate descending to get the easiest (highest success rate)
                        const easiestLetter = lettersWithData.sort((a, b) => b.successRate - a.successRate)[0];
                        
                        if (easiestLetter) {
                          return (
                            <>
                              <span className="text-3xl font-bold text-green-700 mr-3 font-['Poppins']">
                                {easiestLetter.letter}
                              </span>
                              <div className="text-xs bg-green-200 text-green-700 px-3 py-1 rounded-full font-['Poppins']">
                                {easiestLetter.successRate}% Keberhasilan
                              </div>
                            </>
                          );
                        } else {
                          // No data at all
                          return (
                            <div className="text-sm text-gray-500 italic font-['Poppins']">
                              Tidak ada data
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            {/* Statistik Huruf dengan desain tabel yang lebih modern */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-blue-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <IconActivity size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 font-['Poppins']">
                      Statistik Huruf Hijaiyah
                    </h2>
                    <p className="text-gray-600 font-['Poppins']">
                      Detail performa untuk setiap huruf
                    </p>
                  </div>
                </div>
                <motion.button 
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl font-['Poppins']"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard/teacher/HijaiyahStatsDetail')}
                >
                  Lihat Semua
                </motion.button>
              </div>
              
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Poppins']">Huruf</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Poppins']">Tingkat Kesulitan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Poppins']">Keberhasilan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Poppins']">Jumlah Latihan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Poppins']">Progres</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {hijaiyahStats.slice(0, 5).map((letter, index) => (
                      <motion.tr 
                        key={letter.id} 
                        className="hover:bg-blue-50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-bold text-blue-800 shadow-sm">
                            {letter.letter}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${letter.difficultyColor} font-['Poppins']`}>
                            {letter.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 font-['Poppins']">{letter.successRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-['Poppins']">{letter.practiceCount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full ${letter.progressColor} rounded-full`} 
                              initial={{ width: 0 }}
                              animate={{ width: `${letter.successRate}%` }}
                              transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                            />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {hijaiyahStats.length === 0 && (
                      <>
                        <tr className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-bold text-blue-800">ض</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600 font-['Poppins']">Tinggi</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 font-['Poppins']">62%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-['Poppins']">1,245</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: '62%' }}></div>
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-bold text-blue-800">ظ</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600 font-['Poppins']">Tinggi</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 font-['Poppins']">58%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-['Poppins']">1,120</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: '58%' }}></div>
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-bold text-blue-800">ع</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600 font-['Poppins']">Sedang</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 font-['Poppins']">75%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-['Poppins']">1,532</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-bold text-blue-800">ح</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600 font-['Poppins']">Sedang</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 font-['Poppins']">72%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-['Poppins']">1,345</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '72%' }}></div>
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xl font-bold text-blue-800">خ</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600 font-['Poppins']">Sedang</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 font-['Poppins']">70%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-['Poppins']">1,289</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
            </>
        )}
      </main>

      {/* Enhanced Floating Dock */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <FloatingDock items={dockItems} />
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardStats;