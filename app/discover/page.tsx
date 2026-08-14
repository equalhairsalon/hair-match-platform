import { Filter, MapPin, SlidersHorizontal } from 'lucide-react';
import { Header, MobileNav } from '@/components/Header';
import { ProviderCard } from '@/components/ProviderCard';
import { LocationDiscoverButton } from '@/components/LocationDiscoverButton';
import { providers as demoProviders } from '@/lib/demo-data';
import { hasDatabase, query } from '@/lib/server-db';
import type { Provider } from '@/lib/types';

export default async function Discover({searchParams}:{searchParams:Promise<{lat?:string;lng?:string}>}){
 const sp=await searchParams;const lat=Number(sp.lat);const lng=Number(sp.lng);const hasGeo=Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
 let providers:Provider[]=demoProviders.map(x=>({...x,distanceKm:null}));
 if(hasDatabase()){
   try{
     const params=hasGeo?[lat,lng]:[];
     const distanceSql=hasGeo?`case when s.lat is not null and s.lng is not null then round((6371 * acos(least(1,greatest(-1, sin(radians($1::double precision))*sin(radians(s.lat)) + cos(radians($1::double precision))*cos(radians(s.lat))*cos(radians(s.lng)-radians($2::double precision))))))::numeric,1) else null end`:`null::numeric`;
     const r=await query(`select u.id,u.display_name,u.avatar_url,coalesce(s.name,'獨立設計師') salon,coalesce(s.address,'') location,coalesce(s.cover_url,'') cover,coalesce(s.instagram,'') instagram,coalesce(dp.avg_rating,0) rating,coalesce(dp.review_count,0) reviews,coalesce(dp.completed_count,0) completed,dp.is_accepting_now,dp.specialties,coalesce(dp.bio,'') bio,${distanceSql} distance_km from users u join designer_profiles dp on dp.user_id=u.id left join salons s on s.id=dp.salon_id where u.role in ('designer','salon_owner') and dp.onboarding_completed=true order by dp.is_accepting_now desc,${hasGeo?'distance_km asc nulls last,':''}dp.avg_rating desc limit 100`,params);
     if(r.rows.length)providers=r.rows.map((x:any)=>({id:x.id,name:x.display_name,salon:x.salon,avatar:x.avatar_url||'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',cover:x.cover||'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',rating:Number(x.rating||0),reviews:x.reviews||0,completed:x.completed||0,distanceKm:x.distance_km==null?null:Number(x.distance_km),availableText:x.is_accepting_now?'現在可接':'可詢問時段',isAvailableNow:Boolean(x.is_accepting_now),location:x.location,specialties:x.specialties||[],intro:x.bio,instagram:x.instagram,works:[],services:[]}));
   }catch{}
 }
 return <div className="app-shell"><Header/><main className="container page"><div className="section-head"><div><div className="eyebrow">NEARBY</div><h1 className="page-title">附近的髮型專家</h1><p className="muted">{hasGeo?'已依你的手機 GPS 排序，距離最近與目前可接的設計師優先。':'開啟定位後，會用真實座標計算距離；iPhone 與 Android 都支援。'}</p></div><LocationDiscoverButton/></div><div className="panel" style={{marginBottom:16}}><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:13}}>{['推薦排序','5 公里內','現在有空','洗髮','剪髮','染髮','價格'].map((x,i)=><button type="button" className={i===2?'btn btn-soft':'btn'} key={x}>{i===0?<SlidersHorizontal size={14}/>:null}{x}</button>)}<button type="button" className="btn"><Filter size={14}/></button></div><div className="glass-map"><span className="map-dot" style={{left:'63%',top:'44%'}}/><span className="map-dot" style={{left:'25%',top:'58%'}}/><span className="map-dot" style={{left:'77%',top:'30%'}}/><div style={{position:'absolute',left:16,top:14,zIndex:2}}><strong style={{fontSize:13}}>{hasGeo?'GPS 距離媒合已啟用':'等待手機定位'}</strong><div className="small">{hasGeo?`定位：${lat.toFixed(4)}, ${lng.toFixed(4)}`:'正式 Vercel HTTPS 網址可正常使用 GPS'}</div></div></div></div><div className="cards">{providers.map(p=><ProviderCard p={p} key={p.id}/>)}</div></main><MobileNav/></div>
}
