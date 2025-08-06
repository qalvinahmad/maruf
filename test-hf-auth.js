// Test Hugging Face Inference API with a more comprehensive approach
const https = require('https');

const API_KEY = process.env.HUGGINGFACE_API_KEY;

// Test the inference API endpoint directly
async function testInferenceAPI(modelId) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      inputs: "hello world test"
    });

    const options = {
      hostname: 'api-inference.huggingface.co',
      port: 443,
      path: `/models/${modelId}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'HuggingFace-Test'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(data);
        } catch {
          parsedResponse = data;
        }
        
        resolve({
          model: modelId,
          status: res.statusCode,
          headers: res.headers,
          response: parsedResponse
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

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        model: modelId,
        status: 'TIMEOUT',
        response: 'Request timeout'
      });
    });

    req.write(postData);
    req.end();
  });
}

// Test authentication separately
async function testAuth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'huggingface.co',
      port: 443,
      path: '/api/whoami-v2',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'HuggingFace-Test'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(data);
        } catch {
          parsedResponse = data;
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
        response: error.message
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔐 Testing API Key Authentication...\n');
  
  const authResult = await testAuth();
  console.log(`Authentication Status: ${authResult.status}`);
  console.log(`Authentication Response:`, authResult.response);
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('🧪 Testing Model Inference APIs...\n');
  
  const modelsToTest = [
    'facebook/wav2vec2-base-960h',
    'openai/whisper-tiny'
  ];
  
  for (const model of modelsToTest) {
    console.log(`📊 Testing: ${model}`);
    const result = await testInferenceAPI(model);
    console.log(`   Status: ${result.status}`);
    console.log(`   Response:`, typeof result.response === 'object' ? JSON.stringify(result.response, null, 2) : result.response);
    if (result.headers && result.headers['x-error-code']) {
      console.log(`   Error Code: ${result.headers['x-error-code']}`);
    }
    console.log('');
  }
}

runTests().catch(console.error);
