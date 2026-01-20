'use client';

import { useState } from 'react';
import {
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  Edit2,
  X,
  Loader2,
} from 'lucide-react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';
import type { AutoFillField, QuestionnaireSection, FieldConfidence } from '@/lib/agent-call-types';

interface QuestionnairePanelProps {
  className?: string;
}

export function QuestionnairePanel({ className = '' }: QuestionnairePanelProps) {
  const { state, updateField, confirmField } = useAgentCall();
  const { questionnaire, activeCall } = state;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['contact', 'address']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (!activeCall || activeCall.state === 'IDLE' || activeCall.state === 'ENDED') {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 h-full min-h-[500px] ${className}`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gray-300" />
              <h3 className="text-sm font-medium text-gray-400">Auto-Fill Questionnaire</h3>
            </div>
            <span className="text-xs text-gray-300">0% complete</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-200 w-0" />
          </div>
        </div>
        {/* Empty state content */}
        <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] p-6">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <ClipboardList className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Ready for data collection</p>
          <p className="text-xs text-gray-400 text-center max-w-[280px] mb-4">
            Start a call to collect and verify provider information with AI-assisted auto-fill
          </p>
          {/* Preview sections */}
          <div className="w-full max-w-[300px] space-y-2 mt-4">
            {['Contact Information', 'Practice Details', 'License & Credentials'].map((section, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-400">{section}</span>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header with overall progress */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-medium text-gray-900">Auto-Fill Questionnaire</h3>
          </div>
          <span className="text-xs text-gray-500">
            {questionnaire.overallCompletion}% complete
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${questionnaire.overallCompletion}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="max-h-[700px] overflow-y-auto">
        {questionnaire.sections.map((section) => (
          <SectionAccordion
            key={section.sectionId}
            section={section}
            isExpanded={expandedSections.has(section.sectionId)}
            onToggle={() => toggleSection(section.sectionId)}
            onUpdateField={updateField}
            onConfirmField={confirmField}
          />
        ))}
      </div>
    </div>
  );
}

interface SectionAccordionProps {
  section: QuestionnaireSection;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateField: (fieldId: string, value: string, isConfirmed?: boolean) => void;
  onConfirmField: (fieldId: string) => void;
}

function SectionAccordion({
  section,
  isExpanded,
  onToggle,
  onUpdateField,
  onConfirmField,
}: SectionAccordionProps) {
  const confirmedCount = section.fields.filter((f) => f.isConfirmed).length;

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Section header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-900">{section.sectionName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {confirmedCount}/{section.fields.length}
          </span>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${section.completionPercentage}%` }}
            />
          </div>
        </div>
      </button>

      {/* Section fields */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {section.fields.map((field) => (
            <AutoFillFieldComponent
              key={field.fieldId}
              field={field}
              onUpdate={(value, isConfirmed) => onUpdateField(field.fieldId, value, isConfirmed)}
              onConfirm={() => onConfirmField(field.fieldId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AutoFillFieldComponentProps {
  field: AutoFillField;
  onUpdate: (value: string, isConfirmed?: boolean) => void;
  onConfirm: () => void;
}

function AutoFillFieldComponent({ field, onUpdate, onConfirm }: AutoFillFieldComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.confirmedValue || field.aiSuggestedValue || field.originalValue || '');

  const handleSave = () => {
    onUpdate(editValue, true);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(field.confirmedValue || field.aiSuggestedValue || field.originalValue || '');
    setIsEditing(false);
  };

  const confidenceColors: Record<FieldConfidence, string> = {
    HIGH: 'bg-green-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-red-500',
    MANUAL: 'bg-blue-500',
  };

  const displayValue = field.confirmedValue || field.aiSuggestedValue || field.originalValue || '-';

  return (
    <div
      className={`
        p-3 rounded-lg border
        ${field.isConfirmed
          ? 'bg-green-50 border-green-200'
          : field.hasConflict
            ? 'bg-amber-50 border-amber-200'
            : 'bg-gray-50 border-gray-200'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Label and confidence */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">{field.fieldLabel}</label>
            {field.aiSuggestedValue && (
              <span
                className="flex items-center gap-1 text-[10px] text-violet-600"
                title={field.aiSource || 'AI suggested'}
              >
                <Sparkles className="w-3 h-3" />
                AI
              </span>
            )}
          </div>

          {/* Value display / edit */}
          {isEditing ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-900 mt-1">{displayValue}</p>
          )}

          {/* Conflict indicator */}
          {field.hasConflict && !field.isConfirmed && (
            <div className="mt-2 flex items-start gap-2 text-xs text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                Original: {field.originalValue || '-'}
                <br />
                AI suggests: {field.aiSuggestedValue}
              </span>
            </div>
          )}

          {/* AI source */}
          {field.aiSource && !isEditing && !field.isConfirmed && (
            <p className="mt-1 text-[10px] text-gray-400 italic">{field.aiSource}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Confidence badge */}
          <div
            className="flex items-center gap-1"
            title={`${Math.round(field.confidence * 100)}% confidence`}
          >
            <div
              className={`w-2 h-2 rounded-full ${confidenceColors[field.confidenceLevel]}`}
            />
          </div>

          {!isEditing && (
            <>
              {/* Edit button */}
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {/* Confirm button */}
              {!field.isConfirmed && (
                <button
                  onClick={onConfirm}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                  title="Confirm"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          {/* Confirmed indicator */}
          {field.isConfirmed && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
              <Check className="w-3 h-3" />
              Confirmed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionnairePanel;
