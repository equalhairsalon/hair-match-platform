import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export type SessionUser = {id:string; role:'customer'|'designer'|'salon_owner'|'admin'; displayName:string; email?:string|null};
const COOKIE_NAME='hairmatch_session';

function secret(){
  const value=process.env.AUTH_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-hair-match-secret-change-me-2026' : '');
  if(!value) throw new Error('AUTH_SECRET is not configured');
  return new TextEncoder().encode(value);
}

export async function setSession(user:SessionUser){
  const token=await new SignJWT({role:user.role,displayName:user.displayName,email:user.email||null})
    .setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuedAt().setExpirationTime('30d').sign(secret());
  const jar=await cookies();
  jar.set(COOKIE_NAME,token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*30});
}

export async function clearSession(){
  const jar=await cookies();
  jar.set(COOKIE_NAME,'',{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:0});
}

export async function getSession():Promise<SessionUser|null>{
  try{
    const jar=await cookies();
    const token=jar.get(COOKIE_NAME)?.value;
    if(!token) return null;
    const {payload}=await jwtVerify(token,secret());
    if(!payload.sub || typeof payload.role!=='string' || typeof payload.displayName!=='string') return null;
    return {id:payload.sub,role:payload.role as SessionUser['role'],displayName:payload.displayName,email:typeof payload.email==='string'?payload.email:null};
  }catch{return null}
}
