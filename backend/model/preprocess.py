import os
import librosa
import torch
import numpy as np
from torch.utils.data import Dataset

class AudioDataset(Dataset):
    def __init__(self, data_path, sample_rate=22050, duration=1):
        self.data_path = data_path
        self.sample_rate = sample_rate
        self.duration = duration
        self.samples = sample_rate * duration
        
        # Load file paths and labels
        self.files = []
        self.labels = []
        
        # Implement file loading logic
        class_names = sorted([d for d in os.listdir(data_path) if os.path.isdir(os.path.join(data_path, d))])
        self.class_to_idx = {class_name: idx for idx, class_name in enumerate(class_names)}
        
        for class_name in class_names:
            class_path = os.path.join(data_path, class_name)
            for audio_file in os.listdir(class_path):
                if audio_file.endswith('.wav'):  # Assuming WAV files
                    self.files.append(os.path.join(class_path, audio_file))
                    self.labels.append(self.class_to_idx[class_name])
        
    def __len__(self):
        return len(self.files)
    
    def __getitem__(self, idx):
        audio_path = self.files[idx]
        label = self.labels[idx]
        
        # Load and preprocess audio
        waveform, _ = librosa.load(audio_path, sr=self.sample_rate, duration=self.duration)
        
        # Pad or truncate to fixed length
        if len(waveform) < self.samples:
            waveform = np.pad(waveform, (0, self.samples - len(waveform)))
        else:
            waveform = waveform[:self.samples]
            
        # Convert to mel spectrogram
        mel_spec = librosa.feature.melspectrogram(y=waveform, sr=self.sample_rate)
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        
        # Normalize
        mel_spec_db = (mel_spec_db - mel_spec_db.mean()) / mel_spec_db.std()
        
        return torch.FloatTensor(mel_spec_db).unsqueeze(0), label
