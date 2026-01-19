'use client';

import { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  HelpCircle,
  Zap,
  Info,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
} from 'lucide-react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';
import type { AISuggestion, SuggestionType } from '@/lib/agent-call-types';

interface AISuggestionsPanelProps {
  className?: string;
}

const suggestionTypeConfig: Record<SuggestionType, {
  icon: typeof MessageSquare;
  label: string;
  color: string;
  bgColor: string;
}> = {
  RESPONSE: {
    icon: MessageSquare,
    label: 'Suggested Response',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  QUESTION: {
    icon: HelpCircle,
    label: 'Question to Ask',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  ACTION: {
    icon: Zap,
    label: 'Recommended Action',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  INFO: {
    icon: Info,
    label: 'Information',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  WARNING: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
};

export function AISuggestionsPanel({ className = '' }: AISuggestionsPanelProps) {
  const { state, toggleAIViewMode, useSuggestion, dismissSuggestion } = useAgentCall();
  const { aiSuggestions, aiViewMode, isSuggestionsLoading, activeCall } = state;

  if (!activeCall || activeCall.state === 'IDLE' || activeCall.state === 'ENDED') {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-gray-400">
          <Sparkles className="w-12 h-12" />
          <p className="text-sm">AI suggestions will appear during calls</p>
        </div>
      </div>
    );
  }

  if (isSuggestionsLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading AI suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-medium text-gray-900">AI Suggestions</h3>
          {aiSuggestions.length > 0 && (
            <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
              {aiSuggestions.length}
            </span>
          )}
        </div>
        <button
          onClick={toggleAIViewMode}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          {aiViewMode === 'CONDENSED' ? (
            <>
              <ChevronDown className="w-3 h-3" />
              Expand
            </>
          ) : (
            <>
              <ChevronUp className="w-3 h-3" />
              Condense
            </>
          )}
        </button>
      </div>

      {/* Suggestions list */}
      <div className="p-4 space-y-3  overflow-y-auto">
        {aiSuggestions.length > 0 ? (
          aiSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.suggestionId}
              suggestion={suggestion}
              isExpanded={aiViewMode === 'EXPANDED'}
              onUse={() => useSuggestion(suggestion.suggestionId)}
              onDismiss={() => dismissSuggestion(suggestion.suggestionId)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No suggestions yet</p>
            <p className="text-xs mt-1">AI will analyze the conversation and provide suggestions</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: AISuggestion;
  isExpanded: boolean;
  onUse: () => void;
  onDismiss: () => void;
}

function SuggestionCard({ suggestion, isExpanded, onUse, onDismiss }: SuggestionCardProps) {
  const [copied, setCopied] = useState(false);
  const config = suggestionTypeConfig[suggestion.type];
  const Icon = config.icon;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(suggestion.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidenceColor = suggestion.confidence >= 0.8
    ? 'bg-green-500'
    : suggestion.confidence >= 0.6
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div
      className={`
        relative rounded-lg border overflow-hidden
        ${suggestion.isUsed ? 'opacity-50' : ''}
        ${config.bgColor} border-gray-200
      `}
    >
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Confidence indicator */}
          <div className="flex items-center gap-1" title={`${Math.round(suggestion.confidence * 100)}% confidence`}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${confidenceColor}`}
                style={{ width: `${suggestion.confidence * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500">
              {Math.round(suggestion.confidence * 100)}%
            </span>
          </div>
          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        <p
          className={`
            text-sm text-gray-700
            ${!isExpanded && suggestion.content.length > 100 ? 'line-clamp-2' : ''}
          `}
        >
          {suggestion.content}
        </p>

        {/* Trigger context */}
        {isExpanded && suggestion.triggerContext && (
          <p className="mt-2 text-xs text-gray-500 italic">
            Triggered by: {suggestion.triggerContext}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {(suggestion.type === 'RESPONSE' || suggestion.type === 'QUESTION') && (
            <>
              <button
                onClick={handleCopy}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  bg-white border border-gray-200 text-gray-700
                  hover:bg-gray-50 transition-colors text-xs font-medium
                "
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  onUse();
                  handleCopy();
                }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  ${config.color} bg-white border border-current
                  hover:bg-gray-50 transition-colors text-xs font-medium
                `}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Use
              </button>
            </>
          )}
          {suggestion.type === 'ACTION' && (
            <button
              onClick={onUse}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-green-500 text-white
                hover:bg-green-600 transition-colors text-xs font-medium
              "
            >
              <Zap className="w-3.5 h-3.5" />
              Take Action
            </button>
          )}
        </div>
      </div>

      {/* Used indicator */}
      {suggestion.isUsed && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Used
          </span>
        </div>
      )}
    </div>
  );
}

export default AISuggestionsPanel;
