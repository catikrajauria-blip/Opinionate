import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Document, Page, pdfjs } from 'react-pdf';
import { Newspaper, newspaperService } from '../lib/newspaperService';
import { formatDate, cn } from '../lib/utils';
import { 
  Calendar, 
  ChevronLeft, 
  Share2, 
  Newspaper as NewspaperIcon, 
  Clock, 
  ShieldCheck, 
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronRight,
  Maximize2
} from 'lucide-react';

// Setup PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export default function NewspaperReader() {
  const { id } = useParams<{ id: string }>();
  const [newspaper, setNewspaper] = useState<Newspaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pdf' | 'transcription'>('pdf');
  
  // PDF State
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadNewspaper();
    }
  }, [id]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(width);
        // Auto-scale for mobile on first load
        if (width < 768 && scale === 1.0) {
          setScale(0.7);
        }
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [viewMode]);

  const loadNewspaper = async () => {
    setLoading(true);
    try {
      const data = await newspaperService.getNewspaperById(id!);
      if (data) {
        setNewspaper(data);
        if (!data.pdfUrl) {
          setViewMode('transcription');
        }
        // Track the read
        newspaperService.incrementReadCount(id!).catch(e => console.error("Track read error:", e));
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

  const handleDownload = async () => {
    if (!newspaper?.pdfUrl) return;
    
    try {
      // Track the download
      await newspaperService.incrementDownloadCount(id!);
      
      // Trigger actual download
      const link = document.createElement('a');
      link.href = newspaper.pdfUrl;
      link.download = `${newspaper.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download error:", e);
      // Fallback to simple link opening if tracking fails
      window.open(newspaper.pdfUrl, '_blank');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setScale(1.0);

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
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col overflow-hidden">
      {/* Newspaper Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-page/80 backdrop-blur-md border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/newspapers" className="p-2 hover:bg-surface rounded-full transition-colors text-text-secondary hover:text-text-primary flex-shrink-0">
              <ChevronLeft size={20} />
            </Link>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent hidden sm:block">Digital Newspaper Archive</p>
              <h2 className="text-xs md:text-sm font-bold truncate">{newspaper.title}</h2>
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
              className="p-2 rounded-lg border border-border hover:bg-surface transition-all text-text-secondary hover:text-accent"
              title="Share Edition"
            >
              <Share2 size={16} />
            </button>
            <button 
              onClick={handleDownload}
              className="p-2 rounded-lg bg-accent text-bg-page hover:opacity-90 transition-all sm:hidden"
              title="Download PDF"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Reader View */}
      <main className="flex-grow pt-[72px] flex flex-col relative h-full overflow-hidden">
        {viewMode === 'pdf' && newspaper.pdfUrl ? (
          <div className="flex-grow bg-[#1a1a1a] relative flex flex-col overflow-hidden h-[calc(100vh-72px)]">
             {/* PDF Controls Floating Panel */}
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 bg-surface/90 backdrop-blur-xl border border-border p-2 rounded-2xl shadow-2xl flex items-center gap-1 md:gap-4">
                <div className="flex items-center gap-1">
                  <button onClick={handleZoomOut} className="p-2 hover:bg-bg-page rounded-xl text-text-secondary transition-colors"><ZoomOut size={16} /></button>
                  <span className="text-[10px] font-extrabold w-12 text-center text-text-primary">{Math.round(scale * 100)}%</span>
                  <button onClick={handleZoomIn} className="p-2 hover:bg-bg-page rounded-xl text-text-secondary transition-colors"><ZoomIn size={16} /></button>
                </div>
                
                <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
                
                <div className="flex items-center gap-1">
                   <button 
                     disabled={pageNumber <= 1}
                     onClick={() => setPageNumber(prev => prev - 1)} 
                     className="p-2 disabled:opacity-30 hover:bg-bg-page rounded-xl text-text-secondary"
                   >
                     <ChevronLeft size={16} />
                   </button>
                   <span className="text-[10px] font-extrabold px-2 text-text-primary">
                     {pageNumber} <span className="opacity-30">/</span> {numPages || '...'}
                   </span>
                   <button 
                     disabled={pageNumber >= numPages}
                     onClick={() => setPageNumber(prev => prev + 1)} 
                     className="p-2 disabled:opacity-30 hover:bg-bg-page rounded-xl text-text-secondary"
                   >
                     <ChevronRight size={16} />
                   </button>
                </div>

                <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

                <button 
                   onClick={handleDownload}
                   className="hidden sm:flex items-center gap-2 px-4 py-2 hover:bg-bg-page rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-all"
                >
                   <Download size={16} /> Download
                </button>
             </div>

             {/* Rendering Area */}
             <div 
               ref={containerRef}
               className="flex-grow overflow-auto flex justify-center bg-[#1a1a1a] p-2 sm:p-4 md:p-8 custom-scrollbar scroll-smooth relative"
             >
                <div className="relative shadow-2xl origin-top transition-all duration-200">
                  <Document
                    file={newspaper.pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex flex-col items-center"
                    loading={
                      <div className="flex flex-col items-center gap-4 py-20">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Rendering Page...</p>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={scale}
                      width={containerWidth ? Math.min(containerWidth - (window.innerWidth < 640 ? 16 : 64), 1200) : undefined}
                      className="rounded-lg overflow-hidden"
                      renderAnnotationLayer={false}
                      renderTextLayer={true}
                    />
                  </Document>
                </div>
             </div>
             
             {/* Bottom Mobile View Toggle */}
             <div className="bg-bg-page border-t border-border py-4 px-6 md:hidden flex justify-between items-center z-30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                  Original Print View
                </p>
                <button 
                  onClick={() => setViewMode('transcription')}
                  className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
                >
                  Switch to Reading Mode
                </button>
             </div>
          </div>
        ) : (
          <div className="flex-grow overflow-auto px-4 py-8 md:py-16">
            <div className="max-w-3xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* Metadata */}
                <div className="text-center space-y-6 pb-12 border-b border-border/50">
                  <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">
                     <span className="flex items-center gap-1.5"><Calendar size={14} className="text-accent" /> {newspaper.date}</span>
                     <span className="w-1 h-1 bg-border rounded-full" />
                     <span className="flex items-center gap-1.5"><Clock size={14} className="text-accent" /> Digital Reading Mode</span>
                  </div>
                  <h1 className="text-3xl md:text-6xl font-serif font-bold tracking-tighter leading-tight">
                    {newspaper.title}
                  </h1>
                  {newspaper.pdfUrl && (
                    <button 
                      onClick={() => setViewMode('pdf')}
                      className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2 mx-auto hover:gap-4 transition-all"
                    >
                      View Original PDF Edition <ChevronRight size={14} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="prose prose-lg !max-w-none dark:prose-invert NewspaperReader_Markdown">
                  <ReactMarkdown>{newspaper.content}</ReactMarkdown>
                </div>

                {/* Footer Invite */}
                <div className="p-12 bg-surface border border-border rounded-[3rem] text-center space-y-6 mt-20">
                   <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto text-bg-page mb-6 shadow-xl shadow-accent/20">
                      <NewspaperIcon size={32} />
                   </div>
                   <h3 className="text-2xl font-serif font-bold tracking-tight">Access the Archives</h3>
                   <p className="text-text-secondary font-serif max-w-sm mx-auto leading-relaxed">
                      Stay informed with our deep archives of analytical commentary, now available in both print and digital layouts.
                   </p>
                   <Link 
                     to="/newspapers"
                     className="inline-block px-10 py-4 bg-text-primary text-bg-page rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-accent transition-all duration-500 shadow-xl"
                   >
                     Explore All Editions
                   </Link>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      {/* Global Style Overrides */}
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
        .react-pdf__Page {
           margin-bottom: 2rem;
           box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5);
           background-color: white !important;
        }
        .react-pdf__Page__canvas {
           margin: 0 auto;
        }
        @media print {
          header, .bottom-10 {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
