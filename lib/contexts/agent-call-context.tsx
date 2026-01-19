'use client';

// ============================================================================
// Agent Call Context
// Provides state management for the agent call screen
// ============================================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

import type {
  ActiveCall,
  CallState,
  CallerInfo,
  InteractionHistoryItem,
  Case,
  LiveTranscription,
  AISuggestion,
  QuestionnaireState,
  CallNote,
  CallHistoryEntry,
  QuickActionType,
  AutoFillField,
} from '../agent-call-types';

import type { AgentStatus } from '../outreach-queue-types';

import * as api from '../agent-call-api';
import * as twilio from '../twilio/device';

// ----------------------------------------------------------------------------
// State Types
// ----------------------------------------------------------------------------

export interface AgentCallState {
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
  aiSuggestions: AISuggestion[];
  aiViewMode: 'CONDENSED' | 'EXPANDED';

  // Questionnaire
  questionnaire: QuestionnaireState | null;

  // Notes
  callNotes: CallNote[];
  draftNote: string;

  // Call History
  callHistory: CallHistoryEntry[];

  // UI State
  activeTab: 'contact' | 'history' | 'tickets';
  isPanelCollapsed: Record<string, boolean>;
  isDialPadOpen: boolean;

  // Loading states
  isLoading: boolean;
  isCallerInfoLoading: boolean;
  isTranscriptionLoading: boolean;
  isSuggestionsLoading: boolean;

  // Error state
  error: string | null;

  // Toast notification
  toast: { message: string; type: 'success' | 'error' } | null;
}

// ----------------------------------------------------------------------------
// Action Types
// ----------------------------------------------------------------------------

type AgentCallAction =
  | { type: 'SET_ACTIVE_CALL'; payload: ActiveCall | null }
  | { type: 'UPDATE_CALL_STATE'; payload: CallState }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_ON_HOLD'; payload: boolean }
  | { type: 'SET_AGENT_STATUS'; payload: AgentStatus['status'] }
  | { type: 'SET_CALLER_INFO'; payload: CallerInfo | null }
  | { type: 'SET_CALLER_INFO_LOADING'; payload: boolean }
  | { type: 'SET_INTERACTION_HISTORY'; payload: InteractionHistoryItem[] }
  | { type: 'SET_CASES'; payload: Case[] }
  | { type: 'SET_TRANSCRIPTION'; payload: LiveTranscription | null }
  | { type: 'SET_TRANSCRIPTION_LOADING'; payload: boolean }
  | { type: 'SET_AI_SUGGESTIONS'; payload: AISuggestion[] }
  | { type: 'SET_SUGGESTIONS_LOADING'; payload: boolean }
  | { type: 'TOGGLE_AI_VIEW_MODE' }
  | { type: 'MARK_SUGGESTION_USED'; payload: string }
  | { type: 'SET_QUESTIONNAIRE'; payload: QuestionnaireState | null }
  | { type: 'UPDATE_QUESTIONNAIRE_FIELD'; payload: { fieldId: string; value: string; isConfirmed: boolean } }
  | { type: 'SET_CALL_NOTES'; payload: CallNote[] }
  | { type: 'ADD_CALL_NOTE'; payload: CallNote }
  | { type: 'SET_DRAFT_NOTE'; payload: string }
  | { type: 'SET_CALL_HISTORY'; payload: CallHistoryEntry[] }
  | { type: 'SET_ACTIVE_TAB'; payload: 'contact' | 'history' | 'tickets' }
  | { type: 'TOGGLE_PANEL'; payload: string }
  | { type: 'SET_DIAL_PAD_OPEN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TOAST'; payload: { message: string; type: 'success' | 'error' } | null }
  | { type: 'RESET_CALL_STATE' };

// ----------------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------------

const initialState: AgentCallState = {
  activeCall: null,
  agentStatus: 'ONLINE',
  callerInfo: null,
  interactionHistory: [],
  cases: [],
  transcription: null,
  aiSuggestions: [],
  aiViewMode: 'CONDENSED',
  questionnaire: null,
  callNotes: [],
  draftNote: '',
  callHistory: [],
  activeTab: 'contact',
  isPanelCollapsed: {},
  isDialPadOpen: false,
  isLoading: false,
  isCallerInfoLoading: false,
  isTranscriptionLoading: false,
  isSuggestionsLoading: false,
  error: null,
  toast: null,
};

// ----------------------------------------------------------------------------
// Reducer
// ----------------------------------------------------------------------------

function agentCallReducer(state: AgentCallState, action: AgentCallAction): AgentCallState {
  switch (action.type) {
    case 'SET_ACTIVE_CALL':
      return { ...state, activeCall: action.payload };

    case 'UPDATE_CALL_STATE':
      if (!state.activeCall) return state;
      return {
        ...state,
        activeCall: { ...state.activeCall, state: action.payload },
      };

    case 'SET_MUTED':
      if (!state.activeCall) return state;
      return {
        ...state,
        activeCall: { ...state.activeCall, isMuted: action.payload },
      };

    case 'SET_ON_HOLD':
      if (!state.activeCall) return state;
      return {
        ...state,
        activeCall: {
          ...state.activeCall,
          isOnHold: action.payload,
          state: action.payload ? 'ON_HOLD' : 'IN_CALL',
          holdStartedAt: action.payload ? new Date().toISOString() : undefined,
        },
      };

    case 'SET_AGENT_STATUS':
      return { ...state, agentStatus: action.payload };

    case 'SET_CALLER_INFO':
      return { ...state, callerInfo: action.payload };

    case 'SET_CALLER_INFO_LOADING':
      return { ...state, isCallerInfoLoading: action.payload };

    case 'SET_INTERACTION_HISTORY':
      return { ...state, interactionHistory: action.payload };

    case 'SET_CASES':
      return { ...state, cases: action.payload };

    case 'SET_TRANSCRIPTION':
      return { ...state, transcription: action.payload };

    case 'SET_TRANSCRIPTION_LOADING':
      return { ...state, isTranscriptionLoading: action.payload };

    case 'SET_AI_SUGGESTIONS':
      return { ...state, aiSuggestions: action.payload };

    case 'SET_SUGGESTIONS_LOADING':
      return { ...state, isSuggestionsLoading: action.payload };

    case 'TOGGLE_AI_VIEW_MODE':
      return {
        ...state,
        aiViewMode: state.aiViewMode === 'CONDENSED' ? 'EXPANDED' : 'CONDENSED',
      };

    case 'MARK_SUGGESTION_USED':
      return {
        ...state,
        aiSuggestions: state.aiSuggestions.map((s) =>
          s.suggestionId === action.payload ? { ...s, isUsed: true } : s
        ),
      };

    case 'SET_QUESTIONNAIRE':
      return { ...state, questionnaire: action.payload };

    case 'UPDATE_QUESTIONNAIRE_FIELD':
      if (!state.questionnaire) return state;
      return {
        ...state,
        questionnaire: {
          ...state.questionnaire,
          sections: state.questionnaire.sections.map((section) => ({
            ...section,
            fields: section.fields.map((field) =>
              field.fieldId === action.payload.fieldId
                ? {
                    ...field,
                    confirmedValue: action.payload.value,
                    isConfirmed: action.payload.isConfirmed,
                    isEditing: false,
                  }
                : field
            ),
          })),
        },
      };

    case 'SET_CALL_NOTES':
      return { ...state, callNotes: action.payload };

    case 'ADD_CALL_NOTE':
      return { ...state, callNotes: [action.payload, ...state.callNotes] };

    case 'SET_DRAFT_NOTE':
      return { ...state, draftNote: action.payload };

    case 'SET_CALL_HISTORY':
      return { ...state, callHistory: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'TOGGLE_PANEL':
      return {
        ...state,
        isPanelCollapsed: {
          ...state.isPanelCollapsed,
          [action.payload]: !state.isPanelCollapsed[action.payload],
        },
      };

    case 'SET_DIAL_PAD_OPEN':
      return { ...state, isDialPadOpen: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_TOAST':
      return { ...state, toast: action.payload };

    case 'RESET_CALL_STATE':
      return {
        ...state,
        activeCall: null,
        callerInfo: null,
        interactionHistory: [],
        cases: [],
        transcription: null,
        aiSuggestions: [],
        questionnaire: null,
        callNotes: [],
        draftNote: '',
        isDialPadOpen: false,
        error: null,
      };

    default:
      return state;
  }
}

// ----------------------------------------------------------------------------
// Context Type
// ----------------------------------------------------------------------------

interface AgentCallContextType {
  state: AgentCallState;

  // Twilio
  initializeTwilio: (token: string) => Promise<void>;

  // Call controls
  answerCall: () => Promise<void>;
  hangUp: () => Promise<void>;
  toggleHold: () => Promise<void>;
  toggleMute: () => Promise<void>;
  transfer: (targetNumber: string) => Promise<void>;
  sendDTMF: (digit: string) => void;
  initiateCall: (phoneNumber: string) => Promise<void>;

  // Agent status
  setAgentStatus: (status: AgentStatus['status']) => void;

  // UI actions
  setActiveTab: (tab: 'contact' | 'history' | 'tickets') => void;
  togglePanel: (panelId: string) => void;
  setDialPadOpen: (open: boolean) => void;

  // Questionnaire
  updateField: (fieldId: string, value: string, isConfirmed?: boolean) => void;
  confirmField: (fieldId: string) => void;

  // Notes
  setDraftNote: (note: string) => void;
  saveNote: () => Promise<void>;

  // AI Suggestions
  useSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  toggleAIViewMode: () => void;

  // Quick Actions
  executeQuickAction: (actionType: QuickActionType, data?: Record<string, unknown>) => Promise<void>;

  // Simulation (for demo)
  simulateIncomingCall: () => Promise<void>;

  // Toast
  showToast: (message: string, type: 'success' | 'error') => void;
  clearToast: () => void;
}

// ----------------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------------

const AgentCallContext = createContext<AgentCallContextType | undefined>(undefined);

// ----------------------------------------------------------------------------
// Provider
// ----------------------------------------------------------------------------

interface AgentCallProviderProps {
  children: ReactNode;
}

export function AgentCallProvider({ children }: AgentCallProviderProps) {
  const [state, dispatch] = useReducer(agentCallReducer, initialState);

  // Auto-clear toast after 3 seconds
  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_TOAST', payload: null });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  // Load caller info when call becomes active
  useEffect(() => {
    if (state.activeCall && state.activeCall.state === 'IN_CALL' && !state.callerInfo) {
      loadCallerInfo(state.activeCall.phoneNumber);
    }
  }, [state.activeCall?.state]);

  // Helper: Load caller information
  const loadCallerInfo = useCallback(async (phoneNumber: string) => {
    dispatch({ type: 'SET_CALLER_INFO_LOADING', payload: true });
    try {
      const response = await api.lookupCaller({ phoneNumber });
      if (response.success && response.data) {
        dispatch({ type: 'SET_CALLER_INFO', payload: response.data });

        // Load related data
        if (response.data.providerId) {
          const [historyRes, casesRes] = await Promise.all([
            api.fetchInteractionHistory(response.data.providerId),
            api.fetchCases(response.data.providerId),
          ]);

          if (historyRes.success && historyRes.data) {
            dispatch({ type: 'SET_INTERACTION_HISTORY', payload: historyRes.data });
          }
          if (casesRes.success && casesRes.data) {
            dispatch({ type: 'SET_CASES', payload: casesRes.data });
          }
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load caller information' });
    } finally {
      dispatch({ type: 'SET_CALLER_INFO_LOADING', payload: false });
    }
  }, []);

  // Helper: Load transcription and AI suggestions
  const loadCallData = useCallback(async (callId: string) => {
    dispatch({ type: 'SET_TRANSCRIPTION_LOADING', payload: true });
    dispatch({ type: 'SET_SUGGESTIONS_LOADING', payload: true });

    try {
      const [transcriptionRes, suggestionsRes, questionnaireRes, notesRes] = await Promise.all([
        api.fetchLiveTranscription(callId),
        api.fetchAISuggestions(callId),
        api.fetchQuestionnaire(callId),
        api.fetchCallNotes(callId),
      ]);

      if (transcriptionRes.success && transcriptionRes.data) {
        dispatch({ type: 'SET_TRANSCRIPTION', payload: transcriptionRes.data });
      }
      if (suggestionsRes.success && suggestionsRes.data) {
        dispatch({ type: 'SET_AI_SUGGESTIONS', payload: suggestionsRes.data });
      }
      if (questionnaireRes.success && questionnaireRes.data) {
        dispatch({ type: 'SET_QUESTIONNAIRE', payload: questionnaireRes.data });
      }
      if (notesRes.success && notesRes.data) {
        dispatch({ type: 'SET_CALL_NOTES', payload: notesRes.data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load call data' });
    } finally {
      dispatch({ type: 'SET_TRANSCRIPTION_LOADING', payload: false });
      dispatch({ type: 'SET_SUGGESTIONS_LOADING', payload: false });
    }
  }, []);

  // ----------------------------------------------------------------------------
  // Twilio Integration
  // ----------------------------------------------------------------------------

  let twilioInitialized = false;

  const initializeTwilio = useCallback(async (token: string) => {
    try {
      await twilio.initializeDevice(token, {
        codecPreferences: ['OPUS', 'PCMU'],
        allowIncomingWhileBusy: true,
        debug: true,
      });

      // Set up Twilio event listeners
      twilio.on('ready', () => {
        twilioInitialized = true;
        dispatch({ type: 'SET_AGENT_STATUS', payload: 'ONLINE' });
      });

      twilio.on('offline', () => {
        twilioInitialized = false;
        dispatch({ type: 'SET_ERROR', payload: 'Twilio device offline' });
      });

      twilio.on('incoming', (call) => {
        // Convert Twilio call to our ActiveCall format
        dispatch({
          type: 'SET_ACTIVE_CALL',
          payload: {
            callId: call.callId,
            state: 'INCOMING',
            direction: 'inbound',
            phoneNumber: call.phoneNumber,
            callerName: call.callerName || 'Unknown Caller',
            startedAt: new Date().toISOString(),
          },
        });
      });

      twilio.on('connected', (call) => {
        dispatch({
          type: 'UPDATE_CALL_STATE',
          payload: 'IN_CALL',
        });
        if (state.activeCall) {
          dispatch({
            type: 'SET_ACTIVE_CALL',
            payload: {
              ...state.activeCall,
              state: 'IN_CALL',
              connectedAt: new Date().toISOString(),
            },
          });
        }
        loadCallerInfo(call.phoneNumber);
      });

      twilio.on('disconnected', (call) => {
        dispatch({ type: 'UPDATE_CALL_STATE', payload: 'ENDED' });
        setTimeout(() => {
          dispatch({ type: 'RESET_CALL_STATE' });
          dispatch({ type: 'SET_AGENT_STATUS', payload: 'ONLINE' });
        }, 2000);
      });

      twilio.on('error', (error) => {
        dispatch({ type: 'SET_ERROR', payload: `Twilio error: ${error.message}` });
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize Twilio' });
      throw error;
    }
  }, [state.activeCall, loadCallerInfo]);

  // ----------------------------------------------------------------------------
  // Call Controls
  // ----------------------------------------------------------------------------

  const answerCall = useCallback(async () => {
    if (!state.activeCall || state.activeCall.state !== 'INCOMING') return;

    try {
      const response = await api.answerCall(state.activeCall.callId, state.activeCall);
      if (response.success && response.data) {
        dispatch({ type: 'SET_ACTIVE_CALL', payload: response.data });
        dispatch({ type: 'SET_AGENT_STATUS', payload: 'ON_CALL' });

        // Load call data
        await loadCallData(response.data.callId);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to answer call' });
    }
  }, [state.activeCall, loadCallData]);

  const hangUp = useCallback(async () => {
    if (!state.activeCall) return;

    try {
      const response = await api.hangUpCall(state.activeCall.callId, state.activeCall);
      if (response.success && response.data) {
        dispatch({ type: 'SET_ACTIVE_CALL', payload: response.data });

        // After a delay, reset the call state
        setTimeout(() => {
          dispatch({ type: 'RESET_CALL_STATE' });
          dispatch({ type: 'SET_AGENT_STATUS', payload: 'ONLINE' });
        }, 2000);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to hang up call' });
    }
  }, [state.activeCall]);

  const toggleHold = useCallback(async () => {
    if (!state.activeCall) return;

    const newHoldState = !state.activeCall.isOnHold;
    try {
      const response = await api.holdCall(state.activeCall.callId, state.activeCall, newHoldState);
      if (response.success && response.data) {
        dispatch({ type: 'SET_ACTIVE_CALL', payload: response.data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to ${newHoldState ? 'hold' : 'resume'} call` });
    }
  }, [state.activeCall]);

  const toggleMute = useCallback(async () => {
    if (!state.activeCall) return;

    const newMuteState = !state.activeCall.isMuted;
    try {
      const response = await api.muteCall(state.activeCall.callId, state.activeCall, newMuteState);
      if (response.success && response.data) {
        dispatch({ type: 'SET_ACTIVE_CALL', payload: response.data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to ${newMuteState ? 'mute' : 'unmute'} call` });
    }
  }, [state.activeCall]);

  const transfer = useCallback(async (targetNumber: string) => {
    if (!state.activeCall) return;

    try {
      dispatch({ type: 'UPDATE_CALL_STATE', payload: 'TRANSFERRING' });
      const response = await api.transferCall(state.activeCall.callId, targetNumber);
      if (response.success) {
        dispatch({ type: 'SET_TOAST', payload: { message: 'Call transferred successfully', type: 'success' } });
        dispatch({ type: 'RESET_CALL_STATE' });
        dispatch({ type: 'SET_AGENT_STATUS', payload: 'ONLINE' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to transfer call' });
      dispatch({ type: 'UPDATE_CALL_STATE', payload: 'IN_CALL' });
    }
  }, [state.activeCall]);

  const sendDTMF = useCallback((digit: string) => {
    if (!state.activeCall) return;
    // Use Twilio to send DTMF tones
    twilio.sendDigits(digit);
    // Also call API for logging
    api.sendDTMF(state.activeCall.callId, digit);
  }, [state.activeCall]);

  const initiateCall = useCallback(async (phoneNumber: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Use Twilio to make the call
      await twilio.makeCall(phoneNumber);

      // Create a local call state for UI
      const tempCall = {
        callId: `temp-${Date.now()}`,
        state: 'OUTGOING' as const,
        direction: 'outbound' as const,
        phoneNumber,
        startedAt: new Date().toISOString(),
      };
      dispatch({ type: 'SET_ACTIVE_CALL', payload: tempCall });
      dispatch({ type: 'SET_AGENT_STATUS', payload: 'ON_CALL' });

      // Also call API for logging purposes
      const response = await api.initiateCall(phoneNumber);
      if (response.success && response.data) {
        // Update with the real call ID from the backend
        dispatch({ type: 'SET_ACTIVE_CALL', payload: response.data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initiate call' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // ----------------------------------------------------------------------------
  // Agent Status
  // ----------------------------------------------------------------------------

  const setAgentStatus = useCallback((status: AgentStatus['status']) => {
    dispatch({ type: 'SET_AGENT_STATUS', payload: status });
    api.updateAgentStatus(status);
  }, []);

  // ----------------------------------------------------------------------------
  // UI Actions
  // ----------------------------------------------------------------------------

  const setActiveTab = useCallback((tab: 'contact' | 'history' | 'tickets') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const togglePanel = useCallback((panelId: string) => {
    dispatch({ type: 'TOGGLE_PANEL', payload: panelId });
  }, []);

  const setDialPadOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_DIAL_PAD_OPEN', payload: open });
  }, []);

  // ----------------------------------------------------------------------------
  // Questionnaire
  // ----------------------------------------------------------------------------

  const updateField = useCallback((fieldId: string, value: string, isConfirmed: boolean = false) => {
    dispatch({ type: 'UPDATE_QUESTIONNAIRE_FIELD', payload: { fieldId, value, isConfirmed } });

    if (state.activeCall) {
      api.updateQuestionnaireField({
        callId: state.activeCall.callId,
        fieldId,
        value,
        isConfirmed,
      });
    }
  }, [state.activeCall]);

  const confirmField = useCallback((fieldId: string) => {
    const field = state.questionnaire?.sections
      .flatMap((s) => s.fields)
      .find((f) => f.fieldId === fieldId);

    if (field) {
      const value = field.aiSuggestedValue || field.originalValue || '';
      updateField(fieldId, value, true);
    }
  }, [state.questionnaire, updateField]);

  // ----------------------------------------------------------------------------
  // Notes
  // ----------------------------------------------------------------------------

  const setDraftNote = useCallback((note: string) => {
    dispatch({ type: 'SET_DRAFT_NOTE', payload: note });
  }, []);

  const saveNote = useCallback(async () => {
    if (!state.activeCall || !state.draftNote.trim()) return;

    try {
      const response = await api.saveCallNotes({
        callId: state.activeCall.callId,
        notes: state.draftNote,
      });

      if (response.success && response.data) {
        dispatch({ type: 'ADD_CALL_NOTE', payload: response.data });
        dispatch({ type: 'SET_DRAFT_NOTE', payload: '' });
        dispatch({ type: 'SET_TOAST', payload: { message: 'Note saved', type: 'success' } });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save note' });
    }
  }, [state.activeCall, state.draftNote]);

  // ----------------------------------------------------------------------------
  // AI Suggestions
  // ----------------------------------------------------------------------------

  const useSuggestion = useCallback((suggestionId: string) => {
    dispatch({ type: 'MARK_SUGGESTION_USED', payload: suggestionId });
    dispatch({ type: 'SET_TOAST', payload: { message: 'Suggestion applied', type: 'success' } });
  }, []);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    dispatch({
      type: 'SET_AI_SUGGESTIONS',
      payload: state.aiSuggestions.filter((s) => s.suggestionId !== suggestionId),
    });
  }, [state.aiSuggestions]);

  const toggleAIViewMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_AI_VIEW_MODE' });
  }, []);

  // ----------------------------------------------------------------------------
  // Quick Actions
  // ----------------------------------------------------------------------------

  const executeQuickAction = useCallback(async (actionType: QuickActionType, data?: Record<string, unknown>) => {
    try {
      switch (actionType) {
        case 'SEND_SMS':
          if (state.callerInfo?.phoneNumber) {
            await api.sendSMS({
              phoneNumber: state.callerInfo.phoneNumber,
              message: (data?.message as string) || 'Thank you for your time today.',
            });
            dispatch({ type: 'SET_TOAST', payload: { message: 'SMS sent', type: 'success' } });
          }
          break;

        case 'CREATE_TASK':
          await api.createTask({
            title: (data?.title as string) || 'Follow-up task',
            priority: 'MEDIUM',
            providerId: state.callerInfo?.providerId,
          });
          dispatch({ type: 'SET_TOAST', payload: { message: 'Task created', type: 'success' } });
          break;

        case 'SCHEDULE_CALLBACK':
          if (state.callerInfo?.phoneNumber) {
            await api.scheduleCallback({
              phoneNumber: state.callerInfo.phoneNumber,
              providerId: state.callerInfo.providerId,
              scheduledAt: (data?.scheduledAt as string) || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            });
            dispatch({ type: 'SET_TOAST', payload: { message: 'Callback scheduled', type: 'success' } });
          }
          break;

        case 'OPEN_CRM':
          if (state.callerInfo?.providerId) {
            const response = await api.openCRM(state.callerInfo.providerId);
            if (response.success && response.data) {
              window.open(response.data, '_blank');
            }
          }
          break;

        case 'ADD_NOTE':
          await saveNote();
          break;

        default:
          break;
      }
    } catch (error) {
      dispatch({ type: 'SET_TOAST', payload: { message: 'Action failed', type: 'error' } });
    }
  }, [state.callerInfo, saveNote]);

  // ----------------------------------------------------------------------------
  // Simulation (for demo)
  // ----------------------------------------------------------------------------

  const simulateIncomingCall = useCallback(async () => {
    try {
      const response = await api.simulateIncomingCallEvent();
      if (response.success && response.data) {
        dispatch({ type: 'SET_ACTIVE_CALL', payload: response.data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to simulate incoming call' });
    }
  }, []);

  // ----------------------------------------------------------------------------
  // Toast
  // ----------------------------------------------------------------------------

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type } });
  }, []);

  const clearToast = useCallback(() => {
    dispatch({ type: 'SET_TOAST', payload: null });
  }, []);

  // ----------------------------------------------------------------------------
  // Load initial data
  // ----------------------------------------------------------------------------

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const historyRes = await api.fetchCallHistory();
        if (historyRes.success && historyRes.data) {
          dispatch({ type: 'SET_CALL_HISTORY', payload: historyRes.data });
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // ----------------------------------------------------------------------------
  // Context Value
  // ----------------------------------------------------------------------------

  const contextValue: AgentCallContextType = {
    state,
    initializeTwilio,
    answerCall,
    hangUp,
    toggleHold,
    toggleMute,
    transfer,
    sendDTMF,
    initiateCall,
    setAgentStatus,
    setActiveTab,
    togglePanel,
    setDialPadOpen,
    updateField,
    confirmField,
    setDraftNote,
    saveNote,
    useSuggestion,
    dismissSuggestion,
    toggleAIViewMode,
    executeQuickAction,
    simulateIncomingCall,
    showToast,
    clearToast,
  };

  return (
    <AgentCallContext.Provider value={contextValue}>
      {children}
    </AgentCallContext.Provider>
  );
}

// ----------------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------------

export function useAgentCall(): AgentCallContextType {
  const context = useContext(AgentCallContext);
  if (context === undefined) {
    throw new Error('useAgentCall must be used within an AgentCallProvider');
  }
  return context;
}

export default AgentCallContext;
