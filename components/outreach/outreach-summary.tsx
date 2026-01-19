// ============================================================================
// Outreach Management - Summary KPIs Component
// ============================================================================

'use client';

import React from 'react';
import { OutreachSummary } from '@/lib/outreach-types';

interface OutreachSummaryProps {
  summary: OutreachSummary | null;
  isLoading: boolean;
}

const getKPIColor = (type: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral') => {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    case 'danger':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }
};

const getKPITextColor = (type: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral') => {
  switch (type) {
    case 'success':
      return 'text-green-700 dark:text-green-400';
    case 'warning':
      return 'text-yellow-700 dark:text-yellow-400';
    case 'danger':
      return 'text-red-700 dark:text-red-400';
    default:
      return 'text-gray-900 dark:text-white';
  }
};

export const OutreachSummaryKPIs: React.FC<OutreachSummaryProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No summary data available</p>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Open Tasks',
      value: summary.totalOpenTasks.toLocaleString(),
      type: 'neutral',
    },
    {
      label: 'At-Risk SLA',
      value: summary.atRiskSlaCount.toLocaleString(),
      type: summary.atRiskSlaCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Breached SLA',
      value: summary.breachedSlaCount.toLocaleString(),
      type: summary.breachedSlaCount > 0 ? 'danger' : 'success',
    },
    {
      label: 'Contact Rate',
      value: `${summary.contactRate.toFixed(1)}%`,
      type: summary.contactRate >= 50 ? 'success' : 'warning',
    },
    {
      label: 'Verification Rate',
      value: `${summary.verificationCompletionRate.toFixed(1)}%`,
      type: summary.verificationCompletionRate >= 60 ? 'success' : 'warning',
    },
    {
      label: 'Avg Attempts',
      value: summary.avgAttemptsPerRecord.toFixed(1),
      type: 'neutral',
    },
  ];

  return (
    <div className="mb-6">
      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${getKPIColor(kpi.type)}`}
          >
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              {kpi.label}
            </p>
            <p className={`text-2xl font-bold ${getKPITextColor(kpi.type)}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Backlog by Method */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Queue Backlog by Method
          </h3>
          <div className="space-y-2">
            {Object.entries(summary.queueBacklogByMethod).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {method.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                      style={{
                        width: `${(count / summary.totalOpenTasks) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Block Reasons */}
        {summary.topBlockReasons.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Top Block Reasons
            </h3>
            <div className="space-y-2">
              {summary.topBlockReasons.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.reason.replace(/_/g, ' ').toLowerCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Escalation Triggers */}
        {summary.topEscalationTriggers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Top Escalation Triggers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summary.topEscalationTriggers.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <span className="text-xs text-gray-600 dark:text-gray-400">{item.trigger}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
