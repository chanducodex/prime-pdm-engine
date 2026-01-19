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
  ActionQuickBar,
  ToastNotification,
} from '@/components/agent-call';
import { Headphones, History, FileCheck, ListChecks } from 'lucide-react';
import type { Provider } from '@/lib/provider-types';

// Import mock provider data
import { mockProviderData } from '@/lib/mock-provider-data';

// Mode type for data collection
type DataCollectionMode = 'questionnaire' | 'form';

function AgentCallPageContent() {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [dataMode, setDataMode] = useState<DataCollectionMode>('questionnaire');
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  const { state } = useAgentCall();

  // Load provider data when call becomes active
  useEffect(() => {
    if (state.activeCall && state.activeCall.state === 'IN_CALL') {
      // Simulate loading provider data from mock data
      // In a real scenario, this would come from the callerInfo
      loadMockProviderData();
    } else if (!state.activeCall) {
      // Clear provider data when call ends
      setCurrentProvider(null);
    }
  }, [state.activeCall?.state, state.activeCall]);

  const loadMockProviderData = useCallback(() => {
    // Get a random provider from mock data for demo
    const randomIndex = Math.floor(Math.random() * Math.min(mockProviderData.length, 100));
    const provider = mockProviderData[randomIndex] || mockProviderData[0];

    // Ensure the provider has all required fields
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
      medicare: provider.medicare || provider.medicare || [],
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-6">
          {/* Left Section: Logo + Title + Call Controls */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                Agent Call Center
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Handle calls with AI-powered assistance
              </p>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block mx-2" />
            <CallControlPanel compact />
          </div>

          {/* Right Section: Mode Toggle + History + Status */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Data Collection Mode Toggle */}
            {state.activeCall && state.activeCall.state === 'IN_CALL' && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setDataMode('questionnaire')}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    dataMode === 'questionnaire'
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Questionnaire</span>
                </button>
                <button
                  onClick={() => setDataMode('form')}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    dataMode === 'form'
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Form</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              title="Call History"
            >
              <History className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium sm:inline hidden">History</span>
            </button>
            <AgentStatusWidget />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 sm:p-6">
        <div className="mx-auto">
          {/* Top Row: Caller Info */}
          <div className="mb-4 sm:mb-6">
            <CallerInfoPanel provider={currentProvider} />
          </div>

          {/* Middle Row: Data Collection (Questionnaire OR Form) + Live Transcription + AI Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Data Collection Panel - Questionnaire or Form based on mode - 60% */}
            <div className="lg:col-span-3">
              {dataMode === 'questionnaire' ? (
                <QuestionnairePanel />
              ) : (
                <ProviderFormPanel
                  provider={currentProvider}
                  isCallActive={!!state.activeCall && state.activeCall.state === 'IN_CALL'}
                  onSave={(provider) => {
                    console.log('Saving provider data:', provider);
                    // Handle save - in real app, this would call an API
                  }}
                />
              )}
            </div>

            {/* Live Transcription - Takes 1 column - 20% */}
            <TranscriptionPanel />

            {/* AI Suggestions - Takes 1 column - 20% */}
            <AISuggestionsPanel />
          </div>

          {/* Bottom Row: Notes */}
          <div className="mb-4 sm:mb-6">
            <CallNotesPanel />
          </div>

          {/* Action Quick Bar */}
          <ActionQuickBar />
        </div>
      </main>

      {/* Call History Modal */}
      <CallHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Toast Notifications */}
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
