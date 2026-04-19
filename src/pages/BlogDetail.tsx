import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import RatingSystem from '../components/RatingSystem';
import CommentSection from '../components/CommentSection';
import NewsletterBox from '../components/NewsletterBox';
import { calculateReadingTime, formatDate, generateUserId, cn } from '../lib/utils';
import { Eye, Heart, Clock, Share2, Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [userId] = useState(() => generateUserId());

  useEffect(() => {
    async function loadBlog() {
      if (!slug) return;
      try {
        const data = await blogService.getBlogBySlug(slug);
        if (data) {
          setBlog(data);
          try {
            await blogService.incrementViews(data.id, userId);
          } catch (viewError) {
            console.warn('Failed to increment views:', viewError);
          }
          
          const saved = JSON.parse(localStorage.getItem('saved_blogs') || '[]');
          setIsSaved(saved.includes(slug));

          const liked = JSON.parse(localStorage.getItem('liked_blogs') || '[]');
          setHasLiked(liked.includes(data.id));
        }
      } catch (error) {
        console.error('Error loading blog:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [slug, userId]);

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
    if (!blog || hasLiked) return;
    try {
      const success = await blogService.incrementLikes(blog.id, userId);
      if (success) {
        setBlog({ ...blog, likesCount: (blog.likesCount || 0) + 1 });
        setHasLiked(true);
        const liked = JSON.parse(localStorage.getItem('liked_blogs') || '[]');
        localStorage.setItem('liked_blogs', JSON.stringify([...liked, blog.id]));
      } else {
        setHasLiked(true);
        const liked = JSON.parse(localStorage.getItem('liked_blogs') || '[]');
        if (!liked.includes(blog.id)) {
          localStorage.setItem('liked_blogs', JSON.stringify([...liked, blog.id]));
        }
        alert("You have already liked this opinion.");
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!blog) {
    return <Navigate to="/404" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        to="/archive" 
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors mb-10 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Archive
      </Link>

      <motion.article 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20"
      >
        <header className="mb-12">
          <div className="badge-minimal">
            Daily Opinion &bull; {formatDate(blog.date)}
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
               <span className="text-text-primary mr-4">{blog.ratingAverage.toFixed(1)}</span>
               <button 
                 onClick={handleLike}
                 className={cn(
                   "flex items-center gap-1 transition-colors",
                   hasLiked ? "text-red-500" : "hover:text-red-500"
                 )}
               >
                 <Heart size={16} className={hasLiked ? "fill-red-500 text-red-500" : ""} />
                 <span className="text-text-primary font-bold">{blog.likesCount}</span>
               </button>
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
                className={cn(
                  "btn-minimal group",
                  hasLiked && "text-red-500 border-red-500/20 bg-red-500/5 transition-all"
                )}
              >
                 <Heart size={16} className={cn(
                   "transition-colors",
                   hasLiked ? "fill-red-500 text-red-500" : "text-text-secondary group-hover:text-red-500"
                 )} />
                 <span>{hasLiked ? 'Liked' : 'Like'} ({blog.likesCount})</span>
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

        <div className="mt-16 pt-16 border-t border-border">
           <h3 className="text-xl font-bold mb-8">Rate the Conversation</h3>
           <RatingSystem blog={blog} userId={userId} onRate={(avg, count) => setBlog({...blog, ratingAverage: avg, ratingCount: count})} />
        </div>

        <CommentSection blogId={blog.id} />
      </motion.article>
    </div>
  );
}
