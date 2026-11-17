-- Who the celebration is for (Shawn, 2026-11-17): lets follow-up emails say
-- "Lily's 17th is coming up" or "your grandson's first birthday" instead of
-- guessing. Collected on the inquiry form; Monica can confirm/fix in Studio.
alter table public.leads
  add column if not exists honoree_relation text,    -- self | child | grandchild | family | friend | company
  add column if not exists honoree_name text,        -- "Lily"
  add column if not exists honoree_milestone text,   -- "Turning 16", "First baby", "70th anniversary"
  add column if not exists honoree_date date,        -- birthday / baby's due date / wedding date (recurs yearly)
  add column if not exists honoree_confirmed boolean not null default false; -- false = Claude's guess from their notes

-- Starter email templates written in Monica's voice arrive as drafts.
-- Nothing marked draft is ever sent; Shawn/Monica approve each one.
alter table public.email_templates
  add column if not exists slug text,
  add column if not exists category text,            -- not_booked | client | stay_in_touch
  add column if not exists send_when text,           -- plain English: "3 days after the estimate, if no reply"
  add column if not exists status text not null default 'approved' check (status in ('draft', 'approved', 'off')),
  add column if not exists sort_order int;

create unique index if not exists email_templates_slug_uidx on public.email_templates (slug) where slug is not null;
