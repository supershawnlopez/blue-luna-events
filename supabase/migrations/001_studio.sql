-- Blue Luna Events Studio — Phase 2 Database Schema
-- Run this in your Supabase SQL Editor (New Query → paste → Run)
-- Safe to run multiple times (uses IF NOT EXISTS)

-- ─── gallery_media ────────────────────────────────────────────────────────────
-- Monica's photo/video library. Heart = on website. Star = social export queue.

CREATE TABLE IF NOT EXISTS gallery_media (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  file_name       text NOT NULL,
  storage_path    text NOT NULL,
  url             text,
  thumb_url       text,
  type            text NOT NULL DEFAULT 'photo',  -- 'photo' | 'video'
  show_on_website boolean NOT NULL DEFAULT false,  -- ❤️ heart toggle
  social_export   boolean NOT NULL DEFAULT false,  -- ⭐ star toggle
  event_type      text,
  caption         text,
  file_size       integer,
  width           integer,
  height          integer
);

-- ─── estimates ────────────────────────────────────────────────────────────────
-- Monica's client estimates. share_token = the /q/[token] public URL.

CREATE TABLE IF NOT EXISTS estimates (
  id                               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                       timestamptz NOT NULL DEFAULT now(),
  client_name                      text NOT NULL,
  client_email                     text NOT NULL,
  client_phone                     text,
  event_type                       text,
  event_date                       text,
  venue                            text,
  package_id                       text,
  package_name                     text,
  add_ons                          text,      -- JSON stringified string[]
  build                            jsonb,     -- CustomBuild type (à la carte)
  quoted_total                     numeric NOT NULL DEFAULT 0,
  deposit_amount                   numeric NOT NULL DEFAULT 0,
  balance_amount                   numeric NOT NULL DEFAULT 0,
  notes                            text,      -- Monica's private notes (not shown to client)
  status                           text NOT NULL DEFAULT 'draft',
    -- draft | sent | deposit_paid | balance_paid | completed | declined
  share_token                      text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  deposit_paid                     boolean NOT NULL DEFAULT false,
  deposit_paid_at                  timestamptz,
  deposit_stripe_session_id        text,
  deposit_stripe_payment_intent_id text,
  balance_paid                     boolean NOT NULL DEFAULT false,
  balance_paid_at                  timestamptz,
  balance_stripe_session_id        text,
  balance_stripe_payment_intent_id text
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS gallery_media_show_on_website_idx ON gallery_media (show_on_website) WHERE show_on_website = true;
CREATE INDEX IF NOT EXISTS gallery_media_social_export_idx   ON gallery_media (social_export)   WHERE social_export = true;
CREATE INDEX IF NOT EXISTS gallery_media_created_at_idx      ON gallery_media (created_at DESC);
CREATE INDEX IF NOT EXISTS estimates_share_token_idx         ON estimates (share_token);
CREATE INDEX IF NOT EXISTS estimates_status_idx              ON estimates (status);
CREATE INDEX IF NOT EXISTS estimates_created_at_idx          ON estimates (created_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Public can read gallery_media where show_on_website = true (for the public gallery).
-- All writes come from server-side (service role key) — so anon has read-only on the gallery.

ALTER TABLE gallery_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates     ENABLE ROW LEVEL SECURITY;

-- Public gallery: anyone can read hearted photos
DROP POLICY IF EXISTS "public_gallery_read" ON gallery_media;
CREATE POLICY "public_gallery_read" ON gallery_media
  FOR SELECT USING (show_on_website = true);

-- Estimates: only service role can write; public can read by share_token
DROP POLICY IF EXISTS "public_estimate_read" ON estimates;
CREATE POLICY "public_estimate_read" ON estimates
  FOR SELECT USING (true);  -- filtered in app layer by share_token

-- ─── Supabase Storage bucket (run in Supabase dashboard: Storage → New bucket) ──
-- Bucket name: media
-- Public: YES (so URLs work without auth)
-- Allowed MIME types: image/*, video/*
-- File size limit: 50MB

-- Note: Create this bucket manually in the Supabase dashboard under Storage.
-- Then come back and run this script.

SELECT 'Studio schema installed successfully' AS status;
