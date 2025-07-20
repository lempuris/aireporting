import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText,
  Activity,
  RefreshCw,
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

  // Dynamic chart colors that adapt to theme
  const getChartColor = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#e5e7eb' : '#374151';
  }, []);

  const fetchData = useCallback(async (withAIInsights = false, forceRefresh = false) => {
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
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(includeAIInsights, true);
  }, [fetchData, includeAIInsights]);

  const handleToggleAIInsights = useCallback(() => {
    const newValue = !includeAIInsights;
    setIncludeAIInsights(newValue);
    fetchData(newValue);
  }, [includeAIInsights, fetchData]);

  useEffect(() => {
    fetchData(false); // Start without AI insights for faster loading
  }, [fetchData]);

  const revenueData = useMemo(() => {
    const dataArray = (data?.business_metrics?.metrics?.metrics || []).map((item, index) => ({
      month: item.name || `Metric ${index + 1}`,
      revenue: item.avg_value || 0,
      growth: item.avg_change || 0
    }));

    // Fallback data if no business metrics
    if (dataArray.length === 0) {
      dataArray.push(
        { month: 'No Data', revenue: 0, growth: 0 }
      );
    }
    return dataArray;
  }, [data?.business_metrics?.metrics?.metrics]);

  const customerSegments = useMemo(() => {
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const dataArray = (data?.customer_health?.metrics?.segments || []).map((segment, index) => ({
      name: segment.segment,
      value: segment.count,
      color: COLORS[index % COLORS.length]
    }));

    // Fallback data if no customer segments
    if (dataArray.length === 0) {
      dataArray.push(
        { name: 'No Data', value: 1, color: COLORS[0] }
      );
    }
    return dataArray;
  }, [data?.customer_health?.metrics?.segments]);

  const contractPerformance = useMemo(() => {
    const dataArray = (data?.contract_performance?.metrics?.contract_types || []).map((contract, index) => ({
      type: contract.type,
      count: contract.count,
      value: contract.avg_value
    }));

    // Fallback data if no contract types
    if (dataArray.length === 0) {
      dataArray.push(
        { type: 'No Data', count: 0, value: 0 }
      );
    }
    return dataArray;
  }, [data?.contract_performance?.metrics?.contract_types]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>Dashboard</h1>
          <p style={{ color: 'rgb(var(--color-text-secondary))' }}>Overview of your business intelligence metrics</p>
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
            onClick={handleToggleAIInsights}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              includeAIInsights 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'border transition-colors hover:border-primary-300'
            }
            ${!includeAIInsights && 'hover:opacity-80'}`}
            style={{
              backgroundColor: includeAIInsights ? '' : 'rgb(var(--color-bg-tertiary))',
              color: includeAIInsights ? '' : 'rgb(var(--color-text-primary))',
              borderColor: includeAIInsights ? '' : 'rgb(var(--color-border))'
            }}
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
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
              <XAxis dataKey="month" stroke={getChartColor()} />
              <YAxis stroke={getChartColor()} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--color-bg-primary))',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  minWidth: '120px'
                }}
                labelStyle={{ 
                  color: 'rgb(var(--color-text-primary))', 
                  fontWeight: '600',
                  marginBottom: '4px',
                  fontSize: '12px'
                }}
                itemStyle={{
                  color: 'rgb(var(--color-text-secondary))',
                  fontSize: '13px'
                }}
              />
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
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Customer Segments</h3>
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
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--color-bg-primary))',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  minWidth: '120px'
                }}
                labelStyle={{ 
                  color: 'rgb(var(--color-text-primary))', 
                  fontWeight: '600',
                  marginBottom: '4px',
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}
                itemStyle={{
                  color: 'rgb(var(--color-text-secondary))',
                  fontSize: '13px'
                }}
              />
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Contract Performance by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={contractPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
            <XAxis dataKey="type" stroke={getChartColor()} />
            <YAxis stroke={getChartColor()} />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} 
              contentStyle={{ 
                backgroundColor: 'rgb(var(--color-bg-primary))',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: '500',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                minWidth: '120px'
              }}
              labelStyle={{ 
                color: 'rgb(var(--color-text-primary))', 
                fontWeight: '600',
                marginBottom: '4px',
                fontSize: '12px',
                textTransform: 'capitalize'
              }}
              itemStyle={{
                color: 'rgb(var(--color-text-secondary))',
                fontSize: '13px'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar dataKey="value" fill="#8B5CF6" name="Average Value" />
            <Bar dataKey="count" fill="#3B82F6" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI Insights */}
      {includeAIInsights && data?.customer_health?.insights && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>AI-Generated Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.customer_health?.insights?.slice(0, 2).map((insight, index) => (
              <InsightCard
                key={index}
                insight={insight.insight || insight}
                type={insight.type || "customer"}
                priority={insight.priority || (index < 2 ? 'high' : 'medium')}
                timestamp={insight.timestamp || data?.timestamp}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border rounded-lg hover:border-primary-300 transition-all duration-200 hover:bg-primary-500 hover:bg-opacity-10" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <div className="font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>Customer Analysis</div>
                <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>View detailed customer insights</div>
              </div>
            </div>
          </button>
          <button className="p-4 border rounded-lg hover:border-primary-300 transition-all duration-200 hover:bg-primary-500 hover:bg-opacity-10" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <div className="font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>Contract Analysis</div>
                <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>Review contract performance</div>
              </div>
            </div>
          </button>
          <button className="p-4 border rounded-lg hover:border-primary-300 transition-all duration-200 hover:bg-primary-500 hover:bg-opacity-10" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <div className="font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>Predictive Analytics</div>
                <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>Explore future trends</div>
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