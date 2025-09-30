export const SCAM_LIKELY_PRODUCT_ID = "scam_likely";
export const SCAM_LIKELY_MONTHLY_PRODUCT_ID = "scam_likely_monthly";
export const SCAM_LIKELY_YEARLY_PRODUCT_ID = "scam_likely_yearly";
export const SCAM_LIKELY_LIFETIME_PRODUCT_ID = "lifetime_access";

export const ALL_SCAM_LIKELY_PRODUCT_IDS = [
  SCAM_LIKELY_PRODUCT_ID,
  SCAM_LIKELY_MONTHLY_PRODUCT_ID,
  SCAM_LIKELY_YEARLY_PRODUCT_ID,
  SCAM_LIKELY_LIFETIME_PRODUCT_ID,
];

export const ACTIVE_ENTITLEMENT_STATUSES = new Set(["active", "past_due"]);

export function getEntitlementStatus(entitlement) {
  if (!entitlement) return "none";
  if (ACTIVE_ENTITLEMENT_STATUSES.has(entitlement.status)) return "active";
  if (entitlement.status === "pending") return "pending";
  return "inactive";
}
