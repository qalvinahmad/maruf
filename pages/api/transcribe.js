import { HfInference } from '@huggingface/inference';
import formidable from 'formidable';
import { createRouter } from 'next-connect';

const hf = new HfInference(process.env.HF_TOKEN);

export const config = {
  api: {
    bodyParser: false,
  },
};

const router = createRouter();

router.post(async (req, res) => {
  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const audioFile = files.audio[0];
    const model = req.query.model || 'wav2vec';

    // Select model based on parameter
    const modelId = model === 'whisper' 
      ? 'tarteel-ai/whisper-base-ar-quran'
      : 'jonatasgrosman/wav2vec2-large-xlsr-53-arabic';

    // Process audio directly from memory
    const buffer = await audioFile.toBuffer();
    
    const response = await hf.automaticSpeechRecognition({
      model: modelId,
      data: buffer,
    });

    res.json({ text: response.text });

  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router.handler();
