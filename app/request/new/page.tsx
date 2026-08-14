'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Clock3, LocateFixed, MapPin, Scissors, Sparkles } from 'lucide-react';
import { Header, MobileNav } from '@/components/Header';
import { serviceOptions } from '@/lib/demo-data';
import { saveDemand } from '@/lib/demo-store';
import type { ServiceKey } from '@/lib/types';

export default function NewDemand(){
 const router=useRouter();
 const [service,setService]=useState<ServiceKey>('wash');
 const [when,setWhen]=useState<'now'|'scheduled'>('now');
 const [budget,setBudget]=useState('500-800');
 const [location,setLocation]=useState('竹北市 · 使用目前位置');
 const [notes,setNotes]=useState('');
 const [hairLength,setHairLength]=useState('中長髮');
 const [geoStatus,setGeoStatus]=useState('');
 const useGeo=()=>{if(!navigator.geolocation){setGeoStatus('瀏覽器不支援定位');return} setGeoStatus('定位中…');navigator.geolocation.getCurrentPosition(p=>{setLocation(`目前位置 ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`);setGeoStatus('定位完成')},()=>setGeoStatus('無法取得定位，仍可手動輸入'));};
 const submit=()=>{const [min,max]=budget.split('-').map(Number); const opt=serviceOptions.find(x=>x.key===service)!; const d={id:'d'+Date.now(),service,serviceLabel:opt.label,when,dateText:when==='now'?'現在～2 小時內':'指定時間',budgetMin:min,budgetMax:max,location,notes,hairLength,styleTags:['自然','好整理'],photoUrls:[],quoteCount:0,status:'collecting' as const,createdAt:'剛剛'};saveDemand(d);router.push(`/requests/${d.id}`)};
 return <div className="app-shell"><Header/><main className="container page"><div className="layout-2"><div>
   <div className="eyebrow">CREATE REQUEST</div><h1 className="page-title">把需求發出去，<br/>讓附近設計師來找你。</h1><p className="muted">不用先翻幾十個帳號。說清楚你要什麼、什麼時候、在哪裡，讓適合的人直接報價。</p>
   <div className="panel form-group"><h3><Scissors size={18} style={{verticalAlign:'-4px',marginRight:7}}/>1. 選擇服務</h3><div className="service-grid">{serviceOptions.map(o=><button key={o.key} className={`service-chip ${service===o.key?'active':''}`} onClick={()=>setService(o.key)}>{o.label}</button>)}</div>
     <div className="form-grid"><div className="form-group"><label><Clock3 size={13} style={{verticalAlign:'-3px',marginRight:5}}/>希望時間</label><select className="input" value={when} onChange={e=>setWhen(e.target.value as any)}><option value="now">現在 / 越快越好</option><option value="scheduled">指定日期時間</option></select></div><div className="form-group"><label>預算範圍</label><select className="input" value={budget} onChange={e=>setBudget(e.target.value)}><option value="300-500">NT$ 300 - 500</option><option value="500-800">NT$ 500 - 800</option><option value="800-1500">NT$ 800 - 1,500</option><option value="1500-3000">NT$ 1,500 - 3,000</option><option value="3000-6000">NT$ 3,000 - 6,000</option></select></div></div>
     <div className="form-grid"><div className="form-group"><label><MapPin size={13} style={{verticalAlign:'-3px',marginRight:5}}/>服務位置</label><input className="input" value={location} onChange={e=>setLocation(e.target.value)}/><button className="btn btn-soft" style={{marginTop:8}} onClick={useGeo}><LocateFixed size={14} style={{verticalAlign:'-3px',marginRight:5}}/>使用手機定位</button><span className="small" style={{marginLeft:8}}>{geoStatus}</span></div><div className="form-group"><label>頭髮長度</label><select className="input" value={hairLength} onChange={e=>setHairLength(e.target.value)}><option>短髮</option><option>中長髮</option><option>長髮</option><option>超長髮</option></select></div></div>
     <div className="form-group"><label>補充需求與髮況</label><textarea className="input textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="例如：等等有聚餐，希望洗完有自然蓬鬆感；或描述目前髮色、自然捲、曾漂髮等狀況…"/></div>
     <div className="form-group"><label><Camera size={13} style={{verticalAlign:'-3px',marginRight:5}}/>目前髮況 / 參考照片</label><div className="photo-drop"><div><Camera size={24} style={{margin:'0 auto 8px',opacity:.7}}/><strong>加入照片</strong><div className="small" style={{marginTop:7}}>手機可直接拍照或從相簿選取；正式上線串 Vercel Blob。</div></div></div></div>
   </div>
 </div>
 <aside className="panel summary-box"><div className="eyebrow">REQUEST SUMMARY</div><h3 style={{fontSize:20,marginTop:8}}>我的需求單</h3><div className="summary-row"><span className="muted">項目</span><strong>{serviceOptions.find(x=>x.key===service)?.label}</strong></div><div className="summary-row"><span className="muted">時間</span><strong>{when==='now'?'現在':'指定時間'}</strong></div><div className="summary-row"><span className="muted">預算</span><strong>NT$ {budget.replace('-', ' - ')}</strong></div><div className="summary-row"><span className="muted">位置</span><span style={{textAlign:'right'}}>{location}</span></div><button className="btn btn-primary" style={{width:'100%',marginTop:16,padding:15}} onClick={submit}><Sparkles size={16} style={{verticalAlign:'-3px',marginRight:6}}/>發布需求</button><p className="small" style={{lineHeight:1.7}}>發布後，符合距離、服務項目與時間條件的設計師會收到通知。顧客不收平台費。</p></aside>
 </div></main><MobileNav/></div>
}
