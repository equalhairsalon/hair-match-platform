import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';
const schema=z.object({targetUserId:z.string().uuid(),reason:z.enum(['profile','price','communication','safety','spam','other']),detail:z.string().max(1000).optional().default('')});
export async function POST(req:Request){
  const s=await getSession();if(!s)return NextResponse.json({ok:false,message:'請先登入'},{status:401});
  try{const i=schema.parse(await req.json());if(i.targetUserId===s.id)return NextResponse.json({ok:false,message:'無法檢舉自己'},{status:400});
    await query(`insert into reports(reporter_user_id,target_user_id,target_type,reason,detail) values($1,$2,'designer',$3,$4)`,[s.id,i.targetUserId,i.reason,i.detail]);
    return NextResponse.json({ok:true},{status:201});
  }catch(e:any){return NextResponse.json({ok:false,message:e?.issues?.[0]?.message||e?.message||'送出失敗'},{status:400})}
}
