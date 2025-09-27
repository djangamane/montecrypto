export const SCAM_LIKELY_PRODUCT_ID = 'scam_likely';

export const ACTIVE_ENTITLEMENT_STATUSES = new Set(['active', 'past_due']);

export function getEntitlementStatus(entitlement) {
  if (!entitlement) return 'none';
  if (ACTIVE_ENTITLEMENT_STATUSES.has(entitlement.status)) return 'active';
  if (entitlement.status === 'pending') return 'pending';
  return 'inactive';
}
