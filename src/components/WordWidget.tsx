import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, Quote } from 'lucide-react';
import { wordService , WordOfTheDay } from '../lib/wordService';

export default function WordWidget() {
  const [word, setWord] = useState<WordOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWord() {
      try {
        const latest = await wordService.getLatestWord();
        setWord(latest);
      } catch (err) {
        console.error('Error loading word of the day:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWord();
  }, []);

  if (loading || !word) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-surface border border-border p-8 rounded-3xl relative overflow-hidden group hover:border-accent/40 transition-all duration-500"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        <Book size={80} className="text-accent" />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent">Word of the Day</span>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h3 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter text-text-primary mb-4 italic group-hover:text-accent transition-colors">
          {word.word}
        </h3>
        <p className="text-xs font-medium text-text-secondary leading-relaxed mb-6 uppercase tracking-[0.2em] opacity-80 max-w-xs">
          {word.definition}
        </p>

        {word.usage && (
          <div className="mt-4 pt-6 border-t border-border/50 w-full">
            <div className="flex justify-center gap-3">
              <Quote size={14} className="text-accent shrink-0 opacity-40" />
              <p className="text-[10px] font-mono italic text-text-muted leading-relaxed uppercase tracking-tight max-w-xs">
                {word.usage}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-between items-center text-[8px] font-mono font-bold text-text-muted uppercase tracking-[0.4em]">
        <span>VOCAB_DATA: {word.id?.slice(0, 8)}</span>
        <span>{new Date(word.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </motion.div>
  );
}
