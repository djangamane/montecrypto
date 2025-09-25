import { supabase } from '../_lib/supabase.js';
import { fetchPayPal, verifyWebhookSignature } from '../_lib/paypal.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await readRequestBody(req);

  const headers = Object.fromEntries(
    Object.entries(req.headers).map(([key, value]) => [key.toLowerCase(), value])
  );

  const isValid = await verifyWebhookSignature(headers, rawBody);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = JSON.parse(rawBody);

  try {
    await handleEvent(event);
  } catch (error) {
    console.error('Webhook handler error', error);
    return res.status(500).json({ error: 'Failed to process webhook' });
  }

  return res.status(200).json({ received: true });
}

async function handleEvent(event) {
  const subscriptionId = event?.resource?.id ?? event?.resource?.billing_agreement_id;
  if (!subscriptionId) {
    return;
  }

  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('id')
    .eq('payment_reference', subscriptionId)
    .maybeSingle();

  if (!entitlement) {
    return;
  }

  if (
    event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
    event.event_type === 'PAYMENT.SALE.COMPLETED'
  ) {
    const subscription = await fetchPayPal(`/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
    });

    const nextBilling = subscription?.billing_info?.next_billing_time ?? null;

    await supabase
      .from('entitlements')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
        expires_at: nextBilling,
        metadata: subscription ? subscription : null,
      })
      .eq('id', entitlement.id);

    return;
  }

  if (
    event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ||
    event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
    event.event_type === 'BILLING.SUBSCRIPTION.EXPIRED'
  ) {
    await supabase
      .from('entitlements')
      .update({
        status: 'revoked',
        expires_at: event?.resource?.update_time ?? null,
      })
      .eq('id', entitlement.id);

    return;
  }

  if (event.event_type === 'PAYMENT.SALE.DENIED') {
    await supabase
      .from('entitlements')
      .update({ status: 'past_due' })
      .eq('id', entitlement.id);
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', (error) => reject(error));
  });
}
