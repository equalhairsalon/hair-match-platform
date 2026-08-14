import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const allowed=new Set(['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']);
export async function POST(req:Request){
  const session=await getSession();
  if(!session) return NextResponse.json({ok:false,message:'請先登入後再上傳照片'},{status:401});
  if(!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ok:false,code:'BLOB_NOT_CONFIGURED',message:'Set BLOB_READ_WRITE_TOKEN to enable persistent image uploads.'},{status:503});
  const data=await req.formData(); const file=data.get('file'); const kind=String(data.get('kind')||'demand').replace(/[^a-z0-9_-]/gi,'').slice(0,30)||'upload';
  if(!(file instanceof File)) return NextResponse.json({ok:false,message:'file required'},{status:400});
  if(file.size>10*1024*1024) return NextResponse.json({ok:false,message:'單張照片上限 10MB'},{status:413});
  if(file.type && !allowed.has(file.type)) return NextResponse.json({ok:false,message:'只接受相片格式 JPEG / PNG / WebP / HEIC'},{status:415});
  const ext=(file.name.split('.').pop()||'jpg').replace(/[^a-z0-9]/gi,'').slice(0,8)||'jpg';
  const blob=await put(`users/${session.id}/${kind}/${crypto.randomUUID()}.${ext}`,file,{access:'public'});
  return NextResponse.json({ok:true,url:blob.url});
}
