import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Twitter, Linkedin, Heart, Instagram, Facebook, ExternalLink } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { icon: Linkedin, url: 'https://www.linkedin.com/in/kartik-rajauria-2a52b521a' },
    { icon: Instagram, url: 'https://www.instagram.com/kartikrajaur?igsh=ZTRrazZkdDNsenR2&utm_source=qr' },
    { icon: Facebook, url: 'https://www.facebook.com/share/1At38yUCBv/?mibextid=wwXIfr' },
    { icon: ExternalLink, url: 'https://kartik-portfolio-bwge.vercel.app/' },
  ];

  return (
    <footer className="bg-bg-page border-t border-accent/20 pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-8 group">
              <span className="font-display font-black text-3xl tracking-tighter uppercase group-hover:text-accent transition-colors">
                OPINIO<span className="text-accent underline">N</span>ATE.
              </span>
            </Link>
            <p className="text-text-secondary text-[14px] leading-relaxed mb-8 font-sans font-medium max-w-xs opacity-70">
              DAILY INSIGHTS ON CULTURE, TECHNOLOGY, AND SOCIETY.
            </p>
          </div>

          <div>
             <h4 className="text-[11px] uppercase tracking-[0.4em] font-black text-accent mb-8">INDEX_CORE</h4>
             <ul className="space-y-4">
               {[
                 { name: 'Home', path: '/' },
                 { name: 'Archive', path: '/archive' },
                 { name: 'Reading List', path: '/saved' },
                 { name: 'Newsletter', path: '/newsletter' }
               ].map((item) => (
                 <li key={item.name}>
                   <Link to={item.path} className="group flex items-center text-[12px] font-mono font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-all">
                     <span className="w-0 group-hover:w-4 h-[1px] bg-accent transition-all duration-300 mr-0 group-hover:mr-3"></span>
                     {item.name}
                   </Link>
                 </li>
               ))}
             </ul>
          </div>

          <div>
             <h4 className="text-[11px] uppercase tracking-[0.4em] font-black text-accent mb-8">SYSTEM_SPECS</h4>
              <ul className="space-y-4">
               {[
                 { name: 'Mission_Log', path: '/about' },
                 { name: 'Contact_Port', path: '/contact' }
               ].map((item) => (
                 <li key={item.name}>
                   <Link to={item.path} className="group flex items-center text-[12px] font-mono font-bold uppercase tracking-widest text-text-secondary hover:text-accent transition-all">
                     <span className="w-0 group-hover:w-4 h-[1px] bg-accent transition-all duration-300 mr-0 group-hover:mr-3"></span>
                     {item.name}
                   </Link>
                 </li>
               ))}
             </ul>
          </div>

          <div>
             <h4 className="text-[11px] uppercase tracking-[0.4em] font-black text-accent mb-8 text-right md:text-left">NETWORK_UPLINK</h4>
             <div className="flex flex-wrap justify-end md:justify-start gap-3">
                {socialLinks.map((social, idx) => (
                  <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="p-4 border border-border bg-surface text-text-secondary hover:text-accent hover:border-accent hover:scale-105 transition-all hover:glow-cyan">
                    <social.icon size={18} />
                  </a>
                ))}
             </div>
          </div>
          
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-10">
            <p className="text-text-primary">&copy; {new Date().getFullYear()} OPINIONATE_RESERVED.</p>
            <Link to="/disclaimer" className="hover:text-accent transition-colors">DISCLAIMER</Link>
            <Link to="/copyright" className="hover:text-accent transition-colors">FAIR_USE</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">PROTOCOL_TERMS</Link>
          </div>
          <div className="flex items-center gap-4 text-accent/40">
             <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
             <span>© 2026 Kartik Rajauria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
