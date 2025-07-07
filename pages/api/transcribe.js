// This API endpoint is disabled for production build
// Missing dependencies: @huggingface/inference, formidable, next-connect
// To enable, install: npm install @huggingface/inference formidable next-connect

export default function handler(req, res) {
  res.status(503).json({ 
    error: 'Transcribe API is currently disabled',
    message: 'This feature requires additional dependencies to be installed'
  });
}

// Fix: Add these dependencies to your package.json and install them:
// npm install @huggingface/inference formidable next-connect
// Or, if you do not use this API route in production, remove or comment out this file to avoid build errors.
