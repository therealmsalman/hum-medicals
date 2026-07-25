import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

export type Submission={id:string;authorId:string;authorName:string;authorEmail:string;title:string;type:string;abstract:string;manuscript:string;status:'Submitted — Under Review';createdAt:string};
const submissionsPath=path.join(process.cwd(),'data','submissions.json');
const redisUrl=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const redisToken=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const redis=redisUrl&&redisToken?new Redis({url:redisUrl,token:redisToken}):null;
const isHosted=process.env.NODE_ENV==='production'||Boolean(process.env.VERCEL);
const submissionKey=(id:string)=>`hum-medicals:submission:${id}`;
const authorListKey=(authorId:string)=>`hum-medicals:submission-ids:${authorId}`;
function storageError(){return new Error('Submission storage is not configured. Connect Upstash Redis in the Vercel Marketplace, then redeploy.');}
function readLocal(){try{return JSON.parse(fs.readFileSync(submissionsPath,'utf8')||'[]') as Submission[];}catch{return [];}}
function writeLocal(items:Submission[]){fs.mkdirSync(path.dirname(submissionsPath),{recursive:true});fs.writeFileSync(submissionsPath,JSON.stringify(items,null,2));}

export async function createSubmission(input:Omit<Submission,'id'|'status'|'createdAt'>){
  const submission:Submission={...input,id:crypto.randomUUID(),status:'Submitted — Under Review',createdAt:new Date().toISOString()};
  if(redis){await redis.set(submissionKey(submission.id),submission);await redis.lpush(authorListKey(submission.authorId),submission.id);return submission;}
  if(isHosted)throw storageError();
  const items=readLocal();items.unshift(submission);writeLocal(items);return submission;
}

export async function getSubmissionsForAuthor(authorId:string){
  if(redis){const ids=await redis.lrange<string>(authorListKey(authorId),0,49);const entries=await Promise.all(ids.map(id=>redis.get<Submission>(submissionKey(id))));return entries.filter((item):item is Submission=>Boolean(item));}
  if(isHosted)throw storageError();
  return readLocal().filter(item=>item.authorId===authorId);
}
