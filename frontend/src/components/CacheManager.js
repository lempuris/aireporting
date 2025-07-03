import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Clock, 
  HardDrive,
  AlertTriangle
} from 'lucide-react';
import { getCacheStats, clearCache, invalidateCache } from '../services/cachedApi';

const CacheManager = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [invalidatePattern, setInvalidatePattern] = useState('');

  useEffect(() => {
    if (isOpen) {
      updateStats();
    }
  }, [isOpen]);

  const updateStats = () => {
    setStats(getCacheStats());
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      clearCache();
      updateStats();
      // You could add a toast notification here
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleInvalidatePattern = () => {
    if (invalidatePattern.trim()) {
      const count = invalidateCache(invalidatePattern);
      setInvalidatePattern('');
      updateStats();
      // You could add a toast notification here
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Cache Manager
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {stats && (
          <div className="space-y-4">
            {/* Cache Statistics */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Cache Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <HardDrive className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Size: {stats.size}/{stats.maxSize}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Usage: {((stats.size / stats.maxSize) * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              {stats.size > stats.maxSize * 0.8 && (
                <div className="mt-3 flex items-center text-yellow-600 text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Cache is nearly full</span>
                </div>
              )}
            </div>

            {/* Cached Keys */}
            {stats.keys.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Cached Items</h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {stats.keys.map((key, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                      {key}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cache Actions */}
            <div className="space-y-3">
              <button
                onClick={updateStats}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Stats</span>
              </button>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Pattern to invalidate..."
                  value={invalidatePattern}
                  onChange={(e) => setInvalidatePattern(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleInvalidatePattern}
                  disabled={!invalidatePattern.trim()}
                  className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Invalidate
                </button>
              </div>

              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isClearing ? 'Clearing...' : 'Clear All Cache'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Cache helps improve performance by storing frequently accessed data locally.
            Data automatically expires based on configured TTL values.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CacheManager; 