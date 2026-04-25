import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { blogService } from '../lib/blogService';
import { wordService, WordOfTheDay } from '../lib/wordService';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import RatingSystem from '../components/RatingSystem';
import CommentSection from '../components/CommentSection';
import NewsletterBox from '../components/NewsletterBox';
import PollWidget from '../components/PollWidget';
import { calculateReadingTime, formatDate, generateUserId, cn } from '../lib/utils';
import { Eye, Heart, MessageSquare, Clock, Share2, Bookmark, BookmarkCheck, Zap, ExternalLink, Newspaper as NewspaperIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [wotd, setWotd] = useState<WordOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => user?.uid || generateUserId());
  const [likingId, setLikingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTodayData() {
      try {
        const [todayBlogs, latestWord] = await Promise.all([
          blogService.getTodayBlogs(),
          wordService.getLatestWord()
        ]);
        
        setBlogs(todayBlogs);
        setWotd(latestWord);
        
        // Track views for the first one if it exists
        if (todayBlogs.length > 0) {
           try {
             await blogService.incrementViews(todayBlogs[0].id, userId);
           } catch (viewError) {
             console.warn('Failed to increment views on home:', viewError);
           }
        }
      } catch (error) {
        console.error('Error loading today data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTodayData();
  }, [userId]);

  const handleLike = async (e: React.MouseEvent, blogId: string, idx: number) => {
    e.preventDefault();
    if (likingId) return;
    
    setLikingId(blogId);
    try {
      const success = await blogService.incrementLikes(blogId, userId);
      if (success) {
        const newBlogs = [...blogs];
        newBlogs[idx] = { ...newBlogs[idx], likesCount: (newBlogs[idx].likesCount || 0) + 1 };
        setBlogs(newBlogs);
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    } finally {
      setLikingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-40 flex flex-col items-center justify-center gap-8">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-2 border-accent/20 rounded-full" />
          <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin glow-cyan" />
          <div className="absolute inset-4 border-2 border-pink-500/20 rounded-full" />
          <div className="absolute inset-4 border-b-2 border-pink-500 rounded-full animate-spin-reverse glow-pink" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] animate-pulse text-accent">INITIALIZING_OPINIO_PROTOCOL...</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-3xl p-12 border border-border"
        >
          <h2 className="text-3xl font-display font-black text-text-secondary mb-4 italic">Today's opinion coming soon</h2>
          <p className="text-text-secondary mb-8 font-display font-bold uppercase tracking-tight">Check back later or browse our archive for previous deep dives.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      <header className="py-24 md:py-48 border-b border-border/30 mb-0 text-center relative overflow-hidden bg-bg-page">
         {/* Aesthetic background elements */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none">
            <motion.div 
               animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, 0],
                  opacity: [0.03, 0.05, 0.03]
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-0 left-0 w-full h-full font-display font-black text-[40vw] flex items-center justify-center select-none uppercase tracking-tighter text-accent/20"
            >
               OPINIO
            </motion.div>
            
            <div className="absolute top-[10%] right-[5%] w-[50%] h-[50%] bg-accent/20 blur-[180px] rounded-full animate-pulse" />
            <div className="absolute bottom-[10%] left-[0%] w-[40%] h-[40%] bg-secondary-accent/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
         </div>

         {user && (
           <motion.div 
             initial={{ opacity: 0, x: -20 }} 
             animate={{ opacity: 1, x: 0 }} 
             className="inline-flex items-center gap-3 px-6 py-2 bg-accent/5 backdrop-blur-xl border border-accent/20 rounded-sm mb-12 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent glow-cyan"
           >
              <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
              SYSTEM_LINK_ACTIVE: <span className="text-text-primary">{user.displayName || user.email?.split('@')[0]}</span>
           </motion.div>
         )}
         
         <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="relative z-10"
         >
           <motion.h1 
             className="text-[15vw] md:text-9xl lg:text-[13rem] font-display font-black mb-8 tracking-tighter leading-none uppercase"
           >
             The Briefin<span className="text-accent italic drop-shadow-[0_0_30px_rgba(0,238,255,0.5)]">g</span>.
           </motion.h1>
         </motion.div>
         
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.8 }}
           className="flex flex-col items-center gap-8 relative z-10"
         >
           <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-accent to-transparent" />
           <p className="text-text-secondary font-mono text-[11px] md:text-sm font-bold uppercase tracking-[0.8em]">
             <span className="text-accent underline underline-offset-8">EDITION_{new Date().getFullYear()}</span> &bull; PROTOCAL_VOL_04
           </p>
         </motion.div>
      </header>

      {wotd && (
        <section className="border-x border-b border-border bg-gradient-to-r from-accent/5 via-secondary-accent/5 to-accent/5 overflow-hidden group relative">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" />
           <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
              <div className="p-8 md:p-14 border-b md:border-b-0 md:border-r border-border relative flex flex-col items-center justify-center text-center overflow-hidden bg-surface/30">
                 <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_70%)] opacity-[0.05]" />
                 <div className="absolute top-0 left-0 w-full h-full font-display font-black text-5xl opacity-[0.03] select-none flex items-center justify-center -rotate-12 pointer-events-none tracking-tighter uppercase text-text-primary/10">DATA</div>
                 <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.4em] mb-4 block relative z-10">WORD_OF_THE_DAY</span>
                 <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-black uppercase tracking-tighter text-text-primary leading-[0.9] group-hover:text-accent transition-all relative z-10 group-hover:drop-shadow-[0_0_15px_rgba(0,238,255,0.3)]">
                   {wotd.word}
                 </h2>
              </div>
              <div className="md:col-span-3 p-8 md:p-14 flex flex-col justify-center space-y-8 backdrop-blur-sm">
                 <div className="space-y-6">
                    <p className="text-2xl md:text-4xl font-display font-black leading-[1.1] uppercase tracking-tighter text-text-primary line-clamp-3">
                      "{wotd.definition}"
                    </p>
                    {wotd.usage && (
                      <div className="flex items-start gap-4 p-6 bg-surface/50 border-l-4 border-accent">
                        <p className="text-sm md:text-lg text-text-secondary font-mono italic opacity-100 leading-relaxed">
                          CONTEXT: {wotd.usage}
                        </p>
                      </div>
                    )}
                 </div>
                 <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono font-bold text-text-secondary mt-auto uppercase tracking-[0.3em]">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full" /> TOKEN_ID_{wotd.id?.slice(-6)}</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-secondary-accent rounded-full" /> TIMESTAMP_{wotd.date}</span>
                    <span className="ml-auto text-accent border border-accent/20 px-3 py-1 bg-accent/5">VERIFIED_ENTRY</span>
                 </div>
              </div>
           </div>
        </section>
      )}

      <PollWidget />

      {/* Featured Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 border-x border-border/50 gap-0">
        {blogs.map((blog, idx) => (
          <motion.div 
            key={blog.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "border-b border-border",
              idx === 0 ? "md:col-span-12" : "md:col-span-6 lg:col-span-4"
            )}
          >
            <Link to={`/blog/${blog.slug}`} className="group block h-full">
              <article className={cn(
                "flex flex-col h-full",
                idx === 0 ? "lg:flex-row bg-surface/30" : ""
              )}>
                <div className={cn(
                  "relative overflow-hidden bg-surface",
                  idx === 0 ? "lg:w-3/5 aspect-video md:aspect-auto" : "aspect-video"
                )}>
                  {blog.image ? (
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full bg-accent flex items-center justify-center">
                       <Zap size={60} className="text-bg-page opacity-10" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6">
                    <span className="badge-minimal m-0 !bg-accent !text-bg-page !border-accent">OPINION {idx + 1}</span>
                  </div>
                </div>

                <div className={cn(
                  "p-8 md:p-12 flex flex-col justify-center",
                  idx === 0 ? "lg:w-2/5" : ""
                )}>
                  <div className="flex items-center gap-4 mb-4 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
                    <span>{blog.author}</span>
                    <span className="w-1 h-1 bg-border rounded-full" />
                    <span>{calculateReadingTime(blog.content)} MIN</span>
                  </div>

                  <h2 className={cn(
                    "font-display font-black text-text-primary leading-tight mb-6 tracking-tighter uppercase group-hover:text-accent transition-colors",
                    idx === 0 ? "text-4xl md:text-6xl lg:text-7xl" : "text-3xl"
                  )}>
                    {blog.title}
                  </h2>

                  <p className="text-sm md:text-base text-text-secondary font-display font-bold leading-relaxed mb-8 italic line-clamp-3">
                    "{blog.summary}"
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-6">
                    <div className="flex items-center gap-4 text-[10px] font-mono font-bold">
                       <span className="flex items-center gap-1.5"><Eye size={12} /> {blog.viewsCount}</span>
                       <span className="flex items-center gap-1.5"><Heart size={12} className="text-red-500" /> {blog.likesCount}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest group-hover:underline underline-offset-4">Read Full Entry &rarr;</span>
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="border-x border-border p-12 md:p-24 bg-surface text-center">
         <div className="max-w-2xl mx-auto">
            <NewsletterBox />
         </div>
      </div>
    </div>
  );
}
