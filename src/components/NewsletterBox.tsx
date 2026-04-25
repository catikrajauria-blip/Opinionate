import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { blogService } from '../lib/blogService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NewsletterBoxProps {
  variant?: 'light' | 'dark';
}

export default function NewsletterBox({ variant = 'light' }: NewsletterBoxProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;

    setStatus('loading');
    try {
      await blogService.subscribe(email);
      setStatus('success');
      setMessage("Subscribed successfully. You'll receive daily blogs.");
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full text-text-primary">
      <form onSubmit={handleSubscribe} className="space-y-4">
        <div className="relative group">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={16} className="text-accent opacity-50 group-focus-within:opacity-100 transition-opacity" />
           </div>
           <input 
              type="email"
              required
              placeholder="ENTER_EMAIL_FOR_SYNC..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'success'}
              className="w-full pl-12 pr-4 py-4 rounded-sm outline-none border border-border bg-surface focus:border-accent text-text-primary transition-all text-[13px] font-mono font-bold uppercase tracking-widest placeholder:text-text-secondary/40"
           />
        </div>
        <button 
          disabled={status === 'loading' || status === 'success'}
          className="w-full px-4 py-4 rounded-sm font-mono font-bold text-[12px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 hover:glow-cyan active:scale-95 bg-accent text-bg-page hover:bg-text-primary hover:text-bg-page"
        >
          {status === 'loading' ? 'INITIATING_SYNC...' : 'JOIN_THE_NETWORK'}
        </button>
      </form>
      
      <AnimatePresence>
        {status === 'success' && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-bold uppercase tracking-widest text-green-500 mt-3"
          >
            Successfully Subscribed!
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-bold uppercase tracking-widest text-red-500 mt-3"
          >
            Something went wrong.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
