// ============================================================================
// QA Review - Display Component
// ============================================================================

'use client';

import React from 'react';
import {
  Download,
  Edit3,
  Check,
  X,
  Plus,
  AlertCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import { QAReview } from '@/lib/outreach-types';
import {
  QA_CRITERIA,
  TEAM_AVERAGES,
  getScoreColor,
  getScoreBgColor,
  getScoreRangeColor,
  getColorClasses,
} from './qa-review-types';

interface QAReviewDisplayProps {
  reviews: QAReview[];
  showTeamComparison: boolean;
  onEdit: (review: QAReview) => void;
  onExport: (review: QAReview) => void;
  onDelete?: (reviewId: string) => void;
}

export const QAReviewDisplay: React.FC<QAReviewDisplayProps> = ({
  reviews,
  showTeamComparison,
  onEdit,
  onExport,
  onDelete,
}) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <Check className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No QA Reviews Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Start reviewing this call to assess quality and provide feedback.
        </p>
      </div>
    );
  }

  return (
    <>
      {reviews.map((review) => {
        const scoreColor = getScoreRangeColor(review.overallScore);
        const scoreColorClasses = getColorClasses(scoreColor);

        return (
          <div key={review.reviewId} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Review Header */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${scoreColorClasses.bg} ring-2 ring-${scoreColor}-200`}>
                  <span className={`text-lg font-bold ${scoreColorClasses.valueColor}`}>
                    {review.overallScore}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {review.reviewedByName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(review.reviewedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  review.status === 'COMPLETED'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : review.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {review.status === 'COMPLETED' && <Check className="w-3 h-3" />}
                  {review.status === 'PENDING' && <Clock className="w-3 h-3" />}
                  {review.status.replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() => onExport(review)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Export Review"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(review)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Edit Review"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(review.reviewId)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Review Body */}
            <div className="p-4">
              {/* Criteria Scores with Team Comparison */}
              {review.criteriaScores.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                    <span>Criteria Scores</span>
                    {showTeamComparison && (
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                        vs Team Average
                      </span>
                    )}
                  </h5>
                  <div className="space-y-2">
                    {review.criteriaScores.map((criterion, i) => {
                      const teamAvg = TEAM_AVERAGES[QA_CRITERIA[i]?.id as keyof typeof TEAM_AVERAGES] || TEAM_AVERAGES.overall;
                      const isAbove = criterion.score > teamAvg;
                      const isBelow = criterion.score < teamAvg;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{criterion.criterion}</span>
                            <div className="flex items-center gap-2">
                              {showTeamComparison && (
                                <span className={`text-xs font-medium ${isAbove ? 'text-green-500' : isBelow ? 'text-red-400' : 'text-gray-400'}`}>
                                  {isAbove ? '↑' : isBelow ? '↓' : '='} {teamAvg}
                                </span>
                              )}
                              <span className={`text-xs font-bold ${getScoreColor(criterion.score * 10)}`}>
                                {criterion.score}/10
                              </span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getScoreBgColor(criterion.score * 10)}`}
                                style={{ width: `${criterion.score * 10}%` }}
                              />
                            </div>
                            {showTeamComparison && (
                              <div
                                className="absolute top-0 h-2 w-0.5 bg-gray-400 dark:bg-gray-500"
                                style={{ left: `${teamAvg * 10}%` }}
                                title={`Team average: ${teamAvg}`}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strengths & Improvements Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Strengths */}
                {review.strengths.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Strengths ({review.strengths.length})
                    </h5>
                    <ul className="space-y-1">
                      {review.strengths.map((strength, i) => (
                        <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                          <span className="text-green-500">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvement Areas */}
                {review.improvementAreas.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      To Improve ({review.improvementAreas.length})
                    </h5>
                    <ul className="space-y-1">
                      {review.improvementAreas.map((area, i) => (
                        <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                          <span className="text-yellow-500">•</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Items */}
              {review.actionItems && review.actionItems.length > 0 && (
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    Action Items ({review.actionItems.length})
                  </h5>
                  <ul className="space-y-1">
                    {review.actionItems.map((item, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                        <input type="checkbox" className="mt-0.5 w-3 h-3 text-violet-600 rounded" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Final Disposition */}
              {review.finalDisposition && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Final Disposition:</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    review.finalDisposition === 'PASS'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : review.finalDisposition === 'FAIL'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {review.finalDisposition === 'PASS' && <Check className="w-3.5 h-3.5" />}
                    {review.finalDisposition === 'FAIL' && <X className="w-3.5 h-3.5" />}
                    {review.finalDisposition === 'PASS' ? 'Passed' : review.finalDisposition === 'FAIL' ? 'Failed' : 'Needs Retraining'}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
