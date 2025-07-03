import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Phone, 
  CheckCircle, 
  Target, 
  DollarSign,
  RefreshCw,
  X,
  BarChart3,
  Trophy,
  Database
} from 'lucide-react';
import { getReferralCallsAnalysis, getCacheStats } from '../services/cachedApi';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import CacheManager from '../components/CacheManager';

const ReferralAnalysis = () => {
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
            const response = await getReferralCallsAnalysis(aiInsightsEnabled, forceRefresh);
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
                    <p className="mt-4 text-gray-600">Loading referral analysis...</p>
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
                    <p className="text-gray-600">Referral analysis data is not available.</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Referral Call Analysis</h1>
                        <p className="text-gray-600 mt-2">Comprehensive analysis of referral call effectiveness and conversion outcomes</p>
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
                    title="Total Calls"
                    value={metrics.total_calls}
                    icon={Phone}
                    change="+15"
                    changeType="positive"
                />
                <MetricCard
                    title="Completed Calls"
                    value={metrics.completed_calls}
                    icon={CheckCircle}
                    change={((metrics.completed_calls / metrics.total_calls) * 100).toFixed(1)}
                    changeType="neutral"
                />
                <MetricCard
                    title="Avg Conversion Probability"
                    value={metrics.avg_conversion_probability * 100}
                    format="percentage"
                    icon={Target}
                    change="+3"
                    changeType="positive"
                />
                <MetricCard
                    title="Avg Deal Value"
                    value={metrics.avg_deal_value}
                    format="currency"
                    icon={DollarSign}
                    change="+8"
                    changeType="positive"
                />
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Call Performance */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Performance Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Scheduled Calls</span>
                            <span className="font-semibold">{metrics.scheduled_calls}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Average Duration</span>
                            <span className="font-semibold">{metrics.avg_duration.toFixed(0)} minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Decision Maker Present</span>
                            <span className="font-semibold">{metrics.decision_maker_calls}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Budget Discussions</span>
                            <span className="font-semibold">{metrics.budget_discussions}</span>
                        </div>
                    </div>
                </div>

                {/* Sentiment & Engagement */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment & Engagement Analysis</h3>
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
                            <span className="text-gray-600">Timeline Discussions</span>
                            <span className="font-semibold">{metrics.timeline_discussions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Conversion Rate</span>
                            <span className="font-semibold">{(metrics.avg_conversion_probability * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call Type Performance */}
            {metrics.call_types && metrics.call_types.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Type Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Call Type</th>
                                    <th className="text-right py-2">Count</th>
                                    <th className="text-right py-2">Avg Conversion</th>
                                    <th className="text-right py-2">Avg Deal Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.call_types.map((callType, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-2 capitalize">{callType.type}</td>
                                        <td className="text-right py-2">{callType.count}</td>
                                        <td className="text-right py-2">{(callType.avg_conversion * 100).toFixed(1)}%</td>
                                        <td className="text-right py-2">${callType.avg_deal_value.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Negotiation Stages */}
            {metrics.negotiation_stages && metrics.negotiation_stages.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Negotiation Stage Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {metrics.negotiation_stages.map((stage, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold capitalize">{stage.stage}</span>
                                    {stage.stage === 'won' ? (
                                        <Trophy className="h-6 w-6 text-yellow-500" />
                                    ) : stage.stage === 'lost' ? (
                                        <X className="h-6 w-6 text-red-500" />
                                    ) : (
                                        <BarChart3 className="h-6 w-6 text-blue-500" />
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">
                                    <div>Count: {stage.count}</div>
                                    <div>Conversion: {(stage.avg_conversion * 100).toFixed(1)}%</div>
                                    <div>Deal Value: ${stage.avg_deal_value.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Conversion Trends */}
            {metrics.conversion_trends && metrics.conversion_trends.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Trends (Last 30 Days)</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Date</th>
                                    <th className="text-right py-2">Avg Conversion</th>
                                    <th className="text-right py-2">Call Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.conversion_trends.slice(0, 10).map((trend, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-2">{trend.date}</td>
                                        <td className="text-right py-2">{(trend.avg_conversion * 100).toFixed(1)}%</td>
                                        <td className="text-right py-2">{trend.call_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

export default ReferralAnalysis; 