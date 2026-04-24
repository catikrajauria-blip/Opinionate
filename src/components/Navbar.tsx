import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, Bookmark, Mail, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { profile, signOut, isAdmin: isUserAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Archive', path: '/archive' },
    { name: 'Saved', path: '/saved' },
    { name: 'Indian Policy', path: '/indian-policy' },
    { name: 'Newsletter', path: '/newsletter' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border bg-bg-page py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display font-black text-2xl tracking-tighter uppercase transition-all duration-300 group-hover:scale-105 group-hover:text-accent flex items-center gap-1">
              OPINIO<span className="text-accent italic">N</span>ATE.
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    'text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all py-1 relative group',
                    isActive ? 'text-accent' : 'text-text-secondary hover:text-accent'
                  )
                }
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300",
                  "w-0 group-hover:w-full"
                )} />
              </NavLink>
            ))}
            <div className="flex items-center gap-3 ml-4">
              <button 
                onClick={toggleDarkMode}
                className="btn-minimal p-2"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              
              {profile ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 btn-minimal p-1 pr-3"
                  >
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full border border-border" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent text-bg-page flex items-center justify-center font-bold text-xs">
                        {profile.displayName.charAt(0)}
                      </div>
                    )}
                    <ChevronDown size={14} className={cn("transition-transform", showProfileMenu && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl py-2 overflow-hidden"
                      >
                        <div className="px-4 py-2 border-b border-border mb-2">
                          <p className="text-xs font-bold text-text-primary truncate">{profile.displayName}</p>
                          <p className="text-[10px] text-text-secondary truncate">{profile.email}</p>
                        </div>
                        
                        {isUserAdmin && (
                          <Link 
                            to="/admin" 
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-text-primary hover:bg-bg-page transition-colors"
                          >
                            <Settings size={14} /> Admin Dashboard
                          </Link>
                        )}
                        
                        <Link 
                          to="/saved" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-text-primary hover:bg-bg-page transition-colors"
                        >
                          <Bookmark size={14} /> Reading List
                        </Link>

                        <button 
                          onClick={() => {
                            signOut();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="btn-minimal px-4 py-2 text-xs font-bold flex items-center gap-2"
                >
                  <User size={14} /> Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 hover:bg-surface rounded-full transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-surface rounded-full transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
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
                      className="w-full flex items-center gap-3 px-3 py-4 text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
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
