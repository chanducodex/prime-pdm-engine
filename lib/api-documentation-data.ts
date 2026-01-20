// ============================================================================
// API Documentation Data
// Comprehensive API specifications for the Agent Call Center
// ============================================================================

export type APIMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type APICategory =
  | 'CALL_CONTROL'
  | 'CALLER_LOOKUP'
  | 'TRANSCRIPTION'
  | 'AI_SUGGESTIONS'
  | 'NOTES_QUESTIONNAIRE'
  | 'QUICK_ACTIONS'
  | 'AGENT_STATUS'
  | 'CALL_QUALITY'
  | 'SENTIMENT'
  | 'SCRIPTS'
  | 'RECORDING'
  | 'ESCALATION'
  | 'PERFORMANCE'
  | 'KNOWLEDGE_BASE'
  | 'CALLBACKS'
  | 'MULTI_CHANNEL';

export interface PayloadField {
  field: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface APIEndpoint {
  id: string;
  category: APICategory;
  name: string;
  method: APIMethod;
  path: string;
  description: string;
  requestPayload?: PayloadField[];
  responsePayload: PayloadField[];
  exampleRequest?: string;
  exampleResponse: string;
  authRequired: boolean;
  rateLimit?: string;
}

export interface APICategoryInfo {
  id: APICategory;
  label: string;
  description: string;
  icon: string;
}

// Category metadata
export const API_CATEGORIES: APICategoryInfo[] = [
  {
    id: 'CALL_CONTROL',
    label: 'Call Control',
    description: 'Manage call operations including answer, hangup, hold, mute, and transfer',
    icon: 'Phone',
  },
  {
    id: 'CALLER_LOOKUP',
    label: 'Caller Lookup',
    description: 'Look up caller/provider information and interaction history',
    icon: 'Search',
  },
  {
    id: 'TRANSCRIPTION',
    label: 'Transcription',
    description: 'Real-time call transcription services',
    icon: 'MessageSquare',
  },
  {
    id: 'AI_SUGGESTIONS',
    label: 'AI Suggestions',
    description: 'AI-powered conversation assistance and recommendations',
    icon: 'Sparkles',
  },
  {
    id: 'NOTES_QUESTIONNAIRE',
    label: 'Notes & Forms',
    description: 'Call notes and questionnaire/form management',
    icon: 'FileText',
  },
  {
    id: 'QUICK_ACTIONS',
    label: 'Quick Actions',
    description: 'SMS, tasks, callbacks, and other quick actions',
    icon: 'Zap',
  },
  {
    id: 'AGENT_STATUS',
    label: 'Agent Status',
    description: 'Agent availability and status management',
    icon: 'User',
  },
  {
    id: 'CALL_QUALITY',
    label: 'Call Quality',
    description: 'Real-time call quality metrics and monitoring',
    icon: 'Signal',
  },
  {
    id: 'SENTIMENT',
    label: 'Sentiment Analysis',
    description: 'Customer sentiment tracking and analysis',
    icon: 'Heart',
  },
  {
    id: 'SCRIPTS',
    label: 'Scripts Library',
    description: 'Canned responses and script management',
    icon: 'BookOpen',
  },
  {
    id: 'RECORDING',
    label: 'Recording',
    description: 'Call recording controls and management',
    icon: 'Mic',
  },
  {
    id: 'ESCALATION',
    label: 'Escalation',
    description: 'Call escalation and supervisor management',
    icon: 'AlertTriangle',
  },
  {
    id: 'PERFORMANCE',
    label: 'Performance',
    description: 'Agent performance metrics and KPIs',
    icon: 'BarChart2',
  },
  {
    id: 'KNOWLEDGE_BASE',
    label: 'Knowledge Base',
    description: 'Knowledge base articles and search',
    icon: 'Book',
  },
  {
    id: 'CALLBACKS',
    label: 'Callbacks',
    description: 'Callback scheduling and management',
    icon: 'Calendar',
  },
  {
    id: 'MULTI_CHANNEL',
    label: 'Multi-Channel',
    description: 'Multi-channel queue management',
    icon: 'Layers',
  },
];

// Comprehensive API endpoints
export const API_ENDPOINTS: APIEndpoint[] = [
  // ============================================================================
  // CALL CONTROL APIs
  // ============================================================================
  {
    id: 'initiate-call',
    category: 'CALL_CONTROL',
    name: 'Initiate Call',
    method: 'POST',
    path: '/api/calls/initiate',
    description: 'Initiate an outbound call to a phone number',
    authRequired: true,
    rateLimit: '10 requests/minute',
    requestPayload: [
      { field: 'phoneNumber', type: 'string', required: true, description: 'Phone number in E.164 format', example: '+14155551234' },
      { field: 'providerId', type: 'string', required: false, description: 'Associated provider ID', example: 'prov_123456' },
      { field: 'queueId', type: 'string', required: false, description: 'Source queue ID', example: 'queue_abc123' },
      { field: 'priority', type: 'string', required: false, description: 'Call priority (P1-P4)', example: 'P2' },
      { field: 'taskId', type: 'string', required: false, description: 'Associated task ID', example: 'task_789' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callId', type: 'string', required: true, description: 'Unique call identifier' },
      { field: 'data.state', type: 'CallState', required: true, description: 'Current call state (OUTGOING)' },
      { field: 'data.direction', type: 'string', required: true, description: 'Call direction (OUTBOUND)' },
      { field: 'data.startedAt', type: 'string', required: true, description: 'ISO timestamp of call start' },
      { field: 'data.phoneNumber', type: 'string', required: true, description: 'Dialed phone number' },
    ],
    exampleRequest: JSON.stringify({ phoneNumber: '+14155551234', providerId: 'prov_123456', priority: 'P2' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callId: 'call_abc123',
        state: 'OUTGOING',
        direction: 'OUTBOUND',
        startedAt: '2024-01-15T10:30:00Z',
        phoneNumber: '+14155551234',
        isMuted: false,
        isOnHold: false,
        isRecording: false,
      },
    }, null, 2),
  },
  {
    id: 'answer-call',
    category: 'CALL_CONTROL',
    name: 'Answer Call',
    method: 'POST',
    path: '/api/calls/{callId}/answer',
    description: 'Answer an incoming call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'autoRecord', type: 'boolean', required: false, description: 'Start recording automatically', example: 'true' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callId', type: 'string', required: true, description: 'Call identifier' },
      { field: 'data.state', type: 'CallState', required: true, description: 'Updated call state (IN_CALL)' },
      { field: 'data.connectedAt', type: 'string', required: true, description: 'ISO timestamp when call connected' },
      { field: 'data.isRecording', type: 'boolean', required: true, description: 'Whether recording is active' },
    ],
    exampleRequest: JSON.stringify({ autoRecord: true }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callId: 'call_abc123',
        state: 'IN_CALL',
        connectedAt: '2024-01-15T10:30:05Z',
        isRecording: true,
      },
    }, null, 2),
  },
  {
    id: 'hangup-call',
    category: 'CALL_CONTROL',
    name: 'Hang Up Call',
    method: 'POST',
    path: '/api/calls/{callId}/hangup',
    description: 'End an active call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'reason', type: 'string', required: false, description: 'Reason for ending call', example: 'completed' },
      { field: 'disposition', type: 'string', required: false, description: 'Call disposition code', example: 'RESOLVED' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callId', type: 'string', required: true, description: 'Call identifier' },
      { field: 'data.state', type: 'CallState', required: true, description: 'Updated call state (ENDED)' },
      { field: 'data.endedAt', type: 'string', required: true, description: 'ISO timestamp when call ended' },
      { field: 'data.duration', type: 'number', required: true, description: 'Total call duration in seconds' },
    ],
    exampleRequest: JSON.stringify({ reason: 'completed', disposition: 'RESOLVED' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callId: 'call_abc123',
        state: 'ENDED',
        endedAt: '2024-01-15T10:45:30Z',
        duration: 930,
      },
    }, null, 2),
  },
  {
    id: 'hold-call',
    category: 'CALL_CONTROL',
    name: 'Hold/Resume Call',
    method: 'POST',
    path: '/api/calls/{callId}/hold',
    description: 'Place call on hold or resume from hold',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'hold', type: 'boolean', required: true, description: 'True to hold, false to resume', example: 'true' },
      { field: 'holdMusic', type: 'string', required: false, description: 'Hold music to play', example: 'default' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callId', type: 'string', required: true, description: 'Call identifier' },
      { field: 'data.isOnHold', type: 'boolean', required: true, description: 'Current hold status' },
      { field: 'data.holdStartedAt', type: 'string', required: false, description: 'When hold started (if on hold)' },
      { field: 'data.state', type: 'CallState', required: true, description: 'Call state (ON_HOLD or IN_CALL)' },
    ],
    exampleRequest: JSON.stringify({ hold: true, holdMusic: 'default' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callId: 'call_abc123',
        isOnHold: true,
        holdStartedAt: '2024-01-15T10:35:00Z',
        state: 'ON_HOLD',
      },
    }, null, 2),
  },
  {
    id: 'mute-call',
    category: 'CALL_CONTROL',
    name: 'Mute/Unmute Call',
    method: 'POST',
    path: '/api/calls/{callId}/mute',
    description: 'Mute or unmute the agent microphone',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'mute', type: 'boolean', required: true, description: 'True to mute, false to unmute', example: 'true' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callId', type: 'string', required: true, description: 'Call identifier' },
      { field: 'data.isMuted', type: 'boolean', required: true, description: 'Current mute status' },
    ],
    exampleRequest: JSON.stringify({ mute: true }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callId: 'call_abc123',
        isMuted: true,
      },
    }, null, 2),
  },
  {
    id: 'transfer-call',
    category: 'CALL_CONTROL',
    name: 'Transfer Call',
    method: 'POST',
    path: '/api/calls/{callId}/transfer',
    description: 'Transfer call to another agent or phone number',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'targetNumber', type: 'string', required: false, description: 'Phone number to transfer to', example: '+14155559999' },
      { field: 'targetAgentId', type: 'string', required: false, description: 'Agent ID to transfer to', example: 'agent_456' },
      { field: 'transferType', type: 'string', required: false, description: 'WARM (with intro) or COLD', example: 'WARM' },
      { field: 'notes', type: 'string', required: false, description: 'Notes for receiving agent', example: 'Provider needs billing help' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callId', type: 'string', required: true, description: 'Call identifier' },
      { field: 'data.state', type: 'CallState', required: true, description: 'Call state (TRANSFERRING)' },
      { field: 'data.transferTo', type: 'string', required: true, description: 'Transfer destination' },
      { field: 'data.transferType', type: 'string', required: true, description: 'Type of transfer' },
    ],
    exampleRequest: JSON.stringify({ targetAgentId: 'agent_456', transferType: 'WARM', notes: 'Provider needs billing help' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callId: 'call_abc123',
        state: 'TRANSFERRING',
        transferTo: 'agent_456',
        transferType: 'WARM',
      },
    }, null, 2),
  },
  {
    id: 'send-dtmf',
    category: 'CALL_CONTROL',
    name: 'Send DTMF',
    method: 'POST',
    path: '/api/calls/{callId}/dtmf',
    description: 'Send DTMF tones during an active call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'digit', type: 'string', required: true, description: 'DTMF digit (0-9, *, #)', example: '5' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.digit', type: 'string', required: true, description: 'Digit that was sent' },
      { field: 'data.sentAt', type: 'string', required: true, description: 'ISO timestamp when digit was sent' },
    ],
    exampleRequest: JSON.stringify({ digit: '5' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        digit: '5',
        sentAt: '2024-01-15T10:32:15Z',
      },
    }, null, 2),
  },

  // ============================================================================
  // CALLER LOOKUP APIs
  // ============================================================================
  {
    id: 'lookup-caller',
    category: 'CALLER_LOOKUP',
    name: 'Lookup Caller',
    method: 'GET',
    path: '/api/callers/lookup',
    description: 'Look up caller/provider information by phone number',
    authRequired: true,
    rateLimit: '30 requests/minute',
    requestPayload: [
      { field: 'phoneNumber', type: 'string', required: true, description: 'Phone number to look up', example: '+14155551234' },
      { field: 'callId', type: 'string', required: false, description: 'Associated call ID', example: 'call_abc123' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.lookupStatus', type: 'string', required: true, description: 'FOUND, NOT_FOUND, or ERROR' },
      { field: 'data.providerId', type: 'string', required: false, description: 'Provider ID if found' },
      { field: 'data.providerName', type: 'string', required: false, description: 'Provider full name' },
      { field: 'data.providerNPI', type: 'string', required: false, description: 'NPI number' },
      { field: 'data.organization', type: 'string', required: false, description: 'Organization name' },
      { field: 'data.specialty', type: 'string', required: false, description: 'Medical specialty' },
      { field: 'data.priorityTier', type: 'string', required: false, description: 'Priority tier (P0-P3)' },
      { field: 'data.totalPreviousCalls', type: 'number', required: false, description: 'Total previous calls' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        phoneNumber: '+14155551234',
        lookupStatus: 'FOUND',
        providerId: 'prov_123456',
        providerName: 'Dr. Sarah Johnson',
        providerNPI: '1234567890',
        organization: 'Metro Health Center',
        specialty: 'Cardiology',
        priorityTier: 'P1',
        totalPreviousCalls: 5,
        lastContactAt: '2024-01-10T14:30:00Z',
      },
    }, null, 2),
  },
  {
    id: 'fetch-interaction-history',
    category: 'CALLER_LOOKUP',
    name: 'Fetch Interaction History',
    method: 'GET',
    path: '/api/providers/{providerId}/history',
    description: 'Get interaction history for a provider',
    authRequired: true,
    requestPayload: [
      { field: 'providerId', type: 'string', required: true, description: 'Provider ID (path parameter)', example: 'prov_123456' },
      { field: 'limit', type: 'number', required: false, description: 'Number of records to return', example: '20' },
      { field: 'offset', type: 'number', required: false, description: 'Pagination offset', example: '0' },
      { field: 'type', type: 'string', required: false, description: 'Filter by interaction type', example: 'CALL' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.interactions', type: 'array', required: true, description: 'Array of interaction records' },
      { field: 'data.interactions[].interactionId', type: 'string', required: true, description: 'Interaction ID' },
      { field: 'data.interactions[].type', type: 'string', required: true, description: 'CALL, EMAIL, SMS, NOTE, etc.' },
      { field: 'data.interactions[].timestamp', type: 'string', required: true, description: 'ISO timestamp' },
      { field: 'data.interactions[].summary', type: 'string', required: true, description: 'Interaction summary' },
      { field: 'data.interactions[].agentName', type: 'string', required: false, description: 'Agent who handled' },
      { field: 'data.total', type: 'number', required: true, description: 'Total record count' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        interactions: [
          {
            interactionId: 'int_001',
            type: 'CALL',
            timestamp: '2024-01-10T14:30:00Z',
            summary: 'Discussed credential renewal process',
            duration: 450,
            outcome: 'Resolved',
            agentName: 'John Smith',
          },
          {
            interactionId: 'int_002',
            type: 'EMAIL',
            timestamp: '2024-01-08T09:15:00Z',
            summary: 'Sent credential renewal reminder',
            agentName: 'System',
          },
        ],
        total: 15,
      },
    }, null, 2),
  },
  {
    id: 'fetch-cases',
    category: 'CALLER_LOOKUP',
    name: 'Fetch Provider Cases',
    method: 'GET',
    path: '/api/providers/{providerId}/cases',
    description: 'Get open cases/tickets for a provider',
    authRequired: true,
    requestPayload: [
      { field: 'providerId', type: 'string', required: true, description: 'Provider ID (path parameter)', example: 'prov_123456' },
      { field: 'status', type: 'string', required: false, description: 'Filter by status', example: 'OPEN' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.cases', type: 'array', required: true, description: 'Array of cases' },
      { field: 'data.cases[].caseId', type: 'string', required: true, description: 'Case ID' },
      { field: 'data.cases[].title', type: 'string', required: true, description: 'Case title' },
      { field: 'data.cases[].status', type: 'string', required: true, description: 'OPEN, IN_PROGRESS, PENDING, RESOLVED, CLOSED' },
      { field: 'data.cases[].priority', type: 'string', required: true, description: 'LOW, MEDIUM, HIGH, URGENT' },
      { field: 'data.cases[].createdAt', type: 'string', required: true, description: 'ISO timestamp' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        cases: [
          {
            caseId: 'case_001',
            title: 'Credential Renewal Pending',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            createdAt: '2024-01-05T10:00:00Z',
            assignedAgent: 'John Smith',
          },
        ],
      },
    }, null, 2),
  },

  // ============================================================================
  // TRANSCRIPTION APIs
  // ============================================================================
  {
    id: 'fetch-transcription',
    category: 'TRANSCRIPTION',
    name: 'Fetch Live Transcription',
    method: 'GET',
    path: '/api/calls/{callId}/transcription',
    description: 'Get live transcription segments for a call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'fromSegment', type: 'number', required: false, description: 'Start from segment number', example: '0' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callId', type: 'string', required: true, description: 'Call identifier' },
      { field: 'data.segments', type: 'array', required: true, description: 'Transcription segments' },
      { field: 'data.segments[].segmentId', type: 'string', required: true, description: 'Segment ID' },
      { field: 'data.segments[].speaker', type: 'string', required: true, description: 'AGENT, PROVIDER, or AI_AGENT' },
      { field: 'data.segments[].text', type: 'string', required: true, description: 'Transcribed text' },
      { field: 'data.segments[].startTime', type: 'number', required: true, description: 'Start time in seconds' },
      { field: 'data.segments[].confidence', type: 'number', required: true, description: 'Confidence score 0-1' },
      { field: 'data.segments[].sentiment', type: 'string', required: false, description: 'POSITIVE, NEUTRAL, NEGATIVE' },
      { field: 'data.isProcessing', type: 'boolean', required: true, description: 'Whether transcription is active' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callId: 'call_abc123',
        segments: [
          {
            segmentId: 'seg_001',
            speaker: 'AGENT',
            text: 'Good morning, thank you for calling. How may I assist you today?',
            startTime: 0,
            endTime: 4.5,
            confidence: 0.95,
            sentiment: 'POSITIVE',
            isLive: false,
            isFinal: true,
          },
          {
            segmentId: 'seg_002',
            speaker: 'PROVIDER',
            text: 'Hi, I need help with my credential renewal.',
            startTime: 5,
            endTime: 8,
            confidence: 0.92,
            sentiment: 'NEUTRAL',
            isLive: false,
            isFinal: true,
          },
        ],
        isProcessing: true,
        lastUpdatedAt: '2024-01-15T10:32:00Z',
      },
    }, null, 2),
  },
  {
    id: 'start-transcription',
    category: 'TRANSCRIPTION',
    name: 'Start Transcription',
    method: 'POST',
    path: '/api/calls/{callId}/transcription/start',
    description: 'Start live transcription for a call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'language', type: 'string', required: false, description: 'Transcription language', example: 'en-US' },
      { field: 'enableSentiment', type: 'boolean', required: false, description: 'Enable sentiment analysis', example: 'true' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.transcriptionId', type: 'string', required: true, description: 'Transcription session ID' },
      { field: 'data.status', type: 'string', required: true, description: 'STARTED or ERROR' },
    ],
    exampleRequest: JSON.stringify({ language: 'en-US', enableSentiment: true }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        transcriptionId: 'trans_abc123',
        status: 'STARTED',
      },
    }, null, 2),
  },

  // ============================================================================
  // AI SUGGESTIONS APIs
  // ============================================================================
  {
    id: 'fetch-suggestions',
    category: 'AI_SUGGESTIONS',
    name: 'Fetch AI Suggestions',
    method: 'GET',
    path: '/api/calls/{callId}/suggestions',
    description: 'Get AI-powered suggestions for the current call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'context', type: 'string', required: false, description: 'Additional context for suggestions', example: 'credential renewal' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.suggestions', type: 'array', required: true, description: 'Array of suggestions' },
      { field: 'data.suggestions[].suggestionId', type: 'string', required: true, description: 'Suggestion ID' },
      { field: 'data.suggestions[].type', type: 'string', required: true, description: 'RESPONSE, QUESTION, ACTION, INFO, WARNING' },
      { field: 'data.suggestions[].content', type: 'string', required: true, description: 'Suggestion text' },
      { field: 'data.suggestions[].confidence', type: 'number', required: true, description: 'Confidence score 0-1' },
      { field: 'data.suggestions[].triggerContext', type: 'string', required: false, description: 'What triggered this suggestion' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        suggestions: [
          {
            suggestionId: 'sug_001',
            type: 'RESPONSE',
            content: 'I can help you with your credential renewal. Let me pull up your current status.',
            confidence: 0.89,
            triggerContext: 'Provider mentioned credential renewal',
            timestamp: '2024-01-15T10:32:05Z',
          },
          {
            suggestionId: 'sug_002',
            type: 'QUESTION',
            content: 'Could you confirm your current NPI number for verification?',
            confidence: 0.85,
            triggerContext: 'Verification required for credential updates',
            timestamp: '2024-01-15T10:32:05Z',
          },
        ],
      },
    }, null, 2),
  },
  {
    id: 'use-suggestion',
    category: 'AI_SUGGESTIONS',
    name: 'Mark Suggestion Used',
    method: 'POST',
    path: '/api/suggestions/{suggestionId}/use',
    description: 'Mark an AI suggestion as used by the agent',
    authRequired: true,
    requestPayload: [
      { field: 'suggestionId', type: 'string', required: true, description: 'Suggestion ID (path parameter)', example: 'sug_001' },
      { field: 'feedback', type: 'string', required: false, description: 'Agent feedback on suggestion', example: 'helpful' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.suggestionId', type: 'string', required: true, description: 'Suggestion ID' },
      { field: 'data.usedAt', type: 'string', required: true, description: 'ISO timestamp when used' },
    ],
    exampleRequest: JSON.stringify({ feedback: 'helpful' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        suggestionId: 'sug_001',
        usedAt: '2024-01-15T10:33:00Z',
      },
    }, null, 2),
  },

  // ============================================================================
  // NOTES & QUESTIONNAIRE APIs
  // ============================================================================
  {
    id: 'fetch-notes',
    category: 'NOTES_QUESTIONNAIRE',
    name: 'Fetch Call Notes',
    method: 'GET',
    path: '/api/calls/{callId}/notes',
    description: 'Get all notes for a call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.notes', type: 'array', required: true, description: 'Array of notes' },
      { field: 'data.notes[].noteId', type: 'string', required: true, description: 'Note ID' },
      { field: 'data.notes[].content', type: 'string', required: true, description: 'Note content' },
      { field: 'data.notes[].createdAt', type: 'string', required: true, description: 'ISO timestamp' },
      { field: 'data.notes[].createdBy', type: 'string', required: true, description: 'Agent who created note' },
      { field: 'data.notes[].tags', type: 'array', required: false, description: 'Note tags' },
      { field: 'data.notes[].isPrivate', type: 'boolean', required: true, description: 'Whether note is private' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        notes: [
          {
            noteId: 'note_001',
            callId: 'call_abc123',
            content: 'Provider confirmed address change to 123 Main St.',
            createdAt: '2024-01-15T10:35:00Z',
            createdBy: 'John Smith',
            tags: ['address-update'],
            isPrivate: false,
          },
        ],
      },
    }, null, 2),
  },
  {
    id: 'save-note',
    category: 'NOTES_QUESTIONNAIRE',
    name: 'Save Call Note',
    method: 'POST',
    path: '/api/calls/{callId}/notes',
    description: 'Save a new note for a call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'content', type: 'string', required: true, description: 'Note content', example: 'Provider confirmed address change' },
      { field: 'tags', type: 'array', required: false, description: 'Note tags', example: '["address-update"]' },
      { field: 'isPrivate', type: 'boolean', required: false, description: 'Make note private', example: 'false' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.noteId', type: 'string', required: true, description: 'Created note ID' },
      { field: 'data.createdAt', type: 'string', required: true, description: 'ISO timestamp' },
    ],
    exampleRequest: JSON.stringify({ content: 'Provider confirmed address change to 123 Main St.', tags: ['address-update'], isPrivate: false }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        noteId: 'note_001',
        createdAt: '2024-01-15T10:35:00Z',
      },
    }, null, 2),
  },
  {
    id: 'fetch-questionnaire',
    category: 'NOTES_QUESTIONNAIRE',
    name: 'Fetch Questionnaire',
    method: 'GET',
    path: '/api/calls/{callId}/questionnaire',
    description: 'Get the auto-fill questionnaire for a call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'taskId', type: 'string', required: false, description: 'Associated task ID', example: 'task_789' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.sections', type: 'array', required: true, description: 'Questionnaire sections' },
      { field: 'data.sections[].sectionId', type: 'string', required: true, description: 'Section ID' },
      { field: 'data.sections[].sectionName', type: 'string', required: true, description: 'Section name' },
      { field: 'data.sections[].fields', type: 'array', required: true, description: 'Fields in section' },
      { field: 'data.sections[].completionPercentage', type: 'number', required: true, description: 'Section completion %' },
      { field: 'data.overallCompletion', type: 'number', required: true, description: 'Overall completion %' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callId: 'call_abc123',
        sections: [
          {
            sectionId: 'contact',
            sectionName: 'Contact Information',
            completionPercentage: 75,
            fields: [
              {
                fieldId: 'phone',
                fieldName: 'primaryPhone',
                fieldLabel: 'Primary Phone',
                category: 'Contact Information',
                originalValue: '+14155551234',
                aiSuggestedValue: '+14155559999',
                confirmedValue: null,
                confidence: 0.85,
                confidenceLevel: 'HIGH',
                aiSource: 'Extracted from conversation',
                hasConflict: true,
                isConfirmed: false,
              },
            ],
          },
        ],
        overallCompletion: 60,
      },
    }, null, 2),
  },
  {
    id: 'update-questionnaire-field',
    category: 'NOTES_QUESTIONNAIRE',
    name: 'Update Questionnaire Field',
    method: 'PUT',
    path: '/api/questionnaire/{fieldId}',
    description: 'Update a questionnaire field value',
    authRequired: true,
    requestPayload: [
      { field: 'fieldId', type: 'string', required: true, description: 'Field ID (path parameter)', example: 'field_phone' },
      { field: 'callId', type: 'string', required: true, description: 'Call ID', example: 'call_abc123' },
      { field: 'value', type: 'string', required: true, description: 'New field value', example: '+14155559999' },
      { field: 'isConfirmed', type: 'boolean', required: true, description: 'Whether value is confirmed', example: 'true' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.fieldId', type: 'string', required: true, description: 'Updated field ID' },
      { field: 'data.confirmedValue', type: 'string', required: true, description: 'Confirmed value' },
      { field: 'data.updatedAt', type: 'string', required: true, description: 'ISO timestamp' },
    ],
    exampleRequest: JSON.stringify({ callId: 'call_abc123', value: '+14155559999', isConfirmed: true }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        fieldId: 'field_phone',
        confirmedValue: '+14155559999',
        updatedAt: '2024-01-15T10:36:00Z',
      },
    }, null, 2),
  },

  // ============================================================================
  // QUICK ACTIONS APIs
  // ============================================================================
  {
    id: 'send-sms',
    category: 'QUICK_ACTIONS',
    name: 'Send SMS',
    method: 'POST',
    path: '/api/sms/send',
    description: 'Send an SMS message to a phone number',
    authRequired: true,
    rateLimit: '20 requests/minute',
    requestPayload: [
      { field: 'phoneNumber', type: 'string', required: true, description: 'Recipient phone number', example: '+14155551234' },
      { field: 'message', type: 'string', required: true, description: 'SMS message content', example: 'Your appointment is confirmed.' },
      { field: 'providerId', type: 'string', required: false, description: 'Associated provider ID', example: 'prov_123456' },
      { field: 'callId', type: 'string', required: false, description: 'Associated call ID', example: 'call_abc123' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.messageId', type: 'string', required: true, description: 'SMS message ID' },
      { field: 'data.status', type: 'string', required: true, description: 'QUEUED, SENT, or FAILED' },
      { field: 'data.sentAt', type: 'string', required: true, description: 'ISO timestamp' },
    ],
    exampleRequest: JSON.stringify({ phoneNumber: '+14155551234', message: 'Your appointment is confirmed for tomorrow at 2 PM.', providerId: 'prov_123456' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        messageId: 'sms_001',
        status: 'QUEUED',
        sentAt: '2024-01-15T10:37:00Z',
      },
    }, null, 2),
  },
  {
    id: 'create-task',
    category: 'QUICK_ACTIONS',
    name: 'Create Task',
    method: 'POST',
    path: '/api/tasks/create',
    description: 'Create a new task/ticket',
    authRequired: true,
    requestPayload: [
      { field: 'title', type: 'string', required: true, description: 'Task title', example: 'Follow up on credential renewal' },
      { field: 'description', type: 'string', required: false, description: 'Task description', example: 'Provider needs to submit updated documents' },
      { field: 'priority', type: 'string', required: true, description: 'LOW, MEDIUM, HIGH, or URGENT', example: 'HIGH' },
      { field: 'providerId', type: 'string', required: false, description: 'Associated provider ID', example: 'prov_123456' },
      { field: 'dueAt', type: 'string', required: false, description: 'Due date ISO timestamp', example: '2024-01-20T17:00:00Z' },
      { field: 'assigneeId', type: 'string', required: false, description: 'Assigned agent ID', example: 'agent_456' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.taskId', type: 'string', required: true, description: 'Created task ID' },
      { field: 'data.status', type: 'string', required: true, description: 'Task status (OPEN)' },
      { field: 'data.createdAt', type: 'string', required: true, description: 'ISO timestamp' },
    ],
    exampleRequest: JSON.stringify({ title: 'Follow up on credential renewal', description: 'Provider needs to submit updated documents', priority: 'HIGH', providerId: 'prov_123456', dueAt: '2024-01-20T17:00:00Z' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        taskId: 'task_001',
        status: 'OPEN',
        createdAt: '2024-01-15T10:38:00Z',
      },
    }, null, 2),
  },
  {
    id: 'schedule-callback',
    category: 'QUICK_ACTIONS',
    name: 'Schedule Callback',
    method: 'POST',
    path: '/api/callbacks/schedule',
    description: 'Schedule a callback for a provider',
    authRequired: true,
    requestPayload: [
      { field: 'phoneNumber', type: 'string', required: true, description: 'Phone number to call back', example: '+14155551234' },
      { field: 'scheduledAt', type: 'string', required: true, description: 'Scheduled time ISO timestamp', example: '2024-01-16T14:00:00Z' },
      { field: 'providerId', type: 'string', required: false, description: 'Associated provider ID', example: 'prov_123456' },
      { field: 'notes', type: 'string', required: false, description: 'Callback notes', example: 'Discuss document submission' },
      { field: 'priority', type: 'string', required: false, description: 'NORMAL, HIGH, or URGENT', example: 'HIGH' },
      { field: 'timezone', type: 'string', required: false, description: 'Provider timezone', example: 'America/New_York' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callbackId', type: 'string', required: true, description: 'Callback ID' },
      { field: 'data.scheduledAt', type: 'string', required: true, description: 'Scheduled time' },
      { field: 'data.status', type: 'string', required: true, description: 'SCHEDULED' },
    ],
    exampleRequest: JSON.stringify({ phoneNumber: '+14155551234', scheduledAt: '2024-01-16T14:00:00Z', providerId: 'prov_123456', notes: 'Discuss document submission', priority: 'HIGH' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callbackId: 'cb_001',
        scheduledAt: '2024-01-16T14:00:00Z',
        status: 'SCHEDULED',
      },
    }, null, 2),
  },
  {
    id: 'open-crm',
    category: 'QUICK_ACTIONS',
    name: 'Get CRM URL',
    method: 'GET',
    path: '/api/crm/provider/{providerId}',
    description: 'Get the CRM URL for a provider',
    authRequired: true,
    requestPayload: [
      { field: 'providerId', type: 'string', required: true, description: 'Provider ID (path parameter)', example: 'prov_123456' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.url', type: 'string', required: true, description: 'CRM URL for the provider' },
      { field: 'data.providerId', type: 'string', required: true, description: 'Provider ID' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        url: 'https://crm.example.com/providers/prov_123456',
        providerId: 'prov_123456',
      },
    }, null, 2),
  },

  // ============================================================================
  // AGENT STATUS APIs
  // ============================================================================
  {
    id: 'update-agent-status',
    category: 'AGENT_STATUS',
    name: 'Update Agent Status',
    method: 'PUT',
    path: '/api/agent/status',
    description: 'Update the agent availability status',
    authRequired: true,
    requestPayload: [
      { field: 'status', type: 'string', required: true, description: 'ONLINE, ON_CALL, AWAY, ON_BREAK, or OFFLINE', example: 'ONLINE' },
      { field: 'reason', type: 'string', required: false, description: 'Reason for status change', example: 'Starting shift' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.status', type: 'string', required: true, description: 'Updated status' },
      { field: 'data.updatedAt', type: 'string', required: true, description: 'ISO timestamp' },
    ],
    exampleRequest: JSON.stringify({ status: 'ONLINE', reason: 'Starting shift' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        status: 'ONLINE',
        updatedAt: '2024-01-15T09:00:00Z',
      },
    }, null, 2),
  },
  {
    id: 'get-agent-status',
    category: 'AGENT_STATUS',
    name: 'Get Agent Status',
    method: 'GET',
    path: '/api/agent/status',
    description: 'Get the current agent status and statistics',
    authRequired: true,
    requestPayload: [],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.status', type: 'string', required: true, description: 'Current status' },
      { field: 'data.statusSince', type: 'string', required: true, description: 'When status was set' },
      { field: 'data.callsToday', type: 'number', required: true, description: 'Calls handled today' },
      { field: 'data.averageHandleTime', type: 'number', required: true, description: 'Average handle time in seconds' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        status: 'ONLINE',
        statusSince: '2024-01-15T09:00:00Z',
        callsToday: 15,
        averageHandleTime: 420,
      },
    }, null, 2),
  },

  // ============================================================================
  // CALL QUALITY APIs
  // ============================================================================
  {
    id: 'get-call-quality',
    category: 'CALL_QUALITY',
    name: 'Get Call Quality Metrics',
    method: 'GET',
    path: '/api/calls/{callId}/quality',
    description: 'Get real-time call quality metrics',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.audioQualityScore', type: 'number', required: true, description: 'Audio quality 0-100' },
      { field: 'data.networkLatency', type: 'number', required: true, description: 'Latency in milliseconds' },
      { field: 'data.packetLoss', type: 'number', required: true, description: 'Packet loss percentage' },
      { field: 'data.jitter', type: 'number', required: true, description: 'Jitter in milliseconds' },
      { field: 'data.connectionStability', type: 'string', required: true, description: 'EXCELLENT, GOOD, FAIR, or POOR' },
      { field: 'data.timestamp', type: 'string', required: true, description: 'Measurement timestamp' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        audioQualityScore: 92,
        networkLatency: 45,
        packetLoss: 0.1,
        jitter: 12,
        connectionStability: 'EXCELLENT',
        timestamp: '2024-01-15T10:32:00Z',
      },
    }, null, 2),
  },

  // ============================================================================
  // SENTIMENT APIs
  // ============================================================================
  {
    id: 'get-sentiment',
    category: 'SENTIMENT',
    name: 'Get Sentiment Analysis',
    method: 'GET',
    path: '/api/calls/{callId}/sentiment',
    description: 'Get sentiment analysis for a call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.overallScore', type: 'number', required: true, description: 'Overall sentiment -1 to 1' },
      { field: 'data.trend', type: 'string', required: true, description: 'IMPROVING, STABLE, or DECLINING' },
      { field: 'data.timeline', type: 'array', required: true, description: 'Sentiment over time' },
      { field: 'data.timeline[].timestamp', type: 'number', required: true, description: 'Time in seconds' },
      { field: 'data.timeline[].score', type: 'number', required: true, description: 'Sentiment score' },
      { field: 'data.timeline[].speaker', type: 'string', required: true, description: 'AGENT or PROVIDER' },
      { field: 'data.triggers', type: 'array', required: true, description: 'Emotional triggers detected' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        overallScore: 0.65,
        trend: 'IMPROVING',
        timeline: [
          { timestamp: 0, score: 0.3, speaker: 'PROVIDER' },
          { timestamp: 30, score: 0.5, speaker: 'PROVIDER' },
          { timestamp: 60, score: 0.7, speaker: 'PROVIDER' },
        ],
        triggers: [
          { text: 'frustrated with the wait time', sentiment: 'NEGATIVE', timestamp: 15 },
          { text: 'thank you for your help', sentiment: 'POSITIVE', timestamp: 120 },
        ],
      },
    }, null, 2),
  },

  // ============================================================================
  // SCRIPTS APIs
  // ============================================================================
  {
    id: 'get-scripts',
    category: 'SCRIPTS',
    name: 'Get Scripts Library',
    method: 'GET',
    path: '/api/scripts',
    description: 'Get available scripts/canned responses',
    authRequired: true,
    requestPayload: [
      { field: 'category', type: 'string', required: false, description: 'Filter by category', example: 'GREETING' },
      { field: 'search', type: 'string', required: false, description: 'Search query', example: 'welcome' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.scripts', type: 'array', required: true, description: 'Array of scripts' },
      { field: 'data.scripts[].scriptId', type: 'string', required: true, description: 'Script ID' },
      { field: 'data.scripts[].category', type: 'string', required: true, description: 'GREETING, COMPLIANCE, VERIFICATION, PROBLEM, CLOSING' },
      { field: 'data.scripts[].title', type: 'string', required: true, description: 'Script title' },
      { field: 'data.scripts[].content', type: 'string', required: true, description: 'Script text' },
      { field: 'data.scripts[].variables', type: 'array', required: false, description: 'Placeholder variables' },
      { field: 'data.scripts[].shortcut', type: 'string', required: false, description: 'Keyboard shortcut' },
      { field: 'data.scripts[].isFavorite', type: 'boolean', required: true, description: 'Is favorited' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        scripts: [
          {
            scriptId: 'script_001',
            category: 'GREETING',
            title: 'Standard Greeting',
            content: 'Good {timeOfDay}, thank you for calling {companyName}. My name is {agentName}. How may I assist you today?',
            variables: ['timeOfDay', 'companyName', 'agentName'],
            shortcut: 'Ctrl+1',
            isFavorite: true,
            usageCount: 150,
          },
          {
            scriptId: 'script_002',
            category: 'COMPLIANCE',
            title: 'Call Recording Disclosure',
            content: 'This call may be recorded for quality assurance and training purposes. Do you consent to continue?',
            variables: [],
            shortcut: 'Ctrl+2',
            isFavorite: false,
            usageCount: 200,
          },
        ],
      },
    }, null, 2),
  },
  {
    id: 'toggle-script-favorite',
    category: 'SCRIPTS',
    name: 'Toggle Script Favorite',
    method: 'POST',
    path: '/api/scripts/{scriptId}/favorite',
    description: 'Add or remove script from favorites',
    authRequired: true,
    requestPayload: [
      { field: 'scriptId', type: 'string', required: true, description: 'Script ID (path parameter)', example: 'script_001' },
      { field: 'isFavorite', type: 'boolean', required: true, description: 'Set as favorite', example: 'true' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.scriptId', type: 'string', required: true, description: 'Script ID' },
      { field: 'data.isFavorite', type: 'boolean', required: true, description: 'Updated favorite status' },
    ],
    exampleRequest: JSON.stringify({ isFavorite: true }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        scriptId: 'script_001',
        isFavorite: true,
      },
    }, null, 2),
  },

  // ============================================================================
  // RECORDING APIs
  // ============================================================================
  {
    id: 'start-recording',
    category: 'RECORDING',
    name: 'Start Recording',
    method: 'POST',
    path: '/api/calls/{callId}/recording/start',
    description: 'Start call recording',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'playDisclaimer', type: 'boolean', required: false, description: 'Play recording disclaimer', example: 'true' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.recordingId', type: 'string', required: true, description: 'Recording session ID' },
      { field: 'data.startedAt', type: 'string', required: true, description: 'Recording start time' },
      { field: 'data.disclaimerPlayed', type: 'boolean', required: true, description: 'Whether disclaimer was played' },
    ],
    exampleRequest: JSON.stringify({ playDisclaimer: true }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        recordingId: 'rec_001',
        startedAt: '2024-01-15T10:30:05Z',
        disclaimerPlayed: true,
      },
    }, null, 2),
  },
  {
    id: 'stop-recording',
    category: 'RECORDING',
    name: 'Stop Recording',
    method: 'POST',
    path: '/api/calls/{callId}/recording/stop',
    description: 'Stop call recording',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.recordingId', type: 'string', required: true, description: 'Recording session ID' },
      { field: 'data.stoppedAt', type: 'string', required: true, description: 'Recording stop time' },
      { field: 'data.duration', type: 'number', required: true, description: 'Recording duration in seconds' },
      { field: 'data.fileUrl', type: 'string', required: false, description: 'Recording file URL' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        recordingId: 'rec_001',
        stoppedAt: '2024-01-15T10:45:30Z',
        duration: 925,
        fileUrl: 'https://storage.example.com/recordings/rec_001.wav',
      },
    }, null, 2),
  },
  {
    id: 'pause-recording',
    category: 'RECORDING',
    name: 'Pause/Resume Recording',
    method: 'POST',
    path: '/api/calls/{callId}/recording/pause',
    description: 'Pause or resume call recording',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'pause', type: 'boolean', required: true, description: 'True to pause, false to resume', example: 'true' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.recordingId', type: 'string', required: true, description: 'Recording session ID' },
      { field: 'data.isPaused', type: 'boolean', required: true, description: 'Current pause status' },
    ],
    exampleRequest: JSON.stringify({ pause: true }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        recordingId: 'rec_001',
        isPaused: true,
      },
    }, null, 2),
  },
  {
    id: 'add-recording-marker',
    category: 'RECORDING',
    name: 'Add Recording Marker',
    method: 'POST',
    path: '/api/calls/{callId}/recording/marker',
    description: 'Add a timestamp marker to the recording',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'label', type: 'string', required: true, description: 'Marker label', example: 'Important disclosure' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.markerId', type: 'string', required: true, description: 'Marker ID' },
      { field: 'data.timestamp', type: 'number', required: true, description: 'Marker timestamp in seconds' },
      { field: 'data.label', type: 'string', required: true, description: 'Marker label' },
    ],
    exampleRequest: JSON.stringify({ label: 'Important disclosure' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        markerId: 'marker_001',
        timestamp: 125,
        label: 'Important disclosure',
      },
    }, null, 2),
  },

  // ============================================================================
  // ESCALATION APIs
  // ============================================================================
  {
    id: 'get-supervisors',
    category: 'ESCALATION',
    name: 'Get Available Supervisors',
    method: 'GET',
    path: '/api/supervisors/available',
    description: 'Get list of available supervisors for escalation',
    authRequired: true,
    requestPayload: [],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.supervisors', type: 'array', required: true, description: 'Available supervisors' },
      { field: 'data.supervisors[].id', type: 'string', required: true, description: 'Supervisor ID' },
      { field: 'data.supervisors[].name', type: 'string', required: true, description: 'Supervisor name' },
      { field: 'data.supervisors[].status', type: 'string', required: true, description: 'AVAILABLE, BUSY, or OFFLINE' },
      { field: 'data.supervisors[].currentCalls', type: 'number', required: true, description: 'Current active calls' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        supervisors: [
          { id: 'sup_001', name: 'Jane Manager', status: 'AVAILABLE', currentCalls: 0 },
          { id: 'sup_002', name: 'Mike Lead', status: 'BUSY', currentCalls: 2 },
        ],
      },
    }, null, 2),
  },
  {
    id: 'escalate-call',
    category: 'ESCALATION',
    name: 'Escalate Call',
    method: 'POST',
    path: '/api/calls/{callId}/escalate',
    description: 'Escalate call to a supervisor',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'supervisorId', type: 'string', required: true, description: 'Target supervisor ID', example: 'sup_001' },
      { field: 'level', type: 'string', required: true, description: 'Escalation level P1-P4', example: 'P2' },
      { field: 'reason', type: 'string', required: true, description: 'Escalation reason', example: 'Customer requested supervisor' },
      { field: 'notes', type: 'string', required: false, description: 'Additional notes', example: 'Provider unhappy with resolution' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.escalationId', type: 'string', required: true, description: 'Escalation ID' },
      { field: 'data.status', type: 'string', required: true, description: 'PENDING, ACCEPTED, or DECLINED' },
      { field: 'data.supervisor', type: 'string', required: true, description: 'Supervisor name' },
    ],
    exampleRequest: JSON.stringify({ supervisorId: 'sup_001', level: 'P2', reason: 'Customer requested supervisor', notes: 'Provider unhappy with resolution' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        escalationId: 'esc_001',
        status: 'PENDING',
        supervisor: 'Jane Manager',
      },
    }, null, 2),
  },
  {
    id: 'request-monitoring',
    category: 'ESCALATION',
    name: 'Request Supervisor Monitoring',
    method: 'POST',
    path: '/api/calls/{callId}/monitor',
    description: 'Request supervisor to silently monitor the call',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID (path parameter)', example: 'call_abc123' },
      { field: 'supervisorId', type: 'string', required: true, description: 'Supervisor ID', example: 'sup_001' },
      { field: 'reason', type: 'string', required: false, description: 'Reason for monitoring request', example: 'Need coaching on escalated issue' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.monitoringId', type: 'string', required: true, description: 'Monitoring session ID' },
      { field: 'data.status', type: 'string', required: true, description: 'REQUESTED or ACTIVE' },
    ],
    exampleRequest: JSON.stringify({ supervisorId: 'sup_001', reason: 'Need coaching on escalated issue' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        monitoringId: 'mon_001',
        status: 'REQUESTED',
      },
    }, null, 2),
  },

  // ============================================================================
  // PERFORMANCE APIs
  // ============================================================================
  {
    id: 'get-performance-metrics',
    category: 'PERFORMANCE',
    name: 'Get Agent Performance Metrics',
    method: 'GET',
    path: '/api/agent/performance',
    description: 'Get agent performance KPIs',
    authRequired: true,
    requestPayload: [
      { field: 'period', type: 'string', required: false, description: 'Time period: TODAY, WEEK, MONTH', example: 'TODAY' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callsHandledToday', type: 'number', required: true, description: 'Calls handled today' },
      { field: 'data.averageHandleTime', type: 'number', required: true, description: 'Average handle time in seconds' },
      { field: 'data.firstCallResolutionRate', type: 'number', required: true, description: 'FCR rate percentage' },
      { field: 'data.customerSatisfactionScore', type: 'number', required: true, description: 'CSAT score 0-100' },
      { field: 'data.targetGoals.callsTarget', type: 'number', required: true, description: 'Daily calls target' },
      { field: 'data.targetGoals.ahtTarget', type: 'number', required: true, description: 'Target AHT in seconds' },
      { field: 'data.targetGoals.fcrTarget', type: 'number', required: true, description: 'Target FCR percentage' },
      { field: 'data.targetGoals.csatTarget', type: 'number', required: true, description: 'Target CSAT score' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callsHandledToday: 23,
        averageHandleTime: 385,
        firstCallResolutionRate: 78,
        customerSatisfactionScore: 92,
        targetGoals: {
          callsTarget: 30,
          ahtTarget: 360,
          fcrTarget: 75,
          csatTarget: 90,
        },
      },
    }, null, 2),
  },

  // ============================================================================
  // KNOWLEDGE BASE APIs
  // ============================================================================
  {
    id: 'search-kb',
    category: 'KNOWLEDGE_BASE',
    name: 'Search Knowledge Base',
    method: 'GET',
    path: '/api/kb/search',
    description: 'Search knowledge base articles',
    authRequired: true,
    requestPayload: [
      { field: 'query', type: 'string', required: true, description: 'Search query', example: 'credential renewal process' },
      { field: 'limit', type: 'number', required: false, description: 'Max results', example: '10' },
      { field: 'category', type: 'string', required: false, description: 'Filter by category', example: 'Credentials' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.articles', type: 'array', required: true, description: 'Matching articles' },
      { field: 'data.articles[].articleId', type: 'string', required: true, description: 'Article ID' },
      { field: 'data.articles[].title', type: 'string', required: true, description: 'Article title' },
      { field: 'data.articles[].summary', type: 'string', required: true, description: 'Article summary' },
      { field: 'data.articles[].category', type: 'string', required: true, description: 'Article category' },
      { field: 'data.articles[].relevanceScore', type: 'number', required: true, description: 'Search relevance 0-1' },
      { field: 'data.total', type: 'number', required: true, description: 'Total matches' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        articles: [
          {
            articleId: 'kb_001',
            title: 'Credential Renewal Process Guide',
            summary: 'Step-by-step guide for renewing provider credentials including required documents and timelines.',
            content: '...',
            category: 'Credentials',
            tags: ['credentials', 'renewal', 'documentation'],
            relevanceScore: 0.95,
            lastUpdated: '2024-01-10T00:00:00Z',
          },
        ],
        total: 5,
      },
    }, null, 2),
  },
  {
    id: 'get-suggested-articles',
    category: 'KNOWLEDGE_BASE',
    name: 'Get Suggested Articles',
    method: 'GET',
    path: '/api/kb/suggested',
    description: 'Get AI-suggested articles based on call context',
    authRequired: true,
    requestPayload: [
      { field: 'callId', type: 'string', required: true, description: 'Call ID for context', example: 'call_abc123' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.articles', type: 'array', required: true, description: 'Suggested articles' },
      { field: 'data.articles[].articleId', type: 'string', required: true, description: 'Article ID' },
      { field: 'data.articles[].title', type: 'string', required: true, description: 'Article title' },
      { field: 'data.articles[].relevanceScore', type: 'number', required: true, description: 'Relevance 0-1' },
      { field: 'data.articles[].triggerContext', type: 'string', required: true, description: 'Why this was suggested' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        articles: [
          {
            articleId: 'kb_001',
            title: 'Credential Renewal Process Guide',
            summary: 'Step-by-step guide for renewing provider credentials.',
            relevanceScore: 0.92,
            triggerContext: 'Provider mentioned credential renewal in conversation',
          },
        ],
      },
    }, null, 2),
  },

  // ============================================================================
  // CALLBACKS APIs
  // ============================================================================
  {
    id: 'get-callbacks',
    category: 'CALLBACKS',
    name: 'Get Scheduled Callbacks',
    method: 'GET',
    path: '/api/callbacks',
    description: 'Get list of scheduled callbacks',
    authRequired: true,
    requestPayload: [
      { field: 'date', type: 'string', required: false, description: 'Filter by date', example: '2024-01-16' },
      { field: 'status', type: 'string', required: false, description: 'Filter by status', example: 'SCHEDULED' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callbacks', type: 'array', required: true, description: 'Scheduled callbacks' },
      { field: 'data.callbacks[].callbackId', type: 'string', required: true, description: 'Callback ID' },
      { field: 'data.callbacks[].scheduledAt', type: 'string', required: true, description: 'Scheduled time' },
      { field: 'data.callbacks[].phoneNumber', type: 'string', required: true, description: 'Phone number' },
      { field: 'data.callbacks[].providerName', type: 'string', required: false, description: 'Provider name' },
      { field: 'data.callbacks[].priority', type: 'string', required: true, description: 'NORMAL, HIGH, URGENT' },
      { field: 'data.callbacks[].status', type: 'string', required: true, description: 'SCHEDULED, COMPLETED, MISSED' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callbacks: [
          {
            callbackId: 'cb_001',
            scheduledAt: '2024-01-16T14:00:00Z',
            phoneNumber: '+14155551234',
            providerName: 'Dr. Sarah Johnson',
            priority: 'HIGH',
            status: 'SCHEDULED',
            notes: 'Discuss document submission',
            timezone: 'America/New_York',
          },
        ],
      },
    }, null, 2),
  },
  {
    id: 'cancel-callback',
    category: 'CALLBACKS',
    name: 'Cancel Callback',
    method: 'DELETE',
    path: '/api/callbacks/{callbackId}',
    description: 'Cancel a scheduled callback',
    authRequired: true,
    requestPayload: [
      { field: 'callbackId', type: 'string', required: true, description: 'Callback ID (path parameter)', example: 'cb_001' },
      { field: 'reason', type: 'string', required: false, description: 'Cancellation reason', example: 'Provider requested cancellation' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.callbackId', type: 'string', required: true, description: 'Cancelled callback ID' },
      { field: 'data.status', type: 'string', required: true, description: 'CANCELLED' },
    ],
    exampleRequest: JSON.stringify({ reason: 'Provider requested cancellation' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        callbackId: 'cb_001',
        status: 'CANCELLED',
      },
    }, null, 2),
  },

  // ============================================================================
  // MULTI-CHANNEL APIs
  // ============================================================================
  {
    id: 'get-channel-queues',
    category: 'MULTI_CHANNEL',
    name: 'Get Channel Queue Counts',
    method: 'GET',
    path: '/api/channels/queues',
    description: 'Get pending item counts for all channels',
    authRequired: true,
    requestPayload: [],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.email.count', type: 'number', required: true, description: 'Pending emails' },
      { field: 'data.email.priority', type: 'number', required: true, description: 'High priority count' },
      { field: 'data.chat.count', type: 'number', required: true, description: 'Active chats' },
      { field: 'data.chat.priority', type: 'number', required: true, description: 'High priority count' },
      { field: 'data.sms.count', type: 'number', required: true, description: 'Pending SMS' },
      { field: 'data.sms.priority', type: 'number', required: true, description: 'High priority count' },
      { field: 'data.callback.count', type: 'number', required: true, description: 'Pending callbacks' },
      { field: 'data.callback.priority', type: 'number', required: true, description: 'High priority count' },
    ],
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        email: { count: 12, priority: 3 },
        chat: { count: 2, priority: 0 },
        sms: { count: 5, priority: 1 },
        callback: { count: 8, priority: 2 },
      },
    }, null, 2),
  },
  {
    id: 'switch-channel',
    category: 'MULTI_CHANNEL',
    name: 'Switch Channel',
    method: 'POST',
    path: '/api/channels/switch',
    description: 'Switch agent to a different channel',
    authRequired: true,
    requestPayload: [
      { field: 'channel', type: 'string', required: true, description: 'Target channel: VOICE, EMAIL, CHAT, SMS', example: 'CHAT' },
    ],
    responsePayload: [
      { field: 'success', type: 'boolean', required: true, description: 'Whether the operation succeeded' },
      { field: 'data.channel', type: 'string', required: true, description: 'New active channel' },
      { field: 'data.switchedAt', type: 'string', required: true, description: 'ISO timestamp' },
    ],
    exampleRequest: JSON.stringify({ channel: 'CHAT' }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      data: {
        channel: 'CHAT',
        switchedAt: '2024-01-15T10:45:00Z',
      },
    }, null, 2),
  },
];

// Helper function to get endpoints by category
export function getEndpointsByCategory(category: APICategory): APIEndpoint[] {
  return API_ENDPOINTS.filter((endpoint) => endpoint.category === category);
}

// Helper function to search endpoints
export function searchEndpoints(query: string): APIEndpoint[] {
  const lowerQuery = query.toLowerCase();
  return API_ENDPOINTS.filter(
    (endpoint) =>
      endpoint.name.toLowerCase().includes(lowerQuery) ||
      endpoint.path.toLowerCase().includes(lowerQuery) ||
      endpoint.description.toLowerCase().includes(lowerQuery)
  );
}

// Get category info
export function getCategoryInfo(category: APICategory): APICategoryInfo | undefined {
  return API_CATEGORIES.find((cat) => cat.id === category);
}
