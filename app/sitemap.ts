import type { MetadataRoute } from 'next';
import { getAll,topics } from '@/lib/content';
import { ecgCases } from '@/lib/ecg';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export default function sitemap():MetadataRoute.Sitemap{return ['','/about','/contact','/subscribe','/publish','/publications','/articles','/topics','/ecg','/ai-tools',...getAll('paper').map(x=>`/publications/${x.slug}`),...getAll('article').map(x=>`/articles/${x.slug}`),...topics.map(x=>`/topics/${x.toLowerCase().replaceAll(' ','-')}`),...ecgCases.map(item=>`/ecg/${item.slug}`)].map(path=>({url:siteUrl+path,lastModified:new Date()}))}

