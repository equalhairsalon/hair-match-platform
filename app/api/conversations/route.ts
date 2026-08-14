import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';

const createSchema=z.object({demandId:z.string().uuid(),designerUserId:z.string().uuid()});

export async function GET(){
 const s=await getSession();if(!s)return NextResponse.json({ok:false,message:'請先登入'},{status:401});
 const r=await query(`select c.id,c.demand_id,c.customer_user_id,c.designer_user_id,c.updated_at,
   case when c.customer_user_id=$1 then du.display_name else cu.display_name end other_name,
   case when c.customer_user_id=$1 then du.avatar_url else cu.avatar_url end other_avatar,
   d.service_label,
   (select body from messages m where m.conversation_id=c.id order by m.created_at desc limit 1) last_message,
   (select created_at from messages m where m.conversation_id=c.id order by m.created_at desc limit 1) last_message_at,
   (select count(*)::int from messages m where m.conversation_id=c.id and m.receiver_user_id=$1 and m.read_at is null) unread_count
   from conversations c
   join users cu on cu.id=c.customer_user_id join users du on du.id=c.designer_user_id left join demands d on d.id=c.demand_id
   where c.customer_user_id=$1 or c.designer_user_id=$1
   order by coalesce((select max(m.created_at) from messages m where m.conversation_id=c.id),c.updated_at,c.created_at) desc`,[s.id]);
 return NextResponse.json({ok:true,conversations:r.rows});
}

export async function POST(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({ok:false,message:'請先登入'},{status:401});
 try{
  const i=createSchema.parse(await req.json());
  const d=await query<{customer_user_id:string}>(`select customer_user_id from demands where id=$1`,[i.demandId]);
  if(!d.rows[0])return NextResponse.json({ok:false,message:'找不到需求'},{status:404});
  const customerId=d.rows[0].customer_user_id;
  const allowed=s.role==='admin'||s.id===customerId||s.id===i.designerUserId;
  if(!allowed)return NextResponse.json({ok:false,message:'無權建立此對話'},{status:403});
  if(s.id===customerId){
    const q=await query(`select 1 from quotes where demand_id=$1 and designer_user_id=$2 limit 1`,[i.demandId,i.designerUserId]);
    if(!q.rows[0])return NextResponse.json({ok:false,message:'收到設計師報價後才能開始聊天'},{status:400});
  }
  const ins=await query<{id:string}>(`insert into conversations(demand_id,customer_user_id,designer_user_id,updated_at) values($1,$2,$3,now()) on conflict(demand_id,customer_user_id,designer_user_id) do update set updated_at=now() returning id`,[i.demandId,customerId,i.designerUserId]);
  return NextResponse.json({ok:true,id:ins.rows[0].id});
 }catch(e:any){return NextResponse.json({ok:false,message:e?.issues?.[0]?.message||e?.message||'建立對話失敗'},{status:400})}
}
