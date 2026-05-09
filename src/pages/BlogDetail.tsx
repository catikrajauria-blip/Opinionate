import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import RatingSystem from '../components/RatingSystem';
import CommentSection from '../components/CommentSection';
import NewsletterBox from '../components/NewsletterBox';
import { calculateReadingTime, formatDate, generateUserId, cn } from '../lib/utils';
import { convertDriveLink } from '../lib/googlePicker';
import { Eye, Heart, Share2, Bookmark, BookmarkCheck, ArrowLeft, Clock, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
            } catch (err) {}
            const savedIds = await blogService.getSavedBlogIds(user.uid);
            setIsSaved(savedIds.includes(data.id));
            const likedKey = `liked_${user.uid}`;
            const liked = JSON.parse(localStorage.getItem(likedKey) || '[]');
            setHasLiked(liked.includes(data.id));
          } else {
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
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-[1px] border-accent/20 border-t-accent rounded-full animate-spin pulse-glow" />
      </div>
    );
  }

  if (!blog) {
    return <Navigate to="/404" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-32 text-text-primary">
      <Link 
        to="/archive" 
        className="inline-flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-accent hover:text-white transition-all mb-20 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
        BACK_TO_ARCHIVE
      </Link>

      <motion.article 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mb-40"
      >
        <header className="mb-24 space-y-12">
          <div className="flex flex-wrap items-center gap-6">
            <span className="px-5 py-2 glass border-accent/30 text-accent text-[10px] font-display font-black uppercase tracking-[0.4em]">NODE_{blog.id.slice(0, 4)}</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-secondary opacity-40">TIMESTAMP // {formatDate(blog.date)}</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-display font-black leading-[0.85] tracking-tightest uppercase text-white">
            {blog.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-white/5 bg-white/5 px-10 rounded-3xl backdrop-blur-sm">
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60">SOURCE_ID</span>
              <span className="text-xl font-display font-black uppercase text-white">{blog.author}</span>
            </div>
            <div className="flex flex-col gap-3 border-white/5 md:border-x md:px-10">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60">PROCESS_METRICS</span>
              <div className="flex items-center gap-4 text-sm font-mono font-bold text-white/90">
                <span className="flex items-center gap-2"><Clock size={14} /> {calculateReadingTime(blog.content)}M</span>
                <span className="flex items-center gap-2"><Eye size={14} /> {blog.viewsCount}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-accent/60">USER_RATING</span>
              <div className="flex items-center gap-6 text-2xl font-display font-black text-accent">
                {blog.ratingAverage.toFixed(1)}
              </div>
            </div>
          </div>
        </header>

        {blog.image && (
          <div className="mb-32 relative group rounded-3xl overflow-hidden glass shadow-[0_0_100px_-30px_rgba(0,210,255,0.15)] bg-surface/20">
            <img 
              src={convertDriveLink(blog.image)} 
              alt={blog.title} 
              className="w-full aspect-[21/9] object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-1000 grayscale-[0.5] group-hover:grayscale-0" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop`;
                target.onerror = null; // Prevent infinite fallback loop
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-page via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="absolute bottom-8 left-8 pointer-events-none">
              <p className="text-[10px] font-mono font-bold text-accent/40 uppercase tracking-[0.8em]">VISUAL_DATA: {blog.slug.toUpperCase()}</p>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <div className="blog-content mb-32">
             <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ ...props }) => (
                    <img 
                      {...props} 
                      src={convertDriveLink(props.src || '')} 
                      referrerPolicy="no-referrer" 
                      className="rounded-3xl border border-white/10 my-16 shadow-2xl"
                    />
                  ),
                  p: ({ children }) => <p className="mb-8">{children}</p>,
                  h2: ({ children }) => <h2 className="text-4xl mt-20 mb-8">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-2xl mt-12 mb-6">{children}</h3>,
                }}
             >
                {blog.content}
             </ReactMarkdown>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-14 border-y border-white/5 mb-40">
             <div className="flex items-center gap-5">
                <button 
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-4 px-10 py-5 rounded-2xl font-display font-black uppercase tracking-[0.3em] text-[10px] transition-all border",
                    hasLiked ? "bg-accent text-bg-page border-accent" : "border-white/10 hover:border-accent hover:text-accent"
                  )}
                >
                   <Heart size={18} className={cn(hasLiked && "fill-current")} />
                   {hasLiked ? 'VERIFIED' : 'AUTHENTICATE'}
                </button>
  
                <button 
                  onClick={toggleSave}
                  className={cn(
                    "p-5 rounded-2xl border transition-all",
                    isSaved ? "bg-white/10 border-white/20 text-accent" : "border-white/10 hover:border-accent hover:text-accent"
                  )}
                >
                   {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                </button>
             </div>
             
             <button className="btn-premium px-10 py-5 text-[10px]">
                <Share2 size={16} /> BROADCAST_SIGNAL
             </button>
          </div>
   
          <section className="mb-40 space-y-16">
             <div className="flex items-center gap-10">
                <h3 className="text-[12px] font-display font-black tracking-[0.8em] uppercase text-accent/40 whitespace-nowrap">FEEDBACK_LOOP</h3>
                <div className="h-[1px] flex-grow bg-white/5" />
             </div>
             <div>
                <RatingSystem blog={blog} userId={userId} onRate={(avg, count) => setBlog({...blog, ratingAverage: avg, ratingCount: count})} />
             </div>
          </section>
   
          <CommentSection blogId={blog.id} />
        </div>
      </motion.article>

      <section className="mt-40">
        <NewsletterBox />
      </section>
    </div>
  );
}
