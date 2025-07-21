import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Filter,
  Search,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import InsightCard from '../components/InsightCard';
import CacheManager from '../components/CacheManager';
import { getComprehensiveAnalysis, getSupportTicketsAnalysis, getReferralCallsAnalysis, getCacheStats } from '../services/cachedApi';

const Insights = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [cacheStats, setCacheStats] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [showCacheManager, setShowCacheManager] = useState(false);

  // Dynamic chart colors that adapt to theme
  const getChartColor = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#e5e7eb' : '#374151';
  }, []);

  const fetchInsights = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setIsUsingCache(false);
      
      const startTime = performance.now();
      const [response, supportResponse, referralResponse] = await Promise.all([
        getComprehensiveAnalysis(true, forceRefresh),
        getSupportTicketsAnalysis(true, forceRefresh),
        getReferralCallsAnalysis(true, forceRefresh)
      ]);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Check if we're using cached data
      if (loadTime < 100 && !forceRefresh) {
        setIsUsingCache(true);
      }

      // Combine all insights from different sections
      const allInsights = [
        ...(response.data.customer_health?.insights || []).map((insight, i) => ({
          insight,
          type: 'customer',
          priority: i === 0 ? 'high' : 'medium',
          timestamp: response.data.customer_health.timestamp,
          impact_score: 8,
          status: 'new'
        })),
        ...(response.data.contract_performance?.insights || []).map((insight, i) => ({
          insight,
          type: 'contract',
          priority: i < 2 ? 'high' : 'medium',
          timestamp: response.data.contract_performance.timestamp,
          impact_score: 7,
          status: 'new'
        })),
        ...(response.data.business_metrics?.insights || []).map((insight, i) => ({
          insight,
          type: 'revenue',
          priority: i === 0 ? 'high' : 'medium',
          timestamp: response.data.business_metrics.timestamp,
          impact_score: 9,
          status: 'new'
        })),
        ...(supportResponse.data?.insights || []).map((insight, i) => ({
          insight,
          type: 'support',
          priority: 'medium',
          timestamp: supportResponse.data.timestamp,
          impact_score: 6,
          status: 'new'
        })),
        ...(referralResponse.data?.insights || []).map((insight, i) => ({
          insight,
          type: 'referral',
          priority: 'medium',
          timestamp: referralResponse.data.timestamp,
          impact_score: 7,
          status: 'new'
        }))
      ];
      
      setInsights(allInsights);
      setCacheStats(getCacheStats());
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const matchesSearch = insight.insight?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           insight.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || insight.type === selectedType;
      const matchesPriority = selectedPriority === 'all' || insight.priority === selectedPriority;
      return matchesSearch && matchesType && matchesPriority;
    });
  }, [insights, searchTerm, selectedType, selectedPriority]);

  const typeDistribution = useMemo(() => {
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const typeCount = {};
    insights.forEach(insight => {
      typeCount[insight.type] = (typeCount[insight.type] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([type, count], index) => ({
      name: type,
      value: count,
      color: COLORS[index % COLORS.length]
    }));
  }, [insights]);

  const priorityDistribution = useMemo(() => {
    const priorityCount = {};
    insights.forEach(insight => {
      priorityCount[insight.priority] = (priorityCount[insight.priority] || 0) + 1;
    });
    
    return Object.entries(priorityCount).map(([priority, count]) => ({
      priority,
      count
    }));
  }, [insights]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>AI Insights</h1>
          <p style={{ color: 'rgb(var(--color-text-secondary))' }}>AI-generated insights and recommendations</p>
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
            onClick={() => fetchInsights(true)}
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
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30">
              <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-secondary))' }}>Total Insights</p>
              <p className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>{insights.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900 dark:bg-opacity-30">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-secondary))' }}>High Priority</p>
              <p className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                {insights.filter(i => i.priority === 'high').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 dark:bg-opacity-30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-secondary))' }}>Implemented</p>
              <p className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                {insights.filter(i => i.status === 'implemented').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-secondary))' }}>Impact Score</p>
              <p className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                {insights.length > 0 ? (insights.reduce((sum, i) => sum + (i.impact_score || 0), 0) / insights.length).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insight Types */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Insight Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistribution.map((entry, index) => (
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

        {/* Priority Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
              <XAxis dataKey="priority" stroke={getChartColor()} />
              <YAxis stroke={getChartColor()} />
              <Tooltip 
                formatter={(value, name) => [
                  `${value} insights`,
                  'Count'
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
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
              />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>All Insights</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--color-text-tertiary))' }} />
              <input
                type="text"
                placeholder="Search insights..."
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              style={{ 
                backgroundColor: 'rgb(var(--color-bg-secondary))',
                borderColor: 'rgb(var(--color-border-secondary))',
                color: 'rgb(var(--color-text-primary))'
              }}
            >
              <option value="all">All Types</option>
              <option value="customer">Customer</option>
              <option value="contract">Contract</option>
              <option value="support">Support</option>
              <option value="revenue">Revenue</option>
              <option value="referral">Referral</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              style={{ 
                backgroundColor: 'rgb(var(--color-bg-secondary))',
                borderColor: 'rgb(var(--color-border-secondary))',
                color: 'rgb(var(--color-text-primary))'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((insight, index) => (
            <InsightCard
              key={index}
              insight={insight.insight || insight}
              type={insight.type || "general"}
              priority={insight.priority || "medium"}
              timestamp={insight.timestamp || insight.created_at}
              impactScore={insight.impact_score}
              status={insight.status}
            />
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgb(var(--color-text-tertiary))' }} />
            <p style={{ color: 'rgb(var(--color-text-secondary))' }}>No insights found matching your criteria.</p>
          </div>
        )}
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