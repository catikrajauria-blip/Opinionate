import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import { Search, Filter, Calendar, LayoutGrid, List as ListIcon, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Archive() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function loadBlogs() {
      try {
        const allBlogs = await blogService.getLatestBlogs(100);
        setBlogs(allBlogs);
      } catch (error) {
        console.error('Error loading archive:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase()) || 
                         blog.summary.toLowerCase().includes(search.toLowerCase());
    const matchesMonth = filterMonth === 'all' || blog.date.startsWith(filterMonth);
    return matchesSearch && matchesMonth;
  });

  const months = Array.from(new Set(blogs.map(b => b.date.substring(0, 7)))).sort().reverse();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <header className="mb-32">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-[2px] bg-accent glow-cyan"></div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.5em] text-accent animate-pulse">ARCHIVE DATABASE</span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-display font-black mb-12 tracking-tighter uppercase leading-[0.85] text-text-primary">
          THE <span className="text-accent italic drop-shadow-[0_0_15px_rgba(0,238,255,0.4)]">ARCHIVE</span>
        </h1>
        <p className="text-text-secondary max-w-3xl mb-24 font-sans font-medium text-xl md:text-2xl leading-relaxed opacity-70 border-l-2 border-accent/30 pl-8">
          A collection of all published opinions and deep dives, tracking culture and policy over time.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-border bg-surface/20 backdrop-blur-md">
          <div className="lg:col-span-6 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-border relative group">
            <Search className="absolute right-12 top-1/2 -translate-y-1/2 text-accent opacity-30 group-focus-within:opacity-100 transition-opacity animate-pulse" size={32} />
            <input 
              type="text" 
              placeholder="Search the archive..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-2xl md:text-5xl font-display font-black placeholder:text-text-secondary/40 placeholder:font-display uppercase tracking-tighter text-text-primary"
            />
            <div className="text-[10px] font-mono font-black uppercase text-accent mt-6 tracking-[0.3em] flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
               SEARCH RESULTS
            </div>
          </div>

          <div className="lg:col-span-4 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-center bg-surface">
            <div className="flex items-center gap-4 group/select">
              <Calendar size={20} className="text-accent group-hover/select:rotate-12 transition-transform" />
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent text-sm font-mono font-bold uppercase tracking-[0.3em] outline-none cursor-pointer text-text-primary flex-grow focus:text-accent transition-colors"
              >
                <option value="all">ALL MONTHS</option>
                {months.map(m => (
                  <option key={m} value={m} className="bg-bg-page">{new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="text-[10px] font-mono font-black uppercase text-text-secondary mt-6 tracking-[0.2em] flex items-center justify-between gap-4">
              <span className="opacity-40">DATE FILTER</span>
              <span className="text-secondary-accent">{filteredBlogs.length} RESULTS FOUND</span>
            </div>
          </div>

          <div className="lg:col-span-2 p-8 flex items-center justify-center gap-6 bg-surface/50">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-5 border transition-all duration-300 relative group",
                viewMode === 'grid' ? "bg-accent border-accent text-bg-page glow-cyan" : "border-border text-text-secondary hover:border-accent/50"
              )}
            >
              <LayoutGrid size={22} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-5 border transition-all duration-300 relative group",
                viewMode === 'list' ? "bg-accent border-accent text-bg-page glow-cyan" : "border-border text-text-secondary hover:border-accent/50"
              )}
            >
              <ListIcon size={22} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-32 flex flex-col items-center gap-8">
          <div className="w-32 h-1 bg-border overflow-hidden rounded-full">
             <motion.div 
                animate={{ x: [-128, 128] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-full bg-gradient-to-r from-transparent via-accent to-transparent glow-cyan"
             />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.8em] text-accent animate-pulse">Loading archive...</span>
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredBlogs.map((blog, idx) => (
            viewMode === 'grid' ? (
              <div key={blog.id}>
                <BlogCard blog={blog} index={idx} isGrid={true} />
              </div>
            ) : (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.8 }}
                className="group bg-surface/30 backdrop-blur-sm border border-border p-8 md:p-12 flex flex-col md:flex-row gap-12 hover:border-accent/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity glow-cyan" />
                <div className="w-full md:w-96 aspect-video overflow-hidden flex-shrink-0 border border-border saturate-50 group-hover:saturate-150 transition-all duration-1000 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-page/80 to-transparent z-10 opacity-40" />
                  <img src={blog.image || `https://picsum.photos/seed/${blog.slug}/800/500`} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-2000" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col justify-center gap-8 flex-grow">
                   <div className="flex items-center gap-6">
                     <span className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-accent drop-shadow-[0_0_5px_rgba(0,238,255,0.3)]">{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
                     <div className="h-[1px] flex-grow bg-border" />
                   </div>
                   <h3 className="text-4xl md:text-6xl font-display font-black group-hover:text-accent transition-colors leading-[0.9] uppercase tracking-tighter text-text-primary">{blog.title}</h3>
                   <p className="text-text-secondary font-sans font-medium text-lg md:text-xl line-clamp-2 max-w-3xl opacity-70 border-l border-border pl-6">"{blog.summary}"</p>
                   
                   <div className="flex flex-wrap items-center gap-12">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em] opacity-60">TOTAL VIEWS</span>
                        <span className="text-sm font-mono font-bold uppercase text-text-primary">{blog.viewsCount || 0}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em] opacity-60">LIKES</span>
                        <span className="text-sm font-mono font-bold uppercase text-text-primary">{blog.likesCount || 0}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em] opacity-60">RATING</span>
                        <span className="text-sm font-mono font-bold uppercase text-text-primary">{blog.ratingAverage?.toFixed(1) || '0.0'} / 5.0</span>
                      </div>
                      <Link to={`/blog/${blog.slug}`} className="ml-auto group/btn flex items-center gap-4 text-accent font-mono font-bold text-xs tracking-[0.4em] hover:translate-x-4 transition-all duration-500">
                         READ FULL ARTICLE <ChevronRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                      </Link>
                   </div>
                </div>
              </motion.div>
            )
          ))}
        </div>
      ) : (
        <div className="py-48 text-center border border-dashed border-border bg-surface/10 flex flex-col items-center justify-center">
           <div className="w-24 h-24 rounded-full border border-accent/20 flex items-center justify-center mb-10 group bg-accent/5">
             <Search size={40} className="text-accent opacity-40 group-hover:opacity-100 transition-opacity" />
           </div>
           <h3 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-6 text-text-primary">NO RESULTS FOUND</h3>
           <p className="text-text-secondary font-mono text-xs uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed opacity-60">We couldn't find any documents matching your search. Try different keywords or dates.</p>
        </div>
      )}
    </div>
  );
}
