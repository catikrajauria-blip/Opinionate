import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Blog } from '../types';
import { formatDate, calculateReadingTime, generateUserId, cn } from '../lib/utils';
import { convertDriveLink } from '../lib/googlePicker';
import { Eye, Heart, ArrowUpRight, Zap, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { useAuth } from '../contexts/AuthContext';

interface BlogCardProps {
  blog: Blog;
  index?: number;
  isGrid?: boolean;
}

export default function BlogCard({ blog: initialBlog, index = 0, isGrid = false }: BlogCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(initialBlog);
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
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        delay: index * 0.03,
        duration: 0.4,
        ease: "easeOut"
      }}
      className="h-full"
    >
      <div 
        className={cn(
          "group block h-full transition-all duration-1000 relative",
          isGrid ? "glass-card glass-card-hover" : "pb-24 mb-24 border-b border-white/5 last:border-b-0"
        )}
      >
        {/* Main link overlay */}
        <Link 
          to={`/blog/${blog.slug}`} 
          className="absolute inset-0 z-0"
          aria-label={blog.title}
        />

        <div className={cn(
          "flex relative z-10 pointer-events-none",
          isGrid ? "flex-col h-full" : "flex-col lg:flex-row lg:gap-16 items-center"
        )}>
          {blog.image && (
            <div className={cn(
              "overflow-hidden flex-shrink-0 relative glass border-border rounded-[2.5rem] bg-slate-900",
              isGrid ? "w-full aspect-[16/10]" : "w-full lg:w-[45%] aspect-video border"
            )}>
              <img 
                src={convertDriveLink(blog.image)} 
                alt={blog.title}
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop`;
                  target.onerror = null;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-page/80 via-transparent to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-700" />
            </div>
          )}

          <div className={cn(
            "flex flex-col w-full text-center items-center",
            isGrid ? "p-6 sm:p-10 lg:p-12 flex-grow" : "flex-grow pt-10 lg:pt-0"
          )}>
            {!isGrid && (
              <div className="flex items-center gap-6 mb-10 w-full px-4">
                <div className="h-[1px] flex-grow bg-border opacity-30" />
                <span className="text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-accent whitespace-nowrap">TIMESTAMP // {formatDate(blog.date)}</span>
                <div className="h-[1px] flex-grow bg-border opacity-30" />
              </div>
            )}
            
            <h3 className={cn(
               "font-display font-black leading-[1.1] uppercase tracking-tightest transition-all group-hover:text-accent mb-6 md:mb-8 text-center px-2",
               isGrid ? "text-xl sm:text-3xl lg:text-4xl" : "text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
            )}>
              {blog.title}
            </h3>
            
            <p className={cn(
              "font-display font-medium text-text-secondary leading-relaxed mb-8 md:mb-10 opacity-70 text-center px-4",
              isGrid ? "text-sm sm:text-base line-clamp-3" : "text-base md:text-2xl max-w-4xl"
            )}>
              {blog.summary}
            </p>

            <div className="mt-auto pt-8 md:pt-10 border-t border-border w-full flex flex-wrap items-center justify-center gap-x-8 md:gap-x-10 gap-y-6 text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-muted pointer-events-auto">
               <div className="flex items-center gap-3">
                  <Eye size={14} className="text-accent/40" />
                  <span className="text-text-primary/80">{blog.viewsCount}</span>
               </div>
               <button 
                  onClick={handleLike}
                  disabled={isLiking}
                  className={cn(
                    "flex items-center gap-3 transition-all relative z-20",
                    hasLiked ? "text-accent" : "hover:text-accent"
                  )}
               >
                  <Heart size={14} className={cn(hasLiked && "fill-current")} />
                  <span className="text-text-primary/80">{blog.likesCount}</span>
               </button>
               {!isGrid && (
                 <div className="flex items-center gap-3">
                    <Clock size={14} className="text-accent/40" />
                    <span className="text-white/80">{calculateReadingTime(blog.content)} MIN READ</span>
                 </div>
               )}
               <div className="ml-auto flex items-center gap-2 text-accent font-display font-black uppercase tracking-widest text-[9px] group-hover:translate-x-2 transition-transform">
                  Process Node
                  <ArrowUpRight size={14} />
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
