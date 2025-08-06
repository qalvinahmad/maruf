const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fiilbotjhroljxejlwcs.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    console.log('Testing different table names for users...');
    
    // Test possible table names
    const tableNames = ['users', 'profiles', 'user_profiles', 'user_accounts', 'accounts'];
    
    for (const tableName of tableNames) {
      console.log(`\nTesting table: ${tableName}`);
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(2);
        
        console.log(`${tableName} result:`, JSON.stringify({ data, error }, null, 2));
        
        if (data && data.length > 0) {
          console.log(`Available columns in ${tableName}:`, Object.keys(data[0]));
        }
      } catch (err) {
        console.log(`Error with ${tableName}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
})();
