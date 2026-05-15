import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: number | string;
  withText?: boolean;
  textClassName?: string;
}

export default function Logo({ 
  className, 
  size = 32, 
  withText = false,
  textClassName
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Hexagon Frame */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full relative z-10"
        >
          <defs>
            <linearGradient id="opinionate-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-accent-violet)" />
            </linearGradient>
            
            <filter id="ultra-glow" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
               <feMerge>
                   <feMergeNode in="coloredBlur"/>
                   <feMergeNode in="SourceGraphic"/>
               </feMerge>
            </filter>
          </defs>
          
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "circOut" }}
            d="M50 5L90 28V72L50 95L10 72V28L50 5Z" 
            stroke="url(#opinionate-logo-grad)" 
            strokeWidth="3.5" 
            strokeLinejoin="round"
            filter="url(#ultra-glow)"
          />
          
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 2, ease: "circOut" }}
            d="M50 15L82 33V67L50 85L18 67V33L50 15Z" 
            stroke="var(--color-accent)" 
            strokeWidth="1" 
            className="opacity-40"
          />
          
          {/* Inner Node */}
          <motion.path 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.1, 0.4, 0.1], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            d="M50 35L63 42.5V57.5L50 65L37 57.5V42.5L50 35Z" 
            fill="var(--color-accent-violet)" 
          />
          
          <motion.circle 
            cx="50" cy="50" r="6" 
            className="fill-white"
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.8, 1, 0.8],
              filter: ['blur(0px)', 'blur(2px)', 'blur(0px)']
            }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
        </svg>

        {/* Subtle Glow */}
        <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full" />
      </motion.div>
      
      {withText && (
        <span className={cn(
          "font-display font-black tracking-[-0.05em] uppercase leading-none text-text-primary italic",
          textClassName || "text-xl md:text-2xl"
        )}>
          OPINIONATE<span className="text-accent">.</span>
        </span>
      )}
    </div>
  );
}
