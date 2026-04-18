import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, CheckCircle2, MapPin, Phone, Instagram, Facebook, Linkedin, ExternalLink } from 'lucide-react';
import { blogService } from '../lib/blogService';
import { cn } from '../lib/utils';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const socialLinks = [
    { icon: Linkedin, url: 'https://www.linkedin.com/in/kartik-rajauria-2a52b521a' },
    { icon: Instagram, url: 'https://www.instagram.com/kartikrajaur?igsh=ZTRrazZkdDNsenR2&utm_source=qr' },
    { icon: Facebook, url: 'https://www.facebook.com/share/1At38yUCBv/?mibextid=wwXIfr' },
    { icon: ExternalLink, url: 'https://kartik-portfolio-bwge.vercel.app/' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await blogService.sendMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
       setStatus('error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-8">Let's start a <span className="underline decoration-border decoration-4">conversation</span>.</h1>
          <p className="text-text-secondary text-lg mb-12 max-w-lg leading-relaxed font-serif">
            Have a different take on today's news? Want to suggest a topic? Or just want to say hi? I'm all ears.
          </p>

          <div className="space-y-8 mb-12">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center text-text-primary flex-shrink-0">
                <Mail size={22} />
              </div>
              <div className="font-serif">
                <h4 className="font-bold text-text-primary mb-1">Email directly</h4>
                <p className="text-text-secondary">catikrajauria@gmail.com</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center text-text-primary flex-shrink-0">
                <Linkedin size={22} />
              </div>
              <div className="font-serif">
                <h4 className="font-bold text-text-primary mb-1">Social Channels</h4>
                <div className="flex gap-4 mt-3">
                   {socialLinks.map((social, idx) => (
                     <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors">
                        <social.icon size={20} />
                     </a>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-8 md:p-12 border border-border shadow-sm"
        >
          {status === 'success' ? (
            <div className="text-center py-12">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 size={40} />
               </div>
               <h2 className="text-2xl font-display font-bold mb-4">Message Sent!</h2>
               <p className="text-gray-500 mb-8">Thanks for reaching out. I'll get back to you as soon as I can.</p>
               <button 
                 onClick={() => setStatus('idle')}
                 className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
               >
                 Send another message
               </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">Message</label>
                <textarea 
                  required
                  rows={6}
                  placeholder="What's on your mind?"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              <button 
                disabled={status === 'loading'}
                className="btn-minimal-primary w-full py-5 text-lg"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
