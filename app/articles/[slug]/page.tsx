import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, BookOpen, Calendar, Clock, Sparkles, User } from 'lucide-react';
import { getAll, getOne } from '@/lib/content';
import { Tag } from '@/components/cards';

export function generateStaticParams() {
  return getAll('article').map((x) => ({ slug: x.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const x = getOne('article', params.slug);
  return { title: x?.title, description: x?.abstract };
}

export default function Article({ params }: { params: { slug: string } }) {
  const x = getOne('article', params.slug);
  if (!x) return notFound();

  const readTime = Math.max(2, Math.ceil((x.body?.length || 600) / 650));

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Navigation Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/articles" className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400">
          <ArrowLeft size={14} /> Practical Articles
        </Link>
        <span>/</span>
        <span className="text-slate-400">{x.topic}</span>
      </nav>

      {/* Header Banner */}
      <header className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag>{x.topic}</Tag>
            <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {x.type}
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock size={13} /> {readTime} min read
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl md:leading-tight">
          {x.title}
        </h1>

        <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
          {x.abstract}
        </p>

        {/* Author Byline Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-500/10 font-bold text-teal-700 dark:text-teal-300">
              <User size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{x.author}</p>
              <p className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar size={12} /> Published {x.date}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <div className="mx-auto mt-10 max-w-3xl">
        <div className="mb-8 flex flex-wrap gap-2">
          {x.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>

        {/* Clinical Pearl Callout */}
        <div className="mb-8 rounded-2xl border border-teal-500/30 bg-teal-50/60 p-4 text-xs leading-relaxed text-teal-950 dark:bg-teal-950/30 dark:text-teal-200">
          <strong className="block font-bold">Bedside Learning Note:</strong>
          This article is structured to provide clear, actionable sequences for clinical reasoning, ward rounds, and patient examination. Verify against local clinical guidelines.
        </div>

        {/* Prose Body */}
        <div className="prose">
          {x.body.split('\n').map((p, i) =>
            p.startsWith('## ') ? (
              <h2 key={i} className="border-b border-slate-200/80 pb-2 dark:border-slate-800">
                {p.slice(3)}
              </h2>
            ) : p ? (
              <p key={i}>{p}</p>
            ) : null
          )}
        </div>

        {/* Bottom Back Button */}
        <div className="mt-12 text-center">
          <Link href="/articles" className="outline-button px-6 py-2.5 text-xs font-semibold">
            ← Return to Articles Catalog
          </Link>
        </div>
      </div>
    </article>
  );
}

