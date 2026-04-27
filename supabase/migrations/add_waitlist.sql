-- Run this in Supabase SQL Editor to add waitlist support

create table if not exists waitlist_entries (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid references events(id) on delete cascade not null,
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text,
  status            text not null default 'waiting',
  invite_token      text unique,
  invite_expires_at timestamptz,
  notified_at       timestamptz,
  created_at        timestamptz default now(),
  constraint waitlist_status_check
    check (status in ('waiting', 'notified', 'expired', 'converted', 'cancelled'))
);

create index if not exists waitlist_entries_event_status_idx
  on waitlist_entries (event_id, status, created_at);

create index if not exists waitlist_entries_token_idx
  on waitlist_entries (invite_token)
  where invite_token is not null;

alter table waitlist_entries enable row level security;

create policy "Allow public waitlist inserts"
  on waitlist_entries for insert
  with check (true);
