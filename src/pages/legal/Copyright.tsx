import React from 'react';
import { motion } from 'motion/react';
import { Copyright as CopyrightIcon } from 'lucide-react';

export default function Copyright() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <CopyrightIcon size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none">Copyright & Fair Use</h1>
            <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.4em] mt-2">LEGAL_NOTICE_02</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none font-display text-lg leading-relaxed text-text-secondary">
          <p className="font-bold text-text-primary text-xl mb-8 border-l-4 border-accent pl-6 py-2 italic uppercase tracking-tight">
            This website may reference news articles, headlines, and brief excerpts from third-party publications under "fair use" for purposes such as commentary, criticism, news reporting, and education.
          </p>

          <div className="space-y-8 uppercase font-bold text-sm tracking-tight">
            <section className="bg-surface p-8 border border-border">
              <h2 className="text-text-primary mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent" /> FAIR_USE_DOCTRINE
              </h2>
              <p>We do not reproduce full articles. Only short summaries written in our own words are published, along with links to the original content.</p>
            </section>

            <section className="bg-surface p-8 border border-border">
              <h2 className="text-text-primary mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent" /> TRADEMARK_RECOGNITION
              </h2>
              <p>All logos, names, and trademarks belong to their respective owners. Their use on this website is strictly for identification and reference purposes.</p>
            </section>

            <section className="bg-accent/10 p-8 border border-accent/20">
              <h2 className="text-accent mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent animate-pulse" /> MODIFICATION_RIGHTS
              </h2>
              <p className="text-text-primary">If any content owner requests removal or modification, we will take appropriate action within a reasonable timeframe.</p>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
