'use client';

import {
  CheckCircle2,
  Clock3,
  Sparkles,
  RefreshCw,
  FileText,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronDown,
  BookOpen,
  User,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Submission } from '@/lib/submissions';
import Link from 'next/link';

type Collection = 'paper' | 'article';
type Choices = Record<string, { topic: string; collection: Collection }>;

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

export function AdminDashboard({ topics }: { topics: string[] }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [choices, setChoices] = useState<Choices>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  const load = async () => {
    setMessage('');
    try {
      const response = await fetch('/api/admin/submissions');
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Unable to load submissions.');
        setIsError(true);
        return;
      }
      setSubmissions(data.submissions);
      setChoices(
        Object.fromEntries(
          data.submissions.map((item: Submission) => [
            item.id,
            {
              topic: item.review?.suggestedTopic || item.topic || topics[0],
              collection: item.review?.suggestedCollection || 'article',
            },
          ])
        )
      );
    } catch {
      setMessage('Failed to load submissions from server.');
      setIsError(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id: string) => {
    setBusy(id);
    setMessage('');
    setIsError(false);
    try {
      const response = await fetch(`/api/admin/submissions/${id}/review`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSubmissions((items) => items.map((item) => (item.id === id ? data.submission : item)));
      setChoices((current) => ({
        ...current,
        [id]: {
          topic: data.submission.review.suggestedTopic,
          collection: data.submission.review.suggestedCollection,
        },
      }));
      setMessage(`Gemini review generated for "${data.submission.title}"`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to review this manuscript.');
      setIsError(true);
    } finally {
      setBusy(null);
    }
  };

  const approve = async (id: string) => {
    setBusy(id);
    setMessage('');
    setIsError(false);
    try {
      const response = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(choices[id]),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSubmissions((items) => items.map((item) => (item.id === id ? data.submission : item)));
      setMessage(`Successfully approved and published: "${data.published.title}"`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to approve this manuscript.');
      setIsError(true);
    } finally {
      setBusy(null);
    }
  };

  const setStatus = async (id: string, status: 'changes_requested' | 'rejected') => {
    const promptText =
      status === 'changes_requested'
        ? 'Please enter editorial revision notes for the author:'
        : 'Please provide reason for rejection:';
    const adminNote = window.prompt(promptText) || '';
    setBusy(id);
    setMessage('');
    setIsError(false);
    try {
      const response = await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update editorial status.');
      setSubmissions((items) => items.map((item) => (item.id === id ? data.submission : item)));
      setMessage(`Status updated to ${status.replace('_', ' ')}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update editorial status.');
      setIsError(true);
    } finally {
      setBusy(null);
    }
  };

  const pending = submissions.filter((item) => item.status !== 'approved');
  const approved = submissions.filter((item) => item.status === 'approved');
  const reviewedCount = pending.filter((item) => item.review).length;

  const renderCard = (item: Submission, isApproved = false) => {
    const choice = choices[item.id] || {
      topic: item.topic || topics[0],
      collection: 'article' as Collection,
    };
    const isWorking = busy === item.id;

    let statusColor = 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    if (item.status === 'approved') statusColor = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    if (item.status === 'changes_requested') statusColor = 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300';
    if (item.status === 'rejected') statusColor = 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';

    return (
      <article
        key={item.id}
        className="glass-panel relative rounded-3xl p-6 transition-all duration-200 hover:border-teal-500/30 sm:p-7"
      >
        {/* Card Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                {item.status.replaceAll('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                {item.type}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {dateLabel(item.createdAt)}
              </span>
            </div>

            <h3 className="mt-1 font-serif text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {item.title}
            </h3>

            {/* Author metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.authorName}</span>
              </span>
              <span>({item.authorEmail})</span>
              <span className="font-mono text-[11px] text-slate-400">ID: {item.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isApproved && item.publishedSlug ? (
              <a
                className="premium-button inline-flex items-center gap-1.5 !py-2 !px-4 text-xs"
                href={`/published/${item.publishedSlug}`}
                target="_blank"
                rel="noreferrer"
              >
                <span>Live Article</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <button
                disabled={isWorking}
                onClick={() => review(item.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-500/10 px-3.5 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-500 hover:text-white dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white disabled:opacity-50"
              >
                {isWorking ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Analyzing…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                    <span>{item.review ? 'Re-run Gemini AI Review' : 'Run Gemini AI Review'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Abstract */}
        <div className="mt-4 rounded-2xl bg-white/50 p-4 text-xs leading-relaxed text-slate-700 dark:bg-black/20 dark:text-slate-300">
          <p className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px]">
            Abstract
          </p>
          <p className="mt-1">{item.abstract}</p>
        </div>

        {/* Collapsible manuscript */}
        <details className="group mt-3 text-xs">
          <summary className="flex cursor-pointer items-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400">
            <span>Read full manuscript text</span>
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200/70 bg-slate-50 p-4 font-mono leading-relaxed text-slate-800 dark:border-white/5 dark:bg-black/40 dark:text-slate-200">
            {item.manuscript}
          </div>
        </details>

        {/* Gemini Editorial Assessment & Decision Box */}
        {item.review && (
          <div className="mt-6 rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent p-5">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Gemini Findings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-500" />
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    Gemini Clinical Assessment
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {item.review.summary}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="rounded-lg bg-white/70 px-2.5 py-1 text-xs dark:bg-obsidian">
                    <span className="text-slate-500">Recommendation: </span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">
                      {item.review.recommendation}
                    </span>
                  </div>

                  <div className="rounded-lg bg-white/70 px-2.5 py-1 text-xs dark:bg-obsidian">
                    <span className="text-slate-500">Similarity Index: </span>
                    <span
                      className={`font-mono font-bold ${
                        item.review.similarityScore < 20
                          ? 'text-emerald-600'
                          : item.review.similarityScore < 50
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {item.review.similarityScore}%
                    </span>
                  </div>
                </div>

                {/* Similarity Matches */}
                {item.review.similarityMatches && item.review.similarityMatches.length > 0 && (
                  <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px]">
                    <p className="font-semibold text-amber-800 dark:text-amber-300">
                      Matched Internal Database References:
                    </p>
                    <ul className="mt-1.5 space-y-1 text-slate-600 dark:text-slate-400">
                      {item.review.similarityMatches.map((match) => (
                        <li key={match.title} className="flex items-center justify-between">
                          <span className="truncate pr-2">• {match.title}</span>
                          <span className="shrink-0 font-mono font-bold text-amber-700 dark:text-amber-400">
                            {match.score}% ({match.source})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right: Editorial Action Controls (If not already approved) */}
              {!isApproved && (
                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/5 dark:bg-obsidian/80">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-teal-500" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Publishing Configuration
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase text-slate-400">
                        Assigned Specialty
                      </label>
                      <select
                        value={choice.topic}
                        onChange={(event) =>
                          setChoices((curr) => ({
                            ...curr,
                            [item.id]: { ...choice, topic: event.target.value },
                          }))
                        }
                        className="premium-input !py-2 !text-xs"
                      >
                        {topics.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase text-slate-400">
                        Target Collection
                      </label>
                      <select
                        value={choice.collection}
                        onChange={(event) =>
                          setChoices((curr) => ({
                            ...curr,
                            [item.id]: { ...choice, collection: event.target.value as Collection },
                          }))
                        }
                        className="premium-input !py-2 !text-xs"
                      >
                        <option value="article">Articles (/articles)</option>
                        <option value="paper">Publications (/publications)</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      disabled={isWorking}
                      onClick={() => approve(item.id)}
                      className="premium-button flex items-center gap-1.5 !py-2 !px-4 !text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Authorize & Publish</span>
                    </button>

                    <button
                      disabled={isWorking}
                      onClick={() => setStatus(item.id, 'changes_requested')}
                      className="outline-button flex items-center gap-1.5 !py-2 !px-3.5 !text-xs text-blue-600 hover:border-blue-500 dark:text-blue-400"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Request Changes</span>
                    </button>

                    <button
                      disabled={isWorking}
                      onClick={() => setStatus(item.id, 'rejected')}
                      className="outline-button flex items-center gap-1.5 !py-2 !px-3.5 !text-xs text-red-600 hover:border-red-500 dark:text-red-400"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    );
  };

  return (
    <section className="mt-8 space-y-8">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Queue Total</span>
            <FileText className="h-4 w-4 text-teal-500" />
          </div>
          <p className="mt-2 font-serif text-3xl font-bold text-slate-900 dark:text-white">
            {submissions.length}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action</span>
            <Clock3 className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-serif text-3xl font-bold text-amber-600 dark:text-amber-400">
            {pending.length}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">AI Screened</span>
            <Sparkles className="h-4 w-4 text-teal-500" />
          </div>
          <p className="mt-2 font-serif text-3xl font-bold text-teal-600 dark:text-teal-400">
            {reviewedCount}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Published</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-serif text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {approved.length}
          </p>
        </div>
      </div>

      {/* Action Bar & Notification */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-obsidian/80">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-teal-500/20 dark:text-teal-300'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Clock3 className="h-3.5 w-3.5" />
            <span>Pending Queue</span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-300">
              {pending.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'approved'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-teal-500/20 dark:text-teal-300'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Published Library</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
              {approved.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={load}
          className="outline-button flex items-center gap-2 !py-2 !px-4 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* Global alert / status banner */}
      {message && (
        <div
          role="status"
          className={`flex items-center gap-3 rounded-2xl border p-4 text-xs ${
            isError
              ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
              : 'border-teal-500/30 bg-teal-500/10 text-teal-800 dark:text-teal-200'
          }`}
        >
          {isError ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Active Tab Submissions List */}
      <div className="space-y-5">
        {activeTab === 'pending' ? (
          pending.length > 0 ? (
            pending.map((item) => renderCard(item, false))
          ) : (
            <div className="glass-panel rounded-3xl p-10 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                Queue Clear
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                All submitted manuscripts have been reviewed or authorized.
              </p>
            </div>
          )
        ) : approved.length > 0 ? (
          approved.map((item) => renderCard(item, true))
        ) : (
          <div className="glass-panel rounded-3xl p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
              No Published Records Yet
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              When you authorize manuscripts from the pending queue, they will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
