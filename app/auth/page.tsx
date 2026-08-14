'use client';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogIn, Scissors, Sparkles, UserPlus } from 'lucide-react';
import { BRAND } from '@/lib/brand';

export default function AuthPage(){
  const router=useRouter();const qs=useSearchParams();
  const next=qs.get('next')||'/'; const roleHint=qs.get('role')==='designer'?'designer':'customer';
  const [mode,setMode]=useState<'login'|'register'>('register');
  const [role,setRole]=useState<'customer'|'designer'>(roleHint);
  const [displayName,setDisplayName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const target=useMemo(()=>role==='designer'?(next==='/'?'/pro/onboarding':next):next,[role,next]);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{
    const endpoint=mode==='register'?'/api/auth/register':'/api/auth/login';
    const body=mode==='register'?{displayName,email,password,role}:{email,password};
    const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const j=await r.json();if(!r.ok) throw new Error(j.message||'操作失敗');
    const userRole=j.user?.role as string;
    if(mode==='register' && userRole==='designer') router.push('/pro/onboarding'); else if(userRole==='designer' && next==='/') router.push('/pro/dashboard'); else router.push(next);
    router.refresh();
  }catch(err:any){setError(err.message||'操作失敗')}finally{setBusy(false)}}
  return <div className="app-shell"><div className="topbar"><div className="container"><Link className="brand" href="/"><span className="brand-mark"><ArrowLeft size={16}/></span>{BRAND.name}</Link></div></div>
    <main className="container page"><div className="auth-wrap"><section><div className="eyebrow">WELCOME TO HAIR MATCH</div><h1 className="page-title">先登入，讓每一次媒合<br/>都能真正留下來。</h1><p className="muted">顧客建立需求、收到報價與成立預約；設計師建立作品履歷、接收附近需求並送出方案。</p><div className="panel" style={{marginTop:22}}><div className="provider-row"><span className="brand-mark"><Sparkles size={18}/></span><div><strong>第一階段測試帳號</strong><div className="small">目前先用 Email + 密碼，後續再接 Apple / LINE / 手機 OTP。</div></div></div></div></section>
    <section className="panel auth-card"><div className="auth-tabs"><button className={mode==='register'?'btn btn-soft':'btn'} onClick={()=>setMode('register')}><UserPlus size={15}/>註冊</button><button className={mode==='login'?'btn btn-soft':'btn'} onClick={()=>setMode('login')}><LogIn size={15}/>登入</button></div>
    {mode==='register'&&<div className="role-switch"><button className={role==='customer'?'active':''} onClick={()=>setRole('customer')}>我是顧客</button><button className={role==='designer'?'active':''} onClick={()=>setRole('designer')}><Scissors size={14}/>我是設計師</button></div>}
    <form onSubmit={submit}>{mode==='register'&&<div className="form-group"><label>顯示名稱</label><input className="input" required minLength={2} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder={role==='designer'?'例如：Hank':'例如：Alice'}/></div>}<div className="form-group"><label>Email</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></div><div className="form-group"><label>密碼</label><input className="input" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="至少 8 個字元"/></div>{error&&<div className="form-error">{error}</div>}<button className="btn btn-primary" style={{width:'100%',padding:15}} disabled={busy}>{busy?'處理中…':mode==='register'?'建立帳號':'登入'}</button></form>
    <p className="small" style={{lineHeight:1.75,marginBottom:0}}>建立帳號即代表同意平台測試期間的使用規範。正式公開前會補齊隱私權政策、服務條款與帳號刪除流程。</p></section></div></main></div>
}
