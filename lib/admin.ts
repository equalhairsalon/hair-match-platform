import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';

export async function requireAdmin(){
  const s=await getSession();
  if(!s) redirect('/auth?next=/admin');

  // Never rely only on the role embedded in an older cookie. Neon is authoritative.
  const r=await query<{
    role:string;
    account_status:string;
    admin_level:string;
    admin_active:boolean;
  }>(`select u.role,u.account_status,pa.admin_level,pa.is_active admin_active
      from users u
      left join platform_admins pa on pa.user_id=u.id
      where u.id=$1
      limit 1`,[s.id]);
  const row=r.rows[0];
  if(!row || row.account_status!=='active' || row.role!=='admin' || !row.admin_active){
    redirect('/?admin=forbidden');
  }
  return {...s,role:'admin' as const,adminLevel:row.admin_level||'super_admin'};
}

export function pageNumber(v:string|undefined){const n=Number(v||1);return Number.isFinite(n)&&n>0?Math.floor(n):1;}
export function safeLike(v:string|undefined){return (v||'').trim().slice(0,100);}
