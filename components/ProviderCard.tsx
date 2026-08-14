import Link from 'next/link';
import { Clock3, MapPin, Star } from 'lucide-react';
import { Provider } from '@/lib/types';

export function ProviderCard({p}:{p:Provider}){
  return <article className="provider-card">
    <div className="provider-cover"><img src={p.cover} alt={p.salon}/><span className="status-pill">{p.isAvailableNow?'● 現在可接':'最近可約'}</span></div>
    <div className="provider-body">
      <div className="provider-row"><img className="avatar" src={p.avatar} alt={p.name}/><div style={{minWidth:0}}><div className="name">{p.name}｜{p.salon}</div><div className="small" style={{display:'flex',gap:8,alignItems:'center',marginTop:3}}><span><Star size={12} fill="#ad8a5c" color="#ad8a5c" style={{verticalAlign:'-2px'}}/> {p.rating}（{p.reviews}）</span><span>完成 {p.completed} 次</span></div></div></div>
      <div className="tags">{p.specialties.map(x=><span className="tag" key={x}>{x}</span>)}</div>
      <div className="small" style={{display:'flex',justifyContent:'space-between',gap:10}}><span><Clock3 size={12} style={{verticalAlign:'-2px'}}/> {p.availableText}</span><span><MapPin size={12} style={{verticalAlign:'-2px'}}/> {p.distanceKm} km</span></div>
      <div className="card-actions"><span className="distance">{p.location}</span><Link className="btn btn-brand" href={`/pro/${p.id}`}>查看作品</Link></div>
    </div>
  </article>
}
