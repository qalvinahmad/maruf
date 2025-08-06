import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, rating, comment } = req.body;

    // Validate input
    if (!user_id || !rating) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id and rating' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Check if user already rated
    const { data: existingRating, error: checkError } = await supabase
      .from('rating')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing rating:', checkError);
    }

    if (existingRating) {
      return res.status(409).json({ 
        error: 'User has already submitted a rating' 
      });
    }

    // Insert new rating
    const { data, error } = await supabase
      .from('rating')
      .insert([
        {
          user_id: user_id,
          rating: rating,
          comment: comment || null
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting rating:', error);
      return res.status(500).json({ 
        error: 'Failed to submit rating',
        details: error.message 
      });
    }

    console.log('Rating submitted successfully:', data);

    return res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Unexpected error in submit-rating API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
