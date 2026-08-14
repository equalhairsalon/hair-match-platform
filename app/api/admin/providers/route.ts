import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query, transaction } from '@/lib/server-db';

const schema=z.object({userId:z.string().uuid(),action:z.enum(['approve','reject','pending','suspend','activate']),note:z.string().max(800).optional().default('')});
async function admin(){const s=await getSession();return s?.role==='admin'?s:null}

export async function POST(req:Request){
 const a=await admin();if(!a)return NextResponse.json({ok:false,message:'僅限平台管理員'},{status:403});
 try{
  const i=schema.parse(await req.json());
  await transaction(async c=>{
    if(i.action==='suspend'||i.action==='activate'){
      await c.query(`update users set account_status=$2::account_status,updated_at=now() where id=$1`,[i.userId,i.action==='suspend'?'suspended':'active']);
    }else{
      const status=i.action==='approve'?'approved':i.action==='reject'?'rejected':'pending';
      await c.query(`update designer_profiles set approval_status=$2::designer_approval_status,approval_note=$3,approved_at=case when $2='approved' then now() else null end,approved_by=case when $2='approved' then $4 else null end,updated_at=now() where user_id=$1`,[i.userId,status,i.note,a.id]);
      await c.query(`insert into provider_applications(user_id,application_status,submitted_at,reviewed_at,reviewed_by,review_note,updated_at) values($1,$2,now(),now(),$3,$4,now()) on conflict(user_id) do update set application_status=excluded.application_status,reviewed_at=now(),reviewed_by=$3,review_note=$4,updated_at=now()`,[i.userId,status,a.id,i.note]);
      await c.query(`insert into notifications(user_id,type,title,body,data) values($1,'approval',$2,$3,jsonb_build_object('status',$4))`,[i.userId,status==='approved'?'平台審核通過':status==='rejected'?'資料需要補件':'審核狀態更新',status==='approved'?'你的服務頁已開放，顧客現在可以搜尋你。':(i.note||'請更新資料後重新送審。'),status]);
    }
    await c.query(`insert into admin_audit_logs(admin_user_id,action,target_type,target_id,detail) values($1,$2,'provider',$3,jsonb_build_object('note',$4))`,[a.id,i.action,i.userId,i.note]);
  });
  return NextResponse.json({ok:true});
 }catch(e:any){return NextResponse.json({ok:false,message:e?.issues?.[0]?.message||e?.message||'操作失敗'},{status:400})}
}
