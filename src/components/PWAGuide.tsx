import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PWAGuide() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect if device is iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);
    
    // Detect if app is already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (navigator as any).standalone 
      || document.referrer.includes('android-app://');

    // Check if the user has already dismissed the prompt in this session
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');

    const toggleGuide = () => setShowPrompt(prev => !prev);
    window.addEventListener('toggle-pwa-guide', toggleGuide);

    // Handle Android/Chrome Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (ios && !isStandalone && !isDismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('toggle-pwa-guide', toggleGuide);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[200] lg:hidden"
        >
          <div className="glass-vibrant p-5 border border-white/20 shadow-2xl rounded-3xl relative overflow-hidden">
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-text-secondary hover:text-text-primary"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-bg-page animate-pulse">
                  {isIOS ? <PlusSquare size={24} /> : <Download size={24} />}
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-text-primary">Install Opinionate</h3>
                  <p className="text-[10px] font-mono text-text-secondary opacity-70">
                    {isIOS ? 'ADD TO HOME SCREEN FOR FULL ACCESS' : 'GET THE APP FOR A BETTER EXPERIENCE'}
                  </p>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">1</div>
                    <p className="text-xs text-text-secondary flex items-center gap-2">
                      Tap the <Share size={16} className="text-accent" /> button below
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">2</div>
                    <p className="text-xs text-text-secondary flex items-center gap-2">
                      Select <span className="font-bold text-text-primary">'Add to Home Screen'</span>
                    </p>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleInstallClick}
                  className="w-full bg-accent text-bg-page font-display font-black uppercase tracking-widest py-3 rounded-2xl hover:brightness-110 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Download size={18} />
                  Install Now
                </button>
              )}
            </div>
            
            {/* Subtle progress indicator */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-accent via-accent-vibrant to-accent-pink w-full opacity-30" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
