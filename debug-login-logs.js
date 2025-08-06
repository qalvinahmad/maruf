// Debug script to test login_logs insert
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLoginLogsInsert() {
  try {
    const userId = 'd846d0c1-4e75-49a5-87af-65f806c9711b';
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log('=== TESTING LOGIN LOGS INSERT ===');
    console.log('User ID:', userId);
    console.log('Today:', today);
    console.log('Tomorrow (test date):', tomorrow);
    
    // Check current login logs
    const { data: currentLogs, error: currentError } = await supabase
      .from('login_logs')
      .select('*')
      .eq('user_id', userId)
      .order('login_date', { ascending: false });
    
    console.log('\n=== CURRENT LOGIN LOGS ===');
    if (currentError) {
      console.error('Error fetching current logs:', currentError);
    } else {
      console.log('Current logs count:', currentLogs?.length || 0);
      currentLogs?.forEach((log, index) => {
        console.log(`${index + 1}. Date: ${log.login_date}, ID: ${log.id}`);
      });
    }
    
    // Test upsert with tomorrow's date (should be new)
    console.log('\n=== TESTING UPSERT WITH NEW DATE ===');
    const { data: upsertData, error: upsertError } = await supabase
      .from('login_logs')
      .upsert([
        {
          user_id: userId,
          login_date: tomorrow
        }
      ], { 
        onConflict: ['user_id', 'login_date'],
        ignoreDuplicates: false 
      })
      .select('*');
    
    if (upsertError) {
      console.error('Upsert error:', upsertError);
    } else {
      console.log('Upsert successful:', upsertData);
    }
    
    // Check logs after upsert
    const { data: afterLogs, error: afterError } = await supabase
      .from('login_logs')
      .select('*')
      .eq('user_id', userId)
      .order('login_date', { ascending: false });
    
    console.log('\n=== LOGS AFTER UPSERT ===');
    if (afterError) {
      console.error('Error fetching after logs:', afterError);
    } else {
      console.log('After logs count:', afterLogs?.length || 0);
      afterLogs?.forEach((log, index) => {
        console.log(`${index + 1}. Date: ${log.login_date}, ID: ${log.id}, Created: ${log.created_at}`);
      });
    }
    
    // Clean up - delete the test entry
    console.log('\n=== CLEANING UP TEST ENTRY ===');
    const { error: deleteError } = await supabase
      .from('login_logs')
      .delete()
      .eq('user_id', userId)
      .eq('login_date', tomorrow);
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
    } else {
      console.log('Test entry deleted successfully');
    }
    
  } catch (error) {
    console.error('Test script error:', error);
  }
}

testLoginLogsInsert();
