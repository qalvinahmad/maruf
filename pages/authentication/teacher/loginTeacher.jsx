import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function LoginTeacher() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    teacherCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Emergency stop function
  const stopRedirectLoop = () => {
    setLoading(false);
    setRedirecting(false);
    setHasCheckedAuth(true);
    // Clear any stored auth data
    localStorage.removeItem('isTeacher');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('teacherEmail');
    localStorage.removeItem('teacherName');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('userId');
    localStorage.removeItem('teacherInstitution');
    sessionStorage.clear();
  };

  // Check if teacher is already logged in
  useEffect(() => {
    if (hasCheckedAuth) return; // Prevent re-execution
    
    const checkExistingAuth = async () => {
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const isTeacher = localStorage.getItem('isTeacher') === 'true';
        const teacherEmail = localStorage.getItem('teacherEmail');
        
        if (isLoggedIn && isTeacher && teacherEmail) {
          setRedirecting(true);
          setTimeout(() => {
            window.location.replace('/dashboard/teacher/DashboardStats');
          }, 1000);
        } else {
          setHasCheckedAuth(true);
        }
      } catch (error) {
        setHasCheckedAuth(true);
      }
    };

    checkExistingAuth();
  }, [hasCheckedAuth]); // Only depend on hasCheckedAuth

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First check teacher code
      if (formData.teacherCode !== 'T123') {
        throw new Error('Kode guru tidak valid');
      }

      // Check verification and profile status together
      const [{ data: verificationData }, { data: profileData }] = await Promise.all([
        supabase
          .from('teacher_verifications')
          .select('*')
          .eq('email', formData.email.trim())
          .eq('status', 'verified')
          .single(),
        supabase
          .from('teacher_profiles')
          .select('*')
          .eq('email', formData.email.trim())
          .single()
      ]);

      if (!verificationData) {
        throw new Error('Akun belum diverifikasi oleh admin');
      }

      if (!profileData) {
        throw new Error('Profil guru tidak ditemukan. Silakan hubungi admin.');
      }

      // Then try to authenticate
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      // Store session data
      localStorage.setItem('isTeacher', 'true');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', authData.user.id);
      localStorage.setItem('teacherId', profileData.id);
      localStorage.setItem('teacherEmail', profileData.email);
      localStorage.setItem('teacherName', profileData.full_name);
      localStorage.setItem('teacherInstitution', profileData.institution);

      setRedirecting(true);
      setTimeout(() => {
        window.location.href = '/dashboard/teacher/DashboardStats';
      }, 1000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login Guru | Makruf</title>
      </Head>

      {/* Loading Overlay with Emergency Stop */}
      {(loading || redirecting) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-900 font-medium">
                {redirecting ? 'Mengarahkan ke Dashboard...' : 'Memuat...'}
              </span>
            </div>
            {(loading || redirecting) && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Stuck in loading? Click below to reset
                </p>
                <button
                  onClick={stopRedirectLoop}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  🔄 Reset & Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <motion.div
        className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 flex items-center justify-center p-4"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Login Guru</h1>
          <p className="text-gray-600 mt-2">Login sebagai pengajar</p>
        </div>

        {error && (
          <motion.div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Guru
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Masukkan email guru"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Masukkan password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode Guru
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.teacherCode}
              onChange={(e) => setFormData({...formData, teacherCode: e.target.value})}
              placeholder="Masukkan kode guru"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/authentication/login')}
            className="text-blue-600 hover:underline text-sm"
          >
            Kembali ke login user
          </button>
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
