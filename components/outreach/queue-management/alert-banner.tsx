// ============================================================================
// Queue Management - Alert Banner Component
// ============================================================================

'use client';

import React from 'react';
import { QueueAlert } from '@/lib/outreach-queue-types';
import { X, AlertCircle, AlertTriangle, Activity } from 'lucide-react';

interface AlertBannerProps {
  alert: QueueAlert;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  const getSeverityConfig = () => {
    const configs = {
      CRITICAL: { bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
      WARNING: { bg: 'bg-yellow-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
      INFO: { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    };
    return configs[alert.severity];
  };

  const config = getSeverityConfig();
  const Icon = alert.severity === 'CRITICAL' ? AlertCircle : alert.severity === 'WARNING' ? AlertTriangle : Activity;

  return (
    <div className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`p-1.5 ${config.iconBg} rounded-lg`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{alert.title}</p>
          <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
