'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useEffect, useMemo, useState } from 'react';

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const monthlyPlanId = import.meta.env.VITE_PAYPAL_MONTHLY_PLAN_ID;
const annualPlanId = import.meta.env.VITE_PAYPAL_ANNUAL_PLAN_ID;

const PLAN_COPY = {
  monthly: {
    label: '$10 per month',
    description: 'Cancel anytime. Full access to Scam Likely + Scam Watch newsletter.',
  },
  annual: {
    label: '$100 per year',
    description: 'Get two months free with annual billing and priority support.',
  },
};

export function PayPalSubscriptionButton({ session }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCadence, setSelectedCadence] = useState('monthly');

  const planOptions = useMemo(() => {
    const options = [];
    if (monthlyPlanId) {
      options.push({ id: 'monthly', planId: monthlyPlanId, ...PLAN_COPY.monthly });
    }
    if (annualPlanId) {
      options.push({ id: 'annual', planId: annualPlanId, ...PLAN_COPY.annual });
    }
    return options;
  }, [monthlyPlanId, annualPlanId]);

  useEffect(() => {
    if (!planOptions.length) return;
    const hasSelected = planOptions.some((option) => option.id === selectedCadence);
    if (!hasSelected) {
      setSelectedCadence(planOptions[0].id);
    }
  }, [planOptions, selectedCadence]);

  const activePlan = planOptions.find((option) => option.id === selectedCadence) ?? planOptions[0];

  if (!clientId || planOptions.length === 0 || !activePlan?.planId) {
    return (
      <p className="rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 text-sm text-orange-200">
        PayPal subscription details are not configured. Set VITE_PAYPAL_CLIENT_ID along with
        VITE_PAYPAL_MONTHLY_PLAN_ID and/or VITE_PAYPAL_ANNUAL_PLAN_ID.
      </p>
    );
  }

  const handleApprove = async (subscriptionId) => {
    const headers = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    await fetch('/api/paypal/subscription', {
      method: 'POST',
      headers,
      body: JSON.stringify({ subscriptionId }),
    });
  };

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
                className={`w-full rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${
                  isActive
                    ? 'border-cyan-400/60 bg-cyan-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/40'
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="text-xs text-slate-300/80">{option.description}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <p className="font-semibold">{activePlan.label}</p>
          <p className="text-xs text-slate-300/80">{activePlan.description}</p>
        </div>
      )}

      <PayPalScriptProvider options={{ clientId, intent: 'subscription', vault: true }}>
        <PayPalButtons
          style={{ shape: 'pill', color: 'gold', layout: 'vertical', label: 'paypal' }}
          createSubscription={(data, actions) =>
            actions.subscription.create({ plan_id: activePlan.planId })
          }
          onApprove={async (data) => {
            if (!data.subscriptionID) return;
            setIsSubmitting(true);
            await handleApprove(data.subscriptionID);
            setIsSubmitting(false);
            window.location.reload();
          }}
          disabled={isSubmitting}
        />
      </PayPalScriptProvider>
    </div>
  );
}
