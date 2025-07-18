import { AuthTabs } from '@/components/AuthTabs';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Toast, showToast } from '../../components/ui/toast';
import { supabase } from '../../lib/supabaseClient';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  duration: 0.2
};

// Animasi untuk form
const formVariants = {
  hidden: { opacity: 0, x: -50 },
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

export default function ResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  // Check for valid reset token on component mount
  useEffect(() => {
    const checkResetToken = async () => {
      try {
        // Log all possible URL parameters for debugging
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);

        // Check multiple possible locations for token
        let accessToken = null;
        let refreshToken = null;
        let type = null;

        // Method 1: Check URL hash (most common for Supabase)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          type = hashParams.get('type');
          
          console.log('Hash params:', {
            access_token: !!accessToken,
            refresh_token: !!refreshToken,
            type
          });
        }

        // Method 2: Check URL search params as fallback
        if (!accessToken || !refreshToken) {
          const urlParams = new URLSearchParams(window.location.search);
          accessToken = urlParams.get('access_token');
          refreshToken = urlParams.get('refresh_token');
          type = urlParams.get('type');
          
          console.log('URL params:', {
            access_token: !!accessToken,
            refresh_token: !!refreshToken,
            type
          });
        }

        // Method 3: Check if user already has a session (from other tabs/windows)
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Existing session:', !!sessionData?.session);
        
        if (sessionData?.session && !accessToken) {
          // Check if this is actually a password recovery session
          const sessionMetadata = sessionData.session.user?.user_metadata;
          console.log('Session metadata:', sessionMetadata);
          
          setValidToken(true);
          showToast.success('Sesi reset password ditemukan. Silakan masukkan password baru Anda.');
          setCheckingToken(false);
          return;
        }

        if (type === 'recovery' && accessToken && refreshToken) {
          // Set the session with the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Token validation error:', error);
            setError('Link reset password tidak valid atau sudah kedaluwarsa.');
            showToast.error('Link reset password tidak valid atau sudah kedaluwarsa.');
          } else {
            console.log('Token validation successful:', !!data.session);
            setValidToken(true);
            showToast.success('Link reset password valid. Silakan masukkan password baru Anda.');
            
            // Clean up URL to remove tokens for security
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        } else {
          console.log('Missing required parameters:', { type, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
          setError('Link reset password tidak valid. Silakan minta link reset password yang baru.');
          showToast.error('Link reset password tidak valid. Silakan minta link reset password yang baru.');
        }
      } catch (error) {
        console.error('Error checking reset token:', error);
        setError('Terjadi kesalahan saat memvalidasi link reset password.');
        showToast.error('Terjadi kesalahan saat memvalidasi link reset password.');
      } finally {
        setCheckingToken(false);
      }
    };

    checkResetToken();
  }, []);

  const validateForm = () => {
    if (!password.trim()) {
      const errorMsg = 'Password tidak boleh kosong';
      setError(errorMsg);
      showToast.error(errorMsg);
      return false;
    }

    if (passwordStrength < 3) {
      const errorMsg = 'Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.';
      setError(errorMsg);
      showToast.error(errorMsg);
      return false;
    }

    if (password !== confirmPassword) {
      const errorMsg = 'Password tidak cocok';
      setError(errorMsg);
      showToast.error(errorMsg);
      return false;
    }

    return true;
  };

  const validatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(validatePasswordStrength(newPassword));
  };

  const getStrengthColor = () => {
    if (passwordStrength < 2) return 'bg-red-500';
    if (passwordStrength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength < 2) return 'Lemah';
    if (passwordStrength < 4) return 'Sedang';
    return 'Kuat';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      showToast.success('Password berhasil diubah! Mengalihkan ke halaman login...');
      
      // Sign out to clear the recovery session
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push('/authentication/login');
      }, 2000);
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = error.message || 'Terjadi kesalahan saat mengatur ulang password';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading screen while checking token
  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Memvalidasi link reset password...</p>
        </div>
      </div>
    );
  }

  // Invalid token screen
  if (!validToken) {
    return (
      <>
        <Toast />
        <motion.div 
          className="min-h-screen flex bg-gradient-to-br from-red-500 to-pink-700 relative"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Head>
            <title>Link Tidak Valid | Makhrojul Huruf</title>
            <meta name="description" content="Link reset password tidak valid atau sudah kedaluwarsa" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <div className="w-full flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Link Tidak Valid</h2>
              <p className="text-gray-600 mb-6">
                Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link reset password yang baru.
              </p>
              <div className="space-y-3">
                <Link
                  href="/authentication/forgot-password"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block"
                >
                  Minta Link Reset Baru
                </Link>
                <Link
                  href="/authentication/login"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block"
                >
                  Kembali ke Login
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <Toast />
      <motion.div 
        className="min-h-screen flex bg-gradient-to-br from-indigo-500 to-purple-700 relative"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <AuthTabs currentPage="reset-password" />

        <Head>
          <title>Reset Password | Makhrojul Huruf</title>
          <meta name="description" content="Buat password baru yang kuat untuk akun Anda" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Kolom Kiri - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <motion.div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mx-2 my-4 lg:mx-4 lg:my-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {success ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Password Berhasil Diubah!</h2>
                <p className="text-gray-600 mb-6">
                  Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login dalam beberapa detik.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
                  <p className="text-gray-600">Buat password baru yang kuat untuk mengamankan akun Anda</p>
                </div>

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

                {/* Security Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Keamanan Password</h4>
                      <p className="text-sm text-yellow-700">Jika Anda tidak meminta reset ini, segera hubungi tim support kami.</p>
                    </div>
                  </div>
                </div>

                <motion.form
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleSubmit}
                >
                  {/* Password Field */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full px-4 py-2.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          error && error.includes('password') || error.includes('Password')
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="Masukkan password baru (min. 8 karakter)"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        autoComplete="new-password"
                        minLength={8}
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
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Kekuatan Password:</span>
                          <span className={`font-medium ${passwordStrength < 2 ? 'text-red-600' : passwordStrength < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {getStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`} style={{width: `${(passwordStrength / 5) * 100}%`}}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Konfirmasi Password Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`w-full px-4 py-2.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          error && error.includes('cocok') || error.includes('konfirmasi')
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="Konfirmasi password baru"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        required
                        autoComplete="new-password"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
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

                  {/* Security Tips */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      Tips Keamanan Password
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-600">
                      <li className="flex items-start">
                        <svg className="w-3 h-3 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol
                      </li>
                      <li className="flex items-start">
                        <svg className="w-3 h-3 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Minimal 8 karakter, lebih panjang lebih baik
                      </li>
                      <li className="flex items-start">
                        <svg className="w-3 h-3 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Jangan gunakan informasi pribadi yang mudah ditebak
                      </li>
                    </ul>
                  </div>

                  <motion.button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-medium flex justify-center items-center transition-all duration-200 ${
                      loading || passwordStrength < 3
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200'
                    } text-white`}
                    variants={buttonVariants}
                    whileHover={!loading && passwordStrength >= 3 ? "hover" : {}}
                    whileTap={!loading && passwordStrength >= 3 ? "tap" : {}}
                    disabled={loading || passwordStrength < 3}
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
                      'Reset Password'
                    )}
                  </motion.button>
                </motion.form>
              </>
            )}

            {/* Back to Login */}
            <div className="text-center mt-6">
              <Link 
                href="/authentication/login" 
                className="text-gray-500 hover:text-indigo-600 text-sm hover:underline inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Kembali ke Login
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Kolom Kanan - Visual */}
        <motion.div 
          className="hidden lg:flex lg:w-1/2 p-8 flex-col justify-between"
          initial="hidden"
          animate="visible"
          variants={illustrationVariants}
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-6">Keamanan Akun Terjamin</h1>
            <p className="text-indigo-100 text-lg mb-8">
              Kami menggunakan enkripsi tingkat enterprise untuk melindungi data dan password Anda. 
              Dengan sistem reset password yang aman, akun Anda selalu terlindungi.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-indigo-100">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Enkripsi AES-256 untuk semua data
              </div>
              <div className="flex items-center text-indigo-100">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Verifikasi melalui email yang aman
              </div>
              <div className="flex items-center text-indigo-100">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Monitoring keamanan 24/7
              </div>
            </div>
            
            {/* Ilustrasi */}
            <div className="relative h-80 w-full flex items-center justify-center">
              <motion.div 
                className="text-center"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut" 
                }}
              >
                {/* SVG Ilustrasi Security */}
                <svg 
                  className="w-64 h-64 mx-auto" 
                  viewBox="0 0 400 400" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Circle */}
                  <circle cx="200" cy="200" r="180" fill="rgba(255,255,255,0.1)" />
                  
                  {/* Shield */}
                  <path d="M200 80 L160 100 L160 180 Q160 220 200 240 Q240 220 240 180 L240 100 Z" fill="white" />
                  <path d="M200 90 L170 105 L170 175 Q170 205 200 220 Q230 205 230 175 L230 105 Z" fill="#6366F1" />
                  
                  {/* Lock */}
                  <rect x="185" y="160" width="30" height="25" rx="4" fill="white" />
                  <circle cx="200" cy="150" r="8" fill="none" stroke="white" strokeWidth="3" />
                  <circle cx="200" cy="172" r="2" fill="#6366F1" />
                  
                  {/* Key */}
                  <rect x="250" y="280" width="60" height="8" rx="4" fill="white" />
                  <rect x="300" y="270" width="20" height="30" rx="10" fill="white" />
                  <rect x="305" y="275" width="5" height="5" fill="#6366F1" />
                  <rect x="305" y="285" width="5" height="5" fill="#6366F1" />
                  
                  {/* Decorative Elements */}
                  <circle cx="100" cy="120" r="6" fill="rgba(255,255,255,0.6)" />
                  <circle cx="320" cy="140" r="4" fill="rgba(255,255,255,0.4)" />
                  <circle cx="80" cy="320" r="8" fill="rgba(255,255,255,0.5)" />
                  <circle cx="340" cy="300" r="5" fill="rgba(255,255,255,0.3)" />
                </svg>
                
                <div className="mt-4">
                  <div className="text-white text-lg font-medium">Password Aman</div>
                  <div className="text-indigo-100 text-sm">Lindungi akun dengan password yang kuat</div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="text-indigo-100 text-sm">
            <p>© {new Date().getFullYear()} Makhrojul Huruf. Semua hak dilindungi.</p>
            <p className="text-xs mt-1">Link reset password akan kedaluwarsa dalam 1 jam untuk keamanan Anda.</p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export const getServerSideProps = async (context) => {
  return {
    props: {}
  };
};
        