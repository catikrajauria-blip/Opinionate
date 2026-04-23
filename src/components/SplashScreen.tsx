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
    // If swiped up more than 100px
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
          {/* Logo Section */}
          <div className="relative flex flex-col items-center px-6 w-full max-w-4xl">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full text-center"
            >
              <div className="text-[12vw] sm:text-[10vw] md:text-8xl lg:text-9xl font-serif font-black tracking-tighter text-text-primary relative z-10 leading-none break-all sm:break-normal">
                O<span className="text-accent underline decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8">P</span>INIO<span className="text-blue-500">N</span>ATE
              </div>
              
              {/* Decorative Funky Elements */}
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 0.95, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10 w-12 h-12 sm:w-20 sm:h-20 border-2 border-accent rounded-full opacity-20"
              />
              <motion.div
                animate={{ 
                  x: [0, 10, -10, 0],
                  y: [0, -10, 10, 0]
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -bottom-8 -left-12 w-16 h-16 bg-blue-500/10 rounded-xl blur-xl"
              />
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-8 text-xs md:text-sm font-bold uppercase tracking-[0.5em] text-text-secondary flex items-center gap-3"
            >
              Stay <span className="text-accent">Opiniated</span> <Sparkles size={14} className="text-accent animate-pulse" />
            </motion.p>
          </div>

          {/* Swipe Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-12 flex flex-col items-center gap-4 cursor-grab active:cursor-grabbing"
          >
            <motion.div
              drag="y"
              dragConstraints={{ top: -200, bottom: 0 }}
              dragElastic={0.2}
              dragControls={dragControls}
              onDragEnd={handleDragEnd}
              onClick={enterApp}
              whileDrag={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 md:w-20 md:h-20 bg-surface border-2 border-border rounded-full flex items-center justify-center shadow-xl hover:border-accent transition-colors"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-accent"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              </motion.div>
            </motion.div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary animate-pulse">
              Swipe up to Enter
            </p>
          </motion.div>
          
          {/* Background Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
            <div className="w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
