import Link from 'next/link';
import { Bell, Compass, House, Plus, Sparkles, UserRound } from 'lucide-react';
import { BRAND } from '@/lib/brand';

export function Header(){
  return <header className="topbar"><div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
    <Link className="brand" href="/"><span className="brand-mark">髮</span><span>{BRAND.name}</span><span className="small" style={{letterSpacing:'.12em'}}>{BRAND.english}</span></Link>
    <nav className="nav"><Link href="/discover">探索設計師</Link><Link href="/request/new">發布需求</Link><Link href="/requests/d1">我的需求</Link><Link href="/pro/dashboard">設計師工作台</Link></nav>
    <div className="top-actions"><button className="btn" aria-label="通知" style={{width:42,padding:0,display:'grid',placeItems:'center'}}><Bell size={17}/></button><Link className="btn" href="/pro/dashboard">設計師登入</Link><Link className="btn btn-primary" href="/request/new"><Sparkles size={15} style={{verticalAlign:'-3px',marginRight:6}}/>找設計師</Link></div>
  </div></header>
}

export function MobileNav(){
  return <div className="mobile-nav">
    <Link href="/"><House size={18} style={{display:'block',margin:'0 auto 3px'}}/>首頁</Link>
    <Link href="/discover"><Compass size={18} style={{display:'block',margin:'0 auto 3px'}}/>附近</Link>
    <Link href="/request/new"><Plus size={19} style={{display:'block',margin:'0 auto 3px'}}/>發布</Link>
    <Link href="/requests/d1"><UserRound size={18} style={{display:'block',margin:'0 auto 3px'}}/>需求</Link>
  </div>
}
