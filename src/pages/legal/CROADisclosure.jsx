import React from 'react';
import { ShieldCheck } from 'lucide-react';

const CROADisclosure = () => {
  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 md:p-16 rounded-3xl shadow-[0_10px_40px_rgba(0,45,91,0.05)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tight">Credit Repair Organizations Act (CROA) Disclosure</h1>
        </div>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          <h2 className="text-xl font-bold text-navy uppercase tracking-wider mb-4">Consumer Credit File Rights Under State and Federal Law</h2>
          <p>You have a right to dispute inaccurate information in your credit report by contacting the credit bureau directly. However, neither you nor any "credit repair" company or credit repair organization has the right to have accurate, current, and verifiable information removed from your credit report. The credit bureau must remove accurate, negative information from your report only if it is over 7 years old. Bankruptcy information can be reported for 10 years.</p>
          <p>You have a right to obtain a copy of your credit report from a credit bureau. You may be charged a reasonable fee. There is no fee, however, if you have been turned down for credit, employment, insurance, or a rental dwelling because of information in your credit report within the preceding 60 days. The credit bureau must provide someone to help you interpret the information in your credit file. You are entitled to receive a free copy of your credit report if you are unemployed and intend to apply for employment in the next 60 days, if you are a recipient of public welfare assistance, or if you have reason to believe that there is inaccurate information in your credit report due to fraud.</p>
          <p>You have a right to sue a credit repair organization that violates the Credit Repair Organizations Act. This law prohibits deceptive practices by credit repair organizations.</p>
          <p>You have the right to cancel your contract with any credit repair organization for any reason within 3 business days from the date you signed it.</p>
          <p>Credit bureaus are required to follow reasonable procedures to ensure that the information they report is accurate. However, mistakes may occur.</p>
          <p>You may, on your own, notify a credit bureau in writing that you dispute the accuracy of information in your credit file. The credit bureau must then reinvestigate and modify or remove inaccurate or incomplete information. The credit bureau may not charge any fee for this service. Any pertinent information and copies of all documents you have concerning an error should be given to the credit bureau.</p>
          <p>If the credit bureau's reinvestigation does not resolve the dispute to your satisfaction, you may send a brief statement to the credit bureau, to be kept in your file, explaining why you think the record is inaccurate. The credit bureau must include a summary of your statement about disputed information with any report it issues about you.</p>
          <p>The Federal Trade Commission regulates credit bureaus and credit repair organizations. For more information contact: The Public Reference Branch, Federal Trade Commission, Washington, D.C. 20580.</p>
        </div>
      </div>
    </div>
  );
};

export default CROADisclosure;
