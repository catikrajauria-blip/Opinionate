import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import { calculateReadingTime, generateUserId, cn } from '../lib/utils';
import { convertDriveLink } from '../lib/googlePicker';
import { Eye, Heart, Zap, ArrowUpRight, ShieldCheck, Cpu, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BlogCard from '../components/BlogCard';
import WordWidget from '../components/WordWidget';
import PollWidget from '../components/PollWidget';

export default function Home() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTodayData() {
      try {
        let latest = await blogService.getLatestBlogs(4);
        setBlogs(latest);
      } catch (error) {
        console.error('Error loading today data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTodayData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center gap-10">
        <div className="relative w-32 h-32">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-[1px] border-accent/20 rounded-full" 
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-t-2 border-accent rounded-full pulse-glow" 
          />
        </div>
        <p className="text-[10px] font-display font-black uppercase tracking-[1em] text-accent">Loading Archive...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Immersive Hero */}
        <header className="relative min-h-screen flex flex-col items-center justify-center pt-40 pb-20 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="text-center relative z-10"
          >
            <div className="flex flex-col items-center mb-12">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 0.2, duration: 1 }}
                 className="inline-flex items-center gap-3 px-6 py-2 glass rounded-full border-accent/20"
               >
                 <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                 <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-accent">
                   Insight Feed
                 </span>
               </motion.div>
            </div>

            <h1 className="flex flex-col mb-16 select-none">
              <motion.span 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 1, ease: "circOut" }}
                className="text-text-primary text-[11vw] md:text-8xl leading-none transition-all duration-1000"
              >
                Opinions That
              </motion.span>
              <motion.span 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 1, ease: "circOut" }}
                className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-indigo italic text-[13vw] md:text-9xl mt-2"
              >
                Shape Reality
              </motion.span>
            </h1>

            <p className="max-w-4xl mx-auto text-xl md:text-4xl font-display font-medium text-text-secondary leading-relaxed mb-24 uppercase tracking-widest opacity-80 transition-all duration-700">
              Insightful commentary on <span className="text-white decoration-accent decoration-2 underline underline-offset-8">Culture & Policy</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/news" className="btn-primary group px-16 py-6 text-sm">
                View News
                <ArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link to="/archive" className="btn-secondary px-16 py-6 text-sm glass">
                 Explore Archive
              </Link>
            </div>
          </motion.div>
        </header>

        {/* News Ticker */}
        <div className="flex items-center justify-between border-b border-border py-4 mb-20">
           <div className="flex items-center gap-6 overflow-hidden">
              <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-[0.2em] whitespace-nowrap shrink-0">LATEST_INTEL:</span>
              <div className="flex gap-10 animate-marquee whitespace-nowrap">
                {[...blogs, ...blogs].map((b, bIdx) => (
                  <Link key={`${b.id}-${bIdx}`} to={`/blog/${b.slug}`} className="text-[10px] font-mono text-text-secondary hover:text-accent uppercase tracking-widest transition-colors">
                    {b.title} //
                  </Link>
                ))}
              </div>
           </div>
           <div className="flex items-center gap-3 shrink-0 ml-10">
              <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">UPDATED:</span>
              <span className="text-[10px] font-mono font-black text-text-primary">{new Date().toLocaleTimeString('en-GB')}</span>
           </div>
        </div>

        {/* Live Pulse Section */}
        <section className="pb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] flex-grow bg-border opacity-50"></div>
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.6em] text-accent">Pulse Feed</h2>
            <div className="h-[1px] flex-grow bg-border opacity-50"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1">
              <WordWidget />
            </div>
            <div className="lg:col-span-2">
              <PollWidget />
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
           {[
             { id: 'finance', icon: ShieldCheck, title: "Finance", desc: "Global markets, crypto evolution, and fiscal policies.", color: "from-accent/30" },
             { id: 'tech', icon: Cpu, title: "Tech", desc: "AI, high-frequency trading, and disruptive tech innovations.", color: "from-accent-violet/30" },
             { id: 'indian-politics', icon: Globe, title: "Indian Politics", desc: "Analyzing the complex landscape of Indian governance.", color: "from-orange-500/20" },
             { id: 'geopolitics', icon: Globe, title: "Geopolitics", desc: "Unpacking chess moves of international diplomacy.", color: "from-accent-magenta/30" }
           ].map((feature, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1, duration: 0.8 }}
               className="h-full"
             >
                <Link 
                  to={`/news?category=${feature.id}`}
                  className="glass-card glass-card-hover p-10 flex flex-col items-start group relative h-full block"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} to-transparent flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-700 shadow-xl`}>
                     <feature.icon className="text-accent" size={24} />
                  </div>
                  <h3 className="text-2xl font-display font-black uppercase mb-6 tracking-widest text-text-primary group-hover:text-accent transition-colors">{feature.title}</h3>
                  <p className="text-text-secondary font-medium leading-[1.8] uppercase text-[10px] tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity">
                     {feature.desc}
                  </p>
                  <div className="mt-auto pt-6 flex items-center gap-2 text-[8px] font-mono font-bold text-accent opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    OPEN NEWS <ArrowUpRight size={12} />
                  </div>
                </Link>
             </motion.div>
           ))}
        </section>

        {/* Blog Feed */}
        <section className="pb-40">
          <div className="mb-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="section-heading"
            >
              <h2 className="text-5xl md:text-7xl">Latest Insights</h2>
            </motion.div>
            <p className="mt-6 text-[10px] font-mono font-medium text-text-muted tracking-[0.4em] uppercase ml-10">Editorial Analysis // 2026 Archive</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {blogs.map((blog, idx) => (
              <BlogCard key={blog.id} blog={blog} index={idx} isGrid />
            ))}
          </div>
          
          <div className="mt-20 flex justify-center">
             <Link to="/archive" className="btn-secondary group">
                View All Articles
                <Zap size={18} className="text-accent" />
             </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
