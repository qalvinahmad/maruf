import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

// Add public routes array at the top of the file (outside the component)
const publicRoutes = ['/', '/index', '/authentication/login', '/authentication/register', '/authentication/admin/loginAdmin', , '/authentication/admin/loginTeacher', '/authentication/admin/loginStudent', '/authentication/teacher/login', '/authentication/student/login'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Clear all auth-related localStorage data
  const clearAuthData = () => {
    const keysToRemove = [
      'isLoggedIn',
      'userName', 
      'userEmail',
      'userId',
      'isAdmin',
      'isTeacher',
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
          } else {
            setUser(null);
            setIsAuthenticated(false);
            clearAuthData();

            // Only redirect if NOT on a public route
            // FIX: Always allow "/" and "/index" and check for SSR/CSR
            let currentPath = '/';
            if (typeof window !== 'undefined') {
              currentPath = window.location.pathname;
            } else if (router && router.pathname) {
              currentPath = router.pathname;
            }
            // Normalize path for trailing slash
            const normalizedPath = currentPath.replace(/\/$/, '') || '/';

            // If on "/" or "/index", do NOT redirect
            if (!publicRoutes.includes(normalizedPath)) {
              // Prevent infinite redirect loop on login page
              if (!normalizedPath.startsWith('/authentication/login')) {
                router.replace('/authentication/login');
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
          } else if (router && router.pathname) {
            currentPath = router.pathname;
          }
          const normalizedPath = currentPath.replace(/\/$/, '') || '/';

          if (!publicRoutes.includes(normalizedPath)) {
            if (!normalizedPath.startsWith('/authentication/login')) {
              router.replace('/authentication/login');
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
        } else if (router && router.pathname) {
          currentPath = router.pathname;
        }
        const normalizedPath = currentPath.replace(/\/$/, '') || '/';

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setIsAuthenticated(false);
          clearAuthData();

          if (!publicRoutes.includes(normalizedPath)) {
            if (!normalizedPath.startsWith('/authentication/login')) {
              router.replace('/authentication/login');
            }
          }
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', session.user.id);
          localStorage.setItem('userEmail', session.user.email);
        } else if (event === 'INITIAL_SESSION' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', session.user.id);
          localStorage.setItem('userEmail', session.user.email);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      clearAuthData();
      
      router.replace('/authentication/login');
      
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signOut
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
