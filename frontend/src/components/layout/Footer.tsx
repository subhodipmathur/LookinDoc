import React from 'react';
import { FileText, Sparkles, Shield, Cpu, Database, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 mt-auto text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-tight text-lg">LookinDoc</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Look inside. Understand more. A precision-engineered document intelligence SaaS providing grounded text extraction, TF-IDF statistical keyword analysis, spaCy Named Entity Recognition, and extractive summarization with 100% deterministic accuracy.
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg font-medium border border-slate-800 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-brand-400" />
                spaCy v3.8
              </span>
              <span className="text-[11px] px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg font-medium border border-slate-800 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-400" />
                Supabase PostgreSQL
              </span>
              <span className="text-[11px] px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg font-medium border border-slate-800 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-indigo-400" />
                Zero Hallucination
              </span>
            </div>
          </div>

          {/* Product Capabilities */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Intelligence Features
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-slate-200 transition-colors">Statistical Metrics & Reading Speed</li>
              <li className="hover:text-slate-200 transition-colors">TF-IDF Keyword Weighting</li>
              <li className="hover:text-slate-200 transition-colors">spaCy Categorized NER</li>
              <li className="hover:text-slate-200 transition-colors">Extractive Sentence Summarizer</li>
              <li className="hover:text-slate-200 transition-colors">Cosine Similarity Passage Search</li>
              <li className="hover:text-slate-200 transition-colors">Retrieval-Based Grounded Q&A</li>
            </ul>
          </div>

          {/* Architecture & Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Resources & Endpoints
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/upload" className="hover:text-brand-400 transition-colors flex items-center gap-1">
                  Ingestion Hub <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-400 transition-colors flex items-center gap-1">
                  Document Vault <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors flex items-center gap-1">
                  Interactive API Docs (FastAPI) <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="http://localhost:8000/api/health" target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors flex items-center gap-1">
                  Health Telemetry Endpoint <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LookinDoc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Production Document Intelligence Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
