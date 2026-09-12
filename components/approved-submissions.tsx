'use client';

import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { PublishedContent } from '@/lib/published-content';

export function ApprovedSubmissions({ collection }: { collection: 'paper' | 'article' }) {
  const [items, setItems] = useState<PublishedContent[]>([]);
  const [topic, setTopic] = useState('All');

  useEffect(() => {
    fetch(`/api/published?collection=${collection}`)
      .then((response) => (response.ok ? response.json() : { items: [] }))
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]));
  }, [collection]);

  const topics = useMemo(() => Array.from(new Set(items.map((item) => item.topic))).sort(), [items]);
  const visible = topic === 'All' ? items : items.filter((item) => item.topic === topic);

  if (!items.length) return null;

  return (
    <section className="recent-author-work mb-16 rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-500/5 via-slate-50 to-white p-6 dark:from-teal-950/20 dark:via-slate-900/40 dark:to-[#090d16] sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            <Sparkles size={13} />
            Community Author Spotlight
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Recent Peer-Approved Works
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Recently submitted and editorially reviewed manuscripts from doctors, researchers, and trainees worldwide.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-approved" className="sr-only">
            Filter topic
          </label>
          <select
            id="filter-approved"
            aria-label="Filter approved author work by topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All Disciplines</option>
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.slice(0, 9).map((item, index) => (
          <article
            key={item.id}
            className="paper-panel recent-publication-card flex flex-col justify-between p-6"
            style={{ '--card-index': index } as React.CSSProperties}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  {item.topic}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={12} /> Approved
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                <Link href={`/published/${item.slug}`}>{item.title}</Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {item.abstract}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
              <span className="line-clamp-1">
                {item.author} · {item.date}
              </span>
              <Link
                href={`/published/${item.slug}`}
                aria-label={`Read ${item.title}`}
                className="inline-flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400"
              >
                <span>Read</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {!visible.length && (
        <p className="mt-6 text-center text-xs text-slate-500">
          No approved community work has been published in this topic yet.
        </p>
      )}
    </section>
  );
}

