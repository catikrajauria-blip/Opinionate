import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Twitter, Linkedin, Heart, Instagram, Facebook, ExternalLink, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

export default function Footer() {
  const { isAdmin } = useAuth();
  const socialLinks = [
    { icon: Linkedin, url: 'https://www.linkedin.com/in/kartik-rajauria-2a52b521a' },
    { icon: Instagram, url: 'https://www.instagram.com/kartikrajaur?igsh=ZTRrazZkdDNsenR2&utm_source=qr' },
    { icon: Facebook, url: 'https://www.facebook.com/share/1At38yUCBv/?mibextid=wwXIfr' },
    { icon: ExternalLink, url: 'https://kartik-portfolio-bwge.vercel.app/' },
  ];

  return (
    <footer className="bg-bg-page border-t border-border pt-32 pb-12 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-4">
            <Link to="/" className="inline-block mb-10 group">
              <Logo withText size={32} />
            </Link>
            <p className="text-text-secondary text-lg leading-relaxed font-display font-medium max-w-sm">
              Analyzing the intersection of culture, technology, and global policy through a critical lens.
            </p>
          </div>

          <div className="md:col-span-2">
             <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-accent mb-10">Navigation</h4>
             <ul className="space-y-5">
               {[
                 { name: 'Daily Blog', path: '/' },
                 { name: 'Archive', path: '/archive' },
                 { name: 'Indian Policy', path: '/indian-policy' },
                 { name: 'Daily News', path: '/news' }
               ].map((item) => (
                 <li key={item.name}>
                   <Link to={item.path} className="group flex items-center text-[11px] font-display font-black uppercase tracking-widest text-text-secondary hover:text-accent transition-all">
                     <span className="w-0 group-hover:w-4 h-[1px] bg-accent transition-all duration-300 mr-0 group-hover:mr-3"></span>
                     {item.name}
                   </Link>
                 </li>
               ))}
             </ul>
          </div>

          <div className="md:col-span-2">
             <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-accent mb-10">Company</h4>
              <ul className="space-y-5">
               {[
                 { name: 'Identity', path: '/about' },
                 { name: 'Communications', path: '/contact' }
               ].map((item) => (
                 <li key={item.name}>
                   <Link to={item.path} className="group flex items-center text-[11px] font-display font-black uppercase tracking-widest text-text-secondary hover:text-accent transition-all">
                     <span className="w-0 group-hover:w-4 h-[1px] bg-accent transition-all duration-300 mr-0 group-hover:mr-3"></span>
                     {item.name}
                   </Link>
                 </li>
               ))}
             </ul>
          </div>

          <div className="md:col-span-4 flex flex-col items-end md:items-start lg:items-end">
             <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-accent mb-10">Social</h4>
             <div className="flex flex-wrap gap-4 justify-end md:justify-start lg:justify-end">
                {socialLinks.map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent hover-scale transition-all"
                  >
                    <social.icon size={20} />
                  </a>
                ))}
             </div>
          </div>
          
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-10 text-[9px] font-mono font-bold uppercase tracking-[0.4em] text-text-secondary/50">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
            <p className="text-text-primary/60">&copy; {new Date().getFullYear()} OPINIONATE</p>
            <Link to="/disclaimer" className="hover:text-accent transition-colors">DISCLAIMER</Link>
            <Link to="/copyright" className="hover:text-accent transition-colors">COPYRIGHT</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">TERMS OF USE</Link>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-text-primary/40">Editor: Kartik Rajauria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
