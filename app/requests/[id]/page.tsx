'use client';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, MapPin, MessageCircle, Star } from 'lucide-react';
import { Header, MobileNav } from '@/components/Header';
import { demoDemand, demoQuotes, providers } from '@/lib/demo-data';
import { loadDemands } from '@/lib/demo-store';
import type { Demand } from '@/lib/types';

export default function RequestPage({params}:{params:Promise<{id:string}>}){
  const [id,setId]=useState('d1');
  const [demand,setDemand]=useState<Demand>(demoDemand);
  useEffect(()=>{params.then(p=>{setId(p.id);const d=loadDemands().find(x=>x.id===p.id)||demoDemand;setDemand(d)})},[params]);
  const quotes=useMemo(()=>id==='d1'?demoQuotes:demoQuotes.map((q,i)=>({...q,id:q.id+'n',demandId:id,createdAt:`${i+1} 分鐘前`})),[id]);

  return <div className="app-shell"><Header/><main className="container page">
    <div className="request-head"><div><div className="eyebrow">MY REQUEST</div><h1 className="page-title">已收到 {quotes.length} 份報價</h1><p className="muted">先看作品、價格、可服務時間與設計師說明，再決定和誰預約。</p></div><div className="metric-grid" style={{minWidth:280}}><div className="metric"><span className="small">目前報價</span><strong>{quotes.length} 份</strong></div><div className="metric"><span className="small">媒合狀態</span><strong style={{fontSize:19,color:'#315d3b'}}>收集中</strong></div></div></div>
    <div className="progress" style={{margin:'22px 0 18px'}}><span style={{width:'82%'}}/></div>
    <div className="layout-2"><section className="quote-list">{quotes.map(q=>{const p=providers.find(x=>x.id===q.providerId)!;return <article className="quote-card" key={q.id}>
      <div className="quote-top"><div style={{flex:1}}><div className="provider-row"><img className="avatar" src={p.avatar}/><div><div className="name">{p.name}｜{p.salon}</div><div className="small"><Star size={12} fill="#ad8a5c" color="#ad8a5c" style={{verticalAlign:'-2px'}}/> {p.rating} · 近期完成 {p.completed} 次 · <MapPin size={12} style={{verticalAlign:'-2px'}}/> {p.distanceKm} km</div></div></div><p className="muted" style={{lineHeight:1.75,maxWidth:650}}>{q.message}</p></div><div style={{textAlign:'right'}}><div className="small">方案總價</div><div className="quote-price">NT$ {q.price}</div><div className="small"><Clock3 size={12} style={{verticalAlign:'-2px'}}/> {q.availableAt}</div></div></div>
      <div className="tags">{q.included.map(x=><span className="tag" key={x}>{x}</span>)}</div>
      <div className="quote-works">{q.workImages.map(x=><img src={x} key={x}/>)}</div>
      <div className="card-actions"><button className="btn"><MessageCircle size={15} style={{verticalAlign:'-3px',marginRight:6}}/>先聊聊</button><button className="btn btn-brand"><CheckCircle2 size={15} style={{verticalAlign:'-3px',marginRight:6}}/>選擇這位設計師</button></div>
    </article>})}</section>
    <aside className="panel summary-box"><div className="eyebrow">REQUEST CARD</div><h3 style={{fontSize:20,marginTop:8}}>我的需求單</h3><div className="summary-row"><span className="muted">項目</span><strong>{demand.serviceLabel}</strong></div><div className="summary-row"><span className="muted">首選</span><strong>{demand.dateText}</strong></div><div className="summary-row"><span className="muted">預算</span><strong>NT$ {demand.budgetMin} - {demand.budgetMax}</strong></div><div className="summary-row"><span className="muted">位置</span><span style={{textAlign:'right'}}>{demand.location}</span></div><div className="summary-row"><span className="muted">髮長</span><span>{demand.hairLength}</span></div><div style={{marginTop:14,padding:14,background:'rgba(255,255,255,.26)',border:'1px solid rgba(255,255,255,.56)',borderRadius:17}}><strong>補充需求</strong><p className="small" style={{lineHeight:1.75,marginBottom:0}}>{demand.notes||'未填寫，設計師可先詢問髮況。'}</p></div></aside>
    </div>
  </main><MobileNav/></div>
}
