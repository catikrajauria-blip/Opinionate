import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import PWAGuide from './PWAGuide';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-bg-page selection:bg-accent/20">
      <Navbar />
      <div className="flex-grow pt-20 flex flex-col lg:flex-row overflow-x-hidden pb-28 lg:pb-0 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <main className="flex-grow bg-bg-page py-6 sm:py-8 px-4 md:py-12 md:px-12 lg:px-16 border-r border-border min-h-screen">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2, ease: "linear" }}
               className="min-h-full"
             >
                <Outlet />
             </motion.div>
          </AnimatePresence>
        </main>
        <div className="w-full lg:w-[380px] flex-shrink-0 bg-surface/30">
           <Sidebar />
        </div>
      </div>
      <BottomNav />
      <PWAGuide />
      <Footer />
    </div>
  );
}
