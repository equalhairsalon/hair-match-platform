import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query, transaction } from '@/lib/server-db';

const schema=z.object({
  salonName:z.string().min(1).max(100),
  address:z.string().min(2).max(250),
  bio:z.string().max(1000).default(''),
  yearsExperience:z.number().int().min(0).max(80),
  specialties:z.array(z.string()).max(12),
  radiusKm:z.number().min(.5).max(50),
  isAcceptingNow:z.boolean().default(true),
  instagram:z.string().max(120).optional().default(''),
  lat:z.number().min(-90).max(90).nullable().optional(),
  lng:z.number().min(-180).max(180).nullable().optional(),
  avatarUrl:z.string().url().nullable().optional(),
  coverUrl:z.string().url().nullable().optional(),
});

function canManage(role:string){return ['designer','salon_owner','admin'].includes(role)}

export async function GET(){
  const session=await getSession();
  if(!session || !canManage(session.role)) return NextResponse.json({ok:false,message:'請使用設計師帳號登入'},{status:403});
  const r=await query(`select u.id,u.display_name,u.avatar_url,dp.bio,dp.years_experience,dp.specialties,dp.service_radius_km,dp.is_accepting_now,dp.onboarding_completed,
    coalesce(s.name,'') salon_name,coalesce(s.address,'') address,coalesce(s.instagram,'') instagram,s.lat,s.lng,s.cover_url
    from users u join designer_profiles dp on dp.user_id=u.id left join salons s on s.id=dp.salon_id where u.id=$1 limit 1`,[session.id]);
  return NextResponse.json({ok:true,profile:r.rows[0]||null});
}

export async function POST(req:Request){
  const session=await getSession();if(!session || !canManage(session.role)) return NextResponse.json({ok:false,message:'請使用設計師帳號登入'},{status:403});
  try{
    const i=schema.parse(await req.json());
    await transaction(async c=>{
      const existing=await c.query(`select salon_id from designer_profiles where user_id=$1`,[session.id]); let salonId=existing.rows[0]?.salon_id as string|undefined;
      if(!salonId){
        const s=await c.query(`insert into salons(owner_user_id,name,address,instagram,lat,lng,cover_url) values($1,$2,$3,$4,$5,$6,$7) returning id`,[session.id,i.salonName,i.address,i.instagram,i.lat??null,i.lng??null,i.coverUrl??null]);
        salonId=s.rows[0].id;
      } else {
        await c.query(`update salons set name=$2,address=$3,instagram=$4,lat=$5,lng=$6,cover_url=coalesce($7,cover_url),updated_at=now() where id=$1`,[salonId,i.salonName,i.address,i.instagram,i.lat??null,i.lng??null,i.coverUrl??null]);
      }
      await c.query(`update users set avatar_url=coalesce($2,avatar_url),updated_at=now() where id=$1`,[session.id,i.avatarUrl??null]);
      await c.query(`insert into designer_profiles(user_id,salon_id,bio,years_experience,specialties,service_radius_km,is_accepting_now,onboarding_completed) values($1,$2,$3,$4,$5,$6,$7,true)
        on conflict(user_id) do update set salon_id=excluded.salon_id,bio=excluded.bio,years_experience=excluded.years_experience,specialties=excluded.specialties,service_radius_km=excluded.service_radius_km,is_accepting_now=excluded.is_accepting_now,onboarding_completed=true,updated_at=now()`,[session.id,salonId,i.bio,i.yearsExperience,i.specialties,i.radiusKm,i.isAcceptingNow]);
    });
    return NextResponse.json({ok:true});
  }catch(error:any){return NextResponse.json({ok:false,message:error?.issues?.[0]?.message||error?.message||'儲存失敗'},{status:400})}
}
