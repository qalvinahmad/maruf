// Client-side cache implementation using localStorage and memory cache
class ClientCache {
  constructor() {
    this.memoryCache = new Map();
    this.isClient = typeof window !== 'undefined';
  }

  // Generate cache key with prefix
  getCacheKey(key) {
    return `cache_${key}`;
  }

  // Set cache with TTL (time to live in seconds)
  async set(key, data, ttl = 300) {
    const cacheKey = this.getCacheKey(key);
    const expiresAt = Date.now() + (ttl * 1000);
    const cacheData = {
      data,
      expiresAt
    };

    try {
      // Store in memory cache
      this.memoryCache.set(cacheKey, cacheData);

      // Store in localStorage if available (client-side only)
      if (this.isClient) {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }

      return true;
    } catch (error) {
      console.warn('Cache set failed:', error);
      return false;
    }
  }

  // Get cache data
  async get(key) {
    const cacheKey = this.getCacheKey(key);

    try {
      // Try memory cache first
      let cacheData = this.memoryCache.get(cacheKey);

      // Fallback to localStorage if not in memory
      if (!cacheData && this.isClient) {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          cacheData = JSON.parse(stored);
          // Restore to memory cache
          this.memoryCache.set(cacheKey, cacheData);
        }
      }

      // Check if cache is expired
      if (cacheData) {
        if (Date.now() > cacheData.expiresAt) {
          // Cache expired, remove it
          await this.del(key);
          return null;
        }
        return cacheData.data;
      }

      return null;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  // Delete cache entry
  async del(key) {
    const cacheKey = this.getCacheKey(key);

    try {
      // Remove from memory cache
      this.memoryCache.delete(cacheKey);

      // Remove from localStorage if available
      if (this.isClient) {
        localStorage.removeItem(cacheKey);
      }

      return true;
    } catch (error) {
      console.warn('Cache delete failed:', error);
      return false;
    }
  }

  // Clear all cache entries
  async clear() {
    try {
      // Clear memory cache
      this.memoryCache.clear();

      // Clear localStorage cache entries if available
      if (this.isClient) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      }

      return true;
    } catch (error) {
      console.warn('Cache clear failed:', error);
      return false;
    }
  }

  // Get cache statistics
  getStats() {
    const memorySize = this.memoryCache.size;
    let localStorageSize = 0;

    if (this.isClient) {
      const keys = Object.keys(localStorage);
      localStorageSize = keys.filter(key => key.startsWith('cache_')).length;
    }

    return {
      memoryEntries: memorySize,
      localStorageEntries: localStorageSize,
      isClient: this.isClient
    };
  }
}

// Create and export singleton instance
const clientCache = new ClientCache();
export { clientCache };
