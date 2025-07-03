import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  XCircle,
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
  const [data, setData] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [cacheStats, setCacheStats] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [showCacheManager, setShowCacheManager] = useState(false);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setIsUsingCache(false);
      
      const startTime = performance.now();
      const [contractData, contractsData] = await Promise.all([
        getContractPerformance(forceRefresh),
        getContracts({ limit: 50 }, forceRefresh)
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

      setData(contractData.data);
      setContracts(contractsData.data.contracts);
      setCacheStats(getCacheStats());
    } catch (error) {
      console.error('Error fetching contract data:', error);
      toast.error('Failed to load contract data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contract_id.toString().includes(searchTerm) ||
                         contract.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || contract.contract_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const contractTypeData = data?.metrics?.contract_types?.map((contract, index) => ({
    name: contract.type,
    value: contract.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  // Fallback data if no contract types
  if (contractTypeData.length === 0) {
    contractTypeData.push(
      { name: 'No Data', value: 1, color: COLORS[0] }
    );
  }

  // Generate renewal rate trends from contract types data
  const renewalData = data?.metrics?.contract_types?.map((contract, index) => ({
    month: contract.type,
    rate: (contract.avg_renewal || 0) * 100,
    contracts: contract.count
  })) || [];

  // Fallback data if no renewal data
  if (renewalData.length === 0) {
    renewalData.push(
      { month: 'No Data', rate: 0, contracts: 0 }
    );
  }

  // Generate contract values from contract types data
  const valueData = data?.metrics?.contract_types?.map((contract, index) => ({
    type: contract.type,
    avgValue: contract.avg_value || 0,
    totalValue: (contract.avg_value || 0) * (contract.count || 0)
  })) || [];

  // Fallback data if no value data
  if (valueData.length === 0) {
    valueData.push(
      { type: 'No Data', avgValue: 0, totalValue: 0 }
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Analysis</h1>
          <p className="text-gray-600">Contract performance, renewal rates, and value optimization</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Types Distribution</h3>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Renewal Rates */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Renewal Rate Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={renewalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Renewal Rate']} />
              <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Contract Values */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Values by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={valueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
            <Bar dataKey="avgValue" fill="#3B82F6" name="Average Value" />
            <Bar dataKey="totalValue" fill="#8B5CF6" name="Total Value" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Contract Insights</h3>
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

      {/* Contract List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Contract List</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="premium">Premium</option>
              <option value="standard">Standard</option>
              <option value="basic">Basic</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Renewal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.slice(0, 10).map((contract) => (
                <tr key={contract.contract_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{contract.contract_id}</div>
                      <div className="text-sm text-gray-500">{contract.contract_type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contract.customer_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      contract.contract_type === 'premium' ? 'bg-purple-100 text-purple-800' :
                      contract.contract_type === 'standard' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.contract_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${contract.contract_value?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      contract.status === 'active' ? 'bg-success-100 text-success-800' :
                      contract.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-success-600 h-2 rounded-full" 
                          style={{ width: `${(contract.renewal_probability || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {((contract.renewal_probability || 0) * 100).toFixed(0)}%
                      </span>
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

export default ContractAnalysis; 