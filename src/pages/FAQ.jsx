import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  { question: "How do I get started?", answer: "Select Get Started Now, enter your contact details and credit goal, and choose Single or Couple enrollment. Review the pricing and confirm your details. A confirmation appears only after your enrollment information has been successfully saved. Payment remains pending until successfully processed." },
  { question: "How long does it take to see results?", answer: "Timing depends on the information involved and the review process. We do not promise a particular change or timeline." },
  { question: "Which enrollment plan should I choose?", answer: "Single enrollment is for one person: $189.99 initially, then $100.00 per month. Couple enrollment is for you and your spouse or partner: $379.99 initially, then $160.00 per month. Monthly pricing starts 30 days after signup." },
  { question: "Can you guarantee that my score will go up?", answer: "Every credit profile is different, so we can’t promise a specific score increase or outcome. Our focus is helping you understand your credit report and address information that may be inaccurate or incomplete. Your results also depend on your credit history and ongoing payment habits. We’ll explain your options and next steps clearly." },
  { question: "What happens after I complete the enrollment form?", answer: "Keep the enrollment reference shown after a successful save. Your confirmation records receipt of your enrollment details; it does not confirm a payment, sign a service agreement or activate a subscription. Do not send card details or sensitive documents by ordinary email." },
  { question: "Does enrollment mean I qualify for a mortgage?", answer: "No. Mortgage qualification is separate from HomeReady Scores enrollment and is determined through your lender's process. Ask your lender about your specific application." },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="hrs-content-page pt-32 pb-24 bg-surface min-h-screen">
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="text-center animate-slide-up mb-16">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-6 border border-primary/20">
            Common Questions
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-8 leading-tight text-navy">
            Common Questions About <span className="text-primary italic">Credit Repair.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-0 max-w-2xl mx-auto leading-relaxed font-medium">
            Understand the enrollment steps, plan prices and what your confirmation means.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${openIndex === i ? 'border-primary/30 shadow-xl shadow-primary/5' : 'border-gray-100 shadow-sm hover:border-gray-300'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
                className="w-full text-left px-8 py-6 flex items-center justify-between gap-6"
              >
                <h3 className={`text-xl font-bold transition-colors ${openIndex === i ? 'text-primary' : 'text-navy'}`}>
                  {faq.question}
                </h3>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${openIndex === i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <Motion.div
                    id={`faq-answer-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-6 pt-2 text-gray-600 font-medium leading-relaxed border-t border-gray-50">
                      {faq.answer}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </Motion.div>
          ))}
        </div>
      </section>

      <section className="mt-8 max-w-3xl mx-auto px-6">
        <div className="bg-navy rounded-[32px] py-10 px-8 text-center text-white relative overflow-hidden flex flex-col items-center">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
          
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/10 relative z-10">
            <MessageCircleQuestion size={32} className="text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 relative z-10 text-white">Ready to get started?</h2>
          <p className="text-blue-100/60 text-base md:text-lg mb-8 max-w-xl relative z-10">
            Choose your enrollment plan and take the first step toward your credit goals.
          </p>
          <Link to="/get-started" className="auth-button min-w-[240px] relative z-10">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
