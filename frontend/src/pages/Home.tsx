import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Search, 
  Sparkles, 
  BarChart3, 
  Tag, 
  Users, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Home: React.FC = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Document Statistics',
      description: 'Instant metrics on word counts, sentence lengths, reading time, and structural density.',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      icon: Tag,
      title: 'TF-IDF Keyword Extraction',
      description: 'Statistical term ranking and importance scoring without hallucinating phantom concepts.',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      icon: Users,
      title: 'Named Entity Recognition',
      description: 'Linguistic entity extraction powered by spaCy for people, organizations, dates, and locations.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      icon: Sparkles,
      title: 'Extractive Summarization',
      description: 'Calculates sentence saliency scores using TF-IDF weights to assemble a grounded summary.',
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      icon: Search,
      title: 'NLP Passage Search',
      description: 'High-precision document retrieval matching natural queries with cosine similarity over TF-IDF vectors.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      icon: HelpCircle,
      title: 'Retrieval-Based Q&A',
      description: 'Directly answers queries with verbatim supporting evidence retrieved from original text chunks.',
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Document',
      description: 'Drop your PDF, DOCX, or TXT file into LookinDoc for ingestion and validation.',
    },
    {
      step: '02',
      title: 'Automated NLP Pipeline',
      description: 'The backend extracts, normalizes, chunks, vectorizes, and identifies named entities.',
    },
    {
      step: '03',
      title: 'Explore & Query',
      description: 'Interact with summaries, extracted insights, keyword graphs, passage search, and Q&A.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-brand-50/50 via-slate-50/50 to-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Grounded NLP Document Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
              Look inside. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                Understand more.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              An NLP-powered document intelligence platform that extracts text, analyzes statistics, ranks keywords, recognizes entities, and provides verifiable Q&A without LLM hallucinations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/upload" className="w-full sm:w-auto">
                <Button size="lg" className="w-full" leftIcon={<Upload className="w-5 h-5" />}>
                  Upload Document
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Supported Formats Pill */}
            <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> PDF Documents
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Word DOCX
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Plain TXT
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Core Capabilities
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Real NLP Under the Hood
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              Every insight is calculated directly from the linguistic and statistical properties of your document.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} hoverEffect className="p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">{feat.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{feat.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Workflow
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              How LookinDoc Processes Documents
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              From raw byte stream to indexed knowledge representation in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((item) => (
              <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-3">
                <span className="text-3xl font-black text-brand-600/30">{item.step}</span>
                <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brand-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to analyze your first document?
          </h3>
          <p className="text-brand-100 max-w-xl mx-auto text-sm sm:text-base">
            Upload any PDF, DOCX, or TXT document and inspect its underlying statistics, keywords, entities, and summary instantly.
          </p>
          <div className="pt-2">
            <Link to="/upload">
              <Button size="lg" variant="secondary" className="bg-white text-brand-700 hover:bg-slate-100 shadow-lg">
                Get Started with LookinDoc
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
