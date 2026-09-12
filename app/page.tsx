import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LibraryBig,
  Microscope,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { topics } from '@/lib/content';

const metrics = [
  { value: '150+', label: 'Peer Publications', detail: 'Evidence-based reviews' },
  { value: '100', label: 'ECG Case Studies', detail: 'Interactive rhythm analysis' },
  { value: '150+', label: 'Practical Guides', detail: 'Bedside clinical primers' },
  { value: '$0', label: 'Open Access Fee', detail: '100% free publishing for authors' },
];

const pillars = [
  {
    icon: HeartPulse,
    title: 'ECG Case Laboratory',
    tag: '100 Interactive Cases',
    description: 'Master rate, rhythm, axis, and ischemia with guided tracings and emergency decision points.',
    href: '/ecg',
    accent: 'from-rose-500/20 to-teal-500/10 text-rose-500 dark:text-rose-400',
    border: 'hover:border-rose-500/40',
  },
  {
    icon: LibraryBig,
    title: 'Peer Learning Library',
    tag: '300+ Total Guides',
    description: 'Rigorous publications and practical clinical summaries spanning cardiology, echo, and critical care.',
    href: '/publications',
    accent: 'from-teal-500/20 to-emerald-500/10 text-teal-600 dark:text-teal-400',
    border: 'hover:border-teal-500/40',
  },
  {
    icon: BrainCircuit,
    title: 'Gemini Clinical AI',
    tag: 'AI Studio & Tutor',
    description: 'In-context learning copilot on every page, with specialized educational article drafting.',
    href: '/ai-tools',
    accent: 'from-cyan-500/20 to-blue-500/10 text-cyan-600 dark:text-cyan-400',
    border: 'hover:border-cyan-500/40',
  },
  {
    icon: PenLine,
    title: 'Free Author Publishing',
    tag: 'Zero Author Charges',
    description: 'Submit original work, receive editorial & similarity reviews, and publish to an international clinical audience.',
    href: '/publish',
    accent: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400',
    border: 'hover:border-amber-500/40',
  },
];

const workspaceLinks = [
  { href: '/publications', icon: LibraryBig, label: 'Publications', detail: 'Research reviews & case studies', accent: 'from-teal-600 to-emerald-700' },
  { href: '/articles', icon: BookOpen, label: 'Practical Articles', detail: 'Ward round & clinical pearls', accent: 'from-cyan-600 to-teal-700' },
  { href: '/ecg', icon: HeartPulse, label: 'ECG Cases', detail: '100 structured diagnostic cases', accent: 'from-rose-600 to-pink-700' },
  { href: '/ai-tools', icon: BrainCircuit, label: 'AI Clinical Studio', detail: 'Draft, clarify, and synthesize', accent: 'from-blue-600 to-indigo-700' },
  { href: '/publish', icon: PenLine, label: 'Publish Work', detail: 'Free peer submission & tracking', accent: 'from-amber-600 to-orange-700' },
  { href: '/topics', icon: Stethoscope, label: 'Speciality Topics', detail: 'Cardiology, Echo, Critical Care', accent: 'from-emerald-600 to-teal-800' },
];

function PublicWelcome() {
  return (
    <div className="flex flex-col gap-0 overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-900 via-[#0a101d] to-[#080d17] px-4 py-20 text-white sm:px-6 md:py-28 lg:px-8">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-24 -top-28 h-[36rem] w-[36rem] rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 -left-20 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="ecg-grid-bg pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-950/50 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur-md">
                <Sparkles size={13} className="text-teal-400" />
                Next-Generation Clinical Education & Publishing
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.08]">
                Where clinical precision meets{' '}
                <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  modern intelligence.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Hum Medicals unites structured clinical guides, 100 interactive ECG interpretations, in-context Gemini AI tutoring, and zero-fee medical publishing into one seamless platform for clinicians and trainees.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-emerald-400 hover:shadow-teal-500/35 hover:-translate-y-0.5"
                >
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-6 py-3.5 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:border-slate-500 hover:bg-slate-700/60"
                >
                  Sign In to Workspace
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-400" /> Free Open Access
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-400" /> Gemini 3.5 Copilot
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-400" /> Peer Editorial Review
                </span>
              </div>
            </div>

            {/* Right Telemetry Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-teal-300">Live Clinical Monitor</span>
                  </div>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">LEAD II · 25 mm/s</span>
                </div>

                {/* Rhythm Line Simulation */}
                <div className="my-5 rounded-xl border border-teal-500/20 bg-slate-950 p-4 font-mono text-xs text-teal-400">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Sinus Rhythm: 72 bpm</span>
                    <span>QTc: 410 ms</span>
                    <span>PR: 160 ms</span>
                  </div>
                  <div className="mt-3 flex items-center justify-center py-4 text-center">
                    <div className="h-8 w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent flex items-center justify-center">
                      <span className="text-xs font-mono tracking-widest text-teal-300">
                        ───/\_/\/\──────/\_/\/\──────/\_/\/\───
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Interactive Features */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                    <BrainCircuit size={18} className="mt-0.5 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">AI Diagnostic Synthesis</p>
                      <p className="text-[11px] text-slate-400">Stepwise clinical pearls for complex arrhythmias and ischemia.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                    <ShieldCheck size={18} className="mt-0.5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Ethical Author Submission</p>
                      <p className="text-[11px] text-slate-400">Free manuscript track with automated similarity & AI peer assessment.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Counter Ribbon */}
      <section className="border-b border-slate-200/80 bg-white py-10 dark:border-slate-800/80 dark:bg-[#0c121e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {metrics.map((item) => (
              <div key={item.label} className="border-l-2 border-teal-500/40 pl-4">
                <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">{item.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{item.label}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Bento */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">
            <Zap size={13} className="text-teal-600 dark:text-teal-400" /> Platform Architecture
          </p>
          <h2 className="section-title">Built for deliberate, evidence-guided medical practice.</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            From emergency bedside decision support to scholarly publication, explore the core pillars of Hum Medicals.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.title}
                href={pillar.href}
                className={`paper-panel group flex flex-col justify-between border transition-all ${pillar.border}`}
              >
                <div>
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${pillar.accent} p-3`}>
                    <Icon size={24} />
                  </div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    {pillar.tag}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{pillar.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                  <span>Explore pillar</span>
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Specialities Ribbon */}
      <section className="border-y border-slate-200/80 bg-slate-100/70 py-16 dark:border-slate-800/80 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Curated Disciplines</p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Explore by Medical Specialty</h3>
            </div>
            <Link href="/topics" className="text-xs font-bold text-teal-600 hover:underline dark:text-teal-400">
              Browse all topics →
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {topics.map((topic) => (
              <Link
                key={topic}
                href={`/topics/${topic.toLowerCase().replaceAll(' ', '-')}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Step Journey */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-[#0c1424] p-8 text-white sm:p-12 dark:border-slate-800">
          <div className="max-w-xl">
            <p className="eyebrow text-teal-300">Scholarly Pathway</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">How Hum Medicals works for you</h2>
            <p className="mt-3 text-sm text-slate-300">
              Whether you are preparing for clinical rotations or submitting original research, getting started is straightforward and cost-free.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-white/5 p-6 backdrop-blur">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-500 text-sm font-bold text-slate-950">1</span>
              <h4 className="mt-4 font-bold text-white">Create Free Account</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Unlock full access to the clinical learning library, ECG cases, and your personalized author workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-white/5 p-6 backdrop-blur">
              <span className="grid h-8 w-8 place-items-center rounded-xl border border-teal-400 text-sm font-bold text-teal-300">2</span>
              <h4 className="mt-4 font-bold text-white">Study with AI Copilot</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Highlight concepts on any page to invoke the AI Tutor for evidence-informed step-by-step breakdowns.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-white/5 p-6 backdrop-blur">
              <span className="grid h-8 w-8 place-items-center rounded-xl border border-teal-400 text-sm font-bold text-teal-300">3</span>
              <h4 className="mt-4 font-bold text-white">Submit Work Free</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Submit case studies or research papers for editorial assessment. Track progress in real time with zero fees.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-8">
            <p className="text-xs text-slate-400">Join medical students and healthcare trainees across the globe.</p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-teal-300"
            >
              Open Your Workspace <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MemberHome({ name, admin }: { name: string; admin: boolean }) {
  const firstName = name.split(' ')[0];

  return (
    <div className="flex flex-col gap-0">
      {/* Cockpit Hero */}
      <section className="member-home-hero relative overflow-hidden px-4 py-16 text-white sm:px-6 md:py-20 lg:px-8">
        <div className="member-orb member-orb-one" />
        <div className="member-orb member-orb-two" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-950/60 px-3 py-1 text-xs font-semibold text-teal-300 backdrop-blur">
                <Sparkles size={13} />
                Welcome Back to Your Clinical Workspace
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                Greetings, {firstName}.<br />
                <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text font-normal text-transparent">
                  What will you focus on today?
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Your clinical reference library, interactive ECG cases, and AI writing studio are ready.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="member-hero-stat">
                <span className="text-3xl font-extrabold text-white">400+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300">Total Resources</span>
              </div>
              <div className="member-hero-stat">
                <span className="text-3xl font-extrabold text-white">Active</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300">Author Account</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/publications"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md transition hover:bg-teal-400"
            >
              Explore Publications <ArrowRight size={14} />
            </Link>
            <Link href="/ai-tools" className="member-ghost-button">
              AI Clinical Studio <BrainCircuit className="ml-2" size={15} />
            </Link>
            <Link href="/publish" className="member-ghost-button">
              Submit Manuscript <PenLine className="ml-2" size={15} />
            </Link>
            {admin && (
              <Link href="/admin" className="member-admin-button">
                Editorial Dashboard <LayoutDashboard className="ml-2" size={15} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Launchpad Bento Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Fast Launchpad</p>
            <h2 className="section-title">Clinical Workspace Modules</h2>
          </div>
          <Link href="/account" className="text-xs font-bold text-teal-600 hover:underline dark:text-teal-400">
            Manage author profile & submissions →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {workspaceLinks.map(({ href, icon: Icon, label, detail, accent }, index) => (
            <Link
              href={href}
              key={href}
              className="workspace-link-card group"
              style={{ '--card-index': index } as React.CSSProperties}
            >
              <div className={`workspace-link-icon bg-gradient-to-br ${accent}`}>
                <Icon size={22} />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                  {label}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
              </div>
              <ArrowRight className="workspace-link-arrow" size={18} />
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Split Banner */}
      <section className="border-t border-slate-200/80 bg-slate-100/60 py-16 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <Link href="/ai-tools" className="home-feature-card lg:col-span-2">
            <BrainCircuit className="text-teal-600 dark:text-teal-400" size={28} />
            <p className="eyebrow mt-6">Intelligent Clinical Assistant</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              Draft educational article outlines or consult the AI Tutor in real time.
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Generate structured, evidence-aware clinical write-ups, or highlight text anywhere to receive immediate explanations from the movable tutor.
            </p>
            <span className="mt-6 inline-flex items-center text-xs font-bold text-teal-600 dark:text-teal-400">
              Launch AI Studio <ArrowRight className="ml-1.5" size={14} />
            </span>
          </Link>

          <Link href="/publish" className="home-feature-card home-feature-dark">
            <PenLine className="text-teal-300" size={28} />
            <p className="eyebrow mt-6 text-teal-300">Author Pathway</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Share research without publishing barriers.</h3>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Submit manuscripts, follow review status, and see accepted papers published to the global clinical community.
            </p>
            <span className="mt-6 inline-flex items-center text-xs font-bold text-teal-300">
              New Submission <ArrowRight className="ml-1.5" size={14} />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default async function Home() {
  const user = await currentUser();
  return user ? <MemberHome name={user.name} admin={isAdmin(user)} /> : <PublicWelcome />;
}

