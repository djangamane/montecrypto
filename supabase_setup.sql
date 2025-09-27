-- MonteCrypto Supabase Schema for Scam Likely subscriptions

-- Helper to update timestamps
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles -------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles'
      and policyname='Users read own profile'
  ) then
    create policy "Users read own profile"
      on public.profiles for select using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles'
      and policyname='Users update own profile'
  ) then
    create policy "Users update own profile"
      on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;

-- Enumerations ----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname='entitlement_status') then
    create type public.entitlement_status as enum ('active', 'pending', 'revoked', 'past_due');
  end if;
  if not exists (select 1 from pg_type where typname='payment_provider') then
    create type public.payment_provider as enum ('paypal', 'coinbase');
  end if;
end $$;

-- Entitlements ----------------------------------------------------------------
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null,
  status public.entitlement_status not null default 'pending',
  payment_provider public.payment_provider not null,
  payment_reference text not null,
  activated_at timestamptz,
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payment_provider, payment_reference)
);

drop trigger if exists set_entitlements_updated_at on public.entitlements;
create trigger set_entitlements_updated_at
  before update on public.entitlements
  for each row execute procedure public.touch_updated_at();

create index if not exists entitlements_user_product_idx
  on public.entitlements (user_id, product);

alter table public.entitlements enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='entitlements'
      and policyname='Users read their entitlements'
  ) then
    create policy "Users read their entitlements"
      on public.entitlements for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='entitlements'
      and policyname='Users insert their entitlements'
  ) then
    create policy "Users insert their entitlements"
      on public.entitlements for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='entitlements'
      and policyname='Users update their entitlements'
  ) then
    create policy "Users update their entitlements"
      on public.entitlements for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='entitlements'
      and policyname='Service role full access (entitlements)'
  ) then
    create policy "Service role full access (entitlements)"
      on public.entitlements for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- Scans -----------------------------------------------------------------------
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null,
  query text not null,
  score numeric(5,2),
  verdict text,
  confidence text,
  raw_response jsonb,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists scans_user_created_idx
  on public.scans (user_id, created_at desc);

alter table public.scans enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='scans'
      and policyname='Users read own scans'
  ) then
    create policy "Users read own scans"
      on public.scans for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='scans'
      and policyname='Users insert own scans'
  ) then
    create policy "Users insert own scans"
      on public.scans for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='scans'
      and policyname='Service role full access (scans)'
  ) then
    create policy "Service role full access (scans)"
      on public.scans for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- Entitlement activation helper ------------------------------------------------
create or replace function public.activate_entitlement(
  p_user uuid,
  p_product text,
  p_provider public.payment_provider,
  p_reference text,
  p_expires timestamptz default null
) returns void as $$
begin
  insert into public.entitlements (
    user_id,
    product,
    payment_provider,
    payment_reference,
    status,
    activated_at,
    expires_at
  )
  values (p_user, p_product, p_provider, p_reference, 'active', now(), p_expires)
  on conflict (payment_provider, payment_reference)
  do update set
    status = 'active',
    activated_at = now(),
    expires_at = coalesce(excluded.expires_at, public.entitlements.expires_at),
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Newsletters -----------------------------------------------------------------
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  summary text,
  insights jsonb not null,
  sources jsonb default '[]'::jsonb,
  status text not null default 'draft',
  generated_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  email_sent_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_newsletters_updated_at on public.newsletters;
create trigger set_newsletters_updated_at
  before update on public.newsletters
  for each row execute procedure public.touch_updated_at();

create index if not exists newsletters_published_idx
  on public.newsletters (published_at desc nulls last);

alter table public.newsletters enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='newsletters'
      and policyname='Admin users manage newsletters'
  ) then
    create policy "Admin users manage newsletters"
      on public.newsletters for all using (auth.jwt() ->> 'email' in (
        'jason@abitofadvicellc.com'
      )) with check (auth.jwt() ->> 'email' in (
        'jason@abitofadvicellc.com'
      ));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='newsletters'
      and policyname='Subscribers read published newsletters'
  ) then
    create policy "Subscribers read published newsletters"
      on public.newsletters for select using (
        auth.uid() is not null
        and exists (
          select 1
          from public.entitlements e
          where e.user_id = auth.uid()
            and e.product = 'scam_likely'
            and e.status in ('active', 'past_due')
        )
        and coalesce(published_at, to_timestamp(0)) <= now()
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='newsletters'
      and policyname='Service role full access (newsletters)'
  ) then
    create policy "Service role full access (newsletters)"
      on public.newsletters for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

create or replace function public.newsletter_recipient_emails()
returns table(user_id uuid, email text)
language sql
security definer
set search_path = public, auth
as $$
  select distinct u.id, u.email
  from auth.users u
  join public.entitlements e on e.user_id = u.id
  where e.product = 'scam_likely'
    and e.status in ('active', 'past_due')
    and u.email is not null;
$$;
