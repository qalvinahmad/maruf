// Test script untuk memverifikasi perbaikan error streak dan energy

async function testStreakAPI() {
  console.log('🔥 Testing Update Streak API...');
  
  try {
    // Import dynamic
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Get existing user
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, streak, energy')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching user:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️ No users found in database');
      return;
    }

    const testUser = users[0];
    console.log('📋 Testing with user:', {
      id: testUser.id,
      email: testUser.email,
      currentStreak: testUser.streak,
      currentEnergy: testUser.energy
    });

    // Test update streak API
    const response = await fetch('http://localhost:3001/api/update-streak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: testUser.id
      })
    });

    console.log('📡 API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ API Response:', result);

    if (result.success) {
      console.log('🎉 SUCCESS - Streak API working!');
      console.log('📊 Result data:');
      console.log('   - Streak:', result.data.streak);
      console.log('   - Energy:', result.data.energy);
      console.log('   - Streak Broken:', result.data.streakBroken);
      console.log('   - Last Login:', result.data.lastLoginDate);
    } else {
      console.error('❌ API returned success:false');
    }

  } catch (error) {
    console.error('💥 Test Error:', error.message);
  }
}

// Run the test
testStreakAPI();
