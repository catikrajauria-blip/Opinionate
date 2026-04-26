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
  MessageSquare, Star, Copy, ExternalLink, User, Eye, Download,
  MousePointer2, BarChart3, ToggleLeft, ToggleRight, 
  Factory, HardHat, ShieldCheck, Cpu, TrendingUp
} from 'lucide-react';
import { generateSlug, cn, formatDate } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';

import { statsService } from '../lib/statsService';
import { pollService } from '../lib/pollService';
import { policyService, PolicyUpdate } from '../lib/policyService';
import { wordService, WordOfTheDay } from '../lib/wordService';

export default function Admin() {
  const { user, profile, isAdmin: isGlobalAdmin, loading: authLoading } = useAuth();
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'news' | 'users' | 'analytics' | 'community' | 'polls' | 'policy' | 'words'>('posts');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [allSubscribers, setAllSubscribers] = useState<any[]>([]);
  const [allPolls, setAllPolls] = useState<any[]>([]);
  const [allPolicies, setAllPolicies] = useState<PolicyUpdate[]>([]);
  const [allWords, setAllWords] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [archiveSearch, setArchiveSearch] = useState('');
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

  // Poll Form State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(''); // Comma separated
  const [pollStatus, setPollStatus] = useState<'active' | 'archived'>('active');
  const [pollShowResults, setPollShowResults] = useState(false);

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
      if (activeTab === 'polls') coreTasks.push(loadPolls());
      if (activeTab === 'policy') coreTasks.push(loadPolicies());
      if (activeTab === 'words') coreTasks.push(loadWords());

      await Promise.all(coreTasks);
    } catch (err) {
      console.error('Error in loadData:', err);
    } finally {
      // Ensure a minimum loading time for smooth transition and data arrival
      setTimeout(() => setLoading(false), 300);
    }
  };

  const loadPolls = async () => {
    try {
      const p = await pollService.getAllPolls();
      setAllPolls(p);
    } catch (err) {
      console.error('Error loading polls:', err);
    }
  };

  // Policy Form State
  const [policySector, setPolicySector] = useState<'Manufacturing' | 'Infrastructure' | 'Defence' | 'Tech' | 'Economy'>('Manufacturing');
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyDesc, setPolicyDesc] = useState('');
  const [policyDate, setPolicyDate] = useState(new Date().toISOString().split('T')[0]);
  const [policySource, setPolicySource] = useState('');

  const loadPolicies = async () => {
    try {
      const p = await policyService.getAllUpdates();
      setAllPolicies(p);
    } catch (err) {
      console.error('Error loading policies:', err);
    }
  };

  const handleSeedInfraData = async () => {
    if (!confirm('SEED_INFRASTRUCTURE_DATASET?_THIS_WILL_ADD_10_RECORDS.')) return;
    setSubmitting(true);
    try {
      const seeds = [
        { sector: "Infrastructure", title: "Make in India (Infra foundation)", date: "2014-01-01", description: "Industrial corridors, smart cities, and logistics infrastructure development started. Focused on making India a manufacturing hub with strong infrastructure backbone." },
        { sector: "Infrastructure", title: "Smart Cities Mission", date: "2015-01-01", description: "Development of 100 cities with modern transport, power, and utilities. Created infrastructure-ready urban industrial clusters." },
        { sector: "Infrastructure", title: "Bharatmala Pariyojana", date: "2016-01-01", description: "Economic corridors and national highways expansion. Reduced transport time for manufacturing supply chains." },
        { sector: "Infrastructure", title: "Sagarmala Programme", date: "2016-06-01", description: "Port modernization and coastal industrial zones. Boosted export-oriented manufacturing." },
        { sector: "Infrastructure", title: "Dedicated Freight Corridor", date: "2018-01-01", description: "High-speed freight rail network for cargo. Reduced logistics cost for industries." },
        { sector: "Infrastructure", title: "National Infrastructure Pipeline", date: "2019-01-01", description: "₹100 lakh crore infrastructure investment roadmap. Covered roads, railways, power, logistics, ports." },
        { sector: "Infrastructure", title: "PM Gati Shakti National Master Plan", date: "2021-10-13", description: "Integrated infrastructure planning across ministries. Improved connectivity for industrial zones." },
        { sector: "Infrastructure", title: "National Logistics Policy", date: "2022-09-17", description: "Reduced logistics cost and improved supply chain. Focused on multimodal transport infrastructure." },
        { sector: "Infrastructure", title: "Industrial Corridor Development Programme", date: "2023-01-01", description: "Smart industrial cities along major freight corridors. Boosted manufacturing infrastructure." },
        { sector: "Infrastructure", title: "Multi Modal Logistics Parks", date: "2024-01-01", description: "Large logistics hubs integrating rail, road, warehousing. Improves freight handling and reduces cost." }
      ];

      for (const s of seeds) {
        await policyService.addUpdate(s as any);
      }
      
      setSuccess(true);
      loadPolicies();
    } catch (err: any) {
      alert(err.message || 'Error seeding data');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleSeedDefenceData = async () => {
    if (!confirm('SEED_DEFENCE_DATASET?_THIS_WILL_ADD_13_RECORDS.')) return;
    setSubmitting(true);
    try {
      const seeds = [
        { sector: "Defence", title: "Make in India (Defence Sector Opening)", date: "2014-09-25", description: "Defence manufacturing opened to private sector and FDI increased. Focus on domestic production of weapons, aircraft, and military equipment. Marked start of self-reliance push in defence." },
        { sector: "Defence", title: "Defence Procurement Procedure 2016", date: "2016-03-28", description: "Introduced “Buy Indian – IDDM” category (Indigenously Designed, Developed, Manufactured). Prioritized domestic defence companies in procurement." },
        { sector: "Defence", title: "Strategic Partnership Model", date: "2017-05-01", description: "Allowed private companies to partner with global defence manufacturers. Focus on submarines, fighter jets, helicopters, armored vehicles." },
        { sector: "Defence", title: "Innovations for Defence Excellence (iDEX)", date: "2018-04-12", description: "Encouraged startups and MSMEs in defence innovation. Funding and support for indigenous defence technology." },
        { sector: "Defence", title: "Defence Production Policy 2018", date: "2018-08-01", description: "Targeted $26 billion defence production. Focus on exports and domestic manufacturing ecosystem." },
        { sector: "Defence", title: "Atmanirbhar Bharat Abhiyan (Defence Push)", date: "2020-05-12", description: "Major push for domestic defence manufacturing. Import substitution and local procurement mandates." },
        { sector: "Defence", title: "Defence Positive Indigenisation List", date: "2020-08-09", description: "Banned import of 101 defence items initially. Encouraged domestic production of weapons systems." },
        { sector: "Defence", title: "Defence Acquisition Procedure 2020", date: "2020-09-28", description: "Simplified procurement process. Increased preference for Indian manufacturers." },
        { sector: "Defence", title: "Ordnance Factory Board Corporatisation", date: "2021-10-01", description: "Converted OFB into 7 defence PSUs. Improved efficiency and competitiveness." },
        { sector: "Defence", title: "Defence Indigenisation Lists Expansion", date: "2022-04-01", description: "Additional defence equipment added to import ban list. Boost to domestic manufacturing." },
        { sector: "Defence", title: "iDEX Prime", date: "2023-01-01", description: "Higher funding for deep-tech defence startups. Focus on AI, drones, autonomous systems." },
        { sector: "Defence", title: "Defence Production and Export Promotion Policy update", date: "2024-01-01", description: "Target of ₹35,000 crore defence exports. Push for global defence manufacturing hub." },
        { sector: "Defence", title: "Defence Industrial Corridors Expansion", date: "2025-01-01", description: "Expansion of UP and Tamil Nadu defence corridors. Focus on local supply chain ecosystem." }
      ];

      for (const s of seeds) {
        await policyService.addUpdate(s as any);
      }
      
      setSuccess(true);
      loadPolicies();
    } catch (err: any) {
      alert(err.message || 'Error seeding data');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleSeedTechData = async () => {
    if (!confirm('SEED_TECH_DATASET?_THIS_WILL_ADD_19_RECORDS.')) return;
    setSubmitting(true);
    try {
      const seeds = [
        { sector: "Tech", title: "Digital India Launched", date: "2015-07-01", description: "Aimed to transform India into a digitally empowered economy. Focus on broadband, digital services, digital governance, and digital infrastructure." },
        { sector: "Tech", title: "Startup India", date: "2016-01-16", description: "Tax benefits, funding support, and ease of compliance for startups. Boosted tech startups in AI, SaaS, fintech, and deep tech." },
        { sector: "Tech", title: "BHIM UPI", date: "2017-06-29", description: "Government-backed digital payments ecosystem. Enabled fintech innovation and digital commerce growth." },
        { sector: "Tech", title: "National Digital Communications Policy", date: "2018-06-01", description: "Focused on 5G, fiber connectivity, and IoT infrastructure. Targeted digital economy expansion." },
        { sector: "Tech", title: "National Supercomputing Mission", date: "2018-02-28", description: "Development of high-performance computing infrastructure. Supports AI, weather, defense, and research." },
        { sector: "Tech", title: "AI for All Strategy", date: "2018-07-12", description: "National AI roadmap for healthcare, agriculture, mobility. Focused on responsible AI adoption." },
        { sector: "Tech", title: "National AI Portal", date: "2020-07-01", description: "Central hub for AI news, research, startups. Promotes AI ecosystem in India." },
        { sector: "Tech", title: "National Digital Health Mission", date: "2020-08-01", description: "Digital health IDs and health data infrastructure. Major health-tech ecosystem push." },
        { sector: "Tech", title: "Atmanirbhar Bharat Digital Push", date: "2020-05-12", description: "Focus on electronics, apps, and tech manufacturing. Promoted domestic tech ecosystem." },
        { sector: "Tech", title: "Semicon India Program", date: "2021-12-01", description: "Incentives for chip manufacturing and fab units. Goal: build domestic semiconductor ecosystem." },
        { sector: "Tech", title: "India Stack Expansion", date: "2021-01-01", description: "Aadhaar, UPI, DigiLocker expansion. Enabled digital economy growth." },
        { sector: "Tech", title: "AVGC Promotion Task Force", date: "2022-04-01", description: "Focus on gaming, animation, and VFX industry. Boost to creative tech economy." },
        { sector: "Tech", title: "5G Spectrum Auction", date: "2022-07-01", description: "Enabled nationwide 5G deployment. Boost to Industry 4.0 and IoT." },
        { sector: "Tech", title: "Digital India Act Proposal", date: "2023-01-01", description: "Modern legal framework for internet platforms. Covers AI, social media, and digital governance." },
        { sector: "Tech", title: "IndiaAI Mission", date: "2023-06-01", description: "Funding for AI compute infrastructure and startups. National AI ecosystem development." },
        { sector: "Tech", title: "IndiaAI Mission Approval", date: "2024-03-01", description: "₹10,000+ crore allocation for AI infrastructure. GPU clusters, datasets, and research support." },
        { sector: "Tech", title: "DPDP Act Implementation", date: "2024-08-01", description: "Data privacy and tech regulation framework. Important for AI and digital companies." },
        { sector: "Tech", title: "National Deep Tech Startup Policy", date: "2025-01-01", description: "Support for AI, robotics, quantum computing startups. Funding and R&D incentives." },
        { sector: "Tech", title: "Semiconductor Mission Expansion", date: "2026-01-01", description: "Additional incentives for fabs and packaging units. Focus on electronics and AI hardware." }
      ];

      for (const s of seeds) {
        await policyService.addUpdate(s as any);
      }
      
      setSuccess(true);
      loadPolicies();
    } catch (err: any) {
      alert(err.message || 'Error seeding data');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleSeedWordData = async () => {
    if (!confirm('SEED_LEXICAL_DATASET?_BATCH_DEPLOYING_SAMPLE_WORDS.')) return;
    setSubmitting(true);
    try {
      const sampleWords = [
        { word: 'AMRIT KAAL', definition: 'The 25-year period until 2047, the centenary of India\'s independence, envisioned as a golden age of development.', usage: 'The Vision 2047 document outlines the roadmap for Amrit Kaal.', date: new Date().toISOString().split('T')[0] },
        { word: 'ATMANIRBHAR', definition: 'Self-reliant; specifically referring to the Atmanirbhar Bharat initiative for economic independence.', usage: 'India is striving to become atmanirbhar in defense manufacturing.', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
        { word: 'GATI SHAKTI', definition: 'Motive power or infrastructure speed; a national master plan for multi-modal connectivity.', usage: 'PM Gati Shakti is integrating logistics planning across ministries.', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] }
      ];

      for (const w of sampleWords) {
        await wordService.addWord(w);
      }
      setSuccess(true);
      loadWords();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleSeedEconomyData = async () => {
    if (!confirm('SEED_ECONOMY_DATASET?_THIS_WILL_ADD_21_RECORDS.')) return;
    setSubmitting(true);
    try {
      const seeds = [
        { sector: "Economy", title: "Pradhan Mantri Jan Dhan Yojana", date: "2014-08-28", description: "Mass bank account opening for financial inclusion. Enabled direct benefit transfer and formalization of economy." },
        { sector: "Economy", title: "Make in India", date: "2014-09-25", description: "Attracted foreign investment and boosted domestic manufacturing. Aimed to increase manufacturing share in GDP." },
        { sector: "Economy", title: "Digital India", date: "2015-07-01", description: "Digital infrastructure for payments, governance, and services. Backbone for digital economy growth." },
        { sector: "Economy", title: "Startup India", date: "2016-01-16", description: "Tax benefits, funding, and compliance ease for startups. Boosted innovation-led economic growth." },
        { sector: "Economy", title: "Demonetisation 2016", date: "2016-11-08", description: "₹500 and ₹1000 notes withdrawn. Aimed to formalize economy and promote digital payments." },
        { sector: "Economy", title: "Goods and Services Tax (GST)", date: "2017-07-01", description: "Unified indirect tax across India. Simplified supply chain and improved tax compliance." },
        { sector: "Economy", title: "Insolvency and Bankruptcy Code", date: "2016-05-28", description: "Faster resolution of stressed assets. Improved credit environment and investment climate." },
        { sector: "Economy", title: "Corporate Tax Cut 2019", date: "2019-09-20", description: "Corporate tax reduced to 22% (15% for new manufacturing). Boosted investment and economic growth." },
        { sector: "Economy", title: "National Infrastructure Pipeline", date: "2019-12-31", description: "₹100 lakh crore infrastructure investment roadmap. Stimulated economic growth and employment." },
        { sector: "Economy", title: "Atmanirbhar Bharat Abhiyan", date: "2020-05-12", description: "COVID recovery package with reforms and liquidity. Focus on self-reliance and domestic production." },
        { sector: "Economy", title: "Production Linked Incentive Scheme", date: "2020-03-01", description: "Incentives for incremental production. Boosted exports and domestic manufacturing." },
        { sector: "Economy", title: "National Monetisation Pipeline", date: "2021-08-23", description: "Monetization of public infrastructure assets. Funded new infrastructure investments." },
        { sector: "Economy", title: "PM Gati Shakti National Master Plan", date: "2021-10-13", description: "Integrated planning for logistics infrastructure. Reduced cost of doing business." },
        { sector: "Economy", title: "National Logistics Policy", date: "2022-09-17", description: "Target to reduce logistics cost. Improved competitiveness of exports." },
        { sector: "Economy", title: "Foreign Trade Policy 2023", date: "2023-03-31", description: "Target $2 trillion exports. Boost for MSME and manufacturing exports." },
        { sector: "Economy", title: "Digital Public Infrastructure Expansion", date: "2023-01-01", description: "UPI, ONDC, Aadhaar ecosystem growth. Enabled digital commerce and fintech growth." },
        { sector: "Economy", title: "IndiaAI Mission", date: "2024-03-07", description: "Investment in AI infrastructure and startups. Focus on tech-driven economic growth." },
        { sector: "Economy", title: "India‑Japan Civil Nuclear Agreement", date: "2016-11-11", description: "Enabled nuclear cooperation and investment. Boosted infrastructure and energy sector." },
        { sector: "Economy", title: "India‑UAE CEPA", date: "2022-02-18", description: "Reduced tariffs on goods and services. Boosted exports and trade." },
        { sector: "Economy", title: "India‑Australia ECTA", date: "2022-04-02", description: "Trade liberalization across sectors. Increased exports and economic ties." },
        { sector: "Economy", title: "India‑UK Free Trade Agreement (Ongoing)", date: "2024-01-01", description: "Expected to boost trade and investment. Focus on services and manufacturing." }
      ];

      for (const s of seeds) {
        await policyService.addUpdate(s as any);
      }
      
      setSuccess(true);
      loadPolicies();
    } catch (err: any) {
      alert(err.message || 'Error seeding data');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyTitle || !policyDesc || !policyDate) return;
    
    setSubmitting(true);
    try {
      await policyService.addUpdate({
        sector: policySector,
        title: policyTitle,
        description: policyDesc,
        date: policyDate,
        sourceUrl: policySource || undefined
      });
      
      setSuccess(true);
      setPolicyTitle('');
      setPolicyDesc('');
      setPolicySource('');
      loadPolicies();
    } catch (err: any) {
      console.error('Error creating policy update:', err);
      alert(err.message || 'Error creating policy update');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm('DELETE_THIS_RECORD?_IRREVERSIBLE.')) return;
    try {
      await policyService.deleteUpdate(id);
      loadPolicies();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Word of the Day Form State
  const [wotdWord, setWotdWord] = useState('');
  const [wotdDefinition, setWotdDefinition] = useState('');
  const [wotdUsage, setWotdUsage] = useState('');
  const [wotdDate, setWotdDate] = useState(new Date().toISOString().split('T')[0]);

  const loadWords = async () => {
    try {
      const w = await wordService.getAllWords();
      setAllWords(w);
    } catch (err) {
      console.error('Error loading words:', err);
    }
  };

  const handleCreateWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wotdWord || !wotdDefinition) return;
    
    setSubmitting(true);
    try {
      await wordService.addWord({
        word: wotdWord,
        definition: wotdDefinition,
        usage: wotdUsage || undefined,
        date: wotdDate
      });
      
      setSuccess(true);
      setWotdWord('');
      setWotdDefinition('');
      setWotdUsage('');
      loadWords();
    } catch (err: any) {
      console.error('Error creating word:', err);
      alert(err.message || 'Error creating word');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
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
  
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion || !pollOptions) return;
    
    setSubmitting(true);
    try {
      const options = pollOptions.split(',').map(o => o.trim()).filter(o => o.length > 0);
      if (options.length < 2) {
        throw new Error('Please provide at least 2 options');
      }
      
      await pollService.createPoll({
        question: pollQuestion,
        options,
        status: pollStatus,
        showResults: pollShowResults
      });
      
      setSuccess(true);
      setPollQuestion('');
      setPollOptions('');
      loadPolls();
    } catch (err: any) {
      console.error('Error creating poll:', err);
      alert(err.message || 'Error creating poll');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleTogglePollStatus = async (pollId: string, currentStatus: 'active' | 'archived') => {
    try {
      const nextStatus = currentStatus === 'active' ? 'archived' : 'active';
      await pollService.updatePollStatus(pollId, nextStatus);
      loadPolls();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTogglePollVisibility = async (pollId: string, currentVal: boolean) => {
    try {
      await pollService.updatePollVisibility(pollId, !currentVal);
      loadPolls();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!window.confirm('IRREVERSIBLE_ACTION: Delete this poll and all associated data?')) return;
    try {
      await pollService.deletePoll(pollId);
      loadPolls();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
           <h2 className="text-4xl font-display font-black text-red-500 mb-4 uppercase tracking-tighter">ACCESS DENIED</h2>
           <p className="text-red-700 dark:text-red-300 mb-10 font-display font-medium uppercase tracking-tight leading-tight">This area is reserved for the blog owner. Your account ({user.email}) does not have admin privileges.</p>
           <button 
             onClick={() => signOut(auth)}
             className="w-full px-8 py-5 bg-red-500 text-white font-mono font-bold uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-95"
           >
             TERMINATE SESSION
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
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 text-text-primary">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 mb-20 border-b border-border pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0" />
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 w-full xl:w-auto relative z-10">
          <div className="flex items-center gap-6 group">
            <div className="p-4 bg-accent/5 border border-accent/20 glow-cyan transition-transform group-hover:scale-110">
              <Shield className="text-accent animate-pulse" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-display font-black tracking-tighter uppercase leading-none text-text-primary">Admin Panel</h1>
              <p className="text-text-secondary flex items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-[0.5em] mt-2">
                AUTH_STATUS: <span className="text-accent underline">SECURE ACCESS GRANTED</span>
              </p>
            </div>
          </div>
          
          <nav className="flex flex-wrap gap-2 md:border-l border-border md:pl-12">
            {[
              { id: 'posts', label: 'POSTS', icon: FileText },
              { id: 'news', label: 'NEWS', icon: Zap },
              { id: 'users', label: 'USERS', icon: Users },
              { id: 'community', label: 'COMMUNITY', icon: MessageSquare },
              { id: 'policy', label: 'POLICY', icon: ShieldCheck },
              { id: 'words', label: 'WORDS', icon: FileText },
              { id: 'analytics', label: 'ANALYTICS', icon: PieChart },
              { id: 'polls', label: 'POLLS', icon: BarChart3 }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-5 py-3 text-[9px] font-mono font-bold uppercase tracking-[0.3em] transition-all relative flex items-center gap-3 border backdrop-blur-sm",
                  activeTab === tab.id 
                    ? "text-accent bg-accent/10 border-accent/40 glow-cyan" 
                    : "text-text-secondary hover:text-accent border-border hover:border-accent/40 bg-surface/50"
                )}
              >
                <tab.icon size={14} className={cn(activeTab === tab.id ? "text-accent" : "opacity-30")} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="flex items-center gap-4 px-8 py-4 bg-red-500/5 border border-red-500/20 text-red-500 font-mono font-black uppercase tracking-[0.4em] text-[10px] hover:bg-red-500 hover:text-bg-page transition-all glow-pink/10"
        >
          <LogOut size={16} /> LOGOUT
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
                       Create New Post
                    </h2>
                    <p className="text-[10px] font-mono font-bold text-text-secondary mt-2 tracking-widest opacity-50 uppercase">Post Editor</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      type="button"
                      onClick={generateAIContent}
                      disabled={aiLoading}
                      className="btn-minimal px-6 py-3 font-mono text-[10px] flex items-center gap-3 transition-all active:scale-95"
                    >
                      <Zap size={14} className={cn("text-accent", aiLoading && "animate-pulse")} /> 
                      {aiLoading ? 'GENERATING CONTENT...' : 'AI GENERATE POST'}
                    </button>
                    {success && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 font-mono font-bold text-[10px] uppercase tracking-widest px-4 border border-green-500/20 bg-green-500/5">
                          <CheckCircle2 size={14} /> PUBLISHED.
                        </motion.div>
                    )}
                  </div>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Post Title</label>
                    <input 
                       type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                       className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-lg font-display font-bold uppercase tracking-tight"
                       placeholder="Enter title..."
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Publish Date</label>
                    <input 
                       type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                       className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono font-bold text-xs uppercase"
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Short Summary</label>
                 <textarea 
                    required value={summary} onChange={(e) => setSummary(e.target.value)} rows={3}
                    className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-display font-medium text-base resize-none uppercase tracking-tight leading-tight"
                    placeholder="Provide a brief overview..."
                 />
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Full Article Content</label>
                    <span className="text-[9px] font-mono text-accent font-bold uppercase tracking-widest">Mark_Syntax_Active</span>
                 </div>
                 <textarea 
                    required value={content} onChange={(e) => setContent(e.target.value)} rows={12}
                    className="w-full bg-surface border border-border p-6 outline-none focus:border-accent font-mono text-xs leading-relaxed resize-none"
                    placeholder="Write your article content here..."
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-8 border-b border-border">
                 <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Author Name</label>
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
                 {submitting ? 'PUBLISHING...' : 'PUBLISH POST'}
               </button>
            </form>
          ) : activeTab === 'news' ? (
            <div className="space-y-12">
              <form onSubmit={handleCreateNews} className="bg-bg-page p-10 border border-border space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                  <div>
                    <h2 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">
                       Add News Item
                    </h2>
                    <p className="text-[10px] font-mono font-bold text-text-secondary mt-2 tracking-widest opacity-50 uppercase">EXTERNAL_FEED_MODULE</p>
                  </div>
                  {success && activeTab === 'news' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 font-mono font-bold text-[10px] uppercase tracking-widest px-4 border border-green-500/20 bg-green-500/5 py-2">
                        <CheckCircle2 size={14} /> ITEM SAVED.
                      </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">News Headline</label>
                      <input 
                        type="text" required value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)}
                        className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-lg font-display font-bold uppercase tracking-tight"
                        placeholder="Enter headline..."
                      />
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Classification</label>
                      <select 
                        value={newsCategory} onChange={(e) => setNewsCategory(e.target.value)}
                        className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono font-bold text-xs uppercase"
                      >
                        <option value="finance">FINANCE ({newsCounts.finance || 0})</option>
                        <option value="politics">POLITICS ({newsCounts.politics || 0})</option>
                        <option value="geopolitics">GEOPOLITICS ({newsCounts.geopolitics || 0})</option>
                        <option value="tech">TECH ({newsCounts.tech || 0})</option>
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
                  {submitting ? 'SAVING...' : 'SAVE NEWS ITEM'}
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
                        className="flex items-center gap-3 text-red-500 hover:bg-red-500 hover:text-bg-page transition-all px-4 py-2 border border-red-500/20 text-[10px] uppercase font-mono font-bold tracking-widest"
                      >
                        <Trash2 size={14} />
                        <span>DELETE</span>
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
                         User Directory
                      </h2>
                      <p className="text-[10px] text-text-secondary uppercase font-mono font-bold tracking-widest mt-2 opacity-50">AUTHORIZED_PERSONNEL & GUEST_LOG</p>
                    </div>
                    <div className="relative w-full md:w-80">
                       <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                       <input 
                         type="text" 
                         placeholder="Search users..."
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
                            <th className="px-10 py-5 text-left">User Name</th>
                            <th className="px-10 py-5 text-left">Account Type</th>
                            <th className="px-10 py-5 text-left">Joined Date</th>
                            <th className="px-10 py-5 text-right">Actions</th>
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
                                       u.isBlocked ? "border-green-500/20 text-green-500 hover:bg-green-500 hover:text-bg-page" : "border-red-500/20 text-red-500 hover:bg-red-500 hover:text-bg-page"
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
           ) : activeTab === 'polls' ? (
             <div className="space-y-12">
               <form onSubmit={handleCreatePoll} className="bg-bg-page p-10 border border-border space-y-12">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                   <div>
                     <h2 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">
                        Create New Poll
                     </h2>
                     <p className="text-[10px] font-mono font-bold text-text-secondary mt-2 tracking-widest opacity-50 uppercase">Poll Editor</p>
                   </div>
                   {success && activeTab === 'polls' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 font-mono font-bold text-[10px] uppercase tracking-widest px-4 border border-green-500/20 bg-green-500/5 py-2">
                         <CheckCircle2 size={14} /> POLL LIVE.
                       </motion.div>
                   )}
                 </div>

                 <div className="space-y-8">
                   <div className="space-y-4">
                     <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Poll Question</label>
                     <input 
                       type="text" required value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)}
                       className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-lg font-display font-bold uppercase tracking-tight"
                       placeholder="What is your perspective on..."
                     />
                   </div>
                   
                   <div className="space-y-4">
                     <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Response_Options_(COMMA_SEPARATED)</label>
                     <input 
                       type="text" required value={pollOptions} onChange={(e) => setPollOptions(e.target.value)}
                       className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono text-sm uppercase"
                       placeholder="Agree, Disagree, Neutral..."
                     />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                       <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Poll Status</label>
                       <select 
                         value={pollStatus} onChange={(e) => setPollStatus(e.target.value as any)}
                         className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono font-bold text-xs uppercase"
                       >
                         <option value="active">STAGED_ACTIVE</option>
                         <option value="archived">ARCHIVED_RECORD</option>
                       </select>
                     </div>
                     <div className="space-y-4">
                       <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Result Visibility</label>
                       <div className="flex items-center gap-4 bg-surface border border-border p-4">
                         <button 
                           type="button"
                           onClick={() => setPollShowResults(!pollShowResults)}
                           className="text-accent"
                         >
                           {pollShowResults ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-text-secondary opacity-30" />}
                         </button>
                         <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
                           {pollShowResults ? 'PUBLIC RESULTS ENABLED' : 'PRIVATE RESULTS ONLY'}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>

                 <button 
                   disabled={submitting}
                   className="btn-minimal-primary w-full py-6 text-xl font-display font-black uppercase tracking-tighter"
                 >
                   {submitting ? 'CREATING...' : 'PUBLISH POLL'}
                 </button>
               </form>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {allPolls.map((p) => (
                    <div key={p.id} className="bg-bg-page border border-border p-8 hover:border-accent transition-all group relative flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[8px] font-mono font-bold px-2 py-0.5 uppercase tracking-tighter border",
                            p.status === 'active' ? "border-green-500 text-green-500 bg-green-500/5" : "border-border text-text-secondary"
                          )}>
                             {p.status}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeletePoll(p.id)}
                          className="text-text-secondary opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-8 leading-tight">
                        {p.question}
                      </h3>

                      <div className="space-y-4 flex-grow mb-8 font-mono">
                        {p.options.map((opt: string) => {
                          const votes = p.results[opt] || 0;
                          const perc = p.totalVotes > 0 ? Math.round((votes / p.totalVotes) * 100) : 0;
                          return (
                            <div key={opt} className="space-y-1">
                               <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-text-secondary opacity-60">
                                  <span>{opt}</span>
                                  <span>{votes} ({perc}%)</span>
                               </div>
                               <div className="h-1 bg-surface relative">
                                  <div className="absolute top-0 left-0 h-full bg-accent/40" style={{ width: `${perc}%` }} />
                               </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
                        <div className="flex items-center gap-4">
                           <button 
                             onClick={() => handleTogglePollStatus(p.id, p.status)}
                             title="TOGGLE_STATUS"
                             className="text-text-secondary hover:text-accent transition-colors"
                           >
                             <Send size={14} className={cn(p.status === 'active' && "text-accent")} />
                           </button>
                           <button 
                             onClick={() => handleTogglePollVisibility(p.id, p.showResults)}
                             title="TOGGLE_VISIBILITY"
                             className="text-text-secondary hover:text-accent transition-colors"
                           >
                             {p.showResults ? <Eye size={14} className="text-accent" /> : <Shield size={14} />}
                           </button>
                        </div>
                        <span className="text-[9px] font-mono text-text-secondary opacity-30 uppercase">TOTAL_VOTES: {p.totalVotes}</span>
                      </div>
                    </div>
                  ))}
                  {allPolls.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase opacity-40 col-span-full text-center py-20 border border-border border-dashed">No opinion surveys identified in archive.</p>}
               </div>
             </div>
           ) : activeTab === 'policy' ? (
             <div className="space-y-12">
               <form onSubmit={handleCreatePolicy} className="bg-bg-page p-10 border border-border space-y-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                     <div>
                       <h2 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">
                          Add Policy Update
                       </h2>
                       <p className="text-[10px] font-mono font-bold text-text-secondary mt-2 tracking-widest opacity-50 uppercase">Policy Track</p>
                     </div>
                     <div className="flex flex-wrap gap-4">
                       <button 
                         type="button"
                         onClick={handleSeedInfraData}
                         className="flex items-center gap-2 px-4 py-2 border border-accent/20 bg-accent/5 text-[10px] font-mono font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-bg-page transition-all"
                       >
                         <Zap size={14} /> SEED_INFRA_DATASET
                       </button>
                       <button 
                         type="button"
                         onClick={handleSeedDefenceData}
                         className="flex items-center gap-2 px-4 py-2 border border-accent/20 bg-accent/5 text-[10px] font-mono font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-bg-page transition-all"
                       >
                         <ShieldCheck size={14} /> SEED_DEFENCE_DATASET
                       </button>
                       <button 
                         type="button"
                         onClick={handleSeedTechData}
                         className="flex items-center gap-2 px-4 py-2 border border-accent/20 bg-accent/5 text-[10px] font-mono font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-bg-page transition-all"
                       >
                         <Cpu size={14} /> SEED_TECH_DATASET
                       </button>
                       <button 
                         type="button"
                         onClick={handleSeedEconomyData}
                         className="flex items-center gap-2 px-4 py-2 border border-accent/20 bg-accent/5 text-[10px] font-mono font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-bg-page transition-all"
                       >
                         <TrendingUp size={14} /> SEED_ECONOMY_DATASET
                       </button>
                       {success && (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 font-mono font-bold text-[10px] uppercase tracking-widest px-4 border border-green-500/20 bg-green-500/5">
                             <CheckCircle2 size={14} /> UPDATED.
                           </motion.div>
                       )}
                     </div>
                  </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Sector</label>
                       <select 
                          value={policySector} onChange={(e) => setPolicySector(e.target.value as any)}
                          className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono font-bold text-xs uppercase"
                       >
                          <option value="Manufacturing">MANUFACTURING</option>
                          <option value="Infrastructure">INFRASTRUCTURE</option>
                          <option value="Defence">DEFENCE</option>
                          <option value="Tech">TECH</option>
                          <option value="Economy">ECONOMY</option>
                       </select>
                    </div>
                    <div className="space-y-4 lg:col-span-1">
                       <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Policy Title</label>
                       <input 
                          type="text" required value={policyTitle} onChange={(e) => setPolicyTitle(e.target.value)}
                          className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-lg font-display font-bold uppercase tracking-tight"
                          placeholder="Policy title..."
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Date</label>
                       <input 
                          type="date" required value={policyDate} onChange={(e) => setPolicyDate(e.target.value)}
                          className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono font-bold text-xs uppercase"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Description</label>
                    <textarea 
                       required value={policyDesc} onChange={(e) => setPolicyDesc(e.target.value)}
                       rows={4}
                       className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-sm leading-relaxed"
                       placeholder="Describe the policy..."
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Source_URL (Optional)</label>
                    <div className="relative">
                       <LinkIcon size={14} className="absolute left-5 top-6 text-text-secondary opacity-30" />
                       <input 
                          type="url" value={policySource} onChange={(e) => setPolicySource(e.target.value)}
                          className="w-full bg-surface border border-border p-5 pl-12 outline-none focus:border-accent font-mono text-xs"
                          placeholder="https://pib.gov.in/..."
                       />
                    </div>
                 </div>

                 <button 
                   disabled={submitting}
                   className="btn-minimal-primary w-full py-6 text-xl font-display font-black uppercase tracking-tighter"
                 >
                   {submitting ? 'RECORDING...' : 'SAVE POLICY'}
                 </button>
               </form>

               <div className="space-y-8">
                  <h3 className="text-xl font-display font-black uppercase tracking-tighter border-l-4 border-accent pl-6">
                     Recent Policy Updates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {allPolicies.map((p) => (
                        <div key={p.id} className="bg-surface border border-border p-8 hover:border-accent transition-all group">
                           <div className="flex justify-between items-start mb-6">
                              <span className="text-[8px] font-mono font-bold px-2 py-0.5 uppercase tracking-tighter border border-accent/20 text-accent bg-accent/5">
                                 {p.sector}
                              </span>
                              <button 
                                onClick={() => handleDeletePolicy(p.id!)}
                                className="text-text-secondary opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                           </div>
                           <h4 className="text-lg font-display font-black uppercase tracking-tighter mb-4 leading-tight">{p.title}</h4>
                           <p className="text-xs text-text-secondary leading-relaxed mb-6 line-clamp-3">{p.description}</p>
                           <div className="flex justify-between items-center text-[8px] font-mono font-bold uppercase opacity-30">
                              <span>DATE: {p.date}</span>
                              {p.sourceUrl && <span className="text-accent flex items-center gap-1">VERIFIED <CheckCircle2 size={8} /></span>}
                           </div>
                        </div>
                     ))}
                     {allPolicies.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase opacity-40 col-span-full text-center py-20 border border-border border-dashed">Strategic timeline is currently empty.</p>}
                  </div>
               </div>
             </div>
           ) : activeTab === 'words' ? (
              <div className="space-y-12">
                <form onSubmit={handleCreateWord} className="bg-bg-page p-10 border border-border space-y-12">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                      <div>
                        <h2 className="text-3xl font-display font-black tracking-tighter uppercase leading-none">
                           Add New Word
                        </h2>
                        <p className="text-[10px] font-mono font-bold text-text-secondary mt-2 tracking-widest opacity-50 uppercase">Word Editor</p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <button 
                          type="button"
                          onClick={handleSeedWordData}
                          className="flex items-center gap-2 px-4 py-2 border border-accent/20 bg-accent/5 text-[10px] font-mono font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-bg-page transition-all"
                        >
                          <Zap size={14} /> Populate Sample Words
                        </button>
                        {success && activeTab === 'words' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 font-mono font-bold text-[10px] uppercase tracking-widest px-4 border border-green-500/20 bg-green-500/5 py-2">
                              <CheckCircle2 size={14} /> WORD SAVED.
                            </motion.div>
                        )}
                      </div>
                   </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Word</label>
                        <input 
                           type="text" required value={wotdWord} onChange={(e) => setWotdWord(e.target.value)}
                           className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-lg font-display font-bold uppercase tracking-tight"
                           placeholder="Enter word..."
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Activation Date</label>
                        <input 
                           type="date" required value={wotdDate} onChange={(e) => setWotdDate(e.target.value)}
                           className="w-full bg-surface border border-border p-5 outline-none focus:border-accent font-mono font-bold text-xs uppercase"
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Definition</label>
                     <textarea 
                        required value={wotdDefinition} onChange={(e) => setWotdDefinition(e.target.value)}
                        rows={3}
                        className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-sm leading-relaxed"
                        placeholder="Define the word..."
                     />
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary opacity-50">Example Usage</label>
                     <textarea 
                        value={wotdUsage} onChange={(e) => setWotdUsage(e.target.value)}
                        rows={2}
                        className="w-full bg-surface border border-border p-5 outline-none focus:border-accent text-sm leading-relaxed"
                        placeholder="Use in a sentence..."
                     />
                  </div>

                  <button 
                    disabled={submitting}
                    className="btn-minimal-primary w-full py-6 text-xl font-display font-black uppercase tracking-tighter"
                  >
                    {submitting ? 'COMMITTING_TO_LEXICON...' : 'DEPLOY_WORD_OF_DAY'}
                  </button>
                </form>

                <div className="space-y-8">
                   <h3 className="text-xl font-display font-black uppercase tracking-tighter border-l-4 border-accent pl-6">
                      Word History
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {allWords.map((w) => (
                         <div key={w.id} className="bg-surface border border-border p-8 hover:border-accent transition-all group">
                            <p className="text-[8px] font-mono font-bold opacity-30 uppercase mb-4 tracking-widest">{w.date}</p>
                            <h4 className="text-2xl font-display font-black uppercase tracking-tighter mb-4 text-accent">{w.word}</h4>
                            <p className="text-xs text-text-secondary leading-tight mb-6 line-clamp-3 italic">"{w.definition}"</p>
                         </div>
                      ))}
                      {allWords.length === 0 && <p className="text-[10px] font-mono text-text-secondary uppercase opacity-40 col-span-full text-center py-20 border border-border border-dashed">Lexical registry is currently empty.</p>}
                   </div>
                </div>
              </div>
           ) : activeTab === 'community' ? (
            <div className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-bg-page border border-border p-10">
                     <h2 className="text-2xl font-display font-black mb-10 flex items-center gap-4 text-text-primary uppercase tracking-tighter">
                        <MessageSquare size={24} className="text-accent" />
                        GLOBAL MESSAGES
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
                     Public Feedback
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
                                   className="mt-2 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-bg-page border border-red-500/20"
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
                    <h2 className="text-4xl font-display font-black text-text-primary tracking-tighter uppercase leading-none">SYSTEM STATS</h2>
                    <p className="text-[10px] text-text-secondary uppercase font-mono font-bold tracking-[0.3em] mt-3 opacity-40">PLATFORM PERFORMANCE OVERVIEW</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest">LIVE STATS</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
                  <div className="p-10 border-b lg:border-b-0 lg:border-r border-border hover:bg-surface transition-all group">
                     <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6 group-hover:translate-x-1 transition-transform">USER INTERACTIONS</p>
                     <p className="text-5xl font-display font-black text-text-primary tracking-tighter">{stats.totalSwipes}</p>
                     <p className="text-[9px] font-mono font-bold uppercase text-text-secondary mt-3 opacity-30">TOTAL INTERACTIONS RECORDED</p>
                  </div>
                  <div className="p-10 border-b md:border-b-0 md:border-r border-border hover:bg-surface transition-all group">
                     <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6 group-hover:translate-x-1 transition-transform">ARTICLE VIEWS</p>
                     <p className="text-5xl font-display font-black text-text-primary tracking-tighter">{stats.totalViews}</p>
                     <p className="text-[9px] font-mono font-bold uppercase text-text-secondary mt-3 opacity-30">TOTAL READ EVENTS</p>
                  </div>
                  <div className="p-10 border-b md:border-b-0 md:border-r border-border hover:bg-surface transition-all group">
                     <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6 group-hover:translate-x-1 transition-transform">ARCHIVE DEPTH</p>
                     <p className="text-5xl font-display font-black text-text-primary tracking-tighter">{stats.totalBlogs}</p>
                     <p className="text-[9px] font-mono font-bold uppercase text-text-secondary mt-3 opacity-30">LIFETIME_OPINION_COUNT</p>
                  </div>
                  <div className="p-10 hover:bg-surface transition-all group">
                     <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6 group-hover:translate-x-1 transition-transform">SUBSCRIBERS</p>
                     <p className="text-5xl font-display font-black text-text-primary tracking-tighter">{stats.totalSubscribers}</p>
                     <p className="text-[9px] font-mono font-bold uppercase text-text-secondary mt-3 opacity-30">SUBSCRIBER_INDEX_COUNT</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-x border-b border-border">
                  <div className="p-12 border-b md:border-b-0 md:border-r border-border hover:bg-surface transition-all">
                     <p className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6">SATISFACTION RATING</p>
                     <div className="flex items-baseline gap-3">
                        <p className="text-7xl font-display font-black text-text-primary tracking-tighter leading-none">{stats.avgRating.toFixed(1)}</p>
                        <span className="text-2xl font-mono text-accent font-bold opacity-40">/5.0</span>
                     </div>
                     <p className="text-[10px] font-mono font-bold uppercase text-text-secondary mt-4 tracking-widest opacity-30">USER SATISFACTION INDEX</p>
                  </div>
                  <div className="p-12 hover:bg-surface transition-all">
                     <p className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-6">AUDIENCE GROWTH</p>
                     <p className="text-7xl font-display font-black text-text-primary tracking-tighter leading-none">{stats.totalSubscribers}</p>
                     <p className="text-[10px] font-mono font-bold uppercase text-text-secondary mt-4 tracking-widest opacity-30">NETWORK_NODES_ACTIVE</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-10">
                     {/* Search and List logic... */}
                     <div className="flex flex-col md:flex-row items-center gap-6 mt-24 mb-10 border-l-4 border-accent pl-6 bg-surface p-4 border border-border">
                        <h3 id="analysis-viewport" className="text-2xl font-display font-black text-text-primary uppercase tracking-tighter flex-shrink-0">
                           Performance_Deep_Audit
                        </h3>
                        <div className="relative flex-grow max-w-md">
                           <SearchIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                           <input 
                              type="text" 
                              placeholder="FILTER_AUDIT_LOG..."
                              value={auditSearch}
                              onChange={(e) => setAuditSearch(e.target.value)}
                              className="w-full bg-bg-page border border-border p-3 pl-10 text-[10px] font-mono font-bold uppercase tracking-widest outline-none focus:border-accent"
                           />
                        </div>
                        <div className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-widest opacity-40">
                           {blogs.filter(b => b.title.toLowerCase().includes(auditSearch.toLowerCase())).length} IN_VIEW
                        </div>
                     </div>
                  </div>

                  <aside className="space-y-10">
                     <div className="bg-bg-page border border-border p-10 group hover:border-accent transition-all">
                        <div className="flex justify-between items-center mb-10 border-b border-border pb-6">
                           <h3 className="text-[11px] font-mono font-bold uppercase tracking-[0.4em] text-text-secondary">LATEST_SURVEY_INTEL</h3>
                           <BarChart3 size={18} className="text-accent" />
                        </div>
                        {allPolls.length > 0 ? (
                           <div className="space-y-6">
                              <p className="text-lg font-display font-black uppercase tracking-tight leading-tight">{allPolls[0].question}</p>
                              <div className="space-y-3">
                                 {allPolls[0].options.map((opt: string) => {
                                    const perc = allPolls[0].totalVotes > 0 ? Math.round((allPolls[0].results[opt] / allPolls[0].totalVotes) * 100) : 0;
                                    return (
                                       <div key={opt} className="space-y-1">
                                          <div className="flex justify-between text-[8px] font-mono font-bold uppercase">
                                             <span>{opt}</span>
                                             <span>{perc}%</span>
                                          </div>
                                          <div className="h-0.5 bg-surface relative">
                                             <div className="absolute top-0 left-0 h-full bg-accent" style={{ width: `${perc}%` }} />
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                              <div className="pt-4 flex justify-between items-center text-[8px] font-mono font-bold uppercase text-text-secondary">
                                 <span>TOTAL_RESPONSES: {allPolls[0].totalVotes}</span>
                                 <span className="text-accent">{allPolls[0].status}</span>
                              </div>
                           </div>
                        ) : (
                           <p className="text-[10px] font-mono text-text-secondary uppercase">NO_INTEL_RECORDS_FOUND</p>
                        )}
                     </div>
                  </aside>
               </div>
               <div className="border border-border bg-surface">
                  {blogs.filter(b => b.title.toLowerCase().includes(auditSearch.toLowerCase())).map(b => (
                    <div key={b.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-10 border-b border-border last:border-0 hover:bg-bg-page transition-all group">
                       <div className="max-w-xl">
                          <p className="font-display font-bold text-lg text-text-primary uppercase tracking-tight group-hover:text-accent transition-colors mb-4">{b.title}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="text-[10px] font-mono font-bold text-text-secondary flex items-center gap-2 border border-border px-3 py-1.5 bg-bg-page/50">
                              <Eye size={12} className="text-accent" /> {b.viewsCount || 0} <span className="uppercase font-sans">Reads</span>
                            </div>
                            <div className="text-[10px] font-mono font-bold text-text-secondary flex items-center gap-2 border border-border px-3 py-1.5 bg-bg-page/50">
                              <Star size={12} className="text-red-500" /> {b.likesCount || 0} <span className="uppercase font-sans">Likes</span>
                            </div>
                            <div className="text-[10px] font-mono font-bold text-text-secondary flex items-center gap-2 border border-border px-3 py-1.5 bg-bg-page/50">
                              <Shield size={12} className="text-yellow-600" /> {b.ratingAverage?.toFixed(1) || '0.0'} <span className="uppercase font-sans">Grade</span>
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
                            <h3 className="text-3xl font-display font-black text-text-primary uppercase tracking-tighter">Engagement Overview</h3>
                            <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest mt-1">SENTIMENT & INTERACTION DATA</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                               <h4 className="text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-3">
                                  <CheckCircle2 size={16} /> POSITIVE FEEDBACK
                               </h4>
                               <span className="text-xl font-display font-black text-accent">{selectedBlogAnalysis.highRatings.length}</span>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                               {selectedBlogAnalysis.highRatings.map((r: any, idx: number) => (
                                 <div key={r.id || `${r.userId}-${idx}`} className="flex items-center gap-5 p-5 bg-bg-page border border-border hover:border-accent transition-all">
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
                                  <ShieldAlert size={16} /> CRITICAL SIGNALS
                               </h4>
                               <span className="text-xl font-display font-black text-red-500">{selectedBlogAnalysis.lowRatings.length}</span>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                               {selectedBlogAnalysis.lowRatings.map((r: any, idx: number) => (
                                 <div key={r.id || `${r.userId}-${idx}`} className="flex items-center gap-5 p-5 bg-bg-page border border-border hover:border-red-500/30 transition-all">
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
                    <p className="text-text-secondary text-[10px] font-mono font-bold uppercase tracking-widest mb-3">READER_STREAMS</p>
                    <p className="text-5xl font-display font-black text-text-primary tracking-tighter leading-none">{stats.totalViews}</p>
                 </div>
                 
                 <div className="pt-2">
                    <p className="text-text-secondary text-[10px] font-mono font-bold uppercase tracking-widest mb-6">CLASSIFICATION_BREAKDOWN</p>
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
                    <span className="text-text-secondary text-[10px] font-mono font-bold uppercase tracking-widest">OPINION_ARCHIVES</span>
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
                 {blogs.filter(b => b.title.toLowerCase().includes(archiveSearch.toLowerCase())).map((b) => (
                    <div key={b.id} className="group border-b border-border pb-6 last:border-0 last:pb-0">
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
                            className="p-2 border border-border text-red-500 hover:bg-red-500 hover:text-bg-page transition-all opacity-0 group-hover:opacity-100"
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
