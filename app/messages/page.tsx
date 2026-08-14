import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { Header, MobileNav } from '@/components/Header';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';

export default async function MessagesPage(){
 const s=await getSession();if(!s)redirect('/auth?next=/messages');
 const r=await query(`select c.id,c.demand_id,c.customer_user_id,c.designer_user_id,c.updated_at,
   case when c.customer_user_id=$1 then du.display_name else cu.display_name end other_name,
   case when c.customer_user_id=$1 then du.avatar_url else cu.avatar_url end other_avatar,
   d.service_label,
   (select body from messages m where m.conversation_id=c.id order by m.created_at desc limit 1) last_message,
   (select created_at from messages m where m.conversation_id=c.id order by m.created_at desc limit 1) last_message_at,
   (select count(*)::int from messages m where m.conversation_id=c.id and m.receiver_user_id=$1 and m.read_at is null) unread_count
   from conversations c join users cu on cu.id=c.customer_user_id join users du on du.id=c.designer_user_id left join demands d on d.id=c.demand_id
   where c.customer_user_id=$1 or c.designer_user_id=$1
   order by coalesce((select max(m.created_at) from messages m where m.conversation_id=c.id),c.updated_at,c.created_at) desc`,[s.id]);
 return <div className="app-shell"><Header/><main className="container page"><div className="eyebrow">MESSAGES</div><h1 className="page-title">訊息</h1><p className="muted">顧客和設計師的媒合對話會集中在這裡，手機與電腦同步。</p><section className="panel message-list">{r.rows.length===0?<div className="empty-state"><MessageCircle size={30}/><h3>目前還沒有對話</h3><p className="muted">顧客收到報價後按「先聊聊」，就會建立對話。</p></div>:r.rows.map((c:any)=><Link href={`/messages/${c.id}`} className="message-list-row" key={c.id}><img className="avatar" src={c.other_avatar||'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80'} alt=""/><div className="message-list-main"><div className="name">{c.other_name}<span className="small"> · {c.service_label||'媒合需求'}</span></div><div className="small message-preview">{c.last_message||'開始聊聊這次需求'}</div></div><div className="message-list-meta">{c.unread_count>0&&<span className="unread-badge">{c.unread_count}</span>}<span className="small">{c.last_message_at?new Date(c.last_message_at).toLocaleString('zh-TW',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):''}</span><ChevronRight size={16}/></div></Link>)}</section></main><MobileNav/></div>
}
