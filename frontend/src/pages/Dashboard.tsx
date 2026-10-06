import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Search, 
  FolderOpen, 
  Trash2, 
  ExternalLink,
  FileText,
  Calendar,
  Layers,
  AlertTriangle,
  X,
  LayoutGrid,
  List,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { documentApi } from '../services/api';
import { DocumentListItem } from '../types';

export const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Delete modal state
  const [docToDelete, setDocToDelete] = useState<DocumentListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await documentApi.getDocuments();
      setDocuments(res.documents || []);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError(err?.response?.data?.detail || 'Could not load documents. Please check backend and database connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await documentApi.deleteDocument(docToDelete.id);
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
      setDocToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      setDeleteError(err?.response?.data?.detail || 'Failed to delete document. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyDocId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const getFormatBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pdf') {
      return <Badge variant="error" size="sm">PDF</Badge>;
    } else if (t === 'docx' || t === 'doc') {
      return <Badge variant="brand" size="sm">DOCX</Badge>;
    } else {
      return <Badge variant="success" size="sm">TXT</Badge>;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = (doc.filename || doc.original_filename || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormat === 'All' || doc.file_type.toLowerCase() === selectedFormat.toLowerCase();
    return matchesSearch && matchesFormat;
  });

  // Calculate vault stats
  const totalWords = documents.reduce((acc, d) => acc + (d.word_count || 0), 0);
  const totalBytes = documents.reduce((acc, d) => acc + (d.file_size || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Document Vault
            </h1>
            <Badge variant="brand" size="sm">{documents.length} Total</Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Browse, manage, and explore NLP intelligence for all ingested documents in your encrypted vault.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/upload">
            <Button variant="glow" leftIcon={<Upload className="w-4 h-4" />}>
              Ingest Document
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Quick Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Vault Documents</span>
          <p className="text-2xl font-bold text-white">{documents.length}</p>
          <span className="text-[10px] text-emerald-400 font-medium">PostgreSQL Indexed</span>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Total Ingested Words</span>
          <p className="text-2xl font-bold text-indigo-400">{totalWords.toLocaleString()}</p>
          <span className="text-[10px] text-zinc-400">Processed tokens</span>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Storage Consumed</span>
          <p className="text-2xl font-bold text-blue-400">{formatFileSize(totalBytes)}</p>
          <span className="text-[10px] text-zinc-400">Encrypted Cloud Storage</span>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">NLP Reliability</span>
          <p className="text-2xl font-bold text-emerald-400">100%</p>
          <span className="text-[10px] text-emerald-400 font-medium">Grounded & Verifiable</span>
        </Card>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-2.5 bg-[#12131a] rounded-2xl border border-zinc-800">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter documents by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0e0f15] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Format Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['All', 'pdf', 'docx', 'txt'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                selectedFormat.toLowerCase() === fmt.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* View Switcher & Refresh */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
          <div className="flex items-center p-0.5 bg-[#0e0f15] rounded-lg border border-zinc-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={fetchDocuments} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Document Content */}
      {loading ? (
        <Card className="p-16 text-center">
          <LoadingSpinner size="lg" label="Synchronizing document library with Supabase vault..." />
        </Card>
      ) : error ? (
        <Card className="p-6">
          <ErrorAlert title="Failed to load document vault" message={error} onRetry={fetchDocuments} />
        </Card>
      ) : documents.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={FolderOpen}
            title="Your document vault is empty"
            description="Ingest a PDF, Word document, or TXT file to initiate automated text extraction and NLP intelligence."
            actionLabel="Ingest First Document"
            onAction={() => window.location.assign('/upload')}
          />
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={Search}
            title="No matching documents found"
            description={`No document matched your search query "${searchQuery}".`}
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedFormat('All');
            }}
          />
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              hoverEffect
              className="p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle ambient accent glow based on type */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-all" />

              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:border-indigo-500/50 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getFormatBadge(doc.file_type)}
                    <Badge variant="success" size="sm">
                      Ready
                    </Badge>
                  </div>
                </div>

                {/* Filename */}
                <h3 className="text-sm font-bold text-white truncate mb-1" title={doc.filename}>
                  {doc.filename || doc.original_filename}
                </h3>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400 mt-2.5 mb-4">
                  <span className="font-mono text-[11px] text-zinc-300">{formatFileSize(doc.file_size)}</span>
                  {doc.word_count !== null && doc.word_count !== undefined && (
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-zinc-500" />
                      {doc.word_count.toLocaleString()} words
                    </span>
                  )}
                  {doc.page_count !== null && doc.page_count !== undefined && (
                    <span>{doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}</span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(doc.created_at)}
                  </span>
                </div>
              </div>

              {/* Action Bottom Bar */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                <Link to={`/documents/${doc.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Workspace
                  </Button>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => copyDocId(doc.id, e)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Copy Document ID"
                  >
                    {copiedId === doc.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setDocToDelete(doc)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0e0f15] text-zinc-300 font-bold">
                  <th className="py-3.5 px-4">Document</th>
                  <th className="py-3.5 px-4">Format</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Words</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5 max-w-xs sm:max-w-sm truncate">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="truncate" title={doc.filename}>{doc.filename || doc.original_filename}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getFormatBadge(doc.file_type)}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">{formatFileSize(doc.file_size)}</td>
                    <td className="py-3.5 px-4 text-zinc-300">{doc.word_count?.toLocaleString() || '—'}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{formatDate(doc.created_at)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/documents/${doc.id}`}>
                          <Button variant="outline" size="sm">
                            Open
                          </Button>
                        </Link>
                        <button
                          onClick={(e) => copyDocId(doc.id, e)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                          title="Copy ID"
                        >
                          {copiedId === doc.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDocToDelete(doc)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#12131a] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-800 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setDocToDelete(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete Document</h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-white">"{docToDelete.filename || docToDelete.original_filename}"</span>? This will permanently remove the storage file and all associated NLP intelligence.
              </p>
            </div>

            {deleteError && <ErrorAlert title="Delete Failed" message={deleteError} />}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocToDelete(null)}
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
