'use client';

import { useState } from 'react';
import {
  FileText,
  Send,
  Tag,
  Clock,
  Lock,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';
import type { CallNote } from '@/lib/agent-call-types';

interface CallNotesPanelProps {
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function CallNotesPanel({
  className = '',
  isExpanded: controlledExpanded,
  onToggleExpand,
}: CallNotesPanelProps) {
  const { state, setDraftNote, saveNote } = useAgentCall();
  const { callNotes, draftNote, activeCall } = state;

  const [isSaving, setIsSaving] = useState(false);
  const [internalExpanded, setInternalExpanded] = useState(true);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggleExpand = onToggleExpand || (() => setInternalExpanded(!internalExpanded));

  const handleSave = async () => {
    if (!draftNote.trim()) return;
    setIsSaving(true);
    await saveNote();
    setIsSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-medium text-gray-900">Call Notes</h3>
            {callNotes.length > 0 && (
              <span className="text-xs text-gray-500">({callNotes.length})</span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Note input */}
          {activeCall && activeCall.state !== 'IDLE' && activeCall.state !== 'ENDED' && (
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <textarea
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a note... (Ctrl+Enter to save)"
                  className="
                    w-full px-3 py-2.5 pr-12 text-sm
                    border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                    resize-none
                  "
                  rows={3}
                />
                <button
                  onClick={handleSave}
                  disabled={!draftNote.trim() || isSaving}
                  className="
                    absolute bottom-3 right-3 p-2 rounded-lg
                    bg-violet-500 text-white
                    hover:bg-violet-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notes list */}
          <div className="max-h-[300px] overflow-y-auto">
            {callNotes.length > 0 ? (
              callNotes.map((note) => (
                <NoteItem key={note.noteId} note={note} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                <FileText className="w-8 h-8" />
                <p className="text-sm">No notes yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface NoteItemProps {
  note: CallNote;
}

function NoteItem({ note }: NoteItemProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="px-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-gray-600">{note.createdBy}</span>
        <div className="flex items-center gap-2">
          {note.isPrivate && (
            <span title="Private note">
              <Lock className="w-3 h-3 text-gray-400" />
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(note.createdAt)}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default CallNotesPanel;
