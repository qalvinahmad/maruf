// Quick test script untuk API update-energy

const testUserId = 'd846d0c1-4e75-49a5-87af-65f806c9711b'; // User ID dari error log

async function testEnergyAPI() {
  console.log('🧪 Testing Energy API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/update-energy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        energyToDeduct: 2,
        operation: 'deduct'
      })
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers));

    const result = await response.json();
    console.log('📊 Response Body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ API Test PASSED');
    } else {
      console.log('❌ API Test FAILED');
    }

  } catch (error) {
    console.error('💥 Test Error:', error);
  }
}

// Run test
testEnergyAPI();
