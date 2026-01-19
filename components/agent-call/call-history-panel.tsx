'use client';

import {
  History,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  FileText,
  Play,
  Clock,
} from 'lucide-react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';
import type { CallHistoryEntry } from '@/lib/agent-call-types';

interface CallHistoryPanelProps {
  className?: string;
}

export function CallHistoryPanel({ className = '' }: CallHistoryPanelProps) {
  const { state } = useAgentCall();
  const { callHistory } = state;

  if (callHistory.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-gray-400">
          <History className="w-12 h-12" />
          <p className="text-sm">No call history</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <History className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-medium text-gray-900">Call History</h3>
        <span className="text-xs text-gray-500">({callHistory.length})</span>
      </div>

      {/* History list */}
      <div className="max-h-[400px] overflow-y-auto">
        {callHistory.map((entry, index) => (
          <CallHistoryItem
            key={entry.callId}
            entry={entry}
            isLast={index === callHistory.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

interface CallHistoryItemProps {
  entry: CallHistoryEntry;
  isLast: boolean;
}

function CallHistoryItem({ entry, isLast }: CallHistoryItemProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`
        px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer
        ${!isLast ? 'border-b border-gray-100' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Direction icon */}
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${entry.direction === 'INBOUND' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}
          `}
        >
          {entry.direction === 'INBOUND' ? (
            <PhoneIncoming className="w-4 h-4" />
          ) : (
            <PhoneOutgoing className="w-4 h-4" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {entry.callerName || entry.phoneNumber}
            </p>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatDate(entry.startedAt)}
            </span>
          </div>

          {entry.callerName && (
            <p className="text-xs text-gray-500">{entry.phoneNumber}</p>
          )}

          <div className="flex items-center gap-3 mt-2">
            {/* Duration */}
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDuration(entry.duration)}
            </span>

            {/* Outcome */}
            <span className="text-xs text-gray-600 truncate">{entry.outcome}</span>
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-2 mt-2">
            {entry.hasRecording && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">
                <Play className="w-3 h-3" />
                Recording
              </span>
            )}
            {entry.hasTranscript && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">
                <FileText className="w-3 h-3" />
                Transcript
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallHistoryPanel;
