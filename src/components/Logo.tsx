import React from 'react';
import { cn } from '../lib/utils';

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
    <div className={cn("flex items-center gap-3", className)}>
      <div 
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        >
          <defs>
            <linearGradient id="logo-gradient-editorial" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00EEFF" />
              <stop offset="100%" stopColor="#7000FF" />
            </linearGradient>
          </defs>
          
          {/* Main Structural Frame - Stable & Minimal */}
          <rect 
            x="4" 
            y="4" 
            width="32" 
            height="32" 
            rx="2"
            stroke="url(#logo-gradient-editorial)" 
            strokeWidth="3" 
            fill="transparent"
          />
          
          {/* Center Column / Perspective Pillar */}
          <rect 
            x="18" 
            y="10" 
            width="4" 
            height="20" 
            fill="url(#logo-gradient-editorial)" 
          />
          
          {/* Horizontal Balance Lines */}
          <rect x="10" y="14" width="20" height="2" fill="url(#logo-gradient-editorial)" className="opacity-40" />
          <rect x="10" y="24" width="20" height="2" fill="url(#logo-gradient-editorial)" className="opacity-40" />
        </svg>
      </div>
      
      {withText && (
        <span className={cn(
          "font-display font-black tracking-tighter uppercase",
          textClassName || "text-2xl md:text-3xl lg:text-4xl"
        )}>
          OPINIO<span className="bg-clip-text text-transparent bg-gradient-to-br from-accent to-[#7000FF]">[N]</span>ATE
        </span>
      )}
    </div>
  );
}
