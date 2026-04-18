import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import NewsletterBox from '../components/NewsletterBox';
import { Mail, Globe, TrendingUp, Landmark, Zap, Newspaper, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

interface NewsItem {
  title: string;
  source: string;
  url: string;
  category: string;
  summary: string;
}

const CATEGORIES = [
  { id: 'finance', name: 'Finance & Markets', icon: <TrendingUp size={14} /> },
  { id: 'politics', name: 'Indian Politics', icon: <Landmark size={14} /> },
  { id: 'geopolitics', name: 'Geopolitics', icon: <Globe size={14} /> },
  { id: 'tech', name: 'Industry & Tech', icon: <Zap size={14} /> }
];

export default function Newsletter() {
  const [news, setNews] = useState<Record<string, NewsItem[]>>({});
  const [activeCategory, setActiveCategory] = useState('finance');
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!news[activeCategory]) {
      fetchCategoryNews(activeCategory);
    }
  }, [activeCategory]);

  const fetchCategoryNews = async (categoryId: string) => {
    setLoadingCategory(categoryId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const categoryName = CATEGORIES.find(c => c.id === categoryId)?.name;

      const prompt = `
        Fetch the top 5 most important current news highlights for the category: "${categoryName}".
        Target premium sources like BBC, TimesNow, Mint, Financial Express, Financial Times, and Economic Times.
        For each news item, provide:
        1. A concise headline.
        2. The primary source name.
        3. A brief 2-sentence analytical summary.
        4. The actual direct URL to the full news report.
        
        Return the result as a strict JSON array of objects with keys: title, source, summary, url, category.
        The category field should always be "${categoryId}".
        Do not include markdown code blocks.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text;
      const parsedNews = JSON.parse(text);
      setNews(prev => ({ ...prev, [categoryId]: parsedNews }));
    } catch (err) {
      console.error(`Error fetching ${categoryId} news:`, err);
    } finally {
      setLoadingCategory(null);
    }
  };

  const benefits = [
    {
      icon: <TrendingUp size={24} className="text-text-primary" />,
      title: "Finance & Markets",
      description: "Analysis of market volatility and financial industry disruptions."
    },
    {
      icon: <Globe size={24} className="text-text-primary" />,
      title: "Geopolitics",
      description: "Deep-dives into international relations and global diplomacy."
    },
    {
      icon: <Landmark size={24} className="text-text-primary" />,
      title: "Indian Politics",
      description: "Critical inquiry into domestic policy and political maneuvers."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-accent rounded-3xl p-10 md:p-20 text-center relative overflow-hidden text-white mb-20 shadow-2xl"
      >
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Mail size={32} className="text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight">The Morning Brief</h1>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto font-serif leading-relaxed italic">
            "One high-quality opinion delivered to your inbox every morning. Finance, Industry, and Global Politics deciphered."
          </p>

          <div className="max-w-md mx-auto">
            <NewsletterBox variant="dark" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {benefits.map((benefit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 bg-surface rounded-xl border border-border"
          >
            <div className="mb-6">
              {benefit.icon}
            </div>
            <h3 className="text-lg font-serif font-bold mb-3">{benefit.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed font-serif">{benefit.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-text-secondary bg-surface px-4 py-2 rounded-full border border-border mb-4">
               <Calendar size={12} /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <h2 className="text-3xl font-serif font-bold mb-2">Today's Pulse</h2>
            <p className="text-text-secondary font-serif italic max-w-sm">Deep headlines from premium sources analyzed for you.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all border",
                  activeCategory === cat.id 
                    ? "bg-black text-white border-black" 
                    : "bg-white text-text-secondary border-border hover:border-black"
                )}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loadingCategory === activeCategory ? (
          <div className="py-24 flex flex-col items-center justify-center text-text-secondary bg-surface rounded-xl border border-border">
             <Loader2 size={32} className="animate-spin mb-4" />
             <p className="font-serif italic text-sm">Aggregating insights from global sources...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(news[activeCategory] || []).map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-8 bg-white border border-border rounded-xl hover:border-black transition-all"
              >
                <div className="flex items-start gap-8">
                  <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center text-text-primary flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                    <Newspaper size={24} />
                  </div>
                  <div className="flex-grow">
                     <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary px-2 py-0.5 border border-border rounded">{item.source}</span>
                     </div>
                     <h3 className="text-xl font-serif font-bold mb-3 leading-snug">{item.title}</h3>
                     <p className="text-text-secondary text-[14px] leading-relaxed font-serif mb-6 group-hover:text-text-primary transition-colors">
                        {item.summary}
                     </p>
                     <a 
                       href={item.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-primary border-b border-black pb-0.5 hover:gap-4 transition-all"
                     >
                       Explore primary source <ExternalLink size={10} />
                     </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="p-12 bg-white border border-border rounded-xl text-center">
         <Zap size={32} className="mx-auto mb-6 text-text-primary" />
         <h2 className="text-2xl font-serif font-bold mb-4">Industry & Tech Focus</h2>
         <p className="text-text-secondary max-w-xl mx-auto font-serif">
           Subscribers also receive tactical updates on emerging technologies and industry-specific shifts that don't always make the front page.
         </p>
      </div>
    </div>
  );
}
