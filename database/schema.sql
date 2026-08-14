-- Hair Match Platform R0.3 production schema (PostgreSQL / Neon)
-- Safe to run repeatedly in Neon SQL Editor.
create extension if not exists pgcrypto;

do $$ begin create type user_role as enum ('customer','designer','salon_owner','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type demand_status as enum ('collecting','matched','booked','closed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type quote_status as enum ('sent','viewed','accepted','declined','expired'); exception when duplicate_object then null; end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(), role user_role not null default 'customer', display_name text not null,
  phone text unique, email text unique, password_hash text, avatar_url text, is_verified boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists salons (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid references users(id), name text not null,
  address text not null, lat double precision, lng double precision, phone text, instagram text, cover_url text,
  is_verified boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists designer_profiles (
  user_id uuid primary key references users(id) on delete cascade, salon_id uuid references salons(id), bio text,
  years_experience int not null default 0, specialties text[] not null default '{}', service_radius_km numeric(5,2) not null default 3,
  is_accepting_now boolean not null default false, response_rate numeric(5,2) not null default 0,
  avg_rating numeric(3,2) not null default 0, review_count int not null default 0, completed_count int not null default 0,
  subscription_plan text not null default 'free', subscription_status text not null default 'trial',
  onboarding_completed boolean not null default false, updated_at timestamptz not null default now()
);
alter table designer_profiles add column if not exists onboarding_completed boolean not null default false;
alter table designer_profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(), designer_user_id uuid references users(id) on delete cascade,
  image_url text not null, service_key text, caption text, sort_order int default 0, created_at timestamptz not null default now()
);

create table if not exists service_items (
  id uuid primary key default gen_random_uuid(), designer_user_id uuid references users(id) on delete cascade,
  service_key text not null, label text not null, description text, price_from int, price_to int, duration_min int,
  is_active boolean default true, created_at timestamptz not null default now()
);
alter table service_items add column if not exists description text;

create table if not exists demands (
  id uuid primary key default gen_random_uuid(), customer_user_id uuid references users(id), service_key text not null,
  service_label text not null, desired_start timestamptz, desired_end timestamptz, budget_min int, budget_max int,
  location_text text not null, lat double precision, lng double precision, max_radius_km numeric(5,2) default 3,
  hair_length text, gender_preference text, notes text, style_tags text[] not null default '{}',
  status demand_status not null default 'collecting', created_at timestamptz not null default now(), expires_at timestamptz
);

create table if not exists demand_photos (
  id uuid primary key default gen_random_uuid(), demand_id uuid references demands(id) on delete cascade,
  image_url text not null, sort_order int default 0
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(), demand_id uuid references demands(id) on delete cascade,
  designer_user_id uuid references users(id), price int not null, available_at timestamptz not null, message text,
  included_items text[] not null default '{}', work_images text[] not null default '{}',
  status quote_status not null default 'sent', created_at timestamptz not null default now()
);
alter table quotes add column if not exists work_images text[] not null default '{}';
create unique index if not exists uq_quote_designer_demand on quotes(demand_id, designer_user_id);

create table if not exists quote_portfolio_items (
  quote_id uuid references quotes(id) on delete cascade, portfolio_item_id uuid references portfolio_items(id),
  primary key(quote_id,portfolio_item_id)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(), demand_id uuid unique references demands(id), quote_id uuid unique references quotes(id),
  customer_user_id uuid references users(id), designer_user_id uuid references users(id), salon_id uuid references salons(id),
  starts_at timestamptz not null, ends_at timestamptz, price int not null, status text not null default 'confirmed',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table bookings add column if not exists ends_at timestamptz;
alter table bookings add column if not exists updated_at timestamptz not null default now();

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(), demand_id uuid references demands(id) on delete cascade,
  customer_user_id uuid references users(id), designer_user_id uuid references users(id), created_at timestamptz not null default now(),
  unique(demand_id, customer_user_id, designer_user_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid references conversations(id) on delete cascade,
  booking_id uuid references bookings(id), demand_id uuid references demands(id), sender_user_id uuid references users(id),
  receiver_user_id uuid references users(id), body text, image_url text, read_at timestamptz, created_at timestamptz not null default now()
);
alter table messages add column if not exists conversation_id uuid references conversations(id) on delete cascade;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(), booking_id uuid unique references bookings(id), reviewer_user_id uuid references users(id),
  designer_user_id uuid references users(id), rating int check(rating between 1 and 5), body text, created_at timestamptz default now()
);

create table if not exists favorites (
  customer_user_id uuid references users(id) on delete cascade, designer_user_id uuid references users(id) on delete cascade,
  created_at timestamptz default now(), primary key(customer_user_id,designer_user_id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade, type text not null,
  title text not null, body text, data jsonb not null default '{}', read_at timestamptz, created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade,
  plan_code text not null default 'pilot', status text not null default 'trial', provider text, provider_customer_id text,
  current_period_start timestamptz, current_period_end timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists idx_demands_open on demands(status, created_at desc);
create index if not exists idx_demands_customer on demands(customer_user_id, created_at desc);
create index if not exists idx_quotes_demand on quotes(demand_id, created_at desc);
create index if not exists idx_quotes_designer on quotes(designer_user_id, created_at desc);
create index if not exists idx_provider_salon on designer_profiles(salon_id);
create index if not exists idx_messages_conversation on messages(conversation_id, created_at);


-- R0.4 cross-platform / geo / chat additions
alter table salons add column if not exists lat double precision;
alter table salons add column if not exists lng double precision;
alter table salons add column if not exists cover_url text;
alter table salons add column if not exists updated_at timestamptz not null default now();
alter table conversations add column if not exists updated_at timestamptz not null default now();

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade,
  endpoint text not null unique, p256dh text, auth text, platform text, user_agent text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists idx_salons_geo on salons(lat,lng);
create index if not exists idx_demands_geo on demands(lat,lng);
create index if not exists idx_portfolio_designer_sort on portfolio_items(designer_user_id,sort_order,created_at desc);
create index if not exists idx_services_designer_active on service_items(designer_user_id,is_active,created_at);
create index if not exists idx_conversations_customer_updated on conversations(customer_user_id,updated_at desc);
create index if not exists idx_conversations_designer_updated on conversations(designer_user_id,updated_at desc);
create index if not exists idx_notifications_user_unread on notifications(user_id,read_at,created_at desc);
