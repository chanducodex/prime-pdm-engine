// ============================================================================
// Queue Management - Filter Popup Component
// ============================================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, Filter } from 'lucide-react';
import { QueueFilters } from '@/lib/outreach-queue-types';

interface QueueFilterPopupProps {
  filters: QueueFilters;
  onUpdateFilter: <K extends keyof QueueFilters>(key: K, value: QueueFilters[K]) => void;
  onClearFilters: () => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

const QUEUE_TYPES: QueueFilters['queueType'][] = ['CAMPAIGN', 'TEAM', 'OVERFLOW', 'SPECIAL_PROJECT'];

const STATUSES: QueueFilters['status'][] = ['ACTIVE', 'PAUSED', 'COMPLETED', 'DRAFT'];

const ACCOUNTS = [
  { id: 'account-1', name: 'Acme Health' },
  { id: 'account-2', name: 'MedCare Plus' },
  { id: 'account-3', name: 'HealthFirst' },
  { id: 'account-4', name: 'Premier Medical' },
  { id: 'account-5', name: 'United Health' },
];

const CYCLES = [
  { id: 'cycle-1', name: 'Q1 2025' },
  { id: 'cycle-2', name: 'Q4 2024' },
  { id: 'cycle-3', name: 'Q3 2024' },
  { id: 'cycle-4', name: 'Q2 2024' },
  { id: 'cycle-5', name: 'Special Enrollment 2024' },
];

const AGENT_STATUSES: QueueFilters['agentStatus'][] = ['ONLINE', 'ON_CALL', 'AWAY', 'OFFLINE', 'ON_BREAK'];

const HEALTH_SCORES: QueueFilters['healthScore'][] = ['HEALTHY', 'AT_RISK', 'CRITICAL'];

const ALERT_SEVERITIES: QueueFilters['alertSeverity'][] = ['CRITICAL', 'WARNING', 'INFO'];

export const QueueFilterPopup: React.FC<QueueFilterPopupProps> = ({
  filters,
  onUpdateFilter,
  onClearFilters,
  onClose,
  position,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSelectChange = (key: keyof QueueFilters, value: string) => {
    onUpdateFilter(key, value || undefined);
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof QueueFilters] !== undefined
  ).length;

  const popupStyle = position
    ? {
        top: `${position.top}px`,
        left: `${position.left}px`,
      }
    : {};

  return (
    <div
      ref={popupRef}
      className="absolute z-50 w-[480px] bg-white border border-gray-200 rounded-xl shadow-xl"
      style={popupStyle}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-100 rounded-lg">
            <Filter className="w-4 h-4 text-violet-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Queue Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-violet-700 bg-violet-100 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          )}
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {/* Queue Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Queue Type
            </label>
            <select
              value={filters.queueType || ''}
              onChange={(e) => onUpdateFilter('queueType', (e.target.value || undefined) as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Types</option>
              {QUEUE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => onUpdateFilter('status', (e.target.value || undefined) as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Account
            </label>
            <select
              value={filters.accountId || ''}
              onChange={(e) => handleSelectChange('accountId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Accounts</option>
              {ACCOUNTS.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cycle */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Cycle
            </label>
            <select
              value={filters.cycleId || ''}
              onChange={(e) => handleSelectChange('cycleId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Cycles</option>
              {CYCLES.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </option>
              ))}
            </select>
          </div>

          {/* Agent Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Agent Status
            </label>
            <select
              value={filters.agentStatus || ''}
              onChange={(e) => onUpdateFilter('agentStatus', (e.target.value || undefined) as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Statuses</option>
              {AGENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Health Score */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Health Score
            </label>
            <select
              value={filters.healthScore || ''}
              onChange={(e) => onUpdateFilter('healthScore', (e.target.value || undefined) as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Scores</option>
              {HEALTH_SCORES.map((score) => (
                <option key={score} value={score}>
                  {score.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Alert Severity */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Alert Severity
            </label>
            <select
              value={filters.alertSeverity || ''}
              onChange={(e) => onUpdateFilter('alertSeverity', (e.target.value || undefined) as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Severities</option>
              {ALERT_SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {severity.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Active Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {filters.queueType && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded">
                  Type: {filters.queueType}
                  <button
                    onClick={() => onUpdateFilter('queueType', undefined)}
                    className="hover:text-violet-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded">
                  Status: {filters.status}
                  <button
                    onClick={() => onUpdateFilter('status', undefined)}
                    className="hover:text-violet-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.accountId && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded">
                  Account
                  <button
                    onClick={() => onUpdateFilter('accountId', undefined)}
                    className="hover:text-violet-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.cycleId && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded">
                  Cycle
                  <button
                    onClick={() => onUpdateFilter('cycleId', undefined)}
                    className="hover:text-violet-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.agentStatus && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded">
                  Agent: {filters.agentStatus}
                  <button
                    onClick={() => onUpdateFilter('agentStatus', undefined)}
                    className="hover:text-violet-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.healthScore && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded">
                  Health: {filters.healthScore}
                  <button
                    onClick={() => onUpdateFilter('healthScore', undefined)}
                    className="hover:text-violet-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.alertSeverity && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded">
                  Alert: {filters.alertSeverity}
                  <button
                    onClick={() => onUpdateFilter('alertSeverity', undefined)}
                    className="hover:text-violet-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
