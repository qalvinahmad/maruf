import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { showToast, Toast } from '../../../components/ui/toast';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function LoginTeacher() {
  const router = useRouter();
  const { signInAsTeacher, user, isTeacher, isAuthenticated, loading, teacherProfile } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    teacherCode: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // EMERGENCY: Clear localStorage if stuck in loop
  const clearAll = () => {
    console.log('EMERGENCY: Clearing all localStorage and sessionStorage...');
    localStorage.clear();
    sessionStorage.clear();
    showToast.success('All data cleared! Reloading page...');
    setTimeout(() => window.location.reload(), 1000);
  };

  // EMERGENCY: Clear specific auth data
  const clearAuthOnly = () => {
    console.log('EMERGENCY: Clearing auth data only...');
    const authKeys = ['isLoggedIn', 'isTeacher', 'teacherId', 'teacherEmail', 'teacherName', 'teacherInstitution', 'userName', 'userEmail', 'userId', 'isAdmin'];
    authKeys.forEach(key => localStorage.removeItem(key));
    showToast.success('Auth data cleared! Page should stop looping.');
  };

  // TEMPORARILY DISABLED - Will re-enable once loop is confirmed stopped
  // Simple redirect check - only run once on mount
  /*
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isTeacherLocal = localStorage.getItem('isTeacher') === 'true';
    
    if (isLoggedIn && isTeacherLocal && !redirecting) {
      console.log('Teacher already logged in, redirecting to dashboard...');
      setRedirecting(true);
      setTimeout(() => {
        window.location.href = '/dashboard/teacher/DashboardStats';
      }, 100);
    }
  }, []); // Empty dependency array - only run once on mount
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting teacher login for:', formData.email);
      
      // Validate teacher code first
      if (formData.teacherCode !== 'T123') {
        throw new Error('Kode guru tidak valid. Gunakan kode: T123');
      }

      // Check teacher verification status first
      const { data: verificationData, error: verificationError } = await supabase
        .from('teacher_verifications')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (verificationError || !verificationData) {
        console.error('Teacher verification check failed:', verificationError);
        throw new Error('Email tidak terdaftar sebagai guru. Silakan daftar terlebih dahulu.');
      }

      // Check verification status
      if (verificationData.status === 'pending') {
        showToast.warning('Akun Anda masih dalam proses verifikasi admin. Silakan tunggu konfirmasi.');
        throw new Error('Akun Anda masih dalam proses verifikasi admin. Silakan tunggu konfirmasi.');
      }

      if (verificationData.status === 'rejected') {
        showToast.error('Akun Anda ditolak oleh admin. Silakan hubungi administrator.');
        throw new Error('Akun Anda ditolak oleh admin. Silakan hubungi administrator.');
      }

      if (verificationData.status !== 'verified') {
        showToast.error('Status verifikasi tidak valid. Silakan hubungi administrator.');
        throw new Error('Status verifikasi tidak valid. Silakan hubungi administrator.');
      }

      // Proceed with authentication
      const result = await signInAsTeacher(formData.email, formData.password, formData.teacherCode);
      
      if (result.success) {
        console.log('Teacher login successful, redirecting immediately...');
        showToast.success('Login berhasil! Selamat datang kembali.');
        
        // Set redirecting state to prevent other effects
        setRedirecting(true);
        
        // Immediate redirect - no delay
        window.location.href = '/dashboard/teacher/DashboardStats';
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // More specific error handling
      let errorMessage = 'Terjadi kesalahan saat login';
      
      if (error.message.includes('Kode guru tidak valid')) {
        errorMessage = 'Kode guru tidak valid. Gunakan kode: T123';
        showToast.error(errorMessage);
      } else if (error.message.includes('Email atau password salah') || error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah';
        showToast.error(errorMessage);
      } else if (error.message.includes('masih dalam proses verifikasi')) {
        errorMessage = 'Akun Anda masih dalam proses verifikasi admin. Silakan tunggu konfirmasi.';
        // Toast already shown above
      } else if (error.message.includes('ditolak oleh admin')) {
        errorMessage = 'Akun Anda ditolak oleh admin. Silakan hubungi administrator.';
        // Toast already shown above
      } else if (error.message.includes('tidak terdaftar sebagai guru')) {
        errorMessage = 'Email tidak terdaftar sebagai guru atau belum mengajukan verifikasi.';
        showToast.error(errorMessage);
      } else if (error.message.includes('Email belum diverifikasi')) {
        errorMessage = 'Email belum diverifikasi. Silakan cek email Anda.';
        showToast.error(errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
        // Only show toast if not already shown above
        if (!error.message.includes('verifikasi') && !error.message.includes('ditolak')) {
          showToast.error(errorMessage);
        }
      } else {
        showToast.error(errorMessage);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Head>
        <title>Login Guru - Shine</title>
        <meta name="description" content="Masuk ke akun guru Anda" />
      </Head>

      <Toast />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Login Guru
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Masuk ke akun guru Anda untuk mengakses dashboard
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            {/* Emergency Controls - visible at top */}
            <div className="mb-6 p-4 border-2 border-red-200 rounded-lg bg-red-50">
              <h3 className="text-sm font-bold text-red-700 mb-3">🚨 Emergency Controls</h3>
              <p className="text-xs text-red-600 mb-3">Use these if the page is stuck in an infinite loop:</p>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={clearAuthOnly}
                  className="w-full bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 transition-colors text-sm font-bold"
                >
                  🆘 Clear Auth Data (Stop Loop)
                </button>
                
                <button
                  type="button"
                  onClick={clearAll}
                  className="w-full bg-red-700 text-white py-2 px-3 rounded hover:bg-red-800 transition-colors text-sm font-bold"
                >
                  💥 Clear All & Reload
                </button>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Guru
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="masukkan email guru"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="masukkan password"
                />
              </div>

              <div>
                <label htmlFor="teacherCode" className="block text-sm font-medium text-gray-700">
                  Kode Guru
                </label>
                <input
                  id="teacherCode"
                  name="teacherCode"
                  type="text"
                  required
                  value={formData.teacherCode}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="T123"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Gunakan kode: <span className="font-mono font-semibold">T123</span>
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || redirecting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </>
                  ) : redirecting ? (
                    'Mengarahkan ke Dashboard...'
                  ) : (
                    'Masuk sebagai Guru'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Belum punya akun guru?{' '}
                  <button
                    type="button"
                    onClick={() => window.location.href = '/authentication/teacher/registerTeacher'}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Daftar di sini
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </>
  );
}
