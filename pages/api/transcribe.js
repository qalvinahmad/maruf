// Disable this API route for production build to avoid missing dependency errors.
// You can delete this file or comment out all code below if not needed.

export default function handler(req, res) {
  res.status(503).json({
    error: 'Transcribe API is disabled in production build due to missing dependencies.',
    message: 'Install @huggingface/inference, formidable, and next-connect to enable this endpoint.'
  });
}


// Fix: Add these dependencies to your package.json and install them:
// npm install @huggingface/inference formidable next-connect
// Or, if you do not use this API route in production, remove or comment out this file to avoid build errors.
