-- Golf Ranch Classic Ticketing Platform — Schema
-- Run this in Supabase SQL Editor

-- ─── EVENTS ───────────────────────────────────────────────────────────────────
create table if not exists events (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text unique not null,
  location_id      text not null,
  location_name    text not null,
  location_state   text not null,
  date             date not null,
  start_time       text,
  end_time         text,
  description      text,
  hero_image_url   text,
  player_capacity  int,
  status           text default 'published',
  created_at       timestamptz default now()
);

-- ─── TICKET TIERS ─────────────────────────────────────────────────────────────
create table if not exists ticket_tiers (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid references events(id) on delete cascade,
  name            text not null,
  price           int not null,        -- in cents
  per_player      int,                 -- in cents, for team tiers
  description     text,
  is_team         boolean default false,
  is_ranch_pass   boolean default false,
  sort_order      int,
  active          boolean default true
);

-- ─── PROMO CODES ──────────────────────────────────────────────────────────────
create table if not exists promo_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  discount_type   text not null,       -- 'percentage' or 'fixed'
  discount_value  int not null,        -- percentage number or cents
  max_uses        int,
  used_count      int default 0,
  valid_from      timestamptz,
  valid_until     timestamptz,
  event_id        uuid references events(id) on delete set null,
  active          boolean default true
);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────
create table if not exists orders (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid references events(id),
  ticket_tier_id      uuid references ticket_tiers(id),
  team_id             uuid,            -- references teams(id), added after teams table
  customer_name       text not null,
  customer_email      text not null,
  customer_phone      text,
  ranch_pass_code     text,
  split_pay           boolean default false,
  pay_amount          int not null,    -- in cents
  discount            int default 0,  -- in cents
  promo_code_id       uuid references promo_codes(id),
  upsell_added        boolean default false,
  upsell_amount       int default 0,  -- in cents
  shipping_address    jsonb,
  stripe_session_id   text,
  stripe_payment_id   text,
  status              text default 'pending',
  created_at          timestamptz default now(),
  confirmed_at        timestamptz
);

-- ─── TEAMS ────────────────────────────────────────────────────────────────────
create table if not exists teams (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid references events(id) on delete cascade,
  team_name         text not null,
  invite_code       text unique not null,
  ticket_tier_id    uuid references ticket_tiers(id),
  captain_order_id  uuid references orders(id) on delete set null,
  created_at        timestamptz default now()
);

-- Add FK from orders to teams now that teams table exists
alter table orders
  add constraint orders_team_id_fkey
  foreign key (team_id) references teams(id) on delete set null;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- Enable RLS on all tables
alter table events enable row level security;
alter table ticket_tiers enable row level security;
alter table promo_codes enable row level security;
alter table orders enable row level security;
alter table teams enable row level security;

-- Public read access for published events
create policy "Public can view published events"
  on events for select
  using (status != 'draft');

-- Public read access for active ticket tiers
create policy "Public can view active ticket tiers"
  on ticket_tiers for select
  using (active = true);

-- Public read for teams (needed for invite links)
create policy "Public can view teams"
  on teams for select
  using (true);

-- Allow inserts from anon (orders, teams created during checkout)
create policy "Allow public order inserts"
  on orders for insert
  with check (true);

create policy "Allow public team inserts"
  on teams for insert
  with check (true);

-- Service role bypasses RLS (used in admin / server actions)
