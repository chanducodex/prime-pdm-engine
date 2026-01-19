// ============================================================================
// Call Monitoring & QA - TypeScript Types
// Types for managing call monitoring, recordings, transcriptions, and QA
// ============================================================================

// ----------------------------------------------------------------------------
// RBAC Roles & Permissions
// ----------------------------------------------------------------------------

export type OutreachRole = 'MANAGER' | 'SUPERVISOR' | 'QA_LEAD' | 'READ_ONLY';

export interface OutreachPermissions {
  canReassign: boolean;
  canEscalate: boolean;
  canForceCallOutsideWindow: boolean;
  canChangeStrategy: boolean;
  canPauseValidation: boolean;
  canRetry: boolean;
  canSwitchMethod: boolean;
  canSendSelfService: boolean;
  canMarkUnreachable: boolean;
  canClosePartial: boolean;
  canViewExplainability: boolean;
  canAddNotes: boolean;
  canUpdateContactInfo: boolean;
}

export const ROLE_PERMISSIONS: Record<OutreachRole, OutreachPermissions> = {
  MANAGER: {
    canReassign: true,
    canEscalate: true,
    canForceCallOutsideWindow: false,
    canChangeStrategy: true,
    canPauseValidation: true,
    canRetry: true,
    canSwitchMethod: true,
    canSendSelfService: true,
    canMarkUnreachable: true,
    canClosePartial: true,
    canViewExplainability: true,
    canAddNotes: true,
    canUpdateContactInfo: true,
  },
  SUPERVISOR: {
    canReassign: true,
    canEscalate: true,
    canForceCallOutsideWindow: false,
    canChangeStrategy: false,
    canPauseValidation: false,
    canRetry: true,
    canSwitchMethod: false,
    canSendSelfService: true,
    canMarkUnreachable: false,
    canClosePartial: false,
    canViewExplainability: true,
    canAddNotes: true,
    canUpdateContactInfo: false,
  },
  QA_LEAD: {
    canReassign: false,
    canEscalate: false,
    canForceCallOutsideWindow: false,
    canChangeStrategy: false,
    canPauseValidation: false,
    canRetry: false,
    canSwitchMethod: false,
    canSendSelfService: false,
    canMarkUnreachable: false,
    canClosePartial: false,
    canViewExplainability: true,
    canAddNotes: true,
    canUpdateContactInfo: false,
  },
  READ_ONLY: {
    canReassign: false,
    canEscalate: false,
    canForceCallOutsideWindow: false,
    canChangeStrategy: false,
    canPauseValidation: false,
    canRetry: false,
    canSwitchMethod: false,
    canSendSelfService: false,
    canMarkUnreachable: false,
    canClosePartial: false,
    canViewExplainability: true,
    canAddNotes: false,
    canUpdateContactInfo: false,
  },
};

// ----------------------------------------------------------------------------
// Task State Machine
// ----------------------------------------------------------------------------

export type TaskStatus =
  | 'NEW'
  | 'PLANNED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'WAITING_COOLDOWN'
  | 'WAITING_TIME_WINDOW'
  | 'BLOCKED'
  | 'ESCALATED'
  | 'NEEDS_RESEARCH'
  | 'VERIFIED'
  | 'CLOSED_PARTIAL'
  | 'FAILED';

export type AttemptOutcome =
  | 'VERIFIED_SUCCESS'        // Provider data confirmed as correct
  | 'VERIFIED_WITH_UPDATES'   // Provider data updated with corrections
  | 'NO_ANSWER'               // No response from provider office
  | 'LEFT_VOICEMAIL'          // Voicemail left for callback
  | 'BUSY'                    // Line busy
  | 'WRONG_NUMBER'            // Contact number incorrect
  | 'CALL_BACK_REQUESTED'     // Provider requested callback
  | 'DECLINED_TO_VERIFY'      // Provider declined to participate
  | 'OFFICE_CLOSED_TEMP'      // Office temporarily closed
  | 'OFFICE_CLOSED_PERM'      // Office permanently closed
  | 'LANGUAGE_BARRIER'        // Language support needed
  | 'NEEDS_SUPERVISOR'        // Escalation required
  | 'PARTIAL_INFO'            // Some fields verified, others pending
  | 'INCONSISTENT_INFO';      // Data conflicts detected

export type BlockReason =
  | 'MISSING_PHONE'             // No phone number on file
  | 'MISSING_EMAIL'             // No email address on file
  | 'INVALID_CONTACT_INFO'      // Contact info format invalid
  | 'COOLDOWN_ACTIVE'           // Recent contact, waiting period
  | 'OUTSIDE_TIME_WINDOW'       // Outside business hours
  | 'NO_ELIGIBLE_METHODS'       // No valid contact method available
  | 'WAITING_PROVIDER_CALLBACK' // Awaiting provider response
  | 'NEEDS_RESEARCH'            // Manual research required
  | 'PENDING_NPI_VERIFICATION'  // NPI validation in progress
  | 'CONFIG_MISSING';           // System configuration issue

export type OutreachMethod = 'WEB' | 'AI_CALL' | 'HUMAN_CALL' | 'EMAIL' | 'SELF_SERVICE';

export type PriorityTier = 'P0' | 'P1' | 'P2';

// ----------------------------------------------------------------------------
// Filters
// ----------------------------------------------------------------------------

export interface OutreachFilters {
  accountId?: string;
  cycleId?: string;
  queueId?: string;
  method?: OutreachMethod;
  status?: TaskStatus;
  priorityTier?: PriorityTier;
  providerState?: string;
  slaDue?: 'next_4h' | 'next_24h' | 'overdue';
  lastUpdated?: 'stale_24h' | 'stale_48h' | 'stale_72h';
  attemptCountThreshold?: number;
  blockReason?: BlockReason;
  assignedAgent?: string;
  assignedTeam?: string;
  evidenceCompleteness?: 'missing' | 'ok';
}

// ----------------------------------------------------------------------------
// Summary KPIs
// ----------------------------------------------------------------------------

export interface OutreachSummary {
  totalOpenTasks: number;
  atRiskSlaCount: number;
  breachedSlaCount: number;
  contactRate: number;              // % providers successfully contacted
  verificationCompletionRate: number; // % providers with verified data
  avgAttemptsPerRecord: number;
  queueBacklogByMethod: Record<OutreachMethod, number>;
  topBlockReasons: Array<{ reason: BlockReason; count: number }>;
  pendingResearchCount: number;     // Tasks awaiting manual research
}

// ----------------------------------------------------------------------------
// Worklist Row Model
// ----------------------------------------------------------------------------

export interface OutreachTask {
  taskId: string;
  accountId: string;
  accountName: string;
  cycleId: string;
  cycleName: string;
  providerId: string;
  providerIdentifier: string; // masked display
  providerState: string;
  currentMethod: OutreachMethod;
  status: TaskStatus;
  priorityScore: number;
  priorityTier: PriorityTier;
  slaDueAt: string; // ISO timestamp
  assignedQueue?: string;
  assignedAgent?: string;
  attemptSummary: {
    aiAttempts: number;
    humanAttempts: number;
    totalAttempts: number;
    lastOutcome?: AttemptOutcome;
  };
  lastUpdatedAt: string; // ISO timestamp
  blockReason?: BlockReason;
  confidenceProgress?: {
    verifiedFields: number;
    totalFields: number;
    minConfidence: number;
  };
  nextEligibleAt?: string; // ISO timestamp
  nextEligibleStep?: OutreachMethod;
  strategyVersion: string;
  createdAt: string;
}

export interface OutreachTaskStep {
  taskStepId: string;
  taskId: string;
  sequenceNo: number;
  method: OutreachMethod;
  maxAttempts: number;
  attemptsUsed: number;
  cooldownMinutes: number;
  status: 'PENDING' | 'SKIPPED' | 'DONE';
  queueId?: string;
}

export interface OutreachAttempt {
  attemptId: string;
  taskId: string;
  taskStepId: string;
  method: OutreachMethod;
  startedAt: string; // ISO timestamp
  endedAt?: string; // ISO timestamp
  outcomeCode?: AttemptOutcome;
  notes?: string;
  agentId?: string;
  callId?: string;
  recordingId?: string;
  transcriptId?: string;
  evidenceRefs: string[];
  confidenceDelta?: Record<string, number>;
}

// ----------------------------------------------------------------------------
// Task Details
// ----------------------------------------------------------------------------

export interface OutreachTaskDetails {
  task: OutreachTask;
  steps: OutreachTaskStep[];
  attempts: OutreachAttempt[];
  dispositions: AttemptOutcome[];
  evidenceArtifacts: Array<{
    id: string;
    type: 'document' | 'recording' | 'transcript' | 'form';
    url: string;
    createdAt: string;
  }>;
  configVersion: {
    strategy: string;
    pack: string;
    rules: string;
  };
  nextEligibleSteps: Array<{
    method: OutreachMethod;
    eligibleAt: string;
    reason?: string;
  }>;
}

// ----------------------------------------------------------------------------
// Explainability
// ----------------------------------------------------------------------------

export interface ExplainabilityBundle {
  taskId: string;
  blockedReason?: {
    code: BlockReason;
    message: string;
    canOverride: boolean;
    overrideRole?: OutreachRole;
  };
  whyBlocked: string;
  whatAllowedNext: Array<{
    action: string;
    eligibleAt?: string;
    conditions?: string[];
  }>;
  attemptAnalysis: {
    totalAttempts: number;
    outcomesByMethod: Record<OutreachMethod, AttemptOutcome[]>;
    patterns: string[];
  };
  confidenceAnalysis: {
    verifiedFields: Array<{ field: string; confidence: number }>;
    lowConfidenceFields: Array<{ field: string; confidence: number; reason: string }>;
    overallProgress: number;
  };
  recommendations: string[];
  fatigueWarning?: {
    contactCount24h: number;
    maxAllowed24h: number;
    cooldownUntil: string;
  };
}

// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------

export interface ReassignAction {
  taskIds: string[];
  targetType: 'agent' | 'queue';
  targetId: string;
  reason: string;
}

export interface EscalateAction {
  taskIds: string[];
  targetQueue: 'supervisor' | 'research';
  reason: string;
}

export interface RetryAction {
  taskId: string;
  scheduledAt?: string; // ISO timestamp, optional for immediate
}

export interface SwitchMethodAction {
  taskId: string;
  fromMethod: OutreachMethod;
  toMethod: OutreachMethod;
  reason: string;
  override?: boolean; // manager override
}

export interface PauseAction {
  taskIds: string[];
  ttlMinutes: number;
  reason: string;
}

export interface SendSelfServiceAction {
  taskId: string;
}

export interface MarkUnreachableAction {
  taskId: string;
  reason: string;
  retryAfterDays?: number;
}

export interface ClosePartialAction {
  taskId: string;
  reason: string;
  evidenceSummary: string;
}

export interface ActionLog {
  logId: string;
  taskId: string;
  actor: string;
  actorRole: OutreachRole;
  actionType: string;
  timestamp: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  reason?: string;
  ttl?: number;
  metadata?: Record<string, unknown>;
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ----------------------------------------------------------------------------
// UI State Types
// ----------------------------------------------------------------------------

export interface OutreachTableState {
  selectedTaskIds: string[];
  sortColumn?: keyof OutreachTask;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// ----------------------------------------------------------------------------
// Call Recording & Transcription Types
// ----------------------------------------------------------------------------

export interface CallRecording {
  recordingId: string;
  attemptId: string;
  callId: string;
  durationSeconds: number;
  audioUrl: string;
  fileFormat: 'mp3' | 'wav' | 'webm';
  fileSizeBytes: number;
  createdAt: string;
  transcriptionId?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  agentId?: string;
  agentName?: string;
  phoneNumber?: string;
}

export interface CallTranscript {
  transcriptId: string;
  recordingId: string;
  callId: string;
  fullText: string;
  segments: TranscriptSegment[];
  summary?: string;
  keyTopics?: string[];
  createdAt: string;
  confidenceScore?: number;
}

export interface TranscriptSegment {
  segmentId: string;
  speaker: 'AGENT' | 'PROVIDER' | 'AI_AGENT';
  text: string;
  startTime: number; // seconds from start
  endTime: number; // seconds from start
  confidence?: number;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export interface CallAnalysis {
  callId: string;
  recordingId: string;
  overallSentiment: {
    score: number; // -1 to 1
    label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    confidence: number;
  };
  sentimentOverTime: Array<{
    timestamp: number; // seconds
    score: number;
    label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }>;
  keyPhrases: string[];
  detectedEmotions: Array<{
    emotion: string;
    confidence: number;
    timestamp?: number;
  }>;
  callQuality: {
    audioClarity: number; // 0-1
    speechClarity: number; // 0-1
    backgroundNoise: 'LOW' | 'MEDIUM' | 'HIGH';
    overallScore: number; // 0-100
  };
  interruptions: Array<{
    timestamp: number;
    speaker: 'AGENT' | 'PROVIDER' | 'AI_AGENT';
  }>;
  talkTimeRatio: {
    agent: number; // percentage
    provider: number; // percentage
    silence: number; // percentage
  };
}

export interface QAReview {
  reviewId: string;
  callId: string;
  recordingId: string;
  reviewedBy: string;
  reviewedByName: string;
  reviewedAt: string;
  overallScore: number; // 0-100
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  criteriaScores: Array<{
    criterion: string;
    score: number; // 0-10
    weight: number;
    notes?: string;
  }>;
  strengths: string[];
  improvementAreas: string[];
  actionItems?: string[];
  finalDisposition?: 'PASS' | 'FAIL' | 'NEEDS_RETRAINING';
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  team?: string;
  totalCalls: number;
  avgCallDuration: number; // seconds
  avgSentimentScore: number; // -1 to 1
  completionRate: number; // percentage
  qaScore?: number; // 0-100
  topPerformingAreas: string[];
  developmentAreas: string[];
}
