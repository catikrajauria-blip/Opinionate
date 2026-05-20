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
import News from './pages/News';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Disclaimer from './pages/legal/Disclaimer';
import Copyright from './pages/legal/Copyright';
import Terms from './pages/legal/Terms';
import ExternalLinks from './pages/legal/ExternalLinks';
import ScrollToTopButton from './components/ScrollToTopButton';
import IntroSplash from './components/IntroSplash';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }

    // Dynamic SEO Title & Description Handler
    let title = "OPINIONATE | Daily News, Policy Analysis & MBA Prep";
    let description = "Opinionate is India's premium platform for analytical daily news, deep-dive Indian policy reviews, and interactive surveys engineered for CAT/MBA aspirants, policy students, and global thinkers.";

    if (pathname === '/') {
      title = "OPINIONATE | Shaping Reality - Daily News & MBA Prep";
    } else if (pathname === '/archive') {
      title = "Archive Logs | OPINIONATE - Daily Historical Library";
      description = "Browse the rich library of daily news logs and interactive archives on Opinionate. Built for historical research and student reference.";
    } else if (pathname === '/news') {
      title = "Daily News Analysis | OPINIONATE - Live Updates";
      description = "Access direct, objective, of-the-moment daily news commentaries analyzed for CAT, MBA, and UPSC policy essay requirements.";
    } else if (pathname.startsWith('/blog/')) {
      title = "Blog Breakdown | OPINIONATE - In-depth Perspectives";
      description = "Read comprehensive opinions, editorial content, and professional critiques on Opinionate.";
    } else if (pathname === '/indian-policy') {
      title = "Indian Policy Analysis | OPINIONATE - Policy Prep Guide";
      description = "Exhaustive analyses of current policies introduced in India, broken down logically for group discussions, executive interviews, and general study.";
    } else if (pathname === '/newsletter') {
      title = "Newsletter Signup | OPINIONATE - Weekly Insights";
      description = "Subscribe to our elite analytical newsletter covering MBA group discussion topics, WAT preparation, and comprehensive policy guidelines.";
    } else if (pathname === '/about') {
      title = "About Us | OPINIONATE - Our Vision & Core Values";
      description = "Learn about the mission of Opinionate, engineered to bridge pure news, culture, policy, and technology into a single, high-fidelity publication.";
    } else if (pathname === '/contact') {
      title = "Contact Us | OPINIONATE";
      description = "Get in touch with the Opinionate development and editorial team for queries, submissions, or technical assistance.";
    } else if (pathname === '/login') {
      title = "Sign In | OPINIONATE - Access Premium Insights";
      description = "Create or access your secure Opinionate account to start voting, saving articles, engaging with the student community, and rating policy essays.";
    } else if (pathname === '/saved') {
      title = "My Saved Collection | OPINIONATE";
      description = "Your curated repository of policy insights, current affairs, and research articles saved on Opinionate.";
    }

    document.title = title;

    // Update Meta Description tag dynamically
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
    
    // Also update Open Graph Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    // Update Open Graph Description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="archive" element={<Archive />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        <Route path="saved" element={<SavedBlogs />} />
        <Route path="newsletter" element={<Newsletter />} />
        <Route path="news" element={<News />} />
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
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  // Check if user has already seen the intro in this session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence mode="wait">
          {showIntro ? (
            <IntroSplash key="intro" onComplete={handleIntroComplete} />
          ) : (
            <motion.div 
              key="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <ScrollToTop />
              <ScrollToTopButton />
              <AnimatedRoutes />
            </motion.div>
          )}
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
}
