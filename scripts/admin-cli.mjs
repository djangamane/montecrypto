#!/usr/bin/env node

/**
 * Local admin CLI for AI Crypto Risk.
 *
 * Usage examples:
 *   node scripts/admin-cli.mjs blog list
 *   node scripts/admin-cli.mjs blog publish 1234-uuid
 *   node scripts/admin-cli.mjs blog ingest ./draft.json
 *   node scripts/admin-cli.mjs newsletter generate > briefing.json
 *   node scripts/admin-cli.mjs newsletter publish ./briefing.json
 *   node scripts/admin-cli.mjs newsletter send [newsletterId]
 */

import { readFile } from "node:fs/promises";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";

const [, , domain, action, ...rest] = process.argv;

async function main() {
  if (!domain || domain === "--help" || domain === "-h") {
    printHelp();
    return;
  }

  if (domain === "blog") {
    await handleBlog(action, rest);
    return;
  }

  if (domain === "newsletter") {
    await handleNewsletter(action, rest);
    return;
  }

  console.error(`Unknown domain "${domain}".`);
  printHelp(1);
}

function printHelp(exitCode = 0) {
  console.log(`AI Crypto Risk Admin CLI

Blog commands:
  blog list
  blog publish <id>
  blog ingest <file>

Newsletter commands:
  newsletter generate [focus]
  newsletter publish <file>
  newsletter send [newsletterId]
`);
  process.exit(exitCode);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

function createServiceClient() {
  const url = requireEnv("SUPABASE_URL");
  const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE");
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

const supabase = createServiceClient();

async function handleBlog(subcommand, args) {
  switch (subcommand) {
    case "list":
      await blogList();
      break;
    case "publish": {
      const id = args[0];
      if (!id) {
        throw new Error("blog publish requires an id argument");
      }
      await blogPublish(id);
      break;
    }
    case "ingest": {
      const filePath = args[0];
      if (!filePath) {
        throw new Error("blog ingest requires a path to a JSON payload");
      }
      await blogIngest(filePath);
      break;
    }
    default:
      throw new Error(`Unknown blog action "${subcommand}"`);
  }
}

async function blogList() {
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,status,publish_at,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list posts: ${error.message}`);
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.log("No posts found.");
    return;
  }

  console.log("Posts:");
  data.forEach((post) => {
    console.log(
      `- ${post.id} | ${post.status.padEnd(9)} | ${
        post.publish_at ?? "—"
      } | ${post.title}`,
    );
  });
}

async function blogPublish(id) {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("posts")
    .update({
      status: "published",
      publish_at: nowIso,
      updated_at: nowIso,
    })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to publish post: ${error.message}`);
  }

  if (!data?.slug) {
    throw new Error("Post not found or already published");
  }

  console.log(`Published post ${id} → /blog/${data.slug}`);
}

async function blogIngest(filePath) {
  const payload = JSON.parse(await readFile(filePath, "utf8"));
  const {
    idempotencyKey,
    status = "draft",
    title,
    slug,
    summary,
    keywords,
    category,
    publishAt,
    heroImageUrl,
    bodyFormat,
    body,
  } = payload ?? {};

  if (!title || !body) {
    throw new Error("Payload must include title and body");
  }

  if (bodyFormat && bodyFormat !== "markdown") {
    throw new Error("Only markdown bodyFormat is supported");
  }

  const finalSlug = slug ? slugify(slug) : slugify(title);
  const kw = normalizeKeywords(keywords);
  const nowIso = new Date().toISOString();

  let existing = null;
  if (idempotencyKey) {
    const { data, error } = await supabase
      .from("posts")
      .select("id, slug")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (error) {
      throw new Error(`Failed to check existing post: ${error.message}`);
    }
    existing = data;
  }

  const row = {
    idempotency_key: idempotencyKey ?? null,
    title,
    slug: finalSlug,
    summary: summary ?? null,
    category: category ?? null,
    keywords: kw,
    hero_image_url: heroImageUrl ?? null,
    body_md: body,
    status,
    publish_at: publishAt ?? null,
    updated_at: nowIso,
  };

  const mutation = existing
    ? supabase
        .from("posts")
        .update(row)
        .eq("id", existing.id)
        .select("id, slug")
        .single()
    : supabase
        .from("posts")
        .insert({ ...row, created_at: nowIso })
        .select("id, slug")
        .single();

  const { data, error } = await mutation;
  if (error) {
    throw new Error(`Failed to upsert post: ${error.message}`);
  }

  console.log(
    `${existing ? "Updated" : "Created"} post ${data.id} with slug ${
      data.slug
    }`,
  );
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) {
    return value.map((kw) => String(kw)).filter(Boolean);
  }
  if (typeof value === "string" && value.length) {
    return value
      .split(",")
      .map((kw) => kw.trim())
      .filter(Boolean);
  }
  return [];
}

async function handleNewsletter(subcommand, args) {
  switch (subcommand) {
    case "generate": {
      const focus = args.join(" ") || null;
      const briefing = await generateBriefing({ focus });
      console.log(JSON.stringify(briefing, null, 2));
      break;
    }
    case "publish": {
      const filePath = args[0];
      if (!filePath) {
        throw new Error("newsletter publish requires a JSON file argument");
      }
      const payload = JSON.parse(await readFile(filePath, "utf8"));
      const saved = await publishNewsletter(payload);
      console.log(`Published newsletter ${saved.id}`);
      break;
    }
    case "send": {
      const newsletterId = args[0] || null;
      const result = await sendNewsletter(newsletterId);
      console.log(`Sent ${result.recipients} emails.`);
      break;
    }
    default:
      throw new Error(`Unknown newsletter action "${subcommand}"`);
  }
}

const PERPLEXITY_ENDPOINT =
  process.env.PERPLEXITY_API_URL ||
  "https://api.perplexity.ai/chat/completions";
const PERPLEXITY_COIN_MODEL =
  process.env.PERPLEXITY_COIN_MODEL ||
  process.env.PERPLEXITY_MODEL ||
  "sonar-pro";
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || "";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const geminiClient = initGemini();

function initGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(
      "GEMINI_API_KEY is not set. Newsletter generation will fail without it.",
    );
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

async function generateBriefing({ focus }) {
  if (!geminiClient) {
    throw new Error("Gemini client is not configured");
  }

  const [geminiRaw, coinScan] = await Promise.all([
    runGeminiBriefing({ focus }).catch((error) => {
      console.error("Gemini workflow failed", error);
      return buildGeminiFallback({ focus, error });
    }),
    runPerplexityCoinScan({ focus }).catch((error) => {
      console.error("Perplexity coin scan failed", error);
      return null;
    }),
  ]);

  const briefing = normalizeBriefing(geminiRaw);
  if (coinScan) {
    briefing.metadata = {
      ...(briefing.metadata ?? {}),
      coinScan,
    };
  }
  return briefing;
}

async function runGeminiBriefing({ focus }) {
  const requestFocus = focus ? `Focus on ${focus}. ` : "";
  const prompt = `You are the lead analyst behind "AI Crypto Scam Search," a weekly briefing that surfaces the most pressing cryptocurrency scams and fraud cases.
${requestFocus}Use Google Search to identify the three most urgent and newsworthy crypto scam developments from the last 10 days.
Return ONLY valid JSON with the following structure:
{
  "headline": string catchy weekly headline,
  "summary": string 2-3 sentences overview suitable for newsletter intro,
  "insights": [
    {
      "title": string descriptive scam title,
      "summary": string concise explanation of how the scam operates and who it targets,
      "howToAvoid": string actionable defensive guidance,
      "threatLevel": "High" | "Medium" | "Low"
    }
  ],
  "sources": [
    {
      "uri": string URL reference,
      "title": string human readable title
    }
  ]
}
The JSON must be parseable with no trailing prose. Threat levels must be consistent with risk severity.`;

  const response = await geminiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const rawText = await extractText(response);
  const jsonPayload = sanitizeJson(rawText);
  return JSON.parse(jsonPayload);
}

async function runPerplexityCoinScan({ focus }) {
  if (!PERPLEXITY_API_KEY) {
    return null;
  }

  const windowDays = Math.max(
    Number.parseInt(process.env.PERPLEXITY_WINDOW_DAYS ?? "10", 10),
    1,
  );
  const now = new Date();
  const start = new Date(now.getTime() - windowDays * DAY_IN_MS);

  const prompt = buildPerplexityPrompt({ focus, start, now, windowDays });
  const response = await fetch(PERPLEXITY_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: PERPLEXITY_COIN_MODEL,
      max_tokens: Number.parseInt(
        process.env.PERPLEXITY_MAX_TOKENS ?? "4000",
        10,
      ),
      temperature: Number.parseFloat(
        process.env.PERPLEXITY_TEMPERATURE ?? "0.1",
      ),
      stream: false,
      messages: [
        {
          role: "system",
          content: "You are a cryptocurrency security analyst. Always respond with valid JSON only. No markdown, no explanations outside the JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("Perplexity API error:", response.status, errorText);
    throw new Error(`Perplexity request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  // Try to parse JSON from the response
  try {
    // Handle case where response might have markdown code blocks
    let jsonStr = content;
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.replace(/```\n?/g, "");
    }

    // Find JSON object boundaries
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      jsonStr = jsonStr.slice(start, end + 1);
    }

    return JSON.parse(jsonStr);
  } catch (parseError) {
    console.error("Failed to parse Perplexity response:", parseError.message);
    console.error("Raw content:", content.slice(0, 500));
    return null;
  }
}

function buildPerplexityPrompt({ focus, start, now, windowDays }) {
  const focusLine = focus
    ? `Focus specifically on: ${focus}`
    : "Focus on the most significant rug pulls, exit scams, and fraud cases.";

  return `Search for cryptocurrency tokens and projects with CONFIRMED investor losses (rug pulls, exit scams, exploits, phishing) from the past ${windowDays} days (${start.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}).

${focusLine}

Return ONLY valid JSON in this exact format:
{
  "summary": "Brief overview of the scam landscape this period",
  "findings": [
    {
      "token": "Token or project name",
      "title": "Descriptive headline about the incident",
      "summary": "What happened and how much was lost",
      "howToAvoid": "Specific advice to avoid similar scams",
      "threatLevel": "High" or "Medium" or "Low",
      "sources": [
        {"uri": "https://...", "title": "Source title"}
      ]
    }
  ],
  "sources": [
    {"uri": "https://...", "title": "Source title"}
  ]
}

REQUIREMENTS:
- Only include cases with confirmed/credible evidence of losses
- Cite real URLs from reputable sources (news, regulatory filings, on-chain analysis)
- If no credible scams found, return empty findings array with explanatory summary
- Return ONLY the JSON object, no other text`;
}

function sanitizeJson(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("Gemini response empty");
  }
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("Gemini returned invalid JSON.");
  }
  return raw.slice(firstBrace, lastBrace + 1);
}

async function extractText(response) {
  if (!response) return "";
  if (typeof response.text === "function") {
    return response.text();
  }
  if (typeof response.text === "string") {
    return response.text;
  }
  const candidates = response.candidates || [];
  const parts = candidates[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("");
  }
  return "";
}

function buildGeminiFallback({ focus, error }) {
  return {
    headline: `Scam Watch Update ${
      focus ? `— ${focus}` : ""
    } (Gemini fallback)`,
    summary: `Gemini failed to return results: ${error?.message ?? "unknown error"}.`,
    insights: [],
    sources: [],
    metadata: { fallback: true },
  };
}

function normalizeBriefing(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Briefing payload invalid");
  }
  return {
    headline: raw.headline ?? "Untitled Briefing",
    summary: raw.summary ?? "",
    insights: Array.isArray(raw.insights) ? raw.insights : [],
    sources: Array.isArray(raw.sources) ? raw.sources : [],
    status: raw.status ?? "draft",
    publishedAt: raw.publishedAt ?? null,
    metadata: raw.metadata ?? {},
  };
}

async function publishNewsletter(payload) {
  const briefing = normalizeBriefing(payload);
  const nowIso = new Date().toISOString();
  const publishedIso =
    briefing.status === "published"
      ? briefing.publishedAt
        ? new Date(briefing.publishedAt).toISOString()
        : nowIso
      : null;

  const { data, error } = await supabase
    .from("newsletters")
    .insert({
      headline: briefing.headline,
      summary: briefing.summary,
      insights: briefing.insights,
      sources: briefing.sources,
      status: briefing.status,
      published_at: publishedIso,
      metadata: briefing.metadata ?? {},
    })
    .select(
      "id, headline, summary, insights, sources, status, published_at, metadata",
    )
    .single();

  if (error) {
    throw new Error(`Failed to store newsletter: ${error.message}`);
  }

  return {
    id: data.id,
    headline: data.headline,
    summary: data.summary,
    insights: data.insights,
    sources: data.sources,
    status: data.status,
    publishedAt: data.published_at,
    metadata: data.metadata,
  };
}

async function sendNewsletter(newsletterId) {
  const resendApiKey = requireEnv("RESEND_API_KEY");
  const fromEmail = requireEnv("RESEND_FROM_EMAIL");
  const resend = new Resend(resendApiKey);

  const newsletter = await fetchNewsletter(newsletterId);
  if (!newsletter) {
    throw new Error("Newsletter not found");
  }

  const recipients = await fetchRecipients();
  if (!recipients.length) {
    throw new Error("No subscribers with active access found");
  }

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

  return { recipients: recipients.length };
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
    throw new Error(`Failed to load newsletter: ${error.message}`);
  }
  return data || null;
}

async function fetchRecipients() {
  const { data, error } = await supabase.rpc("newsletter_recipient_emails");
  if (error) {
    throw new Error(`Failed to load newsletter recipients: ${error.message}`);
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

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background-color:#f8fafc;color:#111827;padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="background:#0f172a;color:#e2e8f0;padding:24px 28px;">
          <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.35em;">Scam Watch</p>
          <h1 style="margin:12px 0 0;font-size:28px;">${escapeHtml(
            newsletter.headline || "",
          )}</h1>
          <p style="margin:12px 0 0;color:#cbd5f5;">${escapeHtml(preheader)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;">
          <p style="margin:0 0 16px;color:#1f2937;line-height:1.5;">${escapeHtml(
            newsletter.summary || "",
          )}</p>
          <ol style="padding-left:20px;margin:0 0 24px;color:#1f2937;">
            ${htmlInsights}
          </ol>
          ${
            htmlCoinSummary || htmlCoinFindings
              ? `<section style="margin:28px 0;">
                <h2 style="margin:0 0 12px;color:#b7791f;">Coin Watch</h2>
                ${htmlCoinSummary}
                ${
                  htmlCoinFindings
                    ? `<ol style="padding-left:20px;margin:16px 0;">${htmlCoinFindings}</ol>`
                    : ""
                }
              </section>`
              : ""
          }
          ${
            htmlSources
              ? `<section style="margin:28px 0;">
                <h2 style="margin:0 0 12px;color:#2563eb;">Sources</h2>
                <ul style="padding-left:20px;margin:0;">${htmlSources}</ul>
              </section>`
              : ""
          }
        </td>
      </tr>
      <tr>
        <td style="background:#0f172a;color:#94a3b8;padding:20px 28px;font-size:12px;line-height:1.6;">
          <p style="margin:0;">You’re receiving this briefing because your AI Crypto Risk membership includes Scam Watch insights. Forwarding is welcome—please keep the subscription link intact.</p>
        </td>
      </tr>
    </table>
  </div>
  `;

  const textParts = [
    `Scam Watch: ${newsletter.headline}`,
    "",
    newsletter.summary || "",
  ];

  (newsletter.insights || []).forEach((insight, index) => {
    textParts.push(
      "",
      `${index + 1}. ${insight.title || "Insight"}`,
      `Summary: ${insight.summary || ""}`,
      `Threat level: ${insight.threatLevel || "Unknown"}`,
      `Avoid: ${insight.howToAvoid || ""}`,
    );
  });

  if (coinScan?.summary || (coinScan?.findings || []).length) {
    textParts.push("", "Coin Watch:");
    if (coinScan.summary) {
      textParts.push(coinScan.summary);
    }
    (coinScan.findings || []).forEach((finding) => {
      textParts.push(
        "",
        `${finding.title || finding.token || "Token"}`,
        `Summary: ${finding.summary || ""}`,
        `Risk level: ${finding.threatLevel || "High"}`,
        `Defense: ${finding.howToAvoid || ""}`,
      );
    });
  }

  if ((newsletter.sources || []).length) {
    textParts.push("", "Sources:");
    newsletter.sources.forEach((source) => {
      textParts.push(`- ${source.title || source.uri}: ${source.uri}`);
    });
  }

  const text = textParts.join("\n");

  return { subject, html, text };
}

function normalizeCoinScanForEmail(raw) {
  if (!raw || typeof raw !== "object") return null;
  const findings = Array.isArray(raw.findings) ? raw.findings : [];
  return {
    summary: raw.summary || "",
    findings: findings.map((finding) => ({
      token: finding.token || "",
      title: finding.title || finding.token || "",
      summary: finding.summary || "",
      howToAvoid: finding.howToAvoid || "",
      threatLevel: finding.threatLevel || "High",
      sources: Array.isArray(finding.sources) ? finding.sources : [],
    })),
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
