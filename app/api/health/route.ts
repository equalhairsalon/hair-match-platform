import { NextResponse } from 'next/server';
import { hasDatabase, query } from '@/lib/server-db';
export async function GET(){
  if(!hasDatabase()) return NextResponse.json({ok:true,app:'hair-match-platform',version:'0.4.0',mode:'demo-no-db'});
  try{await query('select 1');return NextResponse.json({ok:true,app:'hair-match-platform',version:'0.4.0',mode:'database',database:'connected'});}catch(error:any){return NextResponse.json({ok:false,app:'hair-match-platform',version:'0.4.0',mode:'database',database:'error',message:error?.message||'db error'},{status:503})}
}
