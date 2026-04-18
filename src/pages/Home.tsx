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
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [userId] = useState(() => generateUserId());

  useEffect(() => {
    async function loadTodayBlog() {
      try {
        const todayBlog = await blogService.getTodayBlog();
        if (todayBlog) {
          setBlog(todayBlog);
          await blogService.incrementViews(todayBlog.id, userId);
          
          // Check if saved
          const saved = JSON.parse(localStorage.getItem('saved_blogs') || '[]');
          setIsSaved(saved.includes(todayBlog.slug));
        }
      } catch (error) {
        console.error('Error loading today blog:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTodayBlog();
  }, [userId]);

  const toggleSave = () => {
    if (!blog) return;
    const saved = JSON.parse(localStorage.getItem('saved_blogs') || '[]');
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter((s: string) => s !== blog.slug);
    } else {
      newSaved = [...saved, blog.slug];
    }
    localStorage.setItem('saved_blogs', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  const handleLike = async () => {
    if (!blog) return;
    const success = await blogService.incrementLikes(blog.id, userId);
    if (success) {
      setBlog({ ...blog, likesCount: blog.likesCount + 1 });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
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
    <div className="max-w-4xl mx-auto">
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20"
      >
        <div className="bg-surface rounded-[2.5rem] overflow-hidden border border-border shadow-2xl shadow-black/5 hover:shadow-black/10 transition-shadow">
          <div className="relative aspect-[21/9] overflow-hidden group">
            {blog.image ? (
              <img 
                src={blog.image} 
                alt={blog.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="w-full h-full bg-accent flex items-center justify-center">
                 <Zap size={60} className="text-white opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-8">
               <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest inline-block mb-3">
                  Today's Featured Opinion
               </div>
               <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
                  {blog.title}
               </h2>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <p className="text-lg text-text-secondary font-serif leading-relaxed mb-8 italic">
               "{blog.summary}"
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-1">Author</span>
                     <span className="text-sm font-bold text-text-primary">{blog.author}</span>
                  </div>
                  <div className="flex flex-col border-l border-border pl-6">
                     <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-1">Time</span>
                     <span className="text-sm font-bold text-text-primary">{calculateReadingTime(blog.content)} Min</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <button 
                    onClick={handleLike}
                    className="flex items-center gap-2 text-text-secondary hover:text-red-500 transition-colors"
                  >
                     <Heart size={20} className={cn(blog.likesCount > 0 && "fill-red-500 text-red-500")} />
                     <span className="font-bold text-xs">{blog.likesCount}</span>
                  </button>
                  <a 
                    href={`/blog/${blog.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-minimal-primary px-8 py-3 text-sm font-bold shadow-xl shadow-accent/20"
                  >
                    Read Full Analysis &rarr;
                  </a>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-border">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                 <h3 className="text-3xl font-serif font-bold text-text-primary mb-2">Rate Today's Insight</h3>
                 <p className="text-text-secondary font-serif text-sm">Was this briefing valuable for your perspective?</p>
              </div>
              <RatingSystem blog={blog} userId={userId} onRate={(avg, count) => setBlog({...blog, ratingAverage: avg, ratingCount: count})} />
           </div>
        </div>

        <div className="mt-20">
           <CommentSection blogId={blog.id} />
        </div>
      </motion.section>
    </div>
  );
}
