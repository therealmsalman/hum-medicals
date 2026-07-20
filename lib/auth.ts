import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';

export type User = { id:string; name:string; email:string; passwordHash:string; salt:string; createdAt:string };

const usersPath = path.join(process.cwd(), 'data', 'users.json');
const secret = process.env.AUTH_SECRET || 'change-this-local-development-secret-before-production';
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const isHosted = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const emailKey = (email:string) => `hum-medicals:user:email:${email}`;
const idKey = (id:string) => `hum-medicals:user:id:${id}`;

function readLocalUsers():User[]{ try { return JSON.parse(fs.readFileSync(usersPath,'utf8') || '[]'); } catch { return []; } }
function writeLocalUsers(users:User[]){ fs.mkdirSync(path.dirname(usersPath),{recursive:true}); fs.writeFileSync(usersPath,JSON.stringify(users,null,2)); }
function hash(password:string,salt:string){ return crypto.scryptSync(password,salt,64).toString('hex'); }
function normalizedEmail(email:string){ return email.trim().toLowerCase(); }
function storageError(){ return new Error('Account storage is not configured. Connect Upstash Redis in the Vercel Marketplace, then redeploy.'); }

async function findUserByEmail(email:string){
  const normalized = normalizedEmail(email);
  if (redis) return (await redis.get<User>(emailKey(normalized))) || null;
  if (isHosted) throw storageError();
  return readLocalUsers().find(user => user.email === normalized) || null;
}

async function findUserById(id:string){
  if (redis) return (await redis.get<User>(idKey(id))) || null;
  if (isHosted) throw storageError();
  return readLocalUsers().find(user => user.id === id) || null;
}

export async function createUser(name:string,email:string,password:string){
  const normalized = normalizedEmail(email);
  const salt = crypto.randomBytes(16).toString('hex');
  const user:User = { id:crypto.randomUUID(), name:name.trim(), email:normalized, passwordHash:hash(password,salt), salt, createdAt:new Date().toISOString() };
  if (redis) {
    const created = await redis.setnx(emailKey(normalized), user);
    if (!created) throw new Error('An account with this email already exists.');
    await redis.set(idKey(user.id), user);
    return user;
  }
  if (isHosted) throw storageError();
  const users = readLocalUsers();
  if (users.some(item => item.email === normalized)) throw new Error('An account with this email already exists.');
  users.push(user); writeLocalUsers(users); return user;
}

export async function authenticate(email:string,password:string){
  const user = await findUserByEmail(email);
  if (!user) return null;
  const expected = Buffer.from(user.passwordHash,'hex');
  const received = Buffer.from(hash(password,user.salt),'hex');
  return expected.length === received.length && crypto.timingSafeEqual(expected,received) ? user : null;
}

function sign(value:string){ return crypto.createHmac('sha256',secret).update(value).digest('base64url'); }
export function createSession(user:User){ const payload=Buffer.from(JSON.stringify({id:user.id,email:user.email,expires:Date.now()+1000*60*60*24*7})).toString('base64url'); return `${payload}.${sign(payload)}`; }
export async function currentUser(){
  const token=cookies().get('hum_medicals_session')?.value;
  if(!token)return null;
  const [payload,signature]=token.split('.');
  if(!payload||!signature||signature!==sign(payload))return null;
  try{ const value=JSON.parse(Buffer.from(payload,'base64url').toString()); if(value.expires<Date.now())return null; const user=await findUserById(value.id); return user?.email===value.email ? user : null; }catch{return null;}
}
export const publicUser=(user:User)=>({id:user.id,name:user.name,email:user.email,createdAt:user.createdAt});
export function setSession(user:User){cookies().set('hum_medicals_session',createSession(user),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7});}
export function clearSession(){cookies().set('hum_medicals_session','',{httpOnly:true,path:'/',maxAge:0});}
