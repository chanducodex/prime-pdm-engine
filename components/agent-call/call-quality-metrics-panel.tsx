// ============================================================================
// Call Quality Metrics Panel
// Real-time call quality indicators for monitoring call health
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Signal, Wifi, WifiOff, Activity, AlertTriangle, Check } from 'lucide-react';

export type ConnectionStability = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface CallQualityMetrics {
  audioQualityScore: number; // 0-100
  networkLatency: number; // milliseconds
  packetLoss: number; // percentage
  jitter: number; // milliseconds
  connectionStability: ConnectionStability;
  timestamp: string;
}

interface CallQualityMetricsPanelProps {
  metrics?: CallQualityMetrics | null;
  isCallActive?: boolean;
  compact?: boolean;
  className?: string;
}

// Mock data generator for demo
const generateMockMetrics = (): CallQualityMetrics => ({
  audioQualityScore: Math.floor(Math.random() * 20) + 80, // 80-100
  networkLatency: Math.floor(Math.random() * 50) + 20, // 20-70ms
  packetLoss: Math.random() * 2, // 0-2%
  jitter: Math.floor(Math.random() * 15) + 5, // 5-20ms
  connectionStability: ['EXCELLENT', 'GOOD', 'GOOD', 'EXCELLENT'][
    Math.floor(Math.random() * 4)
  ] as ConnectionStability,
  timestamp: new Date().toISOString(),
});

const stabilityConfig: Record<
  ConnectionStability,
  { color: string; bgColor: string; label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  EXCELLENT: { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Excellent', icon: Check },
  GOOD: { color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Good', icon: Signal },
  FAIR: { color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Fair', icon: Activity },
  POOR: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Poor', icon: AlertTriangle },
};

export const CallQualityMetricsPanel: React.FC<CallQualityMetricsPanelProps> = ({
  metrics: propMetrics,
  isCallActive = false,
  compact = false,
  className = '',
}) => {
  const [metrics, setMetrics] = useState<CallQualityMetrics | null>(propMetrics || null);

  // Simulate real-time metrics updates when call is active
  useEffect(() => {
    if (!isCallActive) {
      setMetrics(null);
      return;
    }

    // Initial metrics
    setMetrics(generateMockMetrics());

    // Update metrics every 3 seconds
    const interval = setInterval(() => {
      setMetrics(generateMockMetrics());
    }, 3000);

    return () => clearInterval(interval);
  }, [isCallActive]);

  if (!isCallActive || !metrics) {
    if (compact) return null;
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">No active call</span>
        </div>
      </div>
    );
  }

  const stability = stabilityConfig[metrics.connectionStability];
  const StabilityIcon = stability.icon;

  // Compact version for header
  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${stability.bgColor}`}>
          <StabilityIcon className={`w-3.5 h-3.5 ${stability.color}`} />
          <span className={`text-xs font-medium ${stability.color}`}>{stability.label}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{metrics.networkLatency}ms</span>
          <span className="w-px h-3 bg-gray-300" />
          <span>{metrics.packetLoss.toFixed(1)}% loss</span>
        </div>
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
            <Signal className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Call Quality</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${stability.bgColor}`}>
            <StabilityIcon className={`w-3.5 h-3.5 ${stability.color}`} />
            <span className={`text-xs font-medium ${stability.color}`}>{stability.label}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Audio Quality */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Audio Quality</span>
              <span className="text-sm font-semibold text-gray-900">{metrics.audioQualityScore}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  metrics.audioQualityScore >= 90
                    ? 'bg-green-500'
                    : metrics.audioQualityScore >= 70
                    ? 'bg-emerald-500'
                    : metrics.audioQualityScore >= 50
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${metrics.audioQualityScore}%` }}
              />
            </div>
          </div>

          {/* Network Latency */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Latency</span>
              <span className="text-sm font-semibold text-gray-900">{metrics.networkLatency}ms</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  metrics.networkLatency <= 30
                    ? 'bg-green-500'
                    : metrics.networkLatency <= 60
                    ? 'bg-emerald-500'
                    : metrics.networkLatency <= 100
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (metrics.networkLatency / 150) * 100)}%` }}
              />
            </div>
          </div>

          {/* Packet Loss */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Packet Loss</span>
              <span className="text-sm font-semibold text-gray-900">{metrics.packetLoss.toFixed(2)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  metrics.packetLoss <= 0.5
                    ? 'bg-green-500'
                    : metrics.packetLoss <= 1
                    ? 'bg-emerald-500'
                    : metrics.packetLoss <= 2
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, metrics.packetLoss * 20)}%` }}
              />
            </div>
          </div>

          {/* Jitter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Jitter</span>
              <span className="text-sm font-semibold text-gray-900">{metrics.jitter}ms</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  metrics.jitter <= 10
                    ? 'bg-green-500'
                    : metrics.jitter <= 20
                    ? 'bg-emerald-500'
                    : metrics.jitter <= 30
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (metrics.jitter / 50) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Warning if quality is degraded */}
        {(metrics.connectionStability === 'FAIR' || metrics.connectionStability === 'POOR') && (
          <div className="mt-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-700">
                {metrics.connectionStability === 'POOR'
                  ? 'Call quality is degraded. Consider moving to a better network location.'
                  : 'Slight network issues detected. Call quality may vary.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact badge version for header display
export const CallQualityBadge: React.FC<{
  metrics?: CallQualityMetrics | null;
  isCallActive?: boolean;
}> = ({ metrics, isCallActive = false }) => {
  if (!isCallActive || !metrics) return null;

  const stability = stabilityConfig[metrics.connectionStability];
  const StabilityIcon = stability.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${stability.bgColor}`}>
      <StabilityIcon className={`w-3.5 h-3.5 ${stability.color}`} />
      <span className={`text-xs font-medium ${stability.color}`}>{metrics.audioQualityScore}%</span>
    </div>
  );
};
