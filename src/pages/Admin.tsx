import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { blogService } from '../lib/blogService';
import { auth, signInWithGoogle } from '../lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Plus, LayoutGrid, FileText, Settings, LogOut, Send, Image as ImageIcon, Link as LinkIcon, CheckCircle2, Zap } from 'lucide-react';
import { generateSlug, cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'subs' | 'news'>('posts');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const isAdmin = user?.email === 'catikrajauria@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadSubscribers();
      loadRecentNews();
    }
  }, [user, isAdmin, activeTab, newsCategory]);

  const loadSubscribers = async () => {
    try {
      const subs = await blogService.getSubscribers();
      setSubscribers(subs);
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
    if (!isAdmin) return;
    
    setSubmitting(true);
    try {
      await blogService.createBlog({
        title,
        date,
        summary,
        content,
        author,
        image: imageUrl || undefined,
        slug: generateSlug(title)
      });
      setSuccess(true);
      setTitle('');
      setSummary('');
      setContent('');
      setImageUrl('');
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to create blog');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
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
    } catch (error) {
      console.error('Error creating news:', error);
      alert('Failed to add news');
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
    } catch (err) {
      console.error('Error deleting news:', err);
    }
  };

  const handleSignIn = async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setLoginError('Vercel domain not authorized. Please add this URL to "Authorized Domains" in your Firebase console.');
      } else if (err.code === 'auth/popup-blocked') {
        setLoginError('Sign-in popup was blocked. Please enable popups for this site.');
      } else {
        setLoginError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-orange-100/30">
          <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-orange-200">
             <Settings size={40} className="text-orange-600" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4 text-text-primary">Admin Access</h1>
          <p className="text-text-secondary mb-8 font-serif leading-relaxed">Please sign in with your authorized Google account to manage the blog and newsletter.</p>
          
          <AnimatePresence>
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100 dark:border-red-900/30 leading-relaxed text-left"
              >
                <p className="mb-2">⚠️ {loginError}</p>
                {loginError.includes('Authorized Domains') && (
                  <div className="space-y-1 font-serif font-normal opacity-80">
                    <p>1. Go to Firebase Console &gt; Authentication &gt; Settings.</p>
                    <p>2. Add this domain to "Authorized domains".</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleSignIn}
            disabled={loginLoading}
            className="w-full py-4 bg-text-primary text-bg-page rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-black/5 active:scale-95 disabled:opacity-50"
          >
            {loginLoading ? (
              <span className="flex items-center gap-2">
                <LayoutGrid className="animate-spin" size={18} /> Connecting...
              </span>
            ) : (
              'Sign in with Google'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 p-8 md:p-12 rounded-[2.5rem] border border-red-100">
           <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut size={32} />
           </div>
           <h2 className="text-2xl font-bold text-red-900 mb-2">Unauthorized</h2>
           <p className="text-red-700 mb-8">This area is reserved for the blog owner. Your account ({user.email}) does not have admin privileges.</p>
           <button 
             onClick={() => signOut(auth)}
             className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all"
           >
             Sign Out
           </button>
        </div>
      </div>
    );
  }

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
          <nav className="flex gap-4 border-l border-border pl-8">
            <button 
              onClick={() => setActiveTab('posts')}
              className={cn("text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'posts' ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
            >
              Post Content
            </button>
            <button 
              onClick={() => setActiveTab('subs')}
              className={cn("text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'subs' ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
            >
              Subscribers ({subscribers.length})
            </button>
            <button 
              onClick={() => setActiveTab('news')}
              className={cn("text-xs font-bold uppercase tracking-widest transition-all", activeTab === 'news' ? "text-text-primary" : "text-text-secondary hover:text-text-primary")}
            >
              Newsletter News
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
            <form onSubmit={handleCreateBlog} className="bg-white p-10 rounded-xl border border-border space-y-8">
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
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">Blog Title</label>
                    <input 
                       type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium"
                       placeholder="The Future of AI Regulation..."
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">Publish Date</label>
                    <input 
                       type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                       className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium"
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
                        <option value="finance">Finance & Markets</option>
                        <option value="politics">Indian Politics</option>
                        <option value="geopolitics">Geopolitics</option>
                        <option value="tech">Industry & Tech</option>
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
                    <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg group bg-white dark:bg-zinc-800">
                      <div>
                        <p className="font-bold text-sm text-text-primary">{item.title}</p>
                        <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{item.source}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteNews(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-2"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  ))}
                  {recentNews.length === 0 && <p className="text-text-secondary italic font-serif py-4">No news items in this category.</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl border border-border">
               <h2 className="text-xl font-serif font-bold text-text-primary mb-8">Subscriber Directory</h2>
               <div className="space-y-4">
                  {subscribers.length > 0 ? subscribers.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-black transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center font-bold text-xs uppercase">
                             {sub.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                             <p className="font-bold text-sm text-text-primary">{sub.email}</p>
                             <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Joined {new Date(sub.subscribedAt?.seconds * 1000).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <p className="text-text-secondary font-serif italic text-center py-12">No active subscribers yet.</p>
                  )}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
           <div className="bg-accent text-white rounded-xl p-10 shadow-lg">
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-gray-400">
                 <LayoutGrid size={13} /> Overview
              </h3>
              <div className="space-y-8 font-serif">
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Readers</span>
                    <span className="text-3xl font-bold">{subscribers.length}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Opinions</span>
                    <span className="text-3xl font-bold">14</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Score</span>
                    <span className="text-3xl font-bold">4.9/5</span>
                 </div>
              </div>
           </div>

           <div className="bg-surface rounded-xl p-10 border border-border">
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-8 flex items-center gap-2 text-text-secondary">
                 <FileText size={13} /> Latest Readers
              </h3>
              <div className="space-y-6">
                 {subscribers.slice(0, 3).map((sub, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center flex-shrink-0">
                          <Plus size={14} />
                       </div>
                       <div className="overflow-hidden">
                          <p className="text-[12px] font-bold text-text-primary truncate">{sub.email}</p>
                          <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">Verified</p>
                       </div>
                    </div>
                 ))}
                 {subscribers.length === 0 && <p className="text-xs text-text-secondary italic font-serif">Waiting for new readers...</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
