import React from 'react';
import { Search, FileText, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'Analyze',
      description: 'Our trained agents handle your credit repair by first analyzing exactly what the next steps are for your specific situation.',
      details: ['Report review', 'Next steps plan', 'Account deep-dive']
    },
    {
      icon: FileText,
      title: 'Action',
      description: 'Our experts craft custom actions designed to address every negative mark on your credit history.',
      details: ['Custom strategy', 'Expert review', 'Strong legal focus']
    },
    {
      icon: Send,
      title: 'Verify',
      description: 'We take strong action with the credit bureaus and creditors, requiring them to provide proof for all negative items.',
      details: ['Mandatory proof', 'Bureau tracking', 'Result monitoring']
    },
    {
      icon: CheckCircle,
      title: 'Succeed',
      description: 'Watch your score improve as we work through the cycles. Most people see significant changes in just 1-2 cycles.',
      details: ['Score growth', 'Home ready progress', 'Cycle updates']
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-white">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-6">
          The Proven Process
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] text-navy">
          How We Build Your<br/><span className="text-primary italic">Success Story.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed font-medium">
          Our process is built on proven strategies to protect your credit health. We work directly with the credit bureaus to make sure your report is accurate and fair.
        </p>
      </section>

      {/* Steps Section */}
      <section className="px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-[600px] bg-surface skew-y-3 z-0"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {steps.map((step, i) => (
            <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl shadow-navy/5 flex flex-col items-center text-center animate-slide-up" style={{animationDelay: `${i * 0.15}s`}}>
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/30">
                <step.icon size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4">{step.title}</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                {step.description}
              </p>
              <div className="mt-auto space-y-3 w-full">
                {step.details.map(detail => (
                  <div key={detail} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy bg-surface px-4 py-2 rounded-lg">
                    <CheckCircle size={14} className="text-primary" />
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Details Grid */}
      <section className="bg-navy py-24 px-6 relative">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-10">
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Expert results for <span className="text-primary italic">Every Situation.</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                   {[
                     'Identity Theft', 'Late Payments', 'Collections', 'Charge-Offs',
                     'Bankruptcies', 'Foreclosures', 'Judgments', 'Tax Liens',
                     'Inquiries', 'Student Loans'
                   ].map(item => (
                     <div key={item} className="flex items-center gap-4 text-blue-100/60 font-bold">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                           <CheckCircle size={14} className="text-primary" />
                        </div>
                        {item}
                     </div>
                   ))}
                </div>
             </div>
             <div className="bg-white p-12 rounded-[40px] shadow-2xl relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary rounded-full opacity-10 blur-3xl"></div>
                <h3 className="text-3xl font-black mb-8 text-navy italic">"The Proven Difference"</h3>
                <p className="text-gray-600 leading-relaxed mb-8 font-medium">
                  We handle the entire timeline with the credit bureaus for you, managing every step with precision to ensure your report reflects your true credit potential.
                </p>
                <Link to="/get-started" className="auth-button group">
                  Start Your Journey Today
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
             </div>
          </div>
      </section>
    </div>
  );
};

export default HowItWorks;
