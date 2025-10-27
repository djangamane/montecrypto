import { supabase } from "../_lib/supabase.js";
import { stripeGet, verifyStripeWebhook } from "../_lib/stripe.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = await readRequestBody(req);
  const signature = req.headers["stripe-signature"];

  if (!verifyStripeWebhook(rawBody, signature)) {
    return res.status(400).json({ error: "Invalid Stripe signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (error) {
    console.error("Failed to parse Stripe webhook payload", error);
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    await handleEvent(event);
  } catch (error) {
    console.error("Stripe webhook error", error);
    return res.status(500).json({ error: "Failed to process webhook" });
  }

  return res.status(200).json({ received: true });
}

async function handleEvent(event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSession(event.data.object);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.resumed":
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
    case "customer.subscription.canceled":
      await handleSubscriptionCanceled(event.data.object);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object);
      break;
    default:
      break;
  }
}

async function handleCheckoutSession(session) {
  const userId = session?.client_reference_id;
  if (!userId) {
    console.warn(
      "Stripe checkout session completed without client_reference_id",
      session?.id,
    );
    return;
  }

  const reference =
    session?.mode === "subscription"
      ? session?.subscription
      : session?.payment_intent;

  if (!reference) {
    console.warn("Stripe checkout session missing reference id", session?.id);
    return;
  }

  let expiresAt = null;
  let planType = null;
  let interval = null;
  let intervalCount = null;
  let priceId = null;
  let productId = null;
  let stripeStatus = "active";
  let stripeCustomerId = session?.customer ?? null;

  if (session?.mode === "subscription" && session?.subscription) {
    const subscription = await stripeGet(
      `/subscriptions/${session.subscription}`,
      { "expand[]": ["items.data.price"] },
    );

    if (subscription?.current_period_end) {
      expiresAt = unixToIso(subscription.current_period_end);
    }

    stripeCustomerId = subscription?.customer ?? stripeCustomerId;
    stripeStatus = subscription?.status ?? stripeStatus;

    const price = subscription?.items?.data?.[0]?.price;
    if (price) {
      priceId = price.id ?? null;
      productId = price.product ?? null;
      planType = determinePlanType(price);
      interval = price.recurring?.interval ?? null;
      intervalCount = price.recurring?.interval_count ?? null;
    }
  } else {
    planType = "lifetime";
  }

  await activateStripeEntitlement({
    userId,
    reference,
    expiresAt,
    metadata: cleanObject({
      plan_type: planType,
      stripe_checkout_session_id: session?.id ?? null,
      stripe_payment_link_id: session?.payment_link ?? null,
      stripe_customer_id: stripeCustomerId,
      stripe_price_id: priceId,
      stripe_product_id: productId,
      stripe_plan_interval: interval,
      stripe_plan_interval_count: intervalCount,
      stripe_amount_total: session?.amount_total ?? null,
      stripe_currency: session?.currency ?? null,
      stripe_status: stripeStatus,
      stripe_mode: session?.mode ?? null,
    }),
  });
}

async function handleSubscriptionUpdated(subscription) {
  const reference = subscription?.id;
  if (!reference) return;

  const price = subscription?.items?.data?.[0]?.price;
  const planType = price ? determinePlanType(price) : null;

  await updateEntitlement(reference, {
    status: mapStripeStatus(subscription?.status),
    expires_at: subscription?.current_period_end
      ? unixToIso(subscription.current_period_end)
      : null,
    metadata: cleanObject({
      stripe_status: subscription?.status ?? null,
      stripe_cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
      stripe_plan_interval: price?.recurring?.interval ?? null,
      stripe_plan_interval_count: price?.recurring?.interval_count ?? null,
      stripe_price_id: price?.id ?? null,
      stripe_product_id: price?.product ?? null,
      plan_type: planType ?? null,
    }),
  });
}

async function handleSubscriptionCanceled(subscription) {
  const reference = subscription?.id;
  if (!reference) return;

  await updateEntitlement(reference, {
    status: "revoked",
    expires_at: subscription?.canceled_at
      ? unixToIso(subscription.canceled_at)
      : subscription?.current_period_end
        ? unixToIso(subscription.current_period_end)
        : null,
    metadata: cleanObject({
      stripe_status: subscription?.status ?? "canceled",
    }),
  });
}

async function handleInvoicePaymentFailed(invoice) {
  const subscriptionId = invoice?.subscription;
  if (!subscriptionId) return;

  await updateEntitlement(subscriptionId, {
    status: "past_due",
    metadata: cleanObject({
      last_invoice_failed_at: invoice?.created
        ? unixToIso(invoice.created)
        : null,
    }),
  });
}

async function handleInvoicePaid(invoice) {
  const subscriptionId = invoice?.subscription;
  if (!subscriptionId) return;

  const subscription = await stripeGet(`/subscriptions/${subscriptionId}`, {
    "expand[]": ["items.data.price"],
  });

  const price = subscription?.items?.data?.[0]?.price;
  const planType = price ? determinePlanType(price) : null;

  await updateEntitlement(subscriptionId, {
    status: "active",
    expires_at: subscription?.current_period_end
      ? unixToIso(subscription.current_period_end)
      : null,
    metadata: cleanObject({
      stripe_status: subscription?.status ?? "active",
      plan_type: planType,
      stripe_plan_interval: price?.recurring?.interval ?? null,
      stripe_plan_interval_count: price?.recurring?.interval_count ?? null,
      stripe_price_id: price?.id ?? null,
    }),
  });
}

async function activateStripeEntitlement({
  userId,
  reference,
  expiresAt,
  metadata,
}) {
  const { error: rpcError } = await supabase.rpc("activate_entitlement", {
    p_user: userId,
    p_product: "scam_likely",
    p_provider: "stripe",
    p_reference: reference,
    p_expires: expiresAt,
  });

  if (rpcError) {
    throw new Error(`activate_entitlement failed: ${rpcError.message}`);
  }

  await updateEntitlement(reference, { metadata });
}

async function updateEntitlement(reference, updates) {
  const { data: entitlement, error } = await supabase
    .from("entitlements")
    .select("id, metadata")
    .eq("payment_provider", "stripe")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase fetch entitlement error: ${error.message}`);
  }

  if (!entitlement) {
    return;
  }

  const payload = { ...updates };

  if (updates.metadata) {
    payload.metadata = cleanObject({
      ...(entitlement.metadata ?? {}),
      ...updates.metadata,
    });
  }

  await supabase
    .from("entitlements")
    .update(cleanObject(payload))
    .eq("id", entitlement.id);
}

function determinePlanType(price) {
  const recurring = price?.recurring;
  if (!recurring) return null;

  if (recurring.interval === "month" && recurring.interval_count === 1) {
    return "monthly";
  }
  if (recurring.interval === "year" && recurring.interval_count === 1) {
    return "annual";
  }
  return `${recurring.interval ?? "unknown"}_${recurring.interval_count ?? 1}`;
}

function mapStripeStatus(status) {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "revoked";
    default:
      return "pending";
  }
}

function unixToIso(value) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function cleanObject(obj) {
  if (!obj) return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}
