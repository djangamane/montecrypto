import { Resend } from 'resend';
import { supabase } from '../_lib/supabase.js';
import { isNewsletterAdmin } from '../../config/newsletterAdminAllowlist.js';

const resend = initResend();
const fromEmail = process.env.RESEND_FROM_EMAIL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring('Bearer '.length)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Supabase access token' });
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult?.user) {
    return res.status(401).json({ error: 'Invalid Supabase session' });
  }

  if (!isNewsletterAdmin(userResult.user.email)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  if (!resend || !fromEmail) {
    return res.status(500).json({ error: 'Resend is not configured on the server' });
  }

  const body = parseBody(req.body);
  const newsletterId = body?.newsletterId || null;

  const newsletter = await fetchNewsletter(newsletterId);
  if (!newsletter) {
    return res.status(404).json({ error: 'Newsletter not found' });
  }

  const recipients = await fetchRecipients();
  if (!recipients.length) {
    return res.status(400).json({ error: 'No subscribers with active access found' });
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
      .from('newsletters')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', newsletter.id);

    return res.status(200).json({ success: true, recipients: recipients.length });
  } catch (error) {
    console.error('Failed to send newsletter emails', error);
    return res.status(500).json({ error: error.message || 'Failed to send newsletter emails.' });
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
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
    .from('newsletters')
    .select('id, headline, summary, insights, sources, status, published_at, email_sent_at')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(1);

  if (id) {
    query = query.eq('id', id);
  } else {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error('Failed to load newsletter from Supabase');
  }
  return data || null;
}

async function fetchRecipients() {
  const { data, error } = await supabase.rpc('newsletter_recipient_emails');
  if (error) {
    console.error('Failed to load newsletter recipients', error);
    throw new Error('Failed to load newsletter recipients');
  }
  if (!Array.isArray(data)) return [];
  return data
    .map((entry) => entry.email)
    .filter((email, index, arr) => typeof email === 'string' && email && arr.indexOf(email) === index);
}

function renderEmail(newsletter) {
  const subject = `Scam Watch: ${newsletter.headline}`;
  const preheader = newsletter.summary || '';

  const htmlInsights = (newsletter.insights || [])
    .map((insight) => `
      <li style="margin-bottom:16px;">
        <h3 style="margin:0;color:#0ea5e9;font-size:18px;">${escapeHtml(insight.title || '')}</h3>
        <p style="margin:8px 0;color:#1f2937;line-height:1.5;">${escapeHtml(insight.summary || '')}</p>
        <p style="margin:8px 0;color:#111827;font-weight:600;">Threat Level: ${escapeHtml(insight.threatLevel || 'Unknown')}</p>
        <p style="margin:8px 0;color:#2563eb;">Avoid: ${escapeHtml(insight.howToAvoid || '')}</p>
      </li>
    `)
    .join('');

  const htmlSources = (newsletter.sources || [])
    .map((source) => `
      <li style="margin-bottom:8px;">
        <a href="${escapeAttribute(source.uri)}" style="color:#2563eb;text-decoration:none;">
          ${escapeHtml(source.title || source.uri || '')}
        </a>
      </li>
    `)
    .join('');

  const html = `
    <div style="font-family:Arial, Helvetica, sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 16px;">${escapeHtml(preheader)}</p>
      <h1 style="margin:0 0 16px;font-size:28px;line-height:1.3;color:#38bdf8;">${escapeHtml(newsletter.headline)}</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">${escapeHtml(newsletter.summary)}</p>
      <ul style="list-style:none;padding:0;margin:0 0 24px;background:#0b1220;border-radius:16px;padding:24px;">
        ${htmlInsights}
      </ul>
      <div style="background:#020617;border-radius:16px;padding:20px;">
        <h2 style="margin:0 0 12px;font-size:18px;color:#38bdf8;">Sources</h2>
        <ul style="list-style:none;padding:0;margin:0;">
          ${htmlSources}
        </ul>
      </div>
      <p style="margin-top:32px;font-size:12px;color:#64748b;">
        You are receiving Scam Watch as part of your MonteCrypto Scam Likely subscription.
      </p>
    </div>
  `;

  const textInsights = (newsletter.insights || [])
    .map((insight) => `- ${insight.title}\n  ${insight.summary}\n  Threat Level: ${insight.threatLevel}\n  Avoid: ${insight.howToAvoid}`)
    .join('\n\n');

  const textSources = (newsletter.sources || [])
    .map((source) => `- ${source.title || source.uri}: ${source.uri}`)
    .join('\n');

  const text = `Scam Watch — ${newsletter.headline}\n\n${newsletter.summary}\n\n${textInsights}\n\nSources\n${textSources}\n\nYou are receiving Scam Watch as part of your Scam Likely subscription.`;

  return { subject, html, text };
}

function escapeHtml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(input) {
  return String(input || '')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Newsletter sending endpoint disabled.');
    return null;
  }
  return new Resend(apiKey);
}
