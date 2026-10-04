import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  LayoutDashboard, 
  Menu, 
  X,
  Sparkles,
  Code2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { healthApi } from '../../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let isMounted = true;
    healthApi.checkHealth()
      .then(() => {
        if (isMounted) setBackendStatus('online');
      })
      .catch(() => {
        if (isMounted) setBackendStatus('offline');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = [
    { name: 'Document Library', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Ingestion Hub', path: '/upload', icon: Upload },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-all duration-300 border border-brand-400/30">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500" />
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white group-hover:text-brand-300 transition-colors">
                    LookinDoc
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-500/10 text-brand-400 border border-brand-500/30 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-brand-400" />
                    v1.0
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
                  Look inside. Understand more.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  location.pathname === '/'
                    ? 'text-white bg-slate-800/80 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                Overview
              </Link>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      active
                        ? 'text-white bg-slate-800/80 border border-slate-700/80 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-400" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Backend status indicator */}
            <div className="flex items-center gap-2">
              {backendStatus === 'online' ? (
                <Badge variant="success" size="sm" icon={<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}>
                  Engine Active
                </Badge>
              ) : backendStatus === 'offline' ? (
                <Badge variant="error" size="sm" icon={<span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}>
                  API Offline
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  Checking Engine...
                </Badge>
              )}
            </div>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              API Docs
            </a>

            <Link to="/upload">
              <Button size="sm" variant="glow" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                Upload Document
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-2.5 animate-slide-up">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
          >
            Overview
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900"
            >
              <link.icon className="w-4 h-4 text-brand-400" />
              {link.name}
            </Link>
          ))}
          <div className="pt-2">
            <Link to="/upload" onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
              <Button className="w-full" variant="glow" leftIcon={<Upload className="w-4 h-4" />}>
                Upload Document
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
