import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query, transaction } from '@/lib/server-db';

const schema=z.object({body:z.string().trim().min(1).max(1200),imageUrl:z.string().url().nullable().optional()});
async function getConversation(id:string,userId:string){
 const r=await query(`select c.*,cu.display_name customer_name,du.display_name designer_name,d.service_label from conversations c join users cu on cu.id=c.customer_user_id join users du on du.id=c.designer_user_id left join demands d on d.id=c.demand_id where c.id=$1 and (c.customer_user_id=$2 or c.designer_user_id=$2) limit 1`,[id,userId]);return r.rows[0] as any;
}
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();if(!s)return NextResponse.json({ok:false,message:'請先登入'},{status:401});const {id}=await params;const c=await getConversation(id,s.id);if(!c)return NextResponse.json({ok:false,message:'找不到對話'},{status:404});
 const m=await query(`select m.id,m.body,m.image_url,m.sender_user_id,m.receiver_user_id,m.read_at,m.created_at,u.display_name sender_name,u.avatar_url sender_avatar from messages m join users u on u.id=m.sender_user_id where m.conversation_id=$1 order by m.created_at asc limit 500`,[id]);
 await query(`update messages set read_at=coalesce(read_at,now()) where conversation_id=$1 and receiver_user_id=$2 and read_at is null`,[id,s.id]);
 return NextResponse.json({ok:true,conversation:c,messages:m.rows,currentUserId:s.id});
}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();if(!s)return NextResponse.json({ok:false,message:'請先登入'},{status:401});const {id}=await params;const c=await getConversation(id,s.id);if(!c)return NextResponse.json({ok:false,message:'找不到對話'},{status:404});
 try{const i=schema.parse(await req.json());const receiver=s.id===c.customer_user_id?c.designer_user_id:c.customer_user_id;const result=await transaction(async client=>{const m=await client.query(`insert into messages(conversation_id,demand_id,sender_user_id,receiver_user_id,body,image_url) values($1,$2,$3,$4,$5,$6) returning id,created_at`,[id,c.demand_id,s.id,receiver,i.body,i.imageUrl??null]);await client.query(`update conversations set updated_at=now() where id=$1`,[id]);await client.query(`insert into notifications(user_id,type,title,body,data) values($1,'message','你有一則新訊息',$2,jsonb_build_object('conversationId',$3))`,[receiver,i.body.slice(0,120),id]);return m.rows[0]});return NextResponse.json({ok:true,message:result},{status:201})}
 catch(e:any){return NextResponse.json({ok:false,message:e?.issues?.[0]?.message||e?.message||'訊息傳送失敗'},{status:400})}
}
