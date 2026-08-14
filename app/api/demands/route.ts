import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';

const createSchema=z.object({serviceKey:z.string().min(1),serviceLabel:z.string().min(1),when:z.enum(['now','scheduled']),desiredStart:z.string().nullable().optional(),budgetMin:z.number().int().nonnegative(),budgetMax:z.number().int().nonnegative(),locationText:z.string().min(2),lat:z.number().nullable().optional(),lng:z.number().nullable().optional(),hairLength:z.string().optional().default(''),notes:z.string().max(1200).optional().default(''),photoUrls:z.array(z.string().url()).max(6).optional().default([]),maxRadiusKm:z.number().min(.5).max(50).optional().default(5)});

export async function GET(req:Request){
  const session=await getSession();
  if(!session) return NextResponse.json({ok:false,message:'請先登入'},{status:401});
  const url=new URL(req.url);const scope=url.searchParams.get('scope')||'mine';
  if(scope==='open' && ['designer','salon_owner','admin'].includes(session.role)){
    const prof=await query(`select dp.service_radius_km,s.lat,s.lng from designer_profiles dp left join salons s on s.id=dp.salon_id where dp.user_id=$1`,[session.id]);
    const p:any=prof.rows[0];const hasGeo=Number.isFinite(Number(p?.lat))&&Number.isFinite(Number(p?.lng));
    if(hasGeo){
      const rows=await query(`select * from (select d.*,u.display_name customer_name,(select count(*)::int from quotes q where q.demand_id=d.id) quote_count,
        case when d.lat is not null and d.lng is not null then round((6371 * acos(least(1,greatest(-1, sin(radians($1::double precision))*sin(radians(d.lat)) + cos(radians($1::double precision))*cos(radians(d.lat))*cos(radians(d.lng)-radians($2::double precision))))))::numeric,1) else null end distance_km
        from demands d left join users u on u.id=d.customer_user_id where d.status='collecting' and (d.expires_at is null or d.expires_at>now())) x
        where x.distance_km is null or x.distance_km <= least($3::numeric,coalesce(x.max_radius_km,$3::numeric)) order by x.distance_km asc nulls last,x.created_at desc limit 100`,[Number(p.lat),Number(p.lng),Number(p.service_radius_km||5)]);
      return NextResponse.json({ok:true,demands:rows.rows,geoApplied:true});
    }
    const rows=await query(`select d.*,u.display_name customer_name,(select count(*)::int from quotes q where q.demand_id=d.id) quote_count,null::numeric distance_km from demands d left join users u on u.id=d.customer_user_id where d.status='collecting' and (d.expires_at is null or d.expires_at>now()) order by d.created_at desc limit 100`);
    return NextResponse.json({ok:true,demands:rows.rows,geoApplied:false});
  }
  const rows=await query(`select d.*,(select count(*)::int from quotes q where q.demand_id=d.id) quote_count from demands d where d.customer_user_id=$1 order by d.created_at desc limit 100`,[session.id]);
  return NextResponse.json({ok:true,demands:rows.rows});
}

export async function POST(req:Request){
  const session=await getSession();
  if(!session) return NextResponse.json({ok:false,code:'AUTH_REQUIRED',message:'發布需求前請先登入。'},{status:401});
  if(session.role!=='customer' && session.role!=='admin') return NextResponse.json({ok:false,message:'目前帳號不是顧客身分。'},{status:403});
  try{
    const i=createSchema.parse(await req.json());
    const desired=i.when==='now'?new Date().toISOString():i.desiredStart||null;
    const result=await query<{id:string}>(`insert into demands(customer_user_id,service_key,service_label,desired_start,budget_min,budget_max,location_text,lat,lng,max_radius_km,hair_length,notes,expires_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now()+interval '24 hours') returning id`,[session.id,i.serviceKey,i.serviceLabel,desired,i.budgetMin,i.budgetMax,i.locationText,i.lat??null,i.lng??null,i.maxRadiusKm,i.hairLength,i.notes]);
    const id=result.rows[0].id;
    for(let n=0;n<i.photoUrls.length;n++) await query(`insert into demand_photos(demand_id,image_url,sort_order) values($1,$2,$3)`,[id,i.photoUrls[n],n]);
    return NextResponse.json({ok:true,id},{status:201});
  }catch(error:any){return NextResponse.json({ok:false,message:error?.issues?.[0]?.message||error?.message||'發布失敗'},{status:400})}
}
