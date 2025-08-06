import { AuthTabs } from '@/components/AuthTabs';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Toast, showToast } from '../../components/ui/toast';
import { useAuth } from '../../context/AuthContext';

// Animasi untuk page transitions
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  duration: 0.2
};

// Add this config to disable automatic static optimization
export const config = {
  unstable_runtimeJS: false,
  unstable_JsPreload: false
};

export default function Login() {
  const { loading: authLoading, isAuthenticated, user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Animasi untuk form
  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  // Animasi untuk tombol
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  // Animasi untuk ilustrasi
  const illustrationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.7,
        delay: 0.2
      } 
    },
  };

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Simplified auth check
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // User is already authenticated, redirect to dashboard
      router.replace('/dashboard/home/Dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Tambahkan di bagian login yang berhasil
  // Tambahkan fungsi handleDirectNavigation yang hilang
  const handleDirectNavigation = (path) => {
    document.body.style.pointerEvents = 'none';
    window.location.href = path;
  };
  
  // Enhanced form validation
  const validateForm = () => {
    if (!email.trim()) {
      const errorMsg = 'Email tidak boleh kosong';
      setError(errorMsg);
      showToast.error(errorMsg);
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      const errorMsg = 'Format email tidak valid';
      setError(errorMsg);
      showToast.error(errorMsg);
      return false;
    }
    
    if (!password.trim()) {
      const errorMsg = 'Password tidak boleh kosong';
      setError(errorMsg);
      showToast.error(errorMsg);
      return false;
    }
    
    if (password.length < 6) {
      const errorMsg = 'Password minimal 6 karakter';
      setError(errorMsg);
      showToast.error(errorMsg);
      return false;
    }
    
    return true;
  };

  // Enhanced error handling
  const getErrorMessage = (error) => {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email atau password yang Anda masukkan salah. Silakan periksa kembali dan coba lagi.';
      case 'Email not confirmed':
        return 'Akun Anda belum diverifikasi. Silakan cek email untuk link konfirmasi.';
      case 'Too many requests':
        return 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit sebelum mencoba lagi.';
      case 'User not found':
        return 'Akun dengan email tersebut tidak ditemukan. Silakan daftar terlebih dahulu.';
      case 'Invalid email':
        return 'Format email tidak valid. Silakan masukkan email yang benar.';
      case 'Weak password':
        return 'Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.';
      case 'Email already registered':
        return 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      default:
        return error.message || 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
    }
  };

  // Simplified submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Use AuthContext signIn method
      const result = await signIn(cleanEmail, cleanPassword);

      if (result.success) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', cleanEmail);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        showToast.success('Login berhasil! Mengalihkan ke dashboard...');
        console.log('Login successful, redirecting to dashboard...');
        
        // Small delay to show toast
        setTimeout(() => {
          router.push('/dashboard/home/Dashboard');
        }, 1000);
      }

    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add demo account functionality for testing
  const handleDemoLogin = async () => {
    setEmail('demo@example.com');
    setPassword('demo123456');
    setError('');
    showToast.info('Data demo telah dimasukkan. Silakan klik login.');
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Toast />
      <motion.div 
        className="min-h-screen flex bg-gradient-to-br from-purple-500 to-blue-700 relative"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <AuthTabs currentPage="login" />

      <Head>
        <title>Login | Makhrojul Huruf</title>
        <meta name="description" content="Masuk ke akun pembelajaran makhrojul huruf Anda" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Kolom Kiri - Visual */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-between"
        initial="hidden"
        animate="visible"
        variants={illustrationVariants}
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">Selamat Datang Kembali</h1>
          <p className="text-blue-100 text-lg mb-8">
            Masuk ke akun Anda untuk mengakses dashboard dan mengelola pembelajaran makhrojul huruf.
          </p>
          
          {/* Ilustrasi */}
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
                src="https://illustrations.popsy.co/white/digital-nomad.svg" 
                alt="Ilustrasi Login" 
                className="w-full max-w-md"
              />
            </motion.div>
          </div>
        </div>
        
        <div className="text-blue-100 text-sm">
          <p>© {new Date().getFullYear()} Makhrojul Huruf. Semua hak dilindungi.</p>
        </div>
      </motion.div>

      {/* Kolom Kanan - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 lg:p-6">
        <motion.div
          className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
            <p className="text-gray-600">Masukkan kredensial Anda untuk melanjutkan</p>
          </div>

          {/* Enhanced Error Display */}
          {error && (
            <motion.div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          <motion.form
            variants={formVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
          >
            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  error && error.includes('email') || error.includes('Email') 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(''); // Clear error when user types
                }}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="block text-gray-700 text-sm font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link 
                  href="/authentication/forgot-password" 
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-2.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    error && error.includes('password') || error.includes('Password')
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(''); // Clear error when user types
                  }}
                  required
                  autoComplete="current-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="mb-5">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 focus:ring-offset-0"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="ml-2 text-gray-700 text-sm">Ingat saya</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className={`w-full py-3 rounded-lg font-medium flex justify-center items-center transition-all duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200'
              } text-white`}
              variants={buttonVariants}
              whileHover={!loading ? "hover" : {}}
              whileTap={!loading ? "tap" : {}}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Login'
              )}
            </motion.button>
          </motion.form>

          {/* Demo Account Button (for testing) */}
          {process.env.NODE_ENV === 'development' && (
            <motion.button
              onClick={handleDemoLogin}
              className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Gunakan Akun Demo
            </motion.button>
          )}

          {/* Register Link */}
          <div className="text-center mt-5">
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <button
                onClick={() => handleDirectNavigation('/authentication/register')}
                className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline inline-block"
              >
                <motion.span whileHover={{ scale: 1.05 }}>
                  Daftar sekarang
                </motion.span>
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-3">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-indigo-600 text-sm hover:underline"
            >
              ← Kembali ke Beranda
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Dengan masuk, Anda menyetujui{' '}
              <Link href="/footer/terms" className="text-indigo-600 hover:underline">
                Syarat & Ketentuan
              </Link>
              {' '}dan{' '}
              <Link href="/footer/privacy" className="text-indigo-600 hover:underline">
                Kebijakan Privasi
              </Link>
              {' '}kami.
            </p>
          </div>
        </motion.div>
      </div>
      </motion.div>
    </>
  );
}

// Replace getStaticProps with getServerSideProps
export async function getServerSideProps({ req, res }) {
  // Set cache control headers to prevent caching
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return {
    props: {}
  };
}