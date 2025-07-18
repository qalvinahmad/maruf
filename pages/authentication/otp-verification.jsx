import { AuthTabs } from '@/components/AuthTabs';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  duration: 0.2
};

export default function OTPVerification() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!timeLeft) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current one is filled
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    try {
      // Add your resend OTP logic here
      setTimeLeft(60);
    } catch (error) {
      setError('Gagal mengirim ulang kode OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const otpString = otp.join('');
      if (otpString.length !== 4) {
        throw new Error('Masukkan 4 digit kode OTP');
      }

      // Add your OTP verification logic here
      // const { error } = await supabase.auth.verifyOtp({
      //   email,
      //   token: otpString,
      //   type: 'signup'
      // });

      // if (error) throw error;

      // Redirect on success
      router.push('/dashboard/home/Dashboard');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex bg-gray-50 relative"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Head>
        <title>Verifikasi OTP | Belajar Makhrojul Huruf</title>
        <meta name="description" content="Verifikasi OTP untuk akun Anda" />
      </Head>

      <AuthTabs currentPage="otp-verification" />

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Verifikasi OTP</h2>
            <p className="text-gray-600">
              Masukkan kode 4 digit yang telah kami kirimkan ke email Anda
            </p>
          </div>

          {error && (
            <motion.div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary"
                  required
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Tidak menerima kode?{' '}
                {timeLeft > 0 ? (
                  <span className="text-gray-500">
                    Kirim ulang dalam {timeLeft} detik
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-secondary hover:underline font-medium"
                  >
                    Kirim Ulang
                  </button>
                )}
              </p>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-secondary text-white py-3 rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || otp.join('').length !== 4}
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi'}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/authentication/login')}
              className="text-secondary hover:underline font-medium"
            >
              Kembali ke Login
            </button>
          </div>
        </motion.div>
      </div>

      {/* Visual Section */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary to-blue-700 p-12 flex-col justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">Verifikasi Akun Anda</h1>
          <p className="text-blue-100 text-lg mb-8">
            Kami menjaga keamanan akun Anda dengan verifikasi dua langkah.
          </p>
          
          <div className="relative h-80 w-full">
            <motion.div 
              className="absolute"
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut" 
              }}
            >
              <img 
                src="https://illustrations.popsy.co/white/authentication.svg" 
                alt="OTP Verification Illustration" 
                className="w-full max-w-md"
              />
            </motion.div>
          </div>
        </div>
        
        <div className="text-blue-100 text-sm">
          <p>© {new Date().getFullYear()} Makruf. Semua hak dilindungi.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
