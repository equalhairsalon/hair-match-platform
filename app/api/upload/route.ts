import { put } from '@vercel/blob'; import { NextResponse } from 'next/server';
export async function POST(req:Request){
  if(!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ok:false,code:'BLOB_NOT_CONFIGURED',message:'Set BLOB_READ_WRITE_TOKEN to enable persistent image uploads.'},{status:503});
  const data=await req.formData(); const file=data.get('file'); if(!(file instanceof File)) return NextResponse.json({ok:false,message:'file required'},{status:400});
  if(file.size>8*1024*1024) return NextResponse.json({ok:false,message:'max 8MB'},{status:413});
  const blob=await put(`uploads/${Date.now()}-${file.name}`,file,{access:'public'}); return NextResponse.json({ok:true,url:blob.url});
}
