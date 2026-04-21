import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Newspaper, newspaperService } from '../lib/newspaperService';
import { formatDate } from '../lib/utils';
import { Calendar, ChevronLeft, Share2, Printer, Newspaper as NewspaperIcon, Clock } from 'lucide-react';

export default function NewspaperReader() {
  const { id } = useParams<{ id: string }>();
  const [newspaper, setNewspaper] = useState<Newspaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <p className="text-text-secondary font-serif animate-pulse">Preparing your personal edition...</p>
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
            to="/" 
            className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs hover:gap-4 transition-all"
          >
            <ChevronLeft size={16} /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      {/* Newspaper Header */}
      <header className="sticky top-0 z-50 bg-bg-page/80 backdrop-blur-md border-b border-border py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-surface rounded-full transition-colors text-text-secondary hover:text-text-primary">
              <ChevronLeft size={20} />
            </Link>
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Daily Commentary</p>
              <h2 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{newspaper.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-border hover:bg-surface transition-all text-text-secondary hover:text-accent"
              title="Share Edition"
            >
              <Share2 size={18} />
            </button>
            <button 
              onClick={() => window.print()}
              className="p-2.5 rounded-xl border border-border hover:bg-surface transition-all text-text-secondary hover:text-text-primary"
              title="Print Edition"
            >
              <Printer size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Metadata */}
          <div className="text-center space-y-6 pb-12 border-b border-border/50">
            <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
               <span className="flex items-center gap-1.5"><Calendar size={14} className="text-accent" /> {newspaper.date}</span>
               <span className="w-1 h-1 bg-border rounded-full" />
               <span className="flex items-center gap-1.5"><Clock size={14} className="text-accent" /> Digital Archive</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter leading-tight">
              {newspaper.title}
            </h1>
            <div className="flex items-center justify-center gap-3">
               <div className="h-0.5 w-12 bg-accent/20" />
               <span className="font-serif italic text-text-secondary">Published by Kartik Rajauria</span>
               <div className="h-0.5 w-12 bg-accent/20" />
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm md:prose-base !max-w-none dark:prose-invert NewspaperReader_Markdown">
            <ReactMarkdown>{newspaper.content}</ReactMarkdown>
          </div>

          {/* Footer Card */}
          <div className="mt-20 p-10 bg-surface border border-border rounded-[3rem] text-center space-y-6">
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
        </motion.div>
      </main>

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
        .NewspaperReader_Markdown ul {
          list-style-type: none;
          padding-left: 0;
          margin-bottom: 2rem;
        }
        .NewspaperReader_Markdown li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }
        .NewspaperReader_Markdown li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: var(--accent);
          font-weight: bold;
        }
        @media print {
          header, .mt-20 {
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
