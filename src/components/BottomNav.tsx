import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Newspaper, ShieldCheck, Archive, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Daily News', path: '/news', icon: Newspaper },
    { name: 'Indian Policy', path: '/indian-policy', icon: ShieldCheck },
    { name: 'Archive', path: '/archive', icon: Archive },
    { name: 'Daily Blog', path: '/', icon: Zap },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 glass-vibrant border-t border-border z-[100] lg:hidden flex items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all",
              isActive ? "text-accent" : "text-text-secondary opacity-60 hover:opacity-100"
            )}
          >
            <Icon size={20} className={cn(isActive && "animate-pulse")} />
            <span className="text-[9px] font-display font-black uppercase tracking-widest">
              {item.name}
            </span>
            {isActive && (
              <div className="absolute bottom-1 w-1 h-1 bg-accent rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
