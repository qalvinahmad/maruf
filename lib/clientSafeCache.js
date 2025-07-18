// Client-side safe cache interface
let cacheInstance = null;

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Initialize cache only on server side
const initCache = async () => {
  if (!isServer) {
    // Return memory-only cache for client side
    return {
      async get(key) { return null; },
      async set(key, value, ttl) { return 'OK'; },
      async del(key) { return 1; },
      async clearUserCache(userId) { return; },
      async setUserInventory(key, data, ttl) { return; },
      async getUserInventory(key) { return null; }
    };
  }

  // Only import Redis on server side
  try {
    const { shopCache } = await import('./redis');
    return shopCache;
  } catch (error) {
    console.log('Redis not available, using no-op cache');
    return {
      async get(key) { return null; },
      async set(key, value, ttl) { return 'OK'; },
      async del(key) { return 1; },
      async clearUserCache(userId) { return; },
      async setUserInventory(key, data, ttl) { return; },
      async getUserInventory(key) { return null; }
    };
  }
};

// Get cache instance
export const getCache = async () => {
  if (!cacheInstance) {
    cacheInstance = await initCache();
  }
  return cacheInstance;
};

// Safe cache operations
export const safeCache = {
  async getUserInventory(key) {
    try {
      const cache = await getCache();
      return await cache.getUserInventory(key);
    } catch (error) {
      console.log('Cache get error:', error.message);
      return null;
    }
  },

  async setUserInventory(key, data, ttl = 300) {
    try {
      const cache = await getCache();
      return await cache.setUserInventory(key, data, ttl);
    } catch (error) {
      console.log('Cache set error:', error.message);
      return;
    }
  },

  async clearUserCache(userId) {
    try {
      const cache = await getCache();
      return await cache.clearUserCache(userId);
    } catch (error) {
      console.log('Cache clear error:', error.message);
      return;
    }
  }
};

// General cache functions for any data
export const getCachedData = async (key) => {
  try {
    const cache = await getCache();
    const data = await cache.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log('Cache get error:', error.message);
    return null;
  }
};

export const setCachedData = async (key, data, ttl = 300) => {
  try {
    const cache = await getCache();
    if (data === null) {
      // Delete cache if data is null
      return await cache.del(key);
    }
    return await cache.set(key, JSON.stringify(data), ttl);
  } catch (error) {
    console.log('Cache set error:', error.message);
    return;
  }
};

export default safeCache;
