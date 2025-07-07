import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Verification() {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const handleVerification = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user?.email_confirmed_at) {
          setVerified(true);
          setTimeout(() => {
            router.replace('/authentication/login');
          }, 3000);
        }
      } catch (err) {
        setError('Verifikasi gagal. Silakan coba lagi atau hubungi dukungan.');
      }
    };

    handleVerification();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head>
        <title>Verifikasi Email | Makruf</title>
      </Head>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : verified ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Terverifikasi!</h2>
            <p className="text-gray-600 mb-4">
              Mengalihkan ke halaman login...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Memverifikasi Email</h2>
            <p className="text-gray-600">
              Mohon tunggu sebentar...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  return {
    props: {}
  };
};
