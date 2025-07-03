# Frontend Caching Implementation

## Overview

This implementation provides intelligent frontend caching to significantly improve application performance by reducing API calls and loading times. The cache system includes automatic expiration, background refresh, and graceful fallback to stale data when the API is unavailable.

## Features

### 🚀 Performance Benefits
- **Instant Loading**: Cached data loads in < 100ms vs 2-5 seconds for API calls
- **Reduced Server Load**: Fewer API requests to the backend
- **Better UX**: No loading spinners for cached data
- **Offline Resilience**: App continues working with stale data when API is down

### 🧠 Smart Caching
- **TTL-based Expiration**: Each endpoint has configurable cache duration
- **Background Refresh**: Stale data is refreshed in the background
- **Memory Management**: Automatic cleanup of expired items
- **Size Limits**: Prevents memory overflow with configurable limits

### 🛠️ Developer Tools
- **Cache Manager UI**: Monitor and manage cache from the interface
- **Cache Statistics**: Real-time cache usage and performance metrics
- **Pattern-based Invalidation**: Selectively clear cache entries
- **Debug Logging**: Console logs for cache hits/misses and operations

## Architecture

### Core Components

1. **CacheService** (`src/services/cache.js`)
   - In-memory cache with TTL support
   - Automatic cleanup and memory management
   - Cache key generation and pattern matching

2. **CachedAPI** (`src/services/cachedApi.js`)
   - Wraps original API calls with caching logic
   - Background refresh for stale data
   - Graceful fallback to stale data on API errors

3. **CacheManager** (`src/components/CacheManager.js`)
   - UI for monitoring and managing cache
   - Statistics display and cache controls

4. **useCache Hook** (`src/hooks/useCache.js`)
   - React hook for cache state management
   - Real-time cache statistics

## Configuration

### Cache TTL Settings

```javascript
export const CACHE_CONFIG = {
  'customer-health': {
    ttl: 10 * 60 * 1000, // 10 minutes
    backgroundRefresh: true
  },
  'customers': {
    ttl: 5 * 60 * 1000, // 5 minutes
    backgroundRefresh: true
  },
  'contract-performance': {
    ttl: 15 * 60 * 1000, // 15 minutes
    backgroundRefresh: true
  },
  // ... more endpoints
};
```

### Cache Service Settings

```javascript
class CacheService {
  constructor() {
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    this.maxCacheSize = 50; // Maximum cached items
  }
}
```

## Usage

### Basic Usage

Replace API imports with cached versions:

```javascript
// Before
import { getCustomerHealth } from '../services/api';

// After
import { getCustomerHealth } from '../services/cachedApi';

// Usage remains the same
const data = await getCustomerHealth();
```

### Force Refresh

```javascript
// Force fresh data from API
const freshData = await getCustomerHealth(true);
```

### Cache Management

```javascript
import { clearCache, getCacheStats, invalidateCache } from '../services/cachedApi';

// Clear all cache
clearCache();

// Get cache statistics
const stats = getCacheStats();

// Invalidate specific patterns
invalidateCache('customer.*'); // Clear all customer-related cache
```

### Using the Cache Hook

```javascript
import useCache from '../hooks/useCache';

function MyComponent() {
  const { 
    cacheStats, 
    getCacheUsagePercentage, 
    isCacheNearlyFull,
    getCacheStatus 
  } = useCache();

  return (
    <div>
      <p>Cache Usage: {getCacheUsagePercentage().toFixed(1)}%</p>
      <p>Status: {getCacheStatus()}</p>
    </div>
  );
}
```

## Performance Monitoring

### Cache Hit Indicators

The UI shows when data is loaded from cache:
- Green "Cached" indicator appears when using cached data
- Load time is displayed (cached data loads in < 100ms)
- Cache statistics show current usage

### Console Logging

Cache operations are logged to console:
```
Cache hit: customer-health
Cache set: customers?limit:50 (expires in 300s)
Background refresh completed for customer-health
Cache evicted oldest: old-cache-key
```

## Best Practices

### 1. TTL Configuration
- Set shorter TTL for frequently changing data
- Use longer TTL for static reference data
- Enable background refresh for critical data

### 2. Memory Management
- Monitor cache size in production
- Adjust `maxCacheSize` based on available memory
- Use pattern invalidation to clear specific data types

### 3. Error Handling
- The cache automatically falls back to stale data on API errors
- Monitor console warnings for cache fallback usage
- Consider implementing retry logic for critical data

### 4. Development
- Use cache manager to monitor cache behavior
- Test with network throttling to see cache benefits
- Clear cache when testing fresh data flows

## Troubleshooting

### Common Issues

1. **Data not updating**
   - Check if cache TTL is too long
   - Use force refresh: `getCustomerHealth(true)`
   - Clear specific cache patterns

2. **Memory usage high**
   - Reduce `maxCacheSize` in CacheService
   - Implement more aggressive cleanup
   - Monitor cache statistics

3. **Background refresh not working**
   - Check if `backgroundRefresh` is enabled for the endpoint
   - Verify API endpoints are accessible
   - Check console for background refresh errors

### Debug Mode

Enable detailed logging by setting:
```javascript
localStorage.setItem('debugCache', 'true');
```

## Future Enhancements

1. **Persistent Cache**: Store cache in localStorage for page reloads
2. **Cache Warming**: Pre-populate cache with frequently accessed data
3. **Advanced Invalidation**: Time-based and event-based cache invalidation
4. **Cache Analytics**: Detailed performance metrics and optimization suggestions
5. **Distributed Cache**: Share cache across browser tabs/windows

## Migration Guide

### From Direct API Calls

1. Update imports:
   ```javascript
   // Old
   import { getCustomerHealth } from '../services/api';
   
   // New
   import { getCustomerHealth } from '../services/cachedApi';
   ```

2. Add cache indicators to your UI:
   ```javascript
   const [isUsingCache, setIsUsingCache] = useState(false);
   
   // In your fetch function
   const startTime = performance.now();
   const data = await getCustomerHealth();
   const loadTime = performance.now() - startTime;
   
   if (loadTime < 100) {
     setIsUsingCache(true);
   }
   ```

3. Add cache management UI where needed:
   ```javascript
   import CacheManager from '../components/CacheManager';
   
   <CacheManager isOpen={showCacheManager} onClose={() => setShowCacheManager(false)} />
   ```

The caching system is designed to be transparent - existing code will work immediately with performance improvements, and you can gradually add cache management features as needed. 