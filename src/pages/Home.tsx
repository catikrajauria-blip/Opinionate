import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { blogService } from '../lib/blogService';
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
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => user?.uid || generateUserId());
  const [likingId, setLikingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTodayData() {
      try {
        const [todayBlogs] = await Promise.all([
          blogService.getTodayBlogs()
        ]);
        
        setBlogs(todayBlogs);
        
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
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
      <header className="py-24 md:py-40 border-b border-border/50 mb-0 text-center relative overflow-hidden bg-bg-page">
         {/* Aesthetic background elements */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
            <motion.div 
               animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                  opacity: [0.03, 0.05, 0.03]
               }}
               transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-0 left-0 w-full h-full font-display font-black text-[35vw] flex items-center justify-center select-none uppercase tracking-tighter text-accent"
            >
               Opinio
            </motion.div>
            
            <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-accent/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[20%] left-[5%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
         </div>

         {user && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }} 
             animate={{ opacity: 1, scale: 1 }} 
             className="inline-flex items-center gap-2 px-4 py-2 bg-surface backdrop-blur-md border border-border/50 rounded-full mb-8 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary"
           >
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              AUTHENTICATED: <span className="text-accent">{user.displayName || user.email?.split('@')[0]}</span>
           </motion.div>
         )}
         
         <motion.h1 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
           className="text-[14vw] md:text-9xl lg:text-[12rem] font-display font-black mb-6 tracking-tighter leading-none uppercase relative z-10"
         >
           The Briefin<span className="text-accent italic">g</span>.
         </motion.h1>
         
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="flex flex-col items-center gap-6 relative z-10"
         >
           <div className="h-px w-20 bg-accent/30" />
           <p className="text-text-secondary font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.6em]">
             EDITION: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &bull; VOL 04
           </p>
         </motion.div>
      </header>

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
