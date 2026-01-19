// ============================================================================
// Queue Management - Queue Card Component
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OutreachQueue, QueueHealth } from '@/lib/outreach-queue-types';
import {
  Users,
  Target,
  Pause,
  Play,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
} from 'lucide-react';

interface QueueCardProps {
  queue: OutreachQueue;
  health?: QueueHealth;
  onClick: () => void;
  onEdit?: (queue: OutreachQueue) => void;
  onPause?: (queueId: string) => void;
  onResume?: (queueId: string) => void;
  onDelete?: (queueId: string) => void;
  onDuplicate?: (queueId: string) => void;
  onToggleSelect?: (queue: OutreachQueue) => void;
  isSelected?: boolean;
  showHealthScore?: boolean;
  showSLAIndicator?: boolean;
  showAgentCount?: boolean;
  size?: 'compact' | 'standard' | 'detailed';
}

export const QueueCard: React.FC<QueueCardProps> = ({
  queue,
  health,
  onClick,
  onEdit,
  onPause,
  onResume,
  onDelete,
  onDuplicate,
  onToggleSelect,
  isSelected = false,
  showHealthScore = true,
  showSLAIndicator = true,
  showAgentCount = true,
  size = 'standard',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const getStatusBadge = () => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', color: 'text-green-700', label: 'Active' },
      PAUSED: { bg: 'bg-yellow-100', color: 'text-yellow-700', label: 'Paused' },
      COMPLETED: { bg: 'bg-gray-100', color: 'text-gray-700', label: 'Completed' },
      DRAFT: { bg: 'bg-blue-100', color: 'text-blue-700', label: 'Draft' },
    };
    const config = statusConfig[queue.status];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getHealthBadge = () => {
    if (!health || !showHealthScore) return null;
    const score = health.healthScore;
    let config: { bg: string; color: string; label: string };

    if (score >= 80) {
      config = { bg: 'bg-green-100', color: 'text-green-700', label: 'Healthy' };
    } else if (score >= 50) {
      config = { bg: 'bg-yellow-100', color: 'text-yellow-700', label: 'At Risk' };
    } else {
      config = { bg: 'bg-red-100', color: 'text-red-700', label: 'Critical' };
    }

    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        <span className="text-sm font-semibold text-gray-700">{score}%</span>
      </div>
    );
  };

  const progressPercent = queue.stats.totalTasks > 0
    ? Math.round((queue.stats.completedTasks / queue.stats.totalTasks) * 100)
    : 0;

  const sizeClasses = size === 'compact' ? 'p-3' : size === 'detailed' ? 'p-5' : 'p-4';
  const statsGridCols = size === 'compact' ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-2';

  return (
    <div
      onClick={onClick}
      className={`bg-white border ${isSelected ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200'} rounded-lg ${sizeClasses} hover:shadow-md hover:border-violet-200 transition-all cursor-pointer relative`}
    >
      {/* Selection Checkbox */}
      {onToggleSelect && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(queue);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
          />
        </div>
      )}

      {/* Header */}
      <div className={`flex items-start justify-between mb-3 ${onToggleSelect ? 'ml-8' : ''}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{queue.queueName}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-gray-500 truncate">{queue.accountName} • {queue.cycleName}</p>
        </div>
        {getHealthBadge()}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span className="font-medium">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-500 to-violet-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${statsGridCols} mb-3`}>
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-lg font-bold text-gray-900">{queue.stats.totalTasks}</p>
          <p className="text-xs text-gray-500">Total Records</p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded">
          <p className="text-lg font-bold text-blue-700">{queue.stats.inProgressTasks}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <p className="text-lg font-bold text-green-700">{queue.stats.completedTasks}</p>
          <p className="text-xs text-gray-500">Done</p>
        </div>
        {showSLAIndicator && (
          <div className="text-center p-2 bg-red-50 rounded">
            <p className="text-lg font-bold text-red-700">{queue.slaTracking.breached}</p>
            <p className="text-xs text-gray-500">SLA Miss</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {showAgentCount && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{queue.assignedAgents} agents</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            <span>{queue.stats.contactRate}% contact</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause/Resume Button */}
          {queue.status === 'ACTIVE' && onPause && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPause(queue.queueId);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          )}

          {queue.status === 'PAUSED' && onResume && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResume(queue.queueId);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Resume
            </button>
          )}

          {/* Action Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
              title="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 min-w-[160px]">
                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (onEdit) onEdit(queue);
                    else onClick();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                  Edit Campaign
                </button>

                {/* Duplicate */}
                {onDuplicate && queue.status !== 'DRAFT' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDuplicate(queue.queueId);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                    Duplicate
                  </button>
                )}

                {/* Delete */}
                {onDelete && (
                  <>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete(queue.queueId);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
