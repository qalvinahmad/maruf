import { Toast, showToast } from '@/components/ui/toast';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

export default function MagicLinkCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleMagicLinkAuth = async () => {
      try {
        // Check if we have a hash from the URL
        const hash = window.location.hash;
        if (!hash) {
          throw new Error('No authentication code found in URL');
        }

        showToast.info('Memverifikasi magic link...');
        
        // Get access token from hash
        const accessToken = hash.substring(1).split('&')[0].split('=')[1];
        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Try to get user session
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        if (error) throw error;

        if (user) {
          // Create or update user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              username: user.email.split('@')[0],
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (profileError) throw profileError;

          // Store user data
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', profile.username);
          localStorage.setItem('userEmail', user.email);
          localStorage.setItem('userId', user.id);
          localStorage.setItem('userRole', profile.role || 'user');

          showToast.success('Login berhasil! Mengalihkan ke dashboard...');
          
          // Redirect to dashboard after short delay
          setTimeout(() => {
            router.push('/dashboard/home/Dashboard');
          }, 1500);
        }
      } catch (error) {
        console.error('Magic link error:', error);
        setError(error.message);
        showToast.error('Gagal memverifikasi magic link');
      } finally {
        setIsProcessing(false);
      }
    };

    handleMagicLinkAuth();
  }, [router]);

  return (
    <>
      <Toast />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-6"
              >
                <FiLoader className="w-full h-full text-secondary" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Memverifikasi Magic Link
              </h2>
              <p className="text-gray-600">
                Mohon tunggu sebentar, kami sedang memproses autentikasi Anda...
              </p>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-2xl">×</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verifikasi Gagal
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/authentication/login')}
                className="bg-secondary text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kembali ke Login
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verifikasi Berhasil
              </h2>
              <p className="text-gray-600">
                Mengalihkan ke dashboard...
              </p>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
