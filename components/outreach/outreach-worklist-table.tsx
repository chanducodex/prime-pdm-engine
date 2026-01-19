// ============================================================================
// Outreach Management - Worklist Table Component
// ============================================================================

'use client';

import React, { useState } from 'react';
import { OutreachTask, TaskStatus, OutreachMethod } from '@/lib/outreach-types';
import { OutreachRowActions } from './outreach-row-actions';

interface OutreachWorklistTableProps {
  tasks: OutreachTask[];
  isLoading: boolean;
  selectedTaskIds: string[];
  onSelectTask: (taskId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onSort: (column: keyof OutreachTask) => void;
  sortColumn?: keyof OutreachTask;
  sortDirection: 'asc' | 'desc';
  onRowClick: (task: OutreachTask) => void;
  userRole: string;
  onRowAction?: (action: string, task: OutreachTask) => void;
}

const getStatusBadge = (status: TaskStatus): React.ReactNode => {
  const statusConfig: Record<
    TaskStatus,
    { color: string; bgColor: string; label: string }
  > = {
    NEW: { color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-100 dark:bg-gray-700', label: 'New' },
    PLANNED: {
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Planned',
    },
    READY: {
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Ready',
    },
    IN_PROGRESS: {
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'In Progress',
    },
    WAITING_COOLDOWN: {
      color: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Cooldown',
    },
    WAITING_TIME_WINDOW: {
      color: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      label: 'Time Window',
    },
    BLOCKED: {
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Blocked',
    },
    ESCALATED: {
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      label: 'Escalated',
    },
    NEEDS_RESEARCH: {
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      label: 'Research',
    },
    VERIFIED: {
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Verified',
    },
    CLOSED_PARTIAL: {
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      label: 'Partial',
    },
    FAILED: {
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Failed',
    },
  };

  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}
    >
      {config.label}
    </span>
  );
};

const getPriorityBadge = (priority: string): React.ReactNode => {
  if (priority === 'P0') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
        P0
      </span>
    );
  } else if (priority === 'P1') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
        P1
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
      P2
    </span>
  );
};

const getMethodBadge = (method: OutreachMethod): React.ReactNode => {
  const methodConfig: Record<
    OutreachMethod,
    { color: string; bgColor: string; label: string }
  > = {
    WEB: { color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-100 dark:bg-gray-700', label: 'Web' },
    AI_CALL: {
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      label: 'AI Call',
    },
    HUMAN_CALL: {
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Human Call',
    },
    EMAIL: {
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Email',
    },
    SELF_SERVICE: {
      color: 'text-cyan-700 dark:text-cyan-300',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      label: 'Self-Service',
    },
  };

  const config = methodConfig[method];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color} ${config.bgColor}`}
    >
      {config.label}
    </span>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const isSLABreached = (slaDueAt: string): boolean => {
  return new Date(slaDueAt) < new Date();
};

const isSLAAtRisk = (slaDueAt: string): boolean => {
  const slaDue = new Date(slaDueAt);
  const now = new Date();
  const hoursUntilDue = (slaDue.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilDue > 0 && hoursUntilDue <= 24;
};

export const OutreachWorklistTable: React.FC<OutreachWorklistTableProps> = ({
  tasks,
  isLoading,
  selectedTaskIds,
  onSelectTask,
  onSelectAll,
  onSort,
  sortColumn,
  sortDirection,
  onRowClick,
  userRole,
  onRowAction,
}) => {
  const allSelected = tasks.length > 0 && selectedTaskIds.length === tasks.length;
  const someSelected = selectedTaskIds.length > 0 && !allSelected;

  const handleSort = (column: keyof OutreachTask) => {
    if (sortColumn === column) {
      onSort(column);
    } else {
      onSort(column);
    }
  };

  const SortIcon: React.FC<{ column: keyof OutreachTask }> = ({ column }) => {
    if (sortColumn !== column) {
      return <span className="text-gray-400">⇅</span>;
    }
    return <span className="text-blue-500">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('providerIdentifier')}
              >
                <div className="flex items-center gap-1">
                  Provider
                  <SortIcon column="providerIdentifier" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('accountName')}
              >
                <div className="flex items-center gap-1">
                  Account
                  <SortIcon column="accountName" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('priorityTier')}
              >
                <div className="flex items-center gap-1">
                  Priority
                  <SortIcon column="priorityTier" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => handleSort('slaDueAt')}
              >
                <div className="flex items-center gap-1">
                  SLA Due
                  <SortIcon column="slaDueAt" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Assigned
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => {
              const isSelected = selectedTaskIds.includes(task.taskId);
              const slaBreached = isSLABreached(task.slaDueAt);
              const slaAtRisk = isSLAAtRisk(task.slaDueAt);

              return (
                <tr
                  key={task.taskId}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => onRowClick(task)}
                >
                  <td
                    className="px-4 py-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTask(task.taskId);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectTask(task.taskId)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.providerIdentifier}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{task.cycleName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-white">{task.accountName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{task.providerState}</div>
                  </td>
                  <td className="px-4 py-3">{getMethodBadge(task.currentMethod)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task.status)}
                      {task.blockReason && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          title={task.blockReason.replace(/_/g, ' ')}
                        >
                          {task.blockReason.slice(0, 3).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{getPriorityBadge(task.priorityTier)}</td>
                  <td className="px-4 py-3">
                    <div
                      className={`text-sm font-medium ${
                        slaBreached
                          ? 'text-red-600 dark:text-red-400'
                          : slaAtRisk
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {new Date(task.slaDueAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {task.attemptSummary.totalAttempts}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      AI: {task.attemptSummary.aiAttempts} / H: {task.attemptSummary.humanAttempts}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {task.assignedAgent || task.assignedQueue || 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(task.lastUpdatedAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <OutreachRowActions task={task} userRole={userRole} onAction={onRowAction} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
