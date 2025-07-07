import { IconCheck, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';

const QuizResultDialog = ({ isOpen, onClose, results, totalQuestions }) => {
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
              <h2 className="text-2xl font-bold text-gray-800">Hasil Kuis</h2>
              <p className="text-gray-600">
                Skor Anda: {results.score.toFixed(0)}% ({results.answers.filter(a => a.isCorrect).length} dari {totalQuestions} benar)
              </p>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {results.answers.map((answer, index) => (
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
                          <p className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            Jawaban Anda: {answer.selectedAnswer}
                          </p>
                          {!answer.isCorrect && (
                            <p className="text-green-600">
                              Jawaban Benar: {answer.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full bg-secondary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizResultDialog;
