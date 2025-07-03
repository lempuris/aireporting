import cacheService, { CACHE_CONFIG } from './cache';
import * as api from './api';

// Background refresh queue to prevent multiple simultaneous requests
const backgroundRefreshQueue = new Set();

// Cached API wrapper functions
export const getCustomerHealth = async (forceRefresh = false) => {
  const cacheKey = cacheService.generateKey('customer-health');
  const config = CACHE_CONFIG['customer-health'];

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedData = cacheService.getWithAge(cacheKey);
    if (cachedData) {
      // If data is stale and background refresh is enabled, refresh in background
      if (cachedData.isStale && config.backgroundRefresh && !backgroundRefreshQueue.has(cacheKey)) {
        backgroundRefreshQueue.add(cacheKey);
        setTimeout(async () => {
          try {
            const freshData = await api.getCustomerHealth();
            cacheService.set(cacheKey, freshData, config.ttl);
            console.log('Background refresh completed for customer-health');
          } catch (error) {
            console.warn('Background refresh failed for customer-health:', error);
          } finally {
            backgroundRefreshQueue.delete(cacheKey);
          }
        }, 100);
      }
      return cachedData.data;
    }
  }

  // Fetch fresh data
  try {
    const data = await api.getCustomerHealth();
    cacheService.set(cacheKey, data, config.ttl);
    return data;
  } catch (error) {
    // If fresh request fails, try to return stale cache data
    const staleData = cacheService.get(cacheKey);
    if (staleData) {
      console.warn('Using stale cache data due to API error:', error.message);
      return staleData;
    }
    throw error;
  }
};

export const getCustomers = async (params = {}, forceRefresh = false) => {
  const cacheKey = cacheService.generateKey('customers', params);
  const config = CACHE_CONFIG['customers'];

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedData = cacheService.getWithAge(cacheKey);
    if (cachedData) {
      // Background refresh for stale data
      if (cachedData.isStale && config.backgroundRefresh && !backgroundRefreshQueue.has(cacheKey)) {
        backgroundRefreshQueue.add(cacheKey);
        setTimeout(async () => {
          try {
            const freshData = await api.getCustomers(params);
            cacheService.set(cacheKey, freshData, config.ttl);
            console.log('Background refresh completed for customers');
          } catch (error) {
            console.warn('Background refresh failed for customers:', error);
          } finally {
            backgroundRefreshQueue.delete(cacheKey);
          }
        }, 100);
      }
      return cachedData.data;
    }
  }

  // Fetch fresh data
  try {
    const data = await api.getCustomers(params);
    cacheService.set(cacheKey, data, config.ttl);
    return data;
  } catch (error) {
    const staleData = cacheService.get(cacheKey);
    if (staleData) {
      console.warn('Using stale cache data due to API error:', error.message);
      return staleData;
    }
    throw error;
  }
};

export const getContractPerformance = async (forceRefresh = false) => {
  const cacheKey = cacheService.generateKey('contract-performance');
  const config = CACHE_CONFIG['contract-performance'];

  if (!forceRefresh) {
    const cachedData = cacheService.getWithAge(cacheKey);
    if (cachedData) {
      if (cachedData.isStale && config.backgroundRefresh && !backgroundRefreshQueue.has(cacheKey)) {
        backgroundRefreshQueue.add(cacheKey);
        setTimeout(async () => {
          try {
            const freshData = await api.getContractPerformance();
            cacheService.set(cacheKey, freshData, config.ttl);
            console.log('Background refresh completed for contract-performance');
          } catch (error) {
            console.warn('Background refresh failed for contract-performance:', error);
          } finally {
            backgroundRefreshQueue.delete(cacheKey);
          }
        }, 100);
      }
      return cachedData.data;
    }
  }

  try {
    const data = await api.getContractPerformance();
    cacheService.set(cacheKey, data, config.ttl);
    return data;
  } catch (error) {
    const staleData = cacheService.get(cacheKey);
    if (staleData) {
      console.warn('Using stale cache data due to API error:', error.message);
      return staleData;
    }
    throw error;
  }
};

export const getBusinessMetrics = async (forceRefresh = false) => {
  const cacheKey = cacheService.generateKey('business-metrics');
  const config = CACHE_CONFIG['business-metrics'];

  if (!forceRefresh) {
    const cachedData = cacheService.getWithAge(cacheKey);
    if (cachedData) {
      if (cachedData.isStale && config.backgroundRefresh && !backgroundRefreshQueue.has(cacheKey)) {
        backgroundRefreshQueue.add(cacheKey);
        setTimeout(async () => {
          try {
            const freshData = await api.getBusinessMetrics();
            cacheService.set(cacheKey, freshData, config.ttl);
            console.log('Background refresh completed for business-metrics');
          } catch (error) {
            console.warn('Background refresh failed for business-metrics:', error);
          } finally {
            backgroundRefreshQueue.delete(cacheKey);
          }
        }, 100);
      }
      return cachedData.data;
    }
  }

  try {
    const data = await api.getBusinessMetrics();
    cacheService.set(cacheKey, data, config.ttl);
    return data;
  } catch (error) {
    const staleData = cacheService.get(cacheKey);
    if (staleData) {
      console.warn('Using stale cache data due to API error:', error.message);
      return staleData;
    }
    throw error;
  }
};

export const getComprehensiveAnalysis = async (includeAIInsights = false, forceRefresh = false) => {
  const cacheKey = cacheService.generateKey('comprehensive', { includeAIInsights });
  const config = CACHE_CONFIG['comprehensive'];

  if (!forceRefresh) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const data = await api.getComprehensiveAnalysis(includeAIInsights);
    cacheService.set(cacheKey, data, config.ttl);
    return data;
  } catch (error) {
    const staleData = cacheService.get(cacheKey);
    if (staleData) {
      console.warn('Using stale cache data due to API error:', error.message);
      return staleData;
    }
    throw error;
  }
};

export const getChurnPrediction = async (customerId = null, forceRefresh = false) => {
  const cacheKey = cacheService.generateKey('churn', { customerId });
  const config = CACHE_CONFIG['churn'];

  if (!forceRefresh) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const data = await api.getChurnPrediction(customerId);
    cacheService.set(cacheKey, data, config.ttl);
    return data;
  } catch (error) {
    const staleData = cacheService.get(cacheKey);
    if (staleData) {
      console.warn('Using stale cache data due to API error:', error.message);
      return staleData;
    }
    throw error;
  }
};

export const getRevenueForecast = async (months = 12, forceRefresh = false) => {
  const cacheKey = cacheService.generateKey('revenue-forecast', { months });
  const config = CACHE_CONFIG['revenue-forecast'];

  if (!forceRefresh) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const data = await api.getRevenueForecast(months);
    cacheService.set(cacheKey, data, config.ttl);
    return data;
  } catch (error) {
    const staleData = cacheService.get(cacheKey);
    if (staleData) {
      console.warn('Using stale cache data due to API error:', error.message);
      return staleData;
    }
    throw error;
  }
};

export const getCustomerLTV = async (customerId, forceRefresh = false) => {
  const cacheKey = cacheService.generateKey('customer-ltv', { customerId });
  const config = CACHE_CONFIG['customer-ltv'];

  if (!forceRefresh) {
    const cachedData = cacheService.getWithAge(cacheKey);
    if (cachedData) {
      if (cachedData.isStale && config.backgroundRefresh && !backgroundRefreshQueue.has(cacheKey)) {
        backgroundRefreshQueue.add(cacheKey);
        setTimeout(async () => {
          try {
            const freshData = await api.getCustomerLTV(customerId);
            cacheService.set(cacheKey, freshData, config.ttl);
            console.log('Background refresh completed for customer-ltv');
          } catch (error) {
            console.warn('Background refresh failed for customer-ltv:', error);
          } finally {
            backgroundRefreshQueue.delete(cacheKey);
          }
        }, 100);
      }
      return cachedData.data;
    }
  }

  try {
    const data = await api.getCustomerLTV(customerId);
    cacheService.set(cacheKey, data, config.ttl);
    return data;
  } catch (error) {
    const staleData = cacheService.get(cacheKey);
    if (staleData) {
      console.warn('Using stale cache data due to API error:', error.message);
      return staleData;
    }
    throw error;
  }
};

// Cache management functions
export const clearCache = () => {
  cacheService.clear();
};

export const getCacheStats = () => {
  return cacheService.getStats();
};

export const invalidateCache = (pattern) => {
  return cacheService.invalidatePattern(pattern);
};

// Export the original API functions for non-cached operations
export const {
  checkHealth,
  updateCustomerInsights,
  updateContractInsights,
  generateDailyInsights,
  getContracts
} = api;

// Export cache service for advanced usage
export { cacheService }; 