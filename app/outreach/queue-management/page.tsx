// ============================================================================
// Validation Campaign Management - Provider Data Validation Dashboard
// Manage validation campaigns for payer-initiated provider data updates
// ============================================================================

'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  OutreachQueue,
  QueueHealth,
  NewCampaignConfig,
  QueueFilters,
} from '@/lib/outreach-queue-types';
import { QueueDashboardSettings } from '@/components/outreach/queue-settings-drawer';
import {
  getMockQueueDashboard,
} from '@/lib/outreach-queue-mock-data';
import { QueueCampaignDrawer, ACCOUNTS, CYCLES } from '@/components/outreach/queue-campaign-drawer';
import { QueueSettingsDrawer } from '@/components/outreach/queue-settings-drawer';
import { QueueFilterPopup } from '@/components/outreach/queue-filter-popup';
import { QueueBulkActions } from '@/components/outreach/queue-bulk-actions';
import { KPICard } from '@/components/outreach/queue-management/kpi-card';
import { QueueCard } from '@/components/outreach/queue-management/queue-card';
import { AgentCard } from '@/components/outreach/queue-management/agent-card';
import { AlertBanner } from '@/components/outreach/queue-management/alert-banner';
import {
  Activity,
  BarChart3,
  Filter,
  RefreshCw,
  Settings,
  Plus,
  Search,
  X,
  ChevronLeft,
  Users,
  Clock,
  Target,
  CheckCircle,
} from 'lucide-react';

// ============================================================================
// Main Page Component
// ============================================================================

function ValidationCampaignDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editQueueId = searchParams?.get('edit');

  // Initialize with empty data to avoid hydration mismatch (mock data uses random values)
  const [dashboard, setDashboard] = useState<ReturnType<typeof getMockQueueDashboard> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load mock data only on client side to prevent hydration mismatch
  useEffect(() => {
    setDashboard(getMockQueueDashboard());
    setIsLoading(false);
  }, []);

  const [selectedTab, setSelectedTab] = useState<'overview' | 'queues' | 'agents'>(() => {
    // If edit param is present, default to queues tab
    return editQueueId ? 'queues' : 'overview';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<OutreachQueue | undefined>(undefined);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Handle edit param - open drawer when editing
  useEffect(() => {
    if (editQueueId && dashboard) {
      const queue = dashboard.queues.find((q) => q.queueId === editQueueId);
      if (queue) {
        setSelectedQueue(queue);
        setDrawerMode('edit');
        setIsNewCampaignModalOpen(true);
      }
    }
  }, [editQueueId, dashboard]);

  // Clear edit query param when drawer closes
  useEffect(() => {
    if (!isNewCampaignModalOpen && editQueueId) {
      router.replace('/outreach/queue-management', { scroll: false });
    }
  }, [isNewCampaignModalOpen, editQueueId, router]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // New state for features
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterButtonRef, setFilterButtonRef] = useState<HTMLButtonElement | null>(null);
  const [selectedQueues, setSelectedQueues] = useState<OutreachQueue[]>([]);
  const [isBulkActionInProgress, setIsBulkActionInProgress] = useState(false);
  const [queueFilters, setQueueFilters] = useState<QueueFilters>({});
  const [dashboardSettings, setDashboardSettings] = useState<QueueDashboardSettings>({
    defaultView: 'overview',
    autoRefreshInterval: 30,
    showKPIs: true,
    showAlerts: true,
    queueCardSize: 'standard',
    showHealthScores: true,
    showSLAIndicator: true,
    showAgentCount: true,
    agentCardSize: 'standard',
    showAgentCapacity: true,
    showAgentStats: true,
    alertThresholds: {
      slaBreachRate: 10,
      blockageRate: 20,
      lowAgentCount: 3,
      backlogSize: 50,
    },
    enableNotifications: true,
    notificationSound: false,
    defaultExportFormat: 'CSV',
    includeTimestamp: true,
    maxQueuesPerPage: 12,
    maxAgentsPerPage: 20,
  });

  // Auto-refresh based on settings (default 30 seconds if not set)
  // DISABLED: Commented out to prevent frequent screen refreshes
  // useEffect(() => {
  //   const intervalMs = (dashboardSettings?.autoRefreshInterval || 30) * 1000;
  //   if (intervalMs === 0) return; // Disabled

  //   const interval = setInterval(() => {
  //     setDashboard(getMockQueueDashboard());
  //     setLastRefresh(new Date());
  //   }, intervalMs);
  //   return () => clearInterval(interval);
  // }, [dashboardSettings?.autoRefreshInterval]);

  const handleRefresh = useCallback(() => {
    setDashboard(getMockQueueDashboard());
    setLastRefresh(new Date());
  }, []);

  const handleDismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  }, []);

  const handleSaveCampaign = useCallback((config: NewCampaignConfig) => {
    // Handle Edit Mode - Update existing queue
    if (drawerMode === 'edit' && selectedQueue) {
      setDashboard((prev) => {
        if (!prev) return prev;

        const updatedQueue: OutreachQueue = {
          ...selectedQueue,
          queueName: config.campaignName,
          description: config.description,
          accountId: config.accountId,
          accountName: ACCOUNTS.find(a => a.id === config.accountId)?.name || selectedQueue.accountName,
          cycleId: config.cycleId,
          cycleName: CYCLES.find(c => c.id === config.cycleId)?.name || selectedQueue.cycleName,
          priorityTier: config.priorityTier,
          config: {
            ...selectedQueue.config,
            primaryMethod: config.primaryMethod,
            strategyVersion: config.strategyVersion,
            maxAttempts: config.maxAttempts,
            cooldownMinutes: config.cooldownMinutes,
            slaHours: config.slaHours,
            callWindowStart: config.callWindowStart,
            callWindowEnd: config.callWindowEnd,
            startTime: config.startTime,
            notes: config.notes,
            reportAutomation: config.reportAutomation,
            qaIntegration: config.qaIntegration,
            callRecording: config.callRecording,
            performanceMonitoring: config.performanceMonitoring,
          },
          assignedQueue: config.assignedQueue,
          assignedAgentNames: config.assignedAgents || [],
          lastUpdatedAt: new Date().toISOString(),
        };

        return {
          ...prev,
          queues: prev.queues.map((q) =>
            q.queueId === selectedQueue.queueId ? updatedQueue : q
          ),
        };
      });

      console.log('Campaign updated:', config);
      console.log('Updated queue:', selectedQueue.queueId);
      return;
    }

    // Handle Create Mode - Create new queue
    const newQueue: OutreachQueue = {
      queueId: `queue-${Date.now()}`,
      queueName: config.campaignName,
      queueType: 'CAMPAIGN',
      status: 'ACTIVE',
      accountId: config.accountId,
      accountName: ACCOUNTS.find(a => a.id === config.accountId)?.name || 'Unknown Account',
      cycleId: config.cycleId,
      cycleName: CYCLES.find(c => c.id === config.cycleId)?.name || 'Unknown Cycle',
      priorityTier: config.priorityTier,
      description: config.description,
      config: {
        primaryMethod: config.primaryMethod,
        strategyVersion: config.strategyVersion,
        maxAttempts: config.maxAttempts,
        cooldownMinutes: config.cooldownMinutes,
        slaHours: config.slaHours,
        callWindowStart: config.callWindowStart,
        callWindowEnd: config.callWindowEnd,
        startTime: config.startTime,
        notes: config.notes,
        reportAutomation: config.reportAutomation,
        qaIntegration: config.qaIntegration,
        callRecording: config.callRecording,
        performanceMonitoring: config.performanceMonitoring,
      },
      stats: {
        totalTasks: config.source.sourceData?.importedProviderCount || 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: config.source.sourceData?.importedProviderCount || 0,
        blockedTasks: 0,
        verifiedTasks: 0,
        contactRate: 0,
        verificationRate: 0,
        avgAttemptsPerTask: 0,
      },
      priorityDistribution: {
        p0: config.priorityTier === 'P0' ? (config.source.sourceData?.importedProviderCount || 0) : 0,
        p1: config.priorityTier === 'P1' ? (config.source.sourceData?.importedProviderCount || 0) : 0,
        p2: config.priorityTier === 'P2' ? (config.source.sourceData?.importedProviderCount || 0) : 0,
      },
      slaTracking: {
        onTrack: config.source.sourceData?.importedProviderCount || 0,
        atRisk: 0,
        breached: 0,
      },
      assignedAgents: config.assignedAgents?.length || 0,
      assignedAgentNames: config.assignedAgents || [],
      assignedQueues: config.assignedQueue ? [config.assignedQueue] : [],
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    // Create initial health score
    const newHealth: QueueHealth = {
      queueId: newQueue.queueId,
      healthScore: 100,
      indicators: {
        slaBreachRate: 0,
        blockageRate: 0,
        velocity: 0,
        agentUtilization: 0,
        queueAge: 0,
      },
      trends: {
        completionRate: 'STABLE',
        slaPerformance: 'STABLE',
        backlogTrend: 'STABLE',
      },
      calculatedAt: new Date().toISOString(),
    };

    // Update dashboard with new queue
    setDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        queues: [newQueue, ...prev.queues],
        healthScores: [newHealth, ...prev.healthScores],
        summary: {
          ...prev.summary,
          totalActiveQueues: prev.summary.totalActiveQueues + 1,
        },
      };
    });

    console.log('Campaign created:', config);
    console.log('New queue added:', newQueue);
  }, [drawerMode, selectedQueue]);

  const handlePauseQueue = useCallback((queueId: string) => {
    setDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        queues: prev.queues.map((q) =>
          q.queueId === queueId ? { ...q, status: 'PAUSED' as const } : q
        ),
      };
    });
    console.log('Queue paused:', queueId);
  }, []);

  const handleResumeQueue = useCallback((queueId: string) => {
    setDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        queues: prev.queues.map((q) =>
          q.queueId === queueId ? { ...q, status: 'ACTIVE' as const } : q
        ),
      };
    });
    console.log('Queue resumed:', queueId);
  }, []);

  const handleDeleteQueue = useCallback((queueId: string) => {
    setDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        queues: prev.queues.filter((q) => q.queueId !== queueId),
        healthScores: prev.healthScores.filter((h) => h.queueId !== queueId),
        summary: {
          ...prev.summary,
          totalActiveQueues: Math.max(0, prev.summary.totalActiveQueues - 1),
        },
      };
    });
    console.log('Queue deleted:', queueId);
  }, []);

  const handleDuplicateQueue = useCallback((queueId: string) => {
    if (!dashboard) return;
    const queueToDuplicate = dashboard.queues.find((q) => q.queueId === queueId);
    if (queueToDuplicate) {
      const duplicatedQueue: OutreachQueue = {
        ...queueToDuplicate,
        queueId: `queue-${Date.now()}`,
        queueName: `${queueToDuplicate.queueName} (Copy)`,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      };
      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          queues: [duplicatedQueue, ...prev.queues],
        };
      });
      console.log('Queue duplicated:', duplicatedQueue);
    }
  }, [dashboard]);

  const handleEditQueue = useCallback((queue: OutreachQueue) => {
    setSelectedQueue(queue);
    setDrawerMode('edit');
    setIsNewCampaignModalOpen(true);
  }, []);

  const handleNewCampaign = useCallback(() => {
    setSelectedQueue(undefined);
    setDrawerMode('create');
    setIsNewCampaignModalOpen(true);
  }, []);

  // New feature handlers
  const handleSettingsSave = useCallback((settings: QueueDashboardSettings) => {
    setDashboardSettings(settings);
    console.log('Settings saved:', settings);
  }, []);

  const handleFilterUpdate = useCallback(<K extends keyof QueueFilters>(key: K, value: QueueFilters[K]) => {
    setQueueFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueueFilters({});
  }, []);

  const handleBulkAction = useCallback(async (action: string, data: any) => {
    if (!dashboard) return;
    setIsBulkActionInProgress(true);
    console.log('Bulk action:', action, data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    switch (action) {
      case 'pause':
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            queues: prev.queues.map((q) =>
              data.queueIds.includes(q.queueId) ? { ...q, status: 'PAUSED' as const } : q
            ),
          };
        });
        break;
      case 'resume':
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            queues: prev.queues.map((q) =>
              data.queueIds.includes(q.queueId) ? { ...q, status: 'ACTIVE' as const } : q
            ),
          };
        });
        break;
      case 'delete':
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            queues: prev.queues.filter((q) => !data.queueIds.includes(q.queueId)),
            healthScores: prev.healthScores.filter((h) => !data.queueIds.includes(h.queueId)),
          };
        });
        break;
      case 'duplicate':
        const newQueues = data.queueIds.map((id: string) => {
          const original = dashboard.queues.find((q) => q.queueId === id);
          if (original) {
            return {
              ...original,
              queueId: `queue-${Date.now()}-${id}`,
              queueName: `${original.queueName} ${data.suffix || '(Copy)'}`,
              status: 'DRAFT' as const,
              createdAt: new Date().toISOString(),
            };
          }
          return null;
        }).filter(Boolean);
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            queues: [...newQueues, ...prev.queues],
          };
        });
        break;
      case 'export':
        console.log('Exporting queues:', data.queueIds);
        // Export logic would go here
        break;
    }

    setIsBulkActionInProgress(false);
    setSelectedQueues([]);
  }, [dashboard]);

  // Toggle queue selection for bulk actions
  const toggleQueueSelection = useCallback((queue: OutreachQueue) => {
    setSelectedQueues((prev) => {
      const isSelected = prev.some((q) => q.queueId === queue.queueId);
      if (isSelected) {
        return prev.filter((q) => q.queueId !== queue.queueId);
      } else {
        return [...prev, queue];
      }
    });
  }, []);

  // Filter data
  const filteredQueues = useMemo(() => {
    if (!dashboard) return [];
    if (!searchQuery) return dashboard.queues;
    return dashboard.queues.filter((q) =>
      q.queueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.cycleName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dashboard, searchQuery]);

  const filteredAgents = useMemo(() => {
    if (!dashboard) return [];
    if (!searchQuery) return dashboard.agents;
    return dashboard.agents.filter((a) =>
      a.agentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dashboard, searchQuery]);

  const activeAlerts = dashboard?.alerts.filter((a) => !dismissedAlerts.has(a.alertId)) ?? [];

  const handleExport = useCallback((format: 'CSV' | 'JSON' | 'EXCEL') => {
    const dataToExport = filteredQueues;
    console.log(`Exporting ${filteredQueues.length} queues as ${format}`, dataToExport);
    // Export logic would go here
  }, [filteredQueues]);

  // Get filter button position for popup
  const filterButtonPosition = filterButtonRef
    ? { top: filterButtonRef.offsetTop + filterButtonRef.offsetHeight + 4, left: filterButtonRef.offsetLeft }
    : undefined;

  // Show loading skeleton while data is being fetched (prevents hydration mismatch)
  if (isLoading || !dashboard) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2" />
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 px-6 py-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        {/* Top row - back button, title, and action buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <a
              href="/outreach"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Worklist</span>
              <span className="sm:hidden">Back</span>
            </a>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">Validation Campaign Dashboard</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 hidden sm:block">
                Monitor and manage provider data validation campaigns and coordinator performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-start lg:justify-end">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={handleNewCampaign}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Campaign</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Tabs - scrollable on small screens */}
        <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden sm:overflow-visible pb-0 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px ${
              selectedTab === 'overview'
                ? 'text-violet-600 border-violet-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('queues')}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px ${
              selectedTab === 'queues'
                ? 'text-violet-600 border-violet-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Campaigns ({filteredQueues.length})
          </button>
          <button
            onClick={() => setSelectedTab('agents')}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px ${
              selectedTab === 'agents'
                ? 'text-violet-600 border-violet-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Coordinators ({filteredAgents.filter((a) => ['ONLINE', 'ON_CALL'].includes(a.status)).length})
          </button>
        </div>

        {/* Search & Filters - stack on small screens */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
          <div className="relative flex-1 sm:max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${selectedTab === 'agents' ? 'coordinators' : 'campaigns'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-start">
            {selectedTab !== 'agents' && (
              <button
                ref={(el) => setFilterButtonRef(el)}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 relative"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {Object.keys(queueFilters).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {Object.keys(queueFilters).length}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Last updated: {lastRefresh.toLocaleTimeString('en-US', { hour12: false })}</span>
              <span className="sm:hidden">{lastRefresh.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {/* Summary KPIs - Only in Overview and when enabled in settings */}
        {selectedTab === 'overview' && (dashboardSettings?.showKPIs !== false) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              title="Active Campaigns"
              value={dashboard.summary.totalActiveQueues}
              icon={Target}
              color="violet"
            />
            <KPICard
              title="Coordinators Online"
              value={dashboard.summary.totalActiveAgents}
              icon={Users}
              color="blue"
            />
            <KPICard
              title="Providers Pending"
              value={dashboard.summary.totalTasksInSystem}
              icon={Activity}
              color="green"
            />
            <KPICard
              title="Validated Today"
              value={dashboard.summary.tasksCompletedToday}
              icon={CheckCircle}
              color="orange"
            />
          </div>
        )}

        {/* Alerts Section - Only in Overview and when enabled in settings */}
        {selectedTab === 'overview' && (dashboardSettings?.showAlerts !== false) && activeAlerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Alerts</h3>
            <div className="space-y-2">
              {activeAlerts.slice(0, 5).map((alert) => (
                <AlertBanner
                  key={alert.alertId}
                  alert={alert}
                  onDismiss={() => handleDismissAlert(alert.alertId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Campaign Overview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Active Campaigns</h3>
                <button
                  onClick={() => setSelectedTab('queues')}
                  className="text-xs text-violet-600 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredQueues.slice(0, 6).map((queue) => {
                  const health = dashboard.healthScores.find((h) => h.queueId === queue.queueId);
                  return <QueueCard
                    key={queue.queueId}
                    queue={queue}
                    health={health}
                    onClick={() => handleEditQueue(queue)}
                    onEdit={handleEditQueue}
                    onPause={handlePauseQueue}
                    onResume={handleResumeQueue}
                    onDelete={handleDeleteQueue}
                    onDuplicate={handleDuplicateQueue}
                    onToggleSelect={toggleQueueSelection}
                    isSelected={selectedQueues.some(q => q.queueId === queue.queueId)}
                    showHealthScore={dashboardSettings?.showHealthScores}
                    showSLAIndicator={dashboardSettings?.showSLAIndicator}
                    showAgentCount={dashboardSettings?.showAgentCount}
                    size={dashboardSettings?.queueCardSize}
                  />;
                })}
              </div>
            </div>

            {/* Coordinator Overview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Active Coordinators</h3>
                <button
                  onClick={() => setSelectedTab('agents')}
                  className="text-xs text-violet-600 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredAgents
                  .filter((a) => ['ONLINE', 'ON_CALL'].includes(a.status))
                  .slice(0, 8)
                  .map((agent) => (
                    <AgentCard
                      key={agent.agentId}
                      agent={agent}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'queues' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">All Campaigns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredQueues.map((queue) => {
                const health = dashboard.healthScores.find((h) => h.queueId === queue.queueId);
                return <QueueCard
                  key={queue.queueId}
                  queue={queue}
                  health={health}
                  onClick={() => handleEditQueue(queue)}
                  onEdit={handleEditQueue}
                  onPause={handlePauseQueue}
                  onResume={handleResumeQueue}
                  onDelete={handleDeleteQueue}
                  onDuplicate={handleDuplicateQueue}
                  onToggleSelect={toggleQueueSelection}
                  isSelected={selectedQueues.some(q => q.queueId === queue.queueId)}
                  showHealthScore={dashboardSettings?.showHealthScores}
                  showSLAIndicator={dashboardSettings?.showSLAIndicator}
                  showAgentCount={dashboardSettings?.showAgentCount}
                  size={dashboardSettings?.queueCardSize}
                />;
              })}
            </div>
          </div>
        )}

        {selectedTab === 'agents' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">All Coordinators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.agentId}
                  agent={agent}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedQueues.length > 0 && (
        <div className="px-6 pb-4">
          <QueueBulkActions
            selectedQueues={selectedQueues}
            onClearSelection={() => setSelectedQueues([])}
            onAction={handleBulkAction}
            isActionInProgress={isBulkActionInProgress}
          />
        </div>
      )}

      {/* Filter Popup */}
      {isFilterOpen && (
        <div className="absolute z-50" style={{ marginTop: '8px' }}>
          <QueueFilterPopup
            filters={queueFilters}
            onUpdateFilter={handleFilterUpdate}
            onClearFilters={handleClearFilters}
            onClose={() => setIsFilterOpen(false)}
            position={filterButtonPosition}
          />
        </div>
      )}

      {/* Campaign Drawer (Create/Edit) */}
      <QueueCampaignDrawer
        isOpen={isNewCampaignModalOpen}
        onClose={() => setIsNewCampaignModalOpen(false)}
        onSave={handleSaveCampaign}
        onPause={handlePauseQueue}
        onResume={handleResumeQueue}
        onDelete={handleDeleteQueue}
        existingQueue={selectedQueue}
        mode={drawerMode}
        campaignSource={{
          importedProviderCount: 150,
          providers: [],
        }}
      />

      {/* Settings Drawer */}
      <QueueSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
        currentSettings={dashboardSettings}
      />
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function QueueManagementPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center bg-gray-50">Loading...</div>}>
      <ValidationCampaignDashboard />
    </Suspense>
  );
}
