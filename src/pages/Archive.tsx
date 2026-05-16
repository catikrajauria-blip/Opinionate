import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import { convertDriveLink } from '../lib/googlePicker';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12">
      <header className="mb-20 md:mb-32 text-center flex flex-col items-center">
        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="w-8 md:w-16 h-[2px] bg-accent"></div>
          <span className="text-[9px] md:text-[11px] font-mono font-bold uppercase tracking-[0.4em] md:tracking-[0.5em] text-accent animate-pulse">ARCHIVE DATABASE</span>
          <div className="w-8 md:w-16 h-[2px] bg-accent"></div>
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-9xl font-display font-black mb-8 md:mb-12 tracking-tighter uppercase leading-[1] text-text-primary text-center">
          THE <span className="text-accent italic">ARCHIVE</span>
        </h1>
        <p className="text-text-secondary max-w-3xl mb-16 md:mb-24 font-sans font-medium text-lg md:text-2xl leading-relaxed text-center px-4">
          A collection of all published opinions and deep dives, tracking culture and policy over time.
        </p>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-0 border border-border bg-surface/20">
          <div className="lg:col-span-6 p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-border relative group flex flex-col items-center">
            <Search className="hidden sm:block absolute right-12 top-1/2 -translate-y-1/2 text-accent opacity-30 group-focus-within:opacity-100 transition-opacity" size={32} />
            <input 
              type="text" 
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xl sm:text-3xl md:text-5xl font-display font-black placeholder:text-text-secondary/40 placeholder:font-display uppercase tracking-tighter text-text-primary text-center"
            />
            <div className="text-[9px] font-mono font-black uppercase text-accent mt-4 md:mt-6 tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
               NODE_QUERY_ACTIVE
            </div>
          </div>

          <div className="lg:col-span-4 p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-border flex flex-col items-center justify-center bg-surface">
            <div className="flex items-center gap-4 group/select">
              <Calendar size={18} className="text-accent" />
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent text-[11px] md:text-sm font-mono font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] outline-none cursor-pointer text-text-primary focus:text-accent transition-colors text-center"
              >
                <option value="all">ALL MONTHS</option>
                {months.map(m => (
                  <option key={m} value={m} className="bg-bg-page">{new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-2 p-6 flex items-center justify-center gap-6 bg-surface/50">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-5 border transition-all duration-300 relative group rounded-lg",
                viewMode === 'grid' ? "bg-accent border-accent text-white shadow-lg" : "border-border text-text-secondary hover:border-accent/50"
              )}
            >
              <LayoutGrid size={22} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-5 border transition-all duration-300 relative group rounded-lg",
                viewMode === 'list' ? "bg-accent border-accent text-white shadow-lg" : "border-border text-text-secondary hover:border-accent/50"
              )}
            >
              <ListIcon size={22} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.4 }}
                className="group bg-surface/30 backdrop-blur-sm border border-border p-8 md:p-12 flex flex-col md:flex-row gap-12 hover:border-accent/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-full md:w-96 aspect-video overflow-hidden flex-shrink-0 border border-border rounded-xl saturate-50 group-hover:saturate-150 transition-all duration-1000 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-page/40 to-transparent z-10 opacity-40" />
                  <img 
                    src={convertDriveLink(blog.image) || `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop`} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-2000" 
                    referrerPolicy="no-referrer" 
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop`;
                      target.onerror = null;
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center gap-8 flex-grow">
                   <div className="flex items-center gap-6">
                     <span className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-accent">{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
                     <div className="h-[1px] flex-grow bg-border" />
                   </div>
                   <h3 className="text-2xl md:text-3xl font-display font-black group-hover:text-accent transition-colors leading-[1.1] uppercase tracking-tighter text-text-primary mb-6">{blog.title}</h3>
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
