import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { AccountActions } from '@/components/account-actions';
import { getSubmissionsForAuthor, statusLabel } from '@/lib/submissions';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  Shield,
  BookOpen,
  PlusCircle,
  BarChart2,
  ChevronDown
} from 'lucide-react';

export const metadata = { title: 'Author Workspace & Account' };

export default async function Account() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const submissions = await getSubmissionsForAuthor(user.id);
  const admin = isAdmin(user);

  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const pendingCount = submissions.filter((s) => s.status !== 'approved').length;

  return (
    <div className="relative min-h-screen py-12 md:py-16">
      {/* Background ambient medical glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[450px] w-[800px] rounded-full bg-gradient-to-tr from-teal-500/10 via-cyan-500/5 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              Author Cockpit
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Welcome, {user.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage your submitted clinical manuscripts, monitor Gemini peer-review status, and explore the journal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {admin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-2xl border border-teal-500/40 bg-teal-500/10 px-4 py-2.5 text-xs font-bold text-teal-700 transition hover:bg-teal-500 hover:text-white dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white"
              >
                <Shield className="h-4 w-4" />
                <span>Editorial Admin Desk</span>
              </Link>
            )}
            <Link
              href="/publish"
              className="premium-button inline-flex items-center gap-2 !py-2.5 !px-5 text-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit New Manuscript</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Submissions</span>
              <FileText className="h-4 w-4 text-teal-500" />
            </div>
            <p className="mt-2 font-serif text-3xl font-bold text-slate-900 dark:text-white">
              {submissions.length}
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">In Review</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 font-serif text-3xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 font-serif text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {approvedCount}
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Journal Access</span>
              <BookOpen className="h-4 w-4 text-cyan-500" />
            </div>
            <p className="mt-2 text-sm font-bold text-teal-600 dark:text-teal-400">
              Open-Access (Free)
            </p>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/publish"
            className="group glass-panel rounded-3xl p-6 transition-all duration-300 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 sm:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow !text-teal-600 dark:!text-teal-400">Author Pathway</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-teal-500" />
            </div>
            <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              Publish Your Clinical Manuscript
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Share case studies, research papers, or educational guides with zero submission or publishing charges.
            </p>
          </Link>

          <Link
            href="/publications"
            className="group glass-panel rounded-3xl p-6 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 sm:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow !text-cyan-600 dark:!text-cyan-400">Scholarly Library</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-cyan-500" />
            </div>
            <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              Browse Evidence-Informed Journal
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Explore peer-reviewed cardiology, emergency medicine, ECG cases, and pharmacology papers.
            </p>
          </Link>
        </div>

        {/* Manuscript Tracker */}
        <section className="mt-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-white/10">
            <div>
              <p className="eyebrow !text-teal-600 dark:!text-teal-400">Submission Registry</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Manuscript Status Tracker
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {submissions.length} total entries recorded
            </span>
          </div>

          {submissions.length > 0 ? (
            <div className="grid gap-5">
              {submissions.map((item) => {
                const isApproved = item.status === 'approved';
                const isChanges = item.status === 'changes_requested';
                const isRejected = item.status === 'rejected';

                let statusBadgeStyle = 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
                if (isApproved) statusBadgeStyle = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
                if (isChanges) statusBadgeStyle = 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300';
                if (isRejected) statusBadgeStyle = 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';

                return (
                  <article
                    key={item.id}
                    className="glass-panel rounded-3xl p-6 sm:p-7 transition-all duration-200 hover:border-teal-500/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                            {item.topic || 'Clinical Medicine'}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {item.type}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Submitted {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(item.createdAt))}
                          </span>
                        </div>
                        <h3 className="mt-2 font-serif text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                          {item.title}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusBadgeStyle}`}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : isChanges ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        <span>{statusLabel(item.status || 'submitted')}</span>
                      </span>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.abstract}
                    </p>

                    {/* Gemini Review Report */}
                    {item.review && (
                      <div className="mt-5 rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 p-4 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-semibold text-teal-700 dark:text-teal-300">
                            <Sparkles className="h-4 w-4 text-teal-500" />
                            <span>Gemini Clinical Assessment Completed</span>
                          </div>
                          <span className="rounded-md bg-white/70 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 shadow-sm dark:bg-obsidian dark:text-slate-300">
                            Similarity Screen: {item.review.similarityScore}%
                          </span>
                        </div>
                        <p className="mt-2 text-slate-700 dark:text-slate-300">
                          <strong>Recommendation:</strong> {item.review.recommendation}
                        </p>
                        {item.review.summary && (
                          <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {item.review.summary}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Published link if approved */}
                    {item.publishedSlug && (
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 text-xs">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                          This manuscript is live in Hum Medicals Journal!
                        </span>
                        <Link
                          href={`/published/${item.publishedSlug}`}
                          className="font-bold text-emerald-700 hover:underline dark:text-emerald-300"
                        >
                          View publication →
                        </Link>
                      </div>
                    )}

                    {/* Expandable full manuscript */}
                    <details className="group mt-5 border-t border-slate-200/70 pt-4 text-xs dark:border-white/5">
                      <summary className="flex cursor-pointer items-center justify-between font-semibold text-teal-600 dark:text-teal-400">
                        <span>Read submitted manuscript draft</span>
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200/60 bg-slate-50/70 p-4 font-mono leading-relaxed text-slate-700 dark:border-white/5 dark:bg-black/30 dark:text-slate-300">
                        {item.manuscript || item.abstract}
                      </div>
                    </details>

                    <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
                      Tracking Reference ID: <span className="font-mono">{item.id}</span>
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold text-slate-900 dark:text-white">
                No Manuscripts Submitted Yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                You haven&apos;t submitted any clinical papers yet. Hum Medicals offers 100% free open-access publishing with AI editorial assistance.
              </p>
              <div className="mt-6">
                <Link href="/publish" className="premium-button inline-flex items-center gap-2 !py-2.5 !px-6 text-xs">
                  <PlusCircle className="h-4 w-4" />
                  <span>Submit Your First Paper</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Account actions & sign out */}
        <div className="mt-12">
          <AccountActions name={user.name} />
        </div>
      </div>
    </div>
  );
}
