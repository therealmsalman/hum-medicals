import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

export type PublishedContent={id:string;slug:string;title:string;author:string;date:string;topic:string;type:string;abstract:string;body:string;tags:string[];references:string[];collection:'paper'|'article';sourceSubmissionId:string};
const publishedPath=path.join(process.cwd(),'data','published-submissions.json');
const redisUrl=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const redisToken=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const redis=redisUrl&&redisToken?new Redis({url:redisUrl,token:redisToken}):null;
const isHosted=process.env.NODE_ENV==='production'||Boolean(process.env.VERCEL);
const itemKey=(slug:string)=>`hum-medicals:published:${slug}`;
const listKey='hum-medicals:published-slugs';
function storageError(){return new Error('Publication storage is not configured. Connect Upstash Redis in the Vercel Marketplace, then redeploy.');}
function readLocal(){try{return JSON.parse(fs.readFileSync(publishedPath,'utf8')||'[]') as PublishedContent[];}catch{return [];}}
function writeLocal(items:PublishedContent[]){fs.mkdirSync(path.dirname(publishedPath),{recursive:true});fs.writeFileSync(publishedPath,JSON.stringify(items,null,2));}
export function slugify(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,100);}
export async function createPublishedContent(input:Omit<PublishedContent,'id'|'slug'|'date'>){const base=slugify(input.title)||'hum-medicals-submission';const slug=`${base}-${crypto.randomUUID().slice(0,8)}`;const item:PublishedContent={...input,id:crypto.randomUUID(),slug,date:new Intl.DateTimeFormat('en',{dateStyle:'medium'}).format(new Date())};if(redis){await redis.set(itemKey(slug),item);await redis.lpush(listKey,slug);return item;}if(isHosted)throw storageError();const items=readLocal();items.unshift(item);writeLocal(items);return item;}
export async function getPublishedContent(collection?:'paper'|'article'){if(redis){const slugs=await redis.lrange<string>(listKey,0,499);const values=await Promise.all(slugs.map(slug=>redis.get<PublishedContent>(itemKey(slug))));return values.filter((item):item is PublishedContent=>Boolean(item)).filter(item=>!collection||item.collection===collection);}if(isHosted)throw storageError();return readLocal().filter(item=>!collection||item.collection===collection);}
export async function getPublishedBySlug(slug:string){if(redis)return (await redis.get<PublishedContent>(itemKey(slug)))||null;if(isHosted)throw storageError();return readLocal().find(item=>item.slug===slug)||null;}
