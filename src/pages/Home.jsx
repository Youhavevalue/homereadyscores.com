import React from 'react';
import { Shield, Home as HomeIcon, TrendingUp, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-navy skew-x-[-12deg] translate-x-1/4 z-0 hidden lg:block"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-primary/20 blur-[150px] z-0"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-8">
                <Star size={14} fill="currentColor" />
                Voted #1 Credit Repair in Texas
              </div>
              <h1 className="text-6xl md:text-7xl font-black mb-8 leading-[1] text-navy lg:text-navy">
                Fix Your Credit.<br/>
                <span className="text-primary italic">Get Your</span><br/>
                Dream Home.
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
                Legacy Credits uses powerful consumer protection laws to challenge bureaus and help you reclaim the financial future your family deserves. 
                <span className="font-black text-navy ml-1">Most clients see results in 45 days.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/get-started" className="auth-button group">
                  Start Your Analysis
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/how-it-works" className="secondary-button">
                  See Our Process
                </Link>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-12 h-12 rounded-full border-4 border-white shadow-lg" alt="client" />
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-500 gap-0.5 mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Join 12,000+ Success Stories</p>
                </div>
              </div>
            </div>

            {/* Hero Card / Visual */}
            <div className="relative animate-fade-in lg:block hidden" style={{animationDelay: '0.4s'}}>
               <div className="relative z-10 bg-white p-10 rounded-3xl shadow-[0_50px_100px_rgba(0,45,91,0.2)] border border-gray-100">
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                  <h3 className="text-3xl font-black mb-6">Expert Help For:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      'Bankruptcies', 'Repossessions', 'Student Loans', 
                      'Medical Bills', 'Late Payments', 'Collections',
                      'Tax Liens', 'Identity Theft'
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-gray-100/50">
                        <CheckCircle className="text-primary" size={18} />
                        <span className="text-sm font-bold text-navy/80">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Success Rate</p>
                      <p className="text-3xl font-black text-navy italic">94.2%</p>
                    </div>
                    <div className="w-px h-10 bg-gray-100"></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Avg. Increase</p>
                      <p className="text-3xl font-black text-primary italic">+84pts</p>
                    </div>
                  </div>
               </div>
               
               {/* Floating Badges */}
               <div className="absolute -bottom-10 -right-10 bg-navy text-white p-6 rounded-2xl shadow-2xl z-20 flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Shield size={24} className="text-primary" />
                 </div>
                 <div>
                   <p className="text-xs font-bold uppercase tracking-widest opacity-60">Guaranteed</p>
                   <p className="text-lg font-black">45-Day Results</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST LOGOS */}
      <section className="py-12 bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10">As Seen In & Featured By</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale contrast-150">
             <span className="text-2xl font-black tracking-tighter">Forbes</span>
             <span className="text-2xl font-bold">USA TODAY</span>
             <span className="text-2xl font-serif font-black italic">MarketWatch</span>
             <span className="text-2xl font-bold">CNBC</span>
             <span className="text-2xl font-bold">NBC NEWS</span>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="card group hover:bg-navy hover:text-white">
            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-8 group-hover:bg-primary/20 transition-colors">
              <Shield className="text-primary" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 group-hover:text-white">Legal Advocacy</h3>
            <p className="text-gray-500 group-hover:text-blue-100/60 leading-relaxed mb-8">
              We leverage individual consumer rights through FCRA and FDCPA to force bureaus to prove or remove every negative item.
            </p>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary group-hover:text-white underline underline-offset-8">
              Learn the Strategy <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card group hover:bg-navy hover:text-white">
            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-8 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="text-primary" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 group-hover:text-white">Score Tracking</h3>
            <p className="text-gray-500 group-hover:text-blue-100/60 leading-relaxed mb-8">
              Real-time Transunion FICO® score updates and personalized strategies to optimize your credit utilization ratio.
            </p>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary group-hover:text-white underline underline-offset-8">
              View Tracking <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card group hover:bg-navy hover:text-white">
            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl mb-8 group-hover:bg-primary/20 transition-colors">
              <HomeIcon className="text-primary" size={32} />
            </div>
            <h3 className="text-2xl font-black mb-4 group-hover:text-white">Legacy Planning</h3>
            <p className="text-gray-500 group-hover:text-blue-100/60 leading-relaxed mb-8">
              We don't just fix scores; we prepare you for homeownership with mortgage-ready analysis and loan officer coordination.
            </p>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary group-hover:text-white underline underline-offset-8">
              Our Goal <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-navy rounded-[40px] p-12 md:p-24 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
           <div className="relative z-10 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Ready to Start the <span className="text-primary italic">Legacy Fight?</span>
              </h2>
              <p className="text-blue-100/60 text-lg mb-0 font-medium">
                Get your free analysis today and find out exactly what's holding your score back from its true potential.
              </p>
           </div>
           <div className="relative z-10 flex flex-col gap-4">
              <Link to="/get-started" className="auth-button min-w-[240px]">
                Get Free Assessment
              </Link>
              <p className="text-[10px] font-black tracking-widest text-primary uppercase text-center">No Credit Card Required</p>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
