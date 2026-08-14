import { Filter, MapPin, SlidersHorizontal } from 'lucide-react';
import { Header, MobileNav } from '@/components/Header';
import { ProviderCard } from '@/components/ProviderCard';
import { providers } from '@/lib/demo-data';

export default function Discover(){
  return <div className="app-shell"><Header/><main className="container page">
    <div className="section-head"><div><div className="eyebrow">NEARBY</div><h1 className="page-title">附近的髮型專家</h1><p className="muted">依距離、目前空檔、服務項目與評價排序。</p></div><button className="btn"><MapPin size={15} style={{verticalAlign:'-3px',marginRight:6}}/>地圖模式</button></div>
    <div className="panel" style={{marginBottom:16}}><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:13}}>{['推薦排序','5 公里內','現在有空','洗髮','剪髮','染髮','價格'].map((x,i)=><button className={i===2?'btn btn-soft':'btn'} key={x}>{i===0?<SlidersHorizontal size={14} style={{verticalAlign:'-3px',marginRight:5}}/>:null}{x}</button>)}<button className="btn"><Filter size={14}/></button></div>
      <div className="glass-map"><span className="map-dot" style={{left:'63%',top:'44%'}}/><span className="map-dot" style={{left:'25%',top:'58%'}}/><span className="map-dot" style={{left:'77%',top:'30%'}}/><span className="map-dot" style={{left:'44%',top:'23%'}}/><div style={{position:'absolute',left:16,top:14,zIndex:2}}><strong style={{fontSize:13}}>竹北市 · 5 公里內</strong><div className="small">找到 28 位可接單設計師</div></div></div>
    </div>
    <div className="cards">{providers.concat(providers).map((p,i)=><ProviderCard p={{...p,id:p.id+(i>2?'-2':'')}} key={p.id+i}/>)}</div>
  </main><MobileNav/></div>
}
