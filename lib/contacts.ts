import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

export type ContactMessage={name:string;email:string;subject:string;message:string;receivedAt:string};
const contactsPath=path.join(process.cwd(),'data','contact-messages.json');
const redisUrl=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const redisToken=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const redis=redisUrl&&redisToken?new Redis({url:redisUrl,token:redisToken}):null;
const isHosted=process.env.NODE_ENV==='production'||Boolean(process.env.VERCEL);

function readLocal(){try{return JSON.parse(fs.readFileSync(contactsPath,'utf8')||'[]') as ContactMessage[];}catch{return [];}}
function writeLocal(items:ContactMessage[]){fs.mkdirSync(path.dirname(contactsPath),{recursive:true});fs.writeFileSync(contactsPath,JSON.stringify(items,null,2));}

export async function saveContactMessage(input:Omit<ContactMessage,'receivedAt'>){
  const item:ContactMessage={...input,receivedAt:new Date().toISOString()};
  if(redis){
    const id=`hum-medicals:contact:${Date.now()}:${crypto.randomUUID()}`;
    await redis.set(id,item);
    await redis.lpush('hum-medicals:contact-messages',id);
    return item;
  }
  if(isHosted)throw new Error('Message storage is not configured. Connect Upstash Redis in the Vercel Marketplace, then redeploy.');
  const items=readLocal();items.unshift(item);writeLocal(items);return item;
}
