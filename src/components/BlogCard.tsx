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
        y: -15, 
        borderColor: "var(--color-accent)",
      } : {}}
      transition={{ 
        delay: index * 0.05,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        y: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className={cn(
        "group h-full bg-surface/30 transition-all duration-500 backdrop-blur-sm hover:glow-cyan",
        isGrid 
          ? "flex flex-col border border-border relative z-0 hover:z-10 rounded-sm overflow-hidden" 
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
               "overflow-hidden flex-shrink-0 bg-slate-900 saturate-50 hover:saturate-150 transition-all duration-1000 relative",
               isGrid ? "w-full aspect-[16/10] border-b border-border" : "w-full md:w-96 aspect-video border border-border"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-bg-page/80 to-transparent z-10 pointer-events-none opacity-40 group-hover:opacity-0 transition-opacity" />
            <img 
              src={blog.image} 
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-2000"
              referrerPolicy="no-referrer"
            />
          </Link>
        )}
        <div className={cn(
          "flex flex-col",
          isGrid ? "p-8 flex-grow" : "flex-grow pt-8 md:pt-0"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent drop-shadow-[0_0_5px_rgba(0,238,255,0.3)]">ANALYSIS::{formatDate(blog.date)}</span>
            <span className="h-[1px] flex-grow bg-accent/20" />
          </div>
          
          <Link to={`/blog/${blog.slug}`} className="mb-6 block relative group/title">
            <h3 className={cn(
               "font-display font-black leading-[1] uppercase tracking-tighter transition-all group-hover:text-accent",
               isGrid ? "text-2xl md:text-3xl" : "text-4xl md:text-7xl lg:text-8xl"
            )}>
              {blog.title}
            </h3>
            {!isGrid && <div className="absolute -bottom-2 left-0 w-0 h-1 bg-accent group-hover/title:w-full transition-all duration-500 glow-cyan" />}
          </Link>
          
          <p className={cn(
            "font-sans font-medium text-text-secondary leading-relaxed mb-10 opacity-80",
            isGrid ? "text-[13px] line-clamp-3" : "text-xl md:text-2xl max-w-3xl border-l border-white/10 pl-6"
          )}>
            "{blog.summary}"
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
                  "group/like flex items-center gap-2 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95",
                  hasLiked ? "text-red-500" : "hover:text-red-500"
                )}
             >
                <motion.div
                  animate={hasLiked ? { scale: [1, 1.4, 1], rotate: [0, -15, 0] } : { scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Heart size={12} className={cn(
                    "transition-all duration-300",
                    isLiking ? "animate-pulse" : "",
                    hasLiked ? "fill-red-500 text-red-500" : "text-text-primary group-hover/like:text-red-500"
                  )} />
                </motion.div>
                <span className={cn("transition-colors duration-300", hasLiked ? "text-red-500" : "text-text-primary group-hover/like:text-red-500")}>{blog.likesCount}_ENDORS</span>
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
