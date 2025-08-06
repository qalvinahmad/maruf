// pages/api/get-pronunciation-progress.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, letter_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Build query for pronunciation progress
    let progressQuery = supabase
      .from('pronunciation_progress')
      .select('*')
      .eq('user_id', user_id);

    if (letter_id) {
      progressQuery = progressQuery.eq('letter_id', letter_id);
    }

    const { data: progressData, error: progressError } = await progressQuery;

    if (progressError) {
      console.error('Error fetching pronunciation progress:', progressError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch pronunciation progress',
        details: progressError.message 
      });
    }

    // Get recent feedback for trend analysis
    const { data: recentFeedback, error: feedbackError } = await supabase
      .from('pronunciation_feedback')
      .select('letter_id, pronunciation_accuracy, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (feedbackError) {
      console.error('Error fetching recent feedback:', feedbackError);
    }

    // Calculate trends and insights
    const letterProgress = {};
    const hijaiyahData = [
      { id: 1, arabic: 'ا', latin: 'Alif' },
      { id: 2, arabic: 'ب', latin: 'Ba' },
      { id: 3, arabic: 'ت', latin: 'Ta' },
      { id: 4, arabic: 'ث', latin: 'Tsa' },
      { id: 5, arabic: 'ج', latin: 'Jim' },
      { id: 6, arabic: 'ح', latin: 'Ha' },
      { id: 7, arabic: 'خ', latin: 'Kha' },
      { id: 8, arabic: 'د', latin: 'Dal' },
    ];

    // Process progress data
    progressData.forEach(progress => {
      const letterInfo = hijaiyahData.find(h => h.id === progress.letter_id);
      letterProgress[progress.letter_id] = {
        ...progress,
        letter_info: letterInfo || { arabic: '?', latin: 'Unknown' }
      };
    });

    // Analyze recent trends
    const trends = {};
    if (recentFeedback && recentFeedback.length > 0) {
      // Group by letter
      const feedbackByLetter = {};
      recentFeedback.forEach(feedback => {
        if (!feedbackByLetter[feedback.letter_id]) {
          feedbackByLetter[feedback.letter_id] = [];
        }
        feedbackByLetter[feedback.letter_id].push(feedback);
      });

      // Calculate trends for each letter
      Object.keys(feedbackByLetter).forEach(letterId => {
        const letterFeedback = feedbackByLetter[letterId];
        if (letterFeedback.length >= 2) {
          const recent = letterFeedback.slice(0, Math.ceil(letterFeedback.length / 2));
          const older = letterFeedback.slice(Math.ceil(letterFeedback.length / 2));
          
          const recentAvg = recent.reduce((sum, f) => sum + f.pronunciation_accuracy, 0) / recent.length;
          const olderAvg = older.reduce((sum, f) => sum + f.pronunciation_accuracy, 0) / older.length;
          
          trends[letterId] = {
            trend: recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable',
            change: Math.round((recentAvg - olderAvg) * 100) / 100,
            recent_average: Math.round(recentAvg * 100) / 100,
            attempts_count: letterFeedback.length
          };
        }
      });
    }

    // Calculate overall statistics
    const totalLetters = Object.keys(letterProgress).length;
    const masteredLetters = Object.values(letterProgress).filter(p => p.mastery_achieved_at).length;
    const averageAccuracy = totalLetters > 0 ? 
      Object.values(letterProgress).reduce((sum, p) => sum + p.average_accuracy, 0) / totalLetters : 0;

    // Identify weak and strong areas
    const weakAreas = Object.values(letterProgress)
      .filter(p => p.average_accuracy < 70)
      .sort((a, b) => a.average_accuracy - b.average_accuracy)
      .slice(0, 5);

    const strongAreas = Object.values(letterProgress)
      .filter(p => p.average_accuracy >= 80)
      .sort((a, b) => b.average_accuracy - a.average_accuracy)
      .slice(0, 5);

    // Generate insights and recommendations
    const insights = [];
    
    if (masteredLetters > 0) {
      insights.push(`Anda telah menguasai ${masteredLetters} huruf dengan baik!`);
    }
    
    if (weakAreas.length > 0) {
      insights.push(`Fokuskan latihan pada huruf ${weakAreas[0].letter_info.latin} (${weakAreas[0].letter_info.arabic})`);
    }
    
    if (averageAccuracy >= 80) {
      insights.push('Pencapaian Anda sangat baik, pertahankan konsistensi!');
    } else if (averageAccuracy >= 60) {
      insights.push('Progres Anda cukup baik, tingkatkan latihan rutin.');
    } else {
      insights.push('Perbanyak latihan dan fokus pada teknik makhraj yang benar.');
    }

    // Practice recommendations
    const recommendations = [];
    
    if (weakAreas.length > 0) {
      recommendations.push(`Latih huruf ${weakAreas[0].letter_info.latin} 10 menit setiap hari`);
      recommendations.push('Gunakan cermin untuk melihat posisi mulut dan lidah');
    }
    
    recommendations.push('Dengarkan rekaman qari profesional untuk referensi');
    recommendations.push('Praktikkan dengan tempo lambat, fokus pada ketepatan');

    res.status(200).json({
      success: true,
      data: {
        letter_progress: letterProgress,
        trends: trends,
        overall_statistics: {
          total_letters_practiced: totalLetters,
          mastered_letters: masteredLetters,
          average_accuracy: Math.round(averageAccuracy * 100) / 100,
          mastery_percentage: totalLetters > 0 ? Math.round((masteredLetters / totalLetters) * 100) : 0
        },
        weak_areas: weakAreas.map(w => ({
          letter_id: w.letter_id,
          letter: w.letter_info.arabic,
          latin: w.letter_info.latin,
          accuracy: w.average_accuracy,
          attempts: w.total_attempts
        })),
        strong_areas: strongAreas.map(s => ({
          letter_id: s.letter_id,
          letter: s.letter_info.arabic,
          latin: s.letter_info.latin,
          accuracy: s.average_accuracy,
          attempts: s.total_attempts
        })),
        insights: insights,
        recommendations: recommendations
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
