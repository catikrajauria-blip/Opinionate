import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { Globe, TrendingUp, Landmark, Zap, Newspaper, Calendar, ExternalLink, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  category: string;
  summary: string;
  likesCount?: number;
  dislikesCount?: number;
}

const CATEGORIES = [
  { id: 'finance', name: 'Finance & Markets', icon: <TrendingUp size={14} /> },
  { id: 'politics', name: 'Indian Politics', icon: <Landmark size={14} /> },
  { id: 'geopolitics', name: 'Geopolitics', icon: <Globe size={14} /> },
  { id: 'tech', name: 'Industry & Tech', icon: <Zap size={14} /> }
];

function NewsCard({ item: initialItem, index }: { item: NewsItem; index: number }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(initialItem);
  const [interaction, setInteraction] = useState<'like' | 'dislike' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkInteraction() {
      if (user) {
        const type = await blogService.getNewsInteraction(item.id, user.uid);
        setInteraction(type);
      }
    }
    checkInteraction();
  }, [item.id, user]);

  const handleInteraction = async (type: 'like' | 'dislike') => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (loading || interaction === type) return;

    setLoading(true);
    try {
      if (type === 'like') {
        await blogService.likeNews(item.id, user.uid);
        setItem(prev => ({
          ...prev,
          likesCount: (prev.likesCount || 0) + 1,
          dislikesCount: interaction === 'dislike' ? Math.max(0, (prev.dislikesCount || 0) - 1) : prev.dislikesCount
        }));
      } else {
        await blogService.dislikeNews(item.id, user.uid);
        setItem(prev => ({
          ...prev,
          dislikesCount: (prev.dislikesCount || 0) + 1,
          likesCount: interaction === 'like' ? Math.max(0, (prev.likesCount || 0) - 1) : prev.likesCount
        }));
      }
      setInteraction(type);
    } catch (err) {
      console.error('Error in news interaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group p-8 bg-surface border border-border rounded-xl hover:border-text-primary transition-all shadow-sm hover:shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-8">
        <div className="w-14 h-14 bg-bg-page rounded-xl border border-border flex items-center justify-center text-text-primary flex-shrink-0 group-hover:bg-text-primary group-hover:text-bg-page transition-colors">
          <Newspaper size={24} />
        </div>
        <div className="flex-grow min-w-0">
           <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary px-2 py-0.5 border border-border rounded">{item.source || 'Premium Source'}</span>
                 <div className="flex items-center gap-3 border-l border-border pl-3">
                    <button 
                      onClick={() => handleInteraction('like')}
                      disabled={loading}
                      className={cn(
                        "flex items-center gap-1.5 transition-all hover:scale-105",
                        interaction === 'like' ? "text-green-500" : "text-text-secondary/40 hover:text-green-500"
                      )}
                    >
                      <ThumbsUp size={12} className={interaction === 'like' ? "fill-green-500" : ""} />
                      <span className="text-[10px] font-mono">{item.likesCount || 0}</span>
                    </button>
                    <button 
                      onClick={() => handleInteraction('dislike')}
                      disabled={loading}
                      className={cn(
                        "flex items-center gap-1.5 transition-all hover:scale-105",
                        interaction === 'dislike' ? "text-red-500" : "text-text-secondary/40 hover:text-red-500"
                      )}
                    >
                      <ThumbsDown size={12} className={interaction === 'dislike' ? "fill-red-500" : ""} />
                      <span className="text-[10px] font-mono">{item.dislikesCount || 0}</span>
                    </button>
                 </div>
              </div>
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
             Investigate Deep Summary <ExternalLink size={10} />
           </a>
        </div>
      </div>
    </motion.div>
  );
}

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
              <NewsCard key={item.id} item={item} index={idx} />
            ))}
            {(!news[activeCategory] || news[activeCategory].length === 0) && !loadingCategory && (
              <div className="py-20 text-center border border-dashed border-border rounded-xl">
                <p className="text-text-secondary font-serif italic text-sm">No curated news items available in this category yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
