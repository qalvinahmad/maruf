// Debug current data in database vs localStorage
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserData() {
  try {
    console.log('=== DEBUGGING USER DATA MISMATCH ===\n');
    
    // Check messages with specific user_ids
    const { data: messages } = await supabase
      .from('channel_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Messages in database:');
    messages?.forEach((msg, index) => {
      console.log(`${index + 1}. ID: ${msg.id}`);
      console.log(`   User ID: ${msg.user_id}`);
      console.log(`   Content: ${msg.content}`);
      console.log(`   Type: ${msg.message_type}`);
      console.log(`   Created: ${msg.created_at}`);
      console.log('');
    });
    
    // Check all unique user_ids in messages
    const userIds = [...new Set(messages?.map(m => m.user_id) || [])];
    console.log('Unique user IDs in messages:', userIds);
    
    console.log('\n=== CHECKING PROFILES FOR EACH USER ===');
    
    for (const userId of userIds) {
      console.log(`\nUser ID: ${userId}`);
      
      // Check teacher_profiles
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (teacherProfile) {
        console.log('✅ Teacher Profile:', {
          full_name: teacherProfile.full_name,
          email: teacherProfile.email,
          is_verified: teacherProfile.is_verified
        });
      } else {
        console.log('❌ No teacher profile found');
      }
      
      // Check profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profile) {
        console.log('✅ User Profile:', {
          full_name: profile.full_name,
          role: profile.role,
          email: profile.email
        });
      } else {
        console.log('❌ No user profile found');
      }
    }
    
    console.log('\n=== EXPECTED TEACHER DATA ===');
    console.log('From localStorage should be:');
    console.log('- teacherName: Alvin Ahmad');
    console.log('- teacherEmail: [teacher email]');
    console.log('- teacherId: [teacher ID]');
    console.log('- role: teacher');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugUserData();
