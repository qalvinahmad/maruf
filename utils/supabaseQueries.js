import { supabase } from '../lib/supabaseClient';

// Get user's roadmap progress
export const getUserRoadmapProgress = async (userId) => {
  const { data, error } = await supabase
    .from('roadmap_levels')
    .select(`
      *,
      lessons:lessons(count),
      progress:user_progress(count)
    `)
    .order('order_sequence');
  
  return { data, error };
};

// Get lessons for a specific roadmap level
export const getRoadmapLessons = async (roadmapId, userId) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      progress:user_progress(status, progress)
    `)
    .eq('roadmap_id', roadmapId)
    .order('order_sequence');
  
  return { data, error };
};

// Update user progress
export const updateUserProgress = async (userId, lessonId, progress) => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      progress: progress,
      status: progress === 100 ? 'completed' : 'in_progress',
      completed_at: progress === 100 ? new Date() : null
    });
  
  return { data, error };
};

// Get user achievements
export const getUserAchievements = async (userId) => {
  const { data, error } = await supabase
    .from('achievements')
    .select(`
      *,
      user_achievements!inner(*)
    `)
    .eq('user_achievements.user_id', userId);
  
  return { data, error };
};
