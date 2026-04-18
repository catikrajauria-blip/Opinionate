import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import RatingSystem from '../components/RatingSystem';
import CommentSection from '../components/CommentSection';
import NewsletterBox from '../components/NewsletterBox';
import { calculateReadingTime, formatDate, generateUserId, cn } from '../lib/utils';
import { Eye, Heart, MessageSquare, Clock, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const userId = generateUserId();

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
      <motion.article 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20"
      >
        <header className="mb-12">
          <div className="badge-minimal">
            Today's Editorial &bull; {formatDate(blog.date)}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-8">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border text-text-secondary text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="text-text-primary">By <strong>{blog.author}</strong></span>
            </div>
            <span>&bull; {calculateReadingTime(blog.content)} min read</span>
            <div className="flex items-center gap-1.5">
               <span>👁️ {blog.viewsCount} Views</span>
            </div>
            <div className="flex items-center gap-1.5">
               <span>💬 {blog.ratingCount} ratings</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
               <span className="text-yellow-500">★★★★☆</span>
               <span className="text-text-primary">{blog.ratingAverage.toFixed(1)}</span>
            </div>
          </div>
        </header>

        {blog.image && (
          <div className="mb-12 rounded-xl overflow-hidden aspect-[16/9] border border-border">
            <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}

        <div className="blog-content mb-16 px-0 lg:px-4">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-border mt-16">
           <div className="flex items-center gap-3">
              <button 
                onClick={handleLike}
                className="btn-minimal group"
              >
                 <Heart size={16} className="text-gray-400 group-hover:text-red-500" />
                 <span>Like ({blog.likesCount})</span>
              </button>

              <button 
                onClick={toggleSave}
                className={cn(
                  "btn-minimal",
                  isSaved && "bg-text-primary text-bg-page border-text-primary"
                )}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                <span>{isSaved ? 'Saved' : 'Save for later'}</span>
              </button>
           </div>
           
           <button className="btn-minimal-primary">
              Share Opinion
           </button>
        </div>

        <CommentSection blogId={blog.id} />
      </motion.article>
    </div>
  );
}
