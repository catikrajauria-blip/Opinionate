import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import { Bookmark, LayoutGrid, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavedBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedBlogs() {
      const savedSlugs = JSON.parse(localStorage.getItem('saved_blogs') || '[]');
      if (savedSlugs.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Since we don't have a multi-get-by-slug, we'll just fetch all and filter
        // In a real app we would have a specific endpoint or use firebase IN query
        const all = await blogService.getLatestBlogs(100);
        setBlogs(all.filter(b => savedSlugs.includes(b.slug)));
      } catch (error) {
        console.error('Error loading saved blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSavedBlogs();
  }, []);

  const removeBookmark = (slug: string) => {
    const saved = JSON.parse(localStorage.getItem('saved_blogs') || '[]');
    const newSaved = saved.filter((s: string) => s !== slug);
    localStorage.setItem('saved_blogs', JSON.stringify(newSaved));
    setBlogs(blogs.filter(b => b.slug !== slug));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-16 flex items-center justify-between border-b border-border pb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Reading List</h1>
          <p className="text-text-secondary font-serif text-lg">Your curated collection of bookmarked daily blogs.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-lg text-text-primary font-bold text-[13px] uppercase tracking-widest">
           {blogs.length} Saved Items
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {blogs.map((blog, idx) => (
              <motion.div 
                key={blog.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                 <button 
                   onClick={() => removeBookmark(blog.slug)}
                   className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-md text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-50"
                   title="Remove from saved"
                 >
                   <Trash2 size={18} />
                 </button>
                 <BlogCard blog={blog} index={idx} isGrid={true} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
               <Bookmark size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-400 mb-4">No saved blogs yet</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">Found some interesting opinions? Bookmark them to read or reference them later.</p>
            <Link 
              to="/archive" 
              className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 mx-auto w-fit hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
            >
              Browse Archive
              <ArrowRight size={20} />
            </Link>
        </div>
      )}
    </div>
  );
}
