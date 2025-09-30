import { Resend } from "resend";
import { supabase } from "../_lib/supabase.js";
import { isNewsletterAdmin } from "../../config/newsletterAdminAllowlist.js";

const resend = initResend();
const fromEmail = process.env.RESEND_FROM_EMAIL;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing Supabase access token" });
  }

  const { data: userResult, error: userError } =
    await supabase.auth.getUser(token);
  if (userError || !userResult?.user) {
    return res.status(401).json({ error: "Invalid Supabase session" });
  }

  if (!isNewsletterAdmin(userResult.user.email)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }

  if (!resend || !fromEmail) {
    return res
      .status(500)
      .json({ error: "Resend is not configured on the server" });
  }

  const body = parseBody(req.body);
  const newsletterId = body?.newsletterId || null;

  const newsletter = await fetchNewsletter(newsletterId);
  if (!newsletter) {
    return res.status(404).json({ error: "Newsletter not found" });
  }

  const recipients = await fetchRecipients();
  if (!recipients.length) {
    return res
      .status(400)
      .json({ error: "No subscribers with active access found" });
  }

  try {
    const { subject, html, text } = renderEmail(newsletter);

    await resend.emails.send({
      from: fromEmail,
      to: [fromEmail],
      bcc: recipients,
      subject,
      html,
      text,
    });

    await supabase
      .from("newsletters")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", newsletter.id);

    return res
      .status(200)
      .json({ success: true, recipients: recipients.length });
  } catch (error) {
    console.error("Failed to send newsletter emails", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to send newsletter emails." });
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch (error) {
      return {};
    }
  }
  return body;
}

async function fetchNewsletter(id) {
  let query = supabase
    .from("newsletters")
    .select(
      "id, headline, summary, insights, sources, status, published_at, email_sent_at, metadata",
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1);

  if (id) {
    query = query.eq("id", id);
  } else {
    query = query.eq("status", "published");
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error("Failed to load newsletter from Supabase");
  }
  return data || null;
}

async function fetchRecipients() {
  const { data, error } = await supabase.rpc("newsletter_recipient_emails");
  if (error) {
    console.error("Failed to load newsletter recipients", error);
    throw new Error("Failed to load newsletter recipients");
  }
  if (!Array.isArray(data)) return [];
  return data
    .map((entry) => entry.email)
    .filter(
      (email, index, arr) =>
        typeof email === "string" && email && arr.indexOf(email) === index,
    );
}

function renderEmail(newsletter) {
  const subject = `Scam Watch: ${newsletter.headline}`;
  const preheader = newsletter.summary || "";
  const metadata = newsletter.metadata || {};
  const coinScan = normalizeCoinScanForEmail(
    metadata.coinScan || metadata.coin_scan,
  );

  const htmlInsights = (newsletter.insights || [])
    .map(
      (insight) => `
      <li style="margin-bottom:16px;">
        <h3 style="margin:0;color:#0ea5e9;font-size:18px;">${escapeHtml(insight.title || "")}</h3>
        <p style="margin:8px 0;color:#1f2937;line-height:1.5;">${escapeHtml(insight.summary || "")}</p>
        <p style="margin:8px 0;color:#111827;font-weight:600;">Threat Level: ${escapeHtml(insight.threatLevel || "Unknown")}</p>
        <p style="margin:8px 0;color:#2563eb;">Avoid: ${escapeHtml(insight.howToAvoid || "")}</p>
      </li>
    `,
    )
    .join("");

  const htmlSources = (newsletter.sources || [])
    .map(
      (source) => `
      <li style="margin-bottom:8px;">
        <a href="${escapeAttribute(source.uri)}" style="color:#2563eb;text-decoration:none;">
          ${escapeHtml(source.title || source.uri || "")}
        </a>
      </li>
    `,
    )
    .join("");

  const htmlCoinSummary = coinScan?.summary
    ? coinScan.summary
        .split(/\n+/)
        .map(
          (line) =>
            `<p style="margin:8px 0;color:#1f2937;line-height:1.5;">${escapeHtml(line)}</p>`,
        )
        .join("")
    : "";

  const htmlCoinFindings = (coinScan?.findings || [])
    .map(
      (finding) => `
      <li style="margin-bottom:16px;">
        <h3 style="margin:0;color:#b7791f;font-size:18px;">${escapeHtml(finding.title || finding.token || "Coin finding")}</h3>
        <p style="margin:8px 0;color:#1f2937;line-height:1.5;">${escapeHtml(finding.summary || "")}</p>
        <p style="margin:8px 0;color:#111827;font-weight:600;">Risk Level: ${escapeHtml(finding.threatLevel || "High")}</p>
        <p style="margin:8px 0;color:#2563eb;">Defensive move: ${escapeHtml(finding.howToAvoid || "")}</p>
        ${
          Array.isArray(finding.sources) && finding.sources.length
            ? `<ul style="margin:8px 0 0;padding-left:18px;">${finding.sources
                .map(
                  (src) => `
                <li style="margin-bottom:4px;">
                  <a href="${escapeAttribute(src.uri)}" style="color:#2563eb;text-decoration:none;">
                    ${escapeHtml(src.title || src.uri || "")}
                  </a>
                </li>
              `,
                )
                .join("")}</ul>`
            : ""
        }
      </li>
    `,
    )
    .join("");

  const htmlCoinSources = (coinScan?.sources || [])
    .map(
      (source) => `
      <li style="margin-bottom:8px;">
        <a href="${escapeAttribute(source.uri)}" style="color:#2563eb;text-decoration:none;">
          ${escapeHtml(source.title || source.uri || "")}
        </a>
      </li>
    `,
    )
    .join("");

  const html = `
    <div style="font-family:Arial, Helvetica, sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f7f5ef;color:#121417;">
      <p style="color:#6b7168;font-size:12px;margin:0 0 16px;letter-spacing:0.18em;text-transform:uppercase;">${escapeHtml(preheader)}</p>
      <h1 style="margin:0 0 16px;font-size:28px;line-height:1.3;color:#121417;">${escapeHtml(newsletter.headline)}</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#3e5f5a;">${escapeHtml(newsletter.summary)}</p>
      <ul style="list-style:none;padding:0;margin:0 0 24px;background:#ffffff;border-radius:16px;padding:24px;border:1px solid rgba(62,95,90,0.25);">
        ${htmlInsights}
      </ul>
      ${
        coinScan
          ? `
        <section style="margin:0 0 24px;background:#ffffff;border-radius:16px;padding:24px;border:1px solid rgba(62,95,90,0.25);">
          <h2 style="margin:0 0 12px;font-size:18px;color:#3e5f5a;text-transform:uppercase;letter-spacing:0.15em;">Coin Watch — Perplexity Deep Research</h2>
          ${htmlCoinSummary}
          ${htmlCoinFindings ? `<ul style="list-style:none;padding:0;margin:24px 0 0;">${htmlCoinFindings}</ul>` : ""}
          ${
            htmlCoinSources
              ? `<div style="margin-top:16px;border-top:1px solid rgba(62,95,90,0.2);padding-top:12px;">
                <h3 style="margin:0 0 8px;font-size:14px;color:#3e5f5a;text-transform:uppercase;letter-spacing:0.12em;">Additional URLs</h3>
                <ul style="list-style:none;padding:0;margin:0;">
                  ${htmlCoinSources}
                </ul>
              </div>`
              : ""
          }
        </section>
      `
          : ""
      }
      <div style="background:#ffffff;border-radius:16px;padding:20px;border:1px solid rgba(62,95,90,0.2);">
        <h2 style="margin:0 0 12px;font-size:18px;color:#3e5f5a;text-transform:uppercase;letter-spacing:0.15em;">Sources</h2>
        <ul style="list-style:none;padding:0;margin:0;">
          ${htmlSources}
        </ul>
      </div>
      <p style="margin-top:32px;font-size:12px;color:#6b7168;">
        You are receiving the Weekly Risk Brief as part of your MonteCrypto membership. This message is educational
        and not financial advice.
      </p>
    </div>
  `;

  const textInsights = (newsletter.insights || [])
    .map(
      (insight) =>
        `- ${insight.title}\n  ${insight.summary}\n  Threat Level: ${insight.threatLevel}\n  Avoid: ${insight.howToAvoid}`,
    )
    .join("\n\n");

  const textCoinSection = coinScan
    ? [
        "Coin Watch — Perplexity Deep Research",
        coinScan.summary,
        ...(coinScan.findings || []).map(
          (finding) =>
            `• ${finding.title || finding.token || "Coin finding"}\n  ${finding.summary}\n  Risk Level: ${finding.threatLevel}\n  Defensive move: ${finding.howToAvoid}`,
        ),
        coinScan.sources?.length
          ? `Additional URLs\n${coinScan.sources
              .map((source) => `- ${source.title || source.uri}: ${source.uri}`)
              .join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    : "";

  const textSources = (newsletter.sources || [])
    .map((source) => `- ${source.title || source.uri}: ${source.uri}`)
    .join("\n");

  const text = `Weekly Scam Brief — ${newsletter.headline}\n\n${newsletter.summary}\n\n${textInsights}\n\n${textCoinSection ? `${textCoinSection}\n\n` : ""}Sources\n${textSources}\n\nYou are receiving the Weekly Scam Brief as part of your AI Crypto Risk membership.`;

  return { subject, html, text };
}

function normalizeCoinScanForEmail(raw) {
  if (!raw || typeof raw !== "object") return null;
  const summary = typeof raw.summary === "string" ? raw.summary.trim() : "";
  const findings = Array.isArray(raw.findings)
    ? raw.findings
        .map((finding) => ({
          token: typeof finding.token === "string" ? finding.token.trim() : "",
          title: typeof finding.title === "string" ? finding.title.trim() : "",
          summary:
            typeof finding.summary === "string" ? finding.summary.trim() : "",
          howToAvoid:
            typeof finding.howToAvoid === "string"
              ? finding.howToAvoid.trim()
              : "",
          threatLevel:
            typeof finding.threatLevel === "string"
              ? finding.threatLevel.trim()
              : "",
          sources: Array.isArray(finding.sources)
            ? finding.sources
                .map((source) => ({
                  uri: typeof source.uri === "string" ? source.uri.trim() : "",
                  title:
                    typeof source.title === "string" ? source.title.trim() : "",
                }))
                .filter((source) => source.uri)
            : [],
        }))
        .filter((finding) => finding.summary)
    : [];

  const sources = Array.isArray(raw.sources)
    ? raw.sources
        .map((source) => ({
          uri: typeof source.uri === "string" ? source.uri.trim() : "",
          title: typeof source.title === "string" ? source.title.trim() : "",
        }))
        .filter((source) => source.uri)
    : [];

  if (!summary && !findings.length) {
    return null;
  }

  return {
    summary,
    findings,
    sources,
  };
}

function escapeHtml(input) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(input) {
  return String(input || "")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY is not set. Newsletter sending endpoint disabled.",
    );
    return null;
  }
  return new Resend(apiKey);
}
