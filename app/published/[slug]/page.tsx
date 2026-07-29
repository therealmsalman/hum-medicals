import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedBySlug } from '@/lib/published-content';

export default async function PublishedSubmission({params}:{params:{slug:string}}){const item=await getPublishedBySlug(params.slug);if(!item)notFound();return <article className="mx-auto max-w-3xl px-5 py-16"><p className="eyebrow">Editorially approved {item.collection==='paper'?'publication':'article'}</p><h1 className="mt-3 text-5xl leading-tight">{item.title}</h1><p className="mt-5 text-sm text-slate-500">{item.author} · {item.date} · {item.topic}</p><p className="mt-10 border-l-4 border-teal bg-teal/5 p-5 text-lg leading-8">{item.abstract}</p><div className="prose mt-10 whitespace-pre-wrap">{item.body}</div><Link className="outline-button mt-12" href={item.collection==='paper'?'/publications':'/articles'}>Back to {item.collection==='paper'?'publications':'articles'}</Link></article>}
