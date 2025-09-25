import { supabase } from '../_lib/supabase.js';
import { getTokenInfo, getTokenSupply } from '../_lib/etherscan.js';

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

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  const query = body?.query?.trim();
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const isAddress = /^0x[a-fA-F0-9]{40}$/.test(query);
  if (!isAddress) {
    return res.status(400).json({ error: 'Only direct contract addresses are supported in this preview' });
  }

  if (!process.env.ETHERSCAN_API_KEY) {
    return res.status(503).json({ error: 'Etherscan API key not configured' });
  }

  try {
    const [tokenInfoResult, supplyResult] = await Promise.all([
      getTokenInfo(query),
      getTokenSupply(query),
    ]);

    const tokenInfo = Array.isArray(tokenInfoResult) ? tokenInfoResult[0] : tokenInfoResult;

    const analysis = buildAnalysis({ tokenInfo, supplyResult, address: query });

    await persistScan({
      userId: userResult.user.id,
      query,
      analysis,
    });

    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Scan run failed', error);
    return res.status(500).json({ error: error.message });
  }
}

function buildAnalysis({ tokenInfo, supplyResult, address }) {
  const supply = supplyResult ? Number(supplyResult) : null;
  const owner = tokenInfo?.owner || null;
  const decimals = tokenInfo?.tokenDecimal ? Number(tokenInfo.tokenDecimal) : null;

  const flags = [];
  if (!owner || owner === '0x0000000000000000000000000000000000000000') {
    flags.push({
      severity: 'moderate',
      title: 'Ownership unclear',
      detail: 'Unable to determine contract owner; verify renounce or multi-sig custody.',
    });
  }

  if (!decimals || Number.isNaN(decimals)) {
    flags.push({
      severity: 'moderate',
      title: 'Decimals missing',
      detail: 'Token decimals not reported; check contract metadata.',
    });
  }

  const baseScore = 40;
  const score = Math.min(100, baseScore + flags.length * 5);

  return {
    token: {
      address,
      name: tokenInfo?.tokenName || null,
      symbol: tokenInfo?.tokenSymbol || null,
      decimals,
      type: tokenInfo?.type || 'ERC20',
      owner,
      totalSupply: supplyResult ?? null,
      circulatingSupply: tokenInfo?.circulatingSupply || null,
      lastUpdated: tokenInfo?.lastUpdated || null,
    },
    metrics: {
      supply,
    },
    risk: {
      score,
      verdict: score >= 70 ? 'High Risk' : score >= 50 ? 'Elevated Risk' : 'Guarded',
      flags,
    },
    sources: {
      etherscan: true,
    },
    fetchedAt: new Date().toISOString(),
  };
}

async function persistScan({ userId, query, analysis }) {
  const { error } = await supabase
    .from('scans')
    .insert({
      user_id: userId,
      product: 'scam_likely',
      query,
      score: analysis.risk.score,
      verdict: analysis.risk.verdict,
      raw_response: analysis,
    });

  if (error) {
    console.error('Supabase insert error', error);
  }
}
