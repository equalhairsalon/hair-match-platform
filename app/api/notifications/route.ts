import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';

export async function GET(){
  const s=await getSession();if(!s)return NextResponse.json({ok:false,message:'請先登入'},{status:401});
  const r=await query(`select id,type,title,body,data,read_at,created_at from notifications where user_id=$1 order by created_at desc limit 100`,[s.id]);
  const c=await query<{count:number}>(`select count(*)::int count from notifications where user_id=$1 and read_at is null`,[s.id]);
  return NextResponse.json({ok:true,items:r.rows,unread:c.rows[0]?.count||0});
}

export async function PATCH(){
  const s=await getSession();if(!s)return NextResponse.json({ok:false,message:'請先登入'},{status:401});
  await query(`update notifications set read_at=coalesce(read_at,now()) where user_id=$1`,[s.id]);
  return NextResponse.json({ok:true});
}
