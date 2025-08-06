// Alternative: Try using Web Speech API for client-side speech recognition
// This doesn't rely on external APIs and works directly in the browser

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For now, return a suggestion to use Web Speech API
  return res.status(200).json({ 
    success: false,
    error: 'External API not available',
    suggestion: 'use_web_speech_api',
    details: 'Hugging Face inference API is not accessible. Recommend using browser Web Speech API instead.',
    debugInfo: {
      reason: 'inference_api_unavailable',
      alternative: 'client_side_speech_recognition'
    }
  });
}
