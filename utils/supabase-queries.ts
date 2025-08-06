import { supabase } from '@/lib/supabaseClient';

interface SubLesson {
  id: number;
  title: string;
  description: string;
  order_sequence: number;
  completed?: boolean;
  status?: 'locked' | 'active' | 'completed';
  score?: {
    percentage: number;
    correct: number;
    total: number;
  } | null;
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

  // Get user progress data
  const { data: progressData, error: progressError } = await supabase
    .from('user_progress')
    .select('sub_lesson_id, completed, score_percentage, correct_answers, total_questions')
    .eq('user_id', userId);

  if (progressError) {
    console.error('Error fetching progress:', progressError);
  }

  // Get user roadmap progress data
  const { data: roadmapProgressData, error: roadmapProgressError } = await supabase
    .from('user_roadmap_progress')
    .select('*')
    .eq('user_id', userId);

  if (roadmapProgressError) {
    console.error('Error fetching roadmap progress:', roadmapProgressError);
  }

  // Create a map of progress by sub lesson ID
  const progressMap = new Map();
  if (progressData) {
    progressData.forEach(progress => {
      progressMap.set(progress.sub_lesson_id, {
        completed: progress.completed,
        score: {
          percentage: progress.score_percentage || 0,
          correct: progress.correct_answers || 0,
          total: progress.total_questions || 0
        }
      });
    });
  }

  // Create a map of roadmap progress by roadmap ID
  const roadmapProgressMap = new Map();
  if (roadmapProgressData) {
    roadmapProgressData.forEach(progress => {
      roadmapProgressMap.set(progress.roadmap_id, progress);
    });
  }

  // Process the data to include proper status for sub-lessons
  const processedLevels = levels.map((level: RoadmapLevel) => {
    // Sort sub-lessons by order sequence
    const sortedSubLessons = level.sub_lessons.sort((a: SubLesson, b: SubLesson) => 
      a.order_sequence - b.order_sequence
    );
    
    // Add status to sub-lessons based on the previous lesson completion and roadmap progress
    const subLessonsWithStatus = sortedSubLessons.map((subLesson: SubLesson, index: number) => {
      let status: 'locked' | 'active' | 'completed' = 'locked';
      
      const userProgress = progressMap.get(subLesson.id);
      const roadmapProgress = roadmapProgressMap.get(level.id);
      
      // If user has specific progress for this sub lesson, use it
      if (userProgress?.completed) {
        status = 'completed';
      } 
      // Check if this level/roadmap is accessible
      else if (level.status === 'active' || roadmapProgress?.status === 'completed') {
        // If roadmap is completed, only unlock first sub-lesson (not all)
        if (roadmapProgress?.status === 'completed' && !userProgress?.completed) {
          if (index === 0) {
            status = 'active'; // Only first sub-lesson becomes active after roadmap completion
          } else {
            // Other sub-lessons remain locked until previous ones are completed
            const previousLesson = sortedSubLessons[index - 1];
            const previousProgress = progressMap.get(previousLesson.id);
            status = previousProgress?.completed ? 'active' : 'locked';
          }
        }
        // If level is naturally active (first level), use normal progression
        else if (level.status === 'active') {
          if (index === 0) {
            status = 'active';
          } else {
            const previousLesson = sortedSubLessons[index - 1];
            const previousProgress = progressMap.get(previousLesson.id);
            status = previousProgress?.completed ? 'active' : 'locked';
          }
        }
      }
      
      return {
        ...subLesson,
        status,
        score: userProgress?.score || null
      };
    });

    // Get roadmap progress for this level
    const roadmapProgress = roadmapProgressMap.get(level.id);

    return {
      ...level,
      sub_lessons: subLessonsWithStatus,
      user_roadmap_progress: roadmapProgress ? [roadmapProgress] : []
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
