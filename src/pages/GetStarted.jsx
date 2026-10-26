import React, { useEffect, useRef, useState } from 'react';
import { Shield, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentPrefill, funnelRequest } from '../lib/funnel-client';
import { saveReceipt } from '../lib/inquiry-receipt';
import { checkDemoCard } from '../../shared/demo-card-validation';
import { checkCardFormat, checkSecurityCode } from '../../shared/card-entry-format';
import { websiteSubmission, completeWebsiteSubmission, recordWebsiteEvent } from '../lib/website-tracker';

const PLANS = {
  single: { title: 'Single Enrollment', price: 189.99, monthly: 100.00 },
  couple: { title: 'Couple Enrollment', price: 379.99, monthly: 160.00 },
};

const GetStarted = ({ cardStepPreview = false, funnelMode = false } = {}) => {
  const navigate = useNavigate();
  const [cardMode, setCardMode] = useState('disabled');
  const [securityCodeRequired,setSecurityCodeRequired]=useState(false);
  const [securityCode,setSecurityCode]=useState('');
  const cardIntakeEnabled = cardMode !== 'disabled';
  const syntheticCardMode = cardMode === 'synthetic';
  useEffect(() => {
    let active = true;
    fetch('/api/enrollment-card?action=capability', {cache:'no-store'}).then(async response => {
      if (response.ok) { const result = await response.json(); if (active && result.enabled === true) {
        if (result.syntheticOnly === false) {setCardMode('live');setSecurityCodeRequired(result.securityCodeRequired===true);}
        else if (result.syntheticOnly === true && import.meta.env?.DEV && ['localhost','127.0.0.1'].includes(location.hostname)) setCardMode('synthetic');
      } }
    }).catch(() => {});
    return () => {active = false;};
  }, []);
  const showCardStep = cardStepPreview || cardIntakeEnabled;
  const [funnelLoading, setFunnelLoading] = useState(funnelMode);
  const [funnelError, setFunnelError] = useState('');
  const [funnelLead, setFunnelLead] = useState(null);
  const [funnelPreview, setFunnelPreview] = useState(false);
  const [funnelReload, setFunnelReload] = useState(0);
  const [step, setStep] = useState(1);
  const stepHeadingRef = useRef(null);
  const previousStepRef = useRef(step);

  useEffect(() => {
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;
    const heading = stepHeadingRef.current;
    if (!heading) return;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start', behavior: 'auto' });
  }, [step]);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [informationError, setInformationError] = useState(null);
  const [enrollmentResult, setEnrollmentResult] = useState(null);
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

  useEffect(() => {
    if (!funnelMode) return;
    let active = true;
    setFunnelLoading(true); setFunnelError('');
    funnelRequest().then(result => {
      if (!active) return;
      setFormData(previous => ({ ...previous, ...enrollmentPrefill(result.lead) }));
      setFunnelLead(result.lead); setFunnelPreview(import.meta.env.VITE_HRS_SYNTHETIC_PREVIEW === 'true' || result.previewOnly === true);
    }).catch(() => { if (active) setFunnelError('We couldn’t load your saved request. Retry loading it, or return to credit help.'); })
      .finally(() => { if (active) setFunnelLoading(false); });
    return () => { active = false; };
  }, [funnelMode, funnelReload]);

  const [billingAddress, setBillingAddress] = useState({ billingAddressLine1: '', billingAddressLine2: '', billingCity: '', billingState: '' });
  const [demoCard, setDemoCard] = useState({name:'',number:'',expiry:''});
  const [demoNotice, setDemoNotice] = useState('');
  const confirmationStep = showCardStep ? 5 : 4;
  const steps = [
    { title: 'Information', label: 'Personal Details' },
    { title: 'Analysis', label: 'Credit Goal' },
    { title: 'Enrollment', label: 'Plan & Review' },
    ...(showCardStep ? [{ title: 'Card', label: 'Card & Billing Address' }] : []),
    { title: 'Finish', label: 'Confirm' },
  ];

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
      setDemoNotice('');
      const v = value.replace(/\D/g, '').substring(0, 5);
      setFormData(prev => ({ ...prev, [name]: v }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const informationFailure = (field, message) => {
    if (!funnelMode) { alert(message); return; }
    setInformationError({ field, message });
    document.getElementById(`inquiry-${field}`)?.focus();
  };

  const handleNextStep1 = () => {
    const { firstName, lastName, email, phone } = formData;
    if (!firstName.trim() || !lastName.trim()) {
      informationFailure(!firstName.trim() ? 'firstName' : 'lastName', 'Please enter both your first and last name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      informationFailure('email', 'Please enter a valid email address.');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      informationFailure('phone', 'Please enter a valid 10-digit US phone number. Example: (555) 123-4567');
      return;
    }
    if (/^(.)\1{9}$/.test(phoneDigits)) {
      informationFailure('phone', 'Please enter a real, working phone number instead of repeated digits.');
      return;
    }
    if (phoneDigits[0] === '0' || phoneDigits[0] === '1') {
      informationFailure('phone', 'A valid US area code cannot start with 0 or 1.');
      return;
    }
    if (phoneDigits[3] === '0' || phoneDigits[3] === '1') {
      informationFailure('phone', 'Please enter a valid working US phone number.');
      return;
    }
    setInformationError(null);
    void recordWebsiteEvent('information_completed','/get-started');
    setStep(funnelMode && formData.goal ? 3 : 2);
  };

  const handleEnroll = async () => {
    if (loading) return;
    if (!formData.plan || !formData.creditReportAgreement) {
      setPaymentError('Select your plan and acknowledge the credit report requirement.');
      return;
    }
    if (!/^\d{5}$/.test(formData.billingZip)) {
      setPaymentError('Enter a five-digit ZIP code before submitting.');
      document.getElementById('inquiry-billingZip')?.focus();
      return;
    }
    setLoading(true);
    setPaymentError(null);
    try {
      void recordWebsiteEvent('submission_attempt','/get-started');
      if (funnelMode) {
        if (!funnelLead) throw Error('Saved request unavailable. Return to credit help.');
        await funnelRequest('updateContact', { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, contactConsent: true, marketingConsent: false });
        await funnelRequest('updateAnswers', { goal: formData.goal, concern: funnelLead.concern, scoreRange: funnelLead.scoreRange, questionnaireSkipped: funnelLead.questionnaireSkipped === true });
      }
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData,...websiteSubmission(),...(funnelMode ? {funnel:true} : {}),...(cardIntakeEnabled ? {card:{...demoCard,...billingAddress,billingZip:formData.billingZip,...(securityCodeRequired?{cvv:securityCode}:{})}} : {})}),
      });
      const data = await response.json();
      if (!response.ok || (cardIntakeEnabled && data.cardSaved !== true) || data.billingMode !== 'manual' || data.status !== 'pending_manual_review' || !data.requestId) {
        void recordWebsiteEvent('submission_error','/get-started');
        setPaymentError(data.error || 'Unable to confirm your enrollment. Please try again. No payment was attempted.');
        return;
      }
      setDemoCard({name:'',number:'',expiry:''});setSecurityCode('');
      completeWebsiteSubmission();
      setEnrollmentResult(data);
      setStep(confirmationStep);
      if (!cardIntakeEnabled && saveReceipt(data)) navigate('/thank-you', { replace: true });
    } catch {
      void recordWebsiteEvent('submission_error','/get-started');
      setPaymentError('Unable to confirm your enrollment. Please try again. No payment was attempted.');
    } finally {
      setLoading(false);
    }
  };

  const openCardPreparation = () => {
    if (!formData.plan || !formData.creditReportAgreement) {
      setPaymentError('Select your plan and acknowledge the credit report requirement.');
      return;
    }
    setPaymentError(null);
    setStep(4);
  };
  const continueCardPreparation = () => {
    setDemoNotice('');
    const states = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY AS GU MP PR VI'.split(' ');
    const checks = [
      ['billingAddressLine1', billingAddress.billingAddressLine1.trim(), 'Enter your billing street address.'],
      ['billingCity', billingAddress.billingCity.trim(), 'Enter your billing city.'],
      ['billingState', states.includes(billingAddress.billingState.trim().toUpperCase()), 'Enter a valid two-letter US billing state or territory.'],
      ['billingZip', /^\d{5}$/.test(formData.billingZip), 'Enter a five-digit billing ZIP code.'],
    ];
    const missing = checks.find(([, valid]) => !valid);
    if (missing) { setPaymentError(missing[2]); document.getElementById(`inquiry-${missing[0]}`)?.focus(); return; }
    const result=cardIntakeEnabled && !syntheticCardMode ? checkCardFormat(demoCard) : checkDemoCard(demoCard);
    if(!result.ok){setPaymentError(result.error);setDemoNotice('');return;}
    setPaymentError(null);
    if(securityCodeRequired){const code=checkSecurityCode(securityCode,demoCard.number);if(!code.ok){setPaymentError(code.error);document.getElementById('inquiry-card-cvv')?.focus();return;}}
    if (cardIntakeEnabled) { void handleEnroll(); return; }
    setDemoNotice(result.message);
  };

  const selectedPlan = formData.plan ? PLANS[formData.plan] : null;

  if (funnelMode && funnelLead?.status === 'enrollment_submitted') return <div className="signup-page min-h-screen pt-32 pb-24 px-6"><div className="max-w-xl mx-auto"><h1>Enrollment request received</h1><p>Reference: {funnelLead.requestId}</p><p>Our team will review your enrollment request. You have not been charged.</p><Link to="/">Return to HomeReady Scores</Link></div></div>;

  if (funnelMode && (funnelLoading || funnelError)) return <div className="signup-page min-h-screen pt-32 pb-24 px-6"><div className="max-w-xl mx-auto">{funnelLoading ? <p role="status">Loading your saved details…</p> : <><p role="alert">{funnelError}</p><button className="auth-button" onClick={() => setFunnelReload(n => n + 1)}>Retry loading request</button><p><Link to="/credit-help">Return to credit help</Link></p></>}</div></div>;

  return (
    <div className="signup-page min-h-screen pt-32 pb-24 bg-surface px-6">
      <div className="max-w-4xl mx-auto">
        <div className="signup-heading text-center mb-16">
          {syntheticCardMode && <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-navy">Local synthetic review only. Use fictional personal details, a .test email and a 555-01xx phone number. Real card entry is disabled.</p>}
          <h1 ref={step === confirmationStep ? null : stepHeadingRef} tabIndex={-1} className="text-4xl font-black mb-4 scroll-mt-32">Get Started</h1>
          {funnelMode ? <><p>{step === 1 ? 'Enrollment: review your details' : step === 2 ? 'Enrollment: change your goal' : step === 3 ? 'Enrollment: plan and review' : step === 4 && showCardStep ? 'Enrollment: card and billing address' : 'Enrollment: request received'}</p>{funnelPreview && <p className="mt-3">Review preview — use sample details only.</p>}</> : <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Step {step} of {steps.length}: {steps[step-1].label}</p>}
        </div>

        <div hidden={funnelMode} className="signup-progress flex justify-between items-center mb-12 relative max-w-lg mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          {steps.map((s, i) => (
            <div key={i} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black ${step >= i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 text-gray-400'}`}>
              {i + 1}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <div className="signup-form-panel bg-white p-10 rounded-[32px] shadow-2xl shadow-navy/5 border border-gray-100">
              {step === 1 && (
                <div className="animate-slide-up space-y-6">
                  {funnelMode && <div><h2 className="text-xl font-bold">Review your details</h2><p className="my-3">Check your saved details and complete the remaining enrollment information.</p><p>Your goal: {formData.goal} <button className="underline" onClick={() => setStep(2)}>Change goal</button></p></div>}
                  <div className="signup-name-grid grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="inquiry-firstName" className="text-[10px] font-black uppercase tracking-widest text-navy">First Name</label>
                      <input type="text" id="inquiry-firstName" aria-invalid={funnelMode && informationError?.field === 'firstName' || undefined} aria-describedby={funnelMode && informationError?.field === 'firstName' ? 'inquiry-information-error' : undefined} autoComplete="given-name" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="John" className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="inquiry-lastName" className="text-[10px] font-black uppercase tracking-widest text-navy">Last Name</label>
                      <input type="text" id="inquiry-lastName" aria-invalid={funnelMode && informationError?.field === 'lastName' || undefined} aria-describedby={funnelMode && informationError?.field === 'lastName' ? 'inquiry-information-error' : undefined} autoComplete="family-name" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Doe" className="input-field" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inquiry-email" className="text-[10px] font-black uppercase tracking-widest text-navy">Email Address</label>
                    <input type="email" id="inquiry-email" aria-invalid={funnelMode && informationError?.field === 'email' || undefined} aria-describedby={funnelMode && informationError?.field === 'email' ? 'inquiry-information-error' : undefined} autoComplete="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="john@example.com" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inquiry-phone" className="text-[10px] font-black uppercase tracking-widest text-navy">Phone Number{funnelMode ? " — required for the enrollment request" : ""}</label>
                    <input type="tel" inputMode="tel" id="inquiry-phone" aria-invalid={funnelMode && informationError?.field === 'phone' || undefined} aria-describedby={funnelMode && informationError?.field === 'phone' ? 'inquiry-information-error' : undefined} autoComplete="tel-national" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="(555) 000-0000" className="input-field" />
                  </div>
                  {funnelMode && informationError && <p id="inquiry-information-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{informationError.message}</p>}
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
                            void recordWebsiteEvent('goal_selected','/get-started');
                            setStep(funnelMode ? 1 : 3);
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
                      Choose your enrollment plan and review the initial fee and monthly pricing below.
                    </p>
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-4 mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-navy">Select Enrollment Plan</label>
                    <div className="grid gap-3">
                      {Object.entries(PLANS).map(([id, p]) => (
                        <button
                          key={id}
                          aria-pressed={formData.plan === id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, plan: id }))}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center gap-3 group ${formData.plan === id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary hover:bg-primary/5'}`}
                        >
                          <div>
                            <div className="font-black text-navy">{p.title}</div>
                            <div className="text-xs text-gray-500 font-bold mt-1">
                              <span className="text-primary text-base font-black mr-1">${p.price.toFixed(2)}</span>
                              initial; ${p.monthly.toFixed(2)}/month starting 30 days after signup.
                            </div>
                          </div>
                          <div className={`w-5 h-5 shrink-0 rounded-full border-2 transition-all ${formData.plan === id ? 'border-primary bg-primary' : 'border-gray-200 group-hover:border-primary'}`}></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Billing Zip: retained for the current live manual signup. */}
                  {!showCardStep && <div className="space-y-2 mb-6">
                    <label htmlFor="inquiry-billingZip" className="text-[10px] font-black uppercase tracking-widest text-navy">ZIP Code</label>
                    <input type="text" inputMode="numeric" maxLength={5} id="inquiry-billingZip" autoComplete="postal-code" name="billingZip" value={formData.billingZip} onChange={handleInputChange} required placeholder="90210" className="input-field" />
                  </div>}

                  {/* Credit Report Agreement */}
                  <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-6">
                    <div className="bg-navy text-white px-6 py-4">
                      <h4 className="font-bold text-lg tracking-wide">Getting Your Credit Reports</h4>
                    </div>
                    <div className="p-6 bg-white">
                      <p className="text-gray-700 text-[15px] mb-6 leading-relaxed">
                        {funnelMode ? 'You need to obtain your credit reports to begin the process. Review this requirement before submitting your request.' : <>Upon signup we will assist you in getting your <strong>free credit reports</strong>. Credit reports are from third-party providers, and getting them will never harm your scores.</>}
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

                  {/* Payment Error */}
                  {paymentError && (
                    <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-red-700 font-medium">{paymentError}</p>
                    </div>
                  )}

                  {/* Order Summary */}
                  {selectedPlan && (
                    <div role="region" aria-label="Enrollment summary" aria-live="polite" className="bg-slate-50 rounded-2xl p-4 sm:p-6 space-y-2">
                      <div className="flex justify-between gap-4 text-sm font-medium text-gray-600">
                        <span>Plan</span>
                        <span className="text-right">{selectedPlan.title}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-sm font-medium text-gray-600">
                        <span>Initial fee</span>
                        <span className="text-primary font-black">${selectedPlan.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-sm font-medium text-gray-600">
                        <span>Monthly, starting 30 days after signup</span>
                        <span className="shrink-0">${selectedPlan.monthly.toFixed(2)}/mo</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between gap-4 text-sm font-black text-navy">
                        <span>Initial total</span>
                        <span className="text-primary">${selectedPlan.price.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed pt-2">You will not be charged when you submit your enrollment request.</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(funnelMode ? 1 : 2)} className="secondary-button !px-6">Back</button>
                    <button
                      type="button"
                      onClick={showCardStep ? openCardPreparation : handleEnroll}
                      disabled={loading || !formData.plan || !formData.creditReportAgreement || (!showCardStep && !/^\d{5}$/.test(formData.billingZip))}
                      className="auth-button flex-1 translate-y-0 disabled:opacity-50"
                    >
                      {loading ? (funnelMode ? 'Submitting your request…' : 'Saving Enrollment...') : showCardStep ? 'Next' : funnelMode ? 'Submit enrollment request' : 'Get Started Now'}
                    </button>
                  </div>
                </div>
              )}

              {showCardStep && step === 4 && (
                <div className="space-y-6">
                  <p className="text-sm text-navy font-bold">{cardIntakeEnabled ? (syntheticCardMode ? 'Synthetic database review — use sample details only.' : 'Card and billing details') : 'Local preparation only — card collection is not enabled.'}</p>
                  <h2 className="text-2xl font-bold text-navy">Card & billing address</h2>
                  <p className="text-sm text-gray-600">{selectedPlan?.title}: ${selectedPlan?.price.toFixed(2)} initial; ${selectedPlan?.monthly.toFixed(2)}/month starting 30 days after signup. You will not be charged when you submit this form.</p>
                  <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-navy">{cardIntakeEnabled ? (syntheticCardMode ? 'This local review saves the sample enrollment and encrypted sample card together. Use a .test email and a fictional 555-01xx phone number. Never enter real personal or card information.' : 'Enter your card and billing details to complete your enrollment request. You will not be charged when you submit this form.') : 'Live secure card entry is unavailable. This preview accepts only the fictional test numbers shown below. Nothing will be submitted or saved.'}</div>
                  <fieldset className="space-y-4 min-w-0"><legend className="font-bold text-navy">{cardIntakeEnabled && !syntheticCardMode ? 'Card details' : 'Fictional test card only'}</legend><p className="text-sm text-gray-600" id="demo-card-help">{cardIntakeEnabled && !syntheticCardMode ? 'Enter your name as it appears on the card, your card number and expiration date.' : 'Use 4111 1111 1111 1111 (Visa), 5555 5555 5555 4444 (Mastercard), or 3714 496353 98431 (Amex). Never enter real card details. CVV is not collected.'}</p>{[['name','Cardholder name',80],['number',cardIntakeEnabled && !syntheticCardMode ? 'Card number' : 'Test card number',24],['expiry','Expiry (MM/YY)',7]].map(([key,label,maxLength])=><div className="space-y-2" key={key}><label htmlFor={`demo-card-${key}`}>{label}</label><input id={`demo-card-${key}`} name={`demoCard-${key}`} value={demoCard[key]} autoComplete="off" inputMode={key==='name'?'text':'numeric'} maxLength={maxLength} aria-describedby="demo-card-help" onChange={event=>{setDemoNotice('');setDemoCard(previous=>({...previous,[key]:event.target.value}));}} className="input-field"/></div>)}</fieldset>
                  {securityCodeRequired&&<div className="space-y-2"><label htmlFor="inquiry-card-cvv">Security code (CVV)</label><p id="card-cvv-help" className="text-sm text-gray-600">The three-digit code on the back of your card, or four digits on the front of an American Express card.</p><input id="inquiry-card-cvv" name="card-cvv" type="password" inputMode="numeric" autoComplete="off" maxLength={4} required aria-describedby="card-cvv-help" value={securityCode} onChange={event=>setSecurityCode(event.target.value.replace(/[^0-9]/g,''))} className="input-field"/></div>}
                  <fieldset className="space-y-4 min-w-0">
                    <legend className="font-bold text-navy">Billing address</legend>
                    <p className="text-sm text-gray-600">{cardIntakeEnabled && !syntheticCardMode ? 'Use the billing address associated with your card.' : 'Use a fictional billing address for this review. Number, date and address format checks do not verify an issued card or available funds.'}</p>
                    {[
                      ['billingAddressLine1', 'Street address', 'billing address-line1', 120],
                      ['billingAddressLine2', 'Apartment / unit (optional)', 'billing address-line2', 80],
                      ['billingCity', 'City', 'billing address-level2', 80],
                      ['billingState', 'State / territory (two letters)', 'billing address-level1', 2],
                    ].map(([name, label, autoComplete, maxLength]) => <div key={name} className="space-y-2"><label htmlFor={`inquiry-${name}`}>{label}</label><input id={`inquiry-${name}`} name={name} autoComplete={autoComplete} maxLength={maxLength} required={name !== 'billingAddressLine2'} value={billingAddress[name]} onChange={event => { setDemoNotice(''); setBillingAddress(previous => ({...previous, [name]: name === 'billingState' ? event.target.value.toUpperCase().replace(/[^A-Z]/g, '') : event.target.value})); }} className="input-field" /></div>)}
                    <div className="space-y-2"><label htmlFor="inquiry-billingZip">Billing ZIP code</label><input id="inquiry-billingZip" name="billingZip" inputMode="numeric" autoComplete="billing postal-code" maxLength={5} required value={formData.billingZip} onChange={handleInputChange} className="input-field" /></div>
                  </fieldset>
                  {paymentError && <p role="alert" className="text-sm text-red-700">{paymentError}</p>}
                  {demoNotice && <p role="status" className="text-sm text-navy">{demoNotice}</p>}
                  <div className="flex gap-4"><button type="button" onClick={() => {setPaymentError(null);setSecurityCode(''); setStep(3);}} className="secondary-button !px-6">Back</button><button type="button" onClick={continueCardPreparation} disabled={loading} className="auth-button flex-1">{loading ? 'Saving…' : cardIntakeEnabled ? (syntheticCardMode ? 'Save enrollment and test card' : 'Save enrollment and card') : 'Check test details'}</button></div>
                </div>
              )}

              {step === confirmationStep && (
                <div className="animate-slide-up text-center py-12">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle size={48} />
                  </div>
                  <h3 ref={stepHeadingRef} tabIndex={-1} className="text-3xl font-black mb-6 scroll-mt-32">{cardIntakeEnabled ? (syntheticCardMode ? 'Sample enrollment and card saved' : 'Enrollment and card saved') : 'Enrollment received'}</h3>
                  <p className="text-gray-500 mb-4 max-w-sm mx-auto text-lg">{cardIntakeEnabled ? (syntheticCardMode ? 'Your sample information and encrypted test card are saved in the local review database. Authorized review staff can retrieve the full test card. No payment was attempted.' : 'Thank you. Your enrollment request has been received. Keep your reference below. You have not been charged.') : 'Thank you. Your enrollment request has been received. You have not been charged.'}</p>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">Enrollment reference: <strong>{enrollmentResult?.requestId}</strong></p>
                  <div className="flex items-center gap-2 justify-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <Shield size={14} className="text-primary" /> Keep your enrollment reference
                  </div>
                </div>
              )}
            </div>
            <p className="text-center mt-8 text-xs text-gray-400 font-medium">By clicking, you agree to our <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline">Terms of Use</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>. These links open in a new tab so your enrollment stays here.</p>
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
                  'Secure enrollment submission',
                  'Single and Couple plans',
                  'Clear enrollment next steps',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="text-primary mt-1 shrink-0" size={16} />
                    <span className="text-sm font-bold text-blue-100/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100">
              <h4 className="font-black text-navy mb-4">What happens next?</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Your enrollment details are saved when you submit. Keep your reference for follow-up. Questions? Email <a href="mailto:help@homereadyscores.com" className="underline">help@homereadyscores.com</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
