// This is a disabled placeholder for the transcribe API
// Original version requires @huggingface/inference, formidable, and next-connect

export default function handler(req, res) {
  res.status(503).json({
    success: false,
    error: 'This API endpoint has been disabled for production build',
    message: 'The transcribe API requires additional dependencies that are not installed in production'
  });
}
