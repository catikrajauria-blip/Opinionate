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

const CATEGORIES = [
  { id: 'all', name: 'All News', icon: NewsIcon },
  { id: 'finance', name: 'Finance', icon: TrendingUp },
  { id: 'politics', name: 'Politics', icon: Globe2 },
  { id: 'geopolitics', name: 'Geopolitics', icon: Globe2 },
  { id: 'tech', name: 'Tech', icon: Cpu },
];

export default function News() {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState<Record<string, 'like' | 'dislike' | null>>({});

  useEffect(() => {
    fetchNews();
  }, [activeCategory]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      let results: any[] = [];
      if (activeCategory === 'all') {
        const promises = CATEGORIES.slice(1).map(cat => blogService.getNewsByCategory(cat.id, 10));
        const allResults = await Promise.all(promises);
        results = allResults.flat().sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
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
    <div className="max-w-6xl mx-auto py-12 px-4 md:px-8">
      {/* Header */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase leading-none mb-6">
              Daily Ne<span className="text-accent italic">w</span>s.
            </h1>
            <p className="text-text-secondary font-display font-medium text-lg max-w-xl">
              Curated external reports and market updates analyzed through a critical lens.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary">
             <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
             LIVE FEED UPDATED: {new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-12 border-b border-border pb-8">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest transition-all",
                isActive 
                  ? "bg-accent text-bg-page glow-cyan" 
                  : "bg-surface text-text-secondary hover:text-accent hover:bg-accent/5 border border-border/50"
              )}
            >
              <Icon size={14} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-sm border border-border/50 p-8 animate-pulse">
                <div className="h-4 w-1/4 bg-border mb-6" />
                <div className="h-8 w-full bg-border mb-4" />
                <div className="h-4 w-2/3 bg-border" />
              </div>
            ))
          ) : news.length > 0 ? (
            news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-surface rounded-sm border border-border/50 hover:border-accent/40 transition-all p-8 flex flex-col h-full relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={20} className="text-accent" />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.2em] px-3 py-1 bg-accent/5 border border-accent/20 rounded-full">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary">
                    <Clock size={12} />
                    {formatDate(item.createdAt)}
                  </div>
                </div>

                <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-4 group-hover:text-accent transition-colors leading-tight">
                  {item.title}
                </h3>

                <p className="text-text-secondary text-sm leading-relaxed mb-8 flex-grow">
                  {item.summary}
                </p>

                <div className="mt-auto pt-8 border-t border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleLike(item.id)}
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-mono font-bold transition-colors",
                        interactions[item.id] === 'like' ? "text-accent" : "text-text-secondary hover:text-accent"
                      )}
                    >
                      <ThumbsUp size={14} />
                      {item.likesCount || 0}
                    </button>
                    <button 
                      onClick={() => handleDislike(item.id)}
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-mono font-bold transition-colors",
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
                    className="flex items-center gap-2 text-[10px] font-mono font-bold text-text-primary hover:text-accent transition-colors uppercase tracking-widest group/link"
                  >
                    Source: {item.source}
                    <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-surface rounded-sm border border-border border-dashed">
              <NewsIcon size={48} className="mx-auto text-text-secondary opacity-20 mb-6" />
              <p className="text-text-secondary font-display font-bold uppercase tracking-tight">No news reports found in this frequency.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
