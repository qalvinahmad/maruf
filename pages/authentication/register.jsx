import { AuthTabs } from '@/components/AuthTabs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Use same animations as login page
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  duration: 0.2
};

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (password !== confirmPassword) {
        setError('Password tidak cocok');
        return;
      }

      setLoading(true);
      // Sign up user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
options: {
  data: {
    full_name: fullName,
    email,
  }
}

      });

      if (signUpError) throw signUpError;

      if (user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to sign in immediately after registration
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (signInData.user) {
          // Store user data in localStorage
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', fullName);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userId', signInData.user.id);

          // Redirect to dashboard
          router.push('/dashboard/home/Dashboard');
        }
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError(
        error.message === 'User already registered'
          ? 'Email sudah terdaftar'
          : error.message || 'Terjadi kesalahan saat mendaftar'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDirectNavigation = (path) => {
    document.body.style.pointerEvents = 'none';
    window.location.href = path;
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
      <AuthTabs currentPage="register" />

      {/* Form di kiri */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 order-2 lg:order-1">
        <motion.div
          className="w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Buat Akun</h2>
            <p className="text-gray-600">Isi formulir di bawah untuk membuat akun baru</p>
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

          <motion.form
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Nama Lengkap</label>
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
  placeholder="Masukkan nama lengkap"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  required
/>

            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                placeholder="Buat password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Konfirmasi Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                placeholder="Konfirmasi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-secondary" required />
                <span className="ml-2 text-gray-700 text-sm">
                  Saya menyetujui <Link href="/footer/terms" className="text-secondary hover:underline">Syarat dan Ketentuan</Link>
                </span>
              </label>
            </div>
            <motion.button
              type="submit"
              className="w-full bg-secondary text-white py-3 rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </motion.button>
          </motion.form>

          {/* Login Link - Update */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <button
                onClick={() => handleDirectNavigation('/authentication/login')}
                className="text-secondary font-medium hover:underline inline-block"
              >
                <motion.span whileHover={{ scale: 1.05 }}>
                  Login sekarang
                </motion.span>
              </button>
            </p>
          </div>

          {/* Terms and Privacy Links */}
          <div className="text-center mt-4 text-sm text-gray-500">
            <p>
              Dengan mendaftar, Anda menyetujui{' '}
              <Link href="/footer/terms" shallow={true} scroll={false} className="text-secondary hover:underline">
                Syarat dan Ketentuan
              </Link>
              {' '}dan{' '}
              <Link href="/footer/privacy" shallow={true} scroll={false} className="text-secondary hover:underline">
                Kebijakan Privasi
              </Link>
              {' '}kami
            </p>
          </div>
        </motion.div>
      </div>

      {/* Ilustrasi di kanan */}
      <motion.div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary to-blue-700 p-12 flex-col justify-between order-1 lg:order-2">
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">Mulai Perjalanan Anda</h1>
          <p className="text-blue-100 text-lg mb-8">
            Daftar sekarang untuk memulai pembelajaran makhrojul huruf dengan metode interaktif.
          </p>
          <div className="relative h-80 w-full">
            <motion.div 
              className="absolute"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <img 
                src="https://illustrations.popsy.co/white/student-working.svg" 
                alt="Ilustrasi Register" 
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