import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { hasDatabase, query } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

type CheckResult = {
  name: string;
  ok: boolean;
  detail?: string;
};

async function runCheck(name: string, sql: string, params: unknown[] = []): Promise<CheckResult> {
  try {
    await query(sql, params);
    return { name, ok: true };
  } catch (error) {
    console.error(`[admin-diagnostics:${name}]`, error);
    return {
      name,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  if (!hasDatabase()) {
    return NextResponse.json(
      {
        ok: false,
        version: '0.6.9',
        databaseUrlConfigured: false,
        authSecretConfigured: Boolean(process.env.AUTH_SECRET),
        error: 'DATABASE_URL is not configured',
      },
      { status: 503 },
    );
  }

  const tableNames = [
    'users',
    'platform_admins',
    'organizations',
    'provider_applications',
    'service_categories',
    'provider_categories',
    'subscriptions',
    'demands',
    'bookings',
    'reports',
    'designer_profiles',
  ];

  const tableChecks: CheckResult[] = [];
  for (const name of tableNames) {
    try {
      const r = await query<{ table_name: string | null }>(
        `select to_regclass($1) as table_name`,
        [`public.${name}`],
      );
      tableChecks.push({
        name: `table:${name}`,
        ok: Boolean(r.rows[0]?.table_name),
        detail: r.rows[0]?.table_name ? undefined : 'missing',
      });
    } catch (error) {
      tableChecks.push({
        name: `table:${name}`,
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const queryChecks = await Promise.all([
    runCheck(
      'admin-identity',
      `select u.role,u.account_status,pa.admin_level,pa.is_active
       from users u
       left join platform_admins pa on pa.user_id=u.id
       where u.id=$1 limit 1`,
      [session.id],
    ),
    runCheck(
      'dashboard-stats',
      `select
        (select count(*)::int from users where role='customer' and account_status='active') customers,
        (select count(*)::int from users where role in ('designer','salon_owner') and account_status='active') providers,
        (select count(*)::int from organizations where status='active') organizations,
        (select count(*)::int from provider_applications where application_status='pending') pending,
        (select count(*)::int from demands where created_at>=current_date) today_demands,
        (select count(*)::int from bookings where created_at>=current_date) today_bookings,
        (select count(*)::int from reports where status='open') open_reports`,
    ),
    runCheck(
      'dashboard-categories',
      `select sc.key,sc.label,sc.is_active,count(pc.user_id)::int providers
       from service_categories sc
       left join provider_categories pc on pc.category_id=sc.id
       group by sc.id
       order by sc.sort_order`,
    ),
    runCheck(
      'dashboard-recent-providers',
      `select pa.user_id,u.display_name,u.email,coalesce(o.name,'個人工作者') organization_name,
              pa.application_status,pa.submitted_at,
              coalesce(array_agg(distinct sc.label) filter(where sc.label is not null),'{}') category_labels
       from provider_applications pa
       join users u on u.id=pa.user_id
       left join designer_profiles dp on dp.user_id=u.id
       left join organizations o on o.id=dp.organization_id
       left join provider_categories pc on pc.user_id=u.id
       left join service_categories sc on sc.id=pc.category_id
       group by pa.user_id,u.display_name,u.email,o.name,pa.application_status,pa.submitted_at
       order by coalesce(pa.submitted_at,u.created_at) desc
       limit 8`,
    ),
    runCheck(
      'dashboard-billing',
      `select
        count(*) filter(where status='active')::int active,
        count(*) filter(where status='trial')::int trial,
        count(*) filter(where status='past_due')::int past_due,
        count(*) filter(where comped_forever=true)::int comped
       from subscriptions`,
    ),
  ]);

  const checks = [...tableChecks, ...queryChecks];
  const failed = checks.filter((x) => !x.ok);

  return NextResponse.json(
    {
      ok: failed.length === 0,
      version: '0.6.9',
      databaseUrlConfigured: true,
      authSecretConfigured: Boolean(process.env.AUTH_SECRET),
      session: {
        id: session.id,
        role: session.role,
        email: session.email || null,
      },
      checks,
      failedCount: failed.length,
    },
    { status: failed.length === 0 ? 200 : 503 },
  );
}
