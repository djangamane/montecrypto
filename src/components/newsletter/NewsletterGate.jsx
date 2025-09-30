import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { useSupabaseSession } from "../../hooks/useSupabaseSession.js";
import { AuthPanel } from "../auth/AuthPanel.jsx";
import { NewsletterHub, DEFAULT_BRIEFINGS } from "./NewsletterHub.jsx";
import { normalizeBriefing } from "./briefingNormalizer.js";
import { LoadingSpinner } from "./LoadingSpinner.jsx";
import {
  getEntitlementStatus,
  SCAM_LIKELY_PRODUCT_ID,
} from "../../lib/entitlements.js";
import { isNewsletterAdmin } from "../../../config/newsletterAdminAllowlist.js";

export function NewsletterGate({ initialBriefings = DEFAULT_BRIEFINGS }) {
  const { session, isLoading: isSessionLoading } = useSupabaseSession();
  const [entitlement, setEntitlement] = useState(null);
  const [isEntitlementLoading, setIsEntitlementLoading] = useState(true);
  const [briefings, setBriefings] = useState(() => {
    if (!Array.isArray(initialBriefings)) return initialBriefings;
    return initialBriefings
      .map((item) => normalizeBriefing(item) || null)
      .filter(Boolean);
  });
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
      .from("entitlements")
      .select("status, expires_at")
      .eq("user_id", session.user.id)
      .eq("product", SCAM_LIKELY_PRODUCT_ID)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error("Failed to load newsletter entitlement", error);
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
    [entitlement],
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
      .from("newsletters")
      .select(
        "id, headline, summary, insights, sources, metadata, published_at",
      )
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Failed to load newsletters", error);
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

    const sanitized = data
      .map((item) =>
        normalizeBriefing({ ...item, publishedAt: item.published_at }),
      )
      .filter(Boolean);

    if (isMountedRef.current) {
      setBriefings(sanitized);
      setIsBriefingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (entitlementStatus !== "active" || !session?.user?.id) {
      return;
    }

    fetchBriefings();
  }, [entitlementStatus, fetchBriefings, session?.user?.id]);

  const handleBriefingCreated = () => {
    if (entitlementStatus !== "active") return;
    fetchBriefings();
  };

  if (isSessionLoading || isEntitlementLoading) {
    return (
      <section className="rounded-3xl border border-brand-muted/30 bg-brand-bg/70 p-10 text-sm text-brand-muted">
        <div className="flex items-center justify-center gap-3">
          <LoadingSpinner className="h-5 w-5 text-brand-link" />
          Checking Scam Watch Newsletter access…
        </div>
      </section>
    );
  }

  if (!session) {
    return null;
  }

  if (entitlementStatus !== "active") {
    return (
      <section className="rounded-3xl border border-brand-muted/30 bg-brand-bg/70 p-8 text-sm text-brand-muted">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <h3 className="text-3xl font-heading uppercase text-brand-text">
              Upgrade to unlock Scam Watch newsletter access
            </h3>
            <p className="mt-3 leading-relaxed">
              Free members can still run daily scans. When you upgrade, the
              Friday Scam Watch Newsletter edition, historical archive, and pro automations
              become available immediately.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-muted/30 bg-white/80 p-6">
            <h4 className="text-lg font-semibold text-brand-text">
              Included with membership
            </h4>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
              <li>Weekly Scam Watch dispatch with the five highest-risk moves.</li>
              <li>Evidence archive with share-ready summaries and filters.</li>
              <li>Automation, exports, and timeline tooling as they roll out.</li>
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
  if (!error) return "Failed to load newsletter archive.";

  const rawMessage = typeof error.message === "string" ? error.message : "";
  const lowered = rawMessage.toLowerCase();

  if (error.code === "PGRST114" || lowered.includes("does not exist")) {
    return "Newsletter table not found. Run the newsletters migration from supabase_setup.sql to create public.newsletters.";
  }

  return "Failed to load newsletter archive.";
}
