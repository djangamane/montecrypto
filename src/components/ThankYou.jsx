import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useSupabaseSession } from "../hooks/useSupabaseSession.js";
import {
  ALL_SCAM_LIKELY_PRODUCT_IDS,
  getEntitlementStatus,
} from "../lib/entitlements.js";

const MEMBERSHIP_COPY = {
  checking: {
    title: "Confirming your membership…",
    body: "We’re syncing with PayPal and Supabase to unlock your access. Hang tight for a moment.",
  },
  active: {
    title: "Membership activated",
    body: "The AI-Crypto Risk Tool and the Scam Watch Newsletter are ready. Jump back into the workspace or browse the archive.",
  },
  pending: {
    title: "Payment is still processing",
    body: "PayPal is finishing the hand-off. Refresh this page in a few seconds — the upgrade usually finalizes quickly.",
  },
  missing: {
    title: "We didn’t detect your membership",
    body: "If the page still shows this after a refresh, forward your PayPal receipt to support@aicryptorisk.com so we can help right away.",
  },
  "no-session": {
    title: "Sign in to finish",
    body: "Your membership is tied to your account. Sign in with the same email you used at checkout so we can unlock your access.",
  },
};

export function ThankYou() {
  const { session, isLoading: isSessionLoading } = useSupabaseSession();
  const [status, setStatus] = useState("checking");
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    if (isSessionLoading) return;

    if (!session?.user?.id) {
      setStatus("no-session");
      return;
    }

    let isMounted = true;
    setStatus("checking");

    supabase
      .from("entitlements")
      .select("status, expires_at, product")
      .eq("user_id", session.user.id)
      .in("product", ALL_SCAM_LIKELY_PRODUCT_IDS)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error("Failed to confirm membership", error);
          setStatus("missing");
          setExpiresAt(null);
          return;
        }

        if (!data) {
          setStatus("missing");
          setExpiresAt(null);
          return;
        }

        const entitlementStatus = getEntitlementStatus(data);
        const normalizedStatus =
          entitlementStatus === "inactive" ? "missing" : entitlementStatus;
        setStatus(normalizedStatus);
        setExpiresAt(data.expires_at || null);
      });

    return () => {
      isMounted = false;
    };
  }, [isSessionLoading, session?.user?.id]);

  const copy = MEMBERSHIP_COPY[status] ?? MEMBERSHIP_COPY.checking;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl rounded-3xl border border-brand-muted/30 bg-white/90 p-10 text-center shadow-xl">
        <h1 className="text-3xl font-heading uppercase text-brand-text">Thank you for joining</h1>
        <p className="mt-4 text-sm text-brand-muted">
          A receipt is on its way from PayPal. We use it to activate the AI-Crypto Risk Tool workspace and
          weekly Scam Watch Newsletter on your account automatically.
        </p>

        <div className="mt-8 rounded-2xl border border-brand-muted/40 bg-brand-bg/30 p-6 text-left">
          <h2 className="text-lg font-semibold text-brand-text">{copy.title}</h2>
          <p className="mt-2 text-sm text-brand-muted">{copy.body}</p>
          {status === "active" && expiresAt ? (
            <p className="mt-4 text-xs text-brand-muted/90">
              Next billing date: {new Date(expiresAt).toLocaleString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          ) : null}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/#risk-meter"
            className="inline-flex items-center justify-center rounded-xl border border-brand-link px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-brand-link transition hover:bg-brand-link hover:text-brand-bg"
          >
            Open AI-Crypto Risk Tool
          </a>
          <a
            href="/#newsletter"
            className="inline-flex items-center justify-center rounded-xl border border-brand-muted/40 px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-brand-text transition hover:border-brand-link"
          >
            View Scam Watch Archive
          </a>
        </div>

        <p className="mt-8 text-xs text-brand-muted">
          Need help? Email <a href="mailto:jason@aicryptorisk.com" className="underline decoration-dotted">jason@aicryptorisk.com</a>
          {" "}with your PayPal receipt and we’ll get you squared away.
        </p>
      </div>
    </div>
  );
}
