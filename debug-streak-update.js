// Debug script to check streak update in database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugStreakUpdate() {
  try {
    // Get user ID from localStorage (you'll need to replace this)
    const userId = 'd846d0c1-4e75-49a5-87af-65f806c9711b'; // Replace with actual user ID
    
    console.log('=== DEBUGGING STREAK UPDATE ===');
    console.log('User ID:', userId);
    
    // Check current profile data
    const { data: currentProfile, error: currentError } = await supabase
      .from('profiles')
      .select('id, full_name, last_login, streak, created_at')
      .eq('id', userId)
      .single();
    
    console.log('\n=== CURRENT PROFILE DATA ===');
    if (currentError) {
      console.error('Error fetching profile:', currentError);
    } else {
      console.log('Profile found:', currentProfile);
    }
    
    // Test direct update with more debugging
    console.log('\n=== TESTING DIRECT UPDATE ===');
    const newTimestamp = new Date().toISOString();
    console.log('Updating with timestamp:', newTimestamp);
    
    const { data: updateResult, error: updateError, status, statusText } = await supabase
      .from('profiles')
      .update({ 
        last_login: newTimestamp,
        streak: 7  // Try manual update
      })
      .eq('id', userId)
      .select('id, full_name, streak, last_login');
    
    console.log('Update status:', status, statusText);
    if (updateError) {
      console.error('Error in update:', updateError);
    } else {
      console.log('Update result:', updateResult);
      console.log('Rows affected:', updateResult?.length || 0);
    }
    
    // Check if the update worked
    const { data: afterUpdate, error: afterError } = await supabase
      .from('profiles')
      .select('streak, last_login')
      .eq('id', userId)
      .single();
    
    console.log('\n=== AFTER UPDATE CHECK ===');
    if (afterError) {
      console.error('Error checking after update:', afterError);
    } else {
      console.log('Profile after update:', afterUpdate);
    }
    
  } catch (error) {
    console.error('Debug script error:', error);
  }
}

debugStreakUpdate();
