import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-base">LookinDoc</span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm">
              Look inside. Understand more. An NLP-powered Document Intelligence Platform that helps you analyze, search, question, and summarize documents with transparent, verifiable NLP methods.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium border border-slate-200">
                spaCy NER
              </span>
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium border border-slate-200">
                NLTK
              </span>
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium border border-slate-200">
                TF-IDF + Cosine
              </span>
            </div>
          </div>

          {/* NLP Capabilities */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Capabilities
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Text & Document Statistics</li>
              <li>TF-IDF Keyword Extraction</li>
              <li>Named Entity Recognition</li>
              <li>Extractive Summarization</li>
              <li>Relevance Passage Search</li>
              <li>Retrieval-Based Q&A</li>
            </ul>
          </div>

          {/* Technical Specs */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Stack & Compliance
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>FastAPI + Python</li>
              <li>React + TypeScript + Vite</li>
              <li>Supabase PostgreSQL</li>
              <li>No external LLM dependency</li>
              <li>100% Deterministic NLP</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LookinDoc. Natural Language Processing Mini-Project.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              Real NLP Pipeline
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
