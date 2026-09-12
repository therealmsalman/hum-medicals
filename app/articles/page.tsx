'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Search, Sparkles } from 'lucide-react';
import { ContentCard } from '@/components/cards';
import { getAll, topics } from '@/lib/content';
import { ApprovedSubmissions } from '@/components/approved-submissions';

const pageSize = 9;

export default function Articles() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All');
  const [page, setPage] = useState(1);

  const list = useMemo(
    () =>
      getAll('article').filter(
        (item) =>
          (topic === 'All' || item.topic === topic) &&
          `${item.title} ${item.abstract} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query, topic]
  );

  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const visible = list.slice((page - 1) * pageSize, page * pageSize);

  const update = (value: string, kind: 'query' | 'topic') => {
    setPage(1);
    kind === 'query' ? setQuery(value) : setTopic(value);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="max-w-3xl">
        <p className="eyebrow">
          <BookOpen size={13} className="text-teal-600 dark:text-teal-400" /> Bedside & Practice Guides
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Clinical Articles & Primers
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
          150 focused practical guides designed for ward rounds, clinical examinations, patient communication, and everyday diagnostic problem solving.
        </p>
      </div>

      {/* Community Approved Articles */}
      <div className="mt-12">
        <ApprovedSubmissions collection="article" />
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={18} />
            <input
              aria-label="Search articles"
              value={query}
              onChange={(event) => update(event.target.value, 'query')}
              placeholder="Search practical articles by topic, physical sign, or keyword…"
              className="premium-input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="article-topic-filter" className="sr-only">
              Filter by topic
            </label>
            <select
              id="article-topic-filter"
              aria-label="Filter topic"
              value={topic}
              onChange={(event) => update(event.target.value, 'topic')}
              className="premium-input md:w-56"
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

        {/* Quick Topic Chips */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => update('All', 'topic')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              topic === 'All'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All
          </button>
          {topics.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => update(item, 'topic')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                topic === item
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Meta Stats */}
      <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing {visible.length} of {list.length} article{list.length !== 1 ? 's' : ''}
        </span>
        <span>
          Page {page} of {pages}
        </span>
      </div>

      {/* Cards Grid */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <ContentCard key={item.slug} item={item} kind="article" />
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <nav aria-label="Article pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
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
              aria-current={page === number ? 'page' : undefined}
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
  );
}


