import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Users,
  RefreshCw,
  Search,
  Eye,
  Clock,
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

  const COLORS = ['#EF4444', '#F59E0B', '#10B981'];

  const fetchData = async (forceRefresh = false) => {
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
        toast.success(`Data loaded from cache (${loadTime.toFixed(0)}ms)`);
      } else if (forceRefresh) {
        toast.success(`Data refreshed (${loadTime.toFixed(0)}ms)`);
      } else {
        toast.success(`Data loaded (${loadTime.toFixed(0)}ms)`);
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const churnRiskData = churnData?.risk_segments?.map((segment, index) => ({
    name: segment.risk_level,
    value: segment.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  // Fallback data if no churn risk segments
  if (churnRiskData.length === 0) {
    churnRiskData.push(
      { name: 'No Data', value: 1, color: COLORS[0] }
    );
  }

  const revenueForecastData = Array.isArray(revenueData?.forecast)
    ? revenueData.forecast.map((month, index) => ({
        month: `Month ${index + 1}`,
        projected: month.projected_revenue || 0,
        actual: month.actual_revenue || null,
        growth: (month.growth_rate || 0) * 100
      }))
    : [];

  // Fallback data if no forecast
  if (revenueForecastData.length === 0) {
    revenueForecastData.push({
      month: 'No Data',
      projected: 0,
      actual: 0,
      growth: 0
    });
  }

  const highRiskCustomers = churnData?.high_risk_customers?.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Fallback data if no high risk customers
  if (highRiskCustomers.length === 0) {
    highRiskCustomers.push({
      name: 'No Data',
      company: 'No Data',
      churn_risk: 0,
      lifetime_value: 0,
      email: 'N/A'
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-gray-600">AI-powered predictions and forecasting</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Risk Distribution</h3>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Forecast */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueForecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="projected" stroke="#3B82F6" strokeWidth={2} name="Projected" />
              {revenueForecastData.some(item => item.actual) && (
                <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* High Risk Customers */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">High Risk Customers</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Churn Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {highRiskCustomers.map((customer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.churn_risk > 0.7 
                        ? 'bg-red-100 text-red-800' 
                        : customer.churn_risk > 0.4 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(customer.churn_risk * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${customer.lifetime_value?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
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

      {/* AI Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Predictive Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {churnData?.insights?.slice(0, 4).map((insight, index) => (
            <InsightCard
              key={index}
              insight={typeof insight === 'string' ? insight : insight.insight || 'Churn insight'}
              type={insight.type || "prediction"}
              priority={insight.priority || (index < 2 ? 'high' : 'medium')}
              timestamp={insight.timestamp || churnData?.timestamp}
            />
          ))}
          {revenueData?.insights && revenueData.insights.length > 0 && (
            <InsightCard
              insight={Array.isArray(revenueData.insights) ? revenueData.insights[0] : revenueData.insights}
              type="revenue"
              priority="high"
              timestamp={revenueData?.timestamp}
            />
          )}
        </div>
      </motion.div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Churn Risk</label>
                  <p className="text-sm text-gray-900">{((selectedCustomer.churn_risk || 0) * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Lifetime Value</label>
                  <p className="text-sm text-gray-900">${(selectedCustomer.lifetime_value || 0)?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Activity</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.last_activity || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button className="btn-primary">
                  Take Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Manager Modal */}
      <CacheManager 
        isOpen={showCacheManager} 
        onClose={() => setShowCacheManager(false)} 
      />
    </div>
  );
};

export default PredictiveAnalytics; 