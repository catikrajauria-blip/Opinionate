import React, { useState, useEffect } from 'react';
import { blogService } from '../lib/blogService';
import { Blog } from '../types';
import BlogCard from '../components/BlogCard';
import { Bookmark, Search, ArrowRight, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function SavedBlogs() {
  const { user, profile, loading: authLoading } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadSavedBlogs() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await blogService.getSavedBlogs(user.uid);
        setBlogs(data);
      } catch (error) {
        console.error('Error loading saved blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSavedBlogs();
  }, [user]);

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface p-12 rounded-[2.5rem] border border-border"
        >
          <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent/20">
            <Bookmark size={40} />
          </div>
          <h1 className="text-3xl font-display font-black mb-4 text-text-primary uppercase tracking-tighter leading-tight">Your Reading List</h1>
          <p className="text-text-secondary mb-8 font-display font-bold leading-relaxed italic">
            Sign in to start saving opinions for later reading. Your list will be synced across all your devices.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 bg-text-primary text-bg-page rounded-2xl font-bold hover:glow-cyan transition-all border border-text-primary"
          >
            <LogIn size={20} />
            Sign in to Opinionate
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-full text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-6">
          <Bookmark size={12} className="text-accent" />
          Personal Library
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-black mb-6 tracking-tighter leading-tight uppercase">Reading List</h1>
        <p className="text-text-secondary max-w-2xl mx-auto font-display font-bold text-lg leading-relaxed italic">
          The ideas and perspectives you've archived for deeper contemplation.
        </p>

        <div className="mt-12 max-w-xl mx-auto relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search your saved opinions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-[2rem] py-5 pl-14 pr-8 outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all font-medium"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
        <AnimatePresence mode="popLayout">
          {filteredBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col h-full bg-surface/30 rounded-2xl border border-transparent hover:border-border transition-all p-4"
            >
              <BlogCard blog={blog} isGrid={true} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-border px-10">
          <div className="max-w-md mx-auto">
            <Bookmark size={48} className="mx-auto text-text-secondary opacity-20 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Nothing saved yet</h2>
            <p className="text-text-secondary font-display font-bold mb-10">
              Browse the archive to find opinions and reports that resonate with you.
            </p>
            <Link
              to="/archive"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent hover:underline"
            >
              Explore Archive <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : filteredBlogs.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-secondary font-display font-bold italic text-xl">
            No saved opinions match your search.
          </p>
        </div>
      )}
    </div>
  );
}
