import { BrainCircuit, Sparkles } from 'lucide-react';
import { AiWorkspace } from '@/components/ai-workspace';

export const metadata = {
  title: 'Clinical AI Studio & Article Generator',
  description: 'Generate evidence-informed clinical educational drafts and learning guides with the Hum Medicals AI Studio.',
};

export default function AiTools() {
  return (
    <div className="flex flex-col gap-0">
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 px-4 py-16 text-white dark:border-slate-800 sm:px-6 md:py-20 lg:px-8">
        <div className="ecg-grid-bg pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-950/60 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur">
              <Sparkles size={13} className="text-teal-400" />
              Gemini 3.5 Clinical Drafting Engine
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Clinical AI Studio
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Synthesize structured, evidence-guided medical teaching drafts for cardiology, bedside interpretation, and emergency workflows. Review with clinical oversight.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <AiWorkspace />
      </section>
    </div>
  );
}

