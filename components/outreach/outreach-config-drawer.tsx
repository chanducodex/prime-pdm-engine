// ============================================================================
// Outreach Management - Configuration Drawer (Right Side Panel)
// ============================================================================

'use client';

import React, { useState } from 'react';
import { X, Save, ChevronDown } from 'lucide-react';
import { OutreachTask, OutreachMethod, PriorityTier } from '@/lib/outreach-types';

interface OutreachConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: OutreachTask | null;
  onSave: (data: any) => void;
}

interface OutreachConfig {
  // Basic Info
  outreachName: string;
  outreachDescription: string;

  // Client & Cycle
  accountId: string;
  accountName: string;
  cycleName: string;
  cycleId: string;

  // Provider Selection
  providerIdentifier: string;
  providerState: string;

  // Outreach Configuration
  method: OutreachMethod;
  priorityTier: PriorityTier;
  slaDueAt: string;

  // Assignment
  assignedQueue: string;
  assignedAgent: string;

  // Strategy & Rules
  strategyVersion: string;
  maxAttempts: number;
  cooldownMinutes: number;

  // Call Window Settings
  callWindowStart: string;
  callWindowEnd: string;

  // Additional Settings
  notes: string;
  tags: string[];
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
const AGENTS = ['Agent Smith', 'Agent Johnson', 'Agent Williams', 'Agent Brown', 'Agent Davis'];
const METHODS: OutreachMethod[] = ['WEB', 'AI_CALL', 'HUMAN_CALL', 'EMAIL', 'SELF_SERVICE'];
const PRIORITIES: PriorityTier[] = ['P0', 'P1', 'P2'];
const STATES = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

export const OutreachConfigDrawer: React.FC<OutreachConfigDrawerProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
}) => {
  const [config, setConfig] = useState<OutreachConfig>({
    outreachName: task?.cycleName || '',
    outreachDescription: '',
    accountId: task?.accountId || '',
    accountName: task?.accountName || '',
    cycleName: task?.cycleName || '',
    cycleId: task?.cycleId || '',
    providerIdentifier: task?.providerIdentifier || '',
    providerState: task?.providerState || 'CA',
    method: task?.currentMethod || 'AI_CALL',
    priorityTier: task?.priorityTier || 'P1',
    slaDueAt: task?.slaDueAt?.slice(0, 16) || '',
    assignedQueue: task?.assignedQueue || '',
    assignedAgent: task?.assignedAgent || '',
    strategyVersion: task?.strategyVersion || 'v1.0.0',
    maxAttempts: 5,
    cooldownMinutes: 60,
    callWindowStart: '08:00',
    callWindowEnd: '18:00',
    notes: '',
    tags: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OutreachConfig, string>>>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof OutreachConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OutreachConfig, string>> = {};

    if (!config.outreachName?.trim()) newErrors.outreachName = 'Outreach name is required';
    if (!config.accountName) newErrors.accountName = 'Account is required';
    if (!config.cycleName) newErrors.cycleName = 'Cycle is required';
    if (!config.providerIdentifier?.trim()) newErrors.providerIdentifier = 'Provider identifier is required';
    if (!config.slaDueAt) newErrors.slaDueAt = 'SLA due date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSave(config);
    setSaving(false);
  };

  const getDefaultSLADate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {task ? 'Edit Outreach Configuration' : 'New Outreach Configuration'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {task ? 'Update outreach settings and preferences' : 'Configure a new outreach campaign'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Section: Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outreach Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.outreachName}
                    onChange={(e) => handleChange('outreachName', e.target.value)}
                    placeholder="e.g., Q1 2025 CA Provider Verification"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                      errors.outreachName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.outreachName && (
                    <p className="text-xs text-red-500 mt-1">{errors.outreachName}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    A descriptive name for this outreach campaign
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={config.outreachDescription}
                    onChange={(e) => handleChange('outreachDescription', e.target.value)}
                    placeholder="Describe the purpose and goals of this outreach..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section: Client & Cycle */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Client & Cycle
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account / Client <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={config.accountId}
                    onChange={(e) => {
                      const account = ACCOUNTS.find((a) => a.id === e.target.value);
                      handleChange('accountId', e.target.value);
                      handleChange('accountName', account?.name || '');
                    }}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                      errors.accountName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select account</option>
                    {ACCOUNTS.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {errors.accountName && (
                    <p className="text-xs text-red-500 mt-1">{errors.accountName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cycle <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={config.cycleId}
                      onChange={(e) => {
                        const cycle = CYCLES.find((c) => c.id === e.target.value);
                        handleChange('cycleId', e.target.value);
                        handleChange('cycleName', cycle?.name || '');
                      }}
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                        errors.cycleName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select cycle</option>
                      {CYCLES.map((cycle) => (
                        <option key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                      title="Create new cycle"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cycles are time-bound outreach periods (e.g., Q1 2025)
                  </p>
                  {errors.cycleName && (
                    <p className="text-xs text-red-500 mt-1">{errors.cycleName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Provider Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Provider Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Identifier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.providerIdentifier}
                    onChange={(e) => handleChange('providerIdentifier', e.target.value)}
                    placeholder="e.g., PRV123456"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                      errors.providerIdentifier ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.providerIdentifier && (
                    <p className="text-xs text-red-500 mt-1">{errors.providerIdentifier}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider State
                  </label>
                  <select
                    value={config.providerState}
                    onChange={(e) => handleChange('providerState', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    {STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Outreach Configuration */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Outreach Configuration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outreach Method
                  </label>
                  <select
                    value={config.method}
                    onChange={(e) => handleChange('method', e.target.value as OutreachMethod)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    {METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Tier
                  </label>
                  <select
                    value={config.priorityTier}
                    onChange={(e) => handleChange('priorityTier', e.target.value as PriorityTier)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority} - {priority === 'P0' ? 'Critical' : priority === 'P1' ? 'High' : 'Medium'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SLA Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={config.slaDueAt || getDefaultSLADate()}
                    onChange={(e) => handleChange('slaDueAt', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                      errors.slaDueAt ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.slaDueAt && (
                    <p className="text-xs text-red-500 mt-1">{errors.slaDueAt}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strategy Version
                  </label>
                  <select
                    value={config.strategyVersion}
                    onChange={(e) => handleChange('strategyVersion', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="v1.0.0">v1.0.0 (Standard)</option>
                    <option value="v2.0.0">v2.0.0 (Enhanced AI)</option>
                    <option value="v3.0.0">v3.0.0 (Aggressive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts per Method
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.maxAttempts}
                    onChange={(e) => handleChange('maxAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooldown (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1440"
                    value={config.cooldownMinutes}
                    onChange={(e) => handleChange('cooldownMinutes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  />
                </div>
              </div>

              {/* Within Call Window */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Within Call Window
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={config.callWindowStart}
                      onChange={(e) => handleChange('callWindowStart', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={config.callWindowEnd}
                      onChange={(e) => handleChange('callWindowEnd', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Calls will only be made during this time window (provider's local time)
                </p>
              </div>
            </div>

            {/* Section: Assignment */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Assignment
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Queue
                  </label>
                  <select
                    value={config.assignedQueue}
                    onChange={(e) => handleChange('assignedQueue', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {QUEUES.map((queue) => (
                      <option key={queue} value={queue}>
                        {queue}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Agent
                  </label>
                  <select
                    value={config.assignedAgent}
                    onChange={(e) => handleChange('assignedAgent', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {AGENTS.map((agent) => (
                      <option key={agent} value={agent}>
                        {agent}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Additional Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Additional Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={config.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add any additional notes or special instructions..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white resize-none"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">About Outreach Configuration</h4>
                  <ul className="text-xs text-blue-800 mt-2 space-y-1">
                    <li>• <strong>Outreach Name</strong>: A unique identifier for this campaign</li>
                    <li>• <strong>Account</strong>: The client organization this outreach belongs to</li>
                    <li>• <strong>Cycle</strong>: Time-bound period (quarterly, special enrollment, etc.)</li>
                    <li>• <strong>Strategy Version</strong>: Determines outreach rules and AI behavior</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
