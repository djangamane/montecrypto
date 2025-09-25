import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { useSupabaseSession } from '../../hooks/useSupabaseSession.js';
import { AuthPanel } from '../auth/AuthPanel.jsx';
import { PayPalSubscriptionButton } from '../payments/PayPalSubscriptionButton.jsx';
import { ScamLikelyApp } from './ScamLikelyApp.jsx';
import { RiskyChristieApp } from '../risky_christie/RiskyChristieApp.jsx';

const ACTIVE_STATUSES = new Set(['active', 'past_due']);

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
      .eq('product', 'scam_likely')
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

  const entitlementStatus = useMemo(() => {
    if (!entitlement) return 'none';
    if (ACTIVE_STATUSES.has(entitlement.status)) return 'active';
    if (entitlement.status === 'pending') return 'pending';
    return 'inactive';
  }, [entitlement]);

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
          <h3 className="text-2xl font-semibold text-white">Subscribe for full access</h3>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            The Scam Likely detector combines on-chain, off-chain, social, and institutional
            intelligence streams. Subscribe to run unlimited analyses and download archived
            reports.
          </p>

          <div className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5">
            <p className="text-sm text-sky-200">
              $5/month · Cancel anytime · Includes institutional interest module, historical
              scan storage, and upcoming alert automations.
            </p>
          </div>

          <div className="mt-8 max-w-xs">
            <PayPalSubscriptionButton session={session} />
          </div>
        </div>

        <AuthPanel session={session} />
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <ScamLikelyApp session={session} />
      <RiskyChristieApp session={session} />
    </div>
  );
}
