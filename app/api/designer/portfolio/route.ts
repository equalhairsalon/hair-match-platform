import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';

const createSchema=z.object({imageUrl:z.string().url(),serviceKey:z.string().max(40).optional().default(''),caption:z.string().max(300).optional().default('')});
const deleteSchema=z.object({id:z.string().uuid()});
function canManage(role:string){return ['designer','salon_owner','admin'].includes(role)}

export async function GET(){
 const s=await getSession();if(!s||!canManage(s.role))return NextResponse.json({ok:false,message:'請使用設計師帳號登入'},{status:403});
 const r=await query(`select id,image_url,service_key,caption,sort_order,created_at from portfolio_items where designer_user_id=$1 order by sort_order,created_at desc`,[s.id]);
 return NextResponse.json({ok:true,items:r.rows});
}

export async function POST(req:Request){
 const s=await getSession();if(!s||!canManage(s.role))return NextResponse.json({ok:false,message:'請使用設計師帳號登入'},{status:403});
 try{const i=createSchema.parse(await req.json());const r=await query<{id:string}>(`insert into portfolio_items(designer_user_id,image_url,service_key,caption,sort_order) values($1,$2,$3,$4,(select coalesce(max(sort_order),-1)+1 from portfolio_items where designer_user_id=$1)) returning id`,[s.id,i.imageUrl,i.serviceKey||null,i.caption]);return NextResponse.json({ok:true,id:r.rows[0].id},{status:201})}
 catch(e:any){return NextResponse.json({ok:false,message:e?.issues?.[0]?.message||e?.message||'新增作品失敗'},{status:400})}
}

export async function DELETE(req:Request){
 const s=await getSession();if(!s||!canManage(s.role))return NextResponse.json({ok:false,message:'請使用設計師帳號登入'},{status:403});
 try{const i=deleteSchema.parse(await req.json());await query(`delete from portfolio_items where id=$1 and designer_user_id=$2`,[i.id,s.id]);return NextResponse.json({ok:true})}
 catch(e:any){return NextResponse.json({ok:false,message:e?.message||'刪除作品失敗'},{status:400})}
}
