import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { useSupabaseSession } from '../../hooks/useSupabaseSession.js';
import { AuthPanel } from '../auth/AuthPanel.jsx';
import { PayPalSubscriptionButton } from '../payments/PayPalSubscriptionButton.jsx';
import { RiskyChristieApp } from '../risky_christie/RiskyChristieApp.jsx';
import {
  getEntitlementStatus,
  SCAM_LIKELY_PRODUCT_ID,
} from '../../lib/entitlements.js';

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

    let isMounted = true;
    setIsEntitlementLoading(true);

    supabase
      .from('entitlements')
      .select('status, expires_at')
      .eq('user_id', session.user.id)
      .eq('product', SCAM_LIKELY_PRODUCT_ID)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error('Failed to load entitlement', error);
          setEntitlement(null);
        } else {
          setEntitlement(data);
        }
        setIsEntitlementLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const entitlementStatus = useMemo(
    () => getEntitlementStatus(entitlement),
    [entitlement]
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
      <div className="grid gap-6 lg:grid-cols-[1fr,0.85fr]">
        <AuthPanel session={session} />
        <div className="rounded-2xl border border-brand-muted/30 bg-brand-bg/70 p-6 text-sm text-brand-muted">
          <h3 className="text-lg font-semibold text-brand-text">Sign in to launch the analyzer</h3>
          <p className="mt-3 leading-relaxed">
            Creating or signing into your MonteCrypto account unlocks the AI Crypto Risk Assessment workspace and the
            Weekly Risk Brief archive when you have an active membership.
          </p>
          <button
            type="button"
            onClick={onScrollToNewsletter}
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-brand-link px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-link transition hover:bg-brand-link hover:text-brand-bg"
          >
            View membership details
          </button>
        </div>
      </div>
    );
  }

  if (entitlementStatus !== 'active') {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-brand-muted/40 bg-brand-bg/80 p-8">
          <h3 className="text-2xl font-heading uppercase text-brand-text">Activate your risk intelligence membership</h3>
          <p className="mt-4 text-sm leading-relaxed text-brand-muted">
            Membership unlocks the full analyzer, historical evidence, and the Weekly Risk Brief. Choose a monthly or
            annual cadence. Cancel anytime.
          </p>

          <div className="mt-6 rounded-2xl border border-brand-link/40 bg-brand-link/10 p-5 text-sm text-brand-link">
            <p className="font-semibold uppercase tracking-[0.3em] text-brand-text">Membership options</p>
            <p className="mt-3 text-brand-text/80">$10/month — flexible billing.</p>
            <p className="text-brand-text/80">$100/year — save two months.</p>
          </div>

          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-brand-muted">
            <li>Unlimited AI risk assessments with source-backed explanations.</li>
            <li>Weekly Risk Brief with the top five moves, delivered every Friday.</li>
            <li>Archive access, timeline filters, and upcoming automation releases.</li>
          </ul>

          <div className="mt-8 max-w-xs">
            <PayPalSubscriptionButton session={session} />
          </div>
        </div>

        <AuthPanel session={session} />
      </div>
    );
  }

  return <RiskyChristieApp session={session} />;
}
