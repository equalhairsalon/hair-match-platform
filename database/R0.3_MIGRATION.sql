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
