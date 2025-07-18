import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { showToast, Toast } from '../../../components/ui/toast';
import { supabase } from '../../../lib/supabaseClient';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function RegisterTeacher() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    teachingExperience: '',
    institution: '',
    specialization: '',
    certifications: '',
    credentials: {
      education: '',
      certifications: [],
      teaching_experience: '',
      specializations: []
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let createdUser = null;

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Password dan konfirmasi password tidak cocok');
      }

      // Validate password strength
      if (formData.password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      // Check if verification already exists
      const { data: existingVerification, error: checkError } = await supabase
        .from('teacher_verifications')
        .select('email, status')
        .eq('email', formData.email.trim())
        .single();

      if (existingVerification && !checkError) {
        if (existingVerification.status === 'pending') {
          showToast.warning('Email ini sudah mengajukan verifikasi dan sedang menunggu persetujuan admin.');
          throw new Error('Email ini sudah mengajukan verifikasi dan sedang menunggu persetujuan admin.');
        } else if (existingVerification.status === 'verified') {
          showToast.info('Email ini sudah terverifikasi. Silakan langsung login.');
          // Don't throw error, instead redirect to login
          setTimeout(() => {
            router.push('/authentication/teacher/loginTeacher');
          }, 2000);
          return; // Exit the function
        } else if (existingVerification.status === 'rejected') {
          showToast.error('Email ini pernah ditolak verifikasinya. Silakan hubungi administrator.');
          throw new Error('Email ini pernah ditolak verifikasinya. Silakan hubungi administrator.');
        }
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'teacher'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
        }
        throw signUpError;
      }
      
      if (!authData?.user?.id) {
        throw new Error('Gagal membuat akun pengguna');
      }

      createdUser = authData.user;

      // Create verification record
      const { error: verificationError } = await supabase
        .from('teacher_verifications')
        .insert([{
          id: createdUser.id,
          full_name: formData.fullName,
          email: formData.email.trim(),
          institution: formData.institution,
          registration_date: new Date().toISOString(),
          status: 'pending',
          credentials: {
            education: formData.credentials.education,
            teaching_experience: formData.teachingExperience,
            specializations: [formData.specialization],
            certifications: formData.certifications || ''
          }
        }]);

      if (verificationError) {
        console.error('Verification error:', verificationError);
        throw new Error('Gagal menyimpan data verifikasi');
      }

      // Create teacher profile (but not verified yet)
      const { error: profileError } = await supabase
        .from('teacher_profiles')
        .insert([{
          id: createdUser.id,
          email: formData.email.trim(),
          full_name: formData.fullName,
          teaching_experience: formData.teachingExperience,
          institution: formData.institution,
          specialization: formData.specialization,
          certifications: formData.certifications || '',
          is_verified: false,
          status: 'pending'
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the registration for this, as verification record is more important
      }

      // Sign out the user as they need to wait for verification
      await supabase.auth.signOut();

      showToast.success('Pendaftaran berhasil! Silakan tunggu verifikasi admin sebelum dapat login.');
      
      setTimeout(() => {
        router.push('/authentication/teacher/loginTeacher');
      }, 2000);

    } catch (error) {
      console.error('Registration Error:', error);
      
      let errorMessage = error.message || 'Terjadi kesalahan saat registrasi';
      
      // Don't show duplicate toast for errors that already showed toast
      if (!error.message.includes('sudah mengajukan verifikasi') && 
          !error.message.includes('sudah terverifikasi') && 
          !error.message.includes('pernah ditolak')) {
        showToast.error(errorMessage);
      }
      
      setError(errorMessage);

      // Cleanup if needed
      if (createdUser?.id) {
        try {
          await supabase.auth.signOut();
          await supabase
            .from('teacher_verifications')
            .delete()
            .eq('id', createdUser.id);
          await supabase
            .from('teacher_profiles')
            .delete()
            .eq('id', createdUser.id);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create missing teacher profile
  const createMissingTeacherProfile = async (email) => {
    try {
      showToast.info('Creating missing teacher profile...');

      // Get verification data
      const { data: verificationData, error: verificationError } = await supabase
        .from('teacher_verifications')
        .select('*')
        .eq('email', email)
        .eq('status', 'verified')
        .single();

      if (verificationError || !verificationData) {
        throw new Error('Verification data not found or not verified');
      }

      // Get user ID from auth
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      const authUser = users?.find(user => user.email === email);

      if (!authUser) {
        throw new Error('Auth user not found');
      }

      // Create teacher profile
      const { data: newProfile, error: createError } = await supabase
        .from('teacher_profiles')
        .insert([{
          id: authUser.id,
          email: verificationData.email,
          full_name: verificationData.full_name,
          teaching_experience: verificationData.credentials?.teaching_experience || 'N/A',
          institution: verificationData.institution,
          specialization: verificationData.credentials?.specializations?.join(', ') || 'N/A',
          certifications: verificationData.credentials?.certifications || '',
          is_verified: true,
          status: 'pending' // Use 'pending' instead of 'verified'
        }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      showToast.success('Teacher profile created successfully!');
      return newProfile;

    } catch (error) {
      console.error('Create profile error:', error);
      showToast.error(`Failed to create profile: ${error.message}`);
      return null;
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 flex items-center justify-center p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Head>
        <title>Registrasi Guru | Makruf</title>
      </Head>

      <Toast />

      <motion.div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Registrasi Guru</h1>
          <p className="text-gray-600 mt-2">Daftar sebagai pengajar di platform kami</p>
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Masukkan email"
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
              Konfirmasi Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Konfirmasi password"
            />
          </div>

          {/* Professional Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pengalaman Mengajar
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.teachingExperience}
              onChange={(e) => setFormData({...formData, teachingExperience: e.target.value})}
              placeholder="Contoh: 5 tahun"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institusi
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
              placeholder="Nama institusi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spesialisasi
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              placeholder="Bidang spesialisasi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sertifikasi
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.certifications}
              onChange={(e) => setFormData({...formData, certifications: e.target.value})}
              placeholder="Sertifikasi yang dimiliki (opsional)"
            />
          </div>

          {/* Credentials Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kredensial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pendidikan Terakhir
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.credentials.education}
                  onChange={(e) => setFormData({
                    ...formData,
                    credentials: {
                      ...formData.credentials,
                      education: e.target.value
                    }
                  })}
                  placeholder="Contoh: S1 Pendidikan Agama Islam"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {loading ? 'Memproses...' : 'Daftar & Ajukan Verifikasi'}
            </button>
          </div>

          {/* Debug buttons - Remove in production */}
          <div className="md:col-span-2 space-y-2">
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">Debug Tools:</p>
              <button
                type="button"
                onClick={() => createMissingTeacherProfile(formData.email || 'qalvinahmad@gmail.com')}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Debug: Create Missing Profile
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-600 text-sm">
            Sudah memiliki akun guru?{' '}
            <button
              onClick={() => router.push('/authentication/teacher/loginTeacher')}
              className="text-blue-600 hover:underline font-medium"
            >
              Login di sini
            </button>
          </p>
          <div className="border-t pt-3">
            <button
              onClick={() => router.push('/authentication/login')}
              className="text-gray-500 hover:text-gray-700 hover:underline text-sm"
            >
              ← Kembali ke halaman login utama
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const getServerSideProps = async (context) => {
  return {
    props: {}
  };
};
