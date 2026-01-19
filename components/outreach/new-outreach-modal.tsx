// ============================================================================
// Outreach Management - New Outreach Modal
// ============================================================================

'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { OutreachMethod, PriorityTier } from '@/lib/outreach-types';

interface NewOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewOutreachData) => void;
}

export interface NewOutreachData {
  accountName: string;
  cycleName: string;
  providerIdentifier: string;
  providerState: string;
  method: OutreachMethod;
  priorityTier: PriorityTier;
  slaDueAt: string;
  assignedQueue?: string;
  assignedAgent?: string;
  notes?: string;
}

const ACCOUNTS = ['Acme Health', 'MedCare Plus', 'HealthFirst', 'Premier Medical', 'United Health'];
const CYCLES = ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024', 'Special Enrollment 2024'];
const QUEUES = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Overflow Queue', 'Research Queue'];
const AGENTS = ['Agent Smith', 'Agent Johnson', 'Agent Williams', 'Agent Brown', 'Agent Davis'];
const METHODS: OutreachMethod[] = ['WEB', 'AI_CALL', 'HUMAN_CALL', 'EMAIL', 'SELF_SERVICE'];
const PRIORITIES: PriorityTier[] = ['P0', 'P1', 'P2'];
const STATES = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

export const NewOutreachModal: React.FC<NewOutreachModalProps> = ({ isOpen, onClose, onSubmit }) => {
  // Set default SLA due date to 7 days from now
  const getDefaultSLADate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<NewOutreachData>({
    accountName: '',
    cycleName: '',
    providerIdentifier: '',
    providerState: 'CA',
    method: 'AI_CALL',
    priorityTier: 'P1',
    slaDueAt: getDefaultSLADate(),
    assignedQueue: '',
    assignedAgent: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NewOutreachData, string>>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewOutreachData, string>> = {};

    if (!formData.accountName) newErrors.accountName = 'Account is required';
    if (!formData.cycleName) newErrors.cycleName = 'Cycle is required';
    if (!formData.providerIdentifier) newErrors.providerName = 'Provider identifier is required';
    if (!formData.slaDueAt) newErrors.slaDueAt = 'SLA due date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        accountName: '',
        cycleName: '',
        providerIdentifier: '',
        providerState: 'CA',
        method: 'AI_CALL',
        priorityTier: 'P1',
        slaDueAt: getDefaultSLADate(),
        assignedQueue: '',
        assignedAgent: '',
        notes: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Outreach</h2>
            <p className="text-sm text-gray-500 mt-1">
              Set up a new outreach task for a provider
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
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account and Cycle */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                    errors.accountName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select account</option>
                  {ACCOUNTS.map((account) => (
                    <option key={account} value={account}>
                      {account}
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
                <select
                  value={formData.cycleName}
                  onChange={(e) => setFormData({ ...formData, cycleName: e.target.value })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                    errors.cycleName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select cycle</option>
                  {CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>
                      {cycle}
                    </option>
                  ))}
                </select>
                {errors.cycleName && (
                  <p className="text-xs text-red-500 mt-1">{errors.cycleName}</p>
                )}
              </div>
            </div>

            {/* Provider Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Identifier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.providerIdentifier}
                  onChange={(e) => setFormData({ ...formData, providerIdentifier: e.target.value })}
                  placeholder="e.g., PRV123456"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                    errors.providerIdentifier ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
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
                  value={formData.providerState}
                  onChange={(e) => setFormData({ ...formData, providerState: e.target.value })}
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

            {/* Method and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outreach Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as OutreachMethod })}
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
                  value={formData.priorityTier}
                  onChange={(e) => setFormData({ ...formData, priorityTier: e.target.value as PriorityTier })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority} - {priority === 'P0' ? 'Critical' : priority === 'P1' ? 'High' : 'Medium'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SLA Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SLA Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.slaDueAt}
                onChange={(e) => setFormData({ ...formData, slaDueAt: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                  errors.slaDueAt ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.slaDueAt && (
                <p className="text-xs text-red-500 mt-1">{errors.slaDueAt}</p>
              )}
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Queue
                </label>
                <select
                  value={formData.assignedQueue || ''}
                  onChange={(e) => setFormData({ ...formData, assignedQueue: e.target.value })}
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
                  value={formData.assignedAgent || ''}
                  onChange={(e) => setFormData({ ...formData, assignedAgent: e.target.value })}
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

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Add any additional notes or context..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Create Outreach
          </button>
        </div>
      </div>
    </div>
  );
};
