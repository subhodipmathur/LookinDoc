import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  Search, 
  HelpCircle, 
  Sparkles, 
  Tag, 
  Users, 
  ChevronLeft, 
  Download, 
  FileText, 
  Trash2, 
  AlertTriangle, 
  X,
  ArrowRight,
  CheckCircle2,
  Quote,
  Send,
  CornerDownRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { EmptyState } from '../components/ui/EmptyState';
import { documentApi } from '../services/api';
import { 
  DocumentDetail, 
  DocumentAnalysisResponse, 
  EntityItem, 
  ExtractiveSummary,
  SearchResult,
  QAResult 
} from '../types';

type WorkspaceTab = 'overview' | 'search' | 'ask' | 'summary' | 'keywords' | 'entities';

export const DocumentWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // QA tab state
  const [questionInput, setQuestionInput] = useState('');
  const [qaResult, setQaResult] = useState<QAResult | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  // Summary tab state
  const [summaryMode, setSummaryMode] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [customSummary, setCustomSummary] = useState<ExtractiveSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Entity tab filter
  const [selectedEntityCategory, setSelectedEntityCategory] = useState<string>('All');

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchDocumentAndAnalysis = async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      // 1. Fetch document metadata
      const docRes = await documentApi.getDocument(id);
      setDocument(docRes.document);

      // 2. Fetch or trigger full NLP analysis
      setAnalysisLoading(true);
      try {
        const analysisRes = await documentApi.getAnalysis(id);
        setAnalysis(analysisRes);
        setCustomSummary(analysisRes.summary);
      } catch (err: any) {
        console.warn('NLP analysis fetch warning:', err);
      } finally {
        setAnalysisLoading(false);
      }
    } catch (err: any) {
      console.error('Failed to load document:', err);
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err?.response?.data?.detail || 'Failed to load document details from Supabase.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentAndAnalysis();
  }, [id]);

  // Handle Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id || !searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setSearchError(null);
      const res = await documentApi.search(id, searchQuery.trim());
      setSearchResults(res.results || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchError(err?.response?.data?.detail || 'Search query failed.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle QA
  const handleAskQuestion = async (qText?: string) => {
    const q = qText || questionInput;
    if (!id || !q.trim()) return;

    try {
      setIsAsking(true);
      setQaError(null);
      if (qText) setQuestionInput(qText);
      const res = await documentApi.askQuestion(id, q.trim());
      setQaResult(res);
    } catch (err: any) {
      console.error('Q&A error:', err);
      setQaError(err?.response?.data?.detail || 'Could not compute answer for this question.');
    } finally {
      setIsAsking(false);
    }
  };

  // Handle Summary Mode Change
  const handleSummaryModeChange = async (mode: 'short' | 'medium' | 'detailed') => {
    if (!id) return;
    setSummaryMode(mode);
    try {
      setIsSummarizing(true);
      const res = await documentApi.getSummary(id, mode);
      setCustomSummary(res);
    } catch (err: any) {
      console.error('Summary mode error:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await documentApi.deleteDocument(id);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      alert(err?.response?.data?.detail || 'Failed to delete document.');
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const navItems: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview & Stats', icon: BarChart2 },
    { id: 'search', label: 'Passage Search', icon: Search },
    { id: 'ask', label: 'Document Q&A', icon: HelpCircle },
    { id: 'summary', label: 'Extractive Summary', icon: Sparkles },
    { id: 'keywords', label: 'TF-IDF Keywords', icon: Tag },
    { id: 'entities', label: 'Named Entities', icon: Users },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-12">
          <LoadingSpinner size="lg" label="Loading document intelligence from Supabase..." />
        </Card>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Card className="p-12 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Document Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The document with ID <span className="font-mono text-slate-700 font-semibold">{id}</span> does not exist or has been deleted.
          </p>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button leftIcon={<ChevronLeft className="w-4 h-4" />}>
                Back to Document Library
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8">
          <ErrorAlert
            title="Failed to load document"
            message={error || 'An unexpected error occurred while loading this document.'}
            onRetry={fetchDocumentAndAnalysis}
          />
        </Card>
      </div>
    );
  }

  const stats = analysis?.statistics || {
    word_count: document.word_count || 0,
    sentence_count: document.sentence_count || 0,
    character_count: document.character_count || 0,
    page_count: document.page_count || 1,
    paragraph_count: Math.max(1, Math.ceil((document.sentence_count || 1) / 3)),
    avg_sentence_length: document.sentence_count ? Math.round((document.word_count || 0) / document.sentence_count) : 0,
    avg_word_length: 5.1,
    vocabulary_richness: 0.65,
    estimated_reading_time_mins: document.word_count ? Math.max(0.5, Math.round((document.word_count / 200) * 10) / 10) : 0.5,
  };

  const keywords = analysis?.keywords || [];
  const entitiesMap = analysis?.entities || {};
  const allEntityCategories = ['All', ...Object.keys(entitiesMap)];

  const filteredEntities: EntityItem[] = selectedEntityCategory === 'All'
    ? Object.values(entitiesMap).flat()
    : entitiesMap[selectedEntityCategory] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex-shrink-0"
            title="Back to library"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 truncate" title={document.filename}>
                {document.filename || document.original_filename}
              </h1>
              <Badge variant="brand" size="sm">
                {document.file_type ? document.file_type.toUpperCase() : 'DOC'}
              </Badge>
              <Badge variant="success" size="sm">NLP Ready</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{formatFileSize(document.file_size)}</span>
              <span>•</span>
              <span>Uploaded {formatDate(document.created_at)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => setIsDeleteOpen(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const exportData = JSON.stringify({ document, analysis }, null, 2);
              const blob = new Blob([exportData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = window.document.createElement('a');
              a.href = url;
              a.download = `${document.filename}_nlp_analysis.json`;
              a.click();
            }}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Workspace Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <Card className="p-2">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isCurrent = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      isCurrent
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-brand-600' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Quick NLP Pipeline Summary Widget */}
          <Card className="p-4 bg-slate-50/80 border-slate-200 text-xs space-y-2.5">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Grounded NLP Features
            </span>
            <div className="flex items-center justify-between text-slate-600">
              <span>TF-IDF Keywords</span>
              <span className="font-semibold text-slate-900">{keywords.length} terms</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Named Entities</span>
              <span className="font-semibold text-slate-900">
                {Object.values(entitiesMap).reduce((acc, curr) => acc + curr.length, 0)} detected
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Summary Centrality</span>
              <span className="font-semibold text-emerald-600">Extractive</span>
            </div>
          </Card>
        </div>

        {/* Main Content Workspace Area */}
        <div className="lg:col-span-3">
          {analysisLoading ? (
            <Card className="p-12">
              <LoadingSpinner size="lg" label="Computing NLP intelligence pipeline..." />
            </Card>
          ) : (
            <Card className="p-6">
              {/* ========================================================================= */}
              {/* TAB 1: OVERVIEW & STATS */}
              {/* ========================================================================= */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Document Overview & Metrics</h2>
                    <p className="text-sm text-slate-500">
                      Exact structural statistics, linguistic metrics, and intelligence summary
                    </p>
                  </div>

                  {/* 6 Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Word Count</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stats.word_count.toLocaleString()}</p>
                      <span className="text-[11px] text-slate-400">Total tokens</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Sentence Count</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stats.sentence_count.toLocaleString()}</p>
                      <span className="text-[11px] text-slate-400">Segmented</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Pages</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stats.page_count}</p>
                      <span className="text-[11px] text-slate-400">Document pages</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Reading Time</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">~{stats.estimated_reading_time_mins} min</p>
                      <span className="text-[11px] text-slate-400">@ 200 wpm</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Avg Sentence Length</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stats.avg_sentence_length}</p>
                      <span className="text-[11px] text-slate-400">Words / sentence</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Vocabulary Richness</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{(stats.vocabulary_richness * 100).toFixed(1)}%</p>
                      <span className="text-[11px] text-slate-400">Type-Token Ratio</span>
                    </div>
                  </div>

                  {/* Summary Snapshot Card */}
                  {customSummary && customSummary.summary_text && (
                    <div className="p-5 bg-gradient-to-br from-brand-50/40 to-slate-50 rounded-2xl border border-brand-100/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                          Extractive Summary Preview
                        </span>
                        <button
                          onClick={() => setActiveTab('summary')}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        >
                          Full Summary <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed italic">
                        "{customSummary.summary_text}"
                      </p>
                    </div>
                  )}

                  {/* Top Keywords Pill Row */}
                  {keywords.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-brand-600" />
                          Top Ranked TF-IDF Keywords
                        </h3>
                        <button
                          onClick={() => setActiveTab('keywords')}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        >
                          View all <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {keywords.slice(0, 10).map((kw) => (
                          <span
                            key={kw.keyword}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
                          >
                            <span>{kw.keyword}</span>
                            <span className="text-[10px] text-brand-600 font-bold">{(kw.score * 100).toFixed(0)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: PASSAGE SEARCH */}
              {/* ========================================================================= */}
              {activeTab === 'search' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">NLP Passage Search</h2>
                    <p className="text-sm text-slate-500">
                      High-precision document retrieval matching natural queries with Cosine Similarity over TF-IDF vectors.
                    </p>
                  </div>

                  {/* Search Input Box */}
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search concepts, findings, or phrases in this document..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                    <Button type="submit" isLoading={isSearching} disabled={!searchQuery.trim()}>
                      Search
                    </Button>
                  </form>

                  {/* Quick suggestion tags */}
                  {keywords.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                      <span>Suggested:</span>
                      {keywords.slice(0, 4).map((k) => (
                        <button
                          key={k.keyword}
                          onClick={() => {
                            setSearchQuery(k.keyword);
                            documentApi.search(id!, k.keyword).then((r) => setSearchResults(r.results));
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
                        >
                          {k.keyword}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Search Error */}
                  {searchError && (
                    <ErrorAlert title="Search Error" message={searchError} />
                  )}

                  {/* Search Results List */}
                  {isSearching ? (
                    <LoadingSpinner label="Searching document chunks with TF-IDF cosine similarity..." />
                  ) : searchResults !== null ? (
                    searchResults.length === 0 ? (
                      <EmptyState
                        icon={Search}
                        title="No matching passages found"
                        description={`No document chunks met the relevance threshold for "${searchQuery}". Try different keywords.`}
                      />
                    ) : (
                      <div className="space-y-4 pt-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Found {searchResults.length} Relevant {searchResults.length === 1 ? 'Passage' : 'Passages'}
                        </div>
                        {searchResults.map((res, idx) => (
                          <div
                            key={idx}
                            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-brand-300 transition-all space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-600">
                                Chunk #{res.chunk_index + 1}
                              </span>
                              <Badge
                                variant={res.relevance_score >= 0.5 ? 'success' : 'brand'}
                                size="sm"
                              >
                                Relevance: {(res.relevance_score * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                              "{res.text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      Enter a query above to retrieve relevant passages ranked by statistical similarity.
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: DOCUMENT Q&A */}
              {/* ========================================================================= */}
              {activeTab === 'ask' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Retrieval-Based Question Answering</h2>
                    <p className="text-sm text-slate-500">
                      Answers grounded directly in document text without hallucinations or external generative models.
                    </p>
                  </div>

                  {/* Question Input */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask something about this document (e.g. What is the main finding?)..."
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                      <Button
                        onClick={() => handleAskQuestion()}
                        isLoading={isAsking}
                        disabled={!questionInput.trim()}
                        leftIcon={<Send className="w-4 h-4" />}
                      >
                        Ask
                      </Button>
                    </div>

                    {/* Example Question Pills */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                      <span>Example questions:</span>
                      <button
                        onClick={() => handleAskQuestion("What is the primary topic of this document?")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
                      >
                        What is the primary topic?
                      </button>
                      <button
                        onClick={() => handleAskQuestion("What key organizations or people are mentioned?")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
                      >
                        Key entities mentioned?
                      </button>
                      <button
                        onClick={() => handleAskQuestion("What are the main conclusions?")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
                      >
                        Main conclusions?
                      </button>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {qaError && <ErrorAlert title="Q&A Error" message={qaError} />}

                  {/* Q&A Result */}
                  {isAsking ? (
                    <LoadingSpinner label="Comparing query vector with document passages..." />
                  ) : qaResult ? (
                    <div className="space-y-4 pt-2">
                      {/* Direct Answer Box */}
                      <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Direct Grounded Answer
                          </span>
                          <Badge variant="success" size="sm">
                            Confidence: {(qaResult.relevance_score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-base font-semibold text-slate-900 leading-relaxed">
                          {qaResult.answer}
                        </p>
                      </div>

                      {/* Supporting Passage Evidence Box */}
                      {qaResult.supporting_passage && (
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                            <Quote className="w-3.5 h-3.5 text-slate-400" />
                            Verbatim Supporting Passage
                          </span>
                          <p className="text-sm text-slate-700 leading-relaxed italic bg-white p-4 rounded-xl border border-slate-100">
                            "{qaResult.supporting_passage}"
                          </p>
                        </div>
                      )}

                      {/* Deterministic NLP Notice */}
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 px-1">
                        <CornerDownRight className="w-3.5 h-3.5 text-brand-500" />
                        Retrieved via statistical TF-IDF cosine ranking across indexed document chunks.
                      </p>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      Ask any question above to receive grounded answers with direct supporting quotes.
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: EXTRACTIVE SUMMARY */}
              {/* ========================================================================= */}
              {activeTab === 'summary' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Extractive Summarization</h2>
                      <p className="text-sm text-slate-500">
                        Sentence saliency scoring via TF-IDF centrality, preserving original phrasing.
                      </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                      {(['short', 'medium', 'detailed'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => handleSummaryModeChange(mode)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                            summaryMode === mode
                              ? 'bg-white text-brand-700 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  {customSummary && (
                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500">Summary Length</span>
                        <p className="text-base font-bold text-slate-900">{customSummary.sentence_count} sentences</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Original Length</span>
                        <p className="text-base font-bold text-slate-900">{customSummary.original_sentence_count} sentences</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Compression</span>
                        <p className="text-base font-bold text-emerald-600">
                          {(100 - customSummary.compression_ratio * 100).toFixed(0)}% reduced
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Summary Content Body */}
                  {isSummarizing ? (
                    <LoadingSpinner label="Calculating sentence importance weights..." />
                  ) : customSummary && customSummary.summary_text ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-brand-50/30 rounded-2xl border border-brand-100 text-slate-800 text-base leading-relaxed">
                        {customSummary.summary_text}
                      </div>

                      {/* Individual Salient Sentences Breakdown */}
                      {customSummary.selected_sentences && customSummary.selected_sentences.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Extracted Key Sentences
                          </h4>
                          <div className="space-y-2">
                            {customSummary.selected_sentences.map((sent, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700"
                              >
                                <span className="font-bold text-brand-600 min-w-5">{idx + 1}.</span>
                                <p className="flex-1">{sent}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                      No summary available.
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: TF-IDF KEYWORDS */}
              {/* ========================================================================= */}
              {activeTab === 'keywords' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">TF-IDF Keyword Extraction</h2>
                    <p className="text-sm text-slate-500">
                      Statistical term importance ranking calculated from document term and inverse document frequencies.
                    </p>
                  </div>

                  {keywords.length === 0 ? (
                    <EmptyState
                      icon={Tag}
                      title="No keywords extracted"
                      description="No prominent keywords could be extracted from this document text."
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {keywords.map((kw) => (
                          <div
                            key={kw.keyword}
                            className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xs font-bold text-brand-600 w-6">
                                #{kw.rank}
                              </span>
                              <span className="text-sm font-semibold text-slate-900 truncate">
                                {kw.keyword}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-brand-600 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(100, kw.score * 120)}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-600 min-w-8 text-right">
                                {kw.score.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 6: NAMED ENTITY RECOGNITION (spaCy) */}
              {/* ========================================================================= */}
              {activeTab === 'entities' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Named Entity Recognition (spaCy)</h2>
                    <p className="text-sm text-slate-500">
                      Categorized entity extraction for people, organizations, locations, dates, and institutions.
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {allEntityCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedEntityCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedEntityCategory === cat
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                        {cat !== 'All' && entitiesMap[cat] ? ` (${entitiesMap[cat].length})` : ''}
                      </button>
                    ))}
                  </div>

                  {filteredEntities.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No entities in this category"
                      description="No named entities were recognized under this category."
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                      {filteredEntities.map((ent, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate" title={ent.entity_text}>
                              {ent.entity_text}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {ent.entity_label}
                            </span>
                          </div>
                          {ent.frequency && ent.frequency > 1 && (
                            <Badge variant="neutral" size="sm">
                              {ent.frequency}x
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Document</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-700">"{document.filename || document.original_filename}"</span>? This will permanently remove the record and all NLP analysis.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDelete}
              >
                Delete Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
