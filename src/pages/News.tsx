import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { blogService } from '../lib/blogService';
import { NewsItem } from '../types';
import { 
  TrendingUp, Globe2, Briefcase, Cpu, 
  ExternalLink, ThumbsUp, ThumbsDown, 
  Clock, Share2, Newspaper as NewsIcon,
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn, formatDate } from '../lib/utils';

import { useSearchParams } from 'react-router-dom';

const CATEGORIES = [
  { id: 'all', name: 'All News', icon: NewsIcon },
  { id: 'finance', name: 'Finance', icon: TrendingUp },
  { id: 'indian-politics', name: 'Indian Politics', icon: Globe2 },
  { id: 'tech', name: 'Tech', icon: Cpu },
  { id: 'geopolitics', name: 'Geopolitics', icon: Globe2 },
];

export default function News() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState<Record<string, 'like' | 'dislike' | null>>({});

  useEffect(() => {
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  useEffect(() => {
    fetchNews();
    if (activeCategory === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: activeCategory });
    }
  }, [activeCategory]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      let results: any[] = [];
      if (activeCategory === 'all') {
        const promises = CATEGORIES.slice(1).map(cat => blogService.getNewsByCategory(cat.id, 10));
        const allResults = await Promise.all(promises);
        const flattened = allResults.flat() as NewsItem[];
        results = flattened.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      } else {
        results = await blogService.getNewsByCategory(activeCategory, 20);
      }
      setNews(results as NewsItem[]);
      
      // Fetch interactions if user is logged in
      if (user) {
        const interactionPromises = results.map(item => blogService.getNewsInteraction(item.id, user.uid));
        const interactionResults = await Promise.all(interactionPromises);
        const interactionMap: Record<string, any> = {};
        results.forEach((item, index) => {
          interactionMap[item.id] = interactionResults[index];
        });
        setInteractions(interactionMap);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (newsId: string) => {
    if (!user) {
      alert('Please log in to react to news');
      return;
    }
    try {
      await blogService.likeNews(newsId, user.uid);
      setInteractions(prev => ({ ...prev, [newsId]: 'like' }));
      // Refresh counts locally for better UX
      setNews(prev => prev.map(n => n.id === newsId ? { ...n, likesCount: n.likesCount + 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async (newsId: string) => {
    if (!user) {
      alert('Please log in to react to news');
      return;
    }
    try {
      await blogService.dislikeNews(newsId, user.uid);
      setInteractions(prev => ({ ...prev, [newsId]: 'dislike' }));
      setNews(prev => prev.map(n => n.id === newsId ? { ...n, dislikesCount: n.dislikesCount + 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-24 px-4 md:px-8">
      {/* Header */}
      <div className="mb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="flex-grow">
            <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter uppercase leading-[0.8] mb-8">
              Daily News.
            </h1>
            <p className="text-text-secondary font-display font-medium text-xl md:text-2xl max-w-2xl">
              Handpicked news reports explained clearly.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
             <div className="flex items-center gap-3 px-4 py-2 glass rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_var(--color-accent)]" />
                Live News: Active
             </div>
             <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest opacity-60">Last Updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-20 pb-8 border-b border-border">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-display font-black uppercase tracking-widest transition-all",
                isActive 
                  ? "btn-primary shadow-lg shadow-accent/20" 
                  : "bg-surface text-text-secondary hover:text-text-primary border border-border"
              )}
            >
              <Icon size={14} />
              {cat.name}
            </motion.button>
          );
        })}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-premium h-80 animate-pulse border-border bg-surface/30" />
            ))
          ) : news.length > 0 ? (
            news.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group card-premium flex flex-col h-full relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className={cn(
                    "px-4 py-1 rounded-full text-[9px] font-display font-black uppercase tracking-widest border",
                    item.category.toLowerCase() === 'finance' ? "bg-success/10 text-success border-success/20" :
                    item.category.toLowerCase() === 'politics' ? "bg-warning/10 text-warning border-warning/20" :
                    item.category.toLowerCase() === 'geopolitics' ? "bg-accent/10 text-accent border-accent/20" :
                    "bg-accent/10 text-accent border-accent/20"
                  )}>
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary">
                    <Clock size={12} className="opacity-50" />
                    {formatDate(item.createdAt)}
                  </div>
                </div>

                <h3 className="text-3xl font-display font-black uppercase tracking-tight mb-6 group-hover:text-accent transition-colors leading-[1.1]">
                  {item.title}
                </h3>

                <p className="text-text-secondary text-base leading-relaxed mb-10 flex-grow font-medium">
                  {item.summary}
                </p>

                <div className="mt-auto pt-8 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLike(item.id)}
                      className={cn(
                        "flex items-center gap-2 text-[11px] font-mono font-bold transition-all hover-scale",
                        interactions[item.id] === 'like' ? "text-accent" : "text-text-secondary hover:text-accent"
                      )}
                    >
                      <ThumbsUp size={14} />
                      {item.likesCount || 0}
                    </button>
                    <button 
                      onClick={() => handleDislike(item.id)}
                      className={cn(
                        "flex items-center gap-2 text-[11px] font-mono font-bold transition-all hover-scale",
                        interactions[item.id] === 'dislike' ? "text-accent" : "text-text-secondary hover:text-accent"
                      )}
                    >
                      <ThumbsDown size={14} />
                      {item.dislikesCount || 0}
                    </button>
                  </div>

                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] font-display font-black text-text-primary hover:text-accent transition-colors uppercase tracking-widest"
                  >
                    Source: {item.source}
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center card-premium border-dashed border-border flex flex-col items-center justify-center">
              <NewsIcon size={64} className="text-accent opacity-20 mb-8" />
              <p className="text-text-secondary text-2xl font-display font-black uppercase tracking-tighter">No reports found at the moment.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
