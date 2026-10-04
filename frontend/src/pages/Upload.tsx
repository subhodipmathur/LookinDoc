import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  X, 
  FileCheck, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { documentApi } from '../services/api';
import { DocumentDetail } from '../types';

type UploadStage = 'idle' | 'uploading' | 'extracting' | 'saving' | 'complete' | 'error';

const SAMPLE_DOCUMENT_CONTENT = `Artificial Intelligence and Natural Language Processing (NLP) have experienced unprecedented breakthroughs in recent years.

Dr. Alan Turing at Cambridge University in the United Kingdom laid the early computational foundations of machine intelligence and algorithmic logic. Decades later, organizations such as Google DeepMind, OpenAI, and Microsoft established large-scale neural architectures that process unstructured text at global scale.

In Europe and North America, governments and clean energy consortiums allocated over $500 million in grant funding across Paris, Berlin, and San Francisco to study sustainable computing frameworks and climate intelligence models.

LookinDoc is a document intelligence platform that solves the core limitation of generative language models: hallucination. Instead of generating unverifiable probabilistic answers, LookinDoc uses deterministic mathematical NLP algorithms. 

TF-IDF (Term Frequency - Inverse Document Frequency) computes exact statistical weights for unigrams and bigrams across document chunks. Sentences are scored for importance using sentence centrality to construct extractive summaries without rewriting original author words. Named Entity Recognition (NER) models categorize key entities including people, institutions, geopolitical locations, dates, and currencies.

Through retrieval-based Question Answering and Cosine Similarity passage search, users verify evidence directly from source text with 100% grounded transparency.`;

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

  const handleLoadSample = () => {
    const blob = new Blob([SAMPLE_DOCUMENT_CONTENT], { type: 'text/plain' });
    const sampleFile = new File([blob], 'ai_and_nlp_intelligence_report.txt', { type: 'text/plain' });
    setSelectedFile(sampleFile);
    setError(null);
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
      setProgressPercent(15);

      const res = await documentApi.uploadDocument(selectedFile, (percent) => {
        if (percent < 85) {
          setProgressPercent(percent);
          setStage('uploading');
        } else {
          setProgressPercent(85);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <Badge variant="brand" size="md">Document Ingestion Pipeline</Badge>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Ingest & Analyze Document
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Upload any PDF, Word document, or TXT file to initiate multi-threaded extraction, TF-IDF feature weighting, and spaCy linguistic parsing.
        </p>
      </div>

      <Card className="p-6 sm:p-10 space-y-6">
        {/* ========================================================================= */}
        {/* SUCCESS STAGE */}
        {/* ========================================================================= */}
        {stage === 'complete' && uploadedDoc ? (
          <div className="space-y-6 py-4 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Document Intelligence Ready!</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Text layers extracted, chunks vectorized, entities categorized, and analysis securely saved to Supabase.
              </p>
            </div>

            {/* Extracted Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div className="text-center p-2">
                <span className="text-[11px] text-slate-500 font-medium">Format</span>
                <p className="text-base font-bold text-white uppercase">{uploadedDoc.file_type}</p>
              </div>
              <div className="text-center p-2">
                <span className="text-[11px] text-slate-500 font-medium">Tokens (Words)</span>
                <p className="text-base font-bold text-brand-400">{uploadedDoc.word_count?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center p-2">
                <span className="text-[11px] text-slate-500 font-medium">Sentences</span>
                <p className="text-base font-bold text-white">{uploadedDoc.sentence_count?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center p-2">
                <span className="text-[11px] text-slate-500 font-medium">Pages</span>
                <p className="text-base font-bold text-white">{uploadedDoc.page_count || 1}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                variant="glow"
                onClick={() => navigate(`/documents/${uploadedDoc.id}`)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Document Workspace
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleRemove}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Ingest Another File
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* DRAG & DROP ZONE */}
            {/* ========================================================================= */}
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
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 flex flex-col items-center justify-center gap-4 cursor-pointer ${
                stage !== 'idle' && stage !== 'error'
                  ? 'border-slate-800 bg-slate-950/40 cursor-not-allowed'
                  : dragActive
                  ? 'border-brand-500 bg-brand-500/10 scale-[0.99]'
                  : 'border-slate-800 hover:border-brand-500/60 hover:bg-slate-950/60 bg-slate-950/40'
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

              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-lg shadow-brand-500/15">
                <UploadIcon className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <p className="text-base font-bold text-white">
                  Drop your document here, or <span className="text-brand-400 underline underline-offset-4">browse files</span>
                </p>
                <p className="text-xs text-slate-400">
                  Supports PDF (PyMuPDF), DOCX (python-docx), and TXT up to 40 MB
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Badge variant="brand" size="sm">PDF Engine</Badge>
                <Badge variant="brand" size="sm">DOCX Parser</Badge>
                <Badge variant="brand" size="sm">TXT Decoder</Badge>
              </div>
            </div>

            {/* Quick Sample Button */}
            {(stage === 'idle' || stage === 'error') && !selectedFile && (
              <div className="flex items-center justify-center pt-1">
                <button
                  onClick={handleLoadSample}
                  className="text-xs font-semibold text-slate-400 hover:text-brand-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-brand-500/40 bg-slate-900/40 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Load Pre-Built Sample NLP Document
                </button>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <ErrorAlert
                title="Ingestion Error"
                message={error}
                onRetry={handleProcessUpload}
              />
            )}

            {/* Selected File Details Box */}
            {selectedFile && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                {stage === 'idle' || stage === 'error' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            )}

            {/* Live Telemetry Progress Stages */}
            {(stage === 'uploading' || stage === 'extracting' || stage === 'saving') && (
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-brand-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                    {stage === 'uploading' && '1. Streaming binary payload to Supabase Storage...'}
                    {stage === 'extracting' && '2. Extracting text, linguistic sentences & TF-IDF vectors...'}
                    {stage === 'saving' && '3. Saving indexed document to PostgreSQL vault...'}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Ingest Action Button */}
            <div className="flex items-center justify-between pt-2">
              <Link to="/dashboard" className="text-xs text-slate-400 hover:text-slate-200">
                ← Back to Document Vault
              </Link>
              <Button
                disabled={!selectedFile || (stage !== 'idle' && stage !== 'error')}
                isLoading={stage === 'uploading' || stage === 'extracting' || stage === 'saving'}
                variant="glow"
                onClick={handleProcessUpload}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {stage === 'uploading' || stage === 'extracting' || stage === 'saving'
                  ? 'Processing NLP Pipeline...'
                  : 'Start Ingestion'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
