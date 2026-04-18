import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow pt-16 flex flex-col lg:flex-row bg-border gap-[1px]">
        <main className="flex-grow bg-bg-page py-12 px-6 md:px-12 lg:px-16 overflow-y-auto">
          <Outlet />
        </main>
        <div className="lg:w-[360px] flex-shrink-0">
           <Sidebar />
        </div>
      </div>
      <Footer />
    </div>
  );
}
