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
          <div className="bg-surface p-5 border border-border shadow-2xl rounded-3xl relative overflow-hidden">
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary z-20"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
                  {isIOS ? <PlusSquare size={24} /> : <Download size={24} />}
                </div>
                <div>
                  <h3 className="font-display font-black text-base uppercase tracking-tight text-text-primary">Install Opinionate</h3>
                  <p className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">
                    {isIOS ? 'LINK TO HOME SCREEN' : 'OPTIMIZED MOBILE APP'}
                  </p>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-4 bg-accent/5 p-5 rounded-2xl border border-accent/10">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-bg-page border border-border flex items-center justify-center text-[11px] font-black text-text-primary">1</div>
                    <p className="text-xs font-medium text-text-secondary flex items-center gap-2">
                      Tap the <Share size={18} className="text-accent" /> button below
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-bg-page border border-border flex items-center justify-center text-[11px] font-black text-text-primary">2</div>
                    <p className="text-xs font-medium text-text-secondary flex items-center gap-2">
                      Select <span className="font-black text-text-primary uppercase tracking-tight">'Add to Home Screen'</span>
                    </p>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleInstallClick}
                  className="btn-primary w-full py-4 text-xs"
                >
                  <Download size={18} />
                  INSTALL NOW
                </button>
              )}
            </div>
            
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-3xl -mr-8 -mt-8" />
            <div className="absolute bottom-0 left-0 h-1 bg-accent w-full opacity-20" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
