import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { blogService } from '../lib/blogService';
import { Newspaper, newspaperService } from '../lib/newspaperService';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import RatingSystem from '../components/RatingSystem';
import CommentSection from '../components/CommentSection';
import NewsletterBox from '../components/NewsletterBox';
import { calculateReadingTime, formatDate, generateUserId, cn } from '../lib/utils';
import { Eye, Heart, MessageSquare, Clock, Share2, Bookmark, BookmarkCheck, Zap, ExternalLink, Newspaper as NewspaperIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [latestNewspaper, setLatestNewspaper] = useState<Newspaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => user?.uid || generateUserId());
  const [likingId, setLikingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTodayData() {
      try {
        const [todayBlogs, newspapers] = await Promise.all([
          blogService.getTodayBlogs(),
          newspaperService.getLatestNewspapers(1)
        ]);
        
        setBlogs(todayBlogs);
        if (newspapers.length > 0) {
          setLatestNewspaper(newspapers[0]);
        }
        
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
      <header className="py-20 md:py-32 border-b border-border mb-0 text-center relative overflow-hidden">
         <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 0.03, scale: 1 }}
           transition={{ duration: 2 }}
           className="absolute inset-0 flex items-center justify-center font-display font-black text-[30vw] pointer-events-none select-none uppercase tracking-tighter"
         >
           Opinio
         </motion.div>

         {user && (
           <motion.div 
             initial={{ opacity: 0, y: -10 }} 
             animate={{ opacity: 1, y: 0 }} 
             className="badge-minimal mb-6"
           >
              AUTHENTICATED AS: <span className="text-accent">{user.displayName || user.email}</span>
           </motion.div>
         )}
         
         <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-[12vw] md:text-8xl lg:text-[10rem] font-display font-black mb-4 tracking-tighter leading-[0.85] uppercase"
         >
           The Briefing.
         </motion.h1>
         <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 0.6 }}
           transition={{ delay: 0.4 }}
           className="text-text-secondary font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mt-8"
         >
           EDITION: {formatDate(new Date().toISOString().split('T')[0])} — VOL 04
         </motion.p>
      </header>

      {/* Latest Edition Bar */}
      {latestNewspaper && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-b border-border bg-surface py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-accent text-bg-page flex items-center justify-center font-bold text-xs uppercase tracking-tighter">
                New
             </div>
             <div>
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-secondary">Official Publication</p>
                <h3 className="text-sm font-display font-bold uppercase tracking-tight">{latestNewspaper.title}</h3>
             </div>
          </div>
          <Link 
            to={`/newspaper/${latestNewspaper.id}`}
            className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:text-accent group"
          >
            Access Digital Press <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </motion.div>
      )}

      {/* Featured Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 border-x border-border">
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
                    "font-display font-black text-text-primary leading-none mb-6 tracking-tighter uppercase group-hover:text-accent transition-colors",
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
