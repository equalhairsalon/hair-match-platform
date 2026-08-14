import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '@/lib/server-db';
import { setSession } from '@/lib/auth';

const schema=z.object({displayName:z.string().min(2).max(60),email:z.string().email(),password:z.string().min(8).max(100),role:z.enum(['customer','designer'])});
export async function POST(req:Request){
  try{
    const input=schema.parse(await req.json());
    const hash=await bcrypt.hash(input.password,12);
    const result=await query<{id:string;display_name:string;email:string;role:'customer'|'designer'}>(
      `insert into users(display_name,email,password_hash,role) values($1,lower($2),$3,$4)
       returning id,display_name,email,role`,[input.displayName,input.email,hash,input.role]);
    const u=result.rows[0];
    if(input.role==='designer') await query(`insert into designer_profiles(user_id) values($1) on conflict(user_id) do nothing`,[u.id]);
    await setSession({id:u.id,role:u.role,displayName:u.display_name,email:u.email});
    return NextResponse.json({ok:true,user:{id:u.id,displayName:u.display_name,email:u.email,role:u.role}});
  }catch(error:any){
    const duplicate=error?.code==='23505';
    return NextResponse.json({ok:false,message:duplicate?'這個 Email 已經註冊。':error?.issues?.[0]?.message||error?.message||'註冊失敗'},{status:duplicate?409:400});
  }
}
