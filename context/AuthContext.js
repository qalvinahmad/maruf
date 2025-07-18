import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

// Add public routes array at the top of the file (outside the component)
const publicRoutes = [
  '/', 
  '/index', 
  '/privacy', 
  '/kebijakan', 
  '/authentication/login', 
  '/authentication/register',
  '/authentication/register-new',
  '/authentication/admin/loginAdmin', 
  '/authentication/admin/registerAdmin', 
  '/authentication/teacher/loginTeacher', 
  '/authentication/teacher/registerTeacher', 
  '/admin', 
  '/teacher'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState(null);

  // Clear all auth-related localStorage data
  const clearAuthData = () => {
    const keysToRemove = [
      'isLoggedIn',
      'userName', 
      'userEmail',
      'userId',
      'isAdmin',
      'isTeacher',
      'teacherId',
      'teacherEmail',
      'teacherName',
      'teacherInstitution',
      'sb-project-auth-token'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing localStorage item:', error);
      }
    });

    // Clear all session storage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  };

  // Check if user is teacher
  const checkTeacherStatus = async (user) => {
    if (!user) return;

    try {
      console.log('Checking teacher status for:', user.email);
      
      const { data: teacherData, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        // If error is 406 (Not Acceptable), CORS, or permission related, silently skip
        if (error.code === 'PGRST116' || 
            error.message.includes('406') || 
            error.message.includes('Not Acceptable') || 
            error.message.includes('access control checks') ||
            error.message.includes('CORS') ||
            error.status === 406) {
          console.log('Teacher profiles access not allowed for this user, skipping...');
          setIsTeacher(false);
          setTeacherProfile(null);
          return;
        }
        
        console.log('Teacher check error (non-critical):', error);
        setIsTeacher(false);
        setTeacherProfile(null);
        return;
      }

      if (teacherData) {
        console.log('Teacher profile found:', teacherData);
        setIsTeacher(true);
        setTeacherProfile(teacherData);
        
        // Store teacher info in localStorage
        localStorage.setItem('isTeacher', 'true');
        localStorage.setItem('teacherId', teacherData.id);
        localStorage.setItem('teacherEmail', teacherData.email);
        localStorage.setItem('teacherName', teacherData.full_name);
        localStorage.setItem('teacherInstitution', teacherData.institution);
        
        // Update last updated timestamp
        await supabase
          .from('teacher_profiles')
          .update({ 
            updated_at: new Date().toISOString()
          })
          .eq('id', teacherData.id);
      } else {
        console.log('No teacher profile found for:', user.email);
        setIsTeacher(false);
        setTeacherProfile(null);
        localStorage.removeItem('isTeacher');
        localStorage.removeItem('teacherId');
        localStorage.removeItem('teacherEmail');
        localStorage.removeItem('teacherName');
        localStorage.removeItem('teacherInstitution');
      }
    } catch (error) {
      console.error('Error checking teacher status (non-critical):', error);
      setIsTeacher(false);
      setTeacherProfile(null);
      localStorage.removeItem('isTeacher');
      localStorage.removeItem('teacherId');
      localStorage.removeItem('teacherEmail');
      localStorage.removeItem('teacherName');
      localStorage.removeItem('teacherInstitution');
    }
  };

  // Enhanced teacher sign in - with better RLS error handling
  const signInAsTeacher = async (email, password, teacherCode) => {
    try {
      console.log('Attempting teacher sign in for:', email);
      
      // Validate teacher code
      if (teacherCode !== 'T123') {
        throw new Error('Kode guru tidak valid');
      }

      // First, check if teacher is verified in teacher_verifications
      const { data: verificationData, error: verificationError } = await supabase
        .from('teacher_verifications')
        .select('*')
        .eq('email', email)
        .eq('status', 'verified')
        .single();

      if (verificationError || !verificationData) {
        console.error('Teacher verification check failed:', verificationError);
        
        // Check if teacher exists but not verified
        const { data: pendingVerification, error: pendingError } = await supabase
          .from('teacher_verifications')
          .select('*')
          .eq('email', email)
          .single();

        if (pendingVerification) {
          if (pendingVerification.status === 'pending') {
            throw new Error('Akun Anda masih dalam proses verifikasi admin. Silakan tunggu konfirmasi.');
          } else if (pendingVerification.status === 'rejected') {
            throw new Error('Akun Anda ditolak oleh admin. Silakan hubungi administrator.');
          }
        } else {
          throw new Error('Email tidak terdaftar sebagai guru atau belum mengajukan verifikasi.');
        }
      }

      // Now try to sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Auth sign in error:', error);
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email atau password salah');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email belum diverifikasi. Silakan cek email Anda');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Terlalu banyak percobaan login. Coba lagi nanti');
        }
        throw new Error(error.message || 'Terjadi kesalahan saat login');
      }

      if (data.user) {
        console.log('Auth successful, setting up teacher session...');
        
        // Instead of immediately checking teacher profile, set basic teacher status from verification
        setUser(data.user);
        setIsTeacher(true);
        setIsAuthenticated(true);
        
        // Store teacher info based on verification data
        localStorage.setItem('isTeacher', 'true');
        localStorage.setItem('teacherId', data.user.id);
        localStorage.setItem('teacherEmail', verificationData.email);
        localStorage.setItem('teacherName', verificationData.full_name);
        localStorage.setItem('teacherInstitution', verificationData.institution);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', verificationData.full_name || 'Guru');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userId', data.user.id);

        // Try to get/create teacher profile, but don't fail login if it fails due to RLS
        try {
          let { data: teacherData, error: teacherError } = await supabase
            .from('teacher_profiles')
            .select('*')
            .eq('email', email)
            .single();

          if (teacherError || !teacherData) {
            console.log('Teacher profile not found or RLS error, creating from verification data...');
            
            // Try to create profile
            const { data: newTeacherProfile, error: createError } = await supabase
              .from('teacher_profiles')
              .insert([
                {
                  id: data.user.id,
                  email: verificationData.email,
                  full_name: verificationData.full_name,
                  institution: verificationData.institution,
                  is_verified: true,
                  teaching_experience: verificationData.credentials?.teaching_experience || 'N/A',
                  specialization: verificationData.credentials?.specializations?.join(', ') || 'N/A',
                  certifications: verificationData.credentials?.certifications || '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ])
              .select()
              .single();

            if (createError) {
              console.warn('Could not create teacher profile (RLS issue):', createError);
              // Don't fail login, continue with verification data
            } else {
              teacherData = newTeacherProfile;
              setTeacherProfile(teacherData);
            }
          } else {
            setTeacherProfile(teacherData);
          }
        } catch (profileError) {
          console.warn('Teacher profile operations failed (RLS issue), continuing with login:', profileError);
          // Don't fail the login due to profile issues
        }

        return { success: true, user: data.user, teacherProfile: verificationData };
      }

      throw new Error('Login gagal');
    } catch (error) {
      console.error('Teacher sign in error:', error);
      throw error;
    }
  };

  // Enhanced profile check with better error handling
  const checkProfile = async (userId) => {
    try {
      console.log('Checking profile for user:', userId);
      
      // Simple existence check with full_name
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile check error:', error);
        // Don't throw error, just return false to allow fallback
        return false;
      }

      console.log('Profile check result:', data);
      return !!data;
    } catch (error) {
      console.error('Profile check failed:', error);
      return false;
    }
  };

  // Enhanced auth check with better error handling
  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        return false;
      }

      if (session?.user) {
        console.log('Valid session found for user:', session.user.id);
        return session;
      }
      
      console.log('No valid session found');
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setLoading(true);

        const session = await checkAuth();

        if (mounted) {
          if (session) {
            setUser(session.user);
            setIsAuthenticated(true);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', session.user.id);
            localStorage.setItem('userEmail', session.user.email);
            
            // Check roles based on current path context - but allow teacher check after successful login
            let currentPath = '/';
            if (typeof window !== 'undefined') {
              currentPath = window.location.pathname;
            }
            const normalizedPath = currentPath.replace(/\/$/, '') || '/';
            
            // Skip role checks entirely if on auth pages to prevent loops and 406 errors
            // BUT allow teacher check if we have teacher data in localStorage (indicating recent login)
            const isAuthPage = normalizedPath.includes('/authentication/') || 
                              normalizedPath.includes('/login') || 
                              normalizedPath.includes('/register');
            
            const hasTeacherLocalStorage = localStorage.getItem('isTeacher') === 'true';
            
            if (!isAuthPage || (isAuthPage && hasTeacherLocalStorage)) {
              const isAdminPath = normalizedPath.includes('/admin') || normalizedPath.includes('/dashboard/DashboardProjects');
              const isTeacherPath = normalizedPath.includes('/teacher') || normalizedPath.includes('/dashboard/teacher') || hasTeacherLocalStorage;
              
              // Only check relevant role status to avoid 406 errors
              if (isAdminPath) {
                await checkAdminStatus(session.user);
              } else if (isTeacherPath) {
                await checkTeacherStatus(session.user);
              } else {
                // For general/public paths, don't check roles to avoid permission errors
                console.log('On public/general path, skipping role checks to avoid 406 errors');
              }
            } else {
              console.log('On authentication page, skipping role checks to prevent loops');
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsTeacher(false);
            setAdminProfile(null);
            setTeacherProfile(null);
            clearAuthData();

            // Only redirect if NOT on a public route
            // FIX: Always allow "/" and "/index" and check for SSR/CSR
            let currentPath = '/';
            if (typeof window !== 'undefined') {
              currentPath = window.location.pathname;
            }
            // Normalize path for trailing slash
            const normalizedPath = currentPath.replace(/\/$/, '') || '/';

            // If on "/" or "/index", do NOT redirect
            if (!publicRoutes.includes(normalizedPath)) {
              // Prevent infinite redirect loop on ANY authentication page
              if (!normalizedPath.startsWith('/authentication/')) {
                window.location.href = '/authentication/login';
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          clearAuthData();

          let currentPath = '/';
          if (typeof window !== 'undefined') {
            currentPath = window.location.pathname;
          }
          const normalizedPath = currentPath.replace(/\/$/, '') || '/';

          if (!publicRoutes.includes(normalizedPath)) {
            if (!normalizedPath.startsWith('/authentication/')) {
              window.location.href = '/authentication/login';
            }
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        let currentPath = '/';
        if (typeof window !== 'undefined') {
          currentPath = window.location.pathname;
        }
        const normalizedPath = currentPath.replace(/\/$/, '') || '/';

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsTeacher(false);
          setAdminProfile(null);
          setTeacherProfile(null);
          clearAuthData();

          if (!publicRoutes.includes(normalizedPath)) {
            if (!normalizedPath.startsWith('/authentication/')) {
              window.location.href = '/authentication/login';
            }
          }
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', session.user.id);
          localStorage.setItem('userEmail', session.user.email);
          
          // Allow teacher check if we have teacher localStorage data (indicating recent login)
          const isAuthPage = normalizedPath.includes('/authentication/') || 
                            normalizedPath.includes('/login') || 
                            normalizedPath.includes('/register');
          
          const hasTeacherLocalStorage = localStorage.getItem('isTeacher') === 'true';
          
          if (!isAuthPage || (isAuthPage && hasTeacherLocalStorage)) {
            // Check roles based on current path context
            const isAdminPath = normalizedPath.includes('/admin') || normalizedPath.includes('/dashboard/DashboardProjects');
            const isTeacherPath = normalizedPath.includes('/teacher') || normalizedPath.includes('/dashboard/teacher') || hasTeacherLocalStorage;
            
            // Only check relevant role status to avoid 406 errors
            if (isAdminPath) {
              await checkAdminStatus(session.user);
            } else if (isTeacherPath) {
              await checkTeacherStatus(session.user);
            } else {
              // For general/public paths, don't check roles to avoid permission errors
              console.log('On public/general path during SIGNED_IN, skipping role checks to avoid 406 errors');
            }
          } else {
            console.log('On authentication page during SIGNED_IN, skipping role checks to prevent loops');
          }
        } else if (event === 'INITIAL_SESSION' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', session.user.id);
          localStorage.setItem('userEmail', session.user.email);
          
          // Allow teacher check if we have teacher localStorage data (indicating recent login)
          const isAuthPage = normalizedPath.includes('/authentication/') || 
                            normalizedPath.includes('/login') || 
                            normalizedPath.includes('/register');
          
          const hasTeacherLocalStorage = localStorage.getItem('isTeacher') === 'true';
          
          if (!isAuthPage || (isAuthPage && hasTeacherLocalStorage)) {
            // Check roles based on current path context
            const isAdminPath = normalizedPath.includes('/admin') || normalizedPath.includes('/dashboard/DashboardProjects');
            const isTeacherPath = normalizedPath.includes('/teacher') || normalizedPath.includes('/dashboard/teacher') || hasTeacherLocalStorage;
            
            // Only check relevant role status to avoid 406 errors
            if (isAdminPath) {
              await checkAdminStatus(session.user);
            } else if (isTeacherPath) {
              await checkTeacherStatus(session.user);
            } else {
              // For general/public paths, don't check roles to avoid permission errors
              console.log('On public/general path during INITIAL_SESSION, skipping role checks to avoid 406 errors');
            }
          } else {
            console.log('On authentication page during INITIAL_SESSION, skipping role checks to prevent loops');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // Remove router dependency to prevent infinite loops

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsTeacher(false);
      setAdminProfile(null);
      setTeacherProfile(null);
      clearAuthData();
      
      // Use window.location for cleaner navigation without router dependency
      window.location.href = '/authentication/login';
      
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const checkAdminStatus = async (user) => {
    if (!user) return;

    try {
      console.log('Checking admin status for:', user.email);
      
      const { data: adminData, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        // If error is 406 (Not Acceptable) or permission related, silently skip
        if (error.code === 'PGRST116' || error.message.includes('406') || error.message.includes('Not Acceptable') || error.status === 406) {
          console.log('Admin profiles access not allowed for this user, skipping...');
          setIsAdmin(false);
          setAdminProfile(null);
          return;
        }
        
        console.log('Admin check error (non-critical):', error);
        setIsAdmin(false);
        setAdminProfile(null);
        return;
      }

      if (adminData) {
        console.log('Admin profile found:', adminData);
        setIsAdmin(true);
        setAdminProfile(adminData);
        
        // Store admin info in localStorage
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminProfile', JSON.stringify(adminData));
        
        // Update last login
        await supabase
          .from('admin_profiles')
          .update({ 
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', adminData.id);
      } else {
        console.log('No admin profile found for:', user.email);
        setIsAdmin(false);
        setAdminProfile(null);
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminProfile');
      }
    } catch (error) {
      console.error('Error checking admin status (non-critical):', error);
      setIsAdmin(false);
      setAdminProfile(null);
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminProfile');
    }
  };

  // Enhanced admin sign in
  const signInAsAdmin = async (email, password) => {
    try {
      console.log('Attempting admin sign in for:', email);
      
      // First, check if admin exists in admin_profiles
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (adminCheckError || !adminCheck) {
        console.error('Admin profile not found:', adminCheckError);
        throw new Error('Email tidak terdaftar sebagai admin');
      }

      if (!adminCheck.is_active) {
        console.error('Admin account is inactive');
        throw new Error('Akun admin tidak aktif');
      }

      console.log('Admin profile found:', adminCheck);
      
      // Now try to sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Auth sign in error:', error);
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email atau password salah');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email belum diverifikasi');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Terlalu banyak percobaan login. Coba lagi nanti');
        }
        throw new Error(error.message || 'Terjadi kesalahan saat login');
      }

      if (data.user) {
        console.log('Auth successful, setting admin status...');
        
        setUser(data.user);
        setIsAdmin(true);
        setAdminProfile(adminCheck);
        
        // Store admin info
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminProfile', JSON.stringify(adminCheck));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', adminCheck.full_name || 'Admin');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userId', data.user.id);

        // Update last login
        try {
          await supabase
            .from('admin_profiles')
            .update({ 
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', adminCheck.id);
        } catch (updateError) {
          console.warn('Failed to update last login:', updateError);
          // Don't throw error for this, login should still succeed
        }

        return { success: true, user: data.user, adminProfile: adminCheck };
      }

      throw new Error('Login gagal');
    } catch (error) {
      console.error('Admin sign in error:', error);
      throw error;
    }
  };

  // Regular user sign in
  const signIn = async (email, password) => {
    try {
      console.log('Attempting user sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Auth sign in error:', error);
        throw error;
      }

      if (data.user) {
        console.log('User auth successful:', data.user);
        
        // Check if user has a profile
        const hasProfile = await checkProfile(data.user.id);
        
        if (!hasProfile) {
          console.log('No profile found, creating one...');
          
          // Create a basic profile for the user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || 'User',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw error, continue with login
          }
        }
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Store regular user info
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', data.user.user_metadata?.full_name || 'User');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userId', data.user.id);

        return { success: true, user: data.user };
      }

      throw new Error('Login gagal');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Regular user sign up
  const signUp = async (email, password, fullName) => {
    try {
      console.log('Attempting user sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            email,
          }
        }
      });

      if (error) {
        console.error('Auth sign up error:', error);
        throw error;
      }

      if (data.user) {
        console.log('User auth successful:', data.user);
        
        // Create profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw error for profile creation failure
        }

        return { success: true, user: data.user, needsVerification: !data.session };
      }

      throw new Error('Registrasi gagal');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isTeacher,
    adminProfile,
    teacherProfile,
    signIn,
    signInAsAdmin,
    signInAsTeacher,
    signOut,
    checkAdminStatus,
    checkTeacherStatus,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

