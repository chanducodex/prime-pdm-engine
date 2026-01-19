// ============================================================================
// Outreach Queue Management - Mock Data Generator
// ============================================================================

import {
  OutreachQueue,
  AgentStatus,
  QueueHealth,
  QueueMonitoringDashboard,
  QueueAlert,
  CampaignCreationSource,
  OutreachMethod,
} from './outreach-queue-types';
import { getMockTasks } from './outreach-mock-data';

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------

let seed = 54321;
const seededRandom = (): number => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

const randomInt = (min: number, max: number): number =>
  Math.floor(seededRandom() * (max - min + 1)) + min;

const randomElement = <T>(arr: T[]): T => arr[Math.floor(seededRandom() * arr.length)];

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

const QUEUE_NAMES = [
  'Q1 2025 CA Provider Verification',
  'Q4 2024 Medicare Validation',
  'Special Enrollment 2024',
  'Q3 2024 Credentialing',
  'Provider Network Updates',
  'Urgent SLA Recovery',
  'New Provider Onboarding',
  'Annual Revalidation Campaign',
];

const AGENT_NAMES = [
  'Sarah Chen',
  'Michael Rodriguez',
  'Emily Watson',
  'David Kim',
  'Jessica Martinez',
  'Robert Taylor',
  'Amanda Lee',
  'Christopher Brown',
  'Nicole Johnson',
  'Daniel Garcia',
];

// ----------------------------------------------------------------------------
// Generate Mock Queues
// ----------------------------------------------------------------------------

const generateMockQueues = (tasks: any[]): OutreachQueue[] => {
  const queues: OutreachQueue[] = [];

  // Group tasks by queue (cycle for now)
  const cycleMap = new Map<string, any[]>();
  tasks.forEach((task) => {
    if (!cycleMap.has(task.cycleId)) {
      cycleMap.set(task.cycleId, []);
    }
    cycleMap.get(task.cycleId)!.push(task);
  });

  let queueIndex = 0;
  for (const [cycleId, cycleTasks] of cycleMap.entries()) {
    const queueId = `queue-${queueIndex + 1}`;
    const firstTask = cycleTasks[0];

    const totalTasks = cycleTasks.length;
    const completedTasks = cycleTasks.filter((t) => t.status === 'VERIFIED').length;
    const inProgressTasks = cycleTasks.filter((t) =>
      ['IN_PROGRESS', 'READY', 'PLANNED'].includes(t.status)
    ).length;
    const pendingTasks = cycleTasks.filter((t) => t.status === 'NEW').length;
    const blockedTasks = cycleTasks.filter((t) =>
      ['BLOCKED', 'WAITING_COOLDOWN', 'WAITING_TIME_WINDOW'].includes(t.status)
    ).length;
    const verifiedTasks = completedTasks;

    const contactRate = randomInt(35, 65);
    const verificationRate = randomInt(45, 75);
    const avgAttempts = randomInt(20, 45) / 10;

    const p0 = cycleTasks.filter((t) => t.priorityTier === 'P0').length;
    const p1 = cycleTasks.filter((t) => t.priorityTier === 'P1').length;
    const p2 = cycleTasks.filter((t) => t.priorityTier === 'P2').length;

    const now = new Date();
    const slaBreached = cycleTasks.filter((t) => new Date(t.slaDueAt) < now).length;
    const slaAtRisk = cycleTasks.filter((t) => {
      const slaDue = new Date(t.slaDueAt);
      const hoursUntilDue = (slaDue.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilDue > 0 && hoursUntilDue <= 24;
    }).length;
    const slaOnTrack = totalTasks - slaBreached - slaAtRisk;

    const statusOptions: OutreachQueue['status'][] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'PAUSED', 'COMPLETED'];
    const status = randomElement(statusOptions);

    queues.push({
      queueId,
      queueName: QUEUE_NAMES[queueIndex % QUEUE_NAMES.length],
      queueType: randomElement(['CAMPAIGN', 'TEAM', 'SPECIAL_PROJECT'] as const),
      status,
      accountId: firstTask.accountId,
      accountName: firstTask.accountName,
      cycleId,
      cycleName: firstTask.cycleName,
      config: {
        primaryMethod: randomElement(['AI_CALL', 'HUMAN_CALL', 'EMAIL'] as OutreachMethod[]),
        strategyVersion: `v${randomInt(1, 3)}.${randomInt(0, 5)}.${randomInt(0, 10)}`,
        maxAttempts: randomInt(3, 5),
        cooldownMinutes: randomInt(30, 120),
        slaHours: randomInt(48, 120),
      },
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        blockedTasks,
        verifiedTasks,
        contactRate,
        verificationRate,
        avgAttemptsPerTask: avgAttempts,
      },
      priorityDistribution: {
        p0,
        p1,
        p2,
      },
      slaTracking: {
        onTrack: slaOnTrack,
        atRisk: slaAtRisk,
        breached: slaBreached,
      },
      assignedAgents: randomInt(2, 8),
      assignedAgentNames: AGENT_NAMES.slice(0, randomInt(2, 6)),
      assignedQueues: [],
      createdAt: new Date(Date.now() - randomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString(),
      startedAt: status !== 'DRAFT' ? new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      completedAt: status === 'COMPLETED' ? new Date(Date.now() - randomInt(0, 2) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      lastUpdatedAt: new Date().toISOString(),
    });

    queueIndex++;
  }

  return queues;
};

// ----------------------------------------------------------------------------
// Generate Mock Agent Status
// ----------------------------------------------------------------------------

const generateMockAgents = (tasks: any[]): AgentStatus[] => {
  const agents: AgentStatus[] = [];

  for (let i = 0; i < AGENT_NAMES.length; i++) {
    const agentTasks = tasks.filter((t) => t.assignedAgent === AGENT_NAMES[i]);
    const completedTasks = agentTasks.filter((t) => t.status === 'VERIFIED').length;
    const inProgressTasks = agentTasks.filter((t) =>
      ['IN_PROGRESS', 'READY', 'PLANNED'].includes(t.status)
    ).length;

    const statusOptions: AgentStatus['status'][] = ['ONLINE', 'ONLINE', 'ON_CALL', 'AWAY', 'OFFLINE', 'ON_BREAK'];
    const status = randomElement(statusOptions);

    const isOnline = status === 'ONLINE' || status === 'ON_CALL';

    agents.push({
      agentId: `agent-${i + 1}`,
      agentName: AGENT_NAMES[i],
      status,
      currentQueue: isOnline ? randomElement(QUEUE_NAMES) : undefined,
      currentTask: status === 'ON_CALL' ? randomElement(agentTasks.map((t) => t.taskId)) : undefined,
      stats: {
        tasksCompleted: completedTasks,
        tasksInProgress: inProgressTasks,
        avgHandleTime: randomInt(8, 25),
        contactRate: randomInt(35, 65),
        verificationRate: randomInt(45, 75),
        totalCalls: randomInt(50, 200),
        successfulContacts: randomInt(20, 100),
      },
      session: isOnline
        ? {
            loginTime: new Date(Date.now() - randomInt(1, 8) * 60 * 60 * 1000).toISOString(),
            tasksAssigned: inProgressTasks,
            onCallDuration: status === 'ON_CALL' ? randomInt(60, 600) : undefined,
          }
        : undefined,
      capacity: {
        maxConcurrentTasks: randomInt(3, 5),
        currentTasks: inProgressTasks,
        availability:
          inProgressTasks === 0 ? 'HIGH' : inProgressTasks < 3 ? 'MEDIUM' : inProgressTasks < 5 ? 'LOW' : 'NONE',
      },
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  return agents;
};

// ----------------------------------------------------------------------------
// Generate Mock Queue Health
// ----------------------------------------------------------------------------

const generateMockHealthScores = (queues: OutreachQueue[]): QueueHealth[] => {
  return queues.map((queue) => {
    const slaBreachRate = (queue.slaTracking.breached / queue.stats.totalTasks) * 100;
    const blockageRate = (queue.stats.blockedTasks / queue.stats.totalTasks) * 100;
    const velocity = randomInt(5, 20);
    const agentUtilization = randomInt(60, 95);
    const queueAge = randomInt(12, 72);

    // Calculate health score (0-100)
    const slaScore = Math.max(0, 100 - slaBreachRate * 2);
    const blockageScore = Math.max(0, 100 - blockageRate * 3);
    const velocityScore = Math.min(100, velocity * 5);
    const utilizationScore = agentUtilization < 90 ? 100 : Math.max(0, 100 - (agentUtilization - 90) * 5);
    const ageScore = Math.max(0, 100 - queueAge);

    const healthScore = Math.round((slaScore * 0.3 + blockageScore * 0.25 + velocityScore * 0.2 + utilizationScore * 0.15 + ageScore * 0.1));

    return {
      queueId: queue.queueId,
      healthScore,
      indicators: {
        slaBreachRate: Math.round(slaBreachRate),
        blockageRate: Math.round(blockageRate),
        velocity,
        agentUtilization,
        queueAge,
      },
      trends: {
        completionRate: randomElement(['IMPROVING', 'STABLE', 'DECLINING']),
        slaPerformance: randomElement(['IMPROVING', 'STABLE', 'DECLINING']),
        backlogTrend: randomElement(['GROWING', 'STABLE', 'SHRINKING']),
      },
      calculatedAt: new Date().toISOString(),
    };
  });
};

// ----------------------------------------------------------------------------
// Generate Mock Alerts
// ----------------------------------------------------------------------------

const generateMockAlerts = (queues: OutreachQueue[], healthScores: QueueHealth[]): QueueAlert[] => {
  const alerts: QueueAlert[] = [];

  // Generate SLA breach alerts
  const slaBreachedQueues = queues.filter((q) => q.slaTracking.breached > 0);
  slaBreachedQueues.forEach((queue) => {
    alerts.push({
      alertId: `alert-sla-${queue.queueId}`,
      severity: queue.slaTracking.breached > 5 ? 'CRITICAL' : 'WARNING',
      type: 'SLA_BREACH',
      title: `${queue.slaTracking.breached} tasks with breached SLA`,
      message: `Queue "${queue.queueName}" has ${queue.slaTracking.breached} tasks that have exceeded their SLA deadline.`,
      affectedQueueId: queue.queueId,
      createdAt: new Date(Date.now() - randomInt(0, 60) * 60 * 1000).toISOString(),
    });
  });

  // Generate high blockage alerts
  const blockedQueues = healthScores.filter((h) => h.indicators.blockageRate > 20);
  blockedQueues.forEach((health) => {
    const queue = queues.find((q) => q.queueId === health.queueId)!;
    alerts.push({
      alertId: `alert-block-${queue.queueId}`,
      severity: health.indicators.blockageRate > 40 ? 'CRITICAL' : 'WARNING',
      type: 'HIGH_BLOCKAGE',
      title: `High blockage rate: ${health.indicators.blockageRate}%`,
      message: `Queue "${queue.queueName}" has ${health.indicators.blockageRate}% of tasks blocked, requiring attention.`,
      affectedQueueId: queue.queueId,
      createdAt: new Date(Date.now() - randomInt(0, 120) * 60 * 1000).toISOString(),
    });
  });

  // Generate agent shortage alerts
  const busyQueues = queues.filter((q) => q.assignedAgents < 3 && q.status === 'ACTIVE');
  busyQueues.forEach((queue) => {
    alerts.push({
      alertId: `alert-agent-${queue.queueId}`,
      severity: 'WARNING',
      type: 'AGENT_SHORTAGE',
      title: `Low agent assignment`,
      message: `Queue "${queue.queueName}" has only ${queue.assignedAgents} agents assigned for ${queue.stats.inProgressTasks} active tasks.`,
      affectedQueueId: queue.queueId,
      createdAt: new Date(Date.now() - randomInt(0, 180) * 60 * 1000).toISOString(),
    });
  });

  // Generate backlog alerts
  const largeBacklogs = queues.filter((q) => q.stats.pendingTasks > 20);
  largeBacklogs.forEach((queue) => {
    alerts.push({
      alertId: `alert-backlog-${queue.queueId}`,
      severity: 'INFO',
      type: 'QUEUE_BACKLOG',
      title: `Growing backlog: ${queue.stats.pendingTasks} pending`,
      message: `Queue "${queue.queueName}" has a large backlog of pending tasks that need attention.`,
      affectedQueueId: queue.queueId,
      createdAt: new Date(Date.now() - randomInt(0, 240) * 60 * 1000).toISOString(),
    });
  });

  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
};

// ----------------------------------------------------------------------------
// Generate Mock Campaign Creation Source
// ----------------------------------------------------------------------------

export const generateMockCampaignSource = (): CampaignCreationSource => {
  return {
    sourceType: 'DATA_IMPORT',
    sourceData: {
      importedProviderCount: randomInt(50, 500),
    },
    providers: Array.from({ length: 10 }, (_, i) => ({
      providerId: `provider-source-${i + 1}`,
      providerIdentifier: `PRV${String(i + 1).padStart(6, '0')}`,
      providerState: randomElement(['CA', 'NY', 'TX', 'FL', 'IL']),
      accountName: randomElement(['Acme Health', 'MedCare Plus', 'HealthFirst', 'Premier Medical']),
      dataQuality: randomElement(['COMPLETE', 'PARTIAL', 'MINIMAL']),
    })),
  };
};

// ----------------------------------------------------------------------------
// Generate Full Dashboard
// ----------------------------------------------------------------------------

const mockDashboardCache: { data: QueueMonitoringDashboard | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

export const getMockQueueDashboard = (): QueueMonitoringDashboard => {
  const now = Date.now();
  const cacheAge = now - mockDashboardCache.timestamp;

  // Use cache if less than 5 seconds old
  if (mockDashboardCache.data && cacheAge < 5000) {
    return mockDashboardCache.data;
  }

  const tasks = getMockTasks();
  const queues = generateMockQueues(tasks);
  const agents = generateMockAgents(tasks);
  const healthScores = generateMockHealthScores(queues);
  const alerts = generateMockAlerts(queues, healthScores);

  const activeAgents = agents.filter((a) => ['ONLINE', 'ON_CALL'].includes(a.status));

  const dashboard: QueueMonitoringDashboard = {
    summary: {
      totalActiveQueues: queues.filter((q) => q.status === 'ACTIVE').length,
      totalActiveAgents: activeAgents.length,
      totalTasksInSystem: tasks.filter((t) =>
        !['VERIFIED', 'CLOSED_PARTIAL', 'FAILED'].includes(t.status)
      ).length,
      tasksCompletedToday: randomInt(50, 200),
      overallContactRate: randomInt(40, 60),
      overallVerificationRate: randomInt(50, 70),
    },
    queues,
    agents,
    healthScores,
    alerts,
    lastUpdatedAt: new Date().toISOString(),
  };

  mockDashboardCache.data = dashboard;
  mockDashboardCache.timestamp = now;

  return dashboard;
};

export const getMockQueueById = (queueId: string): OutreachQueue | undefined => {
  const dashboard = getMockQueueDashboard();
  return dashboard.queues.find((q) => q.queueId === queueId);
};

export const getMockAgentById = (agentId: string): AgentStatus | undefined => {
  const dashboard = getMockQueueDashboard();
  return dashboard.agents.find((a) => a.agentId === agentId);
};
