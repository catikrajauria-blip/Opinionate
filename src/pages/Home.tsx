import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { blogService } from '../lib/blogService';
import { wordService, WordOfTheDay } from '../lib/wordService';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import RatingSystem from '../components/RatingSystem';
import CommentSection from '../components/CommentSection';
import NewsletterBox from '../components/NewsletterBox';
import PollWidget from '../components/PollWidget';
import { calculateReadingTime, formatDate, generateUserId, cn } from '../lib/utils';
import { convertDriveLink } from '../lib/googlePicker';
import { Eye, Heart, MessageSquare, Clock, Share2, Bookmark, BookmarkCheck, Zap, ExternalLink, Newspaper as NewspaperIcon, ArrowUpRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [wotd, setWotd] = useState<WordOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => user?.uid || generateUserId());
  const [likingId, setLikingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTodayData() {
      try {
        let todayBlogs = await blogService.getTodayBlogs();
        
        // Fallback: If no blogs today, get latest 3 for "Daily News" context
        if (todayBlogs.length === 0) {
          todayBlogs = await blogService.getLatestBlogs(3);
        }
        
        const latestWord = await wordService.getLatestWord();
        
        setBlogs(todayBlogs);
        setWotd(latestWord);
        
        // Track views for the first one if it exists
        if (todayBlogs.length > 0) {
           try {
             await blogService.incrementViews(todayBlogs[0].id, userId);
           } catch (viewError) {
             console.warn('Failed to increment views on home:', viewError);
           }
        }
      } catch (error) {
        console.error('Error loading today data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTodayData();
  }, [userId]);

  const handleLike = async (e: React.MouseEvent, blogId: string, idx: number) => {
    e.preventDefault();
    if (likingId) return;
    
    setLikingId(blogId);
    try {
      const success = await blogService.incrementLikes(blogId, userId);
      if (success) {
        const newBlogs = [...blogs];
        newBlogs[idx] = { ...newBlogs[idx], likesCount: (newBlogs[idx].likesCount || 0) + 1 };
        setBlogs(newBlogs);
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    } finally {
      setLikingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-40 flex flex-col items-center justify-center gap-8">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-2 border-accent/20 rounded-full" />
          <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin glow-accent" />
          <div className="absolute inset-4 border-2 border-accent-vibrant/20 rounded-full" />
          <div className="absolute inset-4 border-b-2 border-accent-vibrant rounded-full animate-spin-reverse" style={{ animationDuration: '1.5s', boxShadow: '0 0 15px var(--color-accent-vibrant)' }} />
        </div>
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] animate-pulse text-accent">SYNCHRONIZING CONTENT...</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-surface rounded-3xl p-12 border border-border"
         >
           <NewspaperIcon className="mx-auto text-accent mb-6 opacity-40" size={48} />
           <h2 className="text-3xl font-display font-black text-text-primary mb-4 uppercase tracking-tighter">Daily News Incoming</h2>
           <p className="text-text-secondary mb-8 font-display font-bold uppercase tracking-tight max-w-md mx-auto opacity-70">Our editors are finalizing today's reports. In the meantime, explore our deep-dive archive or latest policy briefs.</p>
           <div className="flex justify-center gap-4">
             <Link to="/archive" className="btn-minimal px-8 py-3">Browse Archive</Link>
             <Link to="/indian-policy" className="btn-minimal px-8 py-3 border-accent/20 text-accent">Indian Policy</Link>
           </div>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8">
      {/* Premium Hero Section */}
      <header className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] right-[10%] w-96 h-96 bg-accent/20 blur-[120px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -80, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[10%] left-[5%] w-[30rem] h-[30rem] bg-accent-vibrant/10 blur-[150px] rounded-full" 
          />
        </div>

        <div className="container relative z-10 text-center">
          {user && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="inline-flex items-center gap-3 px-6 py-2 glass-vibrant rounded-full mb-12"
            >
              <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
              <span className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-accent">
                Welcome Back: <span className="text-text-primary">{user.displayName || user.email?.split('@')[0]}</span>
              </span>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-[12vw] md:text-9xl lg:text-[11rem] font-display font-black mb-6 tracking-tighter leading-[0.85] uppercase">
              Blogs and mor<span className="text-gradient italic">e</span>.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <p className="text-lg md:text-2xl font-display font-medium text-text-secondary leading-relaxed">
              We explain <span className="text-text-primary font-black">world politics</span>, tech trends, and <span className="text-text-primary font-black">market changes</span> in simple words.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Link to="/news" className="btn-premium group">
              Latest News
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <ArrowUpRight size={20} />
              </motion.div>
            </Link>
            <Link to="/archive" className="btn-glass">
              All Blogs
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">Scroll Down</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-accent to-transparent" />
        </motion.div>
      </header>

      {wotd && (
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="my-24 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent-vibrant/10 to-accent-pink/10 blur-3xl opacity-30" />
          <div className="max-w-xl mx-auto card-premium overflow-hidden !p-0">
              <div className="p-8 border-b border-border flex flex-col items-center justify-center text-center bg-surface/30">
                 <span className="text-[10px] font-display font-black text-accent uppercase tracking-[0.4em] mb-2">Word of the Day</span>
                 <h2 className="text-2xl lg:text-3xl font-display font-black uppercase text-gradient leading-tight">
                   {wotd.word}
                 </h2>
              </div>
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                  <div className="space-y-4">
                    <p className="text-xl md:text-2xl font-display font-black leading-tight text-text-primary uppercase">
                       {wotd.definition}
                    </p>
                    {wotd.usage && (
                      <div className="p-4 glass border-l-4 border-accent-vibrant text-left">
                        <p className="text-sm text-text-secondary font-mono italic leading-relaxed">
                          Example: {wotd.usage}
                        </p>
                      </div>
                    )}
                 </div>
              </div>
          </div>
        </motion.section>
      )}

      <PollWidget />

      {/* Featured Section */}
      <section className="my-32">
        <div className="flex items-end justify-between mb-16 px-4">
          <div>
            <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-4">Latest Blogs</h2>
            <div className="w-32 h-2 bg-gradient-to-r from-accent to-transparent" />
          </div>
          <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.3em] hidden md:block">
            Updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {blogs.map((blog, idx) => (
            <motion.div 
              key={blog.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                idx === 0 ? "md:col-span-12" : "md:col-span-6 lg:col-span-4"
              )}
            >
              <Link to={`/blog/${blog.slug}`} className="group block">
                <div className="card-premium h-full flex flex-col !p-0 overflow-hidden border-border">
                  <div className={cn(
                    "relative overflow-hidden",
                    idx === 0 ? "aspect-[21/9]" : "aspect-video"
                  )}>
                    {blog.image ? (
                      <img 
                        src={convertDriveLink(blog.image)} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-100" 
                        referrerPolicy="no-referrer" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent-vibrant/20 flex items-center justify-center">
                         <Zap size={64} className="text-accent animate-pulse" />
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <span className="px-3 py-1 glass-vibrant rounded-full text-[10px] font-display font-black uppercase tracking-widest text-accent border border-accent/20">
                        BLOG {idx + 1}
                      </span>
                    </div>
                  </div>

                  <div className="p-10 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-display font-black text-xs">
                        {blog.author.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-display font-black uppercase tracking-widest text-text-primary">{blog.author}</span>
                        <span className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-widest">{calculateReadingTime(blog.content)} MIN READ</span>
                      </div>
                    </div>

                    <h3 className={cn(
                      "font-display font-black text-text-primary group-hover:text-accent transition-colors mb-6 uppercase tracking-tight",
                      idx === 0 ? "text-4xl md:text-5xl lg:text-7xl" : "text-2xl md:text-3xl"
                    )}>
                      {blog.title}
                    </h3>

                    <p className="text-text-secondary font-medium leading-relaxed mb-8 line-clamp-3">
                      {blog.summary}
                    </p>

                    <div className="mt-auto pt-8 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-6 text-[10px] font-mono font-bold text-text-secondary">
                         <span className="flex items-center gap-2 group-hover:text-accent transition-colors"><Eye size={14} /> {blog.viewsCount}</span>
                         <span className="flex items-center gap-2 hover:text-red-500 transition-colors"><Heart size={14} /> {blog.likesCount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-display font-black uppercase tracking-widest text-accent">
                        Read Story
                        <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-x border-border p-12 md:p-24 bg-surface text-center">
         <div className="max-w-2xl mx-auto">
            <NewsletterBox />
         </div>
      </div>
    </div>
  );
}
