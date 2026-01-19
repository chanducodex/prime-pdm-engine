// ============================================================================
// Agent Call Center - Mock API Functions
// Simulates API calls for the agent call screen
// ============================================================================

import type {
  ActiveCall,
  CallerInfo,
  InteractionHistoryItem,
  Case,
  LiveTranscription,
  AISuggestion,
  QuestionnaireState,
  CallNote,
  CallHistoryEntry,
  ApiResponse,
  LookupCallerRequest,
  SaveCallNotesRequest,
  UpdateQuestionnaireFieldRequest,
  ScheduleCallbackRequest,
  SendSMSRequest,
  CreateTaskRequest,
} from './agent-call-types';

import {
  generateMockActiveCall,
  generateMockCallerInfo,
  generateMockInteractionHistory,
  generateMockCases,
  generateMockLiveTranscription,
  generateMockAISuggestions,
  generateMockQuestionnaire,
  generateMockCallNotes,
  generateMockCallHistory,
  simulateCallAnswer,
  simulateCallHold,
  simulateCallMute,
  simulateCallEnd,
} from './agent-call-mock-data';

// ----------------------------------------------------------------------------
// Simulated Delay Helper
// ----------------------------------------------------------------------------

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate network latency
const MOCK_DELAY_MIN = 200;
const MOCK_DELAY_MAX = 800;

function randomDelay(): number {
  return Math.floor(Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN)) + MOCK_DELAY_MIN;
}

// ----------------------------------------------------------------------------
// Caller Lookup APIs
// ----------------------------------------------------------------------------

export async function lookupCaller(request: LookupCallerRequest): Promise<ApiResponse<CallerInfo>> {
  await delay(randomDelay());

  try {
    const callerInfo = generateMockCallerInfo(request.phoneNumber);
    return {
      success: true,
      data: callerInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to lookup caller information',
    };
  }
}

export async function fetchInteractionHistory(providerId: string): Promise<ApiResponse<InteractionHistoryItem[]>> {
  await delay(randomDelay());

  try {
    const history = generateMockInteractionHistory(10);
    return {
      success: true,
      data: history,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch interaction history',
    };
  }
}

export async function fetchCases(providerId: string): Promise<ApiResponse<Case[]>> {
  await delay(randomDelay());

  try {
    const cases = generateMockCases(5);
    return {
      success: true,
      data: cases,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch cases',
    };
  }
}

// ----------------------------------------------------------------------------
// Transcription & AI APIs
// ----------------------------------------------------------------------------

export async function fetchLiveTranscription(callId: string): Promise<ApiResponse<LiveTranscription>> {
  await delay(randomDelay());

  try {
    const transcription = generateMockLiveTranscription(callId, 6);
    return {
      success: true,
      data: transcription,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch live transcription',
    };
  }
}

export async function fetchAISuggestions(callId: string, context?: string): Promise<ApiResponse<AISuggestion[]>> {
  await delay(randomDelay());

  try {
    const suggestions = generateMockAISuggestions(4);
    return {
      success: true,
      data: suggestions,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch AI suggestions',
    };
  }
}

// ----------------------------------------------------------------------------
// Questionnaire APIs
// ----------------------------------------------------------------------------

export async function fetchQuestionnaire(callId: string, taskId?: string): Promise<ApiResponse<QuestionnaireState>> {
  await delay(randomDelay());

  try {
    const questionnaire = generateMockQuestionnaire(callId);
    return {
      success: true,
      data: questionnaire,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch questionnaire',
    };
  }
}

export async function updateQuestionnaireField(request: UpdateQuestionnaireFieldRequest): Promise<ApiResponse<void>> {
  await delay(randomDelay());

  try {
    // Simulate successful update
    return {
      success: true,
      message: 'Field updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update questionnaire field',
    };
  }
}

// ----------------------------------------------------------------------------
// Call Control APIs
// ----------------------------------------------------------------------------

export async function initiateCall(phoneNumber: string): Promise<ApiResponse<ActiveCall>> {
  await delay(randomDelay());

  try {
    const call = generateMockActiveCall('OUTGOING');
    call.phoneNumber = phoneNumber;
    return {
      success: true,
      data: call,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to initiate call',
    };
  }
}

export async function answerCall(callId: string, call: ActiveCall): Promise<ApiResponse<ActiveCall>> {
  await delay(300); // Quick response for call answer

  try {
    const answeredCall = simulateCallAnswer(call);
    return {
      success: true,
      data: answeredCall,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to answer call',
    };
  }
}

export async function hangUpCall(callId: string, call: ActiveCall): Promise<ApiResponse<ActiveCall>> {
  await delay(300);

  try {
    const endedCall = simulateCallEnd(call);
    return {
      success: true,
      data: endedCall,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to hang up call',
    };
  }
}

export async function holdCall(callId: string, call: ActiveCall, hold: boolean): Promise<ApiResponse<ActiveCall>> {
  await delay(200);

  try {
    const updatedCall = simulateCallHold(call, hold);
    return {
      success: true,
      data: updatedCall,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to ${hold ? 'hold' : 'resume'} call`,
    };
  }
}

export async function muteCall(callId: string, call: ActiveCall, mute: boolean): Promise<ApiResponse<ActiveCall>> {
  await delay(100); // Very quick for mute

  try {
    const updatedCall = simulateCallMute(call, mute);
    return {
      success: true,
      data: updatedCall,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to ${mute ? 'mute' : 'unmute'} call`,
    };
  }
}

export async function transferCall(callId: string, targetNumber: string): Promise<ApiResponse<void>> {
  await delay(randomDelay());

  try {
    // Simulate successful transfer
    return {
      success: true,
      message: 'Call transferred successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to transfer call',
    };
  }
}

export async function sendDTMF(callId: string, digit: string): Promise<ApiResponse<void>> {
  await delay(50); // Very quick for DTMF

  try {
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to send DTMF tone',
    };
  }
}

// ----------------------------------------------------------------------------
// Notes APIs
// ----------------------------------------------------------------------------

export async function fetchCallNotes(callId: string): Promise<ApiResponse<CallNote[]>> {
  await delay(randomDelay());

  try {
    const notes = generateMockCallNotes(callId, 3);
    return {
      success: true,
      data: notes,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch call notes',
    };
  }
}

export async function saveCallNotes(request: SaveCallNotesRequest): Promise<ApiResponse<CallNote>> {
  await delay(randomDelay());

  try {
    const newNote: CallNote = {
      noteId: `note-${Date.now()}`,
      callId: request.callId,
      content: request.notes,
      createdAt: new Date().toISOString(),
      createdBy: 'Current Agent',
      tags: request.tags,
      isPrivate: false,
    };
    return {
      success: true,
      data: newNote,
      message: 'Note saved successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to save call notes',
    };
  }
}

// ----------------------------------------------------------------------------
// Call History API
// ----------------------------------------------------------------------------

export async function fetchCallHistory(providerId?: string): Promise<ApiResponse<CallHistoryEntry[]>> {
  await delay(randomDelay());

  try {
    const history = generateMockCallHistory(10);
    return {
      success: true,
      data: history,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch call history',
    };
  }
}

// ----------------------------------------------------------------------------
// Quick Action APIs
// ----------------------------------------------------------------------------

export async function sendSMS(request: SendSMSRequest): Promise<ApiResponse<void>> {
  await delay(randomDelay());

  try {
    return {
      success: true,
      message: 'SMS sent successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to send SMS',
    };
  }
}

export async function scheduleCallback(request: ScheduleCallbackRequest): Promise<ApiResponse<string>> {
  await delay(randomDelay());

  try {
    return {
      success: true,
      data: `callback-${Date.now()}`,
      message: 'Callback scheduled successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to schedule callback',
    };
  }
}

export async function createTask(request: CreateTaskRequest): Promise<ApiResponse<string>> {
  await delay(randomDelay());

  try {
    return {
      success: true,
      data: `task-${Date.now()}`,
      message: 'Task created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create task',
    };
  }
}

export async function openCRM(providerId: string): Promise<ApiResponse<string>> {
  await delay(100);

  try {
    // Return a mock CRM URL
    return {
      success: true,
      data: `https://crm.example.com/providers/${providerId}`,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to get CRM link',
    };
  }
}

// ----------------------------------------------------------------------------
// Agent Status APIs
// ----------------------------------------------------------------------------

export type AgentStatusValue = 'ONLINE' | 'ON_CALL' | 'AWAY' | 'OFFLINE' | 'ON_BREAK';

export async function updateAgentStatus(status: AgentStatusValue): Promise<ApiResponse<void>> {
  await delay(200);

  try {
    return {
      success: true,
      message: `Status updated to ${status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update agent status',
    };
  }
}

export async function getAgentStatus(): Promise<ApiResponse<AgentStatusValue>> {
  await delay(100);

  try {
    return {
      success: true,
      data: 'ONLINE',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to get agent status',
    };
  }
}

// ----------------------------------------------------------------------------
// Simulation APIs (for demo purposes)
// ----------------------------------------------------------------------------

export async function simulateIncomingCallEvent(): Promise<ApiResponse<ActiveCall>> {
  await delay(randomDelay());

  try {
    const call = generateMockActiveCall('INCOMING');
    return {
      success: true,
      data: call,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to simulate incoming call',
    };
  }
}
