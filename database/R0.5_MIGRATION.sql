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
