'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
  enabled?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts
 * @param options - Configuration for keyboard shortcuts
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): void {
  const { shortcuts, enabled = true, preventDefault = true } = options;
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    },
    [enabled, preventDefault]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}

/**
 * Predefined shortcuts for call controls
 */
export interface CallControlShortcuts {
  onMute: () => void;
  onHold: () => void;
  onHangUp: () => void;
  onAnswer: () => void;
  onDialPad: () => void;
  isCallActive: boolean;
  isIncoming: boolean;
}

export function useCallControlShortcuts(controls: CallControlShortcuts): void {
  const {
    onMute,
    onHold,
    onHangUp,
    onAnswer,
    onDialPad,
    isCallActive,
    isIncoming,
  } = controls;

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'm',
      action: onMute,
      description: 'Toggle mute',
      enabled: isCallActive,
    },
    {
      key: 'h',
      action: onHold,
      description: 'Toggle hold',
      enabled: isCallActive,
    },
    {
      key: 'Escape',
      action: onHangUp,
      description: 'Hang up call',
      enabled: isCallActive,
    },
    {
      key: ' ', // Space
      action: onAnswer,
      description: 'Answer incoming call',
      enabled: isIncoming,
    },
    {
      key: 'd',
      action: onDialPad,
      description: 'Open dial pad',
      enabled: isCallActive,
    },
  ];

  useKeyboardShortcuts({
    shortcuts,
    enabled: true,
  });
}

/**
 * Format shortcut key for display
 */
export function formatShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push('Ctrl');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }

  // Format special keys
  let keyDisplay = shortcut.key;
  switch (shortcut.key.toLowerCase()) {
    case ' ':
      keyDisplay = 'Space';
      break;
    case 'escape':
      keyDisplay = 'Esc';
      break;
    case 'arrowup':
      keyDisplay = '↑';
      break;
    case 'arrowdown':
      keyDisplay = '↓';
      break;
    case 'arrowleft':
      keyDisplay = '←';
      break;
    case 'arrowright':
      keyDisplay = '→';
      break;
    case 'enter':
      keyDisplay = 'Enter';
      break;
    case 'backspace':
      keyDisplay = 'Backspace';
      break;
    default:
      keyDisplay = shortcut.key.toUpperCase();
  }

  parts.push(keyDisplay);
  return parts.join('+');
}

export default useKeyboardShortcuts;
