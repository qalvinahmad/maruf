import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function LoginAdmin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First verify admin code
      if (formData.adminCode !== 'ADMIN123') {
        throw new Error('Kode admin tidak valid');
      }

      // Verify admin exists in admin_profiles first
      const { data: adminCheck, error: profileError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('email', formData.email.trim())
        .single();

      console.log('Admin check:', { adminCheck, profileError });

      if (!adminCheck) {
        throw new Error('Email tidak terdaftar sebagai admin');
      }

      // Then try to authenticate
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      // Additional admin verification
      if (!adminCheck.is_active) {
        await supabase.auth.signOut();
        throw new Error('Akun admin tidak aktif');
      }

      if (!adminCheck.role || adminCheck.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Akun ini tidak memiliki akses admin');
      }

      // Check if profile exists in profiles table
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', formData.email.trim())
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileCheckError);
      }

      if (existingProfile) {
        // Update existing profile to have admin privileges
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({
            id: authData.user.id, // Ensure the correct user ID
            is_admin: true,
            role: 'admin',
            admin_id: adminCheck.id,
            full_name: adminCheck.full_name || existingProfile.full_name,
            updated_at: new Date().toISOString()
          })
          .eq('email', formData.email.trim());

        if (updateProfileError) {
          console.error('Error updating profile to admin:', updateProfileError);
          throw new Error('Gagal mengupdate profil admin');
        }
      } else {
        // Create new profile for admin
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: adminCheck.email,
            full_name: adminCheck.full_name || 'Admin',
            is_admin: true,
            role: 'admin',
            admin_id: adminCheck.id,
            level: 1,
            xp: 0,
            points: 0,
            streak: 0,
            level_description: 'Admin',
            energy: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating admin profile:', insertError);
          throw new Error('Gagal membuat profil admin');
        }
      }

      // Update last_login timestamp in admin_profiles
      const { error: updateError } = await supabase
        .from('admin_profiles')
        .update({ 
          last_login: new Date().toISOString() 
        })
        .eq('email', formData.email);

      if (updateError) {
        console.error('Error updating last login:', updateError);
      }

      // Store session data
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', authData.user.id);
      localStorage.setItem('adminId', adminCheck.id);
      localStorage.setItem('adminEmail', adminCheck.email);
      localStorage.setItem('adminRole', adminCheck.role);
      localStorage.setItem('adminLevel', adminCheck.admin_level);

      // Use direct navigation
      window.location.href = '/dashboard/admin/content/AdminContent';

    } catch (error) {
      console.error('Login Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Head>
        <title>Admin Login | Makruf</title>
      </Head>

      <motion.div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Login sebagai administrator sistem</p>
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
              Email Admin
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Masukkan email admin"
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
              Kode Admin
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.adminCode}
              onChange={(e) => setFormData({...formData, adminCode: e.target.value})}
              placeholder="Masukkan kode admin"
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
  );
}
