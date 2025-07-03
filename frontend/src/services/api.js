import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Health check
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Analysis endpoints
export const getCustomerHealth = async () => {
  const response = await api.get('/api/v1/analysis/customer-health');
  return response.data;
};

export const getContractPerformance = async () => {
  const response = await api.get('/api/v1/analysis/contract-performance');
  return response.data;
};

export const getBusinessMetrics = async () => {
  const response = await api.get('/api/v1/analysis/business-metrics');
  return response.data;
};

export const getComprehensiveAnalysis = async (includeAIInsights = false) => {
  const response = await api.get('/api/v1/analysis/comprehensive', {
    params: { include_ai_insights: includeAIInsights },
    timeout: 60000  // 60 seconds for comprehensive analysis
  });
  return response.data;
};

// Predictive analytics endpoints
export const getChurnPrediction = async (customerId = null) => {
  const params = customerId ? { customer_id: customerId } : {};
  const response = await api.get('/api/v1/predictions/churn', { params });
  return response.data;
};

export const getRevenueForecast = async (months = 12) => {
  const response = await api.get('/api/v1/predictions/revenue-forecast', {
    params: { months }
  });
  return response.data;
};

export const getCustomerLTV = async (customerId) => {
  const response = await api.get(`/api/v1/predictions/customer-ltv/${customerId}`);
  return response.data;
};

// Insights endpoints
export const updateCustomerInsights = async () => {
  const response = await api.post('/api/v1/insights/update-customers');
  return response.data;
};

export const updateContractInsights = async () => {
  const response = await api.post('/api/v1/insights/update-contracts');
  return response.data;
};

export const generateDailyInsights = async () => {
  const response = await api.post('/api/v1/insights/daily');
  return response.data;
};

// Data access endpoints
export const getCustomers = async (params = {}) => {
  const response = await api.get('/api/v1/customers', { params });
  return response.data;
};

export const getContracts = async (params = {}) => {
  const response = await api.get('/api/v1/contracts', { params });
  return response.data;
};

// Support and Referral Analysis endpoints
export const getSupportTicketsAnalysis = async (includeAIInsights = true) => {
  const response = await api.get('/api/v1/analysis/support-tickets', {
    params: { include_ai_insights: includeAIInsights }
  });
  return response.data;
};

export const getReferralCallsAnalysis = async (includeAIInsights = true) => {
  const response = await api.get('/api/v1/analysis/referral-calls', {
    params: { include_ai_insights: includeAIInsights }
  });
  return response.data;
};

export const getCustomerJourneyAnalysis = async (customerId, includeAIInsights = true) => {
  const response = await api.get(`/api/v1/analysis/customer-journey/${customerId}`, {
    params: { include_ai_insights: includeAIInsights }
  });
  return response.data;
};

export default api; 