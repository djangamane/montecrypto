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
      <section className="rounded-3xl border border-brand-muted/30 bg-brand-bg/70 p-10 text-sm text-brand-muted">
        <div className="flex items-center justify-center gap-3">
          <LoadingSpinner className="h-5 w-5 text-brand-link" />
          Checking Weekly Risk Brief access…
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="rounded-3xl border border-brand-muted/30 bg-brand-bg/70 p-8 text-sm text-brand-muted">
        <div className="space-y-4">
          <h3 className="text-2xl font-heading uppercase text-brand-text">Sign in to view the Weekly Risk Brief</h3>
          <p className="leading-relaxed">
            The Weekly Risk Brief bundles with the AI Crypto Risk Assessment workspace. Sign in above and subscribe to
            unlock archived issues, Friday alerts, and the analyzer evidence trail.
          </p>
        </div>
        <div className="mt-6">
          <div className="flex h-28 w-full items-center justify-center rounded-2xl border border-dashed border-brand-muted/40 bg-white/70 text-sm text-brand-muted">
            AdSense placement
          </div>
        </div>
      </section>
    );
  }

  if (entitlementStatus !== 'active') {
    return (
      <section className="rounded-3xl border border-brand-muted/30 bg-brand-bg/70 p-8 text-sm text-brand-muted">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <h3 className="text-3xl font-heading uppercase text-brand-text">Membership required for full brief access</h3>
            <p className="mt-3 leading-relaxed">
              Activate your membership to unlock archived issues, subscriber-only signals, and the Friday dispatch.
            </p>
            <div className="mt-6 max-w-xs">
              <PayPalSubscriptionButton session={session} />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-muted/30 bg-white/80 p-6">
            <h4 className="text-lg font-semibold text-brand-text">Included with membership</h4>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
              <li>AI Crypto Risk Assessment workspace with unlimited scans.</li>
              <li>Weekly Risk Brief with on-chain, off-chain, social, and institutional highlights.</li>
              <li>Evidence archive to revisit previous issues and share with your team.</li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (isBriefingsLoading && briefings.length === 0) {
    return (
      <section className="rounded-3xl border border-brand-muted/30 bg-brand-bg/70 p-10 text-sm text-brand-muted">
        <div className="flex items-center justify-center gap-3">
          <LoadingSpinner className="h-5 w-5 text-brand-link" />
          Loading newsletter archive…
        </div>
      </section>
    );
  }

  return (
    <>
      {briefingsError ? (
        <section className="mb-6 rounded-3xl border border-risk-high/40 bg-risk-high/10 p-6 text-risk-high">
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
