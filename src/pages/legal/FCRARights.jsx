import React from 'react';
import { ShieldCheck } from 'lucide-react';

const FCRARights = () => {
  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 md:p-16 rounded-3xl shadow-[0_10px_40px_rgba(0,45,91,0.05)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tight">Your Rights Under the Fair Credit Reporting Act (FCRA)</h1>
        </div>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          <p>The federal Fair Credit Reporting Act (FCRA) promotes the accuracy, fairness, and privacy of information in the files of consumer reporting agencies. Here is a summary of your major rights under the FCRA.</p>
          
          <ul className="list-disc pl-5 space-y-4 font-medium text-navy/80">
             <li><strong>You must be told if information in your file has been used against you.</strong> Anyone who uses a credit report or another type of consumer report to deny your application for credit, insurance, or employment must tell you, and must give you the name, address, and phone number of the agency that provided the information.</li>
             <li><strong>You have the right to know what is in your file.</strong> You may request and obtain all the information about you in the files of a consumer reporting agency. You will be required to provide proper identification, which may include your Social Security number.</li>
             <li><strong>You have the right to ask for a credit score.</strong> Credit scores are numerical summaries of your credit-worthiness based on information from credit bureaus. You may request a credit score from consumer reporting agencies that create scores or distribute scores.</li>
             <li><strong>You have the right to dispute incomplete or inaccurate information.</strong> If you identify information in your file that is incomplete or inaccurate, and report it to the consumer reporting agency, the agency must investigate unless your dispute is frivolous.</li>
             <li><strong>Consumer reporting agencies must correct or delete inaccurate, incomplete, or unverifiable information.</strong> Inaccurate, incomplete, or unverifiable information must be removed or corrected, usually within 30 days. However, a consumer reporting agency may continue to report information it has verified as accurate.</li>
             <li><strong>Consumer reporting agencies may not report outdated negative information.</strong> In most cases, a consumer reporting agency may not report negative information that is more than seven years old, or bankruptcies that are more than 10 years old.</li>
             <li><strong>Access to your file is limited.</strong> A consumer reporting agency may provide information about you only to people with a valid need, usually to consider an application with a creditor, insurer, employer, landlord, or other business.</li>
             <li><strong>You may limit "prescreened" offers of credit and insurance you get based on information in your credit report.</strong> Unsolicited "prescreened" offers for credit and insurance must include a toll-free phone number you can call if you choose to remove your name and address from the lists these offers are based on.</li>
          </ul>
          <p className="mt-8 italic text-sm">For more information, including information about additional rights, go to www.consumerfinance.gov/learnmore or write to: Consumer Financial Protection Bureau, 1700 G Street N.W., Washington, DC 20552.</p>
        </div>
      </div>
    </div>
  );
};

export default FCRARights;
