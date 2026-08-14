import Link from 'next/link';
import { BarChart3, Building2, CircleDollarSign, ClipboardCheck, FileWarning, Layers3, ReceiptText, ShieldCheck, SlidersHorizontal, UserRoundCog, UsersRound, ContactRound } from 'lucide-react';
import { BRAND } from '@/lib/brand';

const menu=[
  ['總覽','/admin',BarChart3],
  ['服務者申請','/admin/applications',ClipboardCheck],
  ['全部帳號','/admin/accounts',ContactRound],
  ['全部服務者','/admin/providers',UserRoundCog],
  ['店家／工作室','/admin/organizations',Building2],
  ['顧客帳號','/admin/customers',UsersRound],
  ['方案與收費','/admin/billing',CircleDollarSign],
  ['服務分類','/admin/categories',Layers3],
  ['檢舉／風險','/admin/reports',FileWarning],
  ['操作紀錄','/admin/audit',ReceiptText],
  ['平台設定','/admin/settings',SlidersHorizontal],
] as const;

export function AdminShell({children,adminLevel='super_admin'}:{children:React.ReactNode;adminLevel?:string}){
  return <div className="admin-app"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand"><span className="brand-mark">美</span><span><strong>{BRAND.name}</strong><small>PLATFORM COMMAND</small></span></Link><div className="admin-role"><ShieldCheck size={16}/><div><strong>最高管理後台</strong><small>{adminLevel==='super_admin'?'Super Admin':adminLevel}</small></div></div><nav>{menu.map(([label,href,Icon])=><Link href={href} className="admin-side-link" key={href}><Icon size={17}/><span>{label}</span></Link>)}</nav><div className="admin-sidebar-foot"><Link href="/" className="btn">回顧客平台</Link></div></aside><main className="admin-main">{children}</main></div>
}

export function AdminPageHead({eyebrow,title,description,actions}:{eyebrow:string;title:string;description?:string;actions?:React.ReactNode}){
 return <div className="admin-page-head"><div><div className="eyebrow">{eyebrow}</div><h1 className="page-title">{title}</h1>{description&&<p className="muted">{description}</p>}</div>{actions&&<div className="admin-head-actions">{actions}</div>}</div>;
}

export function AdminMetric({label,value,detail}:{label:string;value:string|number;detail?:string}){
 return <div className="admin-metric"><span>{label}</span><strong>{value}</strong>{detail&&<small>{detail}</small>}</div>;
}
