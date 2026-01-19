'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Circle, Phone, Coffee, Moon, LogOut } from 'lucide-react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';
import type { AgentStatus } from '@/lib/outreach-queue-types';

interface AgentStatusWidgetProps {
  className?: string;
}

type StatusValue = AgentStatus['status'];

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
  icon: typeof Circle;
  description: string;
}

const statusConfigs: Record<StatusValue, StatusConfig> = {
  ONLINE: {
    label: 'Online',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    dotColor: 'bg-green-500',
    icon: Circle,
    description: 'Available for calls',
  },
  ON_CALL: {
    label: 'On Call',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    dotColor: 'bg-blue-500',
    icon: Phone,
    description: 'Currently on a call',
  },
  AWAY: {
    label: 'Away',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    dotColor: 'bg-amber-500',
    icon: Moon,
    description: 'Temporarily unavailable',
  },
  ON_BREAK: {
    label: 'On Break',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    dotColor: 'bg-orange-500',
    icon: Coffee,
    description: 'Taking a break',
  },
  OFFLINE: {
    label: 'Offline',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    dotColor: 'bg-gray-400',
    icon: LogOut,
    description: 'Not available',
  },
};

const statusOrder: StatusValue[] = ['ONLINE', 'AWAY', 'ON_BREAK', 'OFFLINE'];

export function AgentStatusWidget({ className = '' }: AgentStatusWidgetProps) {
  const { state, setAgentStatus } = useAgentCall();
  const { agentStatus, activeCall } = state;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = statusConfigs[agentStatus];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Disable status change if on a call
  const canChangeStatus = !activeCall || activeCall.state === 'IDLE' || activeCall.state === 'ENDED';

  const handleStatusChange = (newStatus: StatusValue) => {
    if (canChangeStatus) {
      setAgentStatus(newStatus);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Status Button */}
      <button
        onClick={() => canChangeStatus && setIsOpen(!isOpen)}
        disabled={!canChangeStatus}
        className={`
          flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl
          ${currentConfig.bgColor} ${currentConfig.color}
          transition-all duration-200
          ${canChangeStatus ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed opacity-75'}
          focus:outline-none focus:ring-2 focus:ring-violet-500
        `}
      >
        {/* Status Dot */}
        <div className="relative">
          <span
            className={`
              block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${currentConfig.dotColor}
              ${agentStatus === 'ON_CALL' ? 'animate-pulse' : ''}
            `}
          />
          {agentStatus === 'ON_CALL' && (
            <span
              className={`
                absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${currentConfig.dotColor}
                animate-ping opacity-50
              `}
            />
          )}
        </div>

        {/* Status Info */}
        <div className="flex flex-col items-start">
          <span className="text-xs sm:text-sm font-medium">{currentConfig.label}</span>
          <span className="text-[10px] sm:text-xs opacity-75 sm:block hidden">{currentConfig.description}</span>
        </div>

        {/* Dropdown Arrow */}
        {canChangeStatus && (
          <ChevronDown
            className={`
              w-3.5 h-3.5 sm:w-4 sm:h-4 ml-auto transition-transform duration-200
              ${isOpen ? 'rotate-180' : ''}
            `}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && canChangeStatus && (
        <div
          className="
            absolute top-full right-0 sm:left-0 sm:right-auto mt-2 z-50
            bg-white rounded-xl border border-gray-200 shadow-lg
            overflow-hidden min-w-[180px]
          "
        >
          {statusOrder.map((status) => {
            const config = statusConfigs[status];
            const isActive = status === agentStatus;

            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`
                  w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3
                  transition-colors text-left
                  ${isActive ? config.bgColor : 'hover:bg-gray-50'}
                `}
              >
                <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${config.dotColor}`} />
                <div className="flex-1">
                  <span className={`text-xs sm:text-sm font-medium ${isActive ? config.color : 'text-gray-900'}`}>
                    {config.label}
                  </span>
                  <span className="block text-[10px] sm:text-xs text-gray-500">{config.description}</span>
                </div>
                {isActive && (
                  <span className="text-[10px] sm:text-xs font-medium text-violet-600">Current</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AgentStatusBadge({ className = '' }: { className?: string }) {
  const { state } = useAgentCall();
  const config = statusConfigs[state.agentStatus];

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        ${config.bgColor} ${config.color}
        ${className}
      `}
    >
      <span
        className={`
          w-2 h-2 rounded-full ${config.dotColor}
          ${state.agentStatus === 'ON_CALL' ? 'animate-pulse' : ''}
        `}
      />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}

export default AgentStatusWidget;
