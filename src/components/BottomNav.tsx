import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Newspaper, ShieldCheck, Archive, Zap, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BottomNav() {
  const location = useLocation();
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (navigator as any).standalone;
    
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    
    // Also show for iOS if not standalone
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone) {
      setShowInstall(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);
  
  const navItems = [
    { name: 'Daily News', path: '/news', icon: Newspaper },
    { name: 'Indian Policy', path: '/indian-policy', icon: ShieldCheck },
    { name: 'Archive', path: '/archive', icon: Archive },
    { name: 'Daily Blog', path: '/', icon: Zap },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 glass-vibrant border-t border-border z-[100] lg:hidden flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
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
      
      {showInstall && (
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('toggle-pwa-guide'));
          }}
          className="flex flex-col items-center justify-center gap-1 text-accent animate-pulse"
        >
          <Download size={20} />
          <span className="text-[9px] font-display font-black uppercase tracking-widest">GET APP</span>
        </button>
      )}
    </div>
  );
}
