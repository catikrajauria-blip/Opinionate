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
    <footer className="bg-surface border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="font-serif font-extrabold text-xl tracking-tighter uppercase">
                OPINIONATE.
              </span>
            </Link>
            <p className="text-text-secondary text-[14px] leading-relaxed mb-8">
              Deciphering the noise with daily reflections on culture, tech, and the future of digital society.
            </p>
          </div>

          <div>
             <h4 className="text-[12px] uppercase tracking-widest font-bold text-text-primary mb-6">Explore</h4>
             <ul className="space-y-4">
               <li><Link to="/" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">Home</Link></li>
               <li><Link to="/archive" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">Archive</Link></li>
               <li><Link to="/saved" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">Reading List</Link></li>
               <li><Link to="/newsletter" className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">Newsletter</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="text-[12px] uppercase tracking-widest font-bold text-text-primary mb-6">Connect</h4>
             <div className="flex gap-4">
                {socialLinks.map((social, idx) => (
                  <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="p-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-black transition-all">
                    <social.icon size={16} />
                  </a>
                ))}
             </div>
          </div>
          
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-bold uppercase tracking-widest text-text-secondary">
          <p>&copy; {new Date().getFullYear()} OPINIONATE. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Built with precision.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
