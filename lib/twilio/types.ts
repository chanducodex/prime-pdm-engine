/**
 * Twilio Service Types
 */

import type { CallState } from '../agent-call-types';

export interface Call {
  callId: string;
  state: CallState;
  direction: 'inbound' | 'outbound';
  phoneNumber: string;
  callerName?: string;
  connectedAt?: string;
  startedAt?: string;
}

export interface TwilioConfig {
  tokenUrl: string;
  accessToken?: string;
  region?: string;
  edge?: string[];
  codecPreferences?: Array<'OPUS' | 'PCMU'>;
}

export interface CallEvent {
  type: 'ringing' | 'connected' | 'disconnected' | 'error';
  data?: unknown;
}
