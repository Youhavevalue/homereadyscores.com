import React, { useState } from 'react';
import { Shield, CheckCircle, Info } from 'lucide-react';

const GetStarted = () => {
  const [step, setStep] = useState(1);

  const steps = [
    { title: 'Information', label: 'Personal Details' },
    { title: 'Analysis', label: 'Credit Type' },
    { title: 'Finish', label: 'Confirm' }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 bg-surface px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black mb-4">Start Your Free Assessment</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Step {step} of 3: {steps[step-1].label}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 relative max-w-lg mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          {steps.map((s, i) => (
            <div key={i} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 text-gray-400'}`}>
              {i + 1}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Main Form Area */}
          <div className="lg:col-span-3">
            <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-navy/5 border border-gray-100">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                {step === 1 && (
                  <div className="animate-slide-up space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-navy">First Name</label>
                        <input type="text" placeholder="John" className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-navy">Last Name</label>
                        <input type="text" placeholder="Doe" className="input-field" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-navy">Email Address</label>
                      <input type="email" placeholder="john@example.com" className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-navy">Phone Number</label>
                      <input type="tel" placeholder="(555) 000-0000" className="input-field" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                   <div className="animate-slide-up space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-navy">What is your primary goal?</label>
                        <div className="grid gap-3">
                           {['Buy a Home', 'Buy a Car', 'Refinance Loan', 'General Repair', 'Other'].map(goal => (
                             <button key={goal} className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-primary hover:bg-primary/5 text-left font-bold transition-all flex justify-between items-center group">
                                {goal}
                                <div className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-primary"></div>
                             </button>
                           ))}
                        </div>
                      </div>
                   </div>
                )}

                {step === 3 && (
                   <div className="animate-slide-up text-center py-8">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                         <CheckCircle size={40} />
                      </div>
                      <h3 className="text-2xl font-black mb-4">Almost Done!</h3>
                      <p className="text-gray-500 mb-8 max-w-xs mx-auto">Confirm your details and our lead expert will contact you within 24 hours.</p>
                      <div className="flex items-center gap-2 justify-center text-xs text-gray-400">
                        <Shield size={14} /> Encrypted & Secure
                      </div>
                   </div>
                )}

                <div className="pt-6 flex gap-4">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="secondary-button !px-6">Back</button>
                  )}
                  <button type="button" onClick={() => setStep(step < 3 ? step + 1 : 1)} className="auth-button flex-1 translate-y-0">
                    {step === 3 ? 'Submit Request' : 'Next Step'}
                  </button>
                </div>
              </form>
            </div>
            <p className="text-center mt-8 text-xs text-gray-400 font-medium">By clicking, you agree to our Terms of Use and Privacy Policy.</p>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-navy p-8 rounded-[32px] text-white">
              <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                <Info size={20} className="text-primary" /> Why Legacy?
              </h4>
              <ul className="space-y-6">
                {[
                  '100% Free Consultation',
                  'Comprehensive 3-Bureau Report',
                  'Custom Roadmap to 700+ Score',
                  '45-Day Performance Guarantee'
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 shrink-0" size={16} />
                    <span className="text-sm font-bold text-blue-100/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100">
               <div className="flex items-center gap-4 mb-6">
                  <img src="https://i.pravatar.cc/100?u=ralph" className="w-12 h-12 rounded-xl" alt="Ralph" />
                  <div>
                    <h5 className="font-black text-navy">Ralph E.</h5>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">+114 Points</p>
                  </div>
               </div>
               <p className="text-xs italic text-gray-500 leading-relaxed font-medium">
                 "They removed 7 negative items in just 45 days. I was finally able to qualify for my first home!"
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
