/**
 * Sales training copy for Home Ready Scores — aligned with Get Started pricing and admin UI.
 * Blocks: { type: 'p'|'h3'|'ul'|'ol'|'blockquote', ... }
 */

export const salesTrainingMeta = {
  title: 'Sales Training Program',
  subtitle:
    'Everything a new rep needs to know to sell credit repair and manage clients from day one.',
};

export const salesTrainingSections = [
  {
    id: 'what-we-do',
    number: 1,
    title: 'What we do',
    blocks: [
      {
        type: 'p',
        text:
          'Home Ready Scores helps clients nationwide improve their credit profiles so they can qualify for a mortgage and buy a home. We dispute inaccurate or unverifiable negative items and support clients through a clear path to being mortgage-ready.',
      },
      { type: 'h3', text: 'Enrollment pricing (current product)' },
      {
        type: 'p',
        text:
          'Pricing matches the public Get Started flow: Single enrollment is $184.99 due today, then $114.00/month. Couple enrollment is $304.99 due today, then $190.00/month. Always confirm current campaigns on the website if marketing runs a limited-time offer.',
      },
      {
        type: 'ul',
        items: [
          '100% satisfaction guarantee (see legal pages on the site for wording)',
          'Transparent enrollment — no hidden fees in our standard offer',
          'Partnership framing: we work with the client’s realtor and mortgage partners so progress is visible, not “repair in a vacuum.”',
          'Nationwide mortgage-partner ecosystem — use the talking points your leadership provides for closing credits or lender partnerships.',
        ],
      },
      { type: 'h3', text: 'How we approach credit improvement' },
      {
        type: 'ul',
        items: [
          'After enrollment, the team pulls credit reports and builds a dispute strategy tailored to the client’s file.',
          'Disputes are sent to the three major bureaus (Equifax, Experian, TransUnion) using legally sound letters — not generic spam templates.',
          'Clients often begin seeing movement within several weeks; full mortgage readiness commonly takes months — set honest expectations (your leadership will define exact timelines for your desk).',
          'We emphasize partnership, speed of execution, and clear communication so the client and their mortgage pro stay aligned.',
        ],
      },
      { type: 'h3', text: 'What makes us different' },
      {
        type: 'ol',
        items: [
          'Pipeline connection — we’re not just disputing and disappearing; we align with the client’s home-buying team.',
          'Speed and follow-through — faster cycles mean faster score movement when the file allows.',
          'Value story — frame repair as an investment in closing; use approved marketing on guarantees and any closing-table benefits your leadership authorizes.',
        ],
      },
    ],
  },
  {
    id: 'sales-script',
    number: 2,
    title: 'The sales script',
    blocks: [
      {
        type: 'p',
        text:
          'Run this cold-call flow until it’s second nature. Adapt details to Home Ready Scores naming and current pricing when you quote fees.',
      },
      { type: 'h3', text: 'Opening' },
      {
        type: 'blockquote',
        text:
          'Hello, [NAME]. It’s [YOUR NAME] with Home Ready Scores. How are you doing? Thank you for taking my call. I understand that you are interested in purchasing a home, but need help with your credit. What is your time frame for wanting to buy the new home?',
      },
      {
        type: 'p',
        text: 'Pause. Their timeline tells you urgency.',
      },
      {
        type: 'blockquote',
        text:
          'Great — I can help with that. Please give me an idea of what is going on with your credit, so I can explain how we can help.',
      },
      {
        type: 'p',
        text: 'Listen. Let them explain.',
      },
      { type: 'h3', text: 'The three selling points' },
      {
        type: 'p',
        text: 'After their story, deliver these three themes:',
      },
      {
        type: 'p',
        text:
          '1. The partnership — We work with your realtor and mortgage professional so everyone sees progress. You’re on a tracked path to homeownership, not guessing alone.',
      },
      {
        type: 'p',
        text:
          '2. Speed — Our process is built to move disputes forward efficiently so scores can improve as fast as the file allows.',
      },
      {
        type: 'p',
        text:
          '3. Guarantee + value — We stand behind our program (use exact guarantee language from marketing). When applicable, explain reimbursement or partner benefits exactly as compliance approves — never invent terms.',
      },
      { type: 'h3', text: 'The close' },
      {
        type: 'blockquote',
        text:
          'If you are serious about buying a home, we can start improving your credit on the plan that fits you — single or couple enrollment with the fees shown on our Get Started page. Many clients work toward mortgage readiness over a multi-month window. I can get you started today. Are you ready to begin?',
      },
      {
        type: 'p',
        text:
          'If yes: send the enrollment link immediately. If they hesitate: move to objection handling (Section 4).',
      },
    ],
  },
  {
    id: 'daily-workflow',
    number: 3,
    title: 'Your daily workflow',
    blocks: [
      {
        type: 'p',
        text: 'Structure your day so outreach and follow-up never slip.',
      },
      { type: 'h3', text: 'Before 9:00 AM: close list' },
      {
        type: 'p',
        text:
          'Write the names of people most likely to enroll today. Keep that list visible all day.',
      },
      { type: 'h3', text: '9:00–9:10 AM: NO ANSWER blast' },
      {
        type: 'p',
        text:
          'In CRM: everyone tagged NO ANSWER. Mass text to reschedule. Follow every ~2 hours (e.g. 9, 11, 1, 3, 5). Remove the tag when they reschedule or opt out.',
      },
      { type: 'h3', text: '9:15–9:20 AM: HOT list (personal texts)' },
      {
        type: 'p',
        text:
          'One conversation from enrolling — personalize each text. Repeat on a disciplined cadence until they book or decline.',
      },
      { type: 'h3', text: '9:30–9:40 AM: WARM leads' },
      {
        type: 'p',
        text:
          'Friendly mass-style outreach to warm leads — still aim to get a live conversation scheduled.',
      },
      { type: 'h3', text: 'Rest of day: calls' },
      {
        type: 'p',
        text:
          'Between text waves, dial HOT and WARM. Minimum target (e.g. 20–30 calls) per leadership standards.',
      },
      { type: 'h3', text: 'Missed scheduled call' },
      {
        type: 'ol',
        items: [
          'Call at the scheduled time.',
          'Text immediately with next-step or link.',
          'Reschedule follow-ups for several days.',
          'Tag NO ANSWER and restart cadence next business morning if needed.',
        ],
      },
      { type: 'h3', text: '“I need to think about it”' },
      {
        type: 'ol',
        items: [
          'Tag WARM.',
          'Follow up on cadence until they schedule, enroll, or say no.',
        ],
      },
    ],
  },
  {
    id: 'objections',
    number: 4,
    title: 'Objection handling',
    blocks: [
      {
        type: 'p',
        text:
          'Never treat “no” as final — redirect to the dream (homeownership). When full commitment feels heavy, offer a lighter next step.',
      },
      {
        type: 'ul',
        items: [
          '“Not right now.” → “May I ask why?”',
          '“Money is tight.” → “Let’s start with a free consultation so you know your options.”',
          '“I don’t want it.” → “I want to get you into a new home. Is there anything I can do to help?”',
          'Strong no → ask if they might want help in the future; stay professional.',
          '“Don’t call again.” → Respect the request per policy; document and cease outreach.',
          '“Credit repair doesn’t work.” → Lean on reviews and outcomes; pivot to whether they’re serious about buying a home.',
          '“I’m too busy.” → Offer to call on their schedule.',
          'Uncomfortable with credit repair → offer a mortgage partner consultation as a lower-friction step (only if your process includes it).',
        ],
      },
    ],
  },
  {
    id: 'pipeline',
    number: 5,
    title: 'Client status pipeline',
    blocks: [
      {
        type: 'p',
        text:
          'Know where every lead and client sits. Exact stage names may match your CRM configuration — align tags with leadership.',
      },
      {
        type: 'ul',
        items: [
          'Pending — new lead; contact quickly.',
          'Scheduled — call booked; be prepared.',
          'Active — enrolled; keep engagement high.',
          'Contact 1 / 2 / 3 — follow-up sequence.',
          'Complete — mortgage-ready; warm handoff.',
          'NSF — payment failed; fix billing fast.',
          'Cancelled — understand why; save when possible.',
          'Expired / cold — long-term nurture.',
        ],
      },
    ],
  },
  {
    id: 'platform',
    number: 6,
    title: 'Using the Home Ready Scores admin',
    blocks: [
      {
        type: 'p',
        text:
          'The admin panel (after login at /portal/login) is your operations hub. Sidebar groups match how work is organized.',
      },
      { type: 'h3', text: 'Navigation overview' },
      {
        type: 'ul',
        items: [
          'Dashboard — snapshot of clients, disputes, and operational signals.',
          'Clients — full directory; search and open any client.',
          'Prospects — pre-enrollment leads.',
          'Affiliates & Brokers — referral relationships and reports.',
          'FAQ, Help Desk, Appointments — support and scheduling.',
          'Web CMS & Letter system — site and letter content where enabled.',
          'System admin hub — contracts, invoices, settings, users, reports, communication, letter menu, hotlinks, etc.',
          'Autoresponders & API — automation and integrations.',
        ],
      },
      { type: 'h3', text: 'Client list' },
      {
        type: 'p',
        text:
          'Clients shows a searchable list. Open a client to work the file.',
      },
      { type: 'h3', text: 'Client profile tabs' },
      {
        type: 'p',
        text: 'Each client profile includes:',
      },
      {
        type: 'ul',
        items: [
          'Client status — identity, contact, notes, hot-link shortcuts for logging common outcomes, status, documents, assignments.',
          'All items — dispute / result tracker across bureaus.',
          'Open only — focused view of active disputes.',
          'Letters — letter workflow for that client.',
          'Billing — payment history and billing actions (e.g. Clover where configured).',
        ],
      },
      {
        type: 'p',
        text:
          'Use hotlinks and notes so every call and text is visible to the team — clients should never feel “nothing is happening.”',
      },
    ],
  },
  {
    id: 'process',
    number: 7,
    title: 'Credit repair process (after enrollment)',
    blocks: [
      {
        type: 'ol',
        items: [
          'Enrollment — client completes signup and fees per plan; reports are obtained.',
          'Analysis — negatives categorized; strategy assigned per item.',
          'Dispute letters — bureau and creditor disputes go out on schedule.',
          'Waiting — bureaus investigate; you keep the client updated.',
          'Results — updates logged in the tracker; next rounds as needed.',
          'Completion — when ready, hand off to mortgage partner per your playbook.',
        ],
      },
      { type: 'h3', text: 'Keeping clients engaged' },
      {
        type: 'ul',
        items: [
          'Log interactions in notes.',
          'Use hotlinks for fast, consistent documentation.',
          'Proactively message after results cycles.',
          'Reset expectations when bureaus are slow — silence drives cancellations.',
        ],
      },
    ],
  },
  {
    id: 'referrals',
    number: 8,
    title: 'Building referral partnerships',
    blocks: [
      {
        type: 'p',
        text:
          'Realtors and mortgage professionals have clients who can’t qualify yet — that’s your pipeline when framed correctly.',
      },
      {
        type: 'p',
        text:
          'Pitch: you turn stalled deals into future closings; you keep partners updated; clients return mortgage-ready.',
      },
      {
        type: 'p',
        text:
          'Deliver: transparent progress, professional handoffs, and only marketing claims leadership and compliance approve (including any score thresholds or incentives).',
      },
    ],
  },
  {
    id: 'new-hire-faq',
    number: 9,
    title: 'New hire FAQ — every question, scripted answers',
    blocks: [
      {
        type: 'p',
        text:
          'This is your single point of reference on the lead side (the Alex subaccount, where prospects ask sales questions before they enroll). Every question a prospect is likely to ask you, with the scripted answer that actually works. The scripts below are pulled from the live Tate (SMS) and Alex (voice) AI agent prompts, the production smoke tests we ran on the pod, the HRS Informational Package, the live Get Started flow, and the compliance rules in the CROA and FCRA. Read it until you can deliver every answer in your own voice. When you get a question that is not on this page, log it in the Help Desk and leadership will add it here.',
      },
      {
        type: 'h3',
        text: 'Section A — The 10 questions you will hear every single day',
      },
      { type: 'h3', text: '1. What is Home Ready Scores and what do you do?' },
      {
        type: 'blockquote',
        text:
          'Home Ready Scores helps clients nationwide improve their credit so they can qualify for a mortgage and buy a home. We dispute inaccurate or unverifiable negative items on all three credit bureaus and coach clients through a clear path to being mortgage ready. We sit inside the home buying pipeline with your realtor and loan officer, so everyone stays aligned and you never leave the path to homeownership.',
      },
      {
        type: 'p',
        text:
          'Key point we keep coming back to: we are not debt settlement, not a loan, not a consolidation company. We dispute, validate, and remove items that should not be on a credit report, and we coach the positive behaviors that grow the score in parallel. If a prospect asks what we do NOT do, say it in those exact words.',
      },
      { type: 'h3', text: '2. How much does it cost?' },
      {
        type: 'blockquote',
        text:
          'Two plans. Single Enrollment is $184.99 due today, then $114.00 a month. Couple Enrollment is $304.99 due today, then $190.00 a month. Both include the full three bureau review, a custom dispute strategy, bureau and creditor disputes on schedule, and our 100% Satisfaction Guarantee. Most clients see meaningful improvement in three to four months. Would you like to talk through how this fits your timeline?',
      },
      {
        type: 'p',
        text:
          'Always quote the current prices above. Older scripts reference $89, $99, $179, or $109. Those are outdated. The AI agents themselves still have stale pricing baked in as of the last pod audit, so if a prospect says Tate or Alex quoted them a different number, apologize, confirm the live price on homereadyscores.com/get-started, and quote only what is on the site.',
      },
      { type: 'h3', text: '3. How do I sign up? Where do I sign up?' },
      {
        type: 'blockquote',
        text:
          'Go to homereadyscores.com and click Get Started. It takes about five minutes. You will enter your name, email, phone, your primary goal, your plan (Single or Couple), your billing zip, and the credit report consent. Once you submit, the setup fee is charged and our team reaches out within 24 hours to complete your setup. I can stay on the line with you while you do it if you like.',
      },
      {
        type: 'p',
        text:
          'The Get Started flow is four steps: Information, Goal, Plan and Credit Reports, Confirmation. Walk them through each step if they are on the phone. If they are not near a computer, text or email the link homereadyscores.com/get-started and confirm they received it. They can complete the intake on their phone if needed.',
      },
      { type: 'h3', text: '4. How do I pay? How does billing work?' },
      {
        type: 'blockquote',
        text:
          'You pay right on the Get Started form. We use a PCI compliant payment system called Clover, and your card data is tokenized inside their iframe, so it never touches our server. The due today charge is the setup fee. Your monthly recurring charge starts one month after the setup fee date. You can use a debit or credit card.',
      },
      {
        type: 'p',
        text:
          'If a client asks about a failed payment or NSF: reassure them, fix the billing in the admin under their Client Profile > Billing, and confirm the new charge date. Do not leave a failed payment unanswered. It turns into a cancellation fast. The status tag in the admin will show NSF, and the canned Failed Enrollment Payment hot link is there for the note.',
      },
      { type: 'h3', text: '5. How long does the process take? When will I see results?' },
      {
        type: 'blockquote',
        text:
          'Movement usually starts in three to five weeks. The bureaus have 30 days to investigate and respond under the Fair Credit Reporting Act, so first round results come back inside that window. Full mortgage readiness commonly takes four to five months. Our marketing says a real difference in as little as 45 days, which is the first results timing, not full completion. Your timeline depends on what is on your file and how fast the bureaus respond.',
      },
      {
        type: 'p',
        text:
          'Set honest expectations. Do not promise a date you cannot back up. If they need to close in 30 days, be honest about whether that is realistic. Files with more complex damage may take longer than the typical 4 to 5 month window. Never promise a specific timeline beyond that realistic band.',
      },
      { type: 'h3', text: '6. What is the guarantee?' },
      {
        type: 'blockquote',
        text:
          'We stand behind our program with a 100% Satisfaction Guarantee. If we cannot help, you are not stuck with us. The exact terms are on our legal pages on the site, and I can send them to you if you like.',
      },
      {
        type: 'p',
        text:
          'Do not invent guarantee language. If a prospect asks for specifics (lifetime guarantee on deletions, refund windows, partial refunds), point them to the legal pages on homereadyscores.com and confirm with leadership before quoting anything beyond the 100% Satisfaction language. The historical lifetime guarantee on deletions staying deleted is a Legacy Credits position and must be confirmed with leadership before quoting verbatim.',
      },
      { type: 'h3', text: '7. What items can you remove?' },
      {
        type: 'blockquote',
        text:
          'We help with the full range of negative items that block a mortgage: bankruptcies (Chapter 7 and 13), repossessions, student loan issues, medical bills, late payments, collections, tax liens, identity theft items, charge offs, and excessive or unauthorized inquiries. If it should not be on your report, we can challenge it.',
      },
      {
        type: 'p',
        text:
          'Be careful with wording. We do not say we can remove anything. We say we dispute inaccurate, unverifiable, or unfair items. The CROA is strict about this. The script above is the compliant version.',
      },
      { type: 'h3', text: '8. What is the process after I sign up?' },
      {
        type: 'ol',
        items: [
          'Enrollment. You complete the Get Started form, the setup fee is charged, and we obtain your credit reports.',
          'Roadmap and analysis. Within 24 hours, our team reaches out. We pull all three bureau reports, walk through every negative item, and build a custom dispute strategy for each one. Each item gets a beginning status (like 120 Day Late, Charge Off, Collection, Repossession, Bankruptcy Chapter 7) and an assigned dispute template, what we call the tail end.',
          'Dispute letters go out. Within 48 hours of full enrollment, the first wave of disputes is sent to the bureaus and, where appropriate, the original creditors and collection agencies. These are legally crafted letters, not template spam.',
          'Bureau investigation window. The bureaus have 30 days to investigate and respond under the Fair Credit Reporting Act. This is where your engagement matters most. We keep you updated and manage the natural anxiety of waiting.',
          'First round results. Items get deleted, verified, or updated. Every result is logged in our Result Tracker with a Days For Results counter so you can see real progress.',
          'Next rounds. Anything not resolved in the first round gets a follow up dispute with a new strategy, a different angle of attack, different supporting documentation, different procedural challenges. The process repeats until your credit is mortgage ready.',
          'Completion and warm handoff. Once your score is where it needs to be, we hand you back to your loan officer or realtor so you can resume your purchase. You do not restart the home buying process, you continue it.',
        ],
      },
      { type: 'h3', text: '9. Do I need to get my own credit reports?' },
      {
        type: 'blockquote',
        text:
          'Yes. As part of intake, you agree that you understand you need to obtain your credit reports so we can begin. Free credit reports are part of intake. Our team will walk you through it during setup. Pulling your reports through us is a soft pull, so it never harms your scores.',
      },
      { type: 'h3', text: '10. Who is the ideal client for Home Ready Scores?' },
      {
        type: 'blockquote',
        text:
          'The buyer who wants a home but cannot qualify because of their credit. Usually a score below 640, a real near term goal of homeownership, often already in conversation with a loan officer or turned down by one, and frequently referred by a realtor whose buyer cannot get pre approved. We can also help clients whose stated goal is Buy a Car, Refinance Loan, or General Repair, but homebuyers are our bread and butter.',
      },
      {
        type: 'h3',
        text: 'Section B — The 10 questions you will hear from a hesitant or shopping prospect',
      },
      { type: 'h3', text: '11. How are you different from other credit repair companies?' },
      {
        type: 'blockquote',
        text:
          'Three things. First, pipeline connection. We are not just disputing and disappearing. We align with your realtor and mortgage professional so everyone sees your progress. Second, speed. Our process is built to move disputes forward efficiently so scores can improve as fast as the file allows. Third, the guarantee. We stand behind our program. When you are ready, we hand you back to your loan officer, not back to square one.',
      },
      {
        type: 'p',
        text:
          'Reinforce the pipeline point. Most credit repair companies dispute items and disappear. We connect to the mortgage pipeline, give the loan officer real time visibility into the referred client progress, and deliver the client back ready to close. Realtors and bankers refer to us because we do not lose their deals, we just delay them 4 to 5 months and bring them back funded.',
      },
      { type: 'h3', text: '12. Can I keep my loan officer and realtor?' },
      {
        type: 'blockquote',
        text:
          'Absolutely. We work with your existing team. The whole point is that you do not leave the path to homeownership. We take a four to five month detour to fix the credit blocker, your loan officer keeps the deal, your realtor keeps the listing, and you come back ready to close.',
      },
      { type: 'h3', text: '13. Will this hurt my score?' },
      {
        type: 'blockquote',
        text:
          'No. The dispute process itself does not hurt your score. Pulling your free credit reports through us is a soft pull, so it never harms your scores. In fact, removing inaccurate or unverifiable negatives usually moves the score up, and we coach you on the positive behaviors that grow the score in parallel.',
      },
      { type: 'h3', text: '14. Can I cancel?' },
      {
        type: 'blockquote',
        text:
          'Yes. There is a 3 day right of rescission under the Credit Repair Organizations Act, and we honor cancellations beyond that under our policy. Our 100% Satisfaction stance is documented in the legal pages on the site. You are never locked in.',
      },
      { type: 'h3', text: '15. What if items come back after they are deleted?' },
      {
        type: 'blockquote',
        text:
          'Historically we have offered a lifetime guarantee on deletions staying deleted. I want to give you the exact current wording, so let me check with leadership and send you the legal page that covers it. The short answer is we do not consider the job done when the item comes off, we consider it done when it stays off.',
      },
      {
        type: 'p',
        text:
          'Reps: do not quote the lifetime guarantee verbatim until leadership confirms the current wording. Send them to the legal pages on the site and flag the question to leadership in the Help Desk if they want it in writing.',
      },
      { type: 'h3', text: '16. Do I have to use a specific lender?' },
      {
        type: 'blockquote',
        text:
          'No. We work with the lender you already have. The most common pattern is your loan officer referred you to us, and they are the one you go back to when you are ready. But if you do not have one yet, we can connect you with a partner lender for a free consultation so you know exactly what your credit needs to look like.',
      },
      { type: 'h3', text: '17. Will my information be safe?' },
      {
        type: 'blockquote',
        text:
          'Yes. Billing runs through Clover, which is PCI compliant, so your card data never touches our server. Documents upload through secure storage. The team operates under standard data handling policies. We do not sell or share your information.',
      },
      { type: 'h3', text: '18. What if I miss a payment?' },
      {
        type: 'blockquote',
        text:
          'We tag the account NSF and reach out to you immediately. Fixing the billing fast prevents the account from rolling to Cancelled. Do not ignore the call. We would much rather work out a new charge date than pause your file.',
      },
      {
        type: 'p',
        text:
          'Reps: NSF turns into a cancellation fast. Reach out the same day, fix the billing in the admin under Client Profile > Billing, and confirm the new charge date in writing to the client. Use the Failed Enrollment Payment hot link for the note.',
      },
      { type: 'h3', text: '19. What if I am not comfortable with credit repair?' },
      {
        type: 'blockquote',
        text:
          'Totally fair. Let us schedule a free consultation with our partner lender. He will look at your specific situation and tell you exactly what your credit needs to look like. That way you know for sure what to do next, with no pressure.',
      },
      {
        type: 'p',
        text:
          'This is the pivot. When someone is uncomfortable with credit repair, offer the free mortgage consultation as a lower commitment step. Once the lender tells them what their score needs to be, they come back to us ready. This is the most important objection redirect on the page.',
      },
      { type: 'h3', text: '20. What if I have a question after I enroll?' },
      {
        type: 'blockquote',
        text:
          'You can reach us at help@homereadyscores.com or through the portal once your account is set up. Your rep will also proactively message you after each results cycle. You will never feel like nothing is happening.',
      },
      {
        type: 'p',
        text:
          'Reps: silence drives cancellations. Log every interaction in the admin under the client profile. Use hotlinks for fast, consistent notes. Proactively message the client after every results cycle, even if the update is just we are still waiting on the bureaus.',
      },
      {
        type: 'h3',
        text: 'Section C — Real smoke test questions and the answers the AI agents gave live',
      },
      {
        type: 'p',
        text:
          'These are actual test prompts we fired at the live Tate and Alex agents in the HRS Pod, and the actual replies that came back. Use them as the gold standard for tone, length, and routing logic. They are the closest thing to recorded calls we have right now.',
      },
      { type: 'h3', text: '21. Live Tate smoke test, sub 640 lead' },
      {
        type: 'blockquote',
        text:
          'Prospect: Hi, I saw your ad. My credit score is around 580 and I would like to buy a house. Can you help?',
      },
      {
        type: 'blockquote',
        text:
          'Tate: Hey there. Yes, we can absolutely help with that. With a score around 580, our credit repair enrollment is the right next step. You can sign up online right now at homereadyscores.com/get-started, or if you would rather talk it through first, I can get a specialist on the phone with you. When is a good time to chat?',
      },
      {
        type: 'p',
        text:
          'Why this works: Tate mirrors the casual tone, confirms the sub 640 routing, offers the enrollment link, and immediately offers the phone option. Notice it does not overexplain the process, it moves to the next step. Reps should mirror this rhythm on a live call.',
      },
      { type: 'h3', text: '22. Live Tate smoke test, 640+ lead' },
      {
        type: 'blockquote',
        text:
          'Prospect: My credit score is 720 and I am ready to apply for a mortgage. What is next?',
      },
      {
        type: 'blockquote',
        text:
          'Tate: That is great. With a 720 score, you are in a strong position to move forward on a mortgage. The best next step is a quick phone consultation so we can match you with the right lender and get your application started. When is a good time for a specialist to call you?',
      },
      {
        type: 'p',
        text:
          'Why this works: Tate does NOT send a third party link. We had a critical bug where Tate was sending 640+ leads to a third party site, and Marcus flagged it as a huge mistake. The fixed behavior is always book a phone consultation, never send any third party link, never name any outside company. Reps must follow the same rule on a live call.',
      },
      { type: 'h3', text: '23. Live Tate smoke test, lead demanding a third party link' },
      {
        type: 'blockquote',
        text:
          'Prospect: I heard you guys work with [outside company]. Can you send me their link?',
      },
      {
        type: 'blockquote',
        text:
          'Tate: I can not send you a link for any outside company, but our Home Ready Scores team will walk you through all your options on a quick call. When is a good time for us to connect?',
      },
      {
        type: 'p',
        text:
          'Why this works: zero mention of the outside company, even as a negation. This was the second hardening pass after Marcus said even mentioning the name was unacceptable. Reps must follow the same rule. Never name any outside company, even to say we do not work with them. Redirect to the consultation.',
      },
      { type: 'h3', text: '24. Live Tate smoke test, lead asking the company name and how to sign up' },
      {
        type: 'blockquote',
        text:
          'Prospect: My credit score is 580. What is the name of your company and how do I sign up?',
      },
      {
        type: 'blockquote',
        text:
          'Tate: Our company is Home Ready Scores. You can sign up for credit repair online right now at homereadyscores.com/get-started. It only takes about five minutes, and we have a 100% Satisfaction Guarantee. Would you like me to stay on the line while you do it, or is there a good time for a specialist to call you?',
      },
      {
        type: 'p',
        text:
          'Why this works: company name stated once, clearly. Enrollment link given. Guarantee mentioned. Phone option offered. The word Legacy never appears. Reps should follow this exact structure when asked the company name.',
      },
      { type: 'h3', text: '25. Live Alex voice smoke test, inbound caller opening' },
      {
        type: 'blockquote',
        text:
          'Alex: Hi, this is Alex with Home Ready Scores. Thanks for calling. I can help you get started with credit repair right now. It only takes five minutes. Are you near a computer or phone where you can get online?',
      },
      {
        type: 'p',
        text:
          'Why this works: Alex opens warm, states the company name, offers to help, and immediately moves to enrollment. Alex does not waste time qualifying. The caller called us for credit repair, so the job is to help them enroll, not to ask 20 questions first. Reps handling inbound calls should follow the same rhythm: open, confirm, move to enrollment.',
      },
      { type: 'h3', text: '26. Live Alex voice smoke test, caller who does not complete' },
      {
        type: 'blockquote',
        text:
          'Alex: No worries. When you are ready, just go to homereadyscores.com and click Get Started. It only takes five minutes and we have a 100% Satisfaction Guarantee. Do not wait too long, every day matters with credit.',
      },
      {
        type: 'p',
        text:
          'Why this works: no guilt, no pressure, clear next step, guarantee mentioned, light urgency. Reps should use the same tone when a prospect hesitates. Do not argue, do not beg, just leave the door open and the next step obvious.',
      },
      {
        type: 'h3',
        text: 'Section D — Credit score routing, the core logic you must memorize',
      },
      {
        type: 'p',
        text:
          'Tate and Alex both use a single number to route every lead: 640. You must know what happens on each side of that line.',
      },
      { type: 'h3', text: '27. What happens when a lead self reports below 640' },
      {
        type: 'blockquote',
        text:
          'You are on the credit repair path. I can get you signed up right now at homereadyscores.com/get-started, or if you would rather talk it through, I can have a specialist on the phone with you in a few minutes. Which works better for you?',
      },
      {
        type: 'p',
        text:
          'Action for the rep: send the enrollment link, offer the phone option, log the lead as a credit repair prospect. Do not send any mortgage application link. Do not refer them to any outside company.',
      },
      { type: 'h3', text: '28. What happens when a lead self reports 640 or above' },
      {
        type: 'blockquote',
        text:
          'That is great. With a score in that range, the best next step is a phone consultation so we can match you with the right lender and get your application moving. When is a good time for a specialist to call you?',
      },
      {
        type: 'p',
        text:
          'Action for the rep: book the phone consultation. Do NOT send a third party mortgage application link. Do NOT name any outside company. We had a critical bug where Tate was sending 640+ leads to a third party mortgage site, and Marcus flagged it as a huge mistake. The fixed behavior is always book a phone consultation, never send a third party link, never name any outside company.',
      },
      { type: 'h3', text: '29. What if the lead does not know their score' },
      {
        type: 'blockquote',
        text:
          'No problem. Do you have a rough idea of where your score sits, even a range? That helps me point you to the right next step. If you are not sure, I can get a specialist on the phone to help you figure it out.',
      },
      {
        type: 'p',
        text:
          'Action for the rep: ask for the self reported score. If they give a range, route based on the low end. If they truly do not know, book the phone consultation.',
      },
      {
        type: 'h3',
        text: 'Section E — Objection handling, the full redirect table',
      },
      {
        type: 'p',
        text:
          'Never treat no as final. Redirect to the dream, owning a home. When full commitment feels heavy, offer a lighter next step. These are the exact redirects that are baked into the AI agents and the sales script. Memorize them.',
      },
      { type: 'h3', text: '30. Not right now' },
      {
        type: 'blockquote',
        text: 'May I ask why?',
      },
      { type: 'h3', text: '31. Money is tight' },
      {
        type: 'blockquote',
        text:
          'That is okay. Let us do a free consultation so you know your options.',
      },
      { type: 'h3', text: '32. I do not want it' },
      {
        type: 'blockquote',
        text:
          'I want to get you into a new home. Is there anything I can do to help?',
      },
      { type: 'h3', text: '33. Strong no, seriously' },
      {
        type: 'blockquote',
        text:
          'Do you think you might want it in the future? Helping people get home is my passion. Just let me know when.',
      },
      { type: 'h3', text: '34. Do not ever call again' },
      {
        type: 'blockquote',
        text:
          'Understood. I respect that. Have a good day.',
      },
      {
        type: 'p',
        text:
          'Reps: respect the request, document it in the admin, cease outreach per policy. Do not argue, do not push back. The CROA and TCPA both protect this request.',
      },
      { type: 'h3', text: '35. Credit repair does not work' },
      {
        type: 'blockquote',
        text:
          'Have you read our reviews? We are rated number one in Texas. The real question is, are you serious about buying a home?',
      },
      { type: 'h3', text: '36. I am too busy' },
      {
        type: 'blockquote',
        text:
          'You are not too busy for your dreams. I will call you on your schedule, never too early, never too late. Tell me when to call.',
      },
      { type: 'h3', text: '37. I do not think it is right for me' },
      {
        type: 'blockquote',
        text:
          'Is buying a home right for you? Because we make that happen.',
      },
      { type: 'h3', text: '38. I do not feel comfortable' },
      {
        type: 'blockquote',
        text:
          'Totally fair. Let us schedule a free consultation with our partner lender. He will look at your specific situation and tell you exactly what your credit needs to look like. That way you know for sure what to do next, with no pressure.',
      },
      {
        type: 'p',
        text:
          'This is the most important redirect on the page. When someone is uncomfortable with credit repair, pivot to the free mortgage consultation. It is the lower commitment step that keeps them in the pipeline. Once the lender tells them what their score needs to be, they come back to us ready.',
      },
      { type: 'h3', text: '39. I need to think about it' },
      {
        type: 'ol',
        items: [
          'Tag the lead WARM in the admin.',
          'Follow up on cadence until they schedule, enroll, or say no.',
          'Do not let a think about it sit untouched for more than 24 hours.',
        ],
      },
      {
        'type': 'h3',
        'text': 'Section F — The credit repair process in detail, for when a prospect asks for it',
      },
      {
        type: 'p',
        text:
          'Use this when a prospect wants the full walkthrough before they sign up. Keep it conversational. Do not read it as a script, deliver it as an explanation.',
      },
      { type: 'h3', text: '40. Walk me through what you actually do to my credit' },
      {
        type: 'ol',
        items: [
          'Step 1, Enrollment. You complete the Get Started form on the website, agree to the credit report intake, and the setup fee is charged. The form captures your name, email, phone, primary goal, plan selection, billing zip, and the required credit report consent.',
          'Step 2, Roadmap and analysis. Within 24 hours, our team reaches out to complete setup. We pull all three bureau reports, walk through every negative item, and build a custom dispute strategy. Each item is categorized with a beginning status (for example, 120 Day Late, Charge Off, Collection, Repossession) and assigned a dispute template, what we call the tail end.',
          'Step 3, Dispute letters go out. Within 48 hours of full enrollment, the first wave of disputes is sent. Letters target both the bureaus and, where appropriate, the original creditors and collection agencies. We do not send template spam. Letters are legally crafted to the specific item and issue.',
          'Step 4, Bureau investigation window. Under the Fair Credit Reporting Act, the bureaus have 30 days to investigate and respond. This is where client engagement matters most. We keep you updated and manage the natural anxiety of waiting.',
          'Step 5, First round results. Responses come back. Items get deleted, verified, or updated. Every result is logged in the Result Tracker, which shows the status per bureau per item with a Days For Results counter.',
          'Step 6, Next rounds. Items not resolved in the first round get follow up disputes with different strategies, different angles of attack, different supporting documentation, different procedural challenges. The process repeats until the credit is mortgage ready.',
          'Step 7, Completion and warm handoff. Once the score is where it needs to be, we deliver the warm handoff back to your mortgage officer or realtor. You do not restart the home buying process, you resume it.',
        ],
      },
      { type: 'h3', text: '41. What bureaus do you dispute with' },
      {
        type: 'blockquote',
        text:
          'All three major bureaus. Equifax, Experian, and TransUnion. Every negative item gets a beginning status, an action, a dispute template (the tail end), and an optional Step 2 dispute if Round 1 does not resolve it. Each round is bureau specific, so we send three letters per item per round, one per bureau, plus a creditor direct letter where appropriate (Debt Validation, Qualified Written Request, etc).',
      },
      { type: 'h3', text: '42. What letters do you send' },
      {
        type: 'ul',
        items: [
          'Bureau letters: Round 1 Version 1 and 2, Round 2 Items Not Addressed, Round 2 Verification, and follow up rounds as items remain unresolved.',
          'Creditor letters: Direct Dispute, Debt Validation (any state), Debt Validation Standard, Debt Validation to CA for medical collections, Debt Validation with Arbitration, Post CRA Dispute to CA Verify Not Validate, Simple Qualified Written Request for mortgage servicer items, and Verification.',
          'Each letter is tied to the creditor in our database of over 4,420 creditors. We select the letter based on what has worked historically for that creditor.',
        ],
      },
      {
        type: 'p',
        text:
          'Reps: you do not need to memorize the letter names. You just need to know we have a legally sound, multi round, bureau and creditor direct dispute process, and that we do not send template spam. If a prospect wants deeper detail, offer the phone consultation with a specialist.',
      },
      {
        type: 'h3',
        text: 'Section G — Compliance, what reps must NEVER say',
      },
      {
        type: 'p',
        text:
          'Credit repair is regulated by federal law. The CROA (Credit Repair Organizations Act) and FCRA (Fair Credit Reporting Act) govern everything we say. Violating these is not a slap on the wrist, it is a legal exposure for the company. Memorize this list.',
      },
      { type: 'h3', text: '43. What I should never say to a prospect' },
      {
        type: 'ul',
        items: [
          'Never say we can remove anything. We only dispute inaccurate, unverifiable, or unfair items.',
          'Never say a score is guaranteed to go up by X points. Outcomes vary by file.',
          'Never say we can erase a bankruptcy, collection, or late for sure. We can challenge it. We cannot promise a specific outcome on a specific item.',
          'Never promise a specific timeline beyond the realistic 4 to 5 month window.',
          'Never quote a price other than the current Single $184.99 / $114 or Couple $304.99 / $190 unless you have confirmed the live price on the website.',
          'Never invent guarantee or refund terms. Point to the legal pages on homereadyscores.com and check with leadership for anything beyond the 100% Satisfaction language.',
          'Never mention Legacy Credits, Legacy Prime Lending, or any other company name. We are Home Ready Scores, period. Even as a negation. Even to say we do not work with them.',
          'Never tell a client we are a debt settlement company, a loan, or a consolidation service. We are not.',
          'Never leave a failed payment unanswered. NSF turns into a cancellation fast.',
          'Never leave a client in silence during the bureau investigation window. Silence is the single biggest reason clients cancel.',
          'Never refer to yourself as a bot or a call center. You are a Home Ready Scores specialist.',
          'Never defer to another team member as if you do not know the answer. You ARE the expert. If you genuinely do not know, say let me check with leadership and get right back to you, then log it in the Help Desk.',
        ],
      },
      { type: 'h3', text: '44. The legal pages every prospect can see' },
      {
        type: 'ul',
        items: [
          'Privacy Policy at homereadyscores.com/privacy',
          'Terms of Service at homereadyscores.com/terms',
          'FCRA Rights at homereadyscores.com/fcra-rights',
          'CROA Disclosure at homereadyscores.com/croa-disclosure',
          'The Get Started form requires explicit consent to obtain credit reports before enrollment can complete.',
        ],
      },
      {
        type: 'p',
        text:
          'Reps: if a prospect asks for anything in writing, send them to the relevant legal page. Do not summarize legal language from memory. The Get Started form itself carries the CROA required disclosure and the credit report consent, so a prospect who completes the form has seen the required disclosures.',
      },
      {
        type: 'h3',
        text: 'Section H — Referral partners, when a realtor or loan officer asks how this works',
      },
      {
        type: 'p',
        text:
          'Cold outbound is one channel. The real engine is referral partnerships. You will get questions from realtors and mortgage bankers who are thinking about sending you their unqualified buyers. Know these answers.',
      },
      { type: 'h3', text: '45. Why would a realtor refer to us' },
      {
        type: 'blockquote',
        text:
          'You have buyers every week who cannot qualify because their credit is not there yet. Right now those are dead deals. We turn them into closed deals in four to five months. You keep the relationship, you keep the listing, you keep the commission. We just delay the close, not cancel it.',
      },
      { type: 'h3', text: '46. Why would a mortgage banker refer to us' },
      {
        type: 'blockquote',
        text:
          'You run a credit pull on a prospect, the score comes back under 640, you cannot write the loan. Without us, that is a lost pipeline lead. With us, you refer the buyer to Home Ready Scores, you get real time visibility into their credit progress, you do not have to manage the credit fix yourself, and you get the buyer back ready to close in four to five months. You fund the loan you otherwise would have lost.',
      },
      { type: 'h3', text: '47. The pitch to a partner in one line' },
      {
        type: 'blockquote',
        text:
          'You run into buyers every week who cannot qualify because their credit is not there yet. We fix that. We plug into your pipeline, give you real time visibility on your client progress, and when they are ready, we hand them right back to you. You do not lose the deal, you delay it four to five months and bring it back funded.',
      },
      {
        type: 'p',
        text:
          'Reps: every client in the admin can be assigned an Affiliate (realtor or referrer) and a Broker (mortgage banker partner). The platform produces Affiliate Referral Reports, Broker Referral Reports, and Broker Creation Reports so leadership can see which partners are sending volume. Log the partner on the client profile so the referral shows up in the report.',
      },
      {
        type: 'h3',
        text: 'Section I — The admin platform, what a new rep needs to know on day one',
      },
      {
        type: 'p',
        text:
          'After login at homereadyscores.com/portal/login, you land on the admin shell at /admin. Here is the minimum you need to know to work a lead and a client.',
      },
      { type: 'h3', text: '48. How to log a note on a client' },
      {
        type: 'ol',
        items: [
          'Open the client profile from the Clients page.',
          'Go to the Client Status tab.',
          'Use the canned Hot Links for high frequency actions: Updated Experian, Updated Equifax, Updated TransUnion, Acknowledgments, Drafted Letters, NSF, Received All Docs, Client Phone Call, Welcome, Cancellation Phone Call, Next Round, Creditor Acknowledgement, Documentation Request, Failed Enrollment Payment.',
          'If the action is not in the hot links, type a manual note in the notes log.',
          'Every call, every text, every result cycle gets a note. No exceptions.',
        ],
      },
      { type: 'h3', text: '49. The client status pipeline' },
      {
        type: 'ul',
        items: [
          'Pending. New lead, not contacted yet. Call within 24 hours.',
          'Scheduled. Call is booked. Show up on time, have their info ready.',
          'Active. Enrolled, in repair. Regular check ins, prevent cancellation.',
          'Contact 1, 2, 3. Follow up attempts. Keep cadence going, increase urgency on 2, last push on 3.',
          'Complete. Credit repair finished. Warm handoff to loan officer or realtor.',
          'NSF. Payment failed. Reach out immediately, fix billing before it becomes a cancel.',
          'Cancelled. They quit. Diagnose why, some are saveable.',
          'Expired. Cold lead. Move to long term nurture, may return in 6 months.',
        ],
      },
      { type: 'h3', text: '50. The single biggest reason clients cancel' },
      {
        type: 'blockquote',
        text:
          'They feel like nothing is happening. Your job is to make sure they never feel that way. Log every interaction. Use hot links for consistent notes. Proactively message after each results cycle, even if the update is just we are still waiting on the bureaus. Silence is the enemy.',
      },
      {
        type: 'h3',
        text: 'Section J — The daily workflow, how to structure your day',
      },
      {
        type: 'p',
        text:
          'Structure your day so outreach and follow up never slip. This is the cadence the AI agents and the sales script are built around.',
      },
      { type: 'h3', text: '51. Before 9:00 AM, the close list' },
      {
        type: 'p',
        text:
          'Write the names of people most likely to enroll today. Keep that list visible all day.',
      },
      { type: 'h3', text: '52. 9:00 to 9:10 AM, the NO ANSWER blast' },
      {
        type: 'p',
        text:
          'In the CRM, everyone tagged NO ANSWER. Mass text to reschedule. Follow every 2 hours (9, 11, 1, 3, 5). Remove the tag when they reschedule or opt out.',
      },
      { type: 'h3', text: '53. 9:15 to 9:20 AM, the HOT list personal texts' },
      {
        type: 'p',
        text:
          'One conversation from enrolling. Personalize each text. Repeat on a disciplined cadence until they book or decline.',
      },
      { type: 'h3', text: '54. 9:30 to 9:40 AM, the WARM leads' },
      {
        type: 'p',
        text:
          'Friendly mass style outreach to warm leads. Still aim to get a live conversation scheduled.',
      },
      { type: 'h3', text: '55. Rest of day, calls' },
      {
        type: 'p',
        text:
          'Between text waves, dial HOT and WARM. Minimum 20 to 30 calls per day per leadership standards.',
      },
      { type: 'h3', text: '56. Missed scheduled call' },
      {
        type: 'ol',
        items: [
          'Call at the scheduled time.',
          'Text immediately with next step or link.',
          'Reschedule follow ups for several days.',
          'Tag NO ANSWER and restart cadence next business morning if needed.',
        ],
      },
      {
        type: 'h3',
        text: 'Section K — The glossary, words you will hear and must know',
      },
      {
        type: 'p',
        text:
          'You will hear these terms from leadership, from the AI agent prompts, and from the platform. Know them cold.',
      },
      { type: 'h3', text: '57. Glossary' },
      {
        type: 'ul',
        items: [
          'Bureau. One of the three major credit reporting agencies: Equifax, Experian, TransUnion.',
          'Beginning status. The classification of a negative item when it enters our dispute system (for example, 120 Day Late, Collection, Charge Off).',
          'Tail end. The dispute language template applied to a negative item. The system has 29+ tail end templates.',
          'DFR. Days For Results. Counter on the client profile showing how long since a dispute was sent.',
          'Round. A pass of disputes. Round 1 is the initial wave, subsequent rounds address items not resolved.',
          'DV. Debt Validation. A letter sent directly to a creditor or collection agency demanding they prove the debt is valid.',
          'QWR. Qualified Written Request. A specific type of letter used primarily on mortgage servicer items under RESPA.',
          'Direct Dispute. A dispute filed directly with the creditor rather than the bureau.',
          'FCRA. Fair Credit Reporting Act. Federal law governing how credit information is collected, used, and disputed.',
          'CROA. Credit Repair Organizations Act. Federal law governing how credit repair companies operate, what they can charge, what they must disclose, and the 3 day cancellation right.',
          'NSF. Non Sufficient Funds. Status applied when a client recurring payment fails.',
          'Warm handoff. The structured return of a mortgage ready client back to the loan officer or realtor who originally referred them.',
          'Get Started flow. The four step enrollment form on the public site: Information, Goal, Plan and Credit Reports, Confirmation.',
          'Single Enrollment. $184.99 due today, $114 per month. One client.',
          'Couple Enrollment. $304.99 due today, $190 per month. Two related clients (spouses, joint applicants) under one plan.',
          'Tate. The SMS Conversation AI agent in the HRS Pod.',
          'Alex. The voice AI agent for inbound calls in the HRS Pod.',
          'HRS Pod. The GoHighLevel subaccount under the Just Add Value agency where all HRS operations run. Previously labeled Alex Pod or 2. Alex.',
          'Legacy Credits. The prior brand name for the same company. Some legal entities, AI agent scripts, and historical training materials still reference this name. Never say this name to a prospect.',
        ],
      },
      {
        type: 'h3',
        text: 'Section L — What to do when you do not know the answer',
      },
      {
        type: 'ol',
        items: [
          'Say: That is a great question. Let me check with leadership and get right back to you. I want to give you the right answer, not a guess.',
          'Log the question in the Help Desk with the client name and the exact question.',
          'Leadership will answer it, and if it is a common question, it gets added to this FAQ page.',
          'Never invent an answer. Never guess on pricing, timelines, guarantees, or legal language. The CROA does not forgive guessing.',
        ],
      },
    ],
  },
  {
    id: 'full-scripts',
    number: 10,
    title: 'Full scripts — every call scenario, word for word',
    blocks: [
      {
        type: 'p',
        text:
          'These are the full word for word scripts for every call and text scenario you will face on the lead side. Read them until you can deliver them in your own voice without losing the structure. Each script is built from the live AI agent prompts (Tate and Alex), the production smoke tests, the cold call script, the objection table, and the nurture cadence. When you are on a live call, do not read these like a robot. Deliver them like a human who happens to know exactly what to say next.',
      },
      {
        type: 'h3',
        text: 'Script 1 — The cold call (outbound to a new lead)',
      },
      {
        type: 'h3',
        text: 'Opening',
      },
      {
        type: 'blockquote',
        text:
          'Hello, [NAME]. It is [YOUR NAME] with Home Ready Scores. How are you doing today? Thank you for taking my call. I understand that you are interested in purchasing a home, but need some help with your credit. What is your time frame for wanting to buy the new home?',
      },
      {
        type: 'p',
        text:
          'Pause. Their timeline tells you urgency. If they say 30 to 60 days, they are hot. If they say 6 to 12 months, they are warm. If they say they are not sure, they are early stage. Tag accordingly in the admin.',
      },
      {
        type: 'h3',
        text: 'Discovery',
      },
      {
        type: 'blockquote',
        text:
          'Great, I can help with that. Please give me an idea of what is going on with your credit, so I can explain how we can help.',
      },
      {
        type: 'p',
        text: 'Listen. Let them explain. Do not interrupt. Take notes in the admin while they talk. The more they feel heard, the more they will trust you.',
      },
      {
        type: 'h3',
        text: 'The three selling points',
      },
      {
        type: 'blockquote',
        text:
          'Based on what you told me, here is how we help. First, the partnership. We work directly with your realtor and your mortgage professional so everyone sees your progress. You are on a tracked path to homeownership, not guessing alone. Second, the speed. Our process is built to move disputes forward efficiently, so your score can improve as fast as your file allows. Most clients see real movement in about 45 days. Third, the guarantee. We stand behind our program with a 100% Satisfaction Guarantee. If we cannot help, you are not stuck with us.',
      },
      {
        type: 'h3',
        text: 'The close',
      },
      {
        type: 'blockquote',
        text:
          'If you are serious about buying a home, we can start improving your credit today on the plan that fits you. Single enrollment is $184.99 due today, then $114 a month. Couple enrollment is $304.99 due today, then $190 a month. Most clients work toward mortgage readiness over a 4 to 5 month window. I can get you started right now. Are you ready to begin?',
      },
      {
        type: 'p',
        text:
          'If yes: send the enrollment link immediately at homereadyscores.com/get-started. Stay on the line while they fill it out. If they hesitate: move to objection handling (Script 5). If they need to think about it: tag WARM and follow up on cadence. If they are not near a computer: text or email the link and confirm they received it.',
      },
      {
        type: 'h3',
        text: 'Script 2 — The inbound call (prospect called us)',
      },
      {
        type: 'blockquote',
        text:
          'Hi, this is [YOUR NAME] with Home Ready Scores. Thanks for calling. I can help you get started with credit repair right now. It only takes about five minutes. Are you near a computer or phone where you can get online?',
      },
      {
        type: 'p',
        text:
          'Why this opening works: it mirrors the Alex voice agent script exactly. You do not waste time qualifying. The caller called us for credit repair, so the job is to help them enroll, not to ask 20 questions first. If they say yes to being near a computer, walk them through the Get Started flow. If they say no, move to the phone consultation booking.',
      },
      {
        type: 'h3',
        text: 'If they are near a computer, walk them through enrollment',
      },
      {
        type: 'blockquote',
        text:
          'Perfect. Here is what we will do. Go to homereadyscores.com. Once you are there, click the Get Started button. I will walk you through the form, it is super quick. It is four steps: your information, your goal, your plan and credit reports, and confirmation. I will stay on the line the whole time.',
      },
      {
        type: 'p',
        text:
          'Walk them through each step. Be encouraging. Say things like, you are doing great, almost there, perfect. If they hesitate at any point, say: Remember, we have a 100% Satisfaction Guarantee. If we cannot help, you are not stuck with us.',
      },
      {
        type: 'h3',
        text: 'If they complete the form',
      },
      {
        type: 'blockquote',
        text:
          'Awesome, you are all set. Our team will reach out within 24 hours to get your documents and start working on your credit immediately. You just took the first step toward owning your home. Do you have any questions for me before we wrap up?',
      },
      {
        type: 'h3',
        text: 'If they do not complete the form on the call',
      },
      {
        type: 'blockquote',
        text:
          'No worries. When you are ready, just go to homereadyscores.com and click Get Started. It only takes five minutes and we have a 100% Satisfaction Guarantee. Do not wait too long, every day matters with credit. I will follow up with you tomorrow to see if you need any help getting through it.',
      },
      {
        type: 'p',
        text:
          'Action for the rep: tag the lead WARM in the admin. Set a follow up task for the next business day. Text them the link so they have it in writing. Do not let this lead go cold.',
      },
      {
        type: 'h3',
        text: 'Script 3 — The SMS follow up (Tate style)',
      },
      {
        type: 'p',
        text:
          'Tate is the SMS Conversation AI agent in the HRS Pod. The scripts below are pulled directly from the live Tate prompt and the production smoke tests. Use the same tone on your own texts: casual, purposeful, concise, customer focused, never refer to yourself as a bot or a call center, mirror the customer language, address concerns directly without overexplaining.',
      },
      {
        type: 'h3',
        text: 'First touch SMS to a new lead (sub 640 path)',
      },
      {
        type: 'blockquote',
        text:
          'Hey there, this is [YOUR NAME] with Home Ready Scores. Thanks for reaching out. With a score in that range, our credit repair enrollment is the right next step. You can sign up online right now at homereadyscores.com/get-started, or if you would rather talk it through first, I can get a specialist on the phone with you. When is a good time to chat?',
      },
      {
        type: 'h3',
        text: 'First touch SMS to a new lead (640+ path)',
      },
      {
        type: 'blockquote',
        text:
          'Hey there, this is [YOUR NAME] with Home Ready Scores. Thanks for reaching out. With a score in that range, you are in a strong position to move forward on a mortgage. The best next step is a quick phone consultation so we can match you with the right lender and get your application started. When is a good time for a specialist to call you?',
      },
      {
        type: 'h3',
        text: 'First touch SMS to a lead who does not know their score',
      },
      {
        type: 'blockquote',
        text:
          'Hey there, this is [YOUR NAME] with Home Ready Scores. Thanks for reaching out. Do you have a rough idea of where your score sits, even a range? That helps me point you to the right next step. If you are not sure, I can get a specialist on the phone to help you figure it out. When is a good time to chat?',
      },
      {
        type: 'h3',
        text: 'SMS to a lead who asked about pricing',
      },
      {
        type: 'blockquote',
        text:
          'I understand that concern. Our pricing is transparent. Single Enrollment is $184.99 due today, then $114 a month. Couple Enrollment is $304.99 due today, then $190 a month. Most clients see meaningful improvement in three to four months. Would you like to talk through how this fits your timeline?',
      },
      {
        type: 'h3',
        text: 'SMS to a lead who is hesitant about signing up',
      },
      {
        type: 'blockquote',
        text:
          'That makes sense, credit repair can feel like a big step. Home Ready Scores offers a simple and secure way to improve your score, and I can walk you through the process. Would you prefer to sign up online at homereadyscores.com/get-started, or is there a good time for us to chat by phone?',
      },
      {
        type: 'h3',
        text: 'SMS to a lead who asked for an outside company link',
      },
      {
        type: 'blockquote',
        text:
          'I can not send you a link for any outside company, but our Home Ready Scores team will walk you through all your options on a quick call. When is a good time for us to connect?',
      },
      {
        type: 'p',
        text:
          'Reps: never name any outside company, even to say we do not work with them. This is a hard rule from Marcus. Even mentioning the name as a negation is unacceptable. Redirect to the consultation.',
      },
      {
        type: 'h3',
        text: 'SMS to a lead who asked the company name and how to sign up',
      },
      {
        type: 'blockquote',
        text:
          'Our company is Home Ready Scores. You can sign up for credit repair online right now at homereadyscores.com/get-started. It only takes about five minutes, and we have a 100% Satisfaction Guarantee. Would you like me to stay on the line while you do it, or is there a good time for a specialist to call you?',
      },
      {
        type: 'h3',
        text: 'Script 4 — The warm handoff call (to a loan officer or realtor)',
      },
      {
        type: 'p',
        text:
          'This is the script for when a client is mortgage ready and you are handing them back to the loan officer or realtor who referred them. The warm handoff is non negotiable. The lead almost always belongs to the loan officer who referred it. We are a fix and return service, not a customer acquisition end state.',
      },
      {
        type: 'h3',
        text: 'Calling the loan officer',
      },
      {
        type: 'blockquote',
        text:
          'Hi [LO NAME], this is [YOUR NAME] with Home Ready Scores. I have great news. [CLIENT NAME] is mortgage ready. Their score is where it needs to be, the disputes are complete, and they are ready to move forward with you on the mortgage application. I wanted to hand them back to you directly so you can reactivate the deal. What is the best way for me to connect you two?',
      },
      {
        type: 'h3',
        text: 'Calling the realtor',
      },
      {
        type: 'blockquote',
        text:
          'Hi [REALTOR NAME], this is [YOUR NAME] with Home Ready Scores. I wanted to let you know that [CLIENT NAME] is mortgage ready. Their credit is where it needs to be and they are ready to move forward on the home purchase. I am handing them back to their loan officer today so you can reactivate the listing. Do you have any questions for me about where their file ended up?',
      },
      {
        type: 'h3',
        text: 'Texting the client to confirm the handoff',
      },
      {
        type: 'blockquote',
        text:
          'Hey [CLIENT NAME], great news. Your credit is where it needs to be and you are mortgage ready. I am connecting you back with [LO NAME] today so you can move forward on your mortgage application. You did the hard work, now go get your home. If you need anything from us, we are always here at help@homereadyscores.com.',
      },
      {
        type: 'h3',
        text: 'Script 5 — Objection handling on a live call',
      },
      {
        type: 'p',
        text:
          'Never treat no as final. Redirect to the dream, owning a home. When full commitment feels heavy, offer a lighter next step. These are word for word. Memorize them. They are pulled from the live AI agent prompts and the sales script.',
      },
      {
        type: 'h3',
        text: 'Not right now',
      },
      {
        type: 'blockquote',
        text: 'May I ask why?',
      },
      {
        type: 'p',
        text:
          'Then listen. Their why tells you the real objection. Address it directly, then move back to the close.',
      },
      {
        type: 'h3',
        text: 'Money is tight',
      },
      {
        type: 'blockquote',
        text:
          'That is okay. Let us do a free consultation so you know your options. No pressure, no commitment. Just a conversation so you know exactly what your credit needs to look like and how we can help you get there.',
      },
      {
        type: 'h3',
        text: 'I do not want it',
      },
      {
        type: 'blockquote',
        text:
          'I want to get you into a new home. Is there anything I can do to help? Tell me what is holding you back and let me see if I can address it.',
      },
      {
        type: 'h3',
        text: 'Strong no, seriously',
      },
      {
        type: 'blockquote',
        text:
          'Do you think you might want it in the future? Helping people get home is my passion. Just let me know when. I will be here.',
      },
      {
        type: 'h3',
        text: 'Do not ever call again',
      },
      {
        type: 'blockquote',
        text:
          'Understood. I respect that. Have a good day.',
      },
      {
        type: 'p',
        text:
          'Reps: respect the request, document it in the admin, cease outreach per policy. Do not argue, do not push back. The CROA and TCPA both protect this request.',
      },
      {
        type: 'h3',
        text: 'Credit repair does not work',
      },
      {
        type: 'blockquote',
        text:
          'Have you read our reviews? We are rated number one in Texas. The real question is, are you serious about buying a home? Because if you are, we can help you get there.',
      },
      {
        type: 'h3',
        text: 'I am too busy',
      },
      {
        type: 'blockquote',
        text:
          'You are not too busy for your dreams. I will call you on your schedule, never too early, never too late. Tell me when to call and I will be there.',
      },
      {
        type: 'h3',
        text: 'I do not think it is right for me',
      },
      {
        type: 'blockquote',
        text:
          'Is buying a home right for you? Because we make that happen. If homeownership is the goal, credit repair is the bridge. Let me show you how.',
      },
      {
        type: 'h3',
        text: 'I do not feel comfortable',
      },
      {
        type: 'blockquote',
        text:
          'Totally fair. Let us schedule a free consultation with our partner lender. He will look at your specific situation and tell you exactly what your credit needs to look like. That way you know for sure what to do next, with no pressure. Would [DAY] at [TIME] work for you?',
      },
      {
        type: 'p',
        text:
          'This is the most important redirect on the page. When someone is uncomfortable with credit repair, pivot to the free mortgage consultation. It is the lower commitment step that keeps them in the pipeline. Once the lender tells them what their score needs to be, they come back to us ready.',
      },
      {
        type: 'h3',
        text: 'I need to think about it',
      },
      {
        type: 'blockquote',
        text:
          'I understand. Let me ask you this: what is there to think about? Is it the timing, the cost, or something else? If I can address it right now, I will. If not, I will follow up with you [DAY] at [TIME]. Does that work?',
      },
      {
        type: 'p',
        text:
          'Action for the rep: tag the lead WARM in the admin. Set a follow up task. Do not let a think about it sit untouched for more than 24 hours. Follow up on cadence until they schedule, enroll, or say no.',
      },
      {
        type: 'h3',
        text: 'Script 6 — The referral partner pitch (to a realtor or loan officer)',
      },
      {
        type: 'p',
        text:
          'Cold outbound is one channel. The real engine is referral partnerships. You will call realtors and mortgage bankers who have buyers that cannot qualify because of their credit. This is the script for that call.',
      },
      {
        type: 'h3',
        text: 'Opening to a realtor',
      },
      {
        type: 'blockquote',
        text:
          'Hi [REALTOR NAME], this is [YOUR NAME] with Home Ready Scores. I know you run into buyers every week who cannot qualify because their credit is not there yet. Right now those are dead deals for you. We turn them into closed deals in four to five months. You keep the relationship, you keep the listing, you keep the commission. We just delay the close, not cancel it. Do you have five minutes to hear how it works?',
      },
      {
        type: 'h3',
        text: 'Opening to a mortgage banker',
      },
      {
        type: 'blockquote',
        text:
          'Hi [LO NAME], this is [YOUR NAME] with Home Ready Scores. You run a credit pull on a prospect, the score comes back under 640, and you cannot write the loan. Without us, that is a lost pipeline lead. With us, you refer the buyer to Home Ready Scores, you get real time visibility into their credit progress, you do not have to manage the credit fix yourself, and you get the buyer back ready to close in four to five months. You fund the loan you otherwise would have lost. Do you have five minutes to hear how it works?',
      },
      {
        type: 'h3',
        text: 'The one line pitch (for both)',
      },
      {
        type: 'blockquote',
        text:
          'You run into buyers every week who cannot qualify because their credit is not there yet. We fix that. We plug into your pipeline, give you real time visibility on your client progress, and when they are ready, we hand them right back to you. You do not lose the deal, you delay it four to five months and bring it back funded.',
      },
      {
        type: 'h3',
        text: 'The close for the partner',
      },
      {
        type: 'blockquote',
        text:
          'Here is how we start. Next time you have a buyer who cannot qualify because of their credit, refer them to us. We will enroll them, fix the credit, and hand them back to you ready to close. You will see their progress the whole way. Sound fair?',
      },
      {
        type: 'h3',
        text: 'Script 7 — The NSF recovery call (failed payment)',
      },
      {
        type: 'p',
        text:
          'NSF turns into a cancellation fast. Reach out the same day. Fix the billing in the admin under Client Profile > Billing. Confirm the new charge date in writing. Use the Failed Enrollment Payment hot link for the note.',
      },
      {
        type: 'h3',
        text: 'Calling the client about a failed payment',
      },
      {
        type: 'blockquote',
        text:
          'Hi [CLIENT NAME], this is [YOUR NAME] with Home Ready Scores. I am calling because we had a small issue with your last payment, it did not go through. No worries, it happens all the time. I want to get it sorted out today so your file does not pause. Can you confirm the card on file is still good, or would you like to update it?',
      },
      {
        type: 'p',
        text:
          'If they want to update: walk them through updating the card in the portal or take the new card info and update it in the admin under Client Profile > Billing. If the card on file is still good: ask if there were sufficient funds, confirm the new charge date, and send a confirmation text.',
      },
      {
        type: 'h3',
        text: 'Text follow up after the NSF call',
      },
      {
        type: 'blockquote',
        text:
          'Hey [CLIENT NAME], thanks for taking my call today. I have updated your billing and your next charge will go through on [DATE]. Your file is still active and we are continuing to work your disputes. If anything changes on your end, just let me know. We are here for you.',
      },
      {
        type: 'h3',
        text: 'Script 8 — The cancellation save call',
      },
      {
        type: 'p',
        text:
          'The single biggest reason clients cancel is they feel like nothing is happening. Before you accept a cancellation, try to save the account. If the client is set on cancelling, process it cleanly and document why.',
      },
      {
        type: 'h3',
        text: 'When a client says they want to cancel',
      },
      {
        type: 'blockquote',
        text:
          'I understand, [CLIENT NAME]. Before we do that, can I ask what is going on? Is it the progress, the cost, or something else? I want to make sure we are not missing something we can fix right now.',
      },
      {
        type: 'p',
        text: 'Listen. The most common answer is they feel like nothing is happening. If that is the case, walk them through their file.',
      },
      {
        type: 'h3',
        text: 'If they feel like nothing is happening',
      },
      {
        type: 'blockquote',
        text:
          'I hear you, and I am sorry it feels that way. Let me show you where your file is right now. We sent your first round of disputes on [DATE]. The bureaus have 30 days to respond under the Fair Credit Reporting Act, so we are in that window right now. Your Days For Results counter is at [X] days. The next thing that happens is the bureaus respond, and we log every result in your tracker. You are not sitting still, the bureaus are doing their investigation. Can I check in with you every week with an update so you always know where things stand?',
      },
      {
        type: 'h3',
        text: 'If they still want to cancel',
      },
      {
        type: 'blockquote',
        text:
          'I understand. I will process that for you today. You have a 3 day right of rescission under the Credit Repair Organizations Act, and we honor cancellations beyond that under our policy. Is there anything I can do to help you in the future? If your situation changes, we are always here.',
      },
      {
        type: 'p',
        text:
          'Action for the rep: process the cancellation in the admin. Change the status to Cancelled. Log the reason in the notes. Use the Cancellation Phone Call hot link. Some are saveable, some are not. Document the reason either way so leadership can see the pattern.',
      },
      {
        type: 'h3',
        text: 'Script 9 — The monthly status update (active client)',
      },
      {
        type: 'p',
        text:
          'Monthly auto status SMS is the cadence. Tate can pull stage info from a custom field updated by the dispute work system. If you are sending it manually, this is the script.',
      },
      {
        type: 'h3',
        text: 'Monthly status SMS to an active client',
      },
      {
        type: 'blockquote',
        text:
          'Hey [CLIENT NAME], here is where your file is this month. We have sent [X] rounds of disputes to [EQUIFAX / EXPERIAN / TRANSUNION]. [X] items have been deleted, [X] are verified, [X] are still in progress. Your Days For Results counter is at [X] days. The next round goes out on [DATE]. You are making progress. If you have any questions, just reply to this text or call us at help@homereadyscores.com.',
      },
      {
        type: 'h3',
        text: 'Script 10 — The document collection prompt (post enrollment)',
      },
      {
        type: 'p',
        text:
          'After enrollment, the team needs documents. Tate can prompt for this automatically, but if you are doing it manually, here is the script. Escalate to a human if docs are not received in 48 hours.',
      },
      {
        type: 'h3',
        text: 'SMS requesting documents',
      },
      {
        type: 'blockquote',
        text:
          'Hey [CLIENT NAME], welcome to Home Ready Scores. We are getting your file set up now. To start your disputes, I need a couple of things from you: a copy of your ID (driver license or state ID) and a proof of address (utility bill, bank statement, or lease). You can upload them right in the portal at homereadyscores.com/portal, or just reply to this text and attach them. Can you get those to me within 48 hours so we can keep things moving?',
      },
      {
        type: 'h3',
        text: 'If docs are not received in 48 hours',
      },
      {
        type: 'blockquote',
        text:
          'Hey [CLIENT NAME], just checking in on the documents we need to start your disputes. We need your ID and a proof of address to get the letters out. Is there anything holding you up? If it is easier, I can get a specialist on the phone to walk you through it. When is a good time to call?',
      },
      {
        type: 'h3',
        text: 'Script 11 — The review request (post success)',
      },
      {
        type: 'p',
        text:
          'Trigger: 30 days post first positive score change OR pipeline stage completed. Style: short, plain spoken, no pressure.',
      },
      {
        type: 'h3',
        text: 'Review request SMS',
      },
      {
        type: 'blockquote',
        text:
          'Hey [CLIENT NAME], we would love a quick review if we have helped you on your path to homeownership. Here is the link: [REVIEW LINK]. It takes 30 seconds and it means a lot to us. If there is anything we can do better, just tell me. We are always here.',
      },
      {
        type: 'h3',
        text: 'Script 12 — The nurture cadence (unconverted leads)',
      },
      {
        type: 'p',
        text:
          'This is the cadence for leads who did not enroll on first contact. Channel mix is SMS primary, email follow up after 24 hours of non response, voice retry after 72 hours. The cadence is Day 0 (instant), Day 1, Day 3, Day 7, Day 14, Day 30, then quarterly. Persona stays consistent: Tate style, casual, purposeful, concise.',
      },
      {
        type: 'h3',
        text: 'Day 0 (instant, same day as first contact)',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], this is [YOUR NAME] with Home Ready Scores. Thanks for reaching out today. I want to make sure you have everything you need to take the next step. You can sign up online at homereadyscores.com/get-started, or if you would rather talk it through, just tell me when is a good time to call. I am here to help.',
      },
      {
        type: 'h3',
        text: 'Day 1 (next business day)',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], checking in from yesterday. Have you had a chance to look at the Get Started page? If anything is holding you back, let me know. I would rather answer your questions now than have you wait. Text me back or call me at [PHONE].',
      },
      {
        type: 'h3',
        text: 'Day 3',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], I do not want to keep bugging you, but I also do not want you to miss out on getting started. Every day you wait is another day paying rent instead of building equity. If you are ready, the link is homereadyscores.com/get-started. If you have questions, just text me back. I am here.',
      },
      {
        type: 'h3',
        text: 'Day 7',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], it is [YOUR NAME] from Home Ready Scores. It has been a week since we talked. If now is not the right time, that is okay. Just let me know either way so I can update my notes. If you are still interested, I am still here. The link is homereadyscores.com/get-started.',
      },
      {
        type: 'h3',
        text: 'Day 14',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], this is [YOUR NAME] with Home Ready Scores. Two weeks ago you reached out about getting your credit on track for a home purchase. I want to check in one more time. If you are serious about buying a home, we can start today. If you are not ready yet, no worries. Just text me back and let me know where you stand.',
      },
      {
        type: 'h3',
        text: 'Day 30',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], it is [YOUR NAME] with Home Ready Scores. It has been a month since we first talked. I am reaching out one last time to see if you are ready to get started. If you are, the link is homereadyscores.com/get-started. If you are not, I will stop reaching out for now, but we are always here if your situation changes. Just text me back either way.',
      },
      {
        type: 'h3',
        text: 'Quarterly check in (Day 90+)',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], this is [YOUR NAME] with Home Ready Scores. It has been a few months since we talked about your credit. A lot can change in that time. If you are still thinking about buying a home, we can help you get your credit where it needs to be. If you are ready to talk, just text me back and I will call you. If not, no worries. We are here when you need us.',
      },
      {
        type: 'h3',
        text: 'Script 13 — The handoff to a human (when AI can not handle it)',
      },
      {
        'type': 'p',
        'text':
          'The handoff to human trigger fires on: explicit talk to a person or speak with someone, 3 consecutive AI failures, lead types unrelated questions twice, or lead requests a meeting. When you take the handoff, here is the script.',
      },
      {
        type: 'h3',
        text: 'When a lead asked for a human',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], this is [YOUR NAME] with Home Ready Scores. I understand you wanted to speak with someone. I am here. What can I help you with?',
      },
      {
        type: 'p',
        text:
          'Then listen. The lead usually asked for a human because the AI did not answer their question or because they were frustrated. Be warm, be direct, be human. Answer the question they actually asked, not the question you wish they asked. Then move back to the enrollment flow.',
      },
      {
        type: 'h3',
        text: 'When the AI failed 3 times',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], this is [YOUR NAME] with Home Ready Scores. I was looking at your conversation and I want to make sure you get what you need. What question can I answer for you right now?',
      },
      {
        type: 'h3',
        text: 'Script 14 — The welcome SMS (post enrollment)',
      },
      {
        'type': 'p',
        'text':
          'Triggered by the enrollment webhook from the Home Ready Scores web app when the setup fee is charged. Tate sends this within 60 seconds. If you are sending it manually, here is the script.',
      },
      {
        type: 'blockquote',
        text:
          'Welcome to Home Ready Scores, [CLIENT NAME]. We are glad you are here. Our team will reach out within 24 hours to get your documents and start working on your credit immediately. You just took the first step toward owning your home. If you need anything in the meantime, text us here or email help@homereadyscores.com. We are here for you.',
      },
      {
        type: 'h3',
        text: 'Script 15 — The re engagement text (cold lead, 6+ months)',
      },
      {
        'type': 'p',
        'text':
          'For leads tagged Expired or cold for 6+ months. These are in the quarterly cadence. Keep it light, no pressure, just checking in.',
      },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], this is [YOUR NAME] with Home Ready Scores. It has been a while since we talked. I am just checking in to see if your situation has changed. If you are still thinking about buying a home, we can help you get your credit where it needs to be. If not, no worries at all. Just text me back either way so I know where you stand.',
      },
    ],
  },
  {
    id: 'lead-pipeline',
    number: 11,
    title: 'The lead pipeline — the most important diagram in the company',
    blocks: [
      {
        type: 'p',
        text:
          'Every rep should be able to draw this on a napkin. This is how a lead flows from the loan officer, through Home Ready Scores, and back to the loan officer. The warm handoff at the end is non negotiable. The lead almost always belongs to the loan officer who referred it. We are a fix and return service, not a customer acquisition end state.',
      },
      {
        type: 'p',
        text:
          'Buyer wants a home, goes to loan officer. If credit score is below 640, the loan officer cannot approve, so they refer the buyer to Home Ready Scores. HRS enrolls the client, charges the setup fee, pulls reports, and builds the dispute strategy. Then the 4 to 5 month credit repair cycle runs: bureau disputes across 3 bureaus, multi round, creditor disputes including Debt Validation and Qualified Written Request, monthly client check ins. When the credit is mortgage ready, the warm handoff goes back to the same loan officer. The loan officer reactivates the deal, the buyer completes the mortgage application, the deal closes. The loan officer earns commission, the realtor earns commission, HRS keeps a satisfied client, and the buyer gets the keys to the home.',
      },
      {
        type: 'p',
        text:
          'The few exceptions: a self generated HRS lead that came in through our ads, site, or word of mouth. In that case we own the relationship and connect them to a partner lender at completion. A client who explicitly switches lenders mid repair, which is handled case by case.',
      },
      {
        type: 'p',
        text:
          'If a score is 640 or above, the lead does not go through credit repair. They go straight to the mortgage application. On a live call, that means booking a phone consultation with a specialist, never sending a third party link, never naming any outside company.',
      },
    ],
  },
  {
    id: 'sales-playbook',
    number: 12,
    title: 'The Sales Playbook — step by step on every call',
    blocks: [
      {
        type: 'p',
        text:
          'This is the step by step playbook for a Home Ready Scores sales rep on every call. Follow it in order. Every step has the exact script. Do not skip steps. Do not improvise until you can deliver every step from memory. This playbook covers the cold call, the inbound call, and the full conversation from the moment you say hello to the moment they enroll or tell you no.',
      },

      { type: 'h3', text: 'PLAYBOOK 1 — The Cold Call (outbound to a new lead)' },
      {
        type: 'p',
        text:
          'Use this when you are calling a lead who came in through the website, an ad, a referral, or a list. The goal is to qualify them, build trust, and get them enrolled on the call or scheduled for a follow up.',
      },

      { type: 'h3', text: 'Step 1: The Opening' },
      {
        type: 'p',
        text: 'Say this word for word. Do not ad lib the opening. The opening does three things: identifies you, states the reason for the call, and asks for their timeline.',
      },
      {
        type: 'blockquote',
        text:
          'Hello, [NAME]. It is [YOUR NAME] with Home Ready Scores. How are you doing today? Thank you for taking my call. I understand that you are interested in purchasing a home, but need some help with your credit. What is your time frame for wanting to buy the new home?',
      },
      {
        type: 'p',
        text:
          'Pause. Listen. Their timeline tells you everything. 30 to 60 days means hot. 6 to 12 months means warm. Not sure means early stage. Tag accordingly in the admin after the call.',
      },

      { type: 'h3', text: 'Step 2: The Discovery' },
      {
        type: 'p',
        text:
          'Let them talk. Do not interrupt. Take notes in the admin while they speak. The more they feel heard, the more they trust you. After they finish their story, say this:',
      },
      {
        type: 'blockquote',
        text:
          'Great, I can help with that. Please give me an idea of what is going on with your credit, so I can explain how we can help.',
      },
      {
        type: 'p',
        text:
          'Then listen again. Let them explain what is on their credit report, what they have tried, what their loan officer told them, what their realtor said. Take notes on every detail. This is where you earn the right to pitch.',
      },

      { type: 'h3', text: 'Step 3: The Credit Score Check' },
      {
        type: 'p',
        text:
          'You need to know their credit score to route them correctly. Ask directly:',
      },
      {
        type: 'blockquote',
        text:
          'Do you have a rough idea of where your credit score sits right now, even a range? That helps me point you to the right next step.',
      },
      {
        type: 'p',
        text:
          'If they say below 640: you are on the credit repair path. Proceed to Step 4.\n\nIf they say 640 or above: you are on the mortgage path. Say this: That is great. With a score in that range, the best next step is a phone consultation so we can match you with the right lender and get your application moving. When is a good time for a specialist to call you? Then book the consultation and end the call. Do NOT send any third party link. Do NOT name any outside company.\n\nIf they do not know: ask for a range. If they truly have no idea, book a phone consultation with a specialist.',
      },

      { type: 'h3', text: 'Step 4: The Three Selling Points' },
      {
        type: 'p',
        text:
          'Only deliver these after you have heard their story and confirmed they are below 640. Deliver all three. Do not skip any.',
      },
      {
        type: 'blockquote',
        text:
          'Based on what you told me, here is how we help. First, the partnership. We work directly with your realtor and your mortgage professional so everyone sees your progress. You are on a tracked path to homeownership, not guessing alone. Second, the speed. Our process is built to move disputes forward efficiently, so your score can improve as fast as your file allows. Most clients see real movement in about 45 days. Third, the guarantee. We stand behind our program with a 100% Satisfaction Guarantee. If we cannot help, you are not stuck with us.',
      },

      { type: 'h3', text: 'Step 5: The Price Reveal' },
      {
        type: 'p',
        text:
          'State the price clearly and confidently. Do not apologize for the price. Do not hedge. Do not offer discounts. If the price feels high to you, that is your problem, not the prospect problem. Say this:',
      },
      {
        type: 'blockquote',
        text:
          'There are two plans. Single Enrollment is $184.99 due today, then $114 a month. Couple Enrollment is $304.99 due today, then $190 a month. Both include the full three bureau review, a custom dispute strategy, bureau and creditor disputes on schedule, and our 100% Satisfaction Guarantee. Most clients work toward mortgage readiness over a 4 to 5 month window. Which plan fits your situation?',
      },

      { type: 'h3', text: 'Step 6: The Close' },
      {
        type: 'p',
        text:
          'Go for the close immediately after the price reveal. Do not wait. Do not ask if they have questions first. Ask for the enrollment directly.',
      },
      {
        type: 'blockquote',
        text:
          'If you are serious about buying a home, we can start improving your credit today. I can get you enrolled right now at homereadyscores.com/get-started. It takes about five minutes. Are you ready to begin?',
      },
      {
        type: 'p',
        text:
          'If YES: send the enrollment link immediately. Stay on the line while they fill it out. Walk them through each step if needed. Confirm the setup fee charged. Welcome them to Home Ready Scores. Tag the lead ENROLLED in the admin.\n\nIf HESITATION: go to Step 7 (objection handling).\n\nIf NOT SURE / NEED TO THINK: tag WARM. Say: I understand. Let me follow up with you tomorrow at [TIME]. Does that work? Then set the follow up task in the admin.\n\nIf NO: go to Step 8 (the graceful exit).',
      },

      { type: 'h3', text: 'Step 7: Objection Handling' },
      {
        type: 'p',
        text:
          'Never treat no as final. Redirect to the dream, owning a home. When full commitment feels heavy, offer a lighter next step. Handle the objection, then go back to the close.',
      },
      {
        type: 'p',
        text: 'If they say: Not right now.',
      },
      {
        type: 'blockquote',
        text: 'May I ask why?',
      },
      {
        type: 'p',
        text: 'Listen. Address the real objection. Then return to the close: So based on what you told me, would you agree that getting your credit on track is the right next step? Great, let us get you started today.',
      },
      {
        type: 'p',
        text: 'If they say: Money is tight.',
      },
      {
        type: 'blockquote',
        text:
          'That is okay. Let us do a free consultation so you know your options. No pressure, no commitment. Just a conversation so you know exactly what your credit needs to look like and how we can help you get there.',
      },
      {
        type: 'p',
        text: 'If they say: Credit repair does not work.',
      },
      {
        type: 'blockquote',
        text:
          'Have you read our reviews? We are rated number one in Texas. The real question is, are you serious about buying a home? Because if you are, we can help you get there.',
      },
      {
        type: 'p',
        text: 'If they say: I am too busy.',
      },
      {
        type: 'blockquote',
        text:
          'You are not too busy for your dreams. I will call you on your schedule, never too early, never too late. Tell me when to call and I will be there.',
      },
      {
        type: 'p',
        text: 'If they say: I do not feel comfortable.',
      },
      {
        type: 'blockquote',
        text:
          'Totally fair. Let us schedule a free consultation with our partner lender. He will look at your specific situation and tell you exactly what your credit needs to look like. That way you know for sure what to do next, with no pressure. Would [DAY] at [TIME] work for you?',
      },
      {
        type: 'p',
        text:
          'This is the most important redirect. When someone is uncomfortable with credit repair, pivot to the free mortgage consultation. It is the lower commitment step that keeps them in the pipeline. Once the lender tells them what their score needs to be, they come back to us ready.',
      },
      {
        type: 'p',
        text: 'If they say: I need to think about it.',
      },
      {
        type: 'blockquote',
        text:
          'I understand. Let me ask you this: what is there to think about? Is it the timing, the cost, or something else? If I can address it right now, I will. If not, I will follow up with you [DAY] at [TIME]. Does that work?',
      },
      {
        type: 'p',
        text:
          'Tag WARM. Set a follow up task. Do not let a think about it sit untouched for more than 24 hours.',
      },

      { type: 'h3', text: 'Step 8: The Graceful Exit' },
      {
        type: 'p',
        text:
          'If they say no clearly, respect it. Do not burn the bridge. Leave the door open.',
      },
      {
        type: 'blockquote',
        text:
          'I understand. If your situation changes, we are always here. You can reach us at homereadyscores.com or help@homereadyscores.com. Have a great day, [NAME].',
      },
      {
        type: 'p',
        text:
          'If they say do not ever call again: say Understood, I respect that, have a good day. Document it in the admin. Cease outreach per policy. Do not argue. Do not push back. The CROA and TCPA both protect this request.',
      },

      { type: 'h3', text: 'Step 9: Post Call Documentation' },
      {
        type: 'p',
        text:
          'Every call gets logged in the admin. No exceptions. Even if they said no. Even if they did not answer. Even if you left a voicemail. Here is what you log:',
      },
      {
        type: 'ol',
        items: [
          'Open the client or prospect profile in the admin.',
          'Go to Client Status tab.',
          'Use the canned Hot Links for the outcome: Client Phone Call, Welcome, Cancellation Phone Call, Next Round, etc.',
          'If the action is not in the hot links, type a manual note with: the date, the outcome, what was discussed, the next step.',
          'Update the status field: Pending, Scheduled, Active, Contact 1, Contact 2, Contact 3, Complete, NSF, Cancelled, Expired.',
          'If they enrolled: tag ENROLLED, confirm the enrollment record was created, set a task for the 24 hour follow up.',
          'If they said no: tag the reason in the notes so leadership can see the pattern.',
          'If they did not answer: tag NO ANSWER and add to the blast list for the next cadence wave.',
        ],
      },

      { type: 'h3', text: 'PLAYBOOK 2 — The Inbound Call (prospect called us)' },
      {
        type: 'p',
        text:
          'Use this when a prospect calls in. The caller called us for credit repair, so the job is to help them enroll, not to ask 20 questions first. Move fast. Be warm. Be direct.',
      },

      { type: 'h3', text: 'Step 1: The Inbound Opening' },
      {
        type: 'p',
        text: 'Say this word for word. This mirrors the Alex voice agent script exactly.',
      },
      {
        type: 'blockquote',
        text:
          'Hi, this is [YOUR NAME] with Home Ready Scores. Thanks for calling. I can help you get started with credit repair right now. It only takes about five minutes. Are you near a computer or phone where you can get online?',
      },

      { type: 'h3', text: 'Step 2: Route Based on Their Answer' },
      {
        type: 'p',
        text:
          'If YES (near a computer or phone): go to Step 3 (walk through enrollment).\n\nIf NO (not near a computer): go to Step 4 (book a follow up).',
      },

      { type: 'h3', text: 'Step 3: Walk Through Enrollment' },
      {
        type: 'p',
        text: 'Say this, then walk them through each step of the Get Started form.',
      },
      {
        type: 'blockquote',
        text:
          'Perfect. Here is what we will do. Go to homereadyscores.com. Once you are there, click the Get Started button. I will walk you through the form, it is super quick. It is four steps: your information, your goal, your plan and credit reports, and confirmation. I will stay on the line the whole time.',
      },
      {
        type: 'p',
        text:
          'Walk them through each step. Be encouraging. Say things like: you are doing great, almost there, perfect. If they hesitate at the plan selection, remind them: Single Enrollment is $184.99 due today, then $114 a month. Couple Enrollment is $304.99 due today, then $190 a month. If they hesitate at the credit card step, remind them: Remember, we have a 100% Satisfaction Guarantee. If we cannot help, you are not stuck with us. Your card data is secured by Clover, it never touches our server.',
      },

      { type: 'h3', text: 'Step 4: If They Cannot Enroll Right Now' },
      {
        type: 'p',
        text:
          'If they are driving, at work, or not near a computer, do not force it. Book a time to call them back and send the link.',
      },
      {
        type: 'blockquote',
        text:
          'No worries. When you are ready, just go to homereadyscores.com and click Get Started. It only takes five minutes and we have a 100% Satisfaction Guarantee. Do not wait too long, every day matters with credit. I will follow up with you tomorrow at [TIME] to see if you need any help getting through it. Does that work?',
      },
      {
        type: 'p',
        text:
          'Tag the lead WARM. Set a follow up task for the next business day. Text them the link so they have it in writing.',
      },

      { type: 'h3', text: 'Step 5: The Enrollment Confirmation' },
      {
        type: 'p',
        text: 'When they complete the form and the setup fee charges, confirm the enrollment warmly.',
      },
      {
        type: 'blockquote',
        text:
          'Awesome, you are all set. Our team will reach out within 24 hours to get your documents and start working on your credit immediately. You just took the first step toward owning your home. Do you have any questions for me before we wrap up?',
      },
      {
        type: 'p',
        text:
          'Answer any questions. Then close warmly: Welcome to Home Ready Scores. We are here for you. Talk soon.',
      },

      { type: 'h3', text: 'PLAYBOOK 3 — The Follow Up Call (warm lead)' },
      {
        type: 'p',
        text:
          'Use this when calling back a lead who showed interest but did not enroll on the first contact. They are tagged WARM in the admin. The goal is to get them enrolled or get a clear no.',
      },

      { type: 'h3', text: 'Step 1: The Follow Up Opening' },
      {
        type: 'blockquote',
        text:
          'Hey [NAME], this is [YOUR NAME] with Home Ready Scores. We talked on [DAY] about getting your credit on track for a home purchase. I am following up like I promised. Have you had a chance to look at the Get Started page?',
      },
      {
        type: 'p',
        text: 'Listen. Their answer tells you where they are.',
      },

      { type: 'h3', text: 'Step 2: If They Looked at the Page' },
      {
        type: 'p',
        text:
          'If yes: What did you think? Do you have any questions I can answer? Then answer the questions and go back to the close: So are you ready to get started? I can walk you through it right now if you are near a computer.\n\nIf they have questions: answer them using the FAQ scripts from Section 9 of this training. Then return to the close.',
      },

      { type: 'h3', text: 'Step 3: If They Have Not Looked' },
      {
        type: 'p',
        text:
          'If no, or they forgot, or they have been busy, do not guilt trip them. Just re state the value and move to the close.',
      },
      {
        type: 'blockquote',
        text:
          'No worries, I know you are busy. Here is where things stand. You want to buy a home, your credit is the blocker, and we can fix it. We dispute inaccurate items on all three bureaus, we work with your loan officer and realtor so everyone stays aligned, and we have a 100% Satisfaction Guarantee. Single Enrollment is $184.99 today, then $114 a month. Couple is $304.99 today, then $190 a month. Most clients see real movement in about 45 days. Are you ready to get started?',
      },

      { type: 'h3', text: 'Step 4: The Close or the Tag' },
      {
        type: 'p',
        text:
          'If yes: walk them through enrollment right now. If hesitation: handle objections (Playbook 1, Step 7). If still no: tag WARM and set the next follow up. If they say stop calling: respect it, document it, cease outreach.',
      },

      { type: 'h3', text: 'PLAYBOOK 4 — The Referral Partner Call' },
      {
        type: 'p',
        text:
          'Use this when calling a realtor or mortgage banker who has buyers that cannot qualify because of their credit. The goal is to get them to refer their unqualified buyers to Home Ready Scores.',
      },

      { type: 'h3', text: 'Step 1: The Partner Opening' },
      {
        type: 'p',
        text: 'To a realtor:',
      },
      {
        type: 'blockquote',
        text:
          'Hi [REALTOR NAME], this is [YOUR NAME] with Home Ready Scores. I know you run into buyers every week who cannot qualify because their credit is not there yet. Right now those are dead deals for you. We turn them into closed deals in four to five months. You keep the relationship, you keep the listing, you keep the commission. We just delay the close, not cancel it. Do you have five minutes to hear how it works?',
      },
      {
        type: 'p',
        text: 'To a mortgage banker:',
      },
      {
        type: 'blockquote',
        text:
          'Hi [LO NAME], this is [YOUR NAME] with Home Ready Scores. You run a credit pull on a prospect, the score comes back under 640, and you cannot write the loan. Without us, that is a lost pipeline lead. With us, you refer the buyer to Home Ready Scores, you get real time visibility into their credit progress, you do not have to manage the credit fix yourself, and you get the buyer back ready to close in four to five months. You fund the loan you otherwise would have lost. Do you have five minutes to hear how it works?',
      },

      { type: 'h3', text: 'Step 2: The Value Pitch' },
      {
        type: 'blockquote',
        text:
          'Here is how it works. You refer the buyer to us. We enroll them, pull their credit reports, build a custom dispute strategy, and run multi round disputes across all three bureaus. We keep you updated on their progress the whole way. When their credit is mortgage ready, we hand them back to you so you can reactivate the deal. You do not lose the deal, you delay it four to five months and bring it back funded.',
      },

      { type: 'h3', text: 'Step 3: The Partner Close' },
      {
        type: 'blockquote',
        text:
          'Here is how we start. Next time you have a buyer who cannot qualify because of their credit, refer them to us. We will enroll them, fix the credit, and hand them back to you ready to close. You will see their progress the whole way. Sound fair?',
      },
      {
        type: 'p',
        text:
          'If yes: get their contact info, add them as an Affiliate or Broker in the admin, and set up the referral workflow. If they want to think about it: follow up in one week. If no: leave the door open and move on.',
      },

      { type: 'h3', text: 'PLAYBOOK 5 — The Daily Cadence' },
      {
        type: 'p',
        text:
          'This is not a single call playbook. This is how you structure every day so outreach and follow up never slip. Follow this cadence or you will lose leads.',
      },

      { type: 'h3', text: 'Before 9:00 AM — The Close List' },
      {
        type: 'p',
        text:
          'Write the names of the people most likely to enroll today. Keep that list visible all day. These are priority one.',
      },

      { type: 'h3', text: '9:00 to 9:10 AM — The NO ANSWER Blast' },
      {
        type: 'p',
        text:
          'In the CRM, everyone tagged NO ANSWER gets a mass text to reschedule. Repeat every 2 hours: 9:00, 11:00, 1:00, 3:00, 5:00. Remove the tag when they reschedule or opt out.',
      },

      { type: 'h3', text: '9:15 to 9:20 AM — The HOT List' },
      {
        type: 'p',
        text:
          'These are people one conversation from enrolling. Not a mass text. Each message is personal and speaks to their specific goal. Repeat every 2 hours: 9:15, 11:15, 1:15, 3:15, 5:15.',
      },

      { type: 'h3', text: '9:30 to 9:40 AM — The WARM Leads' },
      {
        type: 'p',
        text:
          'Friendly mass style outreach to warm leads. Ask to schedule a call. Repeat: 9:30, 11:30, 1:30, 3:30, 5:00.',
      },

      { type: 'h3', text: 'Between Waves — CALL' },
      {
        type: 'p',
        text:
          'Minimum 20 to 30 dials per day between text blasts. Texts open doors. Calls close them. Use Playbook 1 for cold calls and Playbook 3 for follow ups.',
      },

      { type: 'h3', text: 'Missed Scheduled Call' },
      {
        type: 'ol',
        items: [
          'Call at the scheduled time.',
          'Text immediately with the next step or the enrollment link.',
          'Reschedule follow ups for several days out.',
          'Tag NO ANSWER and restart the cadence next business morning if needed.',
        ],
      },

      { type: 'h3', text: 'PLAYBOOK 6 — What Never to Do' },
      {
        type: 'p',
        text:
          'These are the hard rules. Violating any of these is a compliance issue, a lost sale, or both.',
      },
      {
        type: 'ul',
        items: [
          'Never quote a price other than Single $184.99 / $114 or Couple $304.99 / $190 unless you have confirmed the live price on the website.',
          'Never promise a specific deletion, a specific score increase, or a specific close date.',
          'Never invent guarantee or refund terms. Point to the legal pages on the site and check with leadership for anything beyond the 100% Satisfaction language.',
          'Never mention Legacy Credits, Legacy Prime Lending, or any other company name. Even as a negation. Even to say we do not work with them.',
          'Never tell a client we are a debt settlement company, a loan, or a consolidation service. We are not.',
          'Never refer to yourself as a bot or a call center. You are a Home Ready Scores specialist.',
          'Never leave a failed payment unanswered. NSF turns into a cancellation fast.',
          'Never leave a client in silence during the bureau investigation window. Silence is the single biggest reason clients cancel.',
          'Never send a third party link to a 640+ lead. Always book a phone consultation.',
          'Never skip the post call documentation. Every call gets a note in the admin. No exceptions.',
          'Never say we can remove anything. We dispute inaccurate, unverifiable, or unfair items. That is different.',
          'Never say a score is guaranteed to go up by X points. Outcomes vary by file.',
        ],
      },
    ],
  },
  {
    id: 'legacy-knowledge-base',
    number: 13,
    title: 'Credit repair expertise — the complete knowledge base',
    blocks: [
      {
        type: 'p',
        text:
          'This section is translated from the complete Home Ready Scores (formerly Legacy Credits) AI Voice Agent Knowledge Base. Every script, objection handler, credit education response, closing technique, and power phrase below has been used in production to enroll clients. Read it until you can answer every question a prospect could ask about credit repair. Every reference to the old company name has been replaced with Home Ready Scores and every price updated to the current plan.',
      },

      { type: 'h3', text: 'Section A — Identity and role' },
      {
        type: 'p',
        text:
          'When a prospect asks who you are or what you do, you are a Home Ready Scores sales specialist. You work with leads referred by mortgage companies who have credit scores below 640. Your mission is to convert leads into enrolled clients by establishing trust, providing clarity, giving hope, and guiding their decision. You are confident and professional, empathetic and understanding, solution focused, never pushy, always helpful. You sound human, not robotic. You are a world class sales expert.',
      },
      {
        type: 'blockquote',
        text:
          'I am a credit repair enrollment specialist with Home Ready Scores. I help people fix their credit so they can qualify for a mortgage and buy a home. I work with leads referred by mortgage companies who have credit scores below 640, and my job is to help you take your next step toward homeownership.',
      },

      { type: 'h3', text: 'Section B — Company overview' },
      {
        type: 'ul',
        items: [
          'Vision: Creating a clear path toward home ownership.',
          'Mission: Providing affordable, fast credit restoration.',
          'Core purpose: To assist families and individuals in purchasing the home they desire.',
          'Philosophy: We recognize that life happens and many times it affects the credit landscape of good hardworking individuals.',
          'Track record: 15+ years helping brokers close more loans.',
        ],
      },
      {
        type: 'p',
        text: 'Service promise. Memorize these five points:',
      },
      {
        type: 'ul',
        items: [
          'One monthly fee. Unlimited verifications.',
          '100% Satisfaction Guarantee.',
          'No long term contracts.',
          'Pause or resume services anytime.',
          'Lifetime guarantee on deletions staying deleted (confirm exact wording with leadership before quoting verbatim).',
        ],
      },

      { type: 'h3', text: 'Section C — Pricing and packages' },
      {
        type: 'p',
        text:
          'Always quote the current pricing. The old knowledge base listed $179 starter and $109 monthly. Those are outdated. Use the prices below.',
      },
      {
        type: 'ul',
        items: [
          'Single Enrollment: $184.99 due today, then $114.00 per month. One client, one credit file.',
          'Couple Enrollment: $304.99 due today, then $190.00 per month. Two related clients (spouses, joint applicants) under one plan.',
        ],
      },
      {
        type: 'p',
        text:
          'Payment structure: the setup fee is charged at enrollment. The monthly recurring charge starts one month after the setup fee date. Average client duration is 3 to 4 months. Most see results in 30 to 45 days.',
      },

      { type: 'h3', text: 'Section D — The credit repair process' },
      {
        type: 'p',
        text: 'How Home Ready Scores works:',
      },
      {
        type: 'ol',
        items: [
          'Review current credit report to determine items needing attention.',
          'Open inquiries with each bureau to verify documentation.',
          'Send 100+ hand typed legal dispute letters within 48 hours of enrollment.',
          'Analyze and create personalized credit repair plans.',
          'Work with creditors and bureaus to dispute negative items.',
          'Client tracks progress through the online portal.',
        ],
      },
      {
        type: 'p',
        text: 'What we dispute:',
      },
      {
        type: 'ul',
        items: [
          'Collections (paid and unpaid)',
          'Medical debt',
          'Late payments',
          'Foreclosures',
          'Repossessions',
          'Bankruptcies',
          'Tax liens',
          'Judgments',
          'Student loan late payments',
          'Inquiries',
          'Any inaccurate information',
        ],
      },
      {
        type: 'p',
        text: 'Our unique dispute method. We do NOT dispute ownership. We dispute the PROCESS. This is the key differentiator. Memorize this:',
      },
      {
        type: 'ul',
        items: [
          'We verify proper documentation was followed.',
          'We challenge the method items were reported.',
          'Results in permanent deletions that cannot be re added without new verification.',
          'Example: For medical collections, we request itemized bills knowing HIPAA prevents disclosure. When they cannot provide details within 30 days, the item must be deleted permanently.',
        ],
      },

      { type: 'h3', text: 'Section E — Conversation scripts from the original knowledge base' },
      {
        type: 'p',
        text:
          'These are the original scripts from the Legacy Credits knowledge base, updated with Home Ready Scores branding and current pricing. Use them as an alternative to the cold call script in the Sales Playbook. Some prospects respond better to this consultative approach.',
      },

      { type: 'h3', text: 'Lead follow up introduction' },
      {
        type: 'blockquote',
        text:
          'Hi, this is [YOUR NAME] with Home Ready Scores. How are you doing today? Thank you for taking my call. I wanted to follow up since you expressed interest in purchasing a home.',
      },

      { type: 'h3', text: 'Immediate call introduction' },
      {
        type: 'blockquote',
        text:
          'Hi, this is [YOUR NAME] with Home Ready Scores. I understand you were interested in purchasing a home. I am here to help. Are you still interested in purchasing a home?',
      },

      { type: 'h3', text: 'Discovery process' },
      {
        type: 'blockquote',
        text:
          'Great. Where are you at in the home buying process? Fantastic. I want to help you take your next step. The first thing to consider when purchasing a home is the health of your credit.',
      },
      {
        type: 'p',
        text: 'Key questions to ask during discovery:',
      },
      {
        type: 'ol',
        items: [
          'When is the last time you checked your credit?',
          'Do you happen to know your credit score?',
          'Do you have any collections, late payments, or medical collections?',
        ],
      },

      { type: 'h3', text: 'Building value — Why Home Ready Scores' },
      {
        type: 'blockquote',
        text:
          'Let me tell you why mortgage companies trust us. First, we are partnered with realtors and mortgage bankers to ensure you are moving in the right direction. Second, our system gives you and your lender real time updates on your progress. Third, we send over 100 hand typed legal dispute letters within 48 hours of enrollment. Fourth, our process is 50% faster than any other company in the industry. Fifth, we help with everything, even finding you a realtor and lenders in your area.',
      },

      { type: 'h3', text: 'The close (original version)' },
      {
        type: 'blockquote',
        text:
          'It only takes 5 minutes to get enrolled. Let me pull up the enrollment form so we can get you started. Is that OK?',
      },
      {
        type: 'p',
        text: 'If hesitant:',
      },
      {
        type: 'blockquote',
        text:
          'We offer a 100% Satisfaction Guarantee and a lifetime guarantee on all deletions staying deleted. Are you serious about purchasing a home? I am serious about helping you. Let us get this started today.',
      },

      { type: 'h3', text: 'Enrollment process' },
      {
        type: 'blockquote',
        text:
          'Great. Go to homereadyscores.com/get-started. I will stay on the line and guide you through each step. Takes less than 5 minutes.',
      },

      { type: 'h3', text: 'Post enrollment script' },
      {
        type: 'blockquote',
        text:
          '[NAME], looking forward to helping you. Here is what happens next. You will receive a Welcome Email and Welcome Packet. Our team will contact you within 24 hours. We will need these documents: two proofs of address, one proof of social security, and your credit report. Thanks [NAME], we will take it from here.',
      },

      { type: 'h3', text: 'Section F — Objection handling from the original knowledge base' },
      {
        type: 'p',
        text:
          'These objection handlers are more detailed than the ones in the Sales Playbook. Use these when the prospect needs a deeper, more specific response.',
      },

      { type: 'h3', text: 'I am already using another service' },
      {
        type: 'blockquote',
        text:
          'Which company are you using? [Listen]. I understand. Here is what our clients who switched from that company tell us. They were with them for a long time with minimal results. Home Ready Scores has a proven track record with mortgage companies because we deliver results in 3 to 4 months, not 12 or more. Plus, your lender can track progress in real time. Do not waste more time and money. Let us get you home ready faster.',
      },

      { type: 'h3', text: 'It is too expensive' },
      {
        type: 'blockquote',
        text:
          'I understand cost is a concern. Think of it this way. $184.99 is less than most people spend on coffee in a month. But here is the real math. Fixing your credit now means qualifying for a better mortgage rate. Just 1% lower rate saves you $30,000 or more over the life of a $200,000 loan. Can you really afford NOT to fix your credit?',
      },

      { type: 'h3', text: 'I will do it myself' },
      {
        type: 'blockquote',
        text:
          'You absolutely could try, but here is what I have seen. DIY credit repair typically takes 12 or more months with minimal results. We have expertise, relationships with bureaus, and proven systems to get results in 3 to 4 months. Plus, you have a mortgage company waiting to approve you. Why risk delays when we guarantee results?',
      },

      { type: 'h3', text: 'I need to think about it (deeper version)' },
      {
        type: 'blockquote',
        text:
          'I understand. What specifically concerns you, the cost, the process, or something else? Let me address that directly so you can make the best decision. Remember, every day you wait is another day paying rent instead of building equity in your own home.',
      },

      { type: 'h3', text: 'Do I need to pull my credit?' },
      {
        type: 'blockquote',
        text:
          'No, you do not need to pull your credit. Based on what you have told me, I can already see you need our help. We will handle everything once you are enrolled.',
      },

      { type: 'h3', text: 'What if it does not work?' },
      {
        type: 'blockquote',
        text:
          'That is why we offer a 100% Satisfaction Guarantee. We are so confident because we have been doing this for over 15 years. We have helped hundreds of people just like you get into homes.',
      },

      { type: 'h3', text: 'Section G — Credit education responses' },
      {
        type: 'p',
        text:
          'These are the exact responses the original knowledge base gave when prospects asked about specific credit situations. Memorize them. A new rep who can answer these is more valuable than one who cannot.',
      },

      { type: 'h3', text: 'Credit cards' },
      {
        type: 'blockquote',
        text:
          'Best practice: Have high available credit with low or no balance. Using over 30% of your limit drops your score significantly. A $10,000 limit with $0 balance looks better than using and paying off monthly.',
      },

      { type: 'h3', text: 'Student loans' },
      {
        type: 'blockquote',
        text:
          'Federal loans cannot be removed, but we can delete late payments. Also, consolidating at studentloans.gov creates a new positive tradeline, a trick we have used for years to boost scores quickly.',
      },

      { type: 'h3', text: 'Medical collections' },
      {
        type: 'blockquote',
        text:
          'We are experts at removing these. We request itemized bills knowing HIPAA laws prevent disclosure. When they cannot provide details within 30 days, it must be deleted permanently.',
      },

      { type: 'h3', text: 'Bankruptcies' },
      {
        type: 'blockquote',
        text:
          '85% success rate removing bankruptcies within 4 to 6 months. If not removable, we add positive credit to overcome its impact. Most loans are score driven, so higher scores can offset bankruptcy presence.',
      },

      { type: 'h3', text: 'Repossessions' },
      {
        type: 'blockquote',
        text:
          'We challenge documentation requirements. The complex repo process often has missing paperwork. Without proper verification in 30 days, permanent deletion is required. We have deleted 3 repos in 60 days for one client.',
      },

      { type: 'h3', text: 'Foreclosures' },
      {
        type: 'blockquote',
        text:
          'Similar to repos. We challenge the reporting method. The lengthy foreclosure process often leads to documentation errors. No verification in 30 days means permanent removal.',
      },

      { type: 'h3', text: 'Late payments' },
      {
        type: 'blockquote',
        text:
          'Most common and most successful disputes. Payment history is 35% of your score, so removing lates has immediate impact.',
      },

      { type: 'h3', text: 'Collections' },
      {
        type: 'blockquote',
        text:
          'Paying collections does not remove them or guarantee a score increase. We dispute the verification process for permanent removal.',
      },

      { type: 'h3', text: 'Section H — Technical credit knowledge' },
      {
        type: 'p',
        text:
          'A good rep knows the technical side. These are the facts you should be able to state when a prospect asks how credit works.',
      },

      { type: 'h3', text: 'Credit report components' },
      {
        type: 'ul',
        items: [
          'Identity: Name, address, SSN, DOB, employment.',
          'Accounts: All credit accounts, terms, balances, payment history.',
          'Public records: Judgments, liens, bankruptcies.',
          'Inquiries: Who has pulled your report.',
        ],
      },

      { type: 'h3', text: 'Three credit bureaus' },
      {
        type: 'ul',
        items: [
          'Equifax',
          'Experian',
          'TransUnion',
        ],
      },
      {
        type: 'p',
        text: 'Each may have different information. That is why we dispute with all three.',
      },

      { type: 'h3', text: 'Negative information timelines' },
      {
        type: 'ul',
        items: [
          'Most negative items: 7 years.',
          'Bankruptcy: 10 years.',
          'Unpaid judgments: 7 years or statute of limitations.',
          'We can often remove items before these timelines.',
        ],
      },

      { type: 'h3', text: 'Credit score factors' },
      {
        type: 'ul',
        items: [
          'Payment history: 35%',
          'Credit utilization: 30%',
          'Length of credit history: 15%',
          'Credit mix: 10%',
          'New credit: 10%',
        ],
      },

      { type: 'h3', text: 'Legal requirements' },
      {
        type: 'ul',
        items: [
          'Bureaus must investigate disputes within 30 days.',
          'Can extend 15 days if new information is provided.',
          'Must delete if they cannot verify.',
          'Deleted items cannot be re added without new verification.',
        ],
      },

      { type: 'h3', text: 'Section I — Success stories and social proof' },
      {
        type: 'p',
        text:
          'Use these when a prospect needs reassurance. Do not make up new testimonials. Use these or check with leadership for current ones.',
      },
      {
        type: 'ul',
        items: [
          'Best credit repair company ever. Repaired in 2 months, bought a home. Tina.',
          'Score went from 400 to 590 in 3 months. Wesley.',
          'Got approved to buy a house. Score up 73 points in 3 months. BBB Review.',
          '80 point jump in just 25 days. Referred client.',
          'Less than a month and my low 500s became mid 600s. Client review.',
        ],
      },
      {
        type: 'p',
        text: 'Mortgage company trust:',
      },
      {
        type: 'blockquote',
        text:
          'There is a reason mortgage companies use us exclusively. We deliver results and send clients back loan ready.',
      },

      { type: 'h3', text: 'Section J — Key differentiators' },
      {
        type: 'p',
        text: 'What makes Home Ready Scores different:',
      },
      {
        type: 'ol',
        items: [
          'Speed: 50% faster than industry average.',
          'Method: We dispute the process, not ownership. This means permanent deletions.',
          'Transparency: Real time tracking portal for the client and the lender.',
          'Guarantee: 100% Satisfaction Guarantee plus lifetime deletion guarantee.',
          'Expertise: 15+ years, hundreds of success stories.',
          'Partnership: Direct mortgage company relationships.',
        ],
      },
      {
        type: 'p',
        text: 'Why not DIY or competitors:',
      },
      {
        type: 'ul',
        items: [
          'DIY takes 12+ months vs our 3 to 4 months.',
          'Competitors only dispute half of items monthly.',
          'Generic disputes get temporary results.',
          'We know the legal requirements and timelines.',
          'Professional disputes ensure permanent removal.',
        ],
      },

      { type: 'h3', text: 'Section K — Closing techniques' },
      {
        type: 'p',
        text:
          'Multiple closing techniques. Use the one that fits the prospect situation. Do not use the same close on every prospect.',
      },

      { type: 'h3', text: 'Assumptive close' },
      {
        type: 'blockquote',
        text:
          'Great. Let me walk you through enrollment right now. Go to homereadyscores.com/get-started and I will guide you through each step.',
      },

      { type: 'h3', text: 'Alternative close' },
      {
        type: 'blockquote',
        text:
          'Would you prefer to enroll online while I guide you, or should I text you the link to complete when ready? Most people find it easier with my help.',
      },

      { type: 'h3', text: 'Urgency close' },
      {
        type: 'blockquote',
        text:
          'Look, you reached out because you want to buy a home. Credit is literally the only thing standing in your way. Every day you wait is another day throwing away rent money instead of building equity. Let us fix this today.',
      },

      { type: 'h3', text: 'Value close' },
      {
        type: 'blockquote',
        text:
          'For less than your monthly cell phone bill, you can fix your credit and save thousands on your mortgage. This is an investment that pays for itself many times over.',
      },

      { type: 'h3', text: 'Section L — Quick reference responses' },
      {
        type: 'p',
        text: 'When a prospect fires a quick question at you, here is the quick answer.',
      },
      {
        type: 'ul',
        items: [
          'How long does it take? Most clients see results in 30 to 45 days, reach 640+ in 3 to 4 months.',
          'What is your success rate? We have helped hundreds get approved for homes.',
          'Is this legal? 100% legal. We use federal laws that protect consumers.',
          'Can I cancel? No contracts. Pause or cancel anytime.',
          'What if I am not satisfied? 100% Satisfaction Guarantee.',
        ],
      },

      { type: 'h3', text: 'Power phrases' },
      {
        type: 'p',
        text: 'Memorize these. Drop them into the conversation naturally. They work.',
      },
      {
        type: 'ul',
        items: [
          'I specialize in cases just like yours.',
          'The mortgage company is waiting to approve you.',
          'This is an investment in your future.',
          'Every day you wait costs you money.',
          'Let us turn your no into a yes for homeownership.',
          'I am here to make this simple and stress free.',
        ],
      },

      { type: 'h3', text: 'Section M — Compliance from the original knowledge base' },
      {
        type: 'p',
        text: 'Never say:',
      },
      {
        type: 'ul',
        items: [
          'Specific score increase guarantees.',
          'Exact timeframes for individual results.',
          'That we can remove accurate information.',
          'Anything that could be construed as legal advice.',
        ],
      },
      {
        type: 'p',
        text: 'Always say:',
      },
      {
        type: 'ul',
        items: [
          'Results vary by individual situation.',
          'Average timeline is 3 to 4 months.',
          'We dispute inaccurate or unverifiable items.',
          'Money back guarantee for confidence.',
          'We have helped hundreds in similar situations.',
        ],
      },
      {
        type: 'p',
        text: 'Documentation required after enrollment:',
      },
      {
        type: 'ol',
        items: [
          'Two proofs of address.',
          'One proof of Social Security.',
          'Current credit reports.',
        ],
      },

      { type: 'h3', text: 'Section N — The Legacy Credits feature inventory (now Home Ready Scores)' },
      {
        type: 'p',
        text:
          'The original Legacy Credits software had a complete feature set that Home Ready Scores is built to replicate. As a rep, you should know what the platform does so you can speak to it when a prospect asks. Here is the feature inventory, translated to Home Ready Scores.',
      },
      {
        type: 'p',
        text: 'Client management:',
      },
      {
        type: 'ul',
        items: [
          'Client lifecycle management from Prospect to Client to Complete or Cancelled.',
          'Three bureau credit repair tracking across Equifax, Experian, and TransUnion.',
          'Multi round dispute letter generation with bureau specific templates.',
          'Creditor letter system including Debt Validation, Qualified Written Request, Direct Dispute, and Verification.',
          'Creditor database with over 4,420 entries.',
          'Dispute status tracking with 35+ beginning statuses and 29+ tail end dispute templates.',
          'Result Tracker with multiple layout views.',
          'Billing and payment processing via Clover (credit card, subscriptions).',
          'Affiliate and broker management with referral tracking and reports.',
          'SMS and email communication with autoresponders.',
          'Canned response system (hot links) for fast, consistent notes.',
          'Help desk and ticketing system.',
          'Appointment scheduling.',
          'Document management with secure uploads.',
          'Reporting suite including Closing Ratio, Note Ratio, and Referral Reports.',
          'User and staff management with role based access.',
          'Client portal with login credentials per client.',
          'Round Robin lead assignment.',
        ],
      },
      {
        type: 'p',
        text: 'Canned hot links (the notes you will use every day):',
      },
      {
        type: 'ul',
        items: [
          'Updated Experian, Updated Equifax, Updated TransUnion.',
          'Acknowledgments for each bureau.',
          'Updated Frivolous Experian, Updated Frivolous TransUnion.',
          'Late Results.',
          'Drafted Letters.',
          'NSF, NSF x2, Canceled.',
          'Overdue Account - Left Message.',
          'Overdue Account - Ring no answer.',
          'Credit Results via fax.',
          '1st and 2nd Failed Monthly Payment.',
          'CreditReportOnly.',
          'Help ticket response.',
          'Terminated Account.',
          'ProofOfSocial, MU Credit Report, ProofOfAddress.',
          'Failed Enrollment Payment.',
          'Client Cancelled Account.',
          'Received All Docs.',
          'Pending Termination.',
          'Documentation Request.',
          'Required Documents.',
          'Opt out, Payment Received.',
          'Next Round, Client.',
          'Creditor Acknowledgement.',
          'Cancellation Phone Call.',
          'Letters W/O Docs.',
          'Client Phone Call, Welcome.',
          'Cxl Request.',
          'Received Partial Docs.',
          'Phone call or voicemail.',
          'CR for Manual Update.',
        ],
      },

      { type: 'h3', text: 'Section O — Final reminders from the original knowledge base' },
      {
        type: 'p',
        text:
          'Your role is the bridge between the prospect current situation and homeownership. Stay confident, empathetic, and solution focused. You are not just selling credit repair. You are selling the American Dream of homeownership.',
      },
      {
        type: 'p',
        text: 'Remember:',
      },
      {
        type: 'ul',
        items: [
          'Build trust first.',
          'Provide clarity always.',
          'Give hope throughout.',
          'Guide decisions confidently.',
          'Close with urgency.',
          'Follow up with care.',
          'The enrollment URL is homereadyscores.com/get-started.',
          'The support email is help@homereadyscores.com.',
          'You are a Home Ready Scores specialist, and you change lives by helping people achieve their dream of homeownership through credit repair.',
        ],
      },
    ],
  },
  {
    id: 'roadmap',
    number: 14,
    title: 'What still needs to be built',
    blocks: [
      {
        type: 'p',
        text:
          'These assets will deepen the program over time (ownership TBD by leadership):',
      },
      {
        type: 'ol',
        items: [
          'Recorded sales call examples — opening through close.',
          'Platform walkthrough video — screen recording of the admin (clients, notes, disputes, billing).',
          'Client success stories — documented before/after examples with timelines.',
          'Compliance training — FCRA / CROA guardrails for what reps may say.',
          'Keep training pricing and fees in sync with Get Started and marketing whenever plans change.',
          'Referral partner onboarding guide — step-by-step for new realtor or banker relationships.',
          'Cancellation save playbook — scripts for at-risk accounts.',
          'NSF recovery — payment failure process and re-engagement.',
          'KPI targets — calls/day, enrollments/week, retention — per leadership.',
        ],
      },
    ],
  },
];
