import Link from 'next/link';
import { Clock3, LocateFixed, MapPin, Scissors, Sparkles, WandSparkles } from 'lucide-react';
import { Header, MobileNav } from '@/components/Header';
import { ProviderCard } from '@/components/ProviderCard';
import { BRAND } from '@/lib/brand';
import { providers } from '@/lib/demo-data';

export default function Home(){
  return <div className="app-shell"><Header/><main>
    <section className="container hero">
      <div>
        <div className="eyebrow">BEAUTY ON DEMAND</div>
        <h1>想整理頭髮的此刻，<br/>附近剛好有人有空。</h1>
        <p>{BRAND.description} 顧客免費發布需求，讓設計師用作品、時間與價格主動回覆你。</p>
        <div className="quick-card"><div className="quick-grid">
          <div className="field"><label><Scissors size={12} style={{verticalAlign:'-2px',marginRight:5}}/>我現在想做</label><select><option>洗髮 / 造型</option><option>剪髮</option><option>染髮</option><option>燙髮</option><option>護髮</option></select></div>
          <div className="field"><label><Clock3 size={12} style={{verticalAlign:'-2px',marginRight:5}}/>希望時間</label><select><option>現在 / 越快越好</option><option>今天</option><option>指定日期</option></select></div>
          <div className="field"><label><MapPin size={12} style={{verticalAlign:'-2px',marginRight:5}}/>地點</label><input defaultValue="竹北市 · 使用目前位置"/></div>
          <Link className="btn btn-primary" style={{display:'grid',placeItems:'center',paddingInline:22}} href="/request/new"><Sparkles size={16}/>立即發布</Link>
        </div></div>
        <div style={{display:'flex',gap:18,flexWrap:'wrap',marginTop:15}} className="small"><span>✓ 顧客免費</span><span>✓ 多位設計師提案</span><span>✓ 作品與價格透明</span></div>
      </div>
      <div className="hero-photo"><img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85" alt="hair salon"/><div className="hero-float"><div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'center'}}><div><div className="small">你的附近</div><strong style={{fontSize:18,letterSpacing:'-.02em'}}>12 位設計師目前可接</strong><div className="small" style={{marginTop:5}}>最快 15 分鐘後 · 最近 0.7 km</div></div><span className="brand-mark" style={{width:46,height:46,borderRadius:17}}><LocateFixed size={20}/></span></div></div></div>
    </section>

    <section className="container section"><div className="section-head"><div><div className="eyebrow">NEARBY NOW</div><h2>現在附近有空</h2><p className="muted">不想等報價，也能直接看附近目前真正有空檔的人。</p></div><Link className="btn" href="/discover">查看全部</Link></div><div className="cards">{providers.map(p=><ProviderCard p={p} key={p.id}/>)}</div></section>

    <section className="container section"><div className="panel"><div className="section-head"><div><div className="eyebrow">HOW IT WORKS</div><h2>需求先出去，適合的設計師再進來。</h2></div><WandSparkles size={28} color="#527d58"/></div><div className="cards">{[['01','發布需求','項目、時間、預算、位置與照片一次說清楚。'],['02','收到提案','附近設計師回覆價格、可服務時間與最相關作品。'],['03','選擇成交','比較作品、評價、距離與方案，再決定和誰預約。']].map(x=><div className="metric" key={x[0]}><div className="eyebrow">{x[0]}</div><strong style={{fontSize:21}}>{x[1]}</strong><p className="muted" style={{marginBottom:0}}>{x[2]}</p></div>)}</div></div></section>
  </main><footer className="footer"><div className="container">{BRAND.name} · 顧客免費發布需求 · 設計師訂閱制 · Web / PWA first</div></footer><MobileNav/></div>
}
