// ============================================================================
// Callback Scheduler Panel
// Enhanced callback scheduling with calendar view
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  Bell,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export type CallbackPriority = 'NORMAL' | 'HIGH' | 'URGENT';

export interface CallbackSchedule {
  callbackId: string;
  scheduledAt: string;
  timezone: string;
  phoneNumber: string;
  providerId?: string;
  providerName?: string;
  reason: string;
  priority: CallbackPriority;
  reminderEnabled: boolean;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
}

interface CallbackSchedulerPanelProps {
  phoneNumber?: string;
  providerId?: string;
  providerName?: string;
  onSchedule?: (callback: Omit<CallbackSchedule, 'callbackId' | 'status'>) => Promise<void>;
  onCancel?: (callbackId: string) => Promise<void>;
  existingCallbacks?: CallbackSchedule[];
  className?: string;
}

const priorityConfig: Record<CallbackPriority, { label: string; color: string; bgColor: string }> = {
  NORMAL: { label: 'Normal', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  HIGH: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  URGENT: { label: 'Urgent', color: 'text-red-700', bgColor: 'bg-red-100' },
};

// Generate time slots
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 8; h <= 17; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export const CallbackSchedulerPanel: React.FC<CallbackSchedulerPanelProps> = ({
  phoneNumber = '',
  providerId,
  providerName,
  onSchedule,
  onCancel,
  existingCallbacks = [],
  className = '',
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<CallbackPriority>('NORMAL');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [phone, setPhone] = useState(phoneNumber);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'schedule' | 'list'>('schedule');

  // Get days for mini calendar
  const calendarDays = useMemo(() => {
    const today = new Date();
    const days: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  // Check if a slot is available (simple mock)
  const isSlotAvailable = (date: Date, time: string): boolean => {
    const slotDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotDate.setHours(hours, minutes, 0, 0);

    // Check against existing callbacks
    return !existingCallbacks.some((cb) => {
      const cbDate = new Date(cb.scheduledAt);
      return cbDate.getTime() === slotDate.getTime() && cb.status === 'SCHEDULED';
    });
  };

  const handleSchedule = async () => {
    if (!selectedTime || !phone || !reason) return;

    setIsScheduling(true);
    try {
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      scheduledAt.setHours(hours, minutes, 0, 0);

      await onSchedule?.({
        scheduledAt: scheduledAt.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        phoneNumber: phone,
        providerId,
        providerName,
        reason,
        priority,
        reminderEnabled,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedTime('');
        setReason('');
        setPriority('NORMAL');
      }, 2000);
    } catch (error) {
      console.error('Failed to schedule callback:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const scheduledCallbacks = existingCallbacks.filter((cb) => cb.status === 'SCHEDULED');

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-gray-900">Schedule Callback</h3>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('schedule')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                viewMode === 'schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Pending ({scheduledCallbacks.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {showSuccess ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Callback Scheduled!</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(selectedDate)} at {selectedTime}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          // Callbacks List View
          <div className="space-y-3">
            {scheduledCallbacks.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending callbacks</p>
              </div>
            ) : (
              scheduledCallbacks.map((callback) => {
                const cbDate = new Date(callback.scheduledAt);
                const priorityConf = priorityConfig[callback.priority];

                return (
                  <div
                    key={callback.callbackId}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {callback.providerName || callback.phoneNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(cbDate)} at{' '}
                            {cbDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{callback.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 text-xs font-medium rounded ${priorityConf.bgColor} ${priorityConf.color}`}
                        >
                          {priorityConf.label}
                        </span>
                        <button
                          onClick={() => onCancel?.(callback.callbackId)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Cancel callback"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          // Schedule View
          <div className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Select Date
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {calendarDays.slice(0, 7).map((date) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 w-14 p-2 rounded-lg border text-center transition-colors ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-xs text-gray-500">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className={`block text-sm font-semibold ${isSelected ? 'text-teal-700' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </span>
                      {isToday && (
                        <span className="block text-xs text-teal-600">Today</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Select Time
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {TIME_SLOTS.map((time) => {
                  const available = isSlotAvailable(selectedDate, time);
                  const isSelected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      onClick={() => available && setSelectedTime(time)}
                      disabled={!available}
                      className={`px-2 py-1.5 text-xs font-medium rounded border transition-colors ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : available
                          ? 'border-gray-200 text-gray-700 hover:border-gray-300'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Reason for Callback
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Follow up on credential renewal"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Priority
              </label>
              <div className="flex gap-2">
                {(Object.keys(priorityConfig) as CallbackPriority[]).map((p) => {
                  const config = priorityConfig[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        priority === p
                          ? `${config.bgColor} ${config.color} border-transparent`
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reminder Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">Reminder before callback</span>
              </div>
              <button
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  reminderEnabled ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                    reminderEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Schedule Button */}
            <button
              onClick={handleSchedule}
              disabled={!selectedTime || !phone || !reason || isScheduling}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Schedule Callback
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
