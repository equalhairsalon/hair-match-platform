import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';
const schema=z.object({price:z.number().int().positive(),availableAt:z.string().min(3),message:z.string().min(3).max(1200),included:z.array(z.string()).max(10).default([]),workImages:z.array(z.string().url()).max(5).default([])});

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getSession(); if(!session) return NextResponse.json({ok:false,message:'請先登入'},{status:401});
  const {id}=await params;
  const d=await query<{customer_user_id:string}>(`select customer_user_id from demands where id=$1`,[id]);
  if(!d.rows[0]) return NextResponse.json({ok:false,message:'找不到需求'},{status:404});
  if(session.role==='customer' && d.rows[0].customer_user_id!==session.id) return NextResponse.json({ok:false,message:'無權查看'},{status:403});
  const q=await query(`select q.*,u.display_name designer_name,u.avatar_url,coalesce(s.name,'獨立設計師') salon_name,coalesce(dp.avg_rating,0) rating,coalesce(dp.completed_count,0) completed_count from quotes q join users u on u.id=q.designer_user_id left join designer_profiles dp on dp.user_id=u.id left join salons s on s.id=dp.salon_id where q.demand_id=$1 order by q.created_at desc`,[id]);
  return NextResponse.json({ok:true,quotes:q.rows});
}

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getSession(); if(!session) return NextResponse.json({ok:false,message:'請先登入'},{status:401});
  if(!['designer','salon_owner','admin'].includes(session.role)) return NextResponse.json({ok:false,message:'只有設計師可以報價'},{status:403});
  try{
    const {id}=await params; const i=schema.parse(await req.json());
    const demand=await query<{customer_user_id:string;service_label:string;distance_km:number|null;service_radius_km:number|null;max_radius_km:number|null}>(`select d.customer_user_id,d.service_label,d.max_radius_km,dp.service_radius_km,
      case when d.lat is not null and d.lng is not null and s.lat is not null and s.lng is not null then round((6371 * acos(least(1,greatest(-1, sin(radians(s.lat))*sin(radians(d.lat)) + cos(radians(s.lat))*cos(radians(d.lat))*cos(radians(d.lng)-radians(s.lng))))))::numeric,1) else null end distance_km
      from demands d join designer_profiles dp on dp.user_id=$2 left join salons s on s.id=dp.salon_id where d.id=$1 and d.status='collecting' limit 1`,[id,session.id]);
    if(!demand.rows[0]) return NextResponse.json({ok:false,message:'需求已關閉或不存在'},{status:404});
    const match=demand.rows[0];
    const allowedRadius=Math.min(Number(match.service_radius_km||50),Number(match.max_radius_km||50));
    if(match.distance_km!=null && Number(match.distance_km)>allowedRadius && session.role!=='admin') return NextResponse.json({ok:false,message:`此需求距離約 ${Number(match.distance_km).toFixed(1)} km，超出媒合半徑。`},{status:403});
    const r=await query<{id:string}>(`insert into quotes(demand_id,designer_user_id,price,available_at,message,included_items,work_images) values($1,$2,$3,$4,$5,$6,$7) on conflict(demand_id,designer_user_id) do update set price=excluded.price,available_at=excluded.available_at,message=excluded.message,included_items=excluded.included_items,work_images=excluded.work_images,status='sent',created_at=now() returning id`,[id,session.id,i.price,i.availableAt,i.message,i.included,i.workImages]);
    await query(`insert into notifications(user_id,type,title,body,data) values($1,'quote','收到新的設計師報價',$2,jsonb_build_object('demandId',$3,'quoteId',$4))`,[match.customer_user_id,`${session.displayName} 已針對 ${match.service_label} 提出方案`,id,r.rows[0].id]);
    return NextResponse.json({ok:true,id:r.rows[0].id},{status:201});
  }catch(error:any){return NextResponse.json({ok:false,message:error?.issues?.[0]?.message||error?.message||'報價失敗'},{status:400})}
}
