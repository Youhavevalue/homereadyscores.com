import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navLinks = [
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <nav className={`fixed w-full z-100 transition-all duration-500 ${scrolled ? 'glass py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary/20"
          >
            <ShieldCheck size={26} />
          </motion.div>
          <div className="flex flex-col">
            <div className="text-xl md:text-2xl font-black tracking-tight text-navy uppercase leading-none">
              Home Ready<span className="text-primary tracking-widest">.</span>
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/60 leading-none mt-1">
              Credit Restoration
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="relative group"
            >
              <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${location.pathname === link.path ? 'text-primary' : 'text-navy/70 group-hover:text-primary'}`}>
                {link.name}
              </span>
              {location.pathname === link.path && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary rounded-full"
                />
              )}
            </Link>
          ))}
          <Link to="/portal/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-navy/70 hover:text-primary transition-colors duration-300 flex items-center gap-1.5">
            <LogIn size={14} />
            Portal
          </Link>
          <Link to="/get-started" className="auth-button !px-6 !py-3 !text-[10px]">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden text-navy p-2 bg-surface rounded-lg relative z-50"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden"
              style={{ top: 0, zIndex: 40 }}
              onClick={() => setIsOpen(false)}
            />
            {/* Menu Panel */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-2xl p-8 flex flex-col gap-6 md:hidden"
              style={{ zIndex: 45 }}
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    to={link.path} 
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-black text-navy hover:text-primary transition-colors flex items-center justify-between group"
                  >
                    {link.name}
                    <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-primary" />
                  </Link>
                </motion.div>
              ))}
              <div className="h-px bg-gray-100 my-2"></div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Link 
                  to="/portal/login" 
                  onClick={() => setIsOpen(false)} 
                  className="text-lg font-bold text-navy/70 hover:text-primary transition-colors flex items-center gap-3"
                >
                  <LogIn size={20} />
                  Team Portal Login
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link to="/get-started" onClick={() => setIsOpen(false)} className="auth-button !py-5 text-base">
                  Get Started Now
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
