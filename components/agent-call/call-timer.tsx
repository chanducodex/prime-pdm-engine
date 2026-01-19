'use client';

import { useCallTimer, useHoldTimer } from '@/lib/hooks/use-call-timer';
import { Clock, Pause } from 'lucide-react';

interface CallTimerProps {
  startedAt?: string | null;
  holdStartedAt?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function CallTimer({
  startedAt,
  holdStartedAt,
  className = '',
  size = 'md',
}: CallTimerProps) {
  const callTimer = useCallTimer({ startedAt });
  const holdTimer = useHoldTimer(holdStartedAt);

  if (!startedAt) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Main call timer */}
      <div className="flex items-center gap-2">
        <Clock className={`${size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'} text-gray-500`} />
        <span
          className={`
            font-mono font-semibold tabular-nums
            ${sizeClasses[size]}
            ${holdStartedAt ? 'text-amber-600' : 'text-gray-900'}
          `}
        >
          {callTimer.formattedTime}
        </span>
      </div>

      {/* Hold timer (if on hold) */}
      {holdStartedAt && (
        <div className="flex items-center gap-1.5 text-amber-600">
          <Pause className="w-3 h-3" />
          <span className="text-xs font-medium">
            On hold: {holdTimer.formattedTime}
          </span>
        </div>
      )}
    </div>
  );
}

export function CallTimerCompact({
  startedAt,
  className = '',
}: {
  startedAt?: string | null;
  className?: string;
}) {
  const { formattedTime, isRunning } = useCallTimer({ startedAt });

  if (!startedAt || !isRunning) {
    return null;
  }

  return (
    <span
      className={`
        font-mono text-sm tabular-nums text-gray-600
        ${className}
      `}
    >
      {formattedTime}
    </span>
  );
}

export default CallTimer;
