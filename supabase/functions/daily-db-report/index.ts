import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Optional integrations – leave unset if unused.
const SLACK_WEBHOOK = Deno.env.get("SLACK_WEBHOOK") ?? "";

// Resend (preferred email provider because it exposes an HTTP API).
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const REPORT_EMAIL_TO = Deno.env.get("REPORT_EMAIL_TO") ?? "";
const REPORT_EMAIL_FROM =
  Deno.env.get("REPORT_EMAIL_FROM") ?? "reports@example.com";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY. This function will fail.",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type AuditSummaryRow = {
  table_name: string;
  operation: string;
  count: number;
};

async function buildReport(days = 1): Promise<AuditSummaryRow[]> {
  const { data, error } = await supabase.rpc(
    "generate_daily_audit_summary",
    { _days: days },
  );

  if (error) {
    throw error;
  }

  return data ?? [];
}

type IntegrationResult = {
  sent: boolean;
  reason?: string;
};

async function postToSlack(text: string): Promise<IntegrationResult> {
  if (!SLACK_WEBHOOK) {
    console.warn("Slack skipped: SLACK_WEBHOOK not set");
    return { sent: false, reason: "missing_webhook" };
  }

  const response = await fetch(SLACK_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to post to Slack", response.status, errorBody);
    return {
      sent: false,
      reason: `slack_http_${response.status}`,
    };
  }
  return { sent: true };
}

async function sendEmailWithResend(
  subject: string,
  html: string,
  text: string,
) : Promise<IntegrationResult> {
  if (!RESEND_API_KEY || !REPORT_EMAIL_TO || !REPORT_EMAIL_FROM) {
    console.warn(
      "Resend skipped: RESEND_API_KEY, REPORT_EMAIL_FROM, or REPORT_EMAIL_TO missing",
    );
    return { sent: false, reason: "missing_secret" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: REPORT_EMAIL_FROM,
      to: [REPORT_EMAIL_TO],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      "Failed to send email with Resend",
      response.status,
      errorBody,
    );
    return {
      sent: false,
      reason: `resend_http_${response.status}`,
    };
  }
  return { sent: true };
}

function formatReportText(report: AuditSummaryRow[]) {
  if (!report.length) {
    return "Daily DB Change Report:\nNo changes in the selected window.";
  }

  const lines = ["Daily DB Change Report:"];
  for (const row of report) {
    lines.push(`${row.table_name} — ${row.operation}: ${row.count}`);
  }
  return lines.join("\n");
}

function formatReportHtml(report: AuditSummaryRow[]) {
  if (!report.length) {
    return `<h1>Daily DB Change Report</h1><p>No changes in the selected window.</p>`;
  }

  const rows = report.map((row) =>
    `<tr>
      <td>${row.table_name}</td>
      <td>${row.operation}</td>
      <td>${row.count}</td>
    </tr>`
  ).join("");

  return `
    <h1>Daily DB Change Report</h1>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Table</th>
          <th>Operation</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const daysParam = url.searchParams.get("days");
    const days = daysParam ? Number(daysParam) : 1;

    const report = await buildReport(Number.isFinite(days) && days > 0 ? days : 1);
    const textReport = formatReportText(report);
    const htmlReport = formatReportHtml(report);

    const [slackResult, emailResult] = await Promise.all([
      postToSlack(textReport),
      sendEmailWithResend("Daily DB Change Report", htmlReport, textReport),
    ]);

    return new Response(
      JSON.stringify({
        status: "ok",
        rows: report.length,
        slack_sent: slackResult.sent,
        slack_reason: slackResult.reason ?? null,
        email_sent: emailResult.sent,
        email_reason: emailResult.reason ?? null,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("daily-db-report failed", err);
    return new Response(
      JSON.stringify({ status: "error", message: String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
