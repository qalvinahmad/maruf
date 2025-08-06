// Test signed URL for existing files
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing signed URL for avatars bucket...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignedUrl() {
  try {
    // Test with existing file
    const filePath = 'community-messages/1753942299988-badge.jpg';
    
    const { data: signedData, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(filePath, 3600);
    
    if (error) {
      console.error('Signed URL error:', error);
      return;
    }
    
    console.log('Signed URL created:', signedData.signedUrl);
    
    // Test if signed URL is accessible
    const response = await fetch(signedData.signedUrl);
    console.log('Response status:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('✅ Signed URL accessible!');
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Content-Length:', response.headers.get('content-length'));
    } else {
      console.log('❌ Signed URL not accessible');
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testSignedUrl();
