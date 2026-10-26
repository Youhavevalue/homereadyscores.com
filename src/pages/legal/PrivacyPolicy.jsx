import React from 'react';
import { ShieldCheck } from 'lucide-react';
const PrivacyPolicy = () => (
  <div className="hrs-legal-page pt-32 pb-24 bg-surface min-h-screen">
    <article className="max-w-4xl mx-auto px-6 bg-white p-8 md:p-16 rounded-3xl border border-gray-100">
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100"><ShieldCheck size={24} className="text-primary shrink-0" /><h1 className="text-2xl md:text-3xl font-black text-navy">Website Privacy Policy</h1></div>
      <div className="prose prose-lg max-w-none text-gray-600 space-y-6 font-medium">
        <p className="text-sm">Website processing information updated October 25, 2026.</p>
        <h2 className="text-xl font-bold text-navy">Information submitted through this website</h2>
        <p>The enrollment form collects your name, email address, phone number, credit goal, single or couple plan preference, ZIP code and credit-report acknowledgment. It saves your enrollment details and a confirmation reference. It does not collect a payment, create a subscription or sign a service agreement.</p>
        <p>The credit-help questionnaire asks for your credit goal, main credit concern and an optional, self-reported score range. Selecting “Save and continue” sends HomeReady Scores those answers and your name and email address. A phone number is required later if you continue to enrollment. If you skip the questionnaire, that choice is recorded separately from answered questions.</p>
        <p>Your saved contact details and answers remain available to authorized staff even if you leave before submitting an enrollment request. Staff use them to review your request, respond about the help you requested, and record follow-up notes and the request’s status. Requesting a consultation does not book an appointment. Saving a request does not subscribe you to promotional messages.</p>
        <p>Do not submit card information, Social Security numbers, identity documents or credit reports through the enrollment form or ordinary email. Ask the team about an appropriate document-sharing process first.</p>
        <h2 className="text-xl font-bold text-navy">How the website processes enrollment information</h2>
        <p>Vercel hosts the website and its server endpoints. Supabase stores enrollment information and supports the private staff workspace and private document storage. Authorized staff use your enrollment information to coordinate service setup and keep follow-up notes. The current enrollment flow does not send your information to a CRM or payment processor.</p>
        <p>Completing the enrollment form does not authorize a dispute or communication with a credit bureau or creditor. Any service engagement is separate from this enrollment form.</p>
        <h2 className="text-xl font-bold text-navy">Browser storage and staff access</h2>
        <p>Staff sign-in uses a server session cookie. The website may retain a confirmed enrollment reference in your browser tab so you can return to its confirmation; this reference does not contain your contact details. Browser storage can be cleared using your browser controls.</p>
        <p>After you save a credit-help request, a return cookie lets this browser retrieve your saved details without placing them in a link. The cookie expires after seven days. Clearing the cookie can prevent you from returning to those details in this browser; cookie expiration or removal does not delete the request stored by HomeReady Scores. Use the contact information below for a request concerning your submitted information.</p>
        <h2 className="text-xl font-bold text-navy">First-party website measurements</h2>
        <p>The website uses a random tab session identifier to measure public page visits, enrollment steps and saved enrollments. Campaign information is limited to predefined channel categories and registered campaign codes; unrecognized values are categorized without retaining the original text. It does not send your name, contact details, credit goal, documents or enrollment reference to the website measurement endpoint. Full URLs, search queries and arbitrary referrer domains are not stored by that endpoint. No advertising pixel is installed by this feature.</p>
        <p>Browser tab storage also keeps a random retry key to avoid duplicate saves. It does not store the contact form draft. Optional visit and progress measurements are skipped when your browser sends Global Privacy Control or Do Not Track; completing enrollment still saves the necessary business record and its confirmation. Browser restrictions and network errors can make measurements incomplete.</p>
        <h2 className="text-xl font-bold text-navy">Communications</h2>
        <p>Providing a phone number during enrollment does not subscribe you to promotional text messages. Automated text messaging is currently unavailable. Your enrollment information is saved for service setup.</p>
        <h2 className="text-xl font-bold text-navy">Questions and requests</h2>
        <p>Email <a href="mailto:help@homereadyscores.com" className="underline">help@homereadyscores.com</a> with privacy questions or a request concerning information you submitted. Include your enrollment reference if available, and do not include sensitive documents. Text support is currently unavailable.</p>
      </div>
    </article>
  </div>
);
export default PrivacyPolicy;
