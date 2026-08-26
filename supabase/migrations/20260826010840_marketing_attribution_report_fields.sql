-- Blue Luna Events — marketing attribution report fields
-- Safe to run multiple times. Adds UTM + session context used by Studio's
-- Traffic Report to separate Instagram/Facebook/Google traffic more honestly.

alter table if exists site_visits
  add column if not exists landing_path text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text;

alter table if exists leads
  add column if not exists session_id text,
  add column if not exists landing_path text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text;

create index if not exists site_visits_utm_source_idx on site_visits (utm_source) where utm_source is not null;
create index if not exists site_visits_session_created_idx on site_visits (session_id, created_at) where session_id is not null;
create index if not exists leads_utm_source_idx on leads (utm_source) where utm_source is not null;
create index if not exists leads_session_created_idx on leads (session_id, created_at) where session_id is not null;
