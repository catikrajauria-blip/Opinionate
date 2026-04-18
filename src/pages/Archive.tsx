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
    <div className="max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Archive</h1>
        <p className="text-text-secondary max-w-2xl mb-10 font-serif text-lg leading-relaxed">
          Explore a chronical of daily reflections and deep dives into the global news cycle.
        </p>

        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between border-y border-border py-8">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search opinions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none py-3 pl-8 pr-4 outline-none text-lg font-serif placeholder:font-serif italic"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-text-secondary" />
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent text-sm font-bold uppercase tracking-widest outline-none cursor-pointer border-b border-border focus:border-text-primary transition-colors text-text-primary"
              >
                <option value="all">All Months</option>
                {months.map(m => (
                  <option key={m} value={m} className="bg-bg-page">{new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>
                ))}
              </select>
            </div>

            <div className="flex border border-border rounded-lg p-1 gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === 'grid' ? "bg-accent text-white" : "text-gray-400"
                )}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === 'list' ? "bg-accent text-white" : "text-gray-400"
                )}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className={cn(
          "grid gap-8",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredBlogs.map((blog, idx) => (
            viewMode === 'grid' ? (
              <BlogCard key={blog.id} blog={blog} index={idx} />
            ) : (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-surface rounded-xl border border-border p-6 flex flex-col md:flex-row gap-8 hover:border-text-primary transition-all shadow-sm"
              >
                <div className="w-full md:w-64 h-40 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                  <img src={blog.image || `https://picsum.photos/seed/${blog.slug}/800/500`} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col justify-center gap-3">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                   <h3 className="text-2xl font-serif font-bold group-hover:text-text-secondary transition-colors leading-tight">{blog.title}</h3>
                   <p className="text-text-secondary font-serif text-sm line-clamp-2 max-w-2xl">{blog.summary}</p>
                   <Link to={`/blog/${blog.slug}`} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-primary group/link border-b border-text-primary pb-0.5 self-start">
                      Read Opinion <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                   </Link>
                </div>
              </motion.div>
            )
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-surface rounded-xl border border-border">
           <Search size={48} className="mx-auto text-text-secondary/30 mb-4" />
           <h3 className="text-xl font-bold text-text-secondary font-serif italic">No opinions found</h3>
           <p className="text-text-secondary text-sm font-serif">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
