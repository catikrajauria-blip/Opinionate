import React from 'react';
import { motion } from 'motion/react';
import { Mail, Github, Linkedin, Instagram, Facebook, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-12 md:gap-16 items-center md:items-start text-center md:text-left"
      >
        <div className="w-full md:w-1/3 md:sticky md:top-24 flex flex-col items-center">
          <div className="w-full max-w-[280px] md:max-w-none rounded-2xl overflow-hidden aspect-square border border-border mb-8 hover:scale-[1.02] transition-all duration-500 shadow-xl group">
            <img 
              src="https://picsum.photos/seed/kartik/600/600" 
              alt="Kartik Rajauria" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 w-full">
            <a href="https://www.linkedin.com/in/kartik-rajauria-2a52b521a" target="_blank" rel="noopener noreferrer" className="btn-minimal p-3"><Linkedin size={18} /></a>
            <a href="https://www.instagram.com/kartikrajaur?igsh=ZTRrazZkdDNsenR2&utm_source=qr" target="_blank" rel="noopener noreferrer" className="btn-minimal p-3"><Instagram size={18} /></a>
            <a href="https://kartik-portfolio-bwge.vercel.app/" target="_blank" rel="noopener noreferrer" className="btn-minimal p-3"><ExternalLink size={18} /></a>
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left">
          <div className="badge-minimal mb-6">Curated by Kartik Rajauria</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black mb-8 leading-tight text-text-primary px-4 md:px-0">Deciphering the noise, one daily opinion at a time.</h1>
          
          <div className="blog-content font-display text-base md:text-lg leading-relaxed text-text-secondary space-y-6 md:space-y-8 flex flex-col items-center md:items-start">
            <p className="font-bold text-text-primary text-center md:text-left">
              I'm Kartik Rajauria, a passionate observer of the global landscape, focusing on the intersections of technology, finance, and geopolitics.
            </p>
            <p className="text-center md:text-left">
              I started OPINIONATE as a platform for critical inquiry. In an era where information moves at the speed of an algorithm, I believe there is immense value in slowing down to analyze the "why" behind the headlines.
            </p>
            <p className="text-center md:text-left">
              My background encompasses a deep interest in software development and the digital economy. You can explore my full professional journey and technical projects on my <a href="https://kartik-portfolio-bwge.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-text-primary underline decoration-border hover:decoration-accent transition-all">personal portfolio</a>.
            </p>
            
            <div className="bg-surface border border-border p-6 md:p-8 rounded-2xl my-8 md:my-12 italic w-full text-center md:text-left">
               <h3 className="font-display font-black text-text-primary mb-3 text-center md:text-left">The Daily Mission</h3>
               <p className="text-text-secondary">
                 I focus on the core issues shaping our future: Finance, Market shifts, Industry disruptions, and the complex web of Indian and Geopolitical politics. One topic, every twenty-four hours, viewed through a critical lens.
               </p>
            </div>

            <p className="text-center md:text-left">
              Whether it's the volatility of the financial markets, the emergence of deep-tech industries, or the tactical moves in global diplomacy, I aim to provide a perspective that challenges the status quo. 
            </p>
            
            <h3 className="text-xl md:text-2xl font-display font-black text-text-primary pt-6 text-center md:text-left">Engage with the Ideas</h3>
            <p className="text-center md:text-left">
              This isn't just a monologue. I encourage you to read today's opinion, browse the archive, and share your own ratings or comments. Every perspective adds to the depth of the conversation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full justify-center md:justify-start">
               <Link to="/contact" className="btn-primary px-10 py-4 text-xs">
                  Contact Me
               </Link>
               <Link to="/archive" className="btn-secondary px-10 py-4 text-xs glass">
                  The Archive
               </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
