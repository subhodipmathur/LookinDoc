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
  Check, 
  BookOpen, 
  Cpu
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/90 shadow-inner backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              LookinDoc Document Intelligence Platform
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
              v1.0 Ready
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Look inside. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Understand more.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Turn unstructured PDFs, Word documents, and text files into verifiable structured intelligence. Statistical keyword scoring, spaCy Named Entity Recognition, and zero-hallucination document understanding.
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
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Deterministic NLP
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Zero Hallucinations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Encrypted Cloud Storage
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE PRODUCT SHOWCASE DEMO PREVIEW */}
        {/* ========================================================================= */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative p-2 sm:p-3 rounded-3xl bg-[#111827] border border-slate-700/80 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs text-slate-300 font-mono ml-2">lookindoc://vault/nlp_research_paper.pdf</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="brand" size="sm">PDF Engine</Badge>
                <Badge variant="success" size="sm">Indexed</Badge>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="p-4 sm:p-6 space-y-6">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
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
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
                    <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Total Tokens</span>
                      <p className="text-2xl font-black text-white">4,820</p>
                      <span className="text-[10px] text-emerald-400 font-medium">100% parsed</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Sentences</span>
                      <p className="text-2xl font-black text-white">248</p>
                      <span className="text-[10px] text-slate-300">spaCy Segmented</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Reading Time</span>
                      <p className="text-2xl font-black text-white">~24 min</p>
                      <span className="text-[10px] text-slate-300">@ 200 words/min</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Lexical Richness</span>
                      <p className="text-2xl font-black text-sky-400">78.4%</p>
                      <span className="text-[10px] text-slate-300">Type-Token Ratio</span>
                    </div>
                  </div>
                )}

                {demoTab === 'keywords' && (
                  <div className="space-y-3 animate-fadeIn">
                    <p className="text-xs text-slate-300">Ranked statistical key terms weighted via TF-IDF:</p>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { term: 'Neural Architecture', score: 0.94, rank: 1 },
                        { term: 'Natural Language Processing', score: 0.91, rank: 2 },
                        { term: 'Extractive Summarization', score: 0.87, rank: 3 },
                        { term: 'Cosine Similarity', score: 0.83, rank: 4 },
                        { term: 'Document Retrieval', score: 0.79, rank: 5 },
                        { term: 'Vector Chunking', score: 0.74, rank: 6 },
                      ].map((item) => (
                        <div key={item.term} className="px-3.5 py-2 bg-[#0b0f19] border border-slate-800 rounded-xl flex items-center gap-2.5 text-xs">
                          <span className="font-bold text-sky-400">#{item.rank}</span>
                          <span className="font-semibold text-white">{item.term}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 font-bold border border-sky-500/20">
                            {(item.score * 100).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {demoTab === 'entities' && (
                  <div className="space-y-3 animate-fadeIn">
                    <p className="text-xs text-slate-300">spaCy linguistic entity recognition with frequencies:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { name: 'Dr. Alan Turing', type: 'Person', count: 12 },
                        { name: 'Google DeepMind', type: 'Organization', count: 8 },
                        { name: 'Cambridge University', type: 'Institution', count: 5 },
                        { name: 'United Kingdom', type: 'Location', count: 6 },
                        { name: 'October 1950', type: 'Date', count: 3 },
                        { name: 'Turing Test', type: 'Concept/Product', count: 15 },
                      ].map((ent) => (
                        <div key={ent.name} className="p-3 bg-[#0b0f19] border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">{ent.name}</p>
                            <span className="text-[10px] text-sky-400">{ent.type}</span>
                          </div>
                          <Badge variant="neutral" size="sm">{ent.count}x</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {demoTab === 'summary' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                        Extractive Salience Summary (5 Key Sentences)
                      </span>
                      <Badge variant="success" size="sm">64% Compression</Badge>
                    </div>
                    <div className="p-4 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed italic space-y-2">
                      <p>"Artificial Intelligence and Natural Language Processing have experienced unprecedented breakthroughs in computational modeling."</p>
                      <p>"Statistical vector space models and term frequency weighting provide grounded representations that avoid hallucination."</p>
                    </div>
                  </div>
                )}

                {demoTab === 'qa' && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="p-3.5 bg-[#0b0f19] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-300">Question: <strong className="text-white">What provides grounded representations?</strong></span>
                      <Badge variant="brand" size="sm">Cosine Similarity</Badge>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verifiable Ground Truth Answer</span>
                      <p className="text-xs font-semibold text-white leading-relaxed">
                        "Statistical vector space models and term frequency weighting provide grounded representations that avoid hallucination."
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
      {/* FEATURE PILLARS */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-white">
            Built for Long-Form Document Analysis
          </h2>
          <p className="text-sm text-slate-300">
            Engineered with high optical contrast, eye-soothing slate themes, and deterministic algorithms for effortless reading and research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Eye-Soothing Document Reader</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Read and inspect multi-page documents in a comfortable, glare-free interface with real-time text filtering, copy actions, and typography designed for extended sessions.
            </p>
          </Card>

          <Card hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">TF-IDF Keyword Weighting</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculates unigram and bigram statistical term importance with sublinear TF scaling, distinguishing key technical vocabulary from common stopwords.
            </p>
          </Card>

          <Card hoverEffect className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">spaCy Named Entity Recognition</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              High-accuracy linguistic model identifying Persons, Organizations, Locations, Dates, Currencies, and Laws with frequency aggregation and categorized filters.
            </p>
          </Card>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COMPARISON TABLE */}
      {/* ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Card className="p-8 sm:p-10 space-y-8 bg-[#111827]">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Deterministic NLP?
            </h2>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              How LookinDoc compares to basic regex search and opaque generative LLMs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-300 font-bold">
                  <th className="py-3.5 px-4">Feature</th>
                  <th className="py-3.5 px-4 text-sky-400 font-black">LookinDoc NLP</th>
                  <th className="py-3.5 px-4 text-slate-400">External Generative LLMs</th>
                  <th className="py-3.5 px-4 text-slate-400">Basic Search</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
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
        <div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-sky-600/20 via-[#111827] to-indigo-600/20 border border-sky-500/30 text-center space-y-6 overflow-hidden shadow-2xl">
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
