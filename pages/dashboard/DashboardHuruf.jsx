import { IconCalendar, IconCheck, IconChevronRight, IconClock, IconEar, IconFilter, IconFlame, IconHeart, IconLetterA, IconMicrophone, IconSearch, IconStar, IconVolume, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import StreakDialogHuruf from '../../components/dialog/StreakDialogHuruf';
import BlurText from '../../components/ui/blur-text';
import { Dock } from '../../components/ui/dock';
import { Toast, showToast } from '../../components/ui/toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import GradientText from '../../src/blocks/TextAnimations/GradientText/GradientText';

export default function DashboardHuruf() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState({
    id: null,
    full_name: '',
    email: '',
    level: 1,
    xp: 0,
    points: 0,
    streak: 0,
    level_description: 'Pemula',
    energy: 5,
    is_admin: false,
    admin_id: null,
    role: 'student',
    created_at: null,
    updated_at: null
  });
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [completedLetters, setCompletedLetters] = useState(new Set()); // Remove hardcoded data
  const [favoriteLetters, setFavoriteLetters] = useState(new Set());
  const [featuredLetters, setFeaturedLetters] = useState(new Set([1, 8, 24])); // Featured letters list
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showLetterDialog, setShowLetterDialog] = useState(false);
  const [showFeaturedDialog, setShowFeaturedDialog] = useState(false);
  const [showStreakDialog, setShowStreakDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(null);
  const [hijaiyahProgressData, setHijaiyahProgressData] = useState([]); // Add state for progress data
  
  // References for scroll animations
  const heroRef = useRef(null);
  const progressRef = useRef(null);
  const lettersGridRef = useRef(null);
  
  // Check if elements are in view
  const heroInView = useInView(heroRef, { once: true, threshold: 0.3 });
  const progressInView = useInView(progressRef, { once: true, threshold: 0.3 });
  const lettersInView = useInView(lettersGridRef, { once: true, threshold: 0.1 });

  // Complete Hijaiyah letters data - All 28 letters
  const hijaiyahLetters = [
    { 
      id: 1, 
      arabic: 'ا', 
      latin: 'Alif', 
      sound: '/audio/alif.mp3', 
      difficulty: 'beginner',
      category: 'basic',
      description: 'Huruf pertama dalam abjad Arab',
      makhraj: 'Al-Jauf (Rongga mulut)',
      color: 'bg-blue-500',
      progress: 100
    },
    { 
      id: 2, 
      arabic: 'ب', 
      latin: 'Ba', 
      sound: '/audio/ba.mp3', 
      difficulty: 'beginner',
      category: 'basic',
      description: 'Diucapkan dengan menempelkan bibir',
      makhraj: 'Asy-Syafatain (Dua bibir)',
      color: 'bg-emerald-500',
      progress: 85
    },
    { 
      id: 3, 
      arabic: 'ت', 
      latin: 'Ta', 
      sound: '/audio/ta.mp3', 
      difficulty: 'beginner',
      category: 'basic',
      description: 'Huruf dengan dua titik di atas',
      makhraj: 'Ujung lidah dengan akar gigi seri atas',
      color: 'bg-purple-500',
      progress: 70
    },
    { 
      id: 4, 
      arabic: 'ث', 
      latin: 'Tsa', 
      sound: '/audio/tsa.mp3', 
      difficulty: 'intermediate',
      category: 'intermediate',
      description: 'Huruf dengan tiga titik di atas',
      makhraj: 'Ujung lidah dengan ujung gigi seri atas',
      color: 'bg-amber-500',
      progress: 40
    },
    { 
      id: 5, 
      arabic: 'ج', 
      latin: 'Jim', 
      sound: '/audio/jim.mp3', 
      difficulty: 'intermediate',
      category: 'intermediate',
      description: 'Huruf dengan titik di bawah lekukan',
      makhraj: 'Pertengahan lidah dengan langit-langit keras',
      color: 'bg-rose-500',
      progress: 60
    },
    { 
      id: 6, 
      arabic: 'ح', 
      latin: 'Ha', 
      sound: '/audio/ha.mp3', 
      difficulty: 'advanced',
      category: 'throat',
      description: 'Huruf tenggorokan tanpa titik',
      makhraj: 'Tengah tenggorokan',
      color: 'bg-cyan-500',
      progress: 20
    },
    { 
      id: 7, 
      arabic: 'خ', 
      latin: 'Kha', 
      sound: '/audio/kha.mp3', 
      difficulty: 'advanced',
      category: 'throat',
      description: 'Huruf tenggorokan dengan titik di atas',
      makhraj: 'Ujung tenggorakan',
      color: 'bg-orange-500',
      progress: 15
    },
    { 
      id: 8, 
      arabic: 'د', 
      latin: 'Dal', 
      sound: '/audio/dal.mp3', 
      difficulty: 'beginner',
      category: 'basic',
      description: 'Huruf berbentuk busur tanpa titik',
      makhraj: 'Ujung lidah dengan gigi seri atas',
      color: 'bg-teal-500',
      progress: 90
    },
    { 
      id: 9, 
      arabic: 'ذ', 
      latin: 'Dzal', 
      sound: '/audio/dzal.mp3', 
      difficulty: 'intermediate',
      category: 'intermediate',
      description: 'Huruf dengan satu titik di atas',
      makhraj: 'Ujung lidah dengan ujung gigi seri atas',
      color: 'bg-pink-500',
      progress: 30
    },
    { 
      id: 10, 
      arabic: 'ر', 
      latin: 'Ra', 
      sound: '/audio/ra.mp3', 
      difficulty: 'intermediate',
      category: 'tongue',
      description: 'Huruf dengan ujung melengkung',
      makhraj: 'Sisi ujung lidah dengan gusi atas',
      color: 'bg-violet-500',
      progress: 50
    },
    { 
      id: 11, 
      arabic: 'ز', 
      latin: 'Za', 
      sound: '/audio/za.mp3', 
      difficulty: 'intermediate',
      category: 'tongue',
      description: 'Huruf dengan satu titik di atas',
      makhraj: 'Ujung lidah dengan gigi bawah',
      color: 'bg-indigo-500',
      progress: 45
    },
    { 
      id: 12, 
      arabic: 'س', 
      latin: 'Sin', 
      sound: '/audio/sin.mp3', 
      difficulty: 'intermediate',
      category: 'tongue',
      description: 'Huruf dengan tiga lekukan di atas',
      makhraj: 'Ujung lidah dengan pangkal gigi seri bawah',
      color: 'bg-green-500',
      progress: 55
    },
    { 
      id: 13, 
      arabic: 'ش', 
      latin: 'Syin', 
      sound: '/audio/syin.mp3', 
      difficulty: 'intermediate',
      category: 'tongue',
      description: 'Huruf dengan tiga titik di atas',
      makhraj: 'Ujung lidah dengan pangkal gigi seri bawah',
      color: 'bg-slate-500',
      progress: 35
    },
    { 
      id: 14, 
      arabic: 'ص', 
      latin: 'Shad', 
      sound: '/audio/shad.mp3', 
      difficulty: 'advanced',
      category: 'advanced',
      description: 'Huruf emphatic tanpa titik',
      makhraj: 'Ujung lidah dengan gigi seri atas',
      color: 'bg-lime-500',
      progress: 25
    },
    { 
      id: 15, 
      arabic: 'ض', 
      latin: 'Dhad', 
      sound: '/audio/dhad.mp3', 
      difficulty: 'advanced',
      category: 'advanced',
      description: 'Huruf emphatic dengan satu titik',
      makhraj: 'Sisi lidah dengan geraham atas',
      color: 'bg-yellow-500',
      progress: 20
    },
    { 
      id: 16, 
      arabic: 'ط', 
      latin: 'Tha', 
      sound: '/audio/tha.mp3', 
      difficulty: 'advanced',
      category: 'advanced',
      description: 'Huruf emphatic tanpa titik',
      makhraj: 'Ujung lidah dengan akar gigi seri atas',
      color: 'bg-red-500',
      progress: 15
    },
    { 
      id: 17, 
      arabic: 'ظ', 
      latin: 'Zha', 
      sound: '/audio/zha.mp3', 
      difficulty: 'advanced',
      category: 'advanced',
      description: 'Huruf emphatic dengan satu titik',
      makhraj: 'Ujung lidah dengan ujung gigi seri atas',
      color: 'bg-fuchsia-500',
      progress: 10
    },
    { 
      id: 18, 
      arabic: 'ع', 
      latin: 'Ain', 
      sound: '/audio/ain.mp3', 
      difficulty: 'advanced',
      category: 'throat',
      description: 'Huruf tenggorokan tanpa titik',
      makhraj: 'Tengah tenggorakan',
      color: 'bg-emerald-600',
      progress: 30
    },
    { 
      id: 19, 
      arabic: 'غ', 
      latin: 'Ghain', 
      sound: '/audio/ghain.mp3', 
      difficulty: 'advanced',
      category: 'throat',
      description: 'Huruf tenggorokan dengan satu titik',
      makhraj: 'Ujung tenggorakan',
      color: 'bg-sky-500',
      progress: 25
    },
    { 
      id: 20, 
      arabic: 'ف', 
      latin: 'Fa', 
      sound: '/audio/fa.mp3', 
      difficulty: 'beginner',
      category: 'basic',
      description: 'Huruf dengan satu titik di atas',
      makhraj: 'Ujung gigi seri atas dengan bibir bawah',
      color: 'bg-violet-600',
      progress: 80
    },
    { 
      id: 21, 
      arabic: 'ق', 
      latin: 'Qaf', 
      sound: '/audio/qaf.mp3', 
      difficulty: 'advanced',
      category: 'throat',
      description: 'Huruf dengan dua titik di atas',
      makhraj: 'Pangkal lidah dengan langit-langit lunak',
      color: 'bg-amber-600',
      progress: 20
    },
    { 
      id: 22, 
      arabic: 'ك', 
      latin: 'Kaf', 
      sound: '/audio/kaf.mp3', 
      difficulty: 'intermediate',
      category: 'intermediate',
      description: 'Huruf tanpa titik, mirip dengan Qaf',
      makhraj: 'Pangkal lidah dengan langit-langit keras',
      color: 'bg-rose-600',
      progress: 45
    },
    { 
      id: 23, 
      arabic: 'ل', 
      latin: 'Lam', 
      sound: '/audio/lam.mp3', 
      difficulty: 'beginner',
      category: 'basic',
      description: 'Huruf dengan lengkungan ke atas',
      makhraj: 'Ujung lidah dengan langit-langit keras',
      color: 'bg-teal-600',
      progress: 75
    },
    { 
      id: 24, 
      arabic: 'م', 
      latin: 'Mim', 
      sound: '/audio/mim.mp3', 
      difficulty: 'beginner',
      category: 'basic',
      description: 'Huruf berbentuk bulat kecil',
      makhraj: 'Asy-Syafatain (Dua bibir)',
      color: 'bg-blue-600',
      progress: 85
    },
    { 
      id: 25, 
      arabic: 'ن', 
      latin: 'Nun', 
      sound: '/audio/nun.mp3', 
      difficulty: 'beginner',
      category: 'basic',
      description: 'Huruf dengan satu titik di atas',
      makhraj: 'Ujung lidah dengan langit-langit keras',
      color: 'bg-purple-600',
      progress: 70
    },
    { 
      id: 26, 
      arabic: 'و', 
      latin: 'Waw', 
      sound: '/audio/waw.mp3', 
      difficulty: 'intermediate',
      category: 'intermediate',
      description: 'Huruf berbentuk seperti angka 9',
      makhraj: 'Dua bibir dengan sedikit membulat',
      color: 'bg-orange-600',
      progress: 50
    },
    { 
      id: 27, 
      arabic: 'ه', 
      latin: 'Ha', 
      sound: '/audio/ha2.mp3', 
      difficulty: 'intermediate',
      category: 'intermediate',
      description: 'Huruf berbentuk bulat dengan lubang',
      makhraj: 'Ujung tenggorokan',
      color: 'bg-pink-600',
      progress: 40
    },
    { 
      id: 28, 
      arabic: 'ي', 
      latin: 'Ya', 
      sound: '/audio/ya.mp3', 
      difficulty: 'intermediate',
      category: 'intermediate',
      description: 'Huruf dengan dua titik di bawah',
      makhraj: 'Pertengahan lidah dengan langit-langit keras',
      color: 'bg-indigo-600',
      progress: 55
    }
  ];

 const dockItems = [
    { 
      title: "Dashboard", 
      icon: <img src="/icon/icons8-home-100.png" alt="Home" className="w-6 h-6" />, 
      href: '/dashboard/home/Dashboard'
    },
    { 
      title: "Huruf", 
      icon: <img src="/icon/icons8-scroll-100.png" alt="Huruf" className="w-6 h-6" />, 
      href: '/dashboard/DashboardHuruf'
    },
    { 
      title: "Belajar & Roadmap", 
      icon: <img src="/icon/icons8-course-assign-100.png" alt="Belajar" className="w-6 h-6" />, 
      href: '/dashboard/DashboardBelajar'
    },
    {
      title: "Toko",
      icon: <img src="/icon/icons8-shopping-cart-100.png" alt="Toko" className="w-6 h-6" />,
      href: '/dashboard/toko/DashboardShop'
    },
    { 
      title: "Pengaturan", 
      icon: <img src="/icon/setting.png" alt="Pengaturan" className="w-6 h-6" />, 
      href: '/dashboard/setting/DashboardSettings'
    },
  ];

  // Initialize data and fetch profile
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }

    const initData = async () => {
      if (!loading && user) {
        try {
          setIsLoading(true);
          
          // Fetch profile data
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (profile) {
            setProfileData(profile);
            setUserName(profile.full_name || user.email);
            
            // Fetch hijaiyah progress from the correct table
            const { data: hijaiyahProgress, error: progressError } = await supabase
              .from('hijaiyah_progress')
              .select('*')
              .eq('user_id', user.id);
              
            if (progressError) {
              console.error('Error fetching hijaiyah progress:', progressError);
              // Don't show toast for optional data - just log
            } else if (hijaiyahProgress) {
              setHijaiyahProgressData(hijaiyahProgress);
              
              // Update completed letters from hijaiyah_progress table
              const completedIds = new Set(
                hijaiyahProgress
                  .filter(item => item.is_completed)
                  .map(item => item.letter_id)
              );
              setCompletedLetters(completedIds);
            }
            
            // Fetch favorite letters
            const { data: favorites, error: favError } = await supabase
              .from('favorite_letters')
              .select('letter_id')
              .eq('user_id', user.id);
              
            if (favError) {
              console.error('Error fetching favorites:', favError);
              // Don't show toast for optional data - just log
            } else if (favorites) {
              setFavoriteLetters(new Set(favorites.map(fav => fav.letter_id)));
            }
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          showToast.error('Terjadi kesalahan saat memuat data');
        } finally {
          // Simulated loading for better UX
          setTimeout(() => {
            setIsLoading(false);
          }, 800);
        }
      }
    };
    
    initData();
  }, [user, loading, router]);

  // Check and handle streak dialog
  useEffect(() => {
    if (profileData.id && profileData.streak > 0 && !isLoading) {
      // Delay to ensure login session is initialized first
      setTimeout(() => {
        checkStreakDialog();
      }, 2000);
    }
  }, [profileData.streak, isLoading]);

  const checkStreakDialog = () => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('streakDialogShown');
    const lastShownTimestamp = localStorage.getItem('streakDialogShownTimestamp');
    const lastLogin = localStorage.getItem('lastLoginDate');
    
    // Check if more than 24 hours passed since last login
    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin);
      const now = new Date();
      const hoursDiff = (now - lastLoginDate) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        // Reset streak to 0 if more than 24 hours
        updateStreakToZero();
        return;
      }
    }
    
    // Show dialog if haven't shown today and user has streak
    // Also check timestamp to ensure it's really been 24 hours
    let shouldShow = false;
    
    if (lastShown !== today && profileData.streak > 0) {
      shouldShow = true;
      
      // Double check with timestamp (24 hour rule)
      if (lastShownTimestamp) {
        const lastShownTime = new Date(parseInt(lastShownTimestamp));
        const now = new Date();
        const hoursSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60);
        
        if (hoursSinceLastShown < 24) {
          shouldShow = false;
        }
      }
    }
    
    if (shouldShow) {
      setTimeout(() => {
        setShowStreakDialog(true);
      }, 1000); // Show after 1 second delay
    }
    
    // Update last login date
    localStorage.setItem('lastLoginDate', new Date().toISOString());
  };

  const updateStreakToZero = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ streak: 0 })
        .eq('id', profileData.id);
        
      if (error) throw error;
      
      setProfileData(prev => ({ ...prev, streak: 0 }));
      showToast.info('Streak telah direset karena lebih dari 24 jam tidak login');
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const handleStreakDialogClose = () => {
    setShowStreakDialog(false);
  };

  // Utility function for testing (can be called from browser console)
  const testStreakDialog = () => {
    localStorage.removeItem('streakDialogShown');
    localStorage.removeItem('streakDialogShownTimestamp');
    if (profileData.streak > 0) {
      setShowStreakDialog(true);
    } else {
      console.log('No streak to show. Current streak:', profileData.streak);
    }
  };

  // Make testStreakDialog available globally for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.testStreakDialog = testStreakDialog;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.testStreakDialog;
      }
    };
  }, [profileData.streak]);

  // Initialize login session and update streak
  const initializeLoginSession = async () => {
    if (!profileData.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Check if user already logged in today
      const { data: todayLogin, error: checkError } = await supabase
        .from('login_logs')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('date', today)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking login logs:', checkError);
        return;
      }
      
      // If no login today, create new login log and update streak
      if (!todayLogin) {
        // Insert new login log
        const { error: insertError } = await supabase
          .from('login_logs')
          .insert([{
            user_id: profileData.id,
            date: today,
            created_at: new Date().toISOString()
          }]);
        
        if (insertError) {
          console.error('Error inserting login log:', insertError);
          return;
        }
        
        // Check if login was consecutive (yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const { data: yesterdayLogin, error: yesterdayError } = await supabase
          .from('login_logs')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('date', yesterdayStr)
          .single();
        
        if (yesterdayError && yesterdayError.code !== 'PGRST116') {
          console.error('Error checking yesterday login:', yesterdayError);
        }
        
        // Update streak
        let newStreak = 1;
        if (yesterdayLogin) {
          // Consecutive login, increment streak
          newStreak = (profileData.streak || 0) + 1;
        }
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ streak: newStreak })
          .eq('id', profileData.id);
        
        if (updateError) {
          console.error('Error updating streak:', updateError);
        } else {
          setProfileData(prev => ({ ...prev, streak: newStreak }));
        }
      }
    } catch (error) {
      console.error('Error initializing login session:', error);
    }
  };

  // Call initialize login session when profile data is loaded
  useEffect(() => {
    if (profileData.id && !isLoading) {
      initializeLoginSession();
    }
  }, [profileData.id, isLoading]);

  // Filter letters based on search and filters
  const filteredLetters = hijaiyahLetters.filter(letter => {
    const matchesSearch = letter.latin.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         letter.arabic.includes(searchQuery);
    
    const matchesCategory = selectedCategory === 'all' || letter.category === selectedCategory;
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'completed' && completedLetters.has(letter.id)) ||
                      (activeTab === 'inProgress' && !completedLetters.has(letter.id)) ||
                      (activeTab === 'favorites' && favoriteLetters.has(letter.id));
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Calculate overall progress
  const overallProgress = Math.round((completedLetters.size / hijaiyahLetters.length) * 100);

  // Get featured letter for hero card - using cycling index
  const getFeaturedLetter = () => {
    if (featuredLetters.size > 0) {
      const featuredIds = Array.from(featuredLetters);
      const currentId = featuredIds[currentFeaturedIndex % featuredIds.length];
      return hijaiyahLetters.find(letter => letter.id === currentId) || hijaiyahLetters[0];
    }
    return hijaiyahLetters[0]; // Fallback to first letter
  };
  
  const featuredLetter = getFeaturedLetter();
  
  // Next featured letter function with cycling logic
  const goToNextFeaturedLetter = () => {
    if (featuredLetters.size > 1) {
      setCurrentFeaturedIndex(prev => {
        const nextIndex = prev + 1;
        // If we've reached the end, cycle back to the beginning
        return nextIndex >= featuredLetters.size ? 0 : nextIndex;
      });
    }
  };

  // Handlers
  const handleLogout = () => {
    localStorage.clear();
    router.push('/authentication/login');
  };
  
  const handleProfileUpdate = (updatedProfile) => {
    setProfileData(updatedProfile);
  };

  // Handle letter interactions with haptic feedback
  const handleLetterClick = (letter) => {
    // Open dialog instead of navigation
    setSelectedLetter(letter);
    setShowLetterDialog(true);
  };

  // Toggle featured letter
  const toggleFeatured = (event, letterId) => {
    event.stopPropagation();
    
    const isFeatured = featuredLetters.has(letterId);
    
    setFeaturedLetters(prev => {
      const newFeatured = new Set(prev);
      if (newFeatured.has(letterId)) {
        newFeatured.delete(letterId);
      } else {
        newFeatured.add(letterId);
      }
      return newFeatured;
    });
    
    // Show toast feedback
    const letterName = hijaiyahLetters.find(l => l.id === letterId)?.latin || 'Huruf';
    if (isFeatured) {
      showToast.success(`${letterName} dihapus dari huruf pilihan`);
    } else {
      showToast.success(`${letterName} ditambah ke huruf pilihan!`);
    }
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Toggle favorite letter with database update
  const toggleFavorite = async (event, letterId) => {
    event.stopPropagation();
    
    const isFavorite = !favoriteLetters.has(letterId);
    
    // Update local state first for immediate feedback
    setFavoriteLetters(prev => {
      const newFavorites = new Set(prev);
      if (isFavorite) {
        newFavorites.add(letterId);
      } else {
        newFavorites.delete(letterId);
      }
      return newFavorites;
    });
    
    // Update database
    await updateFavoriteLetters(letterId, isFavorite);
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Update letter progress in database when completed
  const updateLetterProgress = async (letterId, isCompleted = true) => {
    if (!user) return;

    try {
      const progressData = {
        user_id: user.id,
        letter_id: letterId,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('hijaiyah_progress')
        .upsert(progressData, {
          onConflict: 'user_id,letter_id'
        });

      if (error) throw error;

      // Update local state
      setCompletedLetters(prev => {
        const newCompleted = new Set(prev);
        if (isCompleted) {
          newCompleted.add(letterId);
        } else {
          newCompleted.delete(letterId);
        }
        return newCompleted;
      });

      // Show success feedback
      const letterName = hijaiyahLetters.find(l => l.id === letterId)?.latin || 'Huruf';
      showToast.success(isCompleted ? `${letterName} ditandai sebagai dikuasai!` : `${letterName} ditandai belum dikuasai`);

      // Cek dan update roadmap progress jika semua huruf sudah completed
      // TIDAK dipanggil lagi di sini, akan dipanggil setelah tes komprehensif
      // await updateRoadmapProgressIfAllLettersCompleted();

    } catch (error) {
      showToast.error('Gagal memperbarui progress huruf');
    }
  };

  // Fungsi untuk handle tes komprehensif dan update roadmap progress setelah selesai
  const handleComprehensiveTest = () => {
    // Navigasi ke tes komprehensif tanpa letterId (tes semua huruf)
    router.push('/latihan/comprehensive-test');
  };

  // Fungsi untuk update user_roadmap_progress jika semua huruf sudah completed
  const updateRoadmapProgressIfAllLettersCompleted = async () => {
    if (!user) return;
    
    try {
      console.log('Checking if all letters completed for user:', user.id);
      
      // Ambil data progress huruf dari database
      const { data: progressData, error } = await supabase
        .from('hijaiyah_progress')
        .select('letter_id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      if (error) {
        console.error('Error fetching hijaiyah progress:', error);
        return;
      }
      
      const completedCount = progressData ? progressData.length : 0;
      console.log(`User completed ${completedCount} out of 28 letters`);
      
      if (completedCount === 28) {
        console.log('All 28 letters completed! Updating roadmap progress...');
        
        // Cek apakah sudah ada record di user_roadmap_progress untuk Level 0
        const { data: existingRoadmap, error: checkError } = await supabase
          .from('user_roadmap_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('roadmap_id', 1) // Level 0 biasanya roadmap_id = 1
          .single();
          
        console.log('Existing roadmap data:', existingRoadmap);
        
        // Juga coba dengan roadmap_id = 0 jika tidak ada dengan id = 1
        if (!existingRoadmap) {
          const { data: existingRoadmap0, error: checkError0 } = await supabase
            .from('user_roadmap_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('roadmap_id', 0)
            .single();
          console.log('Existing roadmap data for ID 0:', existingRoadmap0);
        }
        
        // Cek struktur roadmap_levels untuk memastikan ID yang benar
        const { data: roadmapLevels, error: roadmapError } = await supabase
          .from('roadmap_levels')
          .select('id, title, order_sequence')
          .order('order_sequence');
          
        console.log('Available roadmap levels:', roadmapLevels);
        
        // Gunakan roadmap level pertama (biasanya Level 0)
        const firstRoadmapId = roadmapLevels && roadmapLevels.length > 0 ? roadmapLevels[0].id : 1;
        
        const now = new Date().toISOString();
        const updateData = {
          user_id: user.id,
          roadmap_id: firstRoadmapId, // Level 0 - sesuaikan dengan data roadmap Anda
          progress: 100,
          status: 'completed',
          completed_at: now,
          created_at: existingRoadmap ? existingRoadmap.created_at : now,
          updated_at: now,
          sub_lessons_completed: [] // Kosong - sub lesson akan diatur berdasarkan progress individual
        };
        
        console.log('Updating user_roadmap_progress with data:', updateData);
        
        const { data: upsertResult, error: upsertError } = await supabase
          .from('user_roadmap_progress')
          .upsert(updateData, { onConflict: 'user_id,roadmap_id' })
          .select();
          
        if (upsertError) {
          console.error('Error upserting roadmap progress:', upsertError);
          showToast.error(`Gagal update roadmap: ${upsertError.message}`);
        } else {
          console.log('Successfully updated roadmap progress:', upsertResult);
          showToast.success('🎉 Selamat! Anda telah menyelesaikan semua huruf Level 0. Progress roadmap diupdate!');
        }
      } else {
        console.log(`Still need ${28 - completedCount} more letters to complete Level 0`);
      }
    } catch (err) {
      console.error('Error in updateRoadmapProgressIfAllLettersCompleted:', err);
      showToast.error(`Error updating roadmap: ${err.message}`);
    }
  };

  // Update favorite letters in database
  const updateFavoriteLetters = async (letterId, isFavorite) => {
    if (!user) {
      showToast.error('Anda harus login terlebih dahulu');
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_letters')
          .insert({
            user_id: user.id,
            letter_id: letterId
          });
        
        if (error && error.code !== '23505') { // Ignore duplicate key error
          console.error('Error adding favorite:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('favorite_letters')
          .delete()
          .eq('user_id', user.id)
          .eq('letter_id', letterId);
        
        if (error) {
          console.error('Error removing favorite:', error);
          throw error;
        }
      }

      // Show success feedback
      const letterName = hijaiyahLetters.find(l => l.id === letterId)?.latin || 'Huruf';
      showToast.success(isFavorite ? `${letterName} ditambah ke favorit!` : `${letterName} dihapus dari favorit`);

    } catch (error) {
      console.error('Favorite letters error:', error);
      
      // Revert local state on error
      setFavoriteLetters(prev => {
        const newFavorites = new Set(prev);
        if (isFavorite) {
          newFavorites.delete(letterId);
        } else {
          newFavorites.add(letterId);
        }
        return newFavorites;
      });
      
      showToast.error('Tabel favorite_letters belum ada. Silakan buat tabel terlebih dahulu.');
    }
  };

  // Play letter sound with visual feedback and auto-next for featured letters
  const playSound = (event, letterId, soundUrl, isFromFeatured = false) => {
    event.stopPropagation();
    
    // Stop any currently playing sound
    if (isPlaying) {
      isPlaying.pause();
      isPlaying.currentTime = 0;
    }
    
    // Play new sound
    const audio = new Audio(soundUrl);
    
    audio.addEventListener('ended', () => {
      setIsPlaying(null);
      
      // If playing from featured card, auto-advance to next featured letter
      if (isFromFeatured && featuredLetters.size > 1) {
        setTimeout(() => {
          goToNextFeaturedLetter();
        }, 500); // Small delay before switching
      }
    });
    
    setIsPlaying(audio);
    audio.play().catch(err => {
      showToast.error('Audio tidak dapat diputar');
      setIsPlaying(null);
    });
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };
  
  // Loading state with skeleton UI for better perceived performance
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 font-inter">
        <Header 
          userName="Loading..."
          profileData={{
            level: 1,
            xp: 0,
            points: 0,
            streak: 0,
            level_description: 'Loading...',
            energy: 0
          }}
          onLogout={() => {}}
        />
        
        <div className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-12">
          {/* Hero skeleton */}
          <div className="h-64 bg-white/40 animate-pulse rounded-2xl mb-12"></div>
          
          {/* Tabs skeleton */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 w-28 bg-white/60 animate-pulse rounded-full"></div>
            ))}
          </div>
          
          {/* Search skeleton */}
          <div className="h-12 bg-white/60 animate-pulse rounded-xl mb-12"></div>
          
          {/* Letters grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            {[...Array(28)].map((_, i) => (
              <div key={i} className="h-48 bg-white/60 animate-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 font-poppins">
      <Toast />
      <Head>
        <title>Belajar Huruf Hijaiyah • Makhrojul Huruf</title>
        <meta name="description" content="Pelajari huruf hijaiyah dengan metode interaktif dan menyenangkan" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Scheherazade+New:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Scheherazade+New:wght@400;500;600;700&display=swap');
          
          .font-poppins {
            font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }
          
          .font-arabic {
            font-family: 'Scheherazade New', 'Arabic Typesetting', 'Traditional Arabic', serif !important;
            font-weight: 700;
            line-height: 1;
            letter-spacing: 0;
            font-feature-settings: 'liga' 1, 'calt' 1;
            font-display: swap;
          }
          
          .font-arabic-featured {
            font-family: 'Scheherazade New', 'Arabic Typesetting', 'Traditional Arabic', serif !important;
            font-weight: 700;
            line-height: 0.8;
            letter-spacing: 0;
            font-feature-settings: 'liga' 1, 'calt' 1;
            font-display: swap;
          }
          
          /* Smooth hover transitions */
          .featured-button-hover {
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform-origin: center;
          }
          
          .featured-button-hover:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08);
          }
          
          .featured-text-transition {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .featured-icon-transition {
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        `}</style>
      </Head>

      <Header 
        userName={userName}
        profileData={profileData}
        onLogout={handleLogout}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 py-16 md:py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {/* Badge for visual hierarchy */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                <IconStar size={14} className="text-yellow-300" />
                <span>Pembelajaran Interaktif</span>
              </div>
              
              {/* Main heading with custom animation */}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  Belajar Hijaiyah
                </h1>
              </div>
              
              {/* Descriptive text with flip animation */}
              <div className="max-w-lg">
                 <BlurText
              text="Huruf hijaiyah dengan benar melalui panduan yang interaktif. "
              delay={200}
              className="inline-block text-lg font-medium text-white/90 backdrop-blur-sm px-3 py-1 rounded-lg"
              animateBy="words"
              direction="bottom"
              stepDuration={0.4}
            />
                
              </div>
              
              {/* Progress stats for motivation */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white/70">
                      {overallProgress === 100 ? 'Anda telah menyelesaikan semua huruf' : 'Progress Pembelajaran'}
                    </span>
                    <span className="text-sm font-medium">{overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
                </div>
                <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                  <IconCalendar size={16} className="text-white/70" />
                  <div>
                    <span className="block text-xs text-white/70">Streak</span>
                    <span className="font-medium">{profileData.streak} hari</span>
                  </div>
                </div>
              </div>
              
              {/* Call to action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => document.getElementById('letters-grid').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-indigo-600 hover:text-indigo-700 hover:bg-white/90 px-6 py-3 rounded-xl font-medium transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 focus:outline-none"
                >
                  Lihat Semua Huruf
                </button>
                
                {/* Button Tes Komprehensif - hanya muncul jika semua huruf selesai */}
                {overallProgress === 100 && (
                  <button 
                    onClick={handleComprehensiveTest}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none flex items-center gap-2 shadow-lg"
                  >
                    <IconCheck size={18} />
                    <span> Tes Komprehensif</span>
                  </button>
                )}
                
                {/* Button biasa jika belum semua selesai */}
                {overallProgress !== 100 && (
                  <button 
                    onClick={handleComprehensiveTest}
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/40 text-white px-6 py-3 rounded-xl font-medium transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none flex items-center gap-2"
                  >
                    <IconCheck size={18} />
                    <span>Tes Komprehensif</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Featured letter card */}
            <div className="relative max-w-md mx-auto w-full">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-3xl transform rotate-3 scale-105"></div>
              
              {/* Card */}
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-lg">
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setShowFeaturedDialog(true)}
                    className="group inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs hover:bg-white/30 cursor-pointer featured-button-hover"
                  >
                    <IconStar size={14} className="text-yellow-300 featured-icon-transition group-hover:scale-110 group-hover:rotate-12" /> 
                    <span className="featured-text-transition group-hover:hidden">Huruf Pilihan</span>
                    <span className="featured-text-transition hidden group-hover:inline">Huruf Pilihan ({featuredLetters.size})</span>
                  </button>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-6 py-6">
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-6xl md:text-7xl font-bold font-arabic-featured">
                    {featuredLetter.arabic}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-white/75 text-sm mb-6">{featuredLetter.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <IconMicrophone size={16} className="text-white/70" />
                        <span>Makhraj: {featuredLetter.makhraj}</span>
                      </div>
                      
                      <button 
                        onClick={(e) => playSound(e, featuredLetter.id, featuredLetter.sound, true)}
                        className="group flex items-center gap-2 mx-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-5 py-2.5 rounded-xl transition-all duration-300"
                      >
                        <IconVolume size={18} className={isPlaying ? "text-green-300 animate-pulse" : "text-white"} />
                        <span>Dengarkan Pelafalan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content - Redesigned with modern UX principles */}
      <section ref={progressRef} className="py-16 bg-gradient-to-b from-white/80 to-gray-50/50">
        <div className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16">
          
          {/* Enhanced Section Header with better information hierarchy */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <IconCheck size={16} />
              <span>{overallProgress === 100 ? 'Anda telah menyelesaikan semua huruf' : 'Progress Pembelajaran'}</span>
            </div>
            
            <GradientText 
              className="text-3xl lg:text-5xl font-bold mb-4"
              colors={["#00acee", "#9146FF", "#00acee"]}
              animationSpeed={6}
            >
              Progress Hijaiyah
            </GradientText>

            <BlurText
              text="Lacak pencapaian pembelajaran huruf hijaiyah dengan visualisasi yang komprehensif dan mudah dipahami"
              delay={200}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              animateBy="words"
              direction="bottom"
              stepDuration={0.4}
            />
          </motion.div>

          {/* Enhanced Learning Stats Cards with improved visual hierarchy */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20"
          >
            {/* Card 1 - Dikuasai (Mastered) */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-2">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* Icon and badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IconCheck size={28} strokeWidth={2.5} />
                  </div>
                  <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Selesai
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Dikuasai</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Huruf yang telah Anda kuasai dengan baik</p>
                  
                  {/* Large number display */}
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-gray-900">{completedLetters.size}</span>
                    <span className="text-2xl text-gray-400 font-medium mb-2">/ 28</span>
                  </div>
                  
                  {/* Progress visualization */}
                  <div className="space-y-3">
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedLetters.size / 28) * 100}%` }}
                        transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{Math.round((completedLetters.size / 28) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 2 - Dalam Proses (In Progress) */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-amber-200 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IconClock size={28} strokeWidth={2.5} />
                  </div>
                  <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Aktif
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Dalam Proses</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Huruf yang sedang Anda pelajari</p>
                  
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-gray-900">{hijaiyahLetters.length - completedLetters.size}</span>
                    <span className="text-lg text-gray-500 font-medium mb-2">huruf</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((hijaiyahLetters.length - completedLetters.size) / 28) * 100}%` }}
                        transition={{ delay: 0.9, duration: 1.2, ease: "easeOut" }}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Tersisa</span>
                      <span>{Math.round(((hijaiyahLetters.length - completedLetters.size) / 28) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 3 - Favorit */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-rose-200 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-pink-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IconHeart size={28} strokeWidth={2.5} />
                  </div>
                  <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Favorit
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Favorit</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Huruf yang Anda tandai sebagai favorit</p>
                  
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-gray-900">{favoriteLetters.size}</span>
                    <span className="text-lg text-gray-500 font-medium mb-2">huruf</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1 + (i * 0.1), duration: 0.4, ease: "easeOut" }}
                        className={`flex-1 h-3 rounded-lg transition-all duration-300 ${
                          i < Math.min(favoriteLetters.size, 5) 
                            ? 'bg-gradient-to-t from-rose-500 to-pink-600 shadow-sm' 
                            : 'bg-gray-200'
                        }`}
                      ></motion.div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                     {favoriteLetters.size > 5 ? '5+' : favoriteLetters.size} huruf dipilih
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 4 - Streak Enhanced */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IconFlame size={28} strokeWidth={2.5} />
                  </div>
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Konsisten
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">Streak Belajar</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Konsistensi pembelajaran harian</p>
                  
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-gray-900">{profileData.streak}</span>
                    <span className="text-lg text-gray-500 font-medium mb-2">hari</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {[...Array(7)].map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.1 + (i * 0.1), duration: 0.4, ease: "easeOut" }}
                        className={`flex-1 h-4 rounded-lg transition-all duration-300 ${
                          i < (profileData.streak % 7) 
                            ? 'bg-gradient-to-t from-indigo-500 to-purple-600 shadow-sm' 
                            : 'bg-gray-200'
                        }`}
                      ></motion.div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    {profileData.streak} hari berturut-turut
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card Tes Komprehensif - Hanya muncul jika semua huruf selesai */}
          {overallProgress === 100 && (
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mb-16"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full transform -translate-x-16 translate-y-16"></div>
                
                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <IconCheck size={32} />
                  </motion.div>
                  
                  <h3 className="text-3xl font-bold mb-2">🎉 Selamat!</h3>
                  <p className="text-xl text-green-100 mb-6">Anda telah menyelesaikan semua huruf hijaiyah!</p>
                  <p className="text-green-100 mb-8 max-w-2xl mx-auto">
                    Saatnya mengikuti tes komprehensif untuk memastikan pemahaman Anda dan membuka level pembelajaran selanjutnya.
                    <br />
                    <span className="text-sm opacity-90">* Diperlukan skor 100% untuk menyelesaikan Level 0 dan membuka roadmap selanjutnya</span>
                  </p>
                  
                  <button 
                    onClick={handleComprehensiveTest}
                    className="bg-white text-green-600 hover:text-green-700 hover:bg-green-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
                  >
                    <IconCheck size={24} />
                    <span>Mulai Tes Komprehensif</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Navigation Tabs with better UX */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mb-12"
          >
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 max-w-2xl mx-auto">
              <div className="flex overflow-x-auto gap-1 scrollbar-hide">
                {[
                  { id: 'all', name: 'Semua Huruf', icon: IconLetterA, count: hijaiyahLetters.length },
                  { id: 'inProgress', name: 'Sedang Dipelajari', icon: IconClock, count: hijaiyahLetters.length - completedLetters.size },
                  { id: 'completed', name: 'Sudah Dikuasai', icon: IconCheck, count: completedLetters.size },
                  { id: 'favorites', name: 'Favorit', icon: IconHeart, count: favoriteLetters.size }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        activeTab === tab.id 
                          ? 'bg-indigo-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                      <Icon size={18} strokeWidth={2} />
                      <span>{tab.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Enhanced Search & Filter Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mb-12"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Enhanced Search Input */}
                <div className="flex-grow relative">
                  <input 
                    type="text" 
                    placeholder="Cari berdasarkan nama huruf atau makhraj..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-12 py-4 bg-gray-50 rounded-xl border-2 border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm placeholder-gray-500"
                    aria-label="Cari huruf hijaiyah"
                  />
                  <IconSearch size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                      aria-label="Clear search"
                    >
                      <IconX size={18} />
                    </button>
                  )}
                </div>

                {/* Enhanced Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                    showFilters 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-md' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  aria-expanded={showFilters}
                  aria-controls="filter-panel"
                >
                  <IconFilter size={20} strokeWidth={2} />
                  <span className="font-medium">Filter</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedCategory !== 'all' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedCategory !== 'all' ? '1' : '0'}
                  </span>
                </button>
              </div>

              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-600">
                    Menampilkan <span className="font-semibold text-gray-900">{filteredLetters.length}</span> huruf
                    {searchQuery && <span> untuk "<span className="font-semibold text-indigo-600">{searchQuery}</span>"</span>}
                  </p>
              
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                id="filter-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Kategori Huruf</h3>
                    <div className="space-y-2">
                      {[
                        { id: 'all', name: 'Semua Kategori' },
                        { id: 'basic', name: 'Dasar (ا، ب، ت، د، ف، ل، م، ن)' },
                        { id: 'intermediate', name: 'Menengah (ث، ج، ذ، ر، ز، س، ش، ك، و، ه، ي)' },
                        { id: 'throat', name: 'Tenggorokan (ح، خ، ع، غ، ق)' },
                        { id: 'advanced', name: 'Lanjutan (ص، ض، ط، ظ)' }
                      ].map((category) => (
                        <label 
                          key={category.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="radio"
                              name="category"
                              value={category.id}
                              checked={selectedCategory === category.id}
                              onChange={() => setSelectedCategory(category.id)}
                              className="appearance-none w-5 h-5 rounded-full border border-gray-300 checked:border-indigo-500 checked:border-[5px] transition-all cursor-pointer"
                            />
                          </div>
                          <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Tips Belajar</h3>
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-sm text-indigo-700 mb-3">
                        Mulailah dari huruf dasar dan bertahap ke huruf yang lebih kompleks.
                        Fokus pada makhraj (tempat keluarnya huruf) untuk pelafalan yang tepat.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-indigo-600">
                        <IconEar size={14} />
                        <span>Dengarkan audio berulang kali untuk pemahaman lebih baik</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reset filter button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Reset Filter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Letters Grid */}
          <div id="letters-grid" ref={lettersGridRef} className="pb-32">
            {/* Result count and info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-medium text-gray-900">{filteredLetters.length}</span> huruf
                {searchQuery && <span> untuk pencarian "<span className="font-medium">{searchQuery}</span>"</span>}
              </p>
              <div className="text-sm text-gray-500">
                Total: {hijaiyahLetters.length} huruf hijaiyah
              </div>
            </div>

            {filteredLetters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLetters.map((letter, index) => (
                  <motion.div
                    key={letter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.6 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group relative"
                    onClick={() => handleLetterClick(letter)}
                  >
                    <div className="relative">
                      {/* Color band */}
                      <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                      
                      {/* Main content */}
                      <div className="p-4">
                        {/* Top section with actions */}
                        <div className="flex justify-between items-start mb-3">
                          {/* Letter display */}
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shadow-sm">
                            <span className="text-2xl font-bold text-gray-800 font-arabic">{letter.arabic}</span>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-1">
                            {/* Featured button */}
                            <button
                              onClick={(e) => toggleFeatured(e, letter.id)}
                              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                              aria-label={featuredLetters.has(letter.id) ? "Remove from featured" : "Add to featured"}
                            >
                              <IconStar 
                                size={14} 
                                fill={featuredLetters.has(letter.id) ? "#f59e0b" : "none"} 
                                stroke={featuredLetters.has(letter.id) ? "#f59e0b" : "currentColor"}
                                className={featuredLetters.has(letter.id) ? "text-amber-500" : "text-gray-400"}
                              />
                            </button>
                            
                            {/* Favorite button */}
                            <button
                              onClick={(e) => toggleFavorite(e, letter.id)}
                              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                              aria-label={favoriteLetters.has(letter.id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <IconHeart 
                                size={14} 
                                fill={favoriteLetters.has(letter.id) ? "#f43f5e" : "none"} 
                                stroke={favoriteLetters.has(letter.id) ? "#f43f5e" : "currentColor"}
                                className={favoriteLetters.has(letter.id) ? "text-rose-500" : "text-gray-400"}
                              />
                            </button>
                            
                            {/* Sound button */}
                            <button
                              onClick={(e) => playSound(e, letter.id, letter.sound)}
                              className={`p-1.5 rounded-full transition-colors ${
                                isPlaying ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-500'
                              }`}
                              aria-label="Play pronunciation"
                            >
                              <IconVolume size={14} className={isPlaying ? "animate-pulse" : ""} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Letter info */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 line-clamp-2">{letter.description}</p>
                        </div>
                        
                        {/* Makhraj info */}
                        <div className="flex items-center justify-center gap-2 text-sm mb-3 text-gray-600">
                          <IconMicrophone size={16} className="text-gray-400" />
                          <span>Makhraj: {letter.makhraj}</span>
                        </div>
                        
                        {/* Progress & category */}
                        <div className="flex justify-between items-center">
                          {/* Difficulty badge */}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            letter.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            letter.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {letter.difficulty === 'beginner' ? 'Dasar' :
                             letter.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                          </span>
                          
                          {/* Progress indicator */}
                          {completedLetters.has(letter.id) ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                              <IconCheck size={12} />
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="w-8 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${letter.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{letter.progress}%</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Hover indicator with arrow */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                            <IconChevronRight size={12} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // Empty state with helpful message
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <IconSearch size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada huruf yang ditemukan</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Tidak ada huruf yang sesuai dengan filter atau pencarian Anda. Coba ubah kriteria pencarian.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setActiveTab('all');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Reset Pencarian
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

       {/* Enhanced Dock with better positioning and styling */}
               <motion.div 
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 2, duration: 0.6 }}
                 className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
               >
               <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                 <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl">
                   <Dock items={dockItems} />
                 </div>
               </div>
               </motion.div>

      {/* Letter Detail Dialog */}
      <AnimatePresence>
        {showLetterDialog && selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLetterDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-3xl">
                <button
                  onClick={() => setShowLetterDialog(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <IconX size={20} />
                </button>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left side - Letter display */}
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-8xl font-bold font-arabic mb-4">
                      {selectedLetter.arabic}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{selectedLetter.latin}</h2>
                    <p className="text-white/80">{selectedLetter.description}</p>
                  </div>

                  {/* Right side - Actions and info */}
                  <div className="space-y-4">
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={(e) => toggleFeatured(e, selectedLetter.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          featuredLetters.has(selectedLetter.id)
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <IconStar size={18} fill={featuredLetters.has(selectedLetter.id) ? "currentColor" : "none"} />
                        <span className="font-medium">
                          {featuredLetters.has(selectedLetter.id) ? 'Hapus dari Pilihan' : 'Tambah ke Pilihan'}
                        </span>
                      </button>
                      
                      <button
                        onClick={(e) => toggleFavorite(e, selectedLetter.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          favoriteLetters.has(selectedLetter.id)
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <IconHeart size={18} fill={favoriteLetters.has(selectedLetter.id) ? "currentColor" : "none"} />
                        <span className="font-medium">
                          {favoriteLetters.has(selectedLetter.id) ? 'Hapus Favorit' : 'Tambah Favorit'}
                        </span>
                      </button>

                      {/* Test button */}
                      <button
                        onClick={() => {
                          setShowLetterDialog(false);
                          router.push({
                            pathname: '/latihan/comprehensive-test',
                            query: { letterId: selectedLetter.id }
                          });
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-indigo-600 hover:bg-white/90 transition-colors font-medium"
                      >
                        <IconCheck size={18} />
                        <span>Coba Latihan Huruf Ini</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-6">
                    {/* Audio Section */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <IconVolume size={18} className="text-indigo-600" />
                        Pelafalan
                      </h3>
                      <button
                        onClick={(e) => playSound(e, selectedLetter.id, selectedLetter.sound)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <IconVolume size={18} className={isPlaying ? "animate-pulse" : ""} />
                        <span>Dengarkan Pelafalan</span>
                      </button>
                    </div>
                    
                    {/* Makhraj Section */}
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <IconMicrophone size={18} className="text-blue-600" />
                        Makhraj (Tempat Keluarnya Huruf)
                      </h3>
                      <p className="text-gray-700">{selectedLetter.makhraj}</p>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    {/* Progress Section */}
                    <div className="bg-green-50 rounded-2xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <IconCheck size={18} className="text-green-600" />
                        {completedLetters.has(selectedLetter.id) ? 'Huruf Telah Dikuasai' : 'Progress Pembelajaran'}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            completedLetters.has(selectedLetter.id)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {completedLetters.has(selectedLetter.id) ? 'Sudah Dikuasai' : 'Dalam Proses'}
                          </span>
                        </div>
                        
                        {/* Show completion date if available */}
                        {completedLetters.has(selectedLetter.id) && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Diselesaikan</span>
                            <span className="text-sm text-gray-900">
                              {(() => {
                                const progressItem = hijaiyahProgressData.find(
                                  item => item.letter_id === selectedLetter.id && item.is_completed
                                );
                                if (progressItem?.completed_at) {
                                  return new Date(progressItem.completed_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  });
                                }
                                return 'Hari ini';
                              })()}
                            </span>
                          </div>
                        )}
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              completedLetters.has(selectedLetter.id) ? 'bg-green-500' : 'bg-amber-500'
                            }`}
                            style={{ width: completedLetters.has(selectedLetter.id) ? '100%' : '50%' }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {completedLetters.has(selectedLetter.id) ? (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                              <IconCheck size={14} />
                              Sudah Dikuasai
                            </span>
                          ) : (
                            <span className="text-sm text-gray-600">Masih dalam proses pembelajaran</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                        selectedLetter.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        selectedLetter.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        Tingkat: {selectedLetter.difficulty === 'beginner' ? 'Dasar' :
                                 selectedLetter.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Letters Dialog */}
      <AnimatePresence>
        {showFeaturedDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFeaturedDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-3xl">
                <button
                  onClick={() => setShowFeaturedDialog(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <IconX size={20} />
                </button>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <IconStar size={32} className="text-yellow-300" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Huruf Pilihan</h2>
                  <p className="text-white/80 text-sm">
                    {featuredLetters.size > 0 
                      ? `${featuredLetters.size} huruf dalam daftar pilihan Anda`
                      : 'Belum ada huruf dalam daftar pilihan'
                    }
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {featuredLetters.size > 0 ? (
                  <div className="space-y-4">
                    {Array.from(featuredLetters).map(letterId => {
                      const letter = hijaiyahLetters.find(l => l.id === letterId);
                      if (!letter) return null;
                      
                      return (
                        <div 
                          key={letter.id}
                          className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-amber-200 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {/* Letter Display */}
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                              <span className="text-3xl font-bold text-gray-800 font-arabic">
                                {letter.arabic}
                              </span>
                            </div>
                            
                            {/* Letter Info */}
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{letter.latin}</h3>
                              <p className="text-sm text-gray-600 mb-2">{letter.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <IconMicrophone size={12} />
                                <span>{letter.makhraj}</span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {/* Play Sound */}
                              <button
                                onClick={(e) => playSound(e, letter.id, letter.sound)}
                                className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                              >
                                <IconVolume size={16} />
                              </button>
                              
                              {/* Remove from Featured */}
                              <button
                                onClick={(e) => toggleFeatured(e, letter.id)}
                                className="p-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                              >
                                <IconStar size={16} fill="currentColor" />
                              </button>
                              
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  setShowFeaturedDialog(false);
                                  setSelectedLetter(letter);
                                  setShowLetterDialog(true);
                                }}
                                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              >
                                <IconChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-gray-500">Progress</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  letter.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                  letter.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                                  'bg-rose-100 text-rose-700'
                                }`}>
                                  {letter.difficulty === 'beginner' ? 'Dasar' :
                                   letter.difficulty === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                                </span>
                                <span className="text-xs text-gray-500">{letter.progress}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${letter.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Empty state
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <IconStar size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Huruf Pilihan</h3>
                    <p className="text-gray-500 mb-6">
                      Tambahkan huruf ke daftar pilihan dengan menekan tombol bintang pada card huruf.
                    </p>
                    <button
                      onClick={() => setShowFeaturedDialog(false)}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                )}
                
                {/* Footer Actions */}
                {featuredLetters.size > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <button
                      onClick={() => {
                        setFeaturedLetters(new Set());
                        setShowFeaturedDialog(false);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Hapus Semua
                    </button>
                    <button
                      onClick={() => setShowFeaturedDialog(false)}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Selesai
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Dialog */}
      <StreakDialogHuruf
        isOpen={showStreakDialog}
        onClose={handleStreakDialogClose}
        profileData={profileData}
      />
    </div>
  );
}