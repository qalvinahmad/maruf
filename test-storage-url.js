// Test script to check Supabase storage URL format
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Testing storage URLs...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test file from your upload
const testFile = 'community-messages/1753942299988-badge.jpg';

// Method 1: Using getPublicUrl
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(testFile);

console.log('Method 1 - getPublicUrl:', publicUrl);

// Method 2: Manual construction
const manualUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${testFile}`;
console.log('Method 2 - Manual construction:', manualUrl);

// Test if URLs are accessible
async function testUrls() {
  console.log('\nTesting URL accessibility...');
  
  try {
    const response1 = await fetch(publicUrl);
    console.log('getPublicUrl response:', response1.status, response1.statusText);
    
    const response2 = await fetch(manualUrl);
    console.log('Manual URL response:', response2.status, response2.statusText);
    
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testUrls();
