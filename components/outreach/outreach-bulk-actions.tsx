// ============================================================================
// Outreach Management - Bulk Actions Component (Inline Style)
// ============================================================================

'use client';

import React, { useState } from 'react';
import { OutreachRole, ROLE_PERMISSIONS } from '@/lib/outreach-types';

interface OutreachBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAction: (action: string, data: any) => void;
  userRole: OutreachRole;
  isActionInProgress: boolean;
}

export const OutreachBulkActions: React.FC<OutreachBulkActionsProps> = ({
  selectedCount,
  onAction,
  userRole,
  isActionInProgress,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const permissions = ROLE_PERMISSIONS[userRole];

  const openModal = (modalName: string) => {
    setActiveModal(modalName);
    setFormData({});
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({});
  };

  const handleSubmit = () => {
    onAction(activeModal!, formData);
    closeModal();
  };

  const QUEUES = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Overflow Queue', 'Research Queue'];
  const AGENTS = ['Agent Smith', 'Agent Johnson', 'Agent Williams', 'Agent Brown', 'Agent Davis'];

  return (
    <>
      {/* Reassign */}
      {permissions.canReassign && (
        <button
          onClick={() => openModal('reassign')}
          disabled={isActionInProgress}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reassign
        </button>
      )}

      {/* Escalate */}
      {permissions.canEscalate && (
        <button
          onClick={() => openModal('escalate')}
          disabled={isActionInProgress}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Escalate
        </button>
      )}

      {/* Pause */}
      {permissions.canPauseOutreach && (
        <button
          onClick={() => openModal('pause')}
          disabled={isActionInProgress}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Pause
        </button>
      )}

      {/* Retry All */}
      {permissions.canRetry && (
        <button
          onClick={() => onAction('retry_bulk', {})}
          disabled={isActionInProgress}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Retry All
        </button>
      )}

      {/* Reassign Modal */}
      {activeModal === 'reassign' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reassign {selectedCount} Task{selectedCount !== 1 ? 's' : ''}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignment Type
                </label>
                <select
                  value={formData.targetType || 'agent'}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="agent">Assign to Agent</option>
                  <option value="queue">Assign to Queue</option>
                </select>
              </div>

              {formData.targetType === 'queue' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Queue
                  </label>
                  <select
                    value={formData.targetId || ''}
                    onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a queue</option>
                    {QUEUES.map((queue) => (
                      <option key={queue} value={queue}>
                        {queue}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agent
                  </label>
                  <select
                    value={formData.targetId || ''}
                    onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select an agent</option>
                    {AGENTS.map((agent) => (
                      <option key={agent} value={agent}>
                        {agent}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter reason for reassignment..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.reason || !formData.targetId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {activeModal === 'escalate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Escalate {selectedCount} Task{selectedCount !== 1 ? 's' : ''}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Queue
                </label>
                <select
                  value={formData.targetQueue || 'supervisor'}
                  onChange={(e) => setFormData({ ...formData, targetQueue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                >
                  <option value="supervisor">Supervisor Queue</option>
                  <option value="research">Research Queue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  placeholder="Enter reason for escalation..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.reason}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {activeModal === 'pause' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pause {selectedCount} Task{selectedCount !== 1 ? 's' : ''}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pause Duration (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={formData.ttlHours || 24}
                  onChange={(e) => setFormData({ ...formData, ttlHours: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tasks will resume automatically after this period
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  placeholder="Enter reason for pause..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.reason}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pause
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
