import { supabase } from '@/lib/supabaseClient';

interface SubLesson {
  id: number;
  title: string;
  description: string;
  order_sequence: number;
  completed?: boolean;
  status?: 'locked' | 'active' | 'completed';
}

interface RoadmapLevel {
  id: number;
  title: string;
  description: string;
  status: string;
  order_sequence: number;
  sub_lessons: SubLesson[];
}

export const getRoadmapLevels = async (userId: string) => {
  // First get the roadmap levels
  const { data: levels, error: levelsError } = await supabase
    .from('roadmap_levels')
    .select(`
      *,
      sub_lessons:roadmap_sub_lessons(
        id,
        title,
        description,
        order_sequence
      )
    `)
    .order('order_sequence');

  if (levelsError) {
    console.error('Error fetching roadmap:', levelsError);
    throw levelsError;
  }

  // Process the data to include proper status for sub-lessons
  const processedLevels = levels.map((level: RoadmapLevel) => {
    // Sort sub-lessons by order sequence
    const sortedSubLessons = level.sub_lessons.sort((a: SubLesson, b: SubLesson) => 
      a.order_sequence - b.order_sequence
    );
    
    // Add status to sub-lessons based on the previous lesson completion
    const subLessonsWithStatus = sortedSubLessons.map((subLesson: SubLesson, index: number) => {
      let status: 'locked' | 'active' | 'completed' = 'locked';
      
      if (level.status === 'active') {
        if (index === 0) {
          status = 'active';
        } else {
          // Check if previous lesson would be completed
          const previousLesson = sortedSubLessons[index - 1];
          status = previousLesson.completed ? 'active' : 'locked';
        }
      }
      
      return {
        ...subLesson,
        status
      };
    });

    return {
      ...level,
      sub_lessons: subLessonsWithStatus
    };
  });

  return processedLevels;
};

export const updateRoadmapProgress = async (userId: string, roadmapId: number, progress: number) => {
  const { data, error } = await supabase
    .from('user_roadmap_progress')
    .upsert({
      user_id: userId,
      roadmap_id: roadmapId,
      progress: progress,
      status: progress >= 100 ? 'completed' : progress > 0 ? 'active' : 'locked',
      completed_at: progress >= 100 ? new Date().toISOString() : null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRoadmapWithSubLessons = async (userId: string) => {
  const { data: levels, error: levelsError } = await supabase
    .from('roadmap_levels')
    .select(`
      *,
      sub_lessons:roadmap_sub_lessons(
        id,
        title,
        description,
        status,
        order_sequence,
        points,
        user_progress:user_sub_lesson_progress(
          progress,
          status,
          completed_at
        )
      )
    `)
    .order('order_sequence');

  if (levelsError) throw levelsError;

  // Format data for frontend
  return levels.map((level: any) => ({
    ...level,
    sub_lessons: level.sub_lessons.sort((a: any, b: any) => a.order_sequence - b.order_sequence)
  }));
};

export const updateSubLessonProgress = async (userId: string, subLessonId: number, progress: number) => {
  const { data, error } = await supabase
    .from('user_sub_lesson_progress')
    .upsert({
      user_id: userId,
      sub_lesson_id: subLessonId,
      progress: progress,
      status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
      completed_at: progress >= 100 ? new Date().toISOString() : null
    })
    .select();

  if (error) throw error;
  return data;
};
