import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Sparkles, 
  Tag, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Database,
  BarChart3,
  FileSearch,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Home: React.FC = () => {
  const [demoTab, setDemoTab] = useState<'stats' | 'keywords' | 'entities' | 'summary' | 'qa'>('stats');

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              LookinDoc Document Intelligence Platform
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-400 border border-brand-500/30">
              v1.0 Ready
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Look inside. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Understand more.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Turn unstructured PDFs, Word documents, and text files into structured intelligence. Grounded NLP extraction, TF-IDF term weights, spaCy Named Entity Recognition, and hallucination-free retrieval.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link to="/upload" className="w-full sm:w-auto">
              <Button size="lg" variant="glow" className="w-full sm:w-auto text-base" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ingest Document Now
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base" leftIcon={<Database className="w-4 h-4" />}>
                Explore Document Vault
              </Button>
            </Link>
          </div>

          {/* Trust points */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Deterministic NLP
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Zero Hallucinations
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Supabase PostgreSQL Vault
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE PRODUCT SHOWCASE DEMO PREVIEW */}
        {/* ========================================================================= */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative p-2 sm:p-3 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs text-slate-500 font-mono ml-2">lookindoc://workspace/sample-report.pdf</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="brand" size="sm">PDF Engine</Badge>
                <Badge variant="success" size="sm">Processed</Badge>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="p-4 sm:p-6 space-y-6">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/60">
                {[
                  { id: 'stats', label: 'Metrics & Stats', icon: BarChart3 },
                  { id: 'keywords', label: 'TF-IDF Keywords', icon: Tag },
                  { id: 'entities', label: 'spaCy Entities', icon: Users },
                  { id: 'summary', label: 'Extractive Summary', icon: Sparkles },
                  { id: 'qa', label: 'Grounded Q&A', icon: HelpCircle },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDemoTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                        demoTab === tab.id
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Demo Tab Content Container */}
              <div className="min-h-[220px]">
                {demoTab === 'stats' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 animate-fadeIn">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium">Total Tokens</span>
                      <p className="text-2xl font-black text-white">4,820</p>
                      <span className="text-[10px] text-emerald-400 font-medium">100% parsed</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium">Sentences</span>
                      <p className="text-2xl font-black text-white">248</p>
                      <span className="text-[10px] text-slate-400">spaCy Segmented</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium">Reading Time</span>
                      <p className="text-2xl font-black text-white">~24 min</p>
                      <span className="text-[10px] text-slate-400">@ 200 words/min</span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium">Lexical Richness</span>
                      <p className="text-2xl font-black text-brand-400">78.4%</p>
                      <span className="text-[10px] text-slate-400">Type-Token Ratio</span>
                    </div>
                  </div>
                )}

                {demoTab === 'keywords' && (
                  <div className="space-y-3 animate-fadeIn">
                    <p className="text-xs text-slate-400">Ranked statistical key terms weighted via TF-IDF:</p>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { term: 'Neural Architecture', score: 0.94, rank: 1 },
                        { term: 'Natural Language Processing', score: 0.91, rank: 2 },
                        { term: 'Extractive Summarization', score: 0.87, rank: 3 },
                        { term: 'Cosine Similarity', score: 0.83, rank: 4 },
                        { term: 'Document Retrieval', score: 0.79, rank: 5 },
                        { term: 'Vector Chunking', score: 0.74, rank: 6 },
                      ].map((item) => (
                        <div key={item.term} className="px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-2.5 text-xs">
                          <span className="font-bold text-brand-400">#{item.rank}</span>
                          <span className="font-semibold text-white">{item.term}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 font-bold">
                            {(item.score * 100).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {demoTab === 'entities' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Organizations</span>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300"><span>Google DeepMind</span><span className="text-slate-500">4x</span></div>
                        <div className="flex justify-between text-slate-300"><span>Cambridge University</span><span className="text-slate-500">2x</span></div>
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">People</span>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300"><span>Dr. Alan Turing</span><span className="text-slate-500">3x</span></div>
                        <div className="flex justify-between text-slate-300"><span>Geoffrey Hinton</span><span className="text-slate-500">1x</span></div>
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Locations</span>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300"><span>London, United Kingdom</span><span className="text-slate-500">5x</span></div>
                        <div className="flex justify-between text-slate-300"><span>Paris, France</span><span className="text-slate-500">2x</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {demoTab === 'summary' && (
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        Grounded Extractive Summary (Medium Mode)
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400">76% Compressed</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed italic">
                      "Natural Language Processing has seen exponential progress since 2020. Grounded mathematical retrieval models compute term centrality to extract the most informative sentences without generative hallucinations."
                    </p>
                  </div>
                )}

                {demoTab === 'qa' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-400">Q: What principles govern LookinDoc's retrieval?</span>
                        <Badge variant="success" size="sm">94% Match</Badge>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        "LookinDoc matches natural language queries against document chunk vectors using TF-IDF representation and Cosine Similarity."
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6 PRODUCT PILLARS */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="brand" size="md">Core Engine Architecture</Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineered for Grounded Accuracy
          </h2>
          <p className="text-sm text-slate-400">
            Unlike probabilistic language models that invent citations and summarize fiction, LookinDoc uses verifiable, mathematical NLP algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Format Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Industrial PyMuPDF and python-docx text extraction supporting multi-page PDFs, Microsoft Word documents, and TXT files with auto-encoding detection.
            </p>
          </Card>

          {/* Card 2 */}
          <Card hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Structural Statistics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes token metrics, sentence counts, paragraph densities, Type-Token Ratio lexical diversity, and precise human reading speed estimations.
            </p>
          </Card>

          {/* Card 3 */}
          <Card hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">TF-IDF Term Weighting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scikit-learn statistical vectorization extracting high-signal unigram and bigram keywords ranked by inverse document frequency.
            </p>
          </Card>

          {/* Card 4 */}
          <Card hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">spaCy Entity Recognition</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              State-of-the-art linguistic NER model recognizing Persons, Organizations, Geopolitical Entities, Dates, Currencies, and Events with frequency counts.
            </p>
          </Card>

          {/* Card 5 */}
          <Card hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Extractive Summarization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates sentence centrality scores to select the most salient original sentences. Switch instantly between Short, Medium, and Detailed density modes.
            </p>
          </Card>

          {/* Card 6 */}
          <Card hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Passage Search & Q&A</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Retrieval-based Question Answering and Cosine Similarity passage search matching user queries against chunked vectors with verbatim quotes.
            </p>
          </Card>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COMPARISON TABLE */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Card className="p-8 sm:p-10 space-y-8 bg-slate-900/90">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Deterministic NLP?
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              How LookinDoc compares to generic keyword search and opaque generative LLMs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4 text-brand-400 font-black">LookinDoc NLP</th>
                  <th className="py-3 px-4 text-slate-400">External Generative LLMs</th>
                  <th className="py-3 px-4 text-slate-400">Basic Regex/Search</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Hallucination Risk</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> 0% (Exact Ground Truth)
                  </td>
                  <td className="py-3.5 px-4 text-rose-400">High (Fabricated text)</td>
                  <td className="py-3.5 px-4 text-slate-400">None (No synthesis)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Entity Recognition</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">spaCy Linguistic NER</td>
                  <td className="py-3.5 px-4 text-slate-400">Unreliable parsing</td>
                  <td className="py-3.5 px-4 text-rose-400">Not supported</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Keyword Importance</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">TF-IDF Weighted Vectors</td>
                  <td className="py-3.5 px-4 text-slate-400">Opaque tokens</td>
                  <td className="py-3.5 px-4 text-rose-400">Raw frequency only</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Data Privacy</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Private Supabase Vault</td>
                  <td className="py-3.5 px-4 text-amber-400">Sent to 3rd-party APIs</td>
                  <td className="py-3.5 px-4 text-slate-400">Local</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Explainability</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">100% Mathematical</td>
                  <td className="py-3.5 px-4 text-rose-400">Black-box weights</td>
                  <td className="py-3.5 px-4 text-slate-400">Binary match</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CTA BANNER */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-brand-600/30 via-slate-900 to-indigo-600/30 border border-brand-500/30 text-center space-y-6 overflow-hidden">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Look Inside Your Documents?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Upload any PDF, DOCX, or TXT file and experience real NLP document intelligence in seconds.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/upload">
              <Button size="lg" variant="glow" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Upload Document Now
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline">
                Open Document Vault
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
