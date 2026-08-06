// POST /api/enroll
// Full enrollment flow: GHL contact + Supabase client + Clover customer + charge setup fee + create subscription
// Called from the Get Started page when the prospect submits with a credit card
// Body: {
//   firstName, lastName, email, phone, goal, plan ('single'|'couple'), billingZip,
//   creditReportAgreement (bool), source (clv_ card token from Clover iframe)
// }

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CLOVER_SCL_BASE = 'https://scl-sandbox.dev.clover.com';
const CLOVER_API_BASE = 'https://apisandbox.dev.clover.com';

const PLANS = {
  single: { setupFee: 184.99, monthly: 114.00, name: 'Single Enrollment' },
  couple: { setupFee: 304.99, monthly: 190.00, name: 'Couple Enrollment' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    goal,
    plan,
    billingZip,
    creditReportAgreement,
    source,
  } = req.body;

  const log = [];
  const pushLog = (action, description, metadata) => {
    log.push({ action, description, metadata, timestamp: new Date().toISOString() });
  };

  try {
    // ─── Validation ───
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'First name, last name, email, and phone are required' });
    }
    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ error: 'Valid plan is required (single or couple)' });
    }
    if (!source) {
      return res.status(400).json({ error: 'Payment source (card token) is required' });
    }
    if (!creditReportAgreement) {
      return res.status(400).json({ error: 'Credit report agreement is required' });
    }

    const planConfig = PLANS[plan];
    const setupCents = Math.round(planConfig.setupFee * 100);
    const monthlyCents = Math.round(planConfig.monthly * 100);
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.replace(/\D/g, '');
    const accessToken = process.env.CLOVER_ACCESS_TOKEN;
    const merchantId = process.env.CLOVER_MERCHANT_ID;

    if (!accessToken || !merchantId) {
      return res.status(500).json({ error: 'Clover credentials not configured' });
    }

    pushLog('enrollment_started', `Enrollment started for ${firstName} ${lastName}, plan: ${planConfig.name}`);

    // ─── Step 1: Create GHL Contact ───
    let ghlContactId = null;
    try {
      const ghlResponse = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(process.env.GHL_API_KEY || '').trim()}`,
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: cleanEmail,
          phone: cleanPhone,
          locationId: process.env.GHL_LOCATION_ID,
          source: 'Website Enrollment',
          tags: ['HomeReadyEnrolled', `Plan: ${planConfig.name}`, goal ? `Goal: ${goal}` : ''].filter(Boolean),
          customFields: [
            { id: 'RKBxUXo7C9vPWWGdgCz1', key: 'contact.billing_zip_code', field_value: billingZip || '' },
            { id: 'UXmy6qfFuKHyYbpOrCnm', key: 'contact.single_or_joint_account', field_value: planConfig.name },
          ],
        }),
      });

      if (ghlResponse.ok) {
        const ghlData = await ghlResponse.json();
        ghlContactId = ghlData.contact?.id || null;
        pushLog('ghl_contact_created', `GHL contact created: ${ghlContactId || 'no id returned'}`);
      } else {
        const ghlErr = await ghlResponse.json().catch(() => ({}));
        pushLog('ghl_contact_failed', `GHL contact creation failed: ${JSON.stringify(ghlErr)}`);
      }
    } catch (err) {
      pushLog('ghl_contact_error', `GHL contact error: ${err.message}`);
    }

    // ─── Step 2: Create or update Supabase client ───
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    let clientId = existingClient?.id;

    if (!existingClient) {
      const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: cleanEmail,
          phone: cleanPhone,
          status: 'active',
          ghl_contact_id: ghlContactId,
          billing_zip: billingZip,
          enrollment_goal: goal,
          enrollment_plan: plan,
          enrollment_date: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        pushLog('client_insert_error', `Supabase client insert error: ${insertError.message}`);
        return res.status(500).json({ error: 'Failed to create client record', log });
      }
      clientId = newClient.id;
      pushLog('client_created', `Supabase client created: ${clientId}`);
    } else {
      await supabase
        .from('clients')
        .update({
          ghl_contact_id: ghlContactId,
          billing_zip: billingZip,
          enrollment_goal: goal,
          enrollment_plan: plan,
          enrollment_date: new Date().toISOString(),
        })
        .eq('id', existingClient.id);
      pushLog('client_updated', `Existing Supabase client updated: ${clientId}`);
    }

    // ─── Step 3: Create Clover Customer with card-on-file ───
    const customerRes = await fetch(`${CLOVER_SCL_BASE}/v1/customers`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        firstName,
        lastName,
        source,
      }),
    });

    const customerData = await customerRes.json();
    if (!customerRes.ok) {
      pushLog('clover_customer_failed', `Clover customer creation failed: ${JSON.stringify(customerData)}`);
      return res.status(400).json({
        error: 'Failed to create payment customer. Please check your card details and try again.',
        step: 'create_customer',
        details: customerData,
        log,
      });
    }

    const cloverCustomerId = customerData.id;
    pushLog('clover_customer_created', `Clover customer created: ${cloverCustomerId}`);

    // ─── Step 4: Charge the setup fee ───
    const chargeRes = await fetch(`${CLOVER_SCL_BASE}/v1/charges`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'idempotency-key': randomUUID(),
      },
      body: JSON.stringify({
        amount: setupCents,
        currency: 'usd',
        source: cloverCustomerId,
        description: `Setup fee for ${firstName} ${lastName} - ${planConfig.name} - ${cleanEmail}`,
      }),
    });

    const chargeData = await chargeRes.json();
    if (!chargeRes.ok) {
      pushLog('setup_fee_failed', `Setup fee charge failed: ${JSON.stringify(chargeData)}`);
      return res.status(400).json({
        error: 'Your card was declined. Please check your card details and try again.',
        step: 'charge_setup_fee',
        details: chargeData,
        log,
      });
    }

    pushLog('setup_fee_charged', `Setup fee charged: $${planConfig.setupFee.toFixed(2)}, charge ID: ${chargeData.id}, status: ${chargeData.status}`);

    // ─── Step 5: Create Clover plan ───
    const planRes = await fetch(`${CLOVER_API_BASE}/recurring/v1/plans`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Clover-Merchant-Id': merchantId,
      },
      body: JSON.stringify({
        name: `${planConfig.name} - ${firstName} ${lastName}`.trim(),
        amount: monthlyCents,
        interval: 'MONTH',
        intervalCount: 1,
        note: `Recurring billing for ${cleanEmail}`,
      }),
    });

    const planData = await planRes.json();
    if (!planRes.ok) {
      pushLog('plan_creation_failed', `Clover plan creation failed: ${JSON.stringify(planData)}`);
      return res.status(500).json({
        error: 'Setup fee was charged but monthly plan creation failed. Our team will contact you.',
        step: 'create_plan',
        details: planData,
        log,
      });
    }

    pushLog('plan_created', `Clover plan created: ${planData.id}`);

    // ─── Step 6: Create subscription ───
    const recurringStartDate = new Date();
    recurringStartDate.setMonth(recurringStartDate.getMonth() + 1);
    const startDateStr = recurringStartDate.toISOString().split('T')[0];

    const subRes = await fetch(
      `${CLOVER_API_BASE}/recurring/v1/plans/${planData.id}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Clover-Merchant-Id': merchantId,
        },
        body: JSON.stringify({
          collectionMethod: 'CHARGE_AUTOMATICALLY',
          customerId: cloverCustomerId,
          amount: monthlyCents,
          startDate: startDateStr,
        }),
      }
    );

    const subData = await subRes.json();
    if (!subRes.ok) {
      pushLog('subscription_failed', `Clover subscription failed: ${JSON.stringify(subData)}`);
      return res.status(500).json({
        error: 'Setup fee was charged but subscription creation failed. Our team will contact you.',
        step: 'create_subscription',
        details: subData,
        log,
      });
    }

    pushLog('subscription_created', `Clover subscription created: ${subData.id}, starts: ${startDateStr}`);

    // ─── Step 7: Save everything to Supabase ───
    // Update client with Clover customer ID
    await supabase
      .from('clients')
      .update({ clover_customer_id: cloverCustomerId })
      .eq('id', clientId);

    // Upsert payment record
    await supabase.from('payments').upsert({
      client_id: clientId,
      setup_fee_amount: setupCents,
      setup_fee_date: new Date().toISOString(),
      setup_fee_status: chargeData.status === 'succeeded' ? 'paid' : 'pending',
      monthly_amount: monthlyCents,
      monthly_start_date: startDateStr,
      monthly_status: 'active',
      clover_customer_id: cloverCustomerId,
      clover_plan_id: planData.id,
      clover_subscription_id: subData.id,
      next_billing_date: startDateStr,
      billing_status: 'active',
      last_payment_date: new Date().toISOString(),
      last_payment_status: chargeData.status === 'succeeded' ? 'succeeded' : 'pending',
    }, { onConflict: 'client_id' });

    // Insert payment history record for the setup fee
    await supabase.from('payment_history').insert({
      client_id: clientId,
      type: 'setup_fee',
      amount: setupCents,
      status: chargeData.status === 'succeeded' ? 'succeeded' : 'pending',
      clover_charge_id: chargeData.id,
      clover_subscription_id: subData.id,
      clover_plan_id: planData.id,
      description: `${planConfig.name} setup fee`,
    });

    // Create enrollment record
    await supabase.from('enrollments').insert({
      client_id: clientId,
      first_name: firstName,
      last_name: lastName,
      email: cleanEmail,
      phone: cleanPhone,
      goal,
      plan,
      billing_zip: billingZip,
      credit_report_agreement: creditReportAgreement,
      setup_fee_amount: setupCents,
      monthly_amount: monthlyCents,
      setup_fee_status: chargeData.status === 'succeeded' ? 'paid' : 'pending',
      subscription_status: 'active',
      clover_customer_id: cloverCustomerId,
      clover_charge_id: chargeData.id,
      clover_plan_id: planData.id,
      clover_subscription_id: subData.id,
      ghl_contact_id: ghlContactId,
      enrollment_source: 'website',
      status: 'enrolled',
    });

    // Create intake form
    await supabase.from('intake_forms').upsert({
      client_id: clientId,
      goals: goal ? [goal] : [],
      notes: `Enrolled via website - ${planConfig.name}. Setup fee $${planConfig.setupFee.toFixed(2)} charged. Monthly $${planConfig.monthly.toFixed(2)} starting ${startDateStr}.`,
    }, { onConflict: 'client_id' });

    // Write activity log entries
    const activityEntries = [
      { entity_type: 'client', entity_id: clientId, action: 'enrollment', description: `Client enrolled via website - ${planConfig.name}`, metadata: { plan, setupFee: planConfig.setupFee, monthly: planConfig.monthly, ghlContactId } },
      { entity_type: 'client', entity_id: clientId, action: 'payment_setup_fee', description: `Setup fee charged: $${planConfig.setupFee.toFixed(2)}`, metadata: { cloverChargeId: chargeData.id, status: chargeData.status } },
      { entity_type: 'client', entity_id: clientId, action: 'subscription_created', description: `Monthly subscription created: $${planConfig.monthly.toFixed(2)}/mo starting ${startDateStr}`, metadata: { cloverPlanId: planData.id, cloverSubscriptionId: subData.id } },
      { entity_type: 'client', entity_id: clientId, action: 'ghl_contact_created', description: `GHL contact created for enrollment`, metadata: { ghlContactId } },
    ];

    for (const entry of activityEntries) {
      await supabase.from('activity_log').insert(entry);
    }

    pushLog('supabase_saved', 'All records saved to Supabase (client, payment, enrollment, intake, activity log)');

    // ─── Done ───
    return res.status(200).json({
      success: true,
      clientId,
      ghlContactId,
      cloverCustomerId,
      chargeId: chargeData.id,
      chargeStatus: chargeData.status,
      planId: planData.id,
      subscriptionId: subData.id,
      subscriptionStartDate: startDateStr,
      planName: planConfig.name,
      setupFeeCharged: planConfig.setupFee,
      monthlyAmount: planConfig.monthly,
      log,
    });

  } catch (err) {
    console.error('Enrollment error:', err);
    pushLog('enrollment_error', `Unhandled error: ${err.message}`);
    return res.status(500).json({ error: 'Internal server error: ' + err.message, log });
  }
}