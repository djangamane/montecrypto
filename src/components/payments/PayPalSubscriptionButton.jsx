"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useCallback, useEffect, useMemo, useState } from "react";

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const monthlyPlanId = import.meta.env.VITE_PAYPAL_MONTHLY_PLAN_ID;
const annualPlanId = import.meta.env.VITE_PAYPAL_ANNUAL_PLAN_ID;
const lifetimePlanId = import.meta.env.VITE_PAYPAL_LIFETIME_PLAN_ID;

const PLAN_COPY = {
  monthly: {
    label: "$10 per month",
    description: "150 scans/month, plus weekly newsletter.",
  },
  annual: {
    label: "$100 per year",
    description:
      "300 scans/month, plus weekly newsletter and email export (coming soon).",
  },
  lifetime: {
    label: "$275 one-time",
    description:
      "400 scans/month, newsletter, and export (coming soon). Limited to 50 slots.",
  },
};

export function PayPalSubscriptionButton({ session }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCadence, setSelectedCadence] = useState("monthly");
  const [errorMessage, setErrorMessage] = useState(null);

  const planOptions = useMemo(() => {
    const options = [];
    if (monthlyPlanId) {
      options.push({
        id: "monthly",
        planId: monthlyPlanId,
        ...PLAN_COPY.monthly,
      });
    }
    if (annualPlanId) {
      options.push({ id: "annual", planId: annualPlanId, ...PLAN_COPY.annual });
    }
    if (lifetimePlanId) {
      options.push({
        id: "lifetime",
        planId: lifetimePlanId,
        ...PLAN_COPY.lifetime,
      });
    }
    return options;
  }, []);

  useEffect(() => {
    if (!planOptions.length) return;
    const hasSelected = planOptions.some(
      (option) => option.id === selectedCadence,
    );
    if (!hasSelected) {
      setSelectedCadence(planOptions[0].id);
    }
  }, [planOptions, selectedCadence]);

  const activePlan =
    planOptions.find((option) => option.id === selectedCadence) ??
    planOptions[0];

  const isAuthenticated = Boolean(session?.access_token);

  const handleApprove = useCallback(
    async (subscriptionId) => {
      if (!subscriptionId) return false;

      if (!isAuthenticated) {
        setErrorMessage(
          "Please sign in or create a free account before completing your upgrade.",
        );
        return false;
      }

      const headers = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      try {
        const response = await fetch("/api/paypal/subscription", {
          method: "POST",
          headers,
          body: JSON.stringify({ subscriptionId }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(
            typeof payload.error === "string"
              ? payload.error
              : "We could not activate your membership. Contact support if this continues.",
          );
        }

        return true;
      } catch (error) {
        console.error("Failed to activate PayPal subscription", error);
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : "We could not activate your membership. Contact support if this continues.",
        );
        return false;
      }
    },
    [isAuthenticated, session?.access_token],
  );

  if (!clientId || planOptions.length === 0 || !activePlan?.planId) {
    return (
      <p className="rounded-xl border border-risk-high/40 bg-risk-high/10 p-4 text-sm text-risk-high">
        PayPal subscription details are not configured. Set
        VITE_PAYPAL_CLIENT_ID along with VITE_PAYPAL_MONTHLY_PLAN_ID and/or
        VITE_PAYPAL_ANNUAL_PLAN_ID.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {planOptions.length > 1 ? (
        <div className="grid gap-3">
          {planOptions.map((option) => {
            const isActive = option.id === activePlan.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedCadence(option.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-brand-link/40 ${
                  isActive
                    ? "border-brand-link bg-brand-bg text-brand-text shadow"
                    : "border-brand-muted/30 bg-white/70 text-brand-muted hover:border-brand-link/50 hover:text-brand-text"
                }`}
              >
                <p className="text-sm font-semibold text-brand-text">
                  {option.label}
                </p>
                <p className="text-xs text-brand-muted">{option.description}</p>
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
            Create a free account or sign in using the panel above before you upgrade.
            Your membership is linked to your Supabase login so we can unlock the
            Scam Likely workspace and weekly newsletter immediately.
          </p>
        </div>
      ) : null}

      <PayPalScriptProvider
        options={{ clientId, intent: "subscription", vault: true }}
      >
        <PayPalButtons
          style={{
            shape: "pill",
            color: "gold",
            layout: "vertical",
            label: "paypal",
          }}
          createSubscription={(data, actions) =>
            actions.subscription.create({ plan_id: activePlan.planId })
          }
          onApprove={async (data) => {
            if (!data.subscriptionID || !isAuthenticated) {
              setErrorMessage(
                "Sign in before completing checkout so we can activate your membership.",
              );
              return;
            }
            setErrorMessage(null);
            setIsSubmitting(true);
            const activated = await handleApprove(data.subscriptionID);
            setIsSubmitting(false);
            if (activated) {
              window.location.assign("/thankyou");
            }
          }}
          onError={(error) => {
            console.error("PayPal button error", error);
            setErrorMessage(
              "PayPal could not complete the checkout. Please refresh and try again.",
            );
          }}
          disabled={!isAuthenticated || isSubmitting}
        />
      </PayPalScriptProvider>

      {errorMessage ? (
        <p className="rounded-xl border border-risk-high/40 bg-risk-high/10 p-4 text-sm text-risk-high">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4 rounded-xl border border-brand-muted/30 bg-white/70 p-4 text-center">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfOiL3BwknR3yfhCYHsHfkFzGD6dkT12vPCV_etOGdccHnE3Q/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-brand-link underline decoration-dotted"
        >
          Contact us for enterprise solutions
        </a>
      </div>
    </div>
  );
}
