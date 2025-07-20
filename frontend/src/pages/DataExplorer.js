import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  BarChart3,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import MetricCard from '../components/MetricCard';
import CacheManager from '../components/CacheManager';
import { getComprehensiveAnalysis, getCacheStats } from '../services/cachedApi';

const DataExplorer = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [cacheStats, setCacheStats] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [showCacheManager, setShowCacheManager] = useState(false);

  // Dynamic chart colors that adapt to theme
  const getChartColor = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#e5e7eb' : '#374151';
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setIsUsingCache(false);
      
      const startTime = performance.now();
      const response = await getComprehensiveAnalysis(false, forceRefresh);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Check if we're using cached data
      if (loadTime < 100 && !forceRefresh) {
        setIsUsingCache(true);
        toast.success(`Data loaded from cache (${loadTime.toFixed(0)}ms)`);
      } else if (forceRefresh) {
        toast.success(`Data refreshed (${loadTime.toFixed(0)}ms)`);
      } else {
        toast.success(`Data loaded (${loadTime.toFixed(0)}ms)`);
      }

      setData(response.data);
      setCacheStats(getCacheStats());
    } catch (error) {
      console.error('Error fetching data explorer:', error);
      toast.error('Failed to load data explorer');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    // Convert business metrics to dataset format
    const businessDatasets = data?.business_metrics?.metrics?.metrics?.map((metric, index) => ({
      id: `metric-${index}`,
      name: metric.name,
      description: `${metric.category} metric with ${metric.confidence ? `${(metric.confidence * 100).toFixed(1)}% confidence` : 'no confidence data'}`,
      type: metric.category.toLowerCase(),
      metric_type: metric.avg_change > 0 ? 'increasing' : metric.avg_change < 0 ? 'decreasing' : 'stable',
      record_count: metric.increasing + metric.decreasing,
      quality_score: metric.confidence || 0.5,
      last_updated: data.business_metrics.timestamp || new Date().toISOString()
    })) || [];

    return businessDatasets.filter(dataset => {
      const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDataset = selectedDataset === 'all' || dataset.type === selectedDataset;
      const matchesMetric = selectedMetric === 'all' || dataset.metric_type === selectedMetric;
      return matchesSearch && matchesDataset && matchesMetric;
    });
  }, [data?.business_metrics?.metrics?.metrics, data?.business_metrics?.timestamp, searchTerm, selectedDataset, selectedMetric]);

  const trendData = useMemo(() => {
    // Create trend data from business metrics showing top performers
    return data?.business_metrics?.metrics?.metrics?.slice(0, 12)?.map((metric, index) => ({
      month: metric.name.substring(0, 10), // Shortened name for x-axis
      value: metric.avg_value,
      change: metric.avg_change,
      volume: metric.increasing + metric.decreasing
    })) || [];
  }, [data?.business_metrics?.metrics?.metrics]);

  const correlationData = useMemo(() => {
    // Create meaningful correlation data showing confidence vs change relationship
    return data?.business_metrics?.metrics?.metrics?.slice(0, 15)?.map((metric, index) => ({
      x: (metric.confidence || 0.5) * 100, // Confidence percentage (0-100)
      y: metric.avg_change, // Change value (-5 to +5 range)
      z: metric.increasing + metric.decreasing, // Total activity as bubble size
      name: metric.name // For tooltip
    })) || [];
  }, [data?.business_metrics?.metrics?.metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>Loading data explorer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>Data Explorer</h1>
          <p style={{ color: 'rgb(var(--color-text-secondary))' }}>Explore and analyze raw data insights</p>
        </div>
        <div className="flex items-center space-x-3">
          {isUsingCache && (
            <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cached</span>
            </div>
          )}
          {cacheStats && (
            <button
              onClick={() => setShowCacheManager(true)}
              className="flex items-center space-x-2 text-sm transition-colors hover:opacity-80"
              style={{ color: 'rgb(var(--color-text-secondary))' }}
            >
              <Database className="h-4 w-4" />
              <span>Cache: {cacheStats.size}/{cacheStats.maxSize}</span>
            </button>
          )}
          <button
            onClick={() => fetchData(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Business Metrics"
          value={data?.business_metrics?.metrics?.metrics?.length || 0}
          icon={Database}
        />
        <MetricCard
          title="Total Customers"
          value={data?.summary?.total_customers || 0}
          icon={Users}
        />
        <MetricCard
          title="Total Contracts"
          value={data?.summary?.total_contracts || 0}
          icon={FileText}
        />
        <MetricCard
          title="Avg Renewal Rate"
          value={(data?.summary?.avg_renewal_probability || 0) * 100}
          format="percentage"
          icon={TrendingUp}
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Trends */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Data Volume Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
              <XAxis dataKey="month" stroke={getChartColor()} />
              <YAxis stroke={getChartColor()} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--color-bg-secondary))', 
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: 'rgb(var(--color-text-primary))' }}
              />
              <Line type="monotone" dataKey="volume" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Metric Correlations */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Metric Correlations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
              <XAxis type="number" dataKey="x" stroke={getChartColor()} />
              <YAxis type="number" dataKey="y" stroke={getChartColor()} />
              <ZAxis type="number" dataKey="z" range={[50, 200]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--color-bg-secondary))', 
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: 'rgb(var(--color-text-primary))' }}
              />
              <Scatter dataKey="z" fill="#10B981" />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Data Quality Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Data Quality by Dataset</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.business_metrics?.metrics?.metrics?.slice(0, 10)?.map(m => ({
            dataset: m.name.substring(0, 15) + '...',
            quality_score: m.confidence || 0.5
          })) || []}>
            <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
            <XAxis dataKey="dataset" stroke={getChartColor()} />
            <YAxis stroke={getChartColor()} />
            <Tooltip 
              formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Confidence Score']} 
              contentStyle={{ 
                backgroundColor: 'rgb(var(--color-bg-secondary))', 
                border: '1px solid rgb(var(--color-border))',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: 'rgb(var(--color-text-primary))' }}
            />
            <Bar dataKey="quality_score" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Dataset List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>Available Datasets</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--color-text-tertiary))' }} />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                style={{ 
                  backgroundColor: 'rgb(var(--color-bg-secondary))',
                  borderColor: 'rgb(var(--color-border-secondary))',
                  color: 'rgb(var(--color-text-primary))'
                }}
              />
            </div>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              style={{ 
                backgroundColor: 'rgb(var(--color-bg-secondary))',
                borderColor: 'rgb(var(--color-border-secondary))',
                color: 'rgb(var(--color-text-primary))'
              }}
            >
              <option value="all">All Types</option>
              <option value="financial">Financial</option>
              <option value="customer">Customer</option>
              <option value="operational">Operational</option>
              <option value="product">Product</option>
              <option value="market">Market</option>
              <option value="executive">Executive</option>
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              style={{ 
                backgroundColor: 'rgb(var(--color-bg-secondary))',
                borderColor: 'rgb(var(--color-border-secondary))',
                color: 'rgb(var(--color-text-primary))'
              }}
            >
              <option value="all">All Trends</option>
              <option value="increasing">Increasing</option>
              <option value="decreasing">Decreasing</option>
              <option value="stable">Stable</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <thead style={{ backgroundColor: 'rgb(var(--color-bg-tertiary))' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Dataset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'rgb(var(--color-bg-secondary))' }} className="divide-y">
              {filteredData.slice(0, 10).map((dataset) => (
                <tr key={dataset.id} className="hover:opacity-80 transition-opacity" style={{ borderColor: 'rgb(var(--color-border))' }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>{dataset.name}</div>
                      <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>{dataset.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      dataset.type === 'customer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300' :
                      dataset.type === 'contract' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300' :
                      dataset.type === 'support' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:bg-opacity-30 dark:text-gray-300'
                    }`}>
                      {dataset.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    {dataset.record_count?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 rounded-full h-2 mr-2" style={{ backgroundColor: 'rgb(var(--color-border))' }}>
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${(dataset.quality_score || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                        {((dataset.quality_score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    {new Date(dataset.last_updated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800 transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default DataExplorer; 