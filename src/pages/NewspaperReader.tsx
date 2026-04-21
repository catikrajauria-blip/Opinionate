import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Newspaper, newspaperService } from '../lib/newspaperService';
import { formatDate, cn } from '../lib/utils';
import { Calendar, ChevronLeft, Share2, Printer, Newspaper as NewspaperIcon, Clock, ShieldCheck, Download } from 'lucide-react';

export default function NewspaperReader() {
  const { id } = useParams<{ id: string }>();
  const [newspaper, setNewspaper] = useState<Newspaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pdf' | 'transcription'>('pdf');

  useEffect(() => {
    if (id) {
      loadNewspaper();
    }
  }, [id]);

  const loadNewspaper = async () => {
    setLoading(true);
    try {
      const data = await newspaperService.getNewspaperById(id!);
      if (data) {
        setNewspaper(data);
        // Default to transcription if no PDF exists
        if (!data.pdfUrl) {
          setViewMode('transcription');
        }
      } else {
        setError('Newspaper edition not found.');
      }
    } catch (err: any) {
      console.error('Error loading newspaper:', err);
      setError('An error occurred while loading the newspaper.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newspaper?.title || 'Daily Newspaper',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-serif animate-pulse">Preparing your digital edition...</p>
        </div>
      </div>
    );
  }

  if (error || !newspaper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page px-4">
        <div className="max-w-md w-full text-center space-y-8 p-12 rounded-[3rem] bg-surface border border-border">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
             <NewspaperIcon size={40} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-text-primary tracking-tighter">{error || 'Edition Missing'}</h1>
          <p className="text-text-secondary font-serif">The requested newspaper edition is currently unavailable in our archives.</p>
          <Link 
            to="/newspapers" 
            className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs hover:gap-4 transition-all"
          >
            <ChevronLeft size={16} /> Back to Archives
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col">
      {/* Newspaper Header */}
      <header className="sticky top-0 z-50 bg-bg-page/80 backdrop-blur-md border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/newspapers" className="p-2 hover:bg-surface rounded-full transition-colors text-text-secondary hover:text-text-primary flex-shrink-0">
              <ChevronLeft size={20} />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent hidden sm:block">Digital Newspaper Archive</p>
              <h2 className="text-sm font-bold truncate">{newspaper.title}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {newspaper.pdfUrl && (
              <div className="hidden md:flex bg-surface rounded-xl p-1 border border-border mr-2">
                <button 
                  onClick={() => setViewMode('pdf')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    viewMode === 'pdf' ? "bg-text-primary text-bg-page shadow-md" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  Original
                </button>
                <button 
                  onClick={() => setViewMode('transcription')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    viewMode === 'transcription' ? "bg-text-primary text-bg-page shadow-md" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  Text Mode
                </button>
              </div>
            )}
            <button 
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-border hover:bg-surface transition-all text-text-secondary hover:text-accent"
              title="Share Edition"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {viewMode === 'pdf' && newspaper.pdfUrl ? (
          <div className="flex-grow bg-[#525659] dark:bg-bg-page relative flex flex-col items-center">
             {/* Anti-Download Overlay for Desktop (optional, mostly psychological) */}
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-white/70 border border-white/10 pointer-events-none">
                <ShieldCheck size={12} className="text-accent" /> Protected Viewing Mode
             </div>
             
             {/* PDF Viewer Iframe */}
             <div className="w-full h-[calc(100vh-76px)] relative overflow-hidden">
                <iframe 
                  src={`${newspaper.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full border-none"
                  title={newspaper.title}
                  style={{ userSelect: 'none' }}
                />
                
                {/* Visual Guard: Transparent div over the area where download buttons usually appear in some browsers */}
                <div className="absolute top-0 right-0 w-48 h-16 pointer-events-auto bg-transparent z-30" onContextMenu={(e) => e.preventDefault()} />
             </div>

             {/* Reader Notice */}
             <div className="w-full py-4 bg-bg-page border-t border-border flex justify-center items-center gap-6 px-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2">
                   <Calendar size={14} className="text-accent" /> {newspaper.date}
                </p>
                <div className="h-4 w-px bg-border" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                   Edition ID: <span className="text-text-primary">{newspaper.id.slice(0, 8)}</span>
                </p>
             </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8 md:py-16 w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Metadata */}
              <div className="text-center space-y-6 pb-12 border-b border-border/50">
                <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                   <span className="flex items-center gap-1.5"><Calendar size={14} className="text-accent" /> {newspaper.date}</span>
                   <span className="w-1 h-1 bg-border rounded-full" />
                   <span className="flex items-center gap-1.5"><Clock size={14} className="text-accent" /> Digital Text Mode</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter leading-tight">
                  {newspaper.title}
                </h1>
              </div>

              {/* Content */}
              <div className="prose prose-sm md:prose-base !max-w-none dark:prose-invert NewspaperReader_Markdown">
                <ReactMarkdown>{newspaper.content}</ReactMarkdown>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Footer Card - only show if not in full PDF mode */}
      {viewMode === 'transcription' && (
        <div className="max-w-3xl mx-auto px-4 pb-20 w-full">
          <div className="p-10 bg-surface border border-border rounded-[3rem] text-center space-y-6">
             <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto text-bg-page mb-6">
                <NewspaperIcon size={32} />
             </div>
             <h3 className="text-2xl font-serif font-bold">Stay Opinionated</h3>
             <p className="text-text-secondary font-serif max-w-sm mx-auto">
                Join our community of deep thinkers and receive daily analytical commentary directly in your dashboard.
             </p>
             <Link 
               to="/login"
               className="inline-block px-10 py-4 bg-text-primary text-bg-page rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-accent transition-all duration-500"
             >
               Join the Discourse
             </Link>
          </div>
        </div>
      )}

      {/* Custom Styles for Newspaper Layout */}
      <style>{`
        .NewspaperReader_Markdown h1 {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 1.1;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }
        .NewspaperReader_Markdown h2 {
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          font-weight: 700;
          letter-spacing: -0.03em;
          border-bottom: 2px solid var(--accent);
          display: inline-block;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
        }
        .NewspaperReader_Markdown p {
          color: var(--text-secondary);
          line-height: 1.8;
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
        }
        /* Mobile PDF iframe adjustment */
        @media (max-width: 768px) {
           iframe {
              height: calc(100vh - 120px) !important;
           }
        }
        @media print {
          header, .mt-20, .z-20 {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          .bg-bg-page {
             background: white !important;
             color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
