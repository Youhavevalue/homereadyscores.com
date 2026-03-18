import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-navy text-white pt-32 pb-12 px-6 md:px-12 overflow-hidden relative">
      {/* Premium Decorative Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="col-span-1 md:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-10 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-black tracking-tight text-white uppercase leading-none">
                  Home Ready<span className="text-primary">.</span>
                </div>
                <div className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/60 leading-none mt-1">
                  Credit Restoration
                </div>
              </div>
            </Link>
            <p className="text-blue-100/50 leading-relaxed max-w-xs mb-10 text-lg font-medium italic">
              "Building the bridge between your current credit and your future house key."
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] mb-10 text-primary">Quick Links</h4>
            <ul className="space-y-5 text-blue-100/60 font-black uppercase tracking-[0.2em] text-[11px]">
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors hover:translate-x-1 inline-block transition-transform">How It Works</Link></li>
              <li><Link to="/reviews" className="hover:text-primary transition-colors hover:translate-x-1 inline-block transition-transform">Client Results</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors hover:translate-x-1 inline-block transition-transform">Expert FAQs</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] mb-10 text-primary">Compliance</h4>
            <ul className="space-y-5 text-blue-100/60 font-black uppercase tracking-[0.2em] text-[11px]">
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/fcra-rights" className="hover:text-primary transition-colors">FCRA Rights</Link></li>
              <li><Link to="/croa-disclosure" className="hover:text-primary transition-colors">CROA Disclosure</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-4">
            <h4 className="font-black uppercase tracking-[0.3em] text-[10px] mb-10 text-primary">Direct Contact</h4>
            <ul className="space-y-8">
              <li className="flex items-center gap-4 text-blue-100/60 group cursor-pointer">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Phone className="text-primary group-hover:text-white" size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold">972-128-0009</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Text Support Only</span>
                </div>
              </li>
              <li className="flex items-center gap-4 text-blue-100/60 group cursor-pointer">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Mail className="text-primary group-hover:text-white" size={20} />
                </div>
                <span className="text-base font-bold">help@homereadyscores.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] text-blue-100/20 uppercase tracking-[4px] font-black text-center md:text-left">
            © 2026 Home Ready Scores. Helping You Get Home Ready.
          </p>
          <div className="flex gap-10 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">BBB Accredited</span>
             </div>
             <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">PCI Compliant</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
