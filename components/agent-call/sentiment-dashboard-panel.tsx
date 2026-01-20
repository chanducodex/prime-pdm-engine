// ============================================================================
// Sentiment Dashboard Panel
// Customer sentiment tracking and analysis during calls
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, TrendingUp, TrendingDown, Minus, AlertCircle, Smile, Frown, Meh, ChevronDown, ChevronUp } from 'lucide-react';

export type SentimentTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';

export interface SentimentTimelinePoint {
  timestamp: number; // seconds from call start
  score: number; // -1 to 1
  speaker: 'AGENT' | 'PROVIDER';
}

export interface SentimentTrigger {
  text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE';
  timestamp: number;
}

export interface SentimentData {
  overallScore: number; // -1 to 1
  trend: SentimentTrend;
  timeline: SentimentTimelinePoint[];
  triggers: SentimentTrigger[];
}

interface SentimentDashboardPanelProps {
  sentimentData?: SentimentData | null;
  isCallActive?: boolean;
  className?: string;
}

// Generate mock sentiment data
const generateMockSentimentData = (callDuration: number): SentimentData => {
  const timeline: SentimentTimelinePoint[] = [];
  const triggers: SentimentTrigger[] = [];

  // Generate timeline points every 15 seconds
  for (let t = 0; t <= callDuration; t += 15) {
    const baseScore = 0.3 + (t / callDuration) * 0.4; // Gradually improving
    const variance = (Math.random() - 0.5) * 0.3;
    timeline.push({
      timestamp: t,
      score: Math.max(-1, Math.min(1, baseScore + variance)),
      speaker: Math.random() > 0.5 ? 'PROVIDER' : 'AGENT',
    });
  }

  // Add some triggers
  if (callDuration > 30) {
    triggers.push({
      text: 'frustrated with the wait time',
      sentiment: 'NEGATIVE',
      timestamp: 15,
    });
  }
  if (callDuration > 90) {
    triggers.push({
      text: 'thank you for your help',
      sentiment: 'POSITIVE',
      timestamp: Math.floor(callDuration * 0.8),
    });
  }

  const avgScore = timeline.length > 0
    ? timeline.reduce((sum, p) => sum + p.score, 0) / timeline.length
    : 0;

  const recentScores = timeline.slice(-5);
  const earlyScores = timeline.slice(0, 5);
  const recentAvg = recentScores.length > 0
    ? recentScores.reduce((sum, p) => sum + p.score, 0) / recentScores.length
    : 0;
  const earlyAvg = earlyScores.length > 0
    ? earlyScores.reduce((sum, p) => sum + p.score, 0) / earlyScores.length
    : 0;

  let trend: SentimentTrend = 'STABLE';
  if (recentAvg - earlyAvg > 0.15) trend = 'IMPROVING';
  else if (earlyAvg - recentAvg > 0.15) trend = 'DECLINING';

  return {
    overallScore: avgScore,
    trend,
    timeline,
    triggers,
  };
};

const trendConfig: Record<SentimentTrend, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  IMPROVING: { icon: TrendingUp, color: 'text-green-600', label: 'Improving' },
  STABLE: { icon: Minus, color: 'text-gray-500', label: 'Stable' },
  DECLINING: { icon: TrendingDown, color: 'text-red-600', label: 'Declining' },
};

export const SentimentDashboardPanel: React.FC<SentimentDashboardPanelProps> = ({
  sentimentData: propData,
  isCallActive = false,
  className = '',
}) => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(propData || null);
  const [callDuration, setCallDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Simulate real-time sentiment updates when call is active
  useEffect(() => {
    if (!isCallActive) {
      setSentimentData(null);
      setCallDuration(0);
      return;
    }

    // Update call duration every second
    const durationInterval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Update sentiment data every 5 seconds
    const sentimentInterval = setInterval(() => {
      setCallDuration((current) => {
        setSentimentData(generateMockSentimentData(current));
        return current;
      });
    }, 5000);

    // Initial data
    setTimeout(() => {
      setSentimentData(generateMockSentimentData(5));
    }, 2000);

    return () => {
      clearInterval(durationInterval);
      clearInterval(sentimentInterval);
    };
  }, [isCallActive]);

  if (!isCallActive) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <Heart className="w-4 h-4" />
          <span className="text-sm">Sentiment analysis requires active call</span>
        </div>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Analyzing sentiment...</span>
        </div>
      </div>
    );
  }

  const TrendIcon = trendConfig[sentimentData.trend].icon;
  const sentimentLabel = sentimentData.overallScore > 0.3
    ? 'Positive'
    : sentimentData.overallScore < -0.3
    ? 'Negative'
    : 'Neutral';
  const SentimentIcon = sentimentData.overallScore > 0.3
    ? Smile
    : sentimentData.overallScore < -0.3
    ? Frown
    : Meh;
  const sentimentColor = sentimentData.overallScore > 0.3
    ? 'text-green-600'
    : sentimentData.overallScore < -0.3
    ? 'text-red-600'
    : 'text-gray-500';

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <h3 className="text-sm font-semibold text-gray-900">Sentiment Analysis</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <TrendIcon className={`w-4 h-4 ${trendConfig[sentimentData.trend].color}`} />
              <span className={`text-xs font-medium ${trendConfig[sentimentData.trend].color}`}>
                {trendConfig[sentimentData.trend].label}
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
      <div className="p-4">
        {/* Overall Sentiment Gauge */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              sentimentData.overallScore > 0.3
                ? 'bg-green-100'
                : sentimentData.overallScore < -0.3
                ? 'bg-red-100'
                : 'bg-gray-100'
            }`}>
              <SentimentIcon className={`w-6 h-6 ${sentimentColor}`} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{sentimentLabel}</span>
              <span className="text-sm font-semibold text-gray-900">
                {((sentimentData.overallScore + 1) * 50).toFixed(0)}%
              </span>
            </div>
            {/* Sentiment bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 flex">
                <div className="w-1/3 bg-gradient-to-r from-red-400 to-amber-400" />
                <div className="w-1/3 bg-gradient-to-r from-amber-400 to-green-400" />
                <div className="w-1/3 bg-green-400" />
              </div>
              {/* Indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-gray-900 rounded-full transition-all duration-500"
                style={{ left: `${((sentimentData.overallScore + 1) / 2) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">Negative</span>
              <span className="text-xs text-gray-400">Positive</span>
            </div>
          </div>
        </div>

        {/* Mini Timeline */}
        {sentimentData.timeline.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Sentiment Over Time</h4>
            <div className="h-12 bg-gray-50 rounded-lg relative overflow-hidden">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path
                  d={`
                    M 0 ${48 - ((sentimentData.timeline[0]?.score + 1) / 2) * 48}
                    ${sentimentData.timeline.map((point, i) => {
                      const x = (i / (sentimentData.timeline.length - 1)) * 100;
                      const y = 48 - ((point.score + 1) / 2) * 48;
                      return `L ${x}% ${y}`;
                    }).join(' ')}
                    L 100% 48 L 0 48 Z
                  `}
                  fill="url(#sentimentGradient)"
                />
                {/* Line */}
                <path
                  d={`
                    M 0 ${48 - ((sentimentData.timeline[0]?.score + 1) / 2) * 48}
                    ${sentimentData.timeline.map((point, i) => {
                      const x = (i / (sentimentData.timeline.length - 1)) * 100;
                      const y = 48 - ((point.score + 1) / 2) * 48;
                      return `L ${x}% ${y}`;
                    }).join(' ')}
                  `}
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Emotional Triggers */}
        {sentimentData.triggers.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Key Moments</h4>
            <div className="space-y-2">
              {sentimentData.triggers.map((trigger, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 px-3 py-2 rounded-lg ${
                    trigger.sentiment === 'POSITIVE' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <AlertCircle
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      trigger.sentiment === 'POSITIVE' ? 'text-green-600' : 'text-red-600'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs ${
                        trigger.sentiment === 'POSITIVE' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      "{trigger.text}"
                    </p>
                    <span className="text-xs text-gray-400">
                      at {Math.floor(trigger.timestamp / 60)}:{(trigger.timestamp % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
