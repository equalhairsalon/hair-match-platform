'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocateFixed } from 'lucide-react';

export function LocationDiscoverButton(){
 const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 function locate(){
   if(!navigator.geolocation){setError('此瀏覽器不支援定位');return}
   setBusy(true);setError('');
   navigator.geolocation.getCurrentPosition(p=>{const q=new URLSearchParams({lat:String(p.coords.latitude),lng:String(p.coords.longitude)});router.replace(`/discover?${q.toString()}`);setBusy(false)},()=>{setError('定位失敗，請確認瀏覽器定位權限');setBusy(false)},{enableHighAccuracy:true,timeout:10000,maximumAge:120000});
 }
 return <div className="locate-inline"><button className="btn btn-brand" onClick={locate} disabled={busy}><LocateFixed size={15}/>{busy?'定位中…':'使用目前位置排序'}</button>{error&&<span className="small form-inline-error">{error}</span>}</div>
}
