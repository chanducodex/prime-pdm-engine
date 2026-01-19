'use client';

import { X, History, PhoneIncoming, PhoneOutgoing, Clock, FileText, Play } from 'lucide-react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';
import type { CallHistoryEntry } from '@/lib/agent-call-types';

interface CallHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CallHistoryModal({ isOpen, onClose }: CallHistoryModalProps) {
  const { state } = useAgentCall();
  const { callHistory } = state;

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <History className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Call History</h3>
              <p className="text-xs text-gray-500">{callHistory.length} calls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {callHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <History className="w-12 h-12 mb-3" />
            <p className="text-sm">No call history</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {callHistory.map((entry, index) => (
              <div
                key={entry.callId}
                className={`
                  px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer
                  ${index !== callHistory.length - 1 ? 'border-b border-gray-100' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Direction icon */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${entry.direction === 'INBOUND' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}
                    `}
                  >
                    {entry.direction === 'INBOUND' ? (
                      <PhoneIncoming className="w-5 h-5" />
                    ) : (
                      <PhoneOutgoing className="w-5 h-5" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {entry.callerName || entry.phoneNumber}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(entry.startedAt)}
                      </span>
                    </div>

                    {entry.callerName && (
                      <p className="text-sm text-gray-500">{entry.phoneNumber}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2">
                      {/* Duration */}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(entry.duration)}
                      </span>

                      {/* Outcome */}
                      <span className="text-xs text-gray-600">{entry.outcome}</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CallHistoryModal;
