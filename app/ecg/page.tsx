'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Activity, ArrowRight, CheckCircle2, ChevronRight, HeartPulse, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ecgCases, ecgCategories } from '@/lib/ecg';

const pageSize = 12;

const difficultyColors: Record<string, string> = {
  Foundation: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  Intermediate: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  Advanced: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
};

export default function EcgLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      ecgCases.filter(
        (item) =>
          (category === 'All' || item.category === category) &&
          `${item.title} ${item.summary} ${item.difficulty}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, category]
  );

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  const change = (value: string, type: 'query' | 'category') => {
    setPage(1);
    type === 'query' ? setQuery(value) : setCategory(value);
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Clinical Monitor Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 px-4 py-20 text-white dark:border-slate-800 sm:px-6 md:py-24 lg:px-8">
        <Image
          src="/ecg-case-library-hero.png"
          alt="ECG tracing and clinical tools"
          fill
          priority
          className="object-cover object-center opacity-30 mix-blend-luminosity"
        />
        <div className="ecg-grid-bg pointer-events-none absolute inset-0 opacity-45" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-950/60 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur">
              <HeartPulse size={13} className="text-rose-400" />
              Interactive Diagnostic Engine
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              100 ECG Case Studies for{' '}
              <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Bedside Mastery.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Work through systematic rhythm interpretations, axis determination, ischemic patterns, chamber abnormalities, electrolyte disturbances, and pacing modalities.
            </p>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Search & Category Filter */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={18} />
              <input
                value={query}
                onChange={(event) => change(event.target.value, 'query')}
                className="premium-input pl-10"
                placeholder="Search ECGs by rhythm, lead, pathology (e.g. STEMI, WPW, hyperkalaemia)…"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="ecg-category" className="sr-only">
                Category
              </label>
              <select
                id="ecg-category"
                value={category}
                onChange={(event) => change(event.target.value, 'category')}
                className="premium-input md:w-56"
              >
                <option value="All">All Categories</option>
                {ecgCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => change('All', 'category')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                category === 'All'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All
            </button>
            {ecgCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => change(item, 'category')}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  category === item
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Count Bar */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {filtered.length} detailed ECG case studies matching criteria
          </span>
          <span>
            Page {page} of {pages}
          </span>
        </div>

        {/* Cards Grid */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const diffClass = difficultyColors[item.difficulty] || 'bg-slate-100 text-slate-700 border-slate-200';
            return (
              <article
                key={item.slug}
                className="paper-panel group flex flex-col justify-between p-6 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {item.category}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${diffClass}`}>
                      {item.difficulty}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                    <Link href={`/ecg/${item.slug}`}>{item.title}</Link>
                  </h2>

                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    href={`/ecg/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 transition-transform group-hover:translate-x-1 dark:text-teal-400"
                  >
                    <span>Analyze ECG Case</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <nav aria-label="ECG case pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="outline-button px-4 py-2 text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  page === number
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {number}
              </button>
            ))}
            <button
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
              className="outline-button px-4 py-2 text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}

