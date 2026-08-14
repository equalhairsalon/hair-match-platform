import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query, transaction } from '@/lib/server-db';

const actionSchema=z.object({userId:z.string().uuid(),status:z.enum(['approved','rejected','pending']),note:z.string().max(600).optional().default('')});

async function requireAdmin(){const s=await getSession();return s?.role==='admin'?s:null}

export async function GET(){
  const admin=await requireAdmin();if(!admin)return NextResponse.json({ok:false,message:'僅限平台管理員'},{status:403});
  const r=await query(`select u.id,u.display_name,u.email,u.avatar_url,u.created_at,dp.approval_status,dp.approval_note,dp.submitted_at,dp.years_experience,dp.specialties,dp.onboarding_completed,
    coalesce(s.name,'獨立設計師') salon_name,coalesce(s.address,'') address,
    (select count(*)::int from portfolio_items p where p.designer_user_id=u.id) portfolio_count,
    (select count(*)::int from service_items si where si.designer_user_id=u.id and si.is_active=true) service_count
    from users u join designer_profiles dp on dp.user_id=u.id left join salons s on s.id=dp.salon_id
    where u.role in ('designer','salon_owner') and u.account_status='active'
    order by case dp.approval_status when 'pending' then 0 when 'rejected' then 1 else 2 end,coalesce(dp.submitted_at,u.created_at) desc limit 300`);
  return NextResponse.json({ok:true,items:r.rows});
}

export async function POST(req:Request){
  const admin=await requireAdmin();if(!admin)return NextResponse.json({ok:false,message:'僅限平台管理員'},{status:403});
  try{
    const i=actionSchema.parse(await req.json());
    const result=await transaction(async c=>{
      const current=await c.query(`select u.display_name,dp.approval_status from users u join designer_profiles dp on dp.user_id=u.id where u.id=$1 for update`,[i.userId]);
      if(!current.rows[0])throw new Error('找不到設計師');
      await c.query(`update designer_profiles set approval_status=$2::designer_approval_status,approval_note=$3,approved_at=case when $2='approved' then now() else null end,approved_by=case when $2='approved' then $4 else null end,updated_at=now() where user_id=$1`,[i.userId,i.status,i.note,admin.id]);
      const title=i.status==='approved'?'設計師帳號審核通過':i.status==='rejected'?'設計師帳號需要補件':'審核狀態已更新';
      const body=i.status==='approved'?'你的公開頁已開放，附近顧客可以搜尋並邀請你報價。':(i.note||'請補充作品、價目或店家資料後再送審。');
      await c.query(`insert into notifications(user_id,type,title,body,data) values($1,'approval',$2,$3,jsonb_build_object('status',$4))`,[i.userId,title,body,i.status]);
      return current.rows[0];
    });
    return NextResponse.json({ok:true,item:result});
  }catch(e:any){return NextResponse.json({ok:false,message:e?.issues?.[0]?.message||e?.message||'更新審核失敗'},{status:400})}
}
