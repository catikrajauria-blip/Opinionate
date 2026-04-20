import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { blogService } from '../lib/blogService';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  Plus, LayoutGrid, FileText, Settings, LogOut, Send, 
  Image as ImageIcon, Link as LinkIcon, CheckCircle2, 
  Zap, Trash2, PieChart, Users, Shield, ShieldAlert,
  Search as SearchIcon, Mail as MailIcon, Clock 
} from 'lucide-react';
import { generateSlug, cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';

export default function Admin() {
  const { user, profile, isAdmin: isGlobalAdmin, loading: authLoading } = useAuth();
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'news' | 'users' | 'analytics'>('posts');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [stats, setStats] = useState<any>({
    totalBlogs: 0,
    totalSubscribers: 0,
    totalViews: 0,
    totalLikes: 0,
    avgRating: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newsCounts, setNewsCounts] = useState<Record<string, number>>({});

  // Post Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Kartik Rajauria');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // News Form State
  const [newsTitle, setNewsTitle] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsCategory, setNewsCategory] = useState('finance');
  const [newsSource, setNewsSource] = useState('');
  const [recentNews, setRecentNews] = useState<any[]>([]);

  useEffect(() => {
    if (user && isGlobalAdmin) {
      loadData();
    }
  }, [user, isGlobalAdmin, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'posts' || activeTab === 'analytics') loadBlogs();
      if (activeTab === 'news') loadRecentNews();
      if (activeTab === 'users') loadAllUsers();
      loadStats();
      loadNewsCounts();
    } finally {
      setLoading(false);
    }
  };

  const loadNewsCounts = async () => {
    try {
      const counts = await blogService.getNewsCounts();
      setNewsCounts(counts);
    } catch (err) {
      console.error('Error loading news counts:', err);
    }
  };

  const loadBlogs = async () => {
    try {
      const b = await blogService.getAllBlogs();
      setBlogs(b);
    } catch (err) {
      console.error('Error loading blogs:', err);
    }
  };

  const loadStats = async () => {
    try {
      const s = await blogService.getAdminStats();
      setStats(s);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadSubscribers = async () => {
    try {
      const subs = await blogService.getSubscribers();
      // No longer using separate subscribers tab, analytics handles it
    } catch (err) {
      console.error('Error loading subs:', err);
    }
  };

  const loadRecentNews = async () => {
    try {
      // Just load finance by default for the list
      const n = await blogService.getNewsByCategory(newsCategory, 5);
      setRecentNews(n);
    } catch (err) {
      console.error('Error loading news:', err);
    }
  };

  const loadAllUsers = async () => {
    try {
      const u = await blogService.getAllUsers();
      setAllUsers(u);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleToggleBlock = async (u: UserProfile) => {
    if (!window.confirm(`Are you sure you want to ${u.isBlocked ? 'unblock' : 'block'} ${u.displayName}?`)) return;
    try {
      await blogService.updateUserStatus(u.uid, !u.isBlocked);
      loadAllUsers();
    } catch (err: any) {
      alert(`Error updating user: ${err.message}`);
    }
  };

  const handleToggleRole = async (u: UserProfile) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${u.displayName}'s role to ${newRole}?`)) return;
    try {
      await blogService.updateUserRole(u.uid, newRole);
      loadAllUsers();
    } catch (err: any) {
      alert(`Error updating role: ${err.message}`);
    }
  };

  const generateAIContent = async () => {
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const prompt = `
        You are Kartik Rajauria, an expert news commentator focusing on Finance, Markets, Industry, Indian Politics, and Geopolitical issues.
        Write a daily news opinion blog post based on current events (Today is April 18, 2026).
        Focus on these topics: Finance, Indian Politics, Geopolitics, Market Trends.
        Additional Context/Title: ${title || "Daily Commentary"}
        
        The blog should have:
        1. A catchy Headline.
        2. A Summary (2-3 lines).
        3. Full content with Markdown (headings, lists, deep analysis).
        4. A personal, critical, and opinionated tone.
        
        Style: Clean Minimalism.
        Audience: Sophisticated readers seeking deep insights.
        
        Return the result as a valid JSON object with keys: title, summary, content.
        Do not include markdown code blocks around the JSON.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      const data = JSON.parse(result.text.trim());
      setTitle(data.title || title);
      setSummary(data.summary || summary);
      setContent(data.content || content);
    } catch (err: any) {
      console.error('AI Generation Error Detail:', err);
      const msg = err.message || "Unknown error";
      if (msg.includes("API key not valid")) {
        alert("CRITICAL: Your API Key is invalid. Please check your Vercel settings.");
      } else if (msg.includes("quota")) {
        alert("Quota exceeded for the Gemini API.");
      } else {
        alert(`Failed to generate AI content: ${msg}`);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGlobalAdmin) return;
    
    setSubmitting(true);
    try {
      const blogData: any = {
        title,
        date,
        summary,
        content,
        author,
        slug: generateSlug(title)
      };
      
      if (imageUrl) {
        blogData.image = imageUrl;
      }

      await blogService.createBlog(blogData);
      setSuccess(true);
      setTitle('');
      setSummary('');
      setContent('');
      setImageUrl('');
    } catch (error: any) {
      console.error('Error creating blog:', error);
      alert(`Failed to create blog: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGlobalAdmin) return;
    
    setSubmitting(true);
    try {
      await blogService.addNews({
        title: newsTitle,
        url: newsUrl,
        summary: newsSummary,
        category: newsCategory,
        source: newsSource
      });
      setSuccess(true);
      setNewsTitle('');
      setNewsUrl('');
      setNewsSummary('');
      setNewsSource('');
      loadRecentNews();
    } catch (error: any) {
      console.error('Error creating news:', error);
      alert(`Failed to add news: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Delete this news item?')) return;
    try {
      await blogService.deleteNews(id);
      loadRecentNews();
      loadNewsCounts();
    } catch (err: any) {
      console.error('Error deleting news:', err);
      alert(`Failed to delete news: ${err.message || 'Permission denied'}`);
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!window.confirm(`Unsubscribe and remove ${email}?`)) return;
    try {
      await blogService.deleteSubscriber(email);
      loadSubscribers();
      loadStats(); // Update reader count in overview
    } catch (err: any) {
      console.error('Error deleting sub:', err);
      alert(`Failed to delete subscriber: ${err.message || 'Permission denied'}`);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Delete this opinion archive? This action is permanent.')) return;
    try {
      await blogService.deleteBlog(id);
      loadBlogs();
      loadStats(); // Update blog count in overview
    } catch (err: any) {
      console.error('Error deleting blog:', err);
      alert(`Failed to delete blog: ${err.message || 'Permission denied'}`);
    }
  };

  if (authLoading || loading) {
    return <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    window.location.href = '/login?from=/admin';
    return null;
  }

  if (!isGlobalAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 dark:bg-red-950/20 p-8 md:p-12 rounded-[2.5rem] border border-red-100 dark:border-red-900/30">
           <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} />
           </div>
           <h2 className="text-2xl font-bold text-red-900 dark:text-red-400 mb-2">Unauthorized</h2>
           <p className="text-red-700 dark:text-red-300 mb-8 font-serif">This area is reserved for the blog owner. Your account ({user.email}) does not have admin privileges.</p>
           <button 
             onClick={() => signOut(auth)}
             className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none"
           >
             Sign Out
           </button>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u => 
    u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Admin Dashboard</h1>
            <p className="text-text-secondary flex items-center gap-2 text-sm font-serif">
              Logged in as <span className="text-text-primary font-bold">{user.email}</span>
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 border-l border-border pl-4 md:pl-8">
            <button 
              onClick={() => setActiveTab('posts')}
              className={cn("text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'posts' ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
            >
              Post Content
            </button>
            <button 
              onClick={() => setActiveTab('news')}
              className={cn("text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'news' ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
            >
              Newsletter ({Object.values(newsCounts).reduce((a, b) => a + b, 0)})
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={cn("text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'users' ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
            >
              User Management ({allUsers.length})
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={cn("text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'analytics' ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
            >
              Analytics
            </button>
          </nav>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="btn-minimal px-6 py-2"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {activeTab === 'posts' ? (
            <form onSubmit={handleCreateBlog} className="bg-surface p-10 rounded-xl border border-border space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-serif font-bold text-text-primary">
                     Daily Opinion Entry
                  </h2>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={generateAIContent}
                      disabled={aiLoading}
                      className="btn-minimal px-4 py-2 text-xs flex items-center gap-2 group"
                    >
                      <Zap size={14} className={cn("text-text-secondary group-hover:text-yellow-500", aiLoading && "animate-pulse")} /> 
                      {aiLoading ? 'Synthesizing...' : 'AI Fetch & Generate'}
                    </button>
                    {success && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-green-600 font-bold text-xs">
                          <CheckCircle2 size={14} /> Published.
                        </motion.div>
                    )}
                  </div>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary ml-1">Blog Title</label>
                    <input 
                       type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                       className="w-full bg-surface border border-border rounded-2xl p-4 outline-none focus:ring-4 focus:ring-accent/10 focus:bg-bg-page transition-all font-medium text-text-primary"
                       placeholder="The Future of AI Regulation..."
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary ml-1">Publish Date</label>
                    <input 
                       type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                       className="w-full bg-surface border border-border rounded-2xl p-4 outline-none focus:ring-4 focus:ring-accent/10 focus:bg-bg-page transition-all font-medium text-text-primary"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">Summary (2-3 lines)</label>
                 <textarea 
                    required value={summary} onChange={(e) => setSummary(e.target.value)} rows={3}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium resize-none"
                    placeholder="Short summary for archive cards..."
                 />
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center ml-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Main Content (Markdown supported)</label>
                    <span className="text-[10px] text-orange-500 font-bold">Use # for headings, * for lists</span>
                 </div>
                 <textarea 
                    required value={content} onChange={(e) => setContent(e.target.value)} rows={12}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium resize-none font-mono text-sm"
                    placeholder="Write your long-form opinion here..."
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-gray-50">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">Author Name</label>
                    <input 
                       type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1.5"><ImageIcon size={12} /> Featured Image URL (Optional)</label>
                    <input 
                       type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium"
                       placeholder="https://images.unsplash.com/..."
                    />
                 </div>
              </div>

              <button 
                 disabled={submitting}
                 className="btn-minimal-primary w-full py-5 text-lg"
               >
                 {submitting ? 'Publishing...' : 'Publish Daily Opinion'}
               </button>
            </form>
          ) : activeTab === 'news' ? (
            <div className="space-y-12">
              <form onSubmit={handleCreateNews} className="bg-white dark:bg-zinc-900 p-10 rounded-xl border border-border space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-serif font-bold text-text-primary">
                        Add Curated News
                    </h2>
                    {success && activeTab === 'news' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 font-bold text-xs flex items-center gap-2">
                           <CheckCircle2 size={14} /> Item Added.
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary ml-1">Headline</label>
                      <input 
                        type="text" required value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-black transition-all font-medium text-text-primary"
                        placeholder="Major shift in Market dynamics..."
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary ml-1">News Category</label>
                      <select 
                        value={newsCategory} onChange={(e) => setNewsCategory(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-black transition-all font-medium text-text-primary"
                      >
                        <option value="finance">Finance & Markets ({newsCounts.finance || 0})</option>
                        <option value="politics">Indian Politics ({newsCounts.politics || 0})</option>
                        <option value="geopolitics">Geopolitics ({newsCounts.geopolitics || 0})</option>
                        <option value="tech">Industry & Tech ({newsCounts.tech || 0})</option>
                      </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary ml-1 flex items-center gap-2"><LinkIcon size={12} /> News URL</label>
                      <input 
                        type="url" required value={newsUrl} onChange={(e) => setNewsUrl(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-black transition-all font-medium text-text-primary"
                        placeholder="https://..."
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary ml-1">News Source</label>
                      <input 
                        type="text" required value={newsSource} onChange={(e) => setNewsSource(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-black transition-all font-medium text-text-primary"
                        placeholder="Financial Times / Mint..."
                      />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary ml-1">Analytical Summary</label>
                    <textarea 
                      required value={newsSummary} onChange={(e) => setNewsSummary(e.target.value)} rows={4}
                      className="w-full bg-surface border border-border rounded-xl p-4 outline-none focus:ring-2 focus:ring-black transition-all font-medium resize-none text-text-primary"
                      placeholder="Brief summary for subscribers..."
                    />
                </div>

                <button 
                  disabled={submitting}
                  className="btn-minimal-primary w-full py-5 text-lg"
                >
                  {submitting ? 'Adding...' : 'Add News Item'}
                </button>
              </form>

              <div className="bg-surface p-10 rounded-xl border border-border">
                <h2 className="text-xl font-serif font-bold text-text-primary mb-8">Recently Added ({newsCategory})</h2>
                <div className="space-y-4">
                  {recentNews.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg group bg-bg-page hover:border-text-primary transition-all">
                      <div>
                        <p className="font-bold text-sm text-text-primary">{item.title}</p>
                        <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{item.source}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteNews(item.id)}
                        className="flex items-center gap-1.5 text-red-500 hover:text-red-700 transition-colors bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest border border-red-100 dark:border-red-500/20"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  ))}
                  {recentNews.length === 0 && <p className="text-text-secondary italic font-serif py-4">No news items in this category.</p>}
                </div>
              </div>
            </div>
          ) : activeTab === 'users' ? (
            <div className="space-y-8">
              <div className="bg-surface p-10 rounded-xl border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                   <h2 className="text-xl font-serif font-bold text-text-primary">
                      Community Management
                   </h2>
                   <div className="relative w-full md:w-64">
                      <SearchIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input 
                        type="text" 
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-bg-page border border-border rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-accent transition-all"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map((u) => (
                    <div key={u.uid} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-bg-page border border-border rounded-2xl gap-6 hover:border-accent/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                           {u.photoURL ? (
                             <img src={u.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-surface" referrerPolicy="no-referrer" />
                           ) : (
                             <div className="w-12 h-12 rounded-full bg-accent text-bg-page flex items-center justify-center font-bold text-lg">
                                {u.displayName.charAt(0)}
                             </div>
                           )}
                           <div className={cn(
                             "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-bg-page",
                             u.isBlocked ? "bg-red-500" : "bg-green-500"
                           )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <p className="font-bold text-text-primary">{u.displayName}</p>
                             {u.role === 'admin' && (
                               <span className="bg-accent/10 text-accent text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
                                  <Shield size={10} /> Admin
                               </span>
                             )}
                          </div>
                          <p className="text-xs text-text-secondary flex items-center gap-1 mt-1 opacity-70">
                             <MailIcon size={10} /> {u.email}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                             <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1 opacity-50">
                                <Clock size={10} /> Joined {new Date(u.createdAt).toLocaleDateString()}
                             </p>
                             {u.lastLogin && (
                               <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1 opacity-50">
                                  Last Session {new Date(u.lastLogin).toLocaleDateString()}
                               </p>
                             )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-border">
                        <button 
                          onClick={() => handleToggleRole(u)}
                          className="flex-1 md:flex-none btn-minimal px-4 py-2 text-[10px] flex items-center justify-center gap-2"
                        >
                          {u.role === 'admin' ? <ShieldAlert size={14} /> : <Shield size={14} />}
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button 
                          onClick={() => handleToggleBlock(u)}
                          className={cn(
                            "flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                            u.isBlocked 
                              ? "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 dark:bg-green-500/10 dark:border-green-500/20"
                              : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20"
                          )}
                        >
                          <LogOut size={14} />
                          {u.isBlocked ? 'Unblock User' : 'Block User'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-bg-page">
                       <Users size={48} className="mx-auto text-text-secondary opacity-20 mb-4" />
                       <p className="text-text-secondary font-serif">No users found matching "{userSearch}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface p-10 rounded-xl border border-border">
               <h2 className="text-xl font-serif font-bold text-text-primary mb-8">Detailed Analytics</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  <div className="p-8 rounded-2xl bg-surface border border-border">
                     <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-2">Retention Rate</p>
                     <p className="text-4xl font-bold text-text-primary">94%</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-surface border border-border">
                     <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-2">Total Views</p>
                     <p className="text-4xl font-bold text-text-primary">{stats.totalViews}</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-surface border border-border">
                     <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-2">Average Satisfaction</p>
                     <p className="text-4xl font-bold text-text-primary">{stats.avgRating.toFixed(1)}/5</p>
                  </div>
               </div>
               
               <h3 className="text-lg font-bold mb-6 text-text-primary">Post Performance</h3>
               <div className="space-y-4">
                  {blogs.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-border">
                       <div>
                          <p className="font-bold text-sm text-text-primary">{b.title}</p>
                          <p className="text-[10px] text-text-secondary font-bold uppercase mt-1 tracking-widest">
                            {b.viewsCount} Views &bull; {b.likesCount} Likes &bull; {b.ratingAverage?.toFixed(1)} Rating
                          </p>
                       </div>
                       <div className="flex items-center gap-3">
                          <LinkIcon size={14} className="text-text-secondary" />
                          <button onClick={() => handleDeleteBlog(b.id)} className="text-red-500 hover:text-red-700 p-2">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
           <button 
             onClick={() => {
                setActiveTab('analytics');
             }}
             className="w-full text-left bg-accent text-bg-page rounded-xl p-6 md:p-10 shadow-lg group hover:scale-[1.01] transition-all cursor-pointer border border-accent/20"
           >
              <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-2 text-bg-page/70 group-hover:text-bg-page">
                 <LayoutGrid size={13} /> Overview (Click for Full Report)
              </h3>
              <div className="space-y-6 md:space-y-8 font-serif">
                 <div className="flex justify-between items-end border-b border-bg-page/10 pb-4">
                    <span className="text-bg-page/60 text-[10px] font-bold uppercase tracking-widest">Reader Count (Total Views)</span>
                    <span className="text-2xl md:text-3xl font-bold">{stats.totalViews}</span>
                 </div>
                 
                 {/* News Category Breakdown */}
                 <div className="pt-2">
                    <p className="text-bg-page/60 text-[9px] font-bold uppercase tracking-widest mb-4">News Breakdown</p>
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                       <div className="bg-bg-page/10 rounded-lg p-3 border border-bg-page/5">
                          <p className="text-[9px] uppercase tracking-tighter opacity-50">Finance</p>
                          <p className="text-lg font-bold">{newsCounts.finance || 0}</p>
                       </div>
                       <div className="bg-bg-page/10 rounded-lg p-3 border border-bg-page/5">
                          <p className="text-[9px] uppercase tracking-tighter opacity-50">Politics</p>
                          <p className="text-lg font-bold">{newsCounts.politics || 0}</p>
                       </div>
                       <div className="bg-bg-page/10 rounded-lg p-3 border border-bg-page/5">
                          <p className="text-[9px] uppercase tracking-tighter opacity-50">Geo</p>
                          <p className="text-lg font-bold">{newsCounts.geopolitics || 0}</p>
                       </div>
                       <div className="bg-bg-page/10 rounded-lg p-3 border border-bg-page/5">
                          <p className="text-[9px] uppercase tracking-tighter opacity-50">Tech</p>
                          <p className="text-lg font-bold">{newsCounts.tech || 0}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-between items-end border-b border-bg-page/10 pb-4 pt-4">
                    <span className="text-bg-page/60 text-[10px] font-bold uppercase tracking-widest">Opinions</span>
                    <span className="text-2xl md:text-3xl font-bold">{blogs.length}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-bg-page/10 pb-4">
                    <span className="text-bg-page/60 text-[10px] font-bold uppercase tracking-widest">Score</span>
                    <span className="text-2xl md:text-3xl font-bold">{stats.avgRating.toFixed(1)}/5</span>
                 </div>
              </div>
           </button>

           <div className="bg-surface rounded-xl p-10 border border-border">
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-text-secondary">
                 <FileText size={13} /> Past Uploads
              </h3>
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {blogs.map((b, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                          <Plus size={14} />
                       </div>
                       <div className="overflow-hidden border-b border-border/50 pb-4 w-full">
                          <div className="flex justify-between items-start gap-3">
                             <p 
                               onClick={() => { window.location.href = `/blog/${b.slug}`; }}
                               className="text-[12px] font-bold text-text-primary truncate hover:text-accent cursor-pointer transition-colors"
                             >
                               {b.title}
                             </p>
                              <button
                                onClick={() => handleDeleteBlog(b.id)}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-lg text-[9px] uppercase font-bold tracking-widest border border-red-100 dark:border-red-500/20 flex-shrink-0"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                          </div>
                          <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest mt-1">
                            Published: {b.date}
                          </p>
                       </div>
                    </div>
                 ))}
                 {blogs.length === 0 && <p className="text-xs text-text-secondary italic font-serif">Waiting for your first opinion...</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
