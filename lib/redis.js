import { createClient } from 'redis';

let client;

// Initialize Redis client
const initRedis = async () => {
  // Check if Redis is explicitly disabled
  if (process.env.DISABLE_REDIS === 'true') {
    console.log('Redis explicitly disabled via DISABLE_REDIS environment variable');
    return null;
  }

  // In development mode, disable Redis if ENABLE_REDIS_DEV is false
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_REDIS_DEV === 'false') {
    console.log('Redis disabled in development mode');
    return null;
  }

  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_unfulfilled_commands: true,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('Redis reconnection failed after 3 attempts');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    client.on('error', (err) => {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.log('Redis Client Error:', err.message);
      }
    });

    client.on('connect', () => {
      console.log('Redis Client Connected successfully');
    });

    client.on('reconnecting', () => {
      console.log('Redis Client Reconnecting...');
    });

    client.on('ready', () => {
      console.log('Redis Client Ready');
    });

    try {
      await client.connect();
      console.log('Redis connection established');
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Failed to connect to Redis:', error.message);
      }
      // In development, return null if Redis connection fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Redis connection failed, continuing without cache in development mode');
        return null;
      }
      throw error;
    }
  }
  
  // Test connection
  try {
    await client.ping();
    console.log('Redis connection test successful');
  } catch (error) {
    console.error('Redis ping failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    throw error;
  }
  
  return client;
};

// Cache functions for shop
export const shopCache = {
  // Cache shop items by category
  setShopItems: async (category, data, ttl = 300) => { // 5 minutes
    try {
      const redisClient = await initRedis();
      if (!redisClient) {
        console.log('Redis not available, skipping cache set for shop items');
        return;
      }
      
      const key = `shop_items:${category}`;
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      console.log(`Shop items cached successfully for category: ${category}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error caching shop items:', error.message);
      }
    }
  },

  getShopItems: async (category) => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) {
        console.log('Redis not available, cache miss for shop items');
        return null;
      }
      
      const key = `shop_items:${category}`;
      const data = await redisClient.get(key);
      
      if (data) {
        console.log(`Cache HIT for shop items category: ${category}`);
        return JSON.parse(data);
      } else {
        console.log(`Cache MISS for shop items category: ${category}`);
        return null;
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error getting cached shop items:', error.message);
      }
      return null;
    }
  },

  // Cache user inventory
  setUserInventory: async (userId, data, ttl = 600) => { // 10 minutes
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const key = `user_inventory:${userId}`;
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      console.log(`User inventory cached for user: ${userId}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error caching user inventory:', error);
      }
    }
  },

  getUserInventory: async (userId) => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return null; // Return null if Redis is not available
      
      const key = `user_inventory:${userId}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error getting cached user inventory:', error);
      }
      return null;
    }
  },

  // Cache flash sale data
  setFlashSale: async (data, ttl = 3600) => { // 1 hour
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const key = 'flash_sale:current';
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      console.log('Flash sale data cached');
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error caching flash sale:', error);
      }
    }
  },

  getFlashSale: async () => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return null; // Return null if Redis is not available
      
      const key = 'flash_sale:current';
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error getting cached flash sale:', error);
      }
      return null;
    }
  },

  // Cache user profile
  setUserProfile: async (userId, data, ttl = 300) => { // 5 minutes
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const key = `user_profile:${userId}`;
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      console.log(`User profile cached for user: ${userId}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error caching user profile:', error);
      }
    }
  },

  getUserProfile: async (userId) => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return null; // Return null if Redis is not available
      
      const key = `user_profile:${userId}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error getting cached user profile:', error);
      }
      return null;
    }
  },

  // Clear specific user cache when data changes
  clearUserCache: async (userId) => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const keys = [
        `user_inventory:${userId}`,
        `user_profile:${userId}`
      ];
      await redisClient.del(keys);
      console.log(`Cleared cache for user: ${userId}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error clearing user cache:', error);
      }
    }
  },

  // Clear all shop cache
  clearShopCache: async () => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const keys = await redisClient.keys('shop_items:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      await redisClient.del('flash_sale:current');
      console.log('Cleared all shop cache');
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error clearing shop cache:', error);
      }
    }
  }
};

// Cache functions for homepage
export const pageCache = {
  // Cache testimonials
  setTestimonials: async (data, ttl = 3600) => { // 1 hour
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const key = 'homepage:testimonials';
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      console.log('Testimonials cached');
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error caching testimonials:', error);
      }
    }
  },

  getTestimonials: async () => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return null; // Return null if Redis is not available
      
      const key = 'homepage:testimonials';
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error getting cached testimonials:', error);
      }
      return null;
    }
  },

  // Cache FAQ data
  setFAQ: async (data, ttl = 7200) => { // 2 hours
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const key = 'homepage:faq';
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      console.log('FAQ data cached');
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error caching FAQ:', error);
      }
    }
  },

  getFAQ: async () => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return null; // Return null if Redis is not available
      
      const key = 'homepage:faq';
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error getting cached FAQ:', error);
      }
      return null;
    }
  },

  // Cache course levels
  setCourseLevels: async (data, ttl = 3600) => { // 1 hour
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const key = 'homepage:course_levels';
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      console.log('Course levels cached');
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error caching course levels:', error);
      }
    }
  },

  getCourseLevels: async () => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return null; // Return null if Redis is not available
      
      const key = 'homepage:course_levels';
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error getting cached course levels:', error);
      }
      return null;
    }
  },

  // Clear homepage cache
  clearPageCache: async () => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const keys = await redisClient.keys('homepage:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      console.log('Cleared homepage cache');
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error clearing homepage cache:', error);
      }
    }
  }
};

// Session management
export const sessionCache = {
  setSession: async (sessionId, userData, ttl = 86400) => { // 24 hours
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const key = `session:${sessionId}`;
      await redisClient.setEx(key, ttl, JSON.stringify(userData));
      console.log(`Session stored for: ${sessionId}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error storing session:', error);
      }
    }
  },

  getSession: async (sessionId) => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return null; // Return null if Redis is not available
      
      const key = `session:${sessionId}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error getting session:', error);
      }
      return null;
    }
  },

  deleteSession: async (sessionId) => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) return; // Skip if Redis is not available
      
      const key = `session:${sessionId}`;
      await redisClient.del(key);
      console.log(`Session deleted for: ${sessionId}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error deleting session:', error);
      }
    }
  }
};

// Rate limiting
export const rateLimiter = {
  checkRateLimit: async (identifier, maxRequests = 100, windowSeconds = 3600) => {
    try {
      const redisClient = await initRedis();
      if (!redisClient) {
        // If Redis is not available, allow all requests in development
        return { allowed: true, count: 0, remaining: maxRequests };
      }
      
      const key = `rate_limit:${identifier}`;
      
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }
      
      return {
        allowed: current <= maxRequests,
        count: current,
        remaining: Math.max(0, maxRequests - current),
        resetTime: Date.now() + (windowSeconds * 1000)
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'development' || process.env.SUPPRESS_REDIS_WARNINGS !== 'true') {
        console.error('Error checking rate limit:', error);
      }
      return { allowed: true, count: 0, remaining: maxRequests };
    }
  }
};

export default initRedis;
