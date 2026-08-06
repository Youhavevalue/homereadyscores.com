import React, { useState, useEffect, useRef } from 'react';
import { Shield, CheckCircle, Info, Lock, CreditCard, AlertCircle } from 'lucide-react';

const PLANS = {
  single: { title: 'Single Enrollment', price: 184.99, monthly: 114.00, setupCents: 18499, monthlyCents: 11400 },
  couple: { title: 'Couple Enrollment', price: 304.99, monthly: 190.00, setupCents: 30499, monthlyCents: 19000 },
};

const GetStarted = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cloverLoaded, setCloverLoaded] = useState(false);
  const [cloverConfig, setCloverConfig] = useState(null);
  const [cardValid, setCardValid] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    goal: '',
    plan: '',
    billingZip: '',
    creditReportAgreement: false,
  });

  const cloverRef = useRef(null);
  const elementsRef = useRef({});
  const sdkLoaded = useRef(false);

  const steps = [
    { title: 'Information', label: 'Personal Details' },
    { title: 'Analysis', label: 'Credit Goal' },
    { title: 'Enrollment', label: 'Plan & Payment' },
    { title: 'Finish', label: 'Confirm' },
  ];

  // Fetch Clover config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/clover/config');
        if (res.ok) {
          const data = await res.json();
          setCloverConfig(data);
        }
      } catch (err) {
        console.error('Clover config fetch error:', err);
      }
    }
    fetchConfig();
  }, []);

  // Load Clover SDK and mount iframe elements when we reach step 3 with a plan selected
  useEffect(() => {
    if (!cloverConfig || sdkLoaded.current || step !== 3 || !formData.plan) return;

    const existing = document.querySelector('script[src="' + cloverConfig.sdkUrl + '"]');
    if (existing) {
      existing.remove();
      sdkLoaded.current = false;
    }

    const script = document.createElement('script');
    script.src = cloverConfig.sdkUrl;
    script.async = true;
    script.onload = () => {
      sdkLoaded.current = true;
      try {
        const clover = new window.Clover(cloverConfig.apiAccessKey, {
          merchantId: cloverConfig.merchantId,
        });
        cloverRef.current = clover;
        const elements = clover.elements();

        const styles = {
          body: {
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: '15px',
            color: '#1e293b',
          },
          input: {
            fontSize: '15px',
            color: '#1e293b',
            backgroundColor: '#ffffff',
            border: 'none',
            outline: 'none',
            padding: '0',
          },
        };

        const cardNumber = elements.create('CARD_NUMBER', styles);
        const cardDate = elements.create('CARD_DATE', styles);
        const cardCvv = elements.create('CARD_CVV', styles);
        const cardPostalCode = elements.create('CARD_POSTAL_CODE', styles);

        cardNumber.mount('#clover-card-number');
        cardDate.mount('#clover-card-date');
        cardCvv.mount('#clover-card-cvv');
        cardPostalCode.mount('#clover-card-postal');

        elementsRef.current = { cardNumber, cardDate, cardCvv, cardPostalCode };
        setCloverLoaded(true);

        cardNumber.addEventListener('change', (ev) => {
          setCardValid(ev.CARD_NUMBER === 'VALID' || ev.CARD_NUMBER === 'OK');
        });
      } catch (err) {
        console.error('Clover SDK init error:', err);
        setPaymentError('Failed to initialize payment form. Please refresh and try again.');
      }
    };
    script.onerror = () => {
      setPaymentError('Failed to load payment SDK. Check your internet connection.');
    };
    document.head.appendChild(script);

    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, [cloverConfig, step, formData.plan]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
    if (name === 'billingZip') {
      const v = value.replace(/\D/g, '').substring(0, 5);
      setFormData(prev => ({ ...prev, [name]: v }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep1 = () => {
    const { firstName, lastName, email, phone } = formData;
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both your first and last name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      alert('Please enter a valid 10-digit US phone number. Example: (555) 123-4567');
      return;
    }
    if (/^(.)\1{9}$/.test(phoneDigits)) {
      alert('Please enter a real, working phone number instead of repeated digits.');
      return;
    }
    if (phoneDigits[0] === '0' || phoneDigits[0] === '1') {
      alert('A valid US area code cannot start with 0 or 1.');
      return;
    }
    if (phoneDigits[3] === '0' || phoneDigits[3] === '1') {
      alert('Please enter a valid working US phone number.');
      return;
    }
    setStep(2);
  };

  const handleEnroll = async () => {
    if (!cloverRef.current || !cloverLoaded) {
      setPaymentError('Payment form is still loading. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      const result = await cloverRef.current.createToken();

      if (result.errors) {
        const errMsg = Object.values(result.errors).join(', ');
        setPaymentError(`Card validation failed: ${errMsg}`);
        setLoading(false);
        return;
      }

      if (!result.token) {
        setPaymentError('Failed to tokenize card. Please check your card details and try again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: result.token,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(4);
      } else {
        setPaymentError(data.error || 'Something went wrong during enrollment. Please try again or call us.');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      setPaymentError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = formData.plan ? PLANS[formData.plan] : null;

  return (
    <div className="min-h-screen pt-32 pb-24 bg-surface px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black mb-4">Get Started</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Step {step} of 4: {steps[step-1].label}</p>
        </div>

        <div className="flex justify-between items-center mb-12 relative max-w-lg mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          {steps.map((s, i) => (
            <div key={i} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 text-gray-400'}`}>
              {i + 1}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-navy/5 border border-gray-100">
              {step === 1 && (
                <div className="animate-slide-up space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-navy">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="John" className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-navy">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Doe" className="input-field" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-navy">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="john@example.com" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-navy">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="(555) 000-0000" className="input-field" />
                  </div>
                  <button type="button" onClick={handleNextStep1} className="auth-button flex-1 translate-y-0 w-full">
                    Next Step
                  </button>
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
                  <button type="button" onClick={() => setStep(1)} className="secondary-button !px-6">Back</button>
                </div>
              )}

              {step === 3 && (
                <div className="animate-slide-up space-y-6">
                  <div className="bg-primary/5 p-4 rounded-2xl flex items-start gap-3 mb-6">
                    <Shield className="text-primary shrink-0 mt-1" size={18} />
                    <p className="text-xs font-bold text-navy/70 leading-relaxed">
                      Select your plan and enter your payment details below. Your card is securely processed by Clover (PCI compliant). Your card data never touches our server.
                    </p>
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-4 mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-navy">Select Enrollment Plan</label>
                    <div className="grid gap-3">
                      {Object.entries(PLANS).map(([id, p]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, plan: id })); setCloverLoaded(false); }}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center group ${formData.plan === id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary hover:bg-primary/5'}`}
                        >
                          <div>
                            <div className="font-black text-navy">{p.title}</div>
                            <div className="text-xs text-gray-500 font-bold mt-1">
                              <span className="text-primary text-base font-black mr-1">${p.price.toFixed(2)}</span>
                              due today, then ${p.monthly.toFixed(2)}/month
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 transition-all ${formData.plan === id ? 'border-primary bg-primary' : 'border-gray-200 group-hover:border-primary'}`}></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Billing Zip */}
                  <div className="space-y-2 mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-navy">Billing Zip Code</label>
                    <input type="text" name="billingZip" value={formData.billingZip} onChange={handleInputChange} required placeholder="90210" className="input-field" />
                  </div>

                  {/* Credit Report Agreement */}
                  <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-6">
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

                  {/* Credit Card Form via Clover iframe */}
                  {formData.plan && (
                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-navy text-white px-6 py-4 flex items-center gap-2">
                        <Lock size={18} className="text-primary" />
                        <h4 className="font-bold text-lg tracking-wide">Secure Payment</h4>
                      </div>
                      <div className="p-6 bg-white space-y-5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                          <CreditCard size={14} className="text-primary" />
                          {selectedPlan && (
                            <span>${selectedPlan.price.toFixed(2)} due today, then ${selectedPlan.monthly.toFixed(2)}/month starting next month</span>
                          )}
                        </div>

                        {/* Clover iframe containers */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-navy">Card Number</label>
                            <div id="clover-card-number" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus-within:border-primary transition-colors min-h-[48px]"></div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-navy">Expiry</label>
                              <div id="clover-card-date" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus-within:border-primary transition-colors min-h-[48px]"></div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-navy">CVV</label>
                              <div id="clover-card-cvv" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus-within:border-primary transition-colors min-h-[48px]"></div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest text-navy">ZIP</label>
                              <div id="clover-card-postal" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus-within:border-primary transition-colors min-h-[48px]"></div>
                            </div>
                          </div>
                        </div>

                        {!cloverLoaded && (
                          <p className="text-xs text-gray-400 font-medium text-center animate-pulse">Loading secure payment form...</p>
                        )}

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                          <Lock size={12} className="text-primary" /> Secured by Clover (PCI Compliant)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Error */}
                  {paymentError && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-red-700 font-medium">{paymentError}</p>
                    </div>
                  )}

                  {/* Order Summary */}
                  {selectedPlan && (
                    <div className="bg-slate-50 rounded-2xl p-6 space-y-2">
                      <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>Plan</span>
                        <span>{selectedPlan.title}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>Due Today</span>
                        <span className="text-primary font-black">${selectedPlan.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>Monthly</span>
                        <span>${selectedPlan.monthly.toFixed(2)}/mo</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-navy">
                        <span>Total Today</span>
                        <span className="text-primary">${selectedPlan.price.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(2)} className="secondary-button !px-6">Back</button>
                    <button
                      type="button"
                      onClick={handleEnroll}
                      disabled={loading || !formData.plan || !formData.creditReportAgreement || !cloverLoaded}
                      className="auth-button flex-1 translate-y-0 disabled:opacity-50"
                    >
                      {loading ? 'Processing Payment...' : `Enroll & Pay $${selectedPlan ? selectedPlan.price.toFixed(2) : ''}`}
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-slide-up text-center py-12">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-3xl font-black mb-6">You're Enrolled!</h3>
                  <p className="text-gray-500 mb-4 max-w-sm mx-auto text-lg">Your payment has been processed and your custom credit roadmap is being prepared. Our team will reach out within 24 hours to complete your setup.</p>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">Check your email and phone for next steps.</p>
                  <div className="flex items-center gap-2 justify-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <Shield size={14} className="text-primary" /> Your information is secure
                  </div>
                </div>
              )}
            </div>
            <p className="text-center mt-8 text-xs text-gray-400 font-medium">By clicking, you agree to our Terms of Use and Privacy Policy.</p>
          </div>

          {/* Sidebar */}
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
                  'Elite Financial Restoration',
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
                <img src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=150&h=150" className="w-12 h-12 rounded-xl scale-110 object-cover" alt="Ralph" />
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