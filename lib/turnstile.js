// Cloudflare Turnstile Configuration
export const TURNSTILE_CONFIG = {
  // Site Key untuk frontend (aman untuk disimpan di kode)
  // Using your actual Cloudflare Turnstile keys
  SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAABlcFtkVlG8Sh9vp',
  
  // Secret Key HANYA untuk backend - JANGAN simpan di frontend!
  // Gunakan environment variable untuk production
  SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAABlcFq1k6FvxRCB_A7kTnA2FdB8',
  
  // API endpoint untuk verifikasi
  VERIFY_URL: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  
  // Default options
  DEFAULT_OPTIONS: {
    theme: 'light',
    size: 'normal',
    language: 'id', // Indonesian
    retry: 'auto',
    'retry-interval': 8000,
    'refresh-expired': 'auto',
    'error-callback': function(error) {
      console.error('Turnstile error callback:', error);
    }
  }
};

// Load Turnstile script
export const loadTurnstileScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.turnstile) {
      console.log('Turnstile already loaded');
      resolve(window.turnstile);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="turnstile"]');
    if (existingScript) {
      console.log('Turnstile script already in DOM, waiting for load');
      existingScript.onload = () => {
        console.log('Existing Turnstile script loaded');
        resolve(window.turnstile);
      };
      existingScript.onerror = (error) => {
        console.error('Existing Turnstile script failed to load:', error);
        reject(error);
      };
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
    script.async = true;
    script.defer = true;
    
    // Global callback for when Turnstile is ready
    window.onTurnstileLoad = () => {
      console.log('Turnstile loaded via callback');
      resolve(window.turnstile);
    };
    
    script.onload = () => {
      console.log('Turnstile script loaded successfully');
      // Wait a bit for the API to be ready
      setTimeout(() => {
        if (window.turnstile) {
          resolve(window.turnstile);
        } else {
          reject(new Error('Turnstile API not available after script load'));
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Turnstile script:', error);
      reject(error);
    };
    
    document.head.appendChild(script);
  });
};

// Verify token on server side
export const verifyTurnstileToken = async (token, remoteip = null) => {
  try {
    const response = await fetch(TURNSTILE_CONFIG.VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: TURNSTILE_CONFIG.SECRET_KEY,
        response: token,
        ...(remoteip && { remoteip })
      })
    });

    const result = await response.json();
    
    console.log('Turnstile verification result:', result);
    
    return {
      success: result.success,
      errorCodes: result['error-codes'] || [],
      challenge_ts: result.challenge_ts,
      hostname: result.hostname
    };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return {
      success: false,
      errorCodes: ['network-error'],
      error: error.message
    };
  }
};
