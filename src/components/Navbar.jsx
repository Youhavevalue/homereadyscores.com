import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
            <ShieldCheck size={24} />
          </div>
          <div className="text-2xl font-black tracking-tighter text-navy uppercase">
            Home Ready<span className="text-primary">Scores</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-navy/70'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-navy/70 hover:text-primary transition-colors">
            Login
          </Link>
          <Link to="/get-started" className="bg-primary text-white px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-navy transition-all hover:scale-105 active:scale-95">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-navy">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b shadow-2xl p-6 flex flex-col gap-6 md:hidden animate-slide-up">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className="text-lg font-bold text-navy"
            >
              {link.name}
            </Link>
          ))}
          <Link to="/login" className="text-lg font-bold text-navy">Login</Link>
          <Link to="/get-started" onClick={() => setIsOpen(false)} className="auth-button">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
