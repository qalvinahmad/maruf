import ClientOnly from '@/components/ClientOnly';
import { Toast, showToast } from '@/components/ui/toast';
import { IconArrowLeft, IconMessageHeart, IconSend } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import HeaderTeacher from '../../../components/layout/HeaderTeacher';

export default function CreateMessageBackup() {
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
      router.push('/authentication/login');
      return;
    }
    
    setUserName(localStorage.getItem('userName') || 'User');
  }, [router]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Handle submit logic here
      showToast.success('Pesan berhasil disimpan');
      router.back();
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Gagal menyimpan pesan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  if (!userName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen">
        <Head>
          <title>Buat Pesan Baru (Backup) • Makhrojul Huruf</title>
          <meta name="description" content="Backup version - Buat pesan, polling, atau bagikan media" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Toast />

        <HeaderTeacher 
          userName={userName}
          profileData={userProfile}
          onLogout={handleLogout}
          onProfileUpdate={(updatedProfile) => {
            setUserProfile(updatedProfile);
            setUserName(updatedProfile.full_name || 'User');
          }}
        />

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.back()}
                  className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <IconArrowLeft size={20} className="text-gray-600" />
                </motion.button>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <IconMessageHeart size={28} className="text-pink-500" />
                    Buat Pesan Baru (Backup)
                  </h1>
                  <p className="text-gray-600 mt-1">Versi backup dari form pembuatan pesan</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="text-center py-12">
                <IconMessageHeart size={64} className="mx-auto text-pink-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Backup Version</h3>
                <p className="text-gray-600 mb-4">
                  Ini adalah versi backup dari halaman pembuatan pesan.
                </p>
                <p className="text-sm text-gray-500">
                  File ini dibuat untuk mengatasi masalah build. Gunakan versi utama untuk functionality lengkap.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Kembali
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/dashboard/message/CreateMessage')}
                  className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl"
                >
                  <IconSend size={18} />
                  Gunakan Versi Utama
                </motion.button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ClientOnly>
  );
}
