import React, { useState } from 'react';
import { Shield, CheckCircle, Info } from 'lucide-react';

const GetStarted = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    goal: '',
    plan: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    billingZip: '',
    creditReportAgreement: false
  });

  const steps = [
    { title: 'Information', label: 'Personal Details' },
    { title: 'Analysis', label: 'Credit Type' },
    { title: 'Payment', label: 'Secure Checkout' },
    { title: 'Finish', label: 'Confirm' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Basic formatting for credit card
    if (name === 'cardNumber') {
      const v = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: v.substring(0, 19) }));
      return;
    }
    if (name === 'expiry') {
      const v = value.replace(/\//g, '').replace(/(\d{2})/, '$1/').trim();
      setFormData(prev => ({ ...prev, [name]: v.substring(0, 5) }));
      return;
    }
    if (name === 'phone') {
      let v = value.replace(/\D/g, '');
      if (v.length > 10) v = v.substring(0, 10);
      let formatted = v;
      if (v.length > 6) {
        formatted = `(${v.substring(0,3)}) ${v.substring(3,6)}-${v.substring(6)}`;
      } else if (v.length > 3) {
        formatted = `(${v.substring(0,3)}) ${v.substring(3)}`;
      }
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep1 = () => {
    const { firstName, lastName, email, phone } = formData;
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter both your first and last name.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      alert("Please enter a valid 10-digit US phone number. Example: (555) 123-4567");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStep(4);
      } else {
        const err = await response.json();
        alert('Something went wrong: ' + (err.message || 'Check your details'));
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-surface px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black mb-4">Get Started</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Step {step} of 4: {steps[step-1].label}</p>
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
              <form onSubmit={handleSubmit} className="space-y-8">
                {step === 1 && (
                  <div className="animate-slide-up space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-navy">First Name</label>
                        <input 
                          type="text" 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder="John" 
                          className="input-field" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-navy">Last Name</label>
                        <input 
                          type="text" 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          placeholder="Doe" 
                          className="input-field" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-navy">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com" 
                        className="input-field" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-navy">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="(555) 000-0000" 
                        className="input-field" 
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                   <div className="animate-slide-up space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-navy">What is your primary goal?</label>
                        <div className="grid gap-3">
                           {['Buy a Home', 'Buy a Car', 'Refinance Loan', 'General Repair', 'Other'].map(goal => (
                             <button 
                                key={goal} 
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, goal }));
                                  setStep(3);
                                }}
                                className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all flex justify-between items-center group ${formData.goal === goal ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary hover:bg-primary/5'}`}
                             >
                                {goal}
                                <div className={`w-5 h-5 rounded-full border-2 transition-all ${formData.goal === goal ? 'border-primary bg-primary' : 'border-gray-200 group-hover:border-primary'}`}></div>
                             </button>
                           ))}
                        </div>
                      </div>
                   </div>
                )}

                {step === 3 && (
                  <div className="animate-slide-up space-y-6">
                    <div className="bg-primary/5 p-4 rounded-2xl flex items-start gap-3 mb-6">
                      <Shield className="text-primary shrink-0 mt-1" size={18} />
                      <p className="text-xs font-bold text-navy/70 leading-relaxed">
                        Secure checkout powered by bank-grade encryption. We will generate your custom roadmap as soon as payment is confirmed.
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <label className="text-[10px] font-black uppercase tracking-widest text-navy">Select Enrollment Plan</label>
                      <div className="grid gap-3">
                        {[
                          { id: 'single', title: 'Single Enrollment', price: '$184.99', desc: 'due today, then $114.00/month', ghlValue: 'Single' },
                          { id: 'couple', title: 'Couple Enrollment', price: '$304.99', desc: 'due today, then $190.00/month', ghlValue: 'Joint' }
                        ].map(plan => (
                          <button 
                            key={plan.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center group ${formData.plan === plan.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary hover:bg-primary/5'} focus:outline-none`}
                          >
                            <div>
                              <div className="font-black text-navy">{plan.title}</div>
                              <div className="text-xs text-gray-500 font-bold mt-1">
                                <span className="text-primary text-base font-black mr-1">{plan.price}</span> 
                                {plan.desc}
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 transition-all ${formData.plan === plan.id ? 'border-primary bg-primary' : 'border-gray-200 group-hover:border-primary'}`}></div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8 shadow-sm">
                      <div className="bg-navy text-white px-6 py-4">
                        <h4 className="font-bold text-lg tracking-wide">Getting Your Credit Reports</h4>
                      </div>
                      <div className="p-6 bg-white">
                        <p className="text-gray-700 text-[15px] mb-6 leading-relaxed">
                          Upon signup we will assist you in getting your <strong>free credit reports</strong>. Credit reports are from third-party providers, and getting them will never harm your scores.
                        </p>
                        
                        <div>
                          <p className="text-xs font-bold text-red-600 mb-2 tracking-wide uppercase">Required</p>
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              id="creditReportAgreement"
                              checked={formData.creditReportAgreement}
                              onChange={(e) => setFormData(prev => ({ ...prev, creditReportAgreement: e.target.checked }))}
                              className="w-5 h-5 cursor-pointer accent-primary rounded border-gray-300"
                            />
                            <label htmlFor="creditReportAgreement" className="text-sm font-medium text-gray-800 cursor-pointer select-none">
                              Yes, I understand I am required to obtain my credit reports to begin the process.
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-navy">Card Number</label>
                      <input 
                        type="text" 
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="0000 0000 0000 0000" 
                        className="input-field" 
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-navy">Expiry</label>
                        <input 
                          type="text" 
                          name="expiry"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          required
                          placeholder="MM/YY" 
                          className="input-field" 
                        />
                      </div>
                      <div className="col-span-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-navy">CVV</label>
                        <input 
                          type="text" 
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                          placeholder="123" 
                          className="input-field" 
                        />
                      </div>
                      <div className="col-span-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-navy">Billing Zip</label>
                        <input 
                          type="text" 
                          name="billingZip"
                          value={formData.billingZip}
                          onChange={handleInputChange}
                          required
                          placeholder="90210" 
                          className="input-field" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                   <div className="animate-slide-up text-center py-12">
                      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                         <CheckCircle size={48} />
                      </div>
                      <h3 className="text-3xl font-black mb-6">Success!</h3>
                      <p className="text-gray-500 mb-8 max-w-xs mx-auto text-lg">Your custom roadmap is being prepared. Our team will reach out shortly.</p>
                      <div className="flex items-center gap-2 justify-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                        <Shield size={14} className="text-primary" /> Encrypted & Secure
                      </div>
                   </div>
                )}

                <div className="pt-6 flex gap-4">
                  {step === 1 && (
                    <button type="button" onClick={handleNextStep1} className="auth-button flex-1 translate-y-0">
                      Next Step
                    </button>
                  )}
                  {step === 2 && (
                    <button type="button" onClick={() => setStep(1)} className="secondary-button !px-6">Back</button>
                  )}
                  {step === 3 && (
                    <>
                      <button type="button" onClick={() => setStep(2)} className="secondary-button !px-6">Back</button>
                      <button 
                        type="button" 
                        onClick={handleSubmit} 
                        disabled={loading || !formData.plan || !formData.creditReportAgreement}
                        className="auth-button flex-1 translate-y-0 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Complete Secure Registration'}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
            <p className="text-center mt-8 text-xs text-gray-400 font-medium">By clicking, you agree to our Terms of Use and Privacy Policy.</p>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#002D5B] p-8 rounded-[32px] text-white shadow-xl shadow-navy/20">
              <div className="flex items-center gap-2 mb-6">
                <Info size={20} className="text-[#2562FF]" />
                <h4 className="text-xl font-black text-white">Why Home Ready Scores?</h4>
              </div>
              <ul className="space-y-6">
                {[
                  '100% Satisfaction',
                  'Custom Roadmap to Home Ownership',
                  'Elite Financial Restoration'
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
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150" className="w-12 h-12 rounded-xl scale-110 object-cover" alt="Ralph" />
                  <div>
                    <h5 className="font-black text-navy">Ralph E.</h5>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">+114 Points</p>
                  </div>
               </div>
               <p className="text-xs italic text-gray-500 leading-relaxed font-medium">
                 "They removed 7 negative items in as little as 45 days. I was finally able to qualify for my first home!"
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
