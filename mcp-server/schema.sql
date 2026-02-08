-- API Keys table for MCP server authentication
-- Run this in your Supabase SQL editor

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., "acr_1a2b...")
  name TEXT NOT NULL DEFAULT 'Default',
  tier TEXT NOT NULL DEFAULT 'free', -- free, pro, enterprise
  daily_limit INTEGER DEFAULT 10, -- null = unlimited
  calls_today INTEGER DEFAULT 0,
  calls_total INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  last_reset_at DATE DEFAULT CURRENT_DATE
);

-- Usage log for billing and analytics
CREATE TABLE IF NOT EXISTS api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_key ON api_usage_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_timestamp ON api_usage_log(timestamp);

-- Function to increment API calls (atomic)
CREATE OR REPLACE FUNCTION increment_api_calls(key_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET
    calls_today = CASE
      WHEN last_reset_at < CURRENT_DATE THEN 1
      ELSE calls_today + 1
    END,
    calls_total = calls_total + 1,
    last_used_at = NOW(),
    last_reset_at = CURRENT_DATE
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view own api_keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api_keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api_keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api_keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON api_usage_log
  FOR SELECT USING (
    api_key_id IN (SELECT id FROM api_keys WHERE user_id = auth.uid())
  );

-- Service role can do everything (for the MCP server)
CREATE POLICY "Service role full access api_keys" ON api_keys
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access usage" ON api_usage_log
  FOR ALL USING (auth.role() = 'service_role');

-- Tier configurations (for reference)
COMMENT ON TABLE api_keys IS 'Tier limits:
  - free: 10 calls/day
  - pro: 100 calls/day
  - enterprise: unlimited (null daily_limit)
';
