import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Settings, LogIn, AlertTriangle, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    <div className="max-w-md mx-auto py-32 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface/30 backdrop-blur-xl p-10 md:p-14 border border-border relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/5 blur-3xl rounded-full group-hover:bg-accent/10 transition-colors" />
        
        <div className="w-24 h-24 bg-accent/5 text-accent border border-accent/20 flex items-center justify-center mx-auto mb-10 glow-cyan/10 relative">
           <LogIn size={48} className="animate-pulse" />
           <div className="absolute -top-1 -left-1 w-2 h-2 bg-accent" />
           <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-accent" />
        </div>
        
        <h1 className="text-4xl font-display font-black mb-4 text-text-primary uppercase tracking-tighter">Initialize_Auth</h1>
        <p className="text-text-secondary mb-10 font-mono font-bold leading-relaxed text-[11px] uppercase tracking-widest opacity-60">
          UPLINK REQUIRED TO ACCESS CORE MODULES, RATE ANALYTICS, AND PARTICIPATE IN SYNCHRONOUS POLLS.
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
                <p className="mb-1">SYSTEM_ERROR_CODE_0xEX</p>
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
               PROCESSING_HANDSHAKE...
            </span>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
              IDENTIFY_VIA_GOOGLE
            </>
          )}
        </button>

        <div className="mt-10 flex items-center justify-center gap-3 opacity-30">
          <div className="h-[1px] flex-1 bg-border" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.5em]">SECURE_UPLINK</span>
          <div className="h-[1px] flex-1 bg-border" />
        </div>

        <p className="mt-8 text-[9px] text-text-secondary font-mono font-bold uppercase tracking-[0.3em] leading-relaxed opacity-40">
          BY PROCEEDING, YOU AGREE TO PROTOCOL GUIDELINES AND DATA ENCRYPTION STANDARDS.
        </p>
      </motion.div>
    </div>
  );
}
