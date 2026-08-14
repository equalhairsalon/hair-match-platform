-- Hair Match Platform R0.1 production schema (PostgreSQL / Neon)
create extension if not exists pgcrypto;

create type user_role as enum ('customer','designer','salon_owner','admin');
create type demand_status as enum ('collecting','matched','booked','closed','cancelled');
create type quote_status as enum ('sent','viewed','accepted','declined','expired');

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  role user_role not null default 'customer',
  display_name text not null,
  phone text unique,
  email text unique,
  password_hash text,
  avatar_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists salons (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid references users(id), name text not null,
  address text not null, lat double precision, lng double precision, phone text, instagram text,
  cover_url text, is_verified boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists designer_profiles (
  user_id uuid primary key references users(id) on delete cascade, salon_id uuid references salons(id), bio text,
  years_experience int not null default 0, specialties text[] not null default '{}', service_radius_km numeric(5,2) not null default 3,
  is_accepting_now boolean not null default false, response_rate numeric(5,2) not null default 0,
  avg_rating numeric(3,2) not null default 0, review_count int not null default 0, completed_count int not null default 0,
  subscription_plan text not null default 'free', subscription_status text not null default 'trial'
);
create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(), designer_user_id uuid references users(id) on delete cascade,
  image_url text not null, service_key text, caption text, sort_order int default 0, created_at timestamptz not null default now()
);
create table if not exists service_items (
  id uuid primary key default gen_random_uuid(), designer_user_id uuid references users(id) on delete cascade,
  service_key text not null, label text not null, price_from int, price_to int, duration_min int, is_active boolean default true
);
create table if not exists demands (
  id uuid primary key default gen_random_uuid(), customer_user_id uuid references users(id), service_key text not null,
  service_label text not null, desired_start timestamptz, desired_end timestamptz, budget_min int, budget_max int,
  location_text text not null, lat double precision, lng double precision, max_radius_km numeric(5,2) default 3,
  hair_length text, gender_preference text, notes text, style_tags text[] not null default '{}', status demand_status not null default 'collecting',
  created_at timestamptz not null default now(), expires_at timestamptz
);
create table if not exists demand_photos (
  id uuid primary key default gen_random_uuid(), demand_id uuid references demands(id) on delete cascade, image_url text not null, sort_order int default 0
);
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(), demand_id uuid references demands(id) on delete cascade,
  designer_user_id uuid references users(id), price int not null, available_at timestamptz not null, message text,
  included_items text[] not null default '{}', status quote_status not null default 'sent', created_at timestamptz not null default now()
);
create unique index if not exists uq_quote_designer_demand on quotes(demand_id, designer_user_id);
create table if not exists quote_portfolio_items (
  quote_id uuid references quotes(id) on delete cascade, portfolio_item_id uuid references portfolio_items(id), primary key(quote_id,portfolio_item_id)
);
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(), demand_id uuid unique references demands(id), quote_id uuid unique references quotes(id),
  customer_user_id uuid references users(id), designer_user_id uuid references users(id), salon_id uuid references salons(id),
  starts_at timestamptz not null, price int not null, status text not null default 'confirmed', created_at timestamptz not null default now()
);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(), booking_id uuid references bookings(id), demand_id uuid references demands(id),
  sender_user_id uuid references users(id), receiver_user_id uuid references users(id), body text, image_url text,
  read_at timestamptz, created_at timestamptz not null default now()
);
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
create index if not exists idx_demands_open on demands(status, created_at desc);
create index if not exists idx_quotes_demand on quotes(demand_id, created_at desc);
create index if not exists idx_provider_salon on designer_profiles(salon_id);
