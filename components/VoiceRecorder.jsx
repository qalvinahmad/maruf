import { IconMicrophone, IconPlayerStop } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

export default function VoiceRecorder({ onRecordingComplete, model = 'wav2vec' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setAudioBlob(null);
      chunksRef.current = [];
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Send to transcription API
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await fetch(`/api/transcribe?model=${model}`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) throw new Error('Transcription failed');
          
          const data = await response.json();
          onRecordingComplete(data.text);
        } catch (error) {
          console.error('Transcription error:', error);
          onRecordingComplete(null, error);
        }

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <IconMicrophone size={24} />
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="p-4 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors animate-pulse"
        >
          <IconPlayerStop size={24} />
        </button>
      )}
      <p className="text-sm text-gray-600">
        {isRecording ? 'Tekan untuk berhenti' : 'Tekan untuk mulai merekam'}
      </p>
    </div>
  );
}
