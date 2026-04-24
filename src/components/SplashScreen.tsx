import React, { useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { statsService } from '../lib/statsService';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [swiped, setSwiped] = useState(false);
  const dragControls = useDragControls();

  const handleDragEnd = async (_: any, info: any) => {
    if (info.offset.y < -100) {
      await enterApp();
    }
  };

  const enterApp = async () => {
    setSwiped(true);
    await statsService.incrementSwipes();
    setTimeout(onEnter, 800);
  };

  return (
    <AnimatePresence>
      {!swiped && (
        <motion.div
          className="fixed inset-0 z-[1000] bg-bg-page flex flex-col items-center justify-center overflow-hidden select-none touch-none"
          exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
        >
          {/* Vibrant Glow Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          {/* Logo Section */}
          <div className="relative flex flex-col items-center px-6 w-full max-w-5xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full text-center"
            >
              <div className="text-[14vw] sm:text-[12vw] md:text-8xl lg:text-[12rem] font-display font-black tracking-tighter text-text-primary relative z-10 leading-[0.85] uppercase drop-shadow-2xl">
                Opinio<span className="text-accent italic">n</span>ate
              </div>
              
              {/* Refined Orbital Containers */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square border-2 border-border/30 rounded-full pointer-events-none"
              >
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full shadow-[0_0_15px_rgba(255,77,0,0.8)]" />
              </motion.div>
              
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] aspect-square border border-border/10 rounded-full pointer-events-none"
              >
                <div className="absolute bottom-1/2 right-0 translate-x-1/2 translate-y-1/2 w-2 h-2 bg-text-secondary rounded-full" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-16 flex flex-col items-center gap-6"
            >
              <div className="h-px w-24 bg-accent/40" />
              <p className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.8em] text-text-secondary">
                THE MODERN <span className="text-accent underline decoration-2 underline-offset-4">EDITORIAL</span> &bull; 2026
              </p>
            </motion.div>
          </div>

          {/* New Interactive Swipe Control */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="absolute bottom-16 flex flex-col items-center gap-6"
          >
            <motion.div
              drag="y"
              dragConstraints={{ top: -250, bottom: 0 }}
              dragElastic={0.1}
              dragControls={dragControls}
              onDragEnd={handleDragEnd}
              onClick={enterApp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-accent blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
              <div className="relative w-16 h-16 md:w-20 md:h-20 bg-background/50 backdrop-blur-xl border-2 border-border/80 rounded-full flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-accent transition-all duration-500">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-text-primary group-hover:text-accent transition-colors"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                </motion.div>
                
                {/* Internal animated ring */}
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="absolute inset-0 border border-accent rounded-full pointer-events-none"
                />
              </div>
            </motion.div>
            
            <motion.p 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-text-secondary"
            >
              Pull up to unveil
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
