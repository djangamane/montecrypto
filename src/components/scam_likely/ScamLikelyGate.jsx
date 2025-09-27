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

export function ScamLikelyGate() {
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
      <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-slate-200">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-3 w-3 animate-ping rounded-full bg-sky-400" />
          Checking access…
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <AuthPanel session={session} />
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-slate-200">
          <h3 className="text-lg font-semibold text-white">Unlock Scam Likely</h3>
          <p className="mt-2 text-sm text-slate-400">
            Create an account and subscribe to access the institutional risk scanner.
          </p>
        </div>
      </div>
    );
  }

  if (entitlementStatus !== 'active') {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-slate-200">
          <h3 className="text-2xl font-semibold text-white">Activate Scam Watch Membership</h3>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Unlock Gemini-powered scam detection, archived investigations, and the weekly Scam Watch newsletter
            that keeps you ahead of emerging threats.
          </p>

          <div className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5 text-sm text-sky-100">
            <p className="font-semibold text-sky-200">Membership options</p>
            <p className="mt-2">- $10/month — cancel anytime.</p>
            <p>- $100/year — save two months with annual billing.</p>
          </div>

          <ul className="mt-6 list-none space-y-2 text-sm text-slate-300">
            <li>- Unlimited Scam Likely scans with institutional intelligence overlays.</li>
            <li>- Scam Watch newsletter delivered every Friday with curated sources.</li>
            <li>- Access to historical risk briefings and upcoming automation features.</li>
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
