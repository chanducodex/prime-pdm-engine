// ============================================================================
// Queue Management - Agent Card Component
// ============================================================================

'use client';

import React from 'react';
import { AgentStatus } from '@/lib/outreach-queue-types';

interface AgentCardProps {
  agent: AgentStatus;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const getStatusColor = () => {
    const colors = {
      ONLINE: 'bg-green-100 text-green-700 border-green-200',
      ON_CALL: 'bg-blue-100 text-blue-700 border-blue-200',
      AWAY: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      OFFLINE: 'bg-gray-100 text-gray-700 border-gray-200',
      ON_BREAK: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[agent.status];
  };

  const getStatusLabel = () => {
    const labels = {
      ONLINE: 'Online',
      ON_CALL: 'On Call',
      AWAY: 'Away',
      OFFLINE: 'Offline',
      ON_BREAK: 'On Break',
    };
    return labels[agent.status];
  };

  const getAvailabilityBadge = () => {
    const config = {
      HIGH: { bg: 'bg-green-100', color: 'text-green-700', label: 'High' },
      MEDIUM: { bg: 'bg-yellow-100', color: 'text-yellow-700', label: 'Medium' },
      LOW: { bg: 'bg-orange-100', color: 'text-orange-700', label: 'Low' },
      NONE: { bg: 'bg-red-100', color: 'text-red-700', label: 'Full' },
    };
    const c = config[agent.capacity.availability];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.color}`}>
        {c.label}
      </span>
    );
  };

  // Calculate session time
  const getSessionTime = () => {
    if (!agent.session?.loginTime) return '--';
    const minutes = Math.floor((Date.now() - new Date(agent.session.loginTime).getTime()) / (1000 * 60));
    return `${minutes}m`;
  };

  // Calculate on-call duration
  const getOnCallTime = () => {
    if (!agent.session?.onCallDuration) return '--';
    const minutes = Math.floor(agent.session.onCallDuration / 60);
    const seconds = agent.session.onCallDuration % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all h-[220px] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{agent.agentName}</h4>
          <p className="text-xs text-gray-500 truncate">{agent.currentQueue || 'Unassigned'}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border shrink-0 ${getStatusColor()}`}>
          {getStatusLabel()}
        </span>
      </div>

      {/* Session Info - Always render with fixed height */}
      <div className="mb-2 p-2 bg-gray-50 rounded flex-1 flex flex-col justify-center min-h-[60px]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Session time:</span>
          <span className="text-gray-700 font-medium">{getSessionTime()}</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-500">On call:</span>
          <span className="text-blue-700 font-medium">{getOnCallTime()}</span>
        </div>
      </div>

      {/* Stats - Always render */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">{agent.stats.tasksCompleted}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-blue-700">{agent.stats.tasksInProgress}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-green-700">{agent.stats.contactRate}%</p>
          <p className="text-xs text-gray-500">Contact</p>
        </div>
      </div>

      {/* Capacity - Always render */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Capacity:</span>
          {getAvailabilityBadge()}
        </div>
        <span className="text-xs text-gray-500">
          {agent.capacity.currentTasks}/{agent.capacity.maxConcurrentTasks} tasks
        </span>
      </div>
    </div>
  );
};
