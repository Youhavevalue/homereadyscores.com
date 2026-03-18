import React from 'react';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-6 bg-white p-12 md:p-16 rounded-3xl shadow-[0_10px_40px_rgba(0,45,91,0.05)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tight">Privacy Policy</h1>
        </div>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6 font-medium">
          <p className="text-sm uppercase tracking-widest text-primary font-black mb-8">Last Updated: March 18, 2026</p>
          
          <h3 className="text-xl font-bold text-navy">1. Information We Collect</h3>
          <p>We collect information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website, or otherwise when you contact us.</p>
          <ul className="list-disc pl-5">
             <li><strong>Personal Information Provided by You:</strong> Names, phone numbers, email addresses, mailing addresses, billing addresses, debit/credit card numbers, and other similar information.</li>
             <li><strong>Sensitive Information:</strong> In order to provide our credit repair services, we may require sensitive information such as Social Security Numbers, dates of birth, and access to third-party credit monitoring services. All sensitive information is handled securely and encrypted.</li>
          </ul>

          <h3 className="text-xl font-bold text-navy mt-8">2. How We Use Your Information</h3>
          <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
          <ul className="list-disc pl-5">
             <li>To fulfill and manage your orders and provide credit document processing/disputing services.</li>
             <li>To securely communicate with credit bureaus (Equifax, Experian, TransUnion) and your creditors on your behalf.</li>
             <li>To send administrative information to you, such as updates to our terms, conditions, and policies.</li>
          </ul>

          <h3 className="text-xl font-bold text-navy mt-8">3. Will Your Information Be Shared With Anyone?</h3>
          <p>We will never sell or rent your personal information to third parties. We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
          <p>Specifically, we share your data with:</p>
          <ul className="list-disc pl-5">
             <li><strong>Credit Bureaus & Creditors:</strong> As necessary to dispute inaccurate, erroneous, or obsolete remarks on your credit profile.</li>
             <li><strong>Service Providers:</strong> We use secure, third-party software (such as our CRM, GoHighLevel, and payment processors like Clover/Stripe) to process payments and manage your client file securely.</li>
          </ul>

          <h3 className="text-xl font-bold text-navy mt-8">4. SMS and Communications Policy</h3>
          <p>By providing your phone number, you explicitly consent to receive SMS communications from Home Ready Scores for support, updates, and marketing. Standard message and data rates may apply. SMS consent will not be shared with any third parties for their own marketing purposes.</p>

          <h3 className="text-xl font-bold text-navy mt-8">5. Contact Us</h3>
          <p>If you have questions or comments about this notice, you may email us at <strong>help@homereadyscores.com</strong> or securely text our support team at <strong>972-128-0009</strong>.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
