// Test actual audio inference with working models
const https = require('https');
const fs = require('fs');

const API_KEY = process.env.HUGGINGFACE_API_KEY;

// Create a simple test audio buffer (empty for now, but shows the structure)
function createTestAudioData() {
  // This is a minimal WAV header + silence
  const sampleRate = 16000;
  const duration = 1; // 1 second
  const numSamples = sampleRate * duration;
  
  // WAV header (44 bytes)
  const buffer = Buffer.alloc(44 + numSamples * 2);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  
  // Fill with silence (zeros)
  for (let i = 44; i < buffer.length; i++) {
    buffer[i] = 0;
  }
  
  return buffer;
}

async function testAudioInference(modelId) {
  return new Promise((resolve) => {
    const audioData = createTestAudioData();
    
    const options = {
      hostname: 'api-inference.huggingface.co',
      port: 443,
      path: `/models/${modelId}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'audio/wav',
        'Content-Length': audioData.length,
        'User-Agent': 'Audio-Test'
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
          response: parsedResponse,
          success: res.statusCode === 200
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        model: modelId,
        status: 'ERROR',
        response: error.message,
        success: false
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({
        model: modelId,
        status: 'TIMEOUT',
        response: 'Request timeout',
        success: false
      });
    });

    req.write(audioData);
    req.end();
  });
}

async function runInferenceTests() {
  console.log('🎵 Testing audio inference with working models...\n');
  
  const modelsToTest = [
    'facebook/wav2vec2-large-960h',
    'microsoft/speecht5_asr',
    'jonatasgrosman/wav2vec2-large-xlsr-53-english'
  ];
  
  for (const model of modelsToTest) {
    console.log(`🧪 Testing inference: ${model}`);
    const result = await testAudioInference(model);
    
    console.log(`   Status: ${result.status}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Response:`, typeof result.response === 'object' ? JSON.stringify(result.response, null, 2) : result.response);
    console.log('');
  }
}

runInferenceTests().catch(console.error);
