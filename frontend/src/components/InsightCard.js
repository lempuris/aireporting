import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Users, FileText } from 'lucide-react';

const InsightCard = ({ 
  insight, 
  type = 'general', 
  priority = 'medium',
  timestamp,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'customer':
        return <Users className="h-5 w-5" />;
      case 'contract':
        return <FileText className="h-5 w-5" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-danger-500 bg-danger-50';
      case 'medium':
        return 'border-l-4 border-warning-500 bg-warning-50';
      case 'low':
        return 'border-l-4 border-success-500 bg-success-50';
      default:
        return 'border-l-4 border-primary-500 bg-primary-50';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'customer':
        return 'text-blue-600';
      case 'contract':
        return 'text-purple-600';
      case 'trend':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      default:
        return 'text-primary-600';
    }
  };

  return (
    <div className={`insight-card ${getPriorityColor()} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${getTypeColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 capitalize">
              {type} Insight
            </p>
            {timestamp && (
              <p className="text-xs text-gray-500">
                {new Date(timestamp).toLocaleDateString()}
              </p>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-700 leading-relaxed">
            {insight}
          </p>
          <div className="mt-2 flex items-center">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              priority === 'high' ? 'bg-danger-100 text-danger-800' :
              priority === 'medium' ? 'bg-warning-100 text-warning-800' :
              'bg-success-100 text-success-800'
            }`}>
              {priority} priority
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard; 