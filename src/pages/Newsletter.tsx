import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import NewsletterBox from '../components/NewsletterBox';
import { Mail, Globe, TrendingUp, Landmark, Zap, Newspaper, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface NewsItem {
  title: string;
  source: string;
  url: string;
  category: string;
}

export default function Newsletter() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    fetchDailyNews();
  }, []);

  const fetchDailyNews = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

      const prompt = `
        Fetch and summarize the top 5 most important news highlights for today (April 18, 2026).
        Focus on: Finance, Markets, Indian Politics, and Geopolitics.
        Provide the response as a valid JSON array of objects with keys: title, source, url, category.
        Do not include markdown code blocks. Just the raw JSON array.
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
      setNews(parsedNews);
    } catch (err) {
      console.error("News fetch error:", err);
    } finally {
      setLoadingNews(false);
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
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2">Today's Pulse</h2>
            <p className="text-text-secondary font-serif italic">Real-time headlines analyzed for the Morning Brief.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-text-secondary bg-surface px-4 py-2 rounded-full border border-border">
             <Calendar size={12} /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {loadingNews ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-secondary">
             <Loader2 size={32} className="animate-spin mb-4" />
             <p className="font-serif italic">Scanning global updates...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group p-6 bg-white border border-border rounded-xl hover:border-black transition-all flex items-start gap-6"
              >
                <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-text-primary flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                  <Newspaper size={20} />
                </div>
                <div className="flex-grow">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary bg-surface px-2 py-0.5 rounded border border-border">{item.category}</span>
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{item.source}</span>
                   </div>
                   <h3 className="text-lg font-serif font-bold group-hover:underline underline-offset-4 decoration-border mb-3 leading-snug">{item.title}</h3>
                   <a 
                     href={item.url} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                   >
                     Read full report <ExternalLink size={10} />
                   </a>
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
