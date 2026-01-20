// ============================================================================
// Call Recording Controls Panel
// Recording management with start/stop/pause and compliance features
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Circle,
  Pause,
  Play,
  Square,
  Flag,
  Shield,
  AlertCircle,
  Clock,
} from 'lucide-react';

export interface RecordingMarker {
  timestamp: number;
  label: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  startedAt?: string;
  duration: number;
  markers: RecordingMarker[];
  complianceDisclaimerPlayed: boolean;
  recordingId?: string;
}

interface CallRecordingControlsPanelProps {
  isCallActive?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onPauseRecording?: () => void;
  onResumeRecording?: () => void;
  onAddMarker?: (label: string) => void;
  onPlayDisclaimer?: () => void;
  className?: string;
  compact?: boolean;
}

export const CallRecordingControlsPanel: React.FC<CallRecordingControlsPanelProps> = ({
  isCallActive = false,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onAddMarker,
  onPlayDisclaimer,
  className = '',
  compact = false,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    markers: [],
    complianceDisclaimerPlayed: false,
  });
  const [showMarkerInput, setShowMarkerInput] = useState(false);
  const [markerLabel, setMarkerLabel] = useState('');

  // Update duration while recording
  useEffect(() => {
    if (!recordingState.isRecording || recordingState.isPaused) return;

    const interval = setInterval(() => {
      setRecordingState((prev) => ({
        ...prev,
        duration: prev.duration + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [recordingState.isRecording, recordingState.isPaused]);

  // Reset recording state when call ends
  useEffect(() => {
    if (!isCallActive) {
      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        markers: [],
        complianceDisclaimerPlayed: false,
      });
    }
  }, [isCallActive]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setRecordingState((prev) => ({
      ...prev,
      isRecording: true,
      isPaused: false,
      startedAt: new Date().toISOString(),
      recordingId: `rec_${Date.now()}`,
    }));
    onStartRecording?.();
  };

  const handleStopRecording = () => {
    setRecordingState((prev) => ({
      ...prev,
      isRecording: false,
      isPaused: false,
    }));
    onStopRecording?.();
  };

  const handlePauseRecording = () => {
    setRecordingState((prev) => ({
      ...prev,
      isPaused: true,
    }));
    onPauseRecording?.();
  };

  const handleResumeRecording = () => {
    setRecordingState((prev) => ({
      ...prev,
      isPaused: false,
    }));
    onResumeRecording?.();
  };

  const handleAddMarker = () => {
    if (!markerLabel.trim()) return;

    const marker: RecordingMarker = {
      timestamp: recordingState.duration,
      label: markerLabel.trim(),
    };

    setRecordingState((prev) => ({
      ...prev,
      markers: [...prev.markers, marker],
    }));

    onAddMarker?.(markerLabel.trim());
    setMarkerLabel('');
    setShowMarkerInput(false);
  };

  const handlePlayDisclaimer = () => {
    setRecordingState((prev) => ({
      ...prev,
      complianceDisclaimerPlayed: true,
    }));
    onPlayDisclaimer?.();
  };

  if (!isCallActive) {
    if (compact) return null;
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <MicOff className="w-4 h-4" />
          <span className="text-sm">Recording requires active call</span>
        </div>
      </div>
    );
  }

  // Compact version
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Recording indicator */}
        {recordingState.isRecording && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 rounded-lg">
            <Circle
              className={`w-3 h-3 text-red-600 fill-red-600 ${
                recordingState.isPaused ? '' : 'animate-pulse'
              }`}
            />
            <span className="text-xs font-medium text-red-700">
              {recordingState.isPaused ? 'PAUSED' : 'REC'}
            </span>
            <span className="text-xs text-red-600">{formatDuration(recordingState.duration)}</span>
          </div>
        )}

        {/* Quick controls */}
        {!recordingState.isRecording ? (
          <button
            onClick={handleStartRecording}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Start Recording"
          >
            <Circle className="w-4 h-4" />
          </button>
        ) : (
          <>
            {recordingState.isPaused ? (
              <button
                onClick={handleResumeRecording}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Resume Recording"
              >
                <Play className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePauseRecording}
                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Pause Recording"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleStopRecording}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Stop Recording"
            >
              <Square className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  }

  // Full panel version
  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Call Recording</h3>
          </div>
          {recordingState.isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 rounded-full">
              <Circle
                className={`w-2.5 h-2.5 text-red-600 fill-red-600 ${
                  recordingState.isPaused ? '' : 'animate-pulse'
                }`}
              />
              <span className="text-xs font-medium text-red-700">
                {recordingState.isPaused ? 'PAUSED' : 'RECORDING'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Duration and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-2xl font-mono font-semibold text-gray-900">
              {formatDuration(recordingState.duration)}
            </span>
          </div>
          {!recordingState.isRecording && recordingState.duration > 0 && (
            <span className="text-xs text-gray-500">Last recording ended</span>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          {!recordingState.isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <Circle className="w-4 h-4 fill-white" />
              Start Recording
            </button>
          ) : (
            <>
              {recordingState.isPaused ? (
                <button
                  onClick={handleResumeRecording}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              ) : (
                <button
                  onClick={handlePauseRecording}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              )}
              <button
                onClick={handleStopRecording}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Compliance Disclaimer */}
        <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-100 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-700">Recording Disclaimer</span>
          </div>
          <button
            onClick={handlePlayDisclaimer}
            disabled={recordingState.complianceDisclaimerPlayed}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              recordingState.complianceDisclaimerPlayed
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {recordingState.complianceDisclaimerPlayed ? 'Played' : 'Play Disclaimer'}
          </button>
        </div>

        {/* Marker Controls */}
        {recordingState.isRecording && (
          <div>
            {showMarkerInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={markerLabel}
                  onChange={(e) => setMarkerLabel(e.target.value)}
                  placeholder="Marker label..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMarker()}
                  autoFocus
                />
                <button
                  onClick={handleAddMarker}
                  disabled={!markerLabel.trim()}
                  className="px-3 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowMarkerInput(false);
                    setMarkerLabel('');
                  }}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowMarkerInput(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Add Timestamp Marker
              </button>
            )}
          </div>
        )}

        {/* Markers List */}
        {recordingState.markers.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Markers</h4>
            <div className="space-y-1.5">
              {recordingState.markers.map((marker, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-xs text-gray-600">{marker.label}</span>
                  <span className="text-xs font-mono text-gray-400">
                    {formatDuration(marker.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning if not recording compliance-required call */}
        {!recordingState.isRecording && isCallActive && (
          <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-amber-700">
              This call is not being recorded. Start recording if required for compliance.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
