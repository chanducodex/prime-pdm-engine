/**
 * useTwilioDevice Hook
 * Custom hook for initializing and managing Twilio Device
 */

import { useEffect, useState, useCallback } from 'react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';

interface UseTwilioDeviceOptions {
  tokenUrl?: string;
  autoInitialize?: boolean;
  onError?: (error: Error) => void;
}

interface TwilioDeviceState {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useTwilioDevice(options: UseTwilioDeviceOptions = {}) {
  const { tokenUrl, autoInitialize = false, onError } = options;
  const { initializeTwilio } = useAgentCall();

  const [deviceState, setDeviceState] = useState<TwilioDeviceState>({
    isReady: false,
    isLoading: false,
    error: null,
  });

  // Fetch Twilio token and initialize device
  const initDevice = useCallback(async () => {
    if (!tokenUrl) {
      const error = 'Twilio token URL not provided';
      setDeviceState(prev => ({ ...prev, error }));
      onError?.(new Error(error));
      return;
    }

    setDeviceState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(tokenUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.statusText}`);
      }

      const { token } = await response.json();
      await initializeTwilio(token);

      setDeviceState({
        isReady: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDeviceState({
        isReady: false,
        isLoading: false,
        error: errorMessage,
      });
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [tokenUrl, initializeTwilio, onError]);

  // Auto-initialize on mount if enabled
  useEffect(() => {
    if (autoInitialize && tokenUrl) {
      initDevice();
    }
  }, [autoInitialize, tokenUrl, initDevice]);

  return {
    ...deviceState,
    initialize: initDevice,
  };
}

/**
 * Hook for Twilio device with direct token
 */
export function useTwilioDeviceWithToken() {
  const { initializeTwilio } = useAgentCall();

  const [deviceState, setDeviceState] = useState<TwilioDeviceState>({
    isReady: false,
    isLoading: false,
    error: null,
  });

  const initialize = useCallback(async (token: string) => {
    setDeviceState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await initializeTwilio(token);
      setDeviceState({
        isReady: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDeviceState({
        isReady: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, [initializeTwilio]);

  return {
    ...deviceState,
    initialize,
  };
}
