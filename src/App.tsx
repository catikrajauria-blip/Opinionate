import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Archive from './pages/Archive';
import BlogDetail from './pages/BlogDetail';
import SavedBlogs from './pages/SavedBlogs';
import Newsletter from './pages/Newsletter';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Login from './pages/Login';
import NewspaperReader from './pages/NewspaperReader';
import Newspapers from './pages/Newspapers';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="archive" element={<Archive />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="saved" element={<SavedBlogs />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="admin" element={<Admin />} />
            <Route path="login" element={<Login />} />
            <Route path="newspapers" element={<Newspapers />} />
            <Route path="newspaper/:id" element={<NewspaperReader />} />
            <Route path="*" element={<div className="text-center py-20 font-display font-bold text-3xl">404 - Page Not Found</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
