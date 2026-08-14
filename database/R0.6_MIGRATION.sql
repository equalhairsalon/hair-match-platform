-- R0.6 BEAUTY PLATFORM + SUPER ADMIN COMMAND CENTER
-- Safe to run repeatedly in Neon SQL Editor.
-- Extends the existing R0.5 schema without destroying legacy hair tables.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- 1) General beauty-service catalog
create table if not exists service_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  icon_key text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_catalog_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references service_categories(id) on delete cascade,
  key text not null,
  label text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(category_id,key)
);

insert into service_categories(key,label,description,icon_key,sort_order) values
 ('hair','美髮','洗、剪、染、燙、護與造型','scissors',10),
 ('nails','美甲','手足保養、凝膠、造型與卸甲','sparkles',20),
 ('lashes','美睫','接睫、睫毛管理、補睫與卸睫','eye',30),
 ('beauty','美容／美體','臉部保養、除毛、按摩與身體管理','heart-pulse',40)
on conflict(key) do update set label=excluded.label,description=excluded.description,icon_key=excluded.icon_key,sort_order=excluded.sort_order,updated_at=now();

insert into service_catalog_items(category_id,key,label,description,sort_order)
select c.id,v.key,v.label,v.description,v.sort_order
from service_categories c
join (values
 ('hair','hair_wash','洗髮／造型','洗髮、吹整、基礎造型',10),
 ('hair','hair_cut','剪髮','男女剪髮、層次與造型調整',20),
 ('hair','hair_color','染髮','單色染、漂髮、特殊色與設計染',30),
 ('hair','hair_perm','燙髮','冷燙、熱塑燙、髮根與局部燙',40),
 ('hair','hair_care','護髮','結構護理、深層修護與頭皮保養',50),
 ('hair','hair_style','造型','宴會、活動與日常造型',60),
 ('nails','nails_gel','凝膠美甲','單色、跳色、鏡面與基礎凝膠',10),
 ('nails','nails_art','造型美甲','彩繪、飾品、延甲與指定款式',20),
 ('nails','nails_manicure','手部保養','修型、甘皮與手部保養',30),
 ('nails','nails_pedicure','足部保養','足部修型、甘皮與保養',40),
 ('nails','nails_remove','卸甲','凝膠／延甲卸除與修護',50),
 ('lashes','lashes_extension','接睫毛','單根、濃密、自然款與客製設計',10),
 ('lashes','lashes_lift','睫毛管理','睫毛捲翹、角蛋白與整理',20),
 ('lashes','lashes_fill','補睫','既有睫毛補量與調整',30),
 ('lashes','lashes_remove','卸睫','安全卸除與清潔保養',40),
 ('beauty','beauty_facial','臉部保養','清潔、保濕、修護與膚況管理',10),
 ('beauty','beauty_acne','粉刺／痘肌管理','粉刺清潔與痘肌保養',20),
 ('beauty','beauty_waxing','除毛','熱蠟、局部與身體除毛',30),
 ('beauty','beauty_massage','按摩／舒壓','肩頸、全身與局部舒壓',40),
 ('beauty','beauty_body','美體管理','身體保養、體態與循環管理',50)
) as v(category_key,key,label,description,sort_order) on c.key=v.category_key
on conflict(category_id,key) do update set label=excluded.label,description=excluded.description,sort_order=excluded.sort_order,updated_at=now();

-- 2) General organizations and provider memberships
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references users(id) on delete set null,
  name text not null,
  organization_type text not null default 'studio',
  address text,
  city text,
  lat double precision,
  lng double precision,
  phone text,
  instagram text,
  cover_url text,
  status text not null default 'active',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_memberships (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  membership_role text not null default 'provider',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  primary key(organization_id,user_id)
);

-- Backwards-compatible link from current tables
alter table salons add column if not exists organization_id uuid references organizations(id);
alter table designer_profiles add column if not exists organization_id uuid references organizations(id);
alter table designer_profiles add column if not exists provider_kind text not null default 'individual';
alter table designer_profiles add column if not exists primary_category_key text;

-- Existing salon -> organization migration. Keep the same UUID when possible.
insert into organizations(id,owner_user_id,name,organization_type,address,lat,lng,phone,instagram,cover_url,status,is_verified,created_at,updated_at)
select s.id,s.owner_user_id,s.name,'salon',s.address,s.lat,s.lng,s.phone,s.instagram,s.cover_url,'active',s.is_verified,s.created_at,s.updated_at
from salons s
where not exists(select 1 from organizations o where o.id=s.id)
on conflict(id) do nothing;

update salons set organization_id=id where organization_id is null;
update designer_profiles dp set organization_id=dp.salon_id where dp.organization_id is null and dp.salon_id is not null;
insert into organization_memberships(organization_id,user_id,membership_role,status)
select dp.organization_id,dp.user_id,case when o.owner_user_id=dp.user_id then 'owner' else 'provider' end,'active'
from designer_profiles dp join organizations o on o.id=dp.organization_id
where dp.organization_id is not null
on conflict(organization_id,user_id) do nothing;

-- 3) Provider category memberships and applications
create table if not exists provider_categories (
  user_id uuid not null references users(id) on delete cascade,
  category_id uuid not null references service_categories(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key(user_id,category_id)
);

-- Existing providers are hair providers unless later changed.
insert into provider_categories(user_id,category_id,is_primary)
select dp.user_id,c.id,true from designer_profiles dp join service_categories c on c.key='hair'
where not exists(select 1 from provider_categories pc where pc.user_id=dp.user_id)
on conflict do nothing;
update designer_profiles set primary_category_key=coalesce(primary_category_key,'hair') where primary_category_key is null;

create table if not exists provider_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  application_status text not null default 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references users(id) on delete set null,
  review_note text,
  completeness_score int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into provider_applications(user_id,organization_id,application_status,submitted_at,reviewed_at,reviewed_by,review_note,completeness_score)
select dp.user_id,dp.organization_id,
  case dp.approval_status::text when 'approved' then 'approved' when 'rejected' then 'rejected' else case when dp.onboarding_completed then 'pending' else 'draft' end end,
  dp.submitted_at,dp.approved_at,dp.approved_by,dp.approval_note,
  case when dp.onboarding_completed then 70 else 20 end
from designer_profiles dp
on conflict(user_id) do update set organization_id=excluded.organization_id,
  application_status=case when provider_applications.application_status='approved' then 'approved' else excluded.application_status end,
  updated_at=now();

-- 4) Generalize services, portfolio and customer demands without breaking legacy APIs
alter table service_items add column if not exists category_key text;
alter table service_items add column if not exists catalog_item_key text;
alter table portfolio_items add column if not exists category_key text;
alter table demands add column if not exists category_key text;
alter table demands add column if not exists service_item_key text;

update service_items set category_key=coalesce(category_key,'hair') where category_key is null;
update portfolio_items set category_key=coalesce(category_key,'hair') where category_key is null;
update demands set category_key=coalesce(category_key,'hair') where category_key is null;
update demands set service_item_key=coalesce(service_item_key,
  case service_key when 'wash' then 'hair_wash' when 'cut' then 'hair_cut' when 'color' then 'hair_color' when 'perm' then 'hair_perm' when 'care' then 'hair_care' when 'style' then 'hair_style' else service_key end)
where service_item_key is null;

-- 5) Super Admin and scalable administration
create table if not exists platform_admins (
  user_id uuid primary key references users(id) on delete cascade,
  admin_level text not null default 'super_admin',
  permissions jsonb not null default '{"all":true}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into platform_admins(user_id,admin_level,permissions)
select id,'super_admin','{"all":true}'::jsonb from users where role='admin'
on conflict(user_id) do nothing;

create table if not exists admin_audit_logs (
  id bigserial primary key,
  admin_user_id uuid references users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 6) Billing plans, free / discount / manual permission overrides
create table if not exists billing_plans (
  code text primary key,
  name text not null,
  description text,
  monthly_price int not null default 0,
  billing_scope text not null default 'organization',
  included_members int,
  entitlements jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into billing_plans(code,name,description,monthly_price,billing_scope,included_members,entitlements,sort_order) values
 ('pilot','Pilot 測試','第一批合作夥伴測試方案，管理員可自由設定免費期限。',0,'organization',10,'{"daily_leads":999,"portfolio_limit":100,"boost":false}'::jsonb,10),
 ('standard','標準方案','正式收費方案，價格可由平台後台調整。',0,'organization',5,'{"daily_leads":30,"portfolio_limit":30,"boost":false}'::jsonb,20),
 ('pro','Pro 方案','較高曝光與更完整權限，價格可由平台後台調整。',0,'organization',20,'{"daily_leads":999,"portfolio_limit":100,"boost":true}'::jsonb,30)
on conflict(code) do update set name=excluded.name,description=excluded.description,billing_scope=excluded.billing_scope,included_members=excluded.included_members,entitlements=excluded.entitlements,sort_order=excluded.sort_order,updated_at=now();

alter table subscriptions add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table subscriptions add column if not exists custom_monthly_price int;
alter table subscriptions add column if not exists discount_percent numeric(5,2) not null default 0;
alter table subscriptions add column if not exists free_until timestamptz;
alter table subscriptions add column if not exists comped_forever boolean not null default false;
alter table subscriptions add column if not exists admin_note text;
alter table subscriptions add column if not exists entitlements jsonb not null default '{}'::jsonb;
alter table subscriptions add column if not exists next_billing_at timestamptz;

create table if not exists access_overrides (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check(subject_type in ('organization','provider')),
  subject_id uuid not null,
  feature_key text not null,
  value jsonb not null,
  starts_at timestamptz,
  ends_at timestamptz,
  note text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(subject_type,subject_id,feature_key)
);

-- Create a pilot subscription for current providers if they don't have one.
insert into subscriptions(user_id,organization_id,plan_code,status,current_period_start,current_period_end,free_until,admin_note)
select dp.user_id,dp.organization_id,'pilot','trial',now(),now()+interval '90 days',now()+interval '90 days','R0.6 自動建立 Pilot 測試方案'
from designer_profiles dp
where not exists(select 1 from subscriptions s where s.user_id=dp.user_id or (dp.organization_id is not null and s.organization_id=dp.organization_id));

-- 7) Scalable indexes for hundreds / thousands of accounts
create index if not exists idx_users_role_status_created on users(role,account_status,created_at desc);
create index if not exists idx_users_email_lower on users(lower(email));
create index if not exists idx_org_name_lower on organizations(lower(name));
create index if not exists idx_org_status_created on organizations(status,created_at desc);
create index if not exists idx_org_members_user on organization_memberships(user_id,status);
create index if not exists idx_provider_app_status_submitted on provider_applications(application_status,submitted_at desc);
create index if not exists idx_provider_categories_category on provider_categories(category_id,user_id);
create index if not exists idx_demands_category_status on demands(category_key,status,created_at desc);
create index if not exists idx_service_items_category on service_items(category_key,is_active,created_at);
create index if not exists idx_subscriptions_org_status on subscriptions(organization_id,status,updated_at desc);
create index if not exists idx_subscriptions_user_status on subscriptions(user_id,status,updated_at desc);
create index if not exists idx_admin_audit_created on admin_audit_logs(created_at desc);
create index if not exists idx_users_display_name_trgm on users using gin(display_name gin_trgm_ops);
create index if not exists idx_users_email_trgm on users using gin(email gin_trgm_ops);
create index if not exists idx_org_name_trgm on organizations using gin(name gin_trgm_ops);

-- 8) Optional helper view for the admin command center
create or replace view admin_provider_directory as
select
  u.id as user_id,u.display_name,u.email,u.phone,u.avatar_url,u.account_status,u.created_at,
  dp.approval_status::text as approval_status,dp.onboarding_completed,dp.years_experience,dp.is_accepting_now,dp.specialties,
  dp.organization_id,coalesce(o.name,'個人工作者') organization_name,coalesce(o.address,'') organization_address,
  coalesce(pa.application_status,'draft') application_status,pa.submitted_at,
  coalesce(array_agg(distinct sc.key) filter(where sc.key is not null),'{}') category_keys,
  coalesce(array_agg(distinct sc.label) filter(where sc.label is not null),'{}') category_labels
from users u
join designer_profiles dp on dp.user_id=u.id
left join organizations o on o.id=dp.organization_id
left join provider_applications pa on pa.user_id=u.id
left join provider_categories pc on pc.user_id=u.id
left join service_categories sc on sc.id=pc.category_id
where u.role in ('designer','salon_owner')
group by u.id,dp.user_id,dp.approval_status,dp.onboarding_completed,dp.years_experience,dp.is_accepting_now,dp.specialties,dp.organization_id,o.name,o.address,pa.application_status,pa.submitted_at;

-- Generic customer condition/details field (hair length remains for backwards compatibility)
alter table demands add column if not exists condition_text text;
