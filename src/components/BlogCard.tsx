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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={isGrid ? { 
        y: -8, 
        boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25), 0 18px 36px -18px rgba(0,0,0,0.3)",
      } : {}}
      transition={{ 
        delay: index * 0.03,
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1], // Custom cubic-bezier for smoother feel
        y: { type: "spring", stiffness: 300, damping: 20 } // Spring for the lift
      }}
      className={cn(
        "group h-full bg-bg-page transition-all duration-500",
        isGrid 
          ? "flex flex-col border border-border hover:border-accent relative z-0 hover:z-10" 
          : "pb-16 mb-16 border-b border-border last:border-b-0"
      )}
    >
      <div className={cn(
        "flex",
        isGrid ? "flex-col h-full" : "flex-col md:flex-row md:gap-12"
      )}>
        {blog.image && (
          <Link 
            to={`/blog/${blog.slug}`} 
            className={cn(
               "overflow-hidden flex-shrink-0 bg-surface grayscale hover:grayscale-0 transition-all duration-700",
               isGrid ? "w-full aspect-[16/10] border-b border-border" : "w-full md:w-96 aspect-video border border-border"
            )}
          >
            <img 
              src={blog.image} 
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          </Link>
        )}
        <div className={cn(
          "flex flex-col",
          isGrid ? "p-8 flex-grow" : "flex-grow pt-8 md:pt-0"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-accent">ANALYSIS &bull; {formatDate(blog.date)}</span>
            <span className="h-px flex-grow bg-border opacity-30" />
          </div>
          
          <Link to={`/blog/${blog.slug}`} className="mb-4">
            <h3 className={cn(
               "font-display font-black group-hover:text-accent transition-colors leading-tight uppercase tracking-tighter",
               isGrid ? "text-2xl md:text-3xl" : "text-4xl md:text-6xl"
            )}>
              {blog.title}
            </h3>
          </Link>
          
          <p className={cn(
            "font-display font-medium text-text-secondary leading-tight uppercase tracking-tight mb-8",
            isGrid ? "text-[13px] line-clamp-3" : "text-lg max-w-2xl"
          )}>
            {blog.summary}
          </p>

          <div className="mt-auto pt-8 border-t border-border/50 flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
             <div className="flex items-center gap-2">
                <span className="opacity-80">METRIC:</span>
                <span className="text-text-primary text-[11px]">{blog.viewsCount}_VIEWS</span>
             </div>
             <button 
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95",
                  hasLiked ? "text-red-500" : "hover:text-red-500"
                )}
             >
                <Heart size={12} className={cn(
                  "transition-all duration-300",
                  isLiking ? "animate-pulse" : "",
                  hasLiked && "fill-red-500 scale-110"
                )} />
                <span className={cn("transition-colors duration-300", hasLiked ? "text-red-500" : "text-text-primary")}>{blog.likesCount}_ENDORS</span>
             </button>
             {blog.ratingCount > 0 && (
               <div className="flex items-center gap-2">
                  <span className="opacity-80">GRADE:</span>
                  <span className="text-text-primary text-[11px]">{blog.ratingAverage.toFixed(1)}/5.0</span>
               </div>
             )}
             <Link 
                to={`/blog/${blog.slug}`} 
                className="ml-auto flex items-center gap-2 text-accent hover:translate-x-2 transition-all duration-300 font-bold"
             >
                LOAD_DATA &rarr;
             </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
