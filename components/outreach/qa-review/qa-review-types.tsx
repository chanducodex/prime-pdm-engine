// ============================================================================
// QA Review - Shared Types and Constants
// ============================================================================

import { QAReview } from '@/lib/outreach-types';

// QA Criteria definition
export const QA_CRITERIA = [
  { id: 'opening', name: 'Opening & Greeting', description: 'Proper introduction, stated purpose of call', weight: 1 },
  { id: 'verification', name: 'Verification Accuracy', description: 'Correct verification of all required fields', weight: 1.5 },
  { id: 'professionalism', name: 'Professionalism', description: 'Tone, language, and demeanor', weight: 1.2 },
  { id: 'documentation', name: 'Documentation', description: 'Accurate and complete notes', weight: 1 },
  { id: 'compliance', name: 'Compliance', description: 'Followed script and regulations', weight: 1.5 },
  { id: 'closing', name: 'Closing', description: 'Proper call conclusion and next steps', weight: 0.8 },
  { id: 'soft_skills', name: 'Soft Skills', description: 'Active listening, empathy, rapport', weight: 1 },
] as const;

// Team average scores for comparison
export const TEAM_AVERAGES = {
  opening: 8.2,
  verification: 8.5,
  professionalism: 8.8,
  documentation: 8.0,
  compliance: 9.0,
  closing: 8.3,
  soft_skills: 8.1,
  overall: 8.4,
} as const;

// Flag categories
export const FLAG_CATEGORIES = [
  { id: 'critical', label: 'Critical Incident', color: 'red', icon: 'AlertOctagon' },
  { id: 'compliance', label: 'Compliance Issue', color: 'orange', icon: 'ShieldAlert' },
  { id: 'coaching', label: 'Needs Coaching', color: 'yellow', icon: 'GraduationCap' },
  { id: 'exemplar', label: 'Exemplar Call', color: 'green', icon: 'Star' },
  { id: 'escalation', label: 'Escalation Required', color: 'violet', icon: 'ArrowUpCircle' },
] as const;

// Types for QA editing state
export interface CriteriaScore {
  criterion: string;
  score: number;
  weight: number;
  comment?: string;
}

export interface QAReviewFormData {
  reviewId?: string; // Present when editing an existing review
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  criteriaScores: CriteriaScore[];
  strengths: string[];
  improvementAreas: string[];
  actionItems: string[];
  flag?: string;
  finalDisposition?: 'PASS' | 'FAIL' | 'NEEDS_RETRAINING';
  notes?: string;
}

// Helper functions
export const calculateWeightedScore = (scores: CriteriaScore[]): number => {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
  return Math.round((weightedSum / totalWeight) * 10) / 10;
};

export const getScoreColor = (score: number): string => {
  if (score >= 85) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 85) return 'bg-green-500';
  if (score >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getFlagById = (flagId?: string) => FLAG_CATEGORIES.find(f => f.id === flagId);

export const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; iconBg: string; iconColor: string; valueColor: string }> = {
    violet: { bg: 'from-violet-50 to-white', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', valueColor: 'text-violet-900' },
    yellow: { bg: 'from-yellow-50 to-white', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600', valueColor: 'text-yellow-900' },
    red: { bg: 'from-red-50 to-white', iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-900' },
    blue: { bg: 'from-blue-50 to-white', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-900' },
    green: { bg: 'from-green-50 to-white', iconBg: 'bg-green-100', iconColor: 'text-green-600', valueColor: 'text-green-900' },
    orange: { bg: 'from-orange-50 to-white', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', valueColor: 'text-orange-900' },
  };
  return colors[color] || colors.violet;
};

export const getScoreRangeColor = (score: number): 'green' | 'yellow' | 'red' => {
  if (score >= 85) return 'green';
  if (score >= 70) return 'yellow';
  return 'red';
};
