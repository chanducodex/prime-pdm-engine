// ============================================================================
// Outreach Management - Filter Popup Component
// ============================================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import { OutreachFilters, OutreachMethod, TaskStatus, PriorityTier, BlockReason } from '@/lib/outreach-types';
import { X, RotateCcw, ChevronDown } from 'lucide-react';

interface OutreachFilterPopupProps {
  filters: OutreachFilters;
  onUpdateFilter: <K extends keyof OutreachFilters>(key: K, value: OutreachFilters[K]) => void;
  onClearFilters: () => void;
  onClose: () => void;
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

const AGENTS = ['Agent Smith', 'Agent Johnson', 'Agent Williams', 'Agent Brown', 'Agent Davis'];

export function OutreachFilterPopup({
  filters,
  onUpdateFilter,
  onClearFilters,
  onClose,
}: OutreachFilterPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (Object.values(openDropdowns).some((isOpen) => isOpen)) {
          setOpenDropdowns({});
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, openDropdowns]);

  const toggleDropdown = (category: string) => {
    setOpenDropdowns((prev) => {
      const newState: Record<string, boolean> = {};
      newState[category] = !prev[category];
      return newState;
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdowns({});
      }
    };

    if (Object.values(openDropdowns).some((isOpen) => isOpen)) {
      document.addEventListener('mousedown', handleDocumentClick);
      return () => document.removeEventListener('mousedown', handleDocumentClick);
    }
  }, [openDropdowns]);

  const handleSelectChange = (key: keyof OutreachFilters, value: string) => {
    onUpdateFilter(key, value || undefined);
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof OutreachFilters] !== undefined
  ).length;

  return (
    <div
      ref={popupRef}
      className="absolute top-full left-0 mt-2 w-[480px] bg-white border border-gray-200 rounded-xl shadow-xl z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
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

          {/* Queue */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Queue
            </label>
            <select
              value={filters.queueId || ''}
              onChange={(e) => handleSelectChange('queueId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Queues</option>
              {QUEUES.map((queue) => (
                <option key={queue} value={queue}>
                  {queue}
                </option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Method
            </label>
            <select
              value={filters.method || ''}
              onChange={(e) => onUpdateFilter('method', (e.target.value || undefined) as OutreachMethod)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Methods</option>
              {METHODS.map((method) => (
                <option key={method} value={method}>
                  {method.replace('_', ' ')}
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
              onChange={(e) => onUpdateFilter('status', (e.target.value || undefined) as TaskStatus)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Priority
            </label>
            <select
              value={filters.priorityTier || ''}
              onChange={(e) => onUpdateFilter('priorityTier', (e.target.value || undefined) as PriorityTier)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          {/* Provider State */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Provider State
            </label>
            <select
              value={filters.providerState || ''}
              onChange={(e) => handleSelectChange('providerState', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All States</option>
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* SLA Due */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              SLA Due
            </label>
            <select
              value={filters.slaDue || ''}
              onChange={(e) => handleSelectChange('slaDue', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">Any Time</option>
              {SLA_DUE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Last Updated */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Last Updated
            </label>
            <select
              value={filters.lastUpdated || ''}
              onChange={(e) => handleSelectChange('lastUpdated', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">Any Time</option>
              {LAST_UPDATED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Block Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Block Reason
            </label>
            <select
              value={filters.blockReason || ''}
              onChange={(e) => onUpdateFilter('blockReason', (e.target.value || undefined) as BlockReason)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">None</option>
              {BLOCK_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason.replace(/_/g, ' ').toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Agent */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Assigned Agent
            </label>
            <select
              value={filters.assignedAgent || ''}
              onChange={(e) => handleSelectChange('assignedAgent', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              <option value="">All Agents</option>
              {AGENTS.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </div>

          {/* Attempt Count Threshold */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
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
}
