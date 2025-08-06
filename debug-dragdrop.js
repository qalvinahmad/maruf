// Debug script to check drag and drop data
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key:', supabaseKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDragDropData() {
  console.log('🔍 Debugging drag and drop data...');
  
  // Test authentication
  console.log('🔐 Testing Supabase connection...');
  const { data: testData, error: testError } = await supabase
    .from('questions')
    .select('id')
    .limit(1);
  
  if (testError) {
    console.error('❌ Supabase connection failed:', testError);
    return;
  } else {
    console.log('✅ Supabase connection successful');
  }
  
  // 1. Check drag_and_drop_questions table
  console.log('📋 Fetching drag_and_drop_questions...');
  const { data: templates, error: templatesError } = await supabase
    .from('drag_and_drop_questions')
    .select('*')
    .eq('question_type_id', 6);
  
  if (templatesError) {
    console.error('❌ Error fetching templates:', templatesError);
  } else {
    console.log('✅ Templates found:', templates?.length || 0);
    console.log('Templates:', templates);
  }
  
  // 2. Check drag_and_drop_choices for these templates
  if (templates && templates.length > 0) {
    const templateIds = templates.map(t => t.id);
    
    console.log('🎯 Fetching choices for template IDs:', templateIds);
    const { data: choices, error: choicesError } = await supabase
      .from('drag_and_drop_choices')
      .select('*')
      .in('question_id', templateIds);
    
    if (choicesError) {
      console.error('❌ Error fetching choices:', choicesError);
    } else {
      console.log('✅ Choices found:', choices?.length || 0);
      console.log('Choices by template:');
      
      templateIds.forEach(templateId => {
        const templateChoices = choices?.filter(c => c.question_id === templateId) || [];
        const uniqueChoices = [...new Set(templateChoices.map(c => c.choice_text))];
        console.log(`  Template ${templateId}: ${templateChoices.length} total, ${uniqueChoices.length} unique`);
        console.log(`    Unique choices: ${uniqueChoices.join(', ')}`);
      });
    }
    
    // 3. Check drag_and_drop_blanks
    console.log('🎯 Fetching blanks for template IDs:', templateIds);
    const { data: blanks, error: blanksError } = await supabase
      .from('drag_and_drop_blanks')
      .select('*')
      .in('question_id', templateIds);
    
    if (blanksError) {
      console.error('❌ Error fetching blanks:', blanksError);
    } else {
      console.log('✅ Blanks found:', blanks?.length || 0);
      console.log('Blanks by template:');
      
      templateIds.forEach(templateId => {
        const templateBlanks = blanks?.filter(b => b.question_id === templateId) || [];
        console.log(`  Template ${templateId}: ${templateBlanks.length} blanks`);
        if (templateBlanks.length > 0) {
          console.log(`    Correct answers: ${templateBlanks.map(b => b.correct_answer).join(', ')}`);
        }
      });
    }
  }
  
  // 4. Check questions for sublesson 7
  console.log('📝 Fetching questions for sublesson 7...');
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      order_sequence,
      question_type_id,
      sublesson_id,
      question_types (
        id,
        type_key,
        label,
        description
      )
    `)
    .eq('sublesson_id', 7)
    .order('order_sequence');
  
  if (questionsError) {
    console.error('❌ Error fetching questions:', questionsError);
  } else {
    console.log('✅ Questions for sublesson 7:', questions?.length || 0);
    const dragDropQuestions = questions?.filter(q => q.question_types?.type_key === 'drag_and_drop') || [];
    console.log('🎯 Drag and drop questions:', dragDropQuestions.length);
    
    dragDropQuestions.forEach((q, index) => {
      console.log(`  Question ${q.id} (order ${q.order_sequence}): "${q.question_text}"`);
    });
  }
}

debugDragDropData().catch(console.error);
