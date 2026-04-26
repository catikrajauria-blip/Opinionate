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
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-20 text-text-primary">
      <Link 
        to="/archive" 
        className="inline-flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-accent hover:text-text-primary transition-all mb-20 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
        BACK TO ARCHIVE
      </Link>

      <motion.article 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-32 relative"
      >
        <header className="mb-24">
          <div className="flex items-center gap-6 mb-10">
            <span className="px-4 py-1 bg-accent/10 border border-accent/30 text-accent text-[10px] font-mono font-black uppercase tracking-[0.3em] glow-cyan/10">ANALYSIS</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-secondary opacity-50">PUBLISHED // {formatDate(blog.date)}</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-display font-black leading-[0.85] mb-16 tracking-tighter uppercase break-words text-text-primary drop-shadow-[0_0_25px_rgba(var(--color-accent),0.1)]">
            {blog.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-y border-border bg-surface backdrop-blur-sm px-8">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent opacity-70">AUTHOR</span>
              <span className="text-xl font-display font-black uppercase tracking-tight text-text-primary">{blog.author}</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent opacity-70">ARTICLE STATS</span>
              <span className="text-xl font-display font-black uppercase tracking-tight text-text-primary">{calculateReadingTime(blog.content)} MIN READ &bull; {blog.viewsCount} VIEWS</span>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent opacity-70">ENGAGEMENT</span>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-secondary-accent font-display font-black text-2xl drop-shadow-[0_0_10px_rgba(255,0,255,0.3)]">{blog.ratingAverage.toFixed(1)}</span>
                  <span className="text-[10px] font-mono opacity-30 uppercase tracking-widest">/ 5.0</span>
                </div>
                <button 
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 border transition-all",
                    hasLiked ? "text-secondary-accent border-secondary-accent/40 bg-secondary-accent/10 glow-pink/10" : "text-text-secondary border-border hover:text-text-primary hover:border-accent"
                  )}
                >
                  <Heart size={16} className={hasLiked ? "fill-secondary-accent" : ""} />
                  <span className="text-xs font-mono font-black uppercase">{blog.likesCount}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {blog.image && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-24 relative group"
          >
            <div className="absolute inset-0 bg-accent/5 mix-blend-multiply opacity-50 group-hover:opacity-0 transition-opacity duration-1000" />
            <img src={blog.image} alt={blog.title} className="w-full aspect-video object-cover transition-all duration-1000 border border-border" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 border-[20px] border-bg-page/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.6em] mt-6 text-center opacity-40 group-hover:opacity-100 transition-opacity">ARTICLE IMAGE: {blog.title}</p>
          </motion.div>
        )}

        <div className="max-w-3xl mx-auto relative">
          <div className="blog-content mb-32 relative text-xl leading-[1.7] font-medium text-text-primary/90">
             <div className="absolute -left-12 top-0 bottom-0 w-[1px] bg-gradient-to-b from-accent/50 via-accent/5 to-transparent h-40" />
             <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-12 border-y border-border mb-32 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Share2 size={120} />
             </div>
             <div className="flex items-center gap-4 z-10">
                <button 
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-3 px-8 py-4 border font-mono font-black uppercase tracking-[0.3em] text-[11px] transition-all",
                    hasLiked ? "bg-secondary-accent text-bg-page border-secondary-accent glow-pink" : "border-border hover:border-accent hover:text-accent"
                  )}
                >
                   <Heart size={16} className={cn(hasLiked && "fill-bg-page")} />
                   <span>{hasLiked ? 'LIKED' : 'LIKE THIS'}</span>
                </button>
  
                <button 
                  onClick={toggleSave}
                  className={cn(
                    "p-4 border transition-all",
                    isSaved ? "bg-accent text-bg-page border-accent glow-cyan" : "border-border hover:border-accent hover:text-accent"
                  )}
                  title="Archive for later"
                >
                   {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
             </div>
             
             <button className="flex items-center gap-4 px-8 py-4 bg-surface border border-border text-text-primary font-mono font-black uppercase tracking-[0.4em] text-[11px] hover:bg-accent hover:text-bg-page transition-all z-10">
                <Share2 size={16} /> SHARE ARTICLE
             </button>
          </div>
  
          <section className="mb-32">
             <div className="flex items-center gap-6 mb-12">
               <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-border" />
               <h3 className="text-[11px] font-mono font-black tracking-[0.6em] uppercase text-accent">COMMUNITY RATING</h3>
               <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-border" />
             </div>
             <div className="bg-surface/30 backdrop-blur-md p-12 border border-border relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <RatingSystem blog={blog} userId={userId} onRate={(avg, count) => setBlog({...blog, ratingAverage: avg, ratingCount: count})} />
             </div>
          </section>
  
          <CommentSection blogId={blog.id} />
        </div>
      </motion.article>
    </div>
  );
}
