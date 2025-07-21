import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Users, 
  TrendingUp, 
  DollarSign,
  RefreshCw,
  Search,
  Calendar,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import CacheManager from '../components/CacheManager';
import { getReferralCallsAnalysis, getCacheStats } from '../services/cachedApi';

const ReferralAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
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
      const response = await getReferralCallsAnalysis(true, forceRefresh);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Check if we're using cached data
      if (loadTime < 100 && !forceRefresh) {
        setIsUsingCache(true);
      }

      setData(response.data);
      setCacheStats(getCacheStats());
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral analysis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCalls = useMemo(() => {
    // Since the API doesn't return individual calls, we'll show call types as rows
    return data?.metrics?.call_types?.filter(callType => {
      const matchesSearch = callType.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAgent = selectedAgent === 'all' || true; // No agent filtering for call types
      const matchesStatus = selectedStatus === 'all' || true; // No status filtering for call types
      return matchesSearch && matchesAgent && matchesStatus;
    }) || [];
  }, [data?.metrics?.call_types, searchTerm, selectedAgent, selectedStatus]);

  const callVolumeData = useMemo(() => {
    // Use call_types data to show volume by call type (better than single trend point)
    return data?.metrics?.call_types?.map((callType, index) => ({
      month: callType.type.charAt(0).toUpperCase() + callType.type.slice(1), // Capitalize first letter
      calls: callType.count,
      conversions: Math.round(callType.count * callType.avg_conversion),
      conversionRate: callType.avg_conversion * 100
    })) || [];
  }, [data?.metrics?.call_types]);

  const agentPerformanceData = useMemo(() => {
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    // Use call_types data for agent performance
    return data?.metrics?.call_types?.map((callType, index) => ({
      name: callType.type,
      value: callType.avg_conversion * 100,
      color: COLORS[index % COLORS.length]
    })) || [];
  }, [data?.metrics?.call_types]);

  const conversionTrends = useMemo(() => {
    // Use negotiation_stages data for conversion trends
    return data?.metrics?.negotiation_stages?.map((stage, index) => ({
      period: stage.stage,
      rate: stage.avg_conversion * 100,
      calls: stage.count,
      revenue: stage.avg_deal_value
    })) || [];
  }, [data?.metrics?.negotiation_stages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>Loading referral analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>Referral Analysis</h1>
          <p style={{ color: 'rgb(var(--color-text-secondary))' }}>Referral call performance and conversion analytics</p>
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
          title="Total Calls"
          value={data?.metrics?.total_calls || 0}
          icon={Phone}
        />
        <MetricCard
          title="Conversion Rate"
          value={(data?.metrics?.avg_conversion_probability || 0) * 100}
          format="percentage"
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg Deal Value"
          value={data?.metrics?.avg_deal_value || 0}
          format="currency"
          icon={DollarSign}
        />
        <MetricCard
          title="Completed Calls"
          value={data?.metrics?.completed_calls || 0}
          icon={Users}
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Trends */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Call Volume by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={callVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
              <XAxis dataKey="month" stroke={getChartColor()} />
              <YAxis stroke={getChartColor()} />
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
                  fontSize: '12px'
                }}
                itemStyle={{
                  color: 'rgb(var(--color-text-secondary))',
                  fontSize: '13px'
                }}
              />
              <Line type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2} name="Total Calls" />
              <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Agent Performance */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Call Types Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={agentPerformanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {agentPerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)}%`, 'Conversion Rate']} 
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

      {/* Conversion Trends */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Negotiation Stages Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={conversionTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
            <XAxis dataKey="period" stroke={getChartColor()} />
            <YAxis stroke={getChartColor()} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'rate' ? `${value.toFixed(1)}%` : 
                name === 'revenue' ? `$${value.toLocaleString()}` : value,
                name === 'rate' ? 'Conversion Rate' : 
                name === 'revenue' ? 'Revenue' : 'Calls'
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
            <Bar dataKey="rate" fill="#10B981" name="Conversion Rate" />
            <Bar dataKey="calls" fill="#3B82F6" name="Total Calls" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI Insights */}
      {data?.insights && data?.insights?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>AI-Generated Referral Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.insights
              ?.filter(insight => {
                // Filter out error insights
                const insightText = insight?.insight || insight;
                return insightText && 
                       typeof insightText === 'string' && 
                       !insightText.toLowerCase().includes('error') &&
                       insightText.trim().length > 0;
              })
              ?.map((insight, index) => (
                <InsightCard
                  key={index}
                  insight={insight.insight || insight}
                  type={insight.type || "referral"}
                  priority={insight.priority || (index < 2 ? 'high' : 'medium')}
                  timestamp={insight.timestamp || data?.timestamp}
                />
              ))}
            {/* Show message if no valid insights */}
            {data?.insights?.filter(insight => {
              const insightText = insight?.insight || insight;
              return insightText && 
                     typeof insightText === 'string' && 
                     !insightText.toLowerCase().includes('error') &&
                     insightText.trim().length > 0;
            }).length === 0 && (
              <div className="col-span-2 text-center py-8">
                <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  AI insights are currently unavailable. Please try refreshing the page.
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Call List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>Call Types Overview</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--color-text-tertiary))' }} />
              <input
                type="text"
                placeholder="Search call types..."
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
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              style={{ 
                backgroundColor: 'rgb(var(--color-bg-secondary))',
                borderColor: 'rgb(var(--color-border-secondary))',
                color: 'rgb(var(--color-text-primary))'
              }}
            >
              <option value="all">All Types</option>
              <option value="demo">Demo</option>
              <option value="negotiation">Negotiation</option>
              <option value="closing">Closing</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'rgb(var(--color-border))' }}>
            <thead style={{ backgroundColor: 'rgb(var(--color-bg-tertiary))' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Call Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Total Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Conversion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  Avg Deal Value
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'rgb(var(--color-bg-secondary))' }} className="divide-y">
              {filteredCalls.map((callType, index) => (
                <tr key={index} className="hover:opacity-80 transition-opacity" style={{ borderColor: 'rgb(var(--color-border))' }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium capitalize" style={{ color: 'rgb(var(--color-text-primary))' }}>{callType.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    {callType.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    {(callType.avg_conversion * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                    ${callType.avg_deal_value?.toLocaleString() || 'N/A'}
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

export default ReferralAnalysis; 