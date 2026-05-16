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
    <div className="max-w-7xl mx-auto py-16 md:py-24 px-4 md:px-8">
      {/* Header */}
      <div className="mb-20 md:mb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-6 md:gap-8"
        >
          <div className="flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[1.1] mb-6 px-4">
              Daily News.
            </h1>
            <p className="text-text-secondary font-display font-medium text-base md:text-xl max-w-xl px-6">
              Handpicked news reports explained clearly.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3">
             <div className="flex items-center gap-3 px-4 py-2 glass rounded-full text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-widest text-accent">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Live News: Active
             </div>
             <p className="text-[8px] md:text-[9px] font-mono text-text-secondary uppercase tracking-widest opacity-60">Last Updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-16 md:mb-20 pb-8 border-b border-border">
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
                "flex items-center gap-2 md:gap-3 px-6 md:px-8 py-2.5 md:py-3 rounded-full text-[9px] md:text-[10px] font-display font-black uppercase tracking-widest transition-all",
                isActive 
                   ? "btn-primary shadow-lg shadow-accent/20" 
                   : "bg-surface text-text-secondary hover:text-text-primary border border-border"
              )}
            >
              <Icon size={12} className="md:w-[14px] md:h-[14px]" />
              {cat.name}
            </motion.button>
          );
        })}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-premium h-80 animate-pulse border-border bg-surface/30" />
            ))
          ) : news.length > 0 ? (
            news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group card-premium flex flex-col h-full relative overflow-hidden text-center items-center"
              >
                <div className="flex items-center justify-between mb-8 w-full">
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

                <h3 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight mb-6 group-hover:text-accent transition-colors leading-[1.1] text-center px-2">
                  {item.title}
                </h3>

                <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-10 flex-grow font-medium text-center px-4">
                  {item.summary}
                </p>

                <div className="mt-auto pt-8 border-t border-border w-full flex items-center justify-between">
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
      </div>
    </div>
  );
}
