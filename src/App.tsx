import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Archive from './pages/Archive';
import BlogDetail from './pages/BlogDetail';
import SavedBlogs from './pages/SavedBlogs';
import Newsletter from './pages/Newsletter';
import About from './pages/About';
import Contact from './pages/Contact';
import IndianPolicy from './pages/IndianPolicy';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Disclaimer from './pages/legal/Disclaimer';
import Copyright from './pages/legal/Copyright';
import Terms from './pages/legal/Terms';
import ExternalLinks from './pages/legal/ExternalLinks';
import SplashScreen from './components/SplashScreen';
import ScrollToTopButton from './components/ScrollToTopButton';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function AnimatedRoutes({ showSplash, handleEnter }: { showSplash: boolean, handleEnter: () => void }) {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen onEnter={handleEnter} key="splash" />}
      </AnimatePresence>
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="archive" element={<Archive />} />
          <Route path="blog/:slug" element={<BlogDetail />} />
          <Route path="saved" element={<SavedBlogs />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="indian-policy" element={<IndianPolicy />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="admin" element={<Admin />} />
          <Route path="login" element={<Login />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          <Route path="copyright" element={<Copyright />} />
          <Route path="terms" element={<Terms />} />
          <Route path="external-links" element={<ExternalLinks />} />
          <Route path="*" element={<div className="text-center py-20 font-display font-bold text-3xl">404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if session has already entered
    const entered = sessionStorage.getItem('opinionate_entered');
    if (entered) {
      setShowSplash(false);
    }
  }, []);

  const handleEnter = () => {
    setShowSplash(false);
    sessionStorage.setItem('opinionate_entered', 'true');
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <ScrollToTopButton />
        <AnimatedRoutes showSplash={showSplash} handleEnter={handleEnter} />
      </AuthProvider>
    </BrowserRouter>
  );
}
