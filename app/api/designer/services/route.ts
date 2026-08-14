import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';

const createSchema=z.object({serviceKey:z.string().min(1).max(40),label:z.string().min(1).max(80),description:z.string().max(500).optional().default(''),priceFrom:z.number().int().nonnegative(),priceTo:z.number().int().nonnegative().nullable().optional(),durationMin:z.number().int().min(10).max(720).nullable().optional()});
const deleteSchema=z.object({id:z.string().uuid()});
function canManage(role:string){return ['designer','salon_owner','admin'].includes(role)}

export async function GET(){
 const s=await getSession();if(!s||!canManage(s.role))return NextResponse.json({ok:false,message:'請使用設計師帳號登入'},{status:403});
 const r=await query(`select id,service_key,label,description,price_from,price_to,duration_min,is_active,created_at from service_items where designer_user_id=$1 order by is_active desc,created_at`,[s.id]);
 return NextResponse.json({ok:true,items:r.rows});
}

export async function POST(req:Request){
 const s=await getSession();if(!s||!canManage(s.role))return NextResponse.json({ok:false,message:'請使用設計師帳號登入'},{status:403});
 try{const i=createSchema.parse(await req.json());const r=await query<{id:string}>(`insert into service_items(designer_user_id,service_key,label,description,price_from,price_to,duration_min,is_active) values($1,$2,$3,$4,$5,$6,$7,true) returning id`,[s.id,i.serviceKey,i.label,i.description,i.priceFrom,i.priceTo??null,i.durationMin??null]);return NextResponse.json({ok:true,id:r.rows[0].id},{status:201})}
 catch(e:any){return NextResponse.json({ok:false,message:e?.issues?.[0]?.message||e?.message||'新增服務失敗'},{status:400})}
}

export async function DELETE(req:Request){
 const s=await getSession();if(!s||!canManage(s.role))return NextResponse.json({ok:false,message:'請使用設計師帳號登入'},{status:403});
 try{const i=deleteSchema.parse(await req.json());await query(`update service_items set is_active=false where id=$1 and designer_user_id=$2`,[i.id,s.id]);return NextResponse.json({ok:true})}
 catch(e:any){return NextResponse.json({ok:false,message:e?.message||'停用服務失敗'},{status:400})}
}
