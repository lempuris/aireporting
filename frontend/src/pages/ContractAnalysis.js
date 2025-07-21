import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  Search,
  CheckCircle,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import CacheManager from '../components/CacheManager';
import { getContractPerformance, getContracts, getCacheStats } from '../services/cachedApi';

const ContractAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
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
      setChartsLoading(true);
      setContractsLoading(true);
      setIsUsingCache(false);
      
      const startTime = performance.now();
      
      // Load contract performance first (for charts)
      const contractData = await getContractPerformance(forceRefresh);
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Set main data and immediately stop charts loading
      setData(contractData.data);
      setChartsLoading(false);
      setLoading(false);
      
      // Check if we're using cached data
      if (loadTime < 100 && !forceRefresh) {
        setIsUsingCache(true);
      }

      setCacheStats(getCacheStats());
      
      // Load contracts data in background for table (non-blocking) - reduced to 15 for faster loading
      getContracts({ limit: 15 }, forceRefresh)
        .then(contractsData => {
          setContracts(contractsData.data.contracts);
          setContractsLoading(false);
        })
        .catch(error => {
          console.warn('Failed to load contracts list:', error);
          setContracts([]);
          setContractsLoading(false);
        });
        
    } catch (error) {
      console.error('Error fetching contract data:', error);
      toast.error('Failed to load contract analysis');
      setLoading(false);
      setChartsLoading(false);
      setContractsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = contract.contract_id.toString().includes(searchTerm) ||
                           contract.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || contract.contract_type === selectedType;
      const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contracts, searchTerm, selectedType, selectedStatus]);

  const contractTypeData = useMemo(() => {
    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];
    const dataArray = data?.metrics?.contract_types?.map((contract, index) => ({
      name: contract.type,
      value: contract.count,
      color: COLORS[index % COLORS.length]
    })) || [];

    // Fallback data if no contract types
    if (dataArray.length === 0) {
      dataArray.push(
        { name: 'No Data', value: 1, color: COLORS[0] }
      );
    }
    return dataArray;
  }, [data?.metrics?.contract_types]);

  // Generate renewal rate trends from contract types data
  const renewalData = useMemo(() => {
    const dataArray = data?.metrics?.contract_types?.map((contract, index) => ({
      month: contract.type,
      rate: (contract.avg_renewal || 0) * 100,
      contracts: contract.count
    })) || [];

    // Fallback data if no renewal data
    if (dataArray.length === 0) {
      dataArray.push(
        { month: 'No Data', rate: 0, contracts: 0 }
      );
    }
    return dataArray;
  }, [data?.metrics?.contract_types]);

  // Generate contract values from contract types data
  const valueData = useMemo(() => {
    const dataArray = data?.metrics?.contract_types?.map((contract, index) => ({
      type: contract.type,
      avgValue: contract.avg_value || 0,
      totalValue: (contract.avg_value || 0) * (contract.count || 0)
    })) || [];

    // Fallback data if no value data
    if (dataArray.length === 0) {
      dataArray.push(
        { type: 'No Data', avgValue: 0, totalValue: 0 }
      );
    }
    return dataArray;
  }, [data?.metrics?.contract_types]);

  // Memoized skeleton loading component
  const ChartSkeleton = memo(() => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  ));

  // Memoized table skeleton component
  const TableSkeleton = memo(() => (
    <div className="animate-pulse">
      <div className="flex justify-between mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  ));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>Loading contract analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>Contract Analysis</h1>
          <p style={{ color: 'rgb(var(--color-text-secondary))' }}>Contract performance, renewal rates, and value optimization</p>
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
          title="Total Contracts"
          value={data?.metrics?.total_contracts || 0}
          icon={FileText}
        />
        <MetricCard
          title="Total Contract Value"
          value={data?.metrics?.total_contract_value || 0}
          format="currency"
          icon={DollarSign}
        />
        <MetricCard
          title="Average Renewal Rate"
          value={(data?.metrics?.avg_renewal_rate || 0) * 100}
          format="percentage"
          icon={TrendingUp}
        />
        <MetricCard
          title="Active Contracts"
          value={data?.metrics?.active_contracts || 0}
          icon={CheckCircle}
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Types */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          {chartsLoading ? (
            <ChartSkeleton />
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Contract Types Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contractTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contractTypeData.map((entry, index) => (
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
            </>
          )}
        </motion.div>

        {/* Renewal Rate Trends */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          {chartsLoading ? (
            <ChartSkeleton />
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Renewal Rate by Contract Type</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={renewalData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={getChartColor()} opacity={0.2} />
                  <XAxis 
                    dataKey="month" 
                    stroke={getChartColor()} 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke={getChartColor()} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ 
                            backgroundColor: 'rgb(var(--color-bg-primary))',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '500',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            minWidth: '150px',
                            color: 'rgb(var(--color-text-primary))'
                          }}>
                            <p style={{ fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>{label}</p>
                            <p style={{ color: 'rgb(var(--color-text-secondary))', marginBottom: '2px' }}>
                              Renewal Rate: {data.rate.toFixed(1)}%
                            </p>
                            <p style={{ color: 'rgb(var(--color-text-secondary))', marginBottom: '0' }}>
                              Contracts: {data.contracts}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  />
                  <Bar dataKey="rate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </motion.div>
      </div>

      {/* Contract Values */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {chartsLoading ? (
          <ChartSkeleton />
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Contract Values by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={valueData}>
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
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                />
                <Bar dataKey="avgValue" fill="#3B82F6" name="Average Value" />
                <Bar dataKey="totalValue" fill="#8B5CF6" name="Total Value" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </motion.div>

      {/* AI Insights */}
      {data?.insights && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>AI-Generated Contract Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.insights?.map((insight, index) => (
              <InsightCard
                key={index}
                insight={insight.insight || insight}
                type={insight.type || "contract"}
                priority={insight.priority || (index < 2 ? 'high' : 'medium')}
                timestamp={insight.timestamp || data?.timestamp}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Contract List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {contractsLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>Contract List</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--color-text-tertiary))' }} />
                  <input
                    type="text"
                    placeholder="Search contracts..."
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
                  <option value="enterprise">Enterprise</option>
                  <option value="professional">Professional</option>
                  <option value="basic">Basic</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                  style={{ 
                    backgroundColor: 'rgb(var(--color-bg-secondary))',
                    borderColor: 'rgb(var(--color-border-secondary))',
                    color: 'rgb(var(--color-text-primary))'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: 'rgb(var(--color-border))' }}>
                <thead style={{ backgroundColor: 'rgb(var(--color-bg-tertiary))' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      Contract ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                      Renewal Rate
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'rgb(var(--color-bg-secondary))' }} className="divide-y">
                  {filteredContracts.slice(0, 8).map((contract) => (
                    <tr key={contract.contract_id} className="hover:opacity-80 transition-opacity" style={{ borderColor: 'rgb(var(--color-border))' }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>
                        #{contract.contract_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>{contract.customer_name}</div>
                          <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>{contract.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contract.contract_type === 'enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300' :
                          contract.contract_type === 'professional' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:bg-opacity-30 dark:text-gray-300'
                        }`}>
                          {contract.contract_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                        ${contract.contract_value?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contract.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300' :
                          contract.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-300'
                        }`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>
                        {((contract.renewal_rate || 0) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
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

export default ContractAnalysis; 