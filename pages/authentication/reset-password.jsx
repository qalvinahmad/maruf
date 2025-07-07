import { AuthTabs } from '@/components/AuthTabs';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  duration: 0.2
};

export default function ResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push('/authentication/login');
      }, 2000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Terjadi kesalahan saat mengatur ulang password');
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
        <title>Reset Password | Belajar Makhrojul Huruf</title>
        <meta name="description" content="Reset password page" />
      </Head>

      <AuthTabs currentPage="reset-password" />

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-600">Masukkan password baru Anda</p>
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

          {success && (
            <motion.div 
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Password berhasil diubah! Mengalihkan ke halaman login...
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password Baru
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                placeholder="Masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <motion.button
              type="submit"
              className="w-full bg-secondary text-white py-3 rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Reset Password'}
            </motion.button>
          </motion.form>

          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/authentication/login')}
              className="text-secondary font-medium hover:underline"
            >
              <motion.span whileHover={{ scale: 1.05 }}>
                Kembali ke Login
              </motion.span>
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
          <h1 className="text-4xl font-bold text-white mb-6">Atur Ulang Password</h1>
          <p className="text-blue-100 text-lg mb-8">
            Buat password baru yang kuat untuk mengamankan akun Anda.
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
                src="https://illustrations.popsy.co/white/security.svg" 
                alt="Reset Password Illustration" 
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

export const getServerSideProps = async (context) => {
  return {
    props: {}
  };
};
