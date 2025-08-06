// Test channel_messages query
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing channel_messages query...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChannelMessages() {
  try {
    console.log('1. Testing basic query...');
    
    // Basic query first
    const { data: messages, error } = await supabase
      .from('channel_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Basic query error:', error);
      return;
    }

    console.log(`✅ Found ${messages?.length || 0} messages`);
    
    if (messages && messages.length > 0) {
      console.log('\nSample message:');
      console.log(JSON.stringify(messages[0], null, 2));
      
      // Test profile queries for first message
      const firstMessage = messages[0];
      console.log(`\n2. Testing profile queries for user_id: ${firstMessage.user_id}`);
      
      // Try teacher_profiles
      const { data: teacherProfile, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('full_name, status')
        .eq('id', firstMessage.user_id)
        .single();
      
      if (teacherProfile) {
        console.log('✅ Found teacher profile:', teacherProfile);
      } else {
        console.log('❌ No teacher profile found, error:', teacherError?.message);
        
        // Try profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', firstMessage.user_id)
          .single();
        
        if (profile) {
          console.log('✅ Found user profile:', profile);
        } else {
          console.log('❌ No user profile found, error:', profileError?.message);
        }
      }
      
      // Test reactions
      console.log('\n3. Testing reactions query...');
      const { data: reactions, error: reactionsError } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', firstMessage.id);
      
      if (reactionsError) {
        console.log('❌ Reactions query error:', reactionsError);
      } else {
        console.log(`✅ Found ${reactions?.length || 0} reactions`);
      }
      
      // Test poll votes if applicable
      if (firstMessage.message_type === 'poll') {
        console.log('\n4. Testing poll votes query...');
        const { data: votes, error: votesError } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('message_id', firstMessage.id);
        
        if (votesError) {
          console.log('❌ Poll votes query error:', votesError);
        } else {
          console.log(`✅ Found ${votes?.length || 0} poll votes`);
        }
      }
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testChannelMessages();
