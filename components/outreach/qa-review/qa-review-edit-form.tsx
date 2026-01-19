// ============================================================================
// QA Review - Edit Form Component
// ============================================================================

'use client';

import React from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';
import {
  QA_CRITERIA,
  TEAM_AVERAGES,
  FLAG_CATEGORIES,
  QAReviewFormData,
  CriteriaScore,
  calculateWeightedScore,
  getScoreColor,
  getColorClasses,
} from './qa-review-types';

interface QAReviewEditFormProps {
  formData: QAReviewFormData;
  selectedReview: QAReview | null;
  showTeamComparison: boolean;
  onUpdateFormData: (data: QAReviewFormData) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const QAReviewEditForm: React.FC<QAReviewEditFormProps> = ({
  formData,
  selectedReview,
  showTeamComparison,
  onUpdateFormData,
  onCancel,
  onSave,
}) => {
  const updateCriteriaScore = (index: number, score: number) => {
    const newScores = [...formData.criteriaScores];
    newScores[index].score = score;
    onUpdateFormData({ ...formData, criteriaScores: newScores });
  };

  const updateCriteriaComment = (index: number, comment: string) => {
    const newScores = [...formData.criteriaScores];
    newScores[index].comment = comment;
    onUpdateFormData({ ...formData, criteriaScores: newScores });
  };

  const addCriterion = (type: 'strengths' | 'improvementAreas' | 'actionItems', value: string) => {
    if (value.trim()) {
      onUpdateFormData({
        ...formData,
        [type]: [...formData[type], value.trim()],
      });
    }
  };

  const removeCriterion = (type: 'strengths' | 'improvementAreas' | 'actionItems', index: number) => {
    const newList = [...formData[type]];
    newList.splice(index, 1);
    onUpdateFormData({ ...formData, [type]: newList });
  };

  const getFlagButtonClass = (flagId?: string, currentFlag?: string) => {
    if (!flagId && !currentFlag) {
      return 'bg-slate-600 text-white';
    }
    if (flagId && currentFlag === flagId) {
      const flag = FLAG_CATEGORIES.find(f => f.id === flagId);
      const color = flag?.color || 'violet';
      return `ring-2 ring-offset-1 ring-${color}-500 bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300`;
    }
    return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
  };

  const getDispositionClass = (value: string) => {
    const isSelected = formData.finalDisposition === value;
    if (value === 'PASS') {
      return isSelected
        ? 'ring-2 ring-offset-1 ring-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
    if (value === 'NEEDS_RETRAINING') {
      return isSelected
        ? 'ring-2 ring-offset-1 ring-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
    return isSelected
      ? 'ring-2 ring-offset-1 ring-red-500 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
  };

  const getStatusClass = (status: string) => {
    if (status === 'PENDING') {
      return formData.status === 'PENDING'
        ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
    return formData.status === 'COMPLETED'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedReview ? 'Edit QA Review' : 'Create QA Review'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Call Flags */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Flag This Call
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdateFormData({ ...formData, flag: undefined })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${getFlagButtonClass()}`}
          >
            No Flag
          </button>
          {FLAG_CATEGORIES.map((flag) => (
            <button
              key={flag.id}
              onClick={() => onUpdateFormData({ ...formData, flag: flag.id })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${getFlagButtonClass(flag.id, formData.flag)}`}
            >
              <span className="capitalize">{flag.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Criteria Scoring */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Score Criteria (1-10)
        </h4>
        <div className="space-y-3">
          {formData.criteriaScores.map((criteria, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {criteria.criterion}
                    </span>
                    {showTeamComparison && QA_CRITERIA[idx] && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (Team avg: {TEAM_AVERAGES[QA_CRITERIA[idx].id as keyof typeof TEAM_AVERAGES]})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {QA_CRITERIA[idx]?.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={criteria.score}
                    onChange={(e) => updateCriteriaScore(idx, parseInt(e.target.value))}
                    className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <span className={`w-8 text-center text-sm font-bold ${getScoreColor(criteria.score)}`}>
                    {criteria.score}
                  </span>
                </div>
              </div>
              <textarea
                placeholder="Add comments for this criteria..."
                value={criteria.comment || ''}
                onChange={(e) => updateCriteriaComment(idx, e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                rows={1}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Calculated Score Preview */}
      <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Calculated Weighted Score
          </span>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${getScoreColor(calculateWeightedScore(formData.criteriaScores))}`}>
              {calculateWeightedScore(formData.criteriaScores)}
            </span>
            {showTeamComparison && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                vs Team avg: {TEAM_AVERAGES.overall}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Strengths
        </h4>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add a strength..."
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addCriterion('strengths', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              addCriterion('strengths', input.value);
              input.value = '';
            }}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="space-y-1">
          {formData.strengths.map((strength, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 rounded px-2 py-1">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">{strength}</span>
              <button
                onClick={() => removeCriterion('strengths', idx)}
                className="text-gray-400 hover:text-red-500"
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Areas */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Areas for Improvement
        </h4>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add an improvement area..."
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addCriterion('improvementAreas', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              addCriterion('improvementAreas', input.value);
              input.value = '';
            }}
            className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="space-y-1">
          {formData.improvementAreas.map((area, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded px-2 py-1">
              <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">{area}</span>
              <button
                onClick={() => removeCriterion('improvementAreas', idx)}
                className="text-gray-400 hover:text-red-500"
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Action Items
        </h4>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add an action item..."
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addCriterion('actionItems', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              addCriterion('actionItems', input.value);
              input.value = '';
            }}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="space-y-1">
          {formData.actionItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
              <Plus className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">{item}</span>
              <button
                onClick={() => removeCriterion('actionItems', idx)}
                className="text-gray-400 hover:text-red-500"
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Final Disposition */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Final Disposition
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateFormData({ ...formData, finalDisposition: 'PASS' })}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${getDispositionClass('PASS')}`}
          >
            <Check className="w-4 h-4 inline mr-1" /> Pass
          </button>
          <button
            onClick={() => onUpdateFormData({ ...formData, finalDisposition: 'NEEDS_RETRAINING' })}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${getDispositionClass('NEEDS_RETRAINING')}`}
          >
            Needs Training
          </button>
          <button
            onClick={() => onUpdateFormData({ ...formData, finalDisposition: 'FAIL' })}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${getDispositionClass('FAIL')}`}
          >
            <X className="w-4 h-4 inline mr-1" /> Fail
          </button>
        </div>
      </div>

      {/* Review Notes */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => onUpdateFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional notes or comments..."
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateFormData({ ...formData, status: 'PENDING' })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${getStatusClass('PENDING')}`}
          >
            Save as Draft
          </button>
          <button
            onClick={() => onUpdateFormData({ ...formData, status: 'COMPLETED' })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${getStatusClass('COMPLETED')}`}
          >
            Mark Complete
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            Save Review
          </button>
        </div>
      </div>
    </div>
  );
};
