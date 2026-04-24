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
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [userId] = useState(() => user?.uid || generateUserId());

  useEffect(() => {
    async function loadBlog() {
      if (!slug) return;
      try {
        const data = await blogService.getBlogBySlug(slug);
        if (data) {
          setBlog(data);
          
          if (user) {
            try {
              await blogService.incrementViews(data.id, user.uid);
            } catch (viewError) {
              console.warn('Failed to increment views:', viewError);
            }
            
            const savedIds = await blogService.getSavedBlogIds(user.uid);
            setIsSaved(savedIds.includes(data.id));

            // We can also check if liked by looking up the likes collection
            // But for now, we'll keep the local check + server increment attempt
            const liked = JSON.parse(localStorage.getItem(`liked_${user.uid}`) || '[]');
            setHasLiked(liked.includes(data.id));
          } else {
            // Anonymous view
            try {
              await blogService.incrementViews(data.id, userId);
            } catch (err) {}
          }
        }
      } catch (error) {
        console.error('Error loading blog:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [slug, user, userId]);

  const toggleSave = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (!blog) return;
    
    try {
      const saved = await blogService.toggleSaveBlog(user.uid, blog.id);
      setIsSaved(saved);
    } catch (err) {
      console.error('Error saving blog:', err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (!blog || hasLiked) return;
    
    try {
      const success = await blogService.incrementLikes(blog.id, user.uid);
      if (success) {
        setBlog({ ...blog, likesCount: (blog.likesCount || 0) + 1 });
        setHasLiked(true);
        const likedKey = `liked_${user.uid}`;
        const liked = JSON.parse(localStorage.getItem(likedKey) || '[]');
        localStorage.setItem(likedKey, JSON.stringify([...liked, blog.id]));
      } else {
        setHasLiked(true);
        const likedKey = `liked_${user.uid}`;
        const liked = JSON.parse(localStorage.getItem(likedKey) || '[]');
        if (!liked.includes(blog.id)) {
          localStorage.setItem(likedKey, JSON.stringify([...liked, blog.id]));
        }
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!blog) {
    return <Navigate to="/404" />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6">
      <Link 
        to="/archive" 
        className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary hover:text-accent transition-colors mb-20 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        BACK TO ENTRIES
      </Link>

      <motion.article 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-32"
      >
        <header className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <span className="badge-minimal m-0">DAILY ANALYSIS</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">VOL. 04 &bull; {formatDate(blog.date)}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-black leading-[0.9] mb-12 tracking-tighter uppercase break-words">
            {blog.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-border">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-accent">Author</span>
              <span className="text-sm font-display font-black uppercase tracking-tight">{blog.author}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-accent">Metric</span>
              <span className="text-sm font-display font-black uppercase tracking-tight">{calculateReadingTime(blog.content)} MIN READ &bull; {blog.viewsCount} ACCESSES</span>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-accent">Engagement</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-600 font-mono font-black">{blog.ratingAverage.toFixed(1)}</span>
                  <span className="text-[10px] font-mono opacity-60">/5.0</span>
                </div>
                <button 
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-1 transition-colors",
                    hasLiked ? "text-red-500" : "hover:text-red-500"
                  )}
                >
                  <Heart size={16} className={hasLiked ? "fill-red-500" : ""} />
                  <span className="text-xs font-mono font-bold uppercase">{blog.likesCount}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {blog.image && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-20 overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000"
          >
            <img src={blog.image} alt={blog.title} className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />
            <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest mt-4 text-center">Reference Visual: {blog.title}</p>
          </motion.div>
        )}

        <div className="max-w-3xl mx-auto">
          <div className="blog-content mb-24">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-y border-border mb-24">
             <div className="flex items-center gap-3">
                <button 
                  onClick={handleLike}
                  className={cn(
                    "btn-minimal group border-accent/20",
                    hasLiked && "bg-accent text-bg-page"
                  )}
                >
                   <Heart size={16} className={cn(
                     "transition-colors",
                     hasLiked ? "fill-bg-page" : "group-hover:text-red-500"
                   )} />
                   <span>{hasLiked ? 'OPINION ENDORSED' : 'ENDORSE OPINION'}</span>
                </button>
  
                <button 
                  onClick={toggleSave}
                  className={cn(
                    "btn-minimal p-3",
                    isSaved && "bg-accent text-bg-page"
                  )}
                  title="Archive for later"
                >
                  {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
             </div>
             
             <button className="btn-minimal-primary gap-3">
                <Share2 size={16} /> DISTRIBUTE ENTRY
             </button>
          </div>
  
          <section className="mb-24">
             <div className="flex items-center gap-4 mb-10">
               <span className="h-px bg-border flex-grow" />
               <h3 className="text-xs font-mono font-bold tracking-[0.3em] uppercase">Consensus Mechanism</h3>
               <span className="h-px bg-border flex-grow" />
             </div>
             <div className="bg-surface p-10 border border-border">
                <RatingSystem blog={blog} userId={userId} onRate={(avg, count) => setBlog({...blog, ratingAverage: avg, ratingCount: count})} />
             </div>
          </section>
  
          <CommentSection blogId={blog.id} />
        </div>
      </motion.article>
    </div>
  );
}
