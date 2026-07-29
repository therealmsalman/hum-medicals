import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

export type EditorialStatus='submitted'|'reviewed'|'approved'|'changes_requested'|'rejected';
export type SimilarityMatch={title:string;source:'Hum Medicals library'|'Approved community submission';score:number};
export type ReviewReport={reviewedAt:string;model:string;recommendation:'approve'|'changes'|'reject';summary:string;strengths:string[];concerns:string[];safetyEthics:string[];suggestedTopic:string;suggestedCollection:'paper'|'article';similarityScore:number;similarityMatches:SimilarityMatch[]};
export type Submission={id:string;authorId:string;authorName:string;authorEmail:string;title:string;type:string;topic:string;abstract:string;manuscript:string;status:EditorialStatus;createdAt:string;review?:ReviewReport;publishedSlug?:string;publishedCollection?:'paper'|'article';adminNote?:string};

const submissionsPath=path.join(process.cwd(),'data','submissions.json');
const redisUrl=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const redisToken=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const redis=redisUrl&&redisToken?new Redis({url:redisUrl,token:redisToken}):null;
const isHosted=process.env.NODE_ENV==='production'||Boolean(process.env.VERCEL);
const submissionKey=(id:string)=>`hum-medicals:submission:${id}`;
const authorListKey=(authorId:string)=>`hum-medicals:submission-ids:${authorId}`;
const allListKey='hum-medicals:submission-all-ids';
function storageError(){return new Error('Submission storage is not configured. Connect Upstash Redis in the Vercel Marketplace, then redeploy.');}
function readLocal(){try{return JSON.parse(fs.readFileSync(submissionsPath,'utf8')||'[]') as Submission[];}catch{return [];}}
function writeLocal(items:Submission[]){fs.mkdirSync(path.dirname(submissionsPath),{recursive:true});fs.writeFileSync(submissionsPath,JSON.stringify(items,null,2));}

export function statusLabel(status:EditorialStatus|string){return ({submitted:'Submitted — Under Review',reviewed:'AI Review Complete',approved:'Approved — Published',changes_requested:'Changes Requested',rejected:'Not Approved'} as Record<string,string>)[status]||'Submitted — Under Review';}
export async function createSubmission(input:Omit<Submission,'id'|'status'|'createdAt'>){const submission:Submission={...input,id:crypto.randomUUID(),status:'submitted',createdAt:new Date().toISOString()};if(redis){await redis.set(submissionKey(submission.id),submission);await redis.lpush(authorListKey(submission.authorId),submission.id);await redis.lpush(allListKey,submission.id);return submission;}if(isHosted)throw storageError();const items=readLocal();items.unshift(submission);writeLocal(items);return submission;}
export async function getSubmission(id:string){if(redis)return (await redis.get<Submission>(submissionKey(id)))||null;if(isHosted)throw storageError();return readLocal().find(item=>item.id===id)||null;}
export async function getSubmissionsForAuthor(authorId:string){if(redis){const ids=await redis.lrange<string>(authorListKey(authorId),0,49);const entries=await Promise.all(ids.map(id=>redis.get<Submission>(submissionKey(id))));return entries.filter((item):item is Submission=>Boolean(item));}if(isHosted)throw storageError();return readLocal().filter(item=>item.authorId===authorId);}
export async function getAllSubmissions(){if(redis){const ids=await redis.lrange<string>(allListKey,0,499);const entries=await Promise.all(ids.map(id=>redis.get<Submission>(submissionKey(id))));return entries.filter((item):item is Submission=>Boolean(item));}if(isHosted)throw storageError();return readLocal();}
export async function updateSubmission(id:string,changes:Partial<Omit<Submission,'id'|'authorId'|'authorName'|'authorEmail'|'createdAt'>>){const current=await getSubmission(id);if(!current)throw new Error('Submission not found.');const updated:Submission={...current,...changes};if(redis){await redis.set(submissionKey(id),updated);return updated;}if(isHosted)throw storageError();const items=readLocal().map(item=>item.id===id?updated:item);writeLocal(items);return updated;}
