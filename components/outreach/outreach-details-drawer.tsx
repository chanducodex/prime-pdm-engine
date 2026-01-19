// ============================================================================
// Call Monitoring & QA - Details Drawer Component
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  OutreachTaskDetails,
  ExplainabilityBundle,
  AttemptOutcome,
  CallRecording,
  CallTranscript,
  CallAnalysis,
  QAReview,
} from '@/lib/outreach-types';
import { QAReviewTab } from '@/components/outreach/qa-review';
import {
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  HelpCircle,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Bot,
  PlayCircle,
  Pause,
} from 'lucide-react';
import { QAReviewFormData } from '@/components/outreach/qa-review/qa-review-types';

interface OutreachDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  details: OutreachTaskDetails | null;
  explainability: ExplainabilityBundle | null;
  isLoading: boolean;
  recordings?: CallRecording[];
  transcripts?: CallTranscript[];
  callAnalysis?: CallAnalysis[];
  qaReviews?: QAReview[];
  callId?: string;
  onSaveReview?: (data: QAReviewFormData & { callId: string; recordingId: string }) => void;
  onDeleteReview?: (reviewId: string) => void;
}

const ATTEMPT_OUTCOME_LABELS: Record<AttemptOutcome, string> = {
  VERIFIED_SUCCESS: 'Verified Success',
  VERIFIED_WITH_UPDATES: 'Verified with Updates',
  NO_ANSWER: 'No Answer',
  LEFT_VOICEMAIL: 'Left Voicemail',
  BUSY: 'Busy',
  WRONG_NUMBER: 'Wrong Number',
  CALL_BACK_REQUESTED: 'Call Back Requested',
  DECLINED_TO_VERIFY: 'Declined to Verify',
  OFFICE_CLOSED_TEMP: 'Office Closed (Temporary)',
  OFFICE_CLOSED_PERM: 'Office Closed (Permanent)',
  LANGUAGE_BARRIER: 'Language Barrier',
  NEEDS_SUPERVISOR: 'Needs Supervisor',
  PARTIAL_INFO: 'Partial Info',
  INCONSISTENT_INFO: 'Inconsistent Info',
};

type TabType = 'timeline' | 'recordings' | 'transcripts' | 'analysis' | 'qa' | 'explainability';

export const OutreachDetailsDrawer: React.FC<OutreachDetailsDrawerProps> = ({
  isOpen,
  onClose,
  details,
  explainability,
  isLoading,
  recordings = [],
  transcripts = [],
  callAnalysis = [],
  qaReviews = [],
  callId,
  onSaveReview,
  onDeleteReview,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  // Export review handler
  const handleExportReview = (review: QAReview) => {
    const report = {
      reportType: 'QA Review Report',
      generatedAt: new Date().toISOString(),
      callId: review.callId,
      review: review,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-review-${review.callId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'NEGATIVE':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    const iconProps = { className: "w-3 h-3" };
    switch (sentiment) {
      case 'POSITIVE':
        return <Smile {...iconProps} />;
      case 'NEGATIVE':
        return <Frown {...iconProps} />;
      default:
        return <Meh {...iconProps} />;
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const iconProps = { className: "w-3 h-3" };
    switch (emotion) {
      case 'joy':
        return <Laugh {...iconProps} />;
      case 'frustration':
        return <Angry {...iconProps} />;
      case 'confusion':
        return <HelpCircle {...iconProps} />;
      default:
        return <Meh {...iconProps} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Call Details
            </h2>
            {details && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {details.task.providerIdentifier} • {details.task.accountName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading details...</p>
            </div>
          ) : !details ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No details available</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto overflow-y-hidden">
                <nav className="flex -mb-px min-w-max">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'timeline'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setActiveTab('recordings')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'recordings'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Recordings
                    {recordings.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {recordings.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('transcripts')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'transcripts'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Transcripts
                    {transcripts.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {transcripts.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'analysis'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('qa')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'qa'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    QA Review
                    {qaReviews.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {qaReviews.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('explainability')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'explainability'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Info
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    {/* Task Info Cards */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-gradient-to-br from-violet-50 to-white dark:from-violet-900/20 dark:to-gray-800 rounded-lg p-3 border border-violet-100 dark:border-violet-800/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {details.task.status.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 rounded-lg p-3 border border-orange-100 dark:border-orange-800/30">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {details.task.priorityTier}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-center gap-2 mb-1">
                          <PlayCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Attempts</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {details.task.attemptSummary.totalAttempts}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 rounded-lg p-3 border border-red-100 dark:border-red-800/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Pause className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SLA Due</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {new Date(details.task.slaDueAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Activity Timeline */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Activity Timeline
                      </h3>

                      {/* Timeline with vertical line */}
                      <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                        <div className="space-y-4">
                          {/* Task Created */}
                          <div className="relative flex items-start gap-4 pl-10">
                            {/* Timeline dot */}
                            <div className="absolute left-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                              <PlayCircle className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Task Created</h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(details.task.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Cycle: {details.task.cycleName} • Provider: {details.task.providerIdentifier}
                              </p>
                            </div>
                          </div>

                          {/* Render Steps */}
                          {details.steps.map((step) => {
                            const isDone = step.status === 'DONE';
                            const isPending = step.status === 'PENDING';

                            return (
                              <div key={step.taskStepId} className="relative flex items-start gap-4 pl-10">
                                {/* Timeline dot */}
                                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  isDone
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : isPending
                                    ? 'bg-blue-100 dark:bg-blue-900/30'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  ) : isPending ? (
                                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                      Step {step.sequenceNo}
                                    </h4>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      isDone
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : isPending
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {step.status.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Method: {step.method.replace(/_/g, ' ')}
                                    {' • '} Attempts: {step.attemptsUsed}/{step.maxAttempts}
                                  </p>
                                </div>
                              </div>
                            );
                          })}

                          {/* Render Attempts */}
                          {details.attempts.map((attempt) => {
                            const isSuccess = attempt.outcomeCode === 'VERIFIED_SUCCESS' || attempt.outcomeCode === 'VERIFIED_WITH_UPDATES';
                            const isAiCall = attempt.method === 'AI_CALL';

                            return (
                              <div key={attempt.attemptId} className="relative flex items-start gap-4 pl-10">
                                {/* Timeline dot */}
                                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  isSuccess
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                                }`}>
                                  {isAiCall ? (
                                    <Bot className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                  ) : (
                                    <User className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                  )}
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {attempt.method.replace(/_/g, ' ')}
                                      </h4>
                                    </div>
                                    {attempt.outcomeCode && (
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        isSuccess
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                      }`}>
                                        {ATTEMPT_OUTCOME_LABELS[attempt.outcomeCode]}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    <span>{new Date(attempt.startedAt).toLocaleString()}</span>
                                    {attempt.endedAt && (
                                      <span>Duration: {Math.round((new Date(attempt.endedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000)} min</span>
                                    )}
                                    {attempt.agentId && (
                                      <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {attempt.agentId}
                                      </span>
                                    )}
                                  </div>
                                  {attempt.recordingId && (
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                        <PlayCircle className="w-3 h-3 mr-1" />
                                        Recording Available
                                      </span>
                                    </div>
                                  )}
                                  {attempt.notes && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                                      Note: {attempt.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Current Status */}
                          <div className="relative flex items-start gap-4 pl-10">
                            {/* Timeline dot */}
                            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              details.task.status === 'VERIFIED'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : details.task.status === 'BLOCKED' || details.task.status === 'ESCALATED'
                                ? 'bg-orange-100 dark:bg-orange-900/30'
                                : details.task.status === 'IN_PROGRESS' || details.task.status === 'READY'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              {details.task.status === 'VERIFIED' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : details.task.status === 'BLOCKED' || details.task.status === 'ESCALATED' ? (
                                <Pause className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              ) : details.task.status === 'IN_PROGRESS' || details.task.status === 'READY' ? (
                                <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/30">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Current Status</h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  details.task.status === 'VERIFIED'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : details.task.status === 'BLOCKED' || details.task.status === 'ESCALATED'
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                    : details.task.status === 'IN_PROGRESS' || details.task.status === 'READY'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}>
                                  {details.task.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              {details.task.nextEligibleAt && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Next eligible: {new Date(details.task.nextEligibleAt).toLocaleString()}
                                </p>
                              )}
                              {details.task.blockReason && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                  Blocked: {details.task.blockReason.replace(/_/g, ' ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recordings Tab */}
                {activeTab === 'recordings' && (
                  <div className="space-y-4">
                    {recordings.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">No recordings available</p>
                      </div>
                    ) : (
                      recordings.map((recording) => (
                        <div key={recording.recordingId} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  Call: {recording.callId}
                                </h4>
                                {recording.sentiment && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getSentimentColor(recording.sentiment)}`}>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      {getSentimentIcon(recording.sentiment)}
                                    </svg>
                                    {recording.sentiment}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(recording.createdAt).toLocaleString()} • {formatDuration(recording.durationSeconds)}
                              </p>
                              {recording.agentName && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Agent: {recording.agentName}
                                </p>
                              )}
                            </div>
                            <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {recording.fileFormat.toUpperCase()}
                            </span>
                          </div>

                          {/* Audio Player */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <audio controls className="w-full h-10" preload="metadata">
                              <source src={recording.audioUrl} type={`audio/${recording.fileFormat}`} />
                              Your browser does not support audio playback.
                            </audio>
                          </div>

                          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>Size: {(recording.fileSizeBytes / 1024).toFixed(0)} KB</span>
                            {recording.transcriptionId && (
                              <span className="text-blue-600 dark:text-blue-400">
                                ✓ Transcript Available
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Transcripts Tab */}
                {activeTab === 'transcripts' && (
                  <div className="space-y-4">
                    {transcripts.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">No transcripts available</p>
                      </div>
                    ) : (
                      transcripts.map((transcript) => (
                        <div key={transcript.transcriptId} className="space-y-4">
                          {/* Summary */}
                          {transcript.summary && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Summary
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {transcript.summary}
                              </p>
                            </div>
                          )}

                          {/* Key Topics */}
                          {transcript.keyTopics && transcript.keyTopics.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Key Topics
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {transcript.keyTopics.map((topic, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Transcript Segments - Chat Style */}
                          <div className="space-y-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            {transcript.segments.map((segment, i) => (
                              <div
                                key={segment.segmentId}
                                className={`flex ${segment.speaker === 'AGENT' || segment.speaker === 'AI_AGENT' ? 'justify-start' : 'justify-end'}`}
                              >
                                <div className={`max-w-[80%] ${
                                  segment.speaker === 'AGENT' || segment.speaker === 'AI_AGENT'
                                    ? 'bg-slate-700 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                } rounded-2xl px-4 py-2.5 shadow-sm`}>
                                  {/* Speaker Label */}
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold opacity-90">
                                      {segment.speaker === 'AI_AGENT' ? 'AI Assistant' : segment.speaker === 'AGENT' ? 'Agent' : 'Provider'}
                                    </span>
                                    <span className="text-xs opacity-70">
                                      {formatDuration(Math.floor(segment.startTime))}
                                    </span>
                                    {segment.sentiment && segment.speaker === 'PROVIDER' && (
                                      <span className="text-xs">
                                        {getSentimentIcon(segment.sentiment)}
                                      </span>
                                    )}
                                  </div>
                                  {/* Message */}
                                  <p className="text-sm leading-relaxed">
                                    {segment.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Confidence Score */}
                          {transcript.confidenceScore && (
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Transcript Confidence: {(transcript.confidenceScore * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                  <div className="space-y-4">
                    {callAnalysis.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">No analysis data available</p>
                      </div>
                    ) : (
                      callAnalysis.map((analysis) => (
                        <div key={analysis.callId} className="space-y-4">
                          {/* Overall Sentiment */}
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                              Overall Sentiment
                            </h4>
                            <div className="flex items-center gap-4">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                analysis.overallSentiment.label === 'POSITIVE'
                                  ? 'bg-green-100 dark:bg-green-900/30'
                                  : analysis.overallSentiment.label === 'NEGATIVE'
                                  ? 'bg-red-100 dark:bg-red-900/30'
                                  : 'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                <span className="text-2xl text-gray-700 dark:text-gray-300">
                                  {getSentimentIcon(analysis.overallSentiment.label)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {analysis.overallSentiment.label}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {(analysis.overallSentiment.score * 100).toFixed(0)}% confidence
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      analysis.overallSentiment.label === 'POSITIVE'
                                        ? 'bg-green-500'
                                        : analysis.overallSentiment.label === 'NEGATIVE'
                                        ? 'bg-red-500'
                                        : 'bg-gray-400'
                                    }`}
                                    style={{ width: `${Math.abs(analysis.overallSentiment.score) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Talk Time Ratio */}
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                              Talk Time Distribution
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Agent</span>
                                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: `${analysis.talkTimeRatio.agent}%` }}
                                  >
                                    <span className="text-xs text-white font-medium">{analysis.talkTimeRatio.agent}%</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Provider</span>
                                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-500 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: `${analysis.talkTimeRatio.provider}%` }}
                                  >
                                    <span className="text-xs text-white font-medium">{analysis.talkTimeRatio.provider}%</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Silence</span>
                                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gray-400 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: `${analysis.talkTimeRatio.silence}%` }}
                                  >
                                    <span className="text-xs text-white font-medium">{analysis.talkTimeRatio.silence}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Call Quality */}
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                              Call Quality
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Audio Clarity</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {(analysis.callQuality.audioClarity * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Speech Clarity</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {(analysis.callQuality.speechClarity * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Overall Score</p>
                                <p className={`text-lg font-semibold ${
                                  analysis.callQuality.overallScore >= 80 ? 'text-green-600' : analysis.callQuality.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {analysis.callQuality.overallScore}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                analysis.callQuality.backgroundNoise === 'LOW'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : analysis.callQuality.backgroundNoise === 'MEDIUM'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}>
                                Background Noise: {analysis.callQuality.backgroundNoise}
                              </span>
                            </div>
                          </div>

                          {/* Key Phrases */}
                          {analysis.keyPhrases.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                Key Phrases Detected
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {analysis.keyPhrases.map((phrase, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2.5 py-1 rounded text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                  >
                                    "{phrase}"
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Detected Emotions */}
                          {analysis.detectedEmotions.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                Detected Emotions
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {analysis.detectedEmotions.map((emotion, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                                  >
                                    <span>{getEmotionIcon(emotion.emotion)}</span>
                                    {emotion.emotion} ({(emotion.confidence * 100).toFixed(0)}%)
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* QA Review Tab */}
                {activeTab === 'qa' && (
                  <QAReviewTab
                    qaReviews={qaReviews}
                    onSaveReview={(data) => {
                      if (onSaveReview && callId) {
                        const firstRecording = recordings[0];
                        onSaveReview({
                          ...data,
                          callId,
                          recordingId: firstRecording?.recordingId || '',
                        });
                      }
                    }}
                    onExportReview={handleExportReview}
                    onDeleteReview={onDeleteReview}
                  />
                )}

                {/* Explainability Tab */}
                {activeTab === 'explainability' && explainability && (
                  <div className="space-y-6">
                    {/* Blocked Status */}
                    {explainability.blockedReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                              {explainability.blockedReason.code.replace(/_/g, ' ')}
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-400">{explainability.blockedReason.message}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Why Blocked */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Status Information
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{explainability.whyBlocked}</p>
                    </div>

                    {/* Recommendations */}
                    {explainability.recommendations.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {explainability.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
