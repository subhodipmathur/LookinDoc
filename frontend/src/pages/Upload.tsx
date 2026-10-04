import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  X, 
  FileCheck, 
  ArrowRight,
  FileText,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { documentApi } from '../services/api';
import { DocumentDetail } from '../types';

type UploadStage = 'idle' | 'uploading' | 'extracting' | 'saving' | 'complete' | 'error';

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentDetail | null>(null);

  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.text'];
  const maxSizeBytes = 40 * 1024 * 1024; // 40 MB

  const validateFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`Unsupported file type (${ext}). Please select a PDF, DOCX, or TXT file.`);
      return false;
    }
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds 40 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return false;
    }
    if (file.size === 0) {
      setError('File is empty (0 bytes).');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    setStage('idle');
    setProgressPercent(0);
    setUploadedDoc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleProcessUpload = async () => {
    if (!selectedFile) return;

    try {
      setError(null);
      setStage('uploading');
      setProgressPercent(10);

      const res = await documentApi.uploadDocument(selectedFile, (percent) => {
        if (percent < 90) {
          setProgressPercent(percent);
          setStage('uploading');
        } else {
          setProgressPercent(90);
          setStage('extracting');
        }
      });

      setStage('saving');
      setProgressPercent(100);
      setUploadedDoc(res.document);
      setStage('complete');
    } catch (err: any) {
      console.error('Upload & extraction error:', err);
      setStage('error');
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Document processing failed. Please check the file and try again.'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Upload Document
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Upload your PDF, DOCX, or TXT document to trigger automated text extraction, structural metrics, and prepare the document for NLP intelligence.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        {/* Success Card */}
        {stage === 'complete' && uploadedDoc ? (
          <div className="space-y-6 py-4 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Document Processed Successfully!</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Text and structural statistics have been extracted and saved to Supabase.
              </p>
            </div>

            {/* Extracted Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-center">
                <span className="text-xs text-slate-500">File Type</span>
                <p className="text-base font-bold text-slate-900 uppercase">{uploadedDoc.file_type}</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-500">Words</span>
                <p className="text-base font-bold text-slate-900">{uploadedDoc.word_count?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-500">Sentences</span>
                <p className="text-base font-bold text-slate-900">{uploadedDoc.sentence_count?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-500">Pages</span>
                <p className="text-base font-bold text-slate-900">{uploadedDoc.page_count || 1}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate(`/documents/${uploadedDoc.id}`)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open Document Workspace
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleRemove}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Upload Another Document
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                if (stage === 'idle' || stage === 'error') {
                  fileInputRef.current?.click();
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                stage !== 'idle' && stage !== 'error'
                  ? 'border-slate-200 bg-slate-50/50 cursor-not-allowed'
                  : dragActive
                  ? 'border-brand-500 bg-brand-50/50 scale-[0.99] cursor-pointer'
                  : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/70 cursor-pointer'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.text"
                onChange={handleChange}
                disabled={stage !== 'idle' && stage !== 'error'}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
                <UploadIcon className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-800">
                  Click to select or drag and drop your file
                </p>
                <p className="text-xs text-slate-500">
                  PDF, DOCX, TXT up to 40 MB
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Badge variant="brand" size="sm">PDF (PyMuPDF)</Badge>
                <Badge variant="brand" size="sm">DOCX (python-docx)</Badge>
                <Badge variant="brand" size="sm">TXT (UTF-8/Latin)</Badge>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mt-4">
                <ErrorAlert
                  title="Upload / Extraction Error"
                  message={error}
                  onRetry={handleProcessUpload}
                />
              </div>
            )}

            {/* Selected File Details */}
            {selectedFile && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 flex-shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                {stage === 'idle' || stage === 'error' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            )}

            {/* Processing Progress Indicator */}
            {(stage === 'uploading' || stage === 'extracting' || stage === 'saving') && (
              <div className="mt-6 p-5 rounded-xl bg-brand-50/50 border border-brand-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-900">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
                    {stage === 'uploading' && 'Uploading file to Supabase Storage...'}
                    {stage === 'extracting' && 'Extracting text and calculating structural metrics...'}
                    {stage === 'saving' && 'Saving analysis record in PostgreSQL database...'}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-brand-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-6 flex justify-end">
              <Button
                disabled={!selectedFile || (stage !== 'idle' && stage !== 'error')}
                isLoading={stage === 'uploading' || stage === 'extracting' || stage === 'saving'}
                onClick={handleProcessUpload}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {stage === 'uploading' || stage === 'extracting' || stage === 'saving'
                  ? 'Processing Document...'
                  : 'Process Document'}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Processing Pipeline Info */}
      <div className="mt-10 border-t border-slate-200/80 pt-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600" />
          NLP Ingestion Pipeline Stages
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700">1. Safe Extraction</span>
            <p className="text-slate-500">PyMuPDF, python-docx, and UTF-8 decoders extract clean text.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700">2. Normalization</span>
            <p className="text-slate-500">Token and sentence segmentation, stopword filtering.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700">3. TF-IDF & spaCy</span>
            <p className="text-slate-500">Term weights, named entity recognition, and importance scores.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700">4. Grounded Index</span>
            <p className="text-slate-500">Vector representation for passage search and question answering.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
