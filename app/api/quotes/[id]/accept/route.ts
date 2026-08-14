import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, transaction } from '@/lib/server-db';
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getSession(); if(!session) return NextResponse.json({ok:false,message:'請先登入'},{status:401});
  if(session.role!=='customer' && session.role!=='admin') return NextResponse.json({ok:false,message:'只有顧客可以選擇方案'},{status:403});
  const {id}=await params;
  try{
    const bookingId=await transaction(async c=>{
      const q=await c.query(`select q.*,d.customer_user_id,dp.salon_id from quotes q join demands d on d.id=q.demand_id left join designer_profiles dp on dp.user_id=q.designer_user_id where q.id=$1 for update`,[id]);
      const row=q.rows[0]; if(!row) throw new Error('找不到報價'); if(row.customer_user_id!==session.id && session.role!=='admin') throw new Error('無權選擇此方案');
      const existing=await c.query(`select id from bookings where demand_id=$1`,[row.demand_id]); if(existing.rows[0]) return existing.rows[0].id as string;
      const b=await c.query(`insert into bookings(demand_id,quote_id,customer_user_id,designer_user_id,salon_id,starts_at,price,status) values($1,$2,$3,$4,$5,$6,$7,'confirmed') returning id`,[row.demand_id,row.id,row.customer_user_id,row.designer_user_id,row.salon_id,row.available_at,row.price]);
      await c.query(`update quotes set status=case when id=$1 then 'accepted'::quote_status else 'declined'::quote_status end where demand_id=$2`,[row.id,row.demand_id]);
      await c.query(`update demands set status='booked' where id=$1`,[row.demand_id]);
      await c.query(`insert into notifications(user_id,type,title,body,data) values($1,'booking','你的方案已被選擇','顧客已選擇你的方案並成立預約',jsonb_build_object('bookingId',$2,'demandId',$3))`,[row.designer_user_id,b.rows[0].id,row.demand_id]);
      return b.rows[0].id as string;
    });
    return NextResponse.json({ok:true,bookingId});
  }catch(error:any){return NextResponse.json({ok:false,message:error?.message||'建立預約失敗'},{status:400})}
}
