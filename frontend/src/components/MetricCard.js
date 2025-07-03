import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  format = 'number',
  icon: Icon,
  className = ''
}) => {
  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (format === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    if (format === 'decimal') {
      return val.toFixed(3);
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUp className="h-4 w-4" />;
    if (changeType === 'negative') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success-600';
    if (changeType === 'negative') return 'text-danger-600';
    return 'text-gray-500';
  };

  return (
    <div className={`metric-card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="metric-label">{title}</p>
          <p className="metric-value">{formatValue(value)}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1 text-sm font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="ml-1 text-xs">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-primary-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard; 