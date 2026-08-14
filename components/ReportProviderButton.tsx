'use client';
import { useState } from 'react';
import { Flag } from 'lucide-react';
export function ReportProviderButton({userId}:{userId:string}){const [busy,setBusy]=useState(false);async function go(){const detail=prompt('請簡短說明你要回報的問題');if(detail===null)return;setBusy(true);try{const r=await fetch('/api/reports',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({targetUserId:userId,reason:'other',detail})});const j=await r.json();alert(r.ok?'已收到回報，平台會進行審查。':j.message||'送出失敗')}finally{setBusy(false)}}return <button className="btn" style={{width:'100%'}} onClick={go} disabled={busy}><Flag size={14}/>{busy?'送出中…':'檢舉 / 回報'}</button>}
