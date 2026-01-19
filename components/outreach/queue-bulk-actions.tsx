// ============================================================================
// Queue Management - Bulk Actions Component
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Play, Pause, Trash2, Download, Copy, CheckSquare, X } from 'lucide-react';
import { OutreachQueue } from '@/lib/outreach-queue-types';

interface QueueBulkActionsProps {
  selectedQueues: OutreachQueue[];
  onClearSelection: () => void;
  onAction: (action: string, data: any) => void;
  isActionInProgress: boolean;
}

export const QueueBulkActions: React.FC<QueueBulkActionsProps> = ({
  selectedQueues,
  onClearSelection,
  onAction,
  isActionInProgress,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const openModal = (modalName: string) => {
    setActiveModal(modalName);
    setFormData({});
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({});
  };

  const handleSubmit = () => {
    onAction(activeModal!, {
      queueIds: selectedQueues.map((q) => q.queueId),
      ...formData,
    });
    closeModal();
  };

  if (selectedQueues.length === 0) return null;

  const canPause = selectedQueues.some((q) => q.status === 'ACTIVE');
  const canResume = selectedQueues.some((q) => q.status === 'PAUSED');

  return (
    <>
      {/* Bulk Action Bar */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-violet-100 rounded-lg">
            <CheckSquare className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-sm font-medium text-violet-900">
            {selectedQueues.length} queue{selectedQueues.length !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Resume */}
          {canResume && (
            <button
              onClick={() => openModal('resume')}
              disabled={isActionInProgress}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Resume
            </button>
          )}

          {/* Pause */}
          {canPause && (
            <button
              onClick={() => openModal('pause')}
              disabled={isActionInProgress}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          )}

          {/* Duplicate */}
          <button
            onClick={() => openModal('duplicate')}
            disabled={isActionInProgress}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>

          {/* Export */}
          <button
            onClick={() => onAction('export', { queueIds: selectedQueues.map((q) => q.queueId) })}
            disabled={isActionInProgress}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          {/* Delete */}
          <button
            onClick={() => openModal('delete')}
            disabled={isActionInProgress}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pause Confirmation Modal */}
      {activeModal === 'pause' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pause {selectedQueues.length} Queue{selectedQueues.length !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This will pause all selected queues. Queues can be resumed later.
            </p>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Affected queues:</div>
              <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
                {selectedQueues
                  .filter((q) => q.status === 'ACTIVE')
                  .map((queue) => (
                    <div key={queue.queueId} className="text-xs text-gray-700 py-1">
                      {queue.queueName}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="pauseWithReason"
                checked={formData.includeReason || false}
                onChange={(e) => setFormData({ ...formData, includeReason: e.target.checked })}
                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
              />
              <label htmlFor="pauseWithReason" className="text-sm text-gray-700">
                Add reason for pause
              </label>
            </div>

            {formData.includeReason && (
              <div className="mb-4">
                <textarea
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900"
                  placeholder="Enter reason for pausing..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
              >
                Pause Queues
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Confirmation Modal */}
      {activeModal === 'resume' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Resume {selectedQueues.length} Queue{selectedQueues.length !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This will resume all paused queues. Tasks will continue processing.
            </p>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Affected queues:</div>
              <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
                {selectedQueues
                  .filter((q) => q.status === 'PAUSED')
                  .map((queue) => (
                    <div key={queue.queueId} className="text-xs text-gray-700 py-1">
                      {queue.queueName}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Resume Queues
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Confirmation Modal */}
      {activeModal === 'duplicate' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Duplicate {selectedQueues.length} Queue{selectedQueues.length !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This will create copies of all selected queues. The new queues will be in draft status.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name Suffix
              </label>
              <input
                type="text"
                value={formData.suffix || '(Copy)'}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900"
                placeholder="e.g., (Copy)"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be added to the end of each queue name
              </p>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Queues to duplicate:</div>
              <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
                {selectedQueues.map((queue) => (
                  <div key={queue.queueId} className="text-xs text-gray-700 py-1">
                    {queue.queueName}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700"
              >
                Duplicate Queues
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete {selectedQueues.length} Queue{selectedQueues.length !== 1 ? 's' : ''}?
                </h3>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              This action <strong>cannot be undone</strong>. All associated tasks, history, and data will be permanently removed.
            </p>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Queues to be deleted:</div>
              <div className="max-h-32 overflow-y-auto bg-red-50 rounded p-2 border border-red-200">
                {selectedQueues.map((queue) => (
                  <div key={queue.queueId} className="text-xs text-red-700 py-1">
                    {queue.queueName}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>Warning:</strong> Deleting active queues will interrupt ongoing outreach. Consider pausing queues first instead.
              </p>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.confirmDelete || false}
                  onChange={(e) => setFormData({ ...formData, confirmDelete: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                I understand this action cannot be undone
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Queues
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
