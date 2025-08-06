require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugDragDropIssue() {
  console.log('🔍 Debugging drag and drop issue for SubLesson 7...\n');
  
  // Step 1: Check questions
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

  console.log('📊 Questions for SubLesson 7:');
  if (questionsError) {
    console.log('❌ Error:', questionsError);
    return;
  }
  
  const dragDropQuestions = questions.filter(q => q.question_types?.type_key === 'drag_and_drop');
  console.log(`Found ${questions.length} total questions, ${dragDropQuestions.length} drag-and-drop questions\n`);
  
  dragDropQuestions.forEach((q, index) => {
    console.log(`  ${index + 1}. Question ID: ${q.id}, Order: ${q.order_sequence}, Text: "${q.question_text.substring(0, 50)}..."`);
  });
  
  // Step 2: Check templates
  console.log('\n🎯 Checking drag and drop templates...');
  const { data: templates, error: templatesError } = await supabase
    .from('drag_and_drop_questions')
    .select('*')
    .eq('question_type_id', 6)
    .order('id');

  if (templatesError) {
    console.log('❌ Templates Error:', templatesError);
    return;
  }
  
  console.log(`Found ${templates.length} templates`);
  
  // Step 3: Check choices and blanks for each template
  if (templates.length > 0) {
    const templateIds = templates.map(t => t.id);
    
    const { data: allChoices } = await supabase
      .from('drag_and_drop_choices')
      .select('*')
      .in('question_id', templateIds);
      
    const { data: allBlanks } = await supabase
      .from('drag_and_drop_blanks')
      .select('*')
      .in('question_id', templateIds);

    console.log(`\n📋 Data summary:`);
    console.log(`  Choices: ${allChoices?.length || 0}`);
    console.log(`  Blanks: ${allBlanks?.length || 0}`);
    
    // Group by template
    const choicesByTemplate = {};
    const blanksByTemplate = {};
    
    if (allChoices) {
      allChoices.forEach(choice => {
        if (!choicesByTemplate[choice.question_id]) {
          choicesByTemplate[choice.question_id] = [];
        }
        choicesByTemplate[choice.question_id].push(choice);
      });
    }
    
    if (allBlanks) {
      allBlanks.forEach(blank => {
        if (!blanksByTemplate[blank.question_id]) {
          blanksByTemplate[blank.question_id] = [];
        }
        blanksByTemplate[blank.question_id].push(blank);
      });
    }

    console.log(`\n📊 Template details:`);
    templates.forEach((template, index) => {
      const choices = choicesByTemplate[template.id] || [];
      const blanks = blanksByTemplate[template.id] || [];
      const uniqueChoices = [...new Set(choices.map(c => c.choice_text))];
      
      console.log(`  Template ${template.id}: ${choices.length} choices (${uniqueChoices.length} unique), ${blanks.length} blanks`);
      console.log(`    Instruction: "${template.instruction}"`);
      console.log(`    Template: "${template.sentence_template}"`);
      console.log(`    Unique choices: [${uniqueChoices.join(', ')}]`);
      console.log(`    Correct answer: ${blanks[0]?.correct_answer || 'N/A'}`);
      console.log('');
    });
    
    // Step 4: Simulate the mapping logic
    console.log('\n🔄 Simulating question-to-template mapping:');
    dragDropQuestions.forEach((question, index) => {
      const templateIndex = index % templates.length;
      const template = templates[templateIndex];
      const choices = choicesByTemplate[template.id] || [];
      const blanks = blanksByTemplate[template.id] || [];
      const uniqueChoices = [...new Set(choices.map(c => c.choice_text))];
      
      console.log(`  Question ${question.id} (index ${index}) -> Template ${template.id} (index ${templateIndex})`);
      console.log(`    Will have ${uniqueChoices.length} unique choices: [${uniqueChoices.join(', ')}]`);
      console.log(`    Correct answer: ${blanks[0]?.correct_answer || 'N/A'}`);
    });
  }
  
  console.log('\n✅ Debug complete');
}

debugDragDropIssue().catch(console.error);
