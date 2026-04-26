import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none">Disclaimer</h1>
            <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.4em] mt-2">LEGAL_NOTICE_01</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none font-display text-lg leading-relaxed text-text-secondary">
          <p className="font-bold text-text-primary text-xl mb-8 border-l-4 border-accent pl-6 py-2 italic uppercase tracking-tight">
            The information provided on this website is for informational and educational purposes only. This website publishes summaries, opinions, and commentary based on publicly available news articles from third-party sources.
          </p>

          <div className="space-y-8 uppercase font-bold text-sm tracking-tight">
            <section className="bg-surface p-8 border border-border">
              <h2 className="text-text-primary mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent" /> OWNERSHIP
              </h2>
              <p>We do not claim ownership of any third-party news content, images, or trademarks referenced on this website. All copyrights belong to their respective owners.</p>
            </section>

            <section className="bg-surface p-8 border border-border">
              <h2 className="text-text-primary mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent" /> SOURCES
              </h2>
              <p>We only provide brief summaries along with hyperlinks directing users to the original source for full content. Users are encouraged to visit the original publisher's website for complete and accurate information.</p>
            </section>

            <section className="bg-accent/10 p-8 border border-accent/20">
              <h2 className="text-accent mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent animate-pulse" /> CONTENT REMOVAL
              </h2>
              <p className="text-text-primary">If you are the copyright owner of any content referenced here and believe your rights have been violated, please contact us and we will promptly review and remove the content if necessary.</p>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
