const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://luiidomyeinydwttqrmc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1aWlkb215ZWlueWR3dHRxcm1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjYxMzAwNywiZXhwIjoyMDYyMTg5MDA3fQ.daEYm7s37TQdM2RsgMlkfgjfzSqNRMpDbylTyHMSOvk'
);

async function testCloudConnection() {
  console.log('🔍 Testing connection to Supabase cloud...');
  
  try {
    // Test connection by listing tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to cloud database!');
    console.log('📋 Found tables:', data.map(t => t.table_name));
    return true;
    
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function checkExistingTables() {
  console.log('\n🔍 Checking existing tables...');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('❌ Could not fetch tables:', error.message);
      return;
    }
    
    const tableNames = data.map(t => t.table_name);
    console.log(`✅ Found ${tableNames.length} tables in public schema:`);
    tableNames.forEach(name => console.log(`   - ${name}`));
    
    // Check for our specific tables
    const requiredTables = ['profiles', 'teacher_profiles', 'teacher_verifications', 'admin_profiles'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing required tables:', missingTables);
      console.log('📝 Please run the cloud_database_setup.sql script in your Supabase dashboard');
    } else {
      console.log('\n🎉 All required tables are present!');
    }
    
  } catch (err) {
    console.error('❌ Error checking tables:', err.message);
  }
}

async function main() {
  const connected = await testCloudConnection();
  if (connected) {
    await checkExistingTables();
  }
}

main().catch(console.error);
