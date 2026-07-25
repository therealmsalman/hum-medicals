import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

export type Subscriber={email:string;subscribedAt:string};
const subscribersPath=path.join(process.cwd(),'data','subscribers.json');
const redisUrl=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const redisToken=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const redis=redisUrl&&redisToken?new Redis({url:redisUrl,token:redisToken}):null;
const isHosted=process.env.NODE_ENV==='production'||Boolean(process.env.VERCEL);
function readLocal(){try{return JSON.parse(fs.readFileSync(subscribersPath,'utf8')||'[]') as Subscriber[];}catch{return [];}}
function writeLocal(items:Subscriber[]){fs.mkdirSync(path.dirname(subscribersPath),{recursive:true});fs.writeFileSync(subscribersPath,JSON.stringify(items,null,2));}
export async function addSubscriber(email:string){
  const normalized=email.trim().toLowerCase();const subscriber:Subscriber={email:normalized,subscribedAt:new Date().toISOString()};
  if(redis){const created=await redis.setnx(`hum-medicals:subscriber:${normalized}`,subscriber);if(created)await redis.sadd('hum-medicals:subscriber-emails',normalized);return {subscriber,created:Boolean(created)};}
  if(isHosted)throw new Error('Subscriber storage is not configured. Connect Upstash Redis in the Vercel Marketplace, then redeploy.');
  const items=readLocal();if(items.some(item=>item.email===normalized))return {subscriber:items.find(item=>item.email===normalized)!,created:false};items.push(subscriber);writeLocal(items);return {subscriber,created:true};
}
