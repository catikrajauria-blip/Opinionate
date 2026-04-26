import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

export default function ExternalLinks() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <ExternalLink size={32} />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none">External Links Policy</h1>
            <p className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-[0.4em] mt-2">LEGAL_NOTICE_04</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none font-display text-lg leading-relaxed text-text-secondary">
          <p className="font-bold text-text-primary text-xl mb-8 border-l-4 border-accent pl-6 py-2 italic uppercase tracking-tight">
            Our website contains hyperlinks to external news websites. These links are provided for reference and convenience only.
          </p>

          <div className="space-y-8 uppercase font-bold text-sm tracking-tight">
            <section className="bg-surface p-8 border border-border">
              <h2 className="text-text-primary mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent" /> LIABILITY
              </h2>
              <p>We do not control, endorse, or take responsibility for the content, accuracy, or privacy practices of any third-party websites.</p>
            </section>

            <section className="bg-surface p-8 border border-border">
              <h2 className="text-text-primary mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent" /> EXTERNAL SITES
              </h2>
              <p>When users click on external links, they leave our website and are subject to the terms and policies of the respective third-party website.</p>
            </section>

            <section className="bg-accent/10 p-8 border border-accent/20">
              <h2 className="text-accent mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-accent animate-pulse" /> DISCLAIMER
              </h2>
              <p className="text-text-primary">We encourage users to review the terms and privacy policies of external websites before engaging with their content.</p>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
