import { AuthTabs } from '@/components/AuthTabs';
import { Toast, showToast } from '@/components/ui/toast';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showToast.info('Memproses permintaan reset password...');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/authentication/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      showToast.success('Link reset password telah dikirim ke email Anda');
    } catch (error) {
      console.error('Error:', error);
      showToast.error(error.message || 'Terjadi kesalahan saat memproses permintaan');
    } finally {
      setLoading(false);
    }
  };

  // Success screen after email is sent
  const SuccessScreen = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        <FiMail className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Cek Email Anda</h2>
      <p className="text-gray-600 mb-6">
        Kami telah mengirim link reset password ke <strong>{email}</strong>
      </p>
      <div className="space-y-4">
        <button
          onClick={() => window.open('https://mail.google.com', '_blank')}
          className="w-full bg-secondary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Buka Gmail
        </button>
        <button
          onClick={() => router.push('/authentication/login')}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Toast />
      <motion.div 
        className="min-h-screen flex bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <AuthTabs currentPage="forgot-password" />
        
        <Head>
          <title>Lupa Password | Belajar Makhrojul Huruf</title>
        </Head>

        <div className="w-full flex items-center justify-center p-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {!emailSent ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Lupa Password?</h2>
                  <p className="text-gray-600">
                    Masukkan email Anda dan kami akan mengirimkan link untuk reset password
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Masukkan email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full bg-secondary text-white py-3 rounded-lg font-medium disabled:opacity-70"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Memproses...' : 'Reset Password'}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => router.push('/authentication/login')}
                    className="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Kembali ke Login
                  </button>
                </form>
              </>
            ) : (
              <SuccessScreen />
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
