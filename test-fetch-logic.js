// Simple test for fetchCommunityMessages logic
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetchCommunityMessages() {
  try {
    console.log('Testing fetchCommunityMessages logic...\n');
    
    // Step 1: Get basic message data
    const { data: messages, error } = await supabase
      .from('channel_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching messages:', error);
      return;
    }

    console.log(`✅ Step 1: Found ${messages?.length || 0} messages`);
    
    if (messages && messages.length > 0) {
      console.log('\n✅ Step 2: Processing messages with profiles...');
      
      // Process first message as example
      const message = messages[0];
      console.log(`Processing message ID: ${message.id}`);
      console.log(`User ID: ${message.user_id}`);
      
      // Try to get profile data
      let profileData = null;
      let teacherProfileData = null;
      
      try {
        // Try teacher_profiles first
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('full_name')
          .eq('id', message.user_id)
          .single();
        
        if (teacherProfile) {
          teacherProfileData = teacherProfile;
          console.log(`✅ Found teacher profile: ${teacherProfile.full_name}`);
        } else {
          // Fallback to profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', message.user_id)
            .single();
          
          if (profile) {
            profileData = profile;
            console.log(`✅ Found user profile: ${profile.full_name} (${profile.role})`);
          }
        }
      } catch (profileError) {
        console.warn('⚠️ Could not fetch profile:', profileError.message);
      }
      
      // Get reactions
      const { data: messageReactions } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', message.id);
      
      console.log(`✅ Found ${messageReactions?.length || 0} reactions`);
      
      // Get poll votes if it's a poll
      let pollVotes = [];
      if (message.message_type === 'poll') {
        const { data: votes } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('message_id', message.id);
        pollVotes = votes || [];
        console.log(`✅ Found ${pollVotes.length} poll votes`);
      }
      
      // Simulate final message object
      const finalMessage = {
        ...message,
        profiles: profileData,
        teacher_profiles: teacherProfileData,
        message_reactions: messageReactions || [],
        poll_votes: pollVotes
      };
      
      console.log('\n✅ Step 3: Final message object structure:');
      console.log({
        id: finalMessage.id,
        content: finalMessage.content,
        message_type: finalMessage.message_type,
        hasProfile: !!finalMessage.profiles,
        hasTeacherProfile: !!finalMessage.teacher_profiles,
        reactionsCount: finalMessage.message_reactions.length,
        pollVotesCount: finalMessage.poll_votes.length
      });
      
      console.log('\n🎉 fetchCommunityMessages logic should work correctly!');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFetchCommunityMessages();
