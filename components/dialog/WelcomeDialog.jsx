import { IconArrowRight } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { FiAward } from 'react-icons/fi';
import SplitText from '../ui/split-text'; // << Tambahkan ini

const WelcomeDialog = ({ isOpen, setIsOpen, userName }) => {
  const router = useRouter();
  const displayName = userName || 'User';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setIsOpen(false);
            localStorage.setItem('lastWelcomeShown', new Date().toDateString());
          }}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-purple-500 to-blue-700 text-white p-8 rounded-2xl w-full max-w-lg shadow-xl cursor-default relative overflow-hidden font-['Poppins']"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="bg-white w-20 h-20 mb-4 rounded-full text-4xl text-purple-600 grid place-items-center mx-auto shadow-lg">
                <FiAward />
              </div>

              <SplitText
                text={`Assalamu'alaikum, ${displayName}!`}
                className="text-3xl font-bold text-center mb-3 font-['Poppins']"
              />

              <SplitText
                text="Senang melihat Anda kembali. Lanjutkan perjalanan belajar Anda dan tingkatkan kemampuan dalam makhrojul huruf."
                className="text-center mb-8 text-white/90 font-['Poppins']"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-white/10 hover:bg-white/20 transition-colors text-white font-semibold w-full py-3 px-4 rounded-xl font-['Poppins']"
                >
                  Nanti saja
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/dashboard/DashboardHuruf');
                  }}
                  className="bg-white hover:bg-white/90 transition-opacity text-purple-600 font-semibold w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-['Poppins']"
                >
                  <span>Mulai Belajar</span>
                  <IconArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeDialog;
