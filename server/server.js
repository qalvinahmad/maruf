require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Setup multer untuk upload audio
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// Mapping nama model dari query ke URL Hugging Face
const modelMap = {
  whisper: 'tarteel-ai/whisper-base-ar-quran',
  wav2vec: 'jonatasgrosman/wav2vec2-large-xlsr-53-arabic'
};

// Endpoint transkripsi
app.post('/transkrip', upload.single('audio'), async (req, res) => {
  const audioPath = req.file.path;

  // Ambil model dari query parameter, default ke whisper
  const modelType = req.query.model || 'whisper';
  const modelUrl = modelMap[modelType];

  if (!modelUrl) {
    fs.unlinkSync(audioPath);
    return res.status(400).json({ error: 'Model tidak dikenali' });
  }

  try {
    const response = await axios({
      method: 'post',
      url: `https://api-inference.huggingface.co/models/${modelUrl}`,
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'audio/wav'
      },
      data: fs.readFileSync(audioPath)
    });

    // Hapus file sementara
    fs.unlinkSync(audioPath);

    res.json({
      model: modelUrl,
      hasil: response.data.text || response.data
    });
  } catch (error) {
    console.error('Error transcribing:', error.response?.data || error.message);
    fs.unlinkSync(audioPath);
    res.status(500).json({ error: 'Gagal memproses audio' });
  }
});

app.listen(port, () => {
  console.log(`Server jalan di http://localhost:${port}`);
});
