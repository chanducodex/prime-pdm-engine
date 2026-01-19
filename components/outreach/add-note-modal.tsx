// ============================================================================
// Add Note Modal - Add notes to provider validation tasks
// ============================================================================

'use client';

import React, { useState } from 'react';
import { OutreachTask } from '@/lib/outreach-types';
import { X } from 'lucide-react';

interface AddNoteModalProps {
  isOpen: boolean;
  task: OutreachTask | null;
  onClose: () => void;
  onSave: (taskId: string, note: string) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, task, onClose, onSave }) => {
  const [note, setNote] = useState('');

  if (!isOpen || !task) return null;

  const handleSave = () => {
    if (note.trim()) {
      onSave(task.taskId, note);
      setNote('');
      onClose();
    }
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Note</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Provider: {task.providerIdentifier}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter note about this provider validation task..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This note will be added to the task history and visible to all team members.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!note.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
};
