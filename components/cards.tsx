import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clock, FileText } from 'lucide-react';
import type { ContentItem } from '@/lib/content';

export function Tag({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
      {children}
    </span>
  );
}

export function ContentCard({ item, kind = 'publication' }: { item: ContentItem; kind?: string }) {
  const readTime = Math.max(3, Math.ceil((item.body?.length || 800) / 700));

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-xl hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-teal-500/30 dark:hover:shadow-slate-950/50">
      {/* Top Gradient Edge Accent */}
      <div className="absolute left-0 top-0 h-1 w-14 bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300 group-hover:w-full" />

      {/* Meta Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Tag>{item.topic}</Tag>
        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          <Clock size={12} /> {readTime} min read
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
        <Link href={`/${kind}s/${item.slug}`} className="focus:outline-none">
          {item.title}
        </Link>
      </h3>

      {/* Abstract */}
      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {item.abstract}
      </p>

      {/* Footer Byline */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {item.author.charAt(0)}
          </span>
          <span className="line-clamp-1">{item.author}</span>
        </div>
        <Link
          aria-label={`Read ${item.title}`}
          href={`/${kind}s/${item.slug}`}
          className="inline-flex items-center gap-1 font-semibold text-teal-600 transition-transform group-hover:translate-x-0.5 dark:text-teal-400"
        >
          <span>Read</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}

