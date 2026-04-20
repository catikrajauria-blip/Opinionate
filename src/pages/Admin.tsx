import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { blogService } from '../lib/blogService';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  Plus, LayoutGrid, FileText, Settings, LogOut, Send, 
  Image as ImageIcon, Link as LinkIcon, CheckCircle2, 
  Zap, Trash2, PieChart, Users, Shield, ShieldAlert,
  Search as SearchIcon, Mail as MailIcon, Clock,
  MessageSquare, Star, Copy, ExternalLink, User
} from 'lucide-react';
import { generateSlug, cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';

export default function Admin() {
  const { user, profile, isAdmin: isGlobalAdmin, loading: authLoading } = useAuth();
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'news' | 'users' | 'analytics' | 'community'>('posts');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [allSubscribers, setAllSubscribers] = useState<any[]>([]);
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
  const [selectedBlogAnalysis, setSelectedBlogAnalysis] = useState<any>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

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
      if (activeTab === 'community') loadCommunityData();
      loadStats();
      loadNewsCounts();
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityData = async () => {
    try {
      const [comments, ratings, subs] = await Promise.all([
        blogService.getGlobalRecentComments(50),
        blogService.getGlobalRatings(50),
        blogService.getAllSubscribers()
      ]);
      setAllComments(comments);
      setAllRatings(ratings);
      setAllSubscribers(subs);
    } catch (err) {
      console.error('Error loading community data:', err);
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

  const handleAnalyzeBlog = async (blogId: string) => {
    setAnalyzingId(blogId);
    try {
      const data = await blogService.getBlogAnalysis(blogId);
      setSelectedBlogAnalysis(data);
    } catch (err) {
      console.error('Error analyzing blog:', err);
    } finally {
      setAnalyzingId(null);
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
              System Users ({allUsers.length})
            </button>
            <button 
              onClick={() => setActiveTab('community')}
              className={cn("text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'community' ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
            >
              Audience ({allSubscribers.length})
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
              <div className="bg-white dark:bg-zinc-900 border border-border overflow-hidden">
                <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-text-primary tracking-tighter">
                         System Registry
                      </h2>
                      <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-1 opacity-50">Authorized Personnel & Members</p>
                    </div>
                    <div className="relative w-full md:w-64">
                       <SearchIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                       <input 
                         type="text" 
                         placeholder="IDENTIFY USER..."
                         value={userSearch}
                         onChange={(e) => setUserSearch(e.target.value)}
                         className="w-full bg-surface border-b border-border py-2 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-text-primary transition-all placeholder:opacity-30"
                       />
                    </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full border-collapse">
                      <thead className="bg-surface text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary border-b border-border">
                         <tr>
                            <th className="px-8 py-4 text-left">Identity</th>
                            <th className="px-8 py-4 text-left">Access Level</th>
                            <th className="px-8 py-4 text-left">Timeline</th>
                            <th className="px-8 py-4 text-right">Directives</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredUsers.map((u) => (
                          <tr key={u.uid} className="hover:bg-accent/5 transition-colors group">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="relative flex-shrink-0">
                                      {u.photoURL ? (
                                        <img src={u.photoURL} alt="" className="w-10 h-10 border border-border grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="w-10 h-10 bg-accent text-bg-page flex items-center justify-center font-bold text-sm">
                                           {u.displayName.charAt(0)}
                                        </div>
                                      )}
                                      <div className={cn(
                                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border border-white dark:border-black",
                                        u.isBlocked ? "bg-red-500" : "bg-green-500"
                                      )} title={u.isBlocked ? "Status: Revoked" : "Status: Active"} />
                                   </div>
                                   <div>
                                      <p className="font-bold text-xs text-text-primary uppercase tracking-tight">{u.displayName}</p>
                                      <p className="text-[10px] text-text-secondary font-mono lowercase mt-0.5">{u.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className={cn(
                                  "text-[9px] font-bold px-2 py-1 uppercase tracking-tighter border",
                                  u.role === 'admin' ? "border-accent text-accent" : "border-border text-text-secondary"
                                )}>
                                   {u.role}
                                </span>
                             </td>
                             <td className="px-8 py-6">
                                <div className="space-y-1">
                                   <p className="text-[9px] font-mono text-text-secondary flex items-center gap-2">
                                      <span className="opacity-40 uppercase">Reg:</span> {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                   </p>
                                   <p className="text-[9px] font-mono text-text-secondary flex items-center gap-2">
                                      <span className="opacity-40 uppercase">Act:</span> {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Active Session'}
                                   </p>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button 
                                     onClick={() => handleToggleBlock(u)}
                                     title={u.isBlocked ? "Restore Access" : "Revoke Access"}
                                     className={cn(
                                       "p-2 border transition-all",
                                       u.isBlocked ? "border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white" : "border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                                     )}
                                   >
                                      {u.isBlocked ? <Shield size={14} /> : <ShieldAlert size={14} />}
                                   </button>
                                </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   {filteredUsers.length === 0 && (
                      <div className="py-20 text-center border-t border-border bg-bg-page">
                         <Users size={48} className="mx-auto text-text-secondary opacity-20 mb-4" />
                         <p className="text-text-secondary font-serif">No users identified matching "{userSearch}"</p>
                      </div>
                   )}
                </div>
              </div>
            </div>
          ) : activeTab === 'community' ? (
            <div className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-zinc-900 border border-border p-8">
                     <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-3">
                        <MessageSquare size={20} className="text-accent" />
                        Global Dialogue
                     </h2>
                     <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {allComments.map((comment: any) => (
                           <div key={comment.id} className="border-b border-border pb-6 last:border-0 last:pb-0 group">
                              <div className="flex items-center justify-between mb-3">
                                 <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-surface border border-border flex items-center justify-center text-[10px] font-bold">
                                       {comment.name?.charAt(0)}
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-tight">{comment.name}</span>
                                 </div>
                                 <span className="text-[9px] font-mono text-text-secondary opacity-40">
                                    {comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                 </span>
                              </div>
                              <p className="text-xs text-text-secondary font-serif leading-relaxed line-clamp-2 mb-3 grayscale group-hover:grayscale-0 transition-all">
                                 "{comment.content}"
                              </p>
                              <div className="flex items-center gap-2">
                                <LinkIcon 
                                  size={10} 
                                  className="text-text-secondary opacity-20 hover:opacity-100 cursor-pointer" 
                                  onClick={() => window.open(`/blog/${comment.blogSlug}`, '_blank')}
                                />
                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-30 italic">{comment.blogTitle}</span>
                              </div>
                           </div>
                        ))}
                        {allComments.length === 0 && <p className="text-xs text-text-secondary italic">No recent dialogue identified.</p>}
                     </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-border p-8">
                     <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-3">
                        <Star size={20} className="text-yellow-500" />
                        Consensus Ledger
                     </h2>
                     <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {allRatings.map((rating: any) => (
                           <div key={rating.id} className="flex items-center justify-between p-3 bg-surface border border-border">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-xs font-bold font-mono bg-white">
                                    {rating.score}
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-bold uppercase tracking-tight">{rating.user?.displayName || 'Anonymous Guest'}</p>
                                    <p className="text-[9px] text-text-secondary font-serif italic max-w-[120px] truncate">{rating.blogTitle}</p>
                                 </div>
                              </div>
                              <span className="text-[9px] font-mono text-text-secondary opacity-40">
                                 {rating.createdAt ? new Date(rating.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                              </span>
                           </div>
                        ))}
                        {allRatings.length === 0 && <p className="text-xs text-text-secondary italic">No consensus data available.</p>}
                     </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-zinc-900 border border-border p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
                     <div>
                        <h2 className="text-xl font-serif font-bold flex items-center gap-3">
                           <MailIcon size={20} className="text-accent" />
                           Intellectual Audience
                        </h2>
                        <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mt-1 opacity-50">Active Newsletter Subscribers</p>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => {
                             const emails = allSubscribers.map(s => s.email || s.id).join(', ');
                             navigator.clipboard.writeText(emails);
                             alert("Subscriber index copied to clipboard.");
                          }}
                          className="btn-minimal px-4 py-2 text-[10px] gap-2 flex items-center"
                        >
                           <Copy size={12} /> Index Emails
                        </button>
                        <button 
                          onClick={() => window.open('/newsletter', '_blank')}
                          className="bg-accent text-bg-page px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-90 transition-all border border-accent"
                        >
                           <ExternalLink size={12} /> Distribution Page
                        </button>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                     {allSubscribers.map((sub: any) => (
                        <div key={sub.id} className="p-4 border border-border bg-surface group hover:border-accent transition-all">
                           <p className="text-xs font-bold text-text-primary truncate">{sub.email || sub.id}</p>
                           <p className="text-[9px] text-text-secondary font-mono mt-1 opacity-50 uppercase">
                              {sub.status || 'Active'} &bull; {sub.subscribedAt ? new Date(sub.subscribedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                           </p>
                        </div>
                     ))}
                     {allSubscribers.length === 0 && <p className="text-xs text-text-secondary italic col-span-full text-center py-10 opacity-30">No subscribers in the index.</p>}
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-border p-10">
               <div className="mb-12 border-b border-border pb-8">
                  <h2 className="text-3xl font-serif font-bold text-text-primary tracking-tighter">Strategic Intelligence</h2>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-[0.2em] mt-2 opacity-40">Operational Performance Metrics</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-border">
                  <div className="p-10 border-b md:border-b-0 md:border-r border-border hover:bg-surface transition-all">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-4 opacity-50">Impact Index</p>
                     <p className="text-5xl font-bold text-text-primary tracking-tighter">94<span className="text-xl text-accent font-sans">%</span></p>
                     <p className="text-[9px] font-bold uppercase text-text-secondary mt-2">Retention Metric</p>
                  </div>
                  <div className="p-10 border-b lg:border-b-0 lg:border-r border-border hover:bg-surface transition-all">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-4 opacity-50">Total Outreach</p>
                     <p className="text-5xl font-bold text-text-primary tracking-tighter">{stats.totalViews}</p>
                     <p className="text-[9px] font-bold uppercase text-text-secondary mt-2">Verified Views</p>
                  </div>
                  <div className="p-10 hover:bg-surface transition-all">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-4 opacity-50">Consensus Grade</p>
                     <p className="text-5xl font-bold text-text-primary tracking-tighter">{stats.avgRating.toFixed(1)}<span className="text-xl text-yellow-500 font-sans">/5</span></p>
                     <p className="text-[9px] font-bold uppercase text-text-secondary mt-2">Average Satisfaction</p>
                  </div>
               </div>
               
               <h3 className="text-xl font-serif font-bold mt-16 mb-8 text-text-primary">Engagement Per Entry</h3>
               <div className="divide-y divide-border border border-border">
                  {blogs.map(b => (
                    <div key={b.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 hover:bg-surface transition-all group">
                       <div className="max-w-md">
                          <p className="font-bold text-sm text-text-primary uppercase tracking-tight group-hover:text-accent transition-colors">{b.title}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <p className="text-[10px] text-text-secondary font-mono font-bold flex items-center gap-1.5 border border-border px-2 py-1">
                              {b.viewsCount} <span className="opacity-40 uppercase font-sans">Reads</span>
                            </p>
                            <p className="text-[10px] text-text-secondary font-mono font-bold flex items-center gap-1.5 border border-border px-2 py-1">
                              {b.likesCount || 0} <span className="opacity-40 uppercase font-sans text-red-500">Likes</span>
                            </p>
                            <p className="text-[10px] text-text-secondary font-mono font-bold flex items-center gap-1.5 border border-border px-2 py-1">
                              {b.ratingAverage?.toFixed(1)} <span className="opacity-40 uppercase font-sans text-yellow-600">Grade</span>
                            </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-1 mt-6 md:mt-0">
                          <button 
                            disabled={analyzingId === b.id}
                            onClick={() => handleAnalyzeBlog(b.id)}
                            title="Perform Deep Analysis"
                            className="p-3 border border-border hover:border-text-primary hover:bg-bg-page transition-all text-text-secondary"
                          >
                             {analyzingId === b.id ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : <PieChart size={16} />}
                          </button>
                          <button 
                            onClick={() => window.open(`/blog/${b.slug}`, '_blank')}
                            title="Review Entry"
                            className="p-3 border border-border hover:border-text-primary hover:bg-bg-page transition-all text-text-secondary"
                          >
                             <ExternalLink size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBlog(b.id)} 
                            title="Archive Entry"
                            className="p-3 border border-border hover:border-red-500 hover:bg-red-50 transition-all text-red-500"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>

               <AnimatePresence>
                 {selectedBlogAnalysis && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="mt-12 p-8 bg-bg-page border border-accent/20 rounded-3xl relative overflow-hidden"
                   >
                      <button 
                        onClick={() => setSelectedBlogAnalysis(null)}
                        className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
                      >
                        <LogOut size={20} className="rotate-180" />
                      </button>

                      <div className="flex items-center gap-4 mb-8">
                         <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                            <PieChart size={24} />
                         </div>
                         <div>
                            <h3 className="text-xl font-bold">Deep Performance Analysis</h3>
                            <p className="text-xs text-text-secondary">Comprehensive feedback and engagement metrics</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-600 flex items-center gap-2">
                               <CheckCircle2 size={14} /> High Recognition ({selectedBlogAnalysis.highRatings.length})
                            </h4>
                            <div className="space-y-3">
                               {selectedBlogAnalysis.highRatings.map((r: any, idx: number) => (
                                 <div key={idx} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-xs font-bold font-mono">
                                       {r.score}
                                    </div>
                                    <div>
                                       <p className="text-xs font-bold text-text-primary">{r.user?.displayName || 'Anonymous Guest'}</p>
                                       <p className="text-[9px] text-text-secondary font-mono">{r.userId.slice(0, 8)}...</p>
                                    </div>
                                 </div>
                               ))}
                               {selectedBlogAnalysis.highRatings.length === 0 && <p className="text-xs text-text-secondary italic">No high ratings yet.</p>}
                            </div>
                         </div>

                         <div className="space-y-6">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                               <ShieldAlert size={14} /> Critical Feedback ({selectedBlogAnalysis.lowRatings.length})
                            </h4>
                            <div className="space-y-3">
                               {selectedBlogAnalysis.lowRatings.map((r: any, idx: number) => (
                                 <div key={idx} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold font-mono">
                                       {r.score}
                                    </div>
                                    <div>
                                       <p className="text-xs font-bold text-text-primary">{r.user?.displayName || 'Anonymous Guest'}</p>
                                       <p className="text-[9px] text-text-secondary font-mono">{r.userId.slice(0, 8)}...</p>
                                    </div>
                                 </div>
                               ))}
                               {selectedBlogAnalysis.lowRatings.length === 0 && <p className="text-xs text-text-secondary italic">No low ratings yet.</p>}
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
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
