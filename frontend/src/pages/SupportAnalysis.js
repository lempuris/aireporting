import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Clipboard, 
  AlertCircle, 
  Clock, 
  Smile,
  RefreshCw,
  Circle,
  Database
} from 'lucide-react';
import { getSupportTicketsAnalysis, getCacheStats } from '../services/cachedApi';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import CacheManager from '../components/CacheManager';

const SupportAnalysis = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
    const [cacheStats, setCacheStats] = useState(null);
    const [isUsingCache, setIsUsingCache] = useState(false);
    const [showCacheManager, setShowCacheManager] = useState(false);

    useEffect(() => {
        fetchData();
    }, [aiInsightsEnabled]);

    const fetchData = async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);
            setIsUsingCache(false);
            
            const startTime = performance.now();
            const response = await getSupportTicketsAnalysis(aiInsightsEnabled, forceRefresh);
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
            
            setData(response.data);
            setCacheStats(getCacheStats());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading support analysis...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-gray-600 text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
                    <p className="text-gray-600">Support analysis data is not available.</p>
                </div>
            </div>
        );
    }

    const { metrics, insights } = data;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Support Ticket Analysis</h1>
                        <p className="text-gray-600 mt-2">Comprehensive analysis of support ticket performance and customer satisfaction</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={aiInsightsEnabled}
                                onChange={(e) => setAiInsightsEnabled(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">AI Insights</span>
                        </label>
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
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Tickets"
                    value={metrics.total_tickets}
                    icon={Clipboard}
                    change="+12"
                    changeType="positive"
                />
                <MetricCard
                    title="Open Tickets"
                    value={metrics.open_tickets}
                    icon={AlertCircle}
                    change={((metrics.open_tickets / metrics.total_tickets) * 100).toFixed(1)}
                    changeType="neutral"
                />
                <MetricCard
                    title="Avg Resolution Time"
                    value={metrics.avg_resolution_time}
                    icon={Clock}
                    change="-8"
                    changeType="negative"
                />
                <MetricCard
                    title="Customer Satisfaction"
                    value={metrics.avg_satisfaction}
                    icon={Smile}
                    change="+5"
                    changeType="positive"
                />
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Response Time Metrics */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Response & Resolution Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">First Response Time</span>
                            <span className="font-semibold">{metrics.avg_first_response.toFixed(0)} minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Resolution Time</span>
                            <span className="font-semibold">{metrics.avg_resolution_time.toFixed(0)} minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Escalated Tickets</span>
                            <span className="font-semibold">{metrics.escalated_tickets}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Avg Interactions</span>
                            <span className="font-semibold">{metrics.avg_interactions.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Sentiment & Complexity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment & Complexity Analysis</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Sentiment Score</span>
                            <span className="font-semibold">{metrics.avg_sentiment.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Urgency Score</span>
                            <span className="font-semibold">{metrics.avg_urgency.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Complexity Score</span>
                            <span className="font-semibold">{metrics.avg_complexity.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Resolved Tickets</span>
                            <span className="font-semibold">{metrics.resolved_tickets}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Performance */}
            {metrics.categories && metrics.categories.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Category</th>
                                    <th className="text-right py-2">Tickets</th>
                                    <th className="text-right py-2">Avg Resolution (min)</th>
                                    <th className="text-right py-2">Avg Satisfaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.categories.slice(0, 5).map((category, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-2">{category.category}</td>
                                        <td className="text-right py-2">{category.count}</td>
                                        <td className="text-right py-2">{category.avg_resolution.toFixed(0)}</td>
                                        <td className="text-right py-2">{category.avg_satisfaction.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Priority Analysis */}
            {metrics.priority_analysis && metrics.priority_analysis.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.priority_analysis.map((priority, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold capitalize">{priority.priority}</span>
                                    <Circle className={`h-6 w-6 ${
                                        priority.priority === 'high' ? 'text-red-500' : 
                                        priority.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                                    }`} />
                                </div>
                                <div className="text-sm text-gray-600">
                                    <div>Count: {priority.count}</div>
                                    <div>Resolution: {priority.avg_resolution.toFixed(0)} min</div>
                                    <div>Satisfaction: {priority.avg_satisfaction.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Insights */}
            {aiInsightsEnabled && insights && insights.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.map((insight, index) => (
                            <InsightCard key={index} insight={insight} />
                        ))}
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

export default SupportAnalysis; 