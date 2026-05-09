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

        {/* Feature Highlights */}
        <section className="py-40 grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
           {[
             { icon: ShieldCheck, title: "Financial", desc: "Deep dives into the volatile worlds of crypto and global markets.", color: "from-accent/30" },
             { icon: Cpu, title: "Market", desc: "Analyzing high-frequency trading and disruptive fintech innovations.", color: "from-accent-violet/30" },
             { icon: Globe, title: "Geopolitics", desc: "Unpacking the complex chess moves of international diplomacy.", color: "from-accent-magenta/30" }
           ].map((feature, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.2, duration: 1 }}
               className="glass-card glass-card-hover p-14 flex flex-col items-start group relative h-full"
             >
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} to-transparent flex items-center justify-center mb-12 border border-white/10 group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-700 shadow-xl`}>
                   <feature.icon className="text-accent" size={32} />
                </div>
                <h3 className="text-3xl font-display font-black uppercase mb-10 tracking-widest text-text-primary group-hover:text-accent transition-colors">{feature.title}</h3>
                <p className="text-text-secondary font-medium leading-[2] uppercase text-[12px] tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">
                   {feature.desc}
                </p>
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
