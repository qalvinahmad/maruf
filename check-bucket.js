// Check bucket configuration
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin access

console.log('Checking bucket configuration...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
  try {
    // List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('Available buckets:');
    buckets.forEach(bucket => {
      console.log(`- ${bucket.name}: public=${bucket.public}, created=${bucket.created_at}`);
    });
    
    // Check avatars bucket specifically
    const avatarsBucket = buckets.find(b => b.name === 'avatars');
    if (avatarsBucket) {
      console.log('\nAvatars bucket found:');
      console.log('- Public:', avatarsBucket.public);
      console.log('- ID:', avatarsBucket.id);
      console.log('- Created:', avatarsBucket.created_at);
    } else {
      console.log('\n❌ Avatars bucket not found!');
    }
    
    // List files in community-messages folder
    console.log('\nFiles in community-messages folder:');
    const { data: files, error: filesError } = await supabase.storage
      .from('avatars')
      .list('community-messages', {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      
    if (filesError) {
      console.error('Error listing files:', filesError);
    } else {
      files.forEach(file => {
        console.log(`- ${file.name} (${file.metadata?.size || 'unknown size'})`);
      });
    }
    
  } catch (error) {
    console.error('Check bucket error:', error.message);
  }
}

checkBucket();
