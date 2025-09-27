import { supabase } from '../_lib/supabase.js';
import { isNewsletterAdmin } from '../../config/newsletterAdminAllowlist.js';

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

  const body = parseBody(req.body);
  const validation = validatePayload(body);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }

  const {
    headline,
    summary,
    insights,
    sources,
    status = 'published',
    publishedAt,
    metadata,
  } = body;

  const nowIso = new Date().toISOString();
  const publishedIso = status === 'published'
    ? (publishedAt ? new Date(publishedAt).toISOString() : nowIso)
    : null;

  const { data, error } = await supabase
    .from('newsletters')
    .insert({
      headline,
      summary,
      insights,
      sources,
      status,
      published_at: publishedIso,
      generated_by: userResult.user.id,
      metadata: metadata ?? {},
    })
    .select('id, headline, summary, insights, sources, status, published_at')
    .single();

  if (error) {
    console.error('Failed to persist newsletter', error);
    return res.status(500).json({ error: 'Failed to store newsletter' });
  }

  return res.status(201).json({
    id: data.id,
    headline: data.headline,
    summary: data.summary,
    insights: data.insights,
    sources: data.sources,
    status: data.status,
    publishedAt: data.published_at,
  });
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

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Payload required' };
  }
  if (!payload.headline) {
    return { isValid: false, error: 'headline is required' };
  }
  if (!payload.summary) {
    return { isValid: false, error: 'summary is required' };
  }
  if (!Array.isArray(payload.insights) || payload.insights.length === 0) {
    return { isValid: false, error: 'At least one insight is required' };
  }
  for (const insight of payload.insights) {
    if (!insight || typeof insight !== 'object') {
      return { isValid: false, error: 'Each insight must be an object' };
    }
    if (!insight.title || !insight.summary || !insight.howToAvoid) {
      return { isValid: false, error: 'Each insight must include title, summary, and howToAvoid' };
    }
  }
  if (payload.sources && !Array.isArray(payload.sources)) {
    return { isValid: false, error: 'sources must be an array' };
  }
  return { isValid: true };
}
