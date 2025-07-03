import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText,
  Activity,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import CacheManager from '../components/CacheManager';
import { getComprehensiveAnalysis, getCacheStats } from '../services/cachedApi';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [includeAIInsights, setIncludeAIInsights] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [showCacheManager, setShowCacheManager] = useState(false);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const fetchData = async (withAIInsights = false, forceRefresh = false) => {
    try {
      setLoading(true);
      setIsUsingCache(false);
      
      const startTime = performance.now();
      const response = await getComprehensiveAnalysis(withAIInsights, forceRefresh);
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
      
      console.log('API Response:', response); // Debug log
      setData(response.data);
      setCacheStats(getCacheStats());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error('Request timed out. Try again or disable AI insights.');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData(includeAIInsights, true);
  };

  const handleToggleAIInsights = () => {
    const newValue = !includeAIInsights;
    setIncludeAIInsights(newValue);
    fetchData(newValue);
  };

  useEffect(() => {
    fetchData(false); // Start without AI insights for faster loading
  }, []);

  const revenueData = (data?.business_metrics?.metrics?.metrics || []).map((item, index) => ({
    month: item.name || `Metric ${index + 1}`,
    revenue: item.avg_value || 0,
    growth: item.avg_change || 0
  }));

  // Fallback data if no business metrics
  if (revenueData.length === 0) {
    revenueData.push(
      { month: 'No Data', revenue: 0, growth: 0 }
    );
  }

  const customerSegments = (data?.customer_health?.metrics?.segments || []).map((segment, index) => ({
    name: segment.segment,
    value: segment.count,
    color: COLORS[index % COLORS.length]
  }));

  // Fallback data if no customer segments
  if (customerSegments.length === 0) {
    customerSegments.push(
      { name: 'No Data', value: 1, color: COLORS[0] }
    );
  }

  const contractPerformance = (data?.contract_performance?.metrics?.contract_types || []).map((contract, index) => ({
    type: contract.type,
    count: contract.count,
    value: contract.avg_value
  }));

  // Fallback data if no contract types
  if (contractPerformance.length === 0) {
    contractPerformance.push(
      { type: 'No Data', count: 0, value: 0 }
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your business intelligence metrics</p>
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
            onClick={handleToggleAIInsights}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              includeAIInsights 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>AI Insights {includeAIInsights ? 'ON' : 'OFF'}</span>
            </span>
          </button>
          <button
            onClick={handleRefresh}
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
          title="Total Customers"
          value={data?.summary?.total_customers || 0}
          icon={Users}
          change={0}
          changeType="neutral"
        />
        <MetricCard
          title="Total Contracts"
          value={data?.summary?.total_contracts || 0}
          icon={FileText}
          change={0}
          changeType="neutral"
        />
        <MetricCard
          title="Total Contract Value"
          value={data?.summary?.total_contract_value || 0}
          format="currency"
          icon={DollarSign}
          change={0}
          changeType="neutral"
        />
        <MetricCard
          title="High Risk Customers"
          value={data?.summary?.high_risk_customers || 0}
          icon={Activity}
          change={0}
          changeType="neutral"
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Customer Segments */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerSegments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {customerSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Contract Performance */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Performance by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={contractPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
            <Bar dataKey="value" fill="#8B5CF6" name="Average Value" />
            <Bar dataKey="count" fill="#3B82F6" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.customer_health?.insights?.slice(0, 2).map((insight, index) => (
            <InsightCard
              key={`customer-${index}`}
              insight={typeof insight === 'string' ? insight : insight.insight || 'Customer insight'}
              type="customer"
              priority={index < 1 ? 'high' : 'medium'}
              timestamp={data?.timestamp}
            />
          ))}
          {data?.contract_performance?.insights?.slice(0, 2).map((insight, index) => (
            <InsightCard
              key={`contract-${index}`}
              insight={typeof insight === 'string' ? insight : insight.insight || 'Contract insight'}
              type="contract"
              priority={index < 1 ? 'high' : 'medium'}
              timestamp={data?.timestamp}
            />
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Customer Analysis</div>
                <div className="text-sm text-gray-500">View detailed customer insights</div>
              </div>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Contract Analysis</div>
                <div className="text-sm text-gray-500">Review contract performance</div>
              </div>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Predictive Analytics</div>
                <div className="text-sm text-gray-500">Explore future trends</div>
              </div>
            </div>
          </button>
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

export default Dashboard; 