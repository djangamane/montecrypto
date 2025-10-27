import crypto from "node:crypto";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

if (!stripeWebhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET");
}

const STRIPE_API_BASE = "https://api.stripe.com";

export async function stripeGet(path, query = {}) {
  const normalizedPath = path.startsWith("/v1/")
    ? path
    : `/v1${path.startsWith("/") ? path : `/${path}`}`;
  const url = new URL(normalizedPath, STRIPE_API_BASE);

  if (typeof query === "object" && query !== null) {
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, String(item)));
      } else if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Stripe GET ${url.pathname}: ${response.status} ${response.statusText} ${errorText}`,
    );
  }

  return response.json();
}

export function verifyStripeWebhook(rawBody, signatureHeader) {
  if (!signatureHeader) {
    return false;
  }

  const entries = signatureHeader.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) {
      if (!acc[key]) acc[key] = [];
      acc[key].push(value);
    }
    return acc;
  }, /** @type {Record<string, string[]>} */ ({}));

  const timestamp = entries["t"]?.[0];
  const signatures = entries["v1"] ?? [];

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", stripeWebhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const matches = signatures.some((candidate) =>
    timingSafeEqual(candidate, expected),
  );
  if (!matches) {
    return false;
  }

  const toleranceSeconds = 5 * 60;
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (Math.abs(nowSeconds - Number.parseInt(timestamp, 10)) > toleranceSeconds) {
    return false;
  }

  return true;
}

function timingSafeEqual(a, b) {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}
