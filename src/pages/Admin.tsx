import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { blogService } from '../lib/blogService';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  Plus, LayoutGrid, FileText, Settings, LogOut, Send, 
  Image as ImageIcon, Link as LinkIcon, CheckCircle2, 
  Zap, Trash2, PieChart, Users, Shield, ShieldAlert,
  Search as SearchIcon, Mail as MailIcon, Clock, X,
  MessageSquare, Star, Copy, ExternalLink, User, Eye, Download
} from 'lucide-react';
import { generateSlug, cn, formatDate } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';

import { statsService } from '../lib/statsService';
import { MousePointer2 } from 'lucide-react';

export default function Admin() {
  const { user, profile, isAdmin: isGlobalAdmin, loading: authLoading } = useAuth();
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'news' | 'users' | 'analytics' | 'community'>('posts');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [allSubscribers, setAllSubscribers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [stats, setStats] = useState<any>({
    totalBlogs: 0,
    totalSubscribers: 0,
    totalViews: 0,
    totalLikes: 0,
    avgRating: 0,
    totalSwipes: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // Run stats and counts on every reload as they are lightweight/global
      const coreTasks = [
        loadStats(),
        loadNewsCounts()
      ];

      // Run tab-specific data loading
      if (activeTab === 'posts' || activeTab === 'analytics') coreTasks.push(loadBlogs());
      if (activeTab === 'news') coreTasks.push(loadRecentNews());
      if (activeTab === 'users') coreTasks.push(loadAllUsers());
      if (activeTab === 'community') coreTasks.push(loadCommunityData());

      await Promise.all(coreTasks);
    } catch (err) {
      console.error('Error in loadData:', err);
    } finally {
      // Ensure a minimum loading time for smooth transition and data arrival
      setTimeout(() => setLoading(false), 300);
    }
  };

  const loadCommunityData = async () => {
    try {
      const [comments, ratings, subs, messages] = await Promise.all([
        blogService.getGlobalRecentComments(50),
        blogService.getGlobalRatings(50),
        blogService.getSubscribers(),
        blogService.getMessages(50)
      ]);
      setAllComments(comments);
      setAllRatings(ratings);
      setAllSubscribers(subs);
      setAllMessages(messages);
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
      const [s, sysStats] = await Promise.all([
        blogService.getAdminStats(),
        statsService.getSystemStats()
      ]);
      setStats({
        ...s,
        totalBlogs: s.totalBlogs || 0,
        totalSubscribers: s.totalSubscribers || 0,
        totalViews: s.totalViews || 0,
        totalLikes: s.totalLikes || 0,
        avgRating: s.avgRating || 0,
        totalSwipes: sysStats.swipesCount || 0
      });
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
    if (analyzingId) return;
    setAnalyzingId(blogId);
    setSelectedBlogAnalysis(null);
    try {
      const data = await blogService.getBlogAnalysis(blogId);
      setSelectedBlogAnalysis(data);
      // Wait for animation frame to ensure state is set before scrolling
      setTimeout(() => {
        const target = document.getElementById('analysis-viewport');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Error analyzing blog:', err);
      alert('Analysis encountered a retrieval error. Please retry.');
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
      loadCommunityData();
      loadStats(); // Update reader count in overview
    } catch (err: any) {
      console.error('Error deleting sub:', err);
      alert(`Failed to delete subscriber: ${err.message || 'Permission denied'}`);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await blogService.deleteMessage(id);
      loadCommunityData();
    } catch (err: any) {
      console.error('Error deleting message:', err);
      alert(`Failed to delete message: ${err.message || 'Permission denied'}`);
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
        <div className="bg-bg-page p-10 border-4 border-red-500 shadow-[10px_10px_0px_0px_rgba(239,68,68,0.2)]">
           <div className="w-20 h-20 bg-red-500 text-bg-page flex items-center justify-center mx-auto mb-8">
              <ShieldAlert size={48} />
           </div>
           <h2 className="text-4xl font-display font-black text-red-500 mb-4 uppercase tracking-tighter">ACCESS_DENIED</h2>
           <p className="text-red-700 dark:text-red-300 mb-10 font-display font-medium uppercase tracking-tight leading-tight">This area is reserved for the blog owner. Your account ({user.email}) does not have admin privileges.</p>
           <button 
             onClick={() => signOut(auth)}
             className="w-full px-8 py-5 bg-red-500 text-white font-mono font-bold uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-95"
           >
             TERMINATE_SESSION
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 text-text-primary">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-16 border-b border-border pb-12">
        <div className="flex flex-col md:flex-row md:items-center gap-8 w-full xl:w-auto">
          <div className="flex items-center gap-4">
            <Shield className="text-accent" size={32} />
            <div>
              <h1 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">Command_Central</h1>
              <p className="text-text-secondary flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest mt-1">
                ACCESS_LOG: <span className="text-text-primary">{user.email}</span>
              </p>
            </div>
          </div>
          
          <nav className="flex flex-wrap gap-x-1 gap-y-1 md:border-l border-border md:pl-8">
            {[
              { id: 'posts', label: 'ANALYTICS_INPUT', icon: FileText },
              { id: 'news', label: 'CURATED_FEED', icon: Zap },
              { id: 'users', label: 'SYSTEM_REGISTRY', icon: Users },
              { id: 'community', label: 'AUDIENCE_DATA', icon: MessageSquare },
              { id: 'analytics', label: 'CORE_METRICS', icon: PieChart }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-2",
                  activeTab === tab.id 
                    ? "text-accent bg-accent/5 border border-accent/20" 
                    : "text-text-secondary hover:text-text-primary border border-transparent hover:border-border"
                )}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="btn-minimal px-6 py-3 font-mono text-[10px] gap-3"
        >
          <LogOut size={14} /> TERMINATE_SESSION
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 text-text-primary">
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'posts' ? (
            <form onSubmit={handleCreateBlog} className="bg-bg-page p-10 border border-border space-y-12">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                  <div>
                    <h2 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">
                       Input_New_Entry
                    </h2>
                    <p className="text-[10px] font-mono font-bold text-text-secondary mt-2 tracking-widest opacity-50 uppercase">DATA_INGESTION_MODULE</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      type="button"
                      onClick={generateAIContent}
                      disabled={aiLoading}
                      className="btn-minimal px-6 py-3 font-mono text-[10px] flex items-center gap-3 transition-all active:scale-95"
                    >
                      <Zap size={14} className={cn("text-accent", aiLoading && "animate-pulse")} /> 
                      {aiLoading ? 'SYNTHESIZING_CORE...' : 'AI_GENERATE_ENTRY'}
                    </button>
                    {success && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 font-mono font-bold text-[10px] uppercase tracking-widest px-4 border border-green-500/20 bg-green-500/5">
                          <CheckCircle2 size={14} /> COMMITTED.
                        </motion.div>
                    )}
                  </div>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Entry_Title</label>
                    <input 
                       type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                       className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-lg font-display font-bold uppercase tracking-tight"
                       placeholder="SPECIFY_HEADER..."
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Staged_Date</label>
                    <input 
                       type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                       className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono font-bold text-xs uppercase"
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Operational_Abstract</label>
                 <textarea 
                    required value={summary} onChange={(e) => setSummary(e.target.value)} rows={3}
                    className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-display font-medium text-base resize-none uppercase tracking-tight leading-tight"
                    placeholder="PROVIDE_BRIEF_OVERVIEW..."
                 />
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Core_Intelligence_Data</label>
                    <span className="text-[9px] font-mono text-accent font-bold uppercase tracking-widest">Mark_Syntax_Active</span>
                 </div>
                 <textarea 
                    required value={content} onChange={(e) => setContent(e.target.value)} rows={12}
                    className="w-full bg-surface border border-border p-6 outline-none focus:border-accent font-mono text-xs leading-relaxed resize-none"
                    placeholder="DEPLOY_FULL_ANALYSIS_CONTENT..."
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-8 border-b border-border">
                 <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Source_Author</label>
                    <input 
                       type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}
                       className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-display font-bold text-sm uppercase"
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Visual_Asset_Uri</label>
                    <input 
                       type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                       className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono text-xs"
                       placeholder="https://assets.source.com/img.webp"
                    />
                 </div>
              </div>

              <button 
                 disabled={submitting}
                 className="btn-minimal-primary w-full py-6 text-xl font-display font-black uppercase tracking-tighter"
               >
                 {submitting ? 'COMMITTING_TRANSACTION...' : 'DEPLOY_ENTRY_TO_CORE'}
               </button>
            </form>
          ) : activeTab === 'news' ? (
            <div className="space-y-12">
              <form onSubmit={handleCreateNews} className="bg-bg-page p-10 border border-border space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                  <div>
                    <h2 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">
                       Inject_Curated_Intel
                    </h2>
                    <p className="text-[10px] font-mono font-bold text-text-secondary mt-2 tracking-widest opacity-50 uppercase">EXTERNAL_FEED_MODULE</p>
                  </div>
                  {success && activeTab === 'news' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 font-mono font-bold text-[10px] uppercase tracking-widest px-4 border border-green-500/20 bg-green-500/5 py-2">
                        <CheckCircle2 size={14} /> ITEM_STAGED.
                      </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Intel_Headline</label>
                      <input 
                        type="text" required value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)}
                        className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-lg font-display font-bold uppercase tracking-tight"
                        placeholder="SPECIFY_NEWS_HEADER..."
                      />
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Classification</label>
                      <select 
                        value={newsCategory} onChange={(e) => setNewsCategory(e.target.value)}
                        className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono font-bold text-xs uppercase"
                      >
                        <option value="finance">SEC_FINANCE & MARKETS ({newsCounts.finance || 0})</option>
                        <option value="politics">SEC_INDIAN_POLITICS ({newsCounts.politics || 0})</option>
                        <option value="geopolitics">SEC_GEOPOLITICS ({newsCounts.geopolitics || 0})</option>
                        <option value="tech">SEC_INDUSTRY & TECH ({newsCounts.tech || 0})</option>
                      </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50 flex items-center gap-2">Source_URI</label>
                      <input 
                        type="url" required value={newsUrl} onChange={(e) => setNewsUrl(e.target.value)}
                        className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono text-xs"
                        placeholder="HTTPS://INTEL_SOURCE.COM/FEED"
                      />
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Intelligence_Origin</label>
                      <input 
                        type="text" required value={newsSource} onChange={(e) => setNewsSource(e.target.value)}
                        className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-display font-bold text-sm uppercase"
                        placeholder="REUTERS / FT / MINT..."
                      />
                  </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Analytical_Summary</label>
                    <textarea 
                      required value={newsSummary} onChange={(e) => setNewsSummary(e.target.value)} rows={4}
                      className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-display font-medium text-base resize-none uppercase tracking-tight leading-tight"
                      placeholder="PROVIDE_BRIEF_ANALYSIS_FOR_SUBSCRIBERS..."
                    />
                </div>

                <button 
                  disabled={submitting}
                  className="btn-minimal-primary w-full py-6 text-xl font-display font-black uppercase tracking-tighter"
                >
                  {submitting ? 'STAGING_DATA...' : 'COMMIT_NEWS_TO_FEED'}
                </button>
              </form>

              <div className="bg-bg-page border border-border p-10">
                <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
                  <h2 className="text-2xl font-display font-black tracking-tighter uppercase">Active_Intel_Stream_({newsCategory})</h2>
                  <span className="text-[10px] font-mono font-bold text-text-secondary opacity-50 uppercase tracking-widest">LIVE_STATUS_ACTIVE</span>
                </div>
                <div className="space-y-4">
                  {recentNews.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-6 border border-border group bg-surface hover:border-accent transition-all">
                      <div>
                        <p className="font-display font-bold text-base text-text-primary uppercase tracking-tight">{item.title}</p>
                        <p className="text-[10px] text-text-secondary uppercase font-mono font-bold tracking-widest mt-1 opacity-60">ORIGIN: {item.source}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteNews(item.id)}
                        className="flex items-center gap-3 text-red-500 hover:bg-red-500 hover:text-white transition-all px-4 py-2 border border-red-500/20 text-[10px] uppercase font-mono font-bold tracking-widest"
                      >
                        <Trash2 size={14} />
                        <span>PURGE</span>
                      </button>
                    </div>
                  ))}
                  {recentNews.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest py-8 opacity-40">No news streams identified in this vector.</p>}
                </div>
              </div>
            </div>
          ) : activeTab === 'users' ? (
            <div className="space-y-8">
              <div className="bg-bg-page border border-border overflow-hidden">
                <div className="p-10 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">
                         System_Registry
                      </h2>
                      <p className="text-[10px] text-text-secondary uppercase font-mono font-bold tracking-widest mt-2 opacity-50">AUTHORIZED_PERSONNEL & GUEST_LOG</p>
                    </div>
                    <div className="relative w-full md:w-80">
                       <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                       <input 
                         type="text" 
                         placeholder="SCAN_IDENTITIES..."
                         value={userSearch}
                         onChange={(e) => setUserSearch(e.target.value)}
                         className="w-full bg-surface border border-border p-4 pl-12 text-[11px] font-mono font-bold uppercase tracking-widest outline-none focus:border-accent transition-all placeholder:opacity-30"
                       />
                    </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full border-collapse">
                      <thead className="bg-surface text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary border-b border-border">
                         <tr>
                            <th className="px-10 py-5 text-left">Entity_Identity</th>
                            <th className="px-10 py-5 text-left">Auth_Level</th>
                            <th className="px-10 py-5 text-left">Temporal_Logs</th>
                            <th className="px-10 py-5 text-right">Directives</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredUsers.map((u) => (
                          <tr key={u.uid} className="hover:bg-accent/5 transition-colors group">
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-5">
                                   <div className="relative flex-shrink-0">
                                      {u.photoURL ? (
                                        <img src={u.photoURL} alt="" className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all border border-border" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="w-12 h-12 bg-surface text-text-primary border border-border flex items-center justify-center font-display font-black text-lg">
                                           {u.displayName.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className={cn(
                                        "absolute -bottom-1 -right-1 w-3 h-3 border-2 border-bg-page",
                                        u.isBlocked ? "bg-red-500" : "bg-green-500"
                                      )} />
                                   </div>
                                   <div>
                                      <p className="font-display font-bold text-base text-text-primary uppercase tracking-tight">{u.displayName}</p>
                                      <p className="text-[10px] text-text-secondary font-mono lowercase mt-1 opacity-60">{u.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <span className={cn(
                                  "text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-widest border",
                                  u.role === 'admin' ? "border-accent text-accent bg-accent/5" : "border-border text-text-secondary"
                                )}>
                                   {u.role}_SEC
                                </span>
                             </td>
                             <td className="px-10 py-8">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-mono text-text-secondary flex items-center gap-2">
                                      <span className="opacity-30 uppercase tracking-tighter">REG:</span> <span className="text-text-primary">{formatDate(u.createdAt)}</span>
                                   </p>
                                   <p className="text-[10px] font-mono text-text-secondary flex items-center gap-2">
                                      <span className="opacity-30 uppercase tracking-tighter">ACT:</span> <span className="text-text-primary">{formatDate(u.lastLogin)}</span>
                                   </p>
                                </div>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <div className="flex items-center justify-end gap-3">
                                   <button 
                                     onClick={() => handleToggleBlock(u)}
                                     title={u.isBlocked ? "RESTORE_ACCESS" : "REVOKE_ACCESS"}
                                     className={cn(
                                       "p-3 border transition-all",
                                       u.isBlocked ? "border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white" : "border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                                     )}
                                   >
                                      {u.isBlocked ? <Shield size={16} /> : <ShieldAlert size={16} />}
                                   </button>
                                </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   {filteredUsers.length === 0 && (
                      <div className="py-32 text-center border-t border-border bg-bg-page">
                         <Users size={64} className="mx-auto text-text-secondary opacity-10 mb-6" />
                         <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.3em]">No identities matched search parameter: "{userSearch}"</p>
                      </div>
                   )}
                </div>
              </div>
            </div>
          ) : activeTab === 'community' ? (
            <div className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-bg-page border border-border p-10">
                     <h2 className="text-2xl font-display font-black mb-10 flex items-center gap-4 text-text-primary uppercase tracking-tighter">
                        <MessageSquare size={24} className="text-accent" />
                        GLOBAL_DIALOGUE
                     </h2>
                     <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        {allComments.map((comment: any) => (
                           <div key={comment.id} className="border-b border-border pb-8 last:border-0 last:pb-0 group">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-surface border border-border flex items-center justify-center text-[10px] font-mono font-bold text-accent">
                                       {comment.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-text-primary">{comment.name}</span>
                                 </div>
                                 <span className="text-[9px] font-mono text-text-secondary opacity-30 uppercase">
                                    {formatDate(comment.createdAt)}
                                 </span>
                              </div>
                              <p className="text-sm text-text-secondary font-display font-medium leading-tight uppercase tracking-tight mb-4 group-hover:text-text-primary transition-all opacity-70 group-hover:opacity-100">
                                 "{comment.content}"
                              </p>
                              <div className="flex items-center gap-3">
                                <LinkIcon 
                                  size={12} 
                                  className="text-accent cursor-pointer hover:scale-110 transition-transform" 
                                  onClick={() => window.open(`/blog/${comment.blogSlug}`, '_blank')}
                                />
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest opacity-30">REF: {comment.blogTitle}</span>
                              </div>
                           </div>
                        ))}
                        {allComments.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase opacity-40">No dialogue sequences identified.</p>}
                     </div>
                  </div>

                  <div className="bg-bg-page border border-border p-10">
                     <h2 className="text-2xl font-display font-black mb-10 flex items-center gap-4 text-text-primary uppercase tracking-tighter">
                        <Star size={24} className="text-accent" />
                        CONSENSUS_LEDGER
                     </h2>
                     <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        {allRatings.map((rating: any) => (
                           <div key={rating.id} className="flex items-center justify-between p-5 bg-surface border border-border hover:border-accent transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 border border-border flex items-center justify-center text-xs font-mono font-bold bg-bg-page text-accent">
                                    {rating.score}.0
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-primary">{rating.user?.displayName || 'GUEST_PROFILE'}</p>
                                    <p className="text-[9px] text-text-secondary font-display font-medium uppercase tracking-tighter opacity-50 truncate max-w-[150px]">{rating.blogTitle}</p>
                                 </div>
                              </div>
                              <span className="text-[9px] font-mono text-text-secondary opacity-30">
                                 {formatDate(rating.createdAt)}
                              </span>
                           </div>
                        ))}
                        {allRatings.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase opacity-40">No validation packets identified.</p>}
                     </div>
                  </div>
               </div>

               <div className="bg-bg-page border border-border p-10">
                  <h2 className="text-2xl font-display font-black mb-10 flex items-center gap-4 text-text-primary uppercase tracking-tighter">
                     <MailIcon size={24} className="text-accent" />
                     INCOMING_INTEL_MESSAGES
                  </h2>
                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                     {allMessages.map((msg: any) => (
                        <div key={msg.id} className="p-6 bg-surface border border-border hover:border-accent transition-all group relative">
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <p className="text-[11px] font-mono font-bold text-text-primary uppercase tracking-widest">{msg.name}</p>
                                 <p className="text-[9px] font-mono text-text-secondary lowercase opacity-50">{msg.email}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="text-[9px] font-mono text-text-secondary opacity-30 uppercase">{formatDate(msg.createdAt)}</span>
                                 <button 
                                   onClick={() => handleDeleteMessage(msg.id)}
                                   className="mt-2 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white border border-red-500/20"
                                 >
                                   <Trash2 size={12} />
                                 </button>
                              </div>
                           </div>
                           <div className="bg-bg-page p-4 border-l-2 border-accent">
                              <p className="text-sm font-display text-text-secondary leading-relaxed">
                                 {msg.message}
                               </p>
                           </div>
                        </div>
                     ))}
                     {allMessages.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase opacity-40 text-center py-10">Inbox is currently void of transmissions.</p>}
                  </div>
               </div>

               <div className="bg-bg-page border border-border p-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-8 border-b border-border pb-8">
                     <div>
                        <h2 className="text-3xl font-display font-black flex items-center gap-4 text-text-primary uppercase tracking-tighter">
                           <MailIcon size={28} className="text-accent" />
                           AUDIENCE_INDEX
                        </h2>
                        <p className="text-[10px] text-text-secondary uppercase font-mono font-bold tracking-[0.2em] mt-2 opacity-50">ACTIVE_INTEL_SUBSCRIBERS</p>
                     </div>
                     <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={() => {
                             const emails = allSubscribers.map(s => s.email || s.id).join(', ');
                             navigator.clipboard.writeText(emails);
                             alert("Subscriber index copied to clipboard.");
                          }}
                          className="btn-minimal px-6 py-3 text-[10px] font-mono gap-3 flex items-center"
                        >
                           <Copy size={14} /> EXPORT_LIST
                        </button>
                        <button 
                          onClick={() => window.open('/newsletter', '_blank')}
                          className="bg-accent text-bg-page px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-[0.98] transition-all border border-accent"
                        >
                           <ExternalLink size={14} /> VIEW_GATEWAY
                        </button>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                     {allSubscribers.map((sub: any) => (
                        <div key={sub.id} className="p-6 border border-border bg-surface group hover:border-accent transition-all">
                           <p className="text-[11px] font-mono font-bold text-text-primary border-b border-border pb-2 mb-3 truncate">{sub.email || sub.id}</p>
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-accent uppercase font-bold tracking-widest">ACTIVE</span>
                              <span className="text-[8px] font-mono text-text-secondary opacity-40">{formatDate(sub.subscribedAt)}</span>
                           </div>
                        </div>
                     ))}
                     {allSubscribers.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase opacity-40 col-span-full text-center py-20">No subscriber data found in network registry.</p>}
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-bg-page border border-border p-10">
               <div className="mb-16 border-b border-border pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h2 className="text-4xl font-display font-black text-text-primary tracking-tighter uppercase leading-none">CORE_INTEL_METRICS</h2>
                    <p className="text-[10px] text-text-secondary uppercase font-mono font-bold tracking-[0.3em] mt-3 opacity-40">OPERATIONAL_PERFORMANCE_AUDIT</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest">LIVE_TELEMETRY</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
                  <div className="p-10 border-b lg:border-b-0 lg:border-r border-border hover:bg-surface transition-all group">
                     <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6 group-hover:translate-x-1 transition-transform">PORTAL_ENTRANCES</p>
                     <p className="text-5xl font-display font-black text-text-primary tracking-tighter">{stats.totalSwipes}</p>
                     <p className="text-[9px] font-mono font-bold uppercase text-text-secondary mt-3 opacity-30">TOTAL_SWIPES_COMMITTED</p>
                  </div>
                  <div className="p-10 border-b md:border-b-0 md:border-r border-border hover:bg-surface transition-all group">
                     <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6 group-hover:translate-x-1 transition-transform">ENGAGEMENT_OPS</p>
                     <p className="text-5xl font-display font-black text-text-primary tracking-tighter">{stats.totalViews}</p>
                     <p className="text-[9px] font-mono font-bold uppercase text-text-secondary mt-3 opacity-30">TOTAL_ENTRY_READS</p>
                  </div>
                  <div className="p-10 hover:bg-surface transition-all group">
                     <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6 group-hover:translate-x-1 transition-transform">NETWORK_NODES</p>
                     <p className="text-5xl font-display font-black text-text-primary tracking-tighter">{stats.totalSubscribers}</p>
                     <p className="text-[9px] font-mono font-bold uppercase text-text-secondary mt-3 opacity-30">SUBSCRIBER_INDEX_COUNT</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-x border-b border-border">
                  <div className="p-12 border-b md:border-b-0 md:border-r border-border hover:bg-surface transition-all">
                     <p className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6">CONSENSUS_GRADIENT</p>
                     <div className="flex items-baseline gap-3">
                        <p className="text-7xl font-display font-black text-text-primary tracking-tighter leading-none">{stats.avgRating.toFixed(1)}</p>
                        <span className="text-2xl font-mono text-accent font-bold opacity-40">/5.0</span>
                     </div>
                     <p className="text-[10px] font-mono font-bold uppercase text-text-secondary mt-4 tracking-widest opacity-30">SYSTEM_SATISFACTION_INDEX</p>
                  </div>
                  <div className="p-12 hover:bg-surface transition-all">
                     <p className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6">AUDIENCE_GROWTH</p>
                     <p className="text-7xl font-display font-black text-text-primary tracking-tighter leading-none">{stats.totalSubscribers}</p>
                     <p className="text-[10px] font-mono font-bold uppercase text-text-secondary mt-4 tracking-widest opacity-30">NETWORK_NODES_ACTIVE</p>
                  </div>
               </div>
               
               <h3 id="analysis-viewport" className="text-2xl font-display font-black mt-24 mb-10 text-text-primary uppercase tracking-tighter border-l-4 border-accent pl-6">
                  Performance_Deep_Audit
               </h3>
               <div className="border border-border bg-surface">
                  {blogs.map(b => (
                    <div key={b.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-10 border-b border-border last:border-0 hover:bg-bg-page transition-all group">
                       <div className="max-w-xl">
                          <p className="font-display font-bold text-lg text-text-primary uppercase tracking-tight group-hover:text-accent transition-colors mb-4">{b.title}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="text-[10px] font-mono font-bold text-text-secondary flex items-center gap-2 border border-border px-3 py-1.5 bg-bg-page/50">
                              <Eye size={12} className="text-accent" /> {b.viewsCount || 0} <span className="opacity-30 uppercase font-sans">Reads</span>
                            </div>
                            <div className="text-[10px] font-mono font-bold text-text-secondary flex items-center gap-2 border border-border px-3 py-1.5 bg-bg-page/50">
                              <Star size={12} className="text-red-500" /> {b.likesCount || 0} <span className="opacity-30 uppercase font-sans">Likes</span>
                            </div>
                            <div className="text-[10px] font-mono font-bold text-text-secondary flex items-center gap-2 border border-border px-3 py-1.5 bg-bg-page/50">
                              <Shield size={12} className="text-yellow-600" /> {b.ratingAverage?.toFixed(1) || '0.0'} <span className="opacity-30 uppercase font-sans">Grade</span>
                            </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 mt-10 lg:mt-0 w-full lg:w-auto">
                          <button 
                            disabled={analyzingId === b.id}
                            onClick={() => handleAnalyzeBlog(b.id)}
                            className="flex-1 lg:flex-none p-4 border border-border hover:border-accent hover:text-accent transition-all text-text-secondary flex items-center justify-center gap-2 min-w-[50px]"
                          >
                             {analyzingId === b.id ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : <><PieChart size={18} /><span className="text-[10px] font-mono font-bold uppercase lg:hidden">Analyze</span></>}
                          </button>
                          <button 
                            onClick={() => window.open(`/blog/${b.slug}`, '_blank')}
                            className="flex-1 lg:flex-none p-4 border border-border hover:border-accent hover:text-accent transition-all text-text-secondary flex items-center justify-center gap-2 min-w-[50px]"
                          >
                             <ExternalLink size={18} /><span className="text-[10px] font-mono font-bold uppercase lg:hidden">Review</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteBlog(b.id)} 
                            className="flex-1 lg:flex-none p-4 border border-border hover:border-red-500 hover:text-red-500 transition-all text-red-500 hover:bg-red-500/5 flex items-center justify-center gap-2 min-w-[50px]"
                          >
                             <Trash2 size={18} /><span className="text-[10px] font-mono font-bold uppercase lg:hidden">Purge</span>
                          </button>
                       </div>
                    </div>
                  ))}
               </div>

               <AnimatePresence>
                 {selectedBlogAnalysis && (
                   <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 30 }}
                     className="mt-16 p-12 bg-surface border-2 border-accent/30 relative overflow-hidden"
                   >
                      <button 
                        onClick={() => setSelectedBlogAnalysis(null)}
                        className="absolute top-6 right-6 text-text-secondary hover:text-accent transition-colors z-10"
                      >
                        <X size={32} />
                      </button>

                      <div className="flex items-center gap-6 mb-12 border-b border-border pb-8">
                         <div className="w-16 h-16 bg-accent text-bg-page flex items-center justify-center">
                            <PieChart size={32} />
                         </div>
                         <div>
                            <h3 className="text-3xl font-display font-black text-text-primary uppercase tracking-tighter">DEEP_ENGAGEMENT_AUDIT</h3>
                            <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest mt-1">SENTIMENT_ANALYSIS & VALIDATION_METRICS</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                               <h4 className="text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-3">
                                  <CheckCircle2 size={16} /> HIGH_RECOGNITION
                               </h4>
                               <span className="text-xl font-display font-black text-accent">{selectedBlogAnalysis.highRatings.length}</span>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                               {selectedBlogAnalysis.highRatings.map((r: any, idx: number) => (
                                 <div key={idx} className="flex items-center gap-5 p-5 bg-bg-page border border-border hover:border-accent transition-all">
                                    <div className="w-10 h-10 bg-accent/10 border border-accent/20 text-accent flex items-center justify-center text-xs font-mono font-bold">
                                       {r.score}.0
                                    </div>
                                    <div>
                                       <p className="text-[11px] font-mono font-bold text-text-primary uppercase">{r.user?.displayName || 'GUEST_ENTITY'}</p>
                                       <p className="text-[9px] text-text-secondary font-mono uppercase opacity-30 mt-1">UID: {r.userId.slice(0, 12)}</p>
                                    </div>
                                 </div>
                               ))}
                               {selectedBlogAnalysis.highRatings.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase opacity-30 text-center py-10">No high-tier signals.</p>}
                            </div>
                         </div>

                         <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                               <h4 className="text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-red-500 flex items-center gap-3">
                                  <ShieldAlert size={16} /> CRITICAL_SIGNALS
                               </h4>
                               <span className="text-xl font-display font-black text-red-500">{selectedBlogAnalysis.lowRatings.length}</span>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                               {selectedBlogAnalysis.lowRatings.map((r: any, idx: number) => (
                                 <div key={idx} className="flex items-center gap-5 p-5 bg-bg-page border border-border hover:border-red-500/30 transition-all">
                                    <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-xs font-mono font-bold">
                                       {r.score}.0
                                    </div>
                                    <div>
                                       <p className="text-[11px] font-mono font-bold text-text-primary uppercase">{r.user?.displayName || 'GUEST_ENTITY'}</p>
                                       <p className="text-[9px] text-text-secondary font-mono uppercase opacity-30 mt-1">UID: {r.userId.slice(0, 12)}</p>
                                    </div>
                                 </div>
                               ))}
                               {selectedBlogAnalysis.lowRatings.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase opacity-30 text-center py-10">No critical anomalies identified.</p>}
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-12">
           <button 
             onClick={() => {
                setActiveTab('analytics');
             }}
             className="w-full text-left bg-surface border-2 border-border p-10 hover:border-accent transition-all cursor-pointer group relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <LayoutGrid size={40} className="text-accent" />
              </div>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] mb-12 flex items-center gap-3 text-text-secondary group-hover:text-accent transition-colors">
                 <LayoutGrid size={16} /> CORE_OVERVIEW
              </h3>
              <div className="space-y-10">
                 <div className="border-b border-border pb-6">
                    <p className="text-text-secondary text-[10px] font-mono font-bold uppercase tracking-widest mb-3 opacity-40">READER_STREAMS</p>
                    <p className="text-5xl font-display font-black text-text-primary tracking-tighter leading-none">{stats.totalViews}</p>
                 </div>
                 
                 <div className="pt-2">
                    <p className="text-text-secondary text-[10px] font-mono font-bold uppercase tracking-widest mb-6 opacity-40">CLASSIFICATION_BREAKDOWN</p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-bg-page border border-border p-4 group-hover:border-accent/40 transition-colors">
                          <p className="text-[9px] font-mono uppercase tracking-widest opacity-40 mb-1">FIN</p>
                          <p className="text-xl font-display font-black text-text-primary">{newsCounts.finance || 0}</p>
                       </div>
                       <div className="bg-bg-page border border-border p-4 group-hover:border-accent/40 transition-colors">
                          <p className="text-[9px] font-mono uppercase tracking-widest opacity-40 mb-1">POL</p>
                          <p className="text-xl font-display font-black text-text-primary">{newsCounts.politics || 0}</p>
                       </div>
                       <div className="bg-bg-page border border-border p-4 group-hover:border-accent/40 transition-colors">
                          <p className="text-[9px] font-mono uppercase tracking-widest opacity-40 mb-1">GEO</p>
                          <p className="text-xl font-display font-black text-text-primary">{newsCounts.geopolitics || 0}</p>
                       </div>
                       <div className="bg-bg-page border border-border p-4 group-hover:border-accent/40 transition-colors">
                          <p className="text-[9px] font-mono uppercase tracking-widest opacity-40 mb-1">TECH</p>
                          <p className="text-xl font-display font-black text-text-primary">{newsCounts.tech || 0}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-between items-end border-b border-border pb-6 pt-4">
                    <span className="text-text-secondary text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">OPINION_ARCHIVES</span>
                    <span className="text-3xl font-display font-black text-text-primary">{blogs.length}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-border pb-6">
                    <span className="text-text-secondary text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">SYSTEM_SCORE</span>
                    <span className="text-3xl font-display font-black text-accent">{stats.avgRating.toFixed(1)}<span className="text-sm opacity-30">/5.0</span></span>
                 </div>
              </div>
           </button>

           <div className="bg-bg-page border border-border p-10">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] mb-10 flex items-center gap-3 text-text-secondary">
                 <FileText size={16} /> ARCHIVE_LOG
              </h3>
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                 {blogs.map((b, i) => (
                    <div key={i} className="group border-b border-border pb-6 last:border-0 last:pb-0">
                       <div className="flex items-start gap-4 mb-3">
                          <div className="w-8 h-8 bg-surface border border-border flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-bg-page transition-all">
                             <Plus size={14} />
                          </div>
                          <div className="overflow-hidden w-full">
                             <p 
                                onClick={() => { window.location.href = `/blog/${b.slug}`; }}
                                className="text-xs font-display font-bold text-text-primary uppercase tracking-tight hover:text-accent cursor-pointer transition-colors leading-tight line-clamp-2"
                             >
                               {b.title}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between mt-4">
                          <p className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-[0.2em] opacity-30">
                            DOC_{b.date.replace(/-/g, '')}
                          </p>
                          <button
                            onClick={() => handleDeleteBlog(b.id)}
                            className="p-2 border border-border text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                       </div>
                    </div>
                 ))}
                 {blogs.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest opacity-30 text-center py-10">No entries detected in database.</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
