// ============================================================================
// Call Escalation Panel
// Supervisor escalation and monitoring management
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  UserCheck,
  UserX,
  Users,
  Eye,
  Phone,
  MessageSquare,
  ChevronDown,
  Check,
  Loader2,
} from 'lucide-react';

export type SupervisorStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export type EscalationLevel = 'P1' | 'P2' | 'P3' | 'P4';

export interface Supervisor {
  id: string;
  name: string;
  status: SupervisorStatus;
  currentCalls: number;
  avatar?: string;
}

export interface EscalationState {
  availableSupervisors: Supervisor[];
  selectedSupervisor?: string;
  escalationLevel: EscalationLevel;
  reason: string;
  notes: string;
  isBeingMonitored: boolean;
  monitoringSupervisor?: string;
}

interface CallEscalationPanelProps {
  isCallActive?: boolean;
  onEscalate?: (data: { supervisorId: string; level: EscalationLevel; reason: string; notes: string }) => Promise<void>;
  onRequestMonitoring?: (supervisorId: string) => Promise<void>;
  className?: string;
}

// Default supervisors data
const defaultSupervisors: Supervisor[] = [
  { id: 'sup_001', name: 'Jane Manager', status: 'AVAILABLE', currentCalls: 0 },
  { id: 'sup_002', name: 'Mike Lead', status: 'BUSY', currentCalls: 2 },
  { id: 'sup_003', name: 'Sarah Director', status: 'AVAILABLE', currentCalls: 1 },
  { id: 'sup_004', name: 'Tom Supervisor', status: 'OFFLINE', currentCalls: 0 },
];

const escalationReasons = [
  'Customer requested supervisor',
  'Complex issue requiring expertise',
  'Customer dissatisfaction',
  'Policy exception needed',
  'Technical issue beyond scope',
  'Compliance concern',
  'Other',
];

const levelConfig: Record<EscalationLevel, { label: string; color: string; bgColor: string; description: string }> = {
  P1: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100', description: 'Immediate attention required' },
  P2: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100', description: 'Urgent issue' },
  P3: { label: 'Medium', color: 'text-amber-700', bgColor: 'bg-amber-100', description: 'Standard escalation' },
  P4: { label: 'Low', color: 'text-blue-700', bgColor: 'bg-blue-100', description: 'Non-urgent' },
};

const statusConfig: Record<SupervisorStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  AVAILABLE: { label: 'Available', color: 'text-green-600', icon: UserCheck },
  BUSY: { label: 'Busy', color: 'text-amber-600', icon: Phone },
  OFFLINE: { label: 'Offline', color: 'text-gray-400', icon: UserX },
};

export const CallEscalationPanel: React.FC<CallEscalationPanelProps> = ({
  isCallActive = false,
  onEscalate,
  onRequestMonitoring,
  className = '',
}) => {
  const [supervisors] = useState<Supervisor[]>(defaultSupervisors);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [escalationLevel, setEscalationLevel] = useState<EscalationLevel>('P3');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [isRequestingMonitor, setIsRequestingMonitor] = useState(false);
  const [isBeingMonitored, setIsBeingMonitored] = useState(false);
  const [monitoringSupervisor, setMonitoringSupervisor] = useState<string | null>(null);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  const availableSupervisors = supervisors.filter((s) => s.status === 'AVAILABLE');

  const handleEscalate = async () => {
    if (!selectedSupervisor || !reason) return;

    setIsEscalating(true);
    try {
      await onEscalate?.({ supervisorId: selectedSupervisor, level: escalationLevel, reason, notes });
      // Reset form after successful escalation
      setSelectedSupervisor('');
      setReason('');
      setNotes('');
      setEscalationLevel('P3');
    } catch (error) {
      console.error('Escalation failed:', error);
    } finally {
      setIsEscalating(false);
    }
  };

  const handleRequestMonitoring = async (supervisorId: string) => {
    setIsRequestingMonitor(true);
    try {
      await onRequestMonitoring?.(supervisorId);
      setIsBeingMonitored(true);
      setMonitoringSupervisor(supervisors.find((s) => s.id === supervisorId)?.name || null);
    } catch (error) {
      console.error('Monitor request failed:', error);
    } finally {
      setIsRequestingMonitor(false);
    }
  };

  if (!isCallActive) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Escalation requires active call</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900">Escalation</h3>
          </div>
          {isBeingMonitored && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 rounded-full">
              <Eye className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Being Monitored</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Monitoring Status */}
        {isBeingMonitored && monitoringSupervisor && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                <strong>{monitoringSupervisor}</strong> is monitoring this call
              </span>
            </div>
          </div>
        )}

        {/* Available Supervisors */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Supervisors ({availableSupervisors.length} available)
          </h4>
          <div className="space-y-2">
            {supervisors.map((supervisor) => {
              const status = statusConfig[supervisor.status];
              const StatusIcon = status.icon;
              const isSelected = selectedSupervisor === supervisor.id;
              const isAvailable = supervisor.status === 'AVAILABLE';

              return (
                <div
                  key={supervisor.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    isSelected
                      ? 'border-violet-300 bg-violet-50'
                      : isAvailable
                      ? 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                  onClick={() => isAvailable && setSelectedSupervisor(supervisor.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {supervisor.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{supervisor.name}</p>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`w-3 h-3 ${status.color}`} />
                        <span className={`text-xs ${status.color}`}>{status.label}</span>
                        {supervisor.currentCalls > 0 && (
                          <span className="text-xs text-gray-400">
                            ({supervisor.currentCalls} calls)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAvailable && !isBeingMonitored && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestMonitoring(supervisor.id);
                        }}
                        disabled={isRequestingMonitor}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Request monitoring"
                      >
                        {isRequestingMonitor ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-violet-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Escalation Form */}
        {selectedSupervisor && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {/* Priority Level */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Priority Level
              </label>
              <div className="flex gap-2">
                {(Object.keys(levelConfig) as EscalationLevel[]).map((level) => {
                  const config = levelConfig[level];
                  return (
                    <button
                      key={level}
                      onClick={() => setEscalationLevel(level)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        escalationLevel === level
                          ? `${config.bgColor} ${config.color} border-transparent`
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {levelConfig[escalationLevel].description}
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Escalation Reason
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                  className="w-full px-3 py-2 text-sm text-left border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50"
                >
                  <span className={reason ? 'text-gray-900' : 'text-gray-400'}>
                    {reason || 'Select a reason...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showReasonDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    {escalationReasons.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setReason(r);
                          setShowReasonDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief context for the supervisor..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>

            {/* Escalate Button */}
            <button
              onClick={handleEscalate}
              disabled={!reason || isEscalating}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isEscalating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Escalating...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Escalate Call
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
