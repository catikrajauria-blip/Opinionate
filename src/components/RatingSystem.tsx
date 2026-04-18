import React, { useState } from 'react';
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
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [error, setError] = useState('');

  const handleRate = async (score: number) => {
    if (isSubmitting || hasRated) return;

    setIsSubmitting(true);
    setError('');

    try {
      await blogService.addRating(blog.id, userId, score);
      setRating(score);
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
      case 1: return 'Poor';
      case 2: return 'Average';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col items-center md:items-start gap-2">
      <div className="flex items-center gap-1 relative">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => !hasRated && setHoverRating(star)}
            onMouseLeave={() => !hasRated && setHoverRating(0)}
            onClick={() => handleRate(star)}
            disabled={hasRated || isSubmitting}
            className="p-1 focus:outline-none focus:scale-110 transition-transform relative group"
          >
            <Star
              size={24}
              className={cn(
                "transition-all",
                (hoverRating || rating || blog.ratingAverage) >= star
                  ? "text-orange-500 fill-orange-500 scale-110"
                  : "text-text-secondary/20"
              )}
            />
            {!hasRated && hoverRating === star && (
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-text-primary text-bg-page text-[10px] font-bold rounded pointer-events-none whitespace-nowrap">
                  {getTip(star)}
               </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs font-bold">
         <span className={cn(
           "px-2 py-0.5 rounded",
           hasRated ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
         )}>
            {blog.ratingAverage.toFixed(1)} / 5
         </span>
         <span className="text-text-secondary">({blog.ratingCount} Ratings)</span>
      </div>

      <AnimatePresence>
        {hasRated && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-green-600 font-bold uppercase tracking-wider mt-1"
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
