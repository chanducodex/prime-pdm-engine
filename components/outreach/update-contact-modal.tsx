// ============================================================================
// Update Contact Modal - Update provider contact information
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { OutreachTask } from '@/lib/outreach-types';
import { X } from 'lucide-react';

interface UpdateContactModalProps {
  isOpen: boolean;
  task: OutreachTask | null;
  onClose: () => void;
  onSave: (taskId: string, contactInfo: ContactUpdateData) => void;
}

export interface ContactUpdateData {
  phone?: string;
  email?: string;
  notes?: string;
}

export const UpdateContactModal: React.FC<UpdateContactModalProps> = ({ isOpen, task, onClose, onSave }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPhone('');
      setEmail('');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    const updates: ContactUpdateData = {};
    if (phone.trim()) updates.phone = phone.trim();
    if (email.trim()) updates.email = email.trim();
    if (notes.trim()) updates.notes = notes.trim();

    if (Object.keys(updates).length > 0) {
      onSave(task.taskId, updates);
      handleClose();
    }
  };

  const handleClose = () => {
    setPhone('');
    setEmail('');
    setNotes('');
    onClose();
  };

  const hasChanges = phone.trim() || email.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Update Contact Information</h2>
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
        <div className="px-6 py-4 space-y-4">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="provider@example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Spoke with office manager, confirmed this is the correct number..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Contact information updates will be verified and processed according to your organization's data governance policies.
            </p>
          </div>
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
            disabled={!hasChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Contact Info
          </button>
        </div>
      </div>
    </div>
  );
};
