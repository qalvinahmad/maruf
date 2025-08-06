import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Arabic speech recognition models for makhraj analysis
const MODEL_CONFIGS = {
  'facebook/wav2vec2-large-xlsr-53-arabic': {
    type: 'automatic-speech-recognition',
    apiUrl: 'https://api-inference.huggingface.co/models/facebook/wav2vec2-large-xlsr-53-arabic',
    description: 'Facebook Wav2Vec2 XLS-R Arabic model - best for Arabic speech recognition'
  },
  'jonatasgrosman/wav2vec2-large-xlsr-53-arabic': {
    type: 'automatic-speech-recognition',
    apiUrl: 'https://api-inference.huggingface.co/models/jonatasgrosman/wav2vec2-large-xlsr-53-arabic',
    description: 'Alternative Arabic speech recognition model'
  },
  'facebook/wav2vec2-large-xlsr-53': {
    type: 'automatic-speech-recognition',
    apiUrl: 'https://api-inference.huggingface.co/models/facebook/wav2vec2-large-xlsr-53',
    description: 'Multilingual model that supports Arabic'
  },
  'openai/whisper-small': {
    type: 'automatic-speech-recognition',
    apiUrl: 'https://api-inference.huggingface.co/models/openai/whisper-small',
    description: 'OpenAI Whisper small - supports Arabic and multiple languages'
  }
};

export default async function handler(req, res) {
  console.log('🎤🇸🇦 Arabic Voice Recognition API called - Method:', req.method);
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎤📋 Starting form data parsing...');
    
    // Parse form data
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    console.log('🎤📋 Form parsed successfully');
    
    const audioFile = files.audio?.[0];
    let model = fields.model?.[0] || 'facebook/wav2vec2-large-xlsr-53-arabic';
    const targetText = fields.target_text?.[0] || '';

    console.log('🎤📁 Audio file received:', {
      originalFilename: audioFile?.originalFilename,
      mimetype: audioFile?.mimetype,
      size: audioFile?.size,
      filepath: audioFile?.filepath
    });

    // Use Arabic speech recognition models as default
    if (model.includes('whisper-tiny') || model.includes('ojisetyawan') || model === 'mock/demo-api') {
      console.log('🔄 Switching to Arabic model for better makhraj analysis');
      model = 'facebook/wav2vec2-large-xlsr-53-arabic';
    }

    if (!audioFile) {
      console.log('❌ No audio file provided in request');
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤🔧 Processing Arabic speech recognition with model:', model);
    console.log('🎤🎯 Target text (makhraj):', targetText);

    // Get model configuration
    const modelConfig = MODEL_CONFIGS[model];
    if (!modelConfig) {
      console.log('Available Arabic models:', Object.keys(MODEL_CONFIGS));
      return res.status(400).json({ 
        error: 'Unsupported model', 
        model: model,
        availableModels: Object.keys(MODEL_CONFIGS)
      });
    }

    let transcription = '';
    let isProcessed = false;

    try {
      // REAL Arabic speech recognition - NO MORE CHEATING
      console.log('🎤🇸🇦 Starting REAL Arabic speech recognition with:', model);
      
      // Check audio file size first - reject if too small (silence detection)
      const audioBuffer = fs.readFileSync(audioFile.filepath);
      console.log('🎤📊 Audio buffer analysis:', {
        size: audioBuffer.length,
        type: audioFile.mimetype,
        minRequired: 10000
      });
      
      if (audioBuffer.length < 10000) { // Less than 10KB indicates very short/silent audio
        console.log('🔇 Audio too small - likely silence or very short recording');
        
        // Clean up temporary file
        if (fs.existsSync(audioFile.filepath)) {
          fs.unlinkSync(audioFile.filepath);
        }
        
        return res.status(200).json({
          success: true,
          transcription: '',
          targetText,
          similarity: 0,
          model: model,
          modelDescription: 'Audio terlalu pendek atau tidak ada suara',
          processed: false,
          silenceDetected: true,
          audioSize: audioBuffer.length,
          isArabicModel: true
        });
      }

      // Process with REAL Arabic speech recognition
      transcription = await processWithArabicASR(audioFile, modelConfig);
      isProcessed = true;
      
      console.log('🎤✅ Arabic ASR completed:', {
        transcription,
        targetText,
        model
      });

    } catch (modelError) {
      console.error('🎤❌ Arabic ASR failed:', modelError.message);
      
      // Try fallback models in order
      const fallbackModels = [
        'jonatasgrosman/wav2vec2-large-xlsr-53-arabic',
        'facebook/wav2vec2-large-xlsr-53',
        'openai/whisper-small'
      ];
      
      for (const fallbackModel of fallbackModels) {
        if (fallbackModel !== model && MODEL_CONFIGS[fallbackModel]) {
          try {
            console.log(`🔄 Trying fallback Arabic model: ${fallbackModel}`);
            transcription = await processWithArabicASR(audioFile, MODEL_CONFIGS[fallbackModel]);
            model = fallbackModel; // Update model name for response
            isProcessed = true;
            console.log(`✅ Fallback ${fallbackModel} succeeded:`, transcription);
            break;
          } catch (fallbackError) {
            console.log(`❌ Fallback ${fallbackModel} failed:`, fallbackError.message);
            continue;
          }
        }
      }
      
      // If ALL models failed, return honest failure
      if (!isProcessed) {
        console.log('🎤❌ ALL Arabic speech recognition models failed');
        
        // Clean up temporary file
        if (fs.existsSync(audioFile.filepath)) {
          fs.unlinkSync(audioFile.filepath);
        }
        
        return res.status(200).json({
          success: false,
          transcription: '',
          targetText,
          similarity: 0,
          model: model,
          modelDescription: 'Semua model gagal memproses audio',
          processed: false,
          error: 'Arabic speech recognition failed',
          audioSize: fs.readFileSync(audioFile.filepath).length,
          isArabicModel: true
        });
      }
    }

    // Calculate similarity with target text using REAL transcription
    const similarity = calculateSimilarity(transcription, targetText);
    
    // Clean up temporary file
    if (fs.existsSync(audioFile.filepath)) {
      fs.unlinkSync(audioFile.filepath);
    }

    console.log('🎤✅ Final Arabic speech recognition result:', {
      transcription,
      targetText,
      similarity,
      model,
      isProcessed
    });

    return res.status(200).json({
      success: true,
      transcription,
      targetText,
      similarity,
      model,
      modelDescription: MODEL_CONFIGS[model]?.description || 'Arabic speech recognition model',
      processed: isProcessed,
      isArabicModel: true
    });

  } catch (error) {
    console.error('🎤❌ Voice recognition API error:', error);
    
    // Clean up temporary file if it exists
    try {
      if (audioFile?.filepath && fs.existsSync(audioFile.filepath)) {
        fs.unlinkSync(audioFile.filepath);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Process with Arabic speech recognition models (Facebook Wav2Vec2, etc.)
async function processWithArabicASR(audioFile, modelConfig) {
  console.log('🎤🇸🇦 Starting Arabic ASR processing with:', modelConfig.apiUrl);
  
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.log('❌ HUGGINGFACE_API_KEY not found in environment variables');
    throw new Error('HUGGINGFACE_API_KEY not found in environment variables');
  }
  
  console.log('✅ API Key present for Arabic model, length:', process.env.HUGGINGFACE_API_KEY.length);
  
  const audioBuffer = fs.readFileSync(audioFile.filepath);
  console.log('🎤📊 Audio buffer for Arabic ASR:', audioBuffer.length, 'bytes');
  
  console.log('🎤🇸🇦 Making request to Arabic speech recognition API...');
  
  const response = await fetch(modelConfig.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'audio/wav',
    },
    body: audioBuffer,
  });

  console.log('🎤🇸🇦 Arabic ASR response status:', response.status);
  console.log('🎤🇸🇦 Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🎤❌ Arabic ASR API error:', response.status, errorText);
    console.error('🎤❌ Request details:', {
      url: modelConfig.apiUrl,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY.substring(0, 10)}...`,
        'Content-Type': 'audio/wav',
      },
      bodySize: audioBuffer.length
    });
    throw new Error(`Arabic ASR API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('🎤✅ Arabic ASR result:', result);
  
  if (result.error) {
    console.error('🎤❌ Arabic ASR result contains error:', result.error);
    throw new Error(result.error);
  }

  // Extract transcription from Arabic ASR response
  let transcription = '';
  if (result.text) {
    transcription = result.text;
  } else if (result.transcription) {
    transcription = result.transcription;
  } else if (typeof result === 'string') {
    transcription = result;
  } else if (Array.isArray(result) && result.length > 0) {
    transcription = result[0].text || result[0].transcription || '';
  }
  
  console.log('🎤🇸🇦 Final Arabic transcription:', transcription);
  
  // Clean up transcription for Arabic text
  return transcription.trim();
}

// Calculate similarity between transcribed and target text for makhraj evaluation
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  // Normalize strings for Arabic comparison
  const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  const normalized1 = normalize(str1);
  const normalized2 = normalize(str2);
  
  console.log('🎤📊 Calculating similarity:', {
    transcribed: normalized1,
    target: normalized2
  });
  
  // Exact match gets 100%
  if (normalized1 === normalized2) {
    console.log('🎤✅ Exact match found: 100%');
    return 100;
  }
  
  // Calculate Levenshtein distance for similarity
  const len1 = normalized1.length;
  const len2 = normalized2.length;
  const maxLength = Math.max(len1, len2);
  
  if (maxLength === 0) return 100;
  
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = normalized1[i - 1] === normalized2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,       // deletion
        matrix[j][i - 1] + 1,       // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  const distance = matrix[len2][len1];
  const similarity = Math.round(((maxLength - distance) / maxLength) * 100);
  
  console.log('🎤📊 Similarity calculation result:', {
    distance,
    maxLength,
    similarity: similarity + '%'
  });
  
  return similarity;
}
