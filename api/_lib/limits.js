
import { supabase } from './supabase.js';

export async function checkUsageAndEntitlements(userId) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: entitlements, error: entitlementsError } = await supabase
    .from('entitlements')
    .select('product, expires_at')
    .eq('user_id', userId)
    .in('status', ['active', 'past_due']);

  if (entitlementsError) {
    throw new Error(`Failed to fetch entitlements: ${entitlementsError.message}`);
  }

  const { count: dailyCount, error: dailyError } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfDay);

  if (dailyError) {
    throw new Error(`Failed to count daily scans: ${dailyError.message}`);
  }

  const { count: monthlyCount, error: monthlyError } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth);

  if (monthlyError) {
    throw new Error(`Failed to count monthly scans: ${monthlyError.message}`);
  }

  const activeProducts = entitlements.map(e => e.product);
  let plan = 'free';
  let scanLimit = 1; // Daily for free users

  if (activeProducts.includes('lifetime_access')) {
    plan = 'lifetime';
    scanLimit = 400; // Monthly
  } else if (activeProducts.includes('scam_likely_yearly')) {
    plan = 'yearly';
    scanLimit = 300; // Monthly
  } else if (activeProducts.includes('scam_likely_monthly')) {
    plan = 'monthly';
    scanLimit = 150; // Monthly
  }

  const usage = {
    daily: dailyCount,
    monthly: monthlyCount,
  };

  const isOverLimit = plan === 'free'
    ? usage.daily >= scanLimit
    : usage.monthly >= scanLimit;

  return {
    plan,
    scanLimit,
    usage,
    isOverLimit,
    hasActiveEntitlement: entitlements.length > 0,
  };
}
