-- R0.4 CROSS PLATFORM + GEO + PORTFOLIO + CHAT
-- Safe to run repeatedly.

alter table salons add column if not exists lat double precision;
alter table salons add column if not exists lng double precision;
alter table salons add column if not exists cover_url text;
alter table salons add column if not exists updated_at timestamptz not null default now();

alter table designer_profiles add column if not exists service_radius_km numeric(5,2) not null default 3;
alter table designer_profiles add column if not exists is_accepting_now boolean not null default false;

alter table conversations add column if not exists updated_at timestamptz not null default now();

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text,
  auth text,
  platform text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_salons_geo on salons(lat,lng);
create index if not exists idx_demands_geo on demands(lat,lng);
create index if not exists idx_portfolio_designer_sort on portfolio_items(designer_user_id,sort_order,created_at desc);
create index if not exists idx_services_designer_active on service_items(designer_user_id,is_active,created_at);
create index if not exists idx_conversations_customer_updated on conversations(customer_user_id,updated_at desc);
create index if not exists idx_conversations_designer_updated on conversations(designer_user_id,updated_at desc);
create index if not exists idx_notifications_user_unread on notifications(user_id,read_at,created_at desc);
