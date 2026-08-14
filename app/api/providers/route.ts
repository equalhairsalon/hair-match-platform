import { NextResponse } from 'next/server';
import { query } from '@/lib/server-db';

export async function GET(req:Request){
  const url=new URL(req.url);const lat=Number(url.searchParams.get('lat'));const lng=Number(url.searchParams.get('lng'));const radius=Number(url.searchParams.get('radius')||20);const hasGeo=Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
  const params=hasGeo?[lat,lng,Math.max(.5,Math.min(50,radius))]:[];
  const distanceSql=hasGeo?`case when s.lat is not null and s.lng is not null then round((6371 * acos(least(1,greatest(-1, sin(radians($1::double precision))*sin(radians(s.lat)) + cos(radians($1::double precision))*cos(radians(s.lat))*cos(radians(s.lng)-radians($2::double precision))))))::numeric,1) else null end`:`null::numeric`;
  const sql=hasGeo?`select * from (select u.id,u.display_name name,u.avatar_url,coalesce(s.name,'獨立設計師') salon,coalesce(s.address,'') location,coalesce(s.cover_url,'') cover,coalesce(dp.avg_rating,0) rating,coalesce(dp.review_count,0) reviews,coalesce(dp.completed_count,0) completed,dp.is_accepting_now,dp.specialties,dp.bio,dp.service_radius_km,${distanceSql} distance_km from users u join designer_profiles dp on dp.user_id=u.id left join salons s on s.id=dp.salon_id where u.role in ('designer','salon_owner') and dp.onboarding_completed=true) p where p.distance_km is null or p.distance_km <= $3::numeric order by p.is_accepting_now desc,p.distance_km asc nulls last,p.rating desc limit 100`
  :`select u.id,u.display_name name,u.avatar_url,coalesce(s.name,'獨立設計師') salon,coalesce(s.address,'') location,coalesce(s.cover_url,'') cover,coalesce(dp.avg_rating,0) rating,coalesce(dp.review_count,0) reviews,coalesce(dp.completed_count,0) completed,dp.is_accepting_now,dp.specialties,dp.bio,dp.service_radius_km,null::numeric distance_km from users u join designer_profiles dp on dp.user_id=u.id left join salons s on s.id=dp.salon_id where u.role in ('designer','salon_owner') and dp.onboarding_completed=true order by dp.is_accepting_now desc,dp.avg_rating desc limit 100`;
  const r=await query(sql,params);
  return NextResponse.json({ok:true,providers:r.rows,geoApplied:hasGeo});
}
