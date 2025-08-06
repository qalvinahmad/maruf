import formidable from 'formidable';
import fs from 'fs';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🎤🎙️ Voice Recognition API called - Method:', req.method);

  let audioFile = null;
  
  try {
    console.log('🎤📋 Starting form data parsing...');
    
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filename: (name, ext, part, form) => {
        return Date.now() + '_' + part.originalFilename;
      },
    });

    const [fields, files] = await form.parse(req);
    console.log('🎤📋 Form parsed successfully');

    // Get the uploaded audio file
    audioFile = files.audio?.[0];
    if (!audioFile) {
      console.log('🎤❌ No audio file provided');
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤📁 Audio file received:', {
      originalFilename: audioFile.originalFilename,
      mimetype: audioFile.mimetype,
      size: audioFile.size,
      filepath: audioFile.filepath
    });

    const model = fields.model?.[0] || 'facebook/wav2vec2-large-960h';
    const targetText = fields.target_text?.[0] || '';

    console.log('🎤🔧 Processing speech recognition with model:', model);
    console.log('🎤🎯 Target text:', targetText);

    // Read audio file to validate it's not empty
    const audioBuffer = fs.readFileSync(audioFile.filepath);
    console.log('🎤📊 Audio buffer analysis:', { 
      size: audioBuffer.length, 
      type: audioFile.mimetype,
      minRequired: 10000 // 10KB minimum
    });

    if (audioBuffer.length < 10000) {
      // Too small, likely silence
      return res.status(200).json({
        success: false,
        error: 'Audio too small or silent',
        silenceDetected: true,
        debugInfo: {
          audioSize: audioBuffer.length,
          minRequired: 10000
        }
      });
    }

    // Since Hugging Face inference API is not working, return a graceful fallback response
    console.log('🎤⚠️ Hugging Face inference API currently unavailable, recommending Web Speech API');
    
    return res.status(200).json({
      success: false,
      error: 'Server-side speech recognition temporarily unavailable',
      suggestion: 'use_web_speech_api',
      fallbackMessage: 'Hugging Face inference API is currently not accessible. Please use the Web Speech API in your browser for voice recognition, which provides better performance and reliability.',
      debugInfo: {
        modelAttempted: model,
        audioReceived: true,
        audioSize: audioBuffer.length,
        targetText: targetText,
        serverStatus: 'Models exist but inference API unavailable',
        recommendation: 'Use browser Web Speech API for voice recognition'
      }
    });

  } catch (error) {
    console.error('🎤❌ Voice recognition error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      debugInfo: {
        step: 'Server processing',
        errorType: error.name || 'Unknown'
      }
    });
  } finally {
    // Clean up temp file if it exists
    if (audioFile?.filepath) {
      try {
        fs.unlinkSync(audioFile.filepath);
        console.log('🧹 Cleaned up temp file:', audioFile.filepath);
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up temp file:', cleanupError.message);
      }
    }
  }
}
