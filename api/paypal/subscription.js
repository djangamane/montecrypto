import { supabase } from '../_lib/supabase.js';
import { fetchPayPal } from '../_lib/paypal.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring('Bearer '.length)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Supabase access token' });
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult?.user) {
    return res.status(401).json({ error: 'Invalid Supabase session' });
  }

  const { subscriptionId } = req.body ?? {};
  if (!subscriptionId) {
    return res.status(400).json({ error: 'Missing subscriptionId' });
  }

  let subscription;
  try {
    subscription = await fetchPayPal(`/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const allowedStatuses = new Set(['ACTIVE', 'APPROVAL_PENDING']);
  if (!allowedStatuses.has(subscription?.status)) {
    return res.status(400).json({ error: `Subscription status ${subscription?.status} not valid` });
  }

  const nextBilling = subscription?.billing_info?.next_billing_time ?? null;

  const { error: rpcError } = await supabase.rpc('activate_entitlement', {
    p_user: userResult.user.id,
    p_product: 'scam_likely',
    p_provider: 'paypal',
    p_reference: subscriptionId,
    p_expires: nextBilling,
  });

  if (rpcError) {
    console.error('Supabase RPC error', rpcError);
    return res.status(500).json({ error: 'Failed to activate entitlement' });
  }

  return res.status(200).json({ success: true });
}
