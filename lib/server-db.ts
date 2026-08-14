import { Pool, PoolClient, QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function hasDatabase(){
  return Boolean(process.env.DATABASE_URL);
}

export function db(){
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  if(!pool){
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {rejectUnauthorized:false} : undefined,
      max: 5,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 8_000,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text:string, params:unknown[]=[]){
  return db().query<T>(text, params);
}

export async function transaction<T>(fn:(client:PoolClient)=>Promise<T>){
  const client=await db().connect();
  try{
    await client.query('begin');
    const result=await fn(client);
    await client.query('commit');
    return result;
  }catch(error){
    await client.query('rollback');
    throw error;
  }finally{
    client.release();
  }
}
