'use client';

import { useState } from 'react';
import {
  MessageSquare,
  ClipboardList,
  CalendarClock,
  ExternalLink,
  Mail,
  FileText,
  Loader2,
} from 'lucide-react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';
import type { QuickActionType } from '@/lib/agent-call-types';

interface ActionQuickBarProps {
  className?: string;
}

interface QuickActionConfig {
  type: QuickActionType;
  icon: typeof MessageSquare;
  label: string;
  shortcut: string;
  requiresCall?: boolean;
}

const quickActions: QuickActionConfig[] = [
  {
    type: 'SEND_SMS',
    icon: MessageSquare,
    label: 'Send SMS',
    shortcut: 'Ctrl+M',
    requiresCall: true,
  },
  {
    type: 'CREATE_TASK',
    icon: ClipboardList,
    label: 'Create Task',
    shortcut: 'Ctrl+T',
    requiresCall: false,
  },
  {
    type: 'SCHEDULE_CALLBACK',
    icon: CalendarClock,
    label: 'Schedule Callback',
    shortcut: 'Ctrl+K',
    requiresCall: true,
  },
  {
    type: 'OPEN_CRM',
    icon: ExternalLink,
    label: 'Open CRM',
    shortcut: 'Ctrl+O',
    requiresCall: true,
  },
  {
    type: 'SEND_EMAIL',
    icon: Mail,
    label: 'Send Email',
    shortcut: 'Ctrl+E',
    requiresCall: true,
  },
  {
    type: 'ADD_NOTE',
    icon: FileText,
    label: 'Add Note',
    shortcut: 'Ctrl+N',
    requiresCall: true,
  },
];

export function ActionQuickBar({ className = '' }: ActionQuickBarProps) {
  const { state, executeQuickAction } = useAgentCall();
  const { activeCall, callerInfo } = state;

  const [loadingAction, setLoadingAction] = useState<QuickActionType | null>(null);

  const handleAction = async (actionType: QuickActionType) => {
    setLoadingAction(actionType);
    try {
      await executeQuickAction(actionType);
    } finally {
      setLoadingAction(null);
    }
  };

  const isCallActive = activeCall && activeCall.state !== 'IDLE' && activeCall.state !== 'ENDED';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="px-4 py-3 flex items-center justify-between gap-2 overflow-x-auto">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isLoading = loadingAction === action.type;
          const isDisabled = (action.requiresCall && !isCallActive) ||
                            (action.type === 'OPEN_CRM' && !callerInfo?.providerId);

          return (
            <button
              key={action.type}
              onClick={() => handleAction(action.type)}
              disabled={isDisabled || isLoading}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg
                font-medium text-sm whitespace-nowrap
                transition-all duration-200
                ${isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-700 hover:bg-violet-50 hover:text-violet-700 active:scale-95'
                }
                focus:outline-none focus:ring-2 focus:ring-violet-500
              `}
              title={`${action.label} (${action.shortcut})`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ActionQuickBarCompact({ className = '' }: ActionQuickBarProps) {
  const { state, executeQuickAction } = useAgentCall();
  const { activeCall, callerInfo } = state;

  const [loadingAction, setLoadingAction] = useState<QuickActionType | null>(null);

  const handleAction = async (actionType: QuickActionType) => {
    setLoadingAction(actionType);
    try {
      await executeQuickAction(actionType);
    } finally {
      setLoadingAction(null);
    }
  };

  const isCallActive = activeCall && activeCall.state !== 'IDLE' && activeCall.state !== 'ENDED';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {quickActions.slice(0, 4).map((action) => {
        const Icon = action.icon;
        const isLoading = loadingAction === action.type;
        const isDisabled = (action.requiresCall && !isCallActive) ||
                          (action.type === 'OPEN_CRM' && !callerInfo?.providerId);

        return (
          <button
            key={action.type}
            onClick={() => handleAction(action.type)}
            disabled={isDisabled || isLoading}
            className={`
              p-2 rounded-lg transition-colors
              ${isDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }
            `}
            title={`${action.label} (${action.shortcut})`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ActionQuickBar;
