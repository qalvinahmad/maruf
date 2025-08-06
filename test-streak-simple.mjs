console.log('🔥 Testing Streak API directly via curl...');

// Ambil user ID dari test user yang sudah kita tahu
const testUserId = 'test-user-id'; // Kita akan coba dengan ID manual

console.log('Testing with manual curl command...');
console.log('Run this in terminal:');
console.log(`
curl -X POST http://localhost:3001/api/update-streak \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "test-user-id"}'
`);

// Tapi pertama mari kita cek apakah ada user di database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fiilbotjhroljxejlwcs.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1aWlkb215ZWlueWR3dHRxcm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNDEyOTQsImV4cCI6MjA0ODcxNzI5NH0.HvEg1koONlumZ2dDFrxHhqPE6hXhm8X2Xn9zPStPrBI'
);

async function checkUsers() {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, streak, energy')
      .limit(3);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('👥 Available users:');
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, Email: ${user.email}, Streak: ${user.streak}, Energy: ${user.energy}`);
    });

    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n🧪 Testing with user: ${testUser.id}`);
      
      const response = await fetch('http://localhost:3001/api/update-streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: testUser.id
        })
      });

      console.log('📡 Response status:', response.status);
      const result = await response.json();
      console.log('📄 Response:', result);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

checkUsers();
