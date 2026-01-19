// ============================================================================
// Call Monitoring & QA - Mock Data Generator
// ============================================================================

import {
  OutreachTask,
  OutreachSummary,
  OutreachTaskDetails,
  OutreachTaskStep,
  OutreachAttempt,
  ExplainabilityBundle,
  AttemptOutcome,
  BlockReason,
  OutreachMethod,
  TaskStatus,
  PriorityTier,
  ActionLog,
  CallRecording,
  CallTranscript,
  CallAnalysis,
  QAReview,
  TranscriptSegment,
} from './outreach-types';

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------

// Seeded random number generator to ensure consistent mock data between server and client
let seed = 12345; // Fixed seed for reproducibility
const seededRandom = (): number => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

const randomElement = <T>(arr: T[]): T => arr[Math.floor(seededRandom() * arr.length)];

const randomInt = (min: number, max: number): number =>
  Math.floor(seededRandom() * (max - min + 1)) + min;

const randomDate = (start: Date, end: Date): Date => {
  const date = new Date(start.getTime() + seededRandom() * (end.getTime() - start.getTime()));
  return date;
};

const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

const maskProviderId = (id: string): string => {
  if (id.length <= 4) return id;
  return id.substring(0, 2) + '****' + id.substring(id.length - 2);
};

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

const ACCOUNTS = ['Blue Cross Blue Shield', 'Aetna Health', 'Cigna Healthcare', 'Humana', 'United HealthCare'];
const CYCLES = ['Q1 2025 Validation', 'Q4 2024 Re-attestation', 'Q3 2024 Annual Review', 'Credentialing 2024', 'Network Update 2024'];
const QUEUES = ['Primary Care Team', 'Specialist Team', 'Research Queue', 'Escalation Queue', 'Self-Service Follow-up'];
const AGENTS = ['Sarah Mitchell', 'James Wilson', 'Maria Garcia', 'David Chen', 'Emily Thompson'];
const STATES = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

const ATTEMPT_OUTCOMES: AttemptOutcome[] = [
  'VERIFIED_SUCCESS',
  'VERIFIED_WITH_UPDATES',
  'NO_ANSWER',
  'LEFT_VOICEMAIL',
  'BUSY',
  'WRONG_NUMBER',
  'CALL_BACK_REQUESTED',
  'DECLINED_TO_VERIFY',
  'OFFICE_CLOSED_TEMP',
  'LANGUAGE_BARRIER',
  'NEEDS_SUPERVISOR',
  'PARTIAL_INFO',
];

const BLOCK_REASONS: BlockReason[] = [
  'MISSING_PHONE',
  'MISSING_EMAIL',
  'INVALID_CONTACT_INFO',
  'COOLDOWN_ACTIVE',
  'OUTSIDE_TIME_WINDOW',
  'NO_ELIGIBLE_METHODS',
  'NEEDS_RESEARCH',
  'PENDING_NPI_VERIFICATION',
];

const METHODS: OutreachMethod[] = ['WEB', 'AI_CALL', 'HUMAN_CALL', 'EMAIL', 'SELF_SERVICE'];

const TASK_STATUSES: TaskStatus[] = [
  'NEW',
  'PLANNED',
  'READY',
  'IN_PROGRESS',
  'WAITING_COOLDOWN',
  'WAITING_TIME_WINDOW',
  'BLOCKED',
  'ESCALATED',
  'NEEDS_RESEARCH',
  'VERIFIED',
  'CLOSED_PARTIAL',
  'FAILED',
];

const PRIORITIES: PriorityTier[] = ['P0', 'P1', 'P2'];

// ----------------------------------------------------------------------------
// Generate Outreach Tasks
// ----------------------------------------------------------------------------

export const generateMockTasks = (count: number = 50): OutreachTask[] => {
  const now = new Date();
  const tasks: OutreachTask[] = [];

  for (let i = 0; i < count; i++) {
    const status = randomElement(TASK_STATUSES);
    const method = randomElement(METHODS);
    const priority = randomElement(PRIORITIES);
    const isBlocked = status === 'BLOCKED' || status === 'WAITING_COOLDOWN' || status === 'WAITING_TIME_WINDOW';

    const createdAt = randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
    const lastUpdated = randomDate(createdAt, now);
    const slaDue = addHours(createdAt, randomInt(24, 120));

    const aiAttempts = method === 'AI_CALL' ? randomInt(0, 5) : 0;
    const humanAttempts = method === 'HUMAN_CALL' ? randomInt(0, 3) : 0;
    const totalAttempts = aiAttempts + humanAttempts;

    const task: OutreachTask = {
      taskId: `task-${i + 1}`,
      accountId: `account-${randomInt(1, 5)}`,
      accountName: randomElement(ACCOUNTS),
      cycleId: `cycle-${randomInt(1, 5)}`,
      cycleName: randomElement(CYCLES),
      providerId: `provider-${i + 1}`,
      providerIdentifier: maskProviderId(`PRV${String(i + 1).padStart(6, '0')}`),
      providerState: randomElement(STATES),
      currentMethod: method,
      status,
      priorityScore: priority === 'P0' ? randomInt(90, 100) : priority === 'P1' ? randomInt(70, 89) : randomInt(50, 69),
      priorityTier: priority,
      slaDueAt: slaDue.toISOString(),
      assignedQueue: randomElement(QUEUES),
      assignedAgent: randomElement(AGENTS),
      attemptSummary: {
        aiAttempts,
        humanAttempts,
        totalAttempts,
        lastOutcome: totalAttempts > 0 ? randomElement(ATTEMPT_OUTCOMES) : undefined,
      },
      lastUpdatedAt: lastUpdated.toISOString(),
      blockReason: isBlocked ? randomElement(BLOCK_REASONS) : undefined,
      confidenceProgress:
        status !== 'NEW' && status !== 'PLANNED'
          ? {
              verifiedFields: randomInt(3, 10),
              totalFields: 10,
              minConfidence: randomInt(60, 95) / 100,
            }
          : undefined,
      nextEligibleAt:
        status === 'WAITING_COOLDOWN' || status === 'WAITING_TIME_WINDOW'
          ? addMinutes(now, randomInt(15, 240)).toISOString()
          : status === 'READY' || status === 'IN_PROGRESS'
          ? now.toISOString()
          : undefined,
      nextEligibleStep: method,
      strategyVersion: `v${randomInt(1, 3)}.${randomInt(0, 5)}.${randomInt(0, 10)}`,
      createdAt: createdAt.toISOString(),
    };

    tasks.push(task);
  }

  return tasks;
};

// ----------------------------------------------------------------------------
// Generate Outreach Summary
// ----------------------------------------------------------------------------

export const generateMockSummary = (tasks: OutreachTask[]): OutreachSummary => {
  const totalOpenTasks = tasks.filter(
    (t) => !['VERIFIED', 'CLOSED_PARTIAL', 'FAILED'].includes(t.status)
  ).length;

  const now = new Date();
  const atRiskSlaCount = tasks.filter((t) => {
    const slaDue = new Date(t.slaDueAt);
    const hoursUntilDue = (slaDue.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDue > 0 && hoursUntilDue <= 24;
  }).length;

  const breachedSlaCount = tasks.filter((t) => new Date(t.slaDueAt) < now).length;

  const contactRate = randomInt(35, 65);
  const verificationCompletionRate = randomInt(45, 75);
  const avgAttemptsPerRecord = randomInt(20, 45) / 10;

  const queueBacklogByMethod: Record<OutreachMethod, number> = {
    WEB: tasks.filter((t) => t.currentMethod === 'WEB').length,
    AI_CALL: tasks.filter((t) => t.currentMethod === 'AI_CALL').length,
    HUMAN_CALL: tasks.filter((t) => t.currentMethod === 'HUMAN_CALL').length,
    EMAIL: tasks.filter((t) => t.currentMethod === 'EMAIL').length,
    SELF_SERVICE: tasks.filter((t) => t.currentMethod === 'SELF_SERVICE').length,
  };

  const topBlockReasons = BLOCK_REASONS.map((reason) => ({
    reason,
    count: tasks.filter((t) => t.blockReason === reason).length,
  }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const pendingResearchCount = tasks.filter((t) => t.status === 'NEEDS_RESEARCH').length;

  return {
    totalOpenTasks,
    atRiskSlaCount,
    breachedSlaCount,
    contactRate,
    verificationCompletionRate,
    avgAttemptsPerRecord,
    queueBacklogByMethod,
    topBlockReasons,
    pendingResearchCount,
  };
};

// ----------------------------------------------------------------------------
// Generate Task Steps
// ----------------------------------------------------------------------------

const generateMockSteps = (taskId: string, currentMethod: OutreachMethod): OutreachTaskStep[] => {
  const methodSequence: OutreachMethod[] = ['WEB', 'AI_CALL', 'HUMAN_CALL', 'EMAIL'];
  const currentIndex = methodSequence.indexOf(currentMethod);

  return methodSequence.map((method, index) => ({
    taskStepId: `step-${taskId}-${index}`,
    taskId,
    sequenceNo: index + 1,
    method,
    maxAttempts: method === 'AI_CALL' ? 5 : 3,
    attemptsUsed: index < currentIndex ? (method === 'AI_CALL' ? randomInt(1, 5) : randomInt(1, 3)) : 0,
    cooldownMinutes: method === 'AI_CALL' ? 60 : 30,
    status: index < currentIndex ? 'DONE' : index === currentIndex ? 'PENDING' : 'PENDING',
    queueId: index === currentIndex ? randomElement(QUEUES) : undefined,
  }));
};

// ----------------------------------------------------------------------------
// Generate Attempts
// ----------------------------------------------------------------------------

const generateMockAttempts = (task: OutreachTask): OutreachAttempt[] => {
  const attempts: OutreachAttempt[] = [];
  const { aiAttempts, humanAttempts } = task.attemptSummary;
  const now = new Date();

  // Generate AI attempts
  for (let i = 0; i < aiAttempts; i++) {
    const startedAt = addMinutes(now, -((aiAttempts - i) * 60 + randomInt(5, 30)));
    const endedAt = addMinutes(startedAt, randomInt(2, 10));

    attempts.push({
      attemptId: `attempt-${task.taskId}-ai-${i}`,
      taskId: task.taskId,
      taskStepId: `step-${task.taskId}-1`,
      method: 'AI_CALL',
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      outcomeCode: randomElement(ATTEMPT_OUTCOMES),
      notes: seededRandom() > 0.7 ? 'AI detected voicemail' : undefined,
      callId: `call-${randomInt(10000, 99999)}`,
      recordingId: `rec-${randomInt(10000, 99999)}`,
      transcriptId: `trans-${randomInt(10000, 99999)}`,
      evidenceRefs: [`ev-${randomInt(1000, 9999)}`, `ev-${randomInt(1000, 9999)}`],
      confidenceDelta: {
        phone_verified: seededRandom() > 0.3 ? 0.1 : 0,
        email_verified: seededRandom() > 0.5 ? 0.15 : 0,
        npi_verified: seededRandom() > 0.4 ? 0.2 : 0,
      },
    });
  }

  // Generate human attempts
  for (let i = 0; i < humanAttempts; i++) {
    const startedAt = addMinutes(now, -((humanAttempts - i) * 120 + randomInt(10, 60)));
    const endedAt = addMinutes(startedAt, randomInt(5, 20));

    attempts.push({
      attemptId: `attempt-${task.taskId}-human-${i}`,
      taskId: task.taskId,
      taskStepId: `step-${task.taskId}-2`,
      method: 'HUMAN_CALL',
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      outcomeCode: randomElement(ATTEMPT_OUTCOMES),
      agentId: randomElement(AGENTS),
      notes: seededRandom() > 0.6 ? 'Agent noted: Will call back' : undefined,
      callId: `call-${randomInt(10000, 99999)}`,
      recordingId: `rec-${randomInt(10000, 99999)}`,
      evidenceRefs: [`ev-${randomInt(1000, 9999)}`],
    });
  }

  return attempts.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
};

// ----------------------------------------------------------------------------
// Generate Task Details
// ----------------------------------------------------------------------------

export const generateMockTaskDetails = (task: OutreachTask): OutreachTaskDetails => {
  const steps = generateMockSteps(task.taskId, task.currentMethod);
  const attempts = generateMockAttempts(task);

  const currentStep = steps.find((s) => s.status === 'PENDING') || steps[steps.length - 1];

  return {
    task,
    steps,
    attempts,
    dispositions: attempts.map((a) => a.outcomeCode!).filter((o) => o) as AttemptOutcome[],
    evidenceArtifacts: attempts.flatMap((a) =>
      a.evidenceRefs.map((ref) => ({
        id: ref,
        type: (seededRandom() > 0.5 ? 'recording' : 'transcript') as 'recording' | 'transcript',
        url: `/api/evidence/${ref}`,
        createdAt: a.startedAt,
      }))
    ),
    configVersion: {
      strategy: 'standard-outreach-v2',
      pack: 'pack-cali-2025',
      rules: 'rules-q1-2025',
    },
    nextEligibleSteps:
      task.status === 'READY' || task.status === 'IN_PROGRESS'
        ? [
            {
              method: task.currentMethod,
              eligibleAt: task.nextEligibleAt || new Date().toISOString(),
              reason: currentStep?.status === 'PENDING' ? 'Next step in sequence' : undefined,
            },
          ]
        : task.status === 'BLOCKED'
        ? []
        : [
            {
              method: 'AI_CALL',
              eligibleAt: task.nextEligibleAt || new Date().toISOString(),
              conditions: ['Within call window', 'Not on cooldown'],
            },
            {
              method: 'HUMAN_CALL',
              eligibleAt: task.nextEligibleAt || new Date().toISOString(),
              conditions: ['Agent available', 'Within business hours'],
            },
          ],
  };
};

// ----------------------------------------------------------------------------
// Generate Explainability Bundle
// ----------------------------------------------------------------------------

export const generateMockExplainability = (task: OutreachTask): ExplainabilityBundle => {
  const now = new Date();
  const isBlocked = task.status === 'BLOCKED' || task.status === 'WAITING_COOLDOWN';

  return {
    taskId: task.taskId,
    blockedReason: isBlocked
      ? {
          code: task.blockReason || 'COOLDOWN_ACTIVE',
          message: getBlockReasonMessage(task.blockReason),
          canOverride: task.blockReason === 'COOLDOWN_ACTIVE' || task.blockReason === 'OUTSIDE_TIME_WINDOW',
          overrideRole: 'MANAGER',
        }
      : undefined,
    whyBlocked: isBlocked
      ? getBlockReasonMessage(task.blockReason) + '. ' + (task.nextEligibleAt ? `Next eligible at ${new Date(task.nextEligibleAt).toLocaleString()}` : '')
      : 'Task is not blocked. Proceeding with normal workflow.',
    whatAllowedNext: isBlocked
      ? []
      : [
          {
            action: 'Retry with AI Call',
            eligibleAt: now.toISOString(),
            conditions: ['Within call window: 8AM-8PM ET', 'Contact info valid'],
          },
          {
            action: 'Switch to Human Coordinator',
            eligibleAt: now.toISOString(),
            conditions: ['Coordinator availability: Low', 'Business hours only'],
          },
          {
            action: 'Send Self-Service Portal Link',
            eligibleAt: now.toISOString(),
          },
        ],
    attemptAnalysis: {
      totalAttempts: task.attemptSummary.totalAttempts,
      outcomesByMethod: {
        AI_CALL: ['NO_ANSWER', 'BUSY', 'LEFT_VOICEMAIL'],
        HUMAN_CALL: ['REFUSED', 'WRONG_NUMBER'],
      },
      patterns:
        task.attemptSummary.totalAttempts > 3
          ? [
              'Multiple no-answer patterns detected',
              'Best contact time appears to be 10AM-12PM ET',
              'Consider switching to self-service channel',
            ]
          : ['Insufficient data for pattern analysis'],
    },
    confidenceAnalysis: {
      verifiedFields: [
        { field: 'NPI', confidence: 0.98 },
        { field: 'Phone', confidence: task.attemptSummary.aiAttempts > 0 ? 0.75 : 0.5 },
        { field: 'Email', confidence: 0.82 },
        { field: 'Address', confidence: task.confidenceProgress?.minConfidence || 0.7 },
      ],
      lowConfidenceFields:
        task.confidenceProgress && task.confidenceProgress.minConfidence < 0.8
          ? [
              { field: 'Phone', confidence: 0.65, reason: 'Multiple disconnected calls' },
              { field: 'Fax', confidence: 0.45, reason: 'Not yet verified' },
            ]
          : [],
      overallProgress: task.confidenceProgress
        ? (task.confidenceProgress.verifiedFields / task.confidenceProgress.totalFields) * 100
        : 50,
    },
    recommendations:
      task.attemptSummary.totalAttempts > 3
        ? [
            'Consider escalating to human coordinator',
            'Verify contact information before next attempt',
            'Try self-service portal as alternative',
          ]
        : ['Continue with current validation strategy', 'Monitor next attempt outcome'],
    fatigueWarning:
      task.attemptSummary.totalAttempts > 5
        ? {
            contactCount24h: task.attemptSummary.totalAttempts,
            maxAllowed24h: 5,
            cooldownUntil: addHours(now, 24).toISOString(),
          }
        : undefined,
  };
};

const getBlockReasonMessage = (reason?: BlockReason): string => {
  switch (reason) {
    case 'MISSING_PHONE':
      return 'Phone number is missing from provider record';
    case 'MISSING_EMAIL':
      return 'Email address is missing from provider record';
    case 'INVALID_CONTACT_INFO':
      return 'Contact information format is invalid';
    case 'COOLDOWN_ACTIVE':
      return 'Cooldown period active after last attempt';
    case 'OUTSIDE_TIME_WINDOW':
      return 'Current time is outside allowed calling window';
    case 'NO_ELIGIBLE_METHODS':
      return 'No eligible contact methods remaining';
    case 'WAITING_PROVIDER_CALLBACK':
      return 'Waiting for provider to return call';
    case 'NEEDS_RESEARCH':
      return 'Manual research required to resolve issues';
    case 'PENDING_NPI_VERIFICATION':
      return 'NPI verification in progress';
    default:
      return 'Validation is blocked';
  }
};

// ----------------------------------------------------------------------------
// Generate Action Logs
// ----------------------------------------------------------------------------

export const generateMockActionLogs = (taskId: string, count: number = 5): ActionLog[] => {
  const logs: ActionLog[] = [];
  const now = new Date();

  const actionTypes = ['reassign', 'escalate', 'retry', 'switch_method', 'pause', 'add_note'];
  const actors = ['Agent Smith', 'Agent Johnson', 'Manager Brown', 'Supervisor Davis'];

  for (let i = 0; i < count; i++) {
    const action = randomElement(actionTypes);
    const timestamp = addMinutes(now, -(count - i) * 30);

    logs.push({
      logId: `log-${taskId}-${i}`,
      taskId,
      actor: randomElement(actors),
      actorRole: randomElement(['MANAGER', 'SUPERVISOR', 'QA_LEAD'] as const),
      actionType: action,
      timestamp: timestamp.toISOString(),
      beforeState: action === 'reassign' ? { assignedAgent: 'Agent Smith' } : undefined,
      afterState: action === 'reassign' ? { assignedAgent: 'Agent Johnson' } : undefined,
      reason: seededRandom() > 0.5 ? 'Workload balancing' : undefined,
      metadata: {
        ipAddress: '192.168.1.' + randomInt(1, 255),
        userAgent: 'Mozilla/5.0...',
      },
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ----------------------------------------------------------------------------
// Pre-generated Mock Data
// ----------------------------------------------------------------------------

let mockTasksCache: OutreachTask[] | null = null;
let customTasks: OutreachTask[] = [];

export const getMockTasks = (): OutreachTask[] => {
  if (!mockTasksCache) {
    mockTasksCache = generateMockTasks(50);
  }
  return [...customTasks, ...mockTasksCache];
};

export const addMockTask = (task: OutreachTask): void => {
  customTasks.unshift(task); // Add to beginning of array
};

export const getMockSummary = (): OutreachSummary => {
  return generateMockSummary(getMockTasks());
};

export const getMockTaskById = (taskId: string): OutreachTask | undefined => {
  return getMockTasks().find((t) => t.taskId === taskId);
};

export const getMockTaskDetails = (taskId: string): OutreachTaskDetails | undefined => {
  const task = getMockTaskById(taskId);
  if (!task) return undefined;
  return generateMockTaskDetails(task);
};

export const getMockExplainability = (taskId: string): ExplainabilityBundle | undefined => {
  const task = getMockTaskById(taskId);
  if (!task) return undefined;
  return generateMockExplainability(task);
};

export const getMockActionLogs = (taskId: string): ActionLog[] => {
  return generateMockActionLogs(taskId, randomInt(3, 8));
};

// ----------------------------------------------------------------------------
// Call Recordings Mock Data
// ----------------------------------------------------------------------------

export const getMockCallRecordings = (taskId: string): CallRecording[] => {
  // For demo purposes, always return recordings even if task has no attempts
  const recordings: CallRecording[] = [];
  // Generate 1-3 recordings per task for demo
  const recordingCount = taskId.charCodeAt(taskId.length - 1) % 3 + 1;

  for (let i = 0; i < recordingCount; i++) {
    const callId = `call-${taskId}-${i}`;
    const duration = randomInt(120, 480); // 2-8 minutes

    recordings.push({
      recordingId: `rec-${callId}`,
      attemptId: `attempt-${taskId}-${i}`,
      callId,
      durationSeconds: duration,
      audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 3) + 1}.mp3`, // Demo audio files
      fileFormat: randomElement(['mp3', 'wav'] as const),
      fileSizeBytes: duration * 16000, // ~16KB per second
      createdAt: new Date(Date.now() - (recordingCount - i) * 3600000).toISOString(),
      transcriptionId: `trans-${callId}`,
      sentiment: randomElement(['POSITIVE', 'NEUTRAL', 'NEGATIVE'] as const),
      agentId: randomElement(AGENTS),
      agentName: randomElement(AGENTS),
      phoneNumber: `+1 (${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
    });
  }

  return recordings;
};

// ----------------------------------------------------------------------------
// Call Transcripts Mock Data
// ----------------------------------------------------------------------------

const MOCK_CONVERSATIONS = [
  {
    segments: [
      { speaker: 'AI_AGENT' as const, text: 'Hello, this is a call from Provider Network Services. I\'m calling to verify some information for your provider profile.', startTime: 0, endTime: 8 },
      { speaker: 'PROVIDER' as const, text: 'Hi, yes. What information do you need?', startTime: 9, endTime: 12 },
      { speaker: 'AI_AGENT' as const, text: 'I need to verify your office address and contact phone number. Is your practice still located at 123 Medical Plaza?', startTime: 13, endTime: 22 },
      { speaker: 'PROVIDER' as const, text: 'Yes, that\'s correct. We\'ve been here for 10 years.', startTime: 23, endTime: 28 },
      { speaker: 'AI_AGENT' as const, text: 'Great. And is your primary contact number still (555) 123-4567?', startTime: 29, endTime: 36 },
      { speaker: 'PROVIDER' as const, text: 'Actually, we recently changed that. The new number is (555) 123-4890.', startTime: 37, endTime: 45 },
      { speaker: 'AI_AGENT' as const, text: 'Thank you for the update. I\'ve noted the new phone number. Is there anything else that needs to be updated?', startTime: 46, endTime: 55 },
      { speaker: 'PROVIDER' as const, text: 'No, everything else is the same. Thanks for calling.', startTime: 56, endTime: 60 },
      { speaker: 'AI_AGENT' as const, text: 'Thank you for your time. Have a great day.', startTime: 61, endTime: 65 },
    ],
    summary: 'Provider verified address and updated phone number. Call was successful with cooperative provider.',
    keyTopics: ['Address Verification', 'Phone Update', 'Practice Location'],
  },
  {
    segments: [
      { speaker: 'AGENT' as const, text: 'Good morning! This is Sarah from Network Services. I\'m calling to verify your provider enrollment information.', startTime: 0, endTime: 10 },
      { speaker: 'PROVIDER' as const, text: 'Hello Sarah. I\'ve been expecting this call. What do you need?', startTime: 11, endTime: 18 },
      { speaker: 'AGENT' as const, text: 'I need to confirm your NPI number and specialty classification for our records.', startTime: 19, endTime: 28 },
      { speaker: 'PROVIDER' as const, text: 'My NPI is 1234567890 and I\'m a cardiologist.', startTime: 29, endTime: 38 },
      { speaker: 'AGENT' as const, text: 'Perfect, let me confirm... Yes, that matches our records. One more thing - we need to update your accepting new patients status.', startTime: 39, endTime: 52 },
      { speaker: 'PROVIDER' as const, text: 'Yes, we are accepting new patients. Actually, we have availability next week if you need to refer anyone.', startTime: 53, endTime: 65 },
      { speaker: 'AGENT' as const, text: 'That\'s wonderful to hear! I\'ve updated your status. Thank you so much for your time, Dr. Johnson.', startTime: 66, endTime: 78 },
      { speaker: 'PROVIDER' as const, text: 'You\'re welcome. Have a good day!', startTime: 79, endTime: 82 },
    ],
    summary: 'Verified NPI and specialty. Updated accepting new patients status to yes. Very productive call.',
    keyTopics: ['NPI Verification', 'Specialty', 'New Patients', 'Provider Status'],
  },
  {
    segments: [
      { speaker: 'AI_AGENT' as const, text: 'Hello, this is an automated call from Provider Network. We need to verify your billing information.', startTime: 0, endTime: 10 },
      { speaker: 'PROVIDER' as const, text: 'I\'m very busy right now. Can you call back later?', startTime: 11, endTime: 17 },
      { speaker: 'AI_AGENT' as const, text: 'I understand. When would be a good time to reach you?', startTime: 18, endTime: 25 },
      { speaker: 'PROVIDER' as const, text: 'Try calling after 3 PM. Mornings are hectic here.', startTime: 26, endTime: 34 },
      { speaker: 'AI_AGENT' as const, text: 'Thank you. I\'ll schedule a callback for this afternoon.', startTime: 35, endTime: 42 },
    ],
    summary: 'Provider was busy and requested callback. Best time identified as after 3 PM.',
    keyTopics: ['Callback Requested', 'Best Contact Time', 'Busy Practice'],
  },
  {
    segments: [
      { speaker: 'AGENT' as const, text: 'Good afternoon, this is James from Provider Credentialing Network. I\'m calling about your provider profile.', startTime: 0, endTime: 12 },
      { speaker: 'PROVIDER' as const, text: 'Oh yes, I remember filling out some forms online. What do you need?', startTime: 13, endTime: 20 },
      { speaker: 'AGENT' as const, text: 'We just need to clarify a few things. Your tax ID seems to be different from what we have on file.', startTime: 21, endTime: 35 },
      { speaker: 'PROVIDER' as const, text: 'Let me check... Yes, we updated it last year when we restructured the practice.', startTime: 36, endTime: 48 },
      { speaker: 'AGENT' as const, text: 'Could you provide the updated tax ID number?', startTime: 49, endTime: 56 },
      { speaker: 'PROVIDER' as const, text: 'Sure, it\'s 12-3456789. Make sure you update your records.', startTime: 57, endTime: 68 },
      { speaker: 'AGENT' as const, text: 'Thank you, Dr. Martinez. I\'ve updated that. Is your email still drmartinez@clinic.com?', startTime: 69, endTime: 82 },
      { speaker: 'PROVIDER' as const, text: 'That\'s correct. Is there anything else?', startTime: 83, endTime: 88 },
      { speaker: 'AGENT' as const, text: 'No, that covers everything. Thanks for your cooperation.', startTime: 89, endTime: 96 },
    ],
    summary: 'Successfully updated tax ID information and verified email address. Provider was cooperative and provided all requested information.',
    keyTopics: ['Tax ID Update', 'Email Verification', 'Profile Update'],
  },
  {
    segments: [
      { speaker: 'AI_AGENT' as const, text: 'Hello, this is an automated verification call from HealthNet Partners.', startTime: 0, endTime: 8 },
      { speaker: 'PROVIDER' as const, text: 'Hi there, what\'s this about?', startTime: 9, endTime: 14 },
      { speaker: 'AI_AGENT' as const, text: 'We need to verify your hospital affiliations for our network directory.', startTime: 15, endTime: 24 },
      { speaker: 'PROVIDER' as const, text: 'Okay, I\'m affiliated with three hospitals - City Medical, County General, and St. Mary\'s.', startTime: 25, endTime: 40 },
      { speaker: 'AI_AGENT' as const, text: 'Thank you. I\'ve noted all three affiliations. Is your DEA license current?', startTime: 41, endTime: 52 },
      { speaker: 'PROVIDER' as const, text: 'Yes, it was renewed in March and expires in 2028.', startTime: 53, endTime: 62 },
      { speaker: 'AI_AGENT' as const, text: 'Excellent. Your verification is complete. Thank you for your time.', startTime: 63, endTime: 72 },
    ],
    summary: 'Verified hospital affiliations (City Medical, County General, St. Mary\'s) and confirmed current DEA license.',
    keyTopics: ['Hospital Affiliations', 'DEA License', 'Verification'],
  },
  {
    segments: [
      { speaker: 'AGENT' as const, text: 'Hello, this is Emily from Provider Services. May I speak with the office manager?', startTime: 0, endTime: 10 },
      { speaker: 'PROVIDER' as const, text: 'This is Dr. Williams, the office manager is on lunch. Can I help you?', startTime: 11, endTime: 22 },
      { speaker: 'AGENT' as const, text: 'Yes Doctor, we need to verify your electronic claims submission information.', startTime: 23, endTime: 35 },
      { speaker: 'PROVIDER' as const, text: 'We use Office Ally for our claims. Is that what you need?', startTime: 36, endTime: 46 },
      { speaker: 'AGENT' as const, text: 'Yes, and do you accept electronic remittance advice?', startTime: 47, endTime: 56 },
      { speaker: 'PROVIDER' as const, text: 'Absolutely, we prefer electronic payments. It\'s much faster.', startTime: 57, endTime: 67 },
      { speaker: 'AGENT' as const, text: 'Perfect. I\'ve updated your profile to reflect electronic remittance. Thank you, Dr. Williams.', startTime: 68, endTime: 80 },
      { speaker: 'PROVIDER' as const, text: 'You\'re welcome. Anything else?', startTime: 81, endTime: 86 },
      { speaker: 'AGENT' as const, text: 'That\'s all for now. Have a great day!', startTime: 87, endTime: 92 },
    ],
    summary: 'Verified electronic claims submission through Office Ally and confirmed electronic remittance acceptance.',
    keyTopics: ['Claims Submission', 'Electronic Remittance', 'Office Ally'],
  },
];

export const getMockCallTranscripts = (taskId: string): CallTranscript[] => {
  const recordings = getMockCallRecordings(taskId);

  // For demo purposes, always return at least one transcript
  const conversationIndex = taskId.charCodeAt(taskId.length - 1) % MOCK_CONVERSATIONS.length;
  const conversation = MOCK_CONVERSATIONS[conversationIndex];

  return recordings.map((recording) => ({
    transcriptId: `trans-${recording.callId}`,
    recordingId: recording.recordingId,
    callId: recording.callId,
    fullText: conversation.segments.map(s => `${s.speaker}: ${s.text}`).join('\n'),
    segments: conversation.segments.map((seg, i) => ({
      segmentId: `seg-${recording.callId}-${i}`,
      speaker: seg.speaker,
      text: seg.text,
      startTime: seg.startTime,
      endTime: seg.endTime,
      confidence: randomInt(85, 99) / 100,
      sentiment: randomElement(['POSITIVE', 'NEUTRAL'] as const),
    })) as TranscriptSegment[],
    summary: conversation.summary,
    keyTopics: conversation.keyTopics,
    createdAt: recording.createdAt,
    confidenceScore: randomInt(88, 97) / 100,
  }));
};

// ----------------------------------------------------------------------------
// Call Analysis Mock Data
// ----------------------------------------------------------------------------

export const getMockCallAnalysis = (taskId: string): CallAnalysis[] => {
  const recordings = getMockCallRecordings(taskId);

  // For demo purposes, always return analysis for each recording
  return recordings.map((recording) => {
    const sentiment = recording.sentiment || 'NEUTRAL';
    const sentimentScore = sentiment === 'POSITIVE' ? 0.75 : sentiment === 'NEGATIVE' ? -0.65 : 0.1;

    // Vary key phrases based on conversation type
    const phraseVariations = [
      ['verify information', 'update records', 'correct address', 'new phone number', 'thank you'],
      ['NPI verification', 'specialty confirmation', 'new patients', 'enrollment'],
      ['callback requested', 'best contact time', 'busy practice', 'follow up'],
      ['tax ID update', 'email verification', 'practice restructuring', 'profile update'],
      ['hospital affiliations', 'DEA license', 'network directory', 'credentialing'],
      ['electronic claims', 'remittance advice', 'Office Ally', 'claims submission'],
    ];
    const keyPhrases = phraseVariations[taskId.charCodeAt(taskId.length - 1) % phraseVariations.length];

    return {
      callId: recording.callId,
      recordingId: recording.recordingId,
      overallSentiment: {
        score: sentimentScore,
        label: sentiment,
        confidence: randomInt(75, 95) / 100,
      },
      sentimentOverTime: [
        { timestamp: 0, score: 0.1, label: 'NEUTRAL' },
        { timestamp: 30, score: 0.3, label: 'POSITIVE' },
        { timestamp: 60, score: sentimentScore, label: sentiment },
      ],
      keyPhrases,
      detectedEmotions: [
        { emotion: 'cooperative', confidence: 0.85 },
        { emotion: 'professional', confidence: 0.92 },
        { emotion: sentiment === 'POSITIVE' ? 'friendly' : 'neutral', confidence: 0.78 },
      ],
      callQuality: {
        audioClarity: randomInt(80, 98) / 100,
        speechClarity: randomInt(85, 99) / 100,
        backgroundNoise: randomElement(['LOW', 'MEDIUM', 'HIGH'] as const),
        overallScore: randomInt(75, 95),
      },
      interruptions: [
        { timestamp: 25, speaker: 'PROVIDER' },
        { timestamp: 52, speaker: 'AGENT' },
      ],
      talkTimeRatio: {
        agent: randomInt(40, 55),
        provider: randomInt(35, 50),
        silence: randomInt(5, 15),
      },
    };
  });
};

// ----------------------------------------------------------------------------
// QA Reviews Mock Data
// ----------------------------------------------------------------------------

export const getMockQAReviews = (taskId: string): QAReview[] => {
  const recordings = getMockCallRecordings(taskId);

  // For demo purposes, return QA reviews for most calls (about 80%)
  // Use taskId to consistently determine which calls have QA reviews
  const hasQAReview = (taskId.charCodeAt(taskId.length - 1) % 5) < 4;

  if (!hasQAReview || recordings.length === 0) return [];

  return recordings.slice(0, 1).map((recording) => {
    const overallScore = randomInt(72, 98);
    const disposition = overallScore >= 85 ? 'PASS' as const : overallScore >= 70 ? 'NEEDS_RETRAINING' as const : 'FAIL' as const;

    // Different QA reviewers
    const reviewers = [
      { id: 'qa_01', name: 'Jennifer Martinez - QA Lead' },
      { id: 'qa_02', name: 'Robert Chen - Senior QA Analyst' },
      { id: 'qa_03', name: 'Sarah Williams - QA Specialist' },
    ];
    const reviewer = reviewers[taskId.charCodeAt(taskId.length - 1) % reviewers.length];

    return {
      reviewId: `qa-${recording.callId}`,
      callId: recording.callId,
      recordingId: recording.recordingId,
      reviewedBy: reviewer.id,
      reviewedByName: reviewer.name,
      reviewedAt: new Date(Date.now() - randomInt(4, 48) * 3600000).toISOString(),
      overallScore,
      status: 'COMPLETED',
      criteriaScores: [
        { criterion: 'Opening & Greeting', score: randomInt(7, 10), weight: 1 },
        { criterion: 'Verification Accuracy', score: randomInt(8, 10), weight: 1.5 },
        { criterion: 'Professionalism', score: randomInt(8, 10), weight: 1.2 },
        { criterion: 'Documentation', score: randomInt(6, 10), weight: 1 },
        { criterion: 'Closing', score: randomInt(7, 10), weight: 0.8 },
        { criterion: 'Compliance', score: randomInt(8, 10), weight: 1.5 },
      ],
      strengths: [
        'Clear and professional introduction',
        'Accurate verification of provider information',
        'Proper documentation of changes',
        'Excellent rapport building',
      ],
      improvementAreas: overallScore < 85 ? [
        'Could improve on active listening',
        'Consider additional clarification questions',
      ] : ['Minor improvement: Could be more concise'],
      actionItems: overallScore < 85 ? [
        'Schedule coaching session for call review',
        'Review verification protocol updates',
      ] : ['Share call as example for team training'],
      finalDisposition: disposition,
    };
  });
};
