// Check files in communitymessage bucket
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Checking communitymessage bucket files...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCommunityBucket() {
  try {
    // List all files in communitymessage bucket
    const { data: files, error } = await supabase.storage
      .from('communitymessage')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      
    if (error) {
      console.error('Error listing files:', error);
      return;
    }
    
    console.log('Files in communitymessage bucket:');
    if (files.length === 0) {
      console.log('❌ No files found in communitymessage bucket');
    } else {
      files.forEach(file => {
        console.log(`- ${file.name} (${file.metadata?.size || 'unknown size'} bytes)`);
      });
    }
    
    // Test downloading a file
    if (files.length > 0) {
      const testFile = files[0].name;
      console.log(`\nTesting download of: ${testFile}`);
      
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('communitymessage')
        .download(testFile);
        
      if (downloadError) {
        console.error('Download error:', downloadError);
      } else {
        console.log('✅ File download successful');
        console.log('File size:', downloadData.size);
        console.log('File type:', downloadData.type);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCommunityBucket();
