// ============================================================================
// Agent Call Center - Mock Data Generators
// Generates realistic mock data for the agent call screen
// ============================================================================

import type {
  ActiveCall,
  CallState,
  CallDirection,
  CallerInfo,
  InteractionHistoryItem,
  InteractionType,
  Case,
  CaseStatus,
  CasePriority,
  LiveTranscription,
  LiveTranscriptSegment,
  AISuggestion,
  SuggestionType,
  QuestionnaireState,
  QuestionnaireSection,
  AutoFillField,
  FieldConfidence,
  CallNote,
  CallHistoryEntry,
  QuickAction,
  QuickActionType,
} from './agent-call-types';
import type { PriorityTier } from './outreach-types';

// ----------------------------------------------------------------------------
// Seeded Random Generator (for consistent mock data)
// ----------------------------------------------------------------------------

let seed = 12345;

function seededRandom(): number {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ----------------------------------------------------------------------------
// Sample Data Arrays
// ----------------------------------------------------------------------------

const providerNames = [
  'Dr. Sarah Mitchell',
  'Dr. James Wilson',
  'Dr. Emily Chen',
  'Dr. Michael Brown',
  'Dr. Jessica Taylor',
  'Dr. Robert Davis',
  'Dr. Amanda White',
  'Dr. Christopher Lee',
  'Dr. Lauren Martinez',
  'Dr. David Anderson',
];

const organizations = [
  'Metro Health Clinic',
  'Valley Medical Center',
  'Sunrise Family Practice',
  'Lakeside Internal Medicine',
  'Downtown Health Partners',
  'Coastal Medical Group',
  'Mountain View Physicians',
  'Riverside Healthcare',
  'Central City Clinic',
  'Pacific Medical Associates',
];

const specialties = [
  'Internal Medicine',
  'Family Practice',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Neurology',
  'Gastroenterology',
  'Pulmonology',
  'Oncology',
];

const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'Austin',
];

const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'TX'];

const agentNames = [
  'John Smith',
  'Mary Johnson',
  'Robert Williams',
  'Patricia Jones',
  'Michael Garcia',
  'Linda Martinez',
  'William Rodriguez',
  'Elizabeth Wilson',
];

const outcomeMessages = [
  'Verified all information',
  'Updated contact details',
  'Left voicemail',
  'No answer',
  'Callback scheduled',
  'Provider confirmed details',
  'Partial verification',
  'Information updated',
];

const aiSuggestionContents: Record<SuggestionType, string[]> = {
  RESPONSE: [
    "Thank you for confirming that information. Let me verify the address as well.",
    "I appreciate your patience. Could you spell out the practice name for me?",
    "That's very helpful. Now, let me confirm your NPI number.",
    "Perfect, I have that noted. Is there anything else you'd like to update?",
  ],
  QUESTION: [
    "Is this the best phone number to reach the practice during business hours?",
    "Can you confirm the office hours for Monday through Friday?",
    "Are there any additional providers at this location we should have on file?",
    "What is the preferred method of contact for verification requests?",
  ],
  ACTION: [
    "Consider scheduling a follow-up call for next week",
    "Update the fax number in the system",
    "Flag this record for supervisor review",
    "Send confirmation email to provider",
  ],
  INFO: [
    "This provider was last contacted 45 days ago",
    "Records show 2 previous verification attempts this month",
    "Provider is part of a network with 5 other locations",
    "SLA deadline is approaching in 4 hours",
  ],
  WARNING: [
    "High call volume detected - consider offering callback",
    "Provider has previously declined verification requests",
    "Contact information may be outdated (>1 year old)",
    "This number was flagged as potentially disconnected",
  ],
};

const transcriptConversations = [
  [
    { speaker: 'AGENT' as const, text: "Hello, this is the verification team calling regarding your practice information. May I speak with someone who can confirm your details?" },
    { speaker: 'PROVIDER' as const, text: "Yes, this is Dr. Mitchell's office. How can I help you?" },
    { speaker: 'AGENT' as const, text: "Thank you. I'm calling to verify some information we have on file for Dr. Mitchell. This should only take a few minutes." },
    { speaker: 'PROVIDER' as const, text: "Sure, I can help with that. What do you need to verify?" },
    { speaker: 'AGENT' as const, text: "First, I'd like to confirm the practice address. We have 123 Main Street, Suite 400. Is that correct?" },
    { speaker: 'PROVIDER' as const, text: "Yes, that's correct. We've been at this location for about 5 years now." },
  ],
  [
    { speaker: 'AGENT' as const, text: "Good morning, I'm calling from the provider verification team. Is this Valley Medical Center?" },
    { speaker: 'PROVIDER' as const, text: "Yes it is. What can I do for you?" },
    { speaker: 'AGENT' as const, text: "I need to verify some information about your practice for insurance purposes. Do you have a moment?" },
    { speaker: 'PROVIDER' as const, text: "I'm a bit busy right now. Can you call back in an hour?" },
    { speaker: 'AGENT' as const, text: "Of course, I'll schedule a callback. What time works best for you today?" },
    { speaker: 'PROVIDER' as const, text: "Around 2 PM would be perfect. Thank you for understanding." },
  ],
];

// ----------------------------------------------------------------------------
// Mock Data Generators
// ----------------------------------------------------------------------------

export function generateMockActiveCall(state: CallState = 'IN_CALL'): ActiveCall {
  const direction: CallDirection = randomElement(['INBOUND', 'OUTBOUND']);
  const now = new Date();
  const startedAt = new Date(now.getTime() - randomInt(30, 300) * 1000);

  return {
    callId: `call-${generateId()}`,
    direction,
    state,
    startedAt: startedAt.toISOString(),
    connectedAt: state !== 'INCOMING' && state !== 'OUTGOING'
      ? new Date(startedAt.getTime() + randomInt(5, 15) * 1000).toISOString()
      : undefined,
    endedAt: state === 'ENDED' ? now.toISOString() : undefined,
    phoneNumber: `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`,
    callerName: randomElement(providerNames),
    organization: randomElement(organizations),
    taskId: `task-${generateId()}`,
    providerId: `prov-${generateId()}`,
    queueId: `queue-${generateId()}`,
    isMuted: false,
    isOnHold: state === 'ON_HOLD',
    holdStartedAt: state === 'ON_HOLD' ? new Date(now.getTime() - randomInt(10, 60) * 1000).toISOString() : undefined,
    isRecording: true,
    recordingId: `rec-${generateId()}`,
  };
}

export function generateMockCallerInfo(phoneNumber: string): CallerInfo {
  const found = seededRandom() > 0.1; // 90% chance of finding caller

  if (!found) {
    return {
      phoneNumber,
      lookupStatus: 'NOT_FOUND',
      totalPreviousCalls: 0,
    };
  }

  const cityIndex = randomInt(0, cities.length - 1);
  const priorityTiers: PriorityTier[] = ['P0', 'P1', 'P2'];
  const slaStatuses: ('ON_TRACK' | 'AT_RISK' | 'BREACHED')[] = ['ON_TRACK', 'AT_RISK', 'BREACHED'];

  return {
    phoneNumber,
    lookupStatus: 'FOUND',
    providerId: `prov-${generateId()}`,
    providerName: randomElement(providerNames),
    providerNPI: `${randomInt(1000000000, 9999999999)}`,
    organization: randomElement(organizations),
    specialty: randomElement(specialties),
    primaryPhone: phoneNumber,
    alternatePhone: seededRandom() > 0.5 ? `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}` : undefined,
    email: `office@${randomElement(organizations).toLowerCase().replace(/\s+/g, '')}.com`,
    fax: `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`,
    address: {
      street: `${randomInt(100, 9999)} ${randomElement(['Main', 'Oak', 'Maple', 'Cedar', 'Pine'])} ${randomElement(['Street', 'Avenue', 'Boulevard', 'Drive'])}`,
      city: cities[cityIndex],
      state: states[cityIndex],
      zipCode: `${randomInt(10000, 99999)}`,
    },
    priorityTier: randomElement(priorityTiers),
    slaStatus: randomElement(slaStatuses),
    slaDueAt: new Date(Date.now() + randomInt(1, 72) * 60 * 60 * 1000).toISOString(),
    totalPreviousCalls: randomInt(0, 15),
    lastContactAt: seededRandom() > 0.3
      ? new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
    assignedAgent: randomElement(agentNames),
    tags: randomInt(0, 3) > 0 ? [randomElement(['VIP', 'High Volume', 'New Provider', 'Network', 'Urgent'])] : undefined,
    notes: seededRandom() > 0.7 ? 'Provider prefers afternoon calls. Very responsive.' : undefined,
  };
}

export function generateMockInteractionHistory(count: number = 10): InteractionHistoryItem[] {
  const types: InteractionType[] = ['CALL', 'EMAIL', 'SMS', 'NOTE', 'TASK_UPDATE', 'VOICEMAIL'];
  const items: InteractionHistoryItem[] = [];

  for (let i = 0; i < count; i++) {
    const type = randomElement(types);
    const daysAgo = randomInt(0, 90);

    items.push({
      interactionId: `int-${generateId()}`,
      type,
      timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      summary: type === 'CALL'
        ? randomElement(outcomeMessages)
        : type === 'EMAIL'
          ? 'Verification request sent'
          : type === 'SMS'
            ? 'Reminder sent for callback'
            : type === 'NOTE'
              ? 'Internal note added'
              : type === 'VOICEMAIL'
                ? 'Voicemail left requesting callback'
                : 'Task status updated',
      duration: type === 'CALL' ? randomInt(60, 600) : undefined,
      outcome: type === 'CALL' ? randomElement(outcomeMessages) : undefined,
      agentName: randomElement(agentNames),
      notes: seededRandom() > 0.7 ? 'Follow-up may be required' : undefined,
    });
  }

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateMockCases(count: number = 5): Case[] {
  const statuses: CaseStatus[] = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
  const priorities: CasePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const cases: Case[] = [];

  const caseTitles = [
    'Address verification needed',
    'NPI number update request',
    'License renewal verification',
    'Contact info discrepancy',
    'Network participation inquiry',
    'Credentialing follow-up',
    'Practice information update',
    'Specialty confirmation',
  ];

  for (let i = 0; i < count; i++) {
    const daysAgo = randomInt(0, 30);
    cases.push({
      caseId: `case-${generateId()}`,
      title: randomElement(caseTitles),
      status: randomElement(statuses),
      priority: randomElement(priorities),
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - randomInt(0, daysAgo) * 24 * 60 * 60 * 1000).toISOString(),
      assignedAgent: randomElement(agentNames),
      description: 'Requires verification during next contact with provider.',
    });
  }

  return cases.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function generateMockLiveTranscription(callId: string, segmentCount: number = 6): LiveTranscription {
  const conversation = randomElement(transcriptConversations);
  const segments: LiveTranscriptSegment[] = [];

  let currentTime = 0;

  for (let i = 0; i < Math.min(segmentCount, conversation.length); i++) {
    const item = conversation[i];
    const duration = randomInt(3, 8);

    segments.push({
      segmentId: `seg-${generateId()}`,
      speaker: item.speaker,
      text: item.text,
      startTime: currentTime,
      endTime: currentTime + duration,
      confidence: 0.85 + seededRandom() * 0.15,
      sentiment: randomElement(['POSITIVE', 'NEUTRAL', 'NEUTRAL', 'NEUTRAL']),
      isLive: i === segmentCount - 1,
      isFinal: i < segmentCount - 1,
    });

    currentTime += duration + randomInt(1, 3);
  }

  return {
    callId,
    segments,
    lastUpdatedAt: new Date().toISOString(),
    isProcessing: true,
  };
}

export function generateMockAISuggestions(count: number = 4): AISuggestion[] {
  const types: SuggestionType[] = ['RESPONSE', 'QUESTION', 'ACTION', 'INFO', 'WARNING'];
  const suggestions: AISuggestion[] = [];

  // Ensure variety in types
  const selectedTypes = types.slice(0, count);

  for (let i = 0; i < count; i++) {
    const type = selectedTypes[i % selectedTypes.length];
    const contents = aiSuggestionContents[type];

    suggestions.push({
      suggestionId: `sug-${generateId()}`,
      type,
      content: randomElement(contents),
      confidence: 0.6 + seededRandom() * 0.4,
      triggerContext: i === 0 ? 'Based on conversation context' : undefined,
      timestamp: new Date(Date.now() - i * 30000).toISOString(),
      isExpanded: false,
      isUsed: false,
    });
  }

  return suggestions;
}

export function generateMockQuestionnaire(callId: string): QuestionnaireState {
  const confidenceLevels: FieldConfidence[] = ['HIGH', 'MEDIUM', 'LOW', 'MANUAL'];

  const contactInfoFields: AutoFillField[] = [
    {
      fieldId: 'primary_phone',
      fieldName: 'primaryPhone',
      fieldLabel: 'Primary Phone',
      category: 'Contact Info',
      originalValue: '+1 (555) 123-4567',
      aiSuggestedValue: '+1 (555) 123-4567',
      confidence: 0.95,
      confidenceLevel: 'HIGH',
      isEditing: false,
      isConfirmed: true,
      hasConflict: false,
    },
    {
      fieldId: 'fax',
      fieldName: 'fax',
      fieldLabel: 'Fax Number',
      category: 'Contact Info',
      originalValue: '+1 (555) 123-4568',
      aiSuggestedValue: '+1 (555) 987-6543',
      confidence: 0.72,
      confidenceLevel: 'MEDIUM',
      aiSource: 'Detected from conversation',
      isEditing: false,
      isConfirmed: false,
      hasConflict: true,
    },
    {
      fieldId: 'email',
      fieldName: 'email',
      fieldLabel: 'Email Address',
      category: 'Contact Info',
      originalValue: 'office@clinic.com',
      aiSuggestedValue: 'admin@metrohealthclinic.com',
      confidence: 0.68,
      confidenceLevel: 'MEDIUM',
      aiSource: 'Provider mentioned new email',
      isEditing: false,
      isConfirmed: false,
      hasConflict: true,
    },
  ];

  const addressFields: AutoFillField[] = [
    {
      fieldId: 'street',
      fieldName: 'street',
      fieldLabel: 'Street Address',
      category: 'Address',
      originalValue: '123 Main Street',
      aiSuggestedValue: '123 Main Street, Suite 400',
      confidence: 0.88,
      confidenceLevel: 'HIGH',
      aiSource: 'Confirmed by provider',
      isEditing: false,
      isConfirmed: false,
      hasConflict: true,
    },
    {
      fieldId: 'city',
      fieldName: 'city',
      fieldLabel: 'City',
      category: 'Address',
      originalValue: 'New York',
      aiSuggestedValue: 'New York',
      confidence: 0.95,
      confidenceLevel: 'HIGH',
      isEditing: false,
      isConfirmed: true,
      hasConflict: false,
    },
    {
      fieldId: 'state',
      fieldName: 'state',
      fieldLabel: 'State',
      category: 'Address',
      originalValue: 'NY',
      aiSuggestedValue: 'NY',
      confidence: 0.95,
      confidenceLevel: 'HIGH',
      isEditing: false,
      isConfirmed: true,
      hasConflict: false,
    },
    {
      fieldId: 'zip',
      fieldName: 'zip',
      fieldLabel: 'ZIP Code',
      category: 'Address',
      originalValue: '10001',
      aiSuggestedValue: '10001',
      confidence: 0.95,
      confidenceLevel: 'HIGH',
      isEditing: false,
      isConfirmed: true,
      hasConflict: false,
    },
  ];

  const practiceFields: AutoFillField[] = [
    {
      fieldId: 'office_hours',
      fieldName: 'officeHours',
      fieldLabel: 'Office Hours',
      category: 'Practice Details',
      originalValue: '9:00 AM - 5:00 PM',
      aiSuggestedValue: '8:30 AM - 6:00 PM',
      confidence: 0.55,
      confidenceLevel: 'LOW',
      aiSource: 'Provider mentioned extended hours',
      isEditing: false,
      isConfirmed: false,
      hasConflict: true,
    },
    {
      fieldId: 'accepting_patients',
      fieldName: 'acceptingPatients',
      fieldLabel: 'Accepting New Patients',
      category: 'Practice Details',
      originalValue: 'Yes',
      aiSuggestedValue: 'Yes',
      confidence: 0.90,
      confidenceLevel: 'HIGH',
      isEditing: false,
      isConfirmed: true,
      hasConflict: false,
    },
  ];

  const sections: QuestionnaireSection[] = [
    {
      sectionId: 'contact',
      sectionName: 'Contact Information',
      fields: contactInfoFields,
      completionPercentage: 33,
    },
    {
      sectionId: 'address',
      sectionName: 'Address',
      fields: addressFields,
      completionPercentage: 75,
    },
    {
      sectionId: 'practice',
      sectionName: 'Practice Details',
      fields: practiceFields,
      completionPercentage: 50,
    },
  ];

  const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0);
  const confirmedFields = sections.reduce(
    (sum, s) => sum + s.fields.filter(f => f.isConfirmed).length,
    0
  );

  return {
    callId,
    taskId: `task-${generateId()}`,
    sections,
    overallCompletion: Math.round((confirmedFields / totalFields) * 100),
    lastSyncedAt: new Date().toISOString(),
  };
}

export function generateMockCallNotes(callId: string, count: number = 3): CallNote[] {
  const notes: CallNote[] = [];
  const noteContents = [
    'Provider confirmed all contact information is up to date.',
    'Need to follow up regarding license renewal status.',
    'Provider mentioned they have additional locations not on file.',
    'Requested callback next week to complete verification.',
    'All information verified successfully.',
  ];

  for (let i = 0; i < count; i++) {
    notes.push({
      noteId: `note-${generateId()}`,
      callId,
      content: randomElement(noteContents),
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
      createdBy: randomElement(agentNames),
      tags: seededRandom() > 0.5 ? [randomElement(['follow-up', 'verified', 'urgent', 'pending'])] : undefined,
      isPrivate: seededRandom() > 0.8,
    });
  }

  return notes;
}

export function generateMockCallHistory(count: number = 10): CallHistoryEntry[] {
  const history: CallHistoryEntry[] = [];

  for (let i = 0; i < count; i++) {
    const daysAgo = randomInt(0, 60);
    const duration = randomInt(60, 900);
    const startedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    history.push({
      callId: `call-${generateId()}`,
      direction: randomElement(['INBOUND', 'OUTBOUND']),
      phoneNumber: `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`,
      callerName: randomElement(providerNames),
      startedAt: startedAt.toISOString(),
      endedAt: new Date(startedAt.getTime() + duration * 1000).toISOString(),
      duration,
      outcome: randomElement(outcomeMessages),
      agentName: randomElement(agentNames),
      hasRecording: seededRandom() > 0.2,
      hasTranscript: seededRandom() > 0.3,
      notes: seededRandom() > 0.6 ? 'Standard verification call' : undefined,
    });
  }

  return history.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function generateMockQuickActions(): QuickAction[] {
  return [
    {
      actionType: 'SEND_SMS',
      label: 'Send SMS',
      icon: 'MessageSquare',
      shortcut: 'Ctrl+M',
      isEnabled: true,
      requiresConfirmation: true,
    },
    {
      actionType: 'CREATE_TASK',
      label: 'Create Task',
      icon: 'ClipboardList',
      shortcut: 'Ctrl+T',
      isEnabled: true,
      requiresConfirmation: false,
    },
    {
      actionType: 'SCHEDULE_CALLBACK',
      label: 'Schedule Callback',
      icon: 'CalendarClock',
      shortcut: 'Ctrl+K',
      isEnabled: true,
      requiresConfirmation: false,
    },
    {
      actionType: 'OPEN_CRM',
      label: 'Open CRM',
      icon: 'ExternalLink',
      shortcut: 'Ctrl+O',
      isEnabled: true,
      requiresConfirmation: false,
    },
    {
      actionType: 'SEND_EMAIL',
      label: 'Send Email',
      icon: 'Mail',
      shortcut: 'Ctrl+E',
      isEnabled: true,
      requiresConfirmation: true,
    },
    {
      actionType: 'ADD_NOTE',
      label: 'Add Note',
      icon: 'FileText',
      shortcut: 'Ctrl+N',
      isEnabled: true,
      requiresConfirmation: false,
    },
  ];
}

// ----------------------------------------------------------------------------
// Simulation Helpers
// ----------------------------------------------------------------------------

export function simulateIncomingCall(): ActiveCall {
  return generateMockActiveCall('INCOMING');
}

export function simulateCallAnswer(call: ActiveCall): ActiveCall {
  return {
    ...call,
    state: 'IN_CALL',
    connectedAt: new Date().toISOString(),
  };
}

export function simulateCallHold(call: ActiveCall, hold: boolean): ActiveCall {
  return {
    ...call,
    state: hold ? 'ON_HOLD' : 'IN_CALL',
    isOnHold: hold,
    holdStartedAt: hold ? new Date().toISOString() : undefined,
  };
}

export function simulateCallMute(call: ActiveCall, mute: boolean): ActiveCall {
  return {
    ...call,
    isMuted: mute,
  };
}

export function simulateCallEnd(call: ActiveCall): ActiveCall {
  return {
    ...call,
    state: 'ENDED',
    endedAt: new Date().toISOString(),
  };
}

export function simulateNewTranscriptSegment(
  transcription: LiveTranscription,
  speaker: 'AGENT' | 'PROVIDER',
  text: string
): LiveTranscription {
  const lastSegment = transcription.segments[transcription.segments.length - 1];
  const startTime = lastSegment ? lastSegment.endTime + 1 : 0;
  const duration = Math.ceil(text.length / 15); // ~15 chars per second

  // Mark all existing segments as final
  const updatedSegments = transcription.segments.map(s => ({
    ...s,
    isLive: false,
    isFinal: true,
  }));

  const newSegment: LiveTranscriptSegment = {
    segmentId: `seg-${generateId()}`,
    speaker,
    text,
    startTime,
    endTime: startTime + duration,
    confidence: 0.85 + seededRandom() * 0.15,
    sentiment: 'NEUTRAL',
    isLive: true,
    isFinal: false,
  };

  return {
    ...transcription,
    segments: [...updatedSegments, newSegment],
    lastUpdatedAt: new Date().toISOString(),
  };
}
