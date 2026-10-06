import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  LayoutDashboard, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Document Vault', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Ingestion Hub', path: '/upload', icon: Upload },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#0a0b10]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300 border border-indigo-400/30">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                    LookinDoc
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                    v1.0
                  </span>
                </div>
                <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline-block">
                  Look inside. Understand more.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  location.pathname === '/'
                    ? 'text-white bg-zinc-800 border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? 'text-white bg-zinc-800 border border-zinc-700/80 shadow-sm'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-400' : 'text-zinc-400'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grounded NLP</span>
            </div>

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
              className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#0a0b10] px-4 pt-3 pb-5 space-y-2.5 animate-slide-up">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            Overview
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              <link.icon className="w-4 h-4 text-indigo-400" />
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
