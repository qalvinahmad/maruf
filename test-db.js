const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fiilbotjhroljxejlwcs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaWxib3RqaHJvbGp4ZWpsd2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzM1OTIsImV4cCI6MjA2OTkwOTU5Mn0.EGlQZ3a6sHRWotPPJIv7sexSbcYMt56C4N2kzGWBaEE'
);

async function testQuery() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Get all questions with sublesson_id
    const { data: allQuestions, error: allError } = await supabase
      .from('questions')
      .select('id, sublesson_id, question_text')
      .order('id')
      .limit(10);
    
    console.log('📋 All questions sample:');
    allQuestions?.forEach(q => {
      console.log(`  ID: ${q.id}, SubLesson: ${q.sublesson_id}, Text: "${q.question_text.substring(0, 50)}..."`);
    });
    console.log('Error:', allError);
    
    // Test 2: Get questions for sublesson_id = 6
    const { data: lesson6Questions, error: lesson6Error } = await supabase
      .from('questions')
      .select('id, sublesson_id, question_text, order_sequence')
      .eq('sublesson_id', 6)
      .order('order_sequence');
    
    console.log('\n🎯 Lesson 6 questions:');
    lesson6Questions?.forEach(q => {
      console.log(`  ID: ${q.id}, Order: ${q.order_sequence}, Text: "${q.question_text}"`);
    });
    console.log('Error:', lesson6Error);
    
    // Test 3: Check roadmap_sub_lessons for ID 6
    const { data: subLesson, error: subLessonError } = await supabase
      .from('roadmap_sub_lessons')
      .select('*')
      .eq('id', 6)
      .single();
    
    console.log('\n📖 SubLesson 6 data:', subLesson);
    console.log('Error:', subLessonError);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testQuery().catch(console.error);
