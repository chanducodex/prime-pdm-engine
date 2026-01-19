// ============================================================================
// Outreach Management - Custom Hooks
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  OutreachFilters,
  OutreachSummary,
  OutreachTask,
  OutreachTaskDetails,
  ExplainabilityBundle,
  OutreachTableState,
  OutreachRole,
} from '../outreach-types';
import {
  fetchOutreachSummary,
  fetchOutreachTasks,
  fetchOutreachTaskDetails,
  fetchOutreachExplainability,
  reassignOutreachTasks,
  escalateOutreachTask,
  retryOutreachTask,
  switchOutreachMethod,
  pauseOutreachTasks,
  sendSelfServiceLink,
  applyDNC,
  closePartialOutreach,
} from '../outreach-api';

// ----------------------------------------------------------------------------
// useOutreachSummary
// ----------------------------------------------------------------------------

export interface UseOutreachSummaryResult {
  summary: OutreachSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOutreachSummary = (filters: OutreachFilters): UseOutreachSummaryResult => {
  const [summary, setSummary] = useState<OutreachSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetchOutreachSummary(filters);

    if (response.success && response.data) {
      setSummary(response.data);
    } else {
      setError(response.error || 'Failed to fetch summary');
    }

    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refetch: fetchSummary,
  };
};

// ----------------------------------------------------------------------------
// useOutreachTasks
// ----------------------------------------------------------------------------

export interface UseOutreachTasksResult {
  tasks: OutreachTask[];
  total: number;
  isLoading: boolean;
  error: string | null;
  tableState: OutreachTableState;
  setTableState: (state: Partial<OutreachTableState>) => void;
  refetch: () => void;
}

export const useOutreachTasks = (filters: OutreachFilters, initialPageSize: number = 20) => {
  const [tasks, setTasks] = useState<OutreachTask[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableState, setTableStateInternal] = useState<OutreachTableState>({
    selectedTaskIds: [],
    sortColumn: undefined,
    sortDirection: 'asc',
    page: 1,
    pageSize: initialPageSize,
  });

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetchOutreachTasks(
      filters,
      tableState.page,
      tableState.pageSize,
      tableState.sortColumn,
      tableState.sortDirection
    );

    if (response.success && response.data) {
      setTasks(response.data.data);
      setTotal(response.data.total);
    } else {
      setError(response.error || 'Failed to fetch tasks');
    }

    setIsLoading(false);
  }, [filters, tableState.page, tableState.pageSize, tableState.sortColumn, tableState.sortDirection]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const setTableState = useCallback((updates: Partial<OutreachTableState>) => {
    setTableStateInternal((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    tasks,
    total,
    isLoading,
    error,
    tableState,
    setTableState,
    refetch: fetchTasks,
  };
};

// ----------------------------------------------------------------------------
// useOutreachTaskDetails
// ----------------------------------------------------------------------------

export interface UseOutreachTaskDetailsResult {
  details: OutreachTaskDetails | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOutreachTaskDetails = (taskId: string | null): UseOutreachTaskDetailsResult => {
  const [details, setDetails] = useState<OutreachTaskDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!taskId) {
      setDetails(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await fetchOutreachTaskDetails(taskId);

    if (response.success && response.data) {
      setDetails(response.data);
    } else {
      setError(response.error || 'Failed to fetch task details');
    }

    setIsLoading(false);
  }, [taskId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    details,
    isLoading,
    error,
    refetch: fetchDetails,
  };
};

// ----------------------------------------------------------------------------
// useOutreachExplainability
// ----------------------------------------------------------------------------

export interface UseOutreachExplainabilityResult {
  explainability: ExplainabilityBundle | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOutreachExplainability = (taskId: string | null): UseOutreachExplainabilityResult => {
  const [explainability, setExplainability] = useState<ExplainabilityBundle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplainability = useCallback(async () => {
    if (!taskId) {
      setExplainability(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await fetchOutreachExplainability(taskId);

    if (response.success && response.data) {
      setExplainability(response.data);
    } else {
      setError(response.error || 'Failed to fetch explainability');
    }

    setIsLoading(false);
  }, [taskId]);

  useEffect(() => {
    fetchExplainability();
  }, [fetchExplainability]);

  return {
    explainability,
    isLoading,
    error,
    refetch: fetchExplainability,
  };
};

// ----------------------------------------------------------------------------
// useOutreachActions
// ----------------------------------------------------------------------------

export interface UseOutreachActionsResult {
  reassign: (taskIds: string[], targetType: 'agent' | 'queue', targetId: string, reason: string) => Promise<boolean>;
  escalate: (taskIds: string[], targetQueue: 'supervisor' | 'research', reason: string) => Promise<boolean>;
  retry: (taskId: string, scheduledAt?: string) => Promise<boolean>;
  switchMethod: (taskId: string, fromMethod: string, toMethod: string, reason: string, override?: boolean) => Promise<boolean>;
  pause: (taskIds: string[], ttlMinutes: number, reason: string) => Promise<boolean>;
  sendSelfService: (taskId: string) => Promise<boolean>;
  applyDNC: (taskId: string, scope: 'account' | 'global', reason: string) => Promise<boolean>;
  closePartial: (taskId: string, reason: string, evidenceSummary: string) => Promise<boolean>;
  isActionInProgress: boolean;
  actionError: string | null;
}

export const useOutreachActions = (): UseOutreachActionsResult => {
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reassign = useCallback(
    async (taskIds: string[], targetType: 'agent' | 'queue', targetId: string, reason: string): Promise<boolean> => {
      setIsActionInProgress(true);
      setActionError(null);

      const response = await reassignOutreachTasks({ taskIds, targetType, targetId, reason });

      setIsActionInProgress(false);

      if (response.success) {
        return true;
      } else {
        setActionError(response.error || 'Failed to reassign');
        return false;
      }
    },
    []
  );

  const escalate = useCallback(
    async (taskIds: string[], targetQueue: 'supervisor' | 'research', reason: string): Promise<boolean> => {
      setIsActionInProgress(true);
      setActionError(null);

      const response = await escalateOutreachTask({ taskIds, targetQueue, reason });

      setIsActionInProgress(false);

      if (response.success) {
        return true;
      } else {
        setActionError(response.error || 'Failed to escalate');
        return false;
      }
    },
    []
  );

  const retry = useCallback(async (taskId: string, scheduledAt?: string): Promise<boolean> => {
    setIsActionInProgress(true);
    setActionError(null);

    const response = await retryOutreachTask({ taskId, scheduledAt });

    setIsActionInProgress(false);

    if (response.success) {
      return true;
    } else {
      setActionError(response.error || 'Failed to retry');
      return false;
    }
  }, []);

  const switchMethod = useCallback(
    async (
      taskId: string,
      fromMethod: string,
      toMethod: string,
      reason: string,
      override?: boolean
    ): Promise<boolean> => {
      setIsActionInProgress(true);
      setActionError(null);

      const response = await switchOutreachMethod({
        taskId,
        fromMethod: fromMethod as any,
        toMethod: toMethod as any,
        reason,
        override,
      });

      setIsActionInProgress(false);

      if (response.success) {
        return true;
      } else {
        setActionError(response.error || 'Failed to switch method');
        return false;
      }
    },
    []
  );

  const pause = useCallback(async (taskIds: string[], ttlMinutes: number, reason: string): Promise<boolean> => {
    setIsActionInProgress(true);
    setActionError(null);

    const response = await pauseOutreachTasks({ taskIds, ttlMinutes, reason });

    setIsActionInProgress(false);

    if (response.success) {
      return true;
    } else {
      setActionError(response.error || 'Failed to pause');
      return false;
    }
  }, []);

  const sendSelfService = useCallback(async (taskId: string): Promise<boolean> => {
    setIsActionInProgress(true);
    setActionError(null);

    const response = await sendSelfServiceLink({ taskId });

    setIsActionInProgress(false);

    if (response.success) {
      return true;
    } else {
      setActionError(response.error || 'Failed to send self-service link');
      return false;
    }
  }, []);

  const applyDNCAction = useCallback(
    async (taskId: string, scope: 'account' | 'global', reason: string): Promise<boolean> => {
      setIsActionInProgress(true);
      setActionError(null);

      const response = await applyDNC({ taskId, scope, reason });

      setIsActionInProgress(false);

      if (response.success) {
        return true;
      } else {
        setActionError(response.error || 'Failed to apply DNC');
        return false;
      }
    },
    []
  );

  const closePartial = useCallback(
    async (taskId: string, reason: string, evidenceSummary: string): Promise<boolean> => {
      setIsActionInProgress(true);
      setActionError(null);

      const response = await closePartialOutreach({ taskId, reason, evidenceSummary });

      setIsActionInProgress(false);

      if (response.success) {
        return true;
      } else {
        setActionError(response.error || 'Failed to close partial');
        return false;
      }
    },
    []
  );

  return {
    reassign,
    escalate,
    retry,
    switchMethod,
    pause,
    sendSelfService,
    applyDNC: applyDNCAction,
    closePartial,
    isActionInProgress,
    actionError,
  };
};

// ----------------------------------------------------------------------------
// useOutreachFilters
// ----------------------------------------------------------------------------

export const useOutreachFilters = (defaultFilters?: OutreachFilters) => {
  const [filters, setFilters] = useState<OutreachFilters>(defaultFilters || {});

  const updateFilter = useCallback(<K extends keyof OutreachFilters>(key: K, value: OutreachFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = Object.keys(filters).length > 0;

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};

// ----------------------------------------------------------------------------
// useOutreachRBAC
// ----------------------------------------------------------------------------

export const useOutreachRBAC = (role: OutreachRole) => {
  const getPermissions = useCallback(() => {
    // Import permissions mapping
    const { ROLE_PERMISSIONS } = require('../outreach-types');
    return ROLE_PERMISSIONS[role];
  }, [role]);

  const canPerformAction = useCallback(
    (action: keyof ReturnType<typeof getPermissions>): boolean => {
      const permissions = getPermissions();
      return permissions[action];
    },
    [getPermissions]
  );

  return {
    permissions: getPermissions(),
    canPerformAction,
  };
};
