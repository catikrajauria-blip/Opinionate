import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Settings, LogIn, AlertTriangle, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../components/Logo';

export default function Login() {
  const { user, profile, signIn, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const location = useLocation();

  // Redirect if already logged in
  if (user && profile) {
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signIn();
    } catch (err: any) {
      console.error('Sign in error details:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Unauthorized Domain: You must add this Vercel URL to your Firebase Console under Authentication > Settings > Authorized Domains.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please finish the process in the popup window.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  if (profile?.isBlocked) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="bg-red-500/5 p-10 border border-red-500/20">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-red-500 mb-4">Account Blocked</h2>
          <p className="text-text-secondary font-display font-medium leading-relaxed">
            Your account has been blocked by the administrator. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-24 md:py-32 px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Column: Benefits Content */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col text-left space-y-8"
        >
          <div>
            <span className="text-xs font-mono font-black text-accent uppercase tracking-[0.3em] bg-accent/10 px-4 py-1.5 rounded-full inline-block mb-4">
              Premium Portal
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black text-text-primary uppercase tracking-tightest leading-none">
              Why Join <br className="hidden md:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-accent-indigo to-accent-magenta">Opinionate?</span>
            </h2>
            <p className="text-text-secondary mt-4 font-display font-medium leading-relaxed max-w-sm">
              Unlock the ultimate toolkit engineered for CAT/MBA aspirants, policy students, and competitive exam preparation.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-center shrink-0">
                <span className="text-accent font-mono font-black text-sm">01</span>
              </div>
              <div>
                <h3 className="font-display font-black text-text-primary uppercase tracking-tighter text-lg">Interactive Daily Polls</h3>
                <p className="text-text-secondary font-display font-medium text-xs mt-1 leading-relaxed">
                  Participate in live discussions. Vote on key socio-economic queries and analyze real-time responses.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-accent-indigo/5 border border-accent-indigo/20 flex items-center justify-center shrink-0">
                <span className="text-accent-indigo font-mono font-black text-sm">02</span>
              </div>
              <div>
                <h3 className="font-display font-black text-text-primary uppercase tracking-tighter text-lg">Curated Saved Library</h3>
                <p className="text-text-secondary font-display font-medium text-xs mt-1 leading-relaxed">
                  Bookmark high-priority policy briefs, word of the day posts, and daily news items to revise for interviews later.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-accent-magenta/5 border border-accent-magenta/20 flex items-center justify-center shrink-0">
                <span className="text-accent-magenta font-mono font-black text-sm">03</span>
              </div>
              <div>
                <h3 className="font-display font-black text-text-primary uppercase tracking-tighter text-lg">Article Commenting & Rating</h3>
                <p className="text-text-secondary font-display font-medium text-xs mt-1 leading-relaxed">
                  Rate articles based on analytical depth, and write comments to practice WAT essays and engage in healthy academic debate.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Sign In Container */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface/30 backdrop-blur-xl p-10 md:p-14 border border-border relative overflow-hidden group rounded-3xl"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/5 blur-3xl rounded-full group-hover:bg-accent/10 transition-colors" />
          
          <div className="flex justify-center mb-8">
            <Logo size={70} />
          </div>
          
          <h1 className="text-4xl font-display font-black mb-2 text-text-primary uppercase tracking-tighter">Login</h1>
          <p className="text-text-secondary mb-8 font-mono font-bold leading-relaxed text-[10px] uppercase tracking-widest opacity-60">
            CONNECT YOUR ACCOUNT TO ACCESS ALL PREMIUM INTERACTIVE ENGAGEMENTS.
          </p>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 text-red-500 p-5 border border-red-500/20 text-xs font-mono font-bold mb-8 text-left uppercase tracking-widest flex gap-3"
              >
                <AlertTriangle size={16} className="shrink-0" />
                <div>
                  <p className="mb-1">ERROR</p>
                  <p className="opacity-70 leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full py-5 bg-accent text-bg-page font-mono font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-4 hover:glow-cyan transition-all active:scale-95 disabled:opacity-50"
          >
            {signingIn ? (
              <span className="flex items-center gap-3">
                 <Cpu className="animate-spin" size={18} />
                 SIGNING IN...
              </span>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
                SIGN IN WITH GOOGLE
              </>
            )}
          </button>

          <div className="mt-8 flex items-center justify-center gap-3 opacity-30">
            <div className="h-[1px] flex-1 bg-border" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.5em]">SECURE ACCESS</span>
            <div className="h-[1px] flex-1 bg-border" />
          </div>

          <p className="mt-8 text-[9px] text-text-secondary font-mono font-bold uppercase tracking-[0.3em] leading-relaxed opacity-40">
            BY PROCEEDING, YOU AGREE TO OUR TERMS AND PRIVACY POLICY.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
