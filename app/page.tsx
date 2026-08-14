import Link from 'next/link';
import { Clock3, LocateFixed, MapPin, Scissors, Sparkles, WandSparkles } from 'lucide-react';
import { Header, MobileNav } from '@/components/Header';
import { ProviderCard } from '@/components/ProviderCard';
import { BRAND } from '@/lib/brand';
import { providers as demoProviders } from '@/lib/demo-data';
import { hasDatabase, query } from '@/lib/server-db';
import type { Provider } from '@/lib/types';

export default async function Home(){
  let providers:Provider[]=demoProviders.slice(0,3);
  let liveCount=providers.filter(x=>x.isAvailableNow).length;
  if(hasDatabase()){
    try{
      const r=await query(`select u.id,u.display_name,u.avatar_url,coalesce(s.name,'獨立設計師') salon,coalesce(s.address,'') location,coalesce(s.cover_url,'') cover,coalesce(s.instagram,'') instagram,coalesce(dp.avg_rating,0) rating,coalesce(dp.review_count,0) reviews,coalesce(dp.completed_count,0) completed,dp.is_accepting_now,dp.specialties,coalesce(dp.bio,'') bio from users u join designer_profiles dp on dp.user_id=u.id left join salons s on s.id=dp.salon_id where u.role in ('designer','salon_owner') and dp.onboarding_completed=true order by dp.is_accepting_now desc,dp.avg_rating desc limit 3`);
      if(r.rows.length){providers=r.rows.map((x:any)=>({id:x.id,name:x.display_name,salon:x.salon,avatar:x.avatar_url||'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',cover:x.cover||'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',rating:Number(x.rating||0),reviews:x.reviews||0,completed:x.completed||0,distanceKm:null,availableText:x.is_accepting_now?'現在可接':'可詢問時段',isAvailableNow:Boolean(x.is_accepting_now),location:x.location,specialties:x.specialties||[],intro:x.bio,instagram:x.instagram,works:[],services:[]}));liveCount=providers.filter(x=>x.isAvailableNow).length}
    }catch{}
  }
  return <div className="app-shell"><Header/><main>
    <section className="container hero">
      <div>
        <div className="eyebrow">BEAUTY ON DEMAND</div>
        <h1>想整理頭髮的此刻，<br/>附近剛好有人有空。</h1>
        <p>{BRAND.description} 顧客免費發布需求，讓設計師用作品、時間與價格主動回覆你。</p>
        <div className="quick-card"><div className="quick-grid">
          <div className="field"><label><Scissors size={12}/>我現在想做</label><select defaultValue="洗髮 / 造型"><option>洗髮 / 造型</option><option>剪髮</option><option>染髮</option><option>燙髮</option><option>護髮</option></select></div>
          <div className="field"><label><Clock3 size={12}/>希望時間</label><select defaultValue="現在 / 越快越好"><option>現在 / 越快越好</option><option>今天</option><option>指定日期</option></select></div>
          <div className="field"><label><MapPin size={12}/>地點</label><input defaultValue="竹北市 · 使用目前位置"/></div>
          <Link className="btn btn-primary" style={{display:'grid',placeItems:'center',paddingInline:22}} href="/request/new"><Sparkles size={16}/>立即發布</Link>
        </div></div>
        <div className="small home-proof"><span>✓ 顧客免費</span><span>✓ iPhone / Android</span><span>✓ 雲端即時同步</span></div>
      </div>
      <div className="hero-photo"><img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85" alt="hair salon"/><div className="hero-float"><div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'center'}}><div><div className="small">目前平台</div><strong style={{fontSize:18,letterSpacing:'-.02em'}}>{liveCount} 位設計師現在可接</strong><div className="small" style={{marginTop:5}}>開啟 GPS 後會依真實距離排序</div></div><span className="brand-mark" style={{width:46,height:46,borderRadius:17}}><LocateFixed size={20}/></span></div></div></div>
    </section>

    <section className="container section"><div className="section-head"><div><div className="eyebrow">NEARBY NOW</div><h2>現在附近有空</h2><p className="muted">已加入平台的真實設計師會出現在這裡。</p></div><Link className="btn" href="/discover">查看全部</Link></div><div className="cards">{providers.map(p=><ProviderCard p={p} key={p.id}/>)}</div></section>

    <section className="container section"><div className="panel"><div className="section-head"><div><div className="eyebrow">HOW IT WORKS</div><h2>需求先出去，適合的設計師再進來。</h2></div><WandSparkles size={28} color="#527d58"/></div><div className="cards">{[['01','發布需求','項目、時間、預算、位置與照片一次說清楚。'],['02','收到提案','附近設計師回覆價格、可服務時間與最相關作品。'],['03','聊天成交','比較作品、距離與方案，先聊清楚再成立預約。']].map(x=><div className="metric" key={x[0]}><div className="eyebrow">{x[0]}</div><strong style={{fontSize:21}}>{x[1]}</strong><p className="muted" style={{marginBottom:0}}>{x[2]}</p></div>)}</div></div></section>
  </main><footer className="footer"><div className="container">{BRAND.name} · Cloud-first · iOS / Android Web / PWA · Native apps later</div></footer><MobileNav/></div>
}
