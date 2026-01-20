// ============================================================================
// Knowledge Base Panel
// Quick access to KB articles with AI-powered suggestions
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Book,
  Search,
  ExternalLink,
  Star,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  FileText,
} from 'lucide-react';

export interface KBArticle {
  articleId: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  relevanceScore?: number;
  lastUpdated: string;
  viewCount: number;
}

interface KnowledgeBasePanelProps {
  isCallActive?: boolean;
  callContext?: string;
  onArticleView?: (articleId: string) => void;
  className?: string;
}

// Mock KB articles
const mockArticles: KBArticle[] = [
  {
    articleId: 'kb_001',
    title: 'Credential Renewal Process Guide',
    summary: 'Step-by-step guide for renewing provider credentials including required documents and timelines.',
    content: 'Full article content about credential renewal process...',
    category: 'Credentials',
    tags: ['credentials', 'renewal', 'documentation'],
    lastUpdated: '2024-01-10T00:00:00Z',
    viewCount: 1250,
  },
  {
    articleId: 'kb_002',
    title: 'NPI Verification Procedures',
    summary: 'How to verify NPI numbers and handle common verification issues.',
    content: 'Full article content about NPI verification...',
    category: 'Verification',
    tags: ['npi', 'verification', 'identity'],
    lastUpdated: '2024-01-08T00:00:00Z',
    viewCount: 890,
  },
  {
    articleId: 'kb_003',
    title: 'Handling Address Change Requests',
    summary: 'Process for updating provider practice addresses and required documentation.',
    content: 'Full article content about address changes...',
    category: 'Updates',
    tags: ['address', 'update', 'practice'],
    lastUpdated: '2024-01-12T00:00:00Z',
    viewCount: 650,
  },
  {
    articleId: 'kb_004',
    title: 'Malpractice Insurance Requirements',
    summary: 'Overview of malpractice insurance requirements and verification process.',
    content: 'Full article content about malpractice insurance...',
    category: 'Insurance',
    tags: ['malpractice', 'insurance', 'compliance'],
    lastUpdated: '2024-01-05T00:00:00Z',
    viewCount: 520,
  },
  {
    articleId: 'kb_005',
    title: 'License Verification Guide',
    summary: 'How to verify state medical licenses and handle multi-state practitioners.',
    content: 'Full article content about license verification...',
    category: 'Licenses',
    tags: ['license', 'verification', 'state'],
    lastUpdated: '2024-01-11T00:00:00Z',
    viewCount: 780,
  },
  {
    articleId: 'kb_006',
    title: 'Common Call Resolution Scripts',
    summary: 'Pre-approved scripts for common call scenarios and resolutions.',
    content: 'Full article content about resolution scripts...',
    category: 'Scripts',
    tags: ['scripts', 'resolution', 'common'],
    lastUpdated: '2024-01-09T00:00:00Z',
    viewCount: 1100,
  },
];

export const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = ({
  isCallActive = false,
  callContext,
  onArticleView,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'suggested' | 'recent' | 'search'>('suggested');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestedArticles, setSuggestedArticles] = useState<KBArticle[]>([]);

  // Generate AI-suggested articles based on call context
  useEffect(() => {
    if (isCallActive) {
      // Simulate AI suggesting relevant articles
      const suggested = mockArticles
        .map((article) => ({
          ...article,
          relevanceScore: Math.random() * 0.4 + 0.6, // 0.6-1.0
        }))
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 3);
      setSuggestedArticles(suggested);
    } else {
      setSuggestedArticles([]);
    }
  }, [isCallActive, callContext]);

  // Filter articles for search
  const filteredArticles = useMemo(() => {
    if (!searchQuery) return mockArticles;
    const query = searchQuery.toLowerCase();
    return mockArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Recent articles (sorted by view count for demo)
  const recentArticles = useMemo(() => {
    return [...mockArticles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 4);
  }, []);

  const handleCopyContent = async (article: KBArticle) => {
    try {
      await navigator.clipboard.writeText(article.summary);
      setCopiedId(article.articleId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleViewArticle = (article: KBArticle) => {
    setSelectedArticle(article);
    onArticleView?.(article.articleId);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-900">Knowledge Base</h3>
            {isCallActive && suggestedArticles.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                {suggestedArticles.length} suggested
              </span>
            )}
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
          {/* Article Detail View */}
          {selectedArticle ? (
            <div className="p-4">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3"
              >
                <X className="w-3 h-3" />
                Close article
              </button>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{selectedArticle.title}</h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-gray-400">
                  Updated {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{selectedArticle.summary}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyContent(selectedArticle)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    copiedId === selectedArticle.articleId
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copiedId === selectedArticle.articleId ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Summary
                    </>
                  )}
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full Article
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value) setActiveTab('search');
                    }}
                    placeholder="Search knowledge base..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-3">
                  {isCallActive && (
                    <button
                      onClick={() => setActiveTab('suggested')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                        activeTab === 'suggested'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Suggested
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('recent')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                      activeTab === 'recent'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    Popular
                  </button>
                  {searchQuery && (
                    <button
                      onClick={() => setActiveTab('search')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                        activeTab === 'search'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Search className="w-3 h-3" />
                      Results ({filteredArticles.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Articles List */}
              <div className="max-h-64 overflow-y-auto">
                {activeTab === 'suggested' && isCallActive ? (
                  suggestedArticles.length > 0 ? (
                    <ArticleList
                      articles={suggestedArticles}
                      onView={handleViewArticle}
                      onCopy={handleCopyContent}
                      copiedId={copiedId}
                      showRelevance
                    />
                  ) : (
                    <EmptyState message="No suggestions for current call" />
                  )
                ) : activeTab === 'search' && searchQuery ? (
                  filteredArticles.length > 0 ? (
                    <ArticleList
                      articles={filteredArticles}
                      onView={handleViewArticle}
                      onCopy={handleCopyContent}
                      copiedId={copiedId}
                    />
                  ) : (
                    <EmptyState message="No articles found" />
                  )
                ) : (
                  <ArticleList
                    articles={recentArticles}
                    onView={handleViewArticle}
                    onCopy={handleCopyContent}
                    copiedId={copiedId}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

// Article List Component
interface ArticleListProps {
  articles: KBArticle[];
  onView: (article: KBArticle) => void;
  onCopy: (article: KBArticle) => void;
  copiedId: string | null;
  showRelevance?: boolean;
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onView,
  onCopy,
  copiedId,
  showRelevance,
}) => {
  return (
    <div className="p-3 space-y-2">
      {articles.map((article) => (
        <div
          key={article.articleId}
          className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 truncate">{article.title}</span>
            </div>
            {showRelevance && article.relevanceScore && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 rounded">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">
                  {Math.round(article.relevanceScore * 100)}%
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{article.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {article.category}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onCopy(article)}
                className={`p-1.5 rounded transition-colors ${
                  copiedId === article.articleId
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Copy summary"
              >
                {copiedId === article.articleId ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => onView(article)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="View article"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="py-8 text-center">
    <Book className="w-8 h-8 text-gray-300 mx-auto mb-2" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);
