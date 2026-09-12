import Image from 'next/image';
import type { Metadata } from 'next';
import { CheckCircle2, FileText, HeartHandshake, PenLine, ShieldCheck, Sparkles } from 'lucide-react';
import { PublishingPortal } from '@/components/publishing-portal';

export const metadata: Metadata = {
  title: 'Publish with Hum Medicals | Free Open Access',
  description: 'Submit educational articles and research manuscripts for zero-fee editorial consideration.',
};

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Zero Submission Fees',
    note: 'Hum Medicals charges no article processing charges (APCs), submission fees, or hidden costs. Scholarship remains open to everyone.',
  },
  {
    icon: Sparkles,
    title: 'AI & Peer Editorial Review',
    note: 'Rigorous assessment of clarity, clinical utility, originality, and medical ethics, assisted by internal similarity screening and Gemini decision support.',
  },
  {
    icon: CheckCircle2,
    title: 'Author Workspace & Tracking',
    note: 'Track the editorial progression of your manuscript in real time from submission to approval and live journal indexing.',
  },
];

export default function Publish() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 px-4 py-20 text-white dark:border-slate-800 sm:px-6 md:py-24 lg:px-8">
        <Image
          src="/publishing-desk.png"
          alt="Medical research and manuscript desk"
          fill
          priority
          className="object-cover object-center opacity-35 mix-blend-luminosity"
        />
        <div className="ecg-grid-bg pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-950/60 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur">
              <PenLine size={13} className="text-teal-400" />
              Open-Access Clinical Publishing
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Publish Your Clinical Scholarship,{' '}
              <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Completely Free.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Submit your research articles, clinical reviews, case studies, or educational guides for peer editorial review. Free for authors, free for learners.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits & Standards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="paper-panel p-6 sm:p-8">
                <div className="inline-flex rounded-xl bg-teal-500/10 p-3 text-teal-600 dark:text-teal-400">
                  <Icon size={24} />
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.note}</p>
              </article>
            );
          })}
        </div>

        {/* Editorial Standards Notice */}
        <div className="mt-10 rounded-2xl border border-teal-500/30 bg-teal-50/60 p-5 text-xs leading-relaxed text-teal-950 dark:bg-teal-950/30 dark:text-teal-200">
          <strong className="font-bold">Editorial Quality Standards:</strong> All submitted work must adhere to patient confidentiality (HIPAA / GDPR), consent guidelines, and rigorous academic integrity. Patient-identifiable details must be fully de-identified. Free submission does not guarantee publication without editorial approval.
        </div>

        {/* Interactive Portal */}
        <PublishingPortal />
      </section>
    </div>
  );
}

