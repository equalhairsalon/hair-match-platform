import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';
const schema=z.object({key:z.string().min(1).max(40),isActive:z.boolean()});
export async function POST(req:Request){const a=await getSession();if(a?.role!=='admin')return NextResponse.json({ok:false,message:'僅限平台管理員'},{status:403});try{const i=schema.parse(await req.json());await query(`update service_categories set is_active=$2,updated_at=now() where key=$1`,[i.key,i.isActive]);await query(`insert into admin_audit_logs(admin_user_id,action,target_type,target_id,detail) values($1,'toggle_category','service_category',$2,jsonb_build_object('active',$3))`,[a.id,i.key,i.isActive]);return NextResponse.json({ok:true})}catch(e:any){return NextResponse.json({ok:false,message:e?.message||'分類更新失敗'},{status:400})}}
