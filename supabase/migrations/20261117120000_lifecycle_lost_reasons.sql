-- Client lifecycle (2026-11-17): why a lead didn't book, recorded by the
-- client (estimate page "Not right now") or by Monica (lead sheet).
alter table public.leads
  add column if not exists lost_reason text,
  add column if not exists lost_note text,
  add column if not exists lost_at timestamptz,
  add column if not exists lost_by text check (lost_by in ('client', 'monica'));

alter table public.estimates
  add column if not exists declined_reason text,
  add column if not exists declined_note text,
  add column if not exists declined_at timestamptz;
