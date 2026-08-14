import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { transaction } from '@/lib/server-db';
import { assertAuthConfigured, setSession } from '@/lib/auth';

const schema=z.object({displayName:z.string().min(2).max(60),email:z.string().email(),password:z.string().min(8).max(100),role:z.enum(['customer','designer'])});

export async function POST(req:Request){
  try{
    // Fail before touching the database, so a missing secret cannot create an orphan account.
    assertAuthConfigured();
    const input=schema.parse(await req.json());
    const hash=await bcrypt.hash(input.password,12);
    const u=await transaction(async c=>{
      const result=await c.query<{id:string;display_name:string;email:string;role:'customer'|'designer'}>(
        `insert into users(display_name,email,password_hash,role) values($1,lower($2),$3,$4) returning id,display_name,email,role`,
        [input.displayName,input.email,hash,input.role]
      );
      const user=result.rows[0];
      if(input.role==='designer'){
        await c.query(`insert into designer_profiles(user_id,provider_kind) values($1,'individual') on conflict(user_id) do nothing`,[user.id]);
        await c.query(`insert into provider_applications(user_id,application_status,completeness_score) values($1,'draft',10) on conflict(user_id) do nothing`,[user.id]);
        await c.query(`insert into subscriptions(user_id,plan_code,status,current_period_start,current_period_end,free_until,admin_note) values($1,'pilot','trial',now(),now()+interval '90 days',now()+interval '90 days','新服務者 Pilot 試用')`,[user.id]);
      }
      return user;
    });
    await setSession({id:u.id,role:u.role,displayName:u.display_name,email:u.email});
    return NextResponse.json({ok:true,user:{id:u.id,displayName:u.display_name,email:u.email,role:u.role}});
  }catch(error:any){
    const duplicate=error?.code==='23505';
    return NextResponse.json({ok:false,message:duplicate?'這個 Email 已經註冊。':error?.issues?.[0]?.message||error?.message||'註冊失敗'},{status:duplicate?409:400});
  }
}
