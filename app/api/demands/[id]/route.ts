import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/server-db';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getSession(); if(!session) return NextResponse.json({ok:false,message:'請先登入'},{status:401});
  const {id}=await params;
  const d=await query(`select d.*,u.display_name customer_name from demands d left join users u on u.id=d.customer_user_id where d.id=$1 limit 1`,[id]);
  if(!d.rows[0]) return NextResponse.json({ok:false,message:'找不到需求'},{status:404});
  const row:any=d.rows[0];
  if(session.role==='customer' && row.customer_user_id!==session.id) return NextResponse.json({ok:false,message:'無權查看此需求'},{status:403});
  const photos=await query(`select image_url from demand_photos where demand_id=$1 order by sort_order,id`,[id]);
  return NextResponse.json({ok:true,demand:{...row,photo_urls:photos.rows.map((x:any)=>x.image_url)}});
}
