import React from 'react';
import { Shield, Home as HomeIcon, TrendingUp, CheckCircle, ArrowRight, Star, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StatCounter = ({ value, label, prefix = "", suffix = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex flex-col"
  >
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black text-navy italic">{prefix}{value}{suffix}</span>
    </div>
  </motion.div>
);

const Home = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="bg-gradient-mesh min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden flex items-center">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-navy/5 skew-x-[-12deg] translate-x-1/4 z-0 hidden lg:block"></div>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-primary/10 blur-[150px] z-0"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-8">
                <Star size={14} fill="currentColor" />
                Voted #1 Credit Repair in Texas
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] text-navy tracking-tight">
                Improve Your Credit.<br/>
                <span className="text-gradient">Unlock Your</span><br/>
                New Home.
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
                Home Ready Scores helps you use your legal rights to fix your credit report so you can finally get the keys to the home you've been waiting for. 
                <span className="font-black text-navy ml-1 underline decoration-primary decoration-4 underline-offset-4">Most people see a real difference in just 45 days.</span>
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/get-started" className="auth-button group">
                  Get Started
                  <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <Link to="/how-it-works" className="secondary-button">
                  See Our Process
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <motion.img 
                      whileHover={{ y: -5, scale: 1.1 }}
                      key={i} 
                      src={`https://i.pravatar.cc/100?u=${i+10}`} 
                      className="w-12 h-12 rounded-full border-4 border-white shadow-xl cursor-pointer" 
                      alt="client" 
                    />
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center text-[10px] font-black shadow-xl">
                    <Plus size={12} />12K
                  </div>
                </div>
                <div>
                  <div className="flex text-yellow-500 gap-0.5 mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Join 12,000+ Success Stories</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Card / Visual */}
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="relative lg:block hidden"
            >
               <div className="relative z-10 bg-white/80 backdrop-blur-xl p-12 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,45,91,0.15)] border border-white">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                  <h3 className="text-3xl font-black mb-8">Expert Help For:</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      'Bankruptcies', 'Repossessions', 'Student Loans', 
                      'Medical Bills', 'Late Payments', 'Collections',
                      'Tax Liens', 'Identity Theft'
                    ].map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + (idx * 0.05) }}
                        key={item} 
                        className="flex items-center gap-3 p-3 bg-surface/50 rounded-2xl border border-gray-100/50 hover:bg-white hover:shadow-md transition-all duration-300"
                      >
                        <CheckCircle className="text-primary" size={18} />
                        <span className="text-sm font-bold text-navy/80">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-10 pt-10 border-t border-gray-100 flex items-center justify-between">
                    <StatCounter label="Success Rate" value="94.2" suffix="%" />
                    <div className="w-px h-12 bg-gray-100"></div>
                    <StatCounter label="Avg. Increase" value="84" prefix="+" suffix="pts" />
                  </div>
               </div>
               
               {/* Floating Badges */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute -bottom-10 -right-10 bg-navy text-white p-8 rounded-3xl shadow-2xl z-20 flex items-center gap-5 border border-white/10"
               >
                 <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Shield size={28} className="text-white" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Guaranteed</p>
                   <p className="text-xl font-black italic">45-Day Results</p>
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST LOGOS */}
      <section className="py-20 border-y border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-12">Strategic Industry Recognition</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             <span className="text-3xl font-black tracking-tighter">Forbes</span>
             <span className="text-3xl font-bold">USA TODAY</span>
             <span className="text-3xl font-serif font-black italic">MarketWatch</span>
             <span className="text-3xl font-bold">CNBC</span>
             <span className="text-3xl font-bold">NBC</span>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Our Three Core <span className="text-gradient">Success Pillars</span></h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            We don't just fix numbers; we build a clear path so you're ready to buy a home of your own.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          {[
            { 
              icon: Shield, 
              title: "Cleaning Your Report", 
              desc: "Our experts work directly with credit bureaus to ensure every detail on your report is accurate, fair, and working for you.",
              link: "/how-it-works"
            },
            { 
              icon: TrendingUp, 
              title: "Boosting Your Score", 
              desc: "Receive a simple, personalized roadmap designed to help you reach your credit goals with confidence and ease.",
              link: "/how-it-works"
            },
            { 
              icon: HomeIcon, 
              title: "Ready for a Home", 
              desc: "We help you cross the finish line by making sure your credit is officially ready for the home of your dreams.",
              link: "/how-it-works"
            }
          ].map((pillar, idx) => (
            <motion.div 
              {...fadeInUp}
              transition={{ delay: idx * 0.1 }}
              key={pillar.title} 
              className="card group"
            >
              <div className="w-20 h-20 bg-primary/5 flex items-center justify-center rounded-[1.5rem] mb-10 group-hover:bg-primary group-hover:text-white group-hover:rotate-[10deg] transition-all duration-500">
                <pillar.icon size={36} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:translate-x-1 transition-transform">{pillar.title}</h3>
              <p className="text-gray-500 leading-relaxed mb-10 text-lg">
                {pillar.desc}
              </p>
              <Link to={pillar.link} className="inline-flex items-center gap-2 font-black text-[11px] uppercase tracking-widest text-primary hover:gap-4 transition-all group-hover:text-navy">
                Learn the Strategy <ArrowRight size={14} className="mt-[-1px]" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-navy rounded-[4rem] p-12 md:p-24 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_40px_100px_rgba(0,45,91,0.3)]"
        >
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]"></div>
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue/10 rounded-full blur-[100px]"></div>
           <div className="relative z-10 max-w-xl">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-[1.1]">
                Ready to Start Your <span className="text-gradient brightness-150">Home Ready Journey?</span>
              </h2>
              <p className="text-blue-100/60 text-xl mb-0 font-medium leading-relaxed">
                Get your free analysis today and find out exactly what's holding your score back from its true potential.
              </p>
           </div>
           <div className="relative z-10 flex flex-col gap-6 items-center md:items-start whitespace-nowrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/get-started" className="auth-button min-w-[280px] py-6 text-base">
                  Get Free Assessment
                </Link>
              </motion.div>
              <div className="flex items-center gap-3">
                <CheckCircle size={14} className="text-primary fill-primary/20" />
                <p className="text-[11px] font-black tracking-widest text-primary uppercase">No Credit Card Required</p>
              </div>
           </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
