'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseCallTimerOptions {
  startedAt?: string | null;
  isPaused?: boolean;
  onTick?: (seconds: number) => void;
}

export interface UseCallTimerReturn {
  elapsedSeconds: number;
  formattedTime: string;
  isRunning: boolean;
  reset: () => void;
}

/**
 * Custom hook for tracking elapsed call time
 * @param options - Configuration options for the timer
 * @returns Timer state and controls
 */
export function useCallTimer(options: UseCallTimerOptions = {}): UseCallTimerReturn {
  const { startedAt, isPaused = false, onTick } = options;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate initial elapsed time from startedAt
  const calculateElapsed = useCallback(() => {
    if (!startedAt) return 0;
    const startTime = new Date(startedAt).getTime();
    const now = Date.now();
    return Math.floor((now - startTime) / 1000);
  }, [startedAt]);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Reset the timer
  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop timer based on startedAt
  useEffect(() => {
    if (startedAt && !isPaused) {
      // Set initial elapsed time
      setElapsedSeconds(calculateElapsed());
      setIsRunning(true);

      // Start interval
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newValue = prev + 1;
          if (onTick) {
            onTick(newValue);
          }
          return newValue;
        });
      }, 1000);
    } else {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startedAt, isPaused, calculateElapsed, onTick]);

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isRunning,
    reset,
  };
}

/**
 * Simple hook for a hold timer that tracks time on hold
 */
export function useHoldTimer(holdStartedAt?: string | null): UseCallTimerReturn {
  return useCallTimer({
    startedAt: holdStartedAt,
    isPaused: !holdStartedAt,
  });
}

export default useCallTimer;
