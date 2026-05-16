import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroSplashProps {
  onComplete: () => void;
}

export default function IntroSplash({ onComplete }: IntroSplashProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Extended timings for 12-second total duration
    const timer1 = setTimeout(() => setStep(1), 3000);   // Show brand after 3s
    const timer2 = setTimeout(() => setStep(2), 9000);   // Show enter after 9s (brand shows for 6s)
    const timer3 = setTimeout(() => onComplete(), 13000); // Complete after 13s

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(15px)' }}
      transition={{ duration: 1.2, ease: "circIn" }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Dynamic Gold Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.15)_0%,transparent_60%)] animate-pulse" />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
         
         {/* Gold Dust Particles */}
         <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, "-100%"],
                  opacity: [0, 0.4, 0]
                }}
                transition={{ 
                  duration: Math.random() * 5 + 5, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: Math.random() * 5
                }}
                className="absolute w-1 h-1 bg-accent rounded-full blur-[1px]"
              />
            ))}
         </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-[1px] bg-accent/20 overflow-hidden rounded-full mb-6">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full bg-accent"
              />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.8em] text-accent/60 font-bold">Establishing_Link</span>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="brand"
            className="flex flex-col items-center px-4"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-[1px] bg-accent/30 w-40 mb-12"
            />
            <motion.h1
              initial={{ scale: 0.95, opacity: 0, letterSpacing: "0.5em" }}
              animate={{ scale: 1, opacity: 1, letterSpacing: "0.1em" }}
              transition={{ duration: 2.5, ease: "circOut" }}
              className="font-display font-black text-3xl sm:text-5xl md:text-8xl uppercase text-white mb-6 italic text-center drop-shadow-[0_0_30px_rgba(251,191,36,0.3)] px-2"
            >
              OPINIONATE
            </motion.h1>
            <motion.div
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               transition={{ delay: 0.8, duration: 1.2, ease: "circIn" }}
               className="h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent max-w-lg w-full"
            />
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3, duration: 1.5 }}
              className="mt-8 font-mono text-[9px] md:text-sm uppercase tracking-[1em] text-accent/80 font-black text-center"
            >
              CRAFTING PERSPECTIVE
            </motion.p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="enter"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-4 px-16 py-8 glass rounded-2xl border-accent/20 shadow-[0_0_50px_rgba(251,191,36,0.1)]">
              <div className="w-3 h-3 rounded-full bg-accent animate-ping" />
              <span className="font-display font-black text-3xl uppercase tracking-[0.2em] text-white italic">Proceeding...</span>
            </div>
            <span className="font-mono text-[9px] text-accent/40 uppercase tracking-[0.4em]">Ready for Access</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
