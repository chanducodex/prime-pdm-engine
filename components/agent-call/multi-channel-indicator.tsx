// ============================================================================
// Multi-Channel Indicator
// Queue counts and channel switching for omnichannel support
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  PhoneCall,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export interface ChannelQueue {
  count: number;
  priority: number; // Number of high priority items
  oldestItemAge?: number; // Age in minutes of oldest item
}

export interface ChannelQueues {
  email: ChannelQueue;
  chat: ChannelQueue;
  sms: ChannelQueue;
  callback: ChannelQueue;
}

export type ChannelType = 'VOICE' | 'EMAIL' | 'CHAT' | 'SMS';

interface MultiChannelIndicatorProps {
  currentChannel?: ChannelType;
  onSwitchChannel?: (channel: ChannelType) => void;
  queues?: ChannelQueues | null;
  compact?: boolean;
  className?: string;
}

// Generate mock queue data
const generateMockQueues = (): ChannelQueues => ({
  email: {
    count: Math.floor(Math.random() * 15) + 5,
    priority: Math.floor(Math.random() * 5),
    oldestItemAge: Math.floor(Math.random() * 60) + 5,
  },
  chat: {
    count: Math.floor(Math.random() * 5),
    priority: Math.floor(Math.random() * 2),
    oldestItemAge: Math.floor(Math.random() * 10) + 1,
  },
  sms: {
    count: Math.floor(Math.random() * 10) + 2,
    priority: Math.floor(Math.random() * 3),
    oldestItemAge: Math.floor(Math.random() * 30) + 5,
  },
  callback: {
    count: Math.floor(Math.random() * 8) + 3,
    priority: Math.floor(Math.random() * 4) + 1,
    oldestItemAge: Math.floor(Math.random() * 120) + 10,
  },
});

const channelConfig: Record<
  keyof ChannelQueues,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
    bgColor: string;
    type: ChannelType;
  }
> = {
  email: { icon: Mail, label: 'Email', color: 'text-blue-600', bgColor: 'bg-blue-100', type: 'EMAIL' },
  chat: { icon: MessageCircle, label: 'Chat', color: 'text-green-600', bgColor: 'bg-green-100', type: 'CHAT' },
  sms: { icon: MessageSquare, label: 'SMS', color: 'text-purple-600', bgColor: 'bg-purple-100', type: 'SMS' },
  callback: { icon: PhoneCall, label: 'Callback', color: 'text-amber-600', bgColor: 'bg-amber-100', type: 'VOICE' },
};

export const MultiChannelIndicator: React.FC<MultiChannelIndicatorProps> = ({
  currentChannel = 'VOICE',
  onSwitchChannel,
  queues: propQueues,
  compact = false,
  className = '',
}) => {
  const [queues, setQueues] = useState<ChannelQueues | null>(propQueues || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load queues on mount
  useEffect(() => {
    if (!propQueues) {
      setQueues(generateMockQueues());
    }
  }, [propQueues]);

  // Simulate queue updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQueues(generateMockQueues());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setQueues(generateMockQueues());
    setIsRefreshing(false);
  };

  const totalPending = queues
    ? queues.email.count + queues.chat.count + queues.sms.count + queues.callback.count
    : 0;

  const totalPriority = queues
    ? queues.email.priority + queues.chat.priority + queues.sms.priority + queues.callback.priority
    : 0;

  if (!queues) {
    return null;
  }

  // Compact version for header
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {Object.entries(channelConfig).map(([key, config]) => {
          const queue = queues[key as keyof ChannelQueues];
          const Icon = config.icon;
          const hasItems = queue.count > 0;
          const hasPriority = queue.priority > 0;

          return (
            <button
              key={key}
              onClick={() => onSwitchChannel?.(config.type)}
              className={`relative p-1.5 rounded-lg transition-colors ${
                hasItems ? 'hover:bg-gray-100' : 'opacity-50 cursor-default'
              }`}
              title={`${config.label}: ${queue.count} pending${hasPriority ? ` (${queue.priority} urgent)` : ''}`}
            >
              <Icon className={`w-4 h-4 ${hasItems ? config.color : 'text-gray-400'}`} />
              {hasItems && (
                <span
                  className={`absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center px-1 text-xs font-semibold rounded-full ${
                    hasPriority ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {queue.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Full panel version
  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Channel Queues</h3>
            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {totalPending} total
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Channel Cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {Object.entries(channelConfig).map(([key, config]) => {
          const queue = queues[key as keyof ChannelQueues];
          const Icon = config.icon;
          const hasItems = queue.count > 0;
          const hasPriority = queue.priority > 0;

          return (
            <div
              key={key}
              className={`p-3 border rounded-lg transition-colors ${
                hasItems ? 'border-gray-200 hover:border-gray-300' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{config.label}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{queue.count}</span>
              </div>

              {hasItems && (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">In queue</span>
                    {hasPriority && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>{queue.priority} urgent</span>
                      </div>
                    )}
                  </div>

                  {queue.oldestItemAge && (
                    <div className="mt-2 text-xs text-gray-400">
                      Oldest: {queue.oldestItemAge}m ago
                    </div>
                  )}

                  <button
                    onClick={() => onSwitchChannel?.(config.type)}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Switch to {config.label}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}

              {!hasItems && (
                <p className="text-xs text-gray-400 mt-1">No items in queue</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {totalPriority > 0 && (
        <div className="px-4 pb-4">
          <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">
                {totalPriority} urgent items need attention across all channels
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Current Channel */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Current Channel</span>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-gray-900">{currentChannel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact badge version
export const ChannelQueueBadge: React.FC<{
  queues?: ChannelQueues | null;
}> = ({ queues }) => {
  if (!queues) return null;

  const totalPending =
    queues.email.count + queues.chat.count + queues.sms.count + queues.callback.count;
  const totalPriority =
    queues.email.priority + queues.chat.priority + queues.sms.priority + queues.callback.priority;

  if (totalPending === 0) return null;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
        totalPriority > 0 ? 'bg-red-100' : 'bg-gray-100'
      }`}
    >
      <Layers className={`w-3.5 h-3.5 ${totalPriority > 0 ? 'text-red-600' : 'text-gray-500'}`} />
      <span className={`text-xs font-medium ${totalPriority > 0 ? 'text-red-700' : 'text-gray-700'}`}>
        {totalPending}
      </span>
    </div>
  );
};
