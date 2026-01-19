// ============================================================================
// Outreach Management - Mock API Client
// ============================================================================

import {
  OutreachFilters,
  OutreachSummary,
  OutreachTask,
  OutreachTaskDetails,
  ExplainabilityBundle,
  PaginatedResponse,
  ApiResponse,
  ReassignAction,
  EscalateAction,
  RetryAction,
  SwitchMethodAction,
  PauseAction,
  SendSelfServiceAction,
  ApplyDNCAction,
  ClosePartialAction,
  ActionLog,
} from './outreach-types';
import {
  getMockTasks,
  getMockSummary,
  getMockTaskDetails,
  getMockExplainability,
  getMockActionLogs,
} from './outreach-mock-data';

// ----------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const filterTasks = (tasks: OutreachTask[], filters: OutreachFilters): OutreachTask[] => {
  let filtered = [...tasks];

  if (filters.accountId) {
    filtered = filtered.filter((t) => t.accountId === filters.accountId);
  }

  if (filters.cycleId) {
    filtered = filtered.filter((t) => t.cycleId === filters.cycleId);
  }

  if (filters.queueId) {
    filtered = filtered.filter((t) => t.assignedQueue === filters.queueId);
  }

  if (filters.method) {
    filtered = filtered.filter((t) => t.currentMethod === filters.method);
  }

  if (filters.status) {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  if (filters.priorityTier) {
    filtered = filtered.filter((t) => t.priorityTier === filters.priorityTier);
  }

  if (filters.providerState) {
    filtered = filtered.filter((t) => t.providerState === filters.providerState);
  }

  if (filters.blockReason) {
    filtered = filtered.filter((t) => t.blockReason === filters.blockReason);
  }

  if (filters.assignedAgent) {
    filtered = filtered.filter((t) => t.assignedAgent === filters.assignedAgent);
  }

  if (filters.assignedTeam) {
    filtered = filtered.filter((t) => t.assignedQueue === filters.assignedTeam);
  }

  // SLA due filters
  if (filters.slaDue) {
    const now = new Date();
    filtered = filtered.filter((t) => {
      const slaDue = new Date(t.slaDueAt);
      const hoursUntilDue = (slaDue.getTime() - now.getTime()) / (1000 * 60 * 60);

      switch (filters.slaDue) {
        case 'next_4h':
          return hoursUntilDue > 0 && hoursUntilDue <= 4;
        case 'next_24h':
          return hoursUntilDue > 0 && hoursUntilDue <= 24;
        case 'overdue':
          return hoursUntilDue < 0;
        default:
          return true;
      }
    });
  }

  // Last updated filters
  if (filters.lastUpdated) {
    const now = new Date();
    filtered = filtered.filter((t) => {
      const lastUpdated = new Date(t.lastUpdatedAt);
      const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      switch (filters.lastUpdated) {
        case 'stale_24h':
          return hoursSinceUpdate > 24;
        case 'stale_48h':
          return hoursSinceUpdate > 48;
        case 'stale_72h':
          return hoursSinceUpdate > 72;
        default:
          return true;
      }
    });
  }

  // Attempt count threshold
  if (filters.attemptCountThreshold) {
    filtered = filtered.filter((t) => t.attemptSummary.totalAttempts >= filters.attemptCountThreshold!);
  }

  return filtered;
};

const sortTasks = (tasks: OutreachTask[], sortBy?: keyof OutreachTask, sortDir: 'asc' | 'desc' = 'asc'): OutreachTask[] => {
  if (!sortBy) return tasks;

  return [...tasks].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
};

const paginateTasks = (tasks: OutreachTask[], page: number, pageSize: number): PaginatedResponse<OutreachTask> => {
  const total = tasks.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = tasks.slice(start, end);

  return {
    data,
    total,
    page,
    pageSize,
    hasNext: end < total,
    hasPrevious: page > 1,
  };
};

// ----------------------------------------------------------------------------
// Mock API Functions
// ----------------------------------------------------------------------------

/**
 * GET /ops/outreach/summary
 * Fetch summary KPIs for the outreach management screen
 */
export const fetchOutreachSummary = async (filters: OutreachFilters = {}): Promise<ApiResponse<OutreachSummary>> => {
  await delay(300); // Simulate network delay

  try {
    const tasks = getMockTasks();
    const filteredTasks = filterTasks(tasks, filters);
    const summary = generateMockSummary(filteredTasks);

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch summary',
    };
  }
};

/**
 * GET /ops/outreach/tasks
 * Fetch paginated, sortable, filterable list of outreach tasks
 */
export const fetchOutreachTasks = async (
  filters: OutreachFilters = {},
  page: number = 1,
  pageSize: number = 20,
  sortBy?: keyof OutreachTask,
  sortDir: 'asc' | 'desc' = 'asc'
): Promise<ApiResponse<PaginatedResponse<OutreachTask>>> => {
  await delay(400); // Simulate network delay

  try {
    const tasks = getMockTasks();
    let filteredTasks = filterTasks(tasks, filters);
    filteredTasks = sortTasks(filteredTasks, sortBy, sortDir);
    const paginatedTasks = paginateTasks(filteredTasks, page, pageSize);

    return {
      success: true,
      data: paginatedTasks,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks',
    };
  }
};

/**
 * GET /ops/outreach/tasks/{taskId}
 * Fetch detailed information including timeline for a specific task
 */
export const fetchOutreachTaskDetails = async (taskId: string): Promise<ApiResponse<OutreachTaskDetails>> => {
  await delay(300);

  try {
    const details = getMockTaskDetails(taskId);

    if (!details) {
      return {
        success: false,
        error: `Task ${taskId} not found`,
      };
    }

    return {
      success: true,
      data: details,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch task details',
    };
  }
};

/**
 * GET /ops/outreach/tasks/{taskId}/explainability
 * Fetch explainability bundle for a specific task
 */
export const fetchOutreachExplainability = async (taskId: string): Promise<ApiResponse<ExplainabilityBundle>> => {
  await delay(200);

  try {
    const explainability = getMockExplainability(taskId);

    if (!explainability) {
      return {
        success: false,
        error: `Task ${taskId} not found`,
      };
    }

    return {
      success: true,
      data: explainability,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch explainability',
    };
  }
};

/**
 * POST /ops/outreach/tasks/reassign
 * Bulk reassign tasks to an agent or queue
 */
export const reassignOutreachTasks = async (action: ReassignAction): Promise<ApiResponse<void>> => {
  await delay(500);

  try {
    // In a real implementation, this would update the database
    console.log('Reassigning tasks:', action);

    return {
      success: true,
      message: `Successfully reassigned ${action.taskIds.length} task(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reassign tasks',
    };
  }
};

/**
 * POST /ops/outreach/tasks/{taskId}/escalate
 * Escalate a task to supervisor or research queue
 */
export const escalateOutreachTask = async (action: EscalateAction): Promise<ApiResponse<void>> => {
  await delay(400);

  try {
    console.log('Escalating tasks:', action);

    return {
      success: true,
      message: `Successfully escalated ${action.taskIds.length} task(s)`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to escalate task',
    };
  }
};

/**
 * POST /ops/outreach/tasks/{taskId}/retry
 * Trigger a retry for a task
 */
export const retryOutreachTask = async (action: RetryAction): Promise<ApiResponse<void>> => {
  await delay(350);

  try {
    console.log('Retrying task:', action);

    return {
      success: true,
      message: 'Retry scheduled successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retry task',
    };
  }
};

/**
 * POST /ops/outreach/tasks/{taskId}/switch-method
 * Switch the outreach method for a task
 */
export const switchOutreachMethod = async (action: SwitchMethodAction): Promise<ApiResponse<void>> => {
  await delay(400);

  try {
    console.log('Switching method:', action);

    return {
      success: true,
      message: `Successfully switched from ${action.fromMethod} to ${action.toMethod}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to switch method',
    };
  }
};

/**
 * POST /ops/outreach/tasks/{taskId}/pause
 * Pause outreach for tasks with a TTL
 */
export const pauseOutreachTasks = async (action: PauseAction): Promise<ApiResponse<void>> => {
  await delay(350);

  try {
    console.log('Pausing tasks:', action);

    return {
      success: true,
      message: `Successfully paused ${action.taskIds.length} task(s) for ${action.ttlMinutes} minutes`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pause tasks',
    };
  }
};

/**
 * POST /ops/outreach/tasks/{taskId}/send-self-service
 * Send self-service link to provider
 */
export const sendSelfServiceLink = async (action: SendSelfServiceAction): Promise<ApiResponse<void>> => {
  await delay(300);

  try {
    console.log('Sending self-service link:', action);

    return {
      success: true,
      message: 'Self-service link sent successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send self-service link',
    };
  }
};

/**
 * POST /ops/outreach/tasks/{taskId}/apply-dnc
 * Apply DNC (Do Not Contact) restriction to a task
 */
export const applyDNC = async (action: ApplyDNCAction): Promise<ApiResponse<void>> => {
  await delay(400);

  try {
    console.log('Applying DNC:', action);

    return {
      success: true,
      message: `DNC restriction applied (${action.scope})`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply DNC',
    };
  }
};

/**
 * POST /ops/outreach/tasks/{taskId}/close-partial
 * Close a task with partial information
 */
export const closePartialOutreach = async (action: ClosePartialAction): Promise<ApiResponse<void>> => {
  await delay(400);

  try {
    console.log('Closing partial:', action);

    return {
      success: true,
      message: 'Task closed with partial information',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to close task',
    };
  }
};

/**
 * GET /ops/outreach/tasks/{taskId}/action-logs
 * Fetch action logs for a task
 */
export const fetchActionLogs = async (taskId: string): Promise<ApiResponse<ActionLog[]>> => {
  await delay(200);

  try {
    const logs = getMockActionLogs(taskId);

    return {
      success: true,
      data: logs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch action logs',
    };
  }
};

// Helper function needed for summary generation
const generateMockSummary = getMockSummary;
