// ============================================================================
// Provider Data Validation - Summary KPI Cards Component
// ============================================================================

'use client';

import React from 'react';
import { OutreachSummary } from '@/lib/outreach-types';
import { Users, AlertTriangle, AlertCircle, Phone, CheckCircle, RotateCcw } from 'lucide-react';

interface OutreachSummaryProps {
  summary: OutreachSummary | null;
  isLoading: boolean;
  filteredTaskCount: number;
}

export const OutreachSummaryCards: React.FC<OutreachSummaryProps> = ({
  summary,
  isLoading,
  filteredTaskCount,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const getColorClasses = (color: string) => {
    const colors = {
      violet: { bg: 'from-violet-50 to-white', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', valueColor: 'text-violet-900' },
      yellow: { bg: 'from-yellow-50 to-white', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600', valueColor: 'text-yellow-900' },
      red: { bg: 'from-red-50 to-white', iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-900' },
      blue: { bg: 'from-blue-50 to-white', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-900' },
      green: { bg: 'from-green-50 to-white', iconBg: 'bg-green-100', iconColor: 'text-green-600', valueColor: 'text-green-900' },
      orange: { bg: 'from-orange-50 to-white', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', valueColor: 'text-orange-900' },
    };
    return colors[color as keyof typeof colors] || colors.violet;
  };

  const stats = [
    {
      label: 'Providers Pending',
      value: summary.totalOpenTasks,
      icon: Users,
      color: 'violet',
      description: 'Awaiting validation',
    },
    {
      label: 'At Risk',
      value: summary.atRiskSlaCount,
      icon: AlertTriangle,
      color: 'yellow',
      description: 'Deadline at risk',
    },
    {
      label: 'Past Due',
      value: summary.breachedSlaCount,
      icon: AlertCircle,
      color: 'red',
      description: 'Deadline exceeded',
    },
    {
      label: 'Contact Rate',
      value: `${summary.contactRate.toFixed(1)}%`,
      icon: Phone,
      color: 'blue',
      description: 'Providers reached',
    },
    {
      label: 'Validation Rate',
      value: summary.verificationCompletionRate.toFixed(1) + '%',
      icon: CheckCircle,
      color: 'green',
      description: 'Data verified',
    },
    {
      label: 'Avg Attempts',
      value: summary.avgAttemptsPerRecord.toFixed(1),
      icon: RotateCcw,
      color: 'orange',
      description: 'Per provider',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const colorClasses = getColorClasses(stat.color);
        return (
          <div
            key={index}
            className={`rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br ${colorClasses.bg}`}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color === 'violet' ? 'from-violet-600/10' : stat.color === 'yellow' ? 'from-yellow-600/10' : stat.color === 'red' ? 'from-red-600/10' : stat.color === 'blue' ? 'from-blue-600/10' : stat.color === 'green' ? 'from-green-600/10' : 'from-orange-600/10'} to-transparent rounded-bl-full`}></div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="tracking-tight text-sm font-medium text-gray-700">{stat.label}</div>
              <div className={`p-2 ${colorClasses.iconBg} rounded-lg`}>
                <IconComponent className={`h-4 w-4 ${colorClasses.iconColor}`} />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className={`text-2xl font-bold ${colorClasses.valueColor}`}>{stat.value}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
