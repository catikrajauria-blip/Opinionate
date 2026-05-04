import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, Bookmark, Mail, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { profile, signOut, isAdmin: isUserAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Initial theme check
    const isDark = document.documentElement.classList.contains('dark') || 
                  (!('light' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (!isDark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navLinks = [
    { name: 'Daily News', path: '/news' },
    { name: 'Archive', path: '/archive' },
    { name: 'Saved', path: '/saved' },
    { name: 'Indian Policy', path: '/indian-policy' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled ? 'py-2' : 'py-6'
      )}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            'flex justify-between items-center px-8 py-3 rounded-full transition-all duration-500 glass-vibrant',
            isScrolled ? 'shadow-2xl' : 'bg-transparent border-transparent backdrop-blur-none shadow-none'
          )}
        >
          <Link to="/" className="group flex items-center shrink-0">
            <Logo withText size={28} textClassName="text-xl md:text-2xl" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, idx) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    'px-5 py-2 text-[10px] font-display font-black uppercase tracking-[0.2em] transition-all relative group rounded-full',
                    isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                  )
                }
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  {link.name}
                </motion.span>
                <span className={cn(
                  "absolute inset-0 bg-accent/5 rounded-full scale-0 transition-transform duration-300 group-hover:scale-100",
                )} />
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button 
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full glass hover:bg-accent/10 text-text-secondary hover:text-accent transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>
            
            <div className="h-6 w-[1px] bg-border mx-1" />

            {profile ? (
                <div className="relative">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 py-1 pr-4 pl-1 rounded-full glass transition-all"
                  >
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-accent/20" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-vibrant text-white flex items-center justify-center font-bold text-xs ring-2 ring-accent/20">
                        {profile.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="text-[10px] font-display font-black uppercase tracking-widest hidden sm:block">{profile.displayName.split(' ')[0]}</span>
                    <ChevronDown size={12} className={cn("transition-transform opacity-40", showProfileMenu && "rotate-180")} />
                  </motion.button>

                  <AnimatePresence>
                    {showProfileMenu && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.9 }}
                          className="absolute right-0 mt-4 w-60 glass rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-3 overflow-hidden backdrop-blur-2xl z-[60]"
                        >
                          <div className="px-6 py-4 border-b border-border mb-2 bg-surface/30">
                            <p className="text-[10px] font-display font-black tracking-widest uppercase text-accent mb-1">User Profile</p>
                            <p className="text-sm font-display font-black text-text-primary truncate">{profile.displayName}</p>
                            <p className="text-[10px] font-mono text-text-secondary truncate">{profile.email}</p>
                          </div>
                          
                          <div className="px-2 space-y-1">
                            {isUserAdmin && (
                              <Link 
                                to="/admin" 
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 text-[11px] font-display font-black uppercase tracking-widest text-text-secondary hover:text-accent hover:bg-accent/10 rounded-2xl transition-all"
                              >
                                <Settings size={14} /> Admin Panel
                              </Link>
                            )}
                            
                            <Link 
                              to="/saved" 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-3 px-4 py-3 text-[11px] font-display font-black uppercase tracking-widest text-text-secondary hover:text-accent hover:bg-accent/10 rounded-2xl transition-all"
                            >
                              <Bookmark size={14} /> Saved Posts
                            </Link>
                          </div>

                          <div className="mt-3 pt-3 border-t border-border px-2">
                            <button 
                              onClick={() => {
                                signOut();
                                setShowProfileMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-display font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                            >
                              <LogOut size={14} /> Logout
                            </button>
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="btn-premium px-6 py-2 rounded-full text-[10px]"
                >
                  <User size={14} /> Connect
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-4">
              <motion.button 
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="p-2.5 rounded-full glass hover:bg-accent/10 text-text-secondary hover:text-accent transition-all duration-300"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </motion.button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-text-secondary hover:text-accent transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </motion.div>
        </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-page border-b border-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block px-3 py-4 text-base font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-surface text-text-primary'
                        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                    )
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-border">
                {profile ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                       {profile.photoURL && <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full border border-border" referrerPolicy="no-referrer" />}
                       <div>
                          <p className="text-sm font-bold text-text-primary">{profile.displayName}</p>
                          <p className="text-xs text-text-secondary">{profile.email}</p>
                       </div>
                    </div>
                    {isUserAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-4 text-base font-medium text-text-secondary hover:bg-surface rounded-lg"
                      >
                        <Settings size={20} />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-4 text-base font-medium text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-4 text-base font-medium text-accent hover:bg-accent/10 rounded-lg"
                  >
                    <User size={20} />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
