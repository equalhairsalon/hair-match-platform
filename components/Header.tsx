import Link from 'next/link';
import { Bell, Compass, House, LogIn, MessageCircle, Plus, Sparkles, UserRound } from 'lucide-react';
import { BRAND } from '@/lib/brand';

export function Header(){
  return <header className="topbar"><div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
    <Link className="brand" href="/"><span className="brand-mark">髮</span><span>{BRAND.name}</span><span className="small" style={{letterSpacing:'.12em'}}>{BRAND.english}</span></Link>
    <nav className="nav"><Link href="/discover">探索設計師</Link><Link href="/request/new">發布需求</Link><Link href="/messages">訊息</Link><Link href="/me">我的</Link><Link href="/pro/dashboard">設計師工作台</Link></nav>
    <div className="top-actions"><Link className="btn icon-btn" aria-label="訊息" href="/messages"><Bell size={17}/></Link><Link className="btn" href="/auth"><LogIn size={14}/>登入 / 註冊</Link><Link className="btn" href="/pro/dashboard">設計師工作台</Link><Link className="btn btn-primary" href="/request/new"><Sparkles size={15}/>找設計師</Link></div>
  </div></header>
}

export function MobileNav(){
  return <nav className="mobile-nav" aria-label="主要導覽">
    <Link href="/"><House size={18}/>首頁</Link>
    <Link href="/discover"><Compass size={18}/>附近</Link>
    <Link href="/request/new"><Plus size={19}/>發布</Link>
    <Link href="/messages"><MessageCircle size={18}/>訊息</Link>
    <Link href="/me"><UserRound size={18}/>我的</Link>
  </nav>
}
