import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // We listen to the window scroll if the whole body scrolls, 
    // or try to find a main scroll container if Layout.tsx uses one.
    // Given Layout.tsx has overflow-y-auto on main, we might need to target it.
    
    // Attempting to track window first, but adding compatibility for common scroll containers
    const toggleVisibility = () => {
      // Check window scroll
      const winScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      // Also check if there's a scroll container inside Layout
      const mainElement = document.querySelector('main');
      const mainScroll = mainElement ? mainElement.scrollTop : 0;
      
      if (winScroll > 300 || mainScroll > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, true); // Use capture to catch sub-element scrolls
    return () => window.removeEventListener('scroll', toggleVisibility, true);
  }, []);

  const scrollToTop = () => {
    // Try window first
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    // Also try main element if it exists
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-10 right-10 z-[60] p-4 bg-text-primary text-bg-page rounded-2xl shadow-2xl border border-border group",
            "transition-all duration-300"
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
