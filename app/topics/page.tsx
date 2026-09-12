import Image from 'next/image';
import Link from 'next/link';
import { topics, related } from '@/lib/content';
import {
  Heart,
  Activity,
  ShieldAlert,
  Stethoscope,
  HeartPulse,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';

export const metadata = {
  title: 'Clinical Specialties & Topic Library | Hum Medicals',
  description: 'Explore structured clinical learning resources across Cardiology, Echocardiography, Critical Care, Clinical Medicine, and Preventive Cardiology.',
};

const topicMeta: Record<string, { icon: typeof Heart; focus: string; highlights: string[] }> = {
  'Cardiology': {
    icon: Heart,
    focus: 'Acute coronary syndromes, arrhythmia analysis, hemodynamics, and heart failure phenotypes.',
    highlights: ['12-Lead ECG Analysis', 'Troponin Elevation', 'Heart Failure Phenotypes', 'Arrhythmia Management'],
  },
  'Echocardiography': {
    icon: Activity,
    focus: 'Image acquisition, Doppler measurement validity, diastolic parameters, and valvular quantification.',
    highlights: ['Parasternal Long Axis', 'Diastolic Grading', 'Valvular Regurgitation', 'Pericardial Tamponade'],
  },
  'Critical Care': {
    icon: ShieldAlert,
    focus: 'Bedside hemodynamics, undifferentiated shock, vasopressor titration, and acute resuscitation.',
    highlights: ['Undifferentiated Shock', 'Lactate Kinetics', 'Vasopressor Protocols', 'Fluid Responsiveness'],
  },
  'Clinical Medicine': {
    icon: Stethoscope,
    focus: 'Structured clinical reasoning, bedside physical exam skills, cognitive bias mitigation, and patient handover.',
    highlights: ['Problem Representation', 'Bedside Physical Exam', 'Clinical Handover (SBAR)', 'Diagnostic Reasoning'],
  },
  'Preventive Cardiology': {
    icon: HeartPulse,
    focus: 'Cardiovascular risk communication, lipid guidelines, lifestyle prescription, and arterial hypertension.',
    highlights: ['Absolute ASCVD Risk', 'Lipid Optimization', 'Exercise Prescriptions', 'Hypertension Control'],
  },
};

export default function Topics() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 py-20 text-white dark:border-white/10 md:py-28">
        <Image
          src="/cardiology-art.png"
          alt="Cardiology scientific illustration"
          fill
          priority
          className="object-cover object-right opacity-30 mix-blend-screen"
        />
        {/* Obsidian gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/15 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur-md">
            <Layers className="h-3.5 w-3.5" />
            <span>Clinical Specialty Atlas</span>
          </div>

          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            A deeper library for every stage of clinical learning.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Explore curated, evidence-informed publications and bedside primers organized by medical discipline. Built to help healthcare learners connect symptoms, tests, and sound clinical decisions.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span>5 Core Disciplines</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>300+ Peer-Reviewed Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>100% Free Open Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Bento Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/70 pb-5 dark:border-white/10">
          <div>
            <p className="eyebrow !text-teal-600 dark:!text-teal-400">Curated Disciplines</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Explore by Specialty
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click on any clinical domain to view all related papers and bedside primers.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const slug = topic.toLowerCase().replaceAll(' ', '-');
            const meta = topicMeta[topic] || {
              icon: Stethoscope,
              focus: 'Evidence-informed clinical guides and peer-reviewed educational publications.',
              highlights: ['Clinical Assessment', 'Diagnostic Criteria', 'Bedside Management'],
            };
            const Icon = meta.icon;
            const items = related(topic);

            return (
              <Link
                key={topic}
                href={`/topics/${slug}`}
                className="group glass-panel relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-cyan-500/10 text-teal-600 ring-1 ring-teal-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white dark:text-teal-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {items.length} works
                    </span>
                  </div>

                  <h3 className="mt-5 font-serif text-2xl font-bold text-slate-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                    {topic}
                  </h3>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {meta.focus}
                  </p>

                  {/* Highlights list */}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {meta.highlights.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-slate-100/80 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/5 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-200/60 pt-4 dark:border-white/5">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                    Open Discipline Archive
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 transition group-hover:translate-x-1 group-hover:bg-teal-500 group-hover:text-white dark:text-teal-400">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
