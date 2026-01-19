// ============================================================================
// Queue Management - Settings Drawer Component
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Bell, Monitor, Clock, BarChart3, Shield, Palette, Sliders } from 'lucide-react';

export interface QueueDashboardSettings {
  // Display Settings
  defaultView: 'overview' | 'queues' | 'agents';
  autoRefreshInterval: number; // seconds
  showKPIs: boolean;
  showAlerts: boolean;

  // Queue Display
  queueCardSize: 'compact' | 'standard' | 'detailed';
  showHealthScores: boolean;
  showSLAIndicator: boolean;
  showAgentCount: boolean;

  // Agent Display
  agentCardSize: 'compact' | 'standard';
  showAgentCapacity: boolean;
  showAgentStats: boolean;

  // Alert Settings
  alertThresholds: {
    slaBreachRate: number; // percentage
    blockageRate: number; // percentage
    lowAgentCount: number; // number of agents
    backlogSize: number; // number of pending tasks
  };
  enableNotifications: boolean;
  notificationSound: boolean;

  // Export Settings
  defaultExportFormat: 'CSV' | 'JSON' | 'EXCEL';
  includeTimestamp: boolean;

  // Performance Settings
  maxQueuesPerPage: number;
  maxAgentsPerPage: number;
}

interface QueueSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: QueueDashboardSettings) => void;
  currentSettings?: QueueDashboardSettings;
}

const DEFAULT_SETTINGS: QueueDashboardSettings = {
  defaultView: 'overview',
  autoRefreshInterval: 30,
  showKPIs: true,
  showAlerts: true,
  queueCardSize: 'standard',
  showHealthScores: true,
  showSLAIndicator: true,
  showAgentCount: true,
  agentCardSize: 'standard',
  showAgentCapacity: true,
  showAgentStats: true,
  alertThresholds: {
    slaBreachRate: 10,
    blockageRate: 20,
    lowAgentCount: 3,
    backlogSize: 50,
  },
  enableNotifications: true,
  notificationSound: false,
  defaultExportFormat: 'CSV',
  includeTimestamp: true,
  maxQueuesPerPage: 12,
  maxAgentsPerPage: 20,
};

export const QueueSettingsDrawer: React.FC<QueueSettingsDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings,
}) => {
  const [settings, setSettings] = useState<QueueDashboardSettings>(currentSettings || DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'display' | 'alerts' | 'performance' | 'export'>('display');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const handleChange = <K extends keyof QueueDashboardSettings>(key: K, value: QueueDashboardSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleAlertThresholdChange = <K extends keyof QueueDashboardSettings['alertThresholds']>(
    key: K,
    value: QueueDashboardSettings['alertThresholds'][K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      alertThresholds: { ...prev.alertThresholds, [key]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const tabs = [
    { id: 'display' as const, label: 'Display', icon: Monitor },
    { id: 'alerts' as const, label: 'Alerts', icon: Bell },
    { id: 'performance' as const, label: 'Performance', icon: Sliders },
    { id: 'export' as const, label: 'Export', icon: BarChart3 },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={() => hasChanges ? undefined : onClose()} />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dashboard Settings</h2>
              <p className="text-sm text-gray-500 mt-1">Customize your Queue Management Dashboard experience</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'display' && (
              <div className="space-y-6">
                {/* View Preferences */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    View Preferences
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default View
                      </label>
                      <select
                        value={settings.defaultView}
                        onChange={(e) => handleChange('defaultView', e.target.value as any)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                      >
                        <option value="overview">Overview</option>
                        <option value="queues">Queues</option>
                        <option value="agents">Agents</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-Refresh Interval
                      </label>
                      <select
                        value={settings.autoRefreshInterval}
                        onChange={(e) => handleChange('autoRefreshInterval', parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                      >
                        <option value="0">Disabled</option>
                        <option value="15">15 seconds</option>
                        <option value="30">30 seconds</option>
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        How often the dashboard automatically refreshes data
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Queue Card Settings */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Queue Card Display
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Size
                      </label>
                      <div className="flex gap-2">
                        {(['compact', 'standard', 'detailed'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => handleChange('queueCardSize', size)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                              settings.queueCardSize === size
                                ? 'bg-violet-100 border-violet-300 text-violet-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showHealthScores}
                          onChange={(e) => handleChange('showHealthScores', e.target.checked)}
                          className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Show health scores</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showSLAIndicator}
                          onChange={(e) => handleChange('showSLAIndicator', e.target.checked)}
                          className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Show SLA breach indicator</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showAgentCount}
                          onChange={(e) => handleChange('showAgentCount', e.target.checked)}
                          className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Show assigned agent count</span>
                      </label>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Agent Card Settings */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Agent Card Display
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Size
                      </label>
                      <div className="flex gap-2">
                        {(['compact', 'standard'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => handleChange('agentCardSize', size)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                              settings.agentCardSize === size
                                ? 'bg-violet-100 border-violet-300 text-violet-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showAgentCapacity}
                          onChange={(e) => handleChange('showAgentCapacity', e.target.checked)}
                          className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Show capacity indicator</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showAgentStats}
                          onChange={(e) => handleChange('showAgentStats', e.target.checked)}
                          className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">Show performance stats</span>
                      </label>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Visibility Settings */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Visibility
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.showKPIs}
                        onChange={(e) => handleChange('showKPIs', e.target.checked)}
                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                      />
                      <span className="text-sm text-gray-700">Show KPI summary cards</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.showAlerts}
                        onChange={(e) => handleChange('showAlerts', e.target.checked)}
                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                      />
                      <span className="text-sm text-gray-700">Show alerts banner</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">Alert Thresholds</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Configure when alerts are triggered based on these metrics
                      </p>
                    </div>
                  </div>
                </div>

                {/* SLA Breach Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SLA Breach Rate Threshold
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={settings.alertThresholds.slaBreachRate}
                      onChange={(e) => handleAlertThresholdChange('slaBreachRate', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-900 min-w-[50px]">
                      {settings.alertThresholds.slaBreachRate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when SLA breach rate exceeds this percentage
                  </p>
                </div>

                {/* Blockage Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blockage Rate Threshold
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.alertThresholds.blockageRate}
                      onChange={(e) => handleAlertThresholdChange('blockageRate', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-900 min-w-[50px]">
                      {settings.alertThresholds.blockageRate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when blocked tasks exceed this percentage
                  </p>
                </div>

                {/* Low Agent Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Agent Count Threshold
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.alertThresholds.lowAgentCount}
                      onChange={(e) => handleAlertThresholdChange('lowAgentCount', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-900 min-w-[50px]">
                      {settings.alertThresholds.lowAgentCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when active queue has fewer than this many agents
                  </p>
                </div>

                {/* Backlog Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backlog Size Threshold
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={settings.alertThresholds.backlogSize}
                      onChange={(e) => handleAlertThresholdChange('backlogSize', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-900 min-w-[50px]">
                      {settings.alertThresholds.backlogSize}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when pending tasks exceed this number
                  </p>
                </div>

                <hr className="border-gray-200" />

                {/* Notification Settings */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Notifications
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.enableNotifications}
                        onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                      />
                      <span className="text-sm text-gray-700">Enable browser notifications</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.notificationSound}
                        onChange={(e) => handleChange('notificationSound', e.target.checked)}
                        disabled={!settings.enableNotifications}
                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700">Play sound on new alerts</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                {/* Pagination Settings */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Pagination
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Queues Per Page
                      </label>
                      <select
                        value={settings.maxQueuesPerPage}
                        onChange={(e) => handleChange('maxQueuesPerPage', parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                      >
                        <option value="6">6 queues</option>
                        <option value="12">12 queues</option>
                        <option value="24">24 queues</option>
                        <option value="48">48 queues</option>
                        <option value="96">96 queues</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Agents Per Page
                      </label>
                      <select
                        value={settings.maxAgentsPerPage}
                        onChange={(e) => handleChange('maxAgentsPerPage', parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                      >
                        <option value="10">10 agents</option>
                        <option value="20">20 agents</option>
                        <option value="50">50 agents</option>
                        <option value="100">100 agents</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-yellow-100 rounded-lg">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-900">Performance Note</h4>
                      <p className="text-xs text-yellow-700 mt-1">
                        Higher page counts may impact performance. Adjust based on your needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-green-900">Export Settings</h4>
                      <p className="text-xs text-green-700 mt-1">
                        Configure default export behavior for queues and agents
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Export Format
                  </label>
                  <select
                    value={settings.defaultExportFormat}
                    onChange={(e) => handleChange('defaultExportFormat', e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="CSV">CSV (Comma Separated Values)</option>
                    <option value="JSON">JSON (JavaScript Object Notation)</option>
                    <option value="EXCEL">Excel (.xlsx)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Default format when exporting queue/agent data
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.includeTimestamp}
                      onChange={(e) => handleChange('includeTimestamp', e.target.checked)}
                      className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-700">Include timestamp in exports</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-3 ml-7">
                    Adds export timestamp to filename and data
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset to Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
