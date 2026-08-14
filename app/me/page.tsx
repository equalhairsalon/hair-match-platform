import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarDays, ChevronRight, Scissors } from 'lucide-react';
import { Header, MobileNav } from '@/components/Header';
import { LogoutButton } from '@/components/LogoutButton';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';
export default async function Me(){
 const session=await getSession();if(!session)redirect('/auth?next=/me');
 if(session.role==='designer'||session.role==='salon_owner')redirect('/pro/dashboard');
 const demands=await query(`select d.*,(select count(*)::int from quotes q where q.demand_id=d.id) quote_count from demands d where d.customer_user_id=$1 order by d.created_at desc limit 50`,[session.id]);
 const bookings=await query(`select b.*,u.display_name designer_name,coalesce(s.name,'獨立設計師') salon_name from bookings b join users u on u.id=b.designer_user_id left join salons s on s.id=b.salon_id where b.customer_user_id=$1 order by b.starts_at desc limit 20`,[session.id]);
 return <div className="app-shell"><Header/><main className="container page"><div className="request-head"><div><div className="eyebrow">MY HAIR MATCH</div><h1 className="page-title">{session.displayName} 的媒合</h1><p className="muted">需求、報價與成立預約都會留在這裡。</p></div><LogoutButton/></div><div className="layout-2" style={{marginTop:18}}><section className="panel"><div className="section-head"><div><h3>我的需求</h3><p className="small">共 {demands.rowCount||0} 筆</p></div><Link className="btn btn-brand" href="/request/new">發布新需求</Link></div>{demands.rows.length===0&&<p className="muted">還沒有需求。發布第一筆需求後，設計師報價會回到這裡。</p>}{demands.rows.map((d:any)=><Link href={`/requests/${d.id}`} className="lead-row" key={d.id}><div className="avatar" style={{display:'grid',placeItems:'center'}}><Scissors size={18}/></div><div><div className="name">{d.service_label} · {d.location_text}</div><div className="small">NT$ {d.budget_min} - {d.budget_max} · {d.quote_count||0} 份報價 · {d.status}</div></div><ChevronRight size={18}/></Link>)}</section><aside className="panel"><h3><CalendarDays size={17}/> 已成立預約</h3>{bookings.rows.length===0&&<p className="small">目前還沒有成立的預約。</p>}{bookings.rows.map((b:any)=><div className="summary-row" key={b.id}><div><strong>{b.designer_name}</strong><div className="small">{b.salon_name}<br/>{new Date(b.starts_at).toLocaleString('zh-TW')}</div></div><strong>NT$ {Number(b.price).toLocaleString()}</strong></div>)}</aside></div></main><MobileNav/></div>
}
