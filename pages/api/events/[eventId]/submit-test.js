// pages/api/events/[eventId]/submit-test.js
import { supabase } from '../../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { eventId } = req.query;

  try {
    const { 
      userId, 
      testId, 
      userTranscription, 
      score, 
      audioBlobUrl 
    } = req.body;

    if (!userId || !testId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and Test ID are required' 
      });
    }

    // Get or create user event result
    let { data: userResult, error: resultError } = await supabase
      .from('event_user_results')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (resultError && resultError.code === 'PGRST116') {
      // Create new user result if doesn't exist
      const { data: newResult, error: createError } = await supabase
        .from('event_user_results')
        .insert({
          event_id: eventId,
          user_id: userId,
          overall_score: 0,
          total_tests: 0,
          completed_tests: 0,
          status: 'in_progress'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating user result:', createError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create user result' 
        });
      }

      userResult = newResult;
    } else if (resultError) {
      console.error('Error fetching user result:', resultError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch user result' 
      });
    }

    // Check if this test was already completed
    const { data: existingTest, error: existingError } = await supabase
      .from('event_test_details')
      .select('id, attempt_number')
      .eq('event_result_id', userResult.id)
      .eq('test_id', testId)
      .order('attempt_number', { ascending: false })
      .limit(1);

    if (existingError) {
      console.error('Error checking existing test:', existingError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to check existing test' 
      });
    }

    const attemptNumber = existingTest.length > 0 ? existingTest[0].attempt_number + 1 : 1;

    // Save test result
    const { data: testDetail, error: testError } = await supabase
      .from('event_test_details')
      .insert({
        event_result_id: userResult.id,
        test_id: testId,
        user_transcription: userTranscription,
        score: score || 0,
        audio_blob_url: audioBlobUrl,
        attempt_number: attemptNumber
      })
      .select()
      .single();

    if (testError) {
      console.error('Error saving test detail:', testError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save test result' 
      });
    }

    // Get updated user result (overall score will be calculated by trigger)
    const { data: updatedResult, error: updateError } = await supabase
      .from('event_user_results')
      .select('*')
      .eq('id', userResult.id)
      .single();

    if (updateError) {
      console.error('Error fetching updated result:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch updated result' 
      });
    }

    // Check if event is completed and update rewards
    if (updatedResult.status === 'completed') {
      await updateUserRewards(eventId, userId, updatedResult.overall_score);
    }

    return res.status(200).json({
      success: true,
      testDetail,
      userResult: updatedResult
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Helper function to update user rewards
async function updateUserRewards(eventId, userId, overallScore) {
  try {
    // Get event rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('event_rewards')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (rewardsError || !rewards) {
      console.log('No rewards found for event:', eventId);
      return;
    }

    // Check if user passed
    if (overallScore >= rewards.min_score) {
      // Get current user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp, points')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      // Update user rewards
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          xp: profile.xp + rewards.xp_reward,
          points: profile.points + rewards.points_reward
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user rewards:', updateError);
      } else {
        console.log(`Awarded ${rewards.xp_reward} XP and ${rewards.points_reward} points to user ${userId}`);
      }
    }

  } catch (error) {
    console.error('Error in updateUserRewards:', error);
  }
}
