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
    <div className={cn(
      "w-full",
      variant === 'dark' ? "text-bg-page" : "text-text-primary"
    )}>
      <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
        <input 
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'success'}
          className={cn(
            "w-full px-4 py-3 rounded-lg outline-none border transition-all text-[13px] font-medium",
            variant === 'dark' 
              ? "bg-text-primary/10 border-text-primary/20 text-text-primary placeholder:text-text-secondary focus:bg-text-primary/20"
              : "bg-surface border-border focus:border-text-primary text-text-primary"
          )}
        />
        <button 
          disabled={status === 'loading' || status === 'success'}
          className={cn(
            "w-full px-4 py-3 rounded-lg font-bold text-[13px] transition-all flex items-center justify-center gap-2",
            variant === 'dark'
              ? "bg-text-primary text-bg-page hover:opacity-90"
              : "bg-text-primary text-bg-page hover:opacity-90"
          )}
        >
          {status === 'loading' ? 'Joining...' : 'Subscribe Now'}
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
