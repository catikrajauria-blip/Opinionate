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
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-32 text-text-primary">
      <Link 
        to="/archive" 
        className="inline-flex items-center gap-2 md:gap-4 text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] text-accent hover:text-white transition-all mb-12 md:mb-20 group mx-auto md:mx-0 w-full md:w-auto justify-center md:justify-start"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
        BACK_TO_ARCHIVE
      </Link>

      <motion.article 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="mb-24 md:mb-40"
      >
        <header className="mb-16 md:mb-24 flex flex-col items-center text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-10 md:mb-12">
            <span className="px-4 py-1.5 md:px-5 md:py-2 glass border-accent/30 text-accent text-[8px] md:text-[9px] font-display font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">NODE_{blog.id.slice(0, 4)}</span>
            <span className="text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-text-secondary opacity-40">TIMESTAMP // {formatDate(blog.date)}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.1] tracking-tightest uppercase text-white mb-12 md:mb-16 max-w-5xl px-2">
            {blog.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 py-8 md:py-10 border-y border-white/5 bg-white/5 px-6 md:px-10 rounded-[2rem] backdrop-blur-sm w-full text-center items-center">
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <span className="text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-accent/60 text-center">SOURCE_ID</span>
              <span className="text-lg md:text-xl font-display font-black uppercase text-white text-center">{blog.author}</span>
            </div>
            <div className="flex flex-col items-center gap-2 md:gap-3 border-white/5 md:border-x md:px-8">
              <span className="text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-accent/60 text-center">PROCESS_METRICS</span>
              <div className="flex items-center justify-center gap-4 text-[12px] md:text-sm font-mono font-bold text-white/90">
                <span className="flex items-center gap-2"><Clock size={14} /> {calculateReadingTime(blog.content)}M</span>
                <span className="flex items-center gap-2"><Eye size={14} /> {blog.viewsCount}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <span className="text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-accent/60 text-center">USER_RATING</span>
              <div className="flex items-center justify-center gap-6 text-xl md:text-2xl font-display font-black text-accent text-center">
                {blog.ratingAverage.toFixed(1)}
              </div>
            </div>
          </div>
        </header>

        {blog.image && (
          <div className="mb-16 md:mb-32 relative group rounded-2xl md:rounded-3xl overflow-hidden glass shadow-[0_0_100px_-30px_rgba(0,210,255,0.15)] bg-surface/20">
            <img 
              src={convertDriveLink(blog.image)} 
              alt={blog.title} 
              className="w-full aspect-[4/3] md:aspect-[21/9] object-cover opacity-80 md:opacity-70 group-hover:opacity-100 transition-opacity duration-300 grayscale-[0.3] md:grayscale-[0.5] group-hover:grayscale-0" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop`;
                target.onerror = null;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-page via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 pointer-events-none">
              <p className="text-[8px] md:text-[10px] font-mono font-bold text-accent/40 uppercase tracking-[0.5em] md:tracking-[0.8em]">VISUAL_DATA: {blog.slug.toUpperCase()}</p>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="blog-content mb-16 md:mb-32 w-full">
             <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ ...props }) => (
                    <img 
                      {...props} 
                      src={convertDriveLink(props.src || '')} 
                      referrerPolicy="no-referrer" 
                      className="rounded-2xl md:rounded-3xl border border-white/10 my-10 md:my-16 shadow-2xl mx-auto"
                    />
                  ),
                  p: ({ children }) => <p className="mb-6 md:mb-8 text-center md:text-left">{children}</p>,
                  h2: ({ children }) => <h2 className="text-3xl md:text-4xl mt-16 md:mt-20 mb-6 md:mb-8 text-center md:text-left">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl md:text-2xl mt-10 md:mt-12 mb-4 md:mb-6 text-center md:text-left">{children}</h3>,
                }}
             >
                {blog.content}
             </ReactMarkdown>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-10 md:py-14 border-y border-white/5 mb-24 md:mb-40 w-full">
             <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 w-full md:w-auto">
                <button 
                  onClick={handleLike}
                  className={cn(
                    "w-full sm:w-auto flex items-center justify-center gap-4 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-display font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-[10px] transition-all border",
                    hasLiked ? "bg-accent text-bg-page border-accent" : "border-white/10 hover:border-accent hover:text-accent"
                  )}
                >
                   <Heart size={18} className={cn(hasLiked && "fill-current")} />
                   {hasLiked ? 'VERIFIED' : 'AUTHENTICATE'}
                </button>
  
                <button 
                  onClick={toggleSave}
                  className={cn(
                    "w-full sm:w-auto flex items-center justify-center p-4 md:p-5 rounded-xl md:rounded-2xl border transition-all",
                    isSaved ? "bg-white/10 border-white/20 text-accent" : "border-white/10 hover:border-accent hover:text-accent"
                  )}
                >
                   {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                </button>
             </div>
             
             <button className="btn-premium w-full md:w-auto px-8 md:px-10 py-4 md:py-5 text-[9px] md:text-[10px]">
                <Share2 size={16} /> BROADCAST_SIGNAL
             </button>
          </div>
    
          <section className="mb-24 md:mb-40 space-y-12 md:space-y-16 w-full flex flex-col items-center">
             <div className="flex items-center gap-6 md:gap-10 w-full">
                <h3 className="text-[10px] md:text-[12px] font-display font-black tracking-[0.4em] md:tracking-[0.8em] uppercase text-accent/40 whitespace-nowrap">FEEDBACK_LOOP</h3>
                <div className="h-[1px] flex-grow bg-white/5" />
             </div>
             <div className="flex justify-center w-full">
                <RatingSystem blog={blog} userId={userId} onRate={(avg, count) => setBlog({...blog, ratingAverage: avg, ratingCount: count})} />
             </div>
          </section>
    
          <div className="w-full">
            <CommentSection blogId={blog.id} />
          </div>
        </div>
      </motion.article>

      <section className="mt-24 md:mt-40">
        <NewsletterBox />
      </section>
    </div>
  );
}
