import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface RatingSystemProps {
  blog: Blog;
  userId: string;
  onRate?: (newAverage: number, newCount: number) => void;
}

export default function RatingSystem({ blog, userId, onRate }: RatingSystemProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [loadingRating, setLoadingRating] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkRating() {
      if (!userId) {
        setLoadingRating(false);
        return;
      }
      try {
        const ratings = await blogService.getBlogRatings(blog.id);
        const existing = ratings.find((r: any) => r.userId === userId);
        if (existing) {
          setUserRating(existing.score);
          setHasRated(true);
        }
      } catch (err) {
        console.warn('Could not check individual rating:', err);
      } finally {
        setLoadingRating(false);
      }
    }
    checkRating();
  }, [blog.id, userId]);

  const handleRate = async (score: number) => {
    if (isSubmitting || hasRated) return;

    setIsSubmitting(true);
    setError('');

    try {
      await blogService.addRating(blog.id, userId, score);
      setUserRating(score);
      setHasRated(true);

      const newCount = blog.ratingCount + 1;
      const newAverage = ((blog.ratingAverage * blog.ratingCount) + score) / newCount;
      onRate?.(newAverage, newCount);
    } catch (err: any) {
      if (err.message.includes('already rated')) {
        setHasRated(true);
      }
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTip = (score: number) => {
    switch (score) {
      case 1: return 'Inadequate';
      case 2: return 'Moderate';
      case 3: return 'Compelling';
      case 4: return 'Profound';
      case 5: return 'Exceptional';
      default: return '';
    }
  };

  if (loadingRating) {
    return <div className="animate-pulse flex space-x-1"><div className="w-6 h-6 bg-surface rounded-full"></div></div>;
  }

  return (
    <div className="flex flex-col items-center md:items-start gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-50">
          {hasRated ? 'Your contribution recognized' : 'Cast your evaluation'}
        </p>
        <div className="flex items-center gap-1 relative">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => !hasRated && setHoverRating(star)}
              onMouseLeave={() => !hasRated && setHoverRating(0)}
              onClick={() => handleRate(star)}
              disabled={hasRated || isSubmitting}
              className={cn(
                "p-1 focus:outline-none transition-all relative group",
                !hasRated && "hover:scale-110"
              )}
            >
              <Star
                size={28}
                className={cn(
                  "transition-all duration-300",
                  (hoverRating || userRating) >= star
                    ? "text-orange-500 fill-orange-500"
                    : "text-text-secondary/40"
                )}
              />
              {!hasRated && hoverRating === star && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-text-primary text-bg-page text-[10px] font-bold rounded pointer-events-none whitespace-nowrap z-10">
                    {getTip(star)}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold font-mono">
         <span className={cn(
            "px-3 py-1 rounded-lg border",
            hasRated 
              ? "bg-green-500/5 text-green-500 border-green-500/20" 
              : "bg-surface text-text-secondary border-border"
         )}>
            {blog.ratingAverage > 0 ? blog.ratingAverage.toFixed(1) : 'PENDING'} <span className="opacity-40">/ 5.0</span>
         </span>
         <span className="text-text-secondary opacity-50 uppercase tracking-tighter">
           {blog.ratingCount > 0 ? `Based on ${blog.ratingCount} evaluations` : 'Awaiting peer review'}
         </span>
      </div>

      <AnimatePresence>
        {hasRated && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-green-500 font-bold uppercase tracking-wider mt-1"
          >
            Thanks for rating!
          </motion.p>
        )}
        {error && !hasRated && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
