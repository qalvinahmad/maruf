// Redis cache utility - Server-side only
let Redis;
let redis = null;

// Check if we're in a server environment
const isServer = typeof window === 'undefined';

// Only initialize Redis on server-side
if (isServer) {
  try {
    Redis = require('ioredis');
    
    // Redis connection configuration
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000
    });

    // Redis connection event handlers
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.warn('⚠️ Redis connection error:', err.message);
    });

    redis.on('close', () => {
      console.log('🔌 Redis connection closed');
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  } catch (error) {
    console.warn('⚠️ Redis not available:', error.message);
    console.log('📝 Continuing without Redis caching - using fallback cache only');
  }
}

// Redis Cache Class
class RedisCache {
  constructor() {
    this.prefix = process.env.REDIS_PREFIX || 'app:';
    this.defaultTTL = 300; // 5 minutes default
  }

  // Generate cache key with prefix
  generateKey(key) {
    return `${this.prefix}${key}`;
  }

  // Get data from Redis with server-side check
  async get(key) {
    if (!isServer || !redis) {
      return null;
    }

    try {
      const result = await redis.get(this.generateKey(key));
      if (result) {
        console.log(`✅ Redis cache hit for key: ${key}`);
        return JSON.parse(result);
      }
      console.log(`❌ Redis cache miss for key: ${key}`);
      return null;
    } catch (error) {
      console.warn(`⚠️ Redis get error for key ${key}:`, error.message);
      return null;
    }
  }

  // Set data in Redis with server-side check
  async set(key, data, ttl = 300) {
    if (!isServer || !redis) {
      return false;
    }

    try {
      const stringData = JSON.stringify(data);
      if (ttl > 0) {
        await redis.setex(this.generateKey(key), ttl, stringData);
      } else {
        await redis.set(this.generateKey(key), stringData);
      }
      console.log(`✅ Redis cache set for key: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.warn(`⚠️ Redis set error for key ${key}:`, error.message);
      return false;
    }
  }

  // Delete data from Redis with server-side check
  async del(key) {
    if (!isServer || !redis) {
      return false;
    }

    try {
      const result = await redis.del(this.generateKey(key));
      console.log(`🗑️ Redis cache delete for key: ${key}`);
      return result > 0;
    } catch (error) {
      console.warn(`⚠️ Redis delete error for key ${key}:`, error.message);
      return false;
    }
  }

  // Check Redis connection status
  async isConnected() {
    if (!isServer || !redis) {
      return false;
    }

    try {
      await redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get Redis info and stats
  async getInfo() {
    if (!isServer || !redis) {
      return { connected: false, message: 'Redis not available or client-side' };
    }

    try {
      const info = await redis.info('memory');
      const dbsize = await redis.dbsize();
      return {
        connected: true,
        dbsize,
        info: info
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  // Close Redis connection
  async disconnect() {
    if (!isServer || !redis) {
      return;
    }

    try {
      await redis.disconnect();
      console.log('🔌 Redis disconnected');
    } catch (error) {
      console.warn('⚠️ Redis disconnect error:', error.message);
    }
  }
}

// Export singleton instance
const redisCache = new RedisCache();
export default redisCache;
