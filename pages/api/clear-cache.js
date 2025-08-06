import { pageCache, shopCache } from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, userId } = req.body;

    switch (type) {
      case 'shop':
        await shopCache.clearShopCache();
        if (userId) {
          await shopCache.clearUserCache(userId);
        }
        break;
      
      case 'homepage':
        await pageCache.clearPageCache();
        break;
      
      case 'user':
        if (userId) {
          await shopCache.clearUserCache(userId);
        } else {
          return res.status(400).json({ error: 'User ID required for user cache clear' });
        }
        break;
      
      case 'all':
        await Promise.all([
          shopCache.clearShopCache(),
          pageCache.clearPageCache()
        ]);
        if (userId) {
          await shopCache.clearUserCache(userId);
        }
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid cache type' });
    }

    return res.status(200).json({ 
      success: true, 
      message: `${type} cache cleared successfully` 
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    return res.status(500).json({ 
      error: 'Failed to clear cache',
      details: error.message 
    });
  }
}
