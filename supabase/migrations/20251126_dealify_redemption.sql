-- Add 'dealify' to payment_provider enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_provider') THEN
    CREATE TYPE public.payment_provider AS ENUM ('paypal', 'coinbase', 'stripe', 'dealify');
  ELSE
    ALTER TYPE public.payment_provider ADD VALUE IF NOT EXISTS 'dealify';
  END IF;
END $$;

-- Create redemption_codes table
CREATE TABLE IF NOT EXISTS public.redemption_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  is_redeemed boolean DEFAULT false,
  redeemed_by uuid REFERENCES auth.users(id),
  redeemed_at timestamptz,
  plan_type text DEFAULT 'lifetime_deal',
  created_at timestamptz DEFAULT now()
);

-- Index on code for fast lookup
CREATE INDEX IF NOT EXISTS redemption_codes_code_idx ON public.redemption_codes (code);

-- Enable RLS
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Service role has full access
CREATE POLICY "Service role full access (redemption_codes)"
  ON public.redemption_codes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admins can read/write (using the specific admin email from existing policies as a reference, or just service role for now as requested)
-- The user request said "Only readable/writable by service_role (server-side) or admins."
-- I'll add the admin policy matching the newsletters table pattern just in case.
CREATE POLICY "Admin users manage redemption codes"
  ON public.redemption_codes
  FOR ALL
  USING (auth.jwt() ->> 'email' IN ('jason@aicryptorisk.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('jason@aicryptorisk.com'));

-- No public access (implicit by enabling RLS and not adding other policies)
