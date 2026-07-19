import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

export type User = { id:string; name:string; email:string; passwordHash:string; salt:string; createdAt:string };
const usersPath = path.join(process.cwd(), 'data', 'users.json');
const secret = process.env.AUTH_SECRET || 'change-this-local-development-secret-before-production';

function readUsers():User[]{ try { return JSON.parse(fs.readFileSync(usersPath,'utf8') || '[]'); } catch { return []; } }
function writeUsers(users:User[]){ fs.mkdirSync(path.dirname(usersPath),{recursive:true}); fs.writeFileSync(usersPath,JSON.stringify(users,null,2)); }
function hash(password:string,salt:string){ return crypto.scryptSync(password,salt,64).toString('hex'); }
export function createUser(name:string,email:string,password:string){ const users=readUsers(); const normalized=email.trim().toLowerCase(); if(users.some(user=>user.email===normalized)) throw new Error('An account with this email already exists.'); const salt=crypto.randomBytes(16).toString('hex'); const user:User={id:crypto.randomUUID(),name:name.trim(),email:normalized,passwordHash:hash(password,salt),salt,createdAt:new Date().toISOString()}; users.push(user); writeUsers(users); return user; }
export function authenticate(email:string,password:string){ const user=readUsers().find(item=>item.email===email.trim().toLowerCase()); if(!user || !crypto.timingSafeEqual(Buffer.from(user.passwordHash,'hex'),Buffer.from(hash(password,user.salt),'hex'))) return null; return user; }
function sign(value:string){return crypto.createHmac('sha256',secret).update(value).digest('base64url');}
export function createSession(user:User){ const payload=Buffer.from(JSON.stringify({id:user.id,email:user.email,expires:Date.now()+1000*60*60*24*7})).toString('base64url'); return `${payload}.${sign(payload)}`; }
export function currentUser(){ const token=cookies().get('hum_medicals_session')?.value; if(!token)return null; const [payload,signature]=token.split('.'); if(!payload||!signature||signature!==sign(payload))return null; try{const value=JSON.parse(Buffer.from(payload,'base64url').toString()); if(value.expires<Date.now())return null; return readUsers().find(user=>user.id===value.id&&user.email===value.email)||null;}catch{return null;} }
export const publicUser=(user:User)=>({id:user.id,name:user.name,email:user.email,createdAt:user.createdAt});
export function setSession(user:User){cookies().set('hum_medicals_session',createSession(user),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7});}
export function clearSession(){cookies().set('hum_medicals_session','',{httpOnly:true,path:'/',maxAge:0});}
