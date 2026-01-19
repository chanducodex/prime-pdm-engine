// ============================================================================
// Queue Management - Campaign Creation Side Drawer
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Info, Pause, Play, Edit2, ChevronDown, Check, Plus, Eye, Trash2, FileText, Settings, BarChart3, Shield, AlertTriangle } from 'lucide-react';
import { OutreachMethod, PriorityTier } from '@/lib/outreach-types';
import {
  NewCampaignConfig,
  OutreachQueue,
  ReportAutomationConfig,
  QAIntegrationConfig,
  CallRecordingConfig,
  PerformanceMonitoringConfig
} from '@/lib/outreach-queue-types';
import { CycleCreationModal } from './cycle-creation-modal';

interface QueueCampaignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: NewCampaignConfig) => void;
  onPause?: (queueId: string) => void;
  onResume?: (queueId: string) => void;
  onDelete?: (queueId: string) => void;
  existingQueue?: OutreachQueue;
  mode?: 'create' | 'edit';
  campaignSource?: {
    importedProviderCount?: number;
    providers?: Array<{
      providerId: string;
      providerIdentifier: string;
      providerState: string;
      accountName: string;
      dataQuality: 'COMPLETE' | 'PARTIAL' | 'MINIMAL';
    }>;
  };
}

interface Cycle {
  id: string;
  name: string;
}

interface CampaignFormData {
  // Basic Information
  campaignName: string;
  description: string;

  // Client & Cycle
  accountId: string;
  cycleId: string;

  // Outreach Configuration
  primaryMethod: OutreachMethod;
  strategyVersion: string;
  priorityTier: PriorityTier;
  maxAttempts: number;
  cooldownMinutes: number;
  slaHours: number;

  // Call Window Settings
  callWindowStart: string;
  callWindowEnd: string;

  // Assignment
  assignedQueue?: string;
  assignedAgents?: string[];

  // Additional Settings
  startTime?: string;
  notes?: string;

  // Report Automation
  reportAutomationEnabled: boolean;
  reportSchedule: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_COMPLETION';
  reportRecipients: string;
  reportFormat: 'PDF' | 'CSV' | 'EXCEL' | 'DASHBOARD_LINK';
  reportIncludeKPIs: boolean;
  reportIncludeAgentPerf: boolean;
  reportIncludeQASummary: boolean;

  // QA Integration
  qaEnabled: boolean;
  qaSamplingRate: number;
  qaRequiredScore?: number;
  qaReviewers: string[];
  qaAutoFlag: boolean;
  qaFlagThreshold: number;

  // Call Recording
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  sentimentEnabled: boolean;
  recordingRetentionDays: number;
  recordAllCalls: boolean;

  // Performance Monitoring
  perfMonitoringEnabled: boolean;
  coachingEnabled: boolean;
  minContactRate?: number;
  minVerificationRate?: number;
  maxSlaBreach?: number;
  minQAScore?: number;
  alertRecipients: string;
}

export const ACCOUNTS = [
  { id: 'account-1', name: 'Acme Health' },
  { id: 'account-2', name: 'MedCare Plus' },
  { id: 'account-3', name: 'HealthFirst' },
  { id: 'account-4', name: 'Premier Medical' },
  { id: 'account-5', name: 'United Health' },
];

export const CYCLES: Cycle[] = [
  {
    id: 'cycle-1',
    name: 'Q1 2025',
    filterData: {
      cycleName: 'Q1 2025',
      selectedFilters: {
        stateId: ['19', '1', '5'],
      },
      includeAll: false,
    },
  },
  {
    id: 'cycle-2',
    name: 'Q4 2024',
    filterData: {
      cycleName: 'Q4 2024',
      selectedFilters: {
        locationStatus: true,
      },
      includeAll: false,
    },
  },
  {
    id: 'cycle-3',
    name: 'Q3 2024 - CA Providers Only',
    filterData: {
      cycleName: 'Q3 2024 - CA Providers Only',
      selectedFilters: {
        stateId: ['5'],
      },
      includeAll: false,
    },
  },
  {
    id: 'cycle-4',
    name: 'Q2 2024 - Active Locations',
    filterData: {
      cycleName: 'Q2 2024 - Active Locations',
      selectedFilters: {
        locationStatus: true,
      },
      includeAll: false,
    },
  },
  {
    id: 'cycle-5',
    name: 'Special Enrollment 2024',
    filterData: {
      cycleName: 'Special Enrollment 2024',
      selectedFilters: {
        healthPlanId: ['340', '341', '343'],
        splId: ['420', '422'],
      },
      includeAll: false,
    },
  },
];

interface Cycle {
  id: string;
  name: string;
  filterData?: {
    cycleName: string;
    selectedFilters: Record<string, string[] | boolean>;
    includeAll: boolean;
  };
}

const AGENTS = ['Sarah Chen', 'Michael Rodriguez', 'Emily Watson', 'David Kim', 'Jessica Martinez'];
const METHODS: OutreachMethod[] = ['AI_CALL', 'HUMAN_CALL', 'EMAIL', 'SELF_SERVICE'];
const PRIORITIES: PriorityTier[] = ['P0', 'P1', 'P2'];
const STRATEGY_VERSIONS = [
  { value: 'v1.0.0', label: 'v1.0.0 (Standard)', description: 'Balanced approach with standard AI behavior' },
  { value: 'v2.0.0', label: 'v2.0.0 (Enhanced AI)', description: 'Improved AI with better context understanding' },
  { value: 'v3.0.0', label: 'v3.0.0 (Aggressive)', description: 'Maximum outreach frequency' },
];

export const QueueCampaignDrawer: React.FC<QueueCampaignDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  onPause,
  onResume,
  onDelete,
  existingQueue,
  mode = 'create',
  campaignSource,
}) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    campaignName: '',
    description: '',
    accountId: '',
    cycleId: '',
    primaryMethod: 'AI_CALL',
    strategyVersion: 'v1.0.0',
    priorityTier: 'P1',
    maxAttempts: 5,
    cooldownMinutes: 60,
    slaHours: 72,
    callWindowStart: '08:00',
    callWindowEnd: '18:00',
    assignedQueue: undefined,
    assignedAgents: [],
    startTime: undefined,
    notes: '',

    // Report Automation defaults
    reportAutomationEnabled: false,
    reportSchedule: 'ON_COMPLETION',
    reportRecipients: '',
    reportFormat: 'PDF',
    reportIncludeKPIs: true,
    reportIncludeAgentPerf: true,
    reportIncludeQASummary: true,

    // QA Integration defaults
    qaEnabled: false,
    qaSamplingRate: 10,
    qaRequiredScore: undefined,
    qaReviewers: [],
    qaAutoFlag: true,
    qaFlagThreshold: 60,

    // Call Recording defaults
    recordingEnabled: true,
    transcriptionEnabled: true,
    sentimentEnabled: true,
    recordingRetentionDays: 90,
    recordAllCalls: false,

    // Performance Monitoring defaults
    perfMonitoringEnabled: true,
    coachingEnabled: true,
    minContactRate: undefined,
    minVerificationRate: undefined,
    maxSlaBreach: undefined,
    minQAScore: undefined,
    alertRecipients: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CampaignFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [cycles, setCycles] = useState<Cycle[]>(CYCLES);

  // Ref to store initial form state for unsaved changes detection
  const initialFormDataRef = React.useRef<CampaignFormData | null>(null);
  const isInitializedRef = React.useRef(false);

  // Update initial form ref when drawer opens or mode changes
  useEffect(() => {
    if (isOpen) {
      // Reset validation state when opening
      setValidationAttempted(false);
      isInitializedRef.current = false;

      // For create mode, initialize immediately with default form data
      if (mode === 'create') {
        initialFormDataRef.current = { ...formData };
        setHasUnsavedChanges(false);
        isInitializedRef.current = true;
      }
    }
  }, [isOpen, mode]);

  // Check for unsaved changes when form data updates
  useEffect(() => {
    // Skip check if not initialized or drawer not open
    if (!isOpen || !isInitializedRef.current) {
      return;
    }

    if (initialFormDataRef.current) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormDataRef.current);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, isOpen]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPaused, setIsPaused] = useState(existingQueue?.status === 'PAUSED');
  const [showAgentsDropdown, setShowAgentsDropdown] = useState(false);
  const [showCycleCreationModal, setShowCycleCreationModal] = useState(false);
  const [cycleModalMode, setCycleModalMode] = useState<'create' | 'view'>('create');
  const [viewCycleData, setViewCycleData] = useState<{ cycleName: string; selectedFilters: Record<string, string[] | boolean>; includeAll: boolean } | null>(null);
  const agentsDropdownRef = React.useRef<HTMLDivElement>(null);

  // Tab state
  type TabKey = 'basic' | 'outreach' | 'reports' | 'monitoring';
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: 'basic', label: 'Basic Info', icon: <FileText className="w-4 h-4" /> },
    { key: 'outreach', label: 'Outreach Config', icon: <Settings className="w-4 h-4" /> },
    { key: 'reports', label: 'Reports & QA', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'monitoring', label: 'Monitoring', icon: <Shield className="w-4 h-4" /> },
  ];

  // Load existing queue data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingQueue) {
      const reportAuto = existingQueue.config.reportAutomation;
      const qaInt = existingQueue.config.qaIntegration;
      const callRec = existingQueue.config.callRecording;
      const perfMon = existingQueue.config.performanceMonitoring;

      const loadedData: CampaignFormData = {
        campaignName: existingQueue.queueName,
        description: existingQueue.description || '',
        accountId: existingQueue.accountId,
        cycleId: existingQueue.cycleId,
        primaryMethod: existingQueue.config.primaryMethod,
        strategyVersion: existingQueue.config.strategyVersion,
        priorityTier: existingQueue.priorityTier || 'P1',
        maxAttempts: existingQueue.config.maxAttempts,
        cooldownMinutes: existingQueue.config.cooldownMinutes,
        slaHours: existingQueue.config.slaHours,
        callWindowStart: existingQueue.config.callWindowStart || '08:00',
        callWindowEnd: existingQueue.config.callWindowEnd || '18:00',
        assignedQueue: existingQueue.assignedQueue,
        assignedAgents: existingQueue.assignedAgentNames || [],
        startTime: existingQueue.config.startTime,
        notes: existingQueue.config.notes || '',

        // Report Automation
        reportAutomationEnabled: reportAuto?.enabled ?? false,
        reportSchedule: reportAuto?.schedule ?? 'ON_COMPLETION',
        reportRecipients: reportAuto?.recipients?.join(', ') ?? '',
        reportFormat: reportAuto?.format ?? 'PDF',
        reportIncludeKPIs: reportAuto?.includeKPIs ?? true,
        reportIncludeAgentPerf: reportAuto?.includeAgentPerformance ?? true,
        reportIncludeQASummary: reportAuto?.includeQASummary ?? true,

        // QA Integration
        qaEnabled: qaInt?.enabled ?? false,
        qaSamplingRate: qaInt?.samplingRate ?? 10,
        qaRequiredScore: qaInt?.requiredQAScoreThreshold,
        qaReviewers: qaInt?.assignedQAReviewers ?? [],
        qaAutoFlag: qaInt?.autoFlagLowScore ?? true,
        qaFlagThreshold: qaInt?.flagThreshold ?? 60,

        // Call Recording
        recordingEnabled: callRec?.enabled ?? true,
        transcriptionEnabled: callRec?.transcriptionEnabled ?? true,
        sentimentEnabled: callRec?.sentimentAnalysisEnabled ?? true,
        recordingRetentionDays: callRec?.retentionDays ?? 90,
        recordAllCalls: callRec?.recordAllCalls ?? false,

        // Performance Monitoring
        perfMonitoringEnabled: perfMon?.enabled ?? true,
        coachingEnabled: perfMon?.coachingTriggersEnabled ?? true,
        minContactRate: perfMon?.performanceThreshold?.contactRateMin,
        minVerificationRate: perfMon?.performanceThreshold?.verificationRateMin,
        maxSlaBreach: perfMon?.performanceThreshold?.slaBreachMax,
        minQAScore: perfMon?.performanceThreshold?.qaScoreMin,
        alertRecipients: perfMon?.alertRecipients?.join(', ') ?? '',
      };

      setFormData(loadedData);
      // Set initial ref to loaded data so it's considered "saved"
      initialFormDataRef.current = loadedData;
      setHasUnsavedChanges(false);
      isInitializedRef.current = true;
      setIsPaused(existingQueue.status === 'PAUSED');
    }
  }, [mode, existingQueue]);

  // Close agents dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentsDropdownRef.current && !agentsDropdownRef.current.contains(event.target as Node)) {
        setShowAgentsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [agentsDropdownRef]);

  const handleChange = (field: keyof CampaignFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateCycleFromModal = (data: {
    cycleName: string;
    selectedFilters: Record<string, string[] | boolean>;
    includeAll: boolean;
  }) => {
    const newCycle: Cycle = {
      id: `cycle-custom-${Date.now()}`,
      name: data.cycleName,
      filterData: data,
    };

    setCycles((prev) => [...prev, newCycle]);
    handleChange('cycleId', newCycle.id);
    setShowCycleCreationModal(false);
  };

  const handleViewCycle = () => {
    const selectedCycle = cycles.find((c) => c.id === formData.cycleId);
    console.log('handleViewCycle called:', {
      formDataCycleId: formData.cycleId,
      selectedCycle,
      hasFilterData: !!selectedCycle?.filterData,
      filterData: selectedCycle?.filterData,
    });
    if (selectedCycle?.filterData) {
      const data = selectedCycle.filterData;
      setViewCycleData(data);
      setCycleModalMode('view');
      setShowCycleCreationModal(true);
    } else {
      alert(`The cycle "${selectedCycle?.name}" does not have any filter data to view.`);
    }
  };

  const handleCloseCycleModal = () => {
    setShowCycleCreationModal(false);
    setViewCycleData(null);
    setCycleModalMode('create');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CampaignFormData, string>> = {};

    if (!formData.campaignName?.trim()) newErrors.campaignName = 'Campaign name is required';
    if (!formData.accountId) newErrors.accountId = 'Account is required';
    if (!formData.cycleId) newErrors.cycleId = 'Cycle is required';
    if (formData.maxAttempts < 1 || formData.maxAttempts > 10) {
      newErrors.maxAttempts = 'Must be between 1 and 10';
    }
    if (formData.cooldownMinutes < 0 || formData.cooldownMinutes > 1440) {
      newErrors.cooldownMinutes = 'Must be between 0 and 1440 minutes';
    }
    if (formData.slaHours < 1 || formData.slaHours > 720) {
      newErrors.slaHours = 'Must be between 1 and 720 hours';
    }

    setErrors(newErrors);
    setValidationAttempted(true);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setErrors({});
    setValidationAttempted(false);
    setHasUnsavedChanges(false);
    setShowUnsavedWarning(false);
    onClose();
  };

  const handleSaveWithoutClose = async () => {
    // User chose to save changes before closing
    if (validateForm()) {
      await handleSave();
      handleClose();
    }
  };

  const handleDiscardAndClose = () => {
    // User chose to discard changes and close
    setShowUnsavedWarning(false);
    handleClose();
  };

  // Count errors by tab for validation summary
  const getErrorsByTab = () => {
    const basicTabErrors = [
      'campaignName', 'description', 'accountId', 'cycleId',
      'assignedAgents', 'startTime', 'notes'
    ];
    const outreachTabErrors = [
      'primaryMethod', 'priorityTier', 'strategyVersion',
      'maxAttempts', 'cooldownMinutes', 'slaHours',
      'callWindowStart', 'callWindowEnd'
    ];
    const reportsTabErrors = [
      'reportSchedule', 'reportRecipients', 'reportFormat',
      'reportIncludeKPIs', 'reportIncludeAgentPerf', 'reportIncludeQASummary',
      'qaEnabled', 'qaSamplingRate', 'qaRequiredScore', 'qaReviewers',
      'qaAutoFlag', 'qaFlagThreshold', 'recordingEnabled',
      'transcriptionEnabled', 'sentimentEnabled', 'recordingRetentionDays',
      'recordAllCalls'
    ];
    const monitoringTabErrors = [
      'perfMonitoringEnabled', 'coachingEnabled',
      'minContactRate', 'minVerificationRate', 'maxSlaBreach', 'minQAScore',
      'alertRecipients'
    ];

    const basicCount = Object.keys(errors).filter(key => basicTabErrors.includes(key)).length;
    const outreachCount = Object.keys(errors).filter(key => outreachTabErrors.includes(key)).length;
    const reportsCount = Object.keys(errors).filter(key => reportsTabErrors.includes(key)).length;
    const monitoringCount = Object.keys(errors).filter(key => monitoringTabErrors.includes(key)).length;

    return { basicCount, outreachCount, reportsCount, monitoringCount };
  };

  const handlePauseToggle = async () => {
    if (mode === 'edit' && existingQueue) {
      if (isPaused && onResume) {
        await onResume(existingQueue.queueId);
        setIsPaused(false);
      } else if (!isPaused && onPause) {
        await onPause(existingQueue.queueId);
        setIsPaused(true);
      }
    }
  };

  const handleDelete = async () => {
    if (mode === 'edit' && existingQueue && onDelete) {
      await onDelete(existingQueue.queueId);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const selectedAccount = ACCOUNTS.find((a) => a.id === formData.accountId);
    const selectedCycle = CYCLES.find((c) => c.id === formData.cycleId);

    const config: NewCampaignConfig = {
      campaignName: formData.campaignName,
      description: formData.description,
      accountId: formData.accountId,
      cycleId: formData.cycleId,
      primaryMethod: formData.primaryMethod,
      strategyVersion: formData.strategyVersion,
      priorityTier: formData.priorityTier,
      maxAttempts: formData.maxAttempts,
      cooldownMinutes: formData.cooldownMinutes,
      slaHours: formData.slaHours,
      callWindowStart: formData.callWindowStart,
      callWindowEnd: formData.callWindowEnd,
      assignedQueue: formData.assignedQueue,
      assignedAgents: formData.assignedAgents,
      startTime: formData.startTime,
      notes: formData.notes,
      source: {
        sourceType: 'DATA_IMPORT',
        sourceData: {
          importedProviderCount: campaignSource?.importedProviderCount,
        },
        providers: campaignSource?.providers || [],
      },

      // Report Automation
      reportAutomation: formData.reportAutomationEnabled ? {
        enabled: true,
        schedule: formData.reportSchedule,
        recipients: formData.reportRecipients ? formData.reportRecipients.split(',').map(e => e.trim()).filter(Boolean) : undefined,
        format: formData.reportFormat,
        includeKPIs: formData.reportIncludeKPIs,
        includeAgentPerformance: formData.reportIncludeAgentPerf,
        includeQASummary: formData.reportIncludeQASummary,
      } : undefined,

      // QA Integration
      qaIntegration: formData.qaEnabled ? {
        enabled: true,
        samplingRate: formData.qaSamplingRate,
        requiredQAScoreThreshold: formData.qaRequiredScore,
        assignedQAReviewers: formData.qaReviewers.length > 0 ? formData.qaReviewers : undefined,
        autoFlagLowScore: formData.qaAutoFlag,
        flagThreshold: formData.qaFlagThreshold,
      } : undefined,

      // Call Recording
      callRecording: {
        enabled: formData.recordingEnabled,
        transcriptionEnabled: formData.transcriptionEnabled,
        sentimentAnalysisEnabled: formData.sentimentEnabled,
        retentionDays: formData.recordingRetentionDays,
        recordAllCalls: formData.recordAllCalls,
        recordSampledOnly: !formData.recordAllCalls,
      },

      // Performance Monitoring
      performanceMonitoring: formData.perfMonitoringEnabled ? {
        enabled: true,
        coachingTriggersEnabled: formData.coachingEnabled,
        performanceThreshold: {
          contactRateMin: formData.minContactRate,
          verificationRateMin: formData.minVerificationRate,
          slaBreachMax: formData.maxSlaBreach,
          qaScoreMin: formData.minQAScore,
        },
        alertRecipients: formData.alertRecipients ? formData.alertRecipients.split(',').map(e => e.trim()).filter(Boolean) : undefined,
      } : undefined,
    };

    onSave(config);
    setSaving(false);

    // Define default form state for reset
    const defaultFormState: CampaignFormData = {
      campaignName: '',
      description: '',
      accountId: '',
      cycleId: '',
      primaryMethod: 'AI_CALL',
      strategyVersion: 'v1.0.0',
      priorityTier: 'P1',
      maxAttempts: 5,
      cooldownMinutes: 60,
      slaHours: 72,
      callWindowStart: '08:00',
      callWindowEnd: '18:00',
      assignedQueue: undefined,
      assignedAgents: [],
      startTime: undefined,
      notes: '',

      // Report Automation defaults
      reportAutomationEnabled: false,
      reportSchedule: 'ON_COMPLETION',
      reportRecipients: '',
      reportFormat: 'PDF',
      reportIncludeKPIs: true,
      reportIncludeAgentPerf: true,
      reportIncludeQASummary: true,

      // QA Integration defaults
      qaEnabled: false,
      qaSamplingRate: 10,
      qaRequiredScore: undefined,
      qaReviewers: [],
      qaAutoFlag: true,
      qaFlagThreshold: 60,

      // Call Recording defaults
      recordingEnabled: true,
      transcriptionEnabled: true,
      sentimentEnabled: true,
      recordingRetentionDays: 90,
      recordAllCalls: false,

      // Performance Monitoring defaults
      perfMonitoringEnabled: true,
      coachingEnabled: true,
      minContactRate: undefined,
      minVerificationRate: undefined,
      maxSlaBreach: undefined,
      minQAScore: undefined,
      alertRecipients: '',
    };

    // Reset form and update ref to match
    setFormData(defaultFormState);
    initialFormDataRef.current = defaultFormState;
    setHasUnsavedChanges(false);
    setValidationAttempted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleCloseAttempt} />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === 'edit' ? 'Edit Campaign' : 'New Outreach Campaign'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {mode === 'edit' ? 'Modify campaign configuration and settings' : 'Configure and launch a new outreach campaign from loaded data'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
              {mode === 'edit' && existingQueue && (
                <div className="flex items-center gap-2">
                  {existingQueue.status === 'ACTIVE' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Active
                    </span>
                  )}
                  {existingQueue.status === 'PAUSED' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Paused
                    </span>
                  )}
                  {existingQueue.status === 'COMPLETED' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Completed
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={handleCloseAttempt}
                className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs Navigation */}
          <div className="px-6 pt-6 border-b border-gray-200">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'text-violet-600 border-violet-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Summary Banner */}
          {validationAttempted && Object.keys(errors).length > 0 && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded-full">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-900">Please fix the following errors</h4>
                  <ul className="mt-1 space-y-1">
                    {getErrorsByTab().basicCount > 0 && (
                      <li className="text-xs text-red-700">
                        • Basic Info: {getErrorsByTab().basicCount} error{getErrorsByTab().basicCount > 1 ? 's' : ''}
                      </li>
                    )}
                    {getErrorsByTab().outreachCount > 0 && (
                      <li className="text-xs text-red-700">
                        • Outreach Config: {getErrorsByTab().outreachCount} error{getErrorsByTab().outreachCount > 1 ? 's' : ''}
                      </li>
                    )}
                    {getErrorsByTab().reportsCount > 0 && (
                      <li className="text-xs text-red-700">
                        • Reports & QA: {getErrorsByTab().reportsCount} error{getErrorsByTab().reportsCount > 1 ? 's' : ''}
                      </li>
                    )}
                    {getErrorsByTab().monitoringCount > 0 && (
                      <li className="text-xs text-red-700">
                        • Monitoring: {getErrorsByTab().monitoringCount} error{getErrorsByTab().monitoringCount > 1 ? 's' : ''}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Section: Basic Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                      Basic Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campaign Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.campaignName}
                          onChange={(e) => handleChange('campaignName', e.target.value)}
                          placeholder="e.g., Q1 2025 CA Provider Verification"
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                            errors.campaignName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.campaignName && (
                          <p className="text-xs text-red-500 mt-1">{errors.campaignName}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          A descriptive name for this outreach campaign
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          placeholder="Describe the purpose and goals of this outreach..."
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Client & Cycle */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                      Client & Cycle
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account / Client <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.accountId}
                          onChange={(e) => handleChange('accountId', e.target.value)}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                            errors.accountId ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select account</option>
                          {ACCOUNTS.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </select>
                        {errors.accountId && (
                          <p className="text-xs text-red-500 mt-1">{errors.accountId}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cycle <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={formData.cycleId}
                            onChange={(e) => {
                              handleChange('cycleId', e.target.value);
                              setViewCycleData(null);
                            }}
                            className={`w-48 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                              errors.cycleId ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select cycle</option>
                            {cycles.map((cycle) => (
                              <option key={cycle.id} value={cycle.id}>
                                {cycle.name}
                              </option>
                            ))}
                          </select>
                          {formData.cycleId && cycles.find((c) => c.id === formData.cycleId)?.filterData && (
                            <button
                              type="button"
                              onClick={handleViewCycle}
                              className="px-3 py-2 text-sm text-violet-600 bg-violet-50 border border-violet-300 rounded-lg hover:bg-violet-100 shrink-0"
                              title="View cycle details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setViewCycleData(null);
                              setCycleModalMode('create');
                              setShowCycleCreationModal(true);
                            }}
                            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 shrink-0"
                            title="Create new cycle with filters"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {errors.cycleId && (
                          <p className="text-xs text-red-500 mt-1">{errors.cycleId}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Cycles are time-bound outreach periods
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section: Assignment */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                      Assignment
                    </h3>

                    <div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assigned Agents
                        </label>
                        <div className="relative" ref={agentsDropdownRef}>
                          {/* Selected Agents Display - Clickable to toggle dropdown */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setShowAgentsDropdown(!showAgentsDropdown)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setShowAgentsDropdown(!showAgentsDropdown);
                              }
                            }}
                            className="w-full min-h-[42px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-left flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex flex-wrap gap-2 flex-1">
                              {formData.assignedAgents && formData.assignedAgents.length > 0 ? (
                                formData.assignedAgents.map((agent) => (
                                  <span
                                    key={agent}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium"
                                  >
                                    {agent}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedAgents = formData.assignedAgents?.filter((a) => a !== agent) || [];
                                        handleChange('assignedAgents', updatedAgents);
                                      }}
                                      className="hover:text-violet-900 focus:outline-none"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">No agents selected</span>
                              )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showAgentsDropdown ? 'rotate-180' : ''}`} />
                          </div>

                          {/* Agent Dropdown - Only show when open */}
                          {showAgentsDropdown && (
                            <div className="absolute z-10 mt-1 w-full border border-gray-300 rounded-lg bg-white max-h-40 overflow-y-auto shadow-lg">
                              {AGENTS.map((agent) => (
                                <label
                                  key={agent}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.assignedAgents?.includes(agent) || false}
                                    onChange={(e) => {
                                      const updatedAgents = e.target.checked
                                        ? [...(formData.assignedAgents || []), agent]
                                        : formData.assignedAgents?.filter((a) => a !== agent) || [];
                                      handleChange('assignedAgents', updatedAgents);
                                    }}
                                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                                  />
                                  <span className="text-sm text-gray-700">{agent}</span>
                                  {formData.assignedAgents?.includes(agent) && (
                                    <Check className="w-4 h-4 text-violet-600 ml-auto" />
                                  )}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Select one or more agents to assign to this campaign
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section: Additional Settings */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                      Additional Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.startTime || ''}
                          onChange={(e) => handleChange('startTime', e.target.value || undefined)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Schedule campaign to start at a specific time
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          placeholder="Add any additional notes or special instructions..."
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Outreach Config Tab */}
              {activeTab === 'outreach' && (
                <div className="space-y-6">
                  {/* Section: Outreach Configuration */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                      Outreach Configuration
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Outreach Method
                          </label>
                          <select
                            value={formData.primaryMethod}
                            onChange={(e) => handleChange('primaryMethod', e.target.value as OutreachMethod)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                          >
                            {METHODS.map((method) => (
                              <option key={method} value={method}>
                                {method.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority Tier
                          </label>
                          <select
                            value={formData.priorityTier}
                            onChange={(e) => handleChange('priorityTier', e.target.value as PriorityTier)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                          >
                            {PRIORITIES.map((priority) => (
                              <option key={priority} value={priority}>
                                {priority} - {priority === 'P0' ? 'Critical' : priority === 'P1' ? 'High' : 'Normal'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Strategy Version
                        </label>
                        <select
                          value={formData.strategyVersion}
                          onChange={(e) => handleChange('strategyVersion', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                        >
                          {STRATEGY_VERSIONS.map((version) => (
                            <option key={version.value} value={version.value}>
                              {version.label}
                            </option>
                          ))}
                        </select>
                        {STRATEGY_VERSIONS.find((v) => v.value === formData.strategyVersion)?.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {STRATEGY_VERSIONS.find((v) => v.value === formData.strategyVersion)?.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Attempts <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={formData.maxAttempts}
                            onChange={(e) => handleChange('maxAttempts', parseInt(e.target.value))}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                              errors.maxAttempts ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.maxAttempts && (
                            <p className="text-xs text-red-500 mt-1">{errors.maxAttempts}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cooldown (min) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="1440"
                            value={formData.cooldownMinutes}
                            onChange={(e) => handleChange('cooldownMinutes', parseInt(e.target.value))}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                              errors.cooldownMinutes ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.cooldownMinutes && (
                            <p className="text-xs text-red-500 mt-1">{errors.cooldownMinutes}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SLA (hours) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="720"
                            value={formData.slaHours}
                            onChange={(e) => handleChange('slaHours', parseInt(e.target.value))}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white ${
                              errors.slaHours ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.slaHours && (
                            <p className="text-xs text-red-500 mt-1">{errors.slaHours}</p>
                          )}
                        </div>
                      </div>

                      {/* Within Call Window */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Within Call Window
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={formData.callWindowStart}
                              onChange={(e) => handleChange('callWindowStart', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">End Time</label>
                            <input
                              type="time"
                              value={formData.callWindowEnd}
                              onChange={(e) => handleChange('callWindowEnd', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Calls will only be made during this time window (provider's local time)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reports & QA Tab */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  {/* Section: Report Automation */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Report Automation
                      </h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.reportAutomationEnabled}
                          onChange={(e) => handleChange('reportAutomationEnabled', e.target.checked)}
                          className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Enable</span>
                      </label>
                    </div>

                    {formData.reportAutomationEnabled && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Report Schedule
                            </label>
                            <select
                              value={formData.reportSchedule}
                              onChange={(e) => handleChange('reportSchedule', e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_COMPLETION')}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            >
                              <option value="ON_COMPLETION">On Campaign Completion</option>
                              <option value="DAILY">Daily</option>
                              <option value="WEEKLY">Weekly</option>
                              <option value="MONTHLY">Monthly</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Report Format
                            </label>
                            <select
                              value={formData.reportFormat}
                              onChange={(e) => handleChange('reportFormat', e.target.value as 'PDF' | 'CSV' | 'EXCEL' | 'DASHBOARD_LINK')}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            >
                              <option value="PDF">PDF</option>
                              <option value="CSV">CSV</option>
                              <option value="EXCEL">Excel</option>
                              <option value="DASHBOARD_LINK">Dashboard Link</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Report Recipients
                          </label>
                          <input
                            type="text"
                            value={formData.reportRecipients}
                            onChange={(e) => handleChange('reportRecipients', e.target.value)}
                            placeholder="email1@example.com, email2@example.com"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Comma-separated email addresses
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Include in Report
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.reportIncludeKPIs}
                                onChange={(e) => handleChange('reportIncludeKPIs', e.target.checked)}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                              <span className="text-sm text-gray-700">KPI Summary</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.reportIncludeAgentPerf}
                                onChange={(e) => handleChange('reportIncludeAgentPerf', e.target.checked)}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                              <span className="text-sm text-gray-700">Agent Performance</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.reportIncludeQASummary}
                                onChange={(e) => handleChange('reportIncludeQASummary', e.target.checked)}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                              <span className="text-sm text-gray-700">QA Summary</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: QA & Call Monitoring Integration */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                      QA & Call Monitoring
                    </h3>

                    <div className="space-y-4">
                      {/* QA Integration */}
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">QA Integration</h4>
                            <p className="text-xs text-gray-500">Automate QA review for campaign calls</p>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.qaEnabled}
                              onChange={(e) => handleChange('qaEnabled', e.target.checked)}
                              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                            />
                            <span className="text-sm text-gray-700">Enable</span>
                          </label>
                        </div>

                        {formData.qaEnabled && (
                          <div className="space-y-3 mt-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  QA Sampling Rate (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.qaSamplingRate}
                                  onChange={(e) => handleChange('qaSamplingRate', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Required QA Score (Optional)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.qaRequiredScore ?? ''}
                                  onChange={(e) => handleChange('qaRequiredScore', e.target.value ? parseInt(e.target.value) : undefined)}
                                  placeholder="Min score"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={formData.qaAutoFlag}
                                  onChange={(e) => handleChange('qaAutoFlag', e.target.checked)}
                                  className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                                />
                                <span className="text-sm text-gray-700">Auto-flag low scores</span>
                              </label>
                              {formData.qaAutoFlag && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Below:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.qaFlagThreshold}
                                    onChange={(e) => handleChange('qaFlagThreshold', parseInt(e.target.value) || 0)}
                                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Call Recording Settings */}
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Call Recording</h4>
                            <p className="text-xs text-gray-500">Configure call recording and analysis</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.recordingEnabled}
                                onChange={(e) => handleChange('recordingEnabled', e.target.checked)}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                              <span className="text-sm text-gray-700">Record Calls</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.transcriptionEnabled}
                                onChange={(e) => handleChange('transcriptionEnabled', e.target.checked)}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                              <span className="text-sm text-gray-700">Transcription</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.sentimentEnabled}
                                onChange={(e) => handleChange('sentimentEnabled', e.target.checked)}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                              <span className="text-sm text-gray-700">Sentiment Analysis</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.recordAllCalls}
                                onChange={(e) => handleChange('recordAllCalls', e.target.checked)}
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                              />
                              <span className="text-sm text-gray-700">Record All Calls</span>
                            </label>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="text-xs font-medium text-gray-700">Retention (days):</label>
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={formData.recordingRetentionDays}
                              onChange={(e) => handleChange('recordingRetentionDays', parseInt(e.target.value) || 90)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Monitoring Tab */}
              {activeTab === 'monitoring' && (
                <div className="space-y-6">
                  {/* Section: Performance Monitoring & Coaching */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Performance Monitoring & Coaching
                      </h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.perfMonitoringEnabled}
                          onChange={(e) => handleChange('perfMonitoringEnabled', e.target.checked)}
                          className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Enable</span>
                      </label>
                    </div>

                    {formData.perfMonitoringEnabled && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="flex items-center gap-2 mb-3">
                            <input
                              type="checkbox"
                              checked={formData.coachingEnabled}
                              onChange={(e) => handleChange('coachingEnabled', e.target.checked)}
                              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable Automated Coaching Triggers</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Performance Thresholds
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Min Contact Rate (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.minContactRate ?? ''}
                                onChange={(e) => handleChange('minContactRate', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Optional"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Min Verification Rate (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.minVerificationRate ?? ''}
                                onChange={(e) => handleChange('minVerificationRate', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Optional"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Max SLA Breach (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.maxSlaBreach ?? ''}
                                onChange={(e) => handleChange('maxSlaBreach', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Optional"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Min QA Score</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.minQAScore ?? ''}
                                onChange={(e) => handleChange('minQAScore', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Optional"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alert Recipients
                          </label>
                          <input
                            type="text"
                            value={formData.alertRecipients}
                            onChange={(e) => handleChange('alertRecipients', e.target.value)}
                            placeholder="manager@example.com, lead@example.com"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Comma-separated emails for performance alerts
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900">About Campaign Configuration</h4>
                        <ul className="text-xs text-blue-800 mt-2 space-y-1">
                          <li>• <strong>Campaign Name</strong>: Unique identifier for this outreach</li>
                          <li>• <strong>Primary Method</strong>: Default outreach channel to use</li>
                          <li>• <strong>Strategy Version</strong>: Determines AI behavior and rules</li>
                          <li>• <strong>SLA Hours</strong>: Time limit for completing each provider</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {mode === 'edit' && existingQueue && existingQueue.status !== 'COMPLETED' && (
              <>
                <button
                  onClick={handlePauseToggle}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      Resume Campaign
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Campaign
                    </>
                  )}
                </button>
                {onDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Campaign
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseAttempt}
              type="button"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mode === 'edit' ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {saving ? 'Creating...' : 'Create Campaign'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Campaign?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this campaign? This action cannot be undone. All associated tasks and data will be permanently removed.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unsaved Changes Warning Dialog */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUnsavedWarning(false)} />
          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    You have unsaved changes. Do you want to save them before closing?
                  </p>
                </div>
                <button
                  onClick={() => setShowUnsavedWarning(false)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={handleDiscardAndClose}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Discard & Close
              </button>
              <button
                onClick={() => setShowUnsavedWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={handleSaveWithoutClose}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Creation Modal */}
      <CycleCreationModal
        isOpen={showCycleCreationModal}
        onClose={handleCloseCycleModal}
        onCreate={handleCreateCycleFromModal}
        mode={cycleModalMode}
        viewData={viewCycleData || undefined}
      />
    </div>
  );
};
