import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: "How exactly does credit repair work?",
    answer: "We use federal consumer protection laws, like the Fair Credit Reporting Act (FCRA), to challenge inaccurate, outdated, and unverifiable negative items on your credit report. If the credit bureaus cannot verify the item with the original creditor, they are legally required to remove it from your profile."
  },
  {
    question: "How long does it take to see results?",
    answer: "Most of our clients start seeing real changes to their credit profile in as little as 45 days. However, everyone's credit situation is uniquely different. While some files clean up quickly, more complex issues may take a few rounds of disputes to fully resolve."
  },
  {
    question: "What types of negative items can be removed?",
    answer: "We commonly assist with challenging and removing late payments, collections, charge-offs, bankruptcies, foreclosures, hard inquiries, and medical debt. If an item is unfair, inaccurate, or cannot be verified, we can dispute it on your behalf."
  },
  {
    question: "Can you guarantee that my score will go up?",
    answer: "It is illegal for any reputable credit company to guarantee a specific score increase or a specific timeline. What we do provide is a proven track record of success and our commitment to a relentless, legally-sound dispute process. We guarantee our effort to fight for the best possible outcome for your financial future."
  },
  {
    question: "Do I need to do anything while you work on my credit?",
    answer: "Yes, teamwork is required! We need you to maintain an active credit monitoring subscription so we can track the changes being made. We also strongly advise you to avoid applying for new credit, keep your revolving credit card balances low, and continue to pay all your current bills on time."
  },
  {
    question: "When will I be ready to apply for a mortgage?",
    answer: "Your exact timeline depends on your starting score, your debt-to-income ratio, and the severity of the negative items on your report. Our entire program is optimized specifically to get you 'Home Ready'. We provide a detailed client portal so you can track your progress and know exactly when you're in the right position to talk to a lender."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="text-center animate-slide-up mb-16">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest mb-6 border border-primary/20">
            Expert Answers
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-8 leading-tight text-navy">
            Common Questions About <span className="text-primary italic">Credit Repair.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-0 max-w-2xl mx-auto leading-relaxed font-medium">
            Everything you need to know about getting your credit profile ready for your new home.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${openIndex === i ? 'border-primary/30 shadow-xl shadow-primary/5' : 'border-gray-100 shadow-sm hover:border-gray-300'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
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
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-6 pt-2 text-gray-600 font-medium leading-relaxed border-t border-gray-50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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
          <h2 className="text-3xl md:text-4xl font-black mb-4 relative z-10 text-white">Still have questions?</h2>
          <p className="text-blue-100/60 text-base md:text-lg mb-8 max-w-xl relative z-10">
            Our credit specialists are ready to review your situation and explain exactly how we can help you get the keys to your new home.
          </p>
          <Link to="/get-started" className="auth-button min-w-[240px] relative z-10">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
