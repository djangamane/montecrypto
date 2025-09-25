'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useState } from 'react';

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const planId = import.meta.env.VITE_PAYPAL_PLAN_ID;

export function PayPalSubscriptionButton({ session }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!clientId || !planId) {
    return (
      <p className="rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 text-sm text-orange-200">
        PayPal subscription details are not configured. Set VITE_PAYPAL_CLIENT_ID and VITE_PAYPAL_PLAN_ID.
      </p>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId, intent: 'subscription', vault: true }}>
      <PayPalButtons
        style={{ shape: 'pill', color: 'gold', layout: 'vertical', label: 'paypal' }}
        createSubscription={(data, actions) => actions.subscription.create({ plan_id: planId })}
        onApprove={async (data) => {
          if (!data.subscriptionID) return;
          setIsSubmitting(true);

          const headers = { 'Content-Type': 'application/json' };
          if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }

          await fetch('/api/paypal/subscription', {
            method: 'POST',
            headers,
            body: JSON.stringify({ subscriptionId: data.subscriptionID }),
          });

          setIsSubmitting(false);
          window.location.reload();
        }}
        disabled={isSubmitting}
      />
    </PayPalScriptProvider>
  );
}
