'use client';

import { useCallback } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  ArrowRightLeft,
  PhoneIncoming,
} from 'lucide-react';
import { CallTimer } from './call-timer';
import { CallStateIndicator, CallStateBadge } from './call-state-indicator';
import { DialPadModal } from './dial-pad-modal';
import { useAgentCall } from '@/lib/contexts/agent-call-context';
import { useCallControlShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

// Custom Dial Pad Icon component
function DialPadIcon({ className = '' }: { className?: string }) {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/512/483/483948.png"
      alt="Dial Pad"
      className={className}
      style={{ filter: 'brightness(0) var(--tw-brightness, 1))' }}
    />
  );
}

interface CallControlPanelProps {
  className?: string;
  compact?: boolean;
}

export function CallControlPanel({ className = '', compact = false }: CallControlPanelProps) {
  const {
    state,
    answerCall,
    hangUp,
    toggleHold,
    toggleMute,
    sendDTMF,
    setDialPadOpen,
    simulateIncomingCall,
    initiateCall,
  } = useAgentCall();

  const { activeCall, isDialPadOpen } = state;

  // Register keyboard shortcuts
  useCallControlShortcuts({
    onMute: toggleMute,
    onHold: toggleHold,
    onHangUp: hangUp,
    onAnswer: answerCall,
    onDialPad: () => setDialPadOpen(!isDialPadOpen),
    isCallActive: !!activeCall && activeCall.state === 'IN_CALL',
    isIncoming: activeCall?.state === 'INCOMING',
  });

  const handleTransfer = useCallback(() => {
    // For now, just show an alert - in a real app, this would open a transfer modal
    alert('Transfer functionality would open a modal to select transfer target');
  }, []);

  const isIncoming = activeCall?.state === 'INCOMING';
  const isOutgoing = activeCall?.state === 'OUTGOING';
  const isInCall = activeCall?.state === 'IN_CALL' || activeCall?.state === 'ON_HOLD';
  const isEnded = activeCall?.state === 'ENDED';

  // Compact header mode
  if (compact) {
    return (
      <>
        {!activeCall ? (
          <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
            <button
              onClick={() => setDialPadOpen(true)}
              className="p-1.5 sm:p-2 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
              title="Open Dial Pad"
            >
              <DialPadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={simulateIncomingCall}
              className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              title="Simulate Incoming Call"
            >
              <PhoneIncoming className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium sm:inline hidden">Simulate Call</span>
            </button>
            <span className="text-xs sm:text-sm text-gray-500 truncate">No active call</span>
          </div>
        ) : isIncoming ? (
          <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
            <button
              onClick={answerCall}
              className="p-1.5 sm:p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              title="Answer"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={hangUp}
              className="p-1.5 sm:p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Decline"
            >
              <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        ) : isInCall ? (
          <div className={`flex items-center gap-1 ${className}`}>
            <button
              onClick={toggleMute}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${activeCall.isMuted
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={activeCall.isMuted ? 'Unmute' : 'Mute'}
            >
              {activeCall.isMuted ? <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
            <button
              onClick={toggleHold}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${activeCall.isOnHold
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={activeCall.isOnHold ? 'Resume' : 'Hold'}
            >
              {activeCall.isOnHold ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
            <button
              onClick={handleTransfer}
              className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors hidden sm:block"
              title="Transfer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setDialPadOpen(true)}
              className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              title="Dial Pad (D)"
            >
              <DialPadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={hangUp}
              className="p-1.5 sm:p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="End Call"
            >
              <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <CallTimer
              startedAt={activeCall.connectedAt || activeCall.startedAt}
              holdStartedAt={activeCall.holdStartedAt}
              size="sm"
            />
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
            <CallStateIndicator state={activeCall.state} />
            <button
              onClick={hangUp}
              className="p-1.5 sm:p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Cancel"
            >
              <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
        <DialPadModal
          isOpen={isDialPadOpen}
          onClose={() => setDialPadOpen(false)}
          onDTMF={sendDTMF}
          onCall={initiateCall}
          showCallButton={!activeCall}
        />
      </>
    );
  }

  // No active call - show idle state with simulate button
  if (!activeCall) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center gap-4">
          <CallStateIndicator state="IDLE" />
          <p className="text-sm text-gray-500">No active call</p>
          <button
            onClick={simulateIncomingCall}
            className="
              flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
              bg-violet-50 text-violet-700 hover:bg-violet-100
              transition-colors text-xs sm:text-sm font-medium
            "
          >
            <PhoneIncoming className="w-4 h-4" />
            <span className="hidden sm:inline">Simulate Incoming Call</span>
            <span className="sm:hidden">Simulate Call</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Call Info Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CallStateIndicator state={activeCall.state} />
            {(isInCall || isOutgoing) && (
              <CallTimer
                startedAt={activeCall.connectedAt || activeCall.startedAt}
                holdStartedAt={activeCall.holdStartedAt}
                size="md"
              />
            )}
          </div>
          <CallStateBadge state={activeCall.state} />
        </div>

        {/* Caller info preview */}
        <div className="mt-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {activeCall.callerName || 'Unknown Caller'}
            </p>
            <p className="text-sm text-gray-500">{activeCall.phoneNumber}</p>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="p-4">
        {/* Incoming call actions */}
        {isIncoming && (
          <div className="flex gap-3">
            <button
              onClick={answerCall}
              className="
                flex-1 flex items-center justify-center gap-2 py-4 rounded-xl
                bg-green-500 hover:bg-green-600 active:bg-green-700
                text-white font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              "
            >
              <Phone className="w-5 h-5" />
              Answer
            </button>
            <button
              onClick={hangUp}
              className="
                flex-1 flex items-center justify-center gap-2 py-4 rounded-xl
                bg-red-500 hover:bg-red-600 active:bg-red-700
                text-white font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              "
            >
              <PhoneOff className="w-5 h-5" />
              Decline
            </button>
          </div>
        )}

        {/* Outgoing call actions */}
        {isOutgoing && (
          <div className="flex justify-center">
            <button
              onClick={hangUp}
              className="
                flex items-center justify-center gap-2 px-8 py-4 rounded-xl
                bg-red-500 hover:bg-red-600 active:bg-red-700
                text-white font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              "
            >
              <PhoneOff className="w-5 h-5" />
              Cancel Call
            </button>
          </div>
        )}

        {/* In-call controls */}
        {isInCall && (
          <div className="space-y-3">
            {/* Primary controls */}
            <div className="grid grid-cols-4 gap-3">
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className={`
                  flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl
                  transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500
                  ${activeCall.isMuted
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title="Toggle mute (M)"
              >
                {activeCall.isMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
                <span className="text-xs font-medium">
                  {activeCall.isMuted ? 'Unmute' : 'Mute'}
                </span>
              </button>

              {/* Hold button */}
              <button
                onClick={toggleHold}
                className={`
                  flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl
                  transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500
                  ${activeCall.isOnHold
                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title="Toggle hold (H)"
              >
                {activeCall.isOnHold ? (
                  <Play className="w-5 h-5" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
                <span className="text-xs font-medium">
                  {activeCall.isOnHold ? 'Resume' : 'Hold'}
                </span>
              </button>

              {/* Transfer button */}
              <button
                onClick={handleTransfer}
                className="
                  flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl
                  bg-gray-100 text-gray-700 hover:bg-gray-200
                  transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500
                "
                title="Transfer call"
              >
                <ArrowRightLeft className="w-5 h-5" />
                <span className="text-xs font-medium">Transfer</span>
              </button>

              {/* Dial pad button */}
              <button
                onClick={() => setDialPadOpen(true)}
                className="
                  flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl
                  bg-gray-100 text-gray-700 hover:bg-gray-200
                  transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500
                "
                title="Open dial pad (D)"
              >
                <DialPadIcon className="w-5 h-5" />
                <span className="text-xs font-medium">Keypad</span>
              </button>
            </div>

            {/* Hang up button */}
            <button
              onClick={hangUp}
              className="
                w-full flex items-center justify-center gap-2 py-4 rounded-xl
                bg-red-500 hover:bg-red-600 active:bg-red-700
                text-white font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              "
              title="Hang up (Esc)"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </button>
          </div>
        )}

        {/* Call ended state */}
        {isEnded && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-gray-500">Call ended</p>
            <CallTimer startedAt={activeCall.startedAt} size="sm" />
          </div>
        )}
      </div>

      {/* Dial Pad Modal */}
      <DialPadModal
        isOpen={isDialPadOpen}
        onClose={() => setDialPadOpen(false)}
        onDTMF={sendDTMF}
      />
    </div>
  );
}

export default CallControlPanel;
