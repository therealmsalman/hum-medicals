import { NewsletterForm } from '@/components/forms';
import { Mail, CheckCircle2, ShieldCheck, Sparkles, HeartPulse, FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clinical Brief Subscription | Hum Medicals',
  description: 'Subscribe to the Hum Medicals weekly clinical brief. Evidence-informed cardiology cases, ECG breakdowns, and open-access publications delivered to your inbox.',
};

export default function Subscribe() {
  return (
    <div className="relative py-20 md:py-28">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:28px_28px] opacity-15" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[450px] w-[650px] rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
          <Mail className="h-3.5 w-3.5" />
          <span>The Hum Medicals Weekly Brief</span>
        </div>

        <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Keep high-precision clinical learning in view.
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Receive distilled cardiology pearls, telemetry case breakdowns, and open-access publication notifications. Zero marketing spam—only evidence-informed clinical intuition.
        </p>

        {/* Subscription Form Card */}
        <div className="glass-panel mx-auto mt-10 rounded-3xl p-6 sm:p-8 text-left shadow-xl shadow-teal-500/5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Join 5,000+ Healthcare Readers
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Free Forever
            </span>
          </div>

          <div className="mt-6">
            <NewsletterForm />
          </div>

          {/* Value inclusions */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200/70 pt-6 dark:border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
              <span>Bi-weekly 12-lead ECG challenge cases</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
              <span>Guidelines synthesized into bedside pearls</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
              <span>New open-access paper announcements</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
              <span>One-click unsubscribe at any time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
