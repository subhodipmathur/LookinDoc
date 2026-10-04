import React, { useState, useRef } from 'react';
import { 
  Upload as UploadIcon, 
  AlertCircle, 
  X, 
  FileCheck, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Upload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supported extensions & MIME types
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

  const validateFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`Unsupported file type (${ext}). Please select a PDF, DOCX, or TXT file.`);
      return false;
    }
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds 25 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Upload Document
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Upload your PDF, DOCX, or TXT document to trigger automated text extraction, statistical metrics, keyword ranking, and NER analysis.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
            dragActive
              ? 'border-brand-500 bg-brand-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleChange}
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
              PDF, DOCX, TXT up to 25 MB
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Badge variant="brand" size="sm">PDF (PyMuPDF)</Badge>
            <Badge variant="brand" size="sm">DOCX (python-docx)</Badge>
            <Badge variant="brand" size="sm">TXT (UTF-8)</Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p>{error}</p>
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
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <Button
            disabled={!selectedFile}
            onClick={() => {
              alert('Supabase & Document Processing pipeline will be connected in Phase 3 & 4.');
            }}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Process Document
          </Button>
        </div>
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
            <p className="text-slate-500">Text parsing with encoding checks & page tracking.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700">2. Normalization</span>
            <p className="text-slate-500">NLTK sentence & token segmentation, stopword filtering.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700">3. TF-IDF & spaCy</span>
            <p className="text-slate-500">Vector representation, term scoring, and NER extraction.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700">4. Grounded Index</span>
            <p className="text-slate-500">Chunk embeddings for instant search and passage Q&A.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
