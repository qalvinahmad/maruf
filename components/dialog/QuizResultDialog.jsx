import { IconCheck, IconClock, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';

const QuizResultDialog = ({ isOpen, onClose, results, onRetry, onContinue }) => {
  // Safety checks for results data
  const answers = results?.answers || [];
  const totalQuestions = results?.finalTotalQuestions || answers.length || 0;
  const correctAnswersCount = results?.finalCorrectAnswers || answers.filter(a => a.isCorrect).length;
  const calculatedScore = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
  const timeString = results?.totalTime || '0m 0s';
  
  console.log('QuizResultDialog data:', {
    results,
    totalQuestions,
    correctAnswersCount,
    calculatedScore,
    timeString
  });
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">🎉 Hasil Kuis</h2>
              
              {/* Score and Time Display */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-4">
                <div className="text-4xl font-bold text-secondary mb-2">
                  {Math.round(calculatedScore)}%
                </div>
                <p className="text-lg text-gray-700 mb-2">
                  {correctAnswersCount} dari {totalQuestions} jawaban benar
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <IconClock size={18} />
                  <span>Waktu pengerjaan: {timeString}</span>
                </div>
              </div>
              
              {/* Performance Message */}
              <div className="text-lg">
                {calculatedScore === 100 ? (
                  <span className="text-green-600 font-semibold">🏆 Sempurna! Anda menguasai materi ini!</span>
                ) : calculatedScore >= 80 ? (
                  <span className="text-blue-600 font-semibold">🎉 Bagus sekali! Pertahankan!</span>
                ) : calculatedScore >= 60 ? (
                  <span className="text-yellow-600 font-semibold">👍 Tidak buruk, terus berlatih!</span>
                ) : (
                  <span className="text-red-600 font-semibold">📚 Perlu belajar lagi, jangan menyerah!</span>
                )}
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Detail Jawaban:</h3>
                {answers.length > 0 ? answers.map((answer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                        answer.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {answer.isCorrect ? <IconCheck size={20} /> : <IconX size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-2">
                          Soal {index + 1}: {answer.question}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className={`font-medium ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            Jawaban Anda: "{answer.selectedAnswer}"
                          </p>
                          {!answer.isCorrect && (
                            <p className="text-green-700 font-medium">
                              Jawaban Benar: "{answer.correctAnswer}"
                            </p>
                          )}
                          {answer.isCorrect && (
                            <p className="text-green-600 text-xs">
                              ✅ Benar! Jawaban Anda tepat.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📝</div>
                    <p>Tidak ada detail jawaban tersedia</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={onRetry}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  🔄 Coba Lagi
                </button>
                <button
                  onClick={onContinue}
                  className="flex-1 bg-secondary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  🏠 Kembali ke Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizResultDialog;
