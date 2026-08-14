import Link from 'next/link';
import { ArrowRight, Building2, CircleDollarSign, ClipboardCheck, Layers3, ShieldCheck, UsersRound } from 'lucide-react';
import { AdminMetric, AdminPageHead } from '@/components/AdminShell';
import { query } from '@/lib/server-db';

export const dynamic = 'force-dynamic';
export default async function AdminDashboard(){
 const [stats,cats,recent,pay]=await Promise.all([
  query(`select
   (select count(*)::int from users where role='customer' and account_status='active') customers,
   (select count(*)::int from users where role in ('designer','salon_owner') and account_status='active') providers,
   (select count(*)::int from organizations where status='active') organizations,
   (select count(*)::int from provider_applications where application_status='pending') pending,
   (select count(*)::int from demands where created_at>=current_date) today_demands,
   (select count(*)::int from bookings where created_at>=current_date) today_bookings,
   (select count(*)::int from reports where status='open') open_reports`),
  query(`select sc.key,sc.label,sc.is_active,count(pc.user_id)::int providers from service_categories sc left join provider_categories pc on pc.category_id=sc.id group by sc.id order by sc.sort_order`),
  query(`select pa.user_id,u.display_name,u.email,coalesce(o.name,'個人工作者') organization_name,pa.application_status,pa.submitted_at,coalesce(array_agg(distinct sc.label) filter(where sc.label is not null),'{}') category_labels from provider_applications pa join users u on u.id=pa.user_id left join designer_profiles dp on dp.user_id=u.id left join organizations o on o.id=dp.organization_id left join provider_categories pc on pc.user_id=u.id left join service_categories sc on sc.id=pc.category_id group by pa.user_id,u.display_name,u.email,o.name,pa.application_status,pa.submitted_at order by coalesce(pa.submitted_at,u.created_at) desc limit 8`),
  query(`select count(*) filter(where status='active')::int active,count(*) filter(where status='trial')::int trial,count(*) filter(where status='past_due')::int past_due,count(*) filter(where comped_forever=true)::int comped from subscriptions`)
 ]);
 const s:any=stats.rows[0]||{};const b:any=pay.rows[0]||{};
 return <div><AdminPageHead eyebrow="PLATFORM COMMAND CENTER" title="平台營運總覽" description="人數增加後不靠一張張卡片管理：帳號、申請、店家、收費與風險分流，各自有搜尋、篩選與分頁。" actions={<Link className="btn btn-brand" href="/admin/applications">處理待審核 <ArrowRight size={15}/></Link>}/>
 <div className="admin-metric-grid"><AdminMetric label="顧客帳號" value={s.customers||0} detail="顧客永久免費"/><AdminMetric label="服務者帳號" value={s.providers||0} detail="個人＋店家成員"/><AdminMetric label="店家／工作室" value={s.organizations||0} detail="以組織為單位管理"/><AdminMetric label="待審核申請" value={s.pending||0} detail="只進申請池，不塞全部帳號"/><AdminMetric label="今日需求" value={s.today_demands||0}/><AdminMetric label="今日成交" value={s.today_bookings||0}/><AdminMetric label="待處理檢舉" value={s.open_reports||0}/></div>
 <div className="admin-grid-2"><section className="admin-panel"><div className="admin-section-title"><div><h3>服務類別</h3><p>同一平台共用顧客與媒合核心。</p></div><Link href="/admin/categories">管理分類</Link></div><div className="admin-category-grid">{cats.rows.map((c:any)=><div className="admin-category-card" key={c.key}><span>{c.label}</span><strong>{c.providers}</strong><small>已加入服務者 · {c.is_active?'開放':'停用'}</small></div>)}</div></section>
 <section className="admin-panel"><div className="admin-section-title"><div><h3>收費狀態</h3><p>顧客免費；平台向服務供應方收費。</p></div><Link href="/admin/billing">方案與權限</Link></div><div className="admin-kpi-list"><div><span>已付款</span><strong>{b.active||0}</strong></div><div><span>試用中</span><strong>{b.trial||0}</strong></div><div><span>待付款</span><strong>{b.past_due||0}</strong></div><div><span>永久免費／合作</span><strong>{b.comped||0}</strong></div></div></section></div>
 <section className="admin-panel"><div className="admin-section-title"><div><h3>最近加入的平台服務者</h3><p>新註冊先建立 users 帳號；服務者資料進 provider application 申請池，通過後才進公開名錄。</p></div><Link href="/admin/providers">全部服務者</Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>申請人</th><th>類別</th><th>店家／工作室</th><th>狀態</th><th>送出時間</th></tr></thead><tbody>{recent.rows.map((x:any)=><tr key={x.user_id}><td><strong>{x.display_name}</strong><small>{x.email}</small></td><td><div className="tags">{(x.category_labels||[]).map((c:string)=><span className="tag" key={c}>{c}</span>)}</div></td><td>{x.organization_name}</td><td><span className="tag">{x.application_status}</span></td><td>{x.submitted_at?new Date(x.submitted_at).toLocaleString('zh-TW'):'尚未送審'}</td></tr>)}</tbody></table></div></section>
 <section className="admin-panel admin-architecture"><div><ShieldCheck size={22}/><h3>200 位、2,000 位都用同一套分流</h3><p>「帳號」永遠放 users；「服務者申請」放申請池；「店家」由 organizations 分組；「付款」獨立 subscriptions。你平常不需要翻 200 個帳號，只看需要處理的佇列。</p></div><div className="admin-flow"><span><UsersRound/>所有帳號</span><ArrowRight/><span><ClipboardCheck/>服務者申請池</span><ArrowRight/><span><Building2/>店家／服務者名錄</span><ArrowRight/><span><CircleDollarSign/>方案／權限</span></div></section></div>
}
