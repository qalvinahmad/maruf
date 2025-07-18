require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Setup multer untuk upload audio
const upload = multer({ 
  dest: path.join(__dirname, 'uploads/'),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Mapping nama model dari query ke URL Hugging Face
const modelMap = {
  whisper: 'openai/whisper-base',
  wav2vec: 'jonatasgrosman/wav2vec2-large-xlsr-53-arabic'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.url.includes('transkrip')) {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
  }
  next();
});

// Endpoint transkripsi dengan error handling yang lebih baik
app.post('/transkrip', upload.single('audio'), async (req, res) => {
  let audioPath = null;
  
  try {
    console.log('=== Transcription Request Started ===');
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        error: 'File audio tidak ditemukan',
        success: false 
      });
    }
    
    audioPath = req.file.path;
    console.log('Audio file received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: audioPath
    });
    
    // Ambil model dari query parameter, default ke whisper
    const modelType = req.query.model || 'whisper';
    const modelUrl = modelMap[modelType];

    if (!modelUrl) {
      console.error('Model not recognized:', modelType);
      return res.status(400).json({ 
        error: 'Model tidak dikenali',
        success: false 
      });
    }

    // Validate file exists and is readable
    if (!fs.existsSync(audioPath)) {
      console.error('Audio file does not exist:', audioPath);
      return res.status(400).json({ 
        error: 'File audio tidak dapat dibaca',
        success: false 
      });
    }

    // Baca file audio
    const audioBuffer = fs.readFileSync(audioPath);
    
    if (audioBuffer.length === 0) {
      console.error('Audio file is empty');
      return res.status(400).json({ 
        error: 'File audio kosong',
        success: false 
      });
    }
    
    console.log(`Processing audio with model: ${modelUrl}`);
    console.log(`Audio file size: ${audioBuffer.length} bytes`);

    // Check if HF_TOKEN is available
    if (!process.env.HF_TOKEN) {
      console.error('HF_TOKEN not found in environment variables');
      return res.status(500).json({ 
        error: 'Konfigurasi server tidak lengkap',
        success: false 
      });
    }

    console.log('Sending request to Hugging Face API...');
    const response = await axios({
      method: 'post',
      url: `https://api-inference.huggingface.co/models/${modelUrl}`,
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'audio/wav'
      },
      data: audioBuffer,
      timeout: 60000 // Increase timeout to 60 seconds
    });

    console.log('Hugging Face API response received');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    let transcriptionText = '';
    
    // Handle different response formats
    if (typeof response.data === 'string') {
      transcriptionText = response.data;
    } else if (response.data && response.data.text) {
      transcriptionText = response.data.text;
    } else if (Array.isArray(response.data) && response.data.length > 0) {
      transcriptionText = response.data[0].text || JSON.stringify(response.data[0]);
    } else {
      console.log('Unexpected response format:', response.data);
      transcriptionText = JSON.stringify(response.data);
    }

    console.log('Final transcription text:', transcriptionText);

    res.json({
      model: modelUrl,
      hasil: transcriptionText,
      success: true,
      timestamp: new Date().toISOString()
    });

    console.log('=== Transcription Request Completed Successfully ===');

  } catch (error) {
    console.error('=== Transcription Request Failed ===');
    console.error('Error transcribing:', error);
    
    let errorMessage = 'Gagal memproses audio';
    let statusCode = 500;
    
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      statusCode = error.response.status;
      
      if (error.response.status === 503) {
        errorMessage = 'Model AI sedang loading, silakan coba lagi dalam beberapa detik';
      } else if (error.response.status === 429) {
        errorMessage = 'Terlalu banyak permintaan, silakan coba lagi nanti';
      } else if (error.response.status === 400) {
        errorMessage = 'Format audio tidak valid atau tidak didukung';
      } else if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Tidak dapat terhubung ke server AI';
      statusCode = 503;
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout - audio terlalu panjang atau koneksi lambat';
      statusCode = 408;
    } else if (error.code === 'ECONNRESET') {
      errorMessage = 'Koneksi terputus, silakan coba lagi';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      success: false,
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    
  } finally {
    // Hapus file sementara
    if (audioPath && fs.existsSync(audioPath)) {
      try {
        fs.unlinkSync(audioPath);
        console.log('Temporary file deleted:', audioPath);
      } catch (unlinkError) {
        console.error('Error deleting temp file:', unlinkError);
      }
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Terjadi kesalahan server internal',
    success: false 
  });
});

app.listen(port, () => {
  console.log(`Server jalan di http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});
