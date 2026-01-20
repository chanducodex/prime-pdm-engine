// ============================================================================
// API Documentation Drawer
// Right-side drawer showing comprehensive API documentation with tables
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Phone,
  User,
  MessageSquare,
  Sparkles,
  FileText,
  Zap,
  Signal,
  Heart,
  BookOpen,
  Mic,
  AlertTriangle,
  BarChart2,
  Book,
  Calendar,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  API_ENDPOINTS,
  API_CATEGORIES,
  getEndpointsByCategory,
  searchEndpoints,
  type APIEndpoint,
  type APICategory,
  type PayloadField,
} from '@/lib/api-documentation-data';

interface APIDocumentationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone,
  Search,
  MessageSquare,
  Sparkles,
  FileText,
  Zap,
  User,
  Signal,
  Heart,
  BookOpen,
  Mic,
  AlertTriangle,
  BarChart2,
  Book,
  Calendar,
  Layers,
};

// Method badge colors
const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 border-green-200',
  POST: 'bg-blue-100 text-blue-700 border-blue-200',
  PUT: 'bg-amber-100 text-amber-700 border-amber-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-200',
};

export const APIDocumentationDrawer: React.FC<APIDocumentationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<APICategory | 'ALL'>('ALL');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter endpoints based on search and category
  const filteredEndpoints = useMemo(() => {
    let endpoints = searchQuery
      ? searchEndpoints(searchQuery)
      : activeCategory === 'ALL'
      ? API_ENDPOINTS
      : getEndpointsByCategory(activeCategory);

    return endpoints;
  }, [searchQuery, activeCategory]);

  // Group endpoints by category for display
  const groupedEndpoints = useMemo(() => {
    const groups: Record<string, APIEndpoint[]> = {};
    filteredEndpoints.forEach((endpoint) => {
      if (!groups[endpoint.category]) {
        groups[endpoint.category] = [];
      }
      groups[endpoint.category].push(endpoint);
    });
    return groups;
  }, [filteredEndpoints]);

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-4xl bg-white shadow-xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Book className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">API Documentation</h2>
                <p className="text-sm text-gray-500">
                  {API_ENDPOINTS.length} endpoints across {API_CATEGORIES.length} categories
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search APIs by name, path, or description..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Category Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeCategory === 'ALL'
                  ? 'bg-violet-100 text-violet-700 border border-violet-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All ({API_ENDPOINTS.length})
            </button>
            {API_CATEGORIES.map((category) => {
              const Icon = categoryIcons[category.icon] || FileText;
              const count = getEndpointsByCategory(category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-violet-100 text-violet-700 border border-violet-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {category.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {Object.keys(groupedEndpoints).length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No APIs found matching your search</p>
              </div>
            ) : (
              Object.entries(groupedEndpoints).map(([categoryId, endpoints]) => {
                const category = API_CATEGORIES.find((c) => c.id === categoryId);
                const Icon = category ? categoryIcons[category.icon] || FileText : FileText;

                return (
                  <div key={categoryId} className="mb-8">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        {category?.label || categoryId}
                      </h3>
                      <span className="text-xs text-gray-500">({endpoints.length} endpoints)</span>
                    </div>
                    {category && (
                      <p className="text-sm text-gray-500 mb-4 ml-8">{category.description}</p>
                    )}

                    {/* Endpoints */}
                    <div className="space-y-3">
                      {endpoints.map((endpoint) => (
                        <EndpointCard
                          key={endpoint.id}
                          endpoint={endpoint}
                          isExpanded={expandedEndpoints.has(endpoint.id)}
                          onToggle={() => toggleEndpoint(endpoint.id)}
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>API Version: v1.0</span>
            <span>Last Updated: January 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Endpoint Card Component
interface EndpointCardProps {
  endpoint: APIEndpoint;
  isExpanded: boolean;
  onToggle: () => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

const EndpointCard: React.FC<EndpointCardProps> = ({
  endpoint,
  isExpanded,
  onToggle,
  copiedId,
  onCopy,
}) => {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded border ${
            methodColors[endpoint.method]
          }`}
        >
          {endpoint.method}
        </span>
        <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
        <span className="text-sm text-gray-500 truncate flex-1 text-left">{endpoint.name}</span>
        {endpoint.authRequired && (
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">Auth</span>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Description */}
          <p className="text-sm text-gray-600 mt-3 mb-4">{endpoint.description}</p>

          {/* Rate Limit */}
          {endpoint.rateLimit && (
            <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
              <span className="text-xs font-medium text-amber-700">Rate Limit: </span>
              <span className="text-xs text-amber-600">{endpoint.rateLimit}</span>
            </div>
          )}

          {/* Request Payload Table */}
          {endpoint.requestPayload && endpoint.requestPayload.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Request Payload
              </h4>
              <PayloadTable fields={endpoint.requestPayload} />
            </div>
          )}

          {/* Response Payload Table */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Response Payload
            </h4>
            <PayloadTable fields={endpoint.responsePayload} />
          </div>

          {/* Example Request */}
          {endpoint.exampleRequest && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Example Request
                </h4>
                <button
                  onClick={() => onCopy(endpoint.exampleRequest!, `req-${endpoint.id}`)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  {copiedId === `req-${endpoint.id}` ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-gray-900 text-gray-100 text-xs rounded-lg overflow-x-auto">
                <code>{endpoint.exampleRequest}</code>
              </pre>
            </div>
          )}

          {/* Example Response */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Example Response
              </h4>
              <button
                onClick={() => onCopy(endpoint.exampleResponse, `res-${endpoint.id}`)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                {copiedId === `res-${endpoint.id}` ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-gray-900 text-gray-100 text-xs rounded-lg overflow-x-auto">
              <code>{endpoint.exampleResponse}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Payload Table Component
interface PayloadTableProps {
  fields: PayloadField[];
}

const PayloadTable: React.FC<PayloadTableProps> = ({ fields }) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Field</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Type</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Required</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {fields.map((field, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <code className="text-violet-600 font-mono">{field.field}</code>
              </td>
              <td className="px-3 py-2">
                <span className="text-gray-600">{field.type}</span>
              </td>
              <td className="px-3 py-2">
                {field.required ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded">
                    Yes
                  </span>
                ) : (
                  <span className="text-gray-400">No</span>
                )}
              </td>
              <td className="px-3 py-2 text-gray-600 max-w-xs">
                {field.description}
                {field.example && (
                  <span className="block text-gray-400 mt-0.5">
                    Example: <code className="text-gray-500">{field.example}</code>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
