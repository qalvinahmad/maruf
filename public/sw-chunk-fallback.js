// Service Worker untuk handle chunk loading fallback
const CACHE_NAME = 'chunk-fallback-v1';

self.addEventListener('install', (event) => {
  console.log('Chunk fallback service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Chunk fallback service worker activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle .js chunk requests
  if (event.request.url.includes('/_next/static/chunks/') && event.request.url.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful, cache and return
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If fetch fails, try to get from cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('Serving chunk from cache:', event.request.url);
                return cachedResponse;
              }
              
              // If not in cache, return a fallback response
              console.log('Chunk not found, serving fallback:', event.request.url);
              return new Response(
                '// Chunk loading fallback\nconsole.warn("Chunk failed to load, using fallback");',
                {
                  status: 200,
                  statusText: 'OK',
                  headers: {
                    'Content-Type': 'application/javascript',
                  },
                }
              );
            });
        })
    );
  }
});
