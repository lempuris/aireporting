import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Users,
  RefreshCw,
  Search,
  Eye,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import CacheManager from '../components/CacheManager';
import { getChurnPrediction, getRevenueForecast, getCacheStats } from '../services/cachedApi';

const PredictiveAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [churnData, setChurnData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      const [churnResponse, revenueResponse] = await Promise.all([
        getChurnPrediction(null, forceRefresh),
        getRevenueForecast(12, forceRefresh)
      ]);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Check if we're using cached data
      if (loadTime < 100 && !forceRefresh) {
        setIsUsingCache(true);
      }

      console.log('Churn Response:', churnResponse);
      console.log('Revenue Response:', revenueResponse);

      // Handle API response formats
      // Both APIs return data directly (not wrapped in data property)
      setChurnData(churnResponse);
      setRevenueData(revenueResponse);
      setCacheStats(getCacheStats());
    } catch (error) {
      console.error('Error fetching predictive data:', error);
      toast.error('Failed to load predictive analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const churnRiskData = useMemo(() => {
    const COLORS = ['#EF4444', '#F59E0B', '#10B981'];
    const dataArray = churnData?.risk_segments?.map((segment, index) => ({
      name: segment.risk_level,
      value: segment.count,
      color: COLORS[index % COLORS.length]
    })) || [];

    // Fallback data if no churn risk segments
    if (dataArray.length === 0) {
      dataArray.push(
        { name: 'No Data', value: 1, color: COLORS[0] }
      );
    }
    return dataArray;
  }, [churnData?.risk_segments]);

  const revenueForecastData = useMemo(() => {
    const dataArray = Array.isArray(revenueData?.forecast)
      ? revenueData.forecast.map((month, index) => ({
          month: `Month ${index + 1}`,
          projected: month.projected_revenue || 0,
          actual: month.actual_revenue || null,
          growth: (month.growth_rate || 0) * 100
        }))
      : [];

    // Fallback data if no forecast
    if (dataArray.length === 0) {
      dataArray.push({
        month: 'No Data',
        projected: 0,
        actual: 0,
        growth: 0
      });
    }
    return dataArray;
  }, [revenueData?.forecast]);

  const highRiskCustomers = useMemo(() => {
    const dataArray = churnData?.high_risk_customers?.filter(customer => 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Fallback data if no high risk customers
    if (dataArray.length === 0) {
      dataArray.push({
        name: 'No Data',
        company: 'No Data',
        churn_risk: 0,
        lifetime_value: 0,
        email: 'N/A'
      });
    }
    return dataArray;
  }, [churnData?.high_risk_customers, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>Predictive Analytics</h1>
          <p style={{ color: 'rgb(var(--color-text-secondary))' }}>AI-powered predictions and forecasting</p>
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
          title="Churn Risk Score"
          value={churnData?.overall_churn_risk || 0}
          format="percentage"
          icon={AlertTriangle}
          change={churnData?.churn_trend || 0}
          changeType={churnData?.churn_trend > 0 ? 'negative' : 'positive'}
        />
        <MetricCard
          title="Projected Revenue"
          value={revenueData?.total_projected_revenue || 0}
          format="currency"
          icon={DollarSign}
          change={revenueData?.revenue_growth || 0}
          changeType={revenueData?.revenue_growth > 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          title="High Risk Customers"
          value={churnData?.high_risk_count || 0}
          icon={Users}
          change={churnData?.risk_trend || 0}
          changeType={churnData?.risk_trend > 0 ? 'negative' : 'positive'}
        />
        <MetricCard
          title="Prediction Accuracy"
          value={(revenueData?.prediction_accuracy || 0) * 100}
          format="percentage"
          icon={TrendingUp}
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Risk Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Churn Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={churnRiskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {churnRiskData.map((entry, index) => (
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

        {/* Revenue Forecast */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Revenue Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueForecastData}>
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
              <Line type="monotone" dataKey="projected" stroke="#3B82F6" strokeWidth={2} name="Projected" />
              {revenueForecastData.some(item => item.actual !== null) && (
                <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Growth Trends */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Growth Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueForecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
            <XAxis dataKey="month" stroke={getChartColor()} />
            <YAxis stroke={getChartColor()} />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(1)}%`, 'Growth Rate']} 
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
              cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
            />
            <Bar dataKey="growth" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI Insights */}
      {(churnData?.insights || revenueData?.insights) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>AI-Generated Predictive Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...(churnData?.insights || []), ...(revenueData?.insights || [])].slice(0, 4).map((insight, index) => (
              <InsightCard
                key={index}
                insight={insight.insight || insight}
                type={insight.type || "prediction"}
                priority={insight.priority || (index < 2 ? 'high' : 'medium')}
                timestamp={insight.timestamp || new Date().toISOString()}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* High Risk Customers */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>High Risk Customers</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--color-text-tertiary))' }} />
            <input
              type="text"
              placeholder="Search customers..."
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
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <thead style={{ backgroundColor: 'rgb(var(--color-bg-tertiary))' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Churn Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  LTV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'rgb(var(--color-bg-secondary))' }} className="divide-y">
              {highRiskCustomers.slice(0, 10).map((customer) => (
                <tr key={customer.email} className="hover:opacity-80 transition-opacity" style={{ borderColor: 'rgb(var(--color-border))' }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>{customer.name}</div>
                      <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>{customer.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 rounded-full h-2 mr-2" style={{ backgroundColor: 'rgb(var(--color-border))' }}>
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(customer.churn_risk || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                        {((customer.churn_risk || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    ${customer.lifetime_value?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
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

export default PredictiveAnalytics; 