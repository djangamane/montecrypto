import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { useSupabaseSession } from '../../hooks/useSupabaseSession.js';
import { AuthPanel } from '../auth/AuthPanel.jsx';
import { PayPalSubscriptionButton } from '../payments/PayPalSubscriptionButton.jsx';
import { NewsletterHub, DEFAULT_BRIEFINGS } from './NewsletterHub.jsx';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import {
  getEntitlementStatus,
  SCAM_LIKELY_PRODUCT_ID,
} from '../../lib/entitlements.js';
import { isNewsletterAdmin } from '../../../config/newsletterAdminAllowlist.js';

export function NewsletterGate({ initialBriefings = DEFAULT_BRIEFINGS }) {
  const { session, isLoading: isSessionLoading } = useSupabaseSession();
  const [entitlement, setEntitlement] = useState(null);
  const [isEntitlementLoading, setIsEntitlementLoading] = useState(true);
  const [briefings, setBriefings] = useState(initialBriefings);
  const [isBriefingsLoading, setIsBriefingsLoading] = useState(false);
  const [briefingsError, setBriefingsError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
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
          console.error('Failed to load newsletter entitlement', error);
          setEntitlement(null);
        } else {
          setEntitlement(data);
        }
        setIsEntitlementLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const entitlementStatus = useMemo(
    () => getEntitlementStatus(entitlement),
    [entitlement]
  );

  const isAdmin = useMemo(() => {
    const email = session?.user?.email;
    return isNewsletterAdmin(email);
  }, [session?.user?.email]);

  const fetchBriefings = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsBriefingsLoading(true);
    setBriefingsError(null);

    const { data, error } = await supabase
      .from('newsletters')
      .select('id, headline, summary, insights, sources, published_at')
      .order('published_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Failed to load newsletters', error);
      if (isMountedRef.current) {
        const message = derivesNewsletterErrorMessage(error);
        setBriefingsError(message);
        setIsBriefingsLoading(false);
      }
      return;
    }

    if (!Array.isArray(data)) {
      if (isMountedRef.current) {
        setBriefings([]);
        setIsBriefingsLoading(false);
      }
      return;
    }

    const sanitized = data.map((item) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      publishedAt: item.published_at,
      insights: Array.isArray(item.insights) ? item.insights : [],
      sources: Array.isArray(item.sources) ? item.sources : [],
    }));

    if (isMountedRef.current) {
      setBriefings(sanitized);
      setIsBriefingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (entitlementStatus !== 'active' || !session?.user?.id) {
      return;
    }

    fetchBriefings();
  }, [entitlementStatus, fetchBriefings, session?.user?.id]);

  const handleBriefingCreated = () => {
    if (entitlementStatus !== 'active') return;
    fetchBriefings();
  };

  if (isSessionLoading || isEntitlementLoading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-10 text-slate-200 shadow-xl">
        <div className="flex items-center justify-center gap-3 text-sm text-slate-300">
          <LoadingSpinner className="h-5 w-5" />
          Checking newsletter access…
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-10 text-slate-200 shadow-xl">
        <div className="space-y-4 text-sm">
          <h3 className="text-3xl font-semibold text-white">Unlock Scam Watch</h3>
          <p className="text-slate-300">
            Sign in above to access the weekly Scam Watch newsletter alongside the Scam Likely risk
            scanner. New here? Use the “Unlock Scam Likely” panel to create your account once — the
            same credentials unlock both experiences.
          </p>
          <a
            href="#scam-likely"
            className="inline-flex w-fit items-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
          >
            Go to Sign In
          </a>
        </div>
      </section>
    );
  }

  if (entitlementStatus !== 'active') {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-10 text-slate-200 shadow-xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <h3 className="text-3xl font-semibold text-white">
              Newsletter Access Requires an Active Subscription
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Scam Watch briefings are bundled with the Scam Likely subscription. Activate your plan to
              read archived issues and receive new alerts every Friday.
            </p>
            <div className="mt-6 max-w-xs">
              <PayPalSubscriptionButton session={session} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
            <h4 className="text-lg font-semibold text-white">Included With Your Membership</h4>
            <ul className="mt-4 list-none space-y-3 text-slate-300">
              <li>- Gemini-assisted scam detection via the Scam Likely dashboard.</li>
              <li>- Weekly Scam Watch newsletter delivered to your inbox.</li>
              <li>- Archive access to investigate prior threat briefings.</li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (isBriefingsLoading && briefings.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-10 text-slate-200 shadow-xl">
        <div className="flex items-center justify-center gap-3 text-sm text-slate-300">
          <LoadingSpinner className="h-5 w-5" />
          Loading newsletter archive…
        </div>
      </section>
    );
  }

  return (
    <>
      {briefingsError ? (
        <section className="mb-6 rounded-3xl border border-red-500/40 bg-red-900/30 p-6 text-red-100">
          <p className="text-sm">{briefingsError}</p>
        </section>
      ) : null}
      <NewsletterHub
        isAdmin={isAdmin}
        initialBriefings={briefings.length ? briefings : DEFAULT_BRIEFINGS}
        onBriefingCreated={handleBriefingCreated}
        session={session}
        isMockData={briefings.length === 0}
      />
    </>
  );
}

function derivesNewsletterErrorMessage(error) {
  if (!error) return 'Failed to load newsletter archive.';

  const rawMessage = typeof error.message === 'string' ? error.message : '';
  const lowered = rawMessage.toLowerCase();

  if (error.code === 'PGRST114' || lowered.includes('does not exist')) {
    return 'Newsletter table not found. Run the newsletters migration from supabase_setup.sql to create public.newsletters.';
  }

  return 'Failed to load newsletter archive.';
}
