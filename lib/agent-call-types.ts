// ============================================================================
// Agent Call Center - TypeScript Types
// Types for managing live call center agent interactions
// ============================================================================

import type { AgentStatus } from './outreach-queue-types';
import type { TranscriptSegment, PriorityTier } from './outreach-types';

// ----------------------------------------------------------------------------
// Call State Machine
// ----------------------------------------------------------------------------

export type CallState =
  | 'IDLE'           // No active call
  | 'INCOMING'       // Incoming call ringing
  | 'OUTGOING'       // Outgoing call ringing
  | 'CONNECTING'     // Call connecting
  | 'IN_CALL'        // Active call
  | 'ON_HOLD'        // Call on hold
  | 'TRANSFERRING'   // Transfer in progress
  | 'WRAP_UP'        // Post-call wrap-up
  | 'ENDED';         // Call ended

export type CallDirection = 'INBOUND' | 'OUTBOUND';

// ----------------------------------------------------------------------------
// Active Call Information
// ----------------------------------------------------------------------------

export interface ActiveCall {
  callId: string;
  direction: CallDirection;
  state: CallState;
  startedAt: string;           // ISO timestamp
  connectedAt?: string;        // When call was answered
  endedAt?: string;

  // Caller/Provider Info
  phoneNumber: string;
  callerName?: string;
  organization?: string;

  // Related entities
  taskId?: string;
  providerId?: string;
  queueId?: string;

  // Call features
  isMuted: boolean;
  isOnHold: boolean;
  holdStartedAt?: string;

  // Recording
  isRecording: boolean;
  recordingId?: string;
}

// ----------------------------------------------------------------------------
// Caller/Provider Lookup Result
// ----------------------------------------------------------------------------

export type LookupStatus = 'FOUND' | 'NOT_FOUND' | 'LOADING' | 'ERROR';
export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED';

export interface CallerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CallerInfo {
  phoneNumber: string;
  lookupStatus: LookupStatus;

  // Provider details (if found)
  providerId?: string;
  providerName?: string;
  providerNPI?: string;
  organization?: string;
  specialty?: string;

  // Contact details
  primaryPhone?: string;
  alternatePhone?: string;
  email?: string;
  fax?: string;

  // Address
  address?: CallerAddress;

  // SLA & Priority
  priorityTier?: PriorityTier;
  slaStatus?: SlaStatus;
  slaDueAt?: string;

  // History
  totalPreviousCalls: number;
  lastContactAt?: string;
  assignedAgent?: string;

  // Tags
  tags?: string[];
  notes?: string;
}

// ----------------------------------------------------------------------------
// Interaction History
// ----------------------------------------------------------------------------

export type InteractionType = 'CALL' | 'EMAIL' | 'SMS' | 'NOTE' | 'TASK_UPDATE' | 'VOICEMAIL';

export interface InteractionHistoryItem {
  interactionId: string;
  type: InteractionType;
  timestamp: string;
  summary: string;
  duration?: number;         // For calls, in seconds
  outcome?: string;
  agentName?: string;
  notes?: string;
}

// ----------------------------------------------------------------------------
// Case / Ticket Types
// ----------------------------------------------------------------------------

export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Case {
  caseId: string;
  title: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  description?: string;
}

// ----------------------------------------------------------------------------
// Live Transcription
// ----------------------------------------------------------------------------

export interface LiveTranscriptSegment extends TranscriptSegment {
  isLive: boolean;           // Currently being spoken
  isFinal: boolean;          // Finalized transcript
}

export interface LiveTranscription {
  callId: string;
  segments: LiveTranscriptSegment[];
  lastUpdatedAt: string;
  isProcessing: boolean;
}

// ----------------------------------------------------------------------------
// AI Suggestions
// ----------------------------------------------------------------------------

export type SuggestionType =
  | 'RESPONSE'        // Suggested response text
  | 'QUESTION'        // Question to ask
  | 'ACTION'          // Recommended action
  | 'INFO'            // Contextual information
  | 'WARNING';        // Alert/warning

export interface AISuggestion {
  suggestionId: string;
  type: SuggestionType;
  content: string;
  confidence: number;         // 0-1
  triggerContext?: string;    // What triggered this suggestion
  timestamp: string;
  isExpanded: boolean;
  isUsed: boolean;           // Agent used this suggestion
}

export interface AISuggestionsState {
  callId: string;
  suggestions: AISuggestion[];
  isLoading: boolean;
  viewMode: 'CONDENSED' | 'EXPANDED';
  lastUpdatedAt: string;
}

// ----------------------------------------------------------------------------
// Auto-Fill / Questionnaire
// ----------------------------------------------------------------------------

export type FieldConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'MANUAL';

export interface AutoFillField {
  fieldId: string;
  fieldName: string;
  fieldLabel: string;
  category: string;           // E.g., "Contact Info", "Practice Details"

  // Values
  originalValue?: string;     // Original value from database
  aiSuggestedValue?: string;  // AI-suggested value from call
  confirmedValue?: string;    // Agent-confirmed value

  // Confidence
  confidence: number;         // 0-1
  confidenceLevel: FieldConfidence;
  aiSource?: string;          // How AI determined this value

  // State
  isEditing: boolean;
  isConfirmed: boolean;
  hasConflict: boolean;       // AI value differs from original

  // Metadata
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}

export interface QuestionnaireSection {
  sectionId: string;
  sectionName: string;
  fields: AutoFillField[];
  completionPercentage: number;
}

export interface QuestionnaireState {
  callId: string;
  taskId?: string;
  sections: QuestionnaireSection[];
  overallCompletion: number;
  lastSyncedAt: string;
}

// ----------------------------------------------------------------------------
// Quick Actions
// ----------------------------------------------------------------------------

export type QuickActionType =
  | 'SEND_SMS'
  | 'CREATE_TASK'
  | 'SCHEDULE_CALLBACK'
  | 'OPEN_CRM'
  | 'SEND_EMAIL'
  | 'TRANSFER_CALL'
  | 'ADD_NOTE';

export interface QuickAction {
  actionType: QuickActionType;
  label: string;
  icon: string;              // Icon name
  shortcut?: string;         // Keyboard shortcut
  isEnabled: boolean;
  requiresConfirmation: boolean;
}

// ----------------------------------------------------------------------------
// Call Notes
// ----------------------------------------------------------------------------

export interface CallNote {
  noteId: string;
  callId: string;
  content: string;
  createdAt: string;
  createdBy: string;
  tags?: string[];
  isPrivate: boolean;
}

// ----------------------------------------------------------------------------
// Call History Entry
// ----------------------------------------------------------------------------

export interface CallHistoryEntry {
  callId: string;
  direction: CallDirection;
  phoneNumber: string;
  callerName?: string;
  startedAt: string;
  endedAt: string;
  duration: number;          // seconds
  outcome: string;
  agentName: string;
  hasRecording: boolean;
  hasTranscript: boolean;
  notes?: string;
}

// ----------------------------------------------------------------------------
// Agent Call Screen State
// ----------------------------------------------------------------------------

export interface AgentCallScreenState {
  // Current call
  activeCall: ActiveCall | null;

  // Agent status
  agentStatus: AgentStatus['status'];

  // Caller information
  callerInfo: CallerInfo | null;
  interactionHistory: InteractionHistoryItem[];
  cases: Case[];

  // Transcription
  transcription: LiveTranscription | null;

  // AI
  aiSuggestions: AISuggestionsState | null;

  // Questionnaire
  questionnaire: QuestionnaireState | null;

  // Notes
  callNotes: CallNote[];

  // Call History
  callHistory: CallHistoryEntry[];

  // UI State
  activeTab: 'contact' | 'history' | 'tickets';
  isPanelCollapsed: Record<string, boolean>;

  // Timer
  elapsedSeconds: number;
  holdElapsedSeconds: number;
}

// ----------------------------------------------------------------------------
// Call Control Actions
// ----------------------------------------------------------------------------

export interface CallControlActions {
  answerCall: () => Promise<void>;
  hangUp: () => Promise<void>;
  toggleHold: () => Promise<void>;
  toggleMute: () => Promise<void>;
  transfer: (targetNumber: string) => Promise<void>;
  sendDTMF: (digit: string) => Promise<void>;
}

// ----------------------------------------------------------------------------
// API Request/Response Types
// ----------------------------------------------------------------------------

export interface LookupCallerRequest {
  phoneNumber: string;
  callId?: string;
}

export interface LookupCallerResponse {
  success: boolean;
  data?: CallerInfo;
  error?: string;
}

export interface SaveCallNotesRequest {
  callId: string;
  notes: string;
  tags?: string[];
}

export interface UpdateQuestionnaireFieldRequest {
  callId: string;
  fieldId: string;
  value: string;
  isConfirmed: boolean;
}

export interface ScheduleCallbackRequest {
  phoneNumber: string;
  providerId?: string;
  scheduledAt: string;
  notes?: string;
}

export interface SendSMSRequest {
  phoneNumber: string;
  message: string;
  providerId?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: CasePriority;
  providerId?: string;
  dueAt?: string;
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ----------------------------------------------------------------------------
// Call Quality Metrics
// ----------------------------------------------------------------------------

export type ConnectionStability = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface CallQualityMetrics {
  audioQualityScore: number;
  networkLatency: number;
  packetLoss: number;
  jitter: number;
  connectionStability: ConnectionStability;
  timestamp: string;
}

// ----------------------------------------------------------------------------
// Sentiment Analysis
// ----------------------------------------------------------------------------

export type SentimentTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';

export interface SentimentTimelinePoint {
  timestamp: number;
  score: number;
  speaker: 'AGENT' | 'PROVIDER';
}

export interface SentimentTrigger {
  text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE';
  timestamp: number;
}

export interface SentimentData {
  overallScore: number;
  trend: SentimentTrend;
  timeline: SentimentTimelinePoint[];
  triggers: SentimentTrigger[];
}

// ----------------------------------------------------------------------------
// Quick Scripts
// ----------------------------------------------------------------------------

export type ScriptCategory = 'GREETING' | 'COMPLIANCE' | 'VERIFICATION' | 'PROBLEM' | 'CLOSING' | 'ESCALATION';

export interface Script {
  scriptId: string;
  category: ScriptCategory;
  title: string;
  content: string;
  variables: string[];
  shortcut?: string;
  isFavorite: boolean;
  usageCount: number;
}

// ----------------------------------------------------------------------------
// Recording State
// ----------------------------------------------------------------------------

export interface RecordingMarker {
  timestamp: number;
  label: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  startedAt?: string;
  duration: number;
  markers: RecordingMarker[];
  complianceDisclaimerPlayed: boolean;
  recordingId?: string;
}

// ----------------------------------------------------------------------------
// Escalation
// ----------------------------------------------------------------------------

export type SupervisorStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export type EscalationLevel = 'P1' | 'P2' | 'P3' | 'P4';

export interface Supervisor {
  id: string;
  name: string;
  status: SupervisorStatus;
  currentCalls: number;
  avatar?: string;
}

export interface EscalationState {
  availableSupervisors: Supervisor[];
  selectedSupervisor?: string;
  escalationLevel: EscalationLevel;
  reason: string;
  notes: string;
  isBeingMonitored: boolean;
  monitoringSupervisor?: string;
}

// ----------------------------------------------------------------------------
// Performance Metrics
// ----------------------------------------------------------------------------

export interface AgentPerformanceMetrics {
  callsHandledToday: number;
  averageHandleTime: number;
  firstCallResolutionRate: number;
  customerSatisfactionScore: number;
  targetGoals: {
    callsTarget: number;
    ahtTarget: number;
    fcrTarget: number;
    csatTarget: number;
  };
}

// ----------------------------------------------------------------------------
// Knowledge Base
// ----------------------------------------------------------------------------

export interface KBArticle {
  articleId: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  relevanceScore?: number;
  lastUpdated: string;
  viewCount: number;
}

// ----------------------------------------------------------------------------
// Callback Scheduling
// ----------------------------------------------------------------------------

export type CallbackPriority = 'NORMAL' | 'HIGH' | 'URGENT';

export interface CallbackSchedule {
  callbackId: string;
  scheduledAt: string;
  timezone: string;
  phoneNumber: string;
  providerId?: string;
  providerName?: string;
  reason: string;
  priority: CallbackPriority;
  reminderEnabled: boolean;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
}

// ----------------------------------------------------------------------------
// Multi-Channel Support
// ----------------------------------------------------------------------------

export type ChannelType = 'VOICE' | 'EMAIL' | 'CHAT' | 'SMS';

export interface ChannelQueue {
  count: number;
  priority: number;
  oldestItemAge?: number;
}

export interface ChannelQueues {
  email: ChannelQueue;
  chat: ChannelQueue;
  sms: ChannelQueue;
  callback: ChannelQueue;
}
