// components/PronunciationAnalysisModal.jsx
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconVolume, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function PronunciationAnalysisModal({ isOpen, onClose, analysisData }) {
  if (!isOpen || !analysisData) return null;

  const { 
    makhraj_analysis, 
    sifat_analysis, 
    detected_errors, 
    correction_suggestions, 
    audio_quality, 
    target_info,
    fallback,
    message,
    basic_tip
  } = analysisData;

  // Handle fallback mode
  if (fallback) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Analisis Pengucapan</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <IconX size={20} />
            </button>
          </div>
          
          <div className="text-center py-8">
            <IconInfoCircle size={48} className="mx-auto text-blue-500 mb-4" />
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-900">💡 Tip Praktis:</p>
              <p className="text-blue-700">{basic_tip}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Analisis Detail Pengucapan</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <IconX size={20} />
          </button>
        </div>

        {/* Target Letter Info */}
        {target_info && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center gap-4 mb-2">
              <div className="text-4xl font-bold text-indigo-600">{target_info.letter}</div>
              <div>
                <p className="font-semibold text-indigo-900">{target_info.latin}</p>
                <p className="text-sm text-indigo-700">Makhraj: {target_info.makhraj}</p>
              </div>
            </div>
          </div>
        )}

        {/* Audio Quality */}
        {audio_quality && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <IconVolume size={18} />
              Kualitas Audio
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {audio_quality.clarity || audio_quality.score || 0}%
                </p>
                <p className="text-sm text-gray-600">Kejernihan</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {audio_quality.noise_level || audio_quality.background_noise || 0}%
                </p>
                <p className="text-sm text-gray-600">Noise</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {audio_quality.duration ? 
                    (audio_quality.duration < 1 ? 
                      (audio_quality.duration * 1000).toFixed(0) + 'ms' : 
                      audio_quality.duration.toFixed(1) + 's'
                    ) : 
                    (audio_quality.duration_ms || '0ms')
                  }
                </p>
                <p className="text-sm text-gray-600">Durasi</p>
              </div>
            </div>
            
            {/* Audio Quality Status */}
            {audio_quality.hasValidAudio === false && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <IconAlertTriangle size={16} />
                  <span className="font-medium">Audio Tidak Valid</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Volume: {audio_quality.volumeLevel}%, Rasio Suara: {audio_quality.speechRatio}%
                </p>
              </div>
            )}
            
            {audio_quality.hasValidAudio === true && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <IconCheck size={16} />
                  <span className="font-medium">Audio Terdeteksi</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Volume: {audio_quality.volumeLevel}%, Rasio Suara: {audio_quality.speechRatio}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Makhraj Analysis */}
        {makhraj_analysis && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Analisis Makhraj</h4>
            <div className="space-y-3">
              {makhraj_analysis.frequency_accuracy !== undefined && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800">Ketepatan Frekuensi</span>
                  <span className="font-bold text-green-900">{makhraj_analysis.frequency_accuracy}%</span>
                </div>
              )}
              {makhraj_analysis.frequency_match && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800">Ketepatan Frekuensi</span>
                  <span className="font-bold text-green-900">{Math.round(makhraj_analysis.frequency_match)}%</span>
                </div>
              )}
              {makhraj_analysis.duration_accuracy !== undefined && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800">Ketepatan Durasi</span>
                  <span className="font-bold text-blue-900">{makhraj_analysis.duration_accuracy}%</span>
                </div>
              )}
              {makhraj_analysis.duration_accuracy === undefined && makhraj_analysis.duration_accuracy && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800">Ketepatan Durasi</span>
                  <span className="font-bold text-blue-900">{Math.round(makhraj_analysis.duration_accuracy)}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sifat Analysis */}
        {sifat_analysis && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Analisis Sifat Huruf</h4>
            <div className="space-y-3">
              {sifat_analysis.sifat_accuracy !== undefined && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-800">Akurasi Sifat</span>
                  <span className="font-bold text-purple-900">{sifat_analysis.sifat_accuracy}%</span>
                </div>
              )}
              {sifat_analysis.detected_sifat?.map((sifat, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <IconCheck size={16} className="text-purple-600" />
                  <span className="text-purple-800">{sifat}</span>
                </div>
              ))}
              {sifat_analysis.accuracy && (
                <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg">
                  <span className="text-purple-800 font-medium">Akurasi Sifat</span>
                  <span className="font-bold text-purple-900">{Math.round(sifat_analysis.accuracy)}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detected Errors */}
        {detected_errors && detected_errors.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <IconAlertTriangle size={18} className="text-orange-500" />
              Kesalahan yang Terdeteksi
            </h4>
            <div className="space-y-2">
              {detected_errors.map((error, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  error.severity === 'high' ? 'bg-red-50 border-red-400' :
                  error.severity === 'medium' ? 'bg-orange-50 border-orange-400' :
                  'bg-yellow-50 border-yellow-400'
                }`}>
                  <p className="font-medium text-gray-900">{error.type}</p>
                  <p className="text-sm text-gray-600">{error.description}</p>
                  {error.expected && error.actual && (
                    <div className="text-xs text-gray-500 mt-1">
                      Diharapkan: {error.expected} | Aktual: {error.actual}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Correction Suggestions */}
        {correction_suggestions && correction_suggestions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Saran Perbaikan</h4>
            <div className="space-y-2">
              {correction_suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-green-800">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}
