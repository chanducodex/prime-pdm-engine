// ============================================================================
// Quick Scripts Panel
// Pre-defined response templates and canned responses
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Star,
  Sparkles,
  MessageSquare,
  Shield,
  CheckCircle,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type ScriptCategory = 'GREETING' | 'COMPLIANCE' | 'VERIFICATION' | 'PROBLEM' | 'CLOSING' | 'ESCALATION';

export interface Script {
  scriptId: string;
  category: ScriptCategory;
  title: string;
  content: string;
  variables: string[];
  shortcut?: string;
  isFavorite: boolean;
  usageCount: number;
}

interface QuickScriptsPanelProps {
  scripts?: Script[];
  onUseScript?: (script: Script) => void;
  onToggleFavorite?: (scriptId: string) => void;
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// Default scripts data
const defaultScripts: Script[] = [
  {
    scriptId: 'script_001',
    category: 'GREETING',
    title: 'Standard Greeting',
    content: 'Good {timeOfDay}, thank you for calling. My name is {agentName}. How may I assist you today?',
    variables: ['timeOfDay', 'agentName'],
    shortcut: 'Ctrl+1',
    isFavorite: true,
    usageCount: 150,
  },
  {
    scriptId: 'script_002',
    category: 'GREETING',
    title: 'Return Caller Greeting',
    content: 'Welcome back! I can see you\'ve called before. Let me pull up your information. How can I help you today?',
    variables: [],
    shortcut: 'Ctrl+2',
    isFavorite: false,
    usageCount: 45,
  },
  {
    scriptId: 'script_003',
    category: 'COMPLIANCE',
    title: 'Recording Disclosure',
    content: 'This call may be recorded for quality assurance and training purposes. Do you consent to continue with the call being recorded?',
    variables: [],
    shortcut: 'Ctrl+3',
    isFavorite: true,
    usageCount: 200,
  },
  {
    scriptId: 'script_004',
    category: 'COMPLIANCE',
    title: 'HIPAA Acknowledgment',
    content: 'Before we proceed, I need to remind you that we handle all information in compliance with HIPAA regulations. Your privacy is protected.',
    variables: [],
    isFavorite: false,
    usageCount: 120,
  },
  {
    scriptId: 'script_005',
    category: 'VERIFICATION',
    title: 'Identity Verification',
    content: 'For security purposes, could you please verify your identity by providing your date of birth and the last four digits of your NPI number?',
    variables: [],
    shortcut: 'Ctrl+4',
    isFavorite: true,
    usageCount: 180,
  },
  {
    scriptId: 'script_006',
    category: 'VERIFICATION',
    title: 'Callback Number Verification',
    content: 'I have your callback number as {phoneNumber}. Is this still the best number to reach you?',
    variables: ['phoneNumber'],
    isFavorite: false,
    usageCount: 90,
  },
  {
    scriptId: 'script_007',
    category: 'PROBLEM',
    title: 'Credential Renewal Help',
    content: 'I understand you need help with your credential renewal. Let me check your current status and walk you through the process step by step.',
    variables: [],
    isFavorite: true,
    usageCount: 75,
  },
  {
    scriptId: 'script_008',
    category: 'PROBLEM',
    title: 'Technical Issue',
    content: 'I\'m sorry to hear you\'re experiencing technical difficulties. Let me troubleshoot this with you. Can you describe exactly what happens when you try to {action}?',
    variables: ['action'],
    isFavorite: false,
    usageCount: 60,
  },
  {
    scriptId: 'script_009',
    category: 'CLOSING',
    title: 'Standard Closing',
    content: 'Is there anything else I can help you with today? Thank you for calling, and have a great {timeOfDay}!',
    variables: ['timeOfDay'],
    shortcut: 'Ctrl+5',
    isFavorite: true,
    usageCount: 160,
  },
  {
    scriptId: 'script_010',
    category: 'CLOSING',
    title: 'Follow-up Closing',
    content: 'I\'ve created a follow-up task for this issue. You should receive an update within {timeframe}. Is there anything else I can assist with?',
    variables: ['timeframe'],
    isFavorite: false,
    usageCount: 55,
  },
  {
    scriptId: 'script_011',
    category: 'ESCALATION',
    title: 'Supervisor Transfer',
    content: 'I understand your concern and want to make sure we resolve this properly. Let me connect you with my supervisor who can better assist you with this matter.',
    variables: [],
    isFavorite: false,
    usageCount: 30,
  },
  {
    scriptId: 'script_012',
    category: 'ESCALATION',
    title: 'Hold for Research',
    content: 'I need to research this further to give you accurate information. May I place you on a brief hold while I look into this? It should take about {duration}.',
    variables: ['duration'],
    isFavorite: false,
    usageCount: 85,
  },
];

const categoryConfig: Record<ScriptCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  GREETING: { label: 'Greeting', icon: MessageSquare, color: 'text-blue-600 bg-blue-100' },
  COMPLIANCE: { label: 'Compliance', icon: Shield, color: 'text-purple-600 bg-purple-100' },
  VERIFICATION: { label: 'Verification', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  PROBLEM: { label: 'Problem', icon: HelpCircle, color: 'text-amber-600 bg-amber-100' },
  CLOSING: { label: 'Closing', icon: Check, color: 'text-gray-600 bg-gray-100' },
  ESCALATION: { label: 'Escalation', icon: Sparkles, color: 'text-red-600 bg-red-100' },
};

export const QuickScriptsPanel: React.FC<QuickScriptsPanelProps> = ({
  scripts: propScripts,
  onUseScript,
  onToggleFavorite,
  className = '',
  isExpanded: controlledExpanded,
  onToggleExpand,
}) => {
  const [scripts, setScripts] = useState<Script[]>(propScripts || defaultScripts);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ScriptCategory | 'ALL' | 'FAVORITES'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [internalExpanded, setInternalExpanded] = useState(true);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggleExpand = onToggleExpand || (() => setInternalExpanded(!internalExpanded));

  // Filter scripts
  const filteredScripts = useMemo(() => {
    let result = scripts;

    // Filter by category
    if (activeCategory === 'FAVORITES') {
      result = result.filter((s) => s.isFavorite);
    } else if (activeCategory !== 'ALL') {
      result = result.filter((s) => s.category === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.content.toLowerCase().includes(query)
      );
    }

    return result;
  }, [scripts, activeCategory, searchQuery]);

  const handleCopyScript = async (script: Script) => {
    try {
      // Replace variables with placeholders for now
      let content = script.content;
      script.variables.forEach((v) => {
        content = content.replace(`{${v}}`, `[${v}]`);
      });

      await navigator.clipboard.writeText(content);
      setCopiedId(script.scriptId);
      setTimeout(() => setCopiedId(null), 2000);

      onUseScript?.(script);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleToggleFavorite = (scriptId: string) => {
    setScripts((prev) =>
      prev.map((s) =>
        s.scriptId === scriptId ? { ...s, isFavorite: !s.isFavorite } : s
      )
    );
    onToggleFavorite?.(scriptId);
  };

  const favoriteCount = scripts.filter((s) => s.isFavorite).length;

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-gray-900">Quick Scripts</h3>
            <span className="text-xs text-gray-400">({filteredScripts.length})</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Search and Filters */}
          <div className="px-4 py-3 border-b border-gray-100 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scripts..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'ALL'
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategory('FAVORITES')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === 'FAVORITES'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className="w-3 h-3" />
                Favorites ({favoriteCount})
              </button>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key as ScriptCategory)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    activeCategory === key
                      ? config.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scripts List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredScripts.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No scripts found</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {filteredScripts.map((script) => {
                  const categoryConf = categoryConfig[script.category];
                  const CategoryIcon = categoryConf.icon;

                  return (
                    <div
                      key={script.scriptId}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      {/* Script Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`p-1 rounded ${categoryConf.color.split(' ')[1]}`}>
                            <CategoryIcon className={`w-3 h-3 ${categoryConf.color.split(' ')[0]}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {script.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {script.shortcut && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded font-mono">
                              {script.shortcut}
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleFavorite(script.scriptId)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                script.isFavorite
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Script Content */}
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{script.content}</p>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Used {script.usageCount} times
                        </span>
                        <button
                          onClick={() => handleCopyScript(script)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            copiedId === script.scriptId
                              ? 'bg-green-100 text-green-700'
                              : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                          }`}
                        >
                          {copiedId === script.scriptId ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Use Script
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
