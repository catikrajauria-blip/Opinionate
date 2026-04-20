import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '../types';
import { formatDate, calculateReadingTime, generateUserId, cn } from '../lib/utils';
import { Eye, Heart, MessageSquare, Clock, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BlogCardProps {
  blog: Blog;
  index?: number;
  isGrid?: boolean;
}

export default function BlogCard({ blog: initialBlog, index = 0, isGrid = false }: BlogCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(initialBlog);
  const [userId] = useState(() => user?.uid || generateUserId());
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(() => {
    const key = user ? `liked_${user.uid}` : 'liked_blogs';
    const liked = JSON.parse(localStorage.getItem(key) || '[]');
    return liked.includes(blog.id);
  });

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (isLiking || hasLiked) return;
    
    setIsLiking(true);
    try {
      const success = await blogService.incrementLikes(blog.id, user.uid);
      if (success) {
        setBlog(prev => ({ ...prev, likesCount: prev.likesCount + 1 }));
        setHasLiked(true);
        const likedKey = `liked_${user.uid}`;
        const liked = JSON.parse(localStorage.getItem(likedKey) || '[]');
        localStorage.setItem(likedKey, JSON.stringify([...liked, blog.id]));
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
      className={cn(
        "group border-border last:border-0",
        isGrid ? "pb-6" : "pb-10 border-b"
      )}
    >
      <div className={cn(
        "flex gap-6",
        isGrid ? "flex-col" : "flex-col md:flex-row md:gap-8"
      )}>
        {blog.image && (
          <Link 
            to={`/blog/${blog.slug}`} 
            className={cn(
               "rounded-lg overflow-hidden flex-shrink-0 border border-border bg-surface",
               isGrid ? "w-full aspect-[16/10] mb-2" : "w-full md:w-48 h-32"
            )}
          >
            <img 
              src={blog.image} 
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </Link>
        )}
        <div className="flex-grow min-w-0">
          <div className="badge-minimal mb-3">
            {formatDate(blog.date)}
          </div>
          
          <Link to={`/blog/${blog.slug}`}>
            <h3 className={cn(
               "font-serif font-bold mb-3 group-hover:text-text-secondary transition-colors leading-tight",
               isGrid ? "text-xl" : "text-2xl"
            )}>
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
                className={cn(
                  "flex items-center gap-1 transition-colors disabled:opacity-50",
                  hasLiked ? "text-red-500" : "hover:text-red-500"
                )}
             >
                <Heart size={14} className={cn(
                  isLiking ? "animate-pulse" : "",
                  hasLiked && "fill-red-500"
                )} />
                <span>{blog.likesCount} <span className="hidden sm:inline">Likes</span></span>
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
