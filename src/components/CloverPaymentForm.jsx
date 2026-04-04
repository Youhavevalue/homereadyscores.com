import { useState, useEffect, useRef } from 'react';
import { portalFetch } from '../lib/supabase';

/**
 * CloverPaymentForm — Embeds the Clover iframe for secure card tokenization
 * and triggers the full payment flow (customer + setup fee + subscription)
 */
const CloverPaymentForm = ({ client, onPaymentSuccess, onClose }) => {
  const [cloverLoaded, setCloverLoaded] = useState(false);
  const [cloverConfig, setCloverConfig] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    setupFee: '250',
    monthlyAmount: '99',
    startDate: new Date().toISOString().split('T')[0],
  });

  const cloverRef = useRef(null);
  const elementsRef = useRef({});
  const sdkLoaded = useRef(false);

  // Load Clover config from our API
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/clover/config');
        if (res.ok) {
          const data = await res.json();
          setCloverConfig(data);
        } else {
          const envKey = import.meta.env.VITE_CLOVER_API_ACCESS_KEY;
          const envMerchant = import.meta.env.VITE_CLOVER_MERCHANT_ID;
          if (envKey && envMerchant) {
            setCloverConfig({
              apiAccessKey: envKey,
              merchantId: envMerchant,
              sdkUrl: 'https://checkout.sandbox.dev.clover.com/sdk.js',
            });
          } else {
            setError('Payment configuration unavailable. Please contact support.');
          }
        }
      } catch {
        setError('Unable to load payment form. Please check your connection and try again.');
      }
    }
    fetchConfig();
  }, []);

  // Load Clover SDK and mount iframe elements
  useEffect(() => {
    if (!cloverConfig || sdkLoaded.current) return;

    const script = document.createElement('script');
    script.src = cloverConfig.sdkUrl;
    script.async = true;
    script.onload = () => {
      sdkLoaded.current = true;
      try {
        const clover = new window.Clover(cloverConfig.apiAccessKey, {
          merchantId: cloverConfig.merchantId,
        });
        cloverRef.current = clover;
        const elements = clover.elements();

        const styles = {
          body: {
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: '14px',
            color: '#e2e8f0',
          },
          input: {
            fontSize: '14px',
            color: '#e2e8f0',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '0',
          },
        };

        const cardNumber = elements.create('CARD_NUMBER', styles);
        const cardDate = elements.create('CARD_DATE', styles);
        const cardCvv = elements.create('CARD_CVV', styles);
        const cardPostalCode = elements.create('CARD_POSTAL_CODE', styles);

        cardNumber.mount('#clover-card-number');
        cardDate.mount('#clover-card-date');
        cardCvv.mount('#clover-card-cvv');
        cardPostalCode.mount('#clover-card-postal');

        elementsRef.current = { cardNumber, cardDate, cardCvv, cardPostalCode };
        setCloverLoaded(true);
      } catch (err) {
        console.error('Clover SDK init error:', err);
        setError('Failed to initialize payment form. Please refresh and try again.');
      }
    };
    script.onerror = () => {
      setError('Failed to load payment SDK. Check your internet connection.');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      try { document.head.removeChild(script); } catch {}
    };
  }, [cloverConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cloverRef.current || processing) return;

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Tokenize the card via Clover iframe
      const result = await cloverRef.current.createToken();

      if (result.errors) {
        const errMsg = Object.values(result.errors).join(', ');
        setError(`Card validation failed: ${errMsg}`);
        setProcessing(false);
        return;
      }

      if (!result.token) {
        setError('Failed to tokenize card. Please try again.');
        setProcessing(false);
        return;
      }

      // Step 2: Send to our process-payment API
      const paymentRes = await portalFetch('/api/clover/process-payment', {
        method: 'POST',
        body: JSON.stringify({
          clientId: client.id,
          email: client.email,
          firstName: client.first_name,
          lastName: client.last_name,
          source: result.token,
          setupFeeAmount: parseFloat(form.setupFee) || 0,
          monthlyAmount: parseFloat(form.monthlyAmount) || 0,
          recurringStartDate: form.startDate,
          planName: 'Monthly Credit Repair',
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        setError(paymentData.error || 'Payment processing failed');
        setProcessing(false);
        return;
      }

      setSuccess(true);
      if (onPaymentSuccess) onPaymentSuccess(paymentData);

    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.successBox}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>Payment Processed!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
              Customer created, card saved, and billing set up.
            </p>
            <button style={styles.closeBtn} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            💳 Set Up Payment — {client.first_name} {client.last_name}
          </h2>
          <button style={styles.closeX} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Billing Config */}
          <div style={styles.configSection}>
            <div style={styles.configRow}>
              <div style={styles.configField}>
                <label style={styles.configLabel}>Setup Fee ($)</label>
                <input
                  style={styles.configInput}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.setupFee}
                  onChange={(e) => setForm({ ...form, setupFee: e.target.value })}
                />
              </div>
              <div style={styles.configField}>
                <label style={styles.configLabel}>Monthly Amount ($)</label>
                <input
                  style={styles.configInput}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthlyAmount}
                  onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })}
                />
              </div>
              <div style={styles.configField}>
                <label style={styles.configLabel}>Billing Start Date</label>
                <input
                  style={styles.configInput}
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Card Entry via Clover iframe */}
          <div style={styles.cardSection}>
            <h3 style={styles.sectionTitle}>Card Information</h3>
            <p style={styles.sectionSub}>
              🔒 Card data is handled securely by Clover — never touches our server.
            </p>

            <div style={styles.iframeRow}>
              <div style={styles.iframeField}>
                <label style={styles.iframeLabel}>Card Number</label>
                <div id="clover-card-number" style={styles.iframeContainer}></div>
              </div>
            </div>
            <div style={styles.iframeRowSmall}>
              <div style={styles.iframeField}>
                <label style={styles.iframeLabel}>Expiry</label>
                <div id="clover-card-date" style={styles.iframeContainer}></div>
              </div>
              <div style={styles.iframeField}>
                <label style={styles.iframeLabel}>CVV</label>
                <div id="clover-card-cvv" style={styles.iframeContainer}></div>
              </div>
              <div style={styles.iframeField}>
                <label style={styles.iframeLabel}>ZIP</label>
                <div id="clover-card-postal" style={styles.iframeContainer}></div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {/* Summary & Submit */}
          <div style={styles.summarySection}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Setup Fee (charged now):</span>
              <span style={styles.summaryValue}>${parseFloat(form.setupFee || 0).toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Monthly Recurring:</span>
              <span style={styles.summaryValue}>${parseFloat(form.monthlyAmount || 0).toFixed(2)}/mo</span>
            </div>
            <div style={{ ...styles.summaryRow, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '8px' }}>
              <span style={{ ...styles.summaryLabel, fontWeight: '700' }}>Total Today:</span>
              <span style={{ ...styles.summaryValue, fontSize: '1.2rem', color: '#10b981' }}>
                ${parseFloat(form.setupFee || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: (!cloverLoaded || processing) ? 0.5 : 1,
                cursor: (!cloverLoaded || processing) ? 'not-allowed' : 'pointer',
              }}
              disabled={!cloverLoaded || processing}
            >
              {processing ? '⏳ Processing...' : cloverLoaded ? '🔒 Charge & Set Up Billing' : '⏳ Loading Payment Form...'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Styles ─── */
const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)', padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#fff' },
  closeX: {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
    fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px',
  },
  configSection: { padding: '20px 28px' },
  configRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' },
  configField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  configLabel: {
    fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  configInput: {
    padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    color: '#fff', fontSize: '0.9rem', outline: 'none',
  },
  cardSection: {
    padding: '20px 28px', margin: '0 28px',
    background: 'rgba(255,255,255,0.02)', borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  sectionTitle: { margin: '0 0 4px', fontSize: '0.95rem', fontWeight: '600' },
  sectionSub: { margin: '0 0 16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' },
  iframeRow: { marginBottom: '12px' },
  iframeRowSmall: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  iframeField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  iframeLabel: {
    fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  iframeContainer: {
    padding: '12px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    minHeight: '42px',
  },
  errorBox: {
    margin: '16px 28px 0', padding: '12px 16px',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '10px', color: '#ef4444', fontSize: '0.85rem',
  },
  summarySection: { padding: '20px 28px' },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 0',
  },
  summaryLabel: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' },
  summaryValue: { fontSize: '1rem', fontWeight: '600', color: '#fff' },
  buttonRow: {
    display: 'flex', gap: '12px', justifyContent: 'flex-end',
    padding: '16px 28px 24px',
  },
  cancelBtn: {
    padding: '12px 20px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
    color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', cursor: 'pointer',
  },
  submitBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none', borderRadius: '12px', color: '#fff',
    fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
  },
  successBox: { padding: '48px 28px', textAlign: 'center' },
  closeBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    border: 'none', borderRadius: '12px', color: '#fff',
    fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
  },
};

export default CloverPaymentForm;
