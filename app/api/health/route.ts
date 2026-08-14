import { NextResponse } from 'next/server';
export async function GET(){return NextResponse.json({ok:true,app:'hair-match-platform',version:'0.1.0',mode:process.env.DATABASE_URL?'database-ready':'demo'});}
