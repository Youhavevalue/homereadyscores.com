import { useState, useRef } from 'react';

const BUREAU_ADDRESSES = {
  Experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
  Equifax: 'Equifax Information Services, LLC\nP.O. Box 740256\nAtlanta, GA 30374',
  TransUnion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016',
};

const REASON_TEMPLATES = {
  'Not mine': 'I do not recognize this account and have no record of ever opening or authorizing it. This account does not belong to me.',
  'Inaccurate balance': 'The balance reported on this account is inaccurate and does not reflect the correct amount owed.',
  'Paid/settled': 'This account has been paid in full / settled, and should be updated to reflect a zero balance or removed from my credit report.',
  'Outdated': 'This account is beyond the 7-year reporting period mandated by the FCRA and should be removed from my credit report.',
  'Duplicate': 'This account appears to be a duplicate entry. The same debt is being reported multiple times, which unfairly impacts my credit score.',
  'Identity theft': 'I am a victim of identity theft. This account was opened fraudulently without my knowledge or consent.',
  'Other': 'I am disputing the accuracy of this item as reported on my credit report.',
};

const generateLetter = (client, dispute) => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const clientName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
  const clientAddress = [client.address, client.city && client.state ? `${client.city}, ${client.state} ${client.zip || ''}` : ''].filter(Boolean).join('\n');
  const bureauAddress = BUREAU_ADDRESSES[dispute.bureau] || dispute.bureau;
  const reasonDetail = REASON_TEMPLATES[dispute.dispute_reason] || dispute.dispute_reason;

  return `${today}

${clientName}
${clientAddress || '[Client Address]'}

${bureauAddress}

Re: Dispute of Inaccurate Information — Account: ${dispute.account_name || '[Account Name]'}${dispute.account_number_last4 ? ` (****${dispute.account_number_last4})` : ''}

To Whom It May Concern:

I am writing to dispute the following information that appears on my credit report. After reviewing my credit report, I identified the following item that is inaccurate, incomplete, or unverifiable:

    Creditor/Account Name: ${dispute.account_name || '[Account Name]'}
    Account Number (Last 4): ${dispute.account_number_last4 || 'N/A'}
    Reason for Dispute: ${dispute.dispute_reason || 'Inaccurate information'}

${reasonDetail}

Under the Fair Credit Reporting Act (FCRA), Section 611 [15 U.S.C. § 1681i], you are required to conduct a reasonable investigation into this disputed item within 30 days of receiving this notice. If the information cannot be verified, it must be promptly deleted or corrected.

I am requesting that you:
1. Investigate this disputed item immediately.
2. Provide me with copies of any documentation used to verify this account.
3. Remove or correct this item if it cannot be properly verified.
4. Send me an updated copy of my credit report reflecting any changes.

Please send all correspondence regarding this dispute to the address listed above.

Thank you for your prompt attention to this matter.

Sincerely,

${clientName}`;
};

const DisputeLetterModal = ({ dispute, client, onSave, onClose }) => {
  const [letterText, setLetterText] = useState(
    dispute.letter_text || generateLetter(client, dispute)
  );
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const textRef = useRef(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      if (textRef.current) {
        textRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Dispute Letter</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; padding: 1in; white-space: pre-wrap; max-width: 8.5in; }
      </style></head>
      <body>${letterText}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(letterText);
    setSaving(false);
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <div>
            <h2 style={s.modalTitle}>Dispute Letter</h2>
            <p style={s.modalSubtitle}>
              {dispute.bureau} — {dispute.account_name || 'General'} — Round {dispute.round_number || 1}
            </p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={s.modalBody}>
          <textarea
            ref={textRef}
            value={letterText}
            onChange={(e) => setLetterText(e.target.value)}
            style={s.letterTextarea}
            spellCheck
          />
        </div>

        <div style={s.modalFooter}>
          <div style={s.footerLeft}>
            <button style={s.actionBtn} onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button style={s.actionBtn} onClick={handlePrint}>
              🖨️ Print
            </button>
          </div>
          <div style={s.footerRight}>
            <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Letter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: '800px', maxHeight: '90vh', background: '#12122a',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex',
    flexDirection: 'column', overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  modalTitle: { fontSize: '1.25rem', fontWeight: '700', margin: '0 0 4px', color: '#fff' },
  modalSubtitle: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0 },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: 'rgba(255,255,255,0.5)', width: '36px', height: '36px',
    fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modalBody: { flex: 1, padding: '24px 28px', overflow: 'auto' },
  letterTextarea: {
    width: '100%', minHeight: '400px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px',
    color: '#fff', fontSize: '0.9rem', lineHeight: '1.7', fontFamily: "'Georgia', 'Times New Roman', serif",
    resize: 'vertical', outline: 'none', boxSizing: 'border-box',
  },
  modalFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 28px', borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  footerLeft: { display: 'flex', gap: '8px' },
  footerRight: { display: 'flex', gap: '8px' },
  actionBtn: {
    padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '500',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
  },
  cancelBtn: {
    padding: '10px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none',
    borderRadius: '10px', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', gap: '4px',
  },
};

export default DisputeLetterModal;
