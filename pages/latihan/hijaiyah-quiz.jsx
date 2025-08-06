import { IconCheck, IconChevronRight, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Data soal: 28 huruf hijaiyah, setiap soal: "Huruf ب dibaca apa?" dst, 3 pilihan
const hijaiyahQuestions = [
  { arabic: 'ا', latin: 'Alif', options: ['Alif', 'Ba', 'Ta'], answer: 'Alif' },
  { arabic: 'ب', latin: 'Ba', options: ['Ba', 'Ta', 'Jim'], answer: 'Ba' },
  { arabic: 'ت', latin: 'Ta', options: ['Ta', 'Tha', 'Ba'], answer: 'Ta' },
  { arabic: 'ث', latin: 'Tsa', options: ['Tsa', 'Jim', 'Kha'], answer: 'Tsa' },
  { arabic: 'ج', latin: 'Jim', options: ['Jim', 'Ha', 'Kha'], answer: 'Jim' },
  { arabic: 'ح', latin: 'Ha', options: ['Ha', 'Kha', 'Dal'], answer: 'Ha' },
  { arabic: 'خ', latin: 'Kha', options: ['Kha', 'Ha', 'Dal'], answer: 'Kha' },
  { arabic: 'د', latin: 'Dal', options: ['Dal', 'Dzal', 'Ra'], answer: 'Dal' },
  { arabic: 'ذ', latin: 'Dzal', options: ['Dzal', 'Dal', 'Ra'], answer: 'Dzal' },
  { arabic: 'ر', latin: 'Ra', options: ['Ra', 'Za', 'Dal'], answer: 'Ra' },
  { arabic: 'ز', latin: 'Za', options: ['Za', 'Ra', 'Sin'], answer: 'Za' },
  { arabic: 'س', latin: 'Sin', options: ['Sin', 'Syin', 'Za'], answer: 'Sin' },
  { arabic: 'ش', latin: 'Syin', options: ['Syin', 'Sin', 'Shad'], answer: 'Syin' },
  { arabic: 'ص', latin: 'Shad', options: ['Shad', 'Dhad', 'Sin'], answer: 'Shad' },
  { arabic: 'ض', latin: 'Dhad', options: ['Dhad', 'Shad', 'Tha'], answer: 'Dhad' },
  { arabic: 'ط', latin: 'Tha', options: ['Tha', 'Dhad', 'Zha'], answer: 'Tha' },
  { arabic: 'ظ', latin: 'Zha', options: ['Zha', 'Tha', 'Ain'], answer: 'Zha' },
  { arabic: 'ع', latin: 'Ain', options: ['Ain', 'Ghain', 'Fa'], answer: 'Ain' },
  { arabic: 'غ', latin: 'Ghain', options: ['Ghain', 'Ain', 'Fa'], answer: 'Ghain' },
  { arabic: 'ف', latin: 'Fa', options: ['Fa', 'Qaf', 'Kaf'], answer: 'Fa' },
  { arabic: 'ق', latin: 'Qaf', options: ['Qaf', 'Fa', 'Kaf'], answer: 'Qaf' },
  { arabic: 'ك', latin: 'Kaf', options: ['Kaf', 'Qaf', 'Lam'], answer: 'Kaf' },
  { arabic: 'ل', latin: 'Lam', options: ['Lam', 'Mim', 'Nun'], answer: 'Lam' },
  { arabic: 'م', latin: 'Mim', options: ['Mim', 'Lam', 'Nun'], answer: 'Mim' },
  { arabic: 'ن', latin: 'Nun', options: ['Nun', 'Mim', 'Waw'], answer: 'Nun' },
  { arabic: 'و', latin: 'Waw', options: ['Waw', 'Ha', 'Ya'], answer: 'Waw' },
  { arabic: 'ه', latin: 'Ha', options: ['Ha', 'Waw', 'Ya'], answer: 'Ha' },
  { arabic: 'ي', latin: 'Ya', options: ['Ya', 'Ha', 'Waw'], answer: 'Ya' },
];

const colorPalette = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-green-500',
  'from-pink-500 to-rose-500',
  'from-yellow-500 to-amber-500',
  'from-purple-500 to-fuchsia-500',
  'from-cyan-500 to-sky-500'
];

export default function HijaiyahQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setSelected(null);
    setShowFeedback(false);
  }, [current]);

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    setShowFeedback(true);
    if (option === hijaiyahQuestions[current].answer) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      setShowFeedback(false);
      if (current < hijaiyahQuestions.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        setShowResult(true);
      }
    }, 900);
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
    setShowFeedback(false);
  };

  // UI/UX: max-w-5xl mx-auto, padding, spacing, color, feedback, microcopy, hierarchy, animation
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2 tracking-tight">
            Latihan Membaca Huruf Hijaiyah
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Pilih nama huruf yang benar untuk setiap huruf hijaiyah di bawah ini.
          </p>
          <div className="flex justify-center gap-2 text-sm text-gray-500">
            <span>Soal {current + 1} / {hijaiyahQuestions.length}</span>
            <span>•</span>
            <span>Skor: {score}</span>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 flex flex-col items-center justify-center transition-all duration-300">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col items-center"
              >
                <div className="mb-8">
                  <div
                    className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-6xl md:text-7xl font-arabic font-bold shadow-lg bg-gradient-to-br ${
                      colorPalette[current % colorPalette.length]
                    } text-white transition-all duration-300`}
                  >
                    {hijaiyahQuestions[current].arabic}
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center">
                  Huruf <span className="font-arabic text-2xl">{hijaiyahQuestions[current].arabic}</span> dibaca apa?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg mb-8">
                  {hijaiyahQuestions[current].options.map((option, idx) => (
                    <motion.button
                      key={option}
                      whileHover={{ scale: selected ? 1 : 1.04 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!!selected}
                      onClick={() => handleSelect(option)}
                      className={`w-full py-4 px-4 rounded-xl font-semibold text-lg shadow-sm border transition-all duration-200 focus:outline-none
                        ${
                          selected
                            ? option === hijaiyahQuestions[current].answer
                              ? 'bg-green-100 border-green-400 text-green-700'
                              : option === selected
                              ? 'bg-red-100 border-red-400 text-red-700'
                              : 'bg-gray-50 border-gray-200 text-gray-400'
                            : 'bg-gray-50 hover:bg-indigo-50 border-gray-200 text-gray-700'
                        }
                      `}
                    >
                      {option}
                      {selected && option === hijaiyahQuestions[current].answer && (
                        <IconCheck className="inline ml-2 text-green-500" size={20} />
                      )}
                      {selected && option === selected && option !== hijaiyahQuestions[current].answer && (
                        <IconX className="inline ml-2 text-red-500" size={20} />
                      )}
                    </motion.button>
                  ))}
                </div>
                {/* Feedback visual */}
                <AnimatePresence>
                  {showFeedback && selected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`text-lg font-semibold mb-2 ${
                        selected === hijaiyahQuestions[current].answer
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {selected === hijaiyahQuestions[current].answer
                        ? 'Jawaban benar!'
                        : `Jawaban salah. Jawaban yang benar: ${hijaiyahQuestions[current].answer}`}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-between w-full max-w-lg mt-4">
                  <span className="text-gray-400 text-sm">Soal {current + 1} dari {hijaiyahQuestions.length}</span>
                  <span className="text-gray-400 text-sm">Skor: {score}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col items-center"
              >
                <div className="mb-8">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-6xl md:text-7xl font-arabic font-bold shadow-lg bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                    {score >= 24 ? '🌟' : score >= 18 ? '👍' : '💡'}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  Selesai! Skor Anda: <span className="text-indigo-600">{score} / {hijaiyahQuestions.length}</span>
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  {score === 28
                    ? 'Sempurna! Anda sudah sangat mengenal huruf hijaiyah.'
                    : score >= 24
                    ? 'Bagus! Tingkatkan lagi agar makin lancar.'
                    : score >= 18
                    ? 'Cukup baik, terus latihan ya!'
                    : 'Ayo coba lagi agar lebih hafal huruf hijaiyah.'}
                </p>
                <button
                  onClick={handleRestart}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-lg shadow transition-all duration-200 flex items-center gap-2"
                >
                  <IconChevronRight size={22} />
                  Ulangi Latihan
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* UX microcopy */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-8 text-center text-gray-400 text-xs">
        <span>
          Latihan ini membantu Anda mengenal huruf hijaiyah dengan cepat. Pilih jawaban yang menurut Anda benar, dan dapatkan umpan balik langsung.
        </span>
      </div>
    </section>
  );
}