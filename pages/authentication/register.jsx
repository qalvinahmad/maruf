import { AuthTabs } from '@/components/AuthTabs';
import CloudflareTurnstile from '@/components/CloudflareTurnstile';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Toast, showToast } from '../../components/ui/toast';
import { useAuth } from '../../context/AuthContext';

// Use same animations as login page
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

// Animasi untuk password validation
const validationVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: 'auto',
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    } 
  },
  exit: { 
    opacity: 0, 
    height: 0,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    } 
  }
};

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [cloudflareToken, setCloudflareToken] = useState('');
  const [cloudflareVerified, setCloudflareVerified] = useState(false);
  const [turnstileLoading, setTurnstileLoading] = useState(true);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
    noPersonalInfo: true,
    unique: true
  });

  // Turnstile handlers with useCallback to prevent re-renders
  const handleTurnstileVerify = useCallback(async (token) => {
    console.log('Turnstile token received:', token);
    
    // Handle development mode token
    if (token.startsWith('dev_token_')) {
      console.log('Development mode verification');
      setCloudflareToken(token);
      setCloudflareVerified(true);
      showToast.success('Verifikasi keamanan berhasil! (Mode Pengembangan)');
      return;
    }
    
    try {
      // Verify token with our API
      const response = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      const result = await response.json();
      
      if (result.success) {
        setCloudflareToken(token);
        setCloudflareVerified(true);
        showToast.success('Verifikasi keamanan berhasil!');
      } else {
        setCloudflareVerified(false);
        showToast.error(result.error || 'Verifikasi keamanan gagal');
      }
    } catch (error) {
      console.error('Error verifying turnstile:', error);
      setCloudflareVerified(false);
      showToast.error('Gagal memverifikasi keamanan');
    }
  }, []); // Empty dependency array to prevent recreating

  const handleTurnstileExpire = useCallback(() => {
    console.log('Turnstile token expired');
    setCloudflareToken('');
    setCloudflareVerified(false);
    showToast.warning('Verifikasi keamanan kedaluwarsa, silakan verifikasi ulang');
  }, []);

  const handleTurnstileError = useCallback((error) => {
    console.error('Turnstile error:', error);
    setCloudflareVerified(false);
    showToast.error('Terjadi kesalahan pada verifikasi keamanan');
  }, []);

  const handleTurnstileLoad = useCallback(() => {
    setTurnstileLoading(false);
  }, []);

  // Check if password contains personal information
  const containsPersonalInfo = useCallback((pwd) => {
    const lowerPwd = pwd.toLowerCase();
    const lowerName = fullName.toLowerCase();
    const lowerEmail = email.toLowerCase().split('@')[0];
    
    // Check if password contains name or email username
    if (lowerName && lowerPwd.includes(lowerName)) return true;
    if (lowerEmail && lowerPwd.includes(lowerEmail)) return true;
    
    // Check for common personal info patterns
    const commonPatterns = [
      /\b(123|password|admin|user|login)\b/i,
      /\b(19|20)\d{2}\b/, // Years
      /\b(0[1-9]|[12]\d|3[01])\b/, // Days
    ];
    
    return commonPatterns.some(pattern => pattern.test(pwd));
  }, [fullName, email]);

  // Password validation function
  const validatePassword = useCallback((pwd) => {
    const validation = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      noPersonalInfo: !containsPersonalInfo(pwd),
      unique: true // This would be checked against database in real implementation
    };

    setPasswordValidation(validation);
    return validation;
  }, [containsPersonalInfo]);

  // Handle password change
  const handlePasswordChange = useCallback((e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setError('');
    
    if (newPassword.length > 0) {
      setShowPasswordValidation(true);
      validatePassword(newPassword);
    } else {
      setShowPasswordValidation(false);
    }
  }, [validatePassword]);

  // Enhanced form validation
  const validateForm = useCallback(() => {
    if (!fullName.trim()) {
      const errorMsg = 'Nama lengkap tidak boleh kosong';
      setError(errorMsg);
      return false;
    }
    
    if (!email.trim()) {
      const errorMsg = 'Email tidak boleh kosong';
      setError(errorMsg);
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      const errorMsg = 'Format email tidak valid';
      setError(errorMsg);
      return false;
    }
    
    if (!password.trim()) {
      const errorMsg = 'Password tidak boleh kosong';
      setError(errorMsg);
      return false;
    }
    
    // Check all password validation criteria
    const validation = validatePassword(password);
    if (!validation.length) {
      const errorMsg = 'Password minimal 8 karakter';
      setError(errorMsg);
      return false;
    }
    
    if (!validation.uppercase) {
      const errorMsg = 'Password harus mengandung huruf besar';
      setError(errorMsg);
      return false;
    }
    
    if (!validation.number) {
      const errorMsg = 'Password harus mengandung angka';
      setError(errorMsg);
      return false;
    }
    
    if (!validation.special) {
      const errorMsg = 'Password harus mengandung karakter khusus';
      setError(errorMsg);
      return false;
    }
    
    if (!validation.noPersonalInfo) {
      const errorMsg = 'Password tidak boleh mengandung informasi pribadi';
      setError(errorMsg);
      return false;
    }

    if (password !== confirmPassword) {
      const errorMsg = 'Password tidak cocok';
      setError(errorMsg);
      return false;
    }

    if (!cloudflareVerified) {
      const errorMsg = 'Silakan verifikasi Cloudflare terlebih dahulu';
      setError(errorMsg);
      return false;
    }
    
    return true;
  }, [fullName, email, password, confirmPassword, cloudflareVerified, validatePassword]);

  // Enhanced error handling
  const getErrorMessage = (error) => {
    switch (error.message) {
      case 'User already registered':
        return 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      case 'Invalid email':
        return 'Format email tidak valid. Silakan masukkan email yang benar.';
      case 'Weak password':
        return 'Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.';
      case 'Email already exists':
        return 'Email sudah terdaftar. Silakan gunakan email lain.';
      case 'Signup rate limit exceeded':
        return 'Terlalu banyak percobaan registrasi. Silakan tunggu beberapa menit.';
      default:
        return error.message || 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
    }
  };

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
      const cleanFullName = fullName.trim();

      const result = await signUp(cleanEmail, cleanPassword, cleanFullName, cloudflareToken);
      
      if (result.success) {
        showToast.success('Registrasi berhasil! Silakan cek email untuk verifikasi.');
        
        if (result.needsVerification) {
          setTimeout(() => {
            router.push('/authentication/login');
          }, 2000);
        } else {
          showToast.success('Akun berhasil dibuat! Mengalihkan ke dashboard...');
          setTimeout(() => {
            router.push('/dashboard/home/Dashboard');
          }, 1000);
        }
      }

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast />
      <motion.div 
        className="min-h-screen flex bg-gradient-to-br from-blue-500 to-blue-700 relative"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <AuthTabs currentPage="register" />

        <Head>
          <title>Daftar Akun | Makhrojul Huruf</title>
          <meta name="description" content="Daftarkan akun pembelajaran makhrojul huruf Anda" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Kolom Kiri - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <motion.div
            className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-16 mx-2 my-4 lg:mx-4 lg:my-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Daftar Akun</h2>
              <p className="text-gray-600">Isi form di bawah untuk membuat akun baru</p>
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
              {/* Full Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    error && (error.includes('nama') || error.includes('Nama'))
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama lengkap Anda"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError('');
                    // Re-validate password when name changes
                    if (password) {
                      validatePassword(password);
                    }
                  }}
                  required
                  autoComplete="name"
                />
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    error && (error.includes('email') || error.includes('Email'))
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    // Re-validate password when email changes
                    if (password) {
                      validatePassword(password);
                    }
                  }}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-2.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      error && (error.includes('password') || error.includes('Password'))
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Masukkan password yang kuat"
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

                {/* Password Validation */}
                <AnimatePresence>
                  {showPasswordValidation && (
                    <motion.div
                      className="mt-3 p-3 bg-gray-50 rounded-lg border"
                      variants={validationVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <p className="text-sm font-medium text-gray-700 mb-2">Syarat password:</p>
                      <div className="space-y-1">
                        <motion.div 
                          className={`flex items-center text-sm ${passwordValidation.length ? 'text-green-600' : 'text-red-500'}`}
                          animate={{ scale: passwordValidation.length ? [1, 1.05, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordValidation.length ? (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          Minimal 8 karakter
                        </motion.div>
                        
                        <motion.div 
                          className={`flex items-center text-sm ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-500'}`}
                          animate={{ scale: passwordValidation.uppercase ? [1, 1.05, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordValidation.uppercase ? (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          Mengandung huruf besar (A-Z)
                        </motion.div>
                        
                        <motion.div 
                          className={`flex items-center text-sm ${passwordValidation.number ? 'text-green-600' : 'text-red-500'}`}
                          animate={{ scale: passwordValidation.number ? [1, 1.05, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordValidation.number ? (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          Mengandung angka (0-9)
                        </motion.div>
                        
                        <motion.div 
                          className={`flex items-center text-sm ${passwordValidation.special ? 'text-green-600' : 'text-red-500'}`}
                          animate={{ scale: passwordValidation.special ? [1, 1.05, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordValidation.special ? (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          Mengandung karakter khusus (!@#$%^&*)
                        </motion.div>
                        
                        <motion.div 
                          className={`flex items-center text-sm ${passwordValidation.noPersonalInfo ? 'text-green-600' : 'text-red-500'}`}
                          animate={{ scale: passwordValidation.noPersonalInfo ? [1, 1.05, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {passwordValidation.noPersonalInfo ? (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          Tidak mengandung informasi pribadi
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full px-4 py-2.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      error && (error.includes('cocok') || error.includes('konfirmasi'))
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Konfirmasi password Anda"
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

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <motion.div
                    className={`mt-2 flex items-center text-sm ${
                      password === confirmPassword ? 'text-green-600' : 'text-red-500'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {password === confirmPassword ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Password cocok
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Password tidak cocok
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Cloudflare Turnstile */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Verifikasi Keamanan <span className="text-red-500">*</span>
                </label>
                
                <CloudflareTurnstile
                  onVerify={handleTurnstileVerify}
                  onExpire={handleTurnstileExpire}
                  onError={handleTurnstileError}
                  onLoad={handleTurnstileLoad}
                  theme="light"
                  size="normal"
                  language="id"
                  className="w-full"
                  disabled={loading}
                />
                
                {cloudflareVerified && (
                  <motion.div
                    className="mt-2 flex items-center text-sm text-green-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verifikasi keamanan berhasil
                  </motion.div>
                )}
                
                {!cloudflareVerified && !turnstileLoading && (
                  <motion.div
                    className="mt-2 flex items-center text-sm text-orange-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Silakan selesaikan verifikasi keamanan
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={`w-full py-3 rounded-lg font-medium flex justify-center items-center transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
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
                    Mendaftar...
                  </>
                ) : (
                  'Daftar Akun'
                )}
              </motion.button>
            </motion.form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <Link 
                  href="/authentication/login" 
                  className="text-blue-600 font-medium hover:text-blue-800 hover:underline inline-block"
                >
                  <motion.span whileHover={{ scale: 1.05 }}>
                    Masuk sekarang
                  </motion.span>
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-3">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-blue-600 text-sm hover:underline transition-colors"
              >
                ← Kembali ke Beranda
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Dengan mendaftar, Anda menyetujui{' '}
                <Link href="/footer/terms" className="text-blue-600 hover:underline">
                  Syarat & Ketentuan
                </Link>
                {' '}dan{' '}
                <Link href="/footer/privacy" className="text-blue-600 hover:underline">
                  Kebijakan Privasi
                </Link>
                {' '}kami.
              </p>
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
            <h1 className="text-4xl font-bold text-white mb-6">Bergabunglah dengan Kami</h1>
            <p className="text-blue-100 text-lg mb-8">
              Daftarkan diri Anda untuk memulai perjalanan pembelajaran makhrojul huruf yang menarik dan interaktif.
            </p>
            
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
                {/* SVG Ilustrasi Register */}
                <svg 
                  className="w-64 h-64 mx-auto" 
                  viewBox="0 0 400 400" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Circle */}
                  <circle cx="200" cy="200" r="180" fill="rgba(255,255,255,0.1)" />
                  
                  {/* Person */}
                  <circle cx="200" cy="150" r="30" fill="white" />
                  <rect x="170" y="180" width="60" height="80" rx="30" fill="white" />
                  
                  {/* Laptop */}
                  <rect x="150" y="250" width="100" height="60" rx="8" fill="white" />
                  <rect x="155" y="255" width="90" height="45" rx="4" fill="#00acee" />
                  <rect x="160" y="260" width="80" height="35" rx="2" fill="white" />
                  
                  {/* Form Lines */}
                  <rect x="170" y="270" width="60" height="3" rx="1.5" fill="#00acee" />
                  <rect x="170" y="280" width="45" height="3" rx="1.5" fill="#00acee" />
                  <rect x="170" y="290" width="50" height="3" rx="1.5" fill="#00acee" />
                  
                  {/* Security Shield */}
                  <g transform="translate(320, 60)">
                    <path d="M0 15 L15 0 L30 15 L15 30 Z" fill="rgba(255,255,255,0.8)" />
                    <path d="M10 15 L13 18 L20 11" stroke="#00acee" strokeWidth="2" fill="none" />
                  </g>
                  
                  {/* Password Strength Indicator */}
                  <g transform="translate(60, 200)">
                    <rect x="0" y="0" width="30" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                    <rect x="0" y="8" width="25" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                    <rect x="0" y="16" width="35" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                  </g>
                  
                  {/* Decorative Elements */}
                  <circle cx="100" cy="100" r="8" fill="rgba(255,255,255,0.6)" />
                  <circle cx="320" cy="120" r="6" fill="rgba(255,255,255,0.4)" />
                  <circle cx="80" cy="300" r="10" fill="rgba(255,255,255,0.5)" />
                  <circle cx="340" cy="280" r="7" fill="rgba(255,255,255,0.3)" />
                  
                  {/* Floating Icons */}
                  <g transform="translate(300, 200)">
                    <circle cx="0" cy="0" r="12" fill="rgba(255,255,255,0.2)" />
                    <path d="M-6 -2 L-2 2 L6 -6" stroke="white" strokeWidth="2" fill="none" />
                  </g>
                </svg>
                
                <div className="mt-6">
                  <div className="text-white text-lg font-medium">Mulai Perjalanan Belajar</div>
                  <div className="text-blue-100 text-sm">Daftar dengan keamanan tingkat tinggi</div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="text-blue-100 text-sm">
            <p>© {new Date().getFullYear()} Makhrojul Huruf. Semua hak dilindungi.</p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// Replace getStaticProps with getServerSideProps for better SEO
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
