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
  X 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { documentApi } from '../services/api';
import { DocumentDetail } from '../types';

type WorkspaceTab = 'overview' | 'search' | 'ask' | 'summary' | 'keywords' | 'entities';

export const DocumentWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Delete modal in workspace
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchDocument = async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      const res = await documentApi.getDocument(id);
      setDocument(res.document);
    } catch (err: any) {
      console.error('Failed to fetch document detail:', err);
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
    fetchDocument();
  }, [id]);

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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success" size="sm">Ready</Badge>;
      case 'processing':
        return <Badge variant="warning" size="sm">Processing</Badge>;
      case 'error':
        return <Badge variant="error" size="sm">Failed</Badge>;
      case 'pending':
      default:
        return <Badge variant="neutral" size="sm">Pending</Badge>;
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
          <LoadingSpinner size="lg" label="Loading document workspace from Supabase..." />
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
            The document with ID <span className="font-mono text-slate-700 font-semibold">{id}</span> does not exist or has been deleted from the database.
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
            onRetry={fetchDocument}
          />
        </Card>
      </div>
    );
  }

  const estimatedReadingTime = document.word_count
    ? Math.max(1, Math.ceil(document.word_count / 200))
    : null;

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
              {getStatusBadge(document.processing_status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>ID: {document.id}</span>
              <span>•</span>
              <span>Uploaded: {formatDate(document.created_at)}</span>
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
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export Analysis
          </Button>
        </div>
      </div>

      {/* Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-1">
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
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Document Overview & Metrics</h2>
                  <p className="text-sm text-slate-500">
                    Structural statistics and database metadata retrieved from Supabase
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Total Words</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {document.word_count !== null && document.word_count !== undefined
                        ? document.word_count.toLocaleString()
                        : 'Pending'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Sentences</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {document.sentence_count !== null && document.sentence_count !== undefined
                        ? document.sentence_count.toLocaleString()
                        : 'Pending'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Reading Time</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {estimatedReadingTime ? `~${estimatedReadingTime} min` : 'Pending'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Pages</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {document.page_count !== null && document.page_count !== undefined
                        ? document.page_count
                        : '1'}
                    </p>
                  </div>
                </div>

                {/* Metadata Details Table */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Database Record Details</h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Document UUID</span>
                      <span className="font-mono text-slate-800">{document.id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Original Filename</span>
                      <span className="text-slate-800 font-medium">{document.original_filename}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">File Size</span>
                      <span className="text-slate-800">{formatFileSize(document.file_size)} ({document.file_size} bytes)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Storage Location</span>
                      <span className="font-mono text-slate-800">{document.storage_path || 'Pending upload pipeline (Phase 4)'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Last Modified</span>
                      <span className="text-slate-800">{formatDate(document.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Passage Search</h2>
                  <p className="text-sm text-slate-500">TF-IDF & Cosine Similarity search over chunked text</p>
                </div>
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Search will be activated once text extraction and chunk indexing are completed in subsequent phases.
                </div>
              </div>
            )}

            {activeTab === 'ask' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Document Q&A</h2>
                  <p className="text-sm text-slate-500">Retrieval-based Question Answering with ground evidence</p>
                </div>
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Question Answering will be activated once retrieval vectors are generated in subsequent phases.
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Extractive Summary</h2>
                  <p className="text-sm text-slate-500">Sentence importance ranking using TF-IDF weights</p>
                </div>
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Extractive summarization will be generated during NLP processing in subsequent phases.
                </div>
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">TF-IDF Keywords</h2>
                  <p className="text-sm text-slate-500">Ranked statistical key terms with importance scores</p>
                </div>
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  TF-IDF keyword ranking will be calculated during NLP processing in subsequent phases.
                </div>
              </div>
            )}

            {activeTab === 'entities' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Named Entities (spaCy)</h2>
                  <p className="text-sm text-slate-500">Categorized entities (Persons, Orgs, Locations, Dates)</p>
                </div>
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Named Entity Recognition (NER) will be generated by spaCy in subsequent phases.
                </div>
              </div>
            )}
          </Card>
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
                Are you sure you want to delete <span className="font-semibold text-slate-700">"{document.filename || document.original_filename}"</span>? This will permanently remove the record and any associated data.
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
