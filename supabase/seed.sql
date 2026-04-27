-- Golf Ranch Classic Ticketing Platform — Seed Data
-- Run AFTER schema.sql

-- ─── EVENTS ───────────────────────────────────────────────────────────────────
insert into events (name, slug, location_id, location_name, location_state, date, start_time, end_time, description, player_capacity, status) values
  ('Golf Ranch Classic', 'golf-ranch-classic-brookfield-ct',   'brookfield',    'Brookfield',    'CT', '2026-06-27', '8:00 AM', '12:00 PM', 'Join us for a 4-man scramble tournament at Golf Ranch. All skill levels welcome.', 60, 'published'),
  ('Golf Ranch Classic', 'golf-ranch-classic-glendale-az',     'glendale',      'Glendale',      'AZ', '2026-06-27', '8:00 AM', '12:00 PM', 'Join us for a 4-man scramble tournament at Golf Ranch. All skill levels welcome.', 60, 'published'),
  ('Golf Ranch Classic', 'golf-ranch-classic-grand-prairie-tx','grand-prairie', 'Grand Prairie', 'TX', '2026-06-27', '8:00 AM', '12:00 PM', 'Join us for a 4-man scramble tournament at Golf Ranch. All skill levels welcome.', 60, 'soldout'),
  ('Golf Ranch Classic', 'golf-ranch-classic-lees-summit-mo',  'lees-summit',   'Lee''s Summit', 'MO', '2026-06-27', '8:00 AM', '12:00 PM', 'Join us for a 4-man scramble tournament at Golf Ranch. All skill levels welcome.', 60, 'published'),
  ('Golf Ranch Classic', 'golf-ranch-classic-richardson-tx',   'richardson',    'Richardson',    'TX', '2026-06-27', '8:00 AM', '12:00 PM', 'Join us for a 4-man scramble tournament at Golf Ranch. All skill levels welcome.', 60, 'published'),
  ('Golf Ranch Classic', 'golf-ranch-classic-shoal-creek-mo',  'shoal-creek',   'Shoal Creek',   'MO', '2026-06-27', '8:00 AM', '12:00 PM', 'Join us for a 4-man scramble tournament at Golf Ranch. All skill levels welcome.', 60, 'published');

-- ─── TICKET TIERS (one set per event) ─────────────────────────────────────────
-- We insert tiers for each event using a subquery to get event IDs

insert into ticket_tiers (event_id, name, price, per_player, description, is_team, is_ranch_pass, sort_order)
select id, 'Ranch Pass Individual', 6000, null,
  'Exclusive pricing for Ranch Pass members. Includes all Classic amenities.',
  false, true, 1
from events;

insert into ticket_tiers (event_id, name, price, per_player, description, is_team, is_ranch_pass, sort_order)
select id, 'Ranch Pass Team', 20000, 5000,
  'Exclusive team pricing for Ranch Pass members. One payment covers all 4 players.',
  true, true, 2
from events;

insert into ticket_tiers (event_id, name, price, per_player, description, is_team, is_ranch_pass, sort_order)
select id, 'Individual', 7000, null,
  'Standard individual entry. Includes 18 holes on Toptracer, bucket hat, food & drink specials, and swag bag.',
  false, false, 3
from events;

insert into ticket_tiers (event_id, name, price, per_player, description, is_team, is_ranch_pass, sort_order)
select id, 'Team', 26000, 6500,
  'Standard team entry for 4 players. One payment covers the whole team, or split pay individually.',
  true, false, 4
from events;

-- ─── PROMO CODES ──────────────────────────────────────────────────────────────
insert into promo_codes (code, discount_type, discount_value, max_uses, active) values
  ('EARLYBIRD',   'percentage', 15,   50,   true),
  ('GOLFRANCH10', 'fixed',      1000, null, true);
