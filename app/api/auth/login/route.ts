import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '@/lib/server-db';
import { setSession } from '@/lib/auth';

const schema=z.object({email:z.string().email(),password:z.string().min(1)});
export async function POST(req:Request){
  try{
    const input=schema.parse(await req.json());
    const result=await query<{id:string;display_name:string;email:string;role:'customer'|'designer'|'salon_owner'|'admin';password_hash:string|null}>(
      `select id,display_name,email,role,password_hash from users where email=lower($1) limit 1`,[input.email]);
    const u=result.rows[0];
    if(!u?.password_hash || !(await bcrypt.compare(input.password,u.password_hash))) return NextResponse.json({ok:false,message:'Email 或密碼不正確。'},{status:401});
    await setSession({id:u.id,role:u.role,displayName:u.display_name,email:u.email});
    return NextResponse.json({ok:true,user:{id:u.id,displayName:u.display_name,email:u.email,role:u.role}});
  }catch(error:any){return NextResponse.json({ok:false,message:error?.message||'登入失敗'},{status:400})}
}
