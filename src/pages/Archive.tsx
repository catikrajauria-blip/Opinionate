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
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <header className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <span className="w-12 h-px bg-accent" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-accent">CHRONICLE_DATABASE</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-black mb-10 tracking-tighter uppercase leading-tight">
          The Archive
        </h1>
        <p className="text-text-secondary max-w-2xl mb-16 font-display font-bold text-xl md:text-2xl leading-tight uppercase tracking-tight">
          EXPLORE A SYSTEMATIC RECORD OF DAILY REFLECTIONS AND CRITICAL ANALYSES WITHIN THE GLOBAL ECOSYSTEM.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border border-border">
          <div className="md:col-span-6 p-6 md:p-10 border-b md:border-b-0 md:border-r border-border relative group">
            <Search className="absolute right-10 top-1/2 -translate-y-1/2 text-accent opacity-20 group-focus-within:opacity-100 transition-opacity" size={24} />
            <input 
              type="text" 
              placeholder="SEARCH_QUERY..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-2xl md:text-4xl font-display font-black placeholder:text-border placeholder:font-display uppercase tracking-tighter"
            />
            <div className="text-[10px] font-mono font-black uppercase text-text-secondary mt-4 tracking-widest">INPUT FIELD [STRING]</div>
          </div>

          <div className="md:col-span-4 p-8 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <Calendar size={18} className="text-accent" />
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent text-sm font-mono font-bold uppercase tracking-[0.2em] outline-none cursor-pointer text-text-primary flex-grow"
              >
                <option value="all">ALL_MONTHS</option>
                {months.map(m => (
                  <option key={m} value={m} className="bg-bg-page">{new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="text-[10px] font-mono font-black uppercase text-text-secondary mt-4 tracking-widest flex items-center justify-between gap-4">
              <span>TEMPORAL_FILTER</span>
              <span className="text-accent">{filteredBlogs.length} ENTRIES_MATCHED</span>
            </div>
          </div>

          <div className="md:col-span-2 p-8 flex items-center justify-center gap-6">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-4 border transition-all",
                viewMode === 'grid' ? "bg-accent border-accent text-bg-page" : "border-border text-text-secondary hover:border-accent"
              )}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-4 border transition-all",
                viewMode === 'list' ? "bg-accent border-accent text-bg-page" : "border-border text-text-secondary hover:border-accent"
              )}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-6">
          <div className="w-16 h-1 w-16 bg-border overflow-hidden">
             <motion.div 
               animate={{ x: [-64, 64] }} 
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               className="w-16 h-full bg-accent"
             />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.5em] text-text-secondary">SYSTEM_RETRIEVING...</span>
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className={cn(
          "grid gap-px bg-border border border-border",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredBlogs.map((blog, idx) => (
            viewMode === 'grid' ? (
              <div key={blog.id} className="bg-bg-page p-px">
                <BlogCard blog={blog} index={idx} isGrid={true} />
              </div>
            ) : (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-bg-page border-b border-border last:border-b-0 p-8 flex flex-col md:flex-row gap-12 hover:bg-surface transition-all"
              >
                <div className="w-full md:w-80 aspect-video overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img src={blog.image || `https://picsum.photos/seed/${blog.slug}/800/500`} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col justify-center gap-6 flex-grow">
                   <div className="flex items-center gap-4">
                     <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent">{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                     <span className="h-px w-8 bg-border" />
                   </div>
                   <h3 className="text-3xl md:text-4xl font-display font-black group-hover:text-accent transition-colors leading-tight uppercase tracking-tighter">{blog.title}</h3>
                   <p className="text-text-secondary font-display font-black text-sm line-clamp-2 max-w-2xl uppercase">{blog.summary}</p>
                   
                   <div className="flex flex-wrap items-center gap-8 py-6 border-y border-border/50">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-mono text-text-secondary uppercase tracking-widest">ACCESS_CODE</span>
                        <span className="text-xs font-mono font-bold uppercase">{blog.viewsCount || 0}_VIEWS</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-mono text-text-secondary uppercase tracking-widest">SENTIMENT</span>
                        <span className="text-xs font-mono font-bold uppercase">{blog.likesCount || 0}_POSITIVE</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-mono text-text-secondary uppercase tracking-widest">RATING</span>
                        <span className="text-xs font-mono font-bold uppercase">{blog.ratingAverage?.toFixed(1) || '0.0'} / 5.0</span>
                      </div>
                   </div>

                   <Link to={`/blog/${blog.slug}`} className="btn-minimal self-start group/btn font-mono">
                      LOAD_ANALYSIS <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                   </Link>
                </div>
              </motion.div>
            )
          ))}
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-border">
           <Search size={64} className="mx-auto text-border mb-8" />
           <h3 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">NULL_RESULTS_FOUND</h3>
           <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">THE REQUESTED QUERY RETURNED NO MATCHING ENTRIES IN THE ARCHIVE.</p>
        </div>
      )}
    </div>
  );
}
