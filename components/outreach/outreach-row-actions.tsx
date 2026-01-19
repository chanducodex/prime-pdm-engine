// ============================================================================
// Call Monitoring & QA - Row Actions Menu Component
// ============================================================================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OutreachTask, OutreachRole, ROLE_PERMISSIONS } from '@/lib/outreach-types';

interface OutreachRowActionsProps {
  task: OutreachTask;
  userRole: OutreachRole;
  onAction?: (action: string, task: OutreachTask) => void;
}

export const OutreachRowActions: React.FC<OutreachRowActionsProps> = ({ task, userRole, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const permissions = ROLE_PERMISSIONS[userRole];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if action is allowed based on task state
  const isRetryEligible =
    task.status === 'READY' ||
    task.status === 'IN_PROGRESS' ||
    task.status === 'WAITING_COOLDOWN' ||
    task.status === 'WAITING_TIME_WINDOW';

  const isSwitchMethodEligible =
    task.status === 'READY' ||
    task.status === 'IN_PROGRESS' ||
    (task.status === 'BLOCKED' && permissions.canSwitchMethod);

  const isPausedOrBlocked =
    task.status === 'BLOCKED' ||
    task.status === 'WAITING_COOLDOWN' ||
    task.status === 'WAITING_TIME_WINDOW' ||
    task.status === 'ESCALATED' ||
    task.status === 'NEEDS_RESEARCH';

  const canClosePartial =
    permissions.canClosePartial &&
    (task.status === 'BLOCKED' || task.status === 'FAILED' || task.attemptSummary.totalAttempts >= 3);

  const handleAction = (action: string) => {
    setIsOpen(false);
    onAction?.(action, task);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Actions"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-56 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
          {/* View Details - Always available */}
          <button
            onClick={() => handleAction('view_details')}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Details
          </button>

          {/* Explainability */}
          {permissions.canViewExplainability && (
            <button
              onClick={() => handleAction('explainability')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Explainability
            </button>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          {/* Retry */}
          {permissions.canRetry && (
            <button
              onClick={() => handleAction('retry')}
              disabled={!isRetryEligible}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !isRetryEligible
                  ? `Cannot retry: task is ${task.status.toLowerCase().replace(/_/g, ' ')}`
                  : 'Trigger retry now'
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry
              {!isRetryEligible && task.nextEligibleAt && (
                <span className="ml-auto text-xs text-gray-500">
                  {new Date(task.nextEligibleAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </button>
          )}

          {/* Switch Method */}
          {permissions.canSwitchMethod && (
            <button
              onClick={() => handleAction('switch_method')}
              disabled={!isSwitchMethodEligible}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !isSwitchMethodEligible && !permissions.canSwitchMethod
                  ? 'Manager override required to switch method from blocked state'
                  : 'Switch to different contact method'
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Switch Method
            </button>
          )}

          {/* Send Self-Service */}
          {permissions.canSendSelfService && (
            <button
              onClick={() => handleAction('send_self_service')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send Self-Service
            </button>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          {/* Add Note */}
          {permissions.canAddNotes && (
            <button
              onClick={() => handleAction('add_note')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Add Note
            </button>
          )}

          {/* Update Contact Info */}
          {permissions.canUpdateContactInfo && (
            <button
              onClick={() => handleAction('update_contact')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Update Contact
            </button>
          )}

          {/* Mark Unreachable */}
          {permissions.canMarkUnreachable && (
            <button
              onClick={() => handleAction('mark_unreachable')}
              className="w-full px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Mark Unreachable
            </button>
          )}

          {/* Close Partial */}
          {canClosePartial && (
            <button
              onClick={() => handleAction('close_partial')}
              className="w-full px-4 py-2 text-left text-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Close Partial
            </button>
          )}

          {/* Tooltip for disabled actions */}
          {(!isRetryEligible && permissions.canRetry || !isSwitchMethodEligible && permissions.canSwitchMethod) && (
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-1">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {task.blockReason || task.status.replace(/_/g, ' ').toLowerCase()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
