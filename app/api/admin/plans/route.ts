import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';
const schema=z.object({code:z.string().min(1).max(40),name:z.string().min(1).max(80),monthlyPrice:z.number().int().nonnegative(),includedMembers:z.number().int().min(1).max(999).nullable().optional(),isActive:z.boolean()});
export async function POST(req:Request){const a=await getSession();if(a?.role!=='admin')return NextResponse.json({ok:false,message:'僅限平台管理員'},{status:403});try{const i=schema.parse(await req.json());await query(`update billing_plans set name=$2,monthly_price=$3,included_members=$4,is_active=$5,updated_at=now() where code=$1`,[i.code,i.name,i.monthlyPrice,i.includedMembers??null,i.isActive]);await query(`insert into admin_audit_logs(admin_user_id,action,target_type,target_id,detail) values($1,'update_plan','billing_plan',$2,jsonb_build_object('price',$3,'active',$4))`,[a.id,i.code,i.monthlyPrice,i.isActive]);return NextResponse.json({ok:true})}catch(e:any){return NextResponse.json({ok:false,message:e?.message||'方案更新失敗'},{status:400})}}
