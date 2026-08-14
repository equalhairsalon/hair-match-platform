'use client';
import { useState } from 'react';

type Plan={code:string;name:string;monthly_price:number;included_members:number|null;is_active:boolean};

export function AdminPlanManager({plans}:{plans:Plan[]}){
 const [items,setItems]=useState(plans);const [busy,setBusy]=useState('');const [msg,setMsg]=useState('');
 function patch(code:string,key:keyof Plan,value:any){setItems(s=>s.map(x=>x.code===code?{...x,[key]:value}:x))}
 async function save(p:Plan){setBusy(p.code);setMsg('');const r=await fetch('/api/admin/plans',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:p.code,name:p.name,monthlyPrice:Number(p.monthly_price||0),includedMembers:p.included_members===null?null:Number(p.included_members),isActive:Boolean(p.is_active)})});const j=await r.json();setBusy('');setMsg(r.ok?`${p.name} 已更新`:j.message||'方案更新失敗')}
 return <>{msg&&<div className="notice-bar">{msg}</div>}<div className="admin-plan-grid">{items.map(p=><div className="admin-plan-card admin-plan-editor" key={p.code}><span>{p.code.toUpperCase()}</span><label>方案名稱<input className="input" value={p.name} onChange={e=>patch(p.code,'name',e.target.value)}/></label><label>月費（NT$）<input className="input" type="number" min="0" value={p.monthly_price} onChange={e=>patch(p.code,'monthly_price',Number(e.target.value||0))}/></label><label>含成員數<input className="input" type="number" min="1" value={p.included_members??''} placeholder="依個人計費" onChange={e=>patch(p.code,'included_members',e.target.value===''?null:Number(e.target.value))}/></label><label className="admin-inline-check"><input type="checkbox" checked={p.is_active} onChange={e=>patch(p.code,'is_active',e.target.checked)}/> 啟用此方案</label><button className="btn btn-brand" disabled={busy===p.code} onClick={()=>save(p)}>{busy===p.code?'儲存中':'儲存方案'}</button></div>)}</div></>
}
