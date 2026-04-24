import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow pt-16 flex flex-col lg:flex-row bg-border gap-[1px] overflow-x-hidden">
        <main className="flex-grow bg-bg-page py-8 px-4 md:py-12 md:px-12 lg:px-16 overflow-y-auto">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
             >
               <Outlet />
             </motion.div>
          </AnimatePresence>
        </main>
        <div className="w-full lg:w-[360px] flex-shrink-0">
           <Sidebar />
        </div>
      </div>
      <Footer />
    </div>
  );
}
