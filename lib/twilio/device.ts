/**
 * Twilio Device Service
 * Handles Twilio Client SDK integration for voice calls
 */

import type { Call, CallEvent } from './types';

// Twilio Device global type (will be loaded from SDK)
declare global {
  interface Window {
    Twilio?: {
      Device: typeof TwilioDevice;
    };
  }
}

// Minimal Twilio Device interface
interface TwilioDeviceStatic {
  setup(token: string, options?: DeviceOptions): Promise<Device>;
  ready(callback: () => void): void;
  offline(callback: () => void): void;
  incoming(callback: (call: TwilioCall) => void): void;
  cancel(callback: (call: TwilioCall) => void): void;
  disconnect(callback: (call: TwilioCall) => void): void;
  error(callback: (error: Error) => void): void;
  destroy(): Promise<void>;
  disconnectAll(): void;
  region: string;
  activeDevice(): TwilioDevice | null;
}

interface DeviceOptions {
  codecPreferences?: Array<'OPUS' | 'PCMU'>;
  allowIncomingWhileBusy?: boolean;
  closeProtection?: boolean | 'ignore' | 'warning';
  debug?: boolean;
  edge?: string[];
  maxAverageBitrate?: number;
}

interface TwilioDevice {
  id: string;
  state(): string;
  mute(shouldMute: boolean): void;
  disconnect(): void;
  reject(): void;
  ignore(): void;
  info(): Promise<DeviceInfo>;
}

interface DeviceInfo {
  codec: string;
  region: string;
}

interface TwilioCall {
  mute(shouldMute: boolean): void;
  hold(): void;
  unhold(): void;
  disconnect(): void;
  reject(): void;
  ignore(): void;
  sendDigits(digits: string): void;
  state(): string;
  parameters(): CallParameters;
  on(event: string, callback: (...args: unknown[]) => void): void;
}

interface CallParameters {
  From: string;
  To: string;
  CallSid: string;
}

// Service state
let device: TwilioDeviceStatic | null = null;
let currentDevice: TwilioDevice | null = null;
let activeCall: TwilioCall | null = null;
let token: string | null = null;

// Event listeners
const listeners = {
  ready: [] as Array<() => void>,
  offline: [] as Array<() => void>,
  incoming: [] as Array<(call: Call) => void>,
  connected: [] as Array<(call: Call) => void>,
  disconnected: [] as Array<(call: Call) => void>,
  error: [] as Array<(error: Error) => void>,
};

/**
 * Load Twilio SDK dynamically
 */
async function loadTwilioSDK(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.Twilio) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.twilio.com/js/client/v2/twilio.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Twilio SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Initialize Twilio Device with access token
 */
export async function initializeDevice(accessToken: string, options?: DeviceOptions): Promise<void> {
  try {
    await loadTwilioSDK();

    if (!window.Twilio?.Device) {
      throw new Error('Twilio SDK not loaded');
    }

    // Destroy existing device if any
    if (device) {
      await destroyDevice();
    }

    token = accessToken;
    device = window.Twilio.Device;

    // Set up event handlers
    device.ready(() => {
      console.log('[Twilio] Device ready');
      listeners.ready.forEach(cb => cb());
    });

    device.offline(() => {
      console.log('[Twilio] Device offline');
      listeners.offline.forEach(cb => cb());
    });

    device.incoming((twilioCall: TwilioCall) => {
      console.log('[Twilio] Incoming call', twilioCall.parameters());
      const call = mapTwilioCall(twilioCall);
      activeCall = twilioCall;
      listeners.incoming.forEach(cb => cb(call));
    });

    device.connect((conn: unknown) => {
      // Handle connection if needed
    });

    device.error((error: Error) => {
      console.error('[Twilio] Device error', error);
      listeners.error.forEach(cb => cb(error));
    });

    await device.setup(accessToken, options);
  } catch (error) {
    console.error('[Twilio] Failed to initialize device', error);
    throw error;
  }
}

/**
 * Make an outbound call
 */
export async function makeCall(phoneNumber: string, options?: { callerId?: string }): Promise<void> {
  if (!device) {
    throw new Error('Device not initialized');
  }

  try {
    const connectOptions: Record<string, string> = {
      To: phoneNumber,
    };

    if (options?.callerId) {
      connectOptions.CallerId = options.callerId;
    }

    const conn = await (device as any).connect(connectOptions);
    activeCall = conn as TwilioCall;

    const call = mapTwilioCall(activeCall);
    listeners.connected.forEach(cb => cb(call));
  } catch (error) {
    console.error('[Twilio] Failed to make call', error);
    throw error;
  }
}

/**
 * Disconnect the active call
 */
export function disconnectCall(): void {
  if (activeCall) {
    activeCall.disconnect();
  } else if (currentDevice) {
    currentDevice.disconnect();
  }
}

/**
 * Mute/unmute the active call
 */
export function toggleMute(shouldMute: boolean): void {
  if (activeCall) {
    activeCall.mute(shouldMute);
  } else if (currentDevice) {
    currentDevice.mute(shouldMute);
  }
}

/**
 * Send DTMF tones
 */
export function sendDigits(digits: string): void {
  if (activeCall) {
    activeCall.sendDigits(digits);
  }
}

/**
 * Reject an incoming call
 */
export function rejectCall(): void {
  if (activeCall) {
    activeCall.reject();
  }
}

/**
 * Ignore an incoming call
 */
export function ignoreCall(): void {
  if (activeCall) {
    activeCall.ignore();
  }
}

/**
 * Get current device state
 */
export function getDeviceState(): string {
  return currentDevice?.state() ?? 'offline';
}

/**
 * Get current call state
 */
export function getCallState(): string {
  return activeCall?.state() ?? 'closed';
}

/**
 * Check if device is ready
 */
export function isReady(): boolean {
  return getDeviceState() === 'ready';
}

/**
 * Destroy the device
 */
export async function destroyDevice(): Promise<void> {
  if (device) {
    await device.destroy();
    device = null;
    currentDevice = null;
    activeCall = null;
    token = null;
  }
}

/**
 * Refresh token
 */
export async function refreshToken(newToken: string): Promise<void> {
  if (!device) {
    throw new Error('Device not initialized');
  }
  token = newToken;
  await device.setup(newToken);
}

/**
 * Register event listeners
 */
export function on(event: 'ready' | 'offline' | 'incoming' | 'connected' | 'disconnected' | 'error', callback: (...args: unknown[]) => void): void {
  if (event in listeners) {
    (listeners as Record<string, unknown[]>)[event].push(callback);
  }
}

/**
 * Unregister event listeners
 */
export function off(event: string, callback: (...args: unknown[]) => void): void {
  if (event in listeners) {
    const index = (listeners as Record<string, unknown[]>)[event].indexOf(callback);
    if (index > -1) {
      (listeners as Record<string, unknown[]>)[event].splice(index, 1);
    }
  }
}

/**
 * Map Twilio call to our Call interface
 */
function mapTwilioCall(twilioCall: TwilioCall | null): Call {
  if (!twilioCall) {
    return {
      callId: '',
      state: 'closed',
      direction: 'outbound',
      phoneNumber: '',
    };
  }

  const params = twilioCall.parameters();
  const state = twilioCall.state();

  let callState: Call['state'] = 'closed';
  switch (state) {
    case 'pending':
      callState = 'INITIATING';
      break;
    case 'connecting':
      callState = 'CONNECTING';
      break;
    case 'ringing':
      callState = 'OUTGOING';
      break;
    case 'open':
      callState = 'IN_CALL';
      break;
    case 'closed':
      callState = 'ENDED';
      break;
  }

  return {
    callId: params.CallSid || '',
    state: callState,
    direction: params.From === params.To ? 'inbound' : 'outbound',
    phoneNumber: params.To || '',
    callerName: params.From || '',
  };
}

/**
 * Get current active call info
 */
export function getActiveCall(): Call | null {
  return activeCall ? mapTwilioCall(activeCall) : null;
}
