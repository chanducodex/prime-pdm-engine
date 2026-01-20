'use client';

import { useState, useEffect, useCallback } from 'react';
import { AgentCallProvider, useAgentCall } from '@/lib/contexts/agent-call-context';
import {
  CallControlPanel,
  AgentStatusWidget,
  CallerInfoPanel,
  TranscriptionPanel,
  AISuggestionsPanel,
  QuestionnairePanel,
  ProviderFormPanel,
  CallHistoryModal,
  CallNotesPanel,
  ToastNotification,
  // New Enhanced Features
  APIDocumentationDrawer,
  SentimentDashboardPanel,
  QuickScriptsPanel,
  CallRecordingControlsPanel,
  PerformanceMetricsWidget,
  KnowledgeBasePanel,
  CallbackSchedulerPanel,
} from '@/components/agent-call';
import {
  Headphones,
  History,
  FileCheck,
  ListChecks,
  Info,
  ChevronDown,
  ChevronUp,
  Settings,
  BarChart2,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { Provider } from '@/lib/provider-types';

// Import mock provider data
import { mockProviderData } from '@/lib/mock-provider-data';

// Mode type for data collection
type DataCollectionMode = 'questionnaire' | 'form';

// Secondary panel tabs
type SecondaryTab = 'knowledge' | 'callback' | 'metrics';

// Sample callbacks data
interface CallbackSchedule {
  callbackId: string;
  scheduledAt: string;
  timezone: string;
  phoneNumber: string;
  providerId?: string;
  providerName?: string;
  reason: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  reminderEnabled: boolean;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
}

const initialCallbacks: CallbackSchedule[] = [
  {
    callbackId: 'cb_001',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    timezone: 'America/New_York',
    phoneNumber: '+1 (555) 123-4567',
    providerId: 'PRV001',
    providerName: 'Dr. Sarah Johnson',
    reason: 'Follow up on credential renewal documents',
    priority: 'HIGH',
    reminderEnabled: true,
    status: 'SCHEDULED',
  },
  {
    callbackId: 'cb_002',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    timezone: 'America/New_York',
    phoneNumber: '+1 (555) 987-6543',
    providerId: 'PRV002',
    providerName: 'Dr. Michael Chen',
    reason: 'Verify updated practice address',
    priority: 'NORMAL',
    reminderEnabled: true,
    status: 'SCHEDULED',
  },
  {
    callbackId: 'cb_003',
    scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    timezone: 'America/New_York',
    phoneNumber: '+1 (555) 456-7890',
    providerId: 'PRV003',
    providerName: 'Dr. Emily Roberts',
    reason: 'Urgent: License expiration issue',
    priority: 'URGENT',
    reminderEnabled: true,
    status: 'SCHEDULED',
  },
];

// Right column panel type
type RightPanelExpanded = 'scripts' | 'notes' | null;

// Center column expansion type
type CenterColumnExpand = 'normal' | 'expand-left' | 'expand-right';

function AgentCallPageContent() {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAPIDocsOpen, setIsAPIDocsOpen] = useState(false);
  const [dataMode, setDataMode] = useState<DataCollectionMode>('questionnaire');
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<SecondaryTab>('knowledge');
  const [showSecondaryPanel, setShowSecondaryPanel] = useState(false);
  const [callbacks, setCallbacks] = useState<CallbackSchedule[]>(initialCallbacks);
  const [expandedRightPanel, setExpandedRightPanel] = useState<RightPanelExpanded>('scripts');
  const [centerColumnExpand, setCenterColumnExpand] = useState<CenterColumnExpand>('normal');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { state } = useAgentCall();

  // Handle browser reload confirmation when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const isCallActive = !!(state.activeCall && state.activeCall.state === 'IN_CALL');

  // Load provider data when call becomes active
  useEffect(() => {
    if (state.activeCall && state.activeCall.state === 'IN_CALL') {
      loadMockProviderData();
    } else if (!state.activeCall) {
      setCurrentProvider(null);
    }
  }, [state.activeCall?.state, state.activeCall]);

  const loadMockProviderData = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * Math.min(mockProviderData.length, 100));
    const provider = mockProviderData[randomIndex] || mockProviderData[0];

    const completeProvider: Provider = {
      provider_Id: provider.provider_Id || 0,
      npi: provider.npi || 0,
      firstName: provider.firstName || '',
      lastName: provider.lastName || '',
      middleName: provider.middleName || '',
      providerType: provider.providerType || '',
      groupEntity: provider.groupEntity || '',
      basicInfo: provider.basicInfo || {
        affiliation_status: '',
        cumc_division: '',
        initial_appr_date: '',
        degree_description: '',
        cred_approval_status: '',
        prior_appr_date: '',
        current_appr_date: '',
        date_hire: '',
        dateOfBirth: '',
        current_exp_date: '',
        fellow_y_n: '',
        genderTypeId: 0,
        caqhId: 0,
        degree: '',
        cumc_department: '',
        uni: '',
        id: 0,
      },
      medicare: provider.medicare || [],
      license: provider.license || {},
      specialties: provider.specialties || [],
      affiliations: provider.affiliations || [],
      malpractice: provider.malpractice || [],
      educations: provider.educations || [],
      groupcollab: provider.groupcollab || [],
      languages: provider.languages || [],
      billingAddress: provider.billingAddress || [],
      address: provider.address || [],
      wheelChairAccess: provider.wheelChairAccess || false,
    };

    setCurrentProvider(completeProvider);
  }, []);

  const secondaryTabs = [
    { id: 'knowledge' as const, label: 'Knowledge Base', icon: BookOpen },
    { id: 'callback' as const, label: 'Callbacks', icon: Calendar },
    { id: 'metrics' as const, label: 'Metrics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sticky top-0 z-40">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Logo + Title + Call Controls + Recording */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-4 h-4 text-violet-600" />
            </div>
            <h1 className="text-sm sm:text-base font-semibold text-gray-900 hidden md:block">
              Agent Call Center
            </h1>
            <div className="h-5 w-px bg-gray-200 hidden md:block" />

            {/* Call Controls - Always Visible */}
            <CallControlPanel compact />

            {/* Recording Controls - During Call */}
            {isCallActive && (
              <>
                <div className="h-5 w-px bg-gray-200" />
                <CallRecordingControlsPanel isCallActive={isCallActive} compact />
              </>
            )}

          </div>

          {/* Right: Tools + Status */}
          <div className="flex items-center gap-2">
            {/* Data Mode Toggle - During Call */}
            {isCallActive && (
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setDataMode('questionnaire')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    dataMode === 'questionnaire'
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Quick</span>
                </button>
                <button
                  onClick={() => setDataMode('form')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    dataMode === 'form'
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Full</span>
                </button>
              </div>
            )}

            {/* History */}
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Call History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* API Docs */}
            <button
              onClick={() => setIsAPIDocsOpen(true)}
              className="p-2 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
              title="API Documentation"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Agent Status */}
            <AgentStatusWidget />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-4 overflow-auto">
        <div className=" mx-auto space-y-4">

          {/* Row 1: Caller Info (Compact) */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <CallerInfoPanel provider={currentProvider} />
          </div>

          {/* Row 2: Main Working Area - 3 Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">

            {/* Left Column: Transcription + Sentiment (Narrow - 3 cols) */}
            {centerColumnExpand !== 'expand-left' && (
              <div className={`flex flex-col gap-4 ${centerColumnExpand === 'expand-right' ? 'xl:col-span-3' : 'xl:col-span-3'}`}>
                <div className="flex-1">
                  <TranscriptionPanel className="h-full" />
                </div>
                {isCallActive && (
                  <SentimentDashboardPanel isCallActive={isCallActive} />
                )}
              </div>
            )}

            {/* Center Column: Data Collection - Main Work Area */}
            <div className={`${
              centerColumnExpand === 'expand-left' ? 'xl:col-span-9' :
              centerColumnExpand === 'expand-right' ? 'xl:col-span-9' :
              'xl:col-span-6'
            }`}>
              {/* Center Column Header with Expand Controls */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden h-full flex flex-col">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2">
                    {dataMode === 'questionnaire' ? (
                      <ListChecks className="w-4 h-4 text-violet-500" />
                    ) : (
                      <FileCheck className="w-4 h-4 text-violet-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {dataMode === 'questionnaire' ? 'Questionnaire' : 'Provider Form'}
                    </span>
                    {hasUnsavedChanges && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Unsaved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Expand Left Button */}
                    <button
                      onClick={() => setCenterColumnExpand(centerColumnExpand === 'expand-left' ? 'normal' : 'expand-left')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        centerColumnExpand === 'expand-left'
                          ? 'bg-violet-100 text-violet-600'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                      title={centerColumnExpand === 'expand-left' ? 'Restore' : 'Expand Left'}
                    >
                      {centerColumnExpand === 'expand-left' ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <ChevronLeft className="w-4 h-4" />
                      )}
                    </button>
                    {/* Expand Right Button */}
                    <button
                      onClick={() => setCenterColumnExpand(centerColumnExpand === 'expand-right' ? 'normal' : 'expand-right')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        centerColumnExpand === 'expand-right'
                          ? 'bg-violet-100 text-violet-600'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                      title={centerColumnExpand === 'expand-right' ? 'Restore' : 'Expand Right'}
                    >
                      {centerColumnExpand === 'expand-right' ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  {dataMode === 'questionnaire' ? (
                    <QuestionnairePanel className="h-full border-0 rounded-none" />
                  ) : (
                    <ProviderFormPanel
                      provider={currentProvider}
                      isCallActive={isCallActive}
                      onSave={(provider) => {
                        console.log('Saving provider data:', provider);
                        setHasUnsavedChanges(false);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: AI + Scripts + Notes (Narrow - 3 cols) */}
            {centerColumnExpand !== 'expand-right' && (
              <div className={`flex flex-col gap-4 ${centerColumnExpand === 'expand-left' ? 'xl:col-span-3' : 'xl:col-span-3'}`}>
                <AISuggestionsPanel />
                <QuickScriptsPanel
                  isExpanded={expandedRightPanel === 'scripts'}
                  onToggleExpand={() => setExpandedRightPanel(expandedRightPanel === 'scripts' ? null : 'scripts')}
                />
                <CallNotesPanel
                  isExpanded={expandedRightPanel === 'notes'}
                  onToggleExpand={() => setExpandedRightPanel(expandedRightPanel === 'notes' ? null : 'notes')}
                />
              </div>
            )}
          </div>

         

          {/* Row 4: Secondary Tools Panel (Collapsible) */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Toggle Header */}
            <button
              onClick={() => setShowSecondaryPanel(!showSecondaryPanel)}
              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Support Tools</span>
                <div className="flex items-center gap-1">
                  {secondaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <span
                        key={tab.id}
                        className={`p-1 rounded ${
                          activeSecondaryTab === tab.id ? 'bg-violet-100 text-violet-600' : 'text-gray-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                    );
                  })}
                </div>
              </div>
              {showSecondaryPanel ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Expanded Content */}
            {showSecondaryPanel && (
              <div className="border-t border-gray-100">
                {/* Tab Navigation */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex gap-1">
                  {secondaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSecondaryTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activeSecondaryTab === tab.id
                            ? 'bg-white text-violet-700 shadow-sm border border-gray-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activeSecondaryTab === 'knowledge' && (
                      <>
                        <KnowledgeBasePanel isCallActive={isCallActive} />
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick References</h4>
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">• Provider credentialing guidelines</p>
                            <p className="text-xs text-gray-600">• License verification procedures</p>
                            <p className="text-xs text-gray-600">• Common issue resolutions</p>
                          </div>
                        </div>
                      </>
                    )}
                    {activeSecondaryTab === 'callback' && (
                      <CallbackSchedulerPanel
                        phoneNumber={state.callerInfo?.phoneNumber}
                        providerId={state.callerInfo?.providerId}
                        providerName={state.callerInfo?.providerName}
                        existingCallbacks={callbacks}
                        onSchedule={async (newCallback) => {
                          const callback: CallbackSchedule = {
                            ...newCallback,
                            callbackId: `cb_${Date.now()}`,
                            status: 'SCHEDULED',
                          };
                          setCallbacks(prev => [...prev, callback]);
                        }}
                        onCancel={async (callbackId) => {
                          setCallbacks(prev =>
                            prev.map(cb =>
                              cb.callbackId === callbackId
                                ? { ...cb, status: 'CANCELLED' as const }
                                : cb
                            )
                          );
                        }}
                      />
                    )}
                    {activeSecondaryTab === 'metrics' && (
                      <>
                        <PerformanceMetricsWidget />
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Daily Summary</h4>
                          <p className="text-xs text-gray-500">Performance metrics for the current session</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals and Drawers */}
      <APIDocumentationDrawer
        isOpen={isAPIDocsOpen}
        onClose={() => setIsAPIDocsOpen(false)}
      />

      <CallHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <ToastNotification />
    </div>
  );
}

export default function AgentCallPage() {
  return (
    <AgentCallProvider>
      <AgentCallPageContent />
    </AgentCallProvider>
  );
}
