-- R0.5.1 STRICT LIVE DATA REPAIR
-- Safe consolidation of R0.3 + R0.4 + R0.5 schema additions.
-- Run in Neon SQL Editor. Statements are designed to be idempotent.


-- ===== R0.3_MIGRATION.sql =====
-- R0.3 migration for an existing R0.2 schema.
alter table designer_profiles add column if not exists onboarding_completed boolean not null default false;
alter table designer_profiles add column if not exists updated_at timestamptz not null default now();
alter table service_items add column if not exists description text;
alter table quotes add column if not exists work_images text[] not null default '{}';
alter table bookings add column if not exists ends_at timestamptz;
alter table bookings add column if not exists updated_at timestamptz not null default now();
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(), demand_id uuid references demands(id) on delete cascade,
  customer_user_id uuid references users(id), designer_user_id uuid references users(id), created_at timestamptz not null default now(),
  unique(demand_id, customer_user_id, designer_user_id)
);
alter table messages add column if not exists conversation_id uuid references conversations(id) on delete cascade;
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade,
  plan_code text not null default 'pilot', status text not null default 'trial', provider text, provider_customer_id text,
  current_period_start timestamptz, current_period_end timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_demands_customer on demands(customer_user_id, created_at desc);
create index if not exists idx_quotes_designer on quotes(designer_user_id, created_at desc);
create index if not exists idx_messages_conversation on messages(conversation_id, created_at);


-- ===== R0.4_MIGRATION.sql =====
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


-- ===== R0.5_MIGRATION.sql =====
-- R0.5 PILOT RECRUITMENT READY
-- Approval workflow, moderation, reports, notifications.
-- Safe to run repeatedly in Neon SQL Editor.

do $$ begin create type account_status as enum ('active','suspended','deleted'); exception when duplicate_object then null; end $$;
do $$ begin create type designer_approval_status as enum ('pending','approved','rejected'); exception when duplicate_object then null; end $$;

alter table users add column if not exists account_status account_status not null default 'active';
alter table users add column if not exists phone_verified_at timestamptz;

alter table designer_profiles add column if not exists approval_status designer_approval_status not null default 'pending';
alter table designer_profiles add column if not exists approval_note text;
alter table designer_profiles add column if not exists submitted_at timestamptz;
alter table designer_profiles add column if not exists approved_at timestamptz;
alter table designer_profiles add column if not exists approved_by uuid references users(id);

-- Existing completed pilot profiles stay visible after migration.
update designer_profiles
set approval_status='approved', approved_at=coalesce(approved_at,now())
where onboarding_completed=true and approval_status='pending';

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references users(id) on delete set null,
  target_user_id uuid references users(id) on delete cascade,
  target_type text not null default 'designer',
  reason text not null,
  detail text,
  status text not null default 'open',
  resolved_by uuid references users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists blocked_users (
  blocker_user_id uuid references users(id) on delete cascade,
  blocked_user_id uuid references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_user_id,blocked_user_id),
  check(blocker_user_id<>blocked_user_id)
);

create index if not exists idx_users_account_status on users(account_status,created_at desc);
create index if not exists idx_designer_approval on designer_profiles(approval_status,onboarding_completed,updated_at desc);
create index if not exists idx_reports_status on reports(status,created_at desc);


-- Verification: this query should return one row and not error.
select count(*)::int as approved_designers from users u join designer_profiles dp on dp.user_id=u.id where u.role in ('designer','salon_owner') and u.account_status='active' and dp.onboarding_completed=true and dp.approval_status='approved';
