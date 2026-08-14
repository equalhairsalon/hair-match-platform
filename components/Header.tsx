'use client';
import Link from 'next/link';
import { Bell, Compass, House, LogIn, MessageCircle, Plus, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BRAND } from '@/lib/brand';
import { LogoutButton } from '@/components/LogoutButton';

type HeaderUser={id:string;role:'customer'|'designer'|'salon_owner'|'admin';displayName:string;email?:string|null};

export function Header(){
  const [session,setSession]=useState<HeaderUser|null>(null);
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{
    let active=true;
    fetch('/api/auth/me',{cache:'no-store',credentials:'same-origin'})
      .then(r=>r.json())
      .then(j=>{if(active)setSession(j.user||null)})
      .catch(()=>{})
      .finally(()=>{if(active)setLoaded(true)});
    return()=>{active=false};
  },[]);
  const provider=session && (session.role==='designer'||session.role==='salon_owner');
  return <header className="topbar"><div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
    <Link className="brand" href="/"><span className="brand-mark">美</span><span>{BRAND.name}</span><span className="small" style={{letterSpacing:'.12em'}}>{BRAND.english}</span></Link>
    <nav className="nav"><Link href="/discover">探索服務</Link><Link href="/request/new">發布需求</Link><Link href="/messages">訊息</Link><Link href="/me">我的</Link>{provider&&<Link href="/pro/dashboard">服務者工作台</Link>}{session?.role==='admin'&&<Link href="/admin">平台管理</Link>}</nav>
    <div className="top-actions">
      <Link className="btn icon-btn" aria-label="通知" href="/notifications"><Bell size={17}/></Link>
      {loaded&&!session&&<Link className="btn" href="/auth"><LogIn size={14}/>登入 / 註冊</Link>}
      {session&&<Link className="btn" href={session.role==='admin'?'/admin':provider?'/pro/dashboard':'/me'}><UserRound size={14}/>{session.displayName}</Link>}
      {session?.role==='admin'&&<Link className="btn btn-soft" href="/admin"><ShieldCheck size={14}/>最高管理</Link>}
      {provider&&<Link className="btn" href="/pro/dashboard">服務者工作台</Link>}
      {session&&<LogoutButton/>}
      <Link className="btn btn-primary" href="/request/new"><Sparkles size={15}/>找服務</Link>
    </div>
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
