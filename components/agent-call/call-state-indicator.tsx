'use client';

import { Phone, PhoneIncoming, PhoneOutgoing, Pause, PhoneOff, ArrowRightLeft, Clock } from 'lucide-react';
import type { CallState } from '@/lib/agent-call-types';

interface CallStateIndicatorProps {
  state: CallState;
  className?: string;
}

const stateConfig: Record<CallState, {
  icon: typeof Phone;
  label: string;
  color: string;
  bgColor: string;
  animate?: boolean;
}> = {
  IDLE: {
    icon: Phone,
    label: 'Ready',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
  INCOMING: {
    icon: PhoneIncoming,
    label: 'Incoming Call',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    animate: true,
  },
  OUTGOING: {
    icon: PhoneOutgoing,
    label: 'Calling...',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    animate: true,
  },
  CONNECTING: {
    icon: Phone,
    label: 'Connecting...',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    animate: true,
  },
  IN_CALL: {
    icon: Phone,
    label: 'In Call',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  ON_HOLD: {
    icon: Pause,
    label: 'On Hold',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  TRANSFERRING: {
    icon: ArrowRightLeft,
    label: 'Transferring...',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    animate: true,
  },
  WRAP_UP: {
    icon: Clock,
    label: 'Wrap Up',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  ENDED: {
    icon: PhoneOff,
    label: 'Call Ended',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
};

export function CallStateIndicator({ state, className = '' }: CallStateIndicatorProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-full
          ${config.bgColor} ${config.color}
          ${config.animate ? 'animate-pulse' : ''}
        `}
      >
        <Icon className="w-5 h-5" />
        {config.animate && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: 'currentColor' }} />
        )}
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
        {(state === 'INCOMING' || state === 'OUTGOING') && (
          <span className="text-xs text-gray-500">
            {state === 'INCOMING' ? 'Press Space to answer' : 'Waiting for connection...'}
          </span>
        )}
      </div>
    </div>
  );
}

export function CallStateBadge({ state, className = '' }: CallStateIndicatorProps) {
  const config = stateConfig[state];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${config.bgColor} ${config.color}
        ${config.animate ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {config.animate && (
        <span className="w-2 h-2 rounded-full bg-current animate-ping" />
      )}
      {config.label}
    </span>
  );
}

export default CallStateIndicator;
