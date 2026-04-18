import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { Globe, TrendingUp, Landmark, Zap, Newspaper, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  category: string;
  summary: string;
}

const CATEGORIES = [
  { id: 'finance', name: 'Finance & Markets', icon: <TrendingUp size={14} /> },
  { id: 'politics', name: 'Indian Politics', icon: <Landmark size={14} /> },
  { id: 'geopolitics', name: 'Geopolitics', icon: <Globe size={14} /> },
  { id: 'tech', name: 'Industry & Tech', icon: <Zap size={14} /> }
];

export default function Newsletter() {
  const [news, setNews] = useState<Record<string, NewsItem[]>>({});
  const [activeCategory, setActiveCategory] = useState('finance');
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!news[activeCategory]) {
      fetchCategoryNews(activeCategory);
    }
  }, [activeCategory]);

  const fetchCategoryNews = async (categoryId: string) => {
    setError(null);
    setLoadingCategory(categoryId);
    try {
      const parsedNews = await blogService.getNewsByCategory(categoryId, 20) as NewsItem[];
      setNews(prev => ({ ...prev, [categoryId]: parsedNews }));
    } catch (err: any) {
      console.error(`Error fetching ${categoryId} news:`, err);
      setError("Failed to load curated news. Please check your connection.");
    } finally {
      setLoadingCategory(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-text-secondary bg-surface px-4 py-2 rounded-full border border-border mb-6">
           <Newspaper size={12} /> Curated Daily Briefings
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight text-text-primary">The Pulse</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto font-serif leading-relaxed italic">
          "Expertly curated news from global premium sources, selected for the sophisticated reader."
        </p>
      </motion.div>

      <div className="mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-text-secondary bg-surface px-4 py-2 rounded-full border border-border mb-4">
               <Calendar size={12} /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <h2 className="text-3xl font-serif font-bold mb-2">Today's Selected Reading</h2>
            <p className="text-text-secondary font-serif italic max-w-sm">Deep headlines from premium sources analyzed for you.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all border",
                  activeCategory === cat.id 
                    ? "bg-text-primary text-bg-page border-text-primary" 
                    : "bg-surface text-text-secondary border-border hover:border-text-primary"
                )}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loadingCategory === activeCategory ? (
          <div className="py-24 flex flex-col items-center justify-center text-text-secondary bg-surface rounded-xl border border-border">
             <Loader2 size={32} className="animate-spin mb-4" />
             <p className="font-serif italic text-sm">Loading curated insights...</p>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-10 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
             <h3 className="text-lg font-serif font-bold text-red-900 dark:text-red-400 mb-2">Notice</h3>
             <p className="text-red-700 dark:text-red-300 font-serif max-w-md mx-auto text-sm mb-6">
                {error}
             </p>
             <button 
               onClick={() => fetchCategoryNews(activeCategory)}
               className="btn-minimal px-8 py-2 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
             >
                Try refreshing
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            {(news[activeCategory] || []).map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-8 bg-surface border border-border rounded-xl hover:border-text-primary transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  <div className="w-14 h-14 bg-bg-page rounded-xl flex items-center justify-center text-text-primary flex-shrink-0 group-hover:bg-text-primary group-hover:text-bg-page transition-colors">
                    <Newspaper size={24} />
                  </div>
                  <div className="flex-grow">
                     <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary px-2 py-0.5 border border-border rounded">{item.source || 'Premium Source'}</span>
                     </div>
                     <h3 className="text-xl font-serif font-bold mb-3 leading-snug">{item.title}</h3>
                     <p className="text-text-secondary text-[14px] leading-relaxed font-serif mb-6 group-hover:text-text-primary transition-colors">
                        {item.summary}
                     </p>
                     <a 
                       href={item.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-primary border-b border-text-primary pb-0.5 hover:gap-4 transition-all"
                     >
                       Read full report <ExternalLink size={10} />
                     </a>
                  </div>
                </div>
              </motion.div>
            ))}
            {(!news[activeCategory] || news[activeCategory].length === 0) && !loadingCategory && (
              <div className="py-20 text-center border border-dashed border-border rounded-xl">
                <p className="text-text-secondary font-serif italic text-sm">No curated news items available in this category yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-12 bg-surface border border-border rounded-xl text-center">
         <Zap size={32} className="mx-auto mb-6 text-text-primary" />
         <h2 className="text-2xl font-serif font-bold mb-4">Tactical Intelligence</h2>
         <p className="text-text-secondary max-w-xl mx-auto font-serif">
           Deciphering emerging technologies and industry-specific shifts that truly matter.
         </p>
      </div>
    </div>
  );
}
