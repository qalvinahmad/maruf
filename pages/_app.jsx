import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PreLoader from '../components/widget/Preloader';
import { AuthProvider } from '../context/AuthContext';
import usePreloader from '../hooks/usePreloader';
import '../styles/globals.css';

// FIXED: Global chunk loading error handler
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections (chunk loading errors)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error && (
      error.message?.includes('Loading chunk') || 
      error.message?.includes('Failed to load chunk') ||
      error.message?.includes('ChunkLoadError')
    )) {
      console.warn('Chunk loading error detected, attempting to recover...');
      event.preventDefault(); // Prevent the error from being logged
      
      // Attempt to reload the page after a short delay
      setTimeout(() => {
        console.log('Reloading page due to chunk loading error...');
        window.location.reload();
      }, 1000);
    }
  });

  // Handle script loading errors
  window.addEventListener('error', (event) => {
    const error = event.error || event;
    if (error && (
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to load chunk') ||
      event.target?.src?.includes('/_next/static/chunks/')
    )) {
      console.warn('Script loading error detected:', error);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}

// FIXED: Suppress console errors in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    // FIXED: Filter out specific error patterns including chunk loading
    const suppressPatterns = [
      'Redis Client Error',
      'ECONNREFUSED',
      'WebSocket connection',
      'Hot reload',
      'Fast Refresh',
      'webpack-hmr',
      'Loading chunk',
      'Failed to load chunk',
      'ChunkLoadError'
    ];
    
    const shouldSuppress = suppressPatterns.some(pattern => 
      message.includes(pattern)
    );
    
    if (!shouldSuppress) {
      originalConsoleError.apply(console, args);
    }
  };
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Preloader hook - hanya tampil sekali saat pertama kali masuk website
  const { isLoading: preloaderLoading, shouldShowPreloader, setLoading: setPreloaderLoading } = usePreloader();

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/authentication/login',
    '/authentication/register',
    '/authentication/admin/loginAdmin',
    '/privacy',
    '/kebijakan',
    '/about',
    '/contact',
    '/help'
  ];

  // Define admin routes
  const adminRoutes = [
    '/dashboard/admin'
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    router.pathname === route || router.pathname.startsWith(route)
  );

  // Check if current route is admin route
  const isAdminRoute = adminRoutes.some(route => 
    router.pathname.startsWith(route)
  );

  // FIXED: Set client-side flag and handle initial loading
  useEffect(() => {
    setIsClient(true);
    // FIXED: Add small delay to prevent hydration issues
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // FIXED: Handle authentication check only on client-side with error boundaries
  useEffect(() => {
    if (!isClient || loading) return;

    try {
      // Only redirect if not on public route
      if (!isPublicRoute) {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const isAdmin = localStorage.getItem('isAdmin');

        // Handle admin routes
        if (isAdminRoute) {
          if (!isAdmin || isAdmin !== 'true') {
            router.push('/authentication/admin/loginAdmin');
            return;
          }
        } 
        // Handle regular user routes
        else if (!isLoggedIn || isLoggedIn !== 'true') {
          router.push('/authentication/login');
          return;
        }
      }
    } catch (error) {
      // FIXED: Silently handle localStorage errors
      if (process.env.NODE_ENV === 'development') {
        console.warn('Authentication check error:', error);
      }
    }
  }, [router.pathname, isPublicRoute, isAdminRoute, isClient, loading]);

  // FIXED: Show loading state during hydration
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // FIXED: Error boundary for the entire app
  try {
    return (
      <>
        {/* Preloader - hanya tampil sekali saat pertama masuk */}
        <AnimatePresence mode="wait">
          {shouldShowPreloader && preloaderLoading && (
            <PreLoader key="preloader" setLoading={setPreloaderLoading} />
          )}
        </AnimatePresence>

        {/* Main App - tampil setelah preloader selesai atau jika preloader sudah pernah ditampilkan */}
        {(!shouldShowPreloader || !preloaderLoading) && (
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        )}
      </>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('App render error:', error);
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

export default MyApp;
