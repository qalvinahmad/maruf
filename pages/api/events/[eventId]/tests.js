// pages/api/events/[eventId]/tests.js
import { supabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  const { eventId } = req.query;

  if (req.method === 'GET') {
    try {
      // Fetch pronunciation tests for the event
      const { data: tests, error } = await supabase
        .from('event_pronunciation_tests')
        .select('*')
        .eq('event_id', eventId)
        .order('test_order', { ascending: true });

      if (error) {
        console.error('Error fetching tests:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch pronunciation tests' 
        });
      }

      return res.status(200).json({
        success: true,
        tests: tests || []
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
      // Create new pronunciation test
      const { 
        test_order, 
        arabic_text, 
        transliteration, 
        translation, 
        expected_sound, 
        difficulty 
      } = req.body;

      const { data, error } = await supabase
        .from('event_pronunciation_tests')
        .insert({
          event_id: eventId,
          test_order,
          arabic_text,
          transliteration,
          translation,
          expected_sound,
          difficulty
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating test:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create pronunciation test' 
        });
      }

      return res.status(201).json({
        success: true,
        test: data
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
