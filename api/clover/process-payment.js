// POST /api/clover/process-payment
// Complete payment flow: creates customer, charges setup fee, creates subscription
// This is the main endpoint called from the Client Profile payments tab
// Body: {
//   clientId (Supabase client ID),
//   email, firstName, lastName,
//   source (clv_ card token),
//   setupFeeAmount (in dollars, e.g. 250),
//   setupFeeDate (ISO date — null = charge now),
//   monthlyAmount (in dollars, e.g. 99),
//   recurringStartDate (ISO date),
//   planName (e.g. "Monthly Credit Repair")
// }

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CLOVER_SCL_BASE = 'https://scl-sandbox.dev.clover.com';
const CLOVER_API_BASE = 'https://apisandbox.dev.clover.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    clientId,
    email,
    firstName,
    lastName,
    source,
    setupFeeAmount,
    setupFeeDate,
    monthlyAmount,
    recurringStartDate,
    planName = 'Monthly Credit Repair',
  } = req.body;

  if (!clientId || !email || !source) {
    return res.status(400).json({ error: 'clientId, email, and source (card token) are required' });
  }

  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  if (!accessToken || !merchantId) {
    return res.status(500).json({ error: 'Clover credentials not configured' });
  }

  const results = { steps: [] };

  try {
    // ─── Step 1: Create Customer with Card-on-File ───
    const customerRes = await fetch(`${CLOVER_SCL_BASE}/v1/customers`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        source,
      }),
    });

    const customerData = await customerRes.json();
    if (!customerRes.ok) {
      return res.status(customerRes.status).json({
        error: 'Failed to create Clover customer',
        step: 'create_customer',
        details: customerData,
      });
    }

    const cloverCustomerId = customerData.id;
    results.steps.push({ step: 'create_customer', customerId: cloverCustomerId });

    // Save Clover customer ID to Supabase
    await supabase
      .from('clients')
      .update({ clover_customer_id: cloverCustomerId })
      .eq('id', clientId);

    // ─── Step 2: Charge Setup Fee ───
    if (setupFeeAmount && setupFeeAmount > 0) {
      const setupCents = Math.round(setupFeeAmount * 100);
      const chargeNow = !setupFeeDate || new Date(setupFeeDate) <= new Date();

      if (chargeNow) {
        // Charge immediately
        const chargeRes = await fetch(`${CLOVER_SCL_BASE}/v1/charges`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'idempotency-key': randomUUID(),
          },
          body: JSON.stringify({
            amount: setupCents,
            currency: 'usd',
            source: cloverCustomerId,
            description: `Setup fee for ${firstName || ''} ${lastName || ''} - ${email}`,
          }),
        });

        const chargeData = await chargeRes.json();
        if (!chargeRes.ok) {
          return res.status(chargeRes.status).json({
            error: 'Setup fee charge failed',
            step: 'charge_setup_fee',
            details: chargeData,
          });
        }

        results.steps.push({
          step: 'charge_setup_fee',
          chargeId: chargeData.id,
          amount: chargeData.amount,
          status: chargeData.status,
        });

        // Log to payment_history
        await supabase.from('payment_history').insert({
          client_id: clientId,
          type: 'setup_fee',
          amount: setupFeeAmount,
          status: chargeData.status === 'succeeded' ? 'completed' : 'pending',
          clover_charge_id: chargeData.id,
          description: 'Setup Fee',
        });
      } else {
        // Schedule for future — save to scheduled_charges table
        await supabase.from('scheduled_charges').insert({
          client_id: clientId,
          type: 'setup_fee',
          amount: setupFeeAmount,
          scheduled_date: setupFeeDate,
          status: 'pending',
          clover_customer_id: cloverCustomerId,
        });

        results.steps.push({
          step: 'schedule_setup_fee',
          scheduledDate: setupFeeDate,
          amount: setupFeeAmount,
        });
      }
    }

    // ─── Step 3: Create Plan & Subscription ───
    if (monthlyAmount && monthlyAmount > 0) {
      const monthlyCents = Math.round(monthlyAmount * 100);

      // Create a plan
      const planRes = await fetch(`${CLOVER_API_BASE}/recurring/v1/plans`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Clover-Merchant-Id': merchantId,
        },
        body: JSON.stringify({
          name: `${planName} - ${firstName || ''} ${lastName || ''}`.trim(),
          amount: monthlyCents,
          interval: 'MONTH',
          intervalCount: 1,
          note: `Recurring billing for client ${email}`,
        }),
      });

      const planData = await planRes.json();
      if (!planRes.ok) {
        return res.status(planRes.status).json({
          error: 'Failed to create billing plan',
          step: 'create_plan',
          details: planData,
        });
      }

      results.steps.push({ step: 'create_plan', planId: planData.id });

      // Create subscription
      const subPayload = {
        collectionMethod: 'CHARGE_AUTOMATICALLY',
        customerId: cloverCustomerId,
        amount: monthlyCents,
      };
      if (recurringStartDate) {
        subPayload.startDate = recurringStartDate;
      }

      const subRes = await fetch(
        `${CLOVER_API_BASE}/recurring/v1/plans/${planData.id}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Clover-Merchant-Id': merchantId,
          },
          body: JSON.stringify(subPayload),
        }
      );

      const subData = await subRes.json();
      if (!subRes.ok) {
        return res.status(subRes.status).json({
          error: 'Failed to create subscription',
          step: 'create_subscription',
          details: subData,
        });
      }

      results.steps.push({
        step: 'create_subscription',
        subscriptionId: subData.id,
        startDate: subData.startDate,
        active: subData.active,
      });

      // Update payment config in Supabase
      await supabase.from('payments').upsert({
        client_id: clientId,
        setup_fee: setupFeeAmount || 0,
        monthly_amount: monthlyAmount,
        recurring_start_date: recurringStartDate || new Date().toISOString(),
        clover_plan_id: planData.id,
        clover_subscription_id: subData.id,
        clover_customer_id: cloverCustomerId,
        status: 'active',
      }, { onConflict: 'client_id' });
    }

    // ─── Done ───
    return res.status(200).json({
      success: true,
      cloverCustomerId,
      results,
    });

  } catch (err) {
    console.error('Process payment exception:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
