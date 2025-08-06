// utils/chunkRetry.js
// Utility untuk handle chunk loading retry

export const retryChunkLoad = (fn, retriesLeft = 3, interval = 500) => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        if (retriesLeft === 0) {
          reject(error);
          return;
        }

        console.warn(`Chunk load failed, retrying... (${retriesLeft} attempts left)`);
        
        setTimeout(() => {
          retryChunkLoad(fn, retriesLeft - 1, interval)
            .then(resolve)
            .catch(reject);
        }, interval);
      });
  });
};

export const withChunkRetry = (ComponentLoader) => {
  return () => retryChunkLoad(() => ComponentLoader());
};

// Router error handler for chunk loading issues
export const handleRouterError = (error) => {
  if (error.message?.includes('Loading chunk') || error.message?.includes('Failed to load chunk')) {
    console.warn('Chunk loading error detected, attempting reload...');
    // Force reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return;
  }
  
  // Re-throw other errors
  throw error;
};

// Service worker registration to handle chunk caching
export const registerChunkServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw-chunk-fallback.js')
      .then((registration) => {
        console.log('Chunk service worker registered:', registration);
      })
      .catch((error) => {
        console.log('Chunk service worker registration failed:', error);
      });
  }
};
