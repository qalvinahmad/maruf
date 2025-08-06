// Find working speech recognition models on Hugging Face
const https = require('https');

const API_KEY = process.env.HUGGINGFACE_API_KEY;

// Try some alternative model names that might work
const ALTERNATIVE_MODELS = [
  'facebook/wav2vec2-large-960h', // Without the -lv60-self suffix
  'whisper-tiny', // Without openai/ prefix
  'whisper-base',
  'wav2vec2-base-960h', // Without facebook/ prefix
  'wav2vec2-large-960h',
  'microsoft/speecht5_asr',
  'facebook/hubert-large-ls960-ft',
  'jonatasgrosman/wav2vec2-large-xlsr-53-english'
];

async function testModelExists(modelId) {
  return new Promise((resolve) => {
    // First try to get model info via the models API
    const options = {
      hostname: 'huggingface.co',
      port: 443,
      path: `/api/models/${modelId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'User-Agent': 'Model-Check'
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
          exists: res.statusCode === 200,
          response: res.statusCode === 200 ? 'Model exists' : parsedResponse
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        model: modelId,
        status: 'ERROR',
        exists: false,
        response: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        model: modelId,
        status: 'TIMEOUT',
        exists: false,
        response: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runModelSearch() {
  console.log('🔍 Searching for working speech recognition models...\n');
  
  const workingModels = [];
  
  for (const model of ALTERNATIVE_MODELS) {
    const result = await testModelExists(model);
    console.log(`📊 ${model}`);
    console.log(`   Status: ${result.status} | Exists: ${result.exists}`);
    
    if (result.exists) {
      workingModels.push(model);
      console.log(`   ✅ FOUND WORKING MODEL!`);
    }
    
    console.log('');
  }
  
  console.log('=' .repeat(50));
  console.log(`✅ Working Models Found: ${workingModels.length}`);
  if (workingModels.length > 0) {
    console.log('📋 Working Models:');
    workingModels.forEach(model => console.log(`   - ${model}`));
  } else {
    console.log('❌ No working models found. May need to try different approach.');
  }
}

runModelSearch().catch(console.error);
