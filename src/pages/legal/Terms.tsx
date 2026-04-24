import React from 'react';
import { motion } from 'motion/react';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none">Terms of Use</h1>
            <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.4em] mt-2">LEGAL_NOTICE_03</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none font-display text-lg leading-relaxed text-text-secondary">
          <p className="font-bold text-text-primary text-xl mb-8 border-l-4 border-accent pl-6 py-2 italic uppercase tracking-tight">
            By using this website, you agree to the conditions outlined in this protocol. These terms govern your access to and use of our editorial platform.
          </p>

          <div className="space-y-8 uppercase font-bold text-sm tracking-tight">
            <section className="bg-surface p-8 border border-border">
              <h2 className="text-text-primary mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent" /> USER_AGREEMENT
              </h2>
              <ul className="list-none space-y-3">
                <li className="flex items-center gap-3"><span className="w-1 h-px bg-border group-hover:bg-accent" /> Content published is for informational and opinion purposes only</li>
                <li className="flex items-center gap-3"><span className="w-1 h-px bg-border group-hover:bg-accent" /> We summarize news in our own words</li>
                <li className="flex items-center gap-3"><span className="w-1 h-px bg-border group-hover:bg-accent" /> We provide credit and links to original sources</li>
                <li className="flex items-center gap-3"><span className="w-1 h-px bg-border group-hover:bg-accent" /> We do not host full copyrighted articles</li>
                <li className="flex items-center gap-3"><span className="w-1 h-px bg-border group-hover:bg-accent" /> External links belong to third parties</li>
                <li className="flex items-center gap-3"><span className="w-1 h-px bg-border group-hover:bg-accent" /> We may modify or remove content at any time</li>
              </ul>
            </section>

            <section className="bg-accent/10 p-8 border border-accent/20">
              <h2 className="text-accent mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent animate-pulse" /> DISCONTINUATION_NOTICE
              </h2>
              <p className="text-text-primary">If you do not agree with these terms, please discontinue use of the website immediately. Your continued use constitutes acceptance of these parameters.</p>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
