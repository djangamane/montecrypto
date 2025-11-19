"use client";

import { useEffect, useMemo, useState } from "react";

const PLAN_CONFIG = [
  {
    id: "monthly",
    label: "$5 per month",
    description: "Monthly membership billed at $5. Cancel anytime.",
    link: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_LINK,
  },
  {
    id: "annual",
    label: "$50 per year",
    description: "Annual membership billed at $50 with two months free.",
    link: process.env.NEXT_PUBLIC_STRIPE_YEARLY_LINK,
  },
  {
    id: "lifetime",
    label: "$200 lifetime",
    description: "One-time payment for lifetime access to the workspace.",
    link: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_LINK,
  },
];

export function StripePaymentLinks({ session }) {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const availablePlans = useMemo(
    () =>
      PLAN_CONFIG.filter((plan) => typeof plan.link === "string" && plan.link),
    [],
  );

  useEffect(() => {
    if (!availablePlans.length) return;
    if (!availablePlans.some((plan) => plan.id === selectedPlan)) {
      setSelectedPlan(availablePlans[0].id);
    }
  }, [availablePlans, selectedPlan]);

  if (!availablePlans.length) {
    return (
      <p className="rounded-xl border border-risk-high/40 bg-risk-high/10 p-4 text-sm text-risk-high">
        Stripe payment links are not configured. Set NEXT_PUBLIC_STRIPE_MONTHLY_LINK,
        NEXT_PUBLIC_STRIPE_YEARLY_LINK, and NEXT_PUBLIC_STRIPE_LIFETIME_LINK to
        enable checkout.
      </p>
    );
  }

  const activePlan =
    availablePlans.find((plan) => plan.id === selectedPlan) ??
    availablePlans[0];

  const isAuthenticated = Boolean(session?.user?.id);

  function handleCheckout() {
    if (!isAuthenticated) {
      setErrorMessage(
        "Sign in or create a free account before continuing to checkout.",
      );
      return;
    }

    if (!activePlan?.link) {
      setErrorMessage("Stripe payment link is not available.");
      return;
    }

    setErrorMessage(null);
    setIsRedirecting(true);

    const url = buildCheckoutUrl(activePlan.link, session, activePlan.id);

    window.location.assign(url);
  }

  return (
    <div className="space-y-4">
      {availablePlans.length > 1 ? (
        <div className="grid gap-3">
          {availablePlans.map((plan) => {
            const isActive = plan.id === activePlan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-brand-link/40 ${
                  isActive
                    ? "border-brand-link bg-brand-bg text-brand-text shadow"
                    : "border-brand-muted/30 bg-white/70 text-brand-muted hover:border-brand-link/50 hover:text-brand-text"
                }`}
              >
                <p className="text-sm font-semibold text-brand-text">
                  {plan.label}
                </p>
                <p className="text-xs text-brand-muted">{plan.description}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-brand-muted/30 bg-white/70 p-4 text-sm text-brand-muted">
          <p className="font-semibold text-brand-text">{activePlan.label}</p>
          <p className="text-xs">{activePlan.description}</p>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="rounded-xl border border-brand-muted/30 bg-white/70 p-4 text-sm text-brand-muted">
          <p className="font-semibold text-brand-text">Sign in to continue</p>
          <p className="mt-2 text-xs">
            We connect your Supabase account to your Stripe checkout so your
            membership unlocks immediately after payment.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={!isAuthenticated || isRedirecting}
        className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow transition ${
          !isAuthenticated
            ? "cursor-not-allowed bg-brand-muted/40 text-brand-bg"
            : "bg-brand-accent hover:opacity-90"
        }`}
      >
        {isRedirecting ? "Redirecting to Stripe…" : "Continue to secure checkout"}
      </button>

      {errorMessage ? (
        <p className="text-sm text-risk-high">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function buildCheckoutUrl(baseLink, session, planId) {
  try {
    const url = new URL(baseLink);
    if (session?.user?.email) {
      url.searchParams.set("prefilled_email", session.user.email);
    }
    if (session?.user?.id) {
      url.searchParams.set("client_reference_id", session.user.id);
    }
    url.searchParams.set("prefilled_user_plan", planId);
    return url.toString();
  } catch (error) {
    console.error("Invalid Stripe payment link", baseLink, error);
    return baseLink;
  }
}
