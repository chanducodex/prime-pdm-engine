// ============================================================================
// Validation Campaign Management - TypeScript Types
// Types for managing provider data validation campaigns
// ============================================================================

import { OutreachMethod, PriorityTier } from './outreach-types';

// ----------------------------------------------------------------------------
// Validation Campaign Management Types
// ----------------------------------------------------------------------------

export interface OutreachQueue {
  queueId: string;
  queueName: string;
  description?: string;
  queueType: 'CAMPAIGN' | 'TEAM' | 'OVERFLOW' | 'SPECIAL_PROJECT';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT';
  accountId: string;
  accountName: string;
  cycleId: string;
  cycleName: string;
  priorityTier?: PriorityTier;

  // Campaign Configuration
  config: {
    primaryMethod: OutreachMethod;
    strategyVersion: string;
    maxAttempts: number;
    cooldownMinutes: number;
    slaHours: number;
    callWindowStart?: string;
    callWindowEnd?: string;
    startTime?: string;
    notes?: string;

    // Report Automation
    reportAutomation?: ReportAutomationConfig;

    // QA & Call Monitoring Integration
    qaIntegration?: QAIntegrationConfig;
    callRecording?: CallRecordingConfig;

    // Performance Monitoring & Coaching
    performanceMonitoring?: PerformanceMonitoringConfig;
  };

  // Queue Statistics
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    blockedTasks: number;
    verifiedTasks: number;
    contactRate: number;
    verificationRate: number;
    avgAttemptsPerTask: number;
  };

  // Priority Distribution
  priorityDistribution: {
    p0: number;
    p1: number;
    p2: number;
  };

  // SLA Tracking
  slaTracking: {
    onTrack: number;
    atRisk: number;
    breached: number;
  };

  // Assignment
  assignedAgents: number;
  assignedAgentNames: string[];
  assignedQueues: string[];
  assignedQueue?: string;

  // Timestamps
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  lastUpdatedAt: string;
}

// ----------------------------------------------------------------------------
// Validation Coordinator Types
// ----------------------------------------------------------------------------

export interface AgentStatus {
  agentId: string;
  agentName: string;
  status: 'ONLINE' | 'ON_CALL' | 'AWAY' | 'OFFLINE' | 'ON_BREAK';
  currentQueue?: string;
  currentTask?: string;

  // Performance Metrics
  stats: {
    tasksCompleted: number;
    tasksInProgress: number;
    avgHandleTime: number; // in minutes
    contactRate: number;
    verificationRate: number;
    totalCalls: number;
    successfulContacts: number;
  };

  // Current Session
  session?: {
    loginTime: string;
    tasksAssigned: number;
    onCallDuration?: number; // in seconds
  };

  // Capacity
  capacity: {
    maxConcurrentTasks: number;
    currentTasks: number;
    availability: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  };

  lastUpdatedAt: string;
}

// ----------------------------------------------------------------------------
// Campaign Health Metrics
// ----------------------------------------------------------------------------

export interface QueueHealth {
  queueId: string;
  healthScore: number; // 0-100

  // Health Indicators
  indicators: {
    slaBreachRate: number; // % of tasks overdue
    blockageRate: number; // % of blocked tasks
    velocity: number; // tasks completed per hour
    agentUtilization: number; // % of agent capacity used
    queueAge: number; // average age in hours
  };

  // Trends
  trends: {
    completionRate: 'IMPROVING' | 'STABLE' | 'DECLINING';
    slaPerformance: 'IMPROVING' | 'STABLE' | 'DECLINING';
    backlogTrend: 'GROWING' | 'STABLE' | 'SHRINKING';
  };

  calculatedAt: string;
}

// ----------------------------------------------------------------------------
// Campaign Monitoring Dashboard
// ----------------------------------------------------------------------------

export interface QueueMonitoringDashboard {
  // Summary Stats
  summary: {
    totalActiveQueues: number;
    totalActiveAgents: number;
    totalTasksInSystem: number;
    tasksCompletedToday: number;
    overallContactRate: number;
    overallVerificationRate: number;
  };

  // Lists
  queues: OutreachQueue[];
  agents: AgentStatus[];
  healthScores: QueueHealth[];

  // Alerts
  alerts: QueueAlert[];

  lastUpdatedAt: string;
}

// ----------------------------------------------------------------------------
// Queue Alerts
// ----------------------------------------------------------------------------

export interface QueueAlert {
  alertId: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  type: 'SLA_BREACH' | 'HIGH_BLOCKAGE' | 'AGENT_SHORTAGE' | 'QUEUE_BACKLOG' | 'VELOCITY_DROP';
  title: string;
  message: string;
  affectedQueueId?: string;
  affectedAgentId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
}

// ----------------------------------------------------------------------------
// Validation Campaign Creation
// ----------------------------------------------------------------------------

export interface CampaignCreationSource {
  sourceType: 'DATA_IMPORT' | 'EXISTING_QUEUE' | 'MANUAL';
  sourceData?: {
    importedProviderCount?: number;
    sourceQueueId?: string;
  };

  // Pre-loaded providers ready for validation
  providers: Array<{
    providerId: string;
    providerIdentifier: string;  // NPI or masked identifier
    providerState: string;
    accountName: string;         // Payer/client name
    dataQuality: 'COMPLETE' | 'PARTIAL' | 'MINIMAL';
  }>;
}

export interface ReportAutomationConfig {
  enabled: boolean;
  schedule: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_COMPLETION';
  recipients?: string[];       // Email addresses for report delivery
  format: 'PDF' | 'CSV' | 'EXCEL' | 'DASHBOARD_LINK';
  includeKPIs: boolean;
  includeAgentPerformance: boolean;
  includeQASummary: boolean;
}

export interface QAIntegrationConfig {
  enabled: boolean;
  samplingRate: number;        // Percentage of calls to QA review (0-100)
  requiredQAScoreThreshold?: number; // Minimum QA score for campaign (0-100)
  assignedQAReviewers?: string[];    // QA leads/reviewers
  autoFlagLowScore: boolean;   // Auto-flag calls below threshold
  flagThreshold: number;       // Score threshold for auto-flagging (0-100)
}

export interface CallRecordingConfig {
  enabled: boolean;
  transcriptionEnabled: boolean;
  sentimentAnalysisEnabled: boolean;
  retentionDays: number;
  recordAllCalls: boolean;
  recordSampledOnly: boolean;  // If false, records based on sampling rate
}

export interface TestingModeConfig {
  isTestMode: boolean;
  stagedRolloutPercentage?: number; // 0-100, for gradual rollout
  dryRun: boolean;             // Validate without actual execution
  smokeTest: boolean;          // Enable smoke testing mode
}

export interface PerformanceMonitoringConfig {
  enabled: boolean;
  coachingTriggersEnabled: boolean;
  performanceThreshold: {
    contactRateMin?: number;   // Min acceptable contact rate %
    verificationRateMin?: number; // Min acceptable verification rate %
    slaBreachMax?: number;     // Max acceptable SLA breach rate %
    qaScoreMin?: number;       // Min acceptable QA score (0-100)
  };
  alertRecipients?: string[];  // Managers/leads to alert
}

export interface NewCampaignConfig {
  // Basic Information
  campaignName: string;
  description?: string;

  // Payer & Validation Cycle
  accountId: string;           // Payer account ID
  cycleId: string;             // Validation cycle ID

  // Validation Configuration
  primaryMethod: OutreachMethod;
  strategyVersion: string;
  priorityTier: PriorityTier;
  maxAttempts: number;
  cooldownMinutes: number;
  slaHours: number;            // Target completion deadline

  // Call Window Settings
  callWindowStart?: string;
  callWindowEnd?: string;

  // Assignment
  assignedQueue?: string;
  assignedAgents?: string[];   // Validation coordinators

  // Source Data
  source: CampaignCreationSource;

  // Additional Settings
  startTime?: string;
  notes?: string;

  // Report Automation (From conversation: "All reports should happen systematically")
  reportAutomation?: ReportAutomationConfig;

  // QA & Call Monitoring Integration
  qaIntegration?: QAIntegrationConfig;
  callRecording?: CallRecordingConfig;

  // Performance Monitoring & Coaching
  performanceMonitoring?: PerformanceMonitoringConfig;
}

// ----------------------------------------------------------------------------
// Filters
// ----------------------------------------------------------------------------

export interface QueueFilters {
  queueType?: OutreachQueue['queueType'];
  status?: OutreachQueue['status'];
  accountId?: string;
  cycleId?: string;
  agentStatus?: AgentStatus['status'];
  healthScore?: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  alertSeverity?: QueueAlert['severity'];
}
