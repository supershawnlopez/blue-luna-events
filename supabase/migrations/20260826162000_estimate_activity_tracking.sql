alter table estimate_activity
  add column if not exists actor_type text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists dedupe_key text;

create unique index if not exists estimate_activity_dedupe_uidx
  on estimate_activity (dedupe_key)
  where dedupe_key is not null;

create index if not exists estimate_activity_estimate_created_idx
  on estimate_activity (estimate_id, created_at desc);

create index if not exists estimate_activity_type_created_idx
  on estimate_activity (type, created_at desc);
