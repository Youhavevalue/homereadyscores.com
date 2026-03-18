import React from 'react';
import { ShieldCheck } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 md:p-16 rounded-3xl shadow-[0_10px_40px_rgba(0,45,91,0.05)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tight">Terms of Service</h1>
        </div>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6 font-medium">
          <p className="text-sm uppercase tracking-widest text-primary font-black mb-8">Last Updated: March 18, 2026</p>
          
          <h3 className="text-xl font-bold text-navy">1. Acceptance of Terms</h3>
          <p>By accessing or using the services provided by Home Ready Scores ("Company", "we", "our", or "us"), you agree to be bound by these Terms of Service. If you do not agree with any part of these Terms, you may not use our services.</p>

          <h3 className="text-xl font-bold text-navy mt-8">2. Description of Services</h3>
          <p>Home Ready Scores provides credit document processing, dispute preparation, and credit mentoring services. We assist clients in exercising their rights to dispute inaccurate, incomplete, erroneous, or obsolete items on their credit reports with the three major credit reporting agencies (Experian, Equifax, and TransUnion).</p>

          <h3 className="text-xl font-bold text-navy mt-8">3. No Guarantee Policy</h3>
          <p>By agreeing to these terms, you understand and acknowledge that <strong>NO credit repair organization can legally guarantee a specific outcome, score increase, or timeline</strong>. Individual results vary based on the specifics of a client's credit file, the cooperation of creditors, and the time required for credit bureaus to investigate disputes. We guarantee our effort, process, and commitment to you, but we do not guarantee specific point increases.</p>

          <h3 className="text-xl font-bold text-navy mt-8">4. Client Obligations</h3>
          <ul className="list-disc pl-5">
             <li>You agree to provide true, accurate, and complete information regarding your identity and credit history.</li>
             <li>You agree to maintain an active credit monitoring subscription required for us to track changes and prepare disputes.</li>
             <li>You agree to promptly forward any correspondence received from the credit bureaus or creditors to our team so we can continue the dispute process effectively.</li>
          </ul>

          <h3 className="text-xl font-bold text-navy mt-8">5. Right to Cancel</h3>
          <p>As required by the Credit Repair Organizations Act (CROA), you may cancel this contract without any penalty or obligation at any time before midnight of the third business day after the date on which you signed the contract. A Notice of Cancellation form will be provided to you upon enrollment.</p>

          <h3 className="text-xl font-bold text-navy mt-8">6. Payment Terms</h3>
          <p>Payments for services rendered are strictly billed in arrears. No fees will be collected until the services outlined in your signed service agreement have been fully performed. Recurring monthly fees cover ongoing document processing and disputes executed during the prior month.</p>

          <h3 className="text-xl font-bold text-navy mt-8">7. Limitation of Liability</h3>
          <p>Under no circumstances shall Home Ready Scores, its affiliates, directors, or employees be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of our services, including but not limited to, damages for loss of profits, data, or other intangible losses.</p>

          <h3 className="text-xl font-bold text-navy mt-8">8. Contact Information</h3>
          <p>For questions or concerns regarding these terms, please contact us at:</p>
          <ul className="list-disc pl-5">
             <li><strong>Email:</strong> help@homereadyscores.com</li>
             <li><strong>Text Support:</strong> 972-128-0009</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
