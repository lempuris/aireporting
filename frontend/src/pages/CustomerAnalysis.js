import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  Activity,
  AlertTriangle,
  Search,
  RefreshCw,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import CacheManager from '../components/CacheManager';
import { getCustomerHealth, getCustomers, getCacheStats } from '../services/cachedApi';

const CustomerAnalysis = () => {
  const [data, setData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
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
      
      const [customerData, customersData] = await Promise.all([
        getCustomerHealth(forceRefresh),
        getCustomers({ limit: 50 }, forceRefresh)
      ]);

      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Check if we're using cached data by comparing load time
      // Cached data typically loads much faster (< 100ms)
      if (loadTime < 100 && !forceRefresh) {
        setIsUsingCache(true);
      }

      setData(customerData.data);
      setCustomers(customersData.data.customers);
      
      // Update cache stats
      setCacheStats(getCacheStats());
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
      return matchesSearch && matchesSegment;
    });
  }, [customers, searchTerm, selectedSegment]);

  const segmentData = useMemo(() => {
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return data?.metrics?.segments?.map((segment, index) => ({
      name: segment.segment,
      value: segment.count,
      color: COLORS[index % COLORS.length]
    })) || [];
  }, [data?.metrics?.segments]);

  const industryData = useMemo(() => {
    return data?.metrics?.top_industries?.map((industry, index) => ({
      name: industry.industry,
      customers: industry.count,
      avgValue: industry.avg_value
    })) || [];
  }, [data?.metrics?.top_industries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>Loading customer analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>Customer Analysis</h1>
          <p style={{ color: 'rgb(var(--color-text-secondary))' }}>Customer health, engagement, and risk assessment</p>
        </div>
        <div className="flex items-center space-x-4">
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
          title="Total Customers"
          value={data?.metrics?.total_customers || 0}
          icon={Users}
        />
        <MetricCard
          title="Average LTV"
          value={data?.metrics?.avg_lifetime_value || 0}
          format="currency"
          icon={DollarSign}
        />
        <MetricCard
          title="Average Engagement"
          value={data?.metrics?.avg_engagement || 0}
          format="decimal"
          icon={Activity}
        />
        <MetricCard
          title="High Risk Customers"
          value={data?.metrics?.high_risk_customers || 0}
          icon={AlertTriangle}
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Customer Segments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {segmentData.map((entry, index) => (
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

        {/* Top Industries */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Top Industries by Customer Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryData}>
              <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
              <XAxis dataKey="name" stroke={getChartColor()} />
              <YAxis stroke={getChartColor()} />
              <Tooltip 
                formatter={(value, name) => [
                  `${value.toLocaleString()} customers`,
                  'Customer Count'
                ]}
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
                  minWidth: '140px'
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
              <Bar dataKey="customers" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>AI-Generated Customer Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.insights?.map((insight, index) => (
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

      {/* Customer List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>Customer List</h3>
          <div className="flex items-center space-x-4">
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
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              style={{ 
                backgroundColor: 'rgb(var(--color-bg-secondary))',
                borderColor: 'rgb(var(--color-border-secondary))',
                color: 'rgb(var(--color-text-primary))'
              }}
            >
              <option value="all">All Segments</option>
              <option value="enterprise">Enterprise</option>
              <option value="professional">Professional</option>
              <option value="basic">Basic</option>
            </select>
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
                  Segment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  LTV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Churn Risk
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'rgb(var(--color-bg-secondary))' }} className="divide-y">
              {filteredCustomers.slice(0, 10).map((customer) => (
                <tr key={customer.customer_id} className="hover:opacity-80 transition-opacity" style={{ borderColor: 'rgb(var(--color-border))' }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>{customer.name}</div>
                      <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>{customer.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.segment === 'enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300' :
                      customer.segment === 'professional' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:bg-opacity-30 dark:text-gray-300'
                    }`}>
                      {customer.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    ${customer.lifetime_value?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 rounded-full h-2 mr-2" style={{ backgroundColor: 'rgb(var(--color-border))' }}>
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${customer.engagement_score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                        {(customer.engagement_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.churn_risk_score > 0.7 ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:bg-opacity-30 dark:text-danger-300' :
                      customer.churn_risk_score > 0.4 ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:bg-opacity-30 dark:text-warning-300' :
                      'bg-success-100 text-success-800 dark:bg-success-900 dark:bg-opacity-30 dark:text-success-300'
                    }`}>
                      {(customer.churn_risk_score * 100).toFixed(0)}%
                    </span>
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

export default CustomerAnalysis; 