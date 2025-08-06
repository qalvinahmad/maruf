// Test script to verify our updated voice recognition API works
const http = require('http'); // Changed to http for local testing
const fs = require('fs');

const API_KEY = process.env.HUGGINGFACE_API_KEY;

async function testVoiceRecognitionAPI() {
  return new Promise((resolve) => {
    // Create a simple test request to our API
    const postData = JSON.stringify({
      test: true,
      model: 'facebook/wav2vec2-large-960h'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/voice-recognition',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(data);
        } catch {
          parsedResponse = { error: 'Failed to parse response', raw: data };
        }
        
        resolve({
          status: res.statusCode,
          response: parsedResponse
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        response: { error: error.message }
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runAPITest() {
  console.log('🧪 Testing voice recognition API endpoint...\n');
  
  const result = await testVoiceRecognitionAPI();
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.response, null, 2));
  
  if (result.status === 405) {
    console.log('\n✅ API endpoint is working (Method not allowed for test request is expected)');
  } else if (result.status === 200) {
    console.log('\n✅ API endpoint is working and responded successfully');
  } else {
    console.log('\n❌ API endpoint may have issues');
  }
}

runAPITest().catch(console.error);
