'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageSquare, User, Bot, Loader2, ChevronDown } from 'lucide-react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';
import type { LiveTranscriptSegment } from '@/lib/agent-call-types';

interface TranscriptionPanelProps {
  className?: string;
}

export function TranscriptionPanel({ className = '' }: TranscriptionPanelProps) {
  const { state } = useAgentCall();
  const { transcription, isTranscriptionLoading, activeCall } = state;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new segments arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcription?.segments, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  if (!activeCall || activeCall.state === 'IDLE' || activeCall.state === 'ENDED') {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-3 text-gray-400 min-h-[300px]">
          <MessageSquare className="w-12 h-12" />
          <p className="text-sm">No active transcription</p>
          <p className="text-xs text-gray-400">Transcription will appear during an active call</p>
        </div>
      </div>
    );
  }

  if (isTranscriptionLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading transcription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-medium text-gray-900">Live Transcription</h3>
        </div>
        {transcription?.isProcessing && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
        )}
      </div>

      {/* Transcription content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] "
      >
        {transcription?.segments && transcription.segments.length > 0 ? (
          transcription.segments.map((segment) => (
            <TranscriptSegment key={segment.segmentId} segment={segment} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <p className="text-sm">Waiting for conversation...</p>
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true);
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }}
          className="
            absolute bottom-4 right-4 p-2 rounded-full
            bg-violet-500 text-white shadow-lg
            hover:bg-violet-600 transition-colors
          "
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function TranscriptSegment({ segment }: { segment: LiveTranscriptSegment }) {
  const isAgent = segment.speaker === 'AGENT' || segment.speaker === 'AI_AGENT';
  const isAI = segment.speaker === 'AI_AGENT';

  const speakerConfig = {
    AGENT: { icon: User, label: 'Agent', color: 'bg-blue-100 text-blue-700' },
    AI_AGENT: { icon: Bot, label: 'AI Agent', color: 'bg-purple-100 text-purple-700' },
    PROVIDER: { icon: User, label: 'Provider', color: 'bg-gray-100 text-gray-700' },
  };

  const config = speakerConfig[segment.speaker];
  const Icon = config.icon;

  const sentimentColors = {
    POSITIVE: 'border-l-green-400',
    NEUTRAL: 'border-l-gray-200',
    NEGATIVE: 'border-l-red-400',
  };

  return (
    <div
      className={`
        flex gap-3
        ${isAgent ? '' : 'flex-row-reverse'}
      `}
    >
      {/* Speaker avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${config.color}
        `}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Message bubble */}
      <div
        className={`
          max-w-[80%] rounded-xl px-4 py-2.5
          border-l-4 ${segment.sentiment ? sentimentColors[segment.sentiment] : 'border-l-gray-200'}
          ${isAgent
            ? 'bg-blue-50 rounded-tl-none'
            : isAI
              ? 'bg-purple-50 rounded-tl-none'
              : 'bg-gray-50 rounded-tr-none'
          }
          ${segment.isLive ? 'animate-pulse' : ''}
        `}
      >
        {/* Speaker label and timestamp */}
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-xs font-medium text-gray-500">{config.label}</span>
          <span className="text-xs text-gray-400">
            {formatTime(segment.startTime)}
          </span>
        </div>

        {/* Text content */}
        <p className="text-sm text-gray-800">{segment.text}</p>

        {/* Confidence indicator (only show if low) */}
        {segment.confidence && segment.confidence < 0.8 && (
          <div className="mt-1 flex items-center gap-1">
            <div className="h-1 w-12 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400"
                style={{ width: `${segment.confidence * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              {Math.round(segment.confidence * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default TranscriptionPanel;
