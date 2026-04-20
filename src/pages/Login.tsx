import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Settings, LogIn, AlertTriangle } from 'lucide-react';
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
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  if (profile?.isBlocked) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-red-900 mb-4">Account Blocked</h2>
          <p className="text-red-700 font-serif leading-relaxed">
            Your account has been blocked by the administrator. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface p-8 md:p-12 rounded-[2.5rem] border border-border shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent/20">
           <LogIn size={40} />
        </div>
        
        <h1 className="text-3xl font-display font-bold mb-4 text-text-primary">Welcome Back</h1>
        <p className="text-text-secondary mb-8 font-serif leading-relaxed">
          Sign in to save opinions, like your favorite posts, and join the conversation.
          <br/>
          <span className="text-[10px] text-text-secondary opacity-60 uppercase font-bold tracking-widest mt-2 block">
            Session active for 7 days
          </span>
        </p>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold mb-6 border border-red-100 dark:border-red-900/30 text-left"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full py-4 bg-text-primary text-bg-page rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-black/5 active:scale-95 disabled:opacity-50"
        >
          {signingIn ? (
            <span className="flex items-center gap-2">
               <div className="w-4 h-4 border-2 border-bg-page border-t-transparent rounded-full animate-spin" />
               Connecting...
            </span>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
              Sign in with Google
            </>
          )}
        </button>

        <p className="mt-8 text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-relaxed">
          By signing in, you agree to our community guidelines.
        </p>
      </motion.div>
    </div>
  );
}
