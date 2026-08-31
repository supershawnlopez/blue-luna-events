-- Proposal engagement tracking.
-- Anonymous per-session activity on public proposal pages (e.g. the Westin
-- La Paloma Labor Day proposal): opens, time-on-page heartbeats, scroll
-- depth, and which controls the recipient clicked. Internal Studio previews
-- are filtered client- and server-side before they ever reach this table,
-- so every row here is real recipient activity.
CREATE TABLE IF NOT EXISTS proposal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_slug text NOT NULL,
  session_id text,
  type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proposal_events_slug_created_idx ON proposal_events (proposal_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS proposal_events_session_idx ON proposal_events (session_id);

ALTER TABLE proposal_events ENABLE ROW LEVEL SECURITY;
-- Reads/writes go through the service-role server client only, same pattern
-- as site_visits and estimate_activity. No anon policy on purpose.
