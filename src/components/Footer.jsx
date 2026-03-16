import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy text-white pt-24 pb-12 px-6 md:px-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">Home Ready<span className="text-primary">Scores</span></span>
            </Link>
            <p className="text-blue-100/60 leading-relaxed max-w-xs mb-8">
              Empowering families to rebuild their financial future through expert credit advocacy and legal consumer protection.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-primary">Resources</h4>
            <ul className="space-y-4 text-blue-100/60 font-bold uppercase tracking-widest text-[10px]">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/reviews" className="hover:text-white transition-colors">Client Results</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-primary">Legal</h4>
            <ul className="space-y-4 text-blue-100/60 font-bold uppercase tracking-widest text-[10px]">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FCRA Rights</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-8 text-primary">Contact</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-blue-100/60">
                <MapPin className="text-primary mt-1" size={20} />
                <span className="text-sm font-medium">123 Credit Blvd, Suite 100<br/>Houston, TX 77001</span>
              </li>
              <li className="flex items-center gap-4 text-blue-100/60">
                <Phone className="text-primary" size={20} />
                <span className="text-sm font-medium">(888) 123-4567</span>
              </li>
              <li className="flex items-center gap-4 text-blue-100/60">
                <Mail className="text-primary" size={20} />
                <span className="text-sm font-medium">help@homereadyscores.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-blue-100/30 uppercase tracking-[4px] font-bold text-center md:text-left">
            © 2026 Home Ready Scores. Fully Functional Credit Advocacy.
          </p>
          <div className="flex gap-8 opacity-30 grayscale contrast-125">
             <span className="text-xs font-black">BBB ACCREDITED</span>
             <span className="text-xs font-black">PCI COMPLIANT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
