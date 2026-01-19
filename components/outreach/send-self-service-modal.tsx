// ============================================================================
// Send Self-Service Modal - Confirmation for sending self-service portal link
// ============================================================================

'use client';

import React, { useState } from 'react';
import { OutreachTask } from '@/lib/outreach-types';
import { X, Mail, MessageSquare } from 'lucide-react';

interface SendSelfServiceModalProps {
  isOpen: boolean;
  task: OutreachTask | null;
  onClose: () => void;
  onSend: (taskId: string, method: 'email' | 'sms') => void;
}

export const SendSelfServiceModal: React.FC<SendSelfServiceModalProps> = ({ isOpen, task, onClose, onSend }) => {
  const [method, setMethod] = useState<'email' | 'sms'>('email');

  if (!isOpen || !task) return null;

  const handleSend = () => {
    onSend(task.taskId, method);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send Self-Service Portal Link</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Provider: {task.providerIdentifier}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send a self-service portal link to the provider so they can update their information directly.
          </p>

          {/* Delivery Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Delivery Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="method"
                  value="email"
                  checked={method === 'email'}
                  onChange={(e) => setMethod(e.target.value as 'email' | 'sms')}
                  className="mr-3"
                />
                <Mail className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Email</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Send portal link via email</div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="method"
                  value="sms"
                  checked={method === 'sms'}
                  onChange={(e) => setMethod(e.target.value as 'email' | 'sms')}
                  className="mr-3"
                />
                <MessageSquare className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">SMS</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Send portal link via text message</div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-3">
            <p className="text-xs text-violet-700 dark:text-violet-300">
              The provider will receive a secure link valid for 7 days to update their information through our self-service portal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
          >
            Send Portal Link
          </button>
        </div>
      </div>
    </div>
  );
};
