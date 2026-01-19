// ============================================================================
// QA Review - Main Tab Component
// ============================================================================

'use client';

import React from 'react';
import { BarChart3, Clock, Plus } from 'lucide-react';
import { QAReview } from '@/lib/outreach-types';
import {
  QA_CRITERIA,
  TEAM_AVERAGES,
  QAReviewFormData,
  getScoreColor,
  calculateWeightedScore,
  getFlagById,
} from './qa-review-types';
import { QAReviewEditForm } from './qa-review-edit-form';
import { QAReviewDisplay } from './qa-review-display';

interface QAReviewTabProps {
  qaReviews: QAReview[];
  onSaveReview: (data: QAReviewFormData) => void;
  onExportReview: (review: QAReview) => void;
  onDeleteReview?: (reviewId: string) => void;
}

export const QAReviewTab: React.FC<QAReviewTabProps> = ({
  qaReviews,
  onSaveReview,
  onExportReview,
  onDeleteReview,
}) => {
  const [qaEditMode, setQaEditMode] = React.useState(false);
  const [selectedQaReview, setSelectedQaReview] = React.useState<QAReview | null>(null);
  const [qaFormData, setQaFormData] = React.useState<QAReviewFormData>({
    status: 'IN_PROGRESS',
    criteriaScores: QA_CRITERIA.map(c => ({ criterion: c.name, score: 8, weight: c.weight, comment: '' })),
    strengths: [],
    improvementAreas: [],
    actionItems: [],
  });
  const [showHistory, setShowHistory] = React.useState(false);
  const [showTeamComparison, setShowTeamComparison] = React.useState(false);

  const startNewReview = () => {
    setSelectedQaReview(null);
    setQaFormData({
      status: 'IN_PROGRESS',
      criteriaScores: QA_CRITERIA.map(c => ({ criterion: c.name, score: 8, weight: c.weight, comment: '' })),
      strengths: [],
      improvementAreas: [],
      actionItems: [],
    });
    setQaEditMode(true);
  };

  const editReview = (review: QAReview) => {
    setSelectedQaReview(review);
    setQaFormData({
      reviewId: review.reviewId, // Include review ID when editing
      status: review.status,
      criteriaScores: review.criteriaScores.map(s => ({ ...s, comment: s.notes || '' })),
      strengths: [...review.strengths],
      improvementAreas: [...review.improvementAreas],
      actionItems: review.actionItems ? [...review.actionItems] : [],
      finalDisposition: review.finalDisposition,
    });
    setQaEditMode(true);
  };

  const saveReview = () => {
    onSaveReview(qaFormData);
    setQaEditMode(false);
  };

  const cancelEdit = () => {
    setQaEditMode(false);
    setSelectedQaReview(null);
  };

  const exportReview = (review: QAReview) => {
    onExportReview(review);
  };

  return (
    <div className="space-y-4">
      {/* QA Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTeamComparison(!showTeamComparison)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              showTeamComparison
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Team Comparison
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              showHistory
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            Review History
          </button>
        </div>
        {!qaEditMode && (
          <button
            onClick={startNewReview}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Review
          </button>
        )}
      </div>

      {/* Edit Mode - Create/Edit QA Review */}
      {qaEditMode ? (
        <QAReviewEditForm
          formData={qaFormData}
          selectedReview={selectedQaReview}
          showTeamComparison={showTeamComparison}
          onUpdateFormData={setQaFormData}
          onCancel={cancelEdit}
          onSave={saveReview}
        />
      ) : (
        <>
          <QAReviewDisplay
            reviews={qaReviews}
            showTeamComparison={showTeamComparison}
            onEdit={editReview}
            onExport={exportReview}
            onDelete={onDeleteReview}
          />

          {/* Review History (when toggled) */}
          {showHistory && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Review History
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-violet-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">QA Review Created</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Today, 2:34 PM by Jennifer Martinez</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">Status changed to COMPLETED</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Today, 3:15 PM</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
