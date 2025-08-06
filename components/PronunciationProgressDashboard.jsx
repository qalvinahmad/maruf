// components/PronunciationProgressDashboard.jsx
import { IconBrain, IconChartBar, IconTrendingUp, IconVolume } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PronunciationProgressDashboard() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchProgressData();
      fetchFeedbackData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`/api/get-pronunciation-progress?user_id=${user.id}`);
      const result = await response.json();
      
      if (result.success) {
        setProgressData(result.data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      const response = await fetch(`/api/get-pronunciation-feedback?user_id=${user.id}&limit=10`);
      const result = await response.json();
      
      if (result.success) {
        setFeedbackData(result.data);
      }
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Memuat data progress...</span>
      </div>
    );
  }

  if (!progressData || !feedbackData) {
    return (
      <div className="text-center p-8">
        <IconVolume size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Belum ada data progress pronunciation.</p>
        <p className="text-sm text-gray-500">Mulai latihan pronunciation untuk melihat analytics.</p>
      </div>
    );
  }

  const { letter_progress, overall_statistics, weak_areas, strong_areas, insights, recommendations } = progressData;
  const { feedback, statistics } = feedbackData;

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Huruf Dipraktikkan</p>
              <p className="text-3xl font-bold">{overall_statistics.total_letters_practiced}</p>
            </div>
            <IconChartBar size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Huruf Dikuasai</p>
              <p className="text-3xl font-bold">{overall_statistics.mastered_letters}</p>
            </div>
            <IconTrendingUp size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Akurasi Rata-rata</p>
              <p className="text-3xl font-bold">{overall_statistics.average_accuracy}%</p>
            </div>
            <IconBrain size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Tingkat Keberhasilan</p>
              <p className="text-3xl font-bold">{statistics.success_rate}%</p>
            </div>
            <IconVolume size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Progress by Letter */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Progress per Huruf</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Object.values(letter_progress).map((progress) => (
            <div 
              key={progress.letter_id}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedLetter === progress.letter_id ? 
                'border-indigo-500 bg-indigo-50' : 
                'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedLetter(progress.letter_id)}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {progress.letter_info.arabic}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {progress.letter_info.latin}
                </div>
                <div className={`text-sm font-bold ${
                  progress.average_accuracy >= 80 ? 'text-green-600' :
                  progress.average_accuracy >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {Math.round(progress.average_accuracy)}%
                </div>
                <div className="text-xs text-gray-500">
                  {progress.total_attempts} percobaan
                </div>
                {progress.mastery_achieved_at && (
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak and Strong Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Areas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            Area yang Perlu Diperbaiki
          </h3>
          {weak_areas.length > 0 ? (
            <div className="space-y-3">
              {weak_areas.map((area, index) => (
                <div key={area.letter_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-red-600">{area.letter}</span>
                    <div>
                      <p className="font-medium text-red-900">{area.latin}</p>
                      <p className="text-sm text-red-700">{area.attempts} percobaan</p>
                    </div>
                  </div>
                  <div className="text-red-600 font-bold">{Math.round(area.accuracy)}%</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Tidak ada area yang perlu diperbaiki!</p>
          )}
        </div>

        {/* Strong Areas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Area yang Dikuasai
          </h3>
          {strong_areas.length > 0 ? (
            <div className="space-y-3">
              {strong_areas.map((area, index) => (
                <div key={area.letter_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-green-600">{area.letter}</span>
                    <div>
                      <p className="font-medium text-green-900">{area.latin}</p>
                      <p className="text-sm text-green-700">{area.attempts} percobaan</p>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold">{Math.round(area.accuracy)}%</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Terus berlatih untuk menguasai huruf-huruf!</p>
          )}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-blue-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Rekomendasi</h3>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Riwayat Latihan Terbaru</h3>
        <div className="space-y-3">
          {feedback.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-900">
                  {item.letter_info?.arabic || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.letter_info?.latin || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  item.pronunciation_accuracy >= 80 ? 'text-green-600' :
                  item.pronunciation_accuracy >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {Math.round(item.pronunciation_accuracy)}%
                </div>
                <div className="text-sm text-gray-500">
                  {item.ai_model_used || 'Analysis'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
