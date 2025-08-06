const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDragDropData() {
  console.log('🔍 Testing drag and drop data for SubLesson 7...');
  
  // First, get all questions for SubLesson 7
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

  console.log('📊 Questions for SubLesson 7:', questions?.length || 0);
  
  if (questions) {
    questions.forEach(q => {
      console.log(`  - Question ${q.id}: ${q.question_text.substring(0, 50)}... (Type: ${q.question_types?.type_key})`);
    });
  }
  
  // Get drag and drop questions
  const dragDropQuestions = questions?.filter(q => q.question_types?.type_key === 'drag_and_drop') || [];
  console.log('\n🎯 Drag and drop questions found:', dragDropQuestions.length);
  
  dragDropQuestions.forEach(q => {
    console.log(`  - ID: ${q.id}, Order: ${q.order_sequence}, Text: ${q.question_text}`);
  });
  
  // Fetch drag and drop templates
  console.log('\n🎯 Fetching drag and drop templates...');
  const { data: templates, error: templatesError } = await supabase
    .from('drag_and_drop_questions')
    .select('*')
    .eq('question_type_id', 6)
    .order('id');

  console.log('Templates result:', { 
    count: templates?.length || 0, 
    error: templatesError,
    templates: templates?.map(t => ({ id: t.id, instruction: t.instruction, template: t.sentence_template }))
  });
  
  if (templates && templates.length > 0) {
    const templateIds = templates.map(t => t.id);
    
    // Fetch choices
    const { data: choices } = await supabase
      .from('drag_and_drop_choices')
      .select('*')
      .in('question_id', templateIds);
      
    // Fetch blanks
    const { data: blanks } = await supabase
      .from('drag_and_drop_blanks')
      .select('*')
      .in('question_id', templateIds);
      
    console.log('\n📋 Template data summary:');
    console.log('  Choices found:', choices?.length || 0);
    console.log('  Blanks found:', blanks?.length || 0);
    
    // Group by template
    const choicesByTemplate = {};
    const blanksByTemplate = {};
    
    if (choices) {
      choices.forEach(choice => {
        if (!choicesByTemplate[choice.question_id]) {
          choicesByTemplate[choice.question_id] = [];
        }
        choicesByTemplate[choice.question_id].push(choice);
      });
    }
    
    if (blanks) {
      blanks.forEach(blank => {
        if (!blanksByTemplate[blank.question_id]) {
          blanksByTemplate[blank.question_id] = [];
        }
        blanksByTemplate[blank.question_id].push(blank);
      });
    }
    
    console.log('\n📊 Data by template:');
    templates.forEach(template => {
      const templateChoices = choicesByTemplate[template.id] || [];
      const templateBlanks = blanksByTemplate[template.id] || [];
      console.log(`  Template ${template.id}: ${templateChoices.length} choices, ${templateBlanks.length} blanks`);
      
      if (templateChoices.length > 0) {
        console.log(`    Choices: ${templateChoices.map(c => c.choice_text).join(', ')}`);
      }
      if (templateBlanks.length > 0) {
        console.log(`    Correct answers: ${templateBlanks.map(b => b.correct_answer).join(', ')}`);
      }
    });
    
    // Test mapping logic
    console.log('\n🔄 Testing question-to-template mapping:');
    dragDropQuestions.forEach((question, index) => {
      const templateIndex = index % templates.length;
      const template = templates[templateIndex];
      const templateChoices = choicesByTemplate[template.id] || [];
      const templateBlanks = blanksByTemplate[template.id] || [];
      
      console.log(`  Question ${question.id} (index ${index}) -> Template ${template.id} (${templateChoices.length} choices, ${templateBlanks.length} blanks)`);
      
      if (templateChoices.length === 0 || templateBlanks.length === 0) {
        console.log(`    ⚠️ Question ${question.id} would have missing data - fallback needed!`);
      }
    });
  }
  
  console.log('\n✅ Test complete');
}

testDragDropData().catch(console.error);
