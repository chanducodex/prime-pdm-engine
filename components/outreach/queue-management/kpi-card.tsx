// ============================================================================
// Queue Management - KPI Card Component
// ============================================================================

'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'violet' | 'blue' | 'green' | 'yellow' | 'red' | 'orange';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    violet: {
      bg: 'from-violet-50 to-white',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      valueColor: 'text-violet-900',
      gradient: 'from-violet-600/10',
    },
    blue: {
      bg: 'from-blue-50 to-white',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-900',
      gradient: 'from-blue-600/10',
    },
    green: {
      bg: 'from-green-50 to-white',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-900',
      gradient: 'from-green-600/10',
    },
    yellow: {
      bg: 'from-yellow-50 to-white',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-900',
      gradient: 'from-yellow-600/10',
    },
    red: {
      bg: 'from-red-50 to-white',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-900',
      gradient: 'from-red-600/10',
    },
    orange: {
      bg: 'from-orange-50 to-white',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-900',
      gradient: 'from-orange-600/10',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`rounded-lg bg-card text-card-foreground relative overflow-hidden border-0 shadow-lg bg-gradient-to-br ${classes.bg}`}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${classes.gradient} to-transparent rounded-bl-full`}></div>
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="tracking-tight text-sm font-medium text-gray-700">{title}</div>
        <div className={`p-2 ${classes.iconBg} rounded-lg`}>
          <Icon className={`h-4 w-4 ${classes.iconColor}`} />
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className={`text-2xl font-bold ${classes.valueColor}`}>{value}</div>
      </div>
    </div>
  );
};
