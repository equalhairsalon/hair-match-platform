import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { hasDatabase, query } from '@/lib/server-db';

export type SessionUser = {
  id:string;
  role:'customer'|'designer'|'salon_owner'|'admin';
  displayName:string;
  email?:string|null;
};

const COOKIE_NAME='hairmatch_session';

function authSecretValue(){
  return process.env.AUTH_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-hair-match-secret-change-me-2026' : '');
}

export function assertAuthConfigured(){
  if(!authSecretValue()) throw new Error('AUTH_SECRET is not configured');
}

function secret(){
  assertAuthConfigured();
  return new TextEncoder().encode(authSecretValue());
}

export async function setSession(user:SessionUser){
  const token=await new SignJWT({role:user.role,displayName:user.displayName,email:user.email||null})
    .setProtectedHeader({alg:'HS256'})
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
  const jar=await cookies();
  jar.set(COOKIE_NAME,token,{
    httpOnly:true,
    sameSite:'lax',
    secure:process.env.NODE_ENV==='production',
    path:'/',
    maxAge:60*60*24*30,
  });
}

export async function clearSession(){
  const jar=await cookies();
  jar.set(COOKIE_NAME,'',{
    httpOnly:true,
    sameSite:'lax',
    secure:process.env.NODE_ENV==='production',
    path:'/',
    maxAge:0,
  });
}

/**
 * Reads the signed cookie, then refreshes role/display name/status from Neon.
 * This intentionally prevents a stale JWT role from blocking a user who was
 * promoted to Super Admin after the cookie was originally issued.
 */
export async function getSession():Promise<SessionUser|null>{
  try{
    const jar=await cookies();
    const token=jar.get(COOKIE_NAME)?.value;
    if(!token) return null;
    const {payload}=await jwtVerify(token,secret());
    if(!payload.sub) return null;

    const cookieUser:SessionUser={
      id:payload.sub,
      role:(typeof payload.role==='string'?payload.role:'customer') as SessionUser['role'],
      displayName:typeof payload.displayName==='string'?payload.displayName:'會員',
      email:typeof payload.email==='string'?payload.email:null,
    };

    // Production source of truth is the database, not the role cached in JWT.
    if(hasDatabase()){
      try{
        const r=await query<{
          id:string;
          display_name:string;
          email:string;
          role:SessionUser['role'];
          account_status:string;
        }>(`select id,display_name,email,role,account_status from users where id=$1 limit 1`,[payload.sub]);
        const u=r.rows[0];
        if(!u || u.account_status!=='active') return null;
        return {id:u.id,role:u.role,displayName:u.display_name,email:u.email};
      }catch(error){
        console.error('session database refresh failed',error);
        // Keep the valid signed session available during a transient DB read issue.
      }
    }

    return cookieUser;
  }catch{
    return null;
  }
}
