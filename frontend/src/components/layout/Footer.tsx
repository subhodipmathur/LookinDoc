import React from 'react';
import { FileText, Sparkles, Shield, Cpu, Database, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#0a0b10] mt-auto text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-tight text-lg">LookinDoc</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Look inside. Understand more. An enterprise-ready document intelligence platform providing verifiable text extraction, statistical TF-IDF keyword scoring, and spaCy Named Entity Recognition with 100% deterministic accuracy.
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] px-2.5 py-1 bg-zinc-900 text-zinc-300 rounded-lg font-medium border border-zinc-800 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-indigo-400" />
                spaCy Core NLP
              </span>
              <span className="text-[11px] px-2.5 py-1 bg-zinc-900 text-zinc-300 rounded-lg font-medium border border-zinc-800 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-400" />
                Supabase PostgreSQL Vault
              </span>
              <span className="text-[11px] px-2.5 py-1 bg-zinc-900 text-zinc-300 rounded-lg font-medium border border-zinc-800 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-blue-400" />
                Zero Hallucination
              </span>
            </div>
          </div>

          {/* Product Capabilities */}
          <div>
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3">
              Intelligence Features
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-indigo-400" />
                <span>Document Readability & Stats</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-indigo-400" />
                <span>TF-IDF Keyword Extraction</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-indigo-400" />
                <span>spaCy Categorized NER</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-indigo-400" />
                <span>Extractive Summarization</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-indigo-400" />
                <span>Passage Semantic Search</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-indigo-400" />
                <span>Grounded Verifiable Q&A</span>
              </li>
            </ul>
          </div>

          {/* Platform & Security */}
          <div>
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3">
              Security & Access
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link to="/upload" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  Ingestion Hub <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                  Document Vault <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-zinc-400 pt-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>AES-256 Encrypted Cloud Vault</span>
              </li>
              <li className="text-[11px] text-zinc-500">
                100% data privacy — files are never used to train external models.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} LookinDoc Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Document Intelligence Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
