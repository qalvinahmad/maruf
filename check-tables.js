const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fiilbotjhroljxejlwcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaWxib3RqaHJvbGp4ZWpsd2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzM1OTIsImV4cCI6MjA2OTkwOTU5Mn0.EGlQZ3a6sHRWotPPJIv7sexSbcYMt56C4N2kzGWBaEE'
);

async function checkTables() {
  console.log('Checking table structures...');
  
  try {
    // First, let's get a sample question to see what columns exist
    const { data: sampleQuestion, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .limit(1)
      .single();

    console.log('📝 Questions table columns:');
    console.log(JSON.stringify(sampleQuestion, null, 2));
    console.log('Error:', questionError);

    // Check question_types table
    const { data: questionTypes, error: typesError } = await supabase
      .from('question_types')
      .select('*')
      .limit(3);

    console.log('\n🏷️ Question types table:');
    console.log(JSON.stringify(questionTypes, null, 2));
    console.log('Error:', typesError);

    // Check question_options table
    const { data: questionOptions, error: optionsError } = await supabase
      .from('question_options')
      .select('*')
      .limit(5);

    console.log('\n⚪ Question options table:');
    console.log(JSON.stringify(questionOptions, null, 2));
    console.log('Error:', optionsError);
    
  } catch (error) {
    console.error('Check failed:', error);
  }
}

checkTables().catch(console.error);
