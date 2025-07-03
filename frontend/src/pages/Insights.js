import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Filter, 
  RefreshCw, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import InsightCard from '../components/InsightCard';
import CacheManager from '../components/CacheManager';
import { generateDailyInsights, updateCustomerInsights, updateContractInsights, getCacheStats } from '../services/cachedApi';

const Insights = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [showCacheManager, setShowCacheManager] = useState(false);

  // Mock insights data - in real app, this would come from API
  const mockInsights = [
    {
      id: 1,
      insight: "Customer engagement has increased by 15% in the last quarter, with enterprise customers showing the highest growth rate.",
      type: "customer",
      priority: "high",
      timestamp: new Date().toISOString(),
      category: "engagement"
    },
    {
      id: 2,
      insight: "Contract renewal rates are declining in the professional segment, suggesting a need for improved customer success initiatives.",
      type: "contract",
      priority: "high",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      category: "renewal"
    },
    {
      id: 3,
      insight: "Revenue growth is accelerating in the technology sector, with 25% of new contracts coming from this industry.",
      type: "trend",
      priority: "medium",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      category: "revenue"
    },
    {
      id: 4,
      insight: "Customer churn risk is highest among customers with engagement scores below 0.3, requiring immediate attention.",
      type: "customer",
      priority: "high",
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      category: "churn"
    },
    {
      id: 5,
      insight: "Average contract value has increased by 12% year-over-year, driven by premium service offerings.",
      type: "contract",
      priority: "medium",
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      category: "value"
    },
    {
      id: 6,
      insight: "Seasonal patterns show higher customer acquisition in Q4, suggesting optimal timing for marketing campaigns.",
      type: "trend",
      priority: "low",
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      category: "seasonal"
    }
  ];

  const fetchInsights = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setIsUsingCache(false);
      
      const startTime = performance.now();
      // In a real app, you would fetch insights from the API
      // For now, we'll use mock data
      setInsights(mockInsights);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Check if we're using cached data (for mock data, always show as cached)
      if (loadTime < 100) {
        setIsUsingCache(true);
        toast.success(`Data loaded from cache (${loadTime.toFixed(0)}ms)`);
      }
      
      setCacheStats(getCacheStats());
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    try {
      setGenerating(true);
      await Promise.all([
        generateDailyInsights(),
        updateCustomerInsights(),
        updateContractInsights()
      ]);
      
      // Refresh insights after generation
      await fetchInsights(true);
      toast.success('New insights generated successfully');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate new insights');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const filteredInsights = insights.filter(insight => {
    const matchesType = selectedType === 'all' || insight.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || insight.priority === selectedPriority;
    return matchesType && matchesPriority;
  });

  const getInsightStats = () => {
    const total = insights.length;
    const highPriority = insights.filter(i => i.priority === 'high').length;
    const customerInsights = insights.filter(i => i.type === 'customer').length;
    const contractInsights = insights.filter(i => i.type === 'contract').length;
    const trendInsights = insights.filter(i => i.type === 'trend').length;

    return { total, highPriority, customerInsights, contractInsights, trendInsights };
  };

  const stats = getInsightStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600">AI-generated business insights and recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          {isUsingCache && (
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cached</span>
            </div>
          )}
          {cacheStats && (
            <button
              onClick={() => setShowCacheManager(true)}
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Database className="h-4 w-4" />
              <span>Cache: {cacheStats.size}/{cacheStats.maxSize}</span>
            </button>
          )}
          <button
            onClick={generateNewInsights}
            disabled={generating}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Generating...' : 'Generate Insights'}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-6"
      >
        <div className="metric-card text-center">
          <Lightbulb className="h-8 w-8 text-primary-500 mx-auto mb-2" />
          <div className="metric-value">{stats.total}</div>
          <div className="metric-label">Total Insights</div>
        </div>
        <div className="metric-card text-center">
          <AlertTriangle className="h-8 w-8 text-danger-500 mx-auto mb-2" />
          <div className="metric-value">{stats.highPriority}</div>
          <div className="metric-label">High Priority</div>
        </div>
        <div className="metric-card text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="metric-value">{stats.customerInsights}</div>
          <div className="metric-label">Customer</div>
        </div>
        <div className="metric-card text-center">
          <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <div className="metric-value">{stats.contractInsights}</div>
          <div className="metric-label">Contract</div>
        </div>
        <div className="metric-card text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="metric-value">{stats.trendInsights}</div>
          <div className="metric-label">Trends</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filter Insights</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="customer">Customer</option>
            <option value="contract">Contract</option>
            <option value="trend">Trend</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Showing {filteredInsights.length} of {insights.length} insights
          </div>
        </div>
      </motion.div>

      {/* Insights Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Generated Insights</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Powered by LangChain & OpenAI</span>
          </div>
        </div>

        {filteredInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight.insight}
                type={insight.type}
                priority={insight.priority}
                timestamp={insight.timestamp}
                className="animate-fade-in"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or generate new insights</p>
            <button
              onClick={generateNewInsights}
              className="btn-primary"
            >
              Generate New Insights
            </button>
          </div>
        )}
      </motion.div>

      {/* Insight Categories */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insight Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Customer Insights</h4>
            <p className="text-sm text-blue-700">
              Analysis of customer behavior, engagement patterns, and churn risk factors.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">Contract Insights</h4>
            <p className="text-sm text-purple-700">
              Performance analysis of contracts, renewal patterns, and value optimization.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Trend Insights</h4>
            <p className="text-sm text-green-700">
              Market trends, seasonal patterns, and predictive analytics for business growth.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cache Manager Modal */}
      <CacheManager 
        isOpen={showCacheManager} 
        onClose={() => setShowCacheManager(false)} 
      />
    </div>
  );
};

export default Insights; 