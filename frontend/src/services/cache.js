class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 30 * 60 * 1000; // 30 minutes default (increased from 5 minutes)
    this.maxCacheSize = 50; // Maximum number of cached items
  }

  // Generate cache key from endpoint and parameters
  generateKey(endpoint, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${endpoint}${paramString ? `?${paramString}` : ''}`;
  }

  // Set cache item with TTL
  set(key, data, ttl = this.defaultTTL) {
    // Clean up expired items first
    this.cleanup();

    // Check cache size limit
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    const item = {
      data,
      timestamp: Date.now(),
      ttl,
      expiresAt: Date.now() + ttl
    };

    this.cache.set(key, item);
    console.log(`Cache set: ${key} (expires in ${ttl / 1000}s)`);
  }

  // Get cache item
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`Cache hit: ${key}`);
    return item.data;
  }

  // Check if cache item exists and is not expired
  has(key) {
    const item = this.cache.get(key);
    return item && Date.now() <= item.expiresAt;
  }

  // Get cache item with age information
  getWithAge(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    const age = Date.now() - item.timestamp;
    const timeUntilExpiry = item.expiresAt - Date.now();
    
    return {
      data: item.data,
      age,
      timeUntilExpiry,
      isStale: age > (item.ttl * 0.7) // Consider stale after 70% of TTL
    };
  }

  // Delete specific cache item
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  // Clean up expired items
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Evict oldest items when cache is full
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`Cache evicted oldest: ${oldestKey}`);
    }
  }

  // Get cache statistics
  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.cache.keys())
    };
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    console.log(`Cache invalidated ${deletedCount} items matching pattern: ${pattern}`);
    return deletedCount;
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Cache configuration for different endpoints
export const CACHE_CONFIG = {
  'customer-health': {
    ttl: 60 * 60 * 1000, // 1 hour (increased from 10 minutes)
    backgroundRefresh: true
  },
  'customers': {
    ttl: 30 * 60 * 1000, // 30 minutes (increased from 5 minutes)
    backgroundRefresh: true
  },
  'contract-performance': {
    ttl: 2 * 60 * 60 * 1000, // 2 hours (increased from 15 minutes)
    backgroundRefresh: true
  },
  'business-metrics': {
    ttl: 60 * 60 * 1000, // 1 hour (increased from 10 minutes)
    backgroundRefresh: true
  },
  'comprehensive': {
    ttl: 4 * 60 * 60 * 1000, // 4 hours (increased from 20 minutes)
    backgroundRefresh: false // Too expensive for background refresh
  },
  'churn': {
    ttl: 6 * 60 * 60 * 1000, // 6 hours (increased from 30 minutes)
    backgroundRefresh: false
  },
  'revenue-forecast': {
    ttl: 24 * 60 * 60 * 1000, // 24 hours (increased from 1 hour)
    backgroundRefresh: false
  },
  'customer-ltv': {
    ttl: 2 * 60 * 60 * 1000, // 2 hours (increased from 15 minutes)
    backgroundRefresh: true
  }
};

export default cacheService; 