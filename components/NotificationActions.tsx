'use client';
import { useRouter } from 'next/navigation';
import { CheckCheck } from 'lucide-react';
export function NotificationActions(){const router=useRouter();async function readAll(){await fetch('/api/notifications',{method:'PATCH'});router.refresh()}return <button className="btn" onClick={readAll}><CheckCheck size={15}/>全部標為已讀</button>}
