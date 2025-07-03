import { useState, useEffect, useCallback } from 'react';
import { getCacheStats } from '../services/cachedApi';

export const useCache = () => {
  const [cacheStats, setCacheStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const updateStats = useCallback(() => {
    const stats = getCacheStats();
    setCacheStats(stats);
    setLastUpdate(Date.now());
  }, []);

  useEffect(() => {
    updateStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    
    return () => clearInterval(interval);
  }, [updateStats]);

  const getCacheUsagePercentage = useCallback(() => {
    if (!cacheStats) return 0;
    return (cacheStats.size / cacheStats.maxSize) * 100;
  }, [cacheStats]);

  const isCacheNearlyFull = useCallback(() => {
    return getCacheUsagePercentage() > 80;
  }, [getCacheUsagePercentage]);

  const getCacheStatus = useCallback(() => {
    if (!cacheStats) return 'unknown';
    
    const usage = getCacheUsagePercentage();
    if (usage > 90) return 'critical';
    if (usage > 80) return 'warning';
    if (usage > 50) return 'moderate';
    return 'good';
  }, [cacheStats, getCacheUsagePercentage]);

  return {
    cacheStats,
    lastUpdate,
    updateStats,
    getCacheUsagePercentage,
    isCacheNearlyFull,
    getCacheStatus
  };
};

export default useCache; 