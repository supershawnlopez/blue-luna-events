alter table estimate_payments
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text;

create unique index if not exists estimate_payments_stripe_session_id_uidx
  on estimate_payments (stripe_session_id)
  where stripe_session_id is not null;

create unique index if not exists estimate_payments_stripe_payment_intent_id_uidx
  on estimate_payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create table if not exists stripe_webhook_events (
  id text primary key,
  type text not null,
  livemode boolean,
  stripe_created timestamptz,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'received',
  estimate_id uuid references estimates(id),
  checkout_session_id text,
  payment_intent_id text,
  amount numeric,
  customer_email text,
  error text,
  payload jsonb not null
);

create index if not exists stripe_webhook_events_status_idx
  on stripe_webhook_events (status, received_at desc);

create index if not exists stripe_webhook_events_estimate_idx
  on stripe_webhook_events (estimate_id, received_at desc);
