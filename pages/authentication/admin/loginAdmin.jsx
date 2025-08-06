import {
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  IconShield
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

const LoginAdmin = () => {
  const router = useRouter();
  const { signInAsAdmin, user, isAdmin, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      console.log('Already logged in as admin, redirecting...');
      router.push('/dashboard/admin/project/DashboardProjects');
    }
  }, [user, isAdmin, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting admin login for:', formData.email);
      
      const result = await signInAsAdmin(formData.email, formData.password);
      
      if (result.success) {
        console.log('Admin login successful, redirecting to admin dashboard...');
        // Redirect to admin dashboard
        router.push('/dashboard/admin/project/DashboardProjects');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // More specific error handling
      let errorMessage = 'Terjadi kesalahan saat login';
      
      if (error.message.includes('Email tidak terdaftar')) {
        errorMessage = 'Email tidak terdaftar sebagai admin';
      } else if (error.message.includes('Email atau password salah')) {
        errorMessage = 'Email atau password salah';
      } else if (error.message.includes('Email belum diverifikasi')) {
        errorMessage = 'Email belum diverifikasi. Silakan cek email Anda';
      } else if (error.message.includes('Akun admin tidak aktif')) {
        errorMessage = 'Akun admin tidak aktif. Hubungi administrator';
      } else if (error.message.includes('Terlalu banyak percobaan')) {
        errorMessage = 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create admin auth user if not exists
  const createAdminAuthUser = async (email, password = 'TempPassword123!') => {
    try {
      console.log('Creating admin auth user for:', email);
      
      // First, check if admin profile exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking admin profile:', checkError);
        throw new Error('Gagal memeriksa data admin: ' + checkError.message);
      }

      if (!existingAdmin) {
        console.log('Admin profile not found, creating new one...');
        
        // Create admin profile first
        const { error: insertError } = await supabase
          .from('admin_profiles')
          .insert([
            {
              id: crypto.randomUUID(),
              email: email,
              full_name: 'Testing',
              role: 'admin',
              admin_level: 'basic',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error('Error creating admin profile:', insertError);
          throw new Error('Gagal membuat profil admin: ' + insertError.message);
        }
        
        console.log('Admin profile created successfully');
      }
      
      // Now try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Testing Admin',
            role: 'admin'
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        
        // Handle different error cases
        if (signUpError.message.includes('User already registered')) {
          // User exists, try to sign in instead
          console.log('User already exists, attempting sign in...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (signInError) {
            throw new Error('User sudah terdaftar tapi password salah. Gunakan password yang benar atau reset password.');
          }

          if (signInData.user) {
            // Update admin profile with correct auth user ID
            const { error: updateError } = await supabase
              .from('admin_profiles')
              .update({ id: signInData.user.id })
              .eq('email', email);

            if (updateError) {
              console.warn('Failed to update admin profile ID:', updateError);
            }

            alert(`User sudah ada dan berhasil login!\nEmail: ${email}\nSilakan lanjutkan dengan login normal.`);
            return signInData.user;
          }
        } else {
          throw signUpError;
        }
      }

      if (signUpData.user) {
        console.log('Admin auth user created:', signUpData.user);
        
        // Update admin_profiles with the new auth user ID
        const { error: updateError } = await supabase
          .from('admin_profiles')
          .update({ id: signUpData.user.id })
          .eq('email', email);

        if (updateError) {
          console.error('Failed to update admin profile:', updateError);
          // Don't throw error here, the user was created successfully
          console.warn('Admin user created but profile update failed');
        }

        alert(`Admin auth user berhasil dibuat!\nEmail: ${email}\nPassword: ${password}\nSilakan login dengan kredensial tersebut.`);
        return signUpData.user;
      }

      throw new Error('Failed to create admin auth user');
    } catch (error) {
      console.error('Create admin auth user error:', error);
      alert(`Error creating admin auth user: ${error.message}`);
      throw error;
    }
  };

  // Function to reset admin password via email
  const resetAdminPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/authentication/admin/reset-password`
      });

      if (error) {
        throw error;
      }

      alert('Link reset password telah dikirim ke email Anda. Silakan periksa inbox.');
    } catch (error) {
      console.error('Reset password error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Show loading if auth is still initializing
  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Animated Background for Loading - Same as main */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00acee] via-[#0099cc] to-[#007aa3] animate-gradient-horizontal" style={{ backgroundSize: '400% 400%' }}>
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/20 rounded-full blur-xl animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-primary-300/30 rounded-full blur-lg animate-float-delayed"></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 bg-white/15 rounded-full blur-2xl animate-float-gentle"></div>
          
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-white/10 to-primary-200/20 rounded-full blur-3xl animate-gradient-xy opacity-70"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-l from-primary-400/20 to-white/10 rounded-full blur-2xl animate-gradient-x opacity-60"></div>
          
          <div className="absolute top-16 left-1/4 w-2 h-2 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-32 right-1/3 w-1 h-1 bg-white/80 rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/2 w-1.5 h-1.5 bg-white/60 rounded-full animate-twinkle" style={{ animationDelay: '2s' }}></div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#007aa3]/30 via-transparent to-[#00acee]/20 animate-gradient-slow"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <div className="text-white font-medium animate-pulse-slow">Memuat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Enhanced Multi-Layer Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient with smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00acee] via-[#0099cc] to-[#007aa3] animate-gradient-horizontal" style={{ backgroundSize: '400% 400%' }}></div>
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-pattern"></div>
        
        {/* Dynamic floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/15 rounded-full blur-xl animate-float-slow shadow-glow"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-primary-300/25 rounded-full blur-lg animate-float-delayed shadow-glow-lg"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float-gentle"></div>
        
        {/* Gradient movements with enhanced blur */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-white/8 to-primary-200/15 rounded-full blur-3xl animate-gradient-xy opacity-60"></div>
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-gradient-to-l from-primary-400/15 to-white/8 rounded-full blur-3xl animate-gradient-x opacity-50"></div>
        
        {/* Micro-interactions: Twinkling constellation */}
        <div className="absolute top-16 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-twinkle shadow-glow"></div>
        <div className="absolute top-32 right-1/3 w-1 h-1 bg-white/90 rounded-full animate-twinkle shadow-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-2 h-2 bg-white/80 rounded-full animate-twinkle shadow-glow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 right-20 w-1 h-1 bg-white/70 rounded-full animate-twinkle shadow-glow" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/3 left-1/6 w-1 h-1 bg-white/60 rounded-full animate-twinkle shadow-glow" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Enhanced floating particles with better spacing */}
        <div className="absolute top-10 right-10 w-6 h-6 bg-white/20 rounded-full animate-bounce-slow blur-sm"></div>
        <div className="absolute bottom-40 right-16 w-4 h-4 bg-primary-200/25 rounded-full animate-pulse-slow blur-sm"></div>
        <div className="absolute top-2/3 left-16 w-3 h-3 bg-white/15 rounded-full animate-float-x blur-sm"></div>
        
        {/* Sophisticated overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#007aa3]/20 via-transparent to-[#00acee]/15 animate-gradient-slow"></div>
        
        {/* Glass morphism accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent"></div>
      </div>
      
      <Head>
        <title>Admin Login - Belajar Makhrojul Huruf</title>
        <meta name="description" content="Login admin untuk platform pembelajaran" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-full max-w-md relative z-10">
        {/* Enhanced Header with Better Typography Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          {/* Icon with enhanced glass morphism */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="w-20 h-20 bg-gradient-to-br from-white/25 to-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-lg border border-white/30 hover:scale-105 transition-all duration-300"
          >
            <IconShield size={36} className="text-white drop-shadow-lg" />
          </motion.div>
          
          {/* Enhanced Typography with Better Spacing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight leading-tight">
              Admin Portal
            </h1>
            <p className="text-white/85 text-lg font-medium tracking-wide">
              Selamat datang kembali
            </p>
            <p className="text-white/60 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              Masuk ke dashboard administrasi untuk mengelola platform pembelajaran
            </p>
          </motion.div>
        </motion.div>

        {/* Enhanced Login Form with Better UX */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/25 backdrop-blur-2xl hover:border-white/35 transition-all duration-300"
        >
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Enhanced Error Message with Better Visual Hierarchy */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-red-500/15 border border-red-400/30 rounded-2xl p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-red-200 text-sm font-medium leading-relaxed">{error}</p>
                    <p className="text-red-300/60 text-xs mt-1">Silakan periksa kembali kredensial Anda</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enhanced Email Field with Better UX */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label className="block text-sm font-semibold text-white/95 mb-3 tracking-wide">
                Alamat Email
                <span className="text-red-300 ml-1">*</span>
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 bg-white/10 border border-white/25 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 text-white placeholder-white/40 backdrop-blur-sm transition-all duration-300 hover:border-white/35 focus:bg-white/15 text-base font-medium"
                  placeholder="admin@contoh.com"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <p className="text-white/50 text-xs mt-2 ml-1">Gunakan email admin yang terdaftar</p>
            </motion.div>

            {/* Enhanced Password Field with Better UX */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label className="block text-sm font-semibold text-white/95 mb-3 tracking-wide">
                Kata Sandi
                <span className="text-red-300 ml-1">*</span>
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 bg-white/10 border border-white/25 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 text-white placeholder-white/40 backdrop-blur-sm pr-14 transition-all duration-300 hover:border-white/35 focus:bg-white/15 text-base font-medium"
                  placeholder="••••••••••"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-all duration-200 p-1 rounded-lg hover:bg-white/10"
                >
                  {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </motion.button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <p className="text-white/50 text-xs mt-2 ml-1">Minimum 8 karakter dengan kombinasi huruf dan angka</p>
            </motion.div>

            {/* Enhanced Submit Button with Better Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="pt-2"
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full bg-gradient-to-r from-white/25 to-white/15 text-white font-bold py-4 px-6 rounded-2xl hover:from-white/35 hover:to-white/25 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl backdrop-blur-sm border border-white/30 hover:border-white/40 hover:shadow-2xl text-lg tracking-wide"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    ></motion.div>
                    <span>Memverifikasi...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <IconShield size={20} />
                    Masuk ke Panel Admin
                  </span>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div className="flex flex-col space-y-3">
              <Link href="/" className="group flex items-center justify-center gap-2 text-white/80 hover:text-white transition-all duration-200 text-sm font-medium">
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Kembali ke beranda</span>
              </Link>
              
              <Link href="/authentication/login" className="group flex items-center justify-center gap-2 text-white/80 hover:text-white transition-all duration-200 text-sm font-medium">
                <svg className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Login sebagai pengguna biasa</span>
              </Link>
              
              <button
                type="button"
                onClick={() => {
                  const email = prompt('Masukkan email admin untuk reset password:');
                  if (email) resetAdminPassword(email);
                }}
                className="group flex items-center justify-center gap-2 text-white/60 hover:text-white/80 transition-all duration-200 text-xs"
              >
                <svg className="w-3 h-3 transform group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Lupa password?</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Footer with Better Information Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10 space-y-6"
        >
          {/* Security Notice with Better Visual Design */}
          <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/15 hover:border-white/25 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10  rounded-xl flex items-center justify-center mt-0.5">
                <IconInfoCircle size={20} className="text-gray-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-white/95 font-semibold text-sm mb-2 tracking-wide">
                  Keamanan & Privasi
                </h3>
                <p className="text-white/70 text-xs leading-relaxed mb-3">
                  Akses admin dilindungi dengan enkripsi tingkat enterprise. Pastikan Anda menggunakan kredensial yang sah dan tidak membagikan informasi login.
                </p>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Koneksi aman · SSL/TLS terenkripsi</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
 
export default LoginAdmin;
