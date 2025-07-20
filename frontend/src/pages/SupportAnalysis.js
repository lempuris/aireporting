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
                    <p className="mt-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>Loading support analysis...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>Error Loading Data</h2>
                    <p className="mb-4" style={{ color: 'rgb(var(--color-text-secondary))' }}>{error}</p>
                    <button
                        onClick={fetchData}
                        className="btn-primary"
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
                    <div className="text-6xl mb-4" style={{ color: 'rgb(var(--color-text-tertiary))' }}>📊</div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>No Data Available</h2>
                    <p style={{ color: 'rgb(var(--color-text-secondary))' }}>Support analysis data is not available.</p>
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
                        <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--color-text-primary))' }}>Support Ticket Analysis</h1>
                        <p className="mt-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>Comprehensive analysis of support ticket performance and customer satisfaction</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={aiInsightsEnabled}
                                onChange={(e) => setAiInsightsEnabled(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm" style={{ color: 'rgb(var(--color-text-primary))' }}>AI Insights</span>
                        </label>
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
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Response & Resolution Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'rgb(var(--color-text-secondary))' }}>First Response Time</span>
                            <span className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{metrics.avg_first_response.toFixed(0)} minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'rgb(var(--color-text-secondary))' }}>Resolution Time</span>
                            <span className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{metrics.avg_resolution_time.toFixed(0)} minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'rgb(var(--color-text-secondary))' }}>Escalated Tickets</span>
                            <span className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{metrics.escalated_tickets}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'rgb(var(--color-text-secondary))' }}>Avg Interactions</span>
                            <span className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{metrics.avg_interactions.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Sentiment & Complexity */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Sentiment & Complexity Analysis</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'rgb(var(--color-text-secondary))' }}>Sentiment Score</span>
                            <span className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{metrics.avg_sentiment.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'rgb(var(--color-text-secondary))' }}>Urgency Score</span>
                            <span className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{metrics.avg_urgency.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'rgb(var(--color-text-secondary))' }}>Complexity Score</span>
                            <span className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{metrics.avg_complexity.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'rgb(var(--color-text-secondary))' }}>Resolved Tickets</span>
                            <span className="font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>{metrics.resolved_tickets}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Performance */}
            {metrics.categories && metrics.categories.length > 0 && (
                <div className="card mb-8">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Category Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b" style={{ borderColor: 'rgb(var(--color-border))' }}>
                                    <th className="text-left py-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>Category</th>
                                    <th className="text-right py-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>Tickets</th>
                                    <th className="text-right py-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>Avg Resolution (min)</th>
                                    <th className="text-right py-2" style={{ color: 'rgb(var(--color-text-secondary))' }}>Avg Satisfaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.categories.slice(0, 5).map((category, index) => (
                                    <tr key={index} className="border-b hover:opacity-80 transition-opacity" style={{ borderColor: 'rgb(var(--color-border))' }}>
                                        <td className="py-2" style={{ color: 'rgb(var(--color-text-primary))' }}>{category.category}</td>
                                        <td className="text-right py-2" style={{ color: 'rgb(var(--color-text-primary))' }}>{category.count}</td>
                                        <td className="text-right py-2" style={{ color: 'rgb(var(--color-text-primary))' }}>{category.avg_resolution.toFixed(0)}</td>
                                        <td className="text-right py-2" style={{ color: 'rgb(var(--color-text-primary))' }}>{category.avg_satisfaction.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Priority Analysis */}
            {metrics.priority_analysis && metrics.priority_analysis.length > 0 && (
                <div className="card mb-8">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>Priority Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.priority_analysis.map((priority, index) => (
                            <div key={index} className="border rounded-lg p-4" style={{ borderColor: 'rgb(var(--color-border))' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold capitalize" style={{ color: 'rgb(var(--color-text-primary))' }}>{priority.priority}</span>
                                    <Circle className={`h-6 w-6 ${
                                        priority.priority === 'high' ? 'text-red-500' : 
                                        priority.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                                    }`} />
                                </div>
                                <div className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
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
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>AI-Generated Insights</h3>
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