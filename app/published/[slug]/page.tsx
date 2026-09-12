import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Quote, User } from 'lucide-react';
import { getPublishedBySlug } from '@/lib/published-content';
import { Tag } from '@/components/cards';

export default async function PublishedSubmission({ params }: { params: { slug: string } }) {
  const item = await getPublishedBySlug(params.slug);
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          href={item.collection === 'paper' ? '/publications' : '/articles'}
          className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400"
        >
          <ArrowLeft size={14} /> Back to {item.collection === 'paper' ? 'Publications' : 'Articles'}
        </Link>
        <span>/</span>
        <span className="text-slate-400">{item.topic}</span>
      </nav>

      {/* Header Banner */}
      <header className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tag>{item.topic}</Tag>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 size={13} /> Peer-Approved Manuscript
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl md:leading-tight">
          {item.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 text-xs text-slate-500 dark:border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <User size={15} className="text-teal-600 dark:text-teal-400" />
            <span>Author: {item.author}</span>
          </div>
          <span>·</span>
          <span>Published {item.date}</span>
          <span>·</span>
          <span className="capitalize">{item.collection === 'paper' ? 'Scholarly Publication' : 'Clinical Article'}</span>
        </div>
      </header>

      {/* Abstract & Body */}
      <div className="mx-auto mt-10 max-w-3xl">
        <div className="rounded-2xl border border-teal-500/30 bg-teal-50/60 p-6 text-sm leading-relaxed text-teal-950 dark:bg-teal-950/30 dark:text-teal-200">
          <strong className="block text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
            Manuscript Abstract
          </strong>
          <p className="mt-2 text-slate-700 dark:text-slate-300">{item.abstract}</p>
        </div>

        <div className="prose mt-8 whitespace-pre-wrap">{item.body}</div>

        {/* Citation Notice */}
        <aside className="mt-12 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            <Quote size={15} /> How to Cite
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {item.author}. &ldquo;{item.title}.&rdquo; <em>Hum Medicals Open Publishing</em>, {item.date}.
          </p>
        </aside>

        <div className="mt-12 text-center">
          <Link
            className="outline-button px-6 py-2.5 text-xs font-semibold"
            href={item.collection === 'paper' ? '/publications' : '/articles'}
          >
            ← Return to {item.collection === 'paper' ? 'Publications' : 'Articles'}
          </Link>
        </div>
      </div>
    </article>
  );
}

