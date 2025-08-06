// pages/api/get-pronunciation-feedback.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, letter_id, session_id, limit = 10 } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Build query
    let query = supabase
      .from('pronunciation_feedback')
      .select(`
        id,
        letter_id,
        test_session_id,
        recorded_text,
        expected_text,
        confidence_score,
        pronunciation_accuracy,
        makhraj_analysis,
        sifat_analysis,
        detected_errors,
        correction_suggestions,
        ai_model_used,
        processing_time_ms,
        audio_quality_score,
        background_noise_level,
        created_at
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    // Add filters if provided
    if (letter_id) {
      query = query.eq('letter_id', letter_id);
    }

    if (session_id) {
      query = query.eq('test_session_id', session_id);
    }

    const { data: feedbackData, error } = await query;

    if (error) {
      console.error('Error fetching pronunciation feedback:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch pronunciation feedback',
        details: error.message 
      });
    }

    // Get letter information for each feedback
    const feedbackWithLetterInfo = await Promise.all(
      feedbackData.map(async (feedback) => {
        if (feedback.letter_id) {
          // Get letter info from our hijaiyah data
          const hijaiyahData = [
            { id: 1, arabic: 'ا', latin: 'Alif' },
            { id: 2, arabic: 'ب', latin: 'Ba' },
            { id: 3, arabic: 'ت', latin: 'Ta' },
            { id: 4, arabic: 'ث', latin: 'Tsa' },
            { id: 5, arabic: 'ج', latin: 'Jim' },
            { id: 6, arabic: 'ح', latin: 'Ha' },
            { id: 7, arabic: 'خ', latin: 'Kha' },
            { id: 8, arabic: 'د', latin: 'Dal' },
            // Add more letters as needed
          ];
          
          const letterInfo = hijaiyahData.find(h => h.id === feedback.letter_id);
          
          return {
            ...feedback,
            letter_info: letterInfo || { arabic: '?', latin: 'Unknown' }
          };
        }
        return feedback;
      })
    );

    // Calculate statistics
    const totalFeedback = feedbackWithLetterInfo.length;
    const averageAccuracy = totalFeedback > 0 ? 
      feedbackWithLetterInfo.reduce((sum, f) => sum + (f.pronunciation_accuracy || 0), 0) / totalFeedback : 0;
    
    const highAccuracyCount = feedbackWithLetterInfo.filter(f => (f.pronunciation_accuracy || 0) >= 80).length;
    const improvementRate = totalFeedback > 1 ? 
      feedbackWithLetterInfo[0].pronunciation_accuracy - feedbackWithLetterInfo[totalFeedback - 1].pronunciation_accuracy : 0;

    res.status(200).json({
      success: true,
      data: {
        feedback: feedbackWithLetterInfo,
        statistics: {
          total_attempts: totalFeedback,
          average_accuracy: Math.round(averageAccuracy * 100) / 100,
          high_accuracy_count: highAccuracyCount,
          improvement_rate: Math.round(improvementRate * 100) / 100,
          success_rate: totalFeedback > 0 ? Math.round((highAccuracyCount / totalFeedback) * 100) : 0
        }
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
