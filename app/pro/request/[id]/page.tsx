'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock3, Send, Star } from 'lucide-react';
import { demoDemand, providers } from '@/lib/demo-data';

export default function QuoteComposer(){
  const router=useRouter();const p=providers[0];
  const [price,setPrice]=useState('500');const [time,setTime]=useState('今天 15:30');
  const [msg,setMsg]=useState('現在前一位快結束，15:30 可以直接安排。會先看一下頭皮與髮況，再依你要的蓬度完成吹整。');
  return <div className="app-shell"><div className="topbar"><div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><Link className="brand" href="/pro/dashboard"><span className="brand-mark"><ArrowLeft size={16}/></span>返回工作台</Link><div className="provider-row"><img className="avatar" src={p.avatar}/><span>{p.name}</span></div></div></div>
  <main className="container page"><div className="layout-2"><section><div className="eyebrow">SEND OFFER</div><h1 className="page-title">提出專屬方案</h1><div className="panel"><h3>顧客需求</h3><div className="summary-row"><span>項目</span><strong>{demoDemand.serviceLabel}</strong></div><div className="summary-row"><span>時間</span><strong>{demoDemand.dateText}</strong></div><div className="summary-row"><span>預算</span><strong>NT$ {demoDemand.budgetMin} - {demoDemand.budgetMax}</strong></div><p className="muted">{demoDemand.notes}</p></div>
  <div className="panel" style={{marginTop:16}}><h3>你的提案</h3><div className="form-grid"><div className="form-group"><label>方案價格</label><input className="input" value={price} onChange={e=>setPrice(e.target.value)}/></div><div className="form-group"><label><Clock3 size={13} style={{verticalAlign:'-3px',marginRight:5}}/>可服務時間</label><input className="input" value={time} onChange={e=>setTime(e.target.value)}/></div></div><div className="form-group"><label>給顧客的說明</label><textarea className="input textarea" value={msg} onChange={e=>setMsg(e.target.value)}/></div><div className="form-group"><label>附上最相關的 3 張作品</label><div className="quote-works">{p.works.slice(0,3).map(x=><img src={x} key={x}/>)}</div></div><button className="btn btn-primary" style={{width:'100%',marginTop:18,padding:15}} onClick={()=>{alert('方案已送出（Demo）');router.push('/pro/dashboard')}}><Send size={16} style={{verticalAlign:'-3px',marginRight:6}}/>送出方案</button></div></section>
  <aside className="panel summary-box"><div className="eyebrow">QUOTE PREVIEW</div><h3 style={{marginTop:8}}>顧客會看到</h3><div className="provider-row"><img className="avatar" src={p.avatar}/><div><div className="name">{p.name}｜{p.salon}</div><div className="small"><Star size={12} fill="#ad8a5c" color="#ad8a5c" style={{verticalAlign:'-2px'}}/> {p.rating} · {p.completed} 次</div></div></div><div style={{margin:'20px 0'}}><div className="small">方案總價</div><div className="quote-price">NT$ {price}</div></div><div className="summary-row"><span>可服務</span><strong>{time}</strong></div><p className="small" style={{lineHeight:1.75}}>{msg}</p></aside></div></main></div>
}
