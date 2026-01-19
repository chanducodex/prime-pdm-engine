// ============================================================================
// Outreach Queue Detail - Individual Queue Monitoring
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OutreachQueue, QueueHealth } from '@/lib/outreach-queue-types';
import { getMockQueueById, getMockQueueDashboard } from '@/lib/outreach-queue-mock-data';
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Phone,
  Mail,
  Bot,
  MessageSquare,
  MoreVertical,
  Download,
  RefreshCw,
  Eye,
  Edit,
} from 'lucide-react';

// ============================================================================
// Queue Header Component
// ============================================================================

interface QueueHeaderProps {
  queue: OutreachQueue;
  health?: QueueHealth;
  onAction: (action: string) => void;
}

const QueueHeader: React.FC<QueueHeaderProps> = ({ queue, health, onAction }) => {
  const getStatusBadge = () => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', color: 'text-green-700', label: 'Active' },
      PAUSED: { bg: 'bg-yellow-100', color: 'text-yellow-700', label: 'Paused' },
      COMPLETED: { bg: 'bg-gray-100', color: 'text-gray-700', label: 'Completed' },
      DRAFT: { bg: 'bg-blue-100', color: 'text-blue-700', label: 'Draft' },
    };
    const config = statusConfig[queue.status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getHealthIndicator = () => {
    if (!health) return null;
    const score = health.healthScore;
    const config = {
      bg: score >= 80 ? 'bg-green-100' : score >= 50 ? 'bg-yellow-100' : 'bg-red-100',
      color: score >= 80 ? 'text-green-700' : score >= 50 ? 'text-yellow-700' : 'text-red-700',
      label: score >= 80 ? 'Healthy' : score >= 50 ? 'At Risk' : 'Critical',
    };
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        <span className="text-lg font-bold text-gray-900">{score}%</span>
      </div>
    );
  };

  const progressPercent = queue.stats.totalTasks > 0
    ? Math.round((queue.stats.completedTasks / queue.stats.totalTasks) * 100)
    : 0;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">{queue.queueName}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-500">{queue.accountName} • {queue.cycleName}</p>
        </div>

        <div className="flex items-center gap-3">
          {getHealthIndicator()}
          <div className="h-8 w-px bg-gray-200" />
          <button
            onClick={() => onAction('export')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => onAction('settings')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          {queue.status === 'ACTIVE' ? (
            <button
              onClick={() => onAction('pause')}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          ) : queue.status === 'PAUSED' ? (
            <button
              onClick={() => onAction('resume')}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
            >
              <Play className="w-4 h-4" />
              Resume
            </button>
          ) : null}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">Campaign Progress</span>
          <span className="font-semibold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-500 to-violet-600 h-3 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>{queue.stats.completedTasks} of {queue.stats.totalTasks} tasks completed</span>
          <span>{queue.stats.totalTasks - queue.stats.completedTasks} remaining</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="text-center p-3 bg-violet-50 rounded-lg">
          <p className="text-2xl font-bold text-violet-900">{queue.stats.totalTasks}</p>
          <p className="text-xs text-violet-700">Total Tasks</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-700">{queue.stats.inProgressTasks}</p>
          <p className="text-xs text-blue-700">In Progress</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-700">{queue.stats.completedTasks}</p>
          <p className="text-xs text-green-700">Completed</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-700">{queue.slaTracking.breached}</p>
          <p className="text-xs text-red-700">SLA Breached</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-700">{queue.slaTracking.atRisk}</p>
          <p className="text-xs text-yellow-700">SLA At Risk</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Health Metrics Component
// ============================================================================

interface HealthMetricsProps {
  health?: QueueHealth;
  queue: OutreachQueue;
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ health, queue }) => {
  if (!health) return null;

  const metrics = [
    {
      label: 'SLA Breach Rate',
      value: `${health.indicators.slaBreachRate}%`,
      color: health.indicators.slaBreachRate > 10 ? 'text-red-600' : 'text-green-600',
      icon: AlertTriangle,
    },
    {
      label: 'Blockage Rate',
      value: `${health.indicators.blockageRate}%`,
      color: health.indicators.blockageRate > 20 ? 'text-red-600' : 'text-green-600',
      icon: AlertTriangle,
    },
    {
      label: 'Velocity',
      value: `${health.indicators.velocity} tasks/hr`,
      color: health.indicators.velocity > 10 ? 'text-green-600' : 'text-yellow-600',
      icon: TrendingUp,
    },
    {
      label: 'Agent Utilization',
      value: `${health.indicators.agentUtilization}%`,
      color: health.indicators.agentUtilization > 90 ? 'text-yellow-600' : 'text-green-600',
      icon: Users,
    },
    {
      label: 'Queue Age',
      value: `${health.indicators.queueAge}h avg`,
      color: health.indicators.queueAge > 48 ? 'text-yellow-600' : 'text-green-600',
      icon: Clock,
    },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'IMPROVING') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'DECLINING') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Health Metrics</h3>

      <div className="grid grid-cols-5 gap-4 mb-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-xs text-gray-500">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Trends */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Performance Trends</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            {getTrendIcon(health.trends.completionRate)}
            <span className="text-xs text-gray-600">Completion Rate</span>
            <span className="ml-auto text-xs font-medium text-gray-700 capitalize">
              {health.trends.completionRate.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            {getTrendIcon(health.trends.slaPerformance)}
            <span className="text-xs text-gray-600">SLA Performance</span>
            <span className="ml-auto text-xs font-medium text-gray-700 capitalize">
              {health.trends.slaPerformance.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            {getTrendIcon(health.trends.backlogTrend)}
            <span className="text-xs text-gray-600">Backlog</span>
            <span className="ml-auto text-xs font-medium text-gray-700 capitalize">
              {health.trends.backlogTrend.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Configuration Section
// ============================================================================

interface ConfigurationSectionProps {
  queue: OutreachQueue;
  onEdit?: () => void;
}

const ConfigurationSection: React.FC<ConfigurationSectionProps> = ({ queue, onEdit }) => {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'AI_CALL':
        return <Bot className="w-4 h-4" />;
      case 'HUMAN_CALL':
        return <Phone className="w-4 h-4" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4" />;
      case 'SELF_SERVICE':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Campaign Configuration</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-violet-600 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Primary Method</p>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-100 rounded">
              {getMethodIcon(queue.config.primaryMethod)}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {queue.config.primaryMethod.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Strategy Version</p>
          <p className="text-sm font-medium text-gray-900">{queue.config.strategyVersion}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Max Attempts</p>
          <p className="text-sm font-medium text-gray-900">{queue.config.maxAttempts}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Cooldown Period</p>
          <p className="text-sm font-medium text-gray-900">{queue.config.cooldownMinutes} minutes</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">SLA Duration</p>
          <p className="text-sm font-medium text-gray-900">{queue.config.slaHours} hours</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Assigned Agents</p>
          <p className="text-sm font-medium text-gray-900">{queue.assignedAgents} agents</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Priority Distribution Component
// ============================================================================

interface PriorityDistributionProps {
  queue: OutreachQueue;
}

const PriorityDistribution: React.FC<PriorityDistributionProps> = ({ queue }) => {
  const total = queue.stats.totalTasks;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Priority Distribution</h3>

      <div className="space-y-3">
        {/* P0 - Critical */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">P0 - Critical</span>
            <span className="text-gray-600">
              {queue.priorityDistribution.p0} ({total > 0 ? Math.round(queue.priorityDistribution.p0 / total * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{ width: `${total > 0 ? (queue.priorityDistribution.p0 / total * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* P1 - High */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">P1 - High</span>
            <span className="text-gray-600">
              {queue.priorityDistribution.p1} ({total > 0 ? Math.round(queue.priorityDistribution.p1 / total * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full"
              style={{ width: `${total > 0 ? (queue.priorityDistribution.p1 / total * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* P2 - Normal */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">P2 - Normal</span>
            <span className="text-gray-600">
              {queue.priorityDistribution.p2} ({total > 0 ? Math.round(queue.priorityDistribution.p2 / total * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${total > 0 ? (queue.priorityDistribution.p2 / total * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function QueueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queueId = params.queueId as string;

  const [queue, setQueue] = useState<OutreachQueue | null>(() => getMockQueueById(queueId) || null);
  const [health, setHealth] = useState<QueueHealth | undefined>(() => {
    const dashboard = getMockQueueDashboard();
    return dashboard.healthScores.find((h) => h.queueId === queueId);
  });

  if (!queue) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Queue not found</h2>
          <p className="text-gray-500 mb-4">The queue you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleAction = async (action: string) => {
    console.log('Action:', action);

    switch (action) {
      case 'pause':
        setQueue((prev) => prev ? { ...prev, status: 'PAUSED' } : null);
        console.log('Queue paused:', queueId);
        break;
      case 'resume':
        setQueue((prev) => prev ? { ...prev, status: 'ACTIVE' } : null);
        console.log('Queue resumed:', queueId);
        break;
      case 'export':
        // Export queue data with current state
        setQueue((currentQueue) => {
          if (!currentQueue) return currentQueue;

          const currentHealth = health;
          const exportData = {
            queue: currentQueue,
            health: currentHealth,
            timestamp: new Date().toISOString(),
          };
          console.log('Exporting queue data:', exportData);
          // Trigger download or API call
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `queue-${queueId}-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          return currentQueue;
        });
        break;
      case 'settings':
        // Navigate to edit mode or open settings
        router.push(`/outreach/queue-management?edit=${queueId}`);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleEditConfiguration = () => {
    router.push(`/outreach/queue-management?edit=${queueId}`);
  };

  const handleManageAgents = () => {
    console.log('Manage agents for queue:', queueId);
    // Open agent assignment modal or navigate to agent management
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Queue Management
        </button>
      </div>

      {/* Queue Header */}
      <QueueHeader queue={queue} health={health} onAction={handleAction} />

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Metrics */}
            <HealthMetrics health={health} queue={queue} />

            {/* Performance Chart Placeholder */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Performance Over Time</h3>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  <RefreshCw className="w-3 h-3" />
                  Last 24h
                </button>
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Performance chart visualization</p>
                  <p className="text-xs">Integration with chart library needed</p>
                </div>
              </div>
            </div>

            {/* Assigned Agents */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Assigned Agents</h3>
                <button
                  onClick={handleManageAgents}
                  className="text-xs text-violet-600 hover:underline"
                >
                  Manage assignments
                </button>
              </div>
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Agent list would appear here</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Configuration */}
            <ConfigurationSection queue={queue} onEdit={handleEditConfiguration} />

            {/* Priority Distribution */}
            <PriorityDistribution queue={queue} />

            {/* SLA Tracking */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">SLA Tracking</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">On Track</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">{queue.slaTracking.onTrack}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">At Risk</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-700">{queue.slaTracking.atRisk}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-700">Breached</span>
                  </div>
                  <span className="text-lg font-bold text-red-700">{queue.slaTracking.breached}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
