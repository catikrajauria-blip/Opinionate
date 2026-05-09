import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, Bookmark, User, LogOut, ChevronDown, Settings, Download, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const { profile, signOut, isAdmin: isUserAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  const toggleTheme = (e: React.MouseEvent) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // Smooth transition effect - circular expansion
    const circle = document.createElement('div');
    circle.className = 'theme-transition-circle';
    circle.style.left = `${e.clientX}px`;
    circle.style.top = `${e.clientY}px`;
    document.body.appendChild(circle);

    // Fade logo & critical elements temporarily for smooth transition
    document.body.style.transition = 'none';
    
    setTimeout(() => {
      setTheme(newTheme);
      // Wait for circle expansion before cleanup
      setTimeout(() => {
        circle.remove();
      }, 1000);
    }, 400);
  };

  const navLinks = [
    { name: 'News', path: '/news' },
    { name: 'Archive', path: '/archive' },
    { name: 'Saved', path: '/saved' },
    { name: 'Policy', path: '/indian-policy' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-700',
        isScrolled ? 'py-4' : 'py-8'
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className={cn(
            'flex justify-between items-center px-10 py-3 rounded-2xl transition-all duration-700',
            isScrolled 
              ? 'glass shadow-2xl border-border' 
              : 'bg-transparent border-transparent'
          )}
        >
          <div className="flex items-center shrink-0">
            <Link to="/" className="group flex items-center" aria-label="Home">
              <Logo withText size={32} textClassName="text-lg md:text-xl" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'px-6 py-2.5 text-[10px] font-display font-black uppercase tracking-[0.25em] transition-all relative group rounded-xl',
                    isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <span className="relative z-10 block group-hover:-translate-y-px transition-transform duration-300">
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-accent/10 border border-accent/20 rounded-xl" 
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-6">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-3 glass rounded-xl text-text-secondary hover:text-accent transition-all border-border"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="h-6 w-[1px] bg-text-primary/10" />

            {profile ? (
                <div className="relative">
                  <motion.button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 py-1.5 px-1.5 pr-4 rounded-full glass border-border"
                  >
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full border border-accent/20" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent text-[#010101] flex items-center justify-center font-black text-[10px]">
                        {profile.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="text-[10px] font-display font-black uppercase tracking-widest hidden sm:block">{profile.displayName.split(' ')[0]}</span>
                    <ChevronDown size={12} className={cn("transition-transform", showProfileMenu && "rotate-180")} />
                  </motion.button>

                  <AnimatePresence>
                    {showProfileMenu && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-64 glass rounded-3xl shadow-3xl py-4 z-[60] border-border"
                        >
                          <div className="px-8 py-5 border-b border-border mb-2">
                            <p className="text-[9px] font-display font-black tracking-widest uppercase text-accent mb-1">Authenticated</p>
                            <p className="text-sm font-display font-black text-text-primary truncate">{profile.displayName}</p>
                          </div>
                          
                          <div className="px-2 space-y-1">
                            <Link to="/saved" className="flex items-center gap-4 px-6 py-4 text-[10px] font-display font-black uppercase tracking-widest text-text-secondary hover:text-accent hover:bg-accent/5 rounded-2xl transition-all">
                              <Bookmark size={14} /> Saved Data
                            </Link>
                            <button 
                              onClick={() => signOut()}
                              className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-display font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                            >
                              <LogOut size={14} /> Log Out
                            </button>
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="btn-premium px-8 py-3 text-[10px]">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-3 glass rounded-2xl text-text-secondary border-border"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 glass rounded-2xl text-text-secondary border-border"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </motion.div>
        </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[40] bg-bg-page/98 backdrop-blur-3xl px-8 pt-32 pb-20 overflow-y-auto"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-8 py-8 rounded-3xl transition-all border',
                      isActive ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white/5 border-white/5 text-text-secondary'
                    )}
                  >
                    <span className="text-xl font-display font-black uppercase tracking-[0.2em]">{link.name}</span>
                    <ArrowUpRight size={24} className="opacity-40" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
