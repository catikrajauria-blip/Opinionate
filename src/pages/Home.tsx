import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import RatingSystem from '../components/RatingSystem';
import CommentSection from '../components/CommentSection';
import NewsletterBox from '../components/NewsletterBox';
import { calculateReadingTime, formatDate, generateUserId, cn } from '../lib/utils';
import { Eye, Heart, MessageSquare, Clock, Share2, Bookmark, BookmarkCheck, Zap, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => generateUserId());
  const [likingId, setLikingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTodayBlogs() {
      try {
        const todayBlogs = await blogService.getTodayBlogs();
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
        console.error('Error loading today blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTodayBlogs();
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
          <h2 className="text-3xl font-serif font-bold text-text-secondary mb-4 italic opacity-30">Today's opinion coming soon</h2>
          <p className="text-text-secondary mb-8 font-serif">Check back later or browse our archive for previous deep dives.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <header className="mb-16 text-center">
         <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Today's Briefing</h1>
         <p className="text-text-secondary font-serif italic text-lg">{formatDate(new Date().toISOString().split('T')[0])}</p>
      </header>

      <div className="grid grid-cols-1 gap-16 mb-20">
        {blogs.map((blog, idx) => (
          <motion.section 
            key={blog.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <div className="bg-surface rounded-[2.5rem] overflow-hidden border border-border shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative aspect-video lg:aspect-auto overflow-hidden">
                  {blog.image ? (
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full bg-accent flex items-center justify-center">
                       <Zap size={60} className="text-white opacity-20" />
                    </div>
                  )}
                </div>
                
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-text-primary/5 text-text-primary px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border border-text-primary/10">
                       Opinion {idx + 1}
                    </span>
                    <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                       <Clock size={12} /> {calculateReadingTime(blog.content)} Min
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary leading-tight mb-6">
                     {blog.title}
                  </h2>

                  <p className="text-lg text-text-secondary font-serif leading-relaxed mb-8 italic line-clamp-3">
                     "{blog.summary}"
                  </p>
                  
                  <div className="flex items-center justify-between gap-6 pt-8 border-t border-border mt-auto">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                           {blog.author.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{blog.author}</span>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-text-secondary">
                           <Eye size={14} />
                           <span className="text-[10px] font-bold">{blog.viewsCount}</span>
                        </div>
                        <button 
                          onClick={(e) => handleLike(e, blog.id, idx)}
                          disabled={likingId === blog.id}
                          className="flex items-center gap-1 text-text-secondary hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                           <Heart size={14} className={likingId === blog.id ? "animate-pulse" : ""} />
                           <span className="text-[10px] font-bold">{blog.likesCount}</span>
                        </button>
                        <a 
                          href={`/blog/${blog.slug}`} 
                          className="btn-minimal-primary px-6 py-2 text-xs font-bold"
                        >
                          Read &rarr;
                        </a>
                     </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 px-4">
               <div className="bg-surface rounded-2xl p-6 border border-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-1">Expert Consensus</p>
                    <RatingSystem blog={blog} userId={userId} onRate={(avg, count) => {
                       const newBlogs = [...blogs];
                       newBlogs[idx] = { ...newBlogs[idx], ratingAverage: avg, ratingCount: count };
                       setBlogs(newBlogs);
                    }} />
                  </div>
               </div>
               <div className="bg-surface rounded-2xl p-6 border border-border">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3 flex items-center gap-2">
                     <MessageSquare size={12} /> Conversations
                  </p>
                  <p className="text-sm font-serif italic text-text-secondary">Join the discussion on this analysis below.</p>
               </div>
            </div>
          </motion.section>
        ))}
      </div>

      <div className="mt-32 max-w-4xl mx-auto border-t border-border pt-20">
         <NewsletterBox />
      </div>
    </div>
  );
}
