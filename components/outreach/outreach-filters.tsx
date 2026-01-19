// ============================================================================
// Outreach Management - Filters Panel Component
// ============================================================================

'use client';

import React from 'react';
import {
  OutreachFilters,
  OutreachMethod,
  TaskStatus,
  PriorityTier,
  BlockReason,
} from '@/lib/outreach-types';

interface OutreachFiltersProps {
  filters: OutreachFilters;
  onUpdateFilter: <K extends keyof OutreachFilters>(key: K, value: OutreachFilters[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

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

const QUEUES = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Overflow Queue', 'Research Queue'];

const METHODS: OutreachMethod[] = ['WEB', 'AI_CALL', 'HUMAN_CALL', 'EMAIL', 'SELF_SERVICE'];

const STATUSES: TaskStatus[] = [
  'NEW',
  'PLANNED',
  'READY',
  'IN_PROGRESS',
  'WAITING_COOLDOWN',
  'WAITING_TIME_WINDOW',
  'BLOCKED',
  'ESCALATED',
  'NEEDS_RESEARCH',
  'VERIFIED',
  'CLOSED_PARTIAL',
  'FAILED',
];

const PRIORITIES: PriorityTier[] = ['P0', 'P1', 'P2'];

const STATES = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

const BLOCK_REASONS: BlockReason[] = [
  'MISSING_PHONE',
  'MISSING_EMAIL',
  'DNC_GLOBAL',
  'DNC_ACCOUNT',
  'COOLDOWN_ACTIVE',
  'OUTSIDE_TIME_WINDOW',
  'NO_ELIGIBLE_METHODS',
  'WAITING_PROVIDER_CALLBACK',
  'NEEDS_RESEARCH',
  'CONFIG_MISSING',
];

const SLA_DUE_OPTIONS = [
  { value: 'next_4h', label: 'Next 4 hours' },
  { value: 'next_24h', label: 'Next 24 hours' },
  { value: 'overdue', label: 'Overdue' },
];

const LAST_UPDATED_OPTIONS = [
  { value: 'stale_24h', label: '> 24 hours' },
  { value: 'stale_48h', label: '> 48 hours' },
  { value: 'stale_72h', label: '> 72 hours' },
];

export const OutreachFiltersPanel: React.FC<OutreachFiltersProps> = ({
  filters,
  onUpdateFilter,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Account
          </label>
          <select
            value={filters.accountId || ''}
            onChange={(e) => onUpdateFilter('accountId', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Accounts</option>
            {ACCOUNTS.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cycle Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cycle
          </label>
          <select
            value={filters.cycleId || ''}
            onChange={(e) => onUpdateFilter('cycleId', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Cycles</option>
            {CYCLES.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </select>
        </div>

        {/* Queue Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Queue
          </label>
          <select
            value={filters.queueId || ''}
            onChange={(e) => onUpdateFilter('queueId', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Queues</option>
            {QUEUES.map((queue) => (
              <option key={queue} value={queue}>
                {queue}
              </option>
            ))}
          </select>
        </div>

        {/* Method Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Method
          </label>
          <select
            value={filters.method || ''}
            onChange={(e) => onUpdateFilter('method', (e.target.value || undefined) as OutreachMethod)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Methods</option>
            {METHODS.map((method) => (
              <option key={method} value={method}>
                {method.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onUpdateFilter('status', (e.target.value || undefined) as TaskStatus)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ').toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={filters.priorityTier || ''}
            onChange={(e) => onUpdateFilter('priorityTier', (e.target.value || undefined) as PriorityTier)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        {/* Provider State Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Provider State
          </label>
          <select
            value={filters.providerState || ''}
            onChange={(e) => onUpdateFilter('providerState', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All States</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* SLA Due Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            SLA Due
          </label>
          <select
            value={filters.slaDue || ''}
            onChange={(e) => onUpdateFilter('slaDue', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Time</option>
            {SLA_DUE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Last Updated Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Updated
          </label>
          <select
            value={filters.lastUpdated || ''}
            onChange={(e) => onUpdateFilter('lastUpdated', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Time</option>
            {LAST_UPDATED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Block Reason Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Block Reason
          </label>
          <select
            value={filters.blockReason || ''}
            onChange={(e) => onUpdateFilter('blockReason', (e.target.value || undefined) as BlockReason)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">None</option>
            {BLOCK_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason.replace(/_/g, ' ').toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Attempt Count Threshold Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Attempts
          </label>
          <input
            type="number"
            min="0"
            value={filters.attemptCountThreshold || ''}
            onChange={(e) =>
              onUpdateFilter(
                'attemptCountThreshold',
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )
            }
            placeholder="e.g., 3"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};
