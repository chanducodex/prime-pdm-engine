// ============================================================================
// Performance Metrics Widget
// Agent KPIs and performance tracking
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Phone,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from 'lucide-react';

export interface AgentPerformanceMetrics {
  callsHandledToday: number;
  averageHandleTime: number; // seconds
  firstCallResolutionRate: number; // percentage 0-100
  customerSatisfactionScore: number; // 0-100
  targetGoals: {
    callsTarget: number;
    ahtTarget: number; // seconds
    fcrTarget: number; // percentage
    csatTarget: number; // 0-100
  };
}

interface PerformanceMetricsWidgetProps {
  metrics?: AgentPerformanceMetrics | null;
  compact?: boolean;
  className?: string;
}

// Generate mock metrics
const generateMockMetrics = (): AgentPerformanceMetrics => ({
  callsHandledToday: Math.floor(Math.random() * 10) + 15,
  averageHandleTime: Math.floor(Math.random() * 120) + 300, // 300-420 seconds
  firstCallResolutionRate: Math.floor(Math.random() * 15) + 70, // 70-85%
  customerSatisfactionScore: Math.floor(Math.random() * 10) + 85, // 85-95
  targetGoals: {
    callsTarget: 30,
    ahtTarget: 360, // 6 minutes
    fcrTarget: 75,
    csatTarget: 90,
  },
});

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PerformanceMetricsWidget: React.FC<PerformanceMetricsWidgetProps> = ({
  metrics: propMetrics,
  compact = false,
  className = '',
}) => {
  const [metrics, setMetrics] = useState<AgentPerformanceMetrics | null>(propMetrics || null);

  // Load metrics on mount
  useEffect(() => {
    if (!propMetrics) {
      setMetrics(generateMockMetrics());
    }
  }, [propMetrics]);

  // Simulate metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateMockMetrics());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading metrics...</span>
        </div>
      </div>
    );
  }

  const callsProgress = (metrics.callsHandledToday / metrics.targetGoals.callsTarget) * 100;
  const ahtDiff = metrics.averageHandleTime - metrics.targetGoals.ahtTarget;
  const fcrDiff = metrics.firstCallResolutionRate - metrics.targetGoals.fcrTarget;
  const csatDiff = metrics.customerSatisfactionScore - metrics.targetGoals.csatTarget;

  // Compact version for header
  if (compact) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">{metrics.callsHandledToday}</span>
          <span className="text-xs text-gray-400">/ {metrics.targetGoals.callsTarget}</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {formatTime(metrics.averageHandleTime)}
          </span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">{metrics.customerSatisfactionScore}</span>
        </div>
      </div>
    );
  }

  // Full widget version
  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-gray-900">Today's Performance</h3>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
            <Target className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">vs Target</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Calls Handled */}
          <MetricCard
            icon={Phone}
            label="Calls Handled"
            value={metrics.callsHandledToday.toString()}
            target={metrics.targetGoals.callsTarget}
            progress={callsProgress}
            unit="calls"
            trend={callsProgress >= 100 ? 'up' : callsProgress >= 80 ? 'neutral' : 'down'}
          />

          {/* Average Handle Time */}
          <MetricCard
            icon={Clock}
            label="Avg Handle Time"
            value={formatTime(metrics.averageHandleTime)}
            target={metrics.targetGoals.ahtTarget}
            targetDisplay={formatTime(metrics.targetGoals.ahtTarget)}
            diff={ahtDiff}
            diffFormat={(d) => (d > 0 ? `+${formatTime(Math.abs(d))}` : `-${formatTime(Math.abs(d))}`)}
            trend={ahtDiff <= 0 ? 'up' : ahtDiff <= 30 ? 'neutral' : 'down'}
            invertTrend
          />

          {/* First Call Resolution */}
          <MetricCard
            icon={CheckCircle}
            label="First Call Resolution"
            value={`${metrics.firstCallResolutionRate}%`}
            target={metrics.targetGoals.fcrTarget}
            progress={metrics.firstCallResolutionRate}
            diff={fcrDiff}
            diffFormat={(d) => `${d >= 0 ? '+' : ''}${d}%`}
            trend={fcrDiff >= 0 ? 'up' : fcrDiff >= -5 ? 'neutral' : 'down'}
          />

          {/* Customer Satisfaction */}
          <MetricCard
            icon={Star}
            label="Customer Satisfaction"
            value={metrics.customerSatisfactionScore.toString()}
            target={metrics.targetGoals.csatTarget}
            progress={metrics.customerSatisfactionScore}
            diff={csatDiff}
            diffFormat={(d) => `${d >= 0 ? '+' : ''}${d}`}
            trend={csatDiff >= 0 ? 'up' : csatDiff >= -3 ? 'neutral' : 'down'}
            iconColor="text-amber-500"
          />
        </div>

        {/* Overall Progress */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Daily Goal Progress</span>
            <span className="text-xs font-semibold text-gray-900">
              {Math.round(callsProgress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                callsProgress >= 100
                  ? 'bg-green-500'
                  : callsProgress >= 75
                  ? 'bg-emerald-500'
                  : callsProgress >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, callsProgress)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">0</span>
            <span className="text-xs text-gray-400">{metrics.targetGoals.callsTarget} calls</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  target: number;
  targetDisplay?: string;
  progress?: number;
  diff?: number;
  diffFormat?: (diff: number) => string;
  unit?: string;
  trend: 'up' | 'down' | 'neutral';
  invertTrend?: boolean;
  iconColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  label,
  value,
  target,
  targetDisplay,
  progress,
  diff,
  diffFormat,
  unit,
  trend,
  invertTrend,
  iconColor = 'text-gray-400',
}) => {
  const effectiveTrend = invertTrend
    ? trend === 'up'
      ? 'up'
      : trend === 'down'
      ? 'down'
      : 'neutral'
    : trend;

  const TrendIcon = effectiveTrend === 'up' ? TrendingUp : effectiveTrend === 'down' ? TrendingDown : Minus;
  const trendColor = effectiveTrend === 'up' ? 'text-green-600' : effectiveTrend === 'down' ? 'text-red-600' : 'text-gray-400';

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          {diff !== undefined && diffFormat && (
            <span className={`text-xs font-medium ${trendColor}`}>{diffFormat(diff)}</span>
          )}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Target: {targetDisplay || target}
      </div>
    </div>
  );
};

// Compact badge version
export const PerformanceMetricsBadge: React.FC<{
  metrics?: AgentPerformanceMetrics | null;
}> = ({ metrics }) => {
  if (!metrics) return null;

  const callsProgress = (metrics.callsHandledToday / metrics.targetGoals.callsTarget) * 100;

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg">
      <Phone className="w-3.5 h-3.5 text-gray-500" />
      <span className="text-xs font-medium text-gray-700">
        {metrics.callsHandledToday}/{metrics.targetGoals.callsTarget}
      </span>
      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${callsProgress >= 100 ? 'bg-green-500' : 'bg-violet-500'}`}
          style={{ width: `${Math.min(100, callsProgress)}%` }}
        />
      </div>
    </div>
  );
};
