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
  X
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

  const getStatusBadge = (status: string) => {
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

  const filteredDocuments = documents.filter((doc) =>
    (doc.filename || doc.original_filename || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Document Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage uploaded documents, view extraction status, and explore NLP analysis.
          </p>
        </div>
        <Link to="/upload">
          <Button leftIcon={<Upload className="w-4 h-4" />}>
            Upload New Document
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchDocuments}>
          Refresh
        </Button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Card className="p-12">
          <LoadingSpinner size="lg" label="Loading documents from Supabase..." />
        </Card>
      ) : error ? (
        <Card className="p-6">
          <ErrorAlert title="Failed to load document library" message={error} onRetry={fetchDocuments} />
        </Card>
      ) : documents.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={FolderOpen}
            title="No documents in your library yet"
            description="Upload a PDF, DOCX, or TXT file to begin automated NLP processing and intelligence extraction."
            actionLabel="Upload First Document"
            onAction={() => window.location.assign('/upload')}
          />
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Search}
            title="No matching documents"
            description={`No documents found matching "${searchQuery}". Try a different keyword.`}
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} hoverEffect className="p-5 flex flex-col justify-between">
              <div>
                {/* Top card row: icon & status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" size="sm">
                      {doc.file_type ? doc.file_type.toUpperCase() : 'DOC'}
                    </Badge>
                    {getStatusBadge(doc.processing_status)}
                  </div>
                </div>

                {/* Filename */}
                <h3 className="text-base font-semibold text-slate-900 truncate mb-1" title={doc.filename}>
                  {doc.filename || doc.original_filename}
                </h3>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 mb-4">
                  <span>{formatFileSize(doc.file_size)}</span>
                  {doc.word_count !== null && doc.word_count !== undefined && (
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {doc.word_count.toLocaleString()} words
                    </span>
                  )}
                  {doc.page_count !== null && doc.page_count !== undefined && (
                    <span>{doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(doc.created_at)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link to={`/documents/${doc.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={() => setDocToDelete(doc)}
                  aria-label="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setDocToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Document</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-700">"{docToDelete.filename || docToDelete.original_filename}"</span>? This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {deleteError}
              </div>
            )}

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
