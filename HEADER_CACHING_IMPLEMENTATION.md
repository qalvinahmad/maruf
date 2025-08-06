# Header Caching Implementation

## Overview
Sistem caching telah diimplementasikan pada Header component untuk meningkatkan performa loading dan mengurangi panggilan database yang tidak perlu. Setiap kali user berpindah halaman, data akan dimuat dari memory cache terlebih dahulu sehingga loading menjadi lebih cepat.

## Features Implemented

### 1. Memory Cache System
- **Class**: `HeaderCache` - Custom cache implementation dengan TTL (Time To Live)
- **Location**: Di dalam Header.jsx sebagai singleton instance
- **TTL Default**: 5 menit (300000 ms)
- **Auto-cleanup**: Automatic cleanup menggunakan setTimeout

### 2. Cached Data Types

#### a. Avatar Data
- **Cache Key**: `avatar_${userId}`
- **TTL**: 10 menit (600000 ms)
- **Data**: Avatar image, thumbnail, name, id, source, isVideo flag
- **Sources**: avatars table, user_inventory, shop_items

#### b. Badge Data
- **Cache Key**: `badge_${userId}`
- **TTL**: 10 menit (600000 ms)
- **Data**: Badge image, thumbnail, name, id, badge_type, badge_color, source

#### c. Level Data
- **Cache Key**: `level_${userId}`
- **TTL**: 5 menit (300000 ms)
- **Data**: User level, description, combined level string
- **Source**: user_progress table

#### d. Profile Data
- **Cache Key**: `profile_${userId}`
- **TTL**: 5 menit (300000 ms)
- **Data**: Full profile information including points, energy, streak, etc.

#### e. Notifications Status
- **Cache Key**: `notifications_${userId}`
- **TTL**: 2 menit (120000 ms)
- **Data**: Boolean - hasUnreadNotifications status

### 3. Cache Operations

#### Set Cache
```javascript
headerCache.set(key, data, ttl)
// Contoh:
headerCache.set(cacheKeys.avatar, avatarResult, 600000);
```

#### Get Cache
```javascript
const cachedData = headerCache.get(key, maxAge)
// Contoh:
const cachedAvatar = headerCache.get(cacheKeys.avatar);
```

#### Clear Cache
```javascript
headerCache.clear(prefix) // Clear dengan prefix
headerCache.clear() // Clear semua
// Contoh:
headerCache.clear(`avatar_${userId}`);
```

### 4. Cache Invalidation Strategy

#### Real-time Updates
- **Profile Changes**: Cache cleared saat ada perubahan di profiles table
- **Inventory Changes**: Avatar/badge cache cleared saat equipped status berubah
- **Avatar Table Changes**: Avatar cache cleared saat ada perubahan di avatars table
- **Progress Changes**: Level cache cleared saat ada perubahan progress

#### Manual Refresh
- **Points Update**: Profile cache cleared saat points update terdeteksi
- **Custom Events**: Cache cleared dan di-refresh saat ada custom events

#### Periodic Updates
- **Notifications**: Cache cleared setiap 2 menit untuk check notifications baru

### 5. Performance Optimizations

#### Load from Cache First
```javascript
useEffect(() => {
    // Load dari cache saat component mount
    const cachedAvatar = headerCache.get(cacheKeys.avatar);
    if (cachedAvatar) {
        setUserAvatar(cachedAvatar);
        setIsLoadingAvatar(false);
    }
}, [user?.id, cacheKeys]);
```

#### Debouncing
- **Avatar Fetch**: 3 detik debouncing untuk mencegah multiple requests
- **Database Queries**: Hanya fetch jika cache miss

#### Smart Caching
- **Cache Hits**: Data loaded dari memory tanpa database query
- **Cache Miss**: Data fetched dari database kemudian di-cache
- **Cache Stats**: Tracking hit/miss ratio untuk monitoring

### 6. Cache Statistics & Monitoring

#### Development Mode
```javascript
// Cache stats ditampilkan di console setiap 30 detik
console.log('🚀 Header Cache Stats:', {
    cacheSize: headerCache.size(),
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    hitRate: '85.7%',
    cachedKeys: ['avatar_user123', 'profile_user123', ...]
});
```

#### Visual Debug Panel
- Cache size dan hit/miss stats ditampilkan di pojok kanan atas (development only)
- Format: `Cache: 5 | H:12 M:3` (Cache size: 5, Hits: 12, Misses: 3)

### 7. Memory Management

#### Automatic Cleanup
- **TTL Expiration**: Data otomatis dihapus setelah TTL expired
- **Component Unmount**: Cache cleared saat user logout/component unmount
- **Memory Limit**: Cache menggunakan Map() dengan efficient memory usage

#### Cache Size Control
- **Per User**: Maximum 5 cache keys per user (avatar, badge, level, profile, notifications)
- **Total Memory**: Lightweight objects dengan JSON serializable data
- **Garbage Collection**: Automatic via setTimeout cleanup

### 8. Integration Points

#### useCallback untuk Functions
```javascript
const fetchUserAvatar = useCallback(async (userId) => {
    // Check cache first
    const cachedAvatar = headerCache.get(cacheKeys.avatar);
    if (cachedAvatar) return;
    
    // Fetch and cache
    const result = await fetchFromDatabase();
    headerCache.set(cacheKeys.avatar, result, 600000);
}, [cacheKeys]);
```

#### Real-time Subscriptions
```javascript
const profileSubscription = supabase
    .channel('profile_changes')
    .on('postgres_changes', {}, (payload) => {
        // Clear cache dan update
        headerCache.clear(`profile_${user.id}`);
        setProfileData(payload.new);
    });
```

## Benefits

### 1. Performance Improvements
- **Faster Loading**: Data loaded dari memory cache (microseconds vs milliseconds)
- **Reduced Database Calls**: Cache hit menghindari unnecessary database queries
- **Better UX**: Instant loading saat page navigation

### 2. Network Optimization
- **Bandwidth Saving**: Mengurangi API calls dan data transfer
- **Server Load**: Mengurangi beban server database
- **Cost Efficiency**: Fewer database operations

### 3. User Experience
- **Seamless Navigation**: Smooth transition antar halaman
- **Consistent State**: Data consistency dengan real-time updates
- **Offline Support**: Cached data available saat koneksi bermasalah

## Usage Examples

### Basic Cache Operation
```javascript
// Set cache
headerCache.set('user_avatar_123', avatarData, 600000);

// Get cache
const cached = headerCache.get('user_avatar_123');
if (cached) {
    console.log('Cache hit!');
    setUserAvatar(cached);
} else {
    console.log('Cache miss, fetching from database...');
    fetchFromDatabase();
}

// Clear cache
headerCache.clear('user_avatar_123');
```

### Cache with TTL Check
```javascript
// Get dengan custom max age (1 menit)
const recentData = headerCache.get('notifications_123', 60000);
if (recentData === null) {
    // Data expired atau tidak ada, fetch baru
    fetchNotifications();
}
```

### Cache Statistics
```javascript
// Development monitoring
const stats = {
    size: headerCache.size(),
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    hitRate: (hits / (hits + misses) * 100).toFixed(2) + '%'
};
console.log('Cache Performance:', stats);
```

## Future Enhancements

1. **Persistent Cache**: Integration dengan localStorage untuk cache persistence
2. **Cache Compression**: Data compression untuk larger datasets
3. **Predictive Caching**: Pre-load data yang kemungkinan akan diakses
4. **Cache Sharing**: Shared cache antar components
5. **Advanced TTL**: Dynamic TTL berdasarkan data type dan usage patterns

## Monitoring & Debugging

### Development Mode
- Console logs menunjukkan cache operations
- Visual debug panel di header
- Cache statistics setiap 30 detik

### Production Mode
- Silent cache operations
- Error handling tanpa console spam
- Performance monitoring via cache stats

---

**Note**: Sistem caching ini dirancang untuk optimal performance dengan minimal memory footprint. All cache operations are async-safe dan compatible dengan React concurrent features.
