import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '../types';
import { formatDate, calculateReadingTime, generateUserId } from '../lib/utils';
import { Eye, Heart, MessageSquare, Clock, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';

interface BlogCardProps {
  blog: Blog;
  index?: number;
}

export default function BlogCard({ blog: initialBlog, index = 0 }: BlogCardProps) {
  const [blog, setBlog] = useState(initialBlog);
  const [userId] = useState(() => generateUserId());
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const success = await blogService.incrementLikes(blog.id, userId);
      if (success) {
        setBlog(prev => ({ ...prev, likesCount: prev.likesCount + 1 }));
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group pb-10 border-b border-border last:border-0"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {blog.image && (
          <Link to={`/blog/${blog.slug}`} className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-border">
            <img 
              src={blog.image} 
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </Link>
        )}
        <div className="flex-grow">
          <div className="badge-minimal mb-3">
            {formatDate(blog.date)}
          </div>
          
          <Link to={`/blog/${blog.slug}`}>
            <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-text-secondary transition-colors leading-tight">
              {blog.title}
            </h3>
          </Link>
          
          <p className="font-serif text-[15px] text-text-secondary mb-4 line-clamp-2 leading-relaxed">
            {blog.summary}
          </p>

          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-text-secondary opacity-70">
             <div className="flex items-center gap-1">
                <span>👁️ {blog.viewsCount} Views</span>
             </div>
             <button 
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
             >
                <Heart size={14} className={isLiking ? "animate-pulse" : ""} />
                <span>{blog.likesCount} Likes</span>
             </button>
             <div className="flex items-center gap-1">
                <span className="text-yellow-600">★</span>
                <span>{blog.ratingAverage.toFixed(1)}</span>
             </div>
             <Link to={`/blog/${blog.slug}`} className="ml-auto flex items-center gap-1 hover:text-text-primary transition-colors">
                Read More &rarr;
             </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
