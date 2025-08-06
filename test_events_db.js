const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEventsTable() {
  console.log('Testing events table...');
  
  try {
    // Test connection and table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('events')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing events table:', tableError);
      return;
    }

    console.log('✅ Events table accessible');
    
    // Check if table has data
    const { data: allEvents, error: selectError } = await supabase
      .from('events')
      .select('*');

    if (selectError) {
      console.error('❌ Error selecting from events:', selectError);
      return;
    }

    console.log(`📊 Found ${allEvents?.length || 0} events in database`);
    
    if (allEvents && allEvents.length > 0) {
      console.log('📝 First event:', allEvents[0]);
    } else {
      console.log('💡 No events found. Let\'s try to insert a sample event...');
      
      // Try to insert a sample event
      const sampleEvent = {
        title: 'Test Event',
        type: 'workshop',
        description: 'This is a test event',
        date: '2025-07-30',
        time: '10:00:00',
        status: 'upcoming',
        speaker: 'Test Speaker',
        speaker_title: 'Instructor'
      };

      const { data: insertedEvent, error: insertError } = await supabase
        .from('events')
        .insert([sampleEvent])
        .select();

      if (insertError) {
        console.error('❌ Error inserting sample event:', insertError);
      } else {
        console.log('✅ Sample event inserted:', insertedEvent);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Test all event-related tables
async function testAllEventTables() {
  const tables = [
    'events',
    'event_registrations', 
    'event_pronunciation_tests',
    'event_test_details',
    'event_user_results',
    'event_rewards'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Error accessing ${table}:`, error.message);
      } else {
        console.log(`✅ ${table} table accessible`);
      }
    } catch (error) {
      console.error(`❌ Unexpected error accessing ${table}:`, error);
    }
  }
}

// Run tests
testEventsTable()
  .then(() => testAllEventTables())
  .then(() => {
    console.log('🏁 Testing completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
