-- Proposal selections keep luxury proposal choices separate from public leads.
-- Monica turns these into official estimates only after reviewing the details.

create table if not exists proposal_selections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  proposal_slug text not null,
  proposal_title text not null,
  venue text,
  client_name text,
  client_email text,
  client_phone text,
  event_type text,
  event_date text,
  package_id text not null,
  package_name text not null,
  standard_price numeric not null default 0,
  partner_price numeric not null default 0,
  included_items jsonb not null default '[]'::jsonb,
  notes text,
  accepted_disclosures boolean not null default false,
  status text not null default 'selected',
  estimate_id uuid references estimates(id) on delete set null
);

create index if not exists proposal_selections_created_at_idx
  on proposal_selections (created_at desc);

create index if not exists proposal_selections_status_idx
  on proposal_selections (status, created_at desc);

create index if not exists proposal_selections_proposal_slug_idx
  on proposal_selections (proposal_slug, created_at desc);
