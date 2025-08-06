// Test script to verify Hugging Face API key and model access
const https = require('https');

const API_KEY = process.env.HUGGINGFACE_API_KEY;

// Test models to check access
const MODELS_TO_TEST = [
  'facebook/wav2vec2-base-960h',
  'openai/whisper-tiny',
  'facebook/wav2vec2-large-960h-lv60-self',
  'openai/whisper-base'
];

async function testModelAccess(modelId) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api-inference.huggingface.co',
      port: 443,
      path: `/models/${modelId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Test-Script'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          model: modelId,
          status: res.statusCode,
          response: data.slice(0, 200) // First 200 chars
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        model: modelId,
        status: 'ERROR',
        response: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        model: modelId,
        status: 'TIMEOUT',
        response: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Hugging Face API Key and Model Access...\n');
  
  for (const model of MODELS_TO_TEST) {
    const result = await testModelAccess(model);
    console.log(`📊 Model: ${result.model}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${result.response}\n`);
  }
}

runTests().catch(console.error);
