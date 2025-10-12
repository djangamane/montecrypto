import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { useSupabaseSession } from "../../hooks/useSupabaseSession.js";
import { AuthPanel } from "../auth/AuthPanel.jsx";
import { PayPalSubscriptionButton } from "../payments/PayPalSubscriptionButton.jsx";
import { RiskyChristieApp } from "../risky_christie/RiskyChristieApp.jsx";
import {
  getEntitlementStatus,
  ALL_SCAM_LIKELY_PRODUCT_IDS,
} from "../../lib/entitlements.js";

export function ScamLikelyGate({ onScrollToNewsletter }) {
  const { session, isLoading: isSessionLoading } = useSupabaseSession();
  const [entitlement, setEntitlement] = useState(null);
  const [isEntitlementLoading, setIsEntitlementLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setEntitlement(null);
      setIsEntitlementLoading(false);
      return;
    }

    if (!supabase) {
      setEntitlement(null);
      setIsEntitlementLoading(false);
      return;
    }

    let isMounted = true;
    setIsEntitlementLoading(true);

    supabase
      .from("entitlements")
      .select("status, expires_at, product")
      .eq("user_id", session.user.id)
      .in("product", ALL_SCAM_LIKELY_PRODUCT_IDS)
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error("Failed to load entitlement", error);
          setEntitlement(null);
        } else {
          setEntitlement(data && data.length > 0 ? data[0] : null);
        }
        setIsEntitlementLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const entitlementStatus = useMemo(
    () => getEntitlementStatus(entitlement),
    [entitlement],
  );

  if (isSessionLoading || isEntitlementLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-brand-muted/30 bg-brand-bg/70 p-10 text-sm text-brand-muted">
        <span className="h-2 w-2 animate-ping rounded-full bg-brand-link" />
        <span className="ml-3">Checking workspace access…</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-brand-muted/30 bg-brand-bg/70 p-8 text-center">
        <h3 className="text-2xl font-heading uppercase tracking-wide text-brand-text">
          Create a free account
        </h3>
      </div>
    );
  }

  const allowFreeAccess = entitlementStatus === "none";

  if (!allowFreeAccess && entitlementStatus !== "active") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-brand-muted/40 bg-brand-bg/80 p-8">
          <h3 className="text-2xl font-heading uppercase text-brand-text">
            Membership unlocks Scam Watch newsletter access
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-brand-muted">
            Free members can still run daily scans. Upgrade when you’re ready to
            unlock weekly Scam Watch Newsletter issues, the full archive, and advanced
            risk tooling.
          </p>

          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-brand-muted">
            <li>Weekly Scam Watch digest highlighting the highest-risk moves.</li>
            <li>Evidence archive with timeline filters and shareable briefs.</li>
            <li>Automation and export features as they roll out.</li>
          </ul>
        </div>

        <AuthPanel session={session} />
      </div>
    );
  }

  return <RiskyChristieApp session={session} />;
}
