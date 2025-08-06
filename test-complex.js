const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fiilbotjhroljxejlwcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaWxib3RqaHJvbGp4ZWpsd2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzM1OTIsImV4cCI6MjA2OTkwOTU5Mn0.EGlQZ3a6sHRWotPPJIv7sexSbcYMt56C4N2kzGWBaEE'
);

async function testComplexQuery() {
  console.log('Testing the exact query from the code...');
  
  try {
    // The exact query from the code
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        order_sequence,
        question_type_id,
        correct_answer,
        matching_pairs,
        fill_blank_template,
        voice_recognition_target,
        sublesson_id,
        question_types (
          id,
          type_key,
          label,
          description
        ),
        question_options (
          id,
          option_text,
          is_correct
        )
      `)
      .eq('sublesson_id', 6)
      .order('order_sequence');

    console.log('📊 Query result:');
    console.log('Data:', questionsData);
    console.log('Error:', questionsError);
    console.log('Count:', questionsData?.length || 0);
    
    if (questionsData && questionsData.length > 0) {
      console.log('\n📝 First question details:');
      console.log(JSON.stringify(questionsData[0], null, 2));
    }
    
  } catch (error) {
    console.error('Query failed:', error);
  }
}

testComplexQuery().catch(console.error);
