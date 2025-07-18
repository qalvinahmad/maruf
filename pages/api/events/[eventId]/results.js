// pages/api/events/[eventId]/results.js
import { supabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  const { eventId } = req.query;

  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required' 
        });
      }

      // Fetch user's event results with test details
      const { data: userResult, error: resultError } = await supabase
        .from('event_user_results')
        .select(`
          *,
          event_test_details (
            *,
            event_pronunciation_tests (
              arabic_text,
              transliteration,
              translation,
              expected_sound,
              difficulty
            )
          )
        `)
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (resultError && resultError.code !== 'PGRST116') {
        console.error('Error fetching user results:', resultError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch user results' 
        });
      }

      return res.status(200).json({
        success: true,
        userResult: userResult || null
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, overall_score, status } = req.body;

      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required' 
        });
      }

      // Create or update user event result
      const { data, error } = await supabase
        .from('event_user_results')
        .upsert({
          event_id: eventId,
          user_id: userId,
          overall_score: overall_score || 0,
          status: status || 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating result:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to save user result' 
        });
      }

      return res.status(200).json({
        success: true,
        result: data
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  return res.status(405).json({ 
    success: false, 
    error: 'Method not allowed' 
  });
}
