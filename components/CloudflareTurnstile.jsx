import { useEffect, useRef, useState } from 'react';
import { TURNSTILE_CONFIG, loadTurnstileScript } from '../lib/turnstile';

const CloudflareTurnstile = ({ 
  onVerify, 
  onExpire, 
  onError,
  onLoad,
  theme = 'light',
  size = 'normal',
  language = 'id',
  className = '',
  disabled = false
}) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [developmentMode, setDevelopmentMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Initialize Turnstile
  useEffect(() => {
    let mounted = true;

    const initTurnstile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Initializing Turnstile with site key:', TURNSTILE_CONFIG.SITE_KEY);

        // Load Turnstile script
        await loadTurnstileScript();

        if (!mounted) return;

        // Wait a bit for script to be fully ready
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!window.turnstile) {
          throw new Error('Turnstile script loaded but API not available');
        }

        console.log('Turnstile API ready, rendering widget');

        // Render widget
        if (containerRef.current && !widgetRef.current) {
          try {
            widgetRef.current = window.turnstile.render(containerRef.current, {
              sitekey: TURNSTILE_CONFIG.SITE_KEY,
              theme: theme,
              size: size,
              language: language,
              callback: (token) => {
                console.log('Turnstile verification successful:', token.substring(0, 20) + '...');
                onVerify && onVerify(token);
              },
              'expired-callback': () => {
                console.log('Turnstile token expired');
                onExpire && onExpire();
              },
              'error-callback': (error) => {
                console.error('Turnstile error callback:', error);
                let errorMessage = 'Terjadi kesalahan pada verifikasi keamanan';
                
                // Handle specific error codes
                if (error === '400020') {
                  errorMessage = 'Site key tidak valid atau domain tidak terdaftar';
                } else if (error === '400010') {
                  errorMessage = 'Site key tidak ditemukan';
                } else if (error === '400030') {
                  errorMessage = 'Permintaan tidak valid';
                }
                
                setError(errorMessage);
                onError && onError(errorMessage);
              },
              'before-interactive-callback': () => {
                console.log('Turnstile interaction started');
              },
              'after-interactive-callback': () => {
                console.log('Turnstile interaction completed');
              }
            });
            
            console.log('Turnstile widget rendered with ID:', widgetRef.current);
          } catch (renderError) {
            console.error('Failed to render Turnstile widget:', renderError);
            throw renderError;
          }
        }

        setIsLoaded(true);
        setIsLoading(false);
        onLoad && onLoad();

      } catch (error) {
        console.error('Failed to initialize Turnstile:', error);
        if (mounted) {
          let errorMessage = error.message;
          if (error.message.includes('script')) {
            errorMessage = 'Gagal memuat skrip verifikasi keamanan';
          }
          
          // Try to retry up to maxRetries times
          if (retryCount < maxRetries) {
            console.log(`Retrying Turnstile initialization (${retryCount + 1}/${maxRetries})`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              if (mounted) {
                initTurnstile();
              }
            }, 2000 * (retryCount + 1)); // Exponential backoff
            return;
          }
          
          // If all retries failed, enable development mode
          console.warn('Turnstile failed after all retries, enabling development mode');
          setDevelopmentMode(true);
          setError(null);
          setIsLoading(false);
          setIsLoaded(true);
          onLoad && onLoad();
        }
      }
    };

    // Initialize on mount
    initTurnstile();

    return () => {
      mounted = false;
      // Cleanup widget
      if (widgetRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetRef.current);
          console.log('Turnstile widget removed');
        } catch (e) {
          console.warn('Failed to remove Turnstile widget:', e);
        }
        widgetRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Reset widget
  const reset = () => {
    if (widgetRef.current && window.turnstile) {
      window.turnstile.reset(widgetRef.current);
    }
  };

  // Get response token
  const getResponse = () => {
    if (widgetRef.current && window.turnstile) {
      return window.turnstile.getResponse(widgetRef.current);
    }
    return null;
  };

  // Expose methods
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.reset = reset;
      containerRef.current.getResponse = getResponse;
    }
  }, [isLoaded]);

  // Development mode fallback
  const handleDevelopmentVerify = () => {
    const mockToken = 'dev_token_' + Date.now();
    console.log('Development mode: Mock verification successful');
    onVerify && onVerify(mockToken);
  };

  if (developmentMode) {
    return (
      <div className={`turnstile-dev-mode p-4 border border-blue-300 rounded-lg bg-blue-50 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-blue-700">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Mode Pengembangan</span>
          </div>
          <button
            onClick={handleDevelopmentVerify}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            disabled={disabled}
          >
            Verifikasi Manual
          </button>
        </div>
        <p className="text-blue-600 text-xs mt-2">
          Cloudflare Turnstile tidak tersedia. Menggunakan verifikasi manual untuk pengembangan.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`turnstile-error p-4 border border-red-300 rounded-lg bg-red-50 ${className}`}>
        <div className="flex items-center text-red-700">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Verifikasi keamanan gagal dimuat</span>
        </div>
        <p className="text-red-600 text-xs mt-1">
          {error}. Silakan refresh halaman atau aktifkan JavaScript.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-red-700 hover:text-red-900 underline"
        >
          Muat ulang halaman
        </button>
      </div>
    );
  }

  return (
    <div className={`turnstile-container ${className}`}>
      {isLoading && (
        <div className="turnstile-loading flex items-center justify-center p-4 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center text-gray-600">
            <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Memuat verifikasi keamanan...</span>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className={`turnstile-widget ${isLoading ? 'hidden' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ minHeight: isLoading ? 0 : '65px' }}
      />
    </div>
  );
};

export default CloudflareTurnstile;
