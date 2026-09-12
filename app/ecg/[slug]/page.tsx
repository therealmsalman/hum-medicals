import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Activity, AlertTriangle, ArrowLeft, BookOpen, HeartPulse, ShieldAlert, Sparkles } from 'lucide-react';
import { ecgCases, getEcgCase } from '@/lib/ecg';

export function generateStaticParams() {
  return ecgCases.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const item = getEcgCase(params.slug);
  return { title: item?.title, description: item?.summary };
}

export default function EcgCasePage({ params }: { params: { slug: string } }) {
  const item = getEcgCase(params.slug);
  if (!item) return notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalScholarlyArticle',
    headline: item.title,
    description: item.summary,
    author: { '@type': 'Organization', name: 'Hum Medicals' },
    about: item.category,
  };

  return (
    <article className="flex flex-col gap-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Monitor Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 px-4 py-16 text-white dark:border-slate-800 sm:px-6 md:py-20 lg:px-8">
        <Image
          src="/ecg-case-detail-art.png"
          alt="Cardiac conduction system illustration"
          fill
          priority
          className="object-cover object-right opacity-30 mix-blend-luminosity"
        />
        <div className="ecg-grid-bg pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/ecg"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 transition hover:text-white"
          >
            <ArrowLeft size={14} /> Back to ECG Library
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-300">
              {item.category}
            </span>
            <span className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
              Difficulty: {item.difficulty}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-tight">
            {item.title}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {item.summary}
          </p>
        </div>
      </section>

      {/* Main Case Content */}
      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Simulated Telemetry Viewport */}
        <div className="mb-10 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 text-teal-400 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2 font-bold text-teal-300">
              <Activity size={15} /> 12-LEAD TELEMETRY TRACING SIMULATION
            </span>
            <span>25 mm/s · 10 mm/mV · Standard Calibration</span>
          </div>

          <div className="ecg-grid-bg my-6 rounded-2xl border border-teal-500/20 bg-[#060e18] p-6 text-center">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span>Lead II</span>
              <span>Rhythm Strip Continuous</span>
            </div>
            <div className="my-6 overflow-x-auto py-2 font-mono text-xs tracking-widest text-teal-300">
              ──/\_/\/\──────────/\_/\/\──────────/\_/\/\──────────/\_/\/\──
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Analyze P waves, PR interval, QRS morphology, ST deviation, and T wave symmetry below.
            </p>
          </div>
        </div>

        {/* Safety & Learning Callout */}
        <div className="mb-10 rounded-2xl border border-amber-500/30 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <ShieldAlert size={16} /> Clinical Learning Notice
          </div>
          <p className="mt-1">
            This ECG case study is provided for educational and supervised training purposes. In emergency care, prioritize ABCDE stabilization, emergency protocols (e.g. STEMI activation), and senior consultation.
          </p>
        </div>

        {/* Case Narrative & Interpretation Sequence */}
        <div className="prose">
          {item.body.split('\n').map((line, index) =>
            line.startsWith('## ') ? (
              <h2
                key={index}
                className="mt-10 border-b border-slate-200/80 pb-2 text-2xl font-bold tracking-tight text-slate-900 dark:border-slate-800 dark:text-white"
              >
                {line.slice(3)}
              </h2>
            ) : line.startsWith('- ') ? (
              <ul key={index}>
                <li>{line.slice(2)}</li>
              </ul>
            ) : line ? (
              <p key={index}>{line.replaceAll('**', '')}</p>
            ) : null
          )}
        </div>

        {/* References */}
        {item.references?.length > 0 && (
          <section className="mt-14 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <BookOpen size={18} className="text-teal-600 dark:text-teal-400" /> Case References & Guidelines
            </h2>
            <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {item.references.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ol>
          </section>
        )}

        {/* Navigation Return */}
        <div className="mt-12 text-center">
          <Link href="/ecg" className="outline-button px-6 py-2.5 text-xs font-semibold">
            ← Return to ECG Case Library
          </Link>
        </div>
      </section>
    </article>
  );
}

