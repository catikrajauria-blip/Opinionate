import React, { useEffect, useState } from 'react';
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
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    setIsDark(document.documentElement.classList.contains('dark'));

    return () => observer.disconnect();
  }, []);
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Animated Glow Backing */}
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse" />
        
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          <defs>
            <linearGradient id="logo-hyper-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="50%" stopColor="var(--color-accent-vibrant)" />
              <stop offset="100%" stopColor="var(--color-accent-pink)" />
            </linearGradient>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Different Logo Shapes per Theme */}
          {isDark ? (
            <>
              {/* Futuristic Hexagon Frame for Dark Mode */}
              <path 
                d="M20 4L34 12V28L20 36L6 28V12L20 4Z" 
                stroke="url(#logo-hyper-gradient)" 
                strokeWidth="3" 
                strokeLinejoin="round"
                fill="transparent"
                filter="url(#neon-glow)"
              />
              
              {/* Inner Core */}
              <rect 
                x="18" 
                y="12" 
                width="4" 
                height="16" 
                rx="2"
                fill="url(#logo-hyper-gradient)" 
              />
              
              {/* Data Pulse Lines */}
              <motion.rect 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 2 }}
                x="10" y="18" width="8" height="2" fill="url(#logo-hyper-gradient)" 
              />
              <motion.rect 
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                x="22" y="20" width="8" height="2" fill="url(#logo-hyper-gradient)" 
              />
            </>
          ) : (
            <>
              {/* Dynamic Circle/Orbit for Light Mode */}
              <circle 
                cx="20" cy="20" r="16" 
                stroke="url(#logo-hyper-gradient)" 
                strokeWidth="3"
                strokeDasharray="10 5"
                className="animate-spin-slow"
              />
              <circle 
                cx="20" cy="20" r="10" 
                fill="url(#logo-hyper-gradient)"
              />
              <motion.path 
                d="M20 5V10M20 30V35M5 20H10M30 20H35" 
                stroke="url(#logo-hyper-gradient)" 
                strokeWidth="2" 
                strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              />
            </>
          )}
        </svg>
      </motion.div>
      
      {withText && (
        <span className={cn(
          "font-display font-black tracking-tighter uppercase leading-none text-text-primary",
          textClassName || "text-2xl md:text-3xl"
        )}>
          OPINIO<span className="text-accent underline decoration-accent-vibrant/30 underline-offset-4">N</span>ATE
        </span>
      )}
    </div>
  );
}
