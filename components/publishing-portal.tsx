'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  UserCheck,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Info
} from 'lucide-react';
import { topics } from '@/lib/content';

type Account = { name: string; email: string };
type SubmittedPaper = {
  id: string;
  title: string;
  type: string;
  topic: string;
  abstract: string;
  manuscript: string;
  status: string;
};

export function PublishingPortal() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [submittedPaper, setSubmittedPaper] = useState<SubmittedPaper | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form field live length trackers
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [manuscript, setManuscript] = useState('');
  const [showManuscriptPreview, setShowManuscriptPreview] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((data) => setAccount(data.user))
      .catch(() => setAccount(null))
      .finally(() => setLoadingAccount(false));
  }, []);

  async function submitWork(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    const form = event.currentTarget;
    setSubmitting(true);
    setMessage('');
    setIsError(false);
    setSubmittedPaper(null);

    const fields = new FormData(form);
    const paper = {
      title: String(fields.get('title') || '').trim(),
      type: String(fields.get('type') || ''),
      topic: String(fields.get('topic') || ''),
      abstract: String(fields.get('abstract') || '').trim(),
      manuscript: String(fields.get('manuscript') || '').trim(),
    };

    try {
      const response = await fetch('/api/publishing/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paper,
          consent: fields.get('consent') === 'on',
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(result.message || 'Your submission has been received and queued for editorial assessment.');
        setIsError(false);
        setSubmittedPaper({
          ...paper,
          id: result.submission.id,
          status: result.submission.status,
        });
        form.reset();
        setTitle('');
        setAbstract('');
        setManuscript('');
      } else {
        setMessage(result.message || 'Unable to submit your manuscript right now.');
        setIsError(true);
      }
    } catch {
      setMessage('A network error occurred while submitting your manuscript. Please try again.');
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const initials = account?.name
    ? account.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'HM';

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr]">
      {/* Left Sidebar: Author Status & Guidelines */}
      <aside className="space-y-6">
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <p className="eyebrow !text-teal-600 dark:!text-teal-400">Author Credentials</p>
          </div>

          {loadingAccount ? (
            <div className="mt-6 flex items-center gap-4 animate-pulse">
              <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ) : account ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 font-bold text-white shadow-md shadow-teal-500/20">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{account.name}</p>
                    <UserCheck className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{account.email}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-xs dark:border-white/5 dark:bg-obsidian/40">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Author status:</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">Verified Submitter</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Publishing fee:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">$0.00 (100% Free)</span>
                </div>
              </div>

              <Link
                href="/account"
                className="group flex w-full items-center justify-between rounded-xl border border-teal-500/20 bg-teal-50/50 px-4 py-2.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-500 hover:text-white dark:bg-teal-950/30 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white"
              >
                <span>Track my manuscripts</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-xs font-semibold">Author account required</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Please create a free author account or sign in to submit your manuscript for peer review.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Link href="/sign-up?next=/publish" className="premium-button text-center !py-2.5 !text-xs">
                  Create Account
                </Link>
                <Link href="/sign-in?next=/publish" className="outline-button text-center !py-2.5 !text-xs">
                  Sign In
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-slate-200/60 pt-5 dark:border-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Editorial Standards
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
                <span>Zero publication charges or article processing fees (APCs).</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
                <span>Gemini-assisted similarity screening & clinical consistency analysis.</span>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
                <span>Open-access digital distribution with permanent citation link.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Clinical Disclaimer Callout */}
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 text-xs leading-relaxed text-slate-500 dark:border-white/5 dark:bg-slate-900/30 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Info className="h-3.5 w-3.5 text-teal-500" />
            <span>Ethical Declaration</span>
          </div>
          <p className="mt-2">
            All submitted manuscripts must uphold patient confidentiality according to HIPAA/GDPR standards. No identifiable personal health information (PHI) may be disclosed without documented informed consent.
          </p>
        </div>
      </aside>

      {/* Right Column: Submission Form / Receipt */}
      <main className="space-y-6">
        <section className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow !text-teal-600 dark:!text-teal-400">Manuscript Submission Desk</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Submit Your Scholarly Work
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              Open Call 2026
            </span>
          </div>

          <form onSubmit={submitWork} className="mt-8 space-y-6">
            {/* Step 1: Core Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Manuscript Title <span className="text-teal-600 dark:text-teal-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {title.length}/220 chars (min 8)
                </span>
              </div>
              <input
                id="title"
                name="title"
                required
                disabled={!account || submitting}
                minLength={8}
                maxLength={220}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Manuscript title"
                placeholder="e.g. Brugada Pattern in Sepsis: Unmasking Channelopathy via Systemic Inflammation"
                className="premium-input !py-3 font-medium"
              />
            </div>

            {/* Step 2: Classification */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Submission Type <span className="text-teal-600 dark:text-teal-400">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  disabled={!account || submitting}
                  aria-label="Submission type"
                  className="premium-input !py-3"
                >
                  <option value="Research article">Research Article</option>
                  <option value="Review article">Review Article</option>
                  <option value="Case study">Case Study</option>
                  <option value="Educational article">Educational Article</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="topic" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Clinical Specialty <span className="text-teal-600 dark:text-teal-400">*</span>
                </label>
                <select
                  id="topic"
                  name="topic"
                  required
                  disabled={!account || submitting}
                  aria-label="Clinical topic"
                  className="premium-input !py-3"
                >
                  <option value="">Choose a clinical discipline</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Structured Abstract */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="abstract" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Structured Abstract / Summary <span className="text-teal-600 dark:text-teal-400">*</span>
                </label>
                <span className={`text-[11px] ${abstract.length < 80 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
                  {abstract.length} characters (min 80)
                </span>
              </div>
              <textarea
                id="abstract"
                name="abstract"
                rows={5}
                required
                disabled={!account || submitting}
                minLength={80}
                maxLength={12000}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                aria-label="Abstract"
                placeholder="Background, Objective, Clinical Case / Methods, Findings, and Educational Takeaway..."
                className="premium-input font-normal leading-relaxed"
              />
            </div>

            {/* Step 4: Full Manuscript */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="manuscript" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  3. Full Manuscript & References <span className="text-teal-600 dark:text-teal-400">*</span>
                </label>
                <span className={`text-[11px] ${manuscript.length < 300 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
                  {manuscript.length} characters (min 300)
                </span>
              </div>
              <textarea
                id="manuscript"
                name="manuscript"
                rows={12}
                required
                disabled={!account || submitting}
                minLength={300}
                maxLength={50000}
                value={manuscript}
                onChange={(e) => setManuscript(e.target.value)}
                aria-label="Complete manuscript"
                placeholder="Paste your full text here including Introduction, Case Presentation / Methods, Clinical Discussion, Diagnostic Considerations, and Academic References..."
                className="premium-input font-mono text-xs leading-relaxed"
              />
            </div>

            {/* Declaration & Consent Checkbox */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs dark:border-white/5 dark:bg-obsidian/40">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  name="consent"
                  type="checkbox"
                  required
                  disabled={!account || submitting}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900"
                />
                <span className="leading-relaxed text-slate-600 dark:text-slate-300">
                  I confirm this work is original, does not contain identifiable patient information without appropriate informed consent, and is submitted for free editorial consideration under Hum Medicals Open-Access guidelines.
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                disabled={!account || submitting}
                className="premium-button flex items-center gap-2 !px-8 !py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing Submission…</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Manuscript For Free</span>
                  </>
                )}
              </button>

              {!account && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  * Please sign in above to enable manuscript submission.
                </p>
              )}
            </div>
          </form>

          {/* Feedback message */}
          {message && (
            <div
              role="status"
              className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${
                isError
                  ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
                  : 'border-teal-500/30 bg-teal-500/10 text-teal-900 dark:text-teal-200'
              }`}
            >
              {isError ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-500 mt-0.5" />
              )}
              <div>{message}</div>
            </div>
          )}

          {/* Submission Receipt Card */}
          {submittedPaper && (
            <article className="mt-8 overflow-hidden rounded-3xl border border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent p-6 sm:p-7 shadow-lg shadow-teal-500/5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <p className="eyebrow !text-teal-600 dark:!text-teal-400">Submission Receipt</p>
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                    {submittedPaper.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {submittedPaper.topic}
                    </span>
                    <span>•</span>
                    <span>{submittedPaper.type}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400">
                      Ref: {submittedPaper.id}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center rounded-full border border-teal-500/30 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 shadow-sm dark:bg-obsidian dark:text-teal-300">
                  {submittedPaper.status}
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-white/60 p-4 dark:bg-obsidian/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Abstract Overview
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {submittedPaper.abstract}
                </p>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowManuscriptPreview(!showManuscriptPreview)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 transition hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  <span>{showManuscriptPreview ? 'Hide manuscript text' : 'Review submitted manuscript text'}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      showManuscriptPreview ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showManuscriptPreview && (
                  <div className="mt-3 max-h-60 overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/50 p-4 font-mono text-xs leading-relaxed text-slate-700 dark:border-white/5 dark:bg-black/30 dark:text-slate-300">
                    <pre className="whitespace-pre-wrap font-sans">{submittedPaper.manuscript}</pre>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-teal-500/20 pt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Our editorial board will evaluate your work with Gemini assistance within 48–72 hours.
                </p>
                <Link
                  href="/account"
                  className="premium-button flex items-center gap-1.5 !py-2 !px-4 !text-xs"
                >
                  <span>Open Manuscript Tracker</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          )}
        </section>
      </main>
    </div>
  );
}
