import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Heart,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  Youtube,
  Mail,
  Share2,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About the Founder & Mission | Hum Medicals',
  description: 'Learn about Hum Medicals, founded by Muhammad Salman (KMU-IHS) to provide rigorous, open-access clinical cardiology education and medical intelligence.',
};

export default function About() {
  return (
    <div className="relative">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 py-20 text-white dark:border-white/10 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-500/15 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur-md">
            <Heart className="h-3.5 w-3.5" />
            <span>Our Origin & Purpose</span>
          </div>

          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Clinical education with care, clarity, and intellectual honesty.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Hum Medicals was founded to bridge rigorous clinical bedside training with modern, open-access medical intelligence—turning complex cardiovascular physiology into practical intuition for healthcare providers worldwide.
          </p>
        </div>
      </section>

      {/* Founder Profile Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[400px_1fr] xl:grid-cols-[440px_1fr]">
          {/* Portrait Card */}
          <div className="space-y-6">
            <div className="glass-panel relative aspect-[4/5] overflow-hidden rounded-3xl p-2 shadow-2xl shadow-slate-900/10 dark:shadow-black/60">
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src="/founder-muhammad-salman.jpeg"
                  alt="Muhammad Salman, Founder of Hum Medicals"
                  fill
                  priority
                  className="object-cover object-[56%_center] transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/30 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-200 backdrop-blur-md">
                    <Activity className="h-3 w-3" />
                    <span>Founder & Chief Editor</span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl font-bold">Muhammad Salman</h3>
                  <p className="mt-1 text-xs text-slate-300">
                    BS Cardiology Technology (Final Year), KMU-IHS
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Credentials Card */}
            <div className="glass-panel space-y-3 rounded-3xl p-6 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <GraduationCap className="h-4 w-4 text-teal-500" />
                <span>Academic & Clinical Affiliations</span>
              </div>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-500 mt-0.5" />
                  <span>Khyber Medical University – Institute of Health Sciences (KMU-IHS)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-500 mt-0.5" />
                  <span>Clinical rotations at Bacha Khan Medical Complex (BKMC), Swabi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-500 mt-0.5" />
                  <span>Specialized in Echocardiography, Critical Care & Invasive Cardiology</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Biography & Vision */}
          <div className="space-y-8">
            <div>
              <p className="eyebrow !text-teal-600 dark:!text-teal-400">From Bedside to Global Classroom</p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                A clinical learner building a clearer path for others.
              </h2>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                Muhammad Salman is a final-year BS Cardiology Technology student at <strong>Khyber Medical University – Institute of Health Sciences (KMU-IHS)</strong>, actively rotating through cardiac catheterization labs, echocardiography suites, and intensive coronary care units.
              </p>
              <p>
                Having experienced firsthand the gap between dense medical textbooks and rapid bedside clinical decision-making, he created <strong>Hum Medicals</strong> to synthesize complex guidelines into actionable, evidence-based intuition for medical students, allied health professionals, and clinicians.
              </p>
            </div>

            {/* Inspiring Quote Callout */}
            <div className="relative overflow-hidden rounded-3xl border-l-4 border-teal-500 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent p-6 sm:p-8">
              <p className="font-serif text-xl italic leading-relaxed text-slate-900 dark:text-white sm:text-2xl">
                “The best clinical learning doesn&apos;t just deliver an answer—it makes the clinician&apos;s next question significantly more precise.”
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                — Muhammad Salman
              </p>
            </div>

            {/* Institutional Pillars Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                  Evidence-Informed Rigor
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Every guide references contemporary ESC, ACC/AHA, and Surviving Sepsis consensus literature.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                  Equitable Open Access
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  No paywalls, subscription gates, or APC author fees. Medical knowledge belongs to all who heal.
                </p>
              </div>
            </div>

            {/* Social Channels & Contact */}
            <div className="border-t border-slate-200/80 pt-6 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Connect with the Author & Community
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href="https://youtube.com/@hummedicals?si=IzPk4aOA989NKqwN"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
                >
                  <Youtube className="h-4 w-4" />
                  <span>Hum Medicals YouTube</span>
                </a>

                <a
                  href="https://www.facebook.com/share/1HAh1AoLzh/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Facebook Page</span>
                </a>

                <a
                  href="mailto:hummedicals@gmail.com"
                  className="outline-button inline-flex items-center gap-2 !py-2.5 !px-4 text-xs"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email Muhammad Salman</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
