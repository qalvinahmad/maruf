// Test with communitymessage bucket
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing communitymessage bucket...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test with communitymessage bucket
const { data: { publicUrl } } = supabase.storage
  .from('communitymessage')
  .getPublicUrl('1753942299988-badge.jpg');

console.log('Public URL for communitymessage bucket:', publicUrl);

// Test URL accessibility
async function testCommunityUrl() {
  try {
    const response = await fetch(publicUrl);
    console.log('Response status:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('✅ URL accessible! File can be loaded.');
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Content-Length:', response.headers.get('content-length'));
    } else {
      console.log('❌ URL not accessible');
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testCommunityUrl();
