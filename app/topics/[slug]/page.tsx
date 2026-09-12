import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ContentCard } from '@/components/cards';
import { related, topics } from '@/lib/content';
import { ChevronRight, Layers, BookOpen, ArrowLeft } from 'lucide-react';

export function generateStaticParams() {
  return topics.map((topic) => ({
    slug: topic.toLowerCase().replaceAll(' ', '-'),
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const topic = topics.find(
    (name) => name.toLowerCase().replaceAll(' ', '-') === params.slug
  );
  if (!topic) return { title: 'Specialty Not Found' };
  return {
    title: `${topic} Clinical Library | Hum Medicals`,
    description: `Evidence-informed publications, clinical primers, and case reviews in ${topic}.`,
  };
}

export default function Topic({ params }: { params: { slug: string } }) {
  const topic = topics.find(
    (name) => name.toLowerCase().replaceAll(' ', '-') === params.slug
  );
  if (!topic) return notFound();

  const items = related(topic);
  const publications = items.filter((i) => i.collection === 'paper');
  const articles = items.filter((i) => i.collection === 'article');

  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/topics"
            className="flex items-center gap-1 transition hover:text-teal-600 dark:hover:text-teal-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Specialties</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{topic}</span>
        </nav>

        {/* Header Hero Banner */}
        <header className="mt-6 overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent p-8 sm:p-10 shadow-lg shadow-teal-500/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <Layers className="h-3.5 w-3.5" />
              <span>Specialty Archive</span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-slate-600 dark:text-slate-400">
              <span className="rounded-md bg-white/70 px-2.5 py-1 dark:bg-obsidian">
                {publications.length} Publications
              </span>
              <span className="rounded-md bg-white/70 px-2.5 py-1 dark:bg-obsidian">
                {articles.length} Primers
              </span>
            </div>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {topic}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            Curated evidence-informed publications, peer-reviewed case summaries, and bedside clinical primers focused on {topic.toLowerCase()}.
          </p>
        </header>

        {/* Content Section */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-white/10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              All Literature ({items.length})
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing publications and clinical primers
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ContentCard
                key={`${item.collection}-${item.slug}`}
                item={item}
                kind={item.collection === 'paper' ? 'publication' : 'article'}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
