-- Run in Supabase SQL Editor

create table if not exists venue_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  location_id  text not null,
  created_at   timestamptz default now()
);

alter table venue_profiles enable row level security;

-- Venue users can only read their own profile
create policy "Venue users can read own profile"
  on venue_profiles for select
  using (auth.uid() = id);
